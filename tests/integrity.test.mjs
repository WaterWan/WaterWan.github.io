import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createGazetteer, lookup } from "../js/lookup.js";
import { ENTITIES, ENTITY_TYPES, RELATION_TYPES, PROVINCE_RULES, LOCAL_RULES, PLACE_RULES, SOURCES, resolveHistory } from "../data/history.js";
import { presentHistory } from "../js/presentation.js";

const bytes = await readFile(new URL("../data/places.json", import.meta.url));
const data = JSON.parse(bytes);
const provenance = JSON.parse(await readFile(new URL("../data/provenance.json", import.meta.url), "utf8"));
const index = createGazetteer(data);

test("bundled source bytes match their pinned provenance", () => {
  assert.equal(createHash("sha256").update(bytes).digest("hex"), provenance.sha256);
  assert.equal(provenance.snapshotDate, "2023-06-30");
  assert.equal(provenance.license, "WTFPL-2.0");
});

test("coverage counts, parent paths, codes and excluded statistical groups stay truthful", () => {
  assert.deepEqual(index.counts, { province: 34, prefecture: 333, county: 2850 });
  assert.equal(index.places.size, 3217);
  assert.equal(index.places.has("321071"), false);
  assert.equal(index.places.has("1101"), false);
  assert.equal(index.places.has("441900119"), false);
  assert.equal(index.places.get("419001").parentCode, "41");
  assert.equal(index.places.get("500235").parentCode, "50");
  for (const place of index.places.values()) {
    assert.equal(place.path.at(-1), place);
    assert.ok(index.places.has(place.provinceCode));
    assert.ok(lookup(index, place.label).candidates.some((p) => p.code === place.code), place.label);
    if (place.parentCode) assert.ok(index.places.has(place.parentCode));
  }
});

test("every recognized name resolves to a sourced, scoped result or explicit uncertainty", () => {
  assert.equal(Object.keys(PROVINCE_RULES).length, 34);
  assert.equal(Object.keys(LOCAL_RULES).length, 50);
  assert.equal(Object.keys(PLACE_RULES).length, 298);
  for (const [code, rule] of Object.entries({ ...PROVINCE_RULES, ...PLACE_RULES })) {
    assert.ok(index.places.has(code), code);
    assert.ok(rule.summary && rule.caveat && rule.evidence);
    assert.ok(rule.sources.length);
    assert.equal(new Set(rule.entities.map(({ id }) => id)).size, rule.entities.length);
    for (const entity of rule.entities) {
      assert.ok(ENTITIES[entity.id]);
      assert.ok(RELATION_TYPES[entity.relation]);
    }
    for (const source of rule.sources) assert.ok(SOURCES[source]);
    if (rule.evidence === "historic-site") assert.ok(rule.scope && rule.dateNote);
    if (rule.expectedName) assert.equal(index.places.get(code).name, rule.expectedName);
  }
  for (const place of index.places.values()) {
    const result = resolveHistory(place, index);
    assert.equal(result.year, 262);
    assert.ok(result.scope);
    const view = presentHistory(result);
    assert.ok(view.answer && view.stamp && view.status && view.evidenceLabel);
    if (result.isFallback) {
      assert.ok(result.fallbackNote);
      assert.notEqual(result.evidencePlace.code, place.code);
    }
    for (const entity of Object.values(ENTITIES)) {
      assert.ok(entity.name && entity.short && entity.tone);
      assert.ok(ENTITY_TYPES[entity.type]);
      assert.doesNotMatch(entity.name, /吐蕃|突厥|回鹘|高昌王国|南诏|大理国/);
    }
  }
  for (const source of Object.values(SOURCES)) {
    assert.ok(["http:", "https:"].includes(new URL(source.url).protocol));
    assert.ok(source.note);
  }
});

test("invalid datasets surface errors instead of producing success-shaped defaults", () => {
  assert.throws(() => createGazetteer(null), /格式不正确/);
  assert.throws(() => createGazetteer([]), /格式不正确/);
  const invalid = structuredClone(data);
  invalid[0].children[0].children[0].code = invalid[0].code;
  invalid[0].code = null;
  assert.throws(() => createGazetteer(invalid), /缺失字段/);
  assert.throws(() => resolveHistory(null, index), /未识别/);
});
