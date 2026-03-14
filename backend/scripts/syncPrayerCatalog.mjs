import "dotenv/config";
import mongoose from "mongoose";
import { Deity } from "../src/models/Deity.js";
import { Prayer } from "../src/models/Prayer.js";
import { syncAuthoritativePrayerCatalog } from "../src/seed/prayerCatalog.js";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const deities = await Deity.find({});
  const deityBySlug = Object.fromEntries(deities.map((item) => [item.slug, item]));
  const prayers = await syncAuthoritativePrayerCatalog({
    Prayer,
    deityBySlug
  });

  console.log(`Synced ${prayers.length} authoritative prayers.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});

