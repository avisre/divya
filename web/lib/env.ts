const fallbackBackendOrigin = "http://localhost:5000";

function normalizeUrl(value: string | undefined, fallback: string) {
  const compact = value?.trim().replace(/\s+/g, "");
  return (compact || fallback).replace(/\/+$/, "");
}

export const SITE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000");

export const BACKEND_API_BASE_URL =
  normalizeUrl(process.env.BACKEND_API_BASE_URL, "") ||
  `${normalizeUrl(
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL,
    fallbackBackendOrigin
  )}/api`;

export const BACKEND_ORIGIN = BACKEND_API_BASE_URL.replace(/\/api$/, "");

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
