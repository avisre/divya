import mongoose from "mongoose";
import crypto from "crypto";

const prayerSchema = new mongoose.Schema(
  {
    deity: { type: mongoose.Schema.Types.ObjectId, ref: "Deity", required: true },
    title: {
      en: { type: String, required: true },
      ml: String,
      sa: String
    },
    slug: { type: String, required: true, unique: true },
    externalId: { type: String, unique: true, sparse: true },
    type: {
      type: String,
      enum: ["mantra", "stotram", "stotra", "aarti", "chalisa", "vandana", "bhajan", "shloka", "prayer"],
      default: "prayer"
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    durationMinutes: { type: Number, default: 5 },
    plainStory: String,
    wordGlossary: [
      new mongoose.Schema(
        {
          word: { type: String, required: true },
          transliteration: String,
          meaning: String
        },
        { _id: false }
      )
    ],
    familyContext: String,
    beginnerTip: String,
    nriRelevance: String,
    verseCount: { type: Number, default: 0 },
    verses: [
      new mongoose.Schema(
        {
          number: { type: Number, required: true },
          type: String,
          script: String,
          iast: String,
          meaning: String,
          audioStartSec: Number,
          nameDevanagari: String,
          nameIast: String,
          meaningWordByWord: String,
          meaningSummary: String
        },
        { _id: false }
      )
    ],
    xpReward: { type: Number, default: 2 },
    firstLinePreview: String,
    transliteration: String,
    content: {
      devanagari: String,
      malayalam: String,
      english: String
    },
    iast: String,
    beginnerNote: String,
    meaning: String,
    audioUrl: { type: String, default: null },
    verseTimings: [
      {
        lineIndex: { type: Number, required: true },
        startMs: { type: Number, required: true },
        endMs: { type: Number, required: true }
      }
    ],
    audioChecksumSha256: String,
    audioCodec: String,
    audioLicenseTag: { type: String, default: "licensed_devotional" },
    contentVersion: { type: Number, default: 1 },
    contentChecksum: String,
    requiredTier: { type: String, enum: ["free", "bhakt", "seva"], default: "free" },
    coverImageUrl: String,
    recommendedRepetitions: [{ type: Number }],
    isPremium: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

function buildContentChecksum(prayerDoc) {
  const payload = {
    title: prayerDoc.title,
    transliteration: prayerDoc.transliteration,
    iast: prayerDoc.iast,
    content: prayerDoc.content,
    meaning: prayerDoc.meaning,
    durationMinutes: prayerDoc.durationMinutes,
    plainStory: prayerDoc.plainStory,
    wordGlossary: prayerDoc.wordGlossary,
    familyContext: prayerDoc.familyContext,
    beginnerTip: prayerDoc.beginnerTip,
    nriRelevance: prayerDoc.nriRelevance,
    verseCount: prayerDoc.verseCount,
    verses: prayerDoc.verses,
    xpReward: prayerDoc.xpReward,
    firstLinePreview: prayerDoc.firstLinePreview
  };
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

prayerSchema.pre("save", function prayerBeforeSave(next) {
  this.contentChecksum = buildContentChecksum(this);
  if (!this.requiredTier) {
    const order = Number(this.order || 0);
    this.requiredTier = order <= 10 ? "free" : order <= 54 ? "bhakt" : "seva";
  }
  if (!this.externalId) {
    const order = Number(this.order || 0);
    if (order > 0) {
      this.externalId = `prayer-${order}`;
    }
  }
  next();
});

export const Prayer = mongoose.model("Prayer", prayerSchema);
