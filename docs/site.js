function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  parent.append(element);
  return element;
}

function addCell(row, label, className = "", isHeader = false) {
  const cell = document.createElement(isHeader ? "th" : "td");
  cell.setAttribute("role", isHeader ? "rowheader" : "cell");
  if (isHeader) cell.scope = "row";
  cell.className = className;
  cell.dataset.column = label;
  row.append(cell);
  return cell;
}

function addRecord(cell, record, verifierUrl) {
  if (!record) {
    const isPrior = cell.classList.contains("prior-record");
    const unlisted = isChinese
      ? (isPrior ? "暂无可比的既有纪录" : "暂无随附的核验结果")
      : (isPrior ? "No comparable prior record listed" : "No bundled verification result");
    addText(cell, "span", "unlisted", "—").setAttribute("aria-hidden", "true");
    addText(cell, "span", "visually-hidden", unlisted);
    return;
  }

  addText(cell, "strong", "round-count", isChinese ? `${record.rounds} 轮` : `${record.rounds} rounds`);
  addText(cell, "span", "record-detail", record.detail);
  if (record.source) {
    const sourceUrl = new URL(record.source.url);
    if (sourceUrl.protocol === "https:") {
      addText(cell, "a", "source-link", record.source.label).href = sourceUrl.href;
    }
  }
  if (record.witnesses) {
    const witnesses = addText(cell, "a", "witnesses", record.witnesses);
    witnesses.href = verifierUrl;
    witnesses.setAttribute("aria-label", isChinese
      ? `在核验程序中查看见证 ${record.witnesses}`
      : `Find ${record.witnesses} in the verification code`);
  }
  if (record.localWitnesses) {
    const label = isChinese ? "本地验证编号" : "Local verification IDs";
    addText(cell, "span", "witnesses", `${label}: ${record.localWitnesses}`);
  }
}

function makeRow(record, verifierUrl, columns) {
  const row = document.createElement("tr");
  row.id = `record-${record.id}`;
  row.setAttribute("role", "row");

  const challenge = addCell(row, columns[0], "challenge-cell", true);
  addText(challenge, "span", "challenge-id", record.challenge);
  addText(challenge, "span", "challenge-name", record.label);

  const variant = addCell(row, columns[1]);
  addText(variant, "strong", "variant-name", record.variant);
  addText(variant, "span", "variant-detail", record.detail);

  addRecord(addCell(row, columns[2], "prior-record"), record.prior, verifierUrl);
  addRecord(addCell(row, columns[3], "project-record"), record.project, verifierUrl);
  return row;
}

function normalizeSearch(value) {
  return value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[‐‑–—]/g, "-");
}

function initializeLeaderboard(records) {
  const toolbar = document.querySelector(".toolbar");
  const board = document.querySelector(".board-frame");
  const table = board.querySelector("table");
  const columns = Array.from(table.tHead.rows[0].cells, (cell) => cell.textContent);
  const body = document.getElementById("record-rows");
  const search = document.getElementById("record-search");
  const count = document.getElementById("result-count");
  const total = document.getElementById("case-total");
  const empty = board.querySelector(".empty-state");
  const filters = [...toolbar.querySelectorAll("[data-family]")];
  const families = new Map(filters.map((button) => [button.dataset.family, button.textContent]));
  const verifierUrl = document.querySelector("#verify .text-link").href;
  const rows = records.map((record) => {
    const row = makeRow(record, verifierUrl, columns);
    const cases = leaderboardCases[record.id];
    const details = makeCaseDetails(record, cases, verifierUrl, columns.length, row.lastElementChild);
    const englishLabel = record.englishLabel ?? record.label;
    const matchText = [record.id, englishLabel, families.get(record.family), row.textContent, details.row.textContent];
    if (englishLabel === "Semi-free-start") matchText.push("SFS");
    const caseIds = cases.map(({ id }) => id.split(" ", 1)[0]);
    const summaryIds = [record.project?.witnesses, record.project?.localWitnesses]
      .filter(Boolean)
      .flatMap((ids) => ids.split(", "));
    return {
      row, details, caseCount: cases.length, id: normalizeSearch(record.id), family: record.family,
      text: normalizeSearch(matchText.join(" ")), witnessIds: new Set([...summaryIds, ...caseIds].map(normalizeSearch)),
    };
  });
  total.textContent = caseLabels.total(rows.length, rows.reduce((sum, row) => sum + row.caseCount, 0));
  total.hidden = false;
  let family = "all";

  function render() {
    const terms = normalizeSearch(search.value).trim().split(/\s+/).filter(Boolean);
    const shown = rows.filter((entry) => (family === "all" || family === entry.family)
      && terms.every((term) => /^[1-4][a-c]-\d+[a-z0-9]*(?:-[a-z0-9]+)*$/.test(term)
        ? entry.id === term || entry.witnessIds.has(term)
        : entry.text.includes(term)));
    body.replaceChildren(...shown.flatMap(({ row, details, witnessIds }, index) => {
      row.classList.toggle("record-striped", index % 2 === 1);
      if (terms.some((term) => witnessIds.has(term))) details.setOpen(true);
      return [row, details.row];
    }));
    table.hidden = shown.length === 0;
    empty.hidden = shown.length > 0;
    count.textContent = isChinese
      ? `显示 ${shown.length} 个赛道条目，共 ${rows.length} 个`
      : `Showing ${shown.length} of ${rows.length} leaderboard rows`;
  }

  function setFamily(value) {
    family = value;
    filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.family === family)));
    render();
  }

  filters.forEach((button) => button.addEventListener("click", () => setFamily(button.dataset.family)));
  search.addEventListener("input", render);
  document.getElementById("reset-filters").addEventListener("click", () => {
    search.value = "";
    setFamily("all");
    search.focus();
  });

  render();
  toolbar.hidden = false;
  board.hidden = false;
}

async function copyText(content) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content.textContent.trim());
      return "copied";
    } catch {
      // Local files and denied clipboard permissions can use a selection instead.
    }
  }

  const selection = window.getSelection();
  if (!selection) return "manual";
  const previousRanges = Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index));
  const range = document.createRange();
  range.selectNodeContents(content);
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    if (document.execCommand("copy")) {
      selection.removeAllRanges();
      previousRanges.forEach((previous) => selection.addRange(previous));
      return "copied";
    }
  } catch {
    // Keep the text selected for the browser's keyboard shortcut.
  }
  return "selected";
}

function initializeCopy(buttonId, contentId, statusId, englishName, chineseName) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  const content = document.getElementById(contentId);
  const status = document.getElementById(statusId);
  const defaultLabel = button.textContent;
  const labels = isChinese ? {
    copied: ["已复制", `已将${chineseName}复制到剪贴板。`],
    selected: ["已选中", `已选中${chineseName}。请使用浏览器的复制快捷键。`],
    manual: [defaultLabel, `请选中${chineseName}并使用浏览器的复制快捷键。`],
  } : {
    copied: ["Copied", `Copied the ${englishName} to the clipboard.`],
    selected: ["Selected", `Selected the ${englishName}. Use your browser's copy shortcut.`],
    manual: [defaultLabel, `Select the ${englishName} and use your browser's copy shortcut.`],
  };
  let labelTimer;

  button.addEventListener("click", async () => {
    const result = await copyText(content);
    [button.textContent, status.textContent] = labels[result];
    window.clearTimeout(labelTimer);
    labelTimer = window.setTimeout(() => { button.textContent = defaultLabel; }, 2500);
  });
  button.hidden = false;
}

if (typeof leaderboardCases !== "undefined") initializeLeaderboard(leaderboardRecords);
initializeCopy("copy-command", "verify-command", "copy-status", "command", "命令");
initializeCopy("copy-bibtex", "paper-bibtex", "bibtex-copy-status", "BibTeX entry", " BibTeX 条目");
