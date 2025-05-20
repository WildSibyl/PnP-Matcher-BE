import Joi from "joi";

export const signUpSchema = Joi.object({
  userName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().alphanum().min(8).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  birthday: Joi.alternatives()
    .try(
      Joi.date().greater("1-1-1900").less("1-1-2023"),
      Joi.string().isoDate()
    )
    .required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
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
  playingRoles: Joi.array().items(Joi.string()).default([]),
  languages: Joi.array().items(Joi.string()).default([]),
  playstyles: Joi.array().items(Joi.string()).default([]),
  likes: Joi.array().items(Joi.string()).default([]),
  dislikes: Joi.array().items(Joi.string()).default([]),
  tagline: Joi.string().max(150).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
  groups: Joi.array().items(Joi.string().hex().length(24)).default([]), // Assuming groups are stored as ObjectId strings
});

export const signInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().alphanum().min(8).max(12).required(),
});
