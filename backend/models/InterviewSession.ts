import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewSession extends Document {
  candidate_id: mongoose.Types.ObjectId;
  interviewer_id: mongoose.Types.ObjectId;
  date: Date;
  session_logs: string[];
  overall_performance_score?: number;
  visual_feedback?: string;
}

const InterviewSessionSchema: Schema = new Schema({
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  interviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  session_logs: [{ type: String }],
  overall_performance_score: { type: Number, default: 0 },
  visual_feedback: { type: String },
});

export default mongoose.model<IInterviewSession>(
  "InterviewSession",
  InterviewSessionSchema
);
