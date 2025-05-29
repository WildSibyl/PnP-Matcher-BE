import express from "express";
import upload from "../middlewares/upload.js";
//import verifyToken from "../middlewares/verifyToken.js";
import { uploadFileController } from "../controllers/uploadFileController.js";
//import { deleteFile } from "../controllers/uploadFileController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFileController);
export default router;
