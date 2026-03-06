import { Panchang } from "../models/Panchang.js";
import { Festival } from "../models/Festival.js";
import { calculateNakshatraFromBirthDate } from "../utils/nakshatraCalc.js";
import { calculatePanchang, formatPanchangForTimezone } from "../utils/panchangCalc.js";

async function getOrCreatePanchang(date) {
  const dateKey = date.toISOString().slice(0, 10);
  let panchang = await Panchang.findOne({ date: dateKey });
  if (!panchang) {
    panchang = await Panchang.create(calculatePanchang(date));
  }
  return panchang.toObject();
}

function daysBetween(dateA, dateB) {
  const a = new Date(Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate())).getTime();
  const b = new Date(Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate())).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

async function getActiveFestivalPrep(date) {
  const festivals = await Festival.find({ startDate: { $exists: true, $ne: null } })
    .populate("featuredPrayer deity prepJourney.prayers dayOfRituals.prayer")
    .lean();

  return festivals
    .map((festival) => {
      const startDate = new Date(festival.startDate);
      const daysBefore = daysBetween(date, startDate);
      const prepWindow = Number(festival.preparationDays || 0);
      const inPrepWindow = daysBefore >= 0 && daysBefore <= prepWindow;
      const isFestivalDay = daysBefore === 0;
      if (!inPrepWindow && !isFestivalDay) return null;

      const prepStep = (festival.prepJourney || [])
        .slice()
        .sort((a, b) => a.daysBefore - b.daysBefore)
        .find((step) => daysBefore >= step.daysBefore) || null;

      return {
        festivalId: String(festival._id),
        slug: festival.slug,
        name: festival.name,
        startsInDays: daysBefore,
        preparationDays: festival.preparationDays || 0,
        prepStep,
        dayOfRituals: festival.dayOfRituals || [],
        communityNote: festival.communityNote || null
      };
    })
    .filter(Boolean);
}

export async function getTodayPanchang(req, res, next) {
  try {
    const timezone = req.query.timezone || req.user?.timezone || "America/New_York";
    const now = new Date();
    const panchang = await getOrCreatePanchang(now);
    const formatted = formatPanchangForTimezone(panchang, timezone);
    const festivalPrep = await getActiveFestivalPrep(now);
    return res.json({ ...formatted, festivalPrep });
  } catch (error) {
    next(error);
  }
}

export async function getPanchangByDate(req, res, next) {
  try {
    const timezone = req.query.timezone || req.user?.timezone || "America/New_York";
    const date = new Date(req.params.date);
    const panchang = await getOrCreatePanchang(date);
    const formatted = formatPanchangForTimezone(panchang, timezone);
    const festivalPrep = await getActiveFestivalPrep(date);
    return res.json({ ...formatted, festivalPrep });
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingPanchang(req, res, next) {
  try {
    const timezone = req.query.timezone || req.user?.timezone || "America/New_York";
    const days = Math.max(1, Math.min(Number(req.query.days || 30), 60));
    const results = [];
    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() + offset);
      const panchang = await getOrCreatePanchang(date);
      const festivalPrep = await getActiveFestivalPrep(date);
      results.push({
        ...formatPanchangForTimezone(panchang, timezone),
        festivalPrep
      });
    }
    return res.json(results);
  } catch (error) {
    next(error);
  }
}

export async function calculateNakshatra(req, res, next) {
  try {
    const { birthDate, birthTime } = req.body;
    const iso = `${birthDate}T${birthTime || "00:00"}:00.000Z`;
    return res.json(calculateNakshatraFromBirthDate(iso));
  } catch (error) {
    next(error);
  }
}
