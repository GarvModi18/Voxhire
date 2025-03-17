// question.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  session_id: mongoose.Types.ObjectId;
  question_text: string;
}

const QuestionSchema: Schema = new Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
  },
  question_text: { type: String, required: true },
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);
