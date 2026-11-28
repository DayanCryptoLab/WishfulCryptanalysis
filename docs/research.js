function currentResearchResults(paper, aes) {
  const paperTracks = {
    "1A-128": "dm-6-sfs",
    "1B-128": "dm-3-single",
    "1C-128": "dm-4-two",
    "2A-128": "mmo-7-sfs",
    "2B-128": "mmo-6-fixed",
  };
  const paperById = new Map(paper.map((result) => [result.id, result]));

  const currentAes = aes.map((record) => {
    const { rounds, detail, witnesses, localWitnesses } = record.project;
    const roundLabel = isChinese ? `${rounds} 轮` : `${rounds} rounds`;
    const variant = record.family === "key"
      ? `${record.variant} ${isChinese ? "密钥恢复" : "key recovery"}`
      : record.variant;
    const verificationIds = [];
    if (witnesses) verificationIds.push(isChinese ? `公开（${witnesses}）` : `Public (${witnesses})`);
    if (localWitnesses) verificationIds.push(isChinese ? `本地（${localWitnesses}）` : `Local (${localWitnesses})`);

    return {
      id: `aes-${record.id}`,
      family: "aes",
      title: `${variant} · ${record.challenge} ${record.label} · ${roundLabel}`,
      instance: record.detail,
      scope: "leaderboard",
      result: detail,
      reference: verificationIds.join(" · "),
      paper: paperById.get(paperTracks[record.id]),
      leaderboardUrl: localizedUrl(`aes.html#record-${record.id}`, siteLanguage),
    };
  });

  return [...paper.filter(({ family }) => family === "keccak"), ...currentAes];
}

function initializeResearchResults(results) {
  const controls = document.getElementById("results-controls");
  const table = document.getElementById("results-table");
  const body = document.getElementById("research-result-rows");
  const count = document.getElementById("result-count");
  const evidence = document.getElementById("evidence");
  const evidenceHeading = document.getElementById("evidence-title");
  const select = document.getElementById("evidence-select");
  const filters = [...controls.querySelectorAll("button[data-family]")];
  const title = document.getElementById("evidence-case");
  const scope = document.getElementById("evidence-scope");
  const summary = document.getElementById("evidence-summary");
  const instance = document.getElementById("evidence-instance");
  const artifact = document.getElementById("evidence-artifact");
  const referenceLabel = document.getElementById("evidence-reference-label");
  const reference = document.getElementById("evidence-reference");
  const paperRow = document.getElementById("evidence-paper-row");
  const paperLink = document.getElementById("evidence-paper");
  const timeRow = document.getElementById("evidence-time-row");
  const time = document.getElementById("evidence-time");
  const scopeLabels = isChinese ? {
    official: "竞赛排行榜",
    standard: "标称参数",
    extended: "扩展轮窗口",
    leaderboard: "AES 榜单",
  } : {
    official: "Contest leaderboard",
    standard: "Nominal parameters",
    extended: "Extended round window",
    leaderboard: "AES leaderboard",
  };
  const labels = isChinese ? {
    verification: "验证编号",
    report: "论文出处",
    leaderboardLink: "前往 AES 榜单查看此赛道",
    appendixLink: "查看论文附录 A",
  } : {
    verification: "Verification IDs",
    report: "Report reference",
    leaderboardLink: "Open this track on the AES leaderboard",
    appendixLink: "Open Appendix A in the paper",
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
    referenceLabel.textContent = result.leaderboardUrl ? labels.verification : labels.report;
    reference.textContent = result.reference;
    artifact.href = result.leaderboardUrl ?? "assets/wishful-cryptanalysis-en.pdf#page=21";
    artifact.textContent = result.leaderboardUrl ? labels.leaderboardLink : labels.appendixLink;
    if (result.leaderboardUrl) artifact.removeAttribute("hreflang");
    else artifact.hreflang = "en";
    paperRow.hidden = !result.paper;
    if (result.paper) {
      const { rounds, reference } = result.paper;
      paperLink.textContent = isChinese ? `${reference}（${rounds} 轮）` : `${reference} (${rounds} rounds)`;
    }
    timeRow.hidden = !result.timing;
    time.textContent = result.timing ?? "";

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
  document.getElementById("practical-total").textContent = rows.length;
  document.getElementById("keccak-total").textContent = rows.filter(({ result }) => result.family === "keccak").length;
  document.getElementById("aes-total").textContent = rows.filter(({ result }) => result.family === "aes").length;
  filterResults("all");
  controls.hidden = false;
  table.hidden = false;
}

if (typeof paperResults !== "undefined" && typeof leaderboardRecords !== "undefined") {
  initializeResearchResults(currentResearchResults(paperResults, leaderboardRecords));
}
