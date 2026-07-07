// ゴジラずかん extras - 新機能 v11
// パズル / タイムライン / ファミリーツリー / ランキング / きょうのゴジラ / 歩く効果音
(function() {

  // ===== きょうの ゴジラ（日付シード） =====
  function getTodaysGodzilla() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
    const godzillas = KAIJU_DATA.filter(k => k.type === "godzilla");
    return godzillas[seed % godzillas.length];
  }

  function renderDailyGodzillaCard() {
    const k = getTodaysGodzilla();
    const today = new Date();
    const monthDay = `${today.getMonth() + 1}/${today.getDate()}`;
    return `
      <button class="daily-card" data-target="daily-detail" data-id="${k.id}" style="background:linear-gradient(135deg,${k.color},${k.color}88);">
        <div class="daily-label">⭐ きょうの ゴジラ (${monthDay}) ⭐</div>
        <div class="daily-content">
          <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy" class="daily-img">
          <div class="daily-info">
            <div class="daily-name">${k.name}</div>
            <div class="daily-year">${k.year}ねん</div>
            <div class="daily-tap">タップで みる →</div>
          </div>
        </div>
      </button>
    `;
  }

  // ===== ジグソーパズル =====
  let puzzleState = null;

  function startPuzzle() {
    // ピース数選択画面
    document.getElementById("puzzle-content").innerHTML = `
      <div class="puzzle-menu">
        <h2 class="puzzle-menu-title">どのレベル？</h2>
        <div class="puzzle-levels">
          <button class="puzzle-level" data-level="4">
            <div class="puzzle-level-icon">🧩</div>
            <div class="puzzle-level-name">かんたん</div>
            <div class="puzzle-level-sub">4ピース</div>
          </button>
          <button class="puzzle-level" data-level="9">
            <div class="puzzle-level-icon">🧩🧩</div>
            <div class="puzzle-level-name">ふつう</div>
            <div class="puzzle-level-sub">9ピース</div>
          </button>
          <button class="puzzle-level" data-level="16">
            <div class="puzzle-level-icon">🧩🧩🧩</div>
            <div class="puzzle-level-name">むずかしい</div>
            <div class="puzzle-level-sub">16ピース</div>
          </button>
        </div>
      </div>
    `;
    document.querySelectorAll(".puzzle-level").forEach(b => {
      b.addEventListener("click", () => {
        const n = parseInt(b.dataset.level);
        const size = Math.sqrt(n); // 2, 3, 4
        // カラフルでピースが見分けやすい怪獣を選定
        const colorfulIds = [
          "showa-kingkong", "showa-mothra", "showa-ghidorah", "showa-hedora",
          "heisei-biollante", "heisei-mothra", "heisei-ghidorah", "heisei-spacegodzilla",
          "mothra", "king-ghidorah", "biollante", "kingkong", "ebirah", "manda",
          "jet-jaguar", "rodan", "godzilla-vs-kong"
        ];
        const pool = KAIJU_DATA.filter(k => colorfulIds.includes(k.id));
        const k = pool[Math.floor(Math.random() * pool.length)];
        setupPuzzle(k, size);
      });
    });
  }

  function setupPuzzle(k, size) {
    const pieces = [];
    for (let i = 0; i < size * size; i++) {
      pieces.push({ correctIdx: i, currentIdx: i });
    }
    // シャッフル（ランダム位置）
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i].currentIdx, pieces[j].currentIdx] = [pieces[j].currentIdx, pieces[i].currentIdx];
    }
    puzzleState = { kaiju: k, size, pieces, selected: null, moves: 0, startTime: Date.now() };
    renderPuzzle();
  }

  function renderPuzzle() {
    const { kaiju, size, pieces, moves } = puzzleState;
    const cellPct = 100 / size;
    const completed = pieces.every(p => p.correctIdx === p.currentIdx);
    const elapsed = Math.floor((Date.now() - puzzleState.startTime) / 1000);

    // 現在位置順で並べる
    const placed = new Array(size * size);
    pieces.forEach(p => { placed[p.currentIdx] = p; });

    const posStep = size > 1 ? 100 / (size - 1) : 0;
    document.getElementById("puzzle-content").innerHTML = `
      <div class="puzzle-info">
        <span>📋 ${kaiju.name}</span>
        <span>🔄 ${moves}かい</span>
        <span>⏱ ${elapsed}びょう</span>
      </div>
      <div class="puzzle-hint">
        <img src="images/${kaiju.id}-1.jpg" alt="hint" class="puzzle-hint-img" loading="lazy">
        <div class="puzzle-hint-text">↑ かんせいず ↑</div>
      </div>
      <div class="puzzle-board" style="--n:${size};">
        ${placed.map((p, i) => {
          const row = Math.floor(p.correctIdx / size);
          const col = p.correctIdx % size;
          const isRight = p.correctIdx === p.currentIdx;
          const isSelected = puzzleState.selected === i;
          return `
            <div class="puzzle-cell ${isRight ? 'right' : ''} ${isSelected ? 'selected' : ''}" data-idx="${i}" style="background-image:url('images/${kaiju.id}-1.jpg'); background-size:${size * 100}%; background-position: ${col * posStep}% ${row * posStep}%;">
              <span class="puzzle-piece-num">${p.correctIdx + 1}</span>
            </div>
          `;
        }).join("")}
      </div>
      ${completed ? `
        <div class="puzzle-done">
          🎉 やったね！ ${moves}かい・${elapsed}びょうで かんせい！ 🎉
          <button class="quiz-next" id="puzzle-restart">もういちど</button>
        </div>
      ` : `
        <div class="puzzle-help">💡 2まいタップで いれかえ</div>
      `}
    `;
    document.querySelectorAll(".puzzle-cell").forEach(c => {
      c.addEventListener("click", () => onPuzzleCell(parseInt(c.dataset.idx)));
    });
    const r = document.getElementById("puzzle-restart");
    if (r) r.addEventListener("click", startPuzzle);
  }

  function onPuzzleCell(idx) {
    if (puzzleState.selected === null) {
      puzzleState.selected = idx;
    } else if (puzzleState.selected === idx) {
      puzzleState.selected = null;
    } else {
      // 入れ替え
      const a = puzzleState.pieces.find(p => p.currentIdx === idx);
      const b = puzzleState.pieces.find(p => p.currentIdx === puzzleState.selected);
      [a.currentIdx, b.currentIdx] = [b.currentIdx, a.currentIdx];
      puzzleState.selected = null;
      puzzleState.moves++;
      if (puzzleState.pieces.every(p => p.correctIdx === p.currentIdx)) {
        if (window.Games) {
          window.Games.playFanfare(true);
          window.Games.showConfetti();
        }
        window.AppSpeak && window.AppSpeak(`やったね！ ${puzzleState.kaiju.name} かんせい！`);
      }
    }
    renderPuzzle();
  }

  // ===== タイムライン（年表） =====
  function renderTimeline() {
    const godzillas = KAIJU_DATA.filter(k => k.type === "godzilla").sort((a, b) => a.year - b.year);
    document.getElementById("timeline-content").innerHTML = `
      <div class="timeline-intro">🎬 ゴジラ70ねんの れきし 🎬</div>
      <div class="timeline-line">
        ${godzillas.map((k, i) => `
          <div class="timeline-item" data-idx="${KAIJU_DATA.findIndex(x => x.id === k.id)}">
            <div class="timeline-dot" style="background:${k.color};"></div>
            <div class="timeline-year">${k.year}</div>
            <div class="timeline-card" style="background:linear-gradient(135deg,${k.color}cc,${k.color}88);">
              <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy">
              <div class="timeline-name">${k.name}</div>
              <div class="timeline-era">${k.era}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
    document.querySelectorAll(".timeline-item").forEach(el => {
      el.addEventListener("click", () => window.openDetail(parseInt(el.dataset.idx)));
    });
  }

  // ===== ファミリーツリー（怪獣の関係図） =====
  function renderFamilyTree() {
    // 主要な家族・関係グループ
    const groups = [
      {
        name: "👨‍👦 ゴジラ親子",
        members: ["showa-1954", "minilla", "final-wars"],
        relation: "ゴジラ → ミニラ（こども）"
      },
      {
        name: "🦋 モスラ きょうだい",
        members: ["mothra", "battra"],
        relation: "モスラとバトラ（やみのモスラ）"
      },
      {
        name: "🐉 キングギドラ vs ゴジラ（永遠のライバル）",
        members: ["king-ghidorah", "showa-ghidorah", "heisei-ghidorah", "king-of-monsters"],
        relation: "宇宙からきた りゅう"
      },
      {
        name: "🤖 メカゴジラ シリーズ",
        members: ["mechagodzilla", "showa-mechagodzilla", "heisei-mechagodzilla"],
        relation: "ゴジラそっくりの ロボット"
      },
      {
        name: "🌸 ビオランテの ひみつ",
        members: ["heisei-biollante", "biollante", "showa-1954"],
        relation: "ゴジラの ばらから うまれた"
      },
      {
        name: "🦍 キングコング vs ゴジラ",
        members: ["kingkong", "showa-kingkong", "godzilla-vs-kong"],
        relation: "ゴリラと トカゲの しょうぶ"
      },
      {
        name: "👽 うちゅう怪獣",
        members: ["space-godzilla", "heisei-spacegodzilla", "king-ghidorah", "orga", "millennium-2000"],
        relation: "うちゅうから やってきた"
      },
      {
        name: "🦂 むしのなかま",
        members: ["megalon", "megaguirus", "meganulon", "kamacuras", "kumonga"],
        relation: "おっきな こんちゅう"
      },
      {
        name: "🌊 うみのなかま",
        members: ["ebirah", "manda", "titanosaurus", "hedorah"],
        relation: "うみで くらす"
      }
    ];
    document.getElementById("family-content").innerHTML = `
      <div class="family-intro">👪 みんなの かんけい 👪</div>
      ${groups.map(g => {
        const members = g.members.map(id => KAIJU_DATA.find(k => k.id === id)).filter(Boolean);
        return `
          <div class="family-group">
            <div class="family-group-title">${g.name}</div>
            <div class="family-group-relation">${g.relation}</div>
            <div class="family-group-members">
              ${members.map(k => {
                const idx = KAIJU_DATA.findIndex(x => x.id === k.id);
                return `
                  <button class="family-member" data-idx="${idx}" style="background:${k.color};">
                    <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy">
                    <span>${k.name}</span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        `;
      }).join("")}
    `;
    document.querySelectorAll(".family-member").forEach(el => {
      el.addEventListener("click", () => window.openDetail(parseInt(el.dataset.idx)));
    });
  }

  // ===== ランキング =====
  let rankingType = "height";

  function renderRanking() {
    let sorted, label, valueFn;
    switch (rankingType) {
      case "height":
        sorted = [...KAIJU_DATA].sort((a, b) => b.height - a.height);
        label = "🏆 みのたけ ランキング";
        valueFn = k => `${k.height}m`;
        break;
      case "weight":
        sorted = [...KAIJU_DATA].sort((a, b) => b.weight - a.weight);
        label = "⚖️ おもさ ランキング";
        valueFn = k => `${k.weight.toLocaleString()}t`;
        break;
      case "year":
        sorted = [...KAIJU_DATA].sort((a, b) => a.year - b.year);
        label = "📅 ふるい じゅん";
        valueFn = k => `${k.year}ねん`;
        break;
      case "power":
        sorted = [...KAIJU_DATA].sort((a, b) => {
          const pa = Math.sqrt(a.height * (a.weight / 1000));
          const pb = Math.sqrt(b.height * (b.weight / 1000));
          return pb - pa;
        });
        label = "💪 つよさ ランキング";
        valueFn = k => `💪${Math.round(Math.sqrt(k.height * (k.weight / 1000)))}`;
        break;
      case "viewed":
        const stamps = window.Games.loadStamps();
        sorted = [...KAIJU_DATA].sort((a, b) => (stamps[b.id] || 0) - (stamps[a.id] || 0));
        label = "⭐ よくみた じゅん";
        valueFn = k => `${stamps[k.id] || 0}かい`;
        break;
    }

    document.getElementById("ranking-content").innerHTML = `
      <div class="ranking-tabs">
        <button class="ranking-tab ${rankingType === 'height' ? 'active' : ''}" data-type="height">🏆 たかさ</button>
        <button class="ranking-tab ${rankingType === 'weight' ? 'active' : ''}" data-type="weight">⚖️ おもさ</button>
        <button class="ranking-tab ${rankingType === 'power' ? 'active' : ''}" data-type="power">💪 つよさ</button>
        <button class="ranking-tab ${rankingType === 'year' ? 'active' : ''}" data-type="year">📅 ふるい</button>
        <button class="ranking-tab ${rankingType === 'viewed' ? 'active' : ''}" data-type="viewed">⭐ よくみた</button>
      </div>
      <div class="ranking-title">${label}</div>
      <div class="ranking-list">
        ${sorted.slice(0, 30).map((k, i) => {
          const idx = KAIJU_DATA.findIndex(x => x.id === k.id);
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
          return `
            <button class="ranking-row" data-idx="${idx}" style="background:${k.color}33;border-left:6px solid ${k.color};">
              <div class="ranking-medal">${medal}</div>
              <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy">
              <div class="ranking-info">
                <div class="ranking-name">${k.name}</div>
                <div class="ranking-value">${valueFn(k)}</div>
              </div>
            </button>
          `;
        }).join("")}
      </div>
    `;
    document.querySelectorAll(".ranking-tab").forEach(t => {
      t.addEventListener("click", () => {
        rankingType = t.dataset.type;
        renderRanking();
      });
    });
    document.querySelectorAll(".ranking-row").forEach(r => {
      r.addEventListener("click", () => window.openDetail(parseInt(r.dataset.idx)));
    });
  }

  // ===== 歩く効果音 =====
  let sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(() => {});
    return sfxCtx;
  }

  function playStomp() {
    const c = getSfxCtx();
    if (!c) return;
    const now = c.currentTime + 0.02;
    // 重低音キック（ゴジラの足音風）
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
    g.gain.setValueAtTime(0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(g).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.5);
    // ノイズちょい足し（重み）
    const bufLen = c.sampleRate * 0.2;
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
    const noise = c.createBufferSource();
    const ng = c.createGain();
    noise.buffer = buf;
    ng.gain.setValueAtTime(0.3, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const nFilter = c.createBiquadFilter();
    nFilter.type = "lowpass";
    nFilter.frequency.value = 200;
    noise.connect(nFilter).connect(ng).connect(c.destination);
    noise.start(now);
  }

  // 公開
  window.Extras = {
    renderDailyGodzillaCard, getTodaysGodzilla,
    startPuzzle, renderTimeline, renderFamilyTree, renderRanking,
    playStomp
  };
})();
