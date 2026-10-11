import { EXTRA_SOURCES, EXTRA_RULES } from "./expanded-history.js";
import { MAP_SOURCES, MAP_CITY_RULES, REGIONAL_REVIEWS } from "./map-regions.js";

export const REFERENCE_YEAR = 262;

export const ENTITY_TYPES = {
  polity: "政权",
  polities: "多个政权",
  peoples: "族群 / 诸部",
};

export const RELATION_TYPES = {
  affiliation: "区域归属参考",
  regional: "区域背景",
  activity: "活动范围线索",
  contact: "官署 / 往来联系",
};

export const ENTITIES = {
  wei: { name: "曹魏", short: "魏", type: "polity", tone: "wei" },
  shu: { name: "蜀汉", short: "蜀", type: "polity", tone: "shu" },
  wu: { name: "孙吴", short: "吴", type: "polity", tone: "wu" },
  qiuci: { name: "龟兹", short: "龟兹", type: "polity", tone: "polity" },
  yutian: { name: "于阗", short: "于阗", type: "polity", tone: "polity" },
  shule: { name: "疏勒", short: "疏勒", type: "polity", tone: "polity" },
  shanshan: { name: "鄯善", short: "鄯善", type: "polity", tone: "polity" },
  cheshi: { name: "车师诸政权", short: "车师", type: "polities", tone: "polity" },
  cheshiFront: { name: "车师前部", short: "车师", type: "polity", tone: "polity" },
  goguryeo: { name: "高句丽", short: "高句丽", type: "polity", tone: "polity" },
  fuyu: { name: "夫余（扶余）", short: "夫余", type: "polity", tone: "polity" },
  xianbei: { name: "鲜卑诸部", short: "诸部", type: "peoples", tone: "peoples" },
  xiongnu: { name: "匈奴诸部", short: "诸部", type: "peoples", tone: "peoples" },
  qiangHu: { name: "羌胡诸部（史料统称）", short: "诸部", type: "peoples", tone: "peoples" },
  wusun: { name: "乌孙", short: "乌孙", type: "polity", tone: "polity" },
};

export const SOURCES = {
  ...EXTRA_SOURCES,
  ...MAP_SOURCES,
  atlas262: {
    title: "中国三国时期历史地图 · 公元 262 年",
    url: "https://osgeo.cn/map/m0346/",
    note: "阅读参考：魏景元三年、蜀汉景耀五年、吴永安五年。未复制地图图片，也未取得或使用精确疆界矢量数据。",
  },
  gaoyou: {
    title: "高邮市人民政府 · 历史沿革",
    url: "https://gaoyou.yangzhou.gov.cn/mlgy/gygk/art/2023/art_0e6f92a8aabf4866a7f571c3911d8552.html",
    note: "记载三国初期属曹魏徐州广陵郡，约 224 年前后高邮县废。这里只作区域参考，不把早期记载当作 262 年完整的县界证据。",
  },
  qiuciSite: {
    title: "中国社会科学网 · 龟兹故城考古发掘及收获",
    url: "https://www.cssn.cn/lsx/lsx_kgx/202212/t20221227_5574454.shtml",
    note: "将库车地区与古龟兹联系，说明故城位于当时库车县库车镇内。考古概述跨越多个时期，仅用于地望，不是 262 年全境边界的证据。",
  },
  yutianSite: {
    title: "中国社会科学网 · 约特干古于阗都城研究报道",
    url: "https://www.cssn.cn/lsx/slcz/202511/t20251121_5950773.shtml",
    note: "报道研究者提出约特干遗址为古于阗国西城的认识。作为和田绿洲的区域地望线索，不写成 262 年国都位置已经精确确证。",
  },
  fuyuSite: {
    title: "中国历史研究院 · 东团山—南城子与扶余早期王城研究",
    url: "http://hrczh.cass.cn/sxqy/kgx/202502/t20250228_5853227.shtml",
    note: "以今吉林市丰满区东团山—南城子为扶余早期王城线索，讨论汉晋时期遗存；不能据此把今扶余市或吉林全省当作该王城范围。",
  },
  sanguozhi30: {
    title: "《三国志》卷三十 · 西域诸国、鲜卑与东夷记载",
    url: "https://zh.wikisource.org/wiki/三國志/卷30",
    note: "东夷序列举魏时龟兹、于寘（于阗）、疏勒、鄯善、车师、乌孙等西域大国的朝贡联系，另有鲜卑、夫余、高句丽的记载。朝贡不是现代全疆郡县直辖的证据，部众活动也不能转换为现代省市边界。",
  },
  shuleSite: {
    title: "国家文物局 · 新疆喀什莫尔寺遗址",
    url: "http://www.ncha.gov.cn/art/2024/3/25/art_2760_187828.html",
    note: "莫尔寺位于喀什市东北约 33 公里，是古疏勒的重要佛寺，至迟始建于公元三世纪中叶。用于喀什绿洲周边的地望，不把寺院当作国都，也不把考古时段缩成精确的 262 年。",
  },
  ruoqiang: {
    title: "若羌县人民政府 · 若羌、楼兰与鄯善",
    url: "https://www.xjrq.gov.cn/rqxrmzf/c108794/201709/01eca25655974153a56dedcb0c9c4523.shtml",
    note: "将古鄯善、扜泥与今若羌附近联系，并区别现代鄯善县；其地方沿革说明今鄯善县一带在三国时属车师前国。不复述文中无关的建置年号，也不据此划现代全县疆界。",
  },
  goguryeoSite: {
    title: "国家文物局 · 高句丽王城、王陵及贵族墓葬",
    url: "http://www.ncha.gov.cn/art/2024/8/8/art_2791_190646.html",
    note: "国内城位于今集安市区；文物介绍给出公元 3 年迁国内城、427 年迁平壤的跨度。结合时代文献与年代地图，只作国内城—丸都一带的地点参考。",
  },
};

function region(entityIds, kind, summary, caveat) {
  return {
    entities: entityIds.map((id) => ({ id, relation: ENTITIES[id].type === "peoples" ? "activity" : "regional" })),
    kind, summary, caveat, evidence: "province", basis: "regional", sources: ["atlas262"],
  };
}

export const PROVINCE_RULES = {
  "11": region(["wei"], "regional", "今北京一带可粗略参照曹魏北方、幽州相关范围。", "这是省级轮廓，不代表今天每个区的边界都已核对。北方边地的控制方式也并不一致。"),
  "12": region(["wei"], "regional", "今天津一带可粗略参照曹魏在华北的范围。", "古今海岸线、河道与辖区不同，不能把现代市界视作三国疆界。"),
  "13": region(["wei"], "regional", "今河北内地以曹魏郡域为主要参照，如石家庄、邯郸、保定等所在地；北缘另有诸部活动背景。", "承德等北缘地区不能直接套用内地城市结论；这是省域分布背景，不是全部县区均一控制的断言。"),
  "14": region(["wei"], "regional", "今山西主要地区可粗略参照曹魏。", "尤其北部边地，不同地区的行政设置与实际控制不能一概而论。"),
  "15": {
    entities: [
      { id: "xianbei", relation: "activity", note: "今内蒙古部分草原可联系三世纪鲜卑诸部的活动背景。“诸部”表示不同部众及其分合，不是一个疆界固定的国家。" },
      { id: "wei", relation: "regional", note: "今自治区部分南缘可联系曹魏北境；不能将现代内蒙古全境都归魏。" },
    ],
    kind: "coexistence",
    headline: "鲜卑诸部与曹魏北境",
    evidence: "province",
    summary: "在今天的内蒙古范围内，既要看曹魏北境，也要看鲜卑诸部等北方人群的活动，不能只选一个国家。",
    caveat: "族群活动范围不是国家疆域。这里是省域背景，不把古代部众位置或相互邻接直接画成今天的市县边界，也不列举全部北方人群。",
    dateNote: "以《三国志》卷三十的三世纪部众记载与 262 年地图交叉阅读；不假定诸部在每一年都有不变的活动边界。",
    sources: ["sanguozhi30", "atlas262"],
  },
  "21": region(["wei", "xianbei", "goguryeo"], "frontier", "辽阳、沈阳等辽东地域主要参照曹魏；西北接鲜卑诸部，东北、东部边缘还与高句丽相关。", "三个名称不是全省每处的同等归属：可查具体城市，但不把辽东治所或朝阳等活动地域外推到辽宁全省。"),
  "22": {
    entities: [
      { id: "fuyu", relation: "regional", note: "夫余是三世纪东北的政权之一。今吉林市东团山—南城子可作其早期中心的地望线索，不代表今天吉林全省。" },
      { id: "goguryeo", relation: "regional", note: "今集安市区国内城—丸都一带可联系高句丽。它与夫余是不同政权，不能用任一国覆盖现代吉林省全境。" },
    ],
    kind: "coexistence",
    headline: "夫余、高句丽等区域背景",
    evidence: "province",
    summary: "今吉林省域涉及夫余、高句丽等政权的不同区域线索，不能把全省统一判为其中一国，也不必强行归进魏蜀吴。",
    caveat: "不同都城或早期中心线索不等于两国瓜分现代吉林省的精确边界。“夫余（扶余）”这一古代国名，也不能凭同名映射到今天的扶余市。",
    dateNote: "三世纪文献、汉晋王城研究与 262 年地图共同提供背景，未复原现代省域内各处在 262 年的实际控制。",
    sources: ["sanguozhi30", "fuyuSite", "goguryeoSite", "atlas262"],
  },
  "23": region([], "outside", "今黑龙江省域总体位于三国主要直接控制区之外。", "不能把今天的东北整体归入曹魏；这里也不意味着当地与三国完全没有联系。"),
  "31": region(["wu"], "regional", "今上海已成陆地区可粗略参照孙吴在江东的范围。", "古今海岸线差异显著；不对后来形成的陆地或现行区界作精确归属判断。"),
  "32": region(["wei", "wu"], "mixed", "今江苏跨越魏、吴对峙地区：扬州城区、高邮一带参考魏，南京城区参考吴。", "淮河、长江一带不能用一条现代省界或简单南北分线概括。请输入城市或已收录的具体地点。"),
  "33": region(["wu"], "regional", "今浙江主要地区可粗略参照孙吴。", "行政名义与山地实际控制程度不同；省级结论不能替代逐县核验。"),
  "34": region(["wei", "wu"], "mixed", "皖北、合肥、六安等所在地主要参照曹魏；芜湖、安庆皖口与皖南等地域参照孙吴。", "淮河与长江之间不能用一条河线机械切开。滁州等前线地望还有待核，而合肥等已有清楚地点判断，不应再只给省级两国回退。"),
  "35": region(["wu"], "frontier", "今福建部分地区可参照孙吴在东南的行政和军事活动范围。", "山区与沿海的控制程度并不相同；孙吴是区域参考，不是全省逐点实控结论。"),
  "36": region(["wu"], "regional", "今江西主要地区可粗略参照孙吴。", "现代行政区与当时郡县不重合，山区及具体县域没有逐一核验。"),
  "37": region(["wei"], "regional", "今山东主要地区可粗略参照曹魏。", "这是北方区域背景，不包含对现代县界与古代海岸线的逐点复原。"),
  "41": region(["wei"], "regional", "今河南主要地区可粗略参照曹魏，洛阳是其都城。", "现代省界不是古国界；南缘前线与具体县域仍须分别考察。"),
  "42": region(["wei", "wu"], "mixed", "北部襄阳、十堰、随州与孝感等所在地参照魏；武汉夏口、荆州江陵、宜昌西陵等地域参照吴。", "魏、吴都有荆州和江夏相关建置，不可只凭郡名判国。西部自治州和城市的现行全境仍须分别看，不能用城市中心代替。"),
  "43": region(["wu"], "regional", "今湖南主要地区可粗略参照孙吴在荆州南部的范围。", "不能因刘备、关羽曾在荆州活动，就把 262 年的湖南判为蜀汉；山区的控制程度另需细核。"),
  "44": region(["wu"], "regional", "今广东主要地区可粗略参照孙吴在岭南的范围。", "262 年的州郡名称与今天不同；沿海、山区及现行县界并未逐点核验。"),
  "45": region(["wu"], "frontier", "今广西主要地区可联系孙吴在岭南的范围。", "西部与山区的边地控制需细核。这里仅给出区域背景，不把全部现行县域视作已证实的吴地。"),
  "46": region([], "uncertain", "本库暂不把今天的海南全境直接判为孙吴。", "设郡、撤并、军事到达与岛内实际控制并非一回事；今省域还包含岛礁，需要更具体的史料。"),
  "50": region(["shu"], "frontier", "今重庆主要地区可粗略联系蜀汉，东部及东南山地须谨慎。", "现代重庆范围很大，接近蜀吴交界的地区不能由城市中心外推。这里保留边界不确定性。"),
  "51": region(["shu"], "frontier", "成都平原等今四川主要地区可参照蜀汉。", "现代四川也包括广大的西部高原、山地与边缘地区，不能把全省无条件归蜀。"),
  "52": {
    ...region(["shu", "wu"], "mixed", "贵州以蜀汉相关地域为主：贵阳、安顺、毕节及遵义、六盘水等所在地参考蜀；铜仁碧江等黔东部分地域参考吴。", "凯里、都匀、兴义有自己的地点条目，不能被上级多国回退盖掉；三个自治州的全域仍须分区看，不能由首府一点替代。"),
    headline: "以蜀汉为主，黔东部分地域涉及孙吴",
    sources: ["cityGuiyang", "cityAnshun", "cityTongren", "atlas12", "atlas14"],
  },
  "53": region(["shu"], "frontier", "今云南部分地区可联系蜀汉南中。", "名义行政范围、地方势力与实际控制并不相同，不能从南中概念推定今天云南全省都属蜀。"),
  "54": region([], "outside", "今西藏省域总体位于三国主要直接控制区之外。", "不强行归入魏、蜀、吴，也不借此判断当时各地方势力的精确边界。"),
  "61": {
    ...region(["wei", "shu", "qiangHu", "xiongnu"], "mixed", "关中西安、宝鸡、咸阳及安康西城等所在地参照魏，汉中参照蜀；陕北还需看羌胡、匈奴等部众的区域背景。", "陕南不是全属蜀，陕北也不是见“陕西”就全归魏。秦岭前线与现代市县界不同，诸部称谓也不是统一国家。"),
    headline: "关中、安康参考魏；汉中参考蜀；陕北另看",
    sources: ["cityAnkang", "cityYulin", "atlas07", "atlas09", "atlas11"],
  },
  "62": {
    ...region(["wei", "shu"], "mixed", "河西、陇中、天水等地域以曹魏为主要参照；陇南武都一带参考蜀汉。", "不能把武都城区的蜀地结论外推到全陇南；甘南、临夏等全州的河谷与高原也不能用首府代替。"),
    headline: "河西、陇中以魏为主，武都一带参考蜀",
    sources: ["cityTianshui", "cityWudu", "atlas07", "atlas08", "atlas11"],
  },
  "63": region(["wei"], "frontier", "今青海东北缘可联系曹魏西部边地，其余广大地区不宜简单归魏。", "曹魏仅为局部线索；本库缺少把当前各县与当时实际控制区逐一对应的资料。"),
  "64": region(["wei"], "frontier", "今宁夏可粗略联系曹魏的西北范围。", "边地控制和行政设置并不均一，不能把这条区域参考当作现行所有县域的已核实结论。"),
  "65": {
    entities: [
      { id: "qiuci", relation: "regional", note: "塔里木盆地北缘的龟兹，可与今库车城市中心及故城一带相联系；不是今新疆全境。" },
      { id: "yutian", relation: "regional", note: "于阗可与今和田绿洲一带相联系，约特干遗址提供地望线索；不是今和田地区全境。" },
      { id: "shule", relation: "regional", note: "今喀什绿洲及周边，可联系疏勒。莫尔寺提供古疏勒的佛寺线索，而不是国都定位。" },
      { id: "shanshan", relation: "regional", note: "古鄯善、扜泥可联系今若羌县城附近；不要因同名而等同于今天的鄯善县。" },
      { id: "cheshi", relation: "regional", note: "车师是这里的合称，前、后部等不能合成一个统一国家。今鄯善县地方沿革提供车师前部一带的线索。" },
      { id: "wusun", relation: "regional", note: "伊犁河谷、博尔塔拉等相关地域可联系乌孙；它与塔里木盆地诸绿洲国家不同，也不等于现代整个自治州。" },
      { id: "wei", relation: "contact", note: "《三国志》记魏时这些西域大国有朝贡联系；262 年地图说明另列西域长史（海头）、戊己校尉（高昌）的官署线索。朝贡、官署与往来，不等于今天新疆全境都是曹魏直接占领区，也不说明每国每年的臣属状况都相同。" },
    ],
    kind: "coexistence",
    headline: "西域诸国并存",
    evidence: "province",
    summary: "今新疆所覆盖的西域，在这一时代有龟兹、于阗、疏勒、鄯善、车师、乌孙等不同政权。“西域诸国”是集合说法，不是一个统一国家。",
    caveat: "这里是代表性诸国的非穷尽列举，不是完整疆界，也不是每个政权都占据今天新疆的每一处。各国与曹魏的关系不能一律概括成完全独立或完全直属；本库没有复原逐地实控边界。",
    dateNote: "《三国志》卷三十提供魏时诸国与朝贡的时代线索，262 年地图辅助定位；跨时期考古研究只提供古今地望，不冒充精确到 262 年的断代与疆界。",
    sources: ["sanguozhi30", "atlas10", "atlas262", "qiuciSite", "yutianSite", "shuleSite", "ruoqiang"],
  },
  "71": region([], "outside", "台湾不在本页采用的魏、蜀、吴主要直接控制区范围内。", "三国文献中的航海活动或地名争议，不等同于对今天台湾的直接统治证据。本库仅收录省级名称。"),
  "81": region(["wu"], "frontier", "今香港所在的岭南沿海，可联系孙吴的区域背景。", "不把当时的郡级名义辖境视为对今天香港各处实控的证明。本库只收录特别行政区名称。"),
  "82": region(["wu"], "frontier", "今澳门所在的岭南沿海，可联系孙吴的区域背景。", "古今陆地与海岸线有变化；这里只是岭南背景，不对半岛、岛屿逐点判定。本库只收录特别行政区名称。"),
};

function city(entityId, ancientName, summary, caveat) {
  return {
    entities: [{ id: entityId, relation: "affiliation" }],
    kind: "single", evidence: "city-core", basis: "atlas", ancientName,
    summary, caveat, sources: ["atlas262"],
  };
}

export const LOCAL_RULES = {
  "652902": {
    entities: [{ id: "qiuci", relation: "affiliation", note: "龟兹是西域的政权之一，今库车及龟兹故城提供较明确的所在地线索。" }],
    kind: "single",
    evidence: "historic-site",
    ancientName: "龟兹故城",
    scope: "今库车市城市中心及龟兹故城一带",
    summary: "今库车城市中心与龟兹故城一带，可联系三世纪的龟兹，而不必归入魏、蜀、吴之一。",
    caveat: "考古资料所说的库车县、库车镇是报道采用的今地名称。这里对应的是故城及其附近，不是今天库车市全境；也不借这一地点推定所有西域政权与曹魏的关系相同。",
    dateNote: "故城研究提供古今地望，262 年地图辅助时代对应。资料讨论多个历史时期，并非声称每处遗存都已精确断为 262 年。",
    sources: ["qiuciSite", "atlas262"],
  },
  "653201": {
    entities: [{ id: "yutian", relation: "regional", note: "于阗是西域政权之一；今和田绿洲与邻近约特干遗址提供区域地望线索。" }],
    kind: "single",
    evidence: "historic-site",
    ancientName: "于阗 · 约特干遗址线索",
    scope: "今和田绿洲及邻近约特干遗址一带，不限于现代和田市界",
    summary: "查询今和田市，可参考所在绿洲与古于阗的联系；这不是把整个现代和田地区判为同一归属。",
    caveat: "约特干是古于阗国西城的研究认识，不能写成 262 年国都遗址已被精确确证。今和田市、和田县、和田地区是不同层级，本条不代替这些辖区的全境考证。",
    dateNote: "报道中的考古认识用于区域地望，262 年地图用于时代参照；没有据此复原于阗在该年的精确国界。",
    sources: ["yutianSite", "atlas262"],
  },
  "653101": {
    entities: [{ id: "shule", relation: "regional", note: "疏勒是西域政权之一，今喀什绿洲及周边有古疏勒的重要佛寺等地望线索。" }],
    kind: "single",
    evidence: "historic-site",
    ancientName: "疏勒 · 莫尔寺遗址线索",
    scope: "今喀什绿洲及周边，不是现代喀什地区全境",
    summary: "今喀什市所在的绿洲与周边，可联系古疏勒的区域背景。",
    caveat: "莫尔寺在今喀什市东北约 33 公里，为古疏勒的重要佛寺；本条不把寺院说成国都，也不把绿洲线索外推为喀什市或喀什地区全境的古代归属。",
    dateNote: "莫尔寺至迟始建于公元三世纪中叶；这不是精确的 262 年断年。结合《三国志》的魏时疏勒记载与 262 年地图，只作该时代的区域参考。",
    sources: ["shuleSite", "sanguozhi30", "atlas262"],
  },
  "652824": {
    entities: [{ id: "shanshan", relation: "affiliation", note: "古鄯善的扜泥地望可联系今若羌附近；这是政权与地点线索，不是把现行大县当作古国疆界。" }],
    kind: "single",
    evidence: "historic-site",
    ancientName: "鄯善 · 扜泥一带",
    scope: "今若羌县城附近的扜泥地望一带",
    summary: "今若羌县城附近可联系古鄯善国，而不是按今天“鄯善县”的名字来找古国中心。",
    caveat: "现代若羌县范围很大，所在地附近的线索不能扩展到全县。古鄯善国与今天位于另一地区的鄯善县，不能因同名画等号。",
    dateNote: "地方沿革提供古鄯善、扜泥与今若羌附近的地望；《三国志》及 262 年地图提供时代参照。未复原古国在该年的精确范围。",
    sources: ["ruoqiang", "sanguozhi30", "atlas262"],
  },
  "650421": {
    entities: [{ id: "cheshiFront", relation: "affiliation", note: "地方沿革把今天鄯善县一带在三国时期的背景联系到车师前国；它与古鄯善不是同一个政权。" }],
    kind: "single",
    evidence: "locality",
    ancientName: "车师前部一带",
    scope: "今鄯善县所在地一带的地方沿革线索",
    nameNote: "同名辨误：现代鄯善县不等于古鄯善国中心。古鄯善、扜泥一带的地望，请参考今若羌附近。",
    summary: "今天的鄯善县，参考的是车师前部一带，而不是把现代县名直接套作古鄯善国。",
    caveat: "此处使用地方沿革的三国时期说明，与 262 年地图交叉参考；不对现行全县逐点核验。车师前部与前、后部的合称也不是同一层级，不能混为一个统一国家。",
    dateNote: "地方资料明确区分现代鄯善县与古鄯善国，并给出三国时期的车师前国背景；这是时期线索，不是精确到 262 年每一段疆界的证明。",
    sources: ["ruoqiang", "sanguozhi30", "atlas262"],
  },
  "220582": {
    entities: [{ id: "goguryeo", relation: "affiliation", note: "高句丽是与魏、蜀、吴同时代的政权，国内城与丸都提供今集安的都城地点线索。" }],
    kind: "single",
    evidence: "historic-site",
    ancientName: "国内城 · 丸都",
    scope: "今集安市区国内城—丸都一带",
    summary: "今集安市区的国内城—丸都一带，可联系高句丽的都城历史。",
    caveat: "国内城与丸都的地点线索不等于现代集安市全域。这里也不把不同时期的城址使用、战争变化合成一幅精确到当年的完整辖境图。",
    dateNote: "文物介绍给出的公元 3 年迁国内城、427 年迁平壤的跨度涵盖 262 年；结合《三国志》与年代地图，仍只作王城所在地一带的参考。",
    sources: ["goguryeoSite", "sanguozhi30", "atlas262"],
  },
  "2202": {
    entities: [{ id: "fuyu", relation: "regional", note: "夫余（也写作扶余）是东北的政权，并非鲜卑诸部等族群的统称。" }],
    kind: "single",
    evidence: "historic-site",
    ancientName: "夫余早期中心 · 东团山—南城子",
    scope: "今吉林市丰满区东团山—南城子一带",
    summary: "今吉林市的东团山—南城子，可作夫余早期王城的地望线索，帮助理解三国同时代的东北历史。",
    caveat: "本条只参考早期中心遗址一带，不覆盖今日吉林市全境，也不将它与今扶余市因同名而混同。遗址沿革和每一年都城位置不是同一层次的结论。",
    dateNote: "《三国志》夫余条、汉晋王城研究与 262 年地图交叉参考；不把早期中心的考古论证夸大为 262 年城市边界已精确核实。",
    sources: ["fuyuSite", "sanguozhi30", "atlas262"],
  },
  "321084": {
    entities: [{ id: "wei", relation: "affiliation" }],
    kind: "single",
    evidence: "locality",
    ancientName: "徐州 · 广陵郡一带",
    summary: "今高邮一带以曹魏作粗略区域参考，不是孙吴。",
    caveat: "地方沿革记载三国初期属曹魏徐州广陵郡；高邮县约在 224 年前后被废。这里不声称 262 年仍存在同名县，也不声称已复原今高邮市全境。",
    sources: ["gaoyou", "atlas262"],
  },
  "3210": city("wei", "广陵一带",
    "今扬州城市中心一带，以曹魏作粗略参考。",
    "这里的“扬州”是今天的城市，不是三国时横跨魏吴、范围更大的扬州。广陵处于魏吴前沿，城市中心的参考不可外推至今天全市每一处。"),
  "3201": city("wu", "建业",
    "今南京城市中心对应建业一带，是孙吴都城所在。",
    "结论以建业及今城市中心为锚点，并非把现行南京市辖区、尤其长江两岸全部范围，都视作已核定的吴地。"),
  "5101": city("shu", "成都",
    "今成都城市中心一带，对应蜀汉都城成都。",
    "这是都城所在地的区域参考，不是对今天成都市所辖全部区县的古代边界核定。"),
  "6101": city("wei", "长安",
    "今西安城市中心附近的长安一带，是曹魏西部重镇。",
    "古长安城址与今天城市范围不完全重合；今“长安区”也不能直接等同于古长安的辖界。"),
  "4103": city("wei", "洛阳",
    "洛阳是曹魏都城，今城市中心附近可参照曹魏。",
    "古都城址与今天中心城区不完全重合，这一锚点不代表现行洛阳市每个县区都已单独核验。"),
  "6107": city("shu", "汉中",
    "今汉中城市中心一带，在 262 年参考蜀汉。",
    "这是蜀亡前的固定截面，不能把 263 年魏灭蜀后的归属提前使用。秦岭前线及全市辖境仍需细核。"),
  "3301": city("wu", "钱唐一带",
    "今杭州城市中心一带，可参照孙吴。",
    "这里使用城市中心附近的历史地名线索，不把今日杭州所辖广大县域当作逐一查证过的古代行政区。"),
  "4401": city("wu", "番禺一带",
    "今广州城市中心一带，可参照孙吴在岭南的范围。",
    "262 年使用交州相关背景，不能把 264 年复置的“广州”提前当作当年的州名；现行广州全市范围未逐县核验。"),
  "4206": city("wei", "襄阳",
    "今襄阳城市中心一带，是曹魏在南部前线的重要据点。",
    "不能因为今天属湖北，或曾属于古荆州，就一概判为吴或蜀；结论不覆盖现行全市的每一段边界。"),
  ...EXTRA_RULES,
};

export const PLACE_RULES = { ...MAP_CITY_RULES, ...REGIONAL_REVIEWS, ...LOCAL_RULES };

export const EVIDENCE_CATEGORIES = {
  "local-evidence": "直接地点资料",
  "atlas-region": "年代图域参照",
  "regional-overview": "整区域综述",
  "parent-fallback": "上级粗推（本地未核）",
  "reviewed-gap": "已检查，仍有证据缺口",
};

export function evidenceCategory(record) {
  const categories = {
    locality: "local-evidence", atlas: "atlas-region",
    regional: "regional-overview", gap: "reviewed-gap",
  };
  const category = categories[record.basis];
  if (!category) throw new Error(`历史判断依据未定义：${record.basis}`);
  if (record.isFallback) return "parent-fallback";
  return category;
}

export function resolveHistory(place, index) {
  if (!place || !index.places.has(place.code)) throw new Error("无法为未识别的地区生成历史结果。");
  let evidencePlace = place;
  let rule = PLACE_RULES[place.code];
  if (!rule && place.level !== "province") {
    const parent = index.places.get(place.parentCode);
    if (parent && PLACE_RULES[parent.code]) {
      evidencePlace = parent;
      rule = PLACE_RULES[parent.code];
    }
  }
  if (!rule) {
    evidencePlace = index.places.get(place.provinceCode);
    rule = PROVINCE_RULES[place.provinceCode];
  }
  if (!rule) throw new Error(`尚未配置 ${place.name} 的区域说明。`);
  if (rule.evidence === "historic-site" && !rule.scope) {
    throw new Error(`历史地理锚点缺少明确范围：${evidencePlace.name}`);
  }
  const isFallback = evidencePlace.code !== place.code;
  const scope = rule.scope ?? (rule.evidence === "city-core"
    ? `${evidencePlace.name}城市中心一带`
    : rule.evidence === "locality"
      ? `${evidencePlace.name}所在地一带`
      : `${evidencePlace.name}的省级区域轮廓`);
  return {
    ...rule,
    basis: rule.basis ?? (rule.evidence === "province" ? "regional" : "locality"),
    year: REFERENCE_YEAR,
    place,
    evidencePlace,
    isFallback,
    scope,
    fallbackNote: isFallback
      ? `尚未单独核验${place.name}的历史归属。下方只提供${scope}的背景，不能外推为${place.name}全境已经核实的结论。`
      : null,
  };
}
