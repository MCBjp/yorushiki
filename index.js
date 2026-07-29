"use strict";

const NEWS_JSON_FILE = "news.json";
const LIVE_JSON_FILE = "live.json";

document.addEventListener("DOMContentLoaded", function () {
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
      <p class="small-label">COMING SOON</p>
      <p class="home-live-message">現在、出演予定のライブはありません。</p>
    `;
    return;
  }

  const next = visibleItems[0];

  box.innerHTML = `
    <p class="small-label">NEXT LIVE</p>
    <p class="release-date">${escapeHtml(formatDate(next.date || ""))}</p>
    <h3 class="release-title">${escapeHtml(next.title || "")}</h3>
    <p class="home-live-message">${escapeHtml(next.venue || "")}</p>
  `;
}

function renderLiveError() {
  const box = document.getElementById("home-live-content");

  if (!box) {
    return;
  }

  box.innerHTML = `
    <p class="small-label">COMING SOON</p>
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