import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: [true, "Username is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
  birthday: { type: Date, required: [true, "Birthday is required"] },
  zipCode: { type: String, required: [true, "Zip code is required"] },
  country: { type: String, required: [true, "Country is required"] },
  experience: {
    type: String,
    enum: [
      "Rookie: Getting to know P&P",
      "Adventurer: I know my game",
      "Hero: P&P is my life",
    ],
    required: [true, "Experience is required"],
  },
  systems: {
    type: [String],
    default: [],
    required: [true, "Game systems is required"],
  },
  playstyles: {
    type: [String],
    default: [],
    required: [true, "Playstyle is required"],
  },
  likes: {
    type: [String],
    default: [],
    required: [true, "Likes are required"],
  },
  dislikes: {
    type: [String],
    default: [],
    required: [true, "Dislikes are required"],
  },
  days: {
    type: [String],
    enum: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
    required: [true, "At least one available day is required"],
  },
  frequencyPerMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: [true, "Frequency per month is required"],
  },
  tagline: {
    type: String,
    required: [true, "Tagline is required"],
    maxLength: 150,
  },
  description: {
    type: String,
    required: [true, "description is required"],
    maxLength: 500,
  },
  groups: [
    // populated by User.findById(id).populate('groups')
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default model("User", userSchema);
