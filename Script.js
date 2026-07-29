document.addEventListener("DOMContentLoaded", function () {
  var menu = document.querySelector(".mobile-menu");

  if (!menu) {
    return;
  }

  function closeMenu() {
    menu.open = false;
  }

  document.addEventListener("touchstart", function (event) {
    if (menu.open && !menu.contains(event.target)) {
      closeMenu();
    }
  }, true);

  document.addEventListener("mousedown", function (event) {
    if (menu.open && !menu.contains(event.target)) {
      closeMenu();
    }
  }, true);

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
});
