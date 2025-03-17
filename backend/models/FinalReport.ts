// finalReport.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFinalReport extends Document {
  admin_id: mongoose.Types.ObjectId;
  candidate_id: mongoose.Types.ObjectId;
  interview_id: mongoose.Types.ObjectId;
  report_url: string;
  summary: string;
  overall_score: number;
  recommendation: "Hire" | "Consider" | "Reject";
  strengths: string[];
  areas_for_improvement: string[];
  generated_date: Date;
}

const FinalReportSchema: Schema = new Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  interview_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
  },
  report_url: { type: String, required: true },
  summary: { type: String },
  overall_score: { type: Number, required: true },
  recommendation: {
    type: String,
    enum: ["Hire", "Consider", "Reject"],
    required: true,
  },
  strengths: [{ type: String }],
  areas_for_improvement: [{ type: String }],
  generated_date: { type: Date, default: Date.now },
});

export default mongoose.model<IFinalReport>("FinalReport", FinalReportSchema);
