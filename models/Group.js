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
        return /^[A-Za-z0-9\s]+$/.test(v);
      },
      message: "Group name can only contain letters, numbers, and spaces",
    },
  },
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
  address: {
    street: { type: String },
    houseNumber: { type: String },
    postalCode: { type: String },
    city: { type: String },
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
    required: [true, "Playing mode is required"],
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
    required: [true, "Playstyle is required"],
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
    default: 10, // to avoid null values
  },
  createdAt: { type: Date, default: Date.now },
});

groupSchema.index({ "address.location": "2dsphere" });

export default model("Group", groupSchema);
