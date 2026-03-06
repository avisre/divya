import "dotenv/config";
import Stripe from "stripe";
import { PujaBooking } from "../models/PujaBooking.js";
import { AppEvent } from "../models/AppEvent.js";
import { User } from "../models/User.js";
import { PrayerCorrection } from "../models/PrayerCorrection.js";
import { ContactRequest } from "../models/ContactRequest.js";
import { sendPujaDateConfirmedEmail, sendVideoReadyEmail } from "../utils/email.js";
import { queuePushNotification } from "../utils/pushNotifications.js";
import { createVideoShareToken, deleteStoredVideo, saveVideoBuffer } from "../utils/videoStore.js";
import { ApiError, createValidationError } from "../utils/ApiError.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function publicBaseUrl(req) {
  return process.env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

export async function getDashboard(req, res, next) {
  try {
    const today = new Date();
    const dayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const weekStart = new Date(dayStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

    const [statusBreakdown, todayRevenue, weekRevenue, monthRevenue, backlog, newWaitlist] = await Promise.all([
      PujaBooking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      PujaBooking.aggregate([{ $match: { chargedAt: { $gte: dayStart } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      PujaBooking.aggregate([{ $match: { chargedAt: { $gte: weekStart } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      PujaBooking.aggregate([{ $match: { chargedAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      PujaBooking.countDocuments({ status: "completed", videoStorageId: { $exists: false } }),
      PujaBooking.countDocuments({ createdAt: { $gte: dayStart }, status: "waitlisted" })
    ]);

    return res.json({
      bookingsByStatus: statusBreakdown,
      revenue: {
        today: todayRevenue[0]?.total || 0,
        week: weekRevenue[0]?.total || 0,
        month: monthRevenue[0]?.total || 0
      },
      videoBacklogCount: backlog,
      newWaitlistJoinsToday: newWaitlist
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req, res, next) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo);
    }

    const bookings = await PujaBooking.find(query)
      .populate("puja temple user")
      .sort(req.query.sort === "join_date" ? { createdAt: -1 } : { waitlistPosition: 1, createdAt: 1 });

    return res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await PujaBooking.findById(req.params.id).populate("puja temple user");
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }
    return res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function assignDate(req, res, next) {
  try {
    const booking = await PujaBooking.findById(req.params.id).populate("user puja temple");
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }
    if (!req.body.scheduledDate || !req.body.scheduledTimeIST) {
      throw createValidationError("scheduledDate and scheduledTimeIST are required");
    }

    booking.scheduledDate = req.body.scheduledDate;
    booking.scheduledTimeIST = req.body.scheduledTimeIST;
    booking.status = "confirmed";
    await booking.save();

    await sendPujaDateConfirmedEmail({
      to: booking.user.email,
      ctaUrl: `divya://booking/${booking._id}`,
      booking: {
        pujaName: booking.puja.name.en,
        heroImage: booking.temple.heroImage,
        scheduledDate: new Date(booking.scheduledDate).toDateString(),
        scheduledTimeIST: booking.scheduledTimeIST,
        userLocalTime: booking.scheduledTimeIST
      }
    });

    const push = await queuePushNotification({
      user: booking.user,
      title: "Your Puja is Confirmed 🙏",
      body: `${booking.puja.name.en} — ${booking.scheduledTimeIST} IST`,
      deepLink: `divya://booking/${booking._id}`,
      data: { type: "puja_confirmed" }
    });

    return res.json({ booking, push });
  } catch (error) {
    next(error);
  }
}

export async function markInProgress(req, res, next) {
  try {
    const booking = await PujaBooking.findById(req.params.id).populate("user puja temple");
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }
    booking.status = "in_progress";
    booking.notifications.push({ type: "in_progress", channel: "both", sentAt: new Date(), success: true });
    await booking.save();

    const push = await queuePushNotification({
      user: booking.user,
      title: "Your Puja is Happening Now 🪔",
      body: `${booking.puja.name.en} is being performed at Bhadra Bhagavathi Temple`,
      deepLink: `divya://booking/${booking._id}`,
      data: { type: "puja_in_progress", minutesRemaining: 60 }
    });

    return res.json({
      booking,
      push,
      pushPayload: {
        title: "Your Puja is Happening Now 🪔",
        body: `${booking.puja.name.en} is being performed at Bhadra Bhagavathi Temple`,
        deepLink: `divya://booking/${booking._id}`,
        islandPayload: { type: "puja_in_progress", pujaName: booking.puja.name.en, minutesRemaining: 60 }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function markCompleted(req, res, next) {
  try {
    const booking = await PujaBooking.findById(req.params.id);
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }
    booking.status = "completed";
    await booking.save();
    return res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function uploadBookingVideo(req, res, next) {
  try {
    const booking = await PujaBooking.findById(req.params.id).populate("user puja temple");
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }
    if (!req.file?.buffer) {
      throw createValidationError("Video file is required");
    }

    if (booking.videoStorageId) {
      await deleteStoredVideo(booking.videoStorageId);
    }

    const storedVideo = await saveVideoBuffer(req.file.buffer, {
      filename: `${booking.bookingReference}.mp4`,
      contentType: req.file.mimetype || "video/mp4",
      metadata: {
        bookingId: booking._id.toString(),
        bookingReference: booking.bookingReference
      }
    });

    booking.videoStorageId = storedVideo.id;
    booking.videoMimeType = storedVideo.contentType;
    booking.videoFileName = storedVideo.filename;
    booking.videoShareToken = createVideoShareToken();
    booking.videoShareUrl = `${publicBaseUrl(req)}/api/bookings/shared/${booking.videoShareToken}`;
    booking.videoUploadedAt = new Date();
    booking.status = "video_ready";
    booking.videoUploadedBy = req.user.email;
    await booking.save();

    await sendVideoReadyEmail({
      to: booking.user.email,
      ctaUrl: `divya://puja-video/${booking._id}`,
      booking: {
        pujaName: booking.puja.name.en,
        videoThumbnailUrl: booking.temple.heroImage,
        heroImage: booking.temple.heroImage
      }
    });

    const push = await queuePushNotification({
      user: booking.user,
      title: "Your Sacred Video is Ready 🎬",
      body: `Watch your ${booking.puja.name.en} — performed at the Goddess's feet`,
      deepLink: `divya://puja-video/${booking._id}`,
      data: { type: "video_ready", shareUrl: booking.videoShareUrl }
    });

    return res.json({ booking, push });
  } catch (error) {
    next(error);
  }
}

export async function cancelAdminBooking(req, res, next) {
  try {
    const booking = await PujaBooking.findById(req.params.id);
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }

    if (stripe && booking.stripePaymentIntentId) {
      await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
    }

    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();
    return res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req, res) {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    prayerStarted,
    prayerCompleted,
    waitlistFormStarted,
    waitlistJoined,
    videoOpened,
    videoCompleted,
    paidBookings,
    totalReadyVideos,
    watchedVideos,
    dauUserIds,
    wauUserIds
  ] = await Promise.all([
    AppEvent.countDocuments({ name: "prayer_started", createdAt: { $gte: last30Days } }),
    AppEvent.countDocuments({ name: "prayer_completed", createdAt: { $gte: last30Days } }),
    AppEvent.countDocuments({ name: "waitlist_form_started", createdAt: { $gte: last30Days } }),
    AppEvent.countDocuments({ name: "waitlist_joined", createdAt: { $gte: last30Days } }),
    AppEvent.countDocuments({ name: "video_opened", createdAt: { $gte: last30Days } }),
    AppEvent.countDocuments({ name: "video_completed", createdAt: { $gte: last30Days } }),
    PujaBooking.countDocuments({ paymentStatus: "paid", createdAt: { $gte: last30Days } }),
    PujaBooking.countDocuments({ status: { $in: ["video_ready", "completed"] }, createdAt: { $gte: last30Days } }),
    PujaBooking.countDocuments({ videoWatchCount: { $gt: 0 }, createdAt: { $gte: last30Days } }),
    AppEvent.distinct("user", { createdAt: { $gte: last24Hours }, user: { $ne: null } }),
    AppEvent.distinct("user", { createdAt: { $gte: last7Days }, user: { $ne: null } })
  ]);

  const [dauByCountryRaw, wauByCountryRaw] = await Promise.all([
    User.aggregate([
      { $match: { _id: { $in: dauUserIds } } },
      { $group: { _id: "$country", count: { $sum: 1 } } }
    ]),
    User.aggregate([
      { $match: { _id: { $in: wauUserIds } } },
      { $group: { _id: "$country", count: { $sum: 1 } } }
    ])
  ]);

  const wauMap = new Map(wauByCountryRaw.map((entry) => [entry._id || "Unknown", entry.count]));
  const countryRows = dauByCountryRaw
    .map((entry) => {
      const country = entry._id || "Unknown";
      return {
        country,
        dau: entry.count,
        wau: wauMap.get(country) || 0
      };
    })
    .sort((a, b) => b.dau - a.dau);

  const prayerCompletionRate =
    prayerStarted > 0 ? Number((prayerCompleted / prayerStarted).toFixed(4)) : 0;
  const waitlistPaid = paidBookings > 0 ? paidBookings : waitlistJoined;
  const videoWatchRate =
    totalReadyVideos > 0
      ? Number((watchedVideos / totalReadyVideos).toFixed(4))
      : videoOpened > 0
        ? Number((videoCompleted / videoOpened).toFixed(4))
        : 0;

  return res.json({
    prayerCompletionRate,
    pujaFunnel: {
      viewed: waitlistFormStarted,
      started: waitlistJoined,
      paid: waitlistPaid
    },
    videoWatchRate,
    dauWauByCountry: countryRows
  });
}

export async function getPrayerCorrections(req, res, next) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.prayerId) query.prayer = req.query.prayerId;

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));

    const [items, total] = await Promise.all([
      PrayerCorrection.find(query)
        .populate("prayer", "title slug externalId")
        .populate("user", "name email")
        .populate("reviewedBy", "name email")
        .sort({ status: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PrayerCorrection.countDocuments(query)
    ]);

    return res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
}

export async function getContactRequests(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const [items, total] = await Promise.all([
      ContactRequest.find(query)
        .populate("user", "name email country timezone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ContactRequest.countDocuments(query)
    ]);

    return res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
}

function applyApprovedCorrection(prayer, correction) {
  const text = String(correction.suggestedText || "").trim();
  if (!text) return false;

  switch (correction.category) {
    case "text":
      prayer.content = { ...(prayer.content || {}), english: text };
      return true;
    case "transliteration":
      prayer.transliteration = text;
      prayer.iast = text;
      return true;
    case "meaning":
      prayer.meaning = text;
      return true;
    case "audio_metadata": {
      try {
        const parsed = JSON.parse(text);
        if (parsed.audioLicenseTag) prayer.audioLicenseTag = parsed.audioLicenseTag;
        if (parsed.audioCodec) prayer.audioCodec = parsed.audioCodec;
        if (parsed.audioChecksumSha256) prayer.audioChecksumSha256 = parsed.audioChecksumSha256;
        return true;
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

export async function reviewPrayerCorrection(req, res, next) {
  try {
    const correction = await PrayerCorrection.findById(req.params.correctionId).populate("prayer");
    if (!correction) {
      throw new ApiError("NOT_FOUND", "Correction not found");
    }

    const status = String(req.body.status || "").toLowerCase();
    if (!["approved", "rejected"].includes(status)) {
      throw createValidationError("status must be approved or rejected");
    }

    correction.status = status;
    correction.moderationNote = req.body.moderationNote || "";
    correction.reviewedBy = req.user._id;
    correction.reviewedAt = new Date();

    let prayerUpdated = false;
    const applyToPrayer = req.body.applyToPrayer !== false;
    if (status === "approved" && applyToPrayer && correction.prayer) {
      prayerUpdated = applyApprovedCorrection(correction.prayer, correction);
      if (prayerUpdated) {
        correction.prayer.contentVersion = Number(correction.prayer.contentVersion || 1) + 1;
        await correction.prayer.save();
      }
    }

    await correction.save();

    return res.json({
      success: true,
      correction,
      prayerUpdated
    });
  } catch (error) {
    next(error);
  }
}
