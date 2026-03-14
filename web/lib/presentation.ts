import type { CSSProperties } from "react";
import type { Festival, Panchang, Prayer, Puja, PujaBooking, Temple } from "./types";

type DeityTheme = {
  tint: string;
  accent: string;
  bar: string;
  symbol: string;
};

const deityThemes: Array<{
  match: RegExp;
  theme: DeityTheme;
}> = [
  {
    match: /(bhadra|bhagavathi|devi|durga|kali)/i,
    theme: {
      tint: "var(--vermilion-100)",
      accent: "var(--vermilion-400)",
      bar: "rgba(201, 75, 42, 0.9)",
      symbol: "\u0950"
    }
  },
  {
    match: /saraswati/i,
    theme: {
      tint: "var(--patina-100)",
      accent: "var(--patina-600)",
      bar: "rgba(74, 103, 65, 0.92)",
      symbol: "\u0938"
    }
  },
  {
    match: /ganesha|ganesh/i,
    theme: {
      tint: "var(--gold-100)",
      accent: "var(--gold-400)",
      bar: "rgba(200, 137, 42, 0.92)",
      symbol: "\u0917"
    }
  },
  {
    match: /shiva|mahadev/i,
    theme: {
      tint: "var(--slate-100)",
      accent: "var(--slate-400)",
      bar: "rgba(139, 138, 135, 0.92)",
      symbol: "\u0936"
    }
  },
  {
    match: /lakshmi/i,
    theme: {
      tint: "#f8ead7",
      accent: "#b57d2c",
      bar: "rgba(181, 125, 44, 0.92)",
      symbol: "\u0932"
    }
  },
  {
    match: /krishna|vishnu/i,
    theme: {
      tint: "#edf1fb",
      accent: "#5763a5",
      bar: "rgba(87, 99, 165, 0.92)",
      symbol: "\u0915"
    }
  }
];

const defaultTheme: DeityTheme = {
  tint: "var(--cream-100)",
  accent: "var(--vermilion-400)",
  bar: "rgba(201, 75, 42, 0.92)",
  symbol: "\u0950"
};

export const OM_SYMBOL = "\u0950";
export const TEMPLE_FALLBACK_IMAGE = "/images/bhadra-bhagavathi-temple-fallback.svg";

const prayerTypeMeta: Record<string, { label: string; descriptor: string }> = {
  stotram: { label: "STOTRAM", descriptor: "Hymn" },
  mantra: { label: "MANTRA", descriptor: "Sacred chant" },
  aarti: { label: "AARTI", descriptor: "Devotional song" },
  chalisa: { label: "CHALISA", descriptor: "40-verse praise" },
  prayer: { label: "PRAYER", descriptor: "Devotional prayer" },
  vandana: { label: "STOTRAM", descriptor: "Hymn" },
  ritual_explanation: { label: "RITUAL GUIDE", descriptor: "Plain-English guide" }
};

const difficultyMeta: Record<string, { label: string; tone: string; tooltip: string }> = {
  beginner: {
    label: "BEGINNER",
    tone: "green",
    tooltip: "Short, simple, no Sanskrit background needed"
  },
  intermediate: {
    label: "INTERMEDIATE",
    tone: "amber",
    tooltip: "Longer text; easier with some practice"
  },
  advanced: {
    label: "ADVANCED",
    tone: "terracotta",
    tooltip: "Full recitation takes commitment; deeply rewarding"
  }
};

const bannedTempleImageHosts = [
  "images.unsplash.com",
  "unsplash.com"
];

const pujaBenefitDescriptions: Record<string, string> = {
  "Health blessings":
    "A prayerful offering for physical steadiness, recovery, and the protective grace families seek in uncertain periods.",
  "Obstacle removal":
    "Offered when a household feels blocked, so the ritual intention is placed before the Goddess with clarity and humility.",
  "Mental steadiness":
    "Supports calm thinking, emotional balance, and the inner composure devotees ask for when life feels scattered.",
  "Grace in transitions":
    "Especially meaningful during moves, exams, career change, marriage, or family transitions that need blessing and protection.",
  "General blessings":
    "A wide and gentle temple offering for households seeking all-round blessing without a single urgent prayer request.",
  Prosperity:
    "Traditionally offered for livelihood, household stability, and the flow of resources needed to care for family well.",
  "Household harmony":
    "Invokes a quieter home atmosphere, mutual understanding, and protection from the tensions that wear families down.",
  "Devotional focus":
    "Helps devotees return to steady prayer, disciplined remembrance, and a more rooted daily spiritual rhythm.",
  "New beginnings":
    "A fitting offering before fresh starts, so the first step is taken under the blessing of the temple and the Mother.",
  "Home blessing":
    "Often chosen for a new house, travel, or relocation, asking that the family dwelling remain peaceful and protected.",
  "Business auspiciousness":
    "A prayer for clean beginnings in work and enterprise, with right timing, fewer obstacles, and steadier outcomes.",
  Protection:
    "Centers the protective aspect of Bhadra Bhagavathi, especially when a family is praying for shielding and courage.",
  Courage:
    "Supports devotees who need inner resolve, firmer will, and the emotional strength to face difficult circumstances.",
  "Inner resilience":
    "Offered when families are navigating strain, grief, or uncertainty and want their prayer to anchor them steadily.",
  "Navarathri observance":
    "Carries the special devotional tone of festival observance, aligning the offering with Devi worship and seasonal merit.",
  "Daily blessings":
    "A simple temple offering for households beginning a devotional practice and wanting an accessible first sacred step.",
  "Ease of mind":
    "A gentle prayer for relief from restlessness, worry, and the feeling of carrying too much without enough grounding.",
  "First devotional step":
    "Well suited to first-time devotees, giving the family a way to begin with sincerity rather than complexity.",
  "Career blessings":
    "Frequently chosen when praying for right opportunity, wiser decisions, and a more stable professional path.",
  "Decision clarity":
    "Helps focus intention when a family is facing a difficult choice and wants to proceed with steadiness and blessing.",
  "Fresh beginnings":
    "A renewing ritual for moments when the household wants to start again with humility, prayer, and auspicious timing.",
  "Marriage blessings":
    "Traditionally offered for relationship harmony, wedding preparation, and blessings on married life.",
  "Family harmony":
    "Invokes grace for better understanding, softened conflict, and a more settled emotional atmosphere at home.",
  "Light in difficult periods":
    "A temple offering for families passing through grief, stress, or confusion and asking for visible guidance.",
  "Spiritual growth":
    "Supports a deeper devotional life by pairing disciplined ritual with reflective inner intention.",
  "Protection from negativity":
    "Chosen when devotees want the ritual to explicitly address fear, heaviness, or harmful influences around the family.",
  "Focused intention":
    "Useful when a family wants the offering to carry one prayer clearly and without distraction before the deity.",
  "Inner discipline":
    "Strengthens consistency in prayer, restraint, and the kind of devotional regularity that matures over time.",
  "All-round blessings":
    "A broad, generous offering for households that want to place many hopes under one temple-led prayer.",
  "Festival merit":
    "Especially meaningful during major observances, when the ritual carries both personal intention and seasonal sacred merit.",
  "Family grace":
    "A quiet prayer that the family remain protected, connected, and inwardly supported across distance and time.",
  Purification:
    "Offered for cleansing, inner clarity, and the feeling of beginning again from a more sacred and disciplined place.",
  "Karmic clearing":
    "Traditionally linked with prayers for release from accumulated heaviness and for a more auspicious path forward.",
  "Blessings for major events":
    "Chosen before weddings, travel, illness recovery, house moves, and other moments where ritual blessing matters deeply.",
  "Focused prayer":
    "Helps direct the family's intention cleanly, especially when one request needs to be held before the temple with care."
};

function isBannedTempleImage(url?: string | null) {
  if (!url) return true;
  return bannedTempleImageHosts.some((host) => url.includes(host));
}

function buildTempleAlt(temple?: Temple | null) {
  if (temple?.name?.en) {
    return `${temple.name.en} devotional temple illustration`;
  }
  return "Bhadra Bhagavathi Temple devotional illustration";
}

export function getDeityTheme(name?: string | null): DeityTheme {
  if (!name) return defaultTheme;
  const found = deityThemes.find((entry) => entry.match.test(name));
  return found?.theme || defaultTheme;
}

export function getDeityThemeStyle(name?: string | null): CSSProperties {
  const theme = getDeityTheme(name);
  return {
    ["--deity-tint" as string]: theme.tint,
    ["--deity-accent" as string]: theme.accent,
    ["--deity-bar" as string]: theme.bar
  };
}

export function getDeitySymbol(name?: string | null) {
  return getDeityTheme(name).symbol;
}

export function getTemplePhotoUrl(temple?: Temple | null) {
  return getTempleVisual(temple).src;
}

export function getTempleVisual(temple?: Temple | null) {
  const source = [temple?.heroImage, temple?.images?.[0]].find(
    (item) => item && !isBannedTempleImage(item)
  );

  if (source) {
    return {
      src: source,
      alt: temple?.name?.en || "Bhadra Bhagavathi Temple",
      isFallback: false
    };
  }

  return {
    src: TEMPLE_FALLBACK_IMAGE,
    alt: buildTempleAlt(temple),
    isFallback: true
  };
}

export function getPrayerPreview(prayer: Prayer) {
  return (
    prayer.firstLinePreview ||
    prayer.beginnerNote ||
    prayer.meaning ||
    prayer.content.english ||
    "Sacred text, pronunciation guidance, and audio support for daily prayer."
  );
}

export function getPrayerTypeMeta(type?: string | null) {
  const normalized = String(type || "prayer").toLowerCase();
  return prayerTypeMeta[normalized] || prayerTypeMeta.prayer;
}

export function getPrayerDifficultyMeta(difficulty?: string | null) {
  const normalized = String(difficulty || "beginner").toLowerCase();
  return difficultyMeta[normalized] || difficultyMeta.beginner;
}

export function getPujaPreview(puja: Puja) {
  return (
    puja.description?.short ||
    puja.description?.nriNote ||
    puja.description?.full ||
    "Temple-coordinated offering with private booking tracking."
  );
}

export function getFestivalPlaceholder(festivals: Festival[]) {
  if (festivals.length > 0) return null;
  return "No major festivals in the next 14 days. Amavasya is a day for ancestor prayers and reduced activity.";
}

export function getTithiTone(name?: string | null): "auspicious" | "inauspicious" | "neutral" {
  if (!name) return "neutral";
  if (/amavasya/i.test(name)) return "inauspicious";
  if (/(ekadashi|dvitiya|purnima|trayodashi|panchami)/i.test(name)) return "auspicious";
  return "neutral";
}

export function getPanchangTone(panchang: Pick<Panchang, "tithi">) {
  return getTithiTone(panchang.tithi.name);
}

export function getSharedPrayerProgress(current = 0, total = 0) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((current / total) * 100)));
}

function describePujaBenefit(benefit: string, puja: Puja) {
  return (
    pujaBenefitDescriptions[benefit] ||
    puja.description?.nriNote ||
    puja.description?.whatHappens ||
    "A temple-led offering held in your family's name with clear ritual intention and private follow-through."
  );
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function getPujaBenefitCards(puja: Puja) {
  const sourceBenefits = unique((puja.benefits || []).filter(Boolean)).slice(0, 4);
  const fallbackBenefits = unique([
    ...sourceBenefits,
    "Temple connection",
    "Protective grace",
    "Family continuity",
    "Sacred remembrance"
  ]).slice(0, 4);

  return fallbackBenefits.map((benefit) => ({
    title: benefit,
    description:
      benefit === "Temple connection"
        ? "Keeps a family abroad connected to the temple queue, priestly tradition, and sacred timing in Kerala."
        : benefit === "Protective grace"
          ? "A reminder that the offering is placed before the fierce and protective Mother on behalf of your household."
          : benefit === "Family continuity"
            ? "Helps families carry ritual memory forward across distance, generations, and different timezones."
            : benefit === "Sacred remembrance"
              ? "Creates a lasting devotional record through the offering, its prayer intention, and the video that follows."
              : describePujaBenefit(benefit, puja)
  }));
}

export function getBookingProgressState(booking: PujaBooking) {
  const watched = Boolean(booking.videoWatchCount && booking.videoWatchCount > 0);

  if (booking.status === "video_ready") {
    return watched
      ? {
          label: "Watched",
          detail: "Relive the sacred recording any time from your bookings.",
          tone: "completed" as const,
          cta: "Replay recording"
        }
      : {
          label: "Recording available",
          detail: "Your private temple recording is ready to watch.",
          tone: "completed" as const,
          cta: "Watch recording"
        };
  }

  if (booking.status === "completed") {
    return {
      label: "Recording coming",
      detail: "The puja is complete. Your private recording is being prepared.",
      tone: "confirmed" as const,
      cta: "View booking"
    };
  }

  if (booking.status === "in_progress") {
    return {
      label: "Puja in progress",
      detail: "The temple has taken up your offering. Recording follows after completion.",
      tone: "confirmed" as const,
      cta: "View booking"
    };
  }

  if (booking.status === "confirmed") {
    return {
      label: "Confirmed with temple",
      detail: "Your date is assigned. Recording will appear after the ritual is complete.",
      tone: "confirmed" as const,
      cta: "View booking"
    };
  }

  if (booking.status === "cancelled") {
    return {
      label: "Cancelled",
      detail: "This offering is no longer active in the temple queue.",
      tone: "waitlisted" as const,
      cta: "View booking"
    };
  }

  return {
    label: "Pending in temple queue",
    detail: "Your request is waiting for confirmation from the temple team.",
    tone: "waitlisted" as const,
    cta: "View booking"
  };
}
