import mongoose from "mongoose";

const crashReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  platform: { type: String, default: "android" },
  appVersion: String,
  message: { type: String, required: true },
  stackTrace: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export const CrashReport = mongoose.model("CrashReport", crashReportSchema);
