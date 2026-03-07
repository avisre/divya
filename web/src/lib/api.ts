import { getStoredSession, setStoredSession } from "@/lib/session-store";
import type {
  ApiErrorPayload,
  AuthResponse,
  Deity,
  Festival,
  LearningPath,
  Panchang,
  Prayer,
  PrayerAudioMetadata,
  PrayerRecommendation,
  Puja,
  PujaBooking,
  SharedPrayerSession,
  Stats,
  Temple,
  UserSession
} from "@/lib/types";
import { readCachedJson, writeCachedJson } from "@/lib/cache";

const REMOTE_API_BASE_URL = "https://divya-twug.onrender.com/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api" : REMOTE_API_BASE_URL);
export const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_BASE_URL ||
  (import.meta.env.DEV ? window.location.origin : API_BASE_URL.replace(/\/api$/, ""));

export class HttpError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(message: string, status: number, payload: ApiErrorPayload | null = null) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function refreshTokenIfPossible() {
  const current = getStoredSession();
  if (!current?.token) return null;
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${current.token}`
    }
  });
  if (!response.ok) {
    setStoredSession(null);
    return null;
  }
  const data = (await response.json()) as AuthResponse;
  setStoredSession({ token: data.token, user: data.user });
  return data.token;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: { skipAuth?: boolean; retryOn401?: boolean } = {}
): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (!options.skipAuth && session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (response.status === 401 && !options.skipAuth && options.retryOn401 !== false) {
    const newToken = await refreshTokenIfPossible();
    if (newToken) {
      return apiFetch<T>(path, init, { ...options, retryOn401: false });
    }
  }

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }
    throw new HttpError(payload?.message || response.statusText, response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const authApi = {
  register(payload: Record<string, unknown>) {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }, { skipAuth: true });
  },
  login(payload: Record<string, unknown>) {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }, { skipAuth: true });
  },
  guest(sessionsBeforeSignup = 1) {
    return apiFetch<AuthResponse>("/auth/guest", {
      method: "POST",
      body: JSON.stringify({ sessionsBeforeSignup })
    }, { skipAuth: true });
  },
  me() {
    return apiFetch<{ user: UserSession }>("/auth/me");
  }
};

export const publicApi = {
  temple() {
    return apiFetch<Temple>("/temple", undefined, { skipAuth: true });
  },
  prayers(params = "") {
    const cacheKey = `divya_web_prayers_${params || "default"}`;
    return cachedFetch<Prayer[]>(cacheKey, `/prayers${params}`, 10 * 60_000);
  },
  prayer(idOrSlug: string) {
    const cacheKey = `divya_web_prayer_${idOrSlug}`;
    return cachedPrayerFetch(cacheKey, idOrSlug);
  },
  favoritePrayer(id: string) {
    return apiFetch<{ success: boolean }>(`/prayers/${id}/favorite`, {
      method: "POST",
      body: JSON.stringify({})
    });
  },
  prayerAudio(id: string) {
    return apiFetch<PrayerAudioMetadata>(`/prayers/${id}/audio`, undefined, { skipAuth: false });
  },
  subscribeAudioComingSoon(id: string, subscribe = true) {
    return apiFetch<{ success: boolean; subscribed: boolean }>(`/prayers/${id}/audio-coming-soon`, {
      method: "POST",
      body: JSON.stringify({ subscribe })
    });
  },
  featuredPrayers() {
    return cachedFetch<Prayer[]>("divya_web_prayers_featured", "/prayers/featured", 10 * 60_000);
  },
  availability(language = "english") {
    return apiFetch<{
      totalPrayers: number;
      languageReadyCount: number;
      bundles: Record<string, number>;
    }>(`/prayers/availability?language=${encodeURIComponent(language)}`, undefined, { skipAuth: false });
  },
  dailyRecommendation(timezone: string) {
    return apiFetch<PrayerRecommendation>(
      `/prayers/daily-recommendation?timezone=${encodeURIComponent(timezone)}`
    );
  },
  panchangToday(timezone: string) {
    return cachedFetch<Panchang>(
      `divya_web_panchang_today_${timezone}`,
      `/panchang/today?timezone=${encodeURIComponent(timezone)}`,
      60 * 60_000
    );
  },
  panchangUpcoming(timezone: string, days = 30) {
    return cachedFetch<Panchang[]>(
      `divya_web_panchang_upcoming_${timezone}_${days}`,
      `/panchang/upcoming?timezone=${encodeURIComponent(timezone)}&days=${days}`,
      60 * 60_000
    );
  },
  festivals(days = 30) {
    return apiFetch<Festival[]>(`/festivals/upcoming?days=${days}`, undefined, { skipAuth: true });
  },
  festival(id: string) {
    return apiFetch<Festival>(`/festivals/${id}`, undefined, { skipAuth: true });
  },
  deities() {
    return apiFetch<Array<{ _id: string; slug: string; name: { en: string } }>>("/deities", undefined, {
      skipAuth: true
    });
  },
  deity(id: string) {
    return apiFetch<Deity>(`/deities/${id}`, undefined, { skipAuth: true });
  },
  learningPath(id: string) {
    return apiFetch<LearningPath>(`/deities/${id}/learning-path`);
  },
  learningModule(id: string, moduleId: string) {
    return apiFetch<{ deity: UserSession; module: LearningPath["modules"][number] }>(
      `/deities/${id}/learning-path/${moduleId}`
    );
  },
  pujas(currency = "USD") {
    return apiFetch<Puja[]>(`/pujas?currency=${currency}`, undefined, { skipAuth: true });
  },
  puja(id: string, currency = "USD") {
    return apiFetch<Puja>(`/pujas/${id}?currency=${currency}`, undefined, { skipAuth: true });
  }
};

async function cachedFetch<T>(key: string, path: string, maxAgeMs: number) {
  const cached = readCachedJson<{ timestamp: number; data: T }>(key);
  if (cached && Date.now() - cached.timestamp < maxAgeMs) {
    return cached.data;
  }
  try {
    const data = await apiFetch<T>(path, undefined, { skipAuth: false });
    writeCachedJson(key, { timestamp: Date.now(), data });
    return data;
  } catch (error) {
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}

async function cachedPrayerFetch(cacheKey: string, idOrSlug: string) {
  try {
    return await cachedFetch<Prayer>(cacheKey, `/prayers/${idOrSlug}`, 10 * 60_000);
  } catch (error) {
    const canFallback =
      error instanceof HttpError && [404, 500, 502, 503].includes(error.status);
    if (!canFallback) {
      throw error;
    }
    const catalog = await cachedFetch<Prayer[]>(
      "divya_web_prayers_fallback_catalog",
      "/prayers?limit=200",
      5 * 60_000
    );
    const match = catalog.find(
      (item) => item.slug === idOrSlug || item.externalId === idOrSlug || item._id === idOrSlug
    );
    if (!match?._id) {
      throw error;
    }
    return cachedFetch<Prayer>(`divya_web_prayer_${match._id}`, `/prayers/${match._id}`, 10 * 60_000);
  }
}

export const userApi = {
  profile() {
    return apiFetch<UserSession>("/users/profile");
  },
  updateProfile(payload: Partial<UserSession>) {
    return apiFetch<UserSession>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  saveOnboarding(payload: Record<string, unknown>) {
    return apiFetch<{ onboarding: UserSession["onboarding"]; user: UserSession }>("/users/onboarding", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  stats() {
    return apiFetch<Stats>("/users/stats");
  },
  streak() {
    return apiFetch<UserSession["streak"]>("/users/streak");
  },
  prayerComplete(payload: Record<string, unknown>) {
    return apiFetch("/users/prayer-complete", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  useGrace() {
    return apiFetch("/users/streak/use-grace", { method: "POST" });
  },
  contact(payload: Record<string, unknown>) {
    return apiFetch<{ success: boolean; requestId: string; status: string }>("/users/contact", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  learningProgress() {
    return apiFetch<UserSession["learningProgress"]>("/users/learning-progress");
  },
  prayerSessions() {
    return apiFetch<UserSession["sharedSessions"]>("/users/prayer-sessions");
  },
  completeLearningModule(deityId: string, moduleId: string) {
    return apiFetch<{ success: boolean; moduleOrder: number }>(
      `/deities/${deityId}/learning-path/${moduleId}/complete`,
      {
        method: "POST",
        body: JSON.stringify({})
      }
    );
  }
};

export const bookingApi = {
  create(payload: Record<string, unknown>, idempotencyKey?: string) {
    const headers: HeadersInit = {};
    if (idempotencyKey) {
      headers["x-idempotency-key"] = idempotencyKey;
    }
    return apiFetch<{ booking: PujaBooking; clientSecret: string | null; paymentRequired: boolean }>("/bookings", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
  },
  createGift(payload: Record<string, unknown>) {
    return apiFetch<{ booking: PujaBooking; clientSecret: string | null; paymentRequired: boolean }>("/bookings/gift", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  gothramSuggest(payload: Record<string, unknown>) {
    return apiFetch<{
      gothram: string;
      confidence: "high" | "low" | "unknown";
      source: string;
      guidanceText: string;
    }>("/bookings/gothram-suggest", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  list() {
    return apiFetch<PujaBooking[]>("/bookings");
  },
  detail(id: string) {
    return apiFetch<PujaBooking>(`/bookings/${id}`);
  },
  cancel(id: string) {
    return apiFetch<{ success: boolean; booking: PujaBooking }>(`/bookings/${id}`, { method: "DELETE" });
  },
  video(id: string) {
    return apiFetch<{ url: string; shareUrl?: string }>(`/bookings/${id}/video`);
  },
  markWatched(id: string) {
    return apiFetch<{ success: boolean }>(`/bookings/${id}/video/watched`, { method: "POST" });
  },
  giftsSent() {
    return apiFetch<PujaBooking[]>("/bookings/gifts-sent");
  },
  giftsReceived() {
    return apiFetch<PujaBooking[]>("/bookings/gifts-received");
  }
};

export const sharedPrayerApi = {
  create(payload: { prayerId: string; totalRepetitions: number }) {
    return apiFetch<SharedPrayerSession>("/prayer-sessions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  detail(sessionCode: string) {
    return apiFetch<SharedPrayerSession>(`/prayer-sessions/${sessionCode}`);
  },
  join(sessionCode: string) {
    return apiFetch<SharedPrayerSession>(`/prayer-sessions/${sessionCode}/join`, {
      method: "POST",
      body: JSON.stringify({})
    });
  },
  end(sessionCode: string) {
    return apiFetch<SharedPrayerSession>(`/prayer-sessions/${sessionCode}/end`, {
      method: "POST",
      body: JSON.stringify({})
    });
  }
};
