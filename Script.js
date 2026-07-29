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
