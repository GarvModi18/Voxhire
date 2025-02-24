import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Debug function
const verifyCloudinaryConfig = () => {
  console.log("Cloudinary Configuration Check:", {
    cloudName: process.env.Cloud_NAME,
    apiKeyPresent: !!process.env.Cloudinary_API_KEY,
    apiSecretPresent: !!process.env.Cloudinary_API_SECRET,
  });

  if (
    !process.env.Cloud_NAME ||
    !process.env.Cloudinary_API_KEY ||
    !process.env.Cloudinary_API_SECRET
  ) {
    console.error("❌ Missing Cloudinary Configuration!");
  }
};

cloudinary.config({
  cloud_name: process.env.Cloud_NAME!,
  api_key: process.env.Cloudinary_API_KEY!,
  api_secret: process.env.Cloudinary_API_SECRET!,
  secure: true,
});

verifyCloudinaryConfig();

export default cloudinary;
