import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const me = async (req, res) => {
  const user = await User.findById(req.userId);
  res.status(200).json(user);
};

export const signUp = async (req, res) => {
  console.log("SignUp endpoint hit");
  console.log("Signup payload:", req.body);

  const {
    userName,
    email,
    password,
    birthday,
    zipCode,
    country,
    experience,
    systems = [],
    playstyles = [],
    likes = [],
    dislikes = [],
    days = [],
    frequencyPerMonth,
    tagline,
    description,
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) throw new ErrorResponse("User already exists", 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    userName,
    email,
    password: hashedPassword,
    birthday,
    zipCode,
    country,
    experience,
    systems,
    playstyles,
    likes,
    dislikes,
    days,
    frequencyPerMonth,
    tagline,
    description,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    id: newUser._id,
    userName: newUser.userName,
    email: newUser.email,
    createdAt: newUser.createdAt,
  });
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ErrorResponse("Invalid credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ErrorResponse("Invalid credentials", 401);

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Set to true if using HTTPS
    sameSite: isProduction ? "None" : "Lax", // CSRF protection: lax for same-site requests (top level navigation), strict for cross-site, none for no restrictions
  };

  const signedInUser = {
    userName: user.userName,
    email: user.email,
  };

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: "User logged in successfully",
    user: signedInUser,
  });
};

export const signOut = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Set to true if using HTTPS
    sameSite: isProduction ? "None" : "Lax", // CSRF protection: lax for same-site requests (top level navigation), strict for cross-site, none for no restrictions
  };

  res.clearCookie("token", cookieOptions);
  res.status(200).json({
    message: "User logged out successfully",
  });
};
