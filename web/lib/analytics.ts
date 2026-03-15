"use client";

import { sendJson } from "./client-api";

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-MH6180XE50";

function sanitizeProperties(properties: AnalyticsProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  });
}

export function trackEvent(name: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;

  const sanitizedProperties = sanitizeProperties(properties);

  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("event", name, sanitizedProperties);
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
