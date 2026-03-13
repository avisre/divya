import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Prayer } from "../src/models/Prayer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioBySlug = {
  "mahishasura-mardini": "mahishasura_mardini_stotram",
  "navarna-mantra": "navarna_mantra",
  "ya-devi-sarvabhuteshu": "ya_devi_sarvabhuteshu",
  "kerala-bhagavathi-stuti": "kerala_bhagavathi_stuti",
  "lalitha-sahasranama-108": "lalitha_sahasranama_108",
  "gayatri-mantra": "gayatri_mantra",
  "ganesh-aarti": "ganesh_aarti",
  "hanuman-chalisa": "hanuman_chalisa",
  "maha-mrityunjaya": "maha_mrityunjaya",
  "lakshmi-aarti": "lakshmi_aarti",
  "saraswati-vandana": "saraswati_vandana",
  "shiva-panchakshara": "shiva_panchakshara",
  "om-namah-shivaya": "om_namah_shivaya",
  "durga-chalisa": "durga_chalisa",
  "krishna-aarti": "krishna_aarti",
  "surya-mantra": "surya_mantra",
  "shanti-mantra": "shanti_mantra",
  "vishnu-sahasranama-108": "vishnu_sahasranama_108",
  "pratah-smaranam": "morning_prayer",
  "nirvana-shatakam": "nirvana_shatakam"
};

const rawDirCandidates = [
  path.resolve(__dirname, "../../androidApp/src/main/res/raw"),
  path.resolve(__dirname, "../../../androidApp/src/main/res/raw"),
  path.resolve(process.cwd(), "../androidApp/src/main/res/raw"),
  path.resolve(process.cwd(), "androidApp/src/main/res/raw")
];

function findRawDir() {
  for (const dir of rawDirCandidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  const rawDir = findRawDir();
  if (!rawDir) {
    throw new Error("androidApp raw audio directory not found");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let updated = 0;
  let skipped = 0;
  let missingPrayer = 0;
  let missingAsset = 0;

  for (const [slug, resource] of Object.entries(audioBySlug)) {
    const assetPath = path.join(rawDir, `${resource}.mp3`);
    if (!fs.existsSync(assetPath)) {
      missingAsset += 1;
      console.warn(`[missing-asset] ${resource}.mp3`);
      continue;
    }
    const prayer = await Prayer.findOne({ slug }).select("_id slug audioUrl");
    if (!prayer) {
      missingPrayer += 1;
      console.warn(`[missing-prayer] ${slug}`);
      continue;
    }
    const expected = `raw://${resource}`;
    if (prayer.audioUrl === expected) {
      skipped += 1;
      continue;
    }
    const result = await Prayer.updateOne(
      { _id: prayer._id },
      {
        $set: {
          audioUrl: expected,
          audioCodec: "audio/mpeg",
          audioLicenseTag: "licensed_devotional"
        }
      }
    );
    if (result.modifiedCount > 0) {
      updated += 1;
    } else {
      skipped += 1;
    }
  }

  const totalWithAudio = await Prayer.countDocuments({ audioUrl: { $ne: null } });
  const total = await Prayer.countDocuments();
  console.log(`sync:audio complete`);
  console.log(`- updated: ${updated}`);
  console.log(`- skipped: ${skipped}`);
  console.log(`- missing prayer rows: ${missingPrayer}`);
  console.log(`- missing audio assets: ${missingAsset}`);
  console.log(`- prayers with audio: ${totalWithAudio}/${total}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
