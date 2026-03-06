import { UserProgress } from "../models/UserProgress.js";
import { ContactRequest } from "../models/ContactRequest.js";
import { generateMilestoneCertificateUrl } from "../utils/generateCertificate.js";
import { sendContactRequestAlertEmail } from "../utils/email.js";
import { createValidationError } from "../utils/ApiError.js";

const STREAK_MILESTONES = [7, 21, 108, 365];

function timezoneDateKey(value, timezone) {
  const date = value instanceof Date ? value : new Date(value);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(date);
}

function diffInTimezoneDays(fromDate, toDate, timezone) {
  const fromKey = timezoneDateKey(fromDate, timezone);
  const toKey = timezoneDateKey(toDate, timezone);
  const from = new Date(`${fromKey}T00:00:00.000Z`);
  const to = new Date(`${toKey}T00:00:00.000Z`);
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

function streakMessage(days) {
  if (days === 7) return "7 Days of Devotion";
  if (days === 21) return "21 Days — A Sacred Habit";
  if (days === 108) return "108 Days — The Sacred Number";
  if (days === 365) return "One Full Year of Prayer";
  return `${days}-day devotion milestone reached`;
}

function normalizeId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

const CONTACT_CATEGORIES = new Set([
  "booking_help",
  "gothram_help",
  "technical_issue",
  "feature_request",
  "other"
]);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export async function getProfile(req, res) {
  return res.json(req.user);
}

export async function updateProfile(req, res, next) {
  try {
    const fields = ["name", "country", "timezone", "currency", "preferredLanguage", "prayerReminders"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });
    await req.user.save();
    return res.json(req.user);
  } catch (error) {
    next(error);
  }
}

export async function updateTimezone(req, res, next) {
  try {
    req.user.timezone = req.body.timezone;
    await req.user.save();
    return res.json(req.user);
  } catch (error) {
    next(error);
  }
}

export async function saveOnboarding(req, res, next) {
  try {
    req.user.onboarding = {
      prayerFrequency: req.body.prayerFrequency,
      purpose: req.body.purpose,
      tradition: req.body.tradition,
      completedAt: new Date()
    };
    await req.user.save();
    return res.json(req.user.onboarding);
  } catch (error) {
    next(error);
  }
}

export async function prayerComplete(req, res, next) {
  try {
    const durationSeconds = Number(req.body.durationSeconds || 0);
    req.user.completedPrayers.push({
      prayerId: req.body.prayerId,
      completedAt: new Date(),
      durationSeconds
    });

    const now = new Date();
    const timezone = req.user.timezone || "America/New_York";
    const lastPrayedAt = req.user.streak.lastPrayedAt;
    const dayDiff = lastPrayedAt ? diffInTimezoneDays(lastPrayedAt, now, timezone) : null;
    const tier = req.user.subscription?.tier || "free";

    let graceApplied = false;
    let newPrayerDay = false;

    if (!lastPrayedAt) {
      req.user.streak.current = 1;
      req.user.streak.graceUsed = false;
      req.user.streak.graceUsedAt = undefined;
      newPrayerDay = true;
    } else if (dayDiff === 0) {
      newPrayerDay = false;
    } else if (dayDiff === 1) {
      req.user.streak.current += 1;
      newPrayerDay = true;
    } else if (dayDiff === 2 && !req.user.streak.graceUsed && tier !== "free") {
      req.user.streak.current += 1;
      req.user.streak.graceUsed = true;
      req.user.streak.graceUsedAt = now;
      graceApplied = true;
      newPrayerDay = true;
    } else {
      req.user.streak.current = 1;
      req.user.streak.graceUsed = false;
      req.user.streak.graceUsedAt = undefined;
      newPrayerDay = true;
    }

    if (newPrayerDay) {
      req.user.streak.totalDaysEver = Number(req.user.streak.totalDaysEver || 0) + 1;
      req.user.streak.lastPrayedAt = now;
      req.user.streak.longest = Math.max(req.user.streak.longest || 0, req.user.streak.current || 0);
    }

    const achievedDays = new Set((req.user.streak.milestones || []).map((entry) => Number(entry.days)));
    const reachedNow = STREAK_MILESTONES.filter(
      (days) => (req.user.streak.current || 0) >= days && !achievedDays.has(days)
    );

    let milestoneReached = null;
    reachedNow.forEach((days) => {
      const certificateUrl =
        days >= 108
          ? generateMilestoneCertificateUrl({
              userName: req.user.name,
              days,
              achievedAt: now
            })
          : undefined;
      req.user.streak.milestones.push({
        days,
        achievedAt: now,
        certificateUrl
      });
      milestoneReached = {
        days,
        message: streakMessage(days),
        certificateUrl: certificateUrl || null
      };
    });

    await req.user.save();
    await UserProgress.findOneAndUpdate(
      { user: req.user._id },
      {
        $inc: { prayersCompleted: 1, minutesPrayed: Math.ceil(durationSeconds / 60) },
        streakDays: req.user.streak.current,
        longestStreakDays: req.user.streak.longest,
        lastPrayerAt: now,
        updatedAt: now
      },
      { upsert: true }
    );

    return res.json({
      streak: req.user.streak,
      graceApplied,
      milestoneReached
    });
  } catch (error) {
    next(error);
  }
}

export async function getStreak(req, res) {
  return res.json(req.user.streak);
}

export async function useStreakGrace(req, res, next) {
  try {
    const tier = req.user.subscription?.tier || "free";
    if (tier === "free") {
      return res.status(402).json({ message: "Streak grace is available on Bhakt and Seva plans." });
    }
    if (req.user.streak.graceUsed) {
      return res.status(409).json({ message: "Grace has already been used for this streak." });
    }
    req.user.streak.graceUsed = true;
    req.user.streak.graceUsedAt = new Date();
    await req.user.save();
    return res.json({ success: true, streak: req.user.streak });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const progress = await UserProgress.findOne({ user: req.user._id });
    return res.json(progress || { prayersCompleted: 0, minutesPrayed: 0, streakDays: 0 });
  } catch (error) {
    next(error);
  }
}

export async function submitContactRequest(req, res, next) {
  try {
    const name = String(req.body?.name || req.user?.name || "").trim();
    const email = String(req.body?.email || req.user?.email || "").trim().toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();
    const category = String(req.body?.category || "other").trim().toLowerCase();
    const bookingReference = req.body?.context?.bookingReference
      ? String(req.body.context.bookingReference).trim()
      : undefined;

    if (name.length < 2 || name.length > 80) {
      throw createValidationError("name must be between 2 and 80 characters");
    }
    if (!isValidEmail(email) || email.length > 160) {
      throw createValidationError("email is invalid");
    }
    if (subject.length < 5 || subject.length > 120) {
      throw createValidationError("subject must be between 5 and 120 characters");
    }
    if (message.length < 20 || message.length > 2000) {
      throw createValidationError("message must be between 20 and 2000 characters");
    }
    if (!CONTACT_CATEGORIES.has(category)) {
      throw createValidationError("category is invalid");
    }

    const contactRequest = await ContactRequest.create({
      user: req.user?._id,
      name,
      email,
      country: req.body?.country || req.user?.country,
      timezone: req.body?.timezone || req.user?.timezone,
      category,
      subject,
      message,
      context: {
        appVersion: req.body?.context?.appVersion,
        platform: req.body?.context?.platform || "android",
        screen: req.body?.context?.screen || "profile-contact",
        bookingReference
      },
      status: "open"
    });

    await sendContactRequestAlertEmail({
      contactRequest: {
        id: normalizeId(contactRequest._id),
        name: contactRequest.name,
        email: contactRequest.email,
        category: contactRequest.category,
        subject: contactRequest.subject,
        message: contactRequest.message,
        status: contactRequest.status,
        context: contactRequest.context || {}
      }
    });

    return res.status(201).json({
      success: true,
      requestId: normalizeId(contactRequest._id),
      status: contactRequest.status
    });
  } catch (error) {
    next(error);
  }
}

export async function registerDevice(req, res, next) {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ message: "Device token is required" });
    }

    const existing = req.user.deviceTokens.find((entry) => entry.token === token);
    if (existing) {
      existing.platform = req.body.platform || existing.platform;
      existing.appVersion = req.body.appVersion || existing.appVersion;
      existing.locale = req.body.locale || existing.locale;
      existing.lastSeenAt = new Date();
    } else {
      req.user.deviceTokens.push({
        token,
        platform: req.body.platform || "android",
        appVersion: req.body.appVersion,
        locale: req.body.locale,
        lastSeenAt: new Date()
      });
    }

    await req.user.save();
    return res.json({ success: true, devices: req.user.deviceTokens.length });
  } catch (error) {
    next(error);
  }
}

export async function getLearningProgress(req, res) {
  return res.json(req.user.learningProgress || []);
}

export async function getUserPrayerSessions(req, res) {
  const sessions = [...(req.user.sharedSessions || [])].sort((a, b) => {
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bTime - aTime;
  });
  return res.json(sessions);
}

export async function getCertificate(req, res, next) {
  try {
    const milestone = req.user.streak.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone certificate not found" });
    }

    if (!milestone.certificateUrl) {
      milestone.certificateUrl = generateMilestoneCertificateUrl({
        userName: req.user.name,
        days: milestone.days,
        achievedAt: milestone.achievedAt
      });
      await req.user.save();
    }

    return res.json({
      milestoneId: normalizeId(milestone._id),
      days: milestone.days,
      achievedAt: milestone.achievedAt,
      certificateUrl: milestone.certificateUrl
    });
  } catch (error) {
    next(error);
  }
}
