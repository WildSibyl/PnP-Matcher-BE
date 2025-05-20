import "./db/index.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import groupsRouter from "./routes/groupsRouter.js";
import authRouter from "./routes/authRouter.js";
import optionsRouter from "./routes/optionsRouter.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // Allow cross-origin requests from the client URL
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/groups", groupsRouter);
app.use("/options", optionsRouter);
app.use("/*splat", (req, res) => res.status(404).json({ error: "Not found" })); //express v5 uses this to handle 404 errors from any routes

app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on port : ${port}`));

//npm install
//npm i bcrypt
//npm install jsonwebtoken
//npm i cookie-parser
