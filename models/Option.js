import mongoose from "mongoose";
const { Schema, model } = mongoose;

const optionSchema = new Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "experience",
      "systems",
      "playingRoles",
      "playingModes",
      "languages",
      "playstyles",
      "likes",
      "dislikes",
    ],
  },
});

export default mongoose.model("Option", optionSchema);
