import mongoose from "mongoose";

const appEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  platform: { type: String, default: "android" },
  appVersion: String,
  createdAt: { type: Date, default: Date.now }
});

export const AppEvent = mongoose.model("AppEvent", appEventSchema);
