import mongoose from "mongoose";

const onboardingSchema = new mongoose.Schema(
  {
    prayerFrequency: {
      type: String,
      enum: ["daily", "sometimes", "rarely", "exploring"]
    },
    purpose: {
      type: String,
      enum: ["roots", "learn", "book_pujas", "daily_practice"]
    },
    tradition: {
      type: String,
      enum: ["vaishnava", "shaiva", "shakta", "smarta", "not_sure"],
      default: "shakta"
    },
    completedAt: Date
  },
  { _id: false }
);

const prayerReminderSchema = new mongoose.Schema(
  {
    morningEnabled: { type: Boolean, default: true },
    morningTime: { type: String, default: "07:00" },
    eveningEnabled: { type: Boolean, default: true },
    eveningTime: { type: String, default: "19:00" },
    festivalAlerts: { type: Boolean, default: true }
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: ["free", "bhakt", "seva"],
      default: "free"
    },
    revenueCatId: String,
    expiresAt: Date,
    platform: {
      type: String,
      enum: ["ios", "android"]
    }
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastPrayedAt: Date,
    totalDaysEver: { type: Number, default: 0 },
    milestones: [
      new mongoose.Schema(
        {
          days: Number,
          achievedAt: Date,
          certificateUrl: String
        },
        { _id: true }
      )
    ],
    graceUsed: { type: Boolean, default: false },
    graceUsedAt: Date
  },
  { _id: false }
);

const completedPrayerSchema = new mongoose.Schema(
  {
    prayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer" },
    completedAt: Date,
    durationSeconds: Number
  },
  { _id: false }
);

const deviceTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    platform: { type: String, enum: ["android", "ios", "web"], default: "android" },
    appVersion: String,
    locale: String,
    lastSeenAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const learningProgressSchema = new mongoose.Schema(
  {
    deityId: { type: mongoose.Schema.Types.ObjectId, ref: "Deity", required: true },
    completedModules: [{ type: Number }],
    lastAccessedAt: Date
  },
  { _id: false }
);

const sharedSessionSummarySchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "PrayerSession", required: true },
    prayerName: String,
    participantNames: [String],
    completedAt: Date
  },
  { _id: false }
);

const oauthAccountSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true }
  },
  { _id: false }
);

const audioComingSoonSubscriptionSchema = new mongoose.Schema(
  {
    prayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer", required: true },
    subscribedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profilePicture: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  country: { type: String, default: "US" },
  timezone: { type: String, trim: true },
  currency: { type: String, default: "USD" },
  onboarding: onboardingSchema,
  preferredDeity: { type: mongoose.Schema.Types.ObjectId, ref: "Deity" },
  preferredLanguage: {
    type: String,
    enum: [
      "english",
      "hindi",
      "sanskrit",
      "malayalam",
      "tamil",
      "telugu",
      "gujarati",
      "bengali"
    ],
    default: "english"
  },
  prayerReminders: prayerReminderSchema,
  subscription: subscriptionSchema,
  streak: streakSchema,
  isGuest: { type: Boolean, default: false },
  sessionsBeforeSignup: { type: Number, default: 0 },
  favoritePrayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prayer" }],
  completedPrayers: [completedPrayerSchema],
  deviceTokens: [deviceTokenSchema],
  learningProgress: [learningProgressSchema],
  sharedSessions: [sharedSessionSummarySchema],
  oauth: {
    google: oauthAccountSchema,
    github: oauthAccountSchema
  },
  giftsGiven: [{ type: mongoose.Schema.Types.ObjectId, ref: "PujaBooking" }],
  giftsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "PujaBooking" }],
  audioComingSoonSubscriptions: [audioComingSoonSubscriptionSchema],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
