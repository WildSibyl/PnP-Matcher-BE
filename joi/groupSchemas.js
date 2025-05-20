import Joi from "joi";

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
  zipCode: Joi.string(),
  country: Joi.string(),
  experience: Joi.array().items(Joi.string()).min(1).required(),
  systems: Joi.array().items(Joi.string()).min(1).required(),
  days: Joi.array() // Days of the week as an array of valid strings
    .items(Joi.string().valid("MO", "TU", "WE", "TH", "FR", "SA", "SU"))
    .min(1)
    .unique()
    .required(),
  frequencyPerMonth: Joi.number() // Frequency per month as an integer
    .integer()
    .min(1)
    .max(31) // To allow max one play per day
    .required(),
  languages: Joi.array().items(Joi.string()).default([]),
  playstyles: Joi.array().items(Joi.string()).default([]),
  likes: Joi.array().items(Joi.string()).default([]),
  dislikes: Joi.array().items(Joi.string()).default([]),
  tagline: Joi.string().max(150).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
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
