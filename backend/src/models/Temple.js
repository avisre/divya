import mongoose from "mongoose";

const pujaTimingSchema = new mongoose.Schema(
  {
    name: String,
    nameML: String,
    timeIST: String,
    description: String
  },
  { _id: false }
);

const templeSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ml: { type: String, required: true },
    sa: { type: String, required: true }
  },
  deity: { type: mongoose.Schema.Types.ObjectId, ref: "Deity", required: true },
  shortDescription: String,
  fullDescription: String,
  significance: String,
  tradition: { type: String, default: "Kerala Tantric Agama" },
  location: {
    city: { type: String, default: "Karunagapally" },
    district: { type: String, default: "Kollam" },
    state: { type: String, default: "Kerala" },
    country: { type: String, default: "India" },
    coordinates: {
      lat: { type: Number, default: 9.0167 },
      lng: { type: Number, default: 76.5333 }
    }
  },
  images: [String],
  heroImage: String,
  timings: {
    pujas: [pujaTimingSchema]
  },
  liveStreamUrl: String,
  isActive: { type: Boolean, default: true },
  nriNote: String,
  panchangLocation: {
    lat: { type: Number, default: 9.0167 },
    lng: { type: Number, default: 76.5333 },
    timezone: { type: String, default: "Asia/Kolkata" }
  }
});

export const Temple = mongoose.model("Temple", templeSchema);

