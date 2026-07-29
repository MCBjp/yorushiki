// 夜敷 Official Website

const year = document.querySelector("footer p");

if (year) {
  const currentYear = new Date().getFullYear();
  year.innerHTML = `&copy; ${currentYear} 夜敷`;
}

// スムーズスクロール（古いブラウザ対策）
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href");

    if (targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

console.log("Yorushiki Official Website Loaded");

