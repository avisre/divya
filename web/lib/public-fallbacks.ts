import generatedPrayerCatalog from "./generated-prayer-catalog.json";
import type { Deity, Prayer, PrayerAudioMetadata, Puja, Temple } from "./types";

type RawPrayerGlossaryEntry = {
  word: string;
  transliteration?: string | null;
  meaning?: string | null;
};

type RawPrayerVerse = {
  number: number;
  type?: string | null;
  script?: string | null;
  iast?: string | null;
  meaning?: string | null;
  audioStartSec?: number | null;
};

type RawPrayerCatalogEntry = {
  order: number;
  slug: string;
  deitySlug: string;
  titleEn: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  xpReward?: number;
  verseCount?: number;
  firstLinePreview?: string | null;
  description?: string | null;
  plainStory?: string | null;
  wordGlossary?: RawPrayerGlossaryEntry[];
  familyContext?: string | null;
  beginnerTip?: string | null;
  nriRelevance?: string | null;
  verses?: RawPrayerVerse[];
  scriptMalayalam?: string | null;
  scriptDevanagari?: string | null;
  transliteration?: string | null;
  iast?: string | null;
  meaning?: string | null;
};

const prayerAudioBySlug: Record<string, string> = {
  "mahishasura-mardini": "mahishasura_mardini_stotram",
  "navarna-mantra": "navarna_mantra",
  "ya-devi-sarvabhuteshu": "ya_devi_sarvabhuteshu",
  "kerala-bhagavathi-stuti": "kerala_bhagavathi_stuti",
  "lalitha-sahasranama-108": "lalitha_sahasranama_108",
  "gayatri-mantra": "gayatri_mantra",
  "ganesh-aarti": "ganesh_aarti",
  "hanuman-chalisa": "hanuman_chalisa",
  "maha-mrityunjaya": "maha_mrityunjaya",
  "lakshmi-aarti": "lakshmi_aarti",
  "saraswati-vandana": "saraswati_vandana",
  "shiva-panchakshara": "shiva_panchakshara",
  "om-namah-shivaya": "om_namah_shivaya",
  "durga-chalisa": "durga_chalisa",
  "krishna-aarti": "krishna_aarti",
  "surya-mantra": "surya_mantra",
  "shanti-mantra": "shanti_mantra",
  "vishnu-sahasranama-108": "vishnu_sahasranama_108",
  "pratah-smaranam": "morning_prayer",
  "nirvana-shatakam": "nirvana_shatakam"
};

const fallbackDeities: Record<string, Deity> = {
  ganesha: {
    _id: "ganesha",
    slug: "ganesha",
    name: { en: "Ganesha" }
  },
  "bhadra-bhagavathi": {
    _id: "bhadra-bhagavathi",
    slug: "bhadra-bhagavathi",
    name: { en: "Bhadra Bhagavathi" }
  },
  shiva: {
    _id: "shiva",
    slug: "shiva",
    name: { en: "Shiva" }
  },
  lakshmi: {
    _id: "lakshmi",
    slug: "lakshmi",
    name: { en: "Lakshmi" }
  },
  saraswati: {
    _id: "saraswati",
    slug: "saraswati",
    name: { en: "Saraswati" }
  },
  krishna: {
    _id: "krishna",
    slug: "krishna",
    name: { en: "Krishna" }
  },
  hanuman: {
    _id: "hanuman",
    slug: "hanuman",
    name: { en: "Hanuman" }
  }
};

const fallbackTemple: Temple = {
  _id: "bhadra-bhagavathi-temple",
  name: {
    en: "Bhadra Bhagavathi Temple, Karunagapally",
    ml: "ഭദ്ര ഭഗവതി ക്ഷേത്രം, കരുനാഗപ്പള്ളി",
    sa: "भद्र भगवती मन्दिर, करुनागपल्ली"
  },
  deity: fallbackDeities["bhadra-bhagavathi"],
  tradition: "Kerala Tantric Agama",
  shortDescription:
    "A sacred Kerala Tantric temple where families abroad stay connected to Bhagavathi through prayer, puja, and sacred recordings.",
  fullDescription:
    "Bhadra Bhagavathi Temple in Karunagapally anchors the devotional rhythm behind Prarthana. Families abroad use it to remain close to Kerala temple timing, Tantri-led offerings, and the voice of the Goddess carried through ritual rather than distance.",
  significance:
    "Bhadra Bhagavathi is revered here as the fierce and protective Mother who receives family names, vows, and prayers with disciplined ritual care.",
  nriNote:
    "Temple offerings are coordinated directly with the licensed Tantri so families abroad can remain part of the real ritual queue without reducing the experience to a booking form.",
  location: {
    city: "Karunagapally",
    district: "Kollam",
    state: "Kerala",
    country: "India"
  },
  panchangLocation: {
    lat: 9.0481,
    lng: 76.5361,
    timezone: "Asia/Kolkata"
  },
  timings: {
    pujas: [
      {
        name: "Usha Puja",
        nameML: "ഉഷ പൂജ",
        timeIST: "4:30 AM - 5:30 AM",
        description: "Pre-dawn awakening ritual."
      },
      {
        name: "Ethrittu Puja",
        nameML: "എത്രിട്ട് പൂജ",
        timeIST: "7:00 AM - 9:00 AM",
        description: "Morning worship after the temple opens."
      },
      {
        name: "Pantheeradi Puja",
        nameML: "പന്ത്രണ്ടടി പൂജ",
        timeIST: "12:00 PM - 1:00 PM",
        description: "Midday offering in the sanctum."
      },
      {
        name: "Athazha Puja",
        nameML: "അത്താഴ പൂജ",
        timeIST: "5:30 PM - 7:00 PM",
        description: "Evening puja with lamp offering."
      }
    ]
  }
};

const fallbackPujaCatalogBase: Puja[] = [
  {
    _id: "abhishekam",
    slug: "abhishekam",
    temple: fallbackTemple,
    deity: fallbackDeities["bhadra-bhagavathi"],
    name: { en: "Abhishekam", ml: "അഭിഷേകം" },
    type: "abhishekam",
    duration: 60,
    description: {
      short: "The deity is bathed with sacred substances while your family name is spoken aloud.",
      full: "A temple-led sacred bath using milk, curd, sandalwood, turmeric, flowers, and mantra, performed in your family's name by the licensed Tantri.",
      whatHappens:
        "The temple receives your request, the Tantri includes your family name in the sankalpa, and the ceremony is recorded for private delivery after completion.",
      nriNote:
        "This is the clearest way to remain present in the temple rhythm from abroad while still receiving a private sacred record of the ceremony."
    },
    pricing: {
      usd: 51,
      gbp: 40,
      cad: 69,
      aud: 78,
      aed: 187
    },
    benefits: ["Purification", "Protection", "Family blessing", "Temple connection"],
    bestFor: ["Birthdays", "New beginnings", "Festival offerings"],
    requirements: ["Family name", "Prayer intention", "Preferred date (optional)"],
    estimatedWaitWeeks: 1,
    waitlistCount: 0,
    videoDelivered: true,
    videoNote: "HD video delivered privately within 48 hours of the ceremony.",
    prasadAvailable: false,
    order: 1,
    isActive: true
  },
  {
    _id: "sahasranama-archana",
    slug: "sahasranama-archana",
    temple: fallbackTemple,
    deity: fallbackDeities["bhadra-bhagavathi"],
    name: { en: "Sahasranama Archana", ml: "സഹസ്രനാമ അർച്ചന" },
    type: "archana",
    duration: 45,
    description: {
      short: "A name-offering ritual invoking the thousand names of the Goddess with flowers and mantra.",
      full: "A focused archana offering that invokes the Goddess through her sacred names while placing your family's sankalpa into the temple's ritual sequence.",
      whatHappens:
        "The Tantri chants the names of the Goddess with your family name and prayer intention included in the temple offering.",
      nriNote:
        "This is especially suited to families who want a more intimate, name-centered offering without needing a long ritual window."
    },
    pricing: {
      usd: 31,
      gbp: 25,
      cad: 42,
      aud: 47,
      aed: 114
    },
    benefits: ["Name-linked blessing", "Focused prayer", "Calm family offering"],
    bestFor: ["Monthly observance", "Anniversaries", "Quiet devotion"],
    requirements: ["Family name", "Prayer intention"],
    estimatedWaitWeeks: 1,
    waitlistCount: 0,
    videoDelivered: true,
    videoNote: "Video delivered privately within 48 hours of the ceremony.",
    prasadAvailable: false,
    order: 2,
    isActive: true
  },
  {
    _id: "kalasha-puja",
    slug: "kalasha-puja",
    temple: fallbackTemple,
    deity: fallbackDeities["bhadra-bhagavathi"],
    name: { en: "Kalasha Puja", ml: "കലശ പൂജ" },
    type: "special-seva",
    duration: 75,
    description: {
      short: "A consecrated water-vessel offering for blessing, protection, and family steadiness.",
      full: "A kalasha is invoked, consecrated, and offered within the temple ritual sequence to carry blessing, cooling grace, and protection into the family line.",
      whatHappens:
        "The Tantri performs the kalasha invocation, includes your family name in the offering, and completes the puja within the temple's schedule.",
      nriNote:
        "A strong choice for families marking a transition, moving home, welcoming a child, or asking for steadiness during a demanding season."
    },
    pricing: {
      usd: 45,
      gbp: 36,
      cad: 61,
      aud: 68,
      aed: 165
    },
    benefits: ["Protection", "Home blessing", "Transition support", "Cooling grace"],
    bestFor: ["House moves", "Family transitions", "Children", "Festival preparation"],
    requirements: ["Family name", "Prayer intention", "Preferred date (optional)"],
    estimatedWaitWeeks: 1,
    waitlistCount: 0,
    videoDelivered: true,
    videoNote: "Video delivered privately within 48 hours of the ceremony.",
    prasadAvailable: false,
    order: 3,
    isActive: true
  }
];

let fallbackPrayerCatalogPromise: Promise<Prayer[]> | null = null;

function joinVerseField(
  verses: RawPrayerVerse[] | undefined,
  key: "script" | "iast" | "meaning"
) {
  return (verses || [])
    .map((verse) => verse[key])
    .filter((value): value is string => Boolean(value))
    .join("\n\n");
}

function mapFallbackPrayer(entry: RawPrayerCatalogEntry): Prayer {
  const requiredTier = entry.order > 10 ? "bhakt" : "free";
  const audioKey = prayerAudioBySlug[entry.slug];
  const verses = Array.isArray(entry.verses) ? entry.verses : [];
  const scriptDevanagari =
    entry.scriptDevanagari ||
    (!entry.scriptMalayalam ? joinVerseField(verses, "script") : null);
  const scriptMalayalam = entry.scriptMalayalam || null;
  const iast = entry.iast || joinVerseField(verses, "iast") || entry.transliteration || null;
  const meaning = entry.meaning || joinVerseField(verses, "meaning") || entry.description || null;

  return {
    _id: entry.slug,
    slug: entry.slug,
    externalId: `fallback-${entry.slug}`,
    deity: fallbackDeities[entry.deitySlug],
    title: { en: entry.titleEn },
    type: entry.type,
    difficulty: entry.difficulty,
    durationMinutes: entry.durationMinutes,
    plainStory: entry.plainStory || entry.description || null,
    wordGlossary: entry.wordGlossary || [],
    familyContext: entry.familyContext || null,
    beginnerTip: entry.beginnerTip || null,
    beginnerNote: entry.beginnerTip || null,
    nriRelevance: entry.nriRelevance || null,
    verseCount: entry.verseCount || verses.length || 1,
    verses,
    xpReward: entry.xpReward || 0,
    firstLinePreview: entry.firstLinePreview || null,
    transliteration: entry.transliteration || iast,
    content: {
      devanagari: scriptDevanagari,
      malayalam: scriptMalayalam,
      english: entry.description || meaning
    },
    iast,
    meaning,
    audioUrl: audioKey ? `raw://${audioKey}` : null,
    recommendedRepetitions: [1, 3, 11, 21, 108],
    isPremium: requiredTier !== "free",
    isFeatured: entry.order <= 6,
    requiredTier
  };
}

async function loadFallbackPrayerCatalog() {
  if (!fallbackPrayerCatalogPromise) {
    fallbackPrayerCatalogPromise = Promise.resolve(
      Array.isArray(generatedPrayerCatalog)
        ? (generatedPrayerCatalog as RawPrayerCatalogEntry[]).map(mapFallbackPrayer)
        : []
    );
  }

  return fallbackPrayerCatalogPromise;
}

function resolveDisplayAmount(pricing: Record<string, number> | undefined, currency: string) {
  if (!pricing) {
    return undefined;
  }

  const normalizedCurrency = currency.toLowerCase();
  return (
    pricing[normalizedCurrency] ??
    pricing.gbp ??
    pricing.usd ??
    Object.values(pricing).find((value) => typeof value === "number")
  );
}

function withDisplayPrice(puja: Puja, currency: string): Puja {
  const normalizedCurrency = currency.toUpperCase();
  const amount = resolveDisplayAmount(puja.pricing, normalizedCurrency);

  return {
    ...puja,
    displayPrice:
      typeof amount === "number"
        ? {
            amount,
            currency: normalizedCurrency
          }
        : puja.displayPrice
  };
}

export async function getFallbackPrayers() {
  return loadFallbackPrayerCatalog();
}

export async function getFallbackPrayer(idOrSlug: string) {
  const prayers = await loadFallbackPrayerCatalog();
  return prayers.find((prayer) => prayer._id === idOrSlug || prayer.slug === idOrSlug) || null;
}

export async function getFallbackFeaturedPrayers() {
  const prayers = await loadFallbackPrayerCatalog();
  return prayers.filter((prayer) => prayer.isFeatured);
}

export async function getFallbackDeities() {
  const prayers = await loadFallbackPrayerCatalog();
  const seen = new Set<string>();

  return prayers
    .map((prayer) => prayer.deity)
    .filter((deity): deity is Deity => Boolean(deity))
    .filter((deity) => {
      if (seen.has(deity.slug)) {
        return false;
      }
      seen.add(deity.slug);
      return true;
    });
}

export async function getFallbackPrayerAudio(idOrSlug: string): Promise<PrayerAudioMetadata | null> {
  const prayer = await getFallbackPrayer(idOrSlug);
  if (!prayer?.audioUrl) {
    return null;
  }

  return {
    prayerId: prayer._id,
    url: prayer.audioUrl,
    directUrl: prayer.audioUrl,
    streamUrl: null,
    codec: "mp3",
    durationSeconds: Math.max(60, prayer.durationMinutes * 60),
    licenseTag: "bundled",
    qualityLabel: "Temple audio",
    sourceLabel: "Bundled prayer audio",
    checksumSha256: null,
    version: 1,
    requiredTier: prayer.requiredTier || "free",
    entitled: true,
    audioComingSoon: false,
    audioComingSoonSubscribed: false
  };
}

export function getFallbackTemple() {
  return fallbackTemple;
}

export function getFallbackPujas(currency = "GBP") {
  return fallbackPujaCatalogBase.map((puja) => withDisplayPrice(puja, currency));
}

export function getFallbackPuja(id: string, currency = "GBP") {
  const normalizedId = id.trim().toLowerCase();
  const puja = fallbackPujaCatalogBase.find(
    (entry) => entry._id.toLowerCase() === normalizedId || String(entry.slug || "").toLowerCase() === normalizedId
  );

  return puja ? withDisplayPrice(puja, currency) : null;
}
