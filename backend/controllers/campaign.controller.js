import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import parseRulesToMongoQuery from "../utils/parseRules.js";

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
  const { rules, logic } = req.body;
  if (!rules || !logic) {
    return res.status(400).json({
      success: false,
      message: "Missing rules or logic in request body",
    });
  }
  try {
    const mongoQuery = parseRulesToMongoQuery(rules, logic);
    const count = await Customer.countDocuments(mongoQuery);
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCampaign = async (req, res) => {
  const { name, rules, logic, objective } = req.body;
  if (!name || !objective) {
    return res.status(400).json({
      success: false,
      message: "Campaign name and objective are required fields",
    });
  }
  if (!rules || !logic) {
    return res.status(400).json({
      success: false,
      message: "Missing rules or logic in request body",
    });
  }
  try {
    const mongoQuery = parseRulesToMongoQuery(rules, logic);
    const audienceSize = await Customer.countDocuments(mongoQuery);

    const campaign = await Campaign.create({
      owner: req.userId,
      name,
      rules,
      logic,
      audienceSize,
      objective,
      deliveryStats: {
        sent: 0,
        failed: 0,
      },
    });

    res.status(201).json({ success: true, data: { campaign } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
