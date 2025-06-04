import { isValidObjectId } from "mongoose";
import Group from "../models/Group.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import User from "../models/User.js";

export const getAllGroups = async (req, res) => {
  const groups = await Group.find().populate("author");
  res.json(groups);
};

export const createGroup = async (req, res) => {
  const { body } = req;
  console.log(req.userId);
  const newGroup = await Group.create({ ...body, author: req.userId });

  // Add group to user's list of groups
  await User.findByIdAndUpdate(req.userId, {
    $push: { groups: newGroup._id },
  });

  // Populate after creation
  const populatedGroup = await Group.findById(newGroup._id).populate("author");

  res.status(201).json(populatedGroup);
};

export const getSingleGroup = async (req, res) => {
  const {
    params: { id },
  } = req;

  // Mongoose offers a method to check if the id is valid
  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const group = await Group.findById(id).populate("author");
  if (!group)
    throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

  res.send(group);
};

export const updateGroup = async (req, res) => {
  const {
    body,
    params: { id },
  } = req;

  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const group = await Group.findById(id);
  if (!group)
    throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

  if (
    group.author.toString() === req.userId ||
    req.userPermission === "admin"
  ) {
    const updatedGroup = await Group.findByIdAndUpdate(id, body, {
      new: true,
    }).populate("author");
    if (!updatedGroup)
      throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

    res.json(updatedGroup);
  } else {
    throw new ErrorResponse("You are not authorized to update this group", 403);
  }
};

export const deleteGroup = async (req, res) => {
  const {
    params: { id },
  } = req;

  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const group = await Group.findById(id);
  if (!group)
    throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

  if (
    group.author.toString() === req.userId ||
    req.userPermission === "admin"
  ) {
    const deletedGroup = await Group.findByIdAndDelete(id).populate("author");
    if (!deletedGroup) throw new Error(`Group with id of ${id} doesn't exist`);

    res.json({ success: `Group with id of ${id} was deleted` });
  } else {
    throw new ErrorResponse("You are not authorized to delete this group", 403);
  }
};

export const checkGroupnameAvailability = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  try {
    const existingGroup = await Group.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    res.json({ isAvailable: !existingGroup });
  } catch (err) {
    console.error("Error checking group name:", err);
    res.status(500).json({ error: "Server error" });
  }
};
