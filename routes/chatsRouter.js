import { Router } from "express";
import { sendChat, getChatMessages } from "../controllers/chats.js";
import validateSchema from "../middlewares/validateSchema.js";
import { chatSchema } from "../joi/chatSchema.js";
import verifyToken from "../middlewares/verifyToken.js";

const chatsRouter = Router();

chatsRouter
  .route("/")
  .get(verifyToken, getChatMessages)
  .post(verifyToken, validateSchema(chatSchema), sendChat);

export default chatsRouter;
