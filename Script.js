const menuButton = document.querySelector(".menu-button");
const globalNav = document.querySelector(".global-nav");
const navLinks = document.querySelectorAll(".global-nav a");
const currentYear = document.querySelector("#current-year");

function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "メニューを開く");
  globalNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";

  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "メニューを開く" : "メニューを閉じる"
  );

  globalNav?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* LIVEページ：UPCOMING / PAST タブ */
const liveTabs = document.querySelectorAll("[data-live-tab]");
const livePanels = document.querySelectorAll("[data-live-panel]");

function activateLiveTab(tabName) {
  liveTabs.forEach((tab) => {
    const isActive = tab.dataset.liveTab === tabName;

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  livePanels.forEach((panel) => {
    const isActive = panel.dataset.livePanel === tabName;

    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

liveTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateLiveTab(tab.dataset.liveTab);
  });

  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();

    const tabs = Array.from(liveTabs);
    const currentIndex = tabs.indexOf(tab);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    nextTab.focus();
    activateLiveTab(nextTab.dataset.liveTab);
  });
});
