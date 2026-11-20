function initializeResearchResults(results) {
  const controls = document.getElementById("results-controls");
  const table = document.getElementById("results-table");
  const body = document.getElementById("paper-result-rows");
  const count = document.getElementById("result-count");
  const evidence = document.getElementById("evidence");
  const evidenceHeading = document.getElementById("evidence-title");
  const select = document.getElementById("evidence-select");
  const filters = [...controls.querySelectorAll("button[data-family]")];
  const title = document.getElementById("evidence-case");
  const scope = document.getElementById("evidence-scope");
  const summary = document.getElementById("evidence-summary");
  const instance = document.getElementById("evidence-instance");
  const reference = document.getElementById("evidence-reference");
  const timeRow = document.getElementById("evidence-time-row");
  const time = document.getElementById("evidence-time");
  const scopeLabels = isChinese ? {
    official: "竞赛排行榜",
    standard: "标称参数",
    extended: "扩展轮窗口",
  } : {
    official: "Contest leaderboard",
    standard: "Nominal parameters",
    extended: "Extended round window",
  };

  function makeRow(result) {
    const row = document.createElement("tr");
    row.dataset.resultId = result.id;

    const heading = document.createElement("th");
    heading.scope = "row";
    const parameters = document.createElement("td");
    parameters.textContent = result.instance;
    const scopeCell = document.createElement("td");
    scopeCell.textContent = scopeLabels[result.scope];
    row.append(heading, parameters, scopeCell);
    return row;
  }

  let selected;
  const rows = results.map((result) => {
    const row = makeRow(result);
    const link = document.createElement("a");
    link.textContent = result.title;
    link.href = "#evidence";
    link.className = "result-link";
    row.cells[0].append(link);
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      showEvidence(result);
      evidence.scrollIntoView({ block: "start" });
      evidenceHeading.focus({ preventScroll: true });
    });
    return { result, row, link };
  });

  function showEvidence(result) {
    selected = result;
    select.value = result.id;
    title.textContent = result.title;
    scope.textContent = scopeLabels[result.scope];
    scope.dataset.scope = result.scope;
    summary.textContent = result.result;
    instance.textContent = result.instance;
    reference.textContent = result.reference;
    if (timeRow && time) {
      timeRow.hidden = !result.timing;
      time.textContent = result.timing ?? "";
    }

    for (const entry of rows) {
      const current = entry.result === result;
      entry.row.classList.toggle("is-selected", current);
      if (current) entry.link.setAttribute("aria-current", "true");
      else entry.link.removeAttribute("aria-current");
    }
  }

  function filterResults(family) {
    const visible = rows.filter(({ row, result }) => {
      row.hidden = family !== "all" && result.family !== family;
      return !row.hidden;
    });
    for (const button of filters) {
      button.setAttribute("aria-pressed", String(button.dataset.family === family));
    }
    count.textContent = isChinese
      ? `显示 ${visible.length} 项，共 ${rows.length} 项结果`
      : `${visible.length} of ${rows.length} results`;

    select.replaceChildren(...visible.map(({ result }) => new Option(result.title, result.id)));
    evidence.hidden = visible.length === 0;
    const nextResult = visible.find(({ result }) => result === selected) ?? visible[0];
    if (nextResult) showEvidence(nextResult.result);
  }

  select.addEventListener("change", () => {
    const result = results.find(({ id }) => id === select.value);
    if (result) showEvidence(result);
  });
  for (const button of filters) {
    button.addEventListener("click", () => filterResults(button.dataset.family));
  }

  body.replaceChildren(...rows.map(({ row }) => row));
  filterResults("all");
  controls.hidden = false;
  table.hidden = false;
}

if (typeof paperResults !== "undefined" && paperResults.length) {
  initializeResearchResults(paperResults);
}
