const siteLanguage = new URLSearchParams(location.search).get("lang") === "zh" ? "zh" : "en";
const isChinese = siteLanguage === "zh";

document.documentElement.lang = isChinese ? "zh-Hans" : "en";

function localizedUrl(href, language) {
  const url = new URL(href, document.baseURI);
  if (language === "zh") url.searchParams.set("lang", language);
  else url.searchParams.delete("lang");
  return url.href;
}

function updateLanguageLinks() {
  for (const link of document.querySelectorAll("[data-language]")) {
    link.href = localizedUrl(location.href, link.dataset.language);
    if (link.dataset.language === siteLanguage) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
}

function translatePage(messages) {
  if (!isChinese) return;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    const text = messages[element.dataset.i18n];
    if (text === undefined) continue;
    if (element.dataset.i18nAttr) element.setAttribute(element.dataset.i18nAttr, text);
    else element.textContent = text;
  }
}

updateLanguageLinks();
window.addEventListener("hashchange", updateLanguageLinks);

for (const link of document.querySelectorAll("[data-local-page]")) {
  link.href = localizedUrl(link.href, siteLanguage);
}

for (const group of document.querySelectorAll(".language-switch")) {
  group.setAttribute("aria-label", isChinese ? "网站语言" : "Site language");
}

translatePage({
  visitorStatsTitle: "访客地图",
  visitorMapLabel: "访问分布地图",
  visitorMapViews: "访问量",
});
