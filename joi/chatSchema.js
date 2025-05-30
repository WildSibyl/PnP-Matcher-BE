import Joi from "joi";

const objectId = /^[0-9a-fA-F]{24}$/;

export const chatSchema = Joi.object({
  chatId: Joi.string().required(),
  sender: Joi.string().pattern(objectId).required(),
  recipient: Joi.string().pattern(objectId).required(),
  text: Joi.string().allow("", null),
  file: Joi.string().allow("", null),
}).or("text", "file");
