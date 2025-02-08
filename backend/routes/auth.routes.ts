import express from "express";
import {
  registerUser,
  verifyOtp,
  loginUser,
  getUserProfile,
} from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";

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

export default router;
