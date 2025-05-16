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
  about: { type: String, required: [true, "About section is required"] },
  zipCode: { type: String, required: [true, "Zip code is required"] },
  country: { type: String, required: [true, "Country is required"] },
  system: { type: String, required: [true, "Game system is required"] },
  playstyle: { type: String, required: [true, "Playstyle is required"] },
  days: {
    type: [String],
    enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    required: [true, "At least one available day is required"],
  },
  frequencyPerMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: [true, "Frequency per month is required"],
  },
  likes: { type: [String], default: [] },
  dislikes: { type: [String], default: [] },
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
