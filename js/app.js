import { createGazetteer, lookup, suggest, LEVEL_NAMES } from "./lookup.js";
import { resolveHistory, KINGDOMS, SOURCES } from "../data/history.js";

const form = document.querySelector("#search-form");
const input = document.querySelector("#place-query");
const searchButton = document.querySelector("#search-button");
const clearButton = document.querySelector("#clear-query");
const suggestionList = document.querySelector("#suggestions");
const results = document.querySelector("#results");
const intro = document.querySelector("#intro-note");
const announcer = document.querySelector("#announcer");
const inputError = document.querySelector("#input-error");
const loadStatus = document.querySelector("#load-status");
const loadStatusText = document.querySelector("#load-status-text");
const retryButton = document.querySelector("#retry-load");
const exampleButtons = [...document.querySelectorAll("[data-query]")];
let index;
let suggestions = [];
let activeSuggestion = -1;
let composing = false;
let loading = false;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function announce(message) {
  announcer.textContent = "";
  requestAnimationFrame(() => { announcer.textContent = message; });
}

function closeSuggestions() {
  suggestionList.hidden = true;
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  activeSuggestion = -1;
}

function updateSuggestions() {
  if (!index || composing) return;
  suggestions = suggest(index, input.value);
  suggestionList.replaceChildren();
  activeSuggestion = -1;
  input.removeAttribute("aria-activedescendant");
  for (const place of suggestions) {
    const option = node("li");
    option.id = `suggestion-${place.code}`;
    option.dataset.code = place.code;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.append(node("span", "", place.label), node("span", "", LEVEL_NAMES[place.level]));
    suggestionList.append(option);
  }
  suggestionList.hidden = suggestions.length === 0;
  input.setAttribute("aria-expanded", String(suggestions.length > 0));
  if (suggestions.length) {
    announce(`有 ${suggestions.length} 个地区提示。使用上下方向键选择，回车确认；直接回车可查看全部同名地区。`);
  }
}

function showResultShell(status, title) {
  closeSuggestions();
  input.removeAttribute("aria-invalid");
  inputError.hidden = true;
  intro.hidden = true;
  results.replaceChildren();
  results.hidden = false;
  const top = node("div", "result-topline");
  top.append(node("span", "result-status", status), node("span", "", "历史截面 · 公元 262 年"));
  const heading = node("h2", "", title);
  heading.id = "result-heading";
  heading.tabIndex = -1;
  results.append(top, heading);
  return heading;
}

function focusResult(heading) {
  heading.focus({ preventScroll: true });
  results.scrollIntoView({ block: "nearest", behavior: "auto" });
}

function sourceLinks(sourceIds) {
  const row = node("div", "result-sources");
  row.append(node("span", "", "本条依据"));
  for (const id of sourceIds) {
    const source = SOURCES[id];
    const link = node("a", "", `${source.title} ↗`);
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = source.note;
    row.append(link);
  }
  return row;
}

function showPlace(place) {
  const record = resolveHistory(place, index);
  const names = record.kingdoms.map((kingdom) => KINGDOMS[kingdom].name).join(" / ");
  const statusNames = {
    single: "地点线索 · 非全境判定",
    regional: "省域参考 · 非全境判定",
    mixed: "跨境地区 · 不能只选一国",
    frontier: "边地或控制程度不一",
    outside: "三国主要控制区之外",
    uncertain: "已识别地区 · 归属暂不确定",
  };
  const evidenceNames = {
    locality: "地方沿革 + 年代地图",
    "city-core": "城市中心锚点",
    province: "省域轮廓（粗粒度）",
  };
  const status = record.isFallback ? "上级参考 · 本地未单独核验" : statusNames[record.kind];
  const heading = showResultShell(status, place.name);
  results.append(node("p", "result-path", place.label));
  if (record.isFallback) results.append(node("p", "fallback-warning", record.fallbackNote));

  let answer = names;
  if (record.kind === "outside") answer = "三国主要控制区之外";
  else if (record.kind === "uncertain") answer = "暂不作归属判断";
  else if (record.kind === "frontier") answer = `${names} · 局部参考`;
  else if (record.kind === "regional") answer = `${names} · 区域参考`;
  else if (record.kind === "mixed") answer = `${names}，均有涉及`;
  if (record.isFallback) answer = `背景：${answer}`;

  const answerRow = node("div", "result-answer");
  const stampClass = record.kingdoms.length === 1 ? record.kingdoms[0] : "is-multiple";
  const stamp = node("span", `realm-stamp ${stampClass}`,
    record.kingdoms.map((kingdom) => KINGDOMS[kingdom].short).join("·") || (record.kind === "outside" ? "外" : "待考"));
  stamp.setAttribute("aria-hidden", "true");
  const copy = node("div", "answer-copy");
  copy.append(node("h3", "answer-title", answer), node("p", "answer-summary", record.summary));
  if (record.ancientName) {
    copy.append(node("p", "ancient-clue", `参考区域的古地名线索：${record.ancientName}`));
  }
  answerRow.append(stamp, copy);
  results.append(answerRow);

  const evidence = node("dl", "evidence-grid");
  for (const [label, value] of [
    ["参考年份", "公元 262 年"],
    ["实际证据层级", evidenceNames[record.evidence]],
    ["参考范围，不是今日全境", record.scope],
  ]) {
    const item = node("div");
    item.append(node("dt", "", label), node("dd", "", value));
    evidence.append(item);
  }
  const caveat = node("p", "boundary-note");
  caveat.append(node("strong", "", "需留意："), document.createTextNode(record.caveat));
  results.append(evidence, caveat, sourceLinks(record.sources));
  announce(`${place.label}。${status}。${answer}。参考范围：${record.scope}。${record.fallbackNote || record.caveat}`);
  focusResult(heading);
}

function candidateButtons(places) {
  const list = node("ul", "candidate-list");
  for (const place of places) {
    const item = node("li");
    const button = node("button", "candidate-button");
    button.type = "button";
    button.append(node("span", "", place.label), node("span", "", `${LEVEL_NAMES[place.level]} ↗`));
    button.addEventListener("click", () => selectPlace(place));
    item.append(button);
    list.append(item);
  }
  return list;
}

function selectPlace(place) {
  input.value = place.label;
  clearButton.hidden = false;
  showPlace(place);
}

function showInputError(message) {
  closeSuggestions();
  inputError.textContent = message;
  inputError.hidden = false;
  input.setAttribute("aria-invalid", "true");
  results.hidden = true;
  intro.hidden = false;
  input.focus();
}

function search() {
  if (!index) return;
  const result = lookup(index, input.value);
  if (result.status === "empty") {
    showInputError("先写下一个今天的地名吧，例如“高邮”。");
    return;
  }
  if (result.status === "invalid") {
    showInputError("地名过长，请保留省、市、区县名称，控制在 80 个字符以内。");
    return;
  }
  if (result.status === "found") {
    showPlace(result.candidates[0]);
    return;
  }
  if (result.status === "ambiguous") {
    const heading = showResultShell("同名待选 · 暂未作历史判断", `“${input.value.trim()}”不只一处`);
    results.append(node("p", "state-description", `找到 ${result.candidates.length} 个现代地区。先选定你想查的地方，再看它的历史背景。`));
    results.append(candidateButtons(result.candidates));
    announce(`找到 ${result.candidates.length} 个同名地区，请使用 Tab 移动到地区按钮，按回车选择。`);
    focusResult(heading);
    return;
  }
  const heading = showResultShell("名称未匹配 · 不代表古代在三国之外", "还没找到这个现代地名");
  results.append(node("p", "state-description", `名称库中未找到“${input.value.trim()}”的完整匹配。`));
  results.append(node("p", "state-hint", "请检查拼写，或补上省、市名称。暂不支持乡镇、古地名、拼音与繁简自动转换；2023 年中之后的新名称也可能未收录。港澳台目前只收录省级名称。"));
  const possible = suggest(index, input.value);
  if (possible.length) {
    results.append(node("p", "state-description", "下面只有名称前缀相近的地区，不会自动替你选择："));
    results.append(candidateButtons(possible));
  }
  announce(`未找到地名 ${input.value.trim()}。这是名称未收录，不是历史归属判断。`);
  focusResult(heading);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!composing) search();
});
input.addEventListener("compositionstart", () => { composing = true; closeSuggestions(); });
input.addEventListener("compositionend", () => { composing = false; updateSuggestions(); });
input.addEventListener("input", () => {
  clearButton.hidden = !input.value;
  inputError.hidden = true;
  input.removeAttribute("aria-invalid");
  updateSuggestions();
});
input.addEventListener("focus", updateSuggestions);
input.addEventListener("keydown", (event) => {
  if (event.isComposing || composing) return;
  if (event.key === "Escape" || event.key === "Tab") {
    closeSuggestions();
    return;
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (suggestionList.hidden) updateSuggestions();
    if (!suggestions.length) return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    activeSuggestion = activeSuggestion === -1
      ? (direction === 1 ? 0 : suggestions.length - 1)
      : (activeSuggestion + direction + suggestions.length) % suggestions.length;
    [...suggestionList.children].forEach((option, i) => {
      option.setAttribute("aria-selected", String(i === activeSuggestion));
    });
    const active = suggestionList.children[activeSuggestion];
    input.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
  } else if (event.key === "Enter" && activeSuggestion >= 0 && !suggestionList.hidden) {
    event.preventDefault();
    selectPlace(suggestions[activeSuggestion]);
  }
});
suggestionList.addEventListener("mousedown", (event) => { event.preventDefault(); });
suggestionList.addEventListener("click", (event) => {
  const option = event.target.closest("[data-code]");
  if (option) selectPlace(index.places.get(option.dataset.code));
});
document.addEventListener("click", (event) => {
  if (!form.contains(event.target)) closeSuggestions();
});
input.addEventListener("blur", () => {
  requestAnimationFrame(() => {
    if (document.activeElement !== input) closeSuggestions();
  });
});
clearButton.addEventListener("click", () => {
  input.value = "";
  clearButton.hidden = true;
  inputError.hidden = true;
  input.removeAttribute("aria-invalid");
  results.hidden = true;
  intro.hidden = false;
  closeSuggestions();
  input.focus();
});
for (const button of exampleButtons) {
  button.addEventListener("click", () => {
    input.value = button.dataset.query;
    clearButton.hidden = false;
    search();
  });
}

async function loadData() {
  if (loading) return;
  loading = true;
  retryButton.hidden = true;
  loadStatus.className = "";
  loadStatusText.textContent = "正在载入本地名称库…";
  try {
    const response = await fetch(new URL("../data/places.json", import.meta.url), { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`名称文件返回 HTTP ${response.status}`);
    index = createGazetteer(await response.json());
    loadStatus.className = "is-ready";
    loadStatusText.textContent = `${index.counts.province} 个省级名称 · ${index.counts.prefecture} 个大陆地级条目 · 名称快照 2023.06`;
    input.disabled = false;
    searchButton.disabled = false;
    for (const button of exampleButtons) button.disabled = false;
  } catch (error) {
    console.error("行政名称库载入失败：", error);
    loadStatus.className = "is-error";
    loadStatusText.textContent = "名称库未能载入。请检查网络后重试；本页需要通过网站地址而非直接打开 HTML 文件运行。";
    retryButton.hidden = false;
    announce("名称库载入失败，查询暂不可用。请使用重新载入按钮重试。");
  } finally {
    loading = false;
  }
}
retryButton.addEventListener("click", loadData);
loadData();
