const GROUP_NAMES = new Set([
  "市辖区", "县", "省直辖县级行政区划", "自治区直辖县级行政区划",
]);

const PROVINCE_ALIASES = {
  "15": "内蒙古", "45": "广西", "54": "西藏", "64": "宁夏", "65": "新疆",
  "71": "台湾", "81": "香港", "82": "澳门",
};

const ETHNIC_NAMES = [
  "哈萨克", "柯尔克孜", "塔吉克", "乌孜别克", "俄罗斯", "鄂温克",
  "鄂伦春", "达斡尔", "裕固", "保安", "东乡", "撒拉", "土家",
  "布依", "仡佬", "仫佬", "毛南", "拉祜", "傈僳", "纳西", "哈尼",
  "景颇", "基诺", "布朗", "独龙", "德昂", "普米", "阿昌", "佤",
  "蒙古", "维吾尔", "朝鲜", "回", "藏", "壮", "苗", "彝", "侗",
  "瑶", "白", "傣", "黎", "畲", "水", "羌", "土", "满", "锡伯",
  "高山", "赫哲", "门巴", "珞巴", "京", "塔塔尔",
];
const ETHNIC_SUFFIX = new RegExp(`(?:${ETHNIC_NAMES.join("|")})(?:族)?$`, "u");
const MAX_QUERY_LENGTH = 80;

export function normalizeInput(input) {
  if (typeof input !== "string") return "";
  return input.normalize("NFKC").replace(/[\s/\\、,，·>＞-]+/gu, "").trim();
}

export function nameAliases(place) {
  const aliases = new Set([place.name]);
  let short = PROVINCE_ALIASES[place.code];
  if (!short) {
    short = place.name.replace(/(?:特别行政区|自治区|自治州|自治县|自治旗|地区|省|市|县|区|盟|旗)$/u, "");
    if (/自治(?:区|州|县|旗)$/u.test(place.name)) {
      let previous;
      do {
        previous = short;
        short = short.replace(ETHNIC_SUFFIX, "");
      } while (short !== previous);
    }
  }
  // Single-character counties, such as 单县, must not become unsafe one-character aliases.
  if (short.length >= 2) aliases.add(short);
  return [...aliases];
}

function addToIndex(index, key, code) {
  const normalized = normalizeInput(key);
  if (!normalized) return;
  if (!index.has(normalized)) index.set(normalized, new Set());
  index.get(normalized).add(code);
}

function pathSelections(path) {
  const last = path.at(-1);
  const ancestors = path.slice(0, -1);
  const selections = [];
  for (let mask = 0; mask < 2 ** ancestors.length; mask += 1) {
    selections.push([...ancestors.filter((_, i) => mask & (1 << i)), last]);
  }
  return selections;
}

function combinations(groups) {
  return groups.reduce(
    (prefixes, group) => prefixes.flatMap((prefix) => group.map((name) => prefix + name)),
    [""],
  );
}

export function createGazetteer(data) {
  if (!Array.isArray(data) || data.length !== 31) {
    throw new Error("行政名称数据格式不正确：应有 31 个大陆省级节点。");
  }
  const places = new Map();
  function add(code, name, level, parentCode = null) {
    if (typeof code !== "string" || typeof name !== "string" || !name || places.has(code)) {
      throw new Error("行政名称数据存在缺失字段或重复代码。");
    }
    const parent = parentCode ? places.get(parentCode) : null;
    if (parentCode && !parent) throw new Error("行政名称数据缺少上级节点。");
    const place = { code, name, level, parentCode, provinceCode: parent?.provinceCode ?? code };
    place.path = parent ? [...parent.path, place] : [place];
    place.label = place.path.map((part) => part.name).join(" / ");
    places.set(code, place);
  }

  for (const province of data) {
    add(province.code, province.name, "province");
    if (!Array.isArray(province.children)) throw new Error("省级节点缺少下级名称。");
    for (const city of province.children) {
      if (!Array.isArray(city.children)) throw new Error("地级节点缺少下级名称。");
      const isGroup = GROUP_NAMES.has(city.name);
      if (!isGroup) add(city.code, city.name, "prefecture", province.code);
      for (const area of city.children) {
        const tail = Number(area.code?.slice(-2));
        if (typeof area.code !== "string") throw new Error("县级节点缺少代码。");
        if (area.code.length !== 6 || (tail >= 71 && tail <= 80)) continue;
        add(area.code, area.name, "county", isGroup ? province.code : city.code);
      }
    }
  }
  add("71", "台湾省", "province");
  add("81", "香港特别行政区", "province");
  add("82", "澳门特别行政区", "province");

  const exact = new Map();
  const aliases = new Map();
  for (const place of places.values()) {
    for (const path of pathSelections(place.path)) {
      addToIndex(exact, path.map((part) => part.name).join(""), place.code);
      for (const key of combinations(path.map(nameAliases))) addToIndex(aliases, key, place.code);
    }
  }
  const counts = { province: 0, prefecture: 0, county: 0 };
  for (const place of places.values()) counts[place.level] += 1;
  return { places, exact, aliases, counts };
}

function recordsFor(index, codes) {
  return [...codes].sort().map((code) => index.places.get(code));
}

export function lookup(index, input) {
  const query = normalizeInput(input);
  if (!query) return { status: "empty", query, candidates: [] };
  if (query.length > MAX_QUERY_LENGTH) return { status: "invalid", query, candidates: [] };
  // Official names/full paths win; aliases never choose the first of several names.
  const matches = index.exact.get(query) ?? index.aliases.get(query);
  if (!matches) return { status: "unknown", query, candidates: [] };
  const candidates = recordsFor(index, matches);
  return { status: candidates.length === 1 ? "found" : "ambiguous", query, candidates };
}

export function suggest(index, input, limit = 7) {
  const result = lookup(index, input);
  if (result.status === "empty" || result.status === "invalid") return [];
  if (result.candidates.length) return result.candidates.slice(0, limit);
  if (result.query.length < 2) return [];
  const codes = new Set();
  for (const [alias, matches] of index.aliases) {
    if (!alias.startsWith(result.query)) continue;
    for (const code of matches) codes.add(code);
  }
  const levelRank = { province: 0, prefecture: 1, county: 2 };
  return recordsFor(index, codes)
    .sort((a, b) => levelRank[a.level] - levelRank[b.level] || a.code.localeCompare(b.code))
    .slice(0, limit);
}

export const LEVEL_NAMES = { province: "省级", prefecture: "地级", county: "县级" };
