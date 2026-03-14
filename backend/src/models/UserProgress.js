import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  prayersCompleted: { type: Number, default: 0 },
  minutesPrayed: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  longestStreakDays: { type: Number, default: 0 },
  totalLotusPoints: { type: Number, default: 0 },
  prayersOpenedCount: { type: Number, default: 0 },
  prayersCompletedCount: { type: Number, default: 0 },
  modulesCompletedCount: { type: Number, default: 0 },
  familySessionsCount: { type: Number, default: 0 },
  lastPrayerOpenedAt: Date,
  lastOpenedPrayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer", default: null },
  lastOpenedPrayerSlug: { type: String, default: "" },
  lastPrayerAt: Date,
  pujaBookingsCount: { type: Number, default: 0 },
  videosWatched: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);
