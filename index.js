<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex,nofollow,noarchive">

  <title>夜敷 | Official Website</title>
  <meta
    name="description"
    content="夜敷の公式ウェブサイト。ライブ情報、作品情報、プロフィールを掲載しています。"
  >

  <link rel="stylesheet" href="style.css?v=15">
  <script src="common.js" defer></script>
  <script src="index.js?v=6" defer></script>
</head>

<body id="top">

<header id="site-header" class="site-header"></header>

<main class="home-main">

  <section
    class="home-gallery"
    aria-label="夜敷 アーティスト写真"
  >
    <div class="home-gallery-viewport">

      <div
        id="home-gallery-track"
        class="home-gallery-track"
      >
        <figure class="home-gallery-slide">
          <img
            src="images/Artistphoto1.jpeg"
            alt="夜敷 アーティスト写真 1"
            loading="eager"
            decoding="async"
          >
        </figure>

        <figure class="home-gallery-slide">
          <img
            src="images/Artistphoto2.jpeg"
            alt="夜敷 アーティスト写真 2"
            loading="lazy"
            decoding="async"
          >
        </figure>

        <figure class="home-gallery-slide">
          <img
            src="images/Artistphoto3.jpeg"
            alt="夜敷 アーティスト写真 3"
            loading="lazy"
            decoding="async"
          >
        </figure>
      </div>

      <button
        type="button"
        class="home-gallery-button home-gallery-button-prev"
        aria-label="前の写真を見る"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <button
        type="button"
        class="home-gallery-button home-gallery-button-next"
        aria-label="次の写真を見る"
      >
        <span aria-hidden="true">›</span>
      </button>

      <div
        class="home-gallery-dots"
        aria-label="写真の切り替え"
      >
        <button
          type="button"
          class="home-gallery-dot is-active"
          aria-label="1枚目の写真を表示"
          aria-current="true"
          data-slide-index="0"
        ></button>

        <button
          type="button"
          class="home-gallery-dot"
          aria-label="2枚目の写真を表示"
          data-slide-index="1"
        ></button>

        <button
          type="button"
          class="home-gallery-dot"
          aria-label="3枚目の写真を表示"
          data-slide-index="2"
        ></button>
      </div>

    </div>
  </section>

  <section class="section home-section home-latest">
    <div class="container">

      <div class="section-heading home-heading">
        <h1>最新情報</h1>
      </div>

      <div id="latest-list" class="latest-list">
        <div class="empty">最新情報を読み込んでいます。</div>
      </div>

    </div>
  </section>

  <section class="section section-alt home-section home-live">
    <div class="container">

      <div class="section-heading home-heading">
        <h2>次回ライブ</h2>
      </div>

      <div class="feature-card home-live-card" id="home-live-content">
        <p class="small-label">COMING SOON</p>
        <p class="home-live-message">
          現在、出演予定のライブはありません。
        </p>
      </div>

    </div>
  </section>

  <section class="section home-section home-release">
    <div class="container">

      <div class="section-heading home-heading">
        <h2>最新作品</h2>
      </div>

      <div class="release-preview">

        <div class="artwork-placeholder">
          ARTWORK
        </div>

        <div class="release-copy">
          <p class="small-label">DIGITAL RELEASE</p>
          <h3 class="release-title">夜敷</h3>
          <p class="release-date">2026.01.27 RELEASE</p>

          <a class="pill-link" href="discography.html">
            作品情報を見る
          </a>
        </div>

      </div>

    </div>
  </section>

</main>

<footer id="site-footer" class="site-footer"></footer>

</body>
</html>
