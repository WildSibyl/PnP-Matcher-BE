import { Router } from "express";
import {
  getAllUsers,
  getFilteredUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";
import validateSchema from "../middlewares/validateSchema.js";
import { profileUpdateSchema } from "../joi/userSchemas.js";
import verifyToken from "../middlewares/verifyToken.js";

const usersRouter = Router();

usersRouter.route("/").get(getAllUsers).post(verifyToken, getFilteredUsers);

usersRouter
  .route("/:id")
  .get(getSingleUser)
  .put(validateSchema(profileUpdateSchema), verifyToken, updateUser)
  .delete(verifyToken, deleteUser);

export default usersRouter;
