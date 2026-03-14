"use client";

const CSRF_COOKIE = "divya_csrf";
const CSRF_HEADER = "x-csrf-token";

function readCookie(name: string) {
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
}

export async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.message === "string" ? payload.message : "Request failed.";
    throw new Error(message);
  }
  return payload as T;
}

export async function sendJson<T>(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const method = (init.method || "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = readCookie(CSRF_COOKIE);
    if (csrfToken && !headers.has(CSRF_HEADER)) {
      headers.set(CSRF_HEADER, csrfToken);
    }
  }
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: init.credentials || "same-origin"
  });
  return readJson<T>(response);
}
