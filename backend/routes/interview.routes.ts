import express from "express";
import { protect } from "../middleware/authMiddleware";
import { uploadInterview } from "../middleware/upload.middleware";
import {
  uploadCandidates,
  createInterview,
  getAllInterviews,
} from "../controllers/interview.controller"; // ✅ Ensure createInterview is imported

const router = express.Router();

// ✅ Upload Candidates (Requires Authentication)
router.post(
  "/upload-candidates",
  protect,
  uploadInterview.single("file"),
  async (req, res) => {
    await uploadCandidates(req, res);
  }
);

// ✅ Create Interview (Requires Authentication)
router.post("/create-interview", protect, async (req, res) => {
  await createInterview(req, res);
});

// ✅ Route to Fetch All Interviews
router.get("/interviews", protect, async (req, res) => {
  await getAllInterviews(req, res);
});
export default router;
