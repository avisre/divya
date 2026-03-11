import mongoose from "mongoose";

const contactContextSchema = new mongoose.Schema(
  {
    appVersion: String,
    platform: String,
    screen: String,
    bookingReference: String
  },
  { _id: false }
);

const contactRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    country: { type: String, trim: true, maxlength: 80 },
    timezone: { type: String, trim: true, maxlength: 80 },
    category: {
      type: String,
      enum: ["booking_help", "gothram_help", "technical_issue", "video_help", "general"],
      default: "general"
    },
    subject: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    message: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
    context: { type: contactContextSchema, default: undefined },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved"],
      default: "open"
    }
  },
  {
    timestamps: true
  }
);

contactRequestSchema.index({ status: 1, createdAt: -1 });
contactRequestSchema.index({ email: 1, createdAt: -1 });

export const ContactRequest = mongoose.model("ContactRequest", contactRequestSchema);
