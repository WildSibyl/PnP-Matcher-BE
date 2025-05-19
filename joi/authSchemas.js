import Joi from "joi";
import {
  likesSchema,
  dislikesSchema,
  systemsSchema,
  playstylesSchema,
  experience,
  playingRole,
} from "./preferenceSchemas.js";

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
  experience: experience,
  systems: Joi.array().items(systemsSchema).min(1).required(),
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
  playingRole: Joi.array().items(playingRole).default([]),
  playstyles: Joi.array().items(playstylesSchema).default([]),
  likes: Joi.array().items(likesSchema).default([]),
  dislikes: Joi.array().items(dislikesSchema).default([]),
  tagline: Joi.string().max(150).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
  groups: Joi.array().items(Joi.string().hex().length(24)).default([]), // Assuming groups are stored as ObjectId strings
});

export const signInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().alphanum().min(8).max(12).required(),
});
