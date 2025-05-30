import Message from "../models/Message.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getChatMessages = async (req, res, next) => {
  try {
    const { userId } = req.user; // authenticated user ID
    const { recipientId } = req.query; // recipient user ID

    if (!recipientId) {
      return next(new ErrorResponse("Recipient ID is required", 400));
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(new ErrorResponse("Failed to fetch chat messages", 500));
  }
};

export const sendChat = async (req, res, next) => {
  try {
    const userId = req.userId; // sender (authenticated)
    const { recipient, text, file, chatId } = req.body;

    if (!recipient || (!text && !file) || !chatId) {
      return next(
        new ErrorResponse(
          "Recipient, chatId and message text or file are required",
          400
        )
      );
    }

    const newMessage = new Message({
      chatId,
      sender: userId,
      recipient,
      text,
      file: file || null,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("sendChat error:", error);
    next(new ErrorResponse("Failed to send message", 500));
  }
};
