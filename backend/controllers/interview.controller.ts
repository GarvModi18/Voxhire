import { Request, Response } from "express";
import InterviewSession from "../models/InterviewSession";
import Invitation from "../models/Invitation";
import { sendEmails } from "../services/email.service";

// Function to create an interview session and invite candidates
export const createInterviewSession = async (req: Request, res: Response) => {
  try {
    // Destructure data from the request body
    const {
      title,
      category,
      difficultyLevel,
      duration,
      candidateEmails,
      date,
      allocated_time,
    } = req.body;

    // Create the interview session
    const interviewSession = new InterviewSession({
      title,
      category,
      difficultyLevel,
      duration,
      date,
      allocated_time,
      interviewer_id: req.user.id, // req.user.id added here based on your authentication system
    });

    await interviewSession.save();

    // Create Invitations for each candidate
    const invitations = candidateEmails.map((email: string) => ({
      interviewSessionId: interviewSession._id,
      email,
      allocated_time, // Associate the same allocated time with each invitation
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

// You can add other methods like `verifyToken`, `getInvitations`, etc.
