// ゴジラずかん v20 - カードガチャ / ねんぴょう / かんけい / ランキング / サイズくらべ
(function() {
  const GACHA_KEY = "godzilla_zukan_gacha_v20";
  const GACHA_DAILY = 3;

  const $ = id => document.getElementById(id);
  const rnd = n => Math.floor(Math.random() * n);
  const ic = (n, c) => window.App.icon(n, c);

  /* ============================================================
     カードガチャ (1にち3かい)
     ============================================================ */
  function todayStr() {
    const t = new Date();
    return `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
  }
  function loadGacha() {
    try {
      const g = JSON.parse(localStorage.getItem(GACHA_KEY) || "null");
      if (g && g.date === todayStr()) return g;
    } catch {}
    return { date: todayStr(), used: 0 };
  }
  function saveGacha(g) { try { localStorage.setItem(GACHA_KEY, JSON.stringify(g)); } catch {} }
  function gachaLeft() { return Math.max(0, GACHA_DAILY - loadGacha().used); }

  function rollRarity() {
    const total = Object.values(GACHA_WEIGHTS).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [rank, w] of Object.entries(GACHA_WEIGHTS)) {
      if ((r -= w) < 0) return rank;
    }
    return "R";
  }
  function rollKaiju() {
    const rank = rollRarity();
    const pool = KAIJU_DATA.filter(k => k.rarity === rank);
    return pool[rnd(pool.length)];
  }

  let gachaBusy = false;

  function openGacha() {
    gachaBusy = false;
    renderGacha();
    App.show("screen-gacha");
  }

  function gachaPips() {
    const used = loadGacha().used;
    return Array.from({ length: GACHA_DAILY }, (_, i) => `<div class="g-pip ${i < GACHA_DAILY - used ? "on" : ""}"></div>`).join("");
  }

  function emblemSVG() {
    return `<svg class="emblem" viewBox="0 0 24 24" fill="none" stroke="#53d1ff" stroke-width="1.4" stroke-linecap="round">
      <circle cx="12" cy="12" r="9.5" opacity="0.8"/>
      <circle cx="12" cy="12" r="6.8" opacity="0.35"/>
      <text x="12" y="16.2" text-anchor="middle" font-size="10.5" font-weight="900" fill="#53d1ff" stroke="none">G</text>
    </svg>`;
  }

  function renderGacha(result) {
    const left = gachaLeft();
    $("gacha-side").textContent = `のこり${left}`;
    const collGrid = KAIJU_DATA.map((k, i) => App.cardHTML(k, { lockUnowned: true, idx: i })).join("");
    const owned = App.ownedCount();
    const pct = Math.round(owned / KAIJU_DATA.length * 100);

    $("gacha-body").innerHTML = `
      <div class="gacha-top">
        <div class="gacha-pips">${gachaPips()}</div>
        <div class="gacha-note">${left > 0 ? `きょうは あと ${left}かい ひけるよ！` : "きょうの ぶんは おしまい！ また あした！"}</div>
      </div>
      <div class="gacha-stage">
        <div class="g-aura" id="g-aura"></div>
        <div class="g-card" id="g-card">
          <div class="g-inner">
            <div class="g-face g-back">${emblemSVG()}</div>
            <div class="g-face g-front" id="g-front"></div>
          </div>
        </div>
      </div>
      <div class="g-result-name" id="g-result">${result || ""}</div>
      <button class="btn warm" id="g-pull" ${left <= 0 ? "disabled" : ""}>${ic("sparkles")} ${left > 0 ? "ガチャを ひく！" : "また あした！"}</button>
      <div class="coll-head"><span class="t">カードコレクション</span><span class="c">${owned} / ${KAIJU_DATA.length}（${pct}%）</span></div>
      <div class="coll-bar"><div class="coll-fill" style="width:${pct}%"></div></div>
      <div class="gallery" id="g-coll">${collGrid}</div>`;

    $("g-pull").onclick = onPullClick;
    bindCollGrid();
  }

  function bindCollGrid() {
    document.querySelectorAll("#g-coll .k-card").forEach(c => {
      c.addEventListener("click", () => {
        const id = c.dataset.kid;
        if (App.isOwned(id)) { SFX.tap(); App.openDetailById(id); }
        else {
          SFX.flip();
          App.toast(`${ic("sparkles")} まだ もってないよ！ ガチャで ゲットしよう！`);
        }
      });
    });
  }

  // ボタンは常にこれ1本: めくれた状態なら裏に戻してから次を引く
  function onPullClick() {
    if (gachaBusy || gachaLeft() <= 0) return;
    SFX.tap();
    const card = $("g-card");
    if (card.classList.contains("flipped")) {
      gachaBusy = true;
      card.classList.remove("flipped");
      $("g-aura").className = "g-aura";
      $("g-result").innerHTML = "";
      setTimeout(() => { gachaBusy = false; pullGacha(); }, 430);
    } else {
      pullGacha();
    }
  }

  function pullGacha() {
    if (gachaBusy || gachaLeft() <= 0) return;
    gachaBusy = true;
    const g = loadGacha();
    g.used++;
    saveGacha(g);

    const k = rollKaiju();
    const rar = RARITY_INFO[k.rarity];
    SFX.riser();
    const btn = $("g-pull");
    btn.disabled = true;
    $("gacha-side").textContent = `のこり${gachaLeft()}`;
    $("gacha-body").querySelector(".gacha-pips").innerHTML = gachaPips();

    setTimeout(() => {
      if (!$("g-card")) { gachaBusy = false; return; } // 画面を離れた
      const front = $("g-front");
      front.innerHTML = App.cardHTML(k);
      $("g-aura").className = `g-aura a-${k.rarity} show`;
      $("g-card").classList.add("flipped");
      SFX.reveal(k.rarity);
      if (k.rarity === "L" || k.rarity === "UR") App.confetti(k.rarity === "L" ? 160 : 90);

      const res = App.own(k.id, "gacha");
      const tag = res.isNew
        ? `<span class="g-tag-new">NEW! はじめての カード！</span>`
        : res.starUp
          ? `<span class="g-tag-dup">★アップ！ いまは ★${App.stars(k.id)}</span>`
          : `<span class="g-tag-dup">もってた！ +XP</span>`;
      $("g-result").innerHTML = `
        <div class="rn">${k.name}</div>
        <div class="rt">${rar.label}・${k.title}</div>
        ${tag}`;
      App.speak(`${rar.label}！ ${k.name}！`);

      // めくれたカードをタップで詳細へ
      const fc = front.querySelector(".k-card");
      if (fc) fc.addEventListener("click", () => { SFX.tap(); App.openDetailById(k.id); });

      // コレクション表示を更新
      const owned = App.ownedCount();
      const pct = Math.round(owned / KAIJU_DATA.length * 100);
      const head = $("gacha-body").querySelector(".coll-head .c");
      if (head) head.textContent = `${owned} / ${KAIJU_DATA.length}（${pct}%）`;
      const fill = $("gacha-body").querySelector(".coll-fill");
      if (fill) fill.style.width = pct + "%";
      const collEl = $("g-coll");
      if (collEl) {
        collEl.innerHTML = KAIJU_DATA.map((x, i) => App.cardHTML(x, { lockUnowned: true, idx: i })).join("");
        bindCollGrid();
      }

      const left = gachaLeft();
      btn.disabled = left <= 0;
      btn.innerHTML = `${ic("sparkles")} ${left > 0 ? "もういっかい ひく！" : "また あした！"}`;
      gachaBusy = false;
    }, 750);
  }

  /* ============================================================
     ねんぴょう (時代ごと)
     ============================================================ */
  function openTimeline() {
    const gs = KAIJU_DATA.filter(k => k.type === "godzilla").sort((a, b) => a.year - b.year);
    const eras = [];
    gs.forEach(k => {
      let e = eras.find(x => x.name === k.era);
      if (!e) { e = { name: k.era, items: [] }; eras.push(e); }
      e.items.push(k);
    });
    $("timeline-body").innerHTML = eras.map(e => `
      <div class="tl-era"><span class="era-chip">${e.name}</span></div>
      <div class="tl-items">
        ${e.items.map(k => `
          <button class="tl-item" data-kid="${k.id}">
            <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy" onerror="this.style.display='none'">
            <span>
              <span class="tl-year">${k.year}ねん</span>
              <div class="tl-name">${k.name}</div>
              <div class="tl-sub">${k.fullName}</div>
            </span>
          </button>`).join("")}
      </div>`).join("");
    document.querySelectorAll("#timeline-body .tl-item").forEach(b =>
      b.addEventListener("click", () => { SFX.tap(); App.openDetailById(b.dataset.kid); }));
    App.show("screen-timeline");
  }

  /* ============================================================
     かんけいマップ
     ============================================================ */
  const FAMILY_GROUPS = [
    { name: "ゴジラ おやこ", rel: "ゴジラと こどもの ミニラ", members: ["showa-1954", "minilla", "final-wars"] },
    { name: "えいえんの ライバル", rel: "うちゅうから きた きんいろの りゅう", members: ["king-ghidorah", "showa-ghidorah", "heisei-ghidorah", "king-of-monsters"] },
    { name: "モスラ きょうだい", rel: "ひかりの モスラと やみの バトラ", members: ["mothra", "battra", "heisei-mothra"] },
    { name: "メカゴジラ シリーズ", rel: "ゴジラそっくりの ロボット", members: ["mechagodzilla", "showa-mechagodzilla", "heisei-mechagodzilla", "jet-jaguar"] },
    { name: "キングコングと ゴジラ", rel: "60ねん ごしの さいせん", members: ["kingkong", "showa-kingkong", "godzilla-vs-kong"] },
    { name: "ビオランテの ひみつ", rel: "ゴジラの ちからと ばらが あわさった", members: ["heisei-biollante", "biollante", "showa-1954"] },
    { name: "うちゅう かいじゅう", rel: "うちゅうから やってきた", members: ["space-godzilla", "heisei-spacegodzilla", "king-ghidorah", "orga", "gigan"] },
    { name: "むしの なかま", rel: "おおきな こんちゅうたち", members: ["megalon", "megaguirus", "meganulon", "kamacuras", "kumonga"] },
    { name: "うみの なかま", rel: "うみで くらす かいじゅう", members: ["ebirah", "manda", "titanosaurus", "hedorah"] },
    { name: "ゴジラの しんゆう", rel: "いっしょに たたかった なかま", members: ["anguirus", "rodan", "jet-jaguar", "minilla"] }
  ];

  function openFamily() {
    $("family-body").innerHTML = FAMILY_GROUPS.map(g => {
      const ms = g.members.map(id => KAIJU_DATA.find(k => k.id === id)).filter(Boolean);
      return `
        <div class="fam-group">
          <div class="fam-title">${g.name}</div>
          <div class="fam-rel">${g.rel}</div>
          <div class="fam-row">
            ${ms.map(k => `
              <button class="fam-m" data-kid="${k.id}">
                <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy" onerror="this.style.display='none'">
                <span>${k.name}</span>
              </button>`).join("")}
          </div>
        </div>`;
    }).join("");
    document.querySelectorAll("#family-body .fam-m").forEach(b =>
      b.addEventListener("click", () => { SFX.tap(); App.openDetailById(b.dataset.kid); }));
    App.show("screen-family");
  }

  /* ============================================================
     ランキング (トップ3ひょうしょうだい)
     ============================================================ */
  const RANK_TYPES = [
    { key: "height", label: "たかさ", val: k => `${k.height}m`, sort: (a, b) => b.height - a.height },
    { key: "weight", label: "おもさ", val: k => `${k.weight.toLocaleString()}t`, sort: (a, b) => b.weight - a.weight },
    { key: "total", label: "そうごう", val: k => `${k.power + k.speed + k.guard + k.special + k.size}pt`, sort: (a, b) => (b.power + b.speed + b.guard + b.special + b.size) - (a.power + a.speed + a.guard + a.special + a.size) },
    { key: "speed", label: "はやさ", val: k => `はやさ${k.speed}`, sort: (a, b) => b.speed - a.speed || b.power - a.power },
    { key: "old", label: "ふるい", val: k => `${k.year}ねん`, sort: (a, b) => a.year - b.year }
  ];
  let rankType = "height";

  function openRanking() {
    $("rank-chips").innerHTML = RANK_TYPES.map(t =>
      `<button class="chip ${t.key === rankType ? "active" : ""}" data-rk="${t.key}">${t.label}</button>`).join("");
    document.querySelectorAll("#rank-chips .chip").forEach(c => {
      c.addEventListener("click", () => {
        SFX.tap();
        rankType = c.dataset.rk;
        openRanking();
      });
    });
    const t = RANK_TYPES.find(x => x.key === rankType);
    const sorted = [...KAIJU_DATA].sort(t.sort);
    const [g1, g2, g3] = sorted;
    $("ranking-body").innerHTML = `
      <div class="podium">
        <div class="pd-col second" data-kid="${g2.id}">
          <img src="images/${g2.id}-1.jpg" alt="${g2.name}"><div class="pd-name">${g2.name}</div><div class="pd-val">${t.val(g2)}</div><div class="pd-base">2</div>
        </div>
        <div class="pd-col first" data-kid="${g1.id}">
          <img src="images/${g1.id}-1.jpg" alt="${g1.name}"><div class="pd-name">${g1.name}</div><div class="pd-val">${t.val(g1)}</div><div class="pd-base">1</div>
        </div>
        <div class="pd-col third" data-kid="${g3.id}">
          <img src="images/${g3.id}-1.jpg" alt="${g3.name}"><div class="pd-name">${g3.name}</div><div class="pd-val">${t.val(g3)}</div><div class="pd-base">3</div>
        </div>
      </div>
      <div class="rank-list">
        ${sorted.slice(3, 20).map((k, i) => `
          <button class="rank-row" data-kid="${k.id}">
            <span class="rank-no">${i + 4}</span>
            <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy" onerror="this.style.display='none'">
            <span class="rank-n">${k.name}</span>
            <span class="rank-v">${t.val(k)}</span>
          </button>`).join("")}
      </div>`;
    document.querySelectorAll("#ranking-body [data-kid]").forEach(el =>
      el.addEventListener("click", () => { SFX.tap(); App.openDetailById(el.dataset.kid); }));
    App.show("screen-ranking");
  }

  /* ============================================================
     サイズくらべ
     ============================================================ */
  let cmpId = "showa-1954";

  function openCompare() {
    renderCompare();
    App.show("screen-compare");
  }

  function renderCompare() {
    const k = KAIJU_DATA.find(x => x.id === cmpId) || KAIJU_DATA[0];
    const TOWER = 333;
    const maxH = Math.max(k.height, TOWER) * 1.12;
    const kaijuPct = k.height / maxH * 100;
    const towerPct = TOWER / maxH * 100;
    const childPct = Math.max(1.2 / maxH * 100, 0.9);
    const ratio = k.height / TOWER;
    const ratioText = ratio >= 1
      ? `とうきょうタワーより <b>${ratio.toFixed(1)}ばい</b> おおきい！`
      : `とうきょうタワーの <b>${Math.round(ratio * 100)}%</b> くらい`;

    $("compare-body").innerHTML = `
      <div class="cmp-arena">
        <div class="cmp-grid">
          <div class="cmp-col">
            <div class="cmp-shape" style="height:${kaijuPct}%">
              <img src="images/${k.id}-1.jpg" alt="${k.name}" onerror="this.style.display='none'">
              <span class="cmp-label">${k.height}m</span>
            </div>
            <div class="cmp-name">${k.name}</div>
          </div>
          <div class="cmp-col">
            <div class="cmp-shape" style="height:${towerPct}%;background:linear-gradient(180deg,#ff7a3c,#b83c14)">
              <span class="cmp-emoji">🗼</span>
              <span class="cmp-label">333m</span>
            </div>
            <div class="cmp-name">とうきょうタワー</div>
          </div>
          <div class="cmp-col">
            <div class="cmp-shape" style="height:${childPct}%;background:linear-gradient(180deg,#7f9cc9,#42546f)">
              <span class="cmp-label" style="top:-26px">1.2m</span>
            </div>
            <div class="cmp-name">5さいのこ</div>
          </div>
        </div>
        <div class="cmp-ratio">${ratioText}</div>
      </div>
      <div class="cmp-pick-label">くらべたい かいじゅうを えらぼう</div>
      <div class="cmp-picker">
        ${KAIJU_DATA.map(x => `
          <button class="cmp-pk ${x.id === k.id ? "active" : ""}" data-kid="${x.id}">
            <img src="images/${x.id}-1.jpg" alt="${x.name}" loading="lazy" onerror="this.style.display='none'">
            <span>${x.name}</span><small>${x.height}m</small>
          </button>`).join("")}
      </div>`;
    document.querySelectorAll("#compare-body .cmp-pk").forEach(b => {
      b.addEventListener("click", () => {
        SFX.tap();
        cmpId = b.dataset.kid;
        const keep = $("compare-body").scrollTop;
        renderCompare();
        $("compare-body").scrollTop = keep;
      });
    });
  }

  /* ================= 公開 ================= */
  window.Extras = { openGacha, gachaLeft, openTimeline, openFamily, openRanking, openCompare };
})();
