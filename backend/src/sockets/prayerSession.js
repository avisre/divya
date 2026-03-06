import jwt from "jsonwebtoken";
import { PrayerSession } from "../models/PrayerSession.js";
import { User } from "../models/User.js";

function normalizeId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

function roomName(sessionCode) {
  return `prayer:${sessionCode}`;
}

async function resolveSocketUser(socket) {
  const token = socket.handshake.auth?.token;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("_id name");
    return user || null;
  } catch {
    return null;
  }
}

export function initPrayerSessionSocket(io) {
  io.on("connection", async (socket) => {
    const user = await resolveSocketUser(socket);

    socket.on("join_session", async (payload, callback) => {
      try {
        const sessionCode = payload?.sessionCode;
        if (!sessionCode) {
          callback?.({ ok: false, message: "sessionCode is required" });
          return;
        }

        const session = await PrayerSession.findOne({ sessionCode });
        if (!session) {
          callback?.({ ok: false, message: "Session not found" });
          return;
        }

        const resolvedUserId = normalizeId(user?._id || payload?.userId);
        const resolvedName = user?.name || payload?.name || "Participant";
        if (!resolvedUserId) {
          callback?.({ ok: false, message: "userId is required" });
          return;
        }

        const existing = session.participants.find(
          (entry) => normalizeId(entry.userId) === normalizeId(resolvedUserId)
        );
        if (existing) {
          existing.isActive = true;
          existing.leftAt = undefined;
        } else {
          session.participants.push({
            userId: resolvedUserId,
            name: resolvedName,
            joinedAt: new Date(),
            isActive: true
          });
        }

        await session.save();
        socket.join(roomName(sessionCode));
        socket.data.sessionCode = sessionCode;
        socket.data.userId = resolvedUserId;
        socket.data.userName = resolvedName;

        io.to(roomName(sessionCode)).emit("participant_joined", {
          userId: resolvedUserId,
          name: resolvedName,
          participantCount: session.participants.filter((entry) => entry.isActive).length
        });

        callback?.({
          ok: true,
          session: {
            sessionCode: session.sessionCode,
            status: session.status,
            prayerId: session.prayerId,
            currentVerseIndex: session.currentVerseIndex,
            currentRepetition: session.currentRepetition,
            totalRepetitions: session.totalRepetitions
          }
        });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("start_session", async (payload, callback) => {
      try {
        const session = await PrayerSession.findOne({ sessionCode: payload?.sessionCode });
        if (!session) {
          callback?.({ ok: false, message: "Session not found" });
          return;
        }
        if (normalizeId(session.hostUserId) !== normalizeId(socket.data.userId)) {
          callback?.({ ok: false, message: "Only host can start session" });
          return;
        }

        session.status = "active";
        session.startedAt = new Date();
        session.totalRepetitions = Number(payload?.totalRepetitions || session.totalRepetitions || 21);
        await session.save();

        io.to(roomName(session.sessionCode)).emit("session_started", {
          prayerId: session.prayerId,
          totalReps: session.totalRepetitions
        });
        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("verse_advance", async (payload, callback) => {
      try {
        const session = await PrayerSession.findOne({ sessionCode: payload?.sessionCode });
        if (!session) {
          callback?.({ ok: false, message: "Session not found" });
          return;
        }
        if (normalizeId(session.hostUserId) !== normalizeId(socket.data.userId)) {
          callback?.({ ok: false, message: "Only host can change verses" });
          return;
        }

        session.currentVerseIndex = Number(payload?.verseIndex || 0);
        await session.save();
        io.to(roomName(session.sessionCode)).emit("verse_changed", { verseIndex: session.currentVerseIndex });
        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("rep_complete", async (payload, callback) => {
      try {
        const session = await PrayerSession.findOne({ sessionCode: payload?.sessionCode });
        if (!session) {
          callback?.({ ok: false, message: "Session not found" });
          return;
        }
        session.currentRepetition = Math.min(
          Number(session.totalRepetitions || 0),
          Number(session.currentRepetition || 0) + 1
        );
        await session.save();
        io.to(roomName(session.sessionCode)).emit("rep_counted", {
          totalReps: session.totalRepetitions,
          completedReps: session.currentRepetition
        });
        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("end_session", async (payload, callback) => {
      try {
        const session = await PrayerSession.findOne({ sessionCode: payload?.sessionCode });
        if (!session) {
          callback?.({ ok: false, message: "Session not found" });
          return;
        }
        if (normalizeId(session.hostUserId) !== normalizeId(socket.data.userId)) {
          callback?.({ ok: false, message: "Only host can end session" });
          return;
        }

        session.status = "completed";
        session.completedAt = new Date();
        await session.save();
        io.to(roomName(session.sessionCode)).emit("session_ended", {
          totalReps: session.totalRepetitions,
          duration:
            session.startedAt && session.completedAt
              ? Math.max(0, Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000))
              : null
        });
        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("disconnect", async () => {
      const sessionCode = socket.data.sessionCode;
      const userId = socket.data.userId;
      if (!sessionCode || !userId) return;
      const session = await PrayerSession.findOne({ sessionCode });
      if (!session) return;

      const participant = session.participants.find(
        (entry) => normalizeId(entry.userId) === normalizeId(userId)
      );
      if (!participant) return;

      participant.isActive = false;
      participant.leftAt = new Date();
      await session.save();
      io.to(roomName(sessionCode)).emit("participant_left", {
        userId,
        name: participant.name
      });
    });
  });
}
