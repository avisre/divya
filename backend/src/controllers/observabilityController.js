import { AppEvent } from "../models/AppEvent.js";
import { CrashReport } from "../models/CrashReport.js";
import { sloTargets } from "../config/sloTargets.js";
import { ApiError } from "../utils/ApiError.js";

export async function ingestEvent(req, res, next) {
  try {
    if (!req.body.name || typeof req.body.name !== "string") {
      throw new ApiError("VALIDATION_FAILED", "Event name is required");
    }
    const event = await AppEvent.create({
      user: req.user?._id,
      name: req.body.name,
      properties: req.body.properties || {},
      platform: req.body.platform || "android",
      appVersion: req.body.appVersion
    });

    return res.status(201).json({ id: event._id, success: true });
  } catch (error) {
    next(error);
  }
}

export async function ingestAudioTelemetryBatch(req, res, next) {
  try {
    const events = Array.isArray(req.body?.events) ? req.body.events : null;
    if (!events || events.length === 0) {
      throw new ApiError("VALIDATION_FAILED", "events[] is required");
    }
    if (events.length > 200) {
      throw new ApiError("VALIDATION_FAILED", "events[] exceeds batch size limit (200)");
    }

    const payload = events
      .filter((event) => event && typeof event.name === "string" && event.name.trim().length > 0)
      .map((event) => ({
        user: req.user?._id,
        name: event.name.trim(),
        properties: {
          ...(event.properties || {}),
          telemetryType: "audio",
          clientTimestamp: event.timestamp || null
        },
        platform: event.platform || req.body.platform || "android",
        appVersion: event.appVersion || req.body.appVersion
      }));

    if (!payload.length) {
      throw new ApiError("VALIDATION_FAILED", "No valid telemetry events in batch");
    }

    const inserted = await AppEvent.insertMany(payload, { ordered: false });
    return res.status(201).json({
      success: true,
      accepted: inserted.length,
      rejected: events.length - inserted.length
    });
  } catch (error) {
    next(error);
  }
}

export async function ingestCrash(req, res, next) {
  try {
    if (!req.body.message || typeof req.body.message !== "string") {
      throw new ApiError("VALIDATION_FAILED", "Crash message is required");
    }
    const crash = await CrashReport.create({
      user: req.user?._id,
      platform: req.body.platform || "android",
      appVersion: req.body.appVersion,
      message: req.body.message,
      stackTrace: req.body.stackTrace,
      metadata: req.body.metadata || {}
    });

    return res.status(201).json({ id: crash._id, success: true });
  } catch (error) {
    next(error);
  }
}

export async function getHealth(req, res, next) {
  try {
    const dbState = AppEvent.db?.readyState ?? 0;
    const uptimeSeconds = process.uptime();
    const dbReady = dbState === 1;
    return res.json({
      status: dbReady ? "ok" : "degraded",
      requestId: req.requestId || null,
      uptimeSeconds,
      services: {
        mongodb: dbReady ? "up" : "down"
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getSloTargets(req, res, next) {
  try {
    return res.json({
      requestId: req.requestId || null,
      targets: sloTargets
    });
  } catch (error) {
    next(error);
  }
}
