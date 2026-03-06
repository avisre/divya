import { julian, moonposition, solar, base } from "astronomia";
import SunCalc from "suncalc";
import { NAKSHATRAS, getNakshatraFromMoonLongitude } from "./nakshatraCalc.js";

export const TEMPLE_LAT = 9.0167;
export const TEMPLE_LNG = 76.5333;
export const TEMPLE_TIMEZONE = "Asia/Kolkata";

const TITHIS = [
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Amavasya"
];

const RAHU_KAAL_SEGMENTS = {
  0: 8,
  1: 2,
  2: 7,
  3: 5,
  4: 6,
  5: 4,
  6: 3
};

const HIGHLY_AUSPICIOUS_NAKSHATRAS = new Set(["Pushya", "Ashwini", "Hasta", "Revati", "Rohini"]);
const AVOID_NAKSHATRAS_FOR_NEW_VENTURES = new Set(["Jyeshtha", "Mula", "Ashlesha"]);

function toIsoUtc(date) {
  return new Date(date).toISOString();
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function getSunMoonLongitudes(date) {
  const jde = julian.DateToJDE(date);
  const T = base.J2000Century(jde);
  const sunLonRaw = solar.apparentLongitude(T);
  const sunLon = normalizeDegrees((sunLonRaw * 180) / Math.PI || sunLonRaw);
  const moonLonRaw = moonposition.position(jde).lon;
  const moonLon = normalizeDegrees(moonLonRaw);
  const siderealMoon = normalizeDegrees(moonLon - 23.85);

  return { sunLon, moonLon, siderealMoon };
}

function getTithi(moonLon, sunLon) {
  const diff = normalizeDegrees(moonLon - sunLon);
  const number = Math.floor(diff / 12) + 1;
  const paksha = number <= 15 ? "Shukla" : "Krishna";
  return {
    number,
    name: TITHIS[number - 1],
    paksha
  };
}

function getSunriseSunset(date) {
  const anchor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  const times = SunCalc.getTimes(anchor, TEMPLE_LAT, TEMPLE_LNG);
  const sunrise = times.sunrise instanceof Date ? times.sunrise : new Date(anchor);
  const sunset = times.sunset instanceof Date ? times.sunset : new Date(anchor.getTime() + 12 * 60 * 60 * 1000);
  return { sunrise, sunset };
}

function getRahuKaal(sunrise, sunset, weekday) {
  const segmentIndex = RAHU_KAAL_SEGMENTS[weekday];
  const totalMs = sunset.getTime() - sunrise.getTime();
  const segmentMs = totalMs / 8;
  const start = new Date(sunrise.getTime() + segmentMs * (segmentIndex - 1));
  const end = new Date(start.getTime() + segmentMs);
  return { start, end };
}

function computeOverallAuspiciousness(tithi, nakshatra) {
  if (!tithi || !nakshatra) return "neutral";

  const tithiNumber = tithi.number;
  const isShukla = tithi.paksha === "Shukla";
  const isKrishnaAshtami = tithiNumber === 23;

  if (tithi.name === "Amavasya" || tithiNumber === 6 || isKrishnaAshtami) {
    return "inauspicious";
  }
  if (tithi.name === "Purnima" && HIGHLY_AUSPICIOUS_NAKSHATRAS.has(nakshatra.name)) {
    return "highly_auspicious";
  }
  if ([2, 3, 5, 7, 10, 11, 12, 13].includes(tithiNumber) && isShukla) {
    return "auspicious";
  }
  return "neutral";
}

function formatWindow(start, end, timezone, includeZone = false) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
    timeZoneName: includeZone ? "short" : undefined
  });
  const startText = formatter.format(start);
  const endText = formatter.format(end);
  return `${startText} - ${endText}`;
}

function computeAuspiciousWindow(sunrise, sunset, timezone) {
  const daylightMs = sunset.getTime() - sunrise.getTime();
  const center = sunrise.getTime() + daylightMs / 2;
  const start = new Date(center - 45 * 60 * 1000);
  const end = new Date(center + 45 * 60 * 1000);
  return `${formatWindow(start, end, timezone)} (${timezone})`;
}

export function computeDailyGuidance(tithi, nakshatra, _yoga, rahuKaal, timezone = "America/New_York", sunrise, sunset) {
  const goodFor = [];
  const avoidFor = [];

  if ([2, 3, 5, 7, 10, 11, 12, 13].includes(tithi?.number) && tithi?.paksha === "Shukla") {
    goodFor.push("Starting new ventures", "Signing contracts", "Travel");
  }

  if (tithi?.name === "Purnima") {
    goodFor.push("Fasting and prayer", "Charitable giving", "Meditation");
  }

  if (["Ashwini", "Pushya", "Hasta", "Abhijit"].includes(nakshatra?.name)) {
    goodFor.push("Medical appointments", "Learning and study");
  }

  if (AVOID_NAKSHATRAS_FOR_NEW_VENTURES.has(nakshatra?.name)) {
    avoidFor.push("Starting new ventures", "Travel");
  }

  const rahuWarning = rahuKaal
    ? `Avoid important decisions during Rahu Kaal (${formatWindow(rahuKaal.start, rahuKaal.end, timezone)})`
    : "Avoid important decisions during Rahu Kaal";
  avoidFor.push(rahuWarning);

  const overall = computeOverallAuspiciousness(tithi, nakshatra);
  const auspiciousWindow =
    sunrise && sunset ? computeAuspiciousWindow(sunrise, sunset, timezone) : `Midday window (${timezone})`;

  return {
    overall,
    goodFor: [...new Set(goodFor)],
    avoidFor: [...new Set(avoidFor)],
    auspiciousWindow,
    rahuKaalWarning: rahuWarning
  };
}

export function calculatePanchang(dateInput, timezone = TEMPLE_TIMEZONE) {
  const date = new Date(dateInput);
  const { sunLon, moonLon, siderealMoon } = getSunMoonLongitudes(date);
  const tithi = getTithi(moonLon, sunLon);
  const nakshatra = getNakshatraFromMoonLongitude(siderealMoon);
  const { sunrise, sunset } = getSunriseSunset(date);
  const { start, end } = getRahuKaal(sunrise, sunset, date.getUTCDay());
  const dailyGuidance = computeDailyGuidance(tithi, nakshatra, null, { start, end }, timezone, sunrise, sunset);

  return {
    date: date.toISOString().slice(0, 10),
    timezone,
    tithi,
    nakshatra,
    sunriseUtc: toIsoUtc(sunrise),
    sunsetUtc: toIsoUtc(sunset),
    rahuKaalStartUtc: toIsoUtc(start),
    rahuKaalEndUtc: toIsoUtc(end),
    festivals: [],
    dailyGuidance,
    referenceLocation: {
      lat: TEMPLE_LAT,
      lng: TEMPLE_LNG
    }
  };
}

export function formatPanchangForTimezone(panchang, timezone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone
  });

  const rahuStart = new Date(panchang.rahuKaalStartUtc);
  const rahuEnd = new Date(panchang.rahuKaalEndUtc);
  const sunrise = new Date(panchang.sunriseUtc);
  const sunset = new Date(panchang.sunsetUtc);
  const guidance = panchang.dailyGuidance || computeDailyGuidance(
    panchang.tithi,
    panchang.nakshatra,
    null,
    { start: rahuStart, end: rahuEnd },
    timezone,
    sunrise,
    sunset
  );

  return {
    ...panchang,
    sunriseLocal: formatter.format(new Date(panchang.sunriseUtc)),
    sunsetLocal: formatter.format(new Date(panchang.sunsetUtc)),
    rahuKaalStartLocal: formatter.format(new Date(panchang.rahuKaalStartUtc)),
    rahuKaalEndLocal: formatter.format(new Date(panchang.rahuKaalEndUtc)),
    dailyGuidance: {
      ...guidance,
      auspiciousWindow: guidance.auspiciousWindow?.replace(`(${panchang.timezone})`, `(${timezone})`) || guidance.auspiciousWindow,
      rahuKaalWarning: `Avoid important decisions during Rahu Kaal (${formatWindow(rahuStart, rahuEnd, timezone)})`
    },
    infoTooltip:
      "Panchang timings are calculated using the traditional Vedic system, referenced from Karunagapally, Kerala - the location of the Bhadra Bhagavathi Temple - and converted to your local timezone. Minor variations from your local temple's published panchang are normal and expected.",
    availableNakshatras: NAKSHATRAS
  };
}
