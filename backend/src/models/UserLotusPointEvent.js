import mongoose from "mongoose";

const userLotusPointEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  actionType: {
    type: String,
    enum: [
      "PRAYER_OPENED",
      "PRAYER_COMPLETED",
      "MODULE_READ",
      "FAMILY_SESSION",
      "BOOKING_MADE",
      "FIRST_PRAYER",
      "DEITY_PATH_COMPLETE",
      "MILESTONE_BONUS"
    ],
    required: true
  },
  points: { type: Number, required: true },
  earnedAt: { type: Date, default: Date.now, index: true },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  uniqueKey: { type: String, default: null }
});

userLotusPointEventSchema.index(
  { user: 1, uniqueKey: 1 },
  {
    unique: true,
    partialFilterExpression: { uniqueKey: { $type: "string" } }
  }
);

export const UserLotusPointEvent = mongoose.model("UserLotusPointEvent", userLotusPointEventSchema);
