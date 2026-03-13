import mongoose from "mongoose";

const pujaSchema = new mongoose.Schema({
  temple: { type: mongoose.Schema.Types.ObjectId, ref: "Temple", required: true },
  deity: { type: mongoose.Schema.Types.ObjectId, ref: "Deity", required: true },
  name: {
    en: { type: String, required: true },
    ml: { type: String, required: true },
    sa: String
  },
  slug: { type: String, unique: true, sparse: true },
  type: {
    type: String,
    enum: ["abhishekam", "archana", "homa", "special_seva", "deeparadhana", "kalasha_puja"],
    required: true
  },
  description: {
    short: String,
    full: String,
    whatHappens: String,
    nriNote: String
  },
  duration: Number,
  pricing: {
    usd: Number,
    gbp: Number,
    cad: Number,
    aud: Number,
    aed: Number
  },
  benefits: [String],
  bestFor: [String],
  requirements: [String],
  isWaitlistOnly: { type: Boolean, default: true },
  waitlistCount: { type: Number, default: 0 },
  estimatedWaitWeeks: { type: Number, default: 4 },
  videoDelivered: { type: Boolean, default: true },
  videoNote: String,
  prasadAvailable: { type: Boolean, default: false },
  prasadNote: { type: String, default: "Prasad delivery - Coming Soon 🙏" },
  order: Number,
  isActive: { type: Boolean, default: true }
});

export const Puja = mongoose.model("Puja", pujaSchema);
