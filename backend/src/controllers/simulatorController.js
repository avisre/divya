import { Puja } from "../models/Puja.js";
import { Temple } from "../models/Temple.js";
import { PujaBooking } from "../models/PujaBooking.js";
import { calculateNakshatraFromBirthDate } from "../utils/nakshatraCalc.js";
import { filterIntention } from "../utils/contentFilter.js";
import { ApiError, createValidationError } from "../utils/ApiError.js";

function selectPricing(pricing, currency = "USD") {
  const key = currency.toLowerCase();
  return pricing?.[key] ?? pricing?.usd ?? 0;
}

function presentedToUsd(amount, currency) {
  const rates = { USD: 1, GBP: 1.28, CAD: 0.74, AUD: 0.66, AED: 0.27 };
  return Number((amount * (rates[currency] || 1)).toFixed(2));
}

function generateSimulationReference() {
  const year = new Date().getUTCFullYear();
  const code = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SIM-${year}-${code}`;
}

function toIsoIfValid(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function getSimulatorBootstrap(req, res, next) {
  try {
    const currency = (req.query.currency || "USD").toUpperCase();
    const [temple, pujas] = await Promise.all([
      Temple.findOne({ isActive: true }).populate("deity"),
      Puja.find({ isActive: true }).populate("deity").sort({ order: 1 })
    ]);

    if (!temple) {
      throw new ApiError("NOT_FOUND", "Temple is not configured");
    }

    return res.json({
      temple: {
        id: temple._id,
        name: temple.name,
        tradition: temple.tradition,
        location: temple.location,
        timezone: temple.panchangLocation?.timezone || "Asia/Kolkata",
        nriNote: temple.nriNote
      },
      pujas: pujas.map((puja) => ({
        id: puja._id,
        name: puja.name,
        type: puja.type,
        duration: puja.duration,
        estimatedWaitWeeks: puja.estimatedWaitWeeks,
        description: puja.description,
        requirements: puja.requirements,
        bestFor: puja.bestFor,
        displayPrice: {
          amount: selectPricing(puja.pricing, currency),
          currency
        }
      })),
      defaults: {
        currency,
        timezone: "America/New_York",
        gothram: "Kashyap"
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function simulateBooking(req, res, next) {
  try {
    const {
      pujaId,
      devoteeName,
      gothram,
      nakshatra,
      birthDate,
      birthTime,
      timezone = "America/New_York",
      prayerIntention,
      currency = "USD",
      requestedDateRange
    } = req.body;

    if (!pujaId || typeof pujaId !== "string") {
      throw createValidationError("pujaId is required");
    }
    if (!devoteeName || typeof devoteeName !== "string") {
      throw createValidationError("devoteeName is required");
    }
    if (!prayerIntention || typeof prayerIntention !== "string") {
      throw createValidationError("prayerIntention is required");
    }

    const puja = await Puja.findById(pujaId).populate("temple deity");
    if (!puja) {
      throw new ApiError("NOT_FOUND", "Puja not found");
    }

    const presentedCurrency = currency.toUpperCase();
    const presentedAmount = selectPricing(puja.pricing, presentedCurrency);
    const amountUsd = presentedToUsd(presentedAmount, presentedCurrency);
    const waitlistPosition = (await PujaBooking.countDocuments({ puja: puja._id, status: "waitlisted" })) + 1;

    let filteredIntention;
    try {
      filteredIntention = filterIntention(prayerIntention);
    } catch (error) {
      throw createValidationError(error.message);
    }

    let resolvedNakshatra = nakshatra || null;
    if (!resolvedNakshatra && birthDate) {
      const birthIso = `${birthDate}T${birthTime || "00:00"}:00.000Z`;
      resolvedNakshatra = calculateNakshatraFromBirthDate(birthIso)?.name || null;
    }

    const simulationReference = generateSimulationReference();
    const now = new Date();
    const estimatedDate = new Date(now);
    estimatedDate.setUTCDate(estimatedDate.getUTCDate() + (puja.estimatedWaitWeeks || 4) * 7);

    return res.json({
      simulation: {
        bookingReference: simulationReference,
        status: "waitlisted",
        temple: puja.temple?.name,
        puja: puja.name,
        devoteeName,
        gothram: gothram || "Kashyap",
        nakshatra: resolvedNakshatra,
        timezone,
        waitlistPosition,
        estimatedWaitWeeks: puja.estimatedWaitWeeks || 4,
        estimatedTempleDate: estimatedDate.toISOString(),
        payment: {
          presentedAmount,
          presentedCurrency,
          settlementAmountUsd: amountUsd,
          settlementCurrency: "USD",
          mode: "simulation_only",
          note: "No real Stripe charge is created in simulation mode."
        },
        intention: {
          text: filteredIntention.filtered,
          requiresReview: filteredIntention.requiresReview
        },
        requestedDateRange: {
          start: toIsoIfValid(requestedDateRange?.start),
          end: toIsoIfValid(requestedDateRange?.end)
        },
        timeline: [
          "Waitlist submitted (simulation).",
          "Admin assigns date and time in IST.",
          "Status switches to in progress during ritual.",
          "Private sacred video becomes ready after completion."
        ]
      }
    });
  } catch (error) {
    next(error);
  }
}
