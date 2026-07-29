"use strict";

/*
  live.js
  夜敷 Official Website
  live.json を読み込み、
  UPCOMING / PAST を自動生成する。
*/

const LIVE_JSON_FILE = "live.json";

document.addEventListener("DOMContentLoaded", () => {
  loadLive().catch(err => {
    console.error(err);
    renderError();
  });
});

async function loadLive() {
  const res = await fetch(`${LIVE_JSON_FILE}?_=${Date.now()}`, {
    cache: "no-store"
  });

  if (!res.ok) throw new Error("live.jsonの取得に失敗");

  const json = await res.json();
  const items = Array.isArray(json) ? json : (json.live || []);

  const today = new Date().toISOString().slice(0,10);

  const upcoming = items
    .filter(x => x.visible !== false && x.date >= today)
    .sort((a,b)=>a.date.localeCompare(b.date));

  const past = items
    .filter(x => x.visible !== false && x.date < today)
    .sort((a,b)=>b.date.localeCompare(a.date));

  renderList("live-upcoming-list", upcoming, false);
  renderList("live-past-list", past, true);
}

function renderList(id, list, past){

  const el=document.getElementById(id);
  if(!el) return;

  if(list.length===0){
    el.innerHTML='<div class="empty">'+
      (past?'過去のライブはありません。':'現在出演予定はありません。')+
      '</div>';
    return;
  }

  el.innerHTML=list.map(item=>card(item,past)).join("");
}

function card(item,past){

  const d=item.date.split("-");

  const acts=Array.isArray(item.artists)
      ? item.artists.join(" / ")
      : (item.artists||"");

  return `
<article class="live-card">

<div class="live-card-top">

<time datetime="${item.date}">
<span class="live-date-year">${d[0]}</span>
<span class="live-date-main">${d[1]}.${d[2]}</span>
</time>

<span class="live-badge${past?' live-badge-past':''}">
${past?'PAST':'UPCOMING'}
</span>

</div>

<h2>${escape(item.venue||item.title||"LIVE")}</h2>

<dl class="live-details">

${item.title?`<div><dt>EVENT</dt><dd>${escape(item.title)}</dd></div>`:""}

${item.open||item.start?
`<div><dt>OPEN / START</dt><dd>${escape(item.open||"")} / ${escape(item.start||"")}</dd></div>`:""}

${acts?
`<div><dt>ACT</dt><dd>${escape(acts)}</dd></div>`:""}

${item.price?
`<div><dt>TICKET</dt><dd>${escape(item.price)}</dd></div>`:""}

${item.note?
`<div><dt>NOTE</dt><dd>${escape(item.note)}</dd></div>`:""}

</dl>

${!past?`
<a class="live-contact-link"
href="${item.ticketUrl||'contact.html'}">
${item.ticketUrl?'TICKET':'TICKET / CONTACT'}
</a>`:""}

</article>`;
}

function renderError(){

["live-upcoming-list","live-past-list"].forEach(id=>{
 const el=document.getElementById(id);
 if(el){
   el.innerHTML='<div class="empty">ライブ情報を読み込めませんでした。</div>';
 }
});

}

function escape(str){
 return String(str??"")
 .replaceAll("&","&amp;")
 .replaceAll("<","&lt;")
 .replaceAll(">","&gt;")
 .replaceAll('"',"&quot;");
}
