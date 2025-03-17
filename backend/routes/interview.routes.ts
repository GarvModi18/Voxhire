import express from "express";
import { protect } from "../middleware/authMiddleware";
import { uploadInterview } from "../middleware/upload.middleware";
import {
  uploadCandidates,
  createInterview,
  getAllInterviews,
  getCandidateInterviews,
  getCurrentInterview,
  generateQuestions,
  evaluateInterview,
  generateCodingQuestions,
  getNextQuestion,
  finishInterview,
  executeCode,
  validateAndEvaluateCode,
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

// ✅ Route to Fetch All Interviews for Admin
router.get("/interviews", protect, async (req, res) => {
  await getAllInterviews(req, res);
});

// ✅ Fetch Only Scheduled Interviews for Logged-in Candidate
router.get("/candidate-interviews", protect, async (req, res) => {
  await getCandidateInterviews(req, res);
});

// ✅ Fetch the current interview
router.get("/current/:id", protect, async (req, res) => {
  await getCurrentInterview(req, res);
});

// ✅ Generate AI-powered questions based on interview details
router.post("/generate-questions", protect, async (req, res) => {
  await generateQuestions(req, res);
});

// ✅ Evaluate candidate responses and return score
router.post("/evaluate", protect, async (req, res) => {
  await evaluateInterview(req, res);
});

//✅ Route to Execute Code
router.post("/execute", protect, async (req, res) => {
  await executeCode(req, res);
});

router.post("/generate-coding-questions", protect, async (req, res) => {
  await generateCodingQuestions(req, res);
});

router.post("/validate", protect, async (req, res) => {
  await validateAndEvaluateCode(req, res);
});

router.post("/get-next-question", protect, async (req, res) => {
  await getNextQuestion(req, res);
});

router.post("/finish-interview", protect, async (req, res) => {
  await finishInterview(req, res);
});
export default router;
