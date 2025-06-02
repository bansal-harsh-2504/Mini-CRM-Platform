import redis from "./redisClient.js";
import CommunicationLog from "../models/CommunicationLog.js";
import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import axios from "axios";
import connectToDB from "../config/db.js";

const CAMPAIGN_STREAM_KEY = "ingestion_stream";
const CAMPAIGN_GROUP_NAME = "campaign_group";
const CAMPAIGN_CONSUMER_NAME = "worker_campaign_1";

const CUSTOMER_STREAM_KEY = "customer_ingestion_stream";
const CUSTOMER_GROUP_NAME = "customer_group";
const CUSTOMER_CONSUMER_NAME = "worker_customer_1";

const ORDER_STREAM_KEY = "order_ingestion_stream";
const ORDER_GROUP_NAME = "order_group";
const ORDER_CONSUMER_NAME = "worker_order_1";

const DELIVERY_STREAM_KEY = "delivery_simulation_stream";
const DELIVERY_GROUP_NAME = "delivery_group";
const DELIVERY_CONSUMER_NAME = "worker_delivery_1";

const LOG_STREAM_KEY = "log_update_stream";
const LOG_GROUP_NAME = "log_group";
const LOG_CONSUMER_NAME = "worker_log_1";

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

async function processCampaignMessages() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        CAMPAIGN_GROUP_NAME,
        CAMPAIGN_CONSUMER_NAME,
        "BLOCK",
        5000, // wait up to 5s
        "COUNT",
        10,
        "STREAMS",
        CAMPAIGN_STREAM_KEY,
        ">"
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          const data = parseFields(fields);
          await handleCampaignMessage(data);
          await redis.xack(CAMPAIGN_STREAM_KEY, CAMPAIGN_GROUP_NAME, id);
        }
      }
    } catch (err) {
      console.error("Stream read error:", err);
    }
  }
}

async function handleCampaignMessage({
  campaignId,
  customerId,
  message,
  email,
  vendor_reference,
}) {
  try {
    const log = await CommunicationLog.create({
      campaignId,
      customerId,
      message,
      vendor_reference,
    });

    await log.save();
    try {
      await axios.post(`${process.env.BASE_URL_BACKEND}/api/vendor/send`, {
        campaignId,
        customerId,
        personalizedMessage: message,
        email,
      });
    } catch (e) {
      console.error("Error in create Campaign stream:", e.message);
      return;
    }
  } catch (err) {
    console.error("Error handling campaign message:", err.message);
  }
}

async function processCustomerMessages() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        CUSTOMER_GROUP_NAME,
        CUSTOMER_CONSUMER_NAME,
        "BLOCK",
        5000,
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
        5000,
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
    });
    console.log(`Processed order for ${email}`);
  } catch (err) {
    console.error("Error processing order:", err.message);
  }
}

async function processDeliverySimulations() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        DELIVERY_GROUP_NAME,
        DELIVERY_CONSUMER_NAME,
        "BLOCK",
        5000,
        "COUNT",
        10,
        "STREAMS",
        DELIVERY_STREAM_KEY,
        ">"
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          const data = parseFields(fields);
          await handleDeliverySimulation(data);
          await redis.xack(DELIVERY_STREAM_KEY, DELIVERY_GROUP_NAME, id);
        }
      }
    } catch (err) {
      console.error("Error processing delivery simulation:", err.message);
    }
  }
}

async function handleDeliverySimulation({
  campaignId,
  customerId,
  personalizedMessage,
  email,
}) {
  const isSuccess = Math.random() < 0.9;

  setTimeout(async () => {
    try {
      await axios.post(`${process.env.BASE_URL_BACKEND}/api/vendor/receipt`, {
        campaignId,
        customerId,
        delivery_status: isSuccess ? "sent" : "failed",
      });

      if (!isSuccess) {
        console.log(`Simulated failure for ${email}`);
        return;
      }

      console.log(`Simulated email to ${email}: "${personalizedMessage}"`);
    } catch (err) {
      console.error("Error sending simulated delivery receipt:", err.message);
    }
  }, 500);
}

async function processLogUpdates() {
  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP",
        LOG_GROUP_NAME,
        LOG_CONSUMER_NAME,
        "BLOCK",
        5000,
        "COUNT",
        10,
        "STREAMS",
        LOG_STREAM_KEY,
        ">"
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [id, fields] of messages) {
          const data = parseFields(fields);
          await handleLogUpdate(data);
          await redis.xack(LOG_STREAM_KEY, LOG_GROUP_NAME, id);
        }
      }
    } catch (err) {
      console.error("Error processing log update:", err.message);
    }
  }
}

async function handleLogUpdate({ campaignId, customerId, delivery_status }) {
  try {
    const log = await CommunicationLog.findOneAndUpdate(
      { campaignId, customerId },
      { delivery_status }
    );

    if (!log) {
      console.warn("Log not found for:", campaignId, customerId);
      return;
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: {
        [`deliveryStats.${delivery_status}`]: 1,
      },
    });

    const updatedCampaign = await Campaign.findById(campaignId);
    const total = (updatedCampaign.deliveryStats.sent || 0) + (updatedCampaign.deliveryStats.failed || 0);
    
    if (total >= updatedCampaign.audienceSize && updatedCampaign.status !== 'completed') {
      console.log(`Campaign ${campaignId} completed. Total deliveries: ${total}, Audience size: ${updatedCampaign.audienceSize}`);
      await Campaign.findByIdAndUpdate(campaignId, { status: 'completed' });
    }

    console.log(
      `Updated log for customer ${customerId} with status ${delivery_status}. Progress: ${total}/${updatedCampaign.audienceSize}`
    );
  } catch (err) {
    console.error("Error in handleLogUpdate:", err.message);
  }
}

(async () => {
  await initializeGroup(CAMPAIGN_STREAM_KEY, CAMPAIGN_GROUP_NAME);
  await initializeGroup(CUSTOMER_STREAM_KEY, CUSTOMER_GROUP_NAME);
  await initializeGroup(ORDER_STREAM_KEY, ORDER_GROUP_NAME);
  await initializeGroup(DELIVERY_STREAM_KEY, DELIVERY_GROUP_NAME);
  await initializeGroup(LOG_STREAM_KEY, LOG_GROUP_NAME);

  processCampaignMessages();
  processCustomerMessages();
  processOrderMessages();
  processDeliverySimulations();
  processLogUpdates();
})();
