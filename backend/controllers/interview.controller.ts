import { Request, Response } from "express";
import UploadedFile from "../models/UploadedFiles";
import cloudinary from "../config/cloudinary";
import xlsx from "xlsx";
import pdfParse from "pdf-parse";
import fs from "fs";
import InterviewSession from "../models/InterviewSession";
import Invitation from "../models/Invitation";
import { sendEmails } from "../services/email.service";
import axios from "axios";
import crypto from "crypto";

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
    });

    await uploadedFile.save();
    // console.log("✅ File Saved in Database");

    let candidateEmails: string[] = [];

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

      candidateEmails = data
        .map((row: any) => row.Email)
        .filter((email: string) => email);
    }

    // ✅ **Extract Emails from PDF**
    else if (req.file.mimetype.includes("pdf")) {
      // console.log("📄 Processing PDF File...");
      const parsedData = await pdfParse(fileBuffer);

      candidateEmails = parsedData.text
        .split("\n")
        .filter((line) => line.includes("@"));
    } else {
      console.error("❌ Unsupported File Type");
      return res.status(400).json({ message: "Unsupported file format." });
    }

    console.log(`📧 Extracted Emails: ${candidateEmails.join(", ")}`);

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
      candidates: candidateEmails.map((email: string) => ({
        name: "Candidate",
        email,
      })), // ✅ Save Emails
      additional_notes: additionalNotes,
      created_by: req.user.id,
    });

    await interviewSession.save();

    // ✅ Generate Invitation Tokens for Emails
    const invitations = candidateEmails.map((email: string) => ({
      interviewSessionId: interviewSession._id,
      email,
      token: crypto.randomUUID(),
      date,
      time,
      post,
    }));

    // ✅ Store Invitations in DB
    await Invitation.insertMany(invitations);

    // ✅ Send Emails with Join Links
    await sendEmails(invitations);

    res.status(201).json({ message: "Interview created & emails sent!" });
  } catch (error) {
    console.error("❌ Create Interview Error:", error);
    res
      .status(500)
      .json({ message: "Error creating interview session", error });
  }
};

// ✅ Fetch All Interviews
export const getAllInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await InterviewSession.find().sort({ date: -1 }); // Sort by date (latest first)

    if (!interviews.length) {
      return res.status(200).json([]);
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

    const candidateEmail = req.user.email; // ✅ Get logged-in user's email

    // ✅ Fetch Interviews where the logged-in user's email is present in the candidates array
    const candidateInterviews = await InterviewSession.find(
      { "candidates.email": candidateEmail }, // ✅ Corrected query
      {
        title: 1,
        date: 1,
        time: 1,
        duration: 1,
        post: 1,
      }
    ).sort({ date: 1 });

    console.log("🔍 Searching for candidate:", candidateEmail);
    console.log("✅ Candidate Interviews Found:", candidateInterviews);

    res.status(200).json(candidateInterviews);
  } catch (error) {
    console.error("❌ Fetch Candidate Interviews Error:", error);
    res.status(500).json({ message: "Failed to fetch interviews", error });
  }
};
