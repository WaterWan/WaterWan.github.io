import {
  EVIDENCE_CATEGORIES, LOCAL_RULES, PLACE_RULES, REFERENCE_YEAR, SOURCES,
  evidenceCategory, resolveHistory,
} from "../data/history.js";

export function createCoverage(index) {
  const categories = Object.keys(EVIDENCE_CATEGORIES);
  const evidenceCounts = Object.fromEntries(["province", "prefecture"].map((level) => [
    level, Object.fromEntries(categories.map((category) => [category, 0])),
  ]));
  const entries = [];
  for (const place of index.places.values()) {
    if (place.level === "county") continue;
    const record = resolveHistory(place, index);
    const category = evidenceCategory(record);
    evidenceCounts[place.level][category] += 1;
    const wholeRegion = place.level === "province" || !place.name.endsWith("市");
    entries.push({
      code: place.code,
      name: place.name,
      fullName: place.label,
      provinceCode: place.provinceCode,
      provinceName: index.places.get(place.provinceCode).name,
      level: place.level,
      queryScopeType: wholeRegion ? "whole-region" : "city-core",
      category,
      categoryLabel: EVIDENCE_CATEGORIES[category],
      evidencePlaceCode: record.evidencePlace.code,
      evidencePlaceName: record.evidencePlace.name,
      evidenceLevel: record.evidence,
      scope: record.scope,
      resultKind: record.kind,
      entities: record.entities.filter((entity) => entity.relation !== "contact").map((entity) => entity.id),
      contacts: record.entities.filter((entity) => entity.relation === "contact").map((entity) => entity.id),
      sources: record.sources,
      mapGroup: record.mapGroup ?? null,
      needsMoreEvidence: record.isFallback || record.basis === "gap" || record.coverageGap === true || record.kind === "uncertain",
      limitation: record.fallbackNote ?? record.caveat,
    });
  }
  entries.sort((a, b) => a.code.localeCompare(b.code));
  const sourceIds = Object.keys(SOURCES).sort();
  const countyAnchors = Object.keys(PLACE_RULES).filter((code) => index.places.get(code)?.level === "county").length;
  return {
    referenceYear: REFERENCE_YEAR,
    nameSnapshot: "2023-06-30",
    note: "覆盖审计不等于逐地考证。直接资料、图域参照、区域综述、上级粗推与已检查的缺口分别计数。城市取所在地，省/州/地区/盟保留整个区域视角；县级不在367条审计行中。",
    summary: {
      administrativeNames: index.counts,
      auditedProvinces: evidenceCounts.province,
      auditedPrefectures: evidenceCounts.prefecture,
      totalAudited: entries.length,
      needingMoreEvidence: {
        province: entries.filter((entry) => entry.level === "province" && entry.needsMoreEvidence).length,
        prefecture: entries.filter((entry) => entry.level === "prefecture" && entry.needsMoreEvidence).length,
      },
      explicitPlaceRules: Object.keys(PLACE_RULES).length,
      curatedLocalEntries: Object.keys(LOCAL_RULES).length,
      countyAnchors,
    },
    categories: EVIDENCE_CATEGORIES,
    sources: Object.fromEntries(sourceIds.map((id) => [id, SOURCES[id]])),
    entries,
  };
}
