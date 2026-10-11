import { ENTITIES, ENTITY_TYPES, RELATION_TYPES, EVIDENCE_CATEGORIES, evidenceCategory } from "../data/history.js";

const STATUS_NAMES = {
  single: "地点线索 · 非全境判定",
  regional: "省域参考 · 非全境判定",
  mixed: "跨境地区 · 不能只选一国",
  frontier: "边地或控制程度不一",
  coexistence: "多方并存 · 并非一个统一国家",
  outside: "三国主要控制区之外 · 本库未细分",
  uncertain: "已识别地区 · 归属暂不确定",
};

export const EVIDENCE_NAMES = {
  locality: "地方沿革 + 年代地图",
  "city-core": "城市中心锚点",
  "historic-site": "历史地理锚点",
  "regional-overview": "全区域分区说明",
  province: "省域轮廓（粗粒度）",
};

export function presentHistory(record) {
  if (!STATUS_NAMES[record.kind] || !EVIDENCE_NAMES[record.evidence]) {
    throw new Error("历史结果含有未定义的状态或证据层级。");
  }
  const entities = record.entities.map((reference) => {
    const entity = ENTITIES[reference.id];
    if (!entity || !ENTITY_TYPES[entity.type] || !RELATION_TYPES[reference.relation]) {
      throw new Error(`历史实体或关系未定义：${reference.id}`);
    }
    if (entity.type !== "polity" && reference.relation === "affiliation") {
      throw new Error(`不能把多个政权或族群当作单一国家归属：${reference.id}`);
    }
    return {
      ...entity, ...reference,
      typeLabel: ENTITY_TYPES[entity.type],
      relationLabel: RELATION_TYPES[reference.relation],
    };
  });
  const primary = entities.filter((entity) => entity.relation !== "contact");
  const contacts = entities.filter((entity) => entity.relation === "contact");
  const names = primary.map((entity) => entity.name).join(" / ");
  if (record.kind === "coexistence" && !record.headline) {
    throw new Error("多方并存结果需要概括标题，不能将多个实体拼成一个国家。");
  }

  let answer = record.headline;
  if (!answer) {
    if (record.kind === "outside") answer = "三国主要控制区之外";
    else if (record.kind === "uncertain") answer = "暂不作归属判断";
    else if (!primary.length) throw new Error("历史归属结果缺少区域实体。");
    else if (record.kind === "frontier") answer = `${names} · 局部参考`;
    else if (record.kind === "regional") answer = `${names} · 区域参考`;
    else if (record.kind === "mixed") answer = `${names}，均有涉及`;
    else answer = names;
  }
  let backgroundAnswer = null;
  if (record.isFallback) {
    if (record.place.level === "prefecture") {
      backgroundAnswer = answer;
      answer = "本地独立资料待补";
    } else {
      answer = `背景：${answer}`;
    }
  }

  let stamp = record.kind === "outside" ? "外" : "待考";
  if (primary.length === 1) stamp = primary[0].short;
  else if (primary.length === 2 && primary.every((entity) => entity.short.length === 1)) {
    stamp = primary.map((entity) => entity.short).join("·");
  } else if (primary.length > 1) stamp = "并存";
  const tone = primary.length === 1 ? primary[0].tone : "neutral";
  return {
    answer, backgroundAnswer, stamp, tone, primary, contacts,
    methodLabel: EVIDENCE_CATEGORIES[evidenceCategory(record)],
    evidenceLabel: EVIDENCE_NAMES[record.evidence],
    status: record.isFallback ? "上级参考 · 本地未单独核验" : STATUS_NAMES[record.kind],
    entityAnnouncement: entities.map((entity) => `${entity.name}，${entity.typeLabel}，${entity.relationLabel}`).join("；"),
  };
}
