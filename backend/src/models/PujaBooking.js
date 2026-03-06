import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "waitlist_confirmed",
        "date_assigned",
        "in_progress",
        "video_ready",
        "payment_failed",
        "reminder"
      ]
    },
    channel: { type: String, enum: ["push", "email", "both"] },
    sentAt: Date,
    success: Boolean
  },
  { _id: false }
);

const giftDetailsSchema = new mongoose.Schema(
  {
    isGift: { type: Boolean, default: false },
    giftedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipientName: String,
    recipientEmail: String,
    recipientPhone: String,
    personalMessage: { type: String, maxlength: 200 },
    giftOccasion: {
      type: String,
      enum: ["birthday", "anniversary", "health", "new_home", "new_job", "general_blessing"]
    },
    notificationSent: { type: Boolean, default: false },
    notificationSentAt: Date
  },
  { _id: false }
);

const pujaBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  puja: { type: mongoose.Schema.Types.ObjectId, ref: "Puja", required: true },
  temple: { type: mongoose.Schema.Types.ObjectId, ref: "Temple", required: true },
  bookingReference: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["waitlisted", "confirmed", "in_progress", "completed", "video_ready", "cancelled"],
    default: "waitlisted"
  },
  devoteeName: { type: String, required: true },
  gothram: { type: String, default: "Kashyap" },
  nakshatra: String,
  nakshatraCalculated: Boolean,
  birthDate: Date,
  rashi: String,
  prayerIntention: { type: String, minlength: 10, maxlength: 500 },
  intentionFiltered: Boolean,
  requestedDateRange: {
    start: Date,
    end: Date
  },
  scheduledDate: Date,
  scheduledTimeIST: String,
  waitlistPosition: Number,
  amount: Number,
  currency: String,
  presentedAmount: Number,
  presentedCurrency: String,
  settlementCurrency: { type: String, default: "USD" },
  idempotencyKey: String,
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  stripePaymentIntentId: String,
  stripeCustomerId: String,
  chargedAt: Date,
  cloudinaryPublicId: String,
  videoStorageId: String,
  videoMimeType: String,
  videoFileName: String,
  videoShareToken: String,
  videoShareUrl: String,
  videoThumbnailUrl: String,
  videoDuration: Number,
  videoUploadedAt: Date,
  videoWatchedAt: Date,
  videoWatchCount: { type: Number, default: 0 },
  adminNotes: String,
  videoUploadedBy: String,
  giftDetails: giftDetailsSchema,
  notifications: [notificationSchema],
  createdAt: { type: Date, default: Date.now }
});

pujaBookingSchema.index(
  { user: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } }
  }
);

export const PujaBooking = mongoose.model("PujaBooking", pujaBookingSchema);
