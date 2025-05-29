import User from "../models/User.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const uploadFileController = async (req, res, next) => {
  try {
    const fileUrl = req.file.path; // Cloudinary URL
    //const fileName = req.file.filename; // Cloudinary public_id
    const fileName = req.file?.filename || req.file?.originalname;

    res.status(200).json({
      message: "File uploaded successfully",
      fileUrl,
      fileName,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
