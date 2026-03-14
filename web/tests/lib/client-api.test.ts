import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { sendJson } from "../../lib/client-api";

describe("client api csrf handling", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    document.cookie = "divya_csrf=test-token";
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    ) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends csrf token and same-origin credentials on mutating requests", async () => {
    await sendJson("/api/web-auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" })
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("x-csrf-token")).toBe("test-token");
    expect(init?.credentials).toBe("same-origin");
  });

  it("does not attach csrf token on safe requests", async () => {
    await sendJson("/api/web-auth/session");

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("x-csrf-token")).toBeNull();
  });
});

