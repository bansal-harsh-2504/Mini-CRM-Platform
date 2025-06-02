import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import parseRulesToMongoQuery from "../utils/parseRules.js";
import {
  previewAudienceSchema,
  createCampaignSchema,
} from "../validations/campaign.js";
import redis from "../services/redisClient.js";

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

  try {
    const { name, rules, logic, objective } = req.body;
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

    res.status(201).json({ success: true, data: { campaign } });

    (async () => {
      try {
        const pipeline = redis.pipeline();
        for (const customer of customers) {
          const personalizedMessage = `Hi ${customer.name}, ${objective}`;
          pipeline.xadd(
            "ingestion_stream",
            "*",
            "type",
            "campaign",
            "campaignId",
            campaign._id.toString(),
            "customerId",
            customer._id.toString(),
            "message",
            personalizedMessage,
            "email",
            customer.email,
            "vendor_reference",
            req.vendor_reference
          );
        }
        await pipeline.exec();
      } catch (err) {
        console.error("Error pushing campaign messages to Redis:", err);
      }
    })();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
