import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalFetch = global.fetch;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalBackendApiBaseUrl = process.env.BACKEND_API_BASE_URL;
const originalBackendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;

describe("local backend fallback", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3104";
    process.env.BACKEND_API_BASE_URL = "http://localhost:5000/api";
    delete process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    vi.resetModules();
    global.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed")) as typeof fetch;
  });

  afterEach(async () => {
    try {
      const { resetLocalBackendStoreForTests } = await import("../../lib/local-backend");
      resetLocalBackendStoreForTests();
    } catch {
      // Ignore reset failures when the module was never loaded.
    }

    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    process.env.BACKEND_API_BASE_URL = originalBackendApiBaseUrl;
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN = originalBackendOrigin;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("creates a local session for registration when backend auth is unavailable", async () => {
    const { fetchBackend } = await import("../../lib/backend");

    const session = await fetchBackend<{
      token: string;
      user: { email: string; subscription?: { tier: string } };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Local Devotee",
        email: "local@example.com",
        password: "Sacred#2026",
        country: "United States",
        timezone: "America/New_York"
      })
    });

    expect(session.token).toMatch(/^local-session:/);
    expect(session.user.email).toBe("local@example.com");
    expect(session.user.subscription?.tier).toBe("free");
  });

  it("reads and updates a local user profile through the backend helpers", async () => {
    const { fetchBackend } = await import("../../lib/backend");

    const session = await fetchBackend<{
      token: string;
      user: { id: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Profile Devotee",
        email: "profile@example.com",
        password: "Sacred#2026"
      })
    });

    const authState = await fetchBackend<{ user: { id: string; familyName?: string } }>("/auth/me", {
      token: session.token
    });
    expect(authState.user.id).toBe(session.user.id);

    const updated = await fetchBackend<{ user: { familyName: string; guidedFlow: { currentStep: number } } }>(
      "/users/profile",
      {
        method: "PUT",
        token: session.token,
        body: JSON.stringify({
          familyName: "Nair Family",
          guidedFlow: {
            active: true,
            currentStep: 3,
            completedSteps: [1, 2],
            startedAt: "2026-03-22T00:00:00.000Z",
            completedAt: null,
            exitedAt: null,
            exitedOnStep: null
          }
        })
      }
    );

    expect(updated.user.familyName).toBe("Nair Family");
    expect(updated.user.guidedFlow.currentStep).toBe(3);
  });

  it("creates a local shared prayer session when backend collaboration endpoints are unavailable", async () => {
    const { fetchBackend } = await import("../../lib/backend");

    const session = await fetchBackend<{ token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Shared Prayer User",
        email: "shared@example.com",
        password: "Sacred#2026"
      })
    });

    const sharedSession = await fetchBackend<{
      sessionCode: string;
      participants: Array<{ name: string }>;
      prayerId: { slug: string };
    }>("/prayer-sessions", {
      method: "POST",
      token: session.token,
      body: JSON.stringify({
        prayerId: "gayatri-mantra",
        totalRepetitions: 21
      })
    });

    expect(sharedSession.sessionCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(sharedSession.prayerId.slug).toBe("gayatri-mantra");
    expect(sharedSession.participants[0]?.name).toBe("Shared Prayer User");
  });
});
