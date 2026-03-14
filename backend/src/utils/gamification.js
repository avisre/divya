import { Prayer } from "../models/Prayer.js";
import { UserLotusPointEvent } from "../models/UserLotusPointEvent.js";
import { UserMilestone } from "../models/UserMilestone.js";
import { UserProgress } from "../models/UserProgress.js";

export const TIER_DEFINITIONS = [
  {
    key: "SEEKER",
    min: 0,
    max: 9,
    icon: "🌱",
    description: "You have begun. That is everything."
  },
  {
    key: "DEVOTEE",
    min: 10,
    max: 29,
    icon: "🪷",
    description: "A regular practice is taking shape."
  },
  {
    key: "SADHAKA",
    min: 30,
    max: 74,
    icon: "🔱",
    description: "Your practice has depth and rhythm."
  },
  {
    key: "ABHYASI",
    min: 75,
    max: 149,
    icon: "✨",
    description: "Consistent, committed, and growing."
  },
  {
    key: "STHITAPRAJNA",
    min: 150,
    max: Number.POSITIVE_INFINITY,
    icon: "🏛️",
    description: "Steady wisdom. The Gita's highest ideal."
  }
];

export const MILESTONE_DEFINITIONS = {
  FIRST_STEP: {
    key: "FIRST_STEP",
    name: "First step",
    toast: "Your first prayer. The hardest step is always the first.",
    pointsBonus: 10,
    actionType: "FIRST_PRAYER"
  },
  FAMILY_BOND: {
    key: "FAMILY_BOND",
    name: "Family bond",
    toast: "Your family prayed together. That moment is preserved.",
    pointsBonus: 5,
    actionType: "MILESTONE_BONUS"
  },
  SEVEN_DAY_RHYTHM: {
    key: "SEVEN_DAY_RHYTHM",
    name: "7-day rhythm",
    toast: "7 days of practice this month. A rhythm is forming.",
    pointsBonus: 8,
    actionType: "MILESTONE_BONUS"
  },
  SCRIPTURE_READER: {
    key: "SCRIPTURE_READER",
    name: "Scripture reader",
    toast: "You read the original scripture. That takes courage.",
    pointsBonus: 3,
    actionType: "MILESTONE_BONUS"
  },
  WORD_EXPLORER: {
    key: "WORD_EXPLORER",
    name: "Word explorer",
    toast: "Curiosity is a form of devotion.",
    pointsBonus: 2,
    actionType: "MILESTONE_BONUS"
  },
  FIRST_BOOKING: {
    key: "FIRST_BOOKING",
    name: "First booking",
    toast: "Your puja is in the temple queue. The Goddess knows your name.",
    pointsBonus: 15,
    actionType: "MILESTONE_BONUS"
  },
  LEARNING_COMPLETE: {
    key: "LEARNING_COMPLETE",
    name: "Learning complete",
    toast: "Journey complete. A real study, not a scroll.",
    pointsBonus: 20,
    actionType: "DEITY_PATH_COMPLETE"
  },
  FAMILY_TEACHER: {
    key: "FAMILY_TEACHER",
    name: "Family teacher",
    toast: "You brought your family into the practice. That is a gift.",
    pointsBonus: 5,
    actionType: "MILESTONE_BONUS"
  },
  DEEP_PRACTICE: {
    key: "DEEP_PRACTICE",
    name: "Deep practice",
    toast: "'Abhyasa' - sustained practice - is the Gita's path to mastery.",
    pointsBonus: 10,
    actionType: "MILESTONE_BONUS"
  },
  HUNDRED_LOTUS: {
    key: "HUNDRED_LOTUS",
    name: "Hundred lotus",
    toast: "100 lotus points. The practice has taken root.",
    pointsBonus: 0,
    actionType: "MILESTONE_BONUS"
  }
};

function normalizeId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

function monthKey(value, timezone = "UTC") {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit"
  }).format(date);
}

export function dayKey(value, timezone = "UTC") {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function getTierByPoints(points) {
  return (
    TIER_DEFINITIONS.find((tier) => points >= tier.min && points <= tier.max) ||
    TIER_DEFINITIONS[0]
  );
}

export function buildTierSummary(points) {
  const tier = getTierByPoints(points);
  const nextTier = TIER_DEFINITIONS.find((item) => item.min > tier.min) || null;
  if (!nextTier) {
    return {
      ...tier,
      totalPoints: points,
      nextTier: null,
      progressPercent: 100,
      pointsToNextTier: 0
    };
  }

  const span = Math.max(1, nextTier.min - tier.min);
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((points - tier.min) / span) * 100))
  );

  return {
    ...tier,
    totalPoints: points,
    nextTier: {
      key: nextTier.key,
      icon: nextTier.icon,
      min: nextTier.min,
      description: nextTier.description
    },
    progressPercent,
    pointsToNextTier: Math.max(0, nextTier.min - points)
  };
}

async function ensureProgress(userId) {
  let progress = await UserProgress.findOne({ user: userId });
  if (!progress) {
    progress = await UserProgress.create({ user: userId });
  }
  return progress;
}

async function sumUserLotusPoints(userId) {
  const result = await UserLotusPointEvent.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: "$points" } } }
  ]);
  return Number(result[0]?.total || 0);
}

async function createPointEvent({ userId, actionType, points, metadata = {}, uniqueKey = null }) {
  if (points === undefined || points === null) {
    return { event: null, created: false };
  }

  try {
    const event = await UserLotusPointEvent.create({
      user: userId,
      actionType,
      points,
      metadata,
      uniqueKey
    });
    return { event, created: true };
  } catch (error) {
    if (error?.code === 11000) {
      return { event: null, created: false };
    }
    throw error;
  }
}

function milestonePayload(milestone, earnedAt = new Date()) {
  return {
    key: milestone.key,
    name: milestone.name,
    toast: milestone.toast,
    pointsBonus: milestone.pointsBonus,
    earnedAt,
    actionType: milestone.actionType
  };
}

async function syncProgressSnapshot(userId, patch = {}) {
  const totalLotusPoints = await sumUserLotusPoints(userId);
  const progress = await ensureProgress(userId);
  Object.assign(progress, patch, {
    totalLotusPoints,
    updatedAt: new Date()
  });
  await progress.save();
  return progress;
}

export async function awardMilestone({ userId, milestoneKey, metadata = {} }) {
  const definition = MILESTONE_DEFINITIONS[milestoneKey];
  if (!definition) {
    return null;
  }

  try {
    const milestone = await UserMilestone.create({
      user: userId,
      milestoneKey,
      metadata
    });

    if (definition.pointsBonus > 0) {
      await createPointEvent({
        userId,
        actionType: definition.actionType,
        points: definition.pointsBonus,
        metadata: {
          ...metadata,
          milestoneKey
        },
        uniqueKey: `milestone:${milestoneKey}`
      });
    }

    await syncProgressSnapshot(userId);
    return milestonePayload(definition, milestone.earnedAt);
  } catch (error) {
    if (error?.code === 11000) {
      return null;
    }
    throw error;
  }
}

async function maybeAwardHundredLotus(userId) {
  const totalLotusPoints = await sumUserLotusPoints(userId);
  if (totalLotusPoints < 100) return null;
  return awardMilestone({ userId, milestoneKey: "HUNDRED_LOTUS" });
}

async function maybeAwardSevenDayRhythm(userId, timezone) {
  const now = new Date();
  const currentMonth = monthKey(now, timezone);
  const results = await UserLotusPointEvent.aggregate([
    {
      $match: {
        user: userId,
        actionType: { $in: ["PRAYER_OPENED", "PRAYER_COMPLETED"] }
      }
    },
    {
      $project: {
        dayKey: "$metadata.dayKey",
        monthKey: "$metadata.monthKey"
      }
    },
    { $match: { monthKey: currentMonth } },
    { $group: { _id: "$dayKey" } }
  ]);

  if (results.length >= 7) {
    return awardMilestone({ userId, milestoneKey: "SEVEN_DAY_RHYTHM" });
  }
  return null;
}

export async function recordPrayerOpened({ user, prayer }) {
  const timestamp = new Date();
  const timezone = user.timezone || "UTC";
  const uniqueKey = `open:${normalizeId(prayer._id)}:${dayKey(timestamp, timezone)}`;
  const metadata = {
    prayerId: normalizeId(prayer._id),
    prayerSlug: prayer.slug,
    dayKey: dayKey(timestamp, timezone),
    monthKey: monthKey(timestamp, timezone)
  };
  const { created } = await createPointEvent({
    userId: user._id,
    actionType: "PRAYER_OPENED",
    points: 1,
    metadata,
    uniqueKey
  });

  if (!created) {
    const stats = await buildGamificationSnapshot(user._id);
    return {
      pointsAwarded: 0,
      milestonesEarned: [],
      tierUpgrade: null,
      stats
    };
  }

  const beforeTier = getTierByPoints(await sumUserLotusPoints(user._id) - 1);
  await syncProgressSnapshot(user._id, {
    prayersOpenedCount: (await ensureProgress(user._id)).prayersOpenedCount + 1,
    lastPrayerOpenedAt: timestamp,
    lastOpenedPrayerId: prayer._id,
    lastOpenedPrayerSlug: prayer.slug
  });

  const milestonesEarned = [];
  const firstStep = await awardMilestone({ userId: user._id, milestoneKey: "FIRST_STEP" });
  if (firstStep) milestonesEarned.push(firstStep);
  const rhythm = await maybeAwardSevenDayRhythm(user._id, timezone);
  if (rhythm) milestonesEarned.push(rhythm);
  const hundred = await maybeAwardHundredLotus(user._id);
  if (hundred) milestonesEarned.push(hundred);

  const stats = await buildGamificationSnapshot(user._id);
  const tierUpgrade = beforeTier.key !== stats.tier.key ? { previousTier: beforeTier, currentTier: stats.tier } : null;

  return {
    pointsAwarded: 1 + milestonesEarned.reduce((sum, item) => sum + Number(item.pointsBonus || 0), 0),
    milestonesEarned,
    tierUpgrade,
    stats
  };
}

export async function recordPrayerInteraction({ user, prayer, kind, metadata = {} }) {
  const milestonesEarned = [];
  const timezone = user.timezone || "UTC";

  if (kind === "scripture_reader") {
    const milestone = await awardMilestone({
      userId: user._id,
      milestoneKey: "SCRIPTURE_READER",
      metadata: {
        prayerId: normalizeId(prayer._id),
        prayerSlug: prayer.slug,
        dayKey: dayKey(new Date(), timezone),
        ...metadata
      }
    });
    if (milestone) milestonesEarned.push(milestone);
  }

  if (kind === "word_explorer") {
    await createPointEvent({
      userId: user._id,
      actionType: "MILESTONE_BONUS",
      points: 0,
      metadata: {
        prayerId: normalizeId(prayer._id),
        prayerSlug: prayer.slug,
        kind,
        ...metadata
      }
    });

    const wordTapCount = await UserLotusPointEvent.countDocuments({
      user: user._id,
      "metadata.kind": "word_explorer"
    });

    if (wordTapCount >= 3) {
      const milestone = await awardMilestone({
        userId: user._id,
        milestoneKey: "WORD_EXPLORER",
        metadata: {
          prayerId: normalizeId(prayer._id),
          prayerSlug: prayer.slug
        }
      });
      if (milestone) milestonesEarned.push(milestone);
    }
  }

  const hundred = await maybeAwardHundredLotus(user._id);
  if (hundred) milestonesEarned.push(hundred);

  return {
    pointsAwarded: milestonesEarned.reduce((sum, item) => sum + Number(item.pointsBonus || 0), 0),
    milestonesEarned,
    tierUpgrade: null,
    stats: await buildGamificationSnapshot(user._id)
  };
}

export async function recordPrayerCompleted({
  user,
  prayer,
  durationSeconds,
  completedVia = "audio"
}) {
  const timestamp = new Date();
  const timezone = user.timezone || "UTC";
  const metadata = {
    prayerId: normalizeId(prayer._id),
    prayerSlug: prayer.slug,
    durationSeconds,
    completedVia,
    dayKey: dayKey(timestamp, timezone),
    monthKey: monthKey(timestamp, timezone)
  };

  const beforePoints = await sumUserLotusPoints(user._id);
  const { created } = await createPointEvent({
    userId: user._id,
    actionType: "PRAYER_COMPLETED",
    points: Number(prayer.xpReward || 0),
    metadata,
    uniqueKey: `complete:${normalizeId(prayer._id)}:${metadata.dayKey}:${completedVia}`
  });

  const existingCompletion = user.completedPrayers.find(
    (entry) => normalizeId(entry.prayerId) === normalizeId(prayer._id) && dayKey(entry.completedAt || timestamp, timezone) === metadata.dayKey
  );
  if (!existingCompletion) {
    user.completedPrayers.push({
      prayerId: prayer._id,
      completedAt: timestamp,
      durationSeconds
    });
    await user.save();
  }

  const progress = await ensureProgress(user._id);
  if (created) {
    progress.prayersCompleted = Number(progress.prayersCompleted || 0) + 1;
    progress.prayersCompletedCount = Number(progress.prayersCompletedCount || 0) + 1;
    progress.minutesPrayed = Number(progress.minutesPrayed || 0) + Math.ceil(durationSeconds / 60);
    progress.lastPrayerAt = timestamp;
    await syncProgressSnapshot(user._id, progress.toObject());
  }

  const completionCount = await UserLotusPointEvent.countDocuments({
    user: user._id,
    actionType: "PRAYER_COMPLETED",
    "metadata.prayerId": normalizeId(prayer._id)
  });

  const milestonesEarned = [];
  if (completionCount >= 5) {
    const milestone = await awardMilestone({
      userId: user._id,
      milestoneKey: "DEEP_PRACTICE",
      metadata: {
        prayerId: normalizeId(prayer._id),
        prayerSlug: prayer.slug
      }
    });
    if (milestone) milestonesEarned.push(milestone);
  }

  const rhythm = await maybeAwardSevenDayRhythm(user._id, timezone);
  if (rhythm) milestonesEarned.push(rhythm);
  const hundred = await maybeAwardHundredLotus(user._id);
  if (hundred) milestonesEarned.push(hundred);

  const afterPoints = await sumUserLotusPoints(user._id);
  const beforeTier = getTierByPoints(beforePoints);
  const afterTier = getTierByPoints(afterPoints);

  return {
    pointsAwarded: (created ? Number(prayer.xpReward || 0) : 0) + milestonesEarned.reduce((sum, item) => sum + Number(item.pointsBonus || 0), 0),
    milestonesEarned,
    tierUpgrade: beforeTier.key !== afterTier.key ? { previousTier: beforeTier, currentTier: afterTier } : null,
    stats: await buildGamificationSnapshot(user._id)
  };
}

export async function recordLearningModuleCompleted({ user, deity, path, module }) {
  const timestamp = new Date();
  const beforePoints = await sumUserLotusPoints(user._id);
  const uniqueKey = `module:${normalizeId(deity._id)}:${module.order}`;
  const { created } = await createPointEvent({
    userId: user._id,
    actionType: "MODULE_READ",
    points: 2,
    uniqueKey,
    metadata: {
      deityId: normalizeId(deity._id),
      deitySlug: deity.slug,
      moduleId: normalizeId(module._id),
      moduleOrder: module.order
    }
  });

  const progress = await ensureProgress(user._id);
  if (created) {
    progress.modulesCompletedCount = Number(progress.modulesCompletedCount || 0) + 1;
    await syncProgressSnapshot(user._id, progress.toObject());
  }

  const milestonesEarned = [];
  const completedSet = new Set(
    (user.learningProgress.find((entry) => normalizeId(entry.deityId) === normalizeId(deity._id))?.completedModules || []).map(Number)
  );
  if (completedSet.size >= 5 || completedSet.size >= Number(path.totalModules || path.modules.length || 0)) {
    const milestone = await awardMilestone({
      userId: user._id,
      milestoneKey: "LEARNING_COMPLETE",
      metadata: {
        deityId: normalizeId(deity._id),
        deitySlug: deity.slug
      }
    });
    if (milestone) milestonesEarned.push(milestone);
  }

  const hundred = await maybeAwardHundredLotus(user._id);
  if (hundred) milestonesEarned.push(hundred);

  const afterPoints = await sumUserLotusPoints(user._id);
  return {
    pointsAwarded: (created ? 2 : 0) + milestonesEarned.reduce((sum, item) => sum + Number(item.pointsBonus || 0), 0),
    milestonesEarned,
    tierUpgrade:
      getTierByPoints(beforePoints).key !== getTierByPoints(afterPoints).key
        ? { previousTier: getTierByPoints(beforePoints), currentTier: getTierByPoints(afterPoints) }
        : null,
    stats: await buildGamificationSnapshot(user._id)
  };
}

export async function recordFamilyTeacher({ userId, prayerId, prayerSlug }) {
  return awardMilestone({
    userId,
    milestoneKey: "FAMILY_TEACHER",
    metadata: {
      prayerId: normalizeId(prayerId),
      prayerSlug
    }
  });
}

export async function recordSharedSessionCompleted({ participantIds, prayerName, sessionId }) {
  const results = [];

  for (const userId of participantIds) {
    const beforePoints = await sumUserLotusPoints(userId);
    const { created } = await createPointEvent({
      userId,
      actionType: "FAMILY_SESSION",
      points: 3,
      uniqueKey: `family-session:${normalizeId(sessionId)}:${normalizeId(userId)}`,
      metadata: {
        sessionId: normalizeId(sessionId),
        prayerName
      }
    });

    const progress = await ensureProgress(userId);
    if (created) {
      progress.familySessionsCount = Number(progress.familySessionsCount || 0) + 1;
      await syncProgressSnapshot(userId, progress.toObject());
    }

    const milestonesEarned = [];
    const familyBond = await awardMilestone({
      userId,
      milestoneKey: "FAMILY_BOND",
      metadata: {
        sessionId: normalizeId(sessionId),
        prayerName
      }
    });
    if (familyBond) milestonesEarned.push(familyBond);
    const hundred = await maybeAwardHundredLotus(userId);
    if (hundred) milestonesEarned.push(hundred);

    const afterPoints = await sumUserLotusPoints(userId);
    results.push({
      userId: normalizeId(userId),
      pointsAwarded: (created ? 3 : 0) + milestonesEarned.reduce((sum, item) => sum + Number(item.pointsBonus || 0), 0),
      milestonesEarned,
      tierUpgrade:
        getTierByPoints(beforePoints).key !== getTierByPoints(afterPoints).key
          ? { previousTier: getTierByPoints(beforePoints), currentTier: getTierByPoints(afterPoints) }
          : null
    });
  }

  return results;
}

export async function recordBookingMade({ userId, bookingId, bookingReference, isFirstBooking }) {
  const beforePoints = await sumUserLotusPoints(userId);
  const milestonesEarned = [];

  if (isFirstBooking) {
    const { created } = await createPointEvent({
      userId,
      actionType: "BOOKING_MADE",
      points: 5,
      uniqueKey: `booking:${normalizeId(bookingId)}`,
      metadata: {
        bookingId: normalizeId(bookingId),
        bookingReference
      }
    });
    if (created) {
      const firstBooking = await awardMilestone({
        userId,
        milestoneKey: "FIRST_BOOKING",
        metadata: {
          bookingId: normalizeId(bookingId),
          bookingReference
        }
      });
      if (firstBooking) milestonesEarned.push(firstBooking);
    }
  }

  const hundred = await maybeAwardHundredLotus(userId);
  if (hundred) milestonesEarned.push(hundred);

  const afterPoints = await sumUserLotusPoints(userId);
  await syncProgressSnapshot(userId);

  return {
    pointsAwarded: (isFirstBooking ? 5 : 0) + milestonesEarned.reduce((sum, item) => sum + Number(item.pointsBonus || 0), 0),
    milestonesEarned,
    tierUpgrade:
      getTierByPoints(beforePoints).key !== getTierByPoints(afterPoints).key
        ? { previousTier: getTierByPoints(beforePoints), currentTier: getTierByPoints(afterPoints) }
        : null,
    stats: await buildGamificationSnapshot(userId)
  };
}

export async function buildGamificationSnapshot(userId) {
  const [progress, totalLotusPoints, earnedMilestones, prayers] = await Promise.all([
    UserProgress.findOne({ user: userId }).lean(),
    sumUserLotusPoints(userId),
    UserMilestone.find({ user: userId }).sort({ earnedAt: 1 }).lean(),
    Prayer.find({}, "_id slug").lean()
  ]);

  const now = new Date();
  const currentMonth = monthKey(now);
  const practiceDays = await UserLotusPointEvent.aggregate([
    {
      $match: {
        user: userId,
        actionType: { $in: ["PRAYER_OPENED", "PRAYER_COMPLETED"] }
      }
    },
    {
      $project: {
        dayKey: "$metadata.dayKey",
        monthKey: "$metadata.monthKey"
      }
    },
    { $match: { monthKey: currentMonth } },
    { $group: { _id: "$dayKey" } }
  ]);

  const prayerSlugById = new Map(prayers.map((prayer) => [normalizeId(prayer._id), prayer.slug]));

  return {
    totalLotusPoints,
    tier: buildTierSummary(totalLotusPoints),
    prayersOpenedCount: Number(progress?.prayersOpenedCount || 0),
    prayersCompletedCount: Number(progress?.prayersCompletedCount || progress?.prayersCompleted || 0),
    modulesCompletedCount: Number(progress?.modulesCompletedCount || 0),
    familySessionsCount: Number(progress?.familySessionsCount || 0),
    pujaBookingsCount: Number(progress?.pujaBookingsCount || 0),
    videosWatched: Number(progress?.videosWatched || 0),
    daysPracticedThisMonth: practiceDays.length,
    lastOpenedPrayerSlug:
      progress?.lastOpenedPrayerSlug ||
      prayerSlugById.get(normalizeId(progress?.lastOpenedPrayerId)) ||
      "",
    milestones: earnedMilestones.map((milestone) => {
      const definition = MILESTONE_DEFINITIONS[milestone.milestoneKey];
      return {
        key: milestone.milestoneKey,
        name: definition?.name || milestone.milestoneKey,
        toast: definition?.toast || "",
        pointsBonus: definition?.pointsBonus || 0,
        earnedAt: milestone.earnedAt,
        metadata: milestone.metadata || {}
      };
    })
  };
}
