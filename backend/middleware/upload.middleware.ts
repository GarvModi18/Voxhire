import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// ✅ Storage for Profile Pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "profile_pictures",
    format: file.mimetype.split("/")[1],
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

// ✅ Storage for Candidate List (Excel / PDF)
const candidateStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("🔍 Middleware File Details:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    if (
      !file.mimetype.includes("spreadsheet") &&
      !file.mimetype.includes("pdf")
    ) {
      console.error("❌ Unsupported File Type:", file.mimetype);
      throw new Error("Only PDF and Excel files are allowed.");
    }

    return {
      folder: "Candidates_List",
      resource_type: "raw",
      format: file.mimetype.split("/")[1],
      public_id: `candidates_${Date.now()}_${file.originalname}`,
    };
  },
});

export const uploadProfile = multer({ storage: profileStorage });
export const uploadInterview = multer({ storage: candidateStorage });
