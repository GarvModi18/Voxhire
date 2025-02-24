import mongoose, { Schema, Document } from "mongoose";

export interface IInterview extends Document {
  title: string;
  created_by: mongoose.Types.ObjectId;
  difficulty: "Easy" | "Medium" | "Hard";
  date: Date;
  time: string;
  duration: string;
  post: string;
  candidates: { name: string; email: string }[];
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
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  post: { type: String, required: true },
  candidates: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
  ],
  additional_notes: { type: String },
});

export default mongoose.model<IInterview>("Interview", InterviewSchema);
