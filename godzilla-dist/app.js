// ゴジラずかん v20 - コア (ルーター / アイコン / XP / コレクション / ずかん / 詳細)
(function() {
  const COLL_KEY = "godzilla_zukan_coll_v20";
  const PROF_KEY = "godzilla_zukan_prof_v20";
  const OLD_STAMP_KEY = "godzilla_zukan_stamps_v2";

  /* ================= SVGアイコン ================= */
  const P = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    sparkles: '<path d="M12 3l1.9 5.9 5.9 1.6-5.9 1.6L12 18l-1.9-5.9L4.2 10.5l5.9-1.6z"/><path d="M19 15.5l.8 2.3 2.2.7-2.2.7-.8 2.3-.8-2.3-2.2-.7 2.2-.7z"/>',
    zap: '<path d="M13 2L3 14h8l-1 8 11-14h-9l1-6z"/>',
    quiz: '<circle cx="12" cy="12" r="9.2"/><path d="M9.3 9.1a2.8 2.8 0 1 1 4 2.6c-.9.5-1.3 1.1-1.3 2.1"/><line x1="12" y1="17" x2="12" y2="17.01"/>',
    sound: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    cards: '<rect x="3" y="5" width="12" height="16" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
    hammer: '<path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/><path d="M17.6 3.4l3 3a2 2 0 0 1 0 2.8l-2.3 2.3-5.8-5.8 2.3-2.3a2 2 0 0 1 2.8 0z"/>',
    puzzle: '<path d="M5 7h3.5a2 2 0 1 1 4 0H16a1 1 0 0 1 1 1v3.5a2 2 0 1 1 0 4V19a1 1 0 0 1-1 1h-3.5a2 2 0 1 0-4 0H5a1 1 0 0 1-1-1v-3.5a2 2 0 1 0 0-4V8a1 1 0 0 1 1-1z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 3.2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M15.8 14.7a5.4 5.4 0 0 1 5.7 5.3"/>',
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 4"/><path d="M17 6h2.5a2.5 2.5 0 0 1-2.6 4"/>',
    ruler: '<rect x="8" y="2" width="8" height="20" rx="2"/><path d="M12 6h4M12 10h4M12 14h4M12 18h4"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9L6.6 19.6l1.1-6L3.2 9.4l6.1-.8z"/>',
    shield: '<path d="M12 2l8 3.5V11c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5.5z"/>',
    flame: '<path d="M12 2s5.5 4.8 5.5 9.5a5.5 5.5 0 0 1-11 0c0-1.8.6-3.4 1.6-4.9.8 1.2 1.7 2 2.9 2.4C11 6.6 11.4 4.3 12 2z"/>',
    food: '<path d="M7 2v8a2 2 0 0 0 4 0V2"/><path d="M9 12v10"/><path d="M17 2c-1.8 1.6-2.6 3.8-2.6 6.4V12H17v10"/>',
    alert: '<path d="M12 3.5L21.5 20h-19z"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="12" y1="17" x2="12" y2="17.01"/>',
    bulb: '<path d="M9 18.5h6"/><path d="M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 1 4 11.6c-.8.7-1 1.3-1 2.4h-6c0-1.1-.2-1.7-1-2.4A6.5 6.5 0 0 1 12 2.5z"/>',
    photo: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16.5l-5.2-5.2L6 21"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    wave: '<path d="M2 12h3l2.5-7 4 14 3-9 1.5 2h6"/>',
    person: '<circle cx="12" cy="7.5" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    robot: '<rect x="4" y="8" width="16" height="11" rx="3"/><circle cx="9" cy="13.5" r="1.3"/><circle cx="15" cy="13.5" r="1.3"/><path d="M12 8V4M8.5 4h7"/>',
    up: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    "bgm-note": '<path d="M9 18V6l11-2.5V15"/><circle cx="6.4" cy="18" r="2.6"/><circle cx="17.4" cy="15" r="2.6"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9.5 3L8 9l4 12M14.5 3L16 9l-4 12"/>'
  };
  function icon(name, cls) {
    return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${P[name] || P.star}</svg>`;
  }
  function injectIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(el => {
      el.innerHTML = icon(el.dataset.icon);
    });
  }

  /* ================= エフェクト ================= */
  const FX_COLORS = ["#53d1ff", "#8b7bff", "#ffd166", "#ff5d5d", "#4ade80", "#ffffff"];
  function confetti(n) {
    const cv = document.createElement("canvas");
    cv.id = "fx-canvas";
    document.body.appendChild(cv);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const cx = cv.getContext("2d");
    cx.scale(dpr, dpr);
    const parts = Array.from({ length: n || 110 }, () => ({
      x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.4,
      vy: 2.4 + Math.random() * 3.2, vx: -1.4 + Math.random() * 2.8,
      w: 6 + Math.random() * 7, h: 4 + Math.random() * 5,
      r: Math.random() * Math.PI, vr: -0.16 + Math.random() * 0.32,
      c: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)]
    }));
    const t0 = performance.now();
    (function tickFrame(t) {
      const el = t - t0;
      cx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += 0.035;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
        cx.fillStyle = p.c; cx.globalAlpha = Math.max(0, 1 - el / 2100);
        cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.restore();
      });
      if (el < 2200) requestAnimationFrame(tickFrame);
      else cv.remove();
    })(t0);
  }

  let toastEl = null, toastTimer = null;
  function toast(html) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    clearTimeout(toastTimer);
    toastEl.innerHTML = html;
    toastEl.classList.remove("show");
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2100);
  }

  /* ================= プロフィール (XP / レベル) ================= */
  const TITLES = [
    [1, "みならい けんきゅういん"], [2, "けんきゅういん"], [3, "じゅんはかせ"], [4, "はかせ"],
    [6, "すごうで はかせ"], [8, "だいはかせ"], [10, "かいじゅうマスター"],
    [13, "でんせつの はかせ"], [16, "かいじゅうの おうさま"]
  ];
  function loadProf() {
    try { return JSON.parse(localStorage.getItem(PROF_KEY) || "null") || { xp: 0 }; }
    catch { return { xp: 0 }; }
  }
  function saveProf(p) { try { localStorage.setItem(PROF_KEY, JSON.stringify(p)); } catch {} }
  function needFor(level) { return 60 + (level - 1) * 30; } // level→level+1 に必要なXP
  function levelInfo(xp) {
    let lv = 1, rest = xp;
    while (rest >= needFor(lv) && lv < 99) { rest -= needFor(lv); lv++; }
    let title = TITLES[0][1];
    TITLES.forEach(([l, t]) => { if (lv >= l) title = t; });
    return { lv, rest, need: needFor(lv), title };
  }
  function addXp(n, label) {
    const p = loadProf();
    const before = levelInfo(p.xp).lv;
    p.xp += n;
    saveProf(p);
    const after = levelInfo(p.xp).lv;
    if (label) toast(`${icon("star", "")} <span class="gold">+${n} XP</span> ${label}`);
    if (after > before) setTimeout(() => showLevelUp(after), label ? 900 : 100);
    renderProf();
  }
  function showLevelUp(lv) {
    const info = levelInfo(loadProf().xp);
    const ov = document.createElement("div");
    ov.className = "lvup-overlay";
    ov.innerHTML = `
      <div class="lvup-box">
        <div class="lvup-label">LEVEL UP!</div>
        <div class="lvup-num">Lv.${lv}</div>
        <div class="lvup-title">${info.title}</div>
        <button class="btn warm lvup-close">やったー！</button>
      </div>`;
    document.body.appendChild(ov);
    window.SFX && SFX.levelUp();
    confetti(140);
    speak(`レベル${lv}に あがったよ！ ${info.title}！`);
    ov.querySelector(".lvup-close").addEventListener("click", () => ov.remove());
  }

  /* ================= コレクション ================= */
  function loadColl() {
    try {
      let c = JSON.parse(localStorage.getItem(COLL_KEY) || "null");
      if (c) return c;
      // 旧スタンプ(v2)からの引き継ぎ
      c = {};
      const old = JSON.parse(localStorage.getItem(OLD_STAMP_KEY) || "{}");
      Object.keys(old).forEach(id => {
        const n = old[id] || 1;
        c[id] = { n, s: n >= 5 ? 2 : n >= 3 ? 1 : 0 };
      });
      localStorage.setItem(COLL_KEY, JSON.stringify(c));
      return c;
    } catch { return {}; }
  }
  function saveColl(c) { try { localStorage.setItem(COLL_KEY, JSON.stringify(c)); } catch {} }
  function ownedCount() { return Object.keys(loadColl()).length; }
  function stars(id) { const e = loadColl()[id]; return e ? e.s : 0; }
  function isOwned(id) { return !!loadColl()[id]; }
  // via: "view" | "gacha"
  function own(id, via) {
    const coll = loadColl();
    const k = KAIJU_DATA.find(x => x.id === id);
    let res;
    if (!coll[id]) {
      coll[id] = { n: 1, s: 0 };
      saveColl(coll);
      res = { isNew: true, starUp: false };
      toast(`${icon("sparkles")} <span class="gold">カードゲット！</span> ${k ? k.name : ""}`);
      addXp(via === "gacha" ? 12 : 10);
    } else {
      const e = coll[id];
      e.n++;
      let starUp = false;
      if (e.s < 5 && (via === "gacha" || e.n % 3 === 0)) { e.s++; starUp = true; }
      saveColl(coll);
      res = { isNew: false, starUp };
      if (starUp) {
        toast(`${icon("star")} <span class="gold">★アップ！</span> ${k ? k.name : ""} ★${e.s}`);
        addXp(6);
      } else if (via === "gacha") {
        addXp(4);
      }
    }
    return res;
  }

  /* ================= 画面ルーター ================= */
  const stack = ["screen-home"];
  function show(id, opts) {
    opts = opts || {};
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const next = document.getElementById(id);
    if (!next) return;
    next.classList.add("active");
    if (!opts.silent) {
      if (opts.replace) stack[stack.length - 1] = id;
      else if (stack[stack.length - 1] !== id) stack.push(id);
    }
    if (id !== "screen-detail") stopSpeak();
    if (id === "screen-home") renderHome();
  }
  function back() {
    stopSpeak();
    if (stack.length > 1) stack.pop();
    const prev = stack[stack.length - 1] || "screen-home";
    show(prev, { silent: true });
  }

  const ROUTES = {
    zukan: () => openZukan(),
    gacha: () => window.Extras.openGacha(),
    battle: () => window.Games.openBattle(),
    quiz: () => window.Games.openQuiz(),
    roarquiz: () => window.Games.openRoarQuiz(),
    memory: () => window.Games.openMemory(),
    whack: () => window.Games.openWhack(),
    puzzle: () => window.Games.openPuzzle(),
    timeline: () => window.Extras.openTimeline(),
    family: () => window.Extras.openFamily(),
    ranking: () => window.Extras.openRanking(),
    compare: () => window.Extras.openCompare()
  };
  function route(target) {
    if (ROUTES[target]) {
      window.SFX && SFX.stomp();
      ROUTES[target]();
    }
  }

  /* ================= 音声よみあげ ================= */
  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.querySelectorAll(".act-btn.playing, .listen-btn.playing").forEach(b => b.classList.remove("playing"));
  }
  function speak(text, onend) {
    if (!window.speechSynthesis) { onend && onend(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP"; u.rate = 0.95; u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const ja = voices.find(v => v.lang === "ja-JP" || (v.lang && v.lang.startsWith("ja")));
    if (ja) u.voice = ja;
    u.onstart = () => { window.BGM && BGM.duck(); };
    u.onend = () => { window.BGM && BGM.unduck(); onend && onend(); };
    u.onerror = u.onend;
    window.speechSynthesis.speak(u);
  }

  /* ================= カードHTML (共通部品) ================= */
  function cardHTML(k, opts) {
    opts = opts || {};
    const owned = isOwned(k.id);
    const locked = opts.lockUnowned && !owned;
    const rar = RARITY_INFO[k.rarity];
    const st = stars(k.id);
    const typeCls = k.type === "godzilla" ? "g" : "j";
    const typeLabel = k.type === "godzilla" ? "ゴジラ" : "かいじゅう";
    return `
      <button class="k-card ${rar.cls} ${locked ? "locked" : ""}" data-kid="${k.id}" style="animation-delay:${(opts.idx || 0) % 12 * 0.03}s">
        <img class="k-img" src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy" onerror="this.style.display='none'">
        <div class="k-fade"></div>
        <span class="k-type ${typeCls}">${typeLabel}</span>
        ${st > 0 && !locked ? `<span class="k-stars">${"★".repeat(st)}</span>` : ""}
        <div class="k-plate">
          <div class="k-title">${locked ? "？？？" : k.title}</div>
          <div class="k-name">${locked ? "？？？" : k.name}</div>
          <div class="k-meta"><span class="k-rar">${rar.label}</span><span>${k.year}ねん</span></div>
        </div>
      </button>`;
  }
  function bindCards(root) {
    root.querySelectorAll(".k-card").forEach(c => {
      c.addEventListener("click", () => {
        window.SFX && SFX.tap();
        openDetailById(c.dataset.kid);
      });
    });
  }

  /* ================= ずかん ================= */
  let zukanFilter = "all";
  function openZukan(filter) {
    if (filter) zukanFilter = filter;
    renderGallery();
    show("screen-zukan");
  }
  function getFiltered() {
    switch (zukanFilter) {
      case "godzilla": return KAIJU_DATA.filter(k => k.type === "godzilla");
      case "kaiju": return KAIJU_DATA.filter(k => k.type === "kaiju");
      case "owned": return KAIJU_DATA.filter(k => isOwned(k.id));
      case "legend": return KAIJU_DATA.filter(k => k.rarity === "L" || k.rarity === "UR");
      default: return KAIJU_DATA;
    }
  }
  function renderGallery() {
    const data = getFiltered();
    document.getElementById("zukan-count").textContent = `${data.length}たい`;
    const g = document.getElementById("gallery");
    if (data.length === 0) {
      g.innerHTML = `<div class="empty-note" style="grid-column:1/-1">まだ ここには いないよ。<br>ずかんを みたり ガチャを ひいたり してみよう！</div>`;
      return;
    }
    g.innerHTML = data.map((k, i) => cardHTML(k, { idx: i })).join("");
    bindCards(g);
    document.querySelectorAll("#zukan-chips .chip").forEach(ch =>
      ch.classList.toggle("active", ch.dataset.filter === zukanFilter));
  }

  /* ================= 詳細 ================= */
  let detailIdx = 0;
  function openDetailById(id) {
    const i = KAIJU_DATA.findIndex(k => k.id === id);
    if (i >= 0) openDetail(i);
  }
  function openDetail(idx) {
    detailIdx = idx;
    renderDetail();
    show("screen-detail");
  }

  function radarSVG(k) {
    const cx = 86, cy = 78, R = 43;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    const ring = f => Array.from({ length: 5 }, (_, i) => pt(i, R * f).map(v => v.toFixed(1)).join(",")).join(" ");
    const vals = STAT_AXES.map((ax, i) => pt(i, R * (k[ax.key] / 10)).map(v => v.toFixed(1)).join(",")).join(" ");
    const labels = STAT_AXES.map((ax, i) => {
      const [x, y] = pt(i, R + 13);
      const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
      return `<text class="axis-label" x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="${anchor}">${ax.label}</text>`;
    }).join("");
    const spokes = Array.from({ length: 5 }, (_, i) => {
      const [x, y] = pt(i, R);
      return `<line class="grid-line" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }).join("");
    return `
      <svg class="radar" viewBox="-14 -2 200 158">
        ${[0.33, 0.66, 1].map(f => `<polygon class="grid-line" points="${ring(f)}"/>`).join("")}
        ${spokes}
        <polygon class="poly" points="${vals}"/>
        ${labels}
      </svg>`;
  }

  function towerCompare(h) {
    const r = h / 333;
    return r >= 1 ? `とうきょうタワーの ${r.toFixed(1)}ばい` : `とうきょうタワーの ${Math.round(r * 100)}%`;
  }

  function renderDetail() {
    const k = KAIJU_DATA[detailIdx];
    const rar = RARITY_INFO[k.rarity];
    document.getElementById("detail-counter").textContent = `${detailIdx + 1} / ${KAIJU_DATA.length}`;
    document.getElementById("detail-title").textContent = k.type === "godzilla" ? "ゴジラ" : "かいじゅう";

    const photos = [];
    const total = k.type === "kaiju" ? 3 : 2;
    for (let i = 2; i <= total; i++) {
      photos.push(`<button class="ph" data-full="images/${k.id}-${i}.jpg"><img src="images/${k.id}-${i}.jpg" alt="${k.name}${i}" loading="lazy" onerror="this.parentElement.style.display='none'"></button>`);
    }

    let relatedHtml = "";
    if (k.relatedIds && k.relatedIds.length) {
      const items = k.relatedIds.map(rid => {
        const r = KAIJU_DATA.find(x => x.id === rid);
        if (!r) return "";
        return `<button class="rel-item" data-kid="${r.id}"><img src="images/${r.id}-1.jpg" alt="${r.name}" loading="lazy" onerror="this.style.display='none'"><span>${r.name}</span></button>`;
      }).join("");
      relatedHtml = `<div class="dt-sec-title">${icon("link")} いっしょに たたかった</div><div class="rel-row">${items}</div>`;
    }

    const statRows = STAT_AXES.map(ax => `
      <div class="sn-row"><span style="width:52px;flex:none">${ax.label}</span>
        <span class="sn-bar"><span class="sn-fill" style="width:${k[ax.key] * 10}%"></span></span>
        <b>${k[ax.key]}</b></div>`).join("");

    document.getElementById("detail-body").innerHTML = `
      <div class="dt-hero" data-full="images/${k.id}-1.jpg">
        <img src="images/${k.id}-1.jpg" alt="${k.name}" onerror="this.style.display='none'">
        <div class="dt-hero-grad"></div>
      </div>
      <div class="dt-head">
        <div class="dt-title">${k.title}</div>
        <div class="dt-name">${k.name}</div>
        <div class="dt-sub">
          <span class="pill" style="color:${k.rarity === "L" ? "var(--gold)" : "inherit"}">${rar.label}</span>
          <span class="pill">${k.year}ねん</span>
          <span class="pill">${k.era}</span>
          ${stars(k.id) ? `<span class="pill" style="color:var(--gold)">${"★".repeat(stars(k.id))}</span>` : ""}
        </div>
      </div>
      <div class="dt-actions">
        <button class="act-btn" id="speak-btn">${icon("sound")} よんでもらう</button>
        <button class="act-btn roar" id="roar-btn">${icon("wave")} なきごえ</button>
      </div>
      <div class="dt-desc">${k.description}</div>
      <div class="stat-wrap">${radarSVG(k)}<div class="stat-nums">${statRows}</div></div>
      <div class="facts">
        <div class="fact"><div class="fact-label">${icon("ruler")} しんちょう</div><div class="fact-value">${k.height}m</div><div class="fact-sub">${towerCompare(k.height)}</div></div>
        <div class="fact"><div class="fact-label">${icon("shield")} たいじゅう</div><div class="fact-value">${k.weight.toLocaleString()}t</div><div class="fact-sub">ぞうさん ${Math.round(k.weight / 6).toLocaleString()}とうぶん</div></div>
        <div class="fact wide"><div class="fact-label">${icon("zap")} ひっさつわざ</div><div class="fact-value">${k.skill}</div></div>
        <div class="fact"><div class="fact-label">${icon("food")} すきなもの</div><div class="fact-value" style="font-size:13px">${k.likes}</div></div>
        <div class="fact"><div class="fact-label">${icon("alert")} よわいもの</div><div class="fact-value" style="font-size:13px">${k.weak}</div></div>
        <div class="fact wide fun"><div class="fact-label">${icon("bulb")} まめちしき</div><div class="fact-value">${k.funFact}</div></div>
      </div>
      ${photos.length ? `<div class="dt-sec-title">${icon("photo")} もっと しゃしん</div><div class="extra-imgs">${photos.join("")}</div>` : ""}
      ${relatedHtml}
      <div class="swipe-tip">← よこに スワイプで つぎのかいじゅう →</div>
    `;

    const body = document.getElementById("detail-body");
    body.scrollTop = 0;

    body.querySelector("#speak-btn").addEventListener("click", () => {
      window.SFX && SFX.tap();
      const btn = body.querySelector("#speak-btn");
      btn.classList.add("playing");
      speakKaiju(k);
    });
    body.querySelector("#roar-btn").addEventListener("click", () => {
      stopSpeak();
      const btn = body.querySelector("#roar-btn");
      btn.classList.add("playing");
      window.BGM && BGM.duck();
      let waitMs;
      if (k.type === "godzilla") {
        window.Roar && Roar.playGodzilla();
        waitMs = 14000; // 本物の音源は最後まで
      } else {
        const dur = (window.Roar && Roar.playType) ? Roar.playType(k.roar) : 0;
        waitMs = Math.max(1800, (dur || 1.5) * 1000 + 500);
      }
      setTimeout(() => {
        window.BGM && BGM.unduck();
        btn.classList.remove("playing");
      }, waitMs);
    });
    body.querySelectorAll("[data-full]").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        openFullImg(el.dataset.full);
      });
    });
    body.querySelectorAll(".rel-item").forEach(b => {
      b.addEventListener("click", () => { window.SFX && SFX.tap(); openDetailById(b.dataset.kid); });
    });

    own(k.id, "view");
    setTimeout(() => {
      if (document.getElementById("screen-detail").classList.contains("active")) {
        const btn = body.querySelector("#speak-btn");
        btn && btn.classList.add("playing");
        speakKaiju(k);
      }
    }, 650);
  }

  function speakKaiju(k) {
    speak(`${k.name}！ ${k.title}！ ${k.description} しんちょう ${k.height}メートル、たいじゅう ${k.weight.toLocaleString()}トン。 ひっさつわざは ${k.skillReading}。 ${k.funFact}`,
      () => document.querySelectorAll(".act-btn.playing").forEach(b => b.classList.remove("playing")));
  }

  function nextKaiju(dir) {
    detailIdx = (detailIdx + dir + KAIJU_DATA.length) % KAIJU_DATA.length;
    renderDetail();
  }
  function setupSwipe() {
    const sc = document.getElementById("screen-detail");
    let sx = 0, sy = 0, on = false;
    sc.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; on = true; }, { passive: true });
    sc.addEventListener("touchend", e => {
      if (!on) return;
      on = false;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        window.SFX && SFX.flip();
        nextKaiju(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  function openFullImg(src) {
    document.getElementById("fullimg-img").src = src;
    show("screen-fullimg");
  }

  /* ================= ホーム ================= */
  function todaysGodzilla() {
    const t = new Date();
    const seed = t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate();
    const gs = KAIJU_DATA.filter(k => k.type === "godzilla");
    return gs[seed % gs.length];
  }
  function renderProf() {
    const el = document.getElementById("home-prof");
    if (!el) return;
    const info = levelInfo(loadProf().xp);
    el.innerHTML = `
      <div class="prof">
        <div class="prof-badge">${info.lv}</div>
        <div class="prof-info">
          <div class="prof-name">${info.title}</div>
          <div class="prof-sub">つぎのレベルまで あと ${info.need - info.rest} XP</div>
          <div class="xp-bar"><div class="xp-fill" style="width:${Math.round(info.rest / info.need * 100)}%"></div></div>
        </div>
        <div class="prof-coll"><b>${ownedCount()}<small style="font-size:11px;color:var(--dim)">/${KAIJU_DATA.length}</small></b><span>カード</span></div>
      </div>`;
  }
  function renderHome() {
    renderProf();
    const k = todaysGodzilla();
    const t = new Date();
    document.getElementById("home-hero-wrap").innerHTML = `
      <button class="hero" data-kid="${k.id}">
        <img src="images/${k.id}-1.jpg" alt="${k.name}">
        <div class="hero-grad"></div>
        <div class="hero-tag">きょうの ゴジラ ${t.getMonth() + 1}/${t.getDate()}</div>
        <div class="hero-info">
          <div class="hero-name">${k.name}</div>
          <div class="hero-sub"><span>${k.title}</span><span class="hero-cta">みてみる →</span></div>
        </div>
      </button>`;
    document.querySelector("#home-hero-wrap .hero").addEventListener("click", e => {
      window.SFX && SFX.tap();
      openDetailById(e.currentTarget.dataset.kid);
    });
    const gs = window.Extras && Extras.gachaLeft ? Extras.gachaLeft() : null;
    if (gs !== null && gs !== undefined) {
      document.getElementById("gacha-tile-sub").textContent = gs > 0 ? `きょう あと ${gs}かい ひける！` : "また あした ひける！";
    }
  }

  /* ================= 初期化 ================= */
  function init() {
    injectIcons();
    document.getElementById("bgm-btn").innerHTML =
      `<span class="i-bgm-on">${icon("bgm-note")}</span><span class="i-bgm-off">${icon("bgm-note")}</span>`;
    document.getElementById("zukan-tile-sub").textContent = `${KAIJU_DATA.length}たいの かいじゅう`;

    document.querySelectorAll("[data-target]").forEach(t => {
      t.addEventListener("click", () => { window.SFX && SFX.tap(); route(t.dataset.target); });
    });
    document.querySelectorAll(".back-btn").forEach(b => {
      b.addEventListener("click", () => { window.SFX && SFX.tap(); back(); });
    });
    document.getElementById("fullimg-close").addEventListener("click", back);
    document.getElementById("fullimg-img").addEventListener("click", back);
    document.querySelectorAll("#zukan-chips .chip").forEach(ch => {
      ch.addEventListener("click", () => {
        window.SFX && SFX.tap();
        zukanFilter = ch.dataset.filter;
        renderGallery();
      });
    });

    setupSwipe();
    renderHome();
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  document.addEventListener("DOMContentLoaded", init);

  /* ================= 公開API ================= */
  window.App = {
    show, back, route, icon, injectIcons,
    cardHTML, bindCards,
    openDetail, openDetailById, openZukan,
    speak, stopSpeak,
    addXp, own, ownedCount, stars, isOwned, levelInfo, loadProf,
    confetti, toast,
    todaysGodzilla, renderHome
  };
})();
