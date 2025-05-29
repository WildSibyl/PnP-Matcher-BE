// import { v2 as cloudinary } from "cloudinary";

// export const deleteFileController = async (req, res) => {
//   try {
//     const { publicId } = req.params;

//     const result = await cloudinary.uploader.destroy(publicId, {
//       resource_type: "image", // or "auto" if mixed media
//     });

//     if (result.result !== "ok") {
//       return res
//         .status(400)
//         .json({ error: "Deletion failed", details: result });
//     }

//     res.status(200).json({
//       message: "File deleted successfully",
//       result,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Error deleting file", details: err.message });
//   }
// };
