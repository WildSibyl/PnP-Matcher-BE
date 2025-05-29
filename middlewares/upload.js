// const multer = "multer";
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// export default upload;

import multer from "multer";
import CloudinaryStorage from "../utils/cloudinary.js";

// const storage = new CloudinaryStorage();

const allowedFileExt = [
  "jpeg",
  "jpg",
  "webp",
  "png",
  "heic",
  "avif",
  "svg",
  "gif",
];

const fileFilter = (req, file, cb) => {
  const fileExt = file.mimetype.split("/")[1]; // application/json, image/png, image/svg, text/svg

  if (allowedFileExt.includes(fileExt)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Wrong file type, only ${allowedFileExt.join(", ")} allowed`
    );
    err.statusCode = 400;
    cb(err);
  }
};

const fileSize = 1_048_576 * 2; // 2mb

// const upload = multer({ storage, fileFilter, limits: { fileSize } });
// export default upload;

const storage = new CloudinaryStorage(); // your custom storage engine

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize },
});

export default upload;
