// aiEvaluation.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAI_Evaluation extends Document {
  candidate_id: mongoose.Types.ObjectId;
  interview_score: number;
  technical_score: number;
  ai_feedback: string;
  final_decision: "Pass" | "Fail" | "Pending";
}

const AIEvaluationSchema: Schema = new Schema({
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  interview_score: { type: Number, required: true },
  technical_score: { type: Number, required: true },
  ai_feedback: { type: String, required: true },
  final_decision: {
    type: String,
    enum: ["Pass", "Fail", "Pending"],
    required: true,
  },
});

export default mongoose.model<IAI_Evaluation>(
  "AI_Evaluation",
  AIEvaluationSchema
);
