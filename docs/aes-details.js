const leaderboardCases = { ...dmCases, ...mmoKeyCases, ...mpCases };

const caseLabels = isChinese ? {
  id: "验证编号 · 轮数",
  conditions: "实验条件",
  time: "报告耗时",
  unreported: "未报告",
  publicId: "在公开核验程序中查看",
  localId: "本地验证编号",
  reportOnly: "报告索引，无归档验证编号",
  disclosure: (count) => `实测详情（${count} 条）`,
  total: (tracks, cases) => `${tracks} 个赛道条目 · ${cases} 个用例`,
} : {
  id: "Verification ID · Rounds",
  conditions: "Experiment conditions",
  time: "Reported time",
  unreported: "Unreported",
  publicId: "Find in the public verifier",
  localId: "Local verification ID",
  reportOnly: "Report reference only",
  disclosure: (count) => `Case details (${count})`,
  total: (tracks, cases) => `${tracks} leaderboard rows · ${cases} cases`,
};

function makeCaseDetails(record, cases, verifierUrl, columnCount, projectCell) {
  const row = document.createElement("tr");
  row.className = "case-row";
  row.id = `cases-${record.id}`;
  row.hidden = true;
  row.setAttribute("role", "row");

  const cell = document.createElement("td");
  cell.colSpan = columnCount;
  cell.setAttribute("role", "cell");
  row.append(cell);

  const heading = addText(cell, "div", "case-columns case-head", "");
  heading.setAttribute("aria-hidden", "true");
  for (const label of [caseLabels.id, caseLabels.conditions, caseLabels.time]) {
    addText(heading, "span", "", label);
  }

  const list = addText(cell, "ul", "case-list", "");
  list.setAttribute("role", "list");
  for (const result of cases) {
    const item = addText(list, "li", "case-columns", "");
    const identity = addText(item, "div", "case-identity", "");
    const id = addText(identity, result.publicId ? "a" : "span", "case-id", result.id);
    if (result.publicId) {
      id.href = verifierUrl;
      id.setAttribute("aria-label", `${caseLabels.publicId} ${result.id}`);
    } else if (!result.reportOnly) {
      id.title = caseLabels.localId;
    }
    const rounds = isChinese ? `${result.rounds} 轮` : `${result.rounds} rounds`;
    addText(identity, "span", "round-count", rounds);
    if (result.reportOnly) addText(identity, "span", "case-ref-note", caseLabels.reportOnly);
    addText(item, "span", "case-condition", isChinese ? result.zh : result.en);
    const timing = addText(item, "div", "case-time", "");
    addText(timing, "span", "case-time-label", caseLabels.time);
    const time = isChinese
      ? result.timeZh ?? result.time?.replace(/ ms\b/g, " 毫秒").replace(/ s\b/g, " 秒")
      : result.time;
    addText(timing, "span", "", time ?? caseLabels.unreported);
  }

  const label = caseLabels.disclosure(cases.length);
  const toggle = addText(projectCell, "button", "case-toggle", label);
  toggle.type = "button";
  toggle.setAttribute("aria-controls", row.id);
  toggle.setAttribute("aria-label", `${label} · ${record.challenge} ${record.variant} ${record.label}`);

  function setOpen(open) {
    row.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  setOpen(false);
  toggle.addEventListener("click", () => setOpen(row.hidden));
  return { row, setOpen };
}
