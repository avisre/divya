import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { BACKEND_ORIGIN, IS_PRODUCTION } from "./lib/env";
import { createCsrfToken, getCsrfTokenFromRequest, setCsrfCookie } from "./lib/csrf";

function buildCsp() {
  const connectSrc = [
    "'self'",
    BACKEND_ORIGIN,
    "https:",
    "wss:"
  ];

  if (!IS_PRODUCTION) {
    connectSrc.push("http://localhost:*", "http://127.0.0.1:*", "ws://localhost:*", "ws://127.0.0.1:*");
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `connect-src ${connectSrc.join(" ")}`,
    `script-src 'self' 'unsafe-inline'${IS_PRODUCTION ? "" : " 'unsafe-eval'"}`,
    "object-src 'none'",
    "worker-src 'self' blob:"
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse, pathname: string) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");

  if (!pathname.startsWith("/api")) {
    response.headers.set("Content-Security-Policy", buildCsp());
  }

  return response;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  if (request.method === "GET" || request.method === "HEAD") {
    const csrfToken = getCsrfTokenFromRequest(request) || createCsrfToken();
    setCsrfCookie(response, csrfToken);
  }

  return applySecurityHeaders(response, pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|apple-touch-icon.png|og-image.png).*)"]
};

