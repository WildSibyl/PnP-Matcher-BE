import { isValidObjectId } from "mongoose";
import User from "../models/User.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getAllUsers = async (req, res) => {
  const { radius = 5000 } = req.query;
  //    const userId = req.userId;

  //   try {
  //     // 1. Find the current user
  //     const currentUser = await User.findById(userId);

  //     if (!currentUser || !currentUser.address?.location?.coordinates) {
  //       return res.status(400).json({ error: "User location not available" });
  //     }

  //     const [lng, lat] = currentUser.address.location.coordinates;

  //     // 2. Find nearby users based on the current user's location
  //     const nearbyUsers = await User.find({
  //       _id: { $ne: userId }, // exclude current user from results
  //       "address.location": {
  //         $near: {
  //           $geometry: {
  //             type: "Point",
  //             coordinates: [lng, lat], // current user's coordinates, center of the radius
  //           },
  //           $maxDistance: parseInt(radius), // radius in meters
  //         },
  //       },
  //     });

  //     res.status(200).json(nearbyUsers);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //     res.status(500).json({ error: "Server error" });
  //   }
  try {
    const allUsers = await User.find({
      "address.location": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [9.993682, 53.551086], //temporary HH coordinates to be exchanged with the one above
          },
          $maxDistance: radius, //in meters
        },
      },
    })
      .populate("experience")
      .populate("systems")
      .populate("languages")
      .populate("playingRoles")
      .populate("playingModes")
      .populate("playstyles")
      .populate("likes");

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSingleUser = async (req, res) => {
  const {
    params: { id },
  } = req;

  // Mongoose offers a method to check if the id is valid
  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const user = await User.findById(id)
    .populate("experience")
    .populate("systems")
    .populate("languages")
    .populate("playingRoles")
    .populate("playingModes")
    .populate("playstyles")
    .populate("likes")
    .populate("dislikes")
    .populate("groups");

  if (!user)
    throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

  res.send(user);
};

export const updateUser = async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  // Mongoose offers a method to check if the id is valid
  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const user = await User.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!user)
    throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

  res.send(user);
};

export const deleteUser = async (req, res) => {
  const {
    params: { id },
  } = req;

  // Mongoose offers a method to check if the id is valid
  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const user = await User.findByIdAndDelete(id);

  if (!user)
    throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

  res.send(user);
};

//different endpoint to check username availability, but still in the users controller
export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const existingUser = await User.findOne({
      userName: { $regex: `^${username}$`, $options: "i" }, // case-insensitive match
    });

    res.json({ isAvailable: !existingUser });
  } catch (err) {
    console.error("Error checking username:", err);
    res.status(500).json({ error: "Server error" });
  }
};
