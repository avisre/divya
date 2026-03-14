import { describe, expect, it } from "vitest";
import { createCsrfToken, parseCookieHeader, verifyCsrfRequest } from "../../lib/csrf";

describe("csrf helpers", () => {
  it("creates a stable-length token", () => {
    const token = createCsrfToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("parses cookie headers", () => {
    const cookies = parseCookieHeader("foo=bar; divya_csrf=token-123");
    expect(cookies.get("foo")).toBe("bar");
    expect(cookies.get("divya_csrf")).toBe("token-123");
  });

  it("allows safe methods without csrf validation", () => {
    const request = new Request("http://127.0.0.1:3000/api/web-auth/session", {
      method: "GET"
    });
    expect(verifyCsrfRequest(request)).toBeNull();
  });

  it("rejects mutating requests with missing tokens", () => {
    const request = new Request("http://127.0.0.1:3000/api/web-auth/login", {
      method: "POST"
    });
    expect(verifyCsrfRequest(request)).toBe("Invalid CSRF token.");
  });

  it("accepts mutating requests with matching cookie and header tokens", () => {
    const request = new Request("http://127.0.0.1:3000/api/web-auth/login", {
      method: "POST",
      headers: {
        cookie: "divya_csrf=match-token",
        "x-csrf-token": "match-token"
      }
    });
    expect(verifyCsrfRequest(request)).toBeNull();
  });

  it("accepts localhost and 127.0.0.1 as the same local origin", () => {
    const request = new Request("http://localhost:3000/api/web-auth/login", {
      method: "POST",
      headers: {
        origin: "http://127.0.0.1:3000",
        cookie: "divya_csrf=match-token",
        "x-csrf-token": "match-token"
      }
    });

    expect(verifyCsrfRequest(request)).toBeNull();
  });
});
