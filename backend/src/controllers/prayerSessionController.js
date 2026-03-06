import { PrayerSession } from "../models/PrayerSession.js";
import { Prayer } from "../models/Prayer.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

function randomCode() {
  const value = Math.floor(1000 + Math.random() * 9000);
  return `OM${value}`;
}

async function generateSessionCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomCode();
    const existing = await PrayerSession.findOne({ sessionCode: code });
    if (!existing) return code;
  }
  return `OM${Date.now().toString().slice(-6)}`;
}

function normalizeId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

async function resolvePrayerId(rawPrayerId) {
  if (!rawPrayerId) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(rawPrayerId)) {
    const prayer = await Prayer.findById(rawPrayerId).select("_id");
    if (prayer) {
      return prayer._id;
    }
  }

  const normalized = String(rawPrayerId).trim();
  if (!normalized) {
    return null;
  }

  const prayer = await Prayer.findOne({
    $or: [
      { externalId: normalized },
      { slug: normalized },
      { "title.en": normalized }
    ]
  }).select("_id");

  return prayer?._id || null;
}

export async function createPrayerSession(req, res, next) {
  try {
    if (!req.body.prayerId) {
      return res.status(400).json({ message: "prayerId is required" });
    }

    const resolvedPrayerId = await resolvePrayerId(req.body.prayerId);
    if (!resolvedPrayerId) {
      return res.status(404).json({ message: "Prayer not found for shared session." });
    }

    const sessionCode = await generateSessionCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const session = await PrayerSession.create({
      hostUserId: req.user._id,
      prayerId: resolvedPrayerId,
      sessionCode,
      totalRepetitions: Number(req.body.totalRepetitions || 21),
      participants: [
        {
          userId: req.user._id,
          name: req.user.name,
          joinedAt: new Date(),
          isActive: true
        }
      ],
      expiresAt
    });

    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

export async function getPrayerSession(req, res, next) {
  try {
    const session = await PrayerSession.findOne({ sessionCode: req.params.code })
      .populate("prayerId")
      .populate("participants.userId", "name");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    return res.json(session);
  } catch (error) {
    next(error);
  }
}

export async function joinPrayerSession(req, res, next) {
  try {
    const session = await PrayerSession.findOne({ sessionCode: req.params.code });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.status === "completed") {
      return res.status(409).json({ message: "Session already completed" });
    }

    const existing = session.participants.find((entry) => normalizeId(entry.userId) === normalizeId(req.user._id));
    if (existing) {
      existing.isActive = true;
      existing.leftAt = undefined;
    } else {
      session.participants.push({
        userId: req.user._id,
        name: req.user.name,
        joinedAt: new Date(),
        isActive: true
      });
    }

    await session.save();
    return res.json(session);
  } catch (error) {
    next(error);
  }
}

export async function endPrayerSession(req, res, next) {
  try {
    const session = await PrayerSession.findOne({ sessionCode: req.params.code }).populate("prayerId");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (normalizeId(session.hostUserId) !== normalizeId(req.user._id)) {
      return res.status(403).json({ message: "Only the host can end this session." });
    }

    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    const participantIds = session.participants.map((participant) => participant.userId);
    const participantNames = session.participants.map((participant) => participant.name);
    await User.updateMany(
      { _id: { $in: participantIds } },
      {
        $push: {
          sharedSessions: {
            sessionId: session._id,
            prayerName: session.prayerId?.title?.en || "Shared prayer",
            participantNames,
            completedAt: session.completedAt
          }
        }
      }
    );

    return res.json(session);
  } catch (error) {
    next(error);
  }
}
