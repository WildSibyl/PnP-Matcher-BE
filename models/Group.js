//import { valid } from "joi";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const groupSchema = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"],
  },
  name: {
    type: String,
    unique: true, // This creates a unique index on the username field
    trim: true,
    required: [true, "Group name is required"],
    validate: {
      validator: function (v) {
        return /^[A-Za-z0-9\s!:\-,&?"']+$/.test(v);
      },
      message: "Group name can only contain letters, numbers, and spaces",
    },
  },
  image: {
    type: String,
    validate: {
      validator: function (value) {
        if (!value) return true; // allow empty string or null
        // your image validation logic here (e.g. regex for URL or file extension)
        return /\.(jpg|jpeg|png|gif)$/i.test(value);
      },
      message: "is not a valid image file.",
    },
    default: "", // default to empty string if no image is provided
  },
  address: {
    street: { type: String, required: true },
    houseNumber: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], //[longitude, latitude]
      },
    },
  },
  experience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
    required: [true, "Experience is required"],
  },
  systems: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    default: [],
    required: [true, "Game systems is required"],
  },
  weekdays: {
    type: [String],
    enum: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
    required: [true, "At least one play day is required"],
  },
  frequencyPerMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: [true, "Frequency per month is required"],
  },
  playingModes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
  },
  languages: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    default: [],
    required: [true, "Language is required"],
  },
  playstyles: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    default: [],
  },
  likes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    default: [],
  },
  dislikes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    default: [],
  },
  tagline: {
    type: String,
    maxLength: 150,
    required: [true, "Tagline is required"],
  },
  description: {
    type: String,
    maxLength: 500,
  },
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
    default: 4, // to avoid null values
  },
  createdAt: { type: Date, default: Date.now },
});

groupSchema.index({ "address.location": "2dsphere" });

export default model("Group", groupSchema);
