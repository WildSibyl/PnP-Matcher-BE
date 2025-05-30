import Joi from "joi";

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

export const chatSchema = Joi.object({
  recipient: objectId.required(),
  text: Joi.string().allow("", null),
  file: Joi.string().uri().allow("", null), // Optional file URL
}).or("text", "file"); // Require at least text or file
