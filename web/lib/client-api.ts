"use client";

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
  const response = await fetch(url, {
    ...init,
    headers
  });
  return readJson<T>(response);
}
