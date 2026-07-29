"use strict";

/*
  必ず公開前に変更してください。
  ただし、この値はHTMLのソースを調べれば確認できるため、
  本格的なセキュリティ用途には使えません。
*/
const ADMIN_PASSWORD = "yorushiki-admin";

const SESSION_KEY = "yorushiki-admin-login";
const JSON_FILES = {
  news: "news.json",
  live: "live.json",
  discography: "discography.json"
};
const DEFAULT_DATA = {
  news: [],
  live: [],
  discography: []
};

let data = cloneDefaultData();
let currentExportType = "news";
let dataReadyPromise;

const loginScreen = document.getElementById("login-screen");
const adminScreen = document.getElementById("admin-screen");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function normalizeCollection(type, value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && Array.isArray(value[type])) {
    return value[type];
  }

  return [];
}

async function fetchJsonCollection(type) {
  const separator = JSON_FILES[type].includes("?") ? "&" : "?";
  const url = `${JSON_FILES[type]}${separator}_=${Date.now()}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  if (!response.ok) {
    throw new Error(`${JSON_FILES[type]}: HTTP ${response.status}`);
  }

  const value = await response.json();
  return normalizeCollection(type, value);
}

async function loadData() {
  const remoteData = cloneDefaultData();

  const results = await Promise.allSettled(
    Object.keys(JSON_FILES).map(async function (type) {
      remoteData[type] = await fetchJsonCollection(type);
    })
  );

  results.forEach(function (result) {
    if (result.status === "rejected") {
      console.warn("JSONの読み込みに失敗しました。", result.reason);
    }
  });

  data = remoteData;
  sortData();
  renderAll();
  updateJsonPreview(currentExportType);
}

function saveData() {
  renderAll();
  updateJsonPreview(currentExportType);
}

async function showAdmin() {
  loginScreen.classList.add("hidden");
  adminScreen.classList.remove("hidden");

  /*
    ログインするたびに公開中のJSONを再取得する。
    これにより、ログアウト前に画面上で追加・編集した未アップロード内容が
    次のログイン後までメモリ上に残るのを防ぐ。
  */
  dataReadyPromise = loadData();

  try {
    await dataReadyPromise;
  } catch (error) {
    console.error(error);
  }

  renderAll();
  updateJsonPreview(currentExportType);
}

function showLogin() {
  adminScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  document.getElementById("admin-password").value = "";
  loginMessage.textContent = "";
}

dataReadyPromise = Promise.resolve();

if (sessionStorage.getItem(SESSION_KEY) === "ok") {
  showAdmin();
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const password = document.getElementById("admin-password").value;

  if (password !== ADMIN_PASSWORD) {
    loginMessage.textContent = "パスワードが違います。";
    return;
  }

  sessionStorage.setItem(SESSION_KEY, "ok");
  loginMessage.textContent = "";
  await showAdmin();
});

logoutButton.addEventListener("click", function () {
  sessionStorage.removeItem(SESSION_KEY);

  /*
    ログアウト時に編集中のメモリデータも破棄する。
    次回ログイン時には showAdmin() が公開中のJSONを再取得する。
  */
  data = cloneDefaultData();
  resetNewsForm();
  resetLiveForm();
  resetDiscographyForm();
  renderAll();
  updateJsonPreview("news");

  showLogin();
});

document.querySelectorAll(".tab-button").forEach(function (button) {
  button.addEventListener("click", function () {
    const tabName = button.dataset.tab;

    document.querySelectorAll(".tab-button").forEach(function (item) {
      item.classList.toggle("is-active", item === button);
    });

    document.querySelectorAll(".tab-panel").forEach(function (panel) {
      panel.classList.add("hidden");
    });

    document.getElementById(`tab-${tabName}`).classList.remove("hidden");
  });
});

function booleanValue(value) {
  return value === "true";
}

function splitLines(value) {
  return value
    .split("\n")
    .map(function (line) {
      return line.trim();
    })
    .filter(Boolean);
}

function parseServiceLinks(value) {
  return splitLines(value).map(function (line) {
    const separatorIndex = line.indexOf("|");

    if (separatorIndex === -1) {
      return {
        service: "",
        url: line
      };
    }

    return {
      service: line.slice(0, separatorIndex).trim(),
      url: line.slice(separatorIndex + 1).trim()
    };
  });
}

function formatServiceLinks(links) {
  if (!Array.isArray(links)) {
    return "";
  }

  return links
    .map(function (link) {
      return `${link.service || ""}|${link.url || ""}`;
    })
    .join("\n");
}

function sortData() {
  data.news.sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });

  data.live.sort(function (a, b) {
    return String(a.date).localeCompare(String(b.date));
  });

  data.discography.sort(function (a, b) {
    return String(b.releaseDate).localeCompare(String(a.releaseDate));
  });
}

document.getElementById("news-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const editIndex = document.getElementById("news-edit-index").value;
  const item = {
    date: document.getElementById("news-date").value,
    text: document.getElementById("news-text").value.trim(),
    link: document.getElementById("news-link").value.trim(),
    visible: booleanValue(document.getElementById("news-visible").value)
  };

  if (editIndex === "") {
    data.news.push(item);
  } else {
    data.news[Number(editIndex)] = item;
  }

  sortData();
  saveData();
  resetNewsForm();
});

document.getElementById("live-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const editIndex = document.getElementById("live-edit-index").value;
  const item = {
    date: document.getElementById("live-date").value,
    title: document.getElementById("live-title").value.trim(),
    venue: document.getElementById("live-venue").value.trim(),
    open: document.getElementById("live-open").value,
    start: document.getElementById("live-start").value,
    price: document.getElementById("live-price").value.trim(),
    artists: splitLines(document.getElementById("live-artists").value),
    ticketUrl: document.getElementById("live-ticket-url").value.trim(),
    note: document.getElementById("live-note").value.trim(),
    visible: booleanValue(document.getElementById("live-visible").value)
  };

  if (editIndex === "") {
    data.live.push(item);
  } else {
    data.live[Number(editIndex)] = item;
  }

  sortData();
  saveData();
  resetLiveForm();
});

document
  .getElementById("discography-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const editIndex = document.getElementById(
      "discography-edit-index"
    ).value;

    const item = {
      title: document.getElementById("discography-title").value.trim(),
      releaseDate: document.getElementById("discography-date").value,
      type: document.getElementById("discography-type").value,
      image: document.getElementById("discography-image").value.trim(),
      description: document
        .getElementById("discography-description")
        .value.trim(),
      links: parseServiceLinks(
        document.getElementById("discography-links").value
      ),
      visible: booleanValue(
        document.getElementById("discography-visible").value
      )
    };

    if (editIndex === "") {
      data.discography.push(item);
    } else {
      data.discography[Number(editIndex)] = item;
    }

    sortData();
    saveData();
    resetDiscographyForm();
  });

function resetNewsForm() {
  document.getElementById("news-form").reset();
  document.getElementById("news-edit-index").value = "";
  document.getElementById("news-visible").value = "true";
  document.getElementById("news-cancel-edit").classList.add("hidden");
}

function resetLiveForm() {
  document.getElementById("live-form").reset();
  document.getElementById("live-edit-index").value = "";
  document.getElementById("live-visible").value = "true";
  document.getElementById("live-cancel-edit").classList.add("hidden");
}

function resetDiscographyForm() {
  document.getElementById("discography-form").reset();
  document.getElementById("discography-edit-index").value = "";
  document.getElementById("discography-visible").value = "true";
  document
    .getElementById("discography-cancel-edit")
    .classList.add("hidden");
}

document
  .getElementById("news-cancel-edit")
  .addEventListener("click", resetNewsForm);

document
  .getElementById("live-cancel-edit")
  .addEventListener("click", resetLiveForm);

document
  .getElementById("discography-cancel-edit")
  .addEventListener("click", resetDiscographyForm);

function renderAll() {
  renderNews();
  renderLive();
  renderDiscography();
}

function renderNews() {
  const list = document.getElementById("news-list");

  if (data.news.length === 0) {
    list.innerHTML = '<div class="empty">まだ登録されていません。</div>';
    return;
  }

  list.innerHTML = data.news
    .map(function (item, index) {
      return `
        <article class="entry-card">
          <div class="entry-card-top">
            <div>
              <h4>${escapeHtml(item.text)}</h4>
              <p>
                ${escapeHtml(item.date)}
                ／ ${item.visible === false ? "非公開" : "公開"}
                ${item.link ? `／ ${escapeHtml(item.link)}` : ""}
              </p>
            </div>

            <div class="entry-actions">
              <button class="button button-small" type="button" data-action="edit-news" data-index="${index}">編集</button>
              <button class="button button-small button-danger" type="button" data-action="delete-news" data-index="${index}">削除</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderLive() {
  const list = document.getElementById("live-list");

  if (data.live.length === 0) {
    list.innerHTML = '<div class="empty">まだ登録されていません。</div>';
    return;
  }

  list.innerHTML = data.live
    .map(function (item, index) {
      return `
        <article class="entry-card">
          <div class="entry-card-top">
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>
                ${escapeHtml(item.date)}
                ／ ${escapeHtml(item.venue)}
                ／ ${item.visible === false ? "非公開" : "公開"}
              </p>
            </div>

            <div class="entry-actions">
              <button class="button button-small" type="button" data-action="edit-live" data-index="${index}">編集</button>
              <button class="button button-small button-danger" type="button" data-action="delete-live" data-index="${index}">削除</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderDiscography() {
  const list = document.getElementById("discography-list");

  if (data.discography.length === 0) {
    list.innerHTML = '<div class="empty">まだ登録されていません。</div>';
    return;
  }

  list.innerHTML = data.discography
    .map(function (item, index) {
      return `
        <article class="entry-card">
          <div class="entry-card-top">
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>
                ${escapeHtml(item.releaseDate)}
                ／ ${escapeHtml(item.type)}
                ／ ${item.visible === false ? "非公開" : "公開"}
              </p>
            </div>

            <div class="entry-actions">
              <button class="button button-small" type="button" data-action="edit-discography" data-index="${index}">編集</button>
              <button class="button button-small button-danger" type="button" data-action="delete-discography" data-index="${index}">削除</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const index = Number(button.dataset.index);

  if (action === "edit-news") editNews(index);
  if (action === "delete-news") deleteItem("news", index);
  if (action === "edit-live") editLive(index);
  if (action === "delete-live") deleteItem("live", index);
  if (action === "edit-discography") editDiscography(index);
  if (action === "delete-discography") deleteItem("discography", index);
});

function editNews(index) {
  const item = data.news[index];

  document.getElementById("news-edit-index").value = index;
  document.getElementById("news-date").value = item.date || "";
  document.getElementById("news-text").value = item.text || "";
  document.getElementById("news-link").value = item.link || "";
  document.getElementById("news-visible").value = String(item.visible !== false);
  document.getElementById("news-cancel-edit").classList.remove("hidden");
  document.getElementById("tab-news").scrollIntoView({ behavior: "smooth" });
}

function editLive(index) {
  const item = data.live[index];

  document.getElementById("live-edit-index").value = index;
  document.getElementById("live-date").value = item.date || "";
  document.getElementById("live-title").value = item.title || "";
  document.getElementById("live-venue").value = item.venue || "";
  document.getElementById("live-open").value = item.open || "";
  document.getElementById("live-start").value = item.start || "";
  document.getElementById("live-price").value = item.price || "";
  document.getElementById("live-artists").value = Array.isArray(item.artists)
    ? item.artists.join("\n")
    : "";
  document.getElementById("live-ticket-url").value = item.ticketUrl || "";
  document.getElementById("live-note").value = item.note || "";
  document.getElementById("live-visible").value = String(item.visible !== false);
  document.getElementById("live-cancel-edit").classList.remove("hidden");
  document.getElementById("tab-live").scrollIntoView({ behavior: "smooth" });
}

function editDiscography(index) {
  const item = data.discography[index];

  document.getElementById("discography-edit-index").value = index;
  document.getElementById("discography-title").value = item.title || "";
  document.getElementById("discography-date").value = item.releaseDate || "";
  document.getElementById("discography-type").value = item.type || "DIGITAL SINGLE";
  document.getElementById("discography-image").value = item.image || "";
  document.getElementById("discography-description").value = item.description || "";
  document.getElementById("discography-links").value = formatServiceLinks(item.links);
  document.getElementById("discography-visible").value = String(item.visible !== false);
  document.getElementById("discography-cancel-edit").classList.remove("hidden");
  document.getElementById("tab-discography").scrollIntoView({ behavior: "smooth" });
}

function deleteItem(type, index) {
  const confirmed = window.confirm("この項目を削除しますか？");

  if (!confirmed) {
    return;
  }

  data[type].splice(index, 1);
  saveData();
}

function getExportData(type) {
  return data[type].filter(function (item) {
    return item.visible !== false;
  });
}

function updateJsonPreview(type) {
  currentExportType = type;

  document.getElementById("json-preview").value = JSON.stringify(
    getExportData(type),
    null,
    2
  );
}

document.querySelectorAll("[data-export]").forEach(function (button) {
  button.addEventListener("click", function () {
    updateJsonPreview(button.dataset.export);
  });
});

document.getElementById("copy-json").addEventListener("click", async function () {
  const preview = document.getElementById("json-preview");
  const message = document.getElementById("export-message");

  try {
    await navigator.clipboard.writeText(preview.value);
    message.textContent = "JSONをコピーしました。";
  } catch (error) {
    preview.select();
    document.execCommand("copy");
    message.textContent = "JSONをコピーしました。";
  }
});

document
  .getElementById("download-json")
  .addEventListener("click", function () {
    const json = document.getElementById("json-preview").value;
    const fileName = `${currentExportType}.json`;
    const blob = new Blob([json], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    document.getElementById("export-message").textContent =
      `${fileName}をダウンロードしました。`;
  });

document.getElementById("reset-all").addEventListener("click", async function () {
  const confirmed = window.confirm(
    "編集中の内容を破棄し、公開中のJSONを読み直しますか？"
  );

  if (!confirmed) {
    return;
  }

  data = cloneDefaultData();
  resetNewsForm();
  resetLiveForm();
  resetDiscographyForm();

  dataReadyPromise = loadData();
  await dataReadyPromise;
  updateJsonPreview("news");

  document.getElementById("export-message").textContent =
    "公開中のJSONを読み直しました。";
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderAll();
updateJsonPreview("news");
