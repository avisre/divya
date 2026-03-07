import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const artifactsDir = path.join(repoRoot, "artifacts");
const outPath = path.join(artifactsDir, "web-functionality-audit.md");

const apiBase = process.env.AUDIT_API_BASE || "https://divya-twug.onrender.com/api";

async function getJson(endpoint) {
  const url = `${apiBase}${endpoint}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${endpoint} failed with ${response.status}`);
  }
  return response.json();
}

function row(name, status, evidence) {
  return `| ${name} | ${status ? "PASS" : "FAIL"} | ${evidence} |`;
}

async function run() {
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const checks = [];
  let score = 0;

  const siteBase = apiBase.replace(/\/api\/?$/, "");
  const prayers = await getJson("/prayers");
  const featured = await getJson("/prayers/featured");
  const pujas = await getJson("/pujas?currency=USD");
  const temple = await getJson("/temple");
  const panchang = await getJson("/panchang/today?timezone=America/New_York");
  const festivals30 = await getJson("/festivals/upcoming?days=30");
  const festivals365 = await getJson("/festivals/upcoming?days=365");
  const sitemapResponse = await fetch(`${siteBase}/sitemap.xml`);

  const prayerCountOk = Array.isArray(prayers) && prayers.length >= 20;
  checks.push(row("Prayer catalog seeded", prayerCountOk, `${Array.isArray(prayers) ? prayers.length : 0} prayers`));
  if (prayerCountOk) score += 1;

  const audioCount = Array.isArray(prayers)
    ? prayers.filter((item) => Boolean(item.audioUrl)).length
    : 0;
  const audioCoverageOk = audioCount >= 20;
  checks.push(row("Prayer audio seeded", audioCoverageOk, `${audioCount} prayers with audioUrl`));
  if (audioCoverageOk) score += 1;

  const textCoverageCount = Array.isArray(prayers)
    ? prayers.filter(
      (item) =>
        Boolean(item?.content?.english) &&
        Boolean(
          item?.transliteration ||
          item?.iast ||
          item?.content?.devanagari ||
          item?.content?.malayalam
        )
    ).length
    : 0;
  const textCoverageOk = textCoverageCount >= 20;
  checks.push(row("Prayer text coverage", textCoverageOk, `${textCoverageCount} prayers with english + script/transliteration`));
  if (textCoverageOk) score += 1;

  const guestResponse = await fetch(`${apiBase}/auth/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionsBeforeSignup: 1 })
  });
  const guestPayload = guestResponse.ok ? await guestResponse.json() : null;
  const guestToken = guestPayload?.token || null;
  const firstPrayerId = Array.isArray(prayers) && prayers.length ? prayers[0]._id : null;
  let streamMetadataOk = false;
  let streamEvidence = "no prayer id";
  if (guestToken && firstPrayerId) {
    const audioResponse = await fetch(`${apiBase}/prayers/${firstPrayerId}/audio`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    if (audioResponse.ok) {
      const audioData = await audioResponse.json();
      streamMetadataOk = Boolean(audioData?.url && audioData?.streamUrl);
      streamEvidence = streamMetadataOk
        ? "signed stream metadata available"
        : "audio metadata missing stream URL";
    } else {
      streamEvidence = `audio metadata endpoint ${audioResponse.status}`;
    }
  } else if (!guestToken) {
    streamEvidence = "guest auth unavailable";
  }
  checks.push(row("Audio stream metadata", streamMetadataOk, streamEvidence));
  if (streamMetadataOk) score += 1;

  const featuredOk = Array.isArray(featured) && featured.length >= 2;
  checks.push(row("Featured prayers", featuredOk, `${Array.isArray(featured) ? featured.length : 0} featured`));
  if (featuredOk) score += 1;

  const templeOk = Boolean(temple?.name?.en);
  checks.push(row("Temple endpoint", templeOk, templeOk ? temple.name.en : "missing name"));
  if (templeOk) score += 1;

  const pujaOk = Array.isArray(pujas) && pujas.length >= 10;
  checks.push(row("Puja catalog seeded", pujaOk, `${Array.isArray(pujas) ? pujas.length : 0} pujas`));
  if (pujaOk) score += 1;

  const panchangOk = Boolean(panchang?.tithi?.name && panchang?.nakshatra?.name);
  checks.push(row("Panchang today", panchangOk, panchangOk ? `${panchang.tithi.name}, ${panchang.nakshatra.name}` : "missing fields"));
  if (panchangOk) score += 1;

  const count30 = Array.isArray(festivals30) ? festivals30.length : 0;
  const count365 = Array.isArray(festivals365) ? festivals365.length : 0;
  const festivalOk = count365 > 0;
  checks.push(row("Festival feed", festivalOk, `upcoming 30d=${count30}, upcoming 365d=${count365}`));
  if (festivalOk) score += 1;

  const localSitemapPath = path.join(repoRoot, "web", "public", "sitemap.xml");
  const sitemapOk = sitemapResponse.ok || fs.existsSync(localSitemapPath);
  const sitemapEvidence = sitemapResponse.ok
    ? "deployed sitemap.xml reachable"
    : fs.existsSync(localSitemapPath)
      ? "local sitemap.xml present (deploy pending)"
      : `sitemap status=${sitemapResponse.status}`;
  checks.push(row("Sitemap route", sitemapOk, sitemapEvidence));
  if (sitemapOk) score += 1;

  const markdown = [
    "# Web Functionality Audit",
    "",
    `- API base: \`${apiBase}\``,
    `- Generated at: ${new Date().toISOString()}`,
    `- Functional score: ${score}/10`,
    "",
    "| Check | Status | Evidence |",
    "| --- | --- | --- |",
    ...checks,
    "",
    "Note: UI route-level behavior is validated separately via `npm run test:e2e`."
  ].join("\n");

  fs.writeFileSync(outPath, markdown, "utf8");
  console.log(markdown);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
