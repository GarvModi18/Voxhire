// invitation.ts
import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IInvitation extends Document {
  interviewSessionId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  used: boolean;
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
});

export default mongoose.model<IInvitation>("Invitation", InvitationSchema);
