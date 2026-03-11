import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchBackend } from "./backend";
import { IS_PRODUCTION } from "./env";
import type { UserSession } from "./types";

export const SESSION_COOKIE = "divya_web_session";

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
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
