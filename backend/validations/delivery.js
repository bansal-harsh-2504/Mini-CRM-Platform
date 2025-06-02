import Joi from "joi";

export const simulateDeliverySchema = Joi.object({
  campaignId: Joi.string().required(),
  customerId: Joi.string().required(),
  personalizedMessage: Joi.string().required(),
  email: Joi.string().email().required(),
});

export const updateLogSchema = Joi.object({
  campaignId: Joi.string().required(),
  customerId: Joi.string().required(),
  delivery_status: Joi.string().valid("sent", "failed").required(),
});
