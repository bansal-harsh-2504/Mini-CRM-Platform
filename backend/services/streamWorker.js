import redis from "./redisClient.js";
import CommunicationLog from "../models/CommunicationLog.js";
import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import connectToDB from "../config/db.js";

const CUSTOMER_STREAM_KEY = "customer_ingestion_stream";
const CUSTOMER_GROUP_NAME = "customer_group";
const CUSTOMER_CONSUMER_NAME = "worker_customer_1";

const ORDER_STREAM_KEY = "order_ingestion_stream";
const ORDER_GROUP_NAME = "order_group";
const ORDER_CONSUMER_NAME = "worker_order_1";

const LOG_STREAM_KEY = "log_update_stream";
const LOG_GROUP_NAME = "log_group";
const LOG_CONSUMER_NAME = "worker_log_1";

const BATCH_SIZE = 100;
const BATCH_TIMEOUT = 5000;

connectToDB();

async function initializeGroup(key, group) {
  try {
    await redis.xgroup("CREATE", key, group, "0", "MKSTREAM");
    console.log(`Consumer group "${group}" created`);
  } catch (err) {
    if (!err.message.includes("BUSYGROUP")) {
      console.error(`Error creating group "${group}":`, err);
    }
  }
}

function parseFields(fields) {
  const obj = {};
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]] = fields[i + 1];
  }
  return obj;
}

async function processCustomerMessages() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        CUSTOMER_GROUP_NAME,
        CUSTOMER_CONSUMER_NAME,
        "BLOCK",
        1000,
        "COUNT",
        10,
        "STREAMS",
        CUSTOMER_STREAM_KEY,
        ">"
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          const data = parseFields(fields);
          await handleCustomerIngestion(data);
          await redis.xack(CUSTOMER_STREAM_KEY, CUSTOMER_GROUP_NAME, id);
        }
      }
    } catch (err) {
      console.error("Customer stream read error:", err);
    }
  }
}

async function handleCustomerIngestion({
  owner,
  email,
  name,
  phone,
  customData,
}) {
  try {
    const parsedData = {
      owner,
      email,
      name,
      phone,
      customData: JSON.parse(customData || "{}"),
    };

    await Customer.updateOne(
      { owner, email },
      { $set: parsedData },
      { upsert: true }
    );
    console.log("Customer ingested successfully:", email);
  } catch (err) {
    console.error("Error processing customer ingestion:", err.message);
  }
}

async function processOrderMessages() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        ORDER_GROUP_NAME,
        ORDER_CONSUMER_NAME,
        "BLOCK",
        1000,
        "COUNT",
        10,
        "STREAMS",
        ORDER_STREAM_KEY,
        ">"
      );
      if (!response) continue;
      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          const data = parseFields(fields);
          await handleOrderIngestion(data);
          await redis.xack(ORDER_STREAM_KEY, ORDER_GROUP_NAME, id);
        }
      }
    } catch (err) {
      console.error("Order stream read error:", err);
    }
  }
}

async function handleOrderIngestion({
  customerId,
  owner,
  orderDate,
  amount,
  email,
  items,
}) {
  try {
    await Order.create({
      customerId,
      owner,
      orderDate,
      amount: Number(amount),
      email,
      items: JSON.parse(items || "[]"),
    });
    await Customer.findByIdAndUpdate(customerId, {
      $inc: {
        totalSpend: Number(amount),
      },
      lastPurchased: orderDate,
    });
    console.log(`Processed order for ${email}`);
  } catch (err) {
    console.error("Error processing order:", err.message);
  }
}

async function processLogUpdates() {
  let batch = [];
  let batchTimeout = null;

  const processBatch = async (logs) => {
    if (logs.length === 0) return;

    console.log(`Processing batch of ${logs.length} delivery logs`);
    const updates = [];
    const campaignUpdates = new Map();

    for (const log of logs) {
      const {
        campaignId,
        customerId,
        delivery_status,
        message,
        vendor_reference,
      } = log.data;
      updates.push({
        updateOne: {
          filter: { campaignId, customerId },
          update: {
            $set: {
              delivery_status,
              message,
              vendor_reference,
            },
          },
        },
      });

      if (!campaignUpdates.has(campaignId)) {
        campaignUpdates.set(campaignId, {
          sent: 0,
          failed: 0,
        });
      }
      const stats = campaignUpdates.get(campaignId);
      if (delivery_status === "sent" || delivery_status === "failed") {
        stats[delivery_status]++;
      }
    }

    try {
      if (updates.length > 0) {
        await CommunicationLog.bulkWrite(updates);
      }

      for (const [campaignId, stats] of campaignUpdates) {
        const updateObj = {};
        if (stats.sent) updateObj["deliveryStats.sent"] = stats.sent;
        if (stats.failed) updateObj["deliveryStats.failed"] = stats.failed;

        const campaign = await Campaign.findByIdAndUpdate(
          campaignId,
          { $inc: updateObj },
          { new: true }
        );

        if (campaign) {
          const total =
            campaign.deliveryStats.sent + campaign.deliveryStats.failed;
          if (
            total >= campaign.audienceSize &&
            campaign.status !== "completed"
          ) {
            await Campaign.findByIdAndUpdate(campaignId, {
              status: "completed",
            });
            console.log(
              `Campaign ${campaignId} completed. Final stats - Sent: ${campaign.deliveryStats.sent}, Failed: ${campaign.deliveryStats.failed}`
            );
          }
        }
      }

      for (const log of logs) {
        await redis.xack(LOG_STREAM_KEY, LOG_GROUP_NAME, log.id);
      }

      console.log(
        `Successfully processed batch of ${logs.length} delivery logs`
      );
    } catch (err) {
      console.error("Error processing batch:", err);
    }
  };

  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        LOG_GROUP_NAME,
        LOG_CONSUMER_NAME,
        "BLOCK",
        1000,
        "COUNT",
        BATCH_SIZE,
        "STREAMS",
        LOG_STREAM_KEY,
        ">"
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          batch.push({
            id,
            data: parseFields(fields),
          });

          if (batch.length >= BATCH_SIZE) {
            clearTimeout(batchTimeout);
            const currentBatch = [...batch];
            batch = [];
            await processBatch(currentBatch);
          } else if (batch.length > 0 && !batchTimeout) {
            batchTimeout = setTimeout(async () => {
              const currentBatch = [...batch];
              batch = [];
              batchTimeout = null;
              await processBatch(currentBatch);
            }, BATCH_TIMEOUT);
          }
        }
      }
    } catch (err) {
      console.error("Error processing log updates:", err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

(async () => {
  await initializeGroup(CUSTOMER_STREAM_KEY, CUSTOMER_GROUP_NAME);
  await initializeGroup(ORDER_STREAM_KEY, ORDER_GROUP_NAME);
  await initializeGroup(LOG_STREAM_KEY, LOG_GROUP_NAME);

  processCustomerMessages();
  processOrderMessages();
  processLogUpdates();
})();
