import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: true, // This creates a unique index on the username field
    trim: true,
    validate: {
      validator: function (v) {
        return /^[A-Za-z0-9\s]+$/.test(v);
      },
      message: "Username can only contain letters, numbers, and spaces",
    },
  },
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
    required: [true, "At least one available day is required"],
  },
  frequencyPerMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: [true, "Frequency per month is required"],
  },
  terms: {
    type: Boolean,
    required: [true, "Terms and conditions must be accepted"],
  },
  avatarUrl: {
    type: String,
    default: "https://i.ibb.co/F4MD88Lt/Ren-avatar.png", // Default Ren avatar URL
    validate: {
      validator: function (v) {
        return v === "" || /^https?:\/\/.+/i.test(v); // explicitly allow empty string
      },
      message: "Avatar URL must be a valid URL or empty",
    },
  },
  playingRoles: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
    default: null,
  },
  playingModes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
    default: null,
  },
  languages: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    default: [],
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
  },
  description: {
    type: String,
    maxLength: 500,
  },
  groups: {
    // populated by User.findById(id).populate('groups')
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    default: [],
  },
  invites: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    default: [],
  },
  permission: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ "address.location": "2dsphere" }); //Create index

export default model("User", userSchema);
