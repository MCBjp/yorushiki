document.addEventListener("DOMContentLoaded", function () {
  const menu = document.querySelector(".mobile-menu");

  if (!menu) {
    return;
  }

  const summary = menu.querySelector("summary");
  const navigation = menu.querySelector(".mobile-nav");

  function closeMenu() {
    menu.removeAttribute("open");
  }

  document.addEventListener(
    "click",
    function (event) {
      if (!menu.hasAttribute("open")) {
        return;
      }

      const tappedSummary = summary && summary.contains(event.target);
      const tappedNavigation = navigation && navigation.contains(event.target);

      if (!tappedSummary && !tappedNavigation) {
        closeMenu();
      }
    },
    true
  );

  document.addEventListener(
    "touchend",
    function (event) {
      if (!menu.hasAttribute("open")) {
        return;
      }

      const tappedSummary = summary && summary.contains(event.target);
      const tappedNavigation = navigation && navigation.contains(event.target);

      if (!tappedSummary && !tappedNavigation) {
        closeMenu();
      }
    },
    true
  );

  menu.querySelectorAll(".mobile-nav a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
});
