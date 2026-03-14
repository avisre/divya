import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchBackend } from "./backend";
import { SITE_URL } from "./env";
import type { UserSession } from "./types";

export const SESSION_COOKIE = "divya_web_session";

const SECURE_SESSION_COOKIE = SITE_URL.startsWith("https://");

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: SECURE_SESSION_COOKIE,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

export async function getAuthToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value || null;
}

export async function getOptionalSession() {
  const token = await getAuthToken();
  if (!token) return null;
  try {
    const { user } = await fetchBackend<{ user: UserSession }>("/auth/me", { token });
    return { token, user };
  } catch {
    return null;
  }
}

export async function requireSession(nextPath: string) {
  const session = await getOptionalSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}
