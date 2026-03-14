export type LocalizedText = {
  en: string;
  ml?: string;
  sa?: string;
};

export type Deity = {
  _id: string;
  id?: string;
  slug: string;
  name: LocalizedText;
  shortDescription?: string;
  fullDescription?: string;
  pronunciationGuide?: string;
  tradition?: string;
  iconUrl?: string;
  imageUrl?: string;
  order?: number;
};

export type PrayerVerseTiming = {
  lineIndex: number;
  startMs: number;
  endMs: number;
};

export type PrayerGlossaryEntry = {
  word: string;
  transliteration?: string | null;
  meaning?: string | null;
};

export type PrayerVerse = {
  number: number;
  type?: string | null;
  script?: string | null;
  iast?: string | null;
  meaning?: string | null;
  audioStartSec?: number | null;
  nameDevanagari?: string | null;
  nameIast?: string | null;
  meaningWordByWord?: string | null;
  meaningSummary?: string | null;
};

export type Prayer = {
  _id: string;
  id?: string;
  slug: string;
  externalId?: string;
  deity?: Deity;
  title: LocalizedText;
  type: string;
  difficulty: string;
  durationMinutes: number;
  plainStory?: string | null;
  wordGlossary?: PrayerGlossaryEntry[];
  familyContext?: string | null;
  beginnerTip?: string | null;
  nriRelevance?: string | null;
  verseCount?: number;
  verses?: PrayerVerse[];
  xpReward?: number;
  firstLinePreview?: string | null;
  transliteration?: string | null;
  content: {
    devanagari?: string | null;
    malayalam?: string | null;
    english?: string | null;
  };
  iast?: string | null;
  beginnerNote?: string | null;
  meaning?: string | null;
  audioUrl?: string | null;
  verseTimings?: PrayerVerseTiming[];
  coverImageUrl?: string | null;
  recommendedRepetitions?: number[];
  isPremium?: boolean;
  isFeatured?: boolean;
  requiredTier?: "free" | "bhakt" | "seva";
  entitled?: boolean;
  tags?: string[];
  order?: number;
};

export type PrayerAudioMetadata = {
  prayerId: string;
  url: string | null;
  directUrl?: string | null;
  streamUrl: string | null;
  codec: string;
  durationSeconds: number;
  licenseTag: string;
  qualityLabel: string;
  sourceLabel: string;
  checksumSha256?: string | null;
  version: number;
  requiredTier: "free" | "bhakt" | "seva";
  entitled: boolean;
  audioComingSoon: boolean;
  audioComingSoonSubscribed: boolean;
};

export type Temple = {
  _id: string;
  id?: string;
  name: LocalizedText;
  deity?: Deity;
  shortDescription?: string;
  fullDescription?: string;
  significance?: string;
  tradition?: string;
  images?: string[];
  heroImage?: string;
  liveStreamUrl?: string;
  nriNote?: string;
  location?: {
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  timings?: {
    pujas?: Array<{
      name: string;
      nameML?: string;
      timeIST: string;
      description?: string;
    }>;
  };
  panchangLocation?: {
    lat: number;
    lng: number;
    timezone: string;
  };
};

export type Puja = {
  _id: string;
  id?: string;
  temple?: Temple;
  deity?: Deity;
  name: LocalizedText;
  type: string;
  description?: {
    short?: string;
    full?: string;
    whatHappens?: string;
    nriNote?: string;
  };
  duration?: number;
  pricing?: Record<string, number>;
  displayPrice?: { amount: number; currency: string };
  benefits?: string[];
  bestFor?: string[];
  requirements?: string[];
  isWaitlistOnly?: boolean;
  waitlistCount?: number;
  estimatedWaitWeeks?: number;
  videoDelivered?: boolean;
  videoNote?: string;
  prasadAvailable?: boolean;
  prasadNote?: string;
  order?: number;
  isActive?: boolean;
};

export type FestivalPrepStep = {
  daysBefore: number;
  title: string;
  content: string;
  prayers?: Prayer[];
  diasporaNote?: string;
};

export type Festival = {
  _id: string;
  slug: string;
  name: LocalizedText;
  description: string;
  significance: string;
  keralaNote?: string;
  monthHint?: string;
  startDate?: string;
  preparationDays?: number;
  prepJourney?: FestivalPrepStep[];
  dayOfRituals?: Array<{
    time: string;
    ritual: string;
    prayer?: Prayer;
    duration?: number;
  }>;
  communityNote?: string;
  featuredPrayer?: Prayer;
  deity?: Deity;
  startsInDays?: number;
};

export type Panchang = {
  date: string;
  timezone: string;
  referenceLocation?: string;
  sunrise?: string;
  sunset?: string;
  festivals?: Array<string | Festival>;
  infoTooltip?: string;
  tithi: {
    number: number;
    name: string;
    paksha?: string;
    endsAt?: string;
  };
  nakshatra: {
    number?: number;
    name: string;
    deity?: string;
    endsAt?: string;
  };
  rahuKaal?: {
    start?: string;
    end?: string;
  };
  dailyGuidance?: {
    overall?: string;
    goodFor?: string[];
    avoidFor?: string[];
    auspiciousWindow?: string;
    rahuKaalWarning?: string;
  };
  festivalPrep?: Array<{
    festivalId: string;
    slug: string;
    name: LocalizedText;
    startsInDays: number;
    preparationDays: number;
    prepStep?: FestivalPrepStep | null;
    dayOfRituals?: Festival["dayOfRituals"];
    communityNote?: string | null;
  }>;
};

export type UserStreak = {
  current: number;
  longest: number;
  lastPrayedAt?: string;
  totalDaysEver?: number;
};

export type Subscription = {
  tier: "free" | "bhakt" | "seva";
  expiresAt?: string;
  platform?: string;
  priceId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: string | null;
  interval?: "month" | "year" | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
};

export type BillingInterval = "month" | "year";

export type BillingPriceOption = {
  amountCents: number;
  currency: string;
  interval: BillingInterval;
  envKey: string;
  lookupKey: string;
  savingsLabel?: string;
  priceId: string | null;
  active: boolean;
};

export type BillingPlan = {
  tier: "free" | "bhakt" | "seva";
  name: string;
  summary: string;
  badge?: string | null;
  cta: string;
  footnote: string;
  perks: string[];
  prices: Partial<Record<BillingInterval, BillingPriceOption>>;
};

export type BillingCatalog = {
  enabled: boolean;
  subscriptionsConfigured: boolean;
  plans: BillingPlan[];
  currentSubscription?: {
    tier: "free" | "bhakt" | "seva";
    status: string;
    interval: BillingInterval | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    name: string;
  } | null;
};

export type UserSession = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  country?: string;
  timezone?: string;
  currency?: string;
  isGuest?: boolean;
  onboarding?: {
    prayerFrequency?: string;
    purpose?: string;
    tradition?: string;
    completedAt?: string;
  };
  preferredLanguage?: string;
  prayerReminders?: {
    morningEnabled?: boolean;
    morningTime?: string;
    eveningEnabled?: boolean;
    eveningTime?: string;
    festivalAlerts?: boolean;
    reengagementEmails?: boolean;
  };
  subscription?: Subscription;
  streak?: UserStreak;
  learningProgress?: Array<{
    deityId: string;
    completedModules: number[];
    lastAccessedAt?: string;
  }>;
  sharedSessions?: Array<{
    sessionId: string;
    prayerName: string;
    participantNames: string[];
    completedAt?: string;
  }>;
  giftsGiven?: string[];
  giftsReceived?: string[];
  gamification?: GamificationStats;
};

export type AuthResponse = {
  token: string;
  user: UserSession;
};

export type PrayerRecommendation = {
  prayer: Prayer | null;
  reason: string;
  tithi: Panchang["tithi"] | null;
  festival: string | null;
};

export type PujaBooking = {
  _id: string;
  bookingReference: string;
  status: "waitlisted" | "confirmed" | "in_progress" | "completed" | "video_ready" | "cancelled";
  devoteeName: string;
  gothram?: string;
  nakshatra?: string;
  prayerIntention?: string;
  waitlistPosition?: number;
  scheduledDate?: string;
  scheduledTimeIST?: string;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  presentedAmount?: number;
  presentedCurrency?: string;
  createdAt: string;
  videoWatchCount?: number;
  videoShareUrl?: string;
  puja?: Puja;
  temple?: Temple;
  giftDetails?: {
    isGift?: boolean;
    recipientName?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    personalMessage?: string;
    giftOccasion?: string;
  };
};

export type LearningPath = {
  _id: string;
  deity: Deity;
  modules: Array<{
    _id: string;
    order: number;
    title: string;
    type: string;
    content: string;
    keyTakeaway: string;
    linkedPrayer?: Prayer;
    readTime?: number;
    isLocked?: boolean;
    isLockedByTier?: boolean;
    isCompleted?: boolean;
  }>;
  totalModules: number;
  completionBadge: string;
  progress?: {
    completedCount: number;
    totalModules: number;
  };
};

export type SharedPrayerSession = {
  _id: string;
  hostUserId: string;
  prayerId: Prayer | string;
  sessionCode: string;
  status: "waiting" | "active" | "completed";
  startedAt?: string;
  completedAt?: string;
  currentVerseIndex?: number;
  currentRepetition?: number;
  totalRepetitions?: number;
  participants: Array<{
    userId: string;
    name: string;
    joinedAt: string;
    leftAt?: string;
    isActive: boolean;
  }>;
};

export type Stats = {
  prayersCompleted: number;
  minutesPrayed: number;
  streakDays?: number;
  longestStreakDays?: number;
  pujaBookingsCount?: number;
  totalLotusPoints?: number;
  prayersOpenedCount?: number;
  prayersCompletedCount?: number;
  modulesCompletedCount?: number;
  familySessionsCount?: number;
  daysPracticedThisMonth?: number;
  videosWatched?: number;
  lastOpenedPrayerSlug?: string;
  tier?: GamificationTier;
  milestones?: GamificationMilestone[];
};

export type GamificationTier = {
  key: string;
  min: number;
  max?: number;
  icon: string;
  description: string;
  totalPoints: number;
  nextTier?: {
    key: string;
    icon: string;
    min: number;
    description: string;
  } | null;
  progressPercent: number;
  pointsToNextTier: number;
};

export type GamificationMilestone = {
  key: string;
  name: string;
  toast: string;
  pointsBonus: number;
  earnedAt?: string;
  metadata?: Record<string, unknown>;
};

export type GamificationStats = Stats & {
  tier: GamificationTier;
  milestones: GamificationMilestone[];
};

export type GamificationResult = {
  pointsAwarded: number;
  milestonesEarned: GamificationMilestone[];
  tierUpgrade?: {
    previousTier: Omit<GamificationTier, "totalPoints" | "nextTier" | "progressPercent" | "pointsToNextTier">;
    currentTier: Omit<GamificationTier, "totalPoints" | "nextTier" | "progressPercent" | "pointsToNextTier">;
  } | null;
  stats: GamificationStats;
};

export type ApiErrorPayload = {
  message?: string;
  code?: string;
};
