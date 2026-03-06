import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date,
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const prayerSessionSchema = new mongoose.Schema({
  hostUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [participantSchema],
  prayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer", required: true },
  sessionCode: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["waiting", "active", "completed"],
    default: "waiting"
  },
  startedAt: Date,
  completedAt: Date,
  currentVerseIndex: { type: Number, default: 0 },
  currentRepetition: { type: Number, default: 0 },
  totalRepetitions: { type: Number, default: 21 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

prayerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PrayerSession = mongoose.model("PrayerSession", prayerSessionSchema);
