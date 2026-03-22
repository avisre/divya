import crypto from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getFallbackPrayer, getFallbackPuja } from "./public-fallbacks";
import type {
  AuthResponse,
  GamificationResult,
  PujaBooking,
  SharedPrayerSession,
  UserSession
} from "./types";

type LocalUserRecord = UserSession & {
  password: string;
};

type LocalBackendStore = {
  usersById: Map<string, LocalUserRecord>;
  usersByEmail: Map<string, string>;
  sessions: Map<string, string>;
  prayerSessions: Map<string, SharedPrayerSession>;
  bookings: Map<string, PujaBooking>;
};

const LOCAL_SESSION_PREFIX = "local-session:";
const LOCAL_STORE_PATH = path.resolve(process.cwd(), ".local-dev-backend.json");
const DEFAULT_GAMIFICATION_TIER = {
  key: "lotus-seed",
  min: 0,
  icon: "Om",
  description: "Beginning your devotional rhythm.",
  totalPoints: 0,
  nextTier: null,
  progressPercent: 0,
  pointsToNextTier: 0
};

declare global {
  var __prarthanaLocalBackendStore: LocalBackendStore | undefined;
}

function createStore(): LocalBackendStore {
  return {
    usersById: new Map<string, LocalUserRecord>(),
    usersByEmail: new Map<string, string>(),
    sessions: new Map<string, string>(),
    prayerSessions: new Map<string, SharedPrayerSession>(),
    bookings: new Map<string, PujaBooking>()
  };
}

function persistenceEnabled() {
  return !process.env.VITEST && process.env.NODE_ENV !== "test";
}

function persistStore(store: LocalBackendStore) {
  if (!persistenceEnabled()) {
    return;
  }

  writeFileSync(
    LOCAL_STORE_PATH,
    JSON.stringify(
      {
        users: Array.from(store.usersById.values()),
        sessions: Array.from(store.sessions.entries()),
        prayerSessions: Array.from(store.prayerSessions.values()),
        bookings: Array.from(store.bookings.values())
      },
      null,
      2
    ),
    "utf8"
  );
}

function hydrateStore(): LocalBackendStore {
  if (!persistenceEnabled() || !existsSync(LOCAL_STORE_PATH)) {
    return createStore();
  }

  try {
    const payload = JSON.parse(readFileSync(LOCAL_STORE_PATH, "utf8")) as {
      users?: LocalUserRecord[];
      sessions?: Array<[string, string]>;
      prayerSessions?: SharedPrayerSession[];
      bookings?: PujaBooking[];
    };
    const users = Array.isArray(payload.users) ? payload.users : [];

    return {
      usersById: new Map(users.map((user) => [user.id, user])),
      usersByEmail: new Map(users.map((user) => [user.email, user.id])),
      sessions: new Map(Array.isArray(payload.sessions) ? payload.sessions : []),
      prayerSessions: new Map(
        Array.isArray(payload.prayerSessions)
          ? payload.prayerSessions.map((session) => [session.sessionCode, session])
          : []
      ),
      bookings: new Map(
        Array.isArray(payload.bookings)
          ? payload.bookings.map((booking) => [booking._id, booking])
          : []
      )
    };
  } catch {
    return createStore();
  }
}

function getStore() {
  if (!globalThis.__prarthanaLocalBackendStore) {
    globalThis.__prarthanaLocalBackendStore = hydrateStore();
  }

  return globalThis.__prarthanaLocalBackendStore;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function emptyGamificationResult(): GamificationResult {
  return {
    pointsAwarded: 0,
    milestonesEarned: [],
    tierUpgrade: null,
    stats: {
      prayersCompleted: 0,
      minutesPrayed: 0,
      tier: DEFAULT_GAMIFICATION_TIER,
      milestones: []
    }
  };
}

function normalizeSessionUser(user: LocalUserRecord): UserSession {
  const { password: _password, ...sessionUser } = user;
  return {
    ...sessionUser,
    guidedFlow: sessionUser.guidedFlow || null,
    familyName: sessionUser.familyName || "",
    familyNameSkipped: Boolean(sessionUser.familyNameSkipped),
    subscription: sessionUser.subscription || {
      tier: "free",
      status: "active",
      interval: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null
    },
    sharedSessions: sessionUser.sharedSessions || [],
    giftsGiven: sessionUser.giftsGiven || [],
    giftsReceived: sessionUser.giftsReceived || [],
    gamification:
      sessionUser.gamification || {
        prayersCompleted: 0,
        minutesPrayed: 0,
        tier: DEFAULT_GAMIFICATION_TIER,
        milestones: []
      }
  };
}

function createLocalUser(payload: Record<string, unknown>): LocalUserRecord {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: String(payload.name || "Devotee").trim() || "Devotee",
    email: String(payload.email || "").trim().toLowerCase(),
    password: String(payload.password || ""),
    role: "user",
    country: String(payload.country || "").trim() || "United States",
    timezone: String(payload.timezone || "").trim() || "Asia/Kolkata",
    currency: "GBP",
    welcomeSeenAt: undefined,
    familyName: "",
    familyNameSkipped: false,
    guidedFlow: null,
    preferredLanguage: "English",
    prayerReminders: {
      morningEnabled: false,
      morningTime: "06:30",
      eveningEnabled: false,
      eveningTime: "19:00",
      festivalAlerts: true,
      reengagementEmails: false
    },
    subscription: {
      tier: "free",
      status: "active",
      interval: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      currentPeriodStart: now
    },
    sharedSessions: [],
    giftsGiven: [],
    giftsReceived: [],
    gamification: {
      prayersCompleted: 0,
      minutesPrayed: 0,
      tier: DEFAULT_GAMIFICATION_TIER,
      milestones: []
    }
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBody(body: BodyInit | null | undefined) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  if (body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries());
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return Object.fromEntries(body.entries());
  }

  if (body instanceof ArrayBuffer) {
    return parseBody(new TextDecoder().decode(body));
  }

  if (ArrayBuffer.isView(body)) {
    return parseBody(new TextDecoder().decode(body));
  }

  return {};
}

function getUserFromToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const store = getStore();
  const userId = store.sessions.get(token);
  if (!userId) {
    return null;
  }

  return store.usersById.get(userId) || null;
}

function requireLocalUser(token: string | null | undefined) {
  const user = getUserFromToken(token);
  if (!user) {
    return {
      user: null,
      response: json({ message: "Authentication required." }, 401)
    };
  }

  return { user, response: null };
}

function mergePrayerReminders(
  current: UserSession["prayerReminders"],
  incoming: unknown
): UserSession["prayerReminders"] {
  if (!isObject(incoming)) {
    return current;
  }

  return {
    ...current,
    ...incoming
  };
}

function updateLocalUser(user: LocalUserRecord, patch: Record<string, unknown>) {
  if (typeof patch.name === "string") {
    user.name = patch.name.trim() || user.name;
  }
  if (typeof patch.country === "string") {
    user.country = patch.country.trim() || user.country;
  }
  if (typeof patch.timezone === "string") {
    user.timezone = patch.timezone.trim() || user.timezone;
  }
  if (typeof patch.familyName === "string") {
    user.familyName = patch.familyName.trim();
  }
  if (typeof patch.familyNameSkipped === "boolean") {
    user.familyNameSkipped = patch.familyNameSkipped;
  }
  if (typeof patch.welcomeSeenAt === "string") {
    user.welcomeSeenAt = patch.welcomeSeenAt;
  }
  if (typeof patch.preferredLanguage === "string") {
    user.preferredLanguage = patch.preferredLanguage;
  }
  if (isObject(patch.guidedFlow)) {
    user.guidedFlow = {
      active: Boolean(patch.guidedFlow.active),
      currentStep: Number(patch.guidedFlow.currentStep || 1),
      completedSteps: Array.isArray(patch.guidedFlow.completedSteps)
        ? patch.guidedFlow.completedSteps.map((value) => Number(value)).filter(Number.isFinite)
        : [],
      startedAt:
        typeof patch.guidedFlow.startedAt === "string" ? patch.guidedFlow.startedAt : null,
      completedAt:
        typeof patch.guidedFlow.completedAt === "string" ? patch.guidedFlow.completedAt : null,
      exitedAt: typeof patch.guidedFlow.exitedAt === "string" ? patch.guidedFlow.exitedAt : null,
      exitedOnStep:
        typeof patch.guidedFlow.exitedOnStep === "number" ? patch.guidedFlow.exitedOnStep : null
    };
  }

  user.prayerReminders = mergePrayerReminders(user.prayerReminders, patch.prayerReminders);
}

function createLocalSession(user: LocalUserRecord): AuthResponse {
  const store = getStore();
  const token = `${LOCAL_SESSION_PREFIX}${crypto.randomUUID()}`;
  store.sessions.set(token, user.id);
  persistStore(store);
  return {
    token,
    user: normalizeSessionUser(user)
  };
}

function randomCode(length: number) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, length)
    .toUpperCase();
}

async function createBooking(
  token: string | null | undefined,
  payload: Record<string, unknown>,
  isGift: boolean
) {
  const { user, response } = requireLocalUser(token);
  if (!user) {
    return response;
  }

  const store = getStore();
  const pujaId = String(payload.pujaId || payload.puja || "abhishekam");
  const puja = getFallbackPuja(pujaId, "GBP");
  const bookingId = crypto.randomUUID();
  const devoteeName =
    String(payload.devoteeName || payload.recipientName || user.familyName || user.name).trim() ||
    user.name;
  const booking: PujaBooking = {
    _id: bookingId,
    bookingReference: `PRA-${bookingId.slice(0, 8).toUpperCase()}`,
    status: "waitlisted",
    devoteeName,
    gothram: typeof payload.gothram === "string" ? payload.gothram : "",
    nakshatra: typeof payload.nakshatra === "string" ? payload.nakshatra : "",
    prayerIntention: typeof payload.prayerIntention === "string" ? payload.prayerIntention : "",
    createdAt: new Date().toISOString(),
    scheduledDate:
      typeof payload.preferredDate === "string" && payload.preferredDate ? payload.preferredDate : undefined,
    presentedAmount: puja?.displayPrice?.amount,
    presentedCurrency: puja?.displayPrice?.currency,
    puja: puja || undefined,
    temple: puja?.temple,
    giftDetails: isGift
      ? {
          isGift: true,
          recipientName: typeof payload.recipientName === "string" ? payload.recipientName : "",
          recipientEmail: typeof payload.recipientEmail === "string" ? payload.recipientEmail : "",
          personalMessage: typeof payload.giftMessage === "string" ? payload.giftMessage : ""
        }
      : undefined
  };

  store.bookings.set(bookingId, booking);
  if (isGift) {
    user.giftsGiven = [...(user.giftsGiven || []), bookingId];
  }
  persistStore(store);

  return json({ booking });
}

export function isLocalBackendToken(token: string | null | undefined) {
  return String(token || "").startsWith(LOCAL_SESSION_PREFIX);
}

export async function handleLocalBackendRequest(
  path: string,
  options: RequestInit & { token?: string | null } = {}
) {
  const method = String(options.method || "GET").toUpperCase();
  const normalizedPath = path.split("?")[0] || "/";
  const segments = normalizedPath.replace(/^\/+/, "").split("/").filter(Boolean);
  const payload = parseBody(options.body);
  const store = getStore();

  if (segments[0] === "auth" && segments[1] === "register" && method === "POST") {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");

    if (!email || !password || password.length < 8) {
      return json({ message: "Name, email, and an 8 character password are required." }, 400);
    }
    if (store.usersByEmail.has(email)) {
      return json({ message: "An account with that email already exists." }, 409);
    }

    const user = createLocalUser(payload);
    store.usersById.set(user.id, user);
    store.usersByEmail.set(email, user.id);
    persistStore(store);

    return json(createLocalSession(user));
  }

  if (segments[0] === "auth" && segments[1] === "login" && method === "POST") {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const userId = store.usersByEmail.get(email);
    const user = userId ? store.usersById.get(userId) : null;

    if (!user || user.password !== password) {
      return json({ message: "Invalid email or password." }, 401);
    }

    return json(createLocalSession(user));
  }

  if (segments[0] === "auth" && segments[1] === "me" && method === "GET") {
    const user = getUserFromToken(options.token);
    if (!user) {
      return json({ message: "Authentication required." }, 401);
    }

    return json({ user: normalizeSessionUser(user) });
  }

  if (segments[0] === "users" && segments[1] === "profile" && method === "PUT") {
    const { user, response } = requireLocalUser(options.token);
    if (!user) {
      return response;
    }

    updateLocalUser(user, payload);
    persistStore(store);
    return json({ user: normalizeSessionUser(user) });
  }

  if (segments[0] === "users" && segments[1] === "prayer-sessions" && method === "GET") {
    const { user, response } = requireLocalUser(options.token);
    if (!user) {
      return response;
    }

    const sessions = Array.from(store.prayerSessions.values()).filter(
      (session) =>
        session.hostUserId === user.id ||
        session.participants.some((participant) => participant.userId === user.id)
    );
    return json(sessions);
  }

  if (segments[0] === "prayer-sessions" && segments.length === 1 && method === "POST") {
    const { user, response } = requireLocalUser(options.token);
    if (!user) {
      return response;
    }

    const prayerId = String(payload.prayerId || "").trim();
    const prayer = prayerId ? await getFallbackPrayer(prayerId) : null;
    if (!prayer) {
      return json({ message: "Choose a prayer first." }, 400);
    }

    const sessionCode = randomCode(6);
    const session: SharedPrayerSession = {
      _id: crypto.randomUUID(),
      hostUserId: user.id,
      prayerId: prayer,
      sessionCode,
      status: "waiting",
      currentRepetition: 0,
      totalRepetitions: Number(payload.totalRepetitions || 21),
      participants: [
        {
          userId: user.id,
          name: user.name,
          joinedAt: new Date().toISOString(),
          isActive: true
        }
      ]
    };

    store.prayerSessions.set(sessionCode, session);
    user.sharedSessions = [
      ...(user.sharedSessions || []),
      {
        sessionId: session._id,
        prayerName: prayer.title.en,
        participantNames: session.participants.map((participant) => participant.name)
      }
    ];
    persistStore(store);
    return json(session);
  }

  if (segments[0] === "prayer-sessions" && segments.length === 2 && method === "GET") {
    const { user, response } = requireLocalUser(options.token);
    if (!user) {
      return response;
    }

    const session = store.prayerSessions.get(segments[1].toUpperCase());
    if (!session) {
      return json({ message: "Prayer session not found." }, 404);
    }

    return json(session);
  }

  if (segments[0] === "prayer-sessions" && segments[2] === "join" && method === "POST") {
    const { user, response } = requireLocalUser(options.token);
    if (!user) {
      return response;
    }

    const session = store.prayerSessions.get(String(segments[1] || "").toUpperCase());
    if (!session) {
      return json({ message: "Prayer session not found." }, 404);
    }

    if (!session.participants.some((participant) => participant.userId === user.id)) {
      session.participants.push({
        userId: user.id,
        name: user.name,
        joinedAt: new Date().toISOString(),
        isActive: true
      });
      persistStore(store);
    }

    return json(session);
  }

  if (segments[0] === "prayer-sessions" && segments[2] === "end" && method === "POST") {
    const { user, response } = requireLocalUser(options.token);
    if (!user) {
      return response;
    }

    const session = store.prayerSessions.get(String(segments[1] || "").toUpperCase());
    if (!session) {
      return json({ message: "Prayer session not found." }, 404);
    }

    if (session.hostUserId !== user.id) {
      return json({ message: "Only the host can end this prayer session." }, 403);
    }

    session.status = "completed";
    session.completedAt = new Date().toISOString();
    persistStore(store);
    return json(session);
  }

  if (segments[0] === "observability" && segments[1] === "events" && method === "POST") {
    return json({ ok: true });
  }

  if (segments[0] === "prayers" && ["open", "complete", "interact", "favorite"].includes(segments[2] || "")) {
    return json(emptyGamificationResult());
  }

  if (segments[0] === "bookings" && segments.length === 1 && method === "POST") {
    return createBooking(options.token, payload, false);
  }

  if (segments[0] === "bookings" && segments[1] === "gift" && method === "POST") {
    return createBooking(options.token, payload, true);
  }

  if (segments[0] === "bookings" && segments[1] === "gothram-suggest" && method === "POST") {
    return json({
      suggestions: ["Nair", "Menon", "Iyer", "Pillai"].map((value) => ({
        value,
        confidence: 0.42
      }))
    });
  }

  if (segments[0] === "bookings" && segments.length === 1 && method === "GET") {
    const { user, response } = requireLocalUser(options.token);
    if (!user) {
      return response;
    }

    const bookings = Array.from(store.bookings.values()).filter(
      (booking) => booking.devoteeName === user.familyName || booking.devoteeName === user.name
    );
    return json(bookings);
  }

  if (segments[0] === "bookings" && segments.length === 2 && method === "GET") {
    const booking = store.bookings.get(segments[1]);
    if (!booking) {
      return json({ message: "Booking not found." }, 404);
    }
    return json(booking);
  }

  return null;
}

export function resetLocalBackendStoreForTests() {
  globalThis.__prarthanaLocalBackendStore = createStore();
}
