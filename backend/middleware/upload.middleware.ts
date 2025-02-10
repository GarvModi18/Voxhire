import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// ✅ Correct Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "profile_pictures",
    format: file.mimetype.split("/")[1], // ✅ Extract file format dynamically
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // ✅ Unique filename
  }),
});

const upload = multer({ storage });

export default upload;
