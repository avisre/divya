import mongoose from "mongoose";

const panchangSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  timezone: { type: String, default: "Asia/Kolkata" },
  tithi: {
    name: String,
    paksha: String,
    number: Number
  },
  nakshatra: {
    name: String,
    nameHi: String,
    deity: String,
    number: Number
  },
  sunriseUtc: String,
  sunsetUtc: String,
  rahuKaalStartUtc: String,
  rahuKaalEndUtc: String,
  festivals: [{ type: mongoose.Schema.Types.Mixed }],
  dailyGuidance: {
    overall: {
      type: String,
      enum: ["highly_auspicious", "auspicious", "neutral", "inauspicious"],
      default: "neutral"
    },
    goodFor: [{ type: String }],
    avoidFor: [{ type: String }],
    auspiciousWindow: String,
    rahuKaalWarning: String
  },
  referenceLocation: {
    lat: { type: Number, default: 9.0167 },
    lng: { type: Number, default: 76.5333 }
  },
  generatedAt: { type: Date, default: Date.now }
});

export const Panchang = mongoose.model("Panchang", panchangSchema);
