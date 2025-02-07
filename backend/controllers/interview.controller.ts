// controllers/interview.controller.ts
import { Request, Response } from "express";
import InterviewSession from "../models/InterviewSession";
import Invitation from "../models/Invitation";
import { sendEmails } from "../services/email.service";

// Function to create an interview session and invite candidates
export const createInterviewSession = async (req: Request, res: Response) => {
  try {
    const { post, difficulty, duration, candidateEmails, date, time } =
      req.body;

    // Create the interview session
    const interviewSession = new InterviewSession({
      post,
      difficulty,
      duration,
      date,
      time,
    });

    await interviewSession.save();

    // Create Invitations for each candidate
    const invitations = candidateEmails.map((email: string) => ({
      interviewSessionId: interviewSession._id,
      email,
    }));

    // Save invitations in the database
    await Invitation.insertMany(invitations);

    // Send email invitations to candidates
    await sendEmails(invitations);

    res
      .status(201)
      .json({ message: "Interview session created and invitations sent" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating interview session", error });
  }
};
