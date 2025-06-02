import Campaign from "../models/Campaign.js";
import CommunicationLog from "../models/CommunicationLog.js";
import {
  simulateDeliverySchema,
  updateLogSchema,
} from "../validators/delivery.js";
import axios from "axios";

export const simulateDelivery = async (req, res) => {
  const { error } = simulateDeliverySchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { campaignId, customerId, personalizedMessage, email } = req.body;
  const isSuccess = Math.random() < 0.9;

  setTimeout(async () => {
    try {
      await axios.post(`${process.env.BASE_URL_BACKEND}/api/vendor/receipt`, {
        campaignId,
        customerId,
        delivery_status: isSuccess ? "sent" : "failed",
      });

      if (!isSuccess) {
        return res
          .status(500)
          .json({ success: false, message: "Simulated delivery failed" });
      }

      console.log(`Simulated email to ${email}: "${personalizedMessage}"`);

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending delivery receipt:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }, 500);
};

export const updateLog = async (req, res) => {
  const { error } = updateLogSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { campaignId, customerId, delivery_status } = req.body;

  if (!campaignId || !customerId || !delivery_status) {
    return res.status(400).json({
      success: false,
      message: "Required: campaignId, customerId, delivery_status",
    });
  }

  try {
    const log = await CommunicationLog.findOneAndUpdate(
      { campaignId, customerId },
      { delivery_status }
    );

    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: {
        [`deliveryStats.${delivery_status}`]: 1,
      },
    });

    res.status(200).json({ success: true, message: "Log updated" });
  } catch (error) {
    console.error("Error updating delivery log:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
