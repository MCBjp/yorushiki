document.addEventListener("DOMContentLoaded", () => {
  const mobileMenus = document.querySelectorAll(".mobile-menu");

  function closeAllMenus(exceptMenu = null) {
    mobileMenus.forEach((menu) => {
      if (menu !== exceptMenu) {
        menu.removeAttribute("open");
      }
    });
  }

  mobileMenus.forEach((menu) => {
    const summary = menu.querySelector("summary");
    const links = menu.querySelectorAll("a");

    summary?.addEventListener("click", () => {
      closeAllMenus(menu);
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        menu.removeAttribute("open");
      });
    });
  });

  window.addEventListener(
    "pointerdown",
    (event) => {
      mobileMenus.forEach((menu) => {
        if (!menu.open) {
          return;
        }

        if (menu.contains(event.target)) {
          return;
        }

        menu.removeAttribute("open");
      });
    },
    true
  );

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMenus();
    }
  });
});
