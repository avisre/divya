import { Prayer } from "../models/Prayer.js";
import { User } from "../models/User.js";
import { PrayerCorrection } from "../models/PrayerCorrection.js";
import { getDailyPrayerForUser } from "../utils/dailyPrayerEngine.js";
import crypto from "crypto";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const AUDIO_SIGN_SECRET = process.env.AUDIO_SIGN_SECRET || process.env.JWT_SECRET || "divya-audio-sign";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_AUDIO_DIR_CANDIDATES = [
  path.resolve(__dirname, "../../androidApp/src/main/res/raw"),
  path.resolve(__dirname, "../../../androidApp/src/main/res/raw"),
  path.resolve(process.cwd(), "androidApp/src/main/res/raw"),
  path.resolve(process.cwd(), "../androidApp/src/main/res/raw"),
  path.resolve(process.cwd(), "src/main/res/raw"),
  path.resolve(process.cwd(), "public/prayers")
];

function normalizeId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tierRank(tier) {
  if (tier === "seva") return 3;
  if (tier === "bhakt") return 2;
  return 1;
}

function requiredTierForPrayer(prayer) {
  if (prayer.requiredTier) return prayer.requiredTier;
  if (prayer.isPremium) return "bhakt";
  const order = Number(prayer.order || 0);
  return order <= 10 ? "free" : order <= 54 ? "bhakt" : "seva";
}

function canAccessPrayer(prayer, user) {
  const requiredTier = requiredTierForPrayer(prayer);
  const userTier = user?.subscription?.tier || "free";
  return tierRank(userTier) >= tierRank(requiredTier);
}

function parseCodecFromUrl(audioUrl) {
  const lower = String(audioUrl || "").toLowerCase();
  if (lower.startsWith("raw://")) return "audio/mpeg";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".aac")) return "audio/aac";
  return "application/octet-stream";
}

function audioQualityLabel(prayer) {
  const minutes = Number(prayer.durationMinutes || 0);
  if (minutes >= 10) return "extended";
  if (minutes >= 5) return "high";
  return "standard";
}

function audioSourceLabel(prayer) {
  if (!prayer.audioUrl) return "coming_soon";
  if (String(prayer.audioUrl).includes("cloudinary")) return "cloudinary_hosted";
  if (String(prayer.audioUrl).startsWith("http")) return "licensed_remote";
  return "bundled_or_local";
}

function signedAudioToken({ prayerId, expiresAt }) {
  const payload = `${prayerId}|${expiresAt}`;
  return crypto.createHmac("sha256", AUDIO_SIGN_SECRET).update(payload).digest("hex");
}

function resolveAudioUrlForClient(prayer, req) {
  const audioUrl = String(prayer.audioUrl || "").trim();
  if (!audioUrl) return null;
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) return audioUrl;
  if (audioUrl.startsWith("/")) return `${req.protocol}://${req.get("host")}${audioUrl}`;
  return `${req.protocol}://${req.get("host")}/${audioUrl.replace(/^\/+/, "")}`;
}

function resolveRawAudioFile(rawResource) {
  const base = String(rawResource || "").replace(/^raw:\/\//, "").trim();
  if (!base) return null;
  const allowed = /^[a-z0-9_]+$/;
  if (!allowed.test(base)) return null;
  const extensions = [".mp3", ".ogg", ".wav", ".m4a", ".aac"];
  for (const dir of RAW_AUDIO_DIR_CANDIDATES) {
    for (const ext of extensions) {
      const candidate = path.join(dir, `${base}${ext}`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function buildAudioMetadata(prayer, user, req) {
  const requiredTier = requiredTierForPrayer(prayer);
  const entitled = canAccessPrayer(prayer, user);
  const checksum = prayer.audioChecksumSha256 || null;
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
  const sig = signedAudioToken({
    prayerId: normalizeId(prayer._id),
    expiresAt
  });
  const streamUrl = `${req.protocol}://${req.get("host")}/api/prayers/${normalizeId(prayer._id)}/audio/stream?expires=${expiresAt}&sig=${sig}`;
  const subscribed = Boolean(
    user?.audioComingSoonSubscriptions?.some(
      (entry) => normalizeId(entry.prayerId) === normalizeId(prayer._id)
    )
  );

  return {
    prayerId: normalizeId(prayer._id),
    url: prayer.audioUrl ? streamUrl : null,
    directUrl: prayer.audioUrl ? resolveAudioUrlForClient(prayer, req) : null,
    streamUrl: prayer.audioUrl ? streamUrl : null,
    codec: prayer.audioCodec || parseCodecFromUrl(prayer.audioUrl),
    durationSeconds: Number(prayer.durationMinutes || 0) * 60,
    licenseTag: prayer.audioLicenseTag || "licensed_devotional",
    qualityLabel: audioQualityLabel(prayer),
    sourceLabel: audioSourceLabel(prayer),
    checksumSha256: checksum,
    version: prayer.contentVersion || 1,
    requiredTier,
    entitled,
    audioComingSoon: !prayer.audioUrl,
    audioComingSoonSubscribed: subscribed
  };
}

function toPrayerPayload(prayerDoc, user) {
  const prayer = prayerDoc.toObject ? prayerDoc.toObject() : prayerDoc;
  return {
    ...prayer,
    id: normalizeId(prayer._id),
    requiredTier: requiredTierForPrayer(prayer),
    entitled: canAccessPrayer(prayer, user)
  };
}

function buildPrayerQuery(query) {
  const mongoQuery = {};
  if (query.deity) mongoQuery.deity = query.deity;
  if (query.type) mongoQuery.type = query.type;
  if (query.difficulty) mongoQuery.difficulty = query.difficulty;
  const durationMin = Number(query.durationMin);
  const durationMax = Number(query.durationMax);
  if (!Number.isNaN(durationMin) || !Number.isNaN(durationMax)) {
    mongoQuery.durationMinutes = {};
    if (!Number.isNaN(durationMin)) mongoQuery.durationMinutes.$gte = durationMin;
    if (!Number.isNaN(durationMax)) mongoQuery.durationMinutes.$lte = durationMax;
  }

  const q = String(query.q || "").trim();
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");
    mongoQuery.$or = [
      { "title.en": regex },
      { "title.sa": regex },
      { "title.ml": regex },
      { transliteration: regex },
      { iast: regex },
      { "content.devanagari": regex },
      { "content.english": regex },
      { tags: regex }
    ];
  }
  return mongoQuery;
}

export async function getPrayers(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const prayers = await Prayer.find(buildPrayerQuery(req.query))
      .populate("deity")
      .sort({ order: 1, "title.en": 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const payload = prayers.map((item) => toPrayerPayload(item, req.user));
    return res.json(payload);
  } catch (error) {
    next(error);
  }
}

export async function getPrayerById(req, res, next) {
  try {
    const identifier = String(req.params.id || "").trim();
    const query = mongoose.isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { slug: identifier }, { externalId: identifier }] }
      : { $or: [{ slug: identifier }, { externalId: identifier }] };
    const prayer = await Prayer.findOne(query).populate("deity");
    if (!prayer) {
      return res.status(404).json({ message: "Prayer not found" });
    }
    return res.json(toPrayerPayload(prayer, req.user));
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedPrayers(req, res, next) {
  try {
    const prayers = await Prayer.find({ isFeatured: true }).populate("deity").sort({ order: 1 }).limit(3);
    const payload = prayers.map((item) => toPrayerPayload(item, req.user));
    return res.json(payload);
  } catch (error) {
    next(error);
  }
}

export async function getDailyPrayers(req, res, next) {
  try {
    const query = {};
    if (req.user?.onboarding?.tradition === "shakta") {
      query.tags = "devi";
    }
    if (req.user?.onboarding?.prayerFrequency === "exploring") {
      query.difficulty = "beginner";
    }
    const prayers = await Prayer.find(query).populate("deity").sort({ order: 1 }).limit(5);
    const payload = prayers.map((item) => toPrayerPayload(item, req.user));
    return res.json(payload);
  } catch (error) {
    next(error);
  }
}

export async function getDailyRecommendation(req, res, next) {
  try {
    const timezone = req.query.timezone || req.user?.timezone || "America/New_York";
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const recommendation = await getDailyPrayerForUser({
      userId: req.user?._id,
      date,
      timezone
    });

    return res.json(recommendation);
  } catch (error) {
    next(error);
  }
}

export async function favoritePrayer(req, res, next) {
  try {
    if (!req.user.favoritePrayers.some((value) => value.toString() === req.params.id)) {
      req.user.favoritePrayers.push(req.params.id);
      await req.user.save();
    }
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function getFavorites(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favoritePrayers",
      populate: { path: "deity" }
    });
    const payload = user.favoritePrayers.map((item) => toPrayerPayload(item, req.user));
    return res.json(payload);
  } catch (error) {
    next(error);
  }
}

export async function getPrayerAudioMetadata(req, res, next) {
  try {
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) {
      return res.status(404).json({ message: "Prayer not found" });
    }
    const metadata = buildAudioMetadata(prayer, req.user, req);
    if (!metadata.audioComingSoon && !metadata.entitled) {
      return res.status(402).json({
        message: "Upgrade required for this prayer audio.",
        metadata
      });
    }
    return res.json(metadata);
  } catch (error) {
    next(error);
  }
}

export async function streamPrayerAudio(req, res, next) {
  try {
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer || !prayer.audioUrl) {
      return res.status(404).json({ message: "Prayer audio not found" });
    }

    const expiresAt = Number(req.query.expires || 0);
    const sig = String(req.query.sig || "");
    if (!expiresAt || !sig) {
      return res.status(400).json({ message: "Missing audio signature parameters." });
    }
    if (Date.now() / 1000 > expiresAt) {
      return res.status(401).json({ message: "Audio signature expired." });
    }

    const expected = signedAudioToken({
      prayerId: normalizeId(prayer._id),
      expiresAt
    });
    if (expected !== sig) {
      return res.status(401).json({ message: "Invalid audio signature." });
    }

    if (!canAccessPrayer(prayer, req.user)) {
      return res.status(402).json({ message: "Upgrade required for this prayer audio." });
    }

    if (String(prayer.audioUrl).startsWith("raw://")) {
      const filePath = resolveRawAudioFile(prayer.audioUrl);
      if (!filePath) {
        return res.status(404).json({ message: "Bundled prayer audio file not found." });
      }
      const ext = path.extname(filePath).toLowerCase();
      const mimeByExt = {
        ".mp3": "audio/mpeg",
        ".ogg": "audio/ogg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac"
      };
      const mime = mimeByExt[ext] || "application/octet-stream";
      res.setHeader("Content-Type", mime);
      res.setHeader("Cache-Control", "public, max-age=604800");
      return res.sendFile(filePath);
    }

    return res.redirect(prayer.audioUrl);
  } catch (error) {
    next(error);
  }
}

export async function getPrayerAvailability(req, res, next) {
  try {
    const country = String(req.query.country || req.user?.country || "US").toUpperCase();
    const language = String(req.query.language || "english").toLowerCase();
    const prayers = await Prayer.find({}).select("requiredTier order audioUrl title content").lean();
    const bundles = {
      free: prayers.filter((item) => requiredTierForPrayer(item) === "free").length,
      bhakt: prayers.filter((item) => requiredTierForPrayer(item) === "bhakt").length,
      seva: prayers.filter((item) => requiredTierForPrayer(item) === "seva").length
    };
    const languageReadyCount = prayers.filter((item) => {
      if (language === "malayalam") return Boolean(item.content?.malayalam);
      if (language === "sanskrit") return Boolean(item.content?.devanagari || item.title?.sa);
      return Boolean(item.content?.english || item.title?.en);
    }).length;

    return res.json({
      country,
      language,
      totalPrayers: prayers.length,
      languageReadyCount,
      bundles,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

export async function getPrayerEntitlements(req, res, next) {
  try {
    const userTier = req.user?.subscription?.tier || "free";
    const prayers = await Prayer.find({}).select("_id order requiredTier isPremium").lean();
    return res.json({
      userTier,
      entitlements: prayers.map((item) => {
        const requiredTier = requiredTierForPrayer(item);
        const entitled = tierRank(userTier) >= tierRank(requiredTier);
        return {
          prayerId: normalizeId(item._id),
          requiredTier,
          entitled
        };
      })
    });
  } catch (error) {
    next(error);
  }
}

export async function subscribeAudioComingSoon(req, res, next) {
  try {
    const prayer = await Prayer.findById(req.params.id).select("_id audioUrl");
    if (!prayer) {
      return res.status(404).json({ message: "Prayer not found" });
    }
    if (prayer.audioUrl) {
      return res.status(409).json({ message: "Audio is already available for this prayer." });
    }

    const subscribe = req.body?.subscribe !== false;
    const list = req.user.audioComingSoonSubscriptions || [];
    const existingIndex = list.findIndex(
      (entry) => normalizeId(entry.prayerId) === normalizeId(prayer._id)
    );
    if (subscribe && existingIndex === -1) {
      list.push({ prayerId: prayer._id, subscribedAt: new Date() });
    }
    if (!subscribe && existingIndex >= 0) {
      list.splice(existingIndex, 1);
    }
    req.user.audioComingSoonSubscriptions = list;
    await req.user.save();

    return res.json({
      success: true,
      prayerId: normalizeId(prayer._id),
      subscribed: subscribe
    });
  } catch (error) {
    next(error);
  }
}

export async function reportPrayerTextIssue(req, res, next) {
  try {
    const prayer = await Prayer.findById(req.params.id).select("_id content transliteration iast meaning");
    if (!prayer) {
      return res.status(404).json({ message: "Prayer not found" });
    }

    const suggestedText = String(req.body?.suggestedText || "").trim();
    if (suggestedText.length < 4) {
      return res.status(400).json({ message: "suggestedText is required." });
    }
    const category = String(req.body?.category || "text").toLowerCase();
    const currentText = req.body?.currentText || prayer.content?.english || prayer.meaning || "";

    const correction = await PrayerCorrection.create({
      prayer: prayer._id,
      user: req.user?._id,
      category,
      currentText,
      suggestedText,
      note: req.body?.note
    });

    return res.status(201).json({
      id: normalizeId(correction._id),
      status: correction.status,
      prayerId: normalizeId(prayer._id)
    });
  } catch (error) {
    next(error);
  }
}

export async function getPrayerCatalogVersion(req, res, next) {
  try {
    const latest = await Prayer.findOne().sort({ updatedAt: -1 }).select("updatedAt contentVersion").lean();
    const total = await Prayer.countDocuments();
    return res.json({
      totalPrayers: total,
      latestUpdatedAt: latest?.updatedAt || null,
      latestContentVersion: latest?.contentVersion || 1
    });
  } catch (error) {
    next(error);
  }
}
