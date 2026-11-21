(() => {
  const map = document.querySelector("#visitor-map-pins");
  if (!map) return;

  const list = document.querySelector("#visitor-map-list");
  const status = document.querySelector("#visitor-map-status");
  const selection = document.querySelector("#visitor-map-selection");
  const locale = document.documentElement.lang;
  const chinese = locale === "zh-Hans";
  const numbers = new Intl.NumberFormat(locale);
  const names = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(locale, { type: "region" })
    : null;

  let hovered;
  let focused;
  let pinned;
  let active;

  function highlight() {
    const next = hovered || focused || pinned;
    if (next === active) return;

    active?.row.classList.remove("is-active");
    active?.marker?.classList.remove("is-active");
    next?.row.classList.add("is-active");
    next?.marker?.classList.add("is-active");
    selection.textContent = next?.label || "";
    selection.hidden = !next;
    active = next;
  }

  function setPressed(country, pressed) {
    country?.row.setAttribute("aria-pressed", pressed);
    country?.marker?.setAttribute("aria-pressed", pressed);
  }

  function toggle(country) {
    setPressed(pinned, false);
    pinned = pinned === country ? undefined : country;
    setPressed(pinned, true);
    highlight();
  }

  function bind(element, country) {
    element.setAttribute("aria-label", country.label);
    element.setAttribute("aria-pressed", "false");
    element.addEventListener("pointerenter", () => {
      hovered = country;
      highlight();
    });
    element.addEventListener("pointerleave", () => {
      hovered = undefined;
      highlight();
    });
    element.addEventListener("focus", () => {
      focused = country;
      highlight();
    });
    element.addEventListener("blur", () => {
      focused = undefined;
      highlight();
    });
    element.addEventListener("click", () => toggle(country));
    element.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      setPressed(pinned, false);
      hovered = focused = pinned = undefined;
      highlight();
    });
  }

  function circle(className, radius) {
    const element = document.createElementNS(map.namespaceURI, "circle");
    element.setAttribute("class", className);
    element.setAttribute("r", radius);
    return element;
  }

  function addMarker(country, position, share) {
    if (!Array.isArray(position) || position.length !== 2 || !position.every(Number.isFinite)) return;

    const marker = document.createElementNS(map.namespaceURI, "g");
    marker.setAttribute("class", "visitor-map-pin");
    marker.setAttribute("role", "button");
    marker.setAttribute("tabindex", "0");
    marker.setAttribute("transform", `translate(${position.join(" ")})`);
    const radius = 4 + 3 * Math.sqrt(share);
    marker.append(
      circle("visitor-map-pin-hit", 16),
      circle("visitor-map-pin-halo", radius + 5),
      circle("visitor-map-pin-dot", radius),
    );
    marker.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!event.repeat) toggle(country);
      }
    });

    country.marker = marker;
    bind(marker, country);
    map.append(marker);
  }

  function addRow(country, count, share) {
    const item = document.createElement("li");
    const row = document.createElement("button");
    row.type = "button";
    row.className = "visitor-region";
    row.style.setProperty("--visitor-share", `${share * 100}%`);

    const name = document.createElement("span");
    name.className = "visitor-region-name";
    name.textContent = country.name;
    const total = document.createElement("span");
    total.className = "visitor-region-count";
    total.textContent = count;

    country.row = row;
    bind(row, country);
    row.append(name, total);
    item.append(row);
    list.append(item);
  }

  async function readJson(url) {
    const response = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) throw new Error(`Visitor data returned HTTP ${response.status}`);
    return response.json();
  }

  async function render() {
    const [snapshot, positions] = await Promise.all([
      readJson("https://raw.githubusercontent.com/DayanCryptoLab/WishfulCryptanalysis/codex/visitor-data/visitor-data.json"),
      readJson("visitor-locations.json?v=1"),
    ]);
    const countries = snapshot.countries.map(({ code, visitors }) => {
      if (!/^[A-Z]{2}$/.test(code) || !Number.isSafeInteger(visitors) || visitors < 1) {
        throw new Error("Invalid visitor count");
      }
      return { code, visitors, name: names?.of(code) || code };
    });
    countries.sort((a, b) => b.visitors - a.visitors || a.name.localeCompare(b.name, locale));

    for (const country of countries) {
      const count = numbers.format(country.visitors);
      const share = country.visitors / countries[0].visitors;
      country.label = chinese
        ? `${country.name} · ${count} 位访客`
        : `${country.name} · ${count} ${country.visitors === 1 ? "visitor" : "visitors"}`;
      addRow(country, count, share);
      addMarker(country, positions[country.code], share);
    }

    const visitors = countries.reduce((total, country) => total + country.visitors, 0);
    document.querySelector("#visitor-map-regions").textContent = numbers.format(countries.length);
    document.querySelector("#visitor-map-visitors").textContent = numbers.format(visitors);
    list.hidden = !countries.length;
    status.hidden = Boolean(countries.length);
    if (!countries.length) {
      status.textContent = chinese ? "正在等待首批访客。" : "Waiting for the first visitors.";
    }

    const updated = new Date(snapshot.updatedAt);
    if (Number.isFinite(updated.getTime())) {
      const formatted = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(updated);
      const time = document.querySelector("#visitor-map-updated");
      time.dateTime = updated.toISOString();
      time.textContent = chinese ? `更新于 ${formatted}` : `Updated ${formatted}`;
      time.hidden = false;
    }
  }

  render().catch(() => {
    status.textContent = chinese ? "暂时无法加载访客数据。" : "Visitor data is temporarily unavailable.";
  });
})();
