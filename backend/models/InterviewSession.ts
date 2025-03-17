// interviewSession.ts
import mongoose, { Schema, Document } from "mongoose";

interface ICandidate {
  name: string;
  email: string;
  status: "Invited" | "Confirmed" | "Attended" | "No-show";
}

export interface IInterview extends Document {
  title: string;
  created_by: mongoose.Types.ObjectId;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "Q&A" | "Technical" | "Mixed";
  date: Date;
  time: string;
  duration: number;
  post: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  candidates: ICandidate[];
  additional_notes?: string;
}

const InterviewSchema: Schema = new Schema({
  title: { type: String, required: true },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Q&A", "Technical", "Mixed"],
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  post: { type: String, required: true },

  status: {
    type: String,
    enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  candidates: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      status: {
        type: String,
        enum: ["Invited", "Confirmed", "Attended", "No-show"],
        default: "Invited",
      },
    },
  ],
  additional_notes: { type: String },
});

export default mongoose.model<IInterview>("InterviewSession", InterviewSchema);
