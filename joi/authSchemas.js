import Joi from "joi";

// MongoDB ObjectId pattern (24-hex)
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/); //additional validation for ObjectId

// Date validation
const minDate = new Date("1900-01-01");
const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - 5);

export const signUpSchema = Joi.object({
  userName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9\s]+$/, "letters, numbers, and spaces")
    .required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  birthday: Joi.string()
    .isoDate()
    .custom((value, helpers) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return helpers.error("date.base");
      }
      if (date <= minDate) {
        return helpers.message("Birthday must be after January 1, 1900");
      }
      if (date >= maxDate) {
        return helpers.message("You must be at least 5 years old to sign up");
      }
      return value;
    })
    .required(),
  address: Joi.object({
    street: Joi.string().required(),
    houseNumber: Joi.string().required(),
    postalCode: Joi.string().required(),
    city: Joi.string().required(),
    // location: Joi.object({
    //   type: Joi.string().valid("Point").required(),
    //   coordinates: Joi.array().length(2).items(Joi.number()).required(), // [lng, lat]
    //}),
  }).required(),
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
  terms: Joi.boolean().valid(true).required(),
  avatarUrl: Joi.string()
    .uri() // Validate URL format for avatar
    .optional()
    .allow(null, ""),
  playingRoles: objectId.optional().allow(null, ""),
  playingModes: objectId.optional().allow(null, ""),
  languages: Joi.array().items(objectId).default([]),
  playstyles: Joi.array().items(objectId).default([]),
  likes: Joi.array().items(objectId).default([]),
  dislikes: Joi.array().items(objectId).default([]),
  tagline: Joi.string().max(150).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
  groups: Joi.array().items(objectId).default([]),
});

export const signInSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().alphanum().min(8).required(),
});

export const updateEmailSchema = Joi.object({
  newEmail: Joi.string().email().required(),
  confirmNewEmail: Joi.string().valid(Joi.ref("newEmail")).required().messages({
    "any.only": "New email and confirmation do not match",
  }),
  currentPassword: Joi.string().required(),
});

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "New password and confirmation do not match",
    }),
});
