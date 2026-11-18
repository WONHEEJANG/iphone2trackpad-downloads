const languagePicker = document.querySelector("#site-language");
const languages = Array.from(languagePicker.options, (option) => option.value);

function supportedLanguage(tag) {
  const normalized = tag.toLowerCase();
  if (/^zh(?:-|$)/.test(normalized)) {
    return !/^zh-(?:hant|tw|hk|mo)(?:-|$)/.test(normalized) ? "zh-Hans" : null;
  }
  const base = normalized.split("-")[0];
  return languages.includes(base) ? base : null;
}

const pageURL = new URL(window.location.href);
const requested = pageURL.searchParams.get("lang");
const locale = (requested && supportedLanguage(requested))
  || (navigator.languages || [navigator.language]).map(supportedLanguage).find(Boolean)
  || "en";

function translatePage(dictionary) {
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  const keyFor = (value) => value.trim().replace(/\s+/g, " ");

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const translation = dictionary[keyFor(node.nodeValue)];
    if (translation && !node.parentElement.closest("select, script, style")) {
      node.nodeValue = node.nodeValue.replace(/\S(?:[\s\S]*\S)?/, () => translation);
    }
  }

  document.querySelectorAll("[aria-label], [alt], meta[content]").forEach((element) => {
    for (const attribute of ["aria-label", "alt", "content"]) {
      if (!element.hasAttribute(attribute)) continue;
      const translation = dictionary[keyFor(element.getAttribute(attribute))];
      if (translation) element.setAttribute(attribute, translation);
    }
  });
}

languagePicker.addEventListener("change", () => {
  pageURL.searchParams.set("lang", languagePicker.value);
  window.location.assign(pageURL);
});

if (locale !== "ko") {
  fetch(`locales/${locale}.json`)
    .then((response) => {
      if (!response.ok) throw new Error("Could not load language");
      return response.json();
    })
    .then((dictionary) => {
      translatePage(dictionary);
      document.documentElement.lang = locale;
      languagePicker.value = locale;
    })
    .catch(() => {
      languagePicker.value = "ko";
    });
}
