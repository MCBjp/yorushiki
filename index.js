"use strict";

const NEWS_JSON_FILE = "news.json";
const LIVE_JSON_FILE = "live.json";


function injectHomeLiveStyles() {
  const styleId = "home-live-card-compact-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    #home-live-content.home-live-card {
      padding: 28px 30px;
    }

    #home-live-content .home-live-top {
      margin: 0 0 24px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
    }

    #home-live-content .home-live-date,
    #home-live-content .home-live-venue,
    #home-live-content .home-live-title,
    #home-live-content .home-live-artists,
    #home-live-content .home-live-message {
      font-family: inherit;
    }

    #home-live-content .home-live-date,
    #home-live-content .home-live-venue {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.5;
      letter-spacing: 0.02em;
    }

    #home-live-content .home-live-date {
      flex-shrink: 0;
      white-space: nowrap;
    }

    #home-live-content .home-live-venue {
      min-width: 0;
      text-align: right;
      overflow-wrap: anywhere;
    }

    #home-live-content .home-live-title {
      margin: 0;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.75;
      letter-spacing: 0.02em;
      overflow-wrap: anywhere;
    }

    #home-live-content .home-live-artists {
      margin: 26px 0 0;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.75;
      letter-spacing: 0.02em;
      overflow-wrap: anywhere;
    }

    #home-live-content .home-live-message {
      margin: 0;
      font-size: 16px;
      line-height: 1.65;
    }

    @media (max-width: 780px) {
      #home-live-content.home-live-card {
        padding: 22px 24px;
      }

      #home-live-content .home-live-top {
        margin-bottom: 22px;
        gap: 18px;
      }

      #home-live-content .home-live-date,
      #home-live-content .home-live-venue,
      #home-live-content .home-live-title,
      #home-live-content .home-live-artists,
      #home-live-content .home-live-message {
        font-size: 15px;
      }

      #home-live-content .home-live-venue {
        max-width: 58%;
      }

      #home-live-content .home-live-artists {
        margin-top: 24px;
      }
    }
  `;

  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", function () {
  injectHomeLiveStyles();

  loadNews().catch(function (error) {
    console.error(error);
    renderNewsError();
  });

  loadNextLive().catch(function (error) {
    console.error(error);
    renderLiveError();
  });
});

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
    throw new Error(`${file} の読み込みに失敗しました: ${response.status}`);
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
    : (value && Array.isArray(value.live) ? value.live : []);

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
      return String(a.date || "").localeCompare(String(b.date || ""));
    });

  const box = document.getElementById("home-live-content");

  if (!box) {
    return;
  }

  if (visibleItems.length === 0) {
    box.innerHTML = `
      <p class="home-live-message">現在、出演予定のライブはありません。</p>
    `;
    return;
  }

  const next = visibleItems[0];

  const artists = Array.isArray(next.artists)
    ? next.artists
        .map(function (artist) {
          return String(artist || "").trim();
        })
        .filter(Boolean)
    : [];

  const artistsHtml = artists.length > 0
    ? `<p class="home-live-artists">${escapeHtml(artists.join(" / "))}</p>`
    : "";

  box.innerHTML = `
    <div class="home-live-top">
      <p class="home-live-date">${escapeHtml(formatDate(next.date || ""))}</p>
      <p class="home-live-venue">${escapeHtml(next.venue || "")}</p>
    </div>

    <p class="home-live-title">${escapeHtml(next.title || "")}</p>

    ${artistsHtml}
  `;
}

function renderLiveError() {
  const box = document.getElementById("home-live-content");

  if (!box) {
    return;
  }

  box.innerHTML = `
    <p class="home-live-message">ライブ情報を読み込めませんでした。</p>
  `;
}

function normalizeNews(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && Array.isArray(value.news)) {
    return value.news;
  }

  return [];
}

function renderNews(newsItems) {
  const list = document.getElementById("latest-list");

  if (!list) {
    return;
  }

  const visibleItems = newsItems
    .filter(function (item) {
      return item && item.visible !== false;
    })
    .sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

  if (visibleItems.length === 0) {
    list.innerHTML =
      '<div class="empty">現在、掲載中の最新情報はありません。</div>';
    return;
  }

  list.innerHTML = visibleItems
    .map(function (item) {
      const date = String(item.date || "");
      const text = String(item.text || "");
      const link = String(item.link || "").trim();

      const content = link
        ? `<p><a href="${escapeHtml(link)}">${escapeHtml(text)}</a></p>`
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
  const list = document.getElementById("latest-list");

  if (!list) {
    return;
  }

  list.innerHTML =
    '<div class="empty">最新情報を読み込めませんでした。</div>';
}

function formatDate(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

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
