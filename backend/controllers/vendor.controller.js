import {
  simulateDeliverySchema,
  updateLogSchema,
} from "../validations/delivery.js";
import redis from "../services/redisClient.js";

export const simulateDelivery = async (req, res) => {
  const { error } = simulateDeliverySchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { campaignId, customerId, personalizedMessage, email } = req.body;
    await redis.xadd(
      "delivery_simulation_stream",
      "*",
      "campaignId",
      campaignId,
      "customerId",
      customerId,
      "personalizedMessage",
      personalizedMessage,
      "email",
      email
    );

    res.json({ success: true, message: "Delivery simulation queued" });
  } catch (error) {
    console.error("Error sending delivery receipt:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLog = async (req, res) => {
  const { error } = updateLogSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { campaignId, customerId, delivery_status } = req.body;

  try {
    await redis.xadd(
      "log_update_stream",
      "*",
      "campaignId",
      campaignId,
      "customerId",
      customerId,
      "delivery_status",
      delivery_status
    );

    res.status(200).json({ success: true, message: "Log update queued" });
  } catch (error) {
    console.error("Error updating delivery log:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
