import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createGazetteer, lookup, normalizeInput, suggest } from "../js/lookup.js";
import { resolveHistory } from "../data/history.js";

const data = JSON.parse(await readFile(new URL("../data/places.json", import.meta.url), "utf8"));
const index = createGazetteer(data);
const find = (query) => {
  const result = lookup(index, query);
  assert.equal(result.status, "found", query);
  return result.candidates[0];
};
const history = (query) => resolveHistory(find(query), index);

test("verified locality and city-core fixtures retain their evidence scope", () => {
  for (const [query, kingdom] of [
    ["高邮", "wei"], ["扬州", "wei"], ["南京", "wu"], ["成都", "shu"],
    ["西安市", "wei"], ["洛阳", "wei"], ["汉中", "shu"], ["杭州", "wu"],
    ["广州", "wu"], ["襄阳", "wei"],
  ]) {
    const result = history(query);
    assert.deepEqual(result.entities, [{ id: kingdom, relation: "affiliation" }], query);
    assert.equal(result.isFallback, false, query);
    assert.equal(result.year, 262);
    assert.equal(result.evidence, query === "高邮" ? "locality" : "city-core");
  }
});

test("Gaoyou does not invent a continuously existing county in 262", () => {
  const result = history("高邮市");
  assert.match(result.caveat, /224/);
  assert.match(result.caveat, /被废/);
  assert.match(result.caveat, /不声称 262 年仍存在同名县/);
});

test("spaces, administrative suffixes, full and partial paths are normalized safely", () => {
  for (const input of [
    " 高邮 ", "高邮市", "　江苏省　扬州市　高邮市　", "江苏 / 扬州 / 高邮",
    "江苏省扬州高邮市", "江苏高邮", "扬州市高邮", "江苏省、扬州市、高邮市",
  ]) {
    assert.equal(find(input).code, "321084", input);
  }
  assert.equal(find("北京市 朝阳区").code, "110105");
  assert.equal(find("北京朝阳").code, "110105");
  assert.equal(find("新疆维吾尔自治区").code, "65");
  assert.equal(find("广西").code, "45");
  assert.equal(find("黔东南").name, "黔东南苗族侗族自治州");
  assert.equal(find("新疆伊犁").name, "伊犁哈萨克自治州");
  assert.equal(find("四川省阿坝藏族羌族自治州").name, "阿坝藏族羌族自治州");
  assert.equal(normalizeInput("Ａ　Ｂ"), "AB");
});

test("ambiguous names require user choice; exact official names take priority", () => {
  for (const input of ["朝阳", "鼓楼", "长安", "吉林", "阿坝", "西安"]) {
    const result = lookup(index, input);
    assert.equal(result.status, "ambiguous", input);
    assert.ok(result.candidates.length > 1);
    assert.equal(new Set(result.candidates.map((p) => p.label)).size, result.candidates.length);
  }
  assert.equal(find("朝阳市").code, "2113");
  assert.equal(find("朝阳县").code, "211321");
  assert.equal(find("南京鼓楼").code, "320106");
  assert.equal(find("福建省福州市鼓楼区").code, "350102");
  assert.equal(find("西安长安").code, "610116");
  assert.equal(find("石家庄长安区").code, "130102");
  assert.equal(find("吉林省").code, "22");
  assert.equal(find("吉林市").code, "2202");
});

test("province-level frontiers are not flattened to one kingdom", () => {
  for (const query of ["江苏", "安徽", "湖北"]) {
    const result = history(query);
    assert.deepEqual(result.entities.map(({ id }) => id), ["wei", "wu"]);
    assert.equal(result.evidence, "province");
    assert.equal(result.kind, "mixed");
  }
  assert.deepEqual(history("陕西").entities.filter(({ relation }) => relation !== "activity").map(({ id }) => id), ["wei", "shu"]);
  assert.equal(history("四川").kind, "frontier");
});

test("counties only inherit explicitly marked context, never verified city-wide claims", () => {
  const gulou = history("南京鼓楼");
  assert.equal(gulou.isFallback, true);
  assert.equal(gulou.evidence, "city-core");
  assert.equal(gulou.evidencePlace.code, "3201");
  assert.match(gulou.fallbackNote, /尚未单独核验鼓楼区/);
  assert.match(gulou.scope, /城市中心/);

  const baoying = history("宝应");
  assert.equal(baoying.isFallback, true);
  assert.equal(baoying.evidencePlace.code, "3210");
  assert.match(baoying.fallbackNote, /不能外推/);

  const hefei = history("合肥");
  assert.equal(hefei.isFallback, false);
  assert.equal(hefei.evidence, "city-core");
  assert.deepEqual(hefei.entities.map(({ id }) => id), ["wei"]);
  assert.equal(hefei.evidencePlace.name, "合肥市");
});

test("outside, uncertain, and unknown are different outcomes", () => {
  for (const query of ["黑龙江", "西藏", "台湾"]) {
    assert.equal(history(query).kind, "outside");
    assert.deepEqual(history(query).entities, []);
  }
  assert.equal(history("新疆").kind, "coexistence");
  assert.equal(history("拉萨").isFallback, true);
  assert.equal(history("拉萨").kind, "outside");
  assert.equal(history("海南省").kind, "uncertain");
  assert.equal(lookup(index, "不存在的城市").status, "unknown");
});

test("Xinjiang describes coexisting polities and separates Wei's administrative contacts", () => {
  const result = history("新疆维吾尔自治区");
  assert.equal(result.headline, "西域诸国并存");
  assert.equal(result.evidence, "province");
  assert.equal(result.isFallback, false);
  for (const id of ["qiuci", "yutian", "shule", "shanshan", "cheshi", "wusun"]) {
    assert.equal(result.entities.find((entity) => entity.id === id).relation, "regional");
  }
  assert.equal(result.entities.find((entity) => entity.id === "wei").relation, "contact");
  assert.match(result.summary, /不是一个统一国家/);
  assert.match(result.caveat, /不能一律概括成完全独立或完全直属/);
  assert.ok(result.dateNote);
});

test("site-based anchors retain actual scope and chronology rather than modern full boundaries", () => {
  for (const [query, entity, scope] of [
    ["库车", "qiuci", "龟兹故城"],
    ["和田市", "yutian", "和田绿洲"],
    ["喀什市", "shule", "喀什绿洲"],
    ["若羌县", "shanshan", "若羌县城"],
    ["集安市", "goguryeo", "国内城—丸都"],
    ["吉林市", "fuyu", "东团山—南城子"],
  ]) {
    const result = history(query);
    assert.equal(result.entities[0].id, entity, query);
    assert.equal(result.evidence, "historic-site", query);
    assert.equal(result.isFallback, false, query);
    assert.match(result.scope, new RegExp(scope), query);
    assert.ok(result.dateNote, query);
    assert.ok(result.sources.length >= 2, query);
  }
  const district = history("吉林市丰满区");
  assert.equal(district.isFallback, true);
  assert.equal(district.evidencePlace.name, "吉林市");
  assert.match(district.fallbackNote, /尚未单独核验丰满区/);
  assert.match(district.scope, /东团山—南城子/);
  assert.match(history("和田市").caveat, /不能写成 262 年国都遗址已被精确确证/);
});

test("ancient polity names are not injected into the modern name matcher", () => {
  for (const query of ["龟兹", "于阗", "夫余"]) {
    assert.equal(lookup(index, query).status, "unknown");
  }
  assert.equal(find("扶余市").code, "220781");
  assert.equal(history("扶余市").isFallback, true);
  assert.equal(find("鄯善县").code, "650421");
  assert.equal(history("鄯善县").isFallback, false);
  assert.equal(history("鄯善县").entities[0].id, "cheshiFront");
  assert.match(history("鄯善县").nameNote, /不等于古鄯善国中心/);
  assert.equal(lookup(index, "和田").status, "ambiguous");
  assert.equal(lookup(index, "喀什").status, "ambiguous");
});

test("northeastern region remains a multi-polity background, not a whole-province assignment", () => {
  const province = history("吉林省");
  assert.equal(province.kind, "coexistence");
  assert.deepEqual(province.entities.map(({ id }) => id), ["fuyu", "goguryeo"]);
  assert.match(province.summary, /不能把全省统一判为其中一国/);
  const county = history("扶余市");
  assert.equal(county.isFallback, true);
  assert.equal(county.evidencePlace.code, "22");
  assert.match(county.caveat, /不能凭同名映射到今天的扶余市/);
});

test("empty, invalid, HTML-like and substring inputs never fabricate matches", () => {
  for (const input of ["", "　 \n ", null, undefined]) {
    assert.equal(lookup(index, input).status, "empty");
  }
  for (const input of ["我在南京", "京", "江苏成都", "<img src=x onerror=alert(1)>", "单"]) {
    assert.equal(lookup(index, input).status, "unknown", input);
  }
  assert.equal(lookup(index, "甲".repeat(81)).status, "invalid");
  assert.equal(find("单县").name, "单县");
});

test("suggestions use prefixes but never turn a prefix into an automatic answer", () => {
  assert.equal(lookup(index, "南京鼓").status, "unknown");
  assert.ok(suggest(index, "南京鼓").some((p) => p.code === "320106"));
  assert.equal(suggest(index, "").length, 0);
  assert.equal(suggest(index, "京").length, 0);
  assert.ok(suggest(index, "朝阳", 2).length <= 2);
});
