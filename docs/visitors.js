(() => {
  const map = document.querySelector("#visitor-map-pins");
  if (!map) return;

  async function readJson(url) {
    const response = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) throw new Error(`Visitor data returned HTTP ${response.status}`);
    return response.json();
  }

  function addDot(container, className, x, y, radius) {
    const dot = document.createElementNS(map.namespaceURI, "circle");
    dot.setAttribute("class", className);
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", radius);
    container.append(dot);
  }

  async function render() {
    const [snapshot, positions] = await Promise.all([
      readJson("https://raw.githubusercontent.com/DayanCryptoLab/WishfulCryptanalysis/codex/visitor-data/visitor-data.json"),
      readJson("visitor-locations.json?v=1"),
    ]);
    const visits = snapshot.countries.filter(({ visitors }) => Number.isSafeInteger(visitors) && visitors > 0);
    const largestCount = Math.max(1, ...visits.map(({ visitors }) => visitors));
    const dots = document.createDocumentFragment();

    for (const { code, visitors } of visits) {
      const position = positions[code];
      if (!Array.isArray(position) || position.length !== 2 || !position.every(Number.isFinite)) continue;

      const [x, y] = position;
      const radius = 4 + 3 * Math.sqrt(visitors / largestCount);
      addDot(dots, "visitor-map-pin-halo", x, y, radius + 5);
      addDot(dots, "visitor-map-pin-dot", x, y, radius);
    }

    map.append(dots);
  }

  render().catch(() => {
    document.querySelector("#visitor-map-status").textContent = document.documentElement.lang === "zh-Hans"
      ? "暂时无法加载地图点位。"
      : "Map markers are temporarily unavailable.";
  });
})();
