import { getDeities, getLearningModule, getLearningPath, getPrayers } from "./data";
import type { Deity, LearningPath, Prayer } from "./types";

type LearningModule = LearningPath["modules"][number];
type LearningModuleResponse = { deity: Deity; module: LearningModule };
type LearningTemplate = {
  completionBadge: string;
  modules: Array<{
    title: string;
    type: string;
    keyTakeaway: string;
    content: string;
    prayerMatcher?: RegExp;
    readTime?: number;
  }>;
};

type DeityDirectoryEntry = Awaited<ReturnType<typeof getDeities>>[number];

const fallbackTemplates: Array<{ match: RegExp; template: LearningTemplate }> = [
  {
    match: /(bhadra|bhagavathi|devi|durga|kali)/i,
    template: {
      completionBadge: "Guardian of Bhadra Bhagavathi practice",
      modules: [
        {
          title: "Who is Bhadra Bhagavathi?",
          type: "story",
          keyTakeaway:
            "Bhadra Bhagavathi devotion in Kerala centers on disciplined ritual, protection, and continuity.",
          content:
            "Bhadra Bhagavathi is approached as the fierce and protective Mother whose grace steadies households through uncertainty. In Kerala temple practice, devotion is expressed through disciplined lamps, mantra, and temple-led offerings rather than spectacle. For families abroad, this path gives a rooted devotional language that still feels intimate and possible at home.",
          prayerMatcher: /(mahishasura|devi|bhagavathi|durga|navarna)/i,
          readTime: 5
        },
        {
          title: "Protective mantra and daily repetition",
          type: "mantra_deep_dive",
          keyTakeaway:
            "Protective Devi mantras work best when they are repeated with steadiness, not urgency.",
          content:
            "Protective prayer in this tradition is not performed as panic or superstition. The deeper discipline is repetition with breath, intention, and regularity. A short daily chant, offered with humility, builds the inner steadiness that devotees often seek from the Mother.",
          prayerMatcher: /(navarna|durga|mahishasura|lalitha)/i,
          readTime: 4
        },
        {
          title: "Kerala Tantric temple rhythm",
          type: "ritual_explanation",
          keyTakeaway:
            "Kerala Tantric worship has its own vocabulary and sequence that should be understood on its own terms.",
          content:
            "Terms such as Tantri, Usha Puja, nilavilakku, and sankalpa carry specific meaning within Kerala ritual life. Understanding that vocabulary helps diaspora families participate accurately and respectfully. The goal is not to imitate every temple detail at home, but to recognize how the temple rhythm can shape daily remembrance abroad.",
          prayerMatcher: /(kerala|bhagavathi|stuti|devi)/i,
          readTime: 6
        },
        {
          title: "Keeping Devi practice alive abroad",
          type: "family_practice",
          keyTakeaway:
            "Small, repeatable household rituals sustain family identity better than occasional intense effort.",
          content:
            "A five-minute lamp lighting, a short chant, and one intentional prayer request can keep the household connected to the temple even across timezones. Children remember the rhythm of practice more than its complexity. The path matures when the family can return to it steadily.",
          prayerMatcher: /(pratah|mahishasura|lalitha|devi)/i,
          readTime: 5
        }
      ]
    }
  },
  {
    match: /ganesha|ganesh/i,
    template: {
      completionBadge: "Student of Ganesha",
      modules: [
        {
          title: "Why Ganesha is invoked first",
          type: "story",
          keyTakeaway: "Beginning with Ganesha establishes clarity and steadiness before action.",
          content:
            "Ganesha is traditionally invoked at the beginning of study, travel, prayer, and new undertakings. The point is not mere ritual habit; it is the cultivation of right beginning. A short Ganesha prayer reorients the mind before the day expands into noise and distraction.",
          prayerMatcher: /(ganesh|ganesha)/i,
          readTime: 4
        },
        {
          title: "Adaptive intelligence and removal of obstacles",
          type: "symbolism",
          keyTakeaway: "Obstacle removal is as much about inner flexibility as outer success.",
          content:
            "Ganesha symbolism often points devotees toward adaptability, patience, and grounded intelligence. The prayer tradition asks not only for obstacles to disappear, but for the devotee to meet life with better judgment and less reactivity.",
          prayerMatcher: /(ganesh|gayatri|shanti)/i,
          readTime: 4
        },
        {
          title: "Study rhythm for families and children",
          type: "family_practice",
          keyTakeaway: "Short, repeatable invocations work especially well for younger family members.",
          content:
            "For diaspora households, the most durable devotional habits are the simplest ones. A brief chant before school, study, or important work lets children experience prayer as part of daily rhythm rather than as an occasional ceremony.",
          prayerMatcher: /(ganesh|gayatri|pratah)/i,
          readTime: 5
        }
      ]
    }
  },
  {
    match: /shiva|mahadev/i,
    template: {
      completionBadge: "Seeker of Shiva",
      modules: [
        {
          title: "Shiva as stillness and surrender",
          type: "story",
          keyTakeaway: "Shiva prayer trains attention toward quiet, surrender, and inner steadiness.",
          content:
            "Shiva devotion is often marked by restraint, quiet repetition, and a willingness to become inwardly still. The prayer tradition creates room for healing, contemplation, and recovery from agitation rather than performance.",
          prayerMatcher: /(shiva|mrityunjaya|namah shivaya|nirvana)/i,
          readTime: 4
        },
        {
          title: "Panchakshara and healing mantras",
          type: "mantra_deep_dive",
          keyTakeaway: "Simple Shaiva mantras become powerful through consistency and focused intention.",
          content:
            "Whether the devotee uses Om Namah Shivaya or Maha Mrityunjaya, the effect comes from disciplined repetition and clear intention. These mantras are often used when families are praying for healing, release from fear, or steadiness in difficult periods.",
          prayerMatcher: /(mrityunjaya|shiva|namah shivaya)/i,
          readTime: 5
        },
        {
          title: "A practical Shaiva routine abroad",
          type: "family_practice",
          keyTakeaway: "A short weekday Shaiva routine is easier to sustain than irregular long sessions.",
          content:
            "A lamp, a mantra, and a fixed evening time can be enough to establish a meaningful Shaiva rhythm at home. What matters most is steadiness and sincerity, especially when work and family schedules are crowded.",
          prayerMatcher: /(shiva|mrityunjaya|shanti)/i,
          readTime: 4
        }
      ]
    }
  },
  {
    match: /saraswati/i,
    template: {
      completionBadge: "Saraswati learning circle",
      modules: [
        {
          title: "Saraswati and the discipline of learning",
          type: "story",
          keyTakeaway: "Learning, speech, and refined understanding are all devotional in Saraswati worship.",
          content:
            "Saraswati devotion is especially meaningful for students, artists, teachers, and families who want learning to remain sacred rather than purely competitive. Even a brief invocation before study can change the inner quality of effort.",
          prayerMatcher: /(saraswati|gayatri)/i,
          readTime: 4
        },
        {
          title: "Daily clarity through short mantra practice",
          type: "mantra_deep_dive",
          keyTakeaway: "Short clarity prayers work best when they are recited gently but consistently.",
          content:
            "Gayatri and Saraswati prayers are often used for clarity of mind, speech, and memory. In a busy household, the value lies in repetition that remains dignified and calm rather than rushed.",
          prayerMatcher: /(saraswati|gayatri|shanti)/i,
          readTime: 4
        },
        {
          title: "Passing language and prayer to children",
          type: "family_practice",
          keyTakeaway: "Small bilingual prayer habits help children inherit devotional memory naturally.",
          content:
            "When children hear a short daily verse in Sanskrit or Malayalam alongside English explanation, the practice becomes legible and lasting. Saraswati worship is one of the most natural bridges between devotion and learning.",
          prayerMatcher: /(saraswati|gayatri|shanti)/i,
          readTime: 5
        }
      ]
    }
  },
  {
    match: /lakshmi/i,
    template: {
      completionBadge: "Lakshmi household practice",
      modules: [
        {
          title: "Lakshmi beyond wealth",
          type: "story",
          keyTakeaway: "Lakshmi practice is as much about harmony and grace as material prosperity.",
          content:
            "Lakshmi devotion is often misunderstood as a narrow prayer for money. In living household practice, it also points toward order, gratitude, hospitality, emotional balance, and the kind of prosperity that helps a family care for one another well.",
          prayerMatcher: /(lakshmi|shanti|pratah)/i,
          readTime: 4
        },
        {
          title: "Weekly rhythm and simple home altar practice",
          type: "ritual_explanation",
          keyTakeaway: "A weekly day of focused prayer can be enough to keep a Lakshmi rhythm alive abroad.",
          content:
            "Friday worship, lamp lighting, and a short aarti are often more sustainable than elaborate ritual plans that never settle into habit. The point is to create a clean, welcoming rhythm of remembrance within the home.",
          prayerMatcher: /(lakshmi|shanti)/i,
          readTime: 4
        },
        {
          title: "Gratitude as devotional discipline",
          type: "family_practice",
          keyTakeaway: "Household gratitude can become a stable devotional practice rather than an abstract idea.",
          content:
            "Lakshmi prayer matures when gratitude becomes specific: food, health, home, and the ability to support one another. Families abroad often find this path especially grounding when life feels hurried or financially uncertain.",
          prayerMatcher: /(lakshmi|pratah|shanti)/i,
          readTime: 5
        }
      ]
    }
  },
  {
    match: /(krishna|vishnu)/i,
    template: {
      completionBadge: "Path of Vishnu bhakti",
      modules: [
        {
          title: "Steadiness in Vishnu devotion",
          type: "story",
          keyTakeaway: "Vishnu-oriented prayer emphasizes steadiness, trust, and continuity.",
          content:
            "Vishnu and Krishna devotion often helps families return to devotional steadiness rather than intensity. The path supports regular remembrance, emotional warmth, and trust in an order larger than immediate anxiety.",
          prayerMatcher: /(vishnu|krishna|shanti)/i,
          readTime: 4
        },
        {
          title: "Name recitation and loving remembrance",
          type: "mantra_deep_dive",
          keyTakeaway: "Repetition in bhakti deepens relationship, not just memory.",
          content:
            "Whether through Vishnu Sahasranama or a short Krishna aarti, repetition carries affection as well as discipline. These prayers are especially durable in family settings because they can be shared without becoming overly technical.",
          prayerMatcher: /(vishnu|krishna)/i,
          readTime: 5
        },
        {
          title: "Ekadashi, festivals, and family continuity",
          type: "ritual_explanation",
          keyTakeaway: "Calendar-aware practice helps devotional habits remain visible across the year.",
          content:
            "Festival preparation and observance days such as Ekadashi create recurring anchors for the household. For diaspora families, these calendar-linked moments often matter because they keep prayer from fading into the background of busy weeks.",
          prayerMatcher: /(vishnu|krishna|shanti)/i,
          readTime: 5
        }
      ]
    }
  },
  {
    match: /hanuman/i,
    template: {
      completionBadge: "Hanuman strength path",
      modules: [
        {
          title: "Hanuman as devotion in action",
          type: "story",
          keyTakeaway: "Hanuman represents strength, service, and unwavering devotional focus.",
          content:
            "Hanuman prayer is often chosen by devotees who need courage, perseverance, and mental resilience. The tradition frames strength as service and remembrance rather than aggression or ego.",
          prayerMatcher: /(hanuman|chalisa)/i,
          readTime: 4
        },
        {
          title: "Why the Chalisa endures",
          type: "mantra_deep_dive",
          keyTakeaway: "The Hanuman Chalisa remains powerful because it is memorable, repeatable, and emotionally direct.",
          content:
            "The Chalisa has stayed alive across generations because it is practical: it can be recited in moments of fear, travel, strain, or spiritual fatigue. Repetition builds familiarity, and familiarity makes prayer available under pressure.",
          prayerMatcher: /(hanuman|chalisa)/i,
          readTime: 5
        },
        {
          title: "Family courage and daily steadiness",
          type: "family_practice",
          keyTakeaway: "Hanuman practice helps households cultivate steadiness without dramatizing hardship.",
          content:
            "A short Hanuman recitation can become a family practice before school, travel, or demanding workdays. The emphasis is on grounded courage and steadiness rather than fear-driven ritual.",
          prayerMatcher: /(hanuman|shanti|pratah)/i,
          readTime: 4
        }
      ]
    }
  }
];

function normalizeValue(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function titleFromSlug(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sortPrayers(prayers: Prayer[]) {
  return prayers
    .slice()
    .sort((left, right) => (left.order || 999) - (right.order || 999) || left.title.en.localeCompare(right.title.en));
}

function resolveTemplate(slugOrName: string) {
  return fallbackTemplates.find((entry) => entry.match.test(slugOrName))?.template || {
    completionBadge: `Journey with ${titleFromSlug(slugOrName)}`,
    modules: [
      {
        title: `Meeting ${titleFromSlug(slugOrName)}`,
        type: "story",
        keyTakeaway: `${titleFromSlug(slugOrName)} devotion begins with regular remembrance.`,
        content:
          "This learning path introduces the deity through the prayers already present in the library. The goal is to help the devotee understand not only what to recite, but how that prayer sits within family rhythm, meaning, and devotional life.",
        readTime: 4
      },
      {
        title: "Building a daily prayer rhythm",
        type: "family_practice",
        keyTakeaway: "A short, regular rhythm supports continuity better than occasional intensity.",
        content:
          "Most families abroad benefit from simple practice: a fixed time, one short prayer, and a clear explanation of why it matters. This keeps the deity present in ordinary household time rather than confined to special occasions.",
        readTime: 4
      }
    ]
  };
}

function findLinkedPrayer(prayers: Prayer[], matcher?: RegExp) {
  if (!matcher) {
    return prayers[0];
  }
  return prayers.find((prayer) => matcher.test(`${prayer.title.en} ${prayer.slug}`)) || prayers[0];
}

function findDeity(id: string, prayers: Prayer[], deities: DeityDirectoryEntry[]) {
  const normalizedId = normalizeValue(id);
  const prayerDeity = prayers.find((prayer) => {
    const deity = prayer.deity;
    return deity && (normalizeValue(deity.slug) === normalizedId || normalizeValue(deity._id) === normalizedId);
  })?.deity;

  if (prayerDeity) {
    return prayerDeity;
  }

  const directoryMatch = deities.find((deity) => {
    return normalizeValue(deity.slug) === normalizedId || normalizeValue(deity._id) === normalizedId;
  });

  if (!directoryMatch) {
    return null;
  }

  return {
    _id: directoryMatch._id,
    slug: directoryMatch.slug,
    name: directoryMatch.name
  } satisfies Deity;
}

export function buildFallbackLearningPath(
  id: string,
  prayers: Prayer[],
  deities: DeityDirectoryEntry[] = []
): LearningPath | null {
  const deity = findDeity(id, prayers, deities);
  if (!deity) {
    return null;
  }

  const relatedPrayers = sortPrayers(
    prayers.filter((prayer) => {
      const prayerDeity = prayer.deity;
      if (!prayerDeity) return false;
      return (
        normalizeValue(prayerDeity.slug) === normalizeValue(deity.slug) ||
        normalizeValue(prayerDeity._id) === normalizeValue(deity._id)
      );
    })
  );

  if (!relatedPrayers.length) {
    return null;
  }

  const template = resolveTemplate(`${deity.slug} ${deity.name.en}`);
  const modules: LearningModule[] = template.modules.map((module, index) => {
    const linkedPrayer = findLinkedPrayer(relatedPrayers, module.prayerMatcher);
    return {
      _id: `${deity.slug || normalizeValue(deity.name.en)}-${index + 1}`,
      order: index + 1,
      title: module.title,
      type: module.type,
      content: module.content,
      keyTakeaway: module.keyTakeaway,
      linkedPrayer,
      readTime: module.readTime || 4,
      isLocked: false,
      isLockedByTier: false,
      isCompleted: false
    };
  });

  return {
    _id: `fallback-${deity.slug || deity._id}`,
    deity,
    modules,
    totalModules: modules.length,
    completionBadge: template.completionBadge,
    progress: {
      completedCount: 0,
      totalModules: modules.length
    }
  };
}

export async function resolveLearningPathData(id: string, token?: string | null) {
  const learningPath = await getLearningPath(id, token).catch(() => null);
  if (learningPath?.modules?.length) {
    return learningPath;
  }

  const [prayers, deities] = await Promise.all([
    getPrayers("?limit=108").catch(() => []),
    getDeities().catch(() => [])
  ]);

  return buildFallbackLearningPath(id, prayers, deities);
}

export async function resolveLearningModuleData(id: string, moduleId: string, token?: string | null) {
  const moduleData = await getLearningModule(id, moduleId, token).catch(() => null);
  if (moduleData?.module) {
    return moduleData as LearningModuleResponse;
  }

  const backendLearningPath = await getLearningPath(id, token).catch(() => null);
  if (backendLearningPath?.modules?.length) {
    return null;
  }

  const learningPath = await resolveLearningPathData(id, token);
  if (!learningPath) {
    return null;
  }

  const resolvedModule =
    learningPath.modules.find((module) => module._id === moduleId) ||
    learningPath.modules.find((module) => String(module.order) === moduleId);

  if (!resolvedModule) {
    return null;
  }

  return {
    deity: learningPath.deity,
    module: resolvedModule
  };
}
