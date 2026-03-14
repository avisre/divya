import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const baseUrl = process.argv[2] || "https://divya-xbza.onrender.com";
const packMode = process.argv[3] || "20";
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const outputRoot = path.join(process.cwd(), "artifacts", "screenshots", `prarthana_web${packMode}_${stamp}`);
const viewport = { width: 1440, height: 1100 };

function sanitize(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

async function ensureOk(response, label) {
  if (!response.ok()) {
    throw new Error(`${label} failed: ${response.status()} ${await response.text()}`);
  }
}

async function gotoStable(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(750);
}

async function fetchJson(request, pathname, init = {}) {
  const response = await request.fetch(`${baseUrl}${pathname}`, init);
  await ensureOk(response, pathname);
  return response.json();
}

async function getCsrfHeaders(request) {
  const response = await request.get(`${baseUrl}/api/csrf`);
  await ensureOk(response, "csrf bootstrap");
  const payload = await response.json();
  return { "x-csrf-token": payload.token };
}

async function registerSession(context) {
  const email = `webshots+${Date.now()}@example.com`;
  const csrfHeaders = await getCsrfHeaders(context.request);
  const response = await context.request.post(`${baseUrl}/api/web-auth/register`, {
    headers: csrfHeaders,
    data: {
      name: "Website Capture User",
      email,
      password: "SacredPass123!",
      country: "US",
      timezone: "America/New_York"
    }
  });
  await ensureOk(response, "register web session");
  return email;
}

async function createBooking(request, pujaId) {
  const csrfHeaders = await getCsrfHeaders(request);
  const response = await request.post(`${baseUrl}/api/backend/bookings`, {
    headers: {
      ...csrfHeaders,
      "x-idempotency-key": `${pujaId}-${Date.now()}`
    },
    data: {
      pujaId,
      devoteeName: "Website Capture User",
      gothram: "Kashyap",
      nakshatra: "Ashwini",
      prayerIntention: "Peace and prosperity for my family"
    }
  });
  await ensureOk(response, "create booking");
  const bookings = await fetchJson(request, "/api/backend/bookings");
  return bookings[0]?._id || null;
}

async function createSharedPrayerSession(request, prayerId) {
  const csrfHeaders = await getCsrfHeaders(request);
  const response = await request.post(`${baseUrl}/api/backend/prayer-sessions`, {
    headers: csrfHeaders,
    data: {
      prayerId,
      totalRepetitions: 21
    }
  });
  await ensureOk(response, "create shared prayer session");
  const session = await response.json();
  return session?.sessionCode || null;
}

async function loadSeeds(request) {
  const [prayers, pujas, deities] = await Promise.all([
    fetchJson(request, "/api/prayers?limit=5"),
    fetchJson(request, "/api/pujas?currency=USD"),
    fetchJson(request, "/api/deities")
  ]);

  const prayer = prayers[0] || null;
  const puja = pujas[0] || null;
  const deity = deities[0] || null;

  let learningModuleId = null;
  if (deity?._id) {
    const learningPath = await fetchJson(request, `/api/backend/deities/${deity._id}/learning-path`);
    learningModuleId = learningPath?.modules?.[0]?._id || null;
  }

  return {
    prayerSlug: prayer?.slug || null,
    prayerId: prayer?._id || null,
    pujaId: puja?._id || null,
    deityId: deity?._id || null,
    learningModuleId
  };
}

function buildRoutes(seeds, extras) {
  const routes10 = [
    { key: "landing", path: "/" },
    { key: "login", path: "/login" },
    { key: "register", path: "/register" },
    { key: "home", path: "/home", auth: true },
    { key: "prayers", path: "/prayers" },
    { key: "prayer-detail", path: `/prayers/${seeds.prayerSlug}` },
    { key: "temple", path: "/temple" },
    { key: "pujas", path: "/pujas" },
    { key: "puja-detail", path: `/pujas/${seeds.pujaId}` },
    { key: "bookings", path: "/bookings", auth: true }
  ];

  const routes20 = [
    { key: "landing", path: "/" },
    { key: "login", path: "/login" },
    { key: "register", path: "/register" },
    { key: "onboarding", path: "/onboarding", auth: true },
    { key: "home", path: "/home", auth: true },
    { key: "prayers", path: "/prayers" },
    { key: "prayer-detail", path: `/prayers/${seeds.prayerSlug}` },
    { key: "temple", path: "/temple" },
    { key: "pujas", path: "/pujas" },
    { key: "puja-detail", path: `/pujas/${seeds.pujaId}` },
    { key: "bookings", path: "/bookings", auth: true },
    { key: "booking-detail", path: `/bookings/${extras.bookingId}`, auth: true },
    { key: "sacred-video", path: `/bookings/${extras.bookingId}/video`, auth: true },
    { key: "deity-detail", path: `/deities/${seeds.deityId}` },
    { key: "learning-path", path: `/deities/${seeds.deityId}/learn`, auth: true },
    { key: "learning-module", path: `/deities/${seeds.deityId}/learn/${seeds.learningModuleId}`, auth: true },
    { key: "profile", path: "/profile", auth: true },
    { key: "contact-us", path: "/contact-us" },
    { key: "shared-prayer-create", path: "/shared-prayer/create", auth: true },
    { key: "shared-prayer-room", path: `/shared-prayer/${extras.sessionCode}`, auth: true }
  ];

  const routes = packMode === "10" ? routes10 : routes20;

  return routes.filter((route) => !route.path.includes("null"));
}

async function main() {
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const publicContext = await browser.newContext({ viewport });
  const authContext = await browser.newContext({ viewport });

  const publicPage = await publicContext.newPage();
  const authPage = await authContext.newPage();

  const registeredEmail = await registerSession(authContext);
  const seeds = await loadSeeds(authContext.request);

  if (!seeds.prayerSlug || !seeds.prayerId || !seeds.pujaId || !seeds.deityId || !seeds.learningModuleId) {
    throw new Error("Unable to resolve route seeds for website capture.");
  }

  const bookingId = await createBooking(authContext.request, seeds.pujaId);
  const sessionCode = await createSharedPrayerSession(authContext.request, seeds.prayerId);

  if (!bookingId || !sessionCode) {
    throw new Error("Unable to create authenticated website entities for capture.");
  }

  const routes = buildRoutes(seeds, { bookingId, sessionCode });
  const manifest = [];

  for (const [index, route] of routes.entries()) {
    const page = route.auth ? authPage : publicPage;
    const url = `${baseUrl}${route.path}`;
    await gotoStable(page, url);
    const fileName = `${String(index + 1).padStart(2, "0")}-${sanitize(route.key)}.png`;
    const fullPath = path.join(outputRoot, fileName);
    await page.screenshot({ path: fullPath, fullPage: true });
    manifest.push({ fileName, path: route.path, auth: route.auth ? "yes" : "no" });
  }

  const readme = [
    "# Website Screenshot Pack",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${baseUrl}`,
    `Viewport: ${viewport.width}x${viewport.height}`,
    `Authenticated capture account: ${registeredEmail}`,
    "",
    "## Files",
    ...manifest.map((item) => `- ${item.fileName} -> ${item.path} (auth: ${item.auth})`)
  ].join("\n");

  const dimensions = manifest
    .map((item) => `${item.fileName} | viewport ${viewport.width}x${viewport.height}`)
    .join("\n");

  fs.writeFileSync(path.join(outputRoot, "README.md"), `${readme}\n`, "utf8");
  fs.writeFileSync(path.join(outputRoot, "MEDIA_DIMENSIONS.txt"), `${dimensions}\n`, "utf8");

  await publicContext.close();
  await authContext.close();
  await browser.close();

  console.log(outputRoot);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
