"use strict";

const NEWS_JSON_FILE = "news.json";

document.addEventListener("DOMContentLoaded", function () {
  loadNews().catch(function (error) {
    console.error(error);
    renderNewsError();
  });
});

async function loadNews() {
  const separator = NEWS_JSON_FILE.includes("?") ? "&" : "?";
  const url = `${NEWS_JSON_FILE}${separator}_=${Date.now()}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  if (!response.ok) {
    throw new Error(
      `${NEWS_JSON_FILE} の読み込みに失敗しました: ${response.status}`
    );
  }

  const value = await response.json();
  const newsItems = normalizeNews(value);

  renderNews(newsItems);
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
