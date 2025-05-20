//import { isValidObjectId } from "mongoose";
import Option from "../models/Option.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getAllOptions = async (req, res) => {
  const options = await Option.find();
  if (!options) throw new ErrorResponse(`Options not found`, 404);
  res.json(options);
};

// export const createOption = async (req, res) => {
//   const { body } = req;
//   console.log(req.userId);
//   const newOption = await Option.create({ ...body, author: req.userId });

//   // Add option to user's list of options
//   await User.findByIdAndUpdate(req.userId, {
//     $push: { options: newOption._id },
//   });

//   // Populate after creation
//   const populatedOption = await Option.findById(newOption._id).populate("author");

//   res.status(201).json(populatedOption);
// };

// export const getSingleOption = async (req, res) => {
//   const {
//     params: { id },
//   } = req;

//   // Mongoose offers a method to check if the id is valid
//   if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

//   const option = await Option.findById(id).populate("author");
//   if (!option)
//     throw new ErrorResponse(`Option with id of ${id} doesn't exist`, 404);

//   res.send(option);
// };

// export const updateOption = async (req, res) => {
//   const {
//     body,
//     params: { id },
//   } = req;

//   if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

//   const option = await Option.findById(id);
//   if (!option)
//     throw new ErrorResponse(`Option with id of ${id} doesn't exist`, 404);
//   if (option.author.toString() !== req.userId)
//     throw new ErrorResponse("You are not authorized to update this option", 403);

//   const updatedOption = await Option.findByIdAndUpdate(id, body, {
//     new: true,
//   }).populate("author");

//   if (!updatedOption)
//     throw new ErrorResponse(`Option with id of ${id} doesn't exist`, 404);

//   res.json(updatedOption);
// };

// export const deleteOption = async (req, res) => {
//   const {
//     params: { id },
//   } = req;

//   if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

//   const option = await Option.findById(id);
//   if (!option)
//     throw new ErrorResponse(`Option with id of ${id} doesn't exist`, 404);
//   if (option.author.toString() !== req.userId)
//     throw new ErrorResponse("You are not authorized to delete this option", 403);

//   const deletedOption = await Option.findByIdAndDelete(id).populate("author");
//   if (!deletedOption) throw new Error(`Option with id of ${id} doesn't exist`);

//   res.json({ success: `Option with id of ${id} was deleted` });
// };
