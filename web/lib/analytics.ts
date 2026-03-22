"use client";

import { sendJson } from "./client-api";

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, unknown>; u?: string }) => void;
  }
}

export const PLAUSIBLE_DOMAIN =
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || "praarthana.com";
export const PLAUSIBLE_API_HOST =
  process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST?.trim().replace(/\/+$/, "") || "https://plausible.io";

function sanitizeProperties(properties: AnalyticsProperties) {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined));
}

function isLocalAuditSession() {
  if (typeof window === "undefined") {
    return false;
  }

  if (process.env.NODE_ENV === "test") {
    return false;
  }

  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || !window.plausible) {
    return;
  }

  const url = new URL(path, window.location.origin).toString();
  window.plausible("pageview", { u: url });
}

export function trackEvent(name: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;

  const sanitizedProperties = sanitizeProperties(properties);

  if (window.plausible) {
    window.plausible(name, { props: sanitizedProperties });
  }

  if (isLocalAuditSession()) {
    return;
  }

  void sendJson("/api/backend/observability/events", {
    method: "POST",
    keepalive: true,
    body: JSON.stringify({
      name,
      properties: sanitizedProperties,
      platform: "web"
    })
  }).catch(() => undefined);
}
