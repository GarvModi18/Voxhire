import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

cloudinary.config({
  cloud_name: process.env.Cloud_NAME!,
  api_key: process.env.Cloudinary_API_KEY!,
  api_secret: process.env.Cloudinary_API_SECRET!,
  secure: true,
});

export default cloudinary;
