import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.js";
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getSingleGroup,
  updateGroup,
} from "../controllers/groups.js";
import { groupSchema } from "../joi/schemas.js";
import verifyToken from "../middlewares/verifyToken.js";

const groupsRouter = Router();

groupsRouter
  .route("/")
  .get(getAllGroups)
  .post(validateSchema(groupSchema), verifyToken, createGroup);

groupsRouter
  .route("/:id")
  .get(getSingleGroup)
  .put(validateSchema(groupSchema), verifyToken, updateGroup)
  .delete(verifyToken, deleteGroup);

export default groupsRouter;
