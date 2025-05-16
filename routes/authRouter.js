import { Router } from "express";
import { signIn, signUp, signOut, me } from "../controllers/auth.js";
import validateSchema from "../middlewares/validateSchema.js";
import { signInSchema, signUpSchema } from "../joi/schemas.js";
import verifyToken from "../middlewares/verifyToken.js";

const authRouter = Router();

authRouter.get("/me", verifyToken, me);
authRouter.post("/signin", validateSchema(signInSchema), signIn);
authRouter.post("/signup", validateSchema(signUpSchema), signUp);
authRouter.delete("/signout", signOut);

export default authRouter;
