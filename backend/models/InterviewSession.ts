import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewSession extends Document {
  title: string;
  category: string;
  difficultyLevel: string;
  duration: string;
  date: Date; // Date when the interview is scheduled
  allocated_time: string; // Time allocated for the interview (e.g., "10:00 AM")
  session_logs: string[];
  overall_performance_score?: number;
  visual_feedback?: string;
}

const InterviewSessionSchema: Schema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  difficultyLevel: { type: String, required: true },
  duration: { type: String, required: true },
  date: { type: Date, required: true }, // Store the actual date of the interview
  allocated_time: { type: String, required: true }, // Store the allocated interview time
  session_logs: [{ type: String }],
  overall_performance_score: { type: Number, default: 0 },
  visual_feedback: { type: String },
});

export default mongoose.model<IInterviewSession>(
  "InterviewSession",
  InterviewSessionSchema
);
