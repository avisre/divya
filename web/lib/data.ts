import { fetchBackend } from "./backend";
import type {
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
} from "./types";

export async function getTemple() {
  return fetchBackend<Temple>("/temple");
}

export async function getPrayers(params = "") {
  return fetchBackend<Prayer[]>(`/prayers${params}`);
}

export async function getPrayer(idOrSlug: string) {
  return fetchBackend<Prayer>(`/prayers/${idOrSlug}`);
}

export async function getPrayerAudio(id: string, token: string) {
  return fetchBackend<PrayerAudioMetadata>(`/prayers/${id}/audio`, { token });
}

export async function getFeaturedPrayers() {
  return fetchBackend<Prayer[]>("/prayers/featured");
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

export async function getPanchangUpcoming(timezone: string, days = 14) {
  return fetchBackend<Panchang[]>(
    `/panchang/upcoming?timezone=${encodeURIComponent(timezone)}&days=${days}`
  );
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
  return fetchBackend<{ deity: UserSession; module: LearningPath["modules"][number] }>(
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
