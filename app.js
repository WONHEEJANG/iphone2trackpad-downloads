const tabs = [...document.querySelectorAll("[data-tab]")];
const panels = [...document.querySelectorAll("[data-panel]")];

function selectPlatform(platform) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.tab === platform;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== platform;
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectPlatform(tab.dataset.tab));
  tab.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
    selectPlatform(nextTab.dataset.tab);
    nextTab.focus();
  });
});

const userAgent = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
const platform = userAgent.includes("win")
  ? "windows"
  : !isAppleMobile && userAgent.includes("mac")
    ? "mac"
    : null;

if (platform) {
  const recommended = document.querySelector(`[data-recommended="${platform}"]`);
  const card = document.querySelector(`[data-platform-card="${platform}"]`);
  const download = document.querySelector(`[data-download="${platform}"]`);
  const smartDownload = document.querySelector("#smart-download");

  recommended?.classList.add("visible");
  card?.classList.add("is-recommended");
  selectPlatform(platform);

  if (download && smartDownload) {
    smartDownload.href = download.href;
    smartDownload.querySelector("span").textContent = platform === "mac" ? "Mac용 연결 앱 다운로드" : "Windows용 연결 앱 다운로드";
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("href");
    if (target === "#mac-install") selectPlatform("mac");
    if (target === "#windows-install") selectPlatform("windows");
  });
});
