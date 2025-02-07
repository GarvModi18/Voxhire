// question.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  session_id: mongoose.Types.ObjectId;
  question_text: string;
  question_type: "Behavioral" | "Technical" | "Situational";
  difficulty: "Easy" | "Medium" | "Hard";
  expected_answer: string;
}

const QuestionSchema: Schema = new Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
  },
  question_text: { type: String, required: true },
  question_type: {
    type: String,
    enum: ["Behavioral", "Technical", "Situational"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  expected_answer: { type: String, required: true },
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);
