import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createGazetteer, lookup } from "../js/lookup.js";
import { resolveHistory } from "../data/history.js";
import { presentHistory } from "../js/presentation.js";

const data = JSON.parse(await readFile(new URL("../data/places.json", import.meta.url), "utf8"));
const index = createGazetteer(data);
const recordFor = (query) => resolveHistory(lookup(index, query).candidates[0], index);

test("legacy kingdom names and seal colors remain unchanged", () => {
  for (const [query, expected, tone] of [
    ["高邮", "曹魏", "wei"], ["扬州", "曹魏", "wei"],
    ["南京", "孙吴", "wu"], ["成都", "蜀汉", "shu"], ["西安市", "曹魏", "wei"],
  ]) {
    const view = presentHistory(recordFor(query));
    assert.equal(view.answer, expected);
    assert.equal(view.tone, tone);
    assert.equal(view.primary[0].typeLabel, "政权");
    assert.equal(view.primary[0].relationLabel, "区域归属参考");
    assert.deepEqual(view.contacts, []);
  }
  const jiangsu = presentHistory(recordFor("江苏"));
  assert.equal(jiangsu.answer, "曹魏 / 孙吴，均有涉及");
  assert.equal(jiangsu.stamp, "魏·吴");
});

test("fallback and genuinely unclassified places keep explicit status and scope", () => {
  const county = presentHistory(recordFor("南京鼓楼"));
  assert.match(county.status, /本地未单独核验/);
  assert.equal(county.answer, "背景：孙吴");
  assert.equal(county.evidenceLabel, "城市中心锚点");
  assert.equal(presentHistory(recordFor("海南省")).answer, "暂不作归属判断");
  assert.equal(presentHistory(recordFor("西藏")).answer, "三国主要控制区之外");
});

test("contact references never become an affiliation title or seal", () => {
  const record = {
    ...recordFor("海南省"),
    entities: [{ id: "wei", relation: "contact", note: "测试关系，不是实际地区映射。" }],
  };
  const view = presentHistory(record);
  assert.equal(view.answer, "暂不作归属判断");
  assert.equal(view.stamp, "待考");
  assert.deepEqual(view.primary, []);
  assert.equal(view.contacts[0].relationLabel, "官署 / 往来联系");
  assert.match(view.entityAnnouncement, /曹魏，政权，官署/);
});

test("undefined entities, relationships and result categories fail explicitly", () => {
  const base = recordFor("南京");
  assert.throws(() => presentHistory({ ...base, entities: [{ id: "invented", relation: "regional" }] }), /未定义/);
  assert.throws(() => presentHistory({ ...base, entities: [{ id: "wei", relation: "invented" }] }), /未定义/);
  assert.throws(() => presentHistory({ ...base, kind: "invented" }), /未定义/);
  assert.throws(() => presentHistory({ ...base, evidence: "invented" }), /未定义/);
  assert.throws(() => presentHistory({ ...base, basis: "invented" }), /未定义/);
  assert.throws(() => presentHistory({ ...base, entities: [] }), /缺少区域实体/);
  assert.throws(() => presentHistory({ ...base, kind: "coexistence" }), /概括标题/);
  assert.throws(() => presentHistory({ ...base, entities: [{ id: "xianbei", relation: "affiliation" }] }), /不能把/);
});

test("other polities and tribal groups have explicit, distinct presentation types", () => {
  const qiuci = presentHistory(recordFor("库车"));
  assert.equal(qiuci.answer, "龟兹");
  assert.equal(qiuci.primary[0].typeLabel, "政权");
  assert.equal(qiuci.evidenceLabel, "历史地理锚点");
  assert.equal(qiuci.stamp, "龟兹");
  assert.equal(qiuci.tone, "polity");

  const grassland = presentHistory(recordFor("内蒙古"));
  const xianbei = grassland.primary.find((entity) => entity.id === "xianbei");
  assert.equal(xianbei.typeLabel, "族群 / 诸部");
  assert.equal(xianbei.relationLabel, "活动范围线索");
  assert.match(xianbei.note, /不是一个疆界固定的国家/);
  assert.match(grassland.status, /并非一个统一国家/);
});

test("Xinjiang's grouped title and compact seal do not promote contact into territorial rule", () => {
  const view = presentHistory(recordFor("新疆"));
  assert.equal(view.answer, "西域诸国并存");
  assert.equal(view.stamp, "并存");
  assert.equal(view.primary.length, 6);
  assert.ok(view.primary.every((entity) => entity.id !== "wei"));
  assert.deepEqual(view.contacts.map(({ id }) => id), ["wei"]);
  assert.match(view.contacts[0].note, /不等于今天新疆全境/);
  assert.ok(view.primary.every((entity) => entity.typeLabel && entity.relationLabel && entity.note));
  assert.equal(view.primary.find((entity) => entity.id === "cheshi").typeLabel, "多个政权");

  const fallback = presentHistory(recordFor("乌鲁木齐"));
  assert.equal(fallback.answer, "本地独立资料待补");
  assert.equal(fallback.backgroundAnswer, "西域诸国并存");
  assert.match(fallback.status, /本地未单独核验/);
});

test("modern Shanshan uses the front Cheshi polity, not the ancient Shanshan namesake", () => {
  const view = presentHistory(recordFor("鄯善县"));
  assert.equal(view.answer, "车师前部");
  assert.equal(view.primary[0].typeLabel, "政权");
  assert.equal(view.primary[0].id, "cheshiFront");
  assert.ok(!view.primary.some((entity) => entity.id === "shanshan"));
  assert.equal(presentHistory(recordFor("若羌县")).answer, "鄯善");
});
