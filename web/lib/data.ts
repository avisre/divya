import { fetchBackend } from "./backend";
import { enumerateIsoDates } from "./panchang";
import { enrichPrayer, enrichPrayers } from "./prayer-enrichment";
import type {
  AuthResponse,
  Deity,
  Festival,
  GamificationResult,
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
} from "./types";

export async function getTemple() {
  return fetchBackend<Temple>("/temple");
}

export async function getPrayers(params = "") {
  const prayers = await fetchBackend<Prayer[]>(`/prayers${params}`);
  return enrichPrayers(prayers);
}

export async function getPrayer(idOrSlug: string) {
  const prayer = await fetchBackend<Prayer>(`/prayers/${idOrSlug}`);
  return enrichPrayer(prayer);
}

export async function openPrayer(id: string, token: string) {
  return fetchBackend<GamificationResult>(`/prayers/${id}/open`, {
    method: "POST",
    token,
    body: JSON.stringify({})
  });
}

export async function completePrayer(
  id: string,
  token: string,
  payload: { durationSeconds: number; completedVia: string }
) {
  return fetchBackend<GamificationResult>(`/prayers/${id}/complete`, {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export async function interactWithPrayer(
  id: string,
  token: string,
  payload: { kind: "scripture_reader" | "word_explorer"; word?: string; tab?: string }
) {
  return fetchBackend<GamificationResult>(`/prayers/${id}/interact`, {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export async function getPrayerAudio(id: string, token: string) {
  return fetchBackend<PrayerAudioMetadata>(`/prayers/${id}/audio`, { token });
}

export async function getFeaturedPrayers() {
  const prayers = await fetchBackend<Prayer[]>("/prayers/featured");
  return enrichPrayers(prayers);
}

export async function getDailyRecommendation(timezone: string, token?: string | null) {
  return fetchBackend<PrayerRecommendation>(
    `/prayers/daily-recommendation?timezone=${encodeURIComponent(timezone)}`,
    { token }
  );
}

export async function getPanchangToday(timezone: string) {
  return fetchBackend<Panchang>(`/panchang/today?timezone=${encodeURIComponent(timezone)}`);
}

export async function getPanchangByDate(date: string, timezone: string) {
  return fetchBackend<Panchang>(`/panchang/${date}?timezone=${encodeURIComponent(timezone)}`);
}

export async function getPanchangUpcoming(timezone: string, days = 14) {
  return fetchBackend<Panchang[]>(
    `/panchang/upcoming?timezone=${encodeURIComponent(timezone)}&days=${days}`
  );
}

export async function getPanchangRange(timezone: string, startDate: string, endDate: string) {
  const dates = enumerateIsoDates(startDate, endDate);
  const results = await Promise.all(
    dates.map((date) => getPanchangByDate(date, timezone).catch(() => null))
  );
  return results.filter(Boolean) as Panchang[];
}

export async function getFestivals(days = 30) {
  return fetchBackend<Festival[]>(`/festivals/upcoming?days=${days}`);
}

export async function getFestival(id: string) {
  return fetchBackend<Festival>(`/festivals/${id}`);
}

export async function getDeities() {
  return fetchBackend<Array<{ _id: string; slug: string; name: { en: string } }>>("/deities");
}

export async function getDeity(id: string) {
  return fetchBackend<Deity>(`/deities/${id}`);
}

export async function getLearningPath(id: string, token?: string | null) {
  return fetchBackend<LearningPath>(`/deities/${id}/learning-path`, { token });
}

export async function getLearningModule(id: string, moduleId: string, token?: string | null) {
  return fetchBackend<{ deity: Deity; module: LearningPath["modules"][number] }>(
    `/deities/${id}/learning-path/${moduleId}`,
    { token }
  );
}

export async function getPujas(currency = "USD") {
  return fetchBackend<Puja[]>(`/pujas?currency=${currency}`);
}

export async function getPuja(id: string, currency = "USD") {
  return fetchBackend<Puja>(`/pujas/${id}?currency=${currency}`);
}

export async function getProfile(token: string) {
  return fetchBackend<UserSession>("/users/profile", { token });
}

export async function getStats(token: string) {
  return fetchBackend<Stats>("/users/stats", { token });
}

export async function getBookings(token: string) {
  return fetchBackend<PujaBooking[]>("/bookings", { token });
}

export async function getUserPrayerSessions(token: string) {
  return fetchBackend<UserSession["sharedSessions"]>("/users/prayer-sessions", { token });
}

export async function getBooking(id: string, token: string) {
  return fetchBackend<PujaBooking>(`/bookings/${id}`, { token });
}

export async function getBookingVideo(id: string, token: string) {
  return fetchBackend<{ url: string; shareUrl?: string }>(`/bookings/${id}/video`, { token });
}

export async function getGiftBookingsSent(token: string) {
  return fetchBackend<PujaBooking[]>("/bookings/gifts-sent", { token });
}

export async function getGiftBookingsReceived(token: string) {
  return fetchBackend<PujaBooking[]>("/bookings/gifts-received", { token });
}

export async function getSharedPrayerSession(code: string, token: string) {
  return fetchBackend<SharedPrayerSession>(`/prayer-sessions/${code}`, { token });
}

export async function loginUser(payload: Record<string, unknown>) {
  return fetchBackend<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerUser(payload: Record<string, unknown>) {
  return fetchBackend<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function requestPasswordReset(payload: { email: string }) {
  return fetchBackend<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function confirmPasswordReset(payload: { token: string; password: string }) {
  return fetchBackend<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
