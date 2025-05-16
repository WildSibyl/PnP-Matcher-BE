import Joi from "joi";

export const signUpSchema = Joi.object({
  userName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().alphanum().min(8).max(12).required(),
  birthday: Joi.date().greater("1-1-1900").less("1-1-2023").required(),
  about: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
  system: Joi.string().required(),
  playstyle: Joi.string().required(),
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
  likes: Joi.array().items(Joi.string()),
  dislikes: Joi.array().items(Joi.string()),
  groups: Joi.array().items(Joi.string().hex().length(24)).default([]), // Assuming groups are stored as ObjectId strings
});

export const signInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().alphanum().min(8).max(12).required(),
});

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
  system: Joi.string().required(),
  playstyle: Joi.string().required(),
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
  likes: Joi.array().items(Joi.string()),
  dislikes: Joi.array().items(Joi.string()),
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
