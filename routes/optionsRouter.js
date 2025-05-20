import { Router } from "express";
//import validateSchema from "../middlewares/validateSchema.js";
import { getAllOptions } from "../controllers/options.js"; //createOption,deleteOption,getSingleOption,updateOption, are not needed for now
//import { optionSchema } from "../joi/optionSchemas.js";
//import verifyToken from "../middlewares/verifyToken.js";

const optionsRouter = Router();

optionsRouter.route("/").get(getAllOptions);
//.post(validateSchema(optionSchema), verifyToken, createOption);

optionsRouter;
//.route("/:id")
//.get(getSingleOption)
//.put(validateSchema(optionSchema), verifyToken, updateOption)
//.delete(verifyToken, deleteOption);

export default optionsRouter;
