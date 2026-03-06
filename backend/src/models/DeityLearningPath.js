import mongoose from "mongoose";

const learningModuleSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["story", "mantra_deep_dive", "ritual_explanation", "symbolism"],
      required: true
    },
    content: { type: String, required: true },
    keyTakeaway: { type: String, required: true },
    linkedPrayer: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer" },
    readTime: { type: Number, default: 5 },
    isLocked: { type: Boolean, default: false }
  },
  { _id: true }
);

const deityLearningPathSchema = new mongoose.Schema({
  deity: { type: mongoose.Schema.Types.ObjectId, ref: "Deity", required: true, unique: true },
  modules: [learningModuleSchema],
  totalModules: { type: Number, default: 0 },
  completionBadge: { type: String, required: true }
});

export const DeityLearningPath = mongoose.model("DeityLearningPath", deityLearningPathSchema);
