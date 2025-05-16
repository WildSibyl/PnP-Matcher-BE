import { valid } from "joi";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const groupSchema = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"],
  },
  name: { type: String, required: [true, "Group name is required"] },
  image: {
    type: String,
    required: [true, "Cover image is required"], //url or imported? or both?
    validate: {
      validator: function (v) {
        return /\.(jpeg|jpg|png|gif|webp)$/i.test(v);
      },
      message: (props) => `${props.value} is not a valid image file.`,
    },
  },
  description: { type: String, required: [true, "Description is required"] },
  zipCode: { type: String, required: [true, "Zip code is required"] },
  country: { type: String, required: [true, "Country is required"] },
  system: { type: String, required: [true, "Game system is required"] },
  playstyle: { type: String, required: [true, "Playstyle is required"] },
  days: {
    type: [String],
    enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    required: [true, "At least one play day is required"],
  },
  frequencyPerMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: [true, "Frequency per month is required"],
  },
  content: { type: String, required: [true, "Body is required"] },
  likes: { type: [String], default: [] },
  dislikes: { type: [String], default: [] },
  members: {
    type: [String],
    default: [],
    validate: {
      validator: function (value) {
        return !this.maxMembers || value.length <= this.maxMembers;
      },
      message: (props) =>
        `Too many members (${props.value.length}). Max allowed is ${props.instance.maxMembers}.`,
    },
  },
  maxMembers: {
    type: Number,
    min: 1,
    max: 30, // Assuming a maximum of 30 members, to be adjusted with the app logic
    default: 10, // to avoid null values
  },
  createdAt: { type: Date, default: Date.now },
});

export default model("Group", groupSchema);
