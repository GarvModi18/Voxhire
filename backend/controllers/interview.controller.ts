import { Request, Response } from "express";
import UploadedFile from "../models/UploadedFiles";
import cloudinary from "../config/cloudinary";
import xlsx from "xlsx";
import InterviewSession from "../models/InterviewSession";
import Invitation from "../models/Invitation";
import AIEvaluationModel from "../models/AI_Evaluation";
import { sendEmails } from "../services/email.service";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// ✅ Upload Candidates
export const uploadCandidates = async (req: Request, res: Response) => {
  try {
    // console.log("📤 Uploading Candidates...");

    if (!req.file) {
      console.error("❌ No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!req.user || !req.user.id) {
      console.error("❌ Unauthorized: Missing `admin_id`");
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin ID missing" });
    }

    console.log(
      `📄 Received File: ${req.file.originalname}, Type: ${req.file.mimetype}`
    );

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Candidates_List",
      resource_type: "raw",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    // console.log(`✅ Cloudinary Upload Successful: ${result.secure_url}`);

    // ✅ Save File Details in DB
    const uploadedFile = new UploadedFile({
      admin_id: req.user.id,
      file_name: req.file.originalname,
      file_url: result.secure_url,
      processed_status: "Processed",
      upload_date: new Date(),
    });

    await uploadedFile.save();
    // console.log("✅ File Saved in Database");

    let candidateEmails: string[] = [];
    let candidateNames: string[] = [];
    // ✅ **Download File from Cloudinary Before Processing**
    // console.log("⏳ Downloading file from Cloudinary...");
    const fileResponse = await axios.get(result.secure_url, {
      responseType: "arraybuffer",
    });
    const fileBuffer = Buffer.from(fileResponse.data);

    // ✅ **Extract Emails from Excel**
    if (
      req.file.mimetype.includes("spreadsheet") ||
      req.file.originalname.endsWith(".xlsx")
    ) {
      // console.log("📊 Processing Excel File...");
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      if (!data.length) {
        console.error("❌ Excel File is Empty");
        return res.status(400).json({ message: "Excel file is empty." });
      }
      console.log("📊 Excel Data :", data);
      candidateEmails = data
        .map((row: any) => row.Email)
        .filter((email: string) => email);

      candidateNames = data.map((row: any) => row.Name);
    }

    console.log(`📧 Extracted Emails: ${candidateEmails.join(", ")}`);
    console.log("Extracted Names:", candidateNames);

    if (candidateEmails.length === 0) {
      // console.error("❌ No Valid Emails Found in the File");
      return res
        .status(400)
        .json({ message: "No valid emails found in the file." });
    }

    // ✅ Return extracted emails to frontend
    res.status(201).json({
      message: "File uploaded successfully!",
      fileUrl: result.secure_url,
      candidateEmails,
      candidateNames,
      uploadDate: new Date(),
    });
  } catch (error) {
    console.error("❌ Upload Candidates Error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Internal server error during upload",
      error: error.message,
    });
  }
};

// ✅ Create Interview & Send Emails
export const createInterview = async (req: Request, res: Response) => {
  try {
    const {
      post,
      difficulty,
      duration,
      date,
      time,
      candidateEmails,
      candidateNames,
      type,
      additionalNotes,
    } = req.body;

    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Admin ID required" });
    }

    if (!candidateEmails || candidateEmails.length === 0) {
      return res.status(400).json({ message: "No candidates available." });
    }

    // ✅ Ensure title is included
    const title = `${post} Interview - ${date}`;

    // ✅ Create Interview Session
    const interviewSession = new InterviewSession({
      title,
      post,
      difficulty,
      duration,
      date,
      time,
      candidates: candidateEmails.map((email: string, index: string) => ({
        name: candidateNames[index],
        email,
        status: "Invited",
      })), // ✅ Save Emails
      additional_notes: additionalNotes,
      created_by: req.user.id,
      type: type || "Mixed",
      status: "Scheduled",
      created_at: new Date(),
    });

    await interviewSession.save();

    // ✅ Generate Invitation Tokens for Emails
    const invitations = candidateEmails.map((email: string, index: number) => ({
      interviewSessionId: interviewSession._id,
      email,
      token: crypto.randomUUID(),
      date,
      time,
      post,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
    }));

    // ✅ Store Invitations in DB
    await Invitation.insertMany(invitations);

    // ✅ Send Emails with Join Links
    await sendEmails(invitations);

    res.status(201).json({
      message: "Interview created & emails sent!",
      interviewId: interviewSession._id,
      invitationsSent: invitations.length,
    });
  } catch (error) {
    console.error("❌ Create Interview Error:", error);
    res
      .status(500)
      .json({ message: "Error creating interview session", error });
  }
};

//CREATE FRONTEND FOR THIS !!
// ✅ Fetch All Interviews
export const getAllInterviews = async (req: Request, res: Response) => {
  try {
    // Added pagination support
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Added filtering options
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.interviewType)
      filters.interview_type = req.query.interviewType;

    const total = await InterviewSession.countDocuments(filters);

    const interviews = await InterviewSession.find(filters)
      .sort({ created_at: -1 }) // Updated to use new field
      .skip(skip)
      .limit(limit)
      .select(
        "title post difficulty duration date time status interview_type company_name department candidates created_at"
      );

    if (!interviews.length) {
      return res.status(200).json({
        interviews: [],
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      });
    }

    res.status(200).json(interviews);
  } catch (error) {
    console.error("❌ Fetch Interviews Error:", error);
    res.status(500).json({ message: "Failed to fetch interviews", error });
  }
};

// ✅ Fetch Only Interviews Scheduled for the Logged-in Candidate
export const getCandidateInterviews = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.email) {
      console.warn("⚠️ Warning: Email is missing in `req.user` object.");
      return res.status(401).json({ message: "Unauthorized - No email found" });
    }

    const candidateEmail = req.user.email;

    // Get current date and time
    const currentDate = new Date();

    // Create a date 30 minutes ago to allow for grace period
    const thirtyMinutesAgo = new Date(currentDate);
    thirtyMinutesAgo.setMinutes(currentDate.getMinutes() - 30);

    // Create date objects for start and end of today
    const todayStart = new Date(currentDate);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(currentDate);
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch interviews
    const candidateInterviews = await InterviewSession.find(
      {
        "candidates.email": candidateEmail,
        $or: [
          { date: { $gt: todayEnd } }, // Future dates (after today)
          {
            date: {
              $gte: todayStart, // Today's date (start of day)
              $lte: todayEnd, // Today's date (end of day)
            },
            // Time filtering will be done in application logic
          },
        ],
      },
      {
        title: 1,
        date: 1,
        time: 1,
        duration: 1,
        post: 1,
        interview_type: 1,
        status: 1,
        created_at: 1,
      }
    ).sort({ date: 1, time: 1 });

    // Filter today's interviews based on time
    const filteredInterviews = candidateInterviews.filter((interview) => {
      // If the date is in the future (after today), include it
      if (interview.date > todayEnd) {
        return true;
      }

      // If the date is today, check the time
      if (interview.date.toDateString() === currentDate.toDateString()) {
        // Parse the interview time (assuming format like "09:00" or "14:30")
        const [hours, minutes] = interview.time.split(":").map(Number);

        // Create a date object for the interview time
        const interviewDateTime = new Date(interview.date);
        interviewDateTime.setHours(hours, minutes, 0, 0);

        // Include if the interview time is after 30 minutes ago
        return interviewDateTime >= thirtyMinutesAgo;
      }

      return false;
    });

    res.status(200).json(filteredInterviews);
  } catch (error) {
    console.error("❌ Fetch Candidate Interviews Error:", error);
    res.status(500).json({ message: "Failed to fetch interviews", error });
  }
};

/**
 * Fetch the Curent interview Details from the database.
 */
export const getCurrentInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Extract ID from request params

    if (!id) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await InterviewSession.findOne(
      { _id: id },
      {
        title: 1,
        date: 1,
        time: 1,
        duration: 1,
        difficulty: 1,
        post: 1,
        candidates: 1,
        interview_type: 1,
        additional_notes: 1,
        status: 1,
        created_at: 1,
      }
    );

    if (!interview) {
      return res.status(404).json({ message: "No interview found" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Error fetching interview", error });
  }
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEST;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

/**
 * Generate interview questions dynamically using Gemini AI.
 */
export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const { post, difficulty, additional_notes, duration } = req.body;

    const prompt = `Generate diverse interview questions for a ${post} role.
    - Include a mix of Behavioral, Technical, and Situational questions.
    - Provide exactly 2 questions.
    - additional context ${additional_notes}, difficulty : ${difficulty}
    - Example format:
    [
      ["What is a database transaction?"],
      ["Explain the CAP theorem with examples."]
    ]
    - Do NOT add any additional text, explanations, or headings.
    - Ensure the response is a **valid JSON object** without extra formatting.`;

    console.log("🔹 Sending Request to Gemini AI...");

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    // ✅ Validate Response Structure
    const responseText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error("❌ Invalid Gemini API response:", response.data);
      return res.status(500).json({ message: "Failed to generate questions" });
    }

    // ✅ Parse & Validate JSON Response (Ensure Array of Arrays)
    let formattedQuestions: string[][];
    try {
      formattedQuestions = JSON.parse(responseText.trim());

      // Ensure it's an array of arrays, and each inner array contains exactly one string
      if (
        !Array.isArray(formattedQuestions) ||
        formattedQuestions.some(
          (q) => !Array.isArray(q) || q.length !== 1 || typeof q[0] !== "string"
        )
      ) {
        throw new Error("Invalid question format received.");
      }
    } catch (error) {
      console.error("❌ Error parsing Gemini response:", error);
      return res
        .status(500)
        .json({ message: "Invalid question format from AI" });
    }

    // ✅ Prevent Duplicate Response
    if (res.headersSent) {
      console.warn("⚠️ Response already sent, skipping...");
      return;
    }

    console.log("✅ Questions Received:", formattedQuestions);
    res.json({ questions: formattedQuestions });
  } catch (error) {
    console.error("❌ Error generating questions:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating questions",
        error: error.message,
      });
    }
  }
};
/**
 * Evaluate the candidate's responses using Gemini AI with fallback mechanisms.
 */
export const evaluateInterview = async (req: Request, res: Response) => {
  try {
    const { question, answer, interview_id, post } = req.body;

    if (!question || !answer) {
      console.error("❌ Missing question or answer!");
      return res
        .status(400)
        .json({ message: "Question and Answer are required" });
    }

    // Basic validation - if answer is too short or nonsensical
    if (answer.trim().length < 15) {
      return res.json({
        score: 10,
        summary: "Response is too short and lacks substantive content.",
      });
    }

    // Check for random words or nonsensical answers
    const words = answer.split(/\s+/);
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

    // If the answer has very few unique words or is very short compared to word count
    // it's likely nonsensical or random
    if (uniqueWords.size < 5 || answer.length / words.length < 3) {
      return res.json({
        score: 5,
        summary:
          "Response appears to be random words or nonsensical text without coherent meaning related to the question.",
      });
    }

    // Log the request for debugging
    console.log("Evaluation request:", {
      questionLength: question.length,
      answerLength: answer.length,
      wordCount: words.length,
    });

    const prompt = `Evaluate this interview answer:
      Question: "${question}"
      Answer: "${answer}"

      Rate this answer on a scale of 0-100 and provide a brief summary of its strengths and weaknesses.

      Your response must be in this exact JSON format without any additional text:
      {"score": [number between 0-100], "summary": "[your evaluation summary]"}`;

    console.log("🔹 Sending Evaluation Request to Gemini...");

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    // Log the raw response for debugging
    console.log(
      "Raw Gemini response:",
      JSON.stringify(response.data).substring(0, 200) + "..."
    );

    if (
      !response.data ||
      !response.data.candidates ||
      !response.data.candidates[0]
    ) {
      console.error("❌ Invalid evaluation response structure:", response.data);

      // Fallback evaluation based on basic metrics
      const wordCount = answer.split(/\s+/).length;
      let fallbackScore = 0;
      let fallbackSummary = "The AI evaluation system encountered an error. ";
      if (wordCount == 0) {
        fallbackScore = 0;
        fallbackSummary = "You have Skipped this Question";
      } else if (wordCount < 20) {
        fallbackScore = 10;
        fallbackSummary +=
          "Your answer was very brief and lacked sufficient detail.";
      } else if (wordCount < 50) {
        fallbackScore = 30;
        fallbackSummary +=
          "Your answer had moderate length but may have lacked depth or specificity.";
      } else {
        fallbackScore = 50;
        fallbackSummary +=
          "Your answer had good length but could not be evaluated for technical accuracy.";
      }

      return res.json({ score: fallbackScore, summary: fallbackSummary });
    }

    const evaluationText = response.data.candidates[0].content.parts[0].text;
    console.log("Evaluation text:", evaluationText);

    // Extract the JSON response
    let evaluationResult;
    try {
      // Find JSON in the response (it might be surrounded by markdown code blocks)
      const jsonMatch =
        evaluationText.match(/```json\s*([\s\S]*?)\s*```/) ||
        evaluationText.match(/{[\s\S]*}/);

      const jsonString = jsonMatch
        ? jsonMatch[1] || jsonMatch[0]
        : evaluationText;
      console.log("Extracted JSON string:", jsonString);

      evaluationResult = JSON.parse(jsonString);

      // Validate the structure
      if (
        typeof evaluationResult.score !== "number" ||
        typeof evaluationResult.summary !== "string"
      ) {
        throw new Error("Invalid evaluation format");
      }
    } catch (error) {
      console.error("❌ Error parsing evaluation JSON:", error);

      // Try to extract score and summary using regex as fallback
      const scoreMatch = evaluationText.match(/score"?\s*:\s*(\d+)/i);
      const summaryMatch =
        evaluationText.match(/summary"?\s*:\s*"([^"]+)"/i) ||
        evaluationText.match(/summary"?\s*:\s*"([\s\S]+?)"/i);

      if (scoreMatch) {
        const score = parseInt(scoreMatch[1]);
        const summary = summaryMatch
          ? summaryMatch[1]
          : "The response could not be properly evaluated, but appears to be inadequate.";

        evaluationResult = { score, summary };
      } else {
        // Last resort fallback - basic text analysis
        const keywords = question
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 4);
        const answerLower = answer.toLowerCase();

        // Count relevant keywords from question that appear in answer
        const relevantKeywords = keywords.filter((k) =>
          answerLower.includes(k)
        ).length;
        const relevanceScore = Math.min(
          100,
          Math.round((relevantKeywords / keywords.length) * 50)
        );

        evaluationResult = {
          score: relevanceScore,
          summary: `Your answer contained ${relevantKeywords} relevant keywords from the question. The response ${
            relevanceScore > 30
              ? "appears somewhat relevant"
              : "lacks sufficient relevance"
          } to the question asked.`,
        };
      }
    }

    // Ensure score is an integer between 0-100
    const score = Math.min(
      100,
      Math.max(0, Math.round(evaluationResult.score))
    );

    // Store evaluation in database for future reference
    try {
      const evaluation = new AIEvaluationModel({
        question,
        answer,
        score,
        interview_id,
        post,
        summary: evaluationResult.summary,
        timestamp: new Date(),
      });

      await evaluation.save();
    } catch (dbError) {
      console.error("❌ Error saving evaluation to database:", dbError);
      // Continue even if DB save fails
    }

    console.log("Final evaluation result:", {
      score,
      summary: evaluationResult.summary,
    });

    res.json({
      score,
      summary: evaluationResult.summary,
    });
  } catch (error: any) {
    console.error(
      "❌ Error evaluating response:",
      error.response?.data || error.message
    );

    // Ultimate fallback - never fail to return a response
    res.json({
      score: 10,
      summary:
        "The evaluation system encountered an error. Your answer could not be fully processed, but appears to lack sufficient detail or relevance to the question.",
    });
  }
};

//Excution of Code at Judge0
const JUDGE0_API_URL = "https://judge029.p.rapidapi.com"; // Judge0 RapidAPI version
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // Store API key in .env

let storedQuestions: any[] = []; // Store generated questions
let candidateScores: Record<string, number> = {}; // Track scores by user ID
// 🟢 Execute Code Only (For "Run Code" Button)
export const executeCode = async (req: Request, res: Response) => {
  try {
    const { code, languageId } = req.body;

    if (!code || !languageId) {
      return res.status(400).json({ error: "Missing required data" });
    }

    console.log("🚀 Running Code...");

    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code: Buffer.from(code).toString("base64"),
        language_id: languageId,
        stdin: Buffer.from("").toString("base64"),
      },
      {
        headers: { "x-rapidapi-key": JUDGE0_API_KEY! },
        params: { base64_encoded: "true", wait: "false", fields: "*" },
      }
    );

    const token = submissionResponse.data.token;
    if (!token) {
      return res.status(500).json({ error: "Execution token error" });
    }

    let result: any = null;

    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await axios.get(
        `${JUDGE0_API_URL}/submissions/${token}`,
        {
          headers: { "x-rapidapi-key": JUDGE0_API_KEY! },
          params: { base64_encoded: "true", fields: "*" },
        }
      );

      if (response.data.status.id > 2) {
        result = response.data;
        break;
      }
    }

    if (!result) {
      return res.status(500).json({ error: "Execution timeout" });
    }

    res.json({
      output: result.stdout
        ? Buffer.from(result.stdout, "base64").toString()
        : "No output",
      error: result.stderr
        ? Buffer.from(result.stderr, "base64").toString()
        : "",
    });
  } catch (error: any) {
    console.error("❌ Execution Error:", error.message);
    res.status(500).json({ error: "Execution failed" });
  }
};
export const validateAndEvaluateCode = async (req: Request, res: Response) => {
  try {
    const { code, languageId, testCases } = req.body;
    const userId = req.headers["user-id"] as string;

    if (!code || !languageId || !testCases) {
      return res.status(400).json({ error: "Missing required data" });
    }

    console.log("🚀 Validating and Evaluating Code...");

    let score = 0;
    let totalCases = testCases.length;
    let outputs: string[] = [];

    for (const test of testCases) {
      const submissionResponse = await axios.post(
        `${JUDGE0_API_URL}/submissions`,
        {
          source_code: Buffer.from(code).toString("base64"),
          language_id: languageId,
          stdin: Buffer.from(test.input).toString("base64"),
        },
        {
          headers: { "x-rapidapi-key": JUDGE0_API_KEY! },
          params: { base64_encoded: "true", wait: "false", fields: "*" },
        }
      );

      const token = submissionResponse.data.token;
      if (!token) {
        return res.status(500).json({ error: "Execution token error" });
      }

      let result;
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await axios.get(
          `${JUDGE0_API_URL}/submissions/${token}`,
          {
            headers: { "x-rapidapi-key": JUDGE0_API_KEY! },
            params: { base64_encoded: "true", fields: "*" },
          }
        );

        if (response.data.status.id > 2) {
          result = response.data;
          break;
        }
      }

      if (result?.stdout) {
        const output = Buffer.from(result.stdout, "base64").toString().trim();
        outputs.push(output);
        if (output === test.expected_output.trim()) {
          score += 1;
        }
      } else {
        outputs.push("No output / Execution Error");
      }
    }

    const finalScore = (score / totalCases) * 100; // Convert to percentage

    // 🟢 Check if a record already exists for this candidate
    const existingRecord = await AIEvaluationModel.findOne({
      candidate_id: userId,
    });

    if (existingRecord) {
      // ✅ Update existing record (add new score to existing score)
      existingRecord.score += finalScore;
      await existingRecord.save();
    } else {
      // ✅ Create a new record if none exists
      await AIEvaluationModel.create({
        candidate_id: userId,
        score: finalScore,
      });
    }

    res.json({
      message: "Validation and Evaluation Complete",
      outputs,
    });
  } catch (error: any) {
    console.error("❌ Validation & Evaluation Error:", error.message);
    res.status(500).json({ error: "Error validating and evaluating code" });
  }
};

// 🟢 Generate All Questions at Start of Interview
export const generateCodingQuestions = async (req: Request, res: Response) => {
  try {
    const { post, difficulty, additional_notes, interview_id } = req.body;
    const userId = req.headers["user-id"]; // Unique identifier for candidate

    if (!GEMINI_API_KEY)
      return res.status(500).json({ error: "Missing Gemini API Key" });

    // 🔥 Improved prompt for question generation
    const prompt = `Generate a coding interview problem for a ${post} role at ${difficulty} difficulty.
      - Provide a 2-3 paragraph problem statement.
      - Include multiple test cases with input and expected output.
      - Make it clear and structured like a professional coding challenge.
      - Example problem: "Merge Two Sorted Arrays" with detailed test cases.
      Additional notes: ${additional_notes}`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.data || !response.data.candidates) {
      return res
        .status(500)
        .json({ error: "Invalid response from Gemini API" });
    }

    // 🟢 Extract and structure questions properly
    storedQuestions = response.data.candidates.map((c: any) => ({
      question: c.content.parts[0].text,
      submitted: false,
    }));

    // Initialize score storage for the user
    candidateScores[userId as string] = 0;

    res.json({ questions: storedQuestions.length });
  } catch (error: any) {
    console.error(
      "❌ Error generating questions:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error generating coding questions" });
  }
};

// 🟢 Get Next Unanswered Question
export const getNextQuestion = async (req: Request, res: Response) => {
  const userId = req.headers["user-id"]; // Candidate's unique ID

  const nextQuestion = storedQuestions.find((q) => !q.submitted);

  if (!nextQuestion) {
    return res.json({
      message: "All questions answered. Click Finish Interview.",
    });
  }

  res.json({ question: nextQuestion.question });
};

// 🟢 Finish Interview & Return Final Score
export const finishInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["user-id"];

    if (!candidateScores[userId as string]) {
      return res.status(400).json({ error: "No scores found for user" });
    }

    const finalScore = candidateScores[userId as string];

    // Clear user data after interview is finished
    delete candidateScores[userId as string];

    res.json({
      message: "Interview Completed",
      finalScore: finalScore,
    });
  } catch (error) {
    console.error("❌ Error finishing interview:", error);
    res.status(500).json({ error: "Error finishing interview" });
  }
};
