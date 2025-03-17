// candidate.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  user_id: mongoose.Types.ObjectId;
  interview_sessions: mongoose.Types.ObjectId[]; //add interview session and for each thier status(move common staus int here for each interview)
  skills: string[];
  experience_years: number;
  education?: string;
  overall_score: number;
  status: "Applied" | "Screening" | "Interviewed" | "Selected" | "Rejected";
  feedback?: string;
}

const CandidateSchema: Schema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  interview_sessions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "InterviewSession" },
  ],
  skills: [{ type: String }],
  experience_years: { type: Number, default: 0 },
  education: { type: String },
  overall_score: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Applied", "Screening", "Interviewed", "Selected", "Rejected"],
    default: "Applied",
  },
  feedback: { type: String },
});

export default mongoose.model<ICandidate>("Candidate", CandidateSchema);
