import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  candidate_id: mongoose.Types.ObjectId;
  bio: string;
  interview_sessions: mongoose.Types.ObjectId[];
  overall_score?: number;
  feedback?: string;
}

const CandidateSchema: Schema = new Schema({
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bio: { type: String, required: true },
  interview_sessions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "InterviewSession" },
  ],
  overall_score: { type: Number, default: 0 },
  feedback: { type: String },
});

export default mongoose.model<ICandidate>("Candidate", CandidateSchema);
