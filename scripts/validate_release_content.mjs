import fs from "fs";
import path from "path";
import process from "process";

const repoRoot = process.cwd();
const appContentPath = path.join(
  repoRoot,
  "androidApp",
  "src",
  "main",
  "java",
  "com",
  "divya",
  "android",
  "ui",
  "screens",
  "AppContent.kt"
);
const rawAudioDir = path.join(repoRoot, "androidApp", "src", "main", "res", "raw");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function walkFiles(dir, extensions, out = []) {
  if (!fs.existsSync(dir)) {
    return out;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryPath, extensions, out);
      continue;
    }
    if (extensions.includes(path.extname(entry.name))) {
      out.push(entryPath);
    }
  }
  return out;
}

function unique(values) {
  return Array.from(new Set(values));
}

function main() {
  const failures = [];

  if (!fs.existsSync(appContentPath)) {
    failures.push(`Missing content file: ${appContentPath}`);
  }

  const appContent = readFile(appContentPath);
  const prayerIds = unique([...appContent.matchAll(/id\s*=\s*"prayer-(\d+)"/g)].map((match) => match[1]));
  const rawAudioKeys = unique(
    [...appContent.matchAll(/audioUrl\s*=\s*"raw:\/\/([a-z0-9_]+)"/g)].map((match) => match[1])
  );

  if (prayerIds.length < 30) {
    failures.push(`Expected at least 30 prayers in AppContent.kt, found ${prayerIds.length}`);
  }

  if (rawAudioKeys.length < 20) {
    failures.push(`Expected at least 20 bundled audio mappings, found ${rawAudioKeys.length}`);
  }

  const audioExtensions = [".mp3", ".ogg", ".oga", ".wav"];
  for (const key of rawAudioKeys) {
    const found = audioExtensions.some((extension) => fs.existsSync(path.join(rawAudioDir, `${key}${extension}`)));
    if (!found) {
      failures.push(`Missing audio asset for raw://${key} in androidApp/src/main/res/raw`);
    }
  }

  const frontEndFiles = [
    ...walkFiles(path.join(repoRoot, "androidApp", "src", "main", "java", "com", "divya", "android", "ui"), [
      ".kt"
    ]),
    ...walkFiles(path.join(repoRoot, "admin", "src"), [".ts", ".tsx", ".css"]),
    ...walkFiles(path.join(repoRoot, "iosApp", "DivyaApp"), [".swift"])
  ];

  const bannedContentPatterns = [
    { label: "placeholder copy", regex: /\b(lorem ipsum|dummy text|tbd|fixme)\b/i },
    { label: "demo copy", regex: /\b(demo content|for demo|mock data)\b/i },
    { label: "seed copy in UI", regex: /\bseeded?\b/i },
    { label: "sample booking literal", regex: /sample-booking/i }
  ];

  for (const file of frontEndFiles) {
    const content = readFile(file);
    for (const pattern of bannedContentPatterns) {
      if (pattern.regex.test(content)) {
        failures.push(`Found ${pattern.label} in ${path.relative(repoRoot, file)}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error("Release content validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Release content validation passed.");
  console.log(`- Prayers found: ${prayerIds.length}`);
  console.log(`- Bundled audio mappings: ${rawAudioKeys.length}`);
  console.log(`- UI files scanned: ${frontEndFiles.length}`);
}

main();
