import { learnEntries } from "./learn-content";
import type { LearnCategory, LearnEntry, Prayer, Puja } from "./types";

const learnCategoryLabels: Record<LearnCategory, string> = {
  deities: "Deities",
  festivals: "Festivals",
  customs: "Customs & Rituals",
  "sacred-texts": "Sacred Texts",
  "kerala-traditions": "Kerala Traditions"
};

const beginnerEntryIds = new Set([
  "ganesha",
  "customs-puja-explained",
  "the-panchang-explained"
]);

const prayerLearnMap: Record<string, string> = {
  "gayatri-mantra": "saraswati",
  "mahishasura-mardini": "bhadra-bhagavathi"
};

const pujaLearnMap: Record<string, string> = {
  abhishekam: "customs-abhishekam",
  "sahasranama-archana": "customs-puja-explained",
  "kalasha-puja": "customs-puja-explained"
};

const festivalLearnMap: Record<string, string> = {
  navaratri: "festivals-navaratri",
  navarathri: "festivals-navaratri",
  vijayadashami: "festivals-navaratri",
  vishu: "festivals-vishu",
  onam: "festivals-onam",
  diwali: "festivals-diwali",
  deepavali: "festivals-diwali",
  shivaratri: "festivals-shivaratri",
  "maha-shivaratri": "festivals-shivaratri",
  janmashtami: "festivals-janmashtami",
  "ganesh-chaturthi": "festivals-ganesh-chaturthi",
  "ganesh chaturthi": "festivals-ganesh-chaturthi"
};

export const learnCategories = Object.keys(learnCategoryLabels) as LearnCategory[];

export function getLearnCategoryLabel(category: LearnCategory) {
  return learnCategoryLabels[category];
}

export function getLearnEntries() {
  return learnEntries.map((entry) => ({
    ...entry
  }));
}

export function getLearnEntry(slug: string) {
  return getLearnEntries().find((entry) => entry.slug === slug) || null;
}

export function getLearnEntriesByCategory(category: LearnCategory) {
  return getLearnEntries().filter((entry) => entry.category === category);
}

export function getFeaturedLearnEntries() {
  return getLearnEntries().filter((entry) => entry.isFeatured);
}

export function getBeginnerLearnEntries() {
  return getLearnEntries().filter((entry) => beginnerEntryIds.has(entry.id));
}

export function getRelatedLearnEntries(entry: LearnEntry) {
  return entry.relatedEntryIds
    .map((id) => getLearnEntry(id))
    .filter(Boolean)
    .slice(0, 3) as LearnEntry[];
}

export function getLearnTierForViewer(tier?: "free" | "bhakt" | "seva" | null) {
  return tier || "free";
}

export function canViewLearnEntry(entry: LearnEntry, tier?: "free" | "bhakt" | "seva" | null) {
  return entry.tier === "free" || tier === "bhakt" || tier === "seva";
}

export function toPlainLearnText(value: string) {
  return value
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLearnPreviewText(entry: LearnEntry, maxWords = 100) {
  const words = toPlainLearnText(entry.bodyMd).split(" ").filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

export function getLearnPreviewWordCount(entry: LearnEntry, maxWords = 100) {
  return getLearnPreviewText(entry, maxWords).split(" ").filter(Boolean).length;
}

export function getLearnPrayerEntry(prayer: Prayer) {
  const direct = prayerLearnMap[prayer.slug];
  if (direct) {
    return getLearnEntry(direct);
  }

  const deitySlug = prayer.deity?.slug;
  return deitySlug ? getLearnEntry(deitySlug) : null;
}

export function getLearnPujaEntry(puja: Puja) {
  const key = puja.slug || slugifyLearnKey(puja.name.en);
  const mapped = pujaLearnMap[key];
  return mapped ? getLearnEntry(mapped) : getLearnEntry("customs-puja-explained");
}

export function getLearnFestivalEntry(value?: string | null) {
  if (!value) return null;
  const normalized = slugifyLearnKey(value);
  const mapped = festivalLearnMap[normalized];
  return mapped ? getLearnEntry(mapped) : null;
}

export function getLearnCategoryHref(category: LearnCategory) {
  return `/learn/category/${category}`;
}

export function slugifyLearnKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRelatedPracticeHref(entry: LearnEntry, pujas: Puja[] = []) {
  if (entry.relatedPrayerSlugs.length > 0) {
    return `/prayers/${entry.relatedPrayerSlugs[0]}`;
  }

  const puja = pujas.find((item) => entry.relatedPujaIds.includes(item.slug || slugifyLearnKey(item.name.en)));
  return puja ? `/pujas/${puja._id}` : "/pujas";
}
