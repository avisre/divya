import fs from "fs";
import path from "path";
import process from "process";
import { spawnSync } from "child_process";

const root = path.join(process.cwd(), "src");

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(root);
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "pipe" });
  if (result.status !== 0) {
    failures.push({
      file,
      output: (result.stderr?.toString() || result.stdout?.toString() || "").trim()
    });
  }
}

if (failures.length > 0) {
  console.error("Backend verification failed:");
  for (const failure of failures) {
    console.error(`- ${path.relative(process.cwd(), failure.file)}`);
    if (failure.output) {
      console.error(failure.output);
    }
  }
  process.exit(1);
}

console.log(`Backend verification passed. Checked ${files.length} files.`);
