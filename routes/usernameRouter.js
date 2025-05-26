import { Router } from "express";
import { checkUsernameAvailability } from "../controllers/users.js";

const usernameRouter = Router();

usernameRouter.route("/").get(checkUsernameAvailability);

export default usernameRouter;
