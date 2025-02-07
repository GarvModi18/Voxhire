// interviewSession.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewSession extends Document {
  candidate_id: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  difficulty: string;
  duration: string;
  post: string;
  session_logs: string[];
}

const InterviewSessionSchema: Schema = new Schema({
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  duration: { type: String, required: true },
  post: { type: String, required: true },
  session_logs: [{ type: String }],
});

export default mongoose.model<IInterviewSession>(
  "InterviewSession",
  InterviewSessionSchema
);
