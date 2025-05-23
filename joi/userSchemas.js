import Joi from "joi";

// MongoDB ObjectId pattern (24-hex)
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/); //additional validation for ObjectId

// Date validation
const minDate = new Date("1900-01-01");
const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - 5);

export const profileUpdateSchema = Joi.object({
  userName: Joi.string().lowercase().trim().required(),
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
    location: Joi.object({
      type: Joi.string().valid("Point").required(),
      coordinates: Joi.array().length(2).items(Joi.number()).required(), // [lng, lat]
    }),
  }).required(),
  experience: objectId.required(),
  systems: Joi.array().items(objectId).min(1).required(),
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
  playingRoles: Joi.array().items(objectId).default([]),
  playingModes: objectId.required(),
  languages: Joi.array().items(objectId).default([]),
  playstyles: Joi.array().items(objectId).default([]),
  likes: Joi.array().items(objectId).default([]),
  dislikes: Joi.array().items(objectId).default([]),
  tagline: Joi.string().max(150).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
});
