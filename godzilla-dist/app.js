// ゴジラずかん v7 - メインアプリ
let currentDetailIndex = 0;
let currentFilter = "all";

// === 画面切替 ===
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const next = document.getElementById(id);
  next.classList.add("active");
  // フェードインアニメ
  next.classList.remove("anim-in");
  void next.offsetWidth;
  next.classList.add("anim-in");
  // 歩く効果音（ホーム以外への遷移時）
  if (window.Extras && id !== "screen-home" && id !== "screen-fullimg") {
    window.Extras.playStomp();
  }
  if (id !== "screen-detail") stopSpeak();
}
window.showScreen = showScreen;

function goHome() {
  showScreen("screen-home");
  updateHomeStamps();
  renderDailyGodzilla();
}

function renderDailyGodzilla() {
  if (window.Extras) {
    const wrap = document.getElementById("daily-godzilla-wrap");
    if (wrap) {
      wrap.innerHTML = window.Extras.renderDailyGodzillaCard();
      wrap.querySelector(".daily-card")?.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const idx = KAIJU_DATA.findIndex(k => k.id === id);
        if (idx >= 0) openDetail(idx);
      });
    }
  }
}

// === 音声 ===
function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.querySelectorAll(".speak-btn").forEach(b => b.classList.remove("playing"));
}
function speak(text) {
  if (!window.speechSynthesis) return;
  stopSpeak();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP"; u.rate = 0.95; u.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang === "ja-JP" || v.lang.startsWith("ja"));
  if (jaVoice) u.voice = jaVoice;
  u.onstart = () => { if (window.BGM) window.BGM.duck(); };
  u.onend = () => {
    document.querySelectorAll(".speak-btn").forEach(b => b.classList.remove("playing"));
    if (window.BGM) window.BGM.unduck();
  };
  u.onerror = u.onend;
  window.speechSynthesis.speak(u);
}
window.AppSpeak = speak;

function speakKaiju(k) {
  if (!window.speechSynthesis) return;
  stopSpeak();
  const text = `${k.name}！ ${k.description} しんちょう ${k.height}メートル、たいじゅう ${k.weight.toLocaleString()}トン。 ひっさつわざは ${k.skillReading}。 ${k.funFact}`;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP"; u.rate = 0.95; u.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang === "ja-JP" || v.lang.startsWith("ja"));
  if (jaVoice) u.voice = jaVoice;
  u.onstart = () => { if (window.BGM) window.BGM.duck(); };
  u.onend = () => {
    document.querySelectorAll(".speak-btn").forEach(b => b.classList.remove("playing"));
    if (window.BGM) window.BGM.unduck();
  };
  u.onerror = u.onend;
  document.querySelectorAll(".speak-btn").forEach(b => b.classList.add("playing"));
  window.speechSynthesis.speak(u);
}

// === ホームメニューカウンタ ===
function updateHomeStamps() {
  if (window.Games) {
    const el = document.getElementById("stamp-count-label");
    if (el) el.textContent = `${window.Games.stampCount()}たい`;
  }
}

// === ずかん ===
function getFilteredData() {
  if (currentFilter === "all") return KAIJU_DATA;
  return KAIJU_DATA.filter(k => k.type === currentFilter);
}

function renderGallery() {
  const gallery = document.getElementById("gallery");
  const data = getFilteredData();
  gallery.innerHTML = data.map(k => {
    const realIdx = KAIJU_DATA.findIndex(x => x.id === k.id);
    const typeLabel = k.type === "godzilla" ? "ゴジラ" : "かいじゅう";
    const typeColor = k.type === "godzilla" ? "#ff3333" : "#ffd700";
    const stamped = window.Games && window.Games.hasStamp(k.id);
    return `
    <div class="gallery-card" data-idx="${realIdx}" style="background: ${k.color}">
      <div class="gallery-card-placeholder">🦖<br><span class="placeholder-text">じゅんびちゅう…</span></div>
      <img class="gallery-card-img" src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy" onload="this.previousElementSibling.style.display='none'" onerror="this.style.display='none'">
      <div class="gallery-card-typebadge" style="background:${typeColor};color:${k.type==='godzilla'?'#fff':'#000'}">${typeLabel}</div>
      ${stamped ? `<div class="gallery-card-stamp">⭐</div>` : ""}
      <div class="gallery-card-label">
        <div class="gallery-card-name">${k.name}</div>
        <div class="gallery-card-year">${k.year}ねん</div>
      </div>
    </div>
    `;
  }).join("");
  gallery.querySelectorAll(".gallery-card").forEach(card => {
    card.addEventListener("click", () => openDetail(parseInt(card.dataset.idx)));
  });
}

// === 詳細 ===
function openDetail(idx) {
  currentDetailIndex = idx;
  renderDetail();
  showScreen("screen-detail");
  document.getElementById("detail-content").scrollTop = 0;
  // スタンプ自動付与
  const k = KAIJU_DATA[idx];
  if (window.Games) window.Games.addStamp(k.id);
}
window.openDetail = openDetail;

function buildSizeCompare(height) {
  if (height >= 333) return `とうきょうタワー ${(height/333).toFixed(1)}こぶん`;
  return `とうきょうタワーの ${Math.round((height/333)*100)}%くらい`;
}

function renderDetail() {
  const k = KAIJU_DATA[currentDetailIndex];
  document.getElementById("detail-counter").textContent = `${currentDetailIndex + 1} / ${KAIJU_DATA.length}`;

  // 怪獣は3枚、ゴジラは2枚
  const totalImages = k.type === "kaiju" ? 3 : 2;
  const extraImageSlots = [];
  for (let i = 2; i <= totalImages; i++) {
    extraImageSlots.push(`
      <div class="extra-img-wrap" data-fullimg="images/${k.id}-${i}.jpg" style="background:${k.color}">
        <img src="images/${k.id}-${i}.jpg" alt="${k.name}${i}" loading="lazy" onerror="this.style.display='none'">
      </div>
    `);
  }

  const typeLabel = k.type === "godzilla" ? "ゴジラ" : "かいじゅう";
  const typeColor = k.type === "godzilla" ? "#ff3333" : "#ffd700";

  let relatedHtml = "";
  if (k.relatedIds && k.relatedIds.length > 0) {
    const relatedCards = k.relatedIds.map(rid => {
      const r = KAIJU_DATA.find(x => x.id === rid);
      if (!r) return "";
      const rIdx = KAIJU_DATA.findIndex(x => x.id === rid);
      return `
        <button class="related-btn" data-idx="${rIdx}" style="background:${r.color}">
          <img src="images/${r.id}-1.jpg" alt="${r.name}" onerror="this.style.display='none'">
          <span>${r.name}</span>
        </button>
      `;
    }).join("");
    relatedHtml = `
      <div class="related-section">
        <div class="section-title">⚔️ いっしょに たたかった</div>
        <div class="related-list">${relatedCards}</div>
      </div>
    `;
  }

  document.getElementById("detail-content").innerHTML = `
    <div class="detail-hero" style="background:${k.color}" data-fullimg="images/${k.id}-1.jpg">
      <div class="detail-hero-emoji" id="hero-emoji-fallback">🦖</div>
      <img class="detail-hero-img" src="images/${k.id}-1.jpg" alt="${k.name}" onload="this.previousElementSibling.style.display='none'" onerror="this.style.display='none'">
      <div class="hero-typebadge" style="background:${typeColor};color:${k.type==='godzilla'?'#fff':'#000'}">${typeLabel}</div>
    </div>
    <div class="detail-info">
      <div class="detail-name">${k.name}</div>
      <div class="detail-fullname">${k.fullName}</div>
      <div class="detail-year">${k.year}ねん（${k.era}）</div>
      <div class="detail-action-row">
        <button class="speak-btn" id="speak-btn">
          <span style="font-size:24px">🔊</span> よんでもらう
        </button>
        <button class="roar-btn" id="roar-btn">
          <span style="font-size:24px">${k.type === "godzilla" ? "🦖" : "👾"}</span> なきごえ
        </button>
      </div>
      <div class="detail-desc">${k.description}</div>

      <div class="stats-grid">
        <div class="stat-box"><div class="stat-icon">📏</div><div class="stat-label">しんちょう</div><div class="stat-value">${k.height}m</div><div class="stat-sub">${buildSizeCompare(k.height)}</div></div>
        <div class="stat-box"><div class="stat-icon">⚖️</div><div class="stat-label">たいじゅう</div><div class="stat-value">${k.weight.toLocaleString()}t</div><div class="stat-sub">ぞうさん ${Math.round(k.weight/6).toLocaleString()}とう</div></div>
        <div class="stat-box"><div class="stat-icon">⚡</div><div class="stat-label">ひっさつわざ</div><div class="stat-value-small">${k.skill}</div></div>
        <div class="stat-box"><div class="stat-icon">📅</div><div class="stat-label">はじめてでた</div><div class="stat-value">${k.year}ねん</div></div>
      </div>

      <div class="info-rows">
        <div class="info-row info-row-likes"><div class="info-row-icon">🍴</div><div class="info-row-text"><div class="info-row-label">すきなもの</div><div class="info-row-value">${k.likes}</div></div></div>
        <div class="info-row info-row-weak"><div class="info-row-icon">😖</div><div class="info-row-text"><div class="info-row-label">よわいもの</div><div class="info-row-value">${k.weak}</div></div></div>
        <div class="info-row info-row-fact"><div class="info-row-icon">💡</div><div class="info-row-text"><div class="info-row-label">まめちしき</div><div class="info-row-value">${k.funFact}</div></div></div>
      </div>
    </div>

    ${extraImageSlots.length > 0 ? `
    <div class="more-photos-section">
      <div class="section-title">📷 もっと しゃしん</div>
      <div class="extra-images">${extraImageSlots.join("")}</div>
    </div>` : ""}

    ${relatedHtml}

    <div class="swipe-tip">← よこに スワイプ →</div>
  `;

  document.getElementById("speak-btn").addEventListener("click", () => {
    const btn = document.getElementById("speak-btn");
    btn.classList.add("playing");
    speakKaiju(k);
  });
  const roarBtn = document.getElementById("roar-btn");
  if (roarBtn) {
    roarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      stopSpeak();
      roarBtn.classList.add("roaring");
      if (window.BGM) window.BGM.duck();
      let waitMs = 3000;
      if (k.type === "godzilla") {
        // ゴジラ系は本物の音源（14秒）、最後まで聞かせる
        if (window.Roar) window.Roar.playGodzilla();
        waitMs = 14000;
      } else {
        // かいじゅうは鳴き声タイプから合成
        const dur = (window.Roar && window.Roar.playType) ? window.Roar.playType(k.roar) : 0;
        waitMs = Math.max(1800, (dur || 1.5) * 1000 + 500);
      }
      setTimeout(() => {
        if (window.BGM) window.BGM.unduck();
        roarBtn.classList.remove("roaring");
      }, waitMs);
    });
  }

  document.querySelectorAll("[data-fullimg]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openFullImg(el.dataset.fullimg);
    });
  });
  document.querySelectorAll(".related-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDetail(parseInt(btn.dataset.idx));
    });
  });

  setTimeout(() => speakKaiju(k), 600);
}

function openFullImg(src) {
  document.getElementById("fullimg").src = src;
  showScreen("screen-fullimg");
}

// === スワイプ ===
function setupSwipe() {
  const screen = document.getElementById("screen-detail");
  let startX = 0, startY = 0, swiping = false;
  screen.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiping = true;
  }, { passive: true });
  screen.addEventListener("touchend", (e) => {
    if (!swiping) return;
    swiping = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) nextKaiju();
      else prevKaiju();
    }
  }, { passive: true });
}

function nextKaiju() {
  currentDetailIndex = (currentDetailIndex + 1) % KAIJU_DATA.length;
  renderDetail();
  document.getElementById("detail-content").scrollTop = 0;
  if (window.Games) window.Games.addStamp(KAIJU_DATA[currentDetailIndex].id);
}
function prevKaiju() {
  currentDetailIndex = (currentDetailIndex - 1 + KAIJU_DATA.length) % KAIJU_DATA.length;
  renderDetail();
  document.getElementById("detail-content").scrollTop = 0;
  if (window.Games) window.Games.addStamp(KAIJU_DATA[currentDetailIndex].id);
}

// === フィルタタブ ===
function setupFilterTabs() {
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      renderGallery();
      document.getElementById("gallery").scrollTop = 0;
    });
  });
}

// === ホームメニュー ===
let selectedDifficulty = "easy";

function setupHomeMenu() {
  document.querySelectorAll(".menu-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const target = tile.dataset.target;
      switch (target) {
        case "zukan":
          currentFilter = "all";
          document.querySelectorAll(".filter-tab").forEach(t => t.classList.toggle("active", t.dataset.filter === "all"));
          renderGallery();
          showScreen("screen-zukan");
          break;
        case "zukan-kaiju":
          currentFilter = "kaiju";
          document.querySelectorAll(".filter-tab").forEach(t => t.classList.toggle("active", t.dataset.filter === "kaiju"));
          renderGallery();
          showScreen("screen-zukan");
          break;
        case "quiz-menu":
          showScreen("screen-quiz-menu");
          break;
        case "memory-menu":
          showScreen("screen-memory-menu");
          break;
        case "battle-menu":
          showScreen("screen-battle-menu");
          break;
        case "puzzle":
          window.Extras.startPuzzle();
          showScreen("screen-puzzle");
          break;
        case "roarquiz":
          window.Games.startRoarQuiz();
          showScreen("screen-roarquiz");
          break;
        case "whack":
          window.Games.startWhack();
          showScreen("screen-whack");
          break;
        case "timeline":
          window.Extras.renderTimeline();
          showScreen("screen-timeline");
          break;
        case "family":
          window.Extras.renderFamilyTree();
          showScreen("screen-family");
          break;
        case "ranking":
          window.Extras.renderRanking();
          showScreen("screen-ranking");
          break;
        case "compare":
          window.Games.renderCompare();
          showScreen("screen-compare");
          break;
        case "stamps":
          window.Games.renderStamps();
          showScreen("screen-stamps");
          break;
      }
    });
  });

  // 難易度選択
  document.querySelectorAll(".diff-btn").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".diff-btn").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      selectedDifficulty = b.dataset.diff;
    });
  });

  // クイズモード開始
  document.querySelectorAll("[data-quiz-mode]").forEach(b => {
    b.addEventListener("click", () => {
      window.Games.startQuiz({ mode: b.dataset.quizMode, difficulty: selectedDifficulty });
      showScreen("screen-quiz");
    });
  });
  // メモリーモード
  document.querySelectorAll("[data-mem-mode]").forEach(b => {
    b.addEventListener("click", () => {
      window.Games.startMemory({ mode: b.dataset.memMode });
      showScreen("screen-memory");
    });
  });
  // バトルモード
  document.querySelectorAll("[data-bat-mode]").forEach(b => {
    b.addEventListener("click", () => {
      window.Games.startBattle({ mode: b.dataset.batMode });
      showScreen("screen-battle");
    });
  });
}

// === イベント ===
function setupEvents() {
  document.getElementById("btn-back").addEventListener("click", () => showScreen("screen-zukan"));
  document.getElementById("btn-fullimg-close").addEventListener("click", () => showScreen("screen-detail"));
  document.getElementById("fullimg").addEventListener("click", () => showScreen("screen-detail"));
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tgt = btn.dataset.back;
      if (tgt === "home") goHome();
      else showScreen("screen-" + tgt);
    });
  });
  setupSwipe();
  setupFilterTabs();
  setupHomeMenu();
}

function init() {
  setupEvents();
  updateHomeStamps();
  renderGallery();
  renderDailyGodzilla();
  // ずかん総数はデータから動的に表示（追加時の直し忘れ防止）
  const zukanCount = document.querySelector('[data-target="zukan"] .menu-sub');
  if (zukanCount) zukanCount.textContent = `${KAIJU_DATA.length}たい`;
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);
