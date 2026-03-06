import "dotenv/config";
import mongoose from "mongoose";
import { Prayer } from "../src/models/Prayer.js";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requiredTier(order) {
  if (order <= 10) return "free";
  if (order <= 54) return "bhakt";
  return "seva";
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const prayers = await Prayer.find({}).sort({ order: 1, _id: 1 });
  const usedSlugs = new Set();

  let updated = 0;
  for (const prayer of prayers) {
    let nextSlug = prayer.slug || slugify(prayer.title?.en) || `prayer-${prayer.order || 0}`;
    if (!nextSlug) nextSlug = `prayer-${prayer.order || 0}`;

    let slugIndex = 2;
    const originalSlug = nextSlug;
    while (usedSlugs.has(nextSlug)) {
      nextSlug = `${originalSlug}-${slugIndex++}`;
    }
    usedSlugs.add(nextSlug);

    const updates = {};
    if (prayer.slug !== nextSlug) updates.slug = nextSlug;

    const normalizedExternalId = prayer.externalId || `prayer-${Number(prayer.order || 0)}`;
    if (prayer.externalId !== normalizedExternalId) updates.externalId = normalizedExternalId;

    const normalizedTier = requiredTier(Number(prayer.order || 0));
    if (prayer.requiredTier !== normalizedTier) updates.requiredTier = normalizedTier;

    if (Object.keys(updates).length > 0) {
      await Prayer.updateOne({ _id: prayer._id }, { $set: updates });
      updated += 1;
    }
  }

  console.log(`Normalized prayer identifiers. Updated ${updated} / ${prayers.length} prayers.`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("[normalizePrayerIds] failed:", error);
  process.exit(1);
});

