import Joi from "joi";

export default authSchema = Joi.object({
  credentials: Joi.string().required().label("Google Credentials"),
});
