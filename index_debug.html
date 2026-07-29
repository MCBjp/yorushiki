// DEBUG版 index.js に追加する loadNextLive 用ログ

async function loadNextLive() {
  console.log("=== loadNextLive start ===");

  try {
    const value = await fetchJson(LIVE_JSON_FILE);
    console.log("live.json:", value);

    const items = Array.isArray(value) ? value : (value.live || []);
    console.log("items:", items);

    const today = new Date().toISOString().slice(0, 10);
    console.log("today:", today);

    const next = items
      .filter(x => x && x.visible !== false && x.date >= today)
      .sort((a,b)=>a.date.localeCompare(b.date))[0];

    console.log("next:", next);

    const box = document.getElementById("home-live-content");
    console.log("home-live-content:", box);

    if (!box) {
      console.error("home-live-content が見つかりません");
      return;
    }

    if (!next) {
      console.warn("次回ライブなし判定");
      box.innerHTML = `
        <p class="small-label">COMING SOON</p>
        <p class="home-live-message">現在、出演予定のライブはありません。</p>
      `;
      return;
    }

    console.log("描画開始");

    box.innerHTML = `
      <p class="small-label">NEXT LIVE</p>
      <p class="release-date">${next.date}</p>
      <h3 class="release-title">${next.title}</h3>
      <p class="home-live-message">${next.venue}</p>
    `;

    console.log("描画完了");
  } catch (e) {
    console.error("loadNextLive error:", e);
    throw e;
  }
}
