import {
  simulateDeliverySchema,
  updateLogSchema,
} from "../validations/delivery.js";
import redis from "../services/redisClient.js";
import axios from "axios";

const DELIVERY_SUCCESS_RATE = 0.9;

export const simulateDelivery = async (req, res) => {
  const { error } = simulateDeliverySchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { campaignId, customerId, personalizedMessage, email, vendor_reference } = req.body;
  const isSuccess = Math.random() < DELIVERY_SUCCESS_RATE;

  try {
    console.log(`Campaign ${campaignId} - Attempting delivery to ${email}`);

    await axios.post(`${process.env.BASE_URL_BACKEND}/api/vendor/receipt`, {
      campaignId,
      customerId,
      delivery_status: isSuccess ? "sent" : "failed",
      message: personalizedMessage,
      vendor_reference
    });

    res.json({
      success: true,
      delivery_status: isSuccess ? "sent" : "failed",
      message: `Delivery ${isSuccess ? "successful" : "failed"}`
    });
  } catch (error) {
    console.error("Error in delivery simulation:", error.message);
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

  const { campaignId, customerId, delivery_status, vendor_reference, message } = req.body;

  try {
    await redis.xadd(
      "log_update_stream",
      "*",
      "campaignId",
      campaignId,
      "customerId",
      customerId,
      "delivery_status",
      delivery_status,
      "vendor_reference",
      vendor_reference,
      "message",
      message
    );

    res.status(200).json({
      success: true,
      message: "Log update queued"
    });
  } catch (error) {
    console.error("Error updating delivery log:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
