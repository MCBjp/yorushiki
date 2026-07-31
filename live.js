"use strict";

const LIVE_JSON_FILE = "live.json";

document.addEventListener("DOMContentLoaded", function () {
  loadLive().catch(function (error) {
    console.error(error);
    renderLiveError();
  });
});

async function loadLive() {
  const separator = LIVE_JSON_FILE.includes("?") ? "&" : "?";
  const url = `${LIVE_JSON_FILE}${separator}_=${Date.now()}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  if (!response.ok) {
    throw new Error(
      `${LIVE_JSON_FILE} の読み込みに失敗しました: ${response.status}`
    );
  }

  const value = await response.json();
  const liveItems = normalizeLive(value);

  renderLive(liveItems);
}

function normalizeLive(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && Array.isArray(value.live)) {
    return value.live;
  }

  return [];
}

function renderLive(liveItems) {
  const today = getTodayString();

  const visibleItems = liveItems.filter(function (item) {
    return (
      item &&
      item.visible !== false &&
      isValidDateString(item.date)
    );
  });

  const upcomingItems = visibleItems
    .filter(function (item) {
      return item.date >= today;
    })
    .sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });

  const pastItems = visibleItems
    .filter(function (item) {
      return item.date < today;
    })
    .sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });

  renderLiveList("live-upcoming-list", upcomingItems, false);
  renderLiveList("live-past-list", pastItems, true);
}

function renderLiveList(elementId, items, isPast) {
  const list = document.getElementById(elementId);

  if (!list) {
    return;
  }

  if (items.length === 0) {
    list.innerHTML = `
      <div class="empty">
        ${
          isPast
            ? "過去のライブ情報はありません。"
            : "現在、出演予定のライブはありません。"
        }
      </div>
    `;
    return;
  }

  list.innerHTML = items
    .map(function (item) {
      return createLiveCard(item, isPast);
    })
    .join("");
}

function createLiveCard(item, isPast) {
  const dateParts = splitDate(item.date);
  const title = String(item.title || "").trim();
  const venue = String(item.venue || "").trim();
  const openStart = formatOpenStart(item.open, item.start);
  const artists = Array.isArray(item.artists)
    ? item.artists.filter(Boolean).join(" / ")
    : "";
  const price = String(item.price || "").trim();
  const note = String(item.note || "").trim();
  const ticketUrl = String(item.ticketUrl || "").trim();

  const detailRows = [];

  if (title && title !== venue) {
    detailRows.push(createDetailRow("EVENT", title));
  }

  if (openStart) {
    detailRows.push(createDetailRow("OPEN / START", openStart));
  }

  if (artists) {
    detailRows.push(createDetailRow("ACT", artists));
  }

  if (price) {
    detailRows.push(createDetailRow("TICKET", price));
  }

  if (note) {
    detailRows.push(createDetailRow("NOTE", note));
  }

  const linkHtml = !isPast
    ? `
      <a
        class="live-contact-link"
        href="${escapeHtml(ticketUrl || "contact.html")}"
      >
        ${ticketUrl ? "TICKET" : "TICKET / CONTACT"}
      </a>
    `
    : "";

  return `
    <article class="live-card">
      <div class="live-card-top">
        <time datetime="${escapeHtml(item.date)}">
          <span class="live-date-year">${escapeHtml(dateParts.year)}</span>
          <span class="live-date-main">
            ${escapeHtml(dateParts.monthDay)}
            ${dateParts.weekday ? `(${escapeHtml(dateParts.weekday)})` : ""}
          </span>
        </time>

        <h2>${escapeHtml(venue || title || "LIVE")}</h2>
      </div>

      ${
        detailRows.length > 0
          ? `<dl class="live-details">${detailRows.join("")}</dl>`
          : ""
      }

      ${linkHtml}
    </article>
  `;
}

function createDetailRow(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function renderLiveError() {
  const message =
    '<div class="empty">ライブ情報を読み込めませんでした。</div>';

  const upcomingList = document.getElementById("live-upcoming-list");
  const pastList = document.getElementById("live-past-list");

  if (upcomingList) {
    upcomingList.innerHTML = message;
  }

  if (pastList) {
    pastList.innerHTML = message;
  }
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function splitDate(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return {
      year: "",
      monthDay: String(value || ""),
      weekday: ""
    };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = weekdays[date.getUTCDay()] || "";

  return {
    year: match[1],
    monthDay: `${match[2]}.${match[3]}`,
    weekday
  };
}

function formatOpenStart(open, start) {
  const openText = String(open || "").trim();
  const startText = String(start || "").trim();

  if (openText && startText) {
    return `${openText} / ${startText}`;
  }

  return openText || startText;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
