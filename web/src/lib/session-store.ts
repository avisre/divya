import type { UserSession } from "@/lib/types";

const SESSION_KEY = "divya_web_session";
type StoredSession = { token: string; user: UserSession } | null;
type Listener = (session: StoredSession) => void;

let listeners = new Set<Listener>();

export function getStoredSession(): StoredSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StoredSession) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  listeners.forEach((listener) => listener(session));
}

export function subscribeSession(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

