import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const siteUrl = "http://localhost:3000";
const backendUrl = "http://localhost:5000/api";
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const outputRoot = path.join(process.cwd(), "artifacts", "screenshots", `web_mobile_${stamp}`);
const reportPath = path.join(outputRoot, "REPORT.md");

const viewports = [
  { key: "small-phone", width: 360, height: 780 },
  { key: "regular-phone", width: 390, height: 844 },
  { key: "large-phone", width: 430, height: 932 }
];

function sanitize(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

async function gotoStable(page, url) {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => null);
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(800);
    }
  }

  throw lastError;
}

async function fetchJson(pathname) {
  const response = await fetch(`${backendUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`Backend request failed for ${pathname}: ${response.status}`);
  }
  return response.json();
}

async function loadRouteSeeds() {
  const [prayers, pujas, deities] = await Promise.all([
    fetchJson("/prayers?limit=3"),
    fetchJson("/pujas?currency=USD"),
    fetchJson("/deities")
  ]);

  return {
    prayerSlug: prayers?.[0]?.slug,
    pujaId: pujas?.[0]?._id,
    deityId: deities?.[0]?._id
  };
}

async function registerAccount(context) {
  const email = `web-audit-${Date.now()}@example.com`;
  const response = await context.request.post(`${siteUrl}/api/auth/register`, {
    data: {
      name: "Web Audit Devotee",
      email,
      password: "SacredPass123",
      country: "United States",
      timezone: "America/New_York"
    }
  });

  if (!response.ok()) {
    throw new Error(`Unable to create audit session: ${response.status()} ${await response.text()}`);
  }

  return email;
}

async function collectLayoutIssues(page) {
  return page.evaluate(() => {
    const width = window.innerWidth;
    const root = document.documentElement;
    const candidates = Array.from(
      document.querySelectorAll(
        "h1, h2, h3, p, a, button, .button, .surface-card, .metric-card strong, .list-row span:last-child, .hero__title, .hero__subtitle"
      )
    );

    const horizontalOverflow = root.scrollWidth - width;
    const offscreen = [];
    const textOverflow = [];

    for (const element of candidates) {
      const node = element;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (node.closest(".site-nav")) continue;
      const label = `${node.tagName.toLowerCase()}.${(node.className || "").toString().trim().replace(/\s+/g, ".")}`.slice(0, 100);
      const text = (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100);

      if (rect.right > width + 2 || rect.left < -2) {
        offscreen.push({
          label,
          text,
          left: Math.round(rect.left),
          right: Math.round(rect.right)
        });
      }

      if (node.scrollWidth > node.clientWidth + 4 && node.clientWidth > 0) {
        textOverflow.push({
          label,
          text,
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth
        });
      }
    }

    return {
      horizontalOverflow,
      offscreen: offscreen.slice(0, 10),
      textOverflow: textOverflow.slice(0, 10)
    };
  });
}

function buildRoutes(seeds) {
  const routes = [
    { key: "landing", path: "/" },
    { key: "login", path: "/login" },
    { key: "register", path: "/register" },
    { key: "prayers", path: "/prayers" },
    { key: "temple", path: "/temple" },
    { key: "pujas", path: "/pujas" },
    { key: "calendar", path: "/calendar" },
    { key: "contact-us", path: "/contact-us" }
  ];

  if (seeds.prayerSlug) routes.push({ key: "prayer-detail", path: `/prayers/${seeds.prayerSlug}` });
  if (seeds.pujaId) routes.push({ key: "puja-detail", path: `/pujas/${seeds.pujaId}` });
  if (seeds.deityId) routes.push({ key: "deity-detail", path: `/deities/${seeds.deityId}` });

  routes.push(
    { key: "home", path: "/home", auth: true },
    { key: "bookings", path: "/bookings", auth: true },
    { key: "profile", path: "/profile", auth: true },
    { key: "contact", path: "/contact", auth: true },
    { key: "shared-prayer-create", path: "/shared-prayer/create", auth: true }
  );

  if (seeds.deityId) routes.push({ key: "learning-path", path: `/deities/${seeds.deityId}/learn`, auth: true });

  return routes;
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  const seeds = await loadRouteSeeds();
  const routes = buildRoutes(seeds);
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of viewports) {
    const folder = path.join(outputRoot, viewport.key);
    fs.mkdirSync(folder, { recursive: true });
    const publicContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    const publicPage = await publicContext.newPage();
    const authContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    const authPage = await authContext.newPage();

    await registerAccount(authContext);

    for (const route of routes) {
      const page = route.auth ? authPage : publicPage;
      const url = `${siteUrl}${route.path}`;
      await gotoStable(page, url);
      await page.screenshot({
        path: path.join(folder, `${sanitize(route.key)}.png`),
        fullPage: true
      });
      const issues = await collectLayoutIssues(page);
      results.push({
        viewport: viewport.key,
        route: route.path,
        issues
      });
    }

    await publicContext.close();
    await authContext.close();
  }

  await browser.close();

  const lines = [
    "# Mobile Visual Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Viewports",
    ...viewports.map((item) => `- ${item.key}: ${item.width}x${item.height}`),
    "",
    "## Findings"
  ];

  for (const result of results) {
    lines.push(`### ${result.viewport} ${result.route}`);
    lines.push(`- Horizontal overflow: ${result.issues.horizontalOverflow}`);
    if (result.issues.offscreen.length) {
      lines.push("- Offscreen elements:");
      for (const item of result.issues.offscreen) {
        lines.push(`  - ${item.label} | ${item.text} | left ${item.left} right ${item.right}`);
      }
    }
    if (result.issues.textOverflow.length) {
      lines.push("- Text overflow:");
      for (const item of result.issues.textOverflow) {
        lines.push(`  - ${item.label} | ${item.text} | client ${item.clientWidth} scroll ${item.scrollWidth}`);
      }
    }
    if (!result.issues.offscreen.length && !result.issues.textOverflow.length && result.issues.horizontalOverflow <= 2) {
      lines.push("- No overflow issues detected.");
    }
    lines.push("");
  }

  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Mobile audit written to ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
