import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Candidate" | "Interviewer";
  profile_picture?: string; // Store image URL
  registration_date: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Candidate", "Interviewer"], required: true },
  profile_picture: { type: String, default: "" }, // Default empty if no image
  registration_date: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
