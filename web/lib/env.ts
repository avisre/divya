const fallbackBackendOrigin = "http://localhost:5000";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

export const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL?.replace(/\/+$/, "") ||
  `${(process.env.NEXT_PUBLIC_BACKEND_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || fallbackBackendOrigin).replace(/\/+$/, "")}/api`;

export const BACKEND_ORIGIN = BACKEND_API_BASE_URL.replace(/\/api$/, "");

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
