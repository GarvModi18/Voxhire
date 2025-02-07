// finalReport.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFinalReport extends Document {
  admin_id: mongoose.Types.ObjectId;
  candidate_id: mongoose.Types.ObjectId;
  report_url: string;
  summary: string;
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
  report_url: { type: String, required: true },
  summary: { type: String, required: true },
});

export default mongoose.model<IFinalReport>("FinalReport", FinalReportSchema);
