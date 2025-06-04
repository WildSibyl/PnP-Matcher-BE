import { Router } from "express";
import {
  getAllUsers,
  getFilteredUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getRollMatches,
  inviteToGroup,
  addToGroup,
  removeInvite,
  removeFromGroup,
  getAuthoredGroups,
  getYourGroups,
} from "../controllers/users.js";
import validateSchema from "../middlewares/validateSchema.js";
import { profileUpdateSchema } from "../joi/userSchemas.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyTokenOptional from "../middlewares/verifyTokenOptional.js";

const usersRouter = Router();

usersRouter
  .route("/")
  .get(getAllUsers)
  .post(verifyTokenOptional, getFilteredUsers);

usersRouter.route("/matches").get(verifyToken, getRollMatches);

usersRouter.route("/invite").post(verifyToken, inviteToGroup);

usersRouter.route("/acceptinvite").post(verifyToken, addToGroup);

usersRouter.route("/removeinvite").post(verifyToken, removeInvite);

usersRouter.route("/leavegroup").post(verifyToken, removeFromGroup);

usersRouter.route("/groups/authored").get(verifyToken, getAuthoredGroups);

usersRouter.route("/groups").get(verifyToken, getYourGroups);

usersRouter
  .route("/:id")
  .get(getSingleUser)
  .put(validateSchema(profileUpdateSchema), verifyToken, updateUser)
  .delete(verifyToken, deleteUser);

export default usersRouter;
