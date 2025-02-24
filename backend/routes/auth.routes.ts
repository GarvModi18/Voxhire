import express from "express";
import {
  registerUser,
  verifyOtp,
  loginUser,
  getUserProfile,
  uploadProfilePic,
} from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";
import {
  uploadProfile,
  uploadInterview,
} from "../middleware/upload.middleware";
import {
  createInterview,
  uploadCandidates,
} from "../controllers/interview.controller";

const router = express.Router();

router.post("/register", async (req, res) => {
  await registerUser(req, res);
});

router.post("/verify-otp", async (req, res) => {
  await verifyOtp(req, res);
});

router.post("/login", async (req, res) => {
  await loginUser(req, res); // ✅ Fix: Correct function call
});

router.get("/profile", protect, async (req, res) => {
  await getUserProfile(req, res);
});

router.post("/upload-profile-pic", protect, async (req, res) => {
  uploadProfile.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload failed.", error: err.message });
    }
    await uploadProfilePic(req, res);
  });
});

export default router;
