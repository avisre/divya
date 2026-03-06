import mongoose from "mongoose";

const festivalPrepStepSchema = new mongoose.Schema(
  {
    daysBefore: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    prayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prayer" }],
    diasporaNote: String
  },
  { _id: false }
);

const festivalDayRitualSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    ritual: { type: String, required: true },
    prayer: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer" },
    duration: Number
  },
  { _id: false }
);

const festivalSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ml: String,
    sa: String
  },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  significance: { type: String, required: true },
  keralaNote: String,
  monthHint: String,
  startDate: Date,
  preparationDays: { type: Number, default: 0 },
  prepJourney: [festivalPrepStepSchema],
  dayOfRituals: [festivalDayRitualSchema],
  communityNote: String,
  featuredPrayer: { type: mongoose.Schema.Types.ObjectId, ref: "Prayer" },
  deity: { type: mongoose.Schema.Types.ObjectId, ref: "Deity" }
});

export const Festival = mongoose.model("Festival", festivalSchema);
