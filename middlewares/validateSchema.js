import ErrorResponse from "../utils/ErrorResponse.js";

const validateSchema = (joiSchema) => (req, res, next) => {
  const { error } = joiSchema.validate(req.body);

  if (error) console.log("Validation error: ", error.details);
  throw new ErrorResponse(
    "Some fields have not been filled correctly, please check!",
    400
  );

  next();
};

export default validateSchema;
