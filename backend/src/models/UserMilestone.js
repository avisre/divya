import mongoose from "mongoose";

const userMilestoneSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  milestoneKey: {
    type: String,
    enum: [
      "FIRST_STEP",
      "FAMILY_BOND",
      "SEVEN_DAY_RHYTHM",
      "SCRIPTURE_READER",
      "WORD_EXPLORER",
      "FIRST_BOOKING",
      "LEARNING_COMPLETE",
      "FAMILY_TEACHER",
      "DEEP_PRACTICE",
      "HUNDRED_LOTUS"
    ],
    required: true
  },
  earnedAt: { type: Date, default: Date.now },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

userMilestoneSchema.index({ user: 1, milestoneKey: 1 }, { unique: true });

export const UserMilestone = mongoose.model("UserMilestone", userMilestoneSchema);
