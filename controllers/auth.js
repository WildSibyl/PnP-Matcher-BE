import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { getCoordinates } from "../utils/getCoordinates.js";

export const me = async (req, res) => {
  const user = await User.findById(req.userId);
  res.status(200).json(user);
};

export const signUp = async (req, res) => {
  try {
    console.log("SignUp endpoint hit");
    console.log("Signup payload:", req.body);

    const {
      userName,
      email,
      password,
      birthday,
      address,
      experience,
      systems = [],
      weekdays = [],
      frequencyPerMonth,
      terms = false,
      avatarUrl = "",
      languages = [],
      playingRoles,
      playingModes,
      playstyles = [],
      likes = [],
      dislikes = [],
      tagline,
      description,
    } = req.body;

    // Pre-check username
    const userNameExists = await User.findOne({ userName });
    if (userNameExists) throw new ErrorResponse("Username already taken", 409);

    // Pre-check email
    const userExists = await User.findOne({ email });
    if (userExists) throw new ErrorResponse("Email already registered", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const { lat, lng } = await getCoordinates(address);

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      birthday,
      address: {
        ...address,
        location: {
          coordinates: [lng, lat], //Always longitude first and then latitude
        },
      },
      experience,
      systems,
      weekdays,
      frequencyPerMonth,
      terms,
      avatarUrl,
      languages,
      playingRoles,
      playingModes,
      playstyles,
      likes,
      dislikes,
      tagline,
      description,
    });

    const token = jwt.sign(
      { id: newUser._id, permission: newUser.permission },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

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
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.userName) {
        return res.status(409).json({ message: "Username already taken" });
      }
      if (error.keyPattern.email) {
        return res.status(409).json({ message: "Email already registered" });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
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
    _id: user._id,
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

export const updateEmail = async (req, res) => {
  const userId = req.userId;
  const { newEmail, confirmNewEmail, currentPassword } = req.body;

  if (newEmail !== confirmNewEmail) {
    return res.status(400).json({ error: "Emails do not match" });
  }

  const user = await User.findById(userId).select("+password"); // Getting the password field only for this operation
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid current password" });
  }

  user.email = newEmail;
  await user.save();

  return res.status(200).json({ message: "Email updated" });
};

export const updatePassword = async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const user = await User.findById(userId).select("+password"); // Getting the password field only for this operation
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  console.log("User found:", user);
  if (!currentPassword || !user.password) {
    return res
      .status(400)
      .json({ error: "Missing current password or stored password" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid current password" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.status(200).json({ message: "Password updated" });
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.userId; // from verifyToken middleware
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findById(userId).select("+password"); // Getting the password field only for this operation

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email !== email) {
      return res
        .status(401)
        .json({ error: "Email does not match authenticated user" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    await User.findByIdAndDelete(userId);

    // Clear the cookie that holds the JWT
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};
