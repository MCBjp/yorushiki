async function loadCommonParts() {
  const headerHost = document.getElementById("site-header");
  const footerHost = document.getElementById("site-footer");

  if (headerHost) {
    const res = await fetch("header.html");
    headerHost.innerHTML = await res.text();
  }

  if (footerHost) {
    const res = await fetch("footer.html");
    footerHost.innerHTML = await res.text();

    const year = footerHost.querySelector("#current-year");

    if (year) {
      year.textContent = new Date().getFullYear();
    }

    const copyright =
      year?.closest("p") ||
      footerHost.querySelector(".footer-inner p");

    if (
      copyright &&
      !copyright.querySelector(".footer-photo-credit")
    ) {
      const credit = document.createElement("span");

      credit.className = "footer-photo-credit";
      credit.textContent = "photo by Noriko Akiyama";

      credit.style.display = "block";
      credit.style.marginTop = "4px";
      credit.style.color = "inherit";
      credit.style.fontSize = "0.9em";
      credit.style.letterSpacing = "0.08em";

      copyright.appendChild(credit);
    }
  }

  const menu = document.querySelector(".mobile-menu");

  if (menu) {
    const dismiss = menu.querySelector(".menu-dismiss");

    dismiss?.addEventListener("click", () => {
      menu.removeAttribute("open");
    });

    document.addEventListener("click", (e) => {
      if (menu.open && !menu.contains(e.target)) {
        menu.removeAttribute("open");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadCommonParts);
