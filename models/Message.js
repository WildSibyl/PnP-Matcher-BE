import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MessageSchema = new Schema(
  {
    chatId: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    file: String,
  },
  { timestamps: true }
);

export default model("Message", MessageSchema);
