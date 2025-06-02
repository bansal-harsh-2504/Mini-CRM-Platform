import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import CommunicationLog from "../models/CommunicationLog.js";
import parseRulesToMongoQuery from "../utils/parseRules.js";
import {
  previewAudienceSchema,
  createCampaignSchema,
} from "../validations/campaign.js";
import axios from "axios";

export const getCampaignHistory = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ owner: req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: { campaigns } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const previewAudienceSize = async (req, res) => {
  const { error } = previewAudienceSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { rules, logic } = req.body;
  if (!rules || !logic) {
    return res.status(400).json({
      success: false,
      message: "Missing rules or logic in request body",
    });
  }
  try {
    const mongoQuery = await parseRulesToMongoQuery(rules, logic);
    const count = await Customer.countDocuments(mongoQuery);
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCampaign = async (req, res) => {
  const { error } = createCampaignSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { name, rules, logic, objective } = req.body;

  if (!name || !objective || !rules || !logic) {
    return res.status(400).json({
      success: false,
      message: "Required fields: name, rules, logic, and objective",
    });
  }

  const vendor_reference = req.vendor_reference;

  try {
    const mongoQuery = await parseRulesToMongoQuery(rules, logic);
    const customers = await Customer.find(mongoQuery);
    const audienceSize = customers.length;

    const campaign = await Campaign.create({
      owner: req.userId,
      name,
      rules,
      logic,
      audienceSize,
      objective,
      deliveryStats: { sent: 0, failed: 0 },
    });

    for (const customer of customers) {
      const personalizedMessage = `Hi ${customer.name}, ${objective}`;
      const log = await CommunicationLog.create({
        campaignId: campaign._id,
        customerId: customer._id,
        message: personalizedMessage,
        vendor_reference,
      });

      await log.save();
      try {
        await axios.post(`${process.env.BASE_URL_BACKEND}/api/vendor/send`, {
          campaignId: campaign._id,
          customerId: customer._id,
          personalizedMessage,
          email: customer.email,
        });
      } catch (e) {
        console.error("Error in create Campaign controller:", e.message);
      }
    }

    campaign.status = "completed";
    await campaign.save();

    res.status(201).json({ success: true, data: { campaign } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
