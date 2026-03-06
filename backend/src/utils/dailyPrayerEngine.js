import { Panchang } from "../models/Panchang.js";
import { Prayer } from "../models/Prayer.js";
import { User } from "../models/User.js";

const DAY_DEITY_MAP = {
  Monday: ["shiva"],
  Tuesday: ["hanuman", "bhadra-bhagavathi", "durga"],
  Wednesday: ["ganesha", "saraswati"],
  Thursday: ["vishnu", "krishna"],
  Friday: ["lakshmi", "bhadra-bhagavathi", "durga"],
  Saturday: ["hanuman", "shani"],
  Sunday: ["surya"]
};

function toDateKey(inputDate) {
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate);
  return date.toISOString().slice(0, 10);
}

function getWeekdayForTimezone(date, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: timezone
  }).format(date);
}

function getFestivalNames(festivals) {
  return (festivals || []).map((festival) => {
    if (typeof festival === "string") return festival;
    if (festival?.name?.en) return festival.name.en;
    if (festival?.name) return String(festival.name);
    if (festival?.title) return String(festival.title);
    return "";
  });
}

function tithiAlignmentScore(prayer, panchang) {
  const tithiNumber = panchang?.tithi?.number;
  const tags = (prayer.tags || []).map((tag) => String(tag).toLowerCase());
  const deitySlug = prayer?.deity?.slug;

  if (!tithiNumber) return { score: 0, reason: null };

  const matches = (...values) => values.includes(deitySlug) || values.some((value) => tags.includes(value));

  if (tithiNumber === 11 && matches("vishnu", "krishna", "ekadashi")) {
    return { score: 80, reason: "Today is Ekadashi - auspicious for Vishnu prayers" };
  }
  if (tithiNumber === 30 && matches("pitru", "ancestor", "amavasya")) {
    return { score: 80, reason: "Today is Amavasya - a day for remembrance and ancestral prayers" };
  }
  if (tithiNumber === 15 && matches("lakshmi", "vishnu", "purnima")) {
    return { score: 80, reason: "Today is Purnima - ideal for Lakshmi and gratitude prayers" };
  }
  if (tithiNumber === 4 && matches("ganesha", "chaturthi")) {
    return { score: 80, reason: "Today is Chaturthi - auspicious for Ganesha prayers" };
  }
  if ((tithiNumber === 13 || tithiNumber === 28) && matches("shiva", "pradosh")) {
    return { score: 80, reason: "Today is Pradosh - an auspicious time for Shiva prayers" };
  }

  return { score: 0, reason: null };
}

function normalizeObjectId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value.toString === "function") return value.toString();
  return null;
}

function scorePrayer({ prayer, user, panchang, timezone, recentlyCompleted }) {
  let score = 0;
  let reason = "Today's prayer is selected based on your devotional pattern.";
  const festivalNames = getFestivalNames(panchang?.festivals);

  if (festivalNames.length > 0) {
    const festivalMatch = (prayer.occasion || []).some((occasion) =>
      festivalNames.some((festival) => festival.toLowerCase().includes(String(occasion).toLowerCase()))
    );
    if (festivalMatch) {
      score += 100;
      reason = `Festival alignment: ${festivalNames[0]}`;
    }
  }

  const tithiScore = tithiAlignmentScore(prayer, panchang);
  if (tithiScore.score > 0) {
    score += tithiScore.score;
    reason = tithiScore.reason;
  }

  const weekday = getWeekdayForTimezone(new Date(panchang?.date || Date.now()), timezone);
  const dayDeities = DAY_DEITY_MAP[weekday] || [];
  const deitySlug = prayer?.deity?.slug;
  if (deitySlug && dayDeities.includes(deitySlug)) {
    score += 60;
    reason = `${weekday} is traditionally associated with ${prayer.deity.name?.en || "this deity"}`;
  }

  if (user?.onboarding?.tradition === "shakta") {
    const tags = (prayer.tags || []).map((tag) => String(tag).toLowerCase());
    if (tags.includes("shakta") || tags.includes("devi")) {
      score += 40;
    }
  }

  if (user?.preferredDeity && normalizeObjectId(prayer.deity?._id) === normalizeObjectId(user.preferredDeity?._id)) {
    score += 30;
  }

  if (user?.onboarding?.prayerFrequency === "exploring" && prayer.difficulty === "beginner") {
    score += 20;
  }

  if (recentlyCompleted.has(normalizeObjectId(prayer._id))) {
    score -= 200;
  }

  return { prayer, score, reason };
}

function getRecentlyCompletedSet(user, days = 3) {
  if (!user?.completedPrayers?.length) return new Set();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentIds = user.completedPrayers
    .filter((entry) => {
      const completedAt = entry?.completedAt ? new Date(entry.completedAt).getTime() : 0;
      return completedAt >= cutoff;
    })
    .map((entry) => normalizeObjectId(entry.prayerId))
    .filter(Boolean);
  return new Set(recentIds);
}

export async function getDailyPrayerForUser({ userId, date = new Date(), timezone = "America/New_York" }) {
  const dateKey = toDateKey(date);
  const [user, panchang, prayers] = await Promise.all([
    userId ? User.findById(userId).populate("preferredDeity") : Promise.resolve(null),
    Panchang.findOne({ date: dateKey }),
    Prayer.find({}).populate("deity")
  ]);

  if (!prayers.length) {
    return {
      prayer: null,
      reason: "No active prayers available.",
      tithi: panchang?.tithi || null,
      festival: null
    };
  }

  const recentlyCompleted = getRecentlyCompletedSet(user, 3);
  const scored = prayers.map((prayer) =>
    scorePrayer({
      prayer,
      user,
      panchang,
      timezone,
      recentlyCompleted
    })
  );
  scored.sort((a, b) => b.score - a.score);

  return {
    prayer: scored[0].prayer,
    reason: scored[0].reason,
    tithi: panchang?.tithi || null,
    festival: getFestivalNames(panchang?.festivals)[0] || null
  };
}
