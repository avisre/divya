import { describe, expect, it } from "vitest";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

describe("route metadata", () => {
  it("disallows private routes in robots and keeps public pages indexable", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    expect(rules[0]?.allow).toContain("/temple");
    expect(rules[0]?.disallow).toContain("/profile");
    expect(result.sitemap).toContain("/sitemap.xml");
  });

  it("keeps only public routes in the sitemap", () => {
    const result = sitemap();
    const urls = result.map((item) => item.url);

    expect(urls.some((url) => url.includes("/temple"))).toBe(true);
    expect(urls.some((url) => url.includes("/profile"))).toBe(false);
    expect(urls.some((url) => url.includes("/login"))).toBe(false);
  });
});
