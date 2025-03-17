// user.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Candidate";
  profile_picture?: string;
  registration_date: Date;
  last_login_date?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Candidate"], required: true },
  profile_picture: { type: String, default: "" },
  registration_date: { type: Date, default: Date.now },
  last_login_date: { type: Date },
});

export default mongoose.model<IUser>("User", UserSchema);
