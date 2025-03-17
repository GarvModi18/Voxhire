// invitation.ts
import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IInvitation extends Document {
  interviewSessionId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  used: boolean;
  expiry_date: Date;
  created_at: Date;
}

const InvitationSchema: Schema = new Schema({
  interviewSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
  },
  email: { type: String, required: true },
  token: { type: String, default: () => crypto.randomUUID() },
  used: { type: Boolean, default: false },
  expiry_date: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IInvitation>("Invitation", InvitationSchema);
