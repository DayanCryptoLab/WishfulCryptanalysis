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
    addText(cell, "span", "unlisted", "—").setAttribute("aria-hidden", "true");
    addText(cell, "span", "visually-hidden", isPrior ? "No comparable prior record listed" : "No bundled verification result");
    return;
  }

  addText(cell, "strong", "round-count", `${record.rounds} rounds`);
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
    witnesses.setAttribute("aria-label", `Find ${record.witnesses} in the verification code`);
  }
}

function makeRow(record, verifierUrl) {
  const row = document.createElement("tr");
  row.id = `record-${record.id}`;
  row.setAttribute("role", "row");

  const challenge = addCell(row, "Challenge", "challenge-cell", true);
  addText(challenge, "span", "challenge-id", record.challenge);
  addText(challenge, "span", "challenge-name", record.label);

  const variant = addCell(row, "Variant");
  addText(variant, "strong", "variant-name", record.variant);
  addText(variant, "span", "variant-detail", record.detail);

  addRecord(addCell(row, "Prior practical record", "prior-record"), record.prior, verifierUrl);
  addRecord(addCell(row, "Verified here", "project-record"), record.project, verifierUrl);
  return row;
}

function normalizeSearch(value) {
  return value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[‐‑–—]/g, "-");
}

function initializeLeaderboard(records) {
  const toolbar = document.querySelector(".toolbar");
  const board = document.querySelector(".board-frame");
  const table = board.querySelector("table");
  const body = document.getElementById("record-rows");
  const search = document.getElementById("record-search");
  const count = document.getElementById("result-count");
  const empty = board.querySelector(".empty-state");
  const filters = [...toolbar.querySelectorAll("[data-family]")];
  const families = new Map(filters.map((button) => [button.dataset.family, button.textContent]));
  const verifierUrl = document.querySelector("#verify .text-link").href;
  const rows = records.map((record) => {
    const row = makeRow(record, verifierUrl);
    const matchText = [record.id, families.get(record.family), row.textContent];
    if (record.label === "Semi-free-start") matchText.push("SFS");
    const witnessIds = record.project?.witnesses.toLowerCase().split(", ") ?? [];
    return { row, family: record.family, text: normalizeSearch(matchText.join(" ")), witnessIds };
  });
  let family = "all";

  function render() {
    const terms = normalizeSearch(search.value).trim().split(/\s+/).filter(Boolean);
    const shown = rows.filter((entry) => (family === "all" || family === entry.family)
      && terms.every((term) => /^[1-3][a-c]-\d$/.test(term) ? entry.witnessIds.includes(term) : entry.text.includes(term)));
    body.replaceChildren(...shown.map(({ row }) => row));
    table.hidden = shown.length === 0;
    empty.hidden = shown.length > 0;
    count.textContent = `Showing ${shown.length} of ${rows.length} records`;
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

async function copyCommand(command) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(command.textContent.trim());
      return "copied";
    } catch {
      // Local files and denied clipboard permissions can use a selection instead.
    }
  }

  const selection = window.getSelection();
  if (!selection) return "manual";
  const previousRanges = Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index));
  const range = document.createRange();
  range.selectNodeContents(command);
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    if (document.execCommand("copy")) {
      selection.removeAllRanges();
      previousRanges.forEach((previous) => selection.addRange(previous));
      return "copied";
    }
  } catch {
    // Keep the command selected for the browser's keyboard shortcut.
  }
  return "selected";
}

function initializeCopy() {
  const button = document.getElementById("copy-command");
  const command = document.getElementById("verify-command");
  const status = document.getElementById("copy-status");
  let labelTimer;

  button.addEventListener("click", async () => {
    const result = await copyCommand(command);
    const labels = {
      copied: ["Copied", "Command copied to clipboard."],
      selected: ["Selected", "Command selected. Use your browser's copy shortcut."],
      manual: ["Copy command", "Select the command and use your browser's copy shortcut."],
    };
    [button.textContent, status.textContent] = labels[result];
    window.clearTimeout(labelTimer);
    labelTimer = window.setTimeout(() => { button.textContent = "Copy command"; }, 2500);
  });
  button.hidden = false;
}

if (typeof leaderboardRecords !== "undefined") initializeLeaderboard(leaderboardRecords);
initializeCopy();
