"use client";

const CSRF_COOKIE = "divya_csrf";
const CSRF_HEADER = "x-csrf-token";

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  payload: Record<string, unknown>;

  constructor({
    message,
    status,
    code,
    payload
  }: {
    message: string;
    status: number;
    code?: string;
    payload: Record<string, unknown>;
  }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

function readCookie(name: string) {
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
}

export async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof payload?.message === "string" ? payload.message : "Request failed.";
    const code = typeof payload?.code === "string" ? payload.code : undefined;
    throw new ApiRequestError({
      message,
      status: response.status,
      code,
      payload
    });
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
