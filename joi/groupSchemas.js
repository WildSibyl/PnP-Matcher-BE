import Joi from "joi";

// MongoDB ObjectId pattern (24-hex)
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/); //additional validation for ObjectId

export const groupSchema = Joi.object({
  author: objectId.required(),
  name: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9\s]+$/, "letters, numbers, and spaces")
    .required(),
  image: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .pattern(/\.(jpeg|jpg|png|gif|webp)$/i)
    .messages({
      "string.pattern.base":
        "Image must be a valid URL ending in .jpeg, .jpg, .png, .gif, or .webp",
    }),
  address: Joi.object({
    street: Joi.string(),
    houseNumber: Joi.string(),
    postalCode: Joi.string(),
    city: Joi.string(),
  }),
  experience: objectId.required(),
  systems: Joi.array().items(objectId).min(1).required(),
  weekdays: Joi.array() // Days of the week as an array of valid strings
    .items(Joi.string().valid("MO", "TU", "WE", "TH", "FR", "SA", "SU"))
    .min(1)
    .unique()
    .required(),
  frequencyPerMonth: Joi.number() // Frequency per month as an integer
    .integer()
    .min(1)
    .max(31) // To allow max one play per day
    .required(),
  playingModes: objectId.required(),
  languages: Joi.array().items(objectId).required(),
  playstyles: Joi.array().items(objectId).required(),
  likes: Joi.array().items(objectId).default([]),
  dislikes: Joi.array().items(objectId).default([]),
  tagline: Joi.string().max(150).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
  members: Joi.array().items(objectId).default([]),
  maxMembers: Joi.number().integer().min(1).max(30).required(),
}).custom((obj, helpers) => {
  if (obj.members.length > obj.maxMembers) {
    return helpers.message(
      `Too many members. Maximum allowed is ${obj.maxMembers}`
    );
  }
  return obj;
});
