import { Router } from "express";
import {
  signIn,
  signUp,
  signOut,
  me,
  updateEmail,
  updatePassword,
} from "../controllers/auth.js";
import validateSchema from "../middlewares/validateSchema.js";
import {
  signInSchema,
  signUpSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "../joi/authSchemas.js";
import verifyToken from "../middlewares/verifyToken.js";

const authRouter = Router();

authRouter.get("/me", verifyToken, me);
authRouter.post("/signin", validateSchema(signInSchema), signIn);
authRouter.post("/signup", validateSchema(signUpSchema), signUp);
authRouter.delete("/signout", signOut);
authRouter.patch(
  "/update-email",
  verifyToken,
  validateSchema(updateEmailSchema),
  updateEmail
);
authRouter.patch(
  "/update-password",
  verifyToken,
  validateSchema(updatePasswordSchema),
  updatePassword
);

export default authRouter;
