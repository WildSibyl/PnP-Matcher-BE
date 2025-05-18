import Joi from "joi";
import {
  likesSchema,
  dislikesSchema,
  systemsSchema,
  playstylesSchema,
} from "./preferenceSchemas.js";

export const groupSchema = Joi.object({
  author: Joi.string(),
  name: Joi.string().required(),
  image: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .pattern(/\.(jpeg|jpg|png|gif|webp)$/i)
    .messages({
      "string.pattern.base":
        "Image must be a valid URL ending in .jpeg, .jpg, .png, .gif, or .webp",
    }),
  description: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
  systems: Joi.array().items(systemsSchema).min(1).required(),
  playstyles: Joi.array().items(playstylesSchema).min(1).required(),
  days: Joi.array() // Days of the week as an array of valid strings
    .items(Joi.string().valid("mon", "tue", "wed", "thu", "fri", "sat", "sun"))
    .min(1)
    .unique()
    .required(),
  frequencyPerMonth: Joi.number() // Frequency per month as an integer
    .integer()
    .min(1)
    .max(31) // To allow max one play per day
    .required(),
  likes: Joi.array().items(likesSchema).min(1).required(),
  dislikes: Joi.array().items(dislikesSchema).min(1).required(),
  members: Joi.array().items(Joi.string()).default([]),
  maxMembers: Joi.number().integer().min(1).max(30).required(),
}).custom((obj, helpers) => {
  if (obj.members.length > obj.maxMembers) {
    return helpers.message(
      `Too many members. Maximum allowed is ${obj.maxMembers}`
    );
  }
  return obj;
});
