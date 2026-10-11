import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createGazetteer, lookup } from "../js/lookup.js";
import { createCoverage } from "../js/coverage.js";
import { presentHistory } from "../js/presentation.js";
import { evidenceCategory, resolveHistory, PLACE_RULES } from "../data/history.js";
import { MAP_CITY_GROUPS, MAP_CITY_RULES, REGIONAL_REVIEWS } from "../data/map-regions.js";

const index = createGazetteer(JSON.parse(await readFile(new URL("../data/places.json", import.meta.url), "utf8")));
const report = createCoverage(index);
function history(query) {
  const match = lookup(index, query);
  assert.equal(match.status, "found", query);
  return resolveHistory(match.candidates[0], index);
}

test("all 34 provinces and 333 prefectures have exactly one auditable evidence category", () => {
  assert.equal(report.entries.length, 367);
  assert.equal(new Set(report.entries.map(({ code }) => code)).size, 367);
  assert.equal(report.entries.filter(({ level }) => level === "province").length, 34);
  assert.equal(report.entries.filter(({ level }) => level === "prefecture").length, 333);
  assert.deepEqual(report.summary.auditedPrefectures, {
    "local-evidence": 20, "atlas-region": 223, "regional-overview": 41,
    "parent-fallback": 47, "reviewed-gap": 2,
  });
  assert.equal(report.summary.countyAnchors, 12);
  assert.equal(333 - report.summary.auditedPrefectures["parent-fallback"] + report.summary.countyAnchors, Object.keys(PLACE_RULES).length);
  for (const entry of report.entries) {
    assert.ok(report.categories[entry.category]);
    assert.ok(entry.scope && entry.limitation && entry.sources.length);
    for (const source of entry.sources) assert.ok(report.sources[source]);
    if (entry.category === "parent-fallback") {
      assert.notEqual(entry.code, entry.evidencePlaceCode);
      assert.equal(entry.needsMoreEvidence, true);
    } else {
      assert.equal(entry.code, entry.evidencePlaceCode);
    }
  }
});

test("published coverage report is reproducible and cannot silently go stale", async () => {
  const saved = JSON.parse(await readFile(new URL("../data/coverage.json", import.meta.url), "utf8"));
  assert.deepEqual(saved, report, "Run npm run audit:update after changing historical data.");
});

test("every atlas-derived city has explicit code/name membership and its own sheet relationship", () => {
  const codes = [];
  for (const group of MAP_CITY_GROUPS) {
    assert.ok(group.area && group.sheet && group.entity);
    for (const [code, name] of Object.entries(group.places)) {
      assert.equal(index.places.get(code).name, name);
      assert.ok(name.endsWith("市"), "Territorial prefectures must not be put in city-core lists.");
      const rule = MAP_CITY_RULES[code];
      assert.equal(rule.basis, "atlas");
      assert.equal(rule.mapGroup, group.id);
      assert.deepEqual(rule.sources, [`atlas${group.sheet}`]);
      assert.equal(evidenceCategory(resolveHistory(index.places.get(code), index)), "atlas-region");
      codes.push(code);
    }
  }
  assert.equal(codes.length, new Set(codes).size);
  assert.equal(codes.length, 208);
});

test("all leagues, autonomous prefectures and districts retain whole-region scope", () => {
  const territorial = [...index.places.values()].filter((p) => p.level === "prefecture" && !p.name.endsWith("市"));
  assert.equal(territorial.length, 40);
  for (const place of territorial) {
    assert.ok(REGIONAL_REVIEWS[place.code], place.name);
    const result = resolveHistory(place, index);
    assert.equal(result.evidence, "regional-overview");
    assert.match(result.scope, /不以首府或行政驻地替代全域/);
    assert.equal(result.isFallback, false);
    assert.equal(evidenceCategory(result), "regional-overview");
    assert.equal(result.coverageGap, true, "An overview is not a completed county-by-county boundary reconstruction.");
  }
});

test("mixed-province cities resolve to supported specific answers, not province-level lists", () => {
  for (const [query, id] of [
    ["苏州市", "wu"], ["无锡市", "wu"], ["常州市", "wu"], ["镇江市", "wu"],
    ["合肥市", "wei"], ["芜湖市", "wu"], ["安庆市", "wu"], ["六安市", "wei"],
    ["武汉市", "wu"], ["荆州市", "wu"], ["宜昌市", "wu"], ["十堰市", "wei"],
    ["孝感市", "wei"], ["随州市", "wei"], ["荆门市", "wu"],
    ["宝鸡市", "wei"], ["咸阳市", "wei"], ["汉中市", "shu"], ["安康市", "wei"],
    ["天水市", "wei"], ["陇南市", "shu"], ["贵阳市", "shu"], ["安顺市", "shu"],
    ["毕节市", "shu"], ["六盘水市", "shu"], ["遵义市", "shu"], ["铜仁市", "wu"],
    ["凯里市", "shu"], ["都匀市", "shu"], ["兴义市", "shu"],
  ]) {
    const result = history(query);
    assert.equal(result.isFallback, false, query);
    assert.deepEqual(result.entities.map(({ id }) => id), [id], query);
    assert.ok(result.sources.length, query);
    assert.ok(["local-evidence", "atlas-region"].includes(evidenceCategory(result)), query);
  }
  assert.equal(evidenceCategory(history("贵阳")), "local-evidence");
  assert.equal(evidenceCategory(history("铜仁市")), "atlas-region");
});

test("explicit atlas coverage extends beyond the priority provinces", () => {
  for (const [query, id] of [
    ["石家庄市", "wei"], ["济南市", "wei"], ["郑州市", "wei"], ["福州市", "wu"],
    ["南昌市", "wu"], ["长沙市", "wu"], ["南宁市", "wu"], ["昆明市", "shu"],
    ["绵阳市", "shu"], ["兰州市", "wei"], ["西宁市", "wei"], ["长春市", "fuyu"],
    ["通化市", "goguryeo"], ["承德市", "xianbei"],
  ]) {
    const result = history(query);
    assert.equal(result.isFallback, false, query);
    assert.equal(result.entities[0].id, id, query);
    assert.equal(evidenceCategory(result), "atlas-region", query);
  }
});

test("province distribution, place priority and county fallback are kept separate", () => {
  assert.match(history("贵州省").headline, /以蜀汉为主/);
  assert.match(history("贵州省").summary, /铜仁/);
  assert.deepEqual(history("安徽省").entities.map(({ id }) => id), ["wei", "wu"]);
  assert.match(history("湖北省").summary, /孝感.*魏.*武汉.*吴/);
  assert.match(history("陕西省").headline, /安康.*魏.*汉中.*蜀/);

  const city = history("恩施市");
  const region = history("恩施土家族苗族自治州");
  assert.equal(evidenceCategory(city), "local-evidence");
  assert.equal(evidenceCategory(region), "regional-overview");
  assert.notEqual(city.scope, region.scope);

  for (const query of ["苏州市姑苏区", "贵阳市南明区"]) {
    const result = history(query);
    assert.equal(result.isFallback, true);
    assert.equal(evidenceCategory(result), "parent-fallback");
    assert.match(result.fallbackNote, /尚未单独核验/);
    assert.equal(result.evidencePlace.level, "prefecture");
  }
});

test("physical frontiers and missing source work are not disguised as precise national assignment", () => {
  for (const query of ["南通市", "滁州市"]) {
    const result = history(query);
    assert.equal(result.isFallback, false);
    assert.equal(result.kind, "uncertain");
    assert.equal(evidenceCategory(result), "reviewed-gap");
    assert.deepEqual(result.entities, []);
    assert.ok(result.gapReason);
  }
  const missing = history("乌鲁木齐市");
  assert.equal(evidenceCategory(missing), "parent-fallback");
  assert.equal(presentHistory(missing).answer, "本地独立资料待补");
  assert.equal(presentHistory(missing).backgroundAnswer, "西域诸国并存");

  assert.equal(history("榆林市").entities[0].id, "xiongnu");
  assert.equal(history("榆林市").entities[0].relation, "activity");
  assert.equal(history("延安市").entities[0].id, "qiangHu");
  assert.match(history("承德市").dateNote, /236—262/);
});

test("Turpan narrows the Western Regions context without turning Wei offices into territorial control", () => {
  const record = history("吐鲁番市");
  const view = presentHistory(record);
  assert.equal(record.isFallback, false);
  assert.equal(evidenceCategory(record), "atlas-region");
  assert.equal(record.evidence, "historic-site");
  assert.match(record.scope, /交河故城—高昌/);
  assert.match(record.dateNote, /公元前二世纪至十四世纪/);
  assert.equal(view.answer, "车师前部");
  assert.deepEqual(view.primary.map(({ id }) => id), ["cheshiFront"]);
  assert.deepEqual(view.contacts.map(({ id }) => id), ["wei"]);
  assert.match(record.caveat, /不是后世的高昌王国/);
});
