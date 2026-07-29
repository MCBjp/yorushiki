"use strict";

const NEWS_JSON_FILE = "news.json";
const LIVE_JSON_FILE = "live.json";

document.addEventListener("DOMContentLoaded", function () {
  initializeHomeGallery();

  loadNews().catch(function (error) {
    console.error(error);
    renderNewsError();
  });

  loadNextLive().catch(function (error) {
    console.error(error);
    renderLiveError();
  });
});

function initializeHomeGallery() {
  const track = document.getElementById("home-gallery-track");

  if (!track) {
    return;
  }

  const slides = Array.from(
    track.querySelectorAll(".home-gallery-slide")
  );

  const previousButton = document.querySelector(
    ".home-gallery-button-prev"
  );

  const nextButton = document.querySelector(
    ".home-gallery-button-next"
  );

  const dots = Array.from(
    document.querySelectorAll(".home-gallery-dot")
  );

  if (slides.length === 0) {
    return;
  }

  let currentIndex = 0;
  let scrollFrame = null;

  function normalizeIndex(index) {
    if (index < 0) {
      return slides.length - 1;
    }

    if (index >= slides.length) {
      return 0;
    }

    return index;
  }

  function updateIndicators(index) {
    currentIndex = normalizeIndex(index);

    slides.forEach(function (slide, slideIndex) {
      slide.setAttribute(
        "aria-hidden",
        slideIndex === currentIndex ? "false" : "true"
      );
    });

    dots.forEach(function (dot, dotIndex) {
      const isActive = dotIndex === currentIndex;

      dot.classList.toggle("is-active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function moveToSlide(index, behavior) {
    const nextIndex = normalizeIndex(index);
    const slideWidth = track.clientWidth;

    if (slideWidth <= 0) {
      return;
    }

    track.scrollTo({
      left: slideWidth * nextIndex,
      behavior: behavior || "smooth"
    });

    updateIndicators(nextIndex);
  }

  function showPreviousSlide() {
    moveToSlide(currentIndex - 1, "smooth");
  }

  function showNextSlide() {
    moveToSlide(currentIndex + 1, "smooth");
  }

  if (previousButton) {
    previousButton.addEventListener(
      "click",
      showPreviousSlide
    );
  }

  if (nextButton) {
    nextButton.addEventListener(
      "click",
      showNextSlide
    );
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const index = Number(dot.dataset.slideIndex);

      if (Number.isInteger(index)) {
        moveToSlide(index, "smooth");
      }
    });
  });

  track.addEventListener("scroll", function () {
    if (scrollFrame !== null) {
      cancelAnimationFrame(scrollFrame);
    }

    scrollFrame = requestAnimationFrame(function () {
      const slideWidth = track.clientWidth;

      if (slideWidth <= 0) {
        return;
      }

      const index = Math.round(
        track.scrollLeft / slideWidth
      );

      updateIndicators(index);
      scrollFrame = null;
    });
  }, { passive: true });

  track.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousSlide();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextSlide();
    }
  });

  window.addEventListener("resize", function () {
    moveToSlide(currentIndex, "auto");
  });

  track.setAttribute("tabindex", "0");
  track.setAttribute("role", "region");
  track.setAttribute(
    "aria-label",
    "アーティスト写真スライダー"
  );

  requestAnimationFrame(function () {
    moveToSlide(0, "auto");
  });
}

async function fetchJson(file) {
  const separator = file.includes("?") ? "&" : "?";
  const url = `${file}${separator}_=${Date.now()}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  if (!response.ok) {
    throw new Error(
      `${file} の読み込みに失敗しました: ${response.status}`
    );
  }

  return await response.json();
}

async function loadNews() {
  const value = await fetchJson(NEWS_JSON_FILE);
  const newsItems = normalizeNews(value);
  renderNews(newsItems);
}

async function loadNextLive() {
  const value = await fetchJson(LIVE_JSON_FILE);

  const items = Array.isArray(value)
    ? value
    : (
      value && Array.isArray(value.live)
        ? value.live
        : []
    );

  const today = new Date().toISOString().slice(0, 10);

  const visibleItems = items
    .filter(function (item) {
      return (
        item &&
        item.visible !== false &&
        String(item.date || "") >= today
      );
    })
    .sort(function (a, b) {
      return String(a.date || "").localeCompare(
        String(b.date || "")
      );
    });

  const box = document.getElementById(
    "home-live-content"
  );

  if (!box) {
    return;
  }

  if (visibleItems.length === 0) {
    box.innerHTML = `
      <p class="small-label">COMING SOON</p>
      <p class="home-live-message">
        現在、出演予定のライブはありません。
      </p>
    `;
    return;
  }

  const next = visibleItems[0];
  const artists = formatArtists(next.artists);

  ensureHomeLiveStyles();

  box.innerHTML = `
    <div class="home-live-meta">
      <p class="home-live-date">
        ${escapeHtml(formatDate(next.date || ""))}
      </p>

      <p class="home-live-venue">
        ${escapeHtml(next.venue || "")}
      </p>
    </div>

    <h3 class="home-live-title">
      ${escapeHtml(next.title || "")}
    </h3>

    ${
      artists
        ? `
          <p class="home-live-artists">
            ${escapeHtml(artists)}
          </p>
        `
        : ""
    }
  `;
}

function ensureHomeLiveStyles() {
  if (
    document.getElementById(
      "home-live-card-styles"
    )
  ) {
    return;
  }

  const style = document.createElement("style");

  style.id = "home-live-card-styles";

  style.textContent = `
    #home-live-content.home-live-card {
      padding: 28px 20px 30px;
    }

    #home-live-content .home-live-meta {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      margin: 0 0 22px;
    }

    #home-live-content .home-live-date,
    #home-live-content .home-live-venue {
      margin: 0;
      font-size: clamp(1rem, 4.2vw, 1.1rem);
      font-weight: 600;
      line-height: 1.5;
      letter-spacing: 0.01em;
    }

    #home-live-content .home-live-date {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    #home-live-content .home-live-venue {
      min-width: 0;
      text-align: right;
      overflow-wrap: anywhere;
    }

    #home-live-content .home-live-title {
      margin: 0 0 22px;
      font-family: inherit;
      font-size: clamp(1rem, 4.2vw, 1.1rem);
      font-weight: 400;
      line-height: 1.75;
      letter-spacing: 0.01em;
      overflow-wrap: anywhere;
    }

    #home-live-content .home-live-artists {
      margin: 0;
      font-size: clamp(1rem, 4.2vw, 1.1rem);
      font-weight: 400;
      line-height: 1.75;
      letter-spacing: 0.01em;
      overflow-wrap: anywhere;
    }

    @media (max-width: 420px) {
      #home-live-content.home-live-card {
        padding: 24px 18px 26px;
      }

      #home-live-content .home-live-meta {
        gap: 14px;
        margin-bottom: 20px;
      }

      #home-live-content .home-live-title {
        margin-bottom: 20px;
      }
    }
  `;

  document.head.appendChild(style);
}

function formatArtists(value) {
  if (Array.isArray(value)) {
    return value
      .map(function (artist) {
        return String(artist || "").trim();
      })
      .filter(Boolean)
      .join(" / ");
  }

  return String(value || "").trim();
}

function renderLiveError() {
  const box = document.getElementById(
    "home-live-content"
  );

  if (!box) {
    return;
  }

  box.innerHTML = `
    <p class="small-label">COMING SOON</p>
    <p class="home-live-message">
      ライブ情報を読み込めませんでした。
    </p>
  `;
}

function normalizeNews(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    Array.isArray(value.news)
  ) {
    return value.news;
  }

  return [];
}

function renderNews(newsItems) {
  const list = document.getElementById(
    "latest-list"
  );

  if (!list) {
    return;
  }

  const visibleItems = newsItems
    .filter(function (item) {
      return item && item.visible !== false;
    })
    .sort(function (a, b) {
      return String(b.date || "").localeCompare(
        String(a.date || "")
      );
    });

  if (visibleItems.length === 0) {
    list.innerHTML =
      '<div class="empty">' +
      "現在、掲載中の最新情報はありません。" +
      "</div>";

    return;
  }

  list.innerHTML = visibleItems
    .map(function (item) {
      const date = String(item.date || "");
      const text = String(item.text || "");
      const link = String(
        item.link || ""
      ).trim();

      const content = link
        ? `
          <p>
            <a href="${escapeHtml(link)}">
              ${escapeHtml(text)}
            </a>
          </p>
        `
        : `<p>${escapeHtml(text)}</p>`;

      return `
        <article class="latest-item">
          <time datetime="${escapeHtml(date)}">
            ${escapeHtml(formatDate(date))}
          </time>

          <div class="latest-content">
            ${content}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderNewsError() {
  const list = document.getElementById(
    "latest-list"
  );

  if (!list) {
    return;
  }

  list.innerHTML =
    '<div class="empty">' +
    "最新情報を読み込めませんでした。" +
    "</div>";
}

function formatDate(value) {
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return value;
  }

  return `${match[1]}.${match[2]}.${match[3]}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
