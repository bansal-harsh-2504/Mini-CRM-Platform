import Customer from "../models/Customer";
import parseRulesToMongoQuery from "../utils/parseRules.js";

export const previewAudienceSize = async (req, res) => {
  const { rules } = req.body;
  if (!rule) {
    return res.status(400).json({ message: "Missing rule in request body" });
  }
  try {
    const mongoQuery = parseRulesToMongoQuery(rules);
    const count = await Customer.countDocuments(mongoQuery);
    res.status(200).json({ success: true, data: count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSegmentAndCampaign = async (req, res) => {
  const { name, rules } = req.body;
  try {
    const mongoQuery = parseRulesToMongoQuery(rules);
    const audienceSize = await Customer.countDocuments(mongoQuery);

    const segment = await Segment.create({
      owner: req.userId,
      name,
      rules,
      audienceSize,
    });

    const campaign = await Campaign.create({
      owner: req.userId,
      segmentId: segment._id,
      name: `Campaign for ${name}`,
      deliveryStats: {
        sent: 0,
        failed: 0,
        audienceSize,
      },
    });

    res.status(201).json({ segment, campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
