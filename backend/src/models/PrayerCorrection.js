import mongoose from "mongoose";

const prayerCorrectionSchema = new mongoose.Schema(
  {
    prayer: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    category: {
      type: String,
      enum: ["text", "transliteration", "meaning", "audio_metadata", "other"],
      default: "text"
    },
    currentText: String,
    suggestedText: { type: String, required: true, minlength: 4, maxlength: 4000 },
    note: String,
    moderationNote: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date
  },
  { timestamps: true }
);

export const PrayerCorrection = mongoose.model("PrayerCorrection", prayerCorrectionSchema);
