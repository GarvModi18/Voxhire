// AI_Evaluation.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAIEvaluation extends Document {
  interview_id?: mongoose.Types.ObjectId;
  candidate_id: mongoose.Types.ObjectId;
  question: string;
  answer?: string;
  type: string;
  score: number;
  summary: string;
  timestamp: Date;
}

const AIEvaluationSchema: Schema = new Schema({
  interview_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
  },
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: { type: String, required: true },
  answer: { type: String },
  score: { type: Number, required: true }, // 0-100 score
  summary: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IAIEvaluation>(
  "AI_Evaluation",
  AIEvaluationSchema
);
