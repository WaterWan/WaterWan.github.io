import { readFile, writeFile } from "node:fs/promises";
import { createGazetteer } from "../js/lookup.js";
import { createCoverage } from "../js/coverage.js";

const args = process.argv.slice(2);
if (args.some((arg) => !["--write", "--json"].includes(arg))) {
  throw new Error("Usage: node scripts/audit.mjs [--write] [--json]");
}
const index = createGazetteer(JSON.parse(await readFile(new URL("../data/places.json", import.meta.url), "utf8")));
const report = createCoverage(index);
const json = JSON.stringify(report, null, 2) + "\n";
if (args.includes("--write")) {
  await writeFile(new URL("../data/coverage.json", import.meta.url), json, "utf8");
}
if (args.includes("--json")) {
  console.log(json.trimEnd());
} else {
  console.log(JSON.stringify(report.summary, null, 2));
  console.log("\n仍需独立地点资料或区域细分（不是全部都存在史学争议）：");
  for (const province of index.places.values()) {
    if (province.level !== "province") continue;
    const gaps = report.entries.filter((entry) => entry.provinceCode === province.code && entry.needsMoreEvidence);
    if (gaps.length) console.log(`${province.name}：${gaps.map((entry) => `${entry.name}[${entry.categoryLabel}]`).join("、")}`);
  }
  if (args.includes("--write")) console.log("\n已更新 data\\coverage.json");
}
