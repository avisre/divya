import "dotenv/config";
import Stripe from "stripe";
import mongoose from "mongoose";
import { PujaBooking } from "../models/PujaBooking.js";
import { Puja } from "../models/Puja.js";
import { User } from "../models/User.js";
import { UserProgress } from "../models/UserProgress.js";
import { ApiError, createValidationError } from "../utils/ApiError.js";
import { filterIntention } from "../utils/contentFilter.js";
import { getStoredVideoInfo, openVideoDownloadStream } from "../utils/videoStore.js";
import { resolveBookingGothram, suggestGothramGuided } from "../utils/gothram.js";
import { sendAdminBookingAlertEmail } from "../utils/email.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const paymentsDisabled = String(process.env.DISABLE_PAYMENTS || "true").toLowerCase() === "true";

function publicBaseUrl(req) {
  return process.env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function selectPricing(pricing, currency = "USD") {
  const key = currency.toLowerCase();
  return pricing?.[key] ?? pricing?.usd ?? 0;
}

function presentedToUsd(amount, currency) {
  const rates = { USD: 1, GBP: 1.28, CAD: 0.74, AUD: 0.66, AED: 0.27 };
  return Number((amount * (rates[currency] || 1)).toFixed(2));
}

const pujaAliasMatchers = [
  { aliases: ["puja-abhishekam", "abhishekam"], query: { type: "abhishekam" } },
  { aliases: ["puja-sahasranama", "sahasranama-archana"], query: { "name.en": /^Sahasranama Archana$/i } },
  { aliases: ["puja-pushpanjali", "pushpanjali"], query: { "name.en": /^Pushpanjali$/i } },
  { aliases: ["puja-usha", "usha-puja"], query: { "name.en": /^Usha Puja/i } },
  { aliases: ["puja-vilakku", "vilakku-puja"], query: { "name.en": /^Vilakku Puja$/i } },
  { aliases: ["puja-navarathri", "navarathri-vishesh-puja"], query: { "name.en": /^Navarathri Vishesh Puja$/i } }
];

function normalizePujaAlias(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

async function resolvePujaByRequestId(requestPujaId) {
  if (!requestPujaId) return null;
  const pujaId = String(requestPujaId).trim();

  if (mongoose.isValidObjectId(pujaId)) {
    const byId = await Puja.findById(pujaId).populate("temple");
    if (byId) return byId;
  }

  const normalized = normalizePujaAlias(pujaId);
  const matcher = pujaAliasMatchers.find((item) => item.aliases.includes(normalized));
  if (matcher) {
    return Puja.findOne(matcher.query).sort({ order: 1 }).populate("temple");
  }

  return Puja.findOne({ "name.en": new RegExp(`^${pujaId}$`, "i") }).populate("temple");
}

async function createPaymentIntent({ amount, currency, metadata }) {
  if (paymentsDisabled) {
    return null;
  }

  if (!stripe) {
    throw new ApiError("INTERNAL", "Stripe is not configured but payments are enabled.");
  }

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata
  });
}

function generateBookingReference() {
  const year = new Date().getUTCFullYear();
  const code = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DIVYA-${year}-${code}`;
}

async function getPaymentIntentClientSecret(paymentIntentId) {
  if (!paymentIntentId) return null;
  if (!stripe) {
    return null;
  }
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.client_secret || null;
  } catch {
    return null;
  }
}

function buildGiftDetails(user, giftPayload) {
  if (!giftPayload?.isGift) return undefined;
  return {
    isGift: true,
    giftedBy: user._id,
    recipientName: giftPayload.recipientName,
    recipientEmail: giftPayload.recipientEmail || undefined,
    recipientPhone: giftPayload.recipientPhone || undefined,
    personalMessage: giftPayload.personalMessage || undefined,
    giftOccasion: giftPayload.giftOccasion || "general_blessing",
    notificationSent: false
  };
}

async function sendAdminBookingAlert(booking, user) {
  try {
    await sendAdminBookingAlertEmail({
      booking: {
        bookingReference: booking.bookingReference,
        pujaName: booking.puja?.name?.en || "",
        devoteeName: booking.devoteeName,
        gothram: booking.gothram,
        nakshatra: booking.nakshatra,
        prayerIntention: booking.prayerIntention,
        presentedAmount: booking.presentedAmount,
        presentedCurrency: booking.presentedCurrency,
        status: booking.status,
        templeHeroImage: booking.temple?.heroImage || null
      },
      user: {
        name: user?.name || "Unknown",
        email: user?.email || "Unknown"
      }
    });
  } catch (error) {
    console.warn("Admin booking alert email failed:", error.message || error);
  }
}

async function createBookingRecord({
  req,
  puja,
  idempotencyKey,
  paymentIntent,
  presentedCurrency,
  presentedAmount,
  amountUsd,
  intention,
  gothram,
  giftDetails
}) {
  const bookingReference = generateBookingReference();
  const waitlistPosition = (await PujaBooking.countDocuments({ puja: puja._id, status: "waitlisted" })) + 1;
  const paymentBypassed = !paymentIntent;

  const booking = await PujaBooking.create({
    user: req.user._id,
    puja: puja._id,
    temple: puja.temple._id,
    bookingReference,
    idempotencyKey: idempotencyKey || undefined,
    devoteeName: req.body.devoteeName,
    gothram,
    nakshatra: req.body.nakshatra,
    nakshatraCalculated: Boolean(req.body.nakshatraCalculated),
    birthDate: req.body.birthDate,
    rashi: req.body.rashi,
    prayerIntention: intention.filtered,
    intentionFiltered: intention.requiresReview,
    requestedDateRange: req.body.requestedDateRange,
    waitlistPosition,
    amount: amountUsd,
    currency: "USD",
    presentedAmount,
    presentedCurrency,
    paymentStatus: paymentBypassed ? "paid" : "pending",
    stripePaymentIntentId: paymentIntent?.id,
    chargedAt: paymentBypassed ? new Date() : undefined,
    giftDetails
  });

  await UserProgress.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { pujaBookingsCount: 1 }, updatedAt: new Date() },
    { new: true, upsert: true }
  );

  puja.waitlistCount += 1;
  await puja.save();

  return booking;
}

async function linkGiftToUsers(booking, ownerUser) {
  if (!booking?.giftDetails?.isGift) return;
  ownerUser.giftsGiven.push(booking._id);
  await ownerUser.save();

  if (booking.giftDetails.recipientEmail) {
    const recipientUser = await User.findOne({
      email: booking.giftDetails.recipientEmail.toLowerCase().trim()
    });
    if (recipientUser) {
      recipientUser.giftsReceived.push(booking._id);
      await recipientUser.save();
    }
  }
}

export async function createBooking(req, res, next) {
  try {
    if (!req.body.pujaId || typeof req.body.pujaId !== "string") {
      throw createValidationError("pujaId is required");
    }
    if (!req.body.devoteeName || typeof req.body.devoteeName !== "string") {
      throw createValidationError("devoteeName is required");
    }
    if (!req.body.prayerIntention || typeof req.body.prayerIntention !== "string") {
      throw createValidationError("prayerIntention is required");
    }

    const idempotencyKey =
      typeof req.headers["x-idempotency-key"] === "string"
        ? req.headers["x-idempotency-key"].trim().slice(0, 128)
        : null;

    if (idempotencyKey) {
      const existingBooking = await PujaBooking.findOne({
        user: req.user._id,
        idempotencyKey
      });
      if (existingBooking) {
        await existingBooking.populate("puja temple");
        const existingClientSecret = await getPaymentIntentClientSecret(existingBooking.stripePaymentIntentId);
        return res.status(200).json({
          booking: existingBooking,
          clientSecret: existingClientSecret,
          idempotentReplay: true,
          paymentRequired: !paymentsDisabled
        });
      }
    }

    const puja = await resolvePujaByRequestId(req.body.pujaId);
    if (!puja) {
      throw new ApiError("NOT_FOUND", "Puja not found");
    }

    const presentedCurrency = (req.body.currency || req.user.currency || "USD").toUpperCase();
    const presentedAmount = selectPricing(puja.pricing, presentedCurrency);
    const amountUsd = presentedToUsd(presentedAmount, presentedCurrency);
    const intention = filterIntention(req.body.prayerIntention);
    const gothram = resolveBookingGothram(req.body.gothram, req.body.devoteeName).gothram;

    const paymentIntent = await createPaymentIntent({
      amount: presentedAmount,
      currency: presentedCurrency,
      metadata: {
        userId: req.user._id.toString(),
        pujaId: puja._id.toString(),
        bookingType: "self"
      }
    });

    const booking = await createBookingRecord({
      req,
      puja,
      idempotencyKey,
      paymentIntent,
      presentedCurrency,
      presentedAmount,
      amountUsd,
      intention,
      gothram
    });
    await booking.populate("puja temple");
    await sendAdminBookingAlert(booking, req.user);

    return res.status(201).json({
      booking,
      clientSecret: paymentIntent?.client_secret || null,
      paymentRequired: !paymentsDisabled
    });
  } catch (error) {
    next(error);
  }
}

export async function createGiftBooking(req, res, next) {
  try {
    if ((req.user.subscription?.tier || "free") === "free") {
      return res.status(402).json({ message: "Puja gifting is available on Bhakt and Seva plans." });
    }
    if (!req.body.giftDetails?.recipientName) {
      throw createValidationError("giftDetails.recipientName is required");
    }
    if (!req.body.pujaId || typeof req.body.pujaId !== "string") {
      throw createValidationError("pujaId is required");
    }
    if (!req.body.devoteeName || typeof req.body.devoteeName !== "string") {
      throw createValidationError("devoteeName is required");
    }
    if (!req.body.prayerIntention || typeof req.body.prayerIntention !== "string") {
      throw createValidationError("prayerIntention is required");
    }

    const puja = await resolvePujaByRequestId(req.body.pujaId);
    if (!puja) {
      throw new ApiError("NOT_FOUND", "Puja not found");
    }

    const presentedCurrency = (req.body.currency || req.user.currency || "USD").toUpperCase();
    const presentedAmount = selectPricing(puja.pricing, presentedCurrency);
    const amountUsd = presentedToUsd(presentedAmount, presentedCurrency);
    const intention = filterIntention(req.body.prayerIntention);
    const gothram = resolveBookingGothram(req.body.gothram, req.body.devoteeName).gothram;
    const giftDetails = buildGiftDetails(req.user, { ...req.body.giftDetails, isGift: true });

    const paymentIntent = await createPaymentIntent({
      amount: presentedAmount,
      currency: presentedCurrency,
      metadata: {
        userId: req.user._id.toString(),
        pujaId: puja._id.toString(),
        bookingType: "gift"
      }
    });

    const booking = await createBookingRecord({
      req,
      puja,
      idempotencyKey: null,
      paymentIntent,
      presentedCurrency,
      presentedAmount,
      amountUsd,
      intention,
      gothram,
      giftDetails
    });
    await booking.populate("puja temple");

    await linkGiftToUsers(booking, req.user);
    await sendAdminBookingAlert(booking, req.user);

    return res.status(201).json({
      booking,
      clientSecret: paymentIntent?.client_secret || null,
      paymentRequired: !paymentsDisabled
    });
  } catch (error) {
    next(error);
  }
}

export async function suggestGothram(req, res, next) {
  try {
    const devoteeName = String(req.body?.devoteeName || "").trim();
    if (!devoteeName) {
      throw createValidationError("devoteeName is required");
    }
    const result = suggestGothramGuided({
      devoteeName,
      surnameCommunity: req.body?.surnameCommunity,
      familyRegion: req.body?.familyRegion,
      knownFamilyGothram: req.body?.knownFamilyGothram
    });
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req, res, next) {
  try {
    const bookings = await PujaBooking.find({ user: req.user._id })
      .populate("puja temple")
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getGiftBookingsSent(req, res, next) {
  try {
    const bookings = await PujaBooking.find({
      user: req.user._id,
      "giftDetails.isGift": true
    })
      .populate("puja temple")
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getGiftBookingsReceived(req, res, next) {
  try {
    const bookings = await PujaBooking.find({
      "giftDetails.isGift": true,
      $or: [
        { "giftDetails.recipientEmail": req.user.email },
        { _id: { $in: req.user.giftsReceived || [] } }
      ]
    })
      .populate("puja temple user")
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await PujaBooking.findOne({ _id: req.params.id, user: req.user._id }).populate("puja temple");
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }
    return res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await PujaBooking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }

    booking.status = "cancelled";
    booking.paymentStatus = booking.paymentStatus === "paid" ? "refunded" : booking.paymentStatus;
    await booking.save();

    if (stripe && booking.stripePaymentIntentId && booking.paymentStatus === "refunded") {
      await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
}

export async function getVideo(req, res, next) {
  try {
    const booking = await PujaBooking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking || !booking.videoStorageId) {
      throw new ApiError("NOT_FOUND", "Video not found");
    }

    return res.json({
      url: `${publicBaseUrl(req)}/api/bookings/${booking._id}/video/stream`,
      shareUrl: booking.videoShareUrl
    });
  } catch (error) {
    next(error);
  }
}

async function streamBookingVideo(booking, res) {
  const file = await getStoredVideoInfo(booking.videoStorageId);
  if (!file) {
    throw new ApiError("NOT_FOUND", "Video file missing");
  }

  res.setHeader("Content-Type", booking.videoMimeType || file.contentType || "video/mp4");
  res.setHeader("Content-Disposition", `inline; filename="${booking.videoFileName || file.filename || "puja-video.mp4"}"`);
  res.setHeader("Accept-Ranges", "bytes");
  if (file.length) {
    res.setHeader("Content-Length", file.length);
  }

  openVideoDownloadStream(booking.videoStorageId).pipe(res);
  return undefined;
}

export async function streamVideo(req, res, next) {
  try {
    const booking = await PujaBooking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking || !booking.videoStorageId) {
      throw new ApiError("NOT_FOUND", "Video not found");
    }

    return await streamBookingVideo(booking, res);
  } catch (error) {
    next(error);
  }
}

export async function streamSharedVideo(req, res, next) {
  try {
    const booking = await PujaBooking.findOne({ videoShareToken: req.params.token });
    if (!booking || !booking.videoStorageId) {
      throw new ApiError("NOT_FOUND", "Shared video not found");
    }

    return await streamBookingVideo(booking, res);
  } catch (error) {
    next(error);
  }
}

export async function markVideoWatched(req, res, next) {
  try {
    const booking = await PujaBooking.findOne({ _id: req.params.id, user: req.user._id }).populate("puja temple");
    if (!booking) {
      throw new ApiError("NOT_FOUND", "Booking not found");
    }

    booking.videoWatchedAt = new Date();
    booking.videoWatchCount += 1;
    await booking.save();

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
