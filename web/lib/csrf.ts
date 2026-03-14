import { NextResponse } from "next/server";
import { SITE_URL } from "./env";

export const CSRF_COOKIE = "divya_csrf";
export const CSRF_HEADER = "x-csrf-token";

const SECURE_CSRF_COOKIE = SITE_URL.startsWith("https://");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function getCsrfCookieOptions() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: SECURE_CSRF_COOKIE,
    path: "/",
    maxAge: 60 * 60 * 12
  };
}

export function createCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [key, ...valueParts] = entry.split("=");
        return [key, decodeURIComponent(valueParts.join("=") || "")];
      })
  );
}

export function getCsrfTokenFromRequest(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return cookies.get(CSRF_COOKIE) || null;
}

export function setCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set(CSRF_COOKIE, token, getCsrfCookieOptions());
  return response;
}

function isSafeMethod(method: string) {
  return SAFE_METHODS.has(method.toUpperCase());
}

export function verifyCsrfRequest(request: Request) {
  if (isSafeMethod(request.method)) {
    return null;
  }

  const cookieToken = getCsrfTokenFromRequest(request);
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return "Invalid CSRF token.";
  }

  return null;
}
