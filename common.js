async function loadCommonParts() {
  const headerHost = document.getElementById("site-header");
  const footerHost = document.getElementById("site-footer");

  if (headerHost) {
    const response = await fetch("header.html");

    if (!response.ok) {
      throw new Error(`header.html の読み込みに失敗しました: ${response.status}`);
    }

    headerHost.innerHTML = await response.text();
  }

  if (footerHost) {
    const response = await fetch("footer.html");

    if (!response.ok) {
      throw new Error(`footer.html の読み込みに失敗しました: ${response.status}`);
    }

    footerHost.innerHTML = await response.text();

    const currentYear = footerHost.querySelector("#current-year");

    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }
  }

  const mobileMenu = document.querySelector(".mobile-menu");

  if (mobileMenu) {
    const menuDismiss = mobileMenu.querySelector(".menu-dismiss");

    menuDismiss?.addEventListener("click", () => {
      mobileMenu.removeAttribute("open");
    });

    document.addEventListener("click", (event) => {
      if (
        mobileMenu.hasAttribute("open") &&
        !mobileMenu.contains(event.target)
      ) {
        mobileMenu.removeAttribute("open");
      }
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.removeAttribute("open");
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCommonParts().catch((error) => {
    console.error(error);
  });
});
