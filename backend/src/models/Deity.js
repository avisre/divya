import mongoose from "mongoose";

const deitySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ml: { type: String },
    sa: { type: String }
  },
  slug: { type: String, required: true, unique: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  pronunciationGuide: String,
  tradition: { type: String, required: true },
  iconUrl: String,
  imageUrl: String,
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

export const Deity = mongoose.model("Deity", deitySchema);

