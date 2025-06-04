import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.js";
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getFilteredGroups,
  getSingleGroup,
  updateGroup,
  checkGroupnameAvailability,
} from "../controllers/groups.js";
import { groupSchema } from "../joi/groupSchemas.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyTokenOptional from "../middlewares/verifyTokenOptional.js";

const groupsRouter = Router();

groupsRouter
  .route("/")
  .get(getAllGroups)
  .post(verifyTokenOptional, getFilteredGroups);

groupsRouter
  .route("/create")
  .post(validateSchema(groupSchema), verifyToken, createGroup);

groupsRouter.route("/check-name").get(checkGroupnameAvailability);

groupsRouter
  .route("/:id")
  .get(getSingleGroup)

  .put(validateSchema(groupSchema), verifyToken, updateGroup)
  .delete(verifyToken, deleteGroup);

export default groupsRouter;
