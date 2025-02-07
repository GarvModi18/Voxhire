// uploadedFiles.ts
//Admin will upload pdf file for credential creation
import mongoose, { Schema, Document } from "mongoose";

export interface IUploadedFile extends Document {
  admin_id: mongoose.Types.ObjectId;
  file_name: string;
  file_url: string;
  processed_status: "Pending" | "Processed";
}

const UploadedFileSchema: Schema = new Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  file_name: { type: String, required: true },
  file_url: { type: String, required: true },
  processed_status: {
    type: String,
    enum: ["Pending", "Processed"],
    default: "Pending",
  },
});

export default mongoose.model<IUploadedFile>(
  "UploadedFile",
  UploadedFileSchema
);
