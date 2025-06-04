import "./db/index.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import groupsRouter from "./routes/groupsRouter.js";
import authRouter from "./routes/authRouter.js";
import optionsRouter from "./routes/optionsRouter.js";
import usersRouter from "./routes/usersRouter.js";
import usernameRouter from "./routes/usernameRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import uploadRoutes from "./routes/uploadRouter.js";
import chatsRouter from "./routes/chatsRouter.js";
import { WebSocketServer } from "ws";

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.CLIENT_URL_PROD,
  process.env.CLIENT_URL_DEV,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
); // Allow cross-origin requests from the client URL
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/groups", groupsRouter);
app.use("/options", optionsRouter);
app.use("/users", usersRouter);
app.use("/check-username", usernameRouter); // Endpoint to check username availability
app.use("/chats", chatsRouter);

//upload avatar url

app.use(express.urlencoded({ extended: true }));
app.use("/", uploadRoutes);

app.use("/*splat", (req, res) => res.status(404).json({ error: "Not found" })); //express v5 uses this to handle 404 errors from any routes

app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(`Server listening on port : ${port}`)
);

const wss = new WebSocketServer({ server });

wss.on("connection", (connection) => {
  console.log("New WebSocket connection established");

  connection.on("message", (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  });

  connection.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

//npm install
//npm i bcrypt
//npm install jsonwebtoken
//npm i cookie-parser
//npm i ws
