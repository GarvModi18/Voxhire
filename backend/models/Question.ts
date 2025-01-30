import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  type: "HR" | "Technical";
  difficulty: "Easy" | "Medium" | "Hard";
  question_text: string;
  expected_answer: string;
  dynamic_tags?: string[];
  created_at: Date;
}

const QuestionSchema: Schema = new Schema({
  type: { type: String, enum: ["HR", "Technical"], required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  question_text: { type: String, required: true },
  expected_answer: { type: String, required: true },
  dynamic_tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);
