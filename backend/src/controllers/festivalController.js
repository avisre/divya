import { Festival } from "../models/Festival.js";

export async function getFestivals(req, res, next) {
  try {
    const festivals = await Festival.find()
      .populate("featuredPrayer deity prepJourney.prayers dayOfRituals.prayer")
      .sort({ startDate: 1, "name.en": 1 });
    return res.json(festivals);
  } catch (error) {
    next(error);
  }
}

function daysUntil(fromDate, toDate) {
  const start = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate()));
  const end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()));
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

export async function getFestivalById(req, res, next) {
  try {
    const festival = await Festival.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }]
    }).populate("featuredPrayer deity prepJourney.prayers dayOfRituals.prayer");
    if (!festival) {
      return res.status(404).json({ message: "Festival not found" });
    }
    return res.json(festival);
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingFestivals(req, res, next) {
  try {
    const days = Math.max(1, Math.min(Number(req.query.days || 30), 365));
    const now = new Date();
    const endDate = new Date(now);
    endDate.setUTCDate(endDate.getUTCDate() + days);

    const festivals = await Festival.find({
      startDate: { $gte: now, $lte: endDate }
    })
      .populate("featuredPrayer deity prepJourney.prayers dayOfRituals.prayer")
      .sort({ startDate: 1, "name.en": 1 })
      .lean();

    const enriched = festivals.map((festival) => {
      const startsInDays = festival.startDate ? daysUntil(now, new Date(festival.startDate)) : null;
      return {
        ...festival,
        startsInDays
      };
    });

    return res.json(enriched);
  } catch (error) {
    next(error);
  }
}
