import { afterEach, describe, expect, it, vi } from "vitest";

const originalBackendApiBaseUrl = process.env.BACKEND_API_BASE_URL;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalBackendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;

afterEach(() => {
  vi.resetModules();
  process.env.BACKEND_API_BASE_URL = originalBackendApiBaseUrl;
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN = originalBackendOrigin;
});

describe("env normalization", () => {
  it("removes embedded whitespace from backend api base urls", async () => {
    process.env.BACKEND_API_BASE_URL = "http://127.0.0.1:3108 /api ";
    const { BACKEND_API_BASE_URL } = await import("../../lib/env");

    expect(BACKEND_API_BASE_URL).toBe("http://127.0.0.1:3108/api");
  });
});
