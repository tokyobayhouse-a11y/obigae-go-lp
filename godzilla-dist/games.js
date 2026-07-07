// ゴジラずかん - ゲーム＆機能 v12 (なきごえクイズ・かいじゅうたたき追加)
(function() {
  const STAMP_KEY = "godzilla_zukan_stamps_v2"; // v2: count tracking
  const WHACK_BEST_KEY = "godzilla_zukan_whack_best_v1";
  const TOKYO_TOWER = 333;

  // ===== スタンプ管理（回数付き） =====
  function loadStamps() {
    try {
      let s = JSON.parse(localStorage.getItem(STAMP_KEY) || "{}");
      // 旧v1からのマイグレーション
      const old = JSON.parse(localStorage.getItem("godzilla_zukan_stamps_v1") || "{}");
      Object.keys(old).forEach(k => { if (!s[k]) s[k] = 1; });
      return s;
    } catch { return {}; }
  }
  function saveStamps(s) {
    try { localStorage.setItem(STAMP_KEY, JSON.stringify(s)); } catch {}
  }
  function addStamp(id) {
    const s = loadStamps();
    const newCell = !s[id];
    s[id] = (s[id] || 0) + 1;
    saveStamps(s);
    const tier = stampTier(s[id]);
    if (newCell) showStampToast("⭐ スタンプ ゲット！");
    else if (tier === "silver" && s[id] === 3) showStampToast("✨ シルバーに しんか！");
    else if (tier === "gold" && s[id] === 5) showStampToast("👑 ゴールドに しんか！");
  }
  function hasStamp(id) { return !!loadStamps()[id]; }
  function stampCount() { return Object.keys(loadStamps()).length; }
  function stampTier(count) {
    if (count >= 5) return "gold";
    if (count >= 3) return "silver";
    if (count >= 1) return "bronze";
    return "none";
  }
  function viewCount(id) { return loadStamps()[id] || 0; }

  function showStampToast(text) {
    const t = document.createElement("div");
    t.className = "stamp-toast";
    t.innerHTML = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 1800);
  }

  // ===== スタンプ帳画面（ティア対応） =====
  function renderStamps() {
    const stamps = loadStamps();
    const total = KAIJU_DATA.length;
    const got = Object.keys(stamps).length;
    const pct = Math.round((got / total) * 100);
    const golds = Object.values(stamps).filter(v => v >= 5).length;
    const silvers = Object.values(stamps).filter(v => v >= 3 && v < 5).length;

    const grid = KAIJU_DATA.map(k => {
      const cnt = stamps[k.id] || 0;
      const tier = stampTier(cnt);
      return `
        <div class="stamp-cell ${tier}" data-id="${k.id}">
          ${cnt > 0
            ? `<img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy">`
            : `<div class="stamp-q">？</div>`}
          ${cnt >= 5 ? `<div class="stamp-crown">👑</div>` : cnt >= 3 ? `<div class="stamp-crown">✨</div>` : ""}
          <div class="stamp-name">${cnt > 0 ? k.name : "？？？"}</div>
          ${cnt > 0 ? `<div class="stamp-count">${cnt}かい</div>` : ""}
        </div>
      `;
    }).join("");

    document.getElementById("stamps-content").innerHTML = `
      <div class="stamps-header">
        <div class="stamps-progress">
          <div class="stamps-progress-bar"><div class="stamps-progress-fill" style="width:${pct}%"></div></div>
          <div class="stamps-progress-text">${got} / ${total}</div>
        </div>
        <div class="stamps-tiers">
          <span class="tier-pill bronze">🥉 ${got - silvers - golds}</span>
          <span class="tier-pill silver">✨ ${silvers}</span>
          <span class="tier-pill gold">👑 ${golds}</span>
        </div>
        <div class="stamps-help">💡 同じ怪獣を3回見るとシルバー、5回でゴールド</div>
        ${got === total ? `<div class="stamps-done">🎉 ぜんぶ あつめた！ かんぺき！ 🎉</div>` : ""}
      </div>
      <div class="stamps-grid">${grid}</div>
    `;

    document.querySelectorAll(".stamp-cell:not(.none)").forEach(el => {
      el.addEventListener("click", () => {
        const idx = KAIJU_DATA.findIndex(k => k.id === el.dataset.id);
        if (idx >= 0) window.openDetail(idx);
      });
    });
  }

  // ===== サイズくらべ（前回のまま - タップ式対決） =====
  let compareState = { selectedId: "showa-1954" };

  function renderCompare() {
    const k = KAIJU_DATA.find(x => x.id === compareState.selectedId) || KAIJU_DATA[0];
    const maxH = Math.max(k.height, TOKYO_TOWER) * 1.15;
    const towerPct = (TOKYO_TOWER / maxH) * 100;
    const kaijuPct = (k.height / maxH) * 100;
    const ratio = (k.height / TOKYO_TOWER);
    let ratioText = ratio >= 1
      ? `とうきょうタワーより<br><b>${ratio.toFixed(1)}ばい おおきい！</b>`
      : `とうきょうタワーの<br><b>${Math.round(ratio * 100)}% くらい</b>`;
    const personPct = Math.max((1.2 / maxH) * 100, 0.5);

    document.getElementById("compare-content").innerHTML = `
      <div class="compare-arena">
        <div class="compare-grid">
          <div class="compare-col" style="height:340px;">
            <div class="compare-shape kaiju" style="height:${kaijuPct}%; background:linear-gradient(180deg,${k.color},${k.color}99);">
              <img src="images/${k.id}-1.jpg" alt="${k.name}" class="compare-shape-img" loading="lazy" onerror="this.style.display='none'">
              <div class="compare-shape-label">${k.height}m</div>
            </div>
            <div class="compare-col-name">${k.name}</div>
          </div>
          <div class="compare-col" style="height:340px;">
            <div class="compare-shape tower" style="height:${towerPct}%; background:linear-gradient(180deg,#ff6600,#cc3300);">
              <div class="compare-shape-emoji">🗼</div>
              <div class="compare-shape-label">333m</div>
            </div>
            <div class="compare-col-name">とうきょうタワー</div>
          </div>
          <div class="compare-col" style="height:340px;">
            <div class="compare-shape person" style="height:${personPct}%; background:linear-gradient(180deg,#88aabb,#445566);">
              <div class="compare-shape-emoji">🧒</div>
              <div class="compare-shape-label">1.2m</div>
            </div>
            <div class="compare-col-name">5さいのこ</div>
          </div>
        </div>
        <div class="compare-ratio">${ratioText}</div>
      </div>
      <div class="compare-picker-label">⬇ えらんで くらべよう ⬇</div>
      <div class="compare-picker" id="compare-picker">
        ${KAIJU_DATA.map(x => `
          <button class="compare-pick ${x.id === k.id ? 'active' : ''}" data-id="${x.id}" style="background:${x.color}">
            <img src="images/${x.id}-1.jpg" alt="${x.name}" loading="lazy" onerror="this.style.display='none'">
            <span>${x.name}<br><small>${x.height}m</small></span>
          </button>
        `).join("")}
      </div>
    `;

    document.querySelectorAll(".compare-pick").forEach(btn => {
      btn.addEventListener("click", () => {
        compareState.selectedId = btn.dataset.id;
        renderCompare();
      });
    });
  }

  // ===== シルエットクイズ（難易度＋2人対戦対応） =====
  let quizState = null;

  function startQuiz(opts) {
    opts = opts || {};
    quizState = {
      mode: opts.mode || "single",  // "single" or "2p"
      difficulty: opts.difficulty || "normal", // "easy" / "normal" / "hard"
      scoreP1: 0, scoreP2: 0, total: 0,
      currentPlayer: 1
    };
    nextQuiz();
  }

  function getQuizPool() {
    if (quizState.difficulty === "easy") {
      // 有名どころ12体のみ
      const popularIds = ["showa-1954","showa-mechagodzilla","showa-kingkong","showa-ghidorah","heisei-1984","burning-godzilla","shin-godzilla","godzilla-vs-kong","godzilla-minus-one","mothra","king-ghidorah","mechagodzilla"];
      return KAIJU_DATA.filter(k => popularIds.includes(k.id));
    }
    return KAIJU_DATA;
  }

  function nextQuiz() {
    const pool = getQuizPool();
    const correct = pool[Math.floor(Math.random() * pool.length)];
    const wrong = [];
    const optCount = quizState.difficulty === "hard" ? 5 : 3;
    while (wrong.length < optCount) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (c.id !== correct.id && !wrong.find(w => w.id === c.id)) wrong.push(c);
    }
    const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
    quizState.current = { correct, options, revealed: false };
    renderQuiz();
    setTimeout(() => {
      if (quizState.mode === "2p") {
        window.AppSpeak && window.AppSpeak(`プレイヤー${quizState.currentPlayer}の ばん！ これだーれだ？`);
      } else {
        window.AppSpeak && window.AppSpeak("これだーれだ？");
      }
    }, 300);
  }

  function renderQuiz() {
    const { correct, options, revealed } = quizState.current;
    const blurClass = quizState.difficulty === "hard" ? "silhouette-hard" : "silhouette";
    let scoreHTML;
    if (quizState.mode === "2p") {
      scoreHTML = `<span class="p1-score ${quizState.currentPlayer === 1 ? 'active' : ''}">👦 ${quizState.scoreP1}</span> <span class="p2-score ${quizState.currentPlayer === 2 ? 'active' : ''}">👶 ${quizState.scoreP2}</span>`;
    } else {
      scoreHTML = `${quizState.scoreP1} / ${quizState.total}`;
    }
    document.getElementById("quiz-score").innerHTML = scoreHTML;

    const turnLabel = quizState.mode === "2p"
      ? `<div class="quiz-turn">プレイヤー${quizState.currentPlayer}の ばん！</div>`
      : "";

    document.getElementById("quiz-content").innerHTML = `
      ${turnLabel}
      <div class="quiz-question">これ だーれだ？</div>
      <div class="quiz-image-wrap" style="background: ${revealed ? correct.color : 'linear-gradient(180deg, #ffd700, #ff8800)'}">
        <img class="quiz-img ${revealed ? "" : blurClass}" src="images/${correct.id}-1.jpg" alt="?">
      </div>
      <div class="quiz-options">
        ${options.map(o => `<button class="quiz-option" data-id="${o.id}">${o.name}</button>`).join("")}
      </div>
      <div id="quiz-next-wrap"></div>
    `;
    document.querySelectorAll(".quiz-option").forEach(b => {
      b.addEventListener("click", () => handleQuizAnswer(b));
    });
  }

  function handleQuizAnswer(btn) {
    if (quizState.current.revealed) return;
    const id = btn.dataset.id;
    const { correct } = quizState.current;
    quizState.total++;
    quizState.current.revealed = true;
    document.querySelector(".quiz-img").className = "quiz-img";
    document.querySelectorAll(".quiz-option").forEach(b => b.disabled = true);

    if (id === correct.id) {
      btn.classList.add("correct");
      if (quizState.mode === "2p") {
        if (quizState.currentPlayer === 1) quizState.scoreP1++;
        else quizState.scoreP2++;
      } else {
        quizState.scoreP1++;
      }
      playFanfare(true);
      showConfetti();
      const phrases = ["せいかい！すごい！", "やったね！", "せいかい！てんさい！", "ピンポーン！"];
      window.AppSpeak && window.AppSpeak(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      btn.classList.add("wrong");
      document.querySelectorAll(".quiz-option").forEach(b => {
        if (b.dataset.id === correct.id) b.classList.add("correct");
      });
      playFanfare(false);
      shakeScreen("screen-quiz");
      window.AppSpeak && window.AppSpeak(`ざんねん、こたえは ${correct.name}！`);
    }

    // スコア更新
    if (quizState.mode === "2p") {
      document.getElementById("quiz-score").innerHTML =
        `<span class="p1-score">👦 ${quizState.scoreP1}</span> <span class="p2-score">👶 ${quizState.scoreP2}</span>`;
    } else {
      document.getElementById("quiz-score").innerHTML = `${quizState.scoreP1} / ${quizState.total}`;
    }

    document.getElementById("quiz-next-wrap").innerHTML =
      `<button class="quiz-next" id="quiz-next-btn">${quizState.mode === "2p" ? "つぎの ひとへ →" : "つぎの もんだい →"}</button>`;
    document.getElementById("quiz-next-btn").addEventListener("click", () => {
      if (quizState.mode === "2p") quizState.currentPlayer = quizState.currentPlayer === 1 ? 2 : 1;
      nextQuiz();
    });
  }

  // ===== メモリーゲーム（2人対戦対応） =====
  let memState = null;
  function startMemory(opts) {
    opts = opts || {};
    const mode = opts.mode || "single";
    const shuffled = [...KAIJU_DATA].sort(() => Math.random() - 0.5).slice(0, 8);
    const cards = [];
    shuffled.forEach((k, i) => {
      cards.push({ id: i + "a", kaiju: k });
      cards.push({ id: i + "b", kaiju: k });
    });
    cards.sort(() => Math.random() - 0.5);
    memState = {
      mode, cards, flipped: [], matched: new Set(), moves: 0, locked: false,
      currentPlayer: 1, scoreP1: 0, scoreP2: 0
    };
    renderMemory();
  }

  function renderMemory() {
    const { cards, matched, mode } = memState;
    let scoreHTML;
    if (mode === "2p") {
      const winner = matched.size === 16
        ? (memState.scoreP1 > memState.scoreP2 ? "👦 のかち！" : memState.scoreP2 > memState.scoreP1 ? "👶 のかち！" : "ひきわけ！")
        : "";
      scoreHTML = `<span class="${memState.currentPlayer === 1 ? 'active' : ''}">👦${memState.scoreP1}</span> vs <span class="${memState.currentPlayer === 2 ? 'active' : ''}">👶${memState.scoreP2}</span> ${winner}`;
    } else {
      scoreHTML = `あわせた: ${matched.size / 2} / 8 ・ ${memState.moves}かい`;
    }
    document.getElementById("memory-score").innerHTML = scoreHTML;

    const turnLabel = mode === "2p" && matched.size < 16
      ? `<div class="mem-turn">プレイヤー${memState.currentPlayer}の ばん</div>` : "";

    document.getElementById("memory-content").innerHTML = `
      ${turnLabel}
      <div class="mem-grid">
        ${cards.map((c, i) => {
          const isFlipped = memState.flipped.includes(i) || matched.has(c.kaiju.id);
          const isMatched = matched.has(c.kaiju.id);
          return `
            <div class="mem-card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}" data-idx="${i}">
              <div class="mem-back" style="background: ${c.kaiju.color}">
                <img src="images/${c.kaiju.id}-1.jpg" alt="${c.kaiju.name}" loading="lazy">
              </div>
              <div class="mem-front">?</div>
            </div>
          `;
        }).join("")}
      </div>
      ${matched.size === 16 ? `<div class="mem-done">🎉 ぜんぶ そろえた！ 🎉 <br><button class="quiz-next" id="mem-restart">もういちど</button></div>` : ""}
    `;
    document.querySelectorAll(".mem-card").forEach(card => {
      card.addEventListener("click", () => onMemCard(parseInt(card.dataset.idx)));
    });
    const r = document.getElementById("mem-restart");
    if (r) r.addEventListener("click", () => startMemory({ mode }));
  }

  function onMemCard(idx) {
    if (memState.locked) return;
    const { cards, flipped, matched } = memState;
    if (matched.has(cards[idx].kaiju.id) || flipped.includes(idx)) return;
    flipped.push(idx);
    renderMemory();

    if (flipped.length === 2) {
      memState.moves++;
      const a = cards[flipped[0]].kaiju;
      const b = cards[flipped[1]].kaiju;
      if (a.id === b.id) {
        matched.add(a.id);
        memState.flipped = [];
        if (memState.mode === "2p") {
          if (memState.currentPlayer === 1) memState.scoreP1++;
          else memState.scoreP2++;
        }
        playFanfare(true);
        // 2人モードでも同じプレイヤーが続ける
        setTimeout(renderMemory, 200);
      } else {
        memState.locked = true;
        setTimeout(() => {
          memState.flipped = [];
          memState.locked = false;
          if (memState.mode === "2p") {
            memState.currentPlayer = memState.currentPlayer === 1 ? 2 : 1;
          }
          renderMemory();
        }, 900);
      }
    }
  }

  // ===== 怪獣バトル（2人対戦対応） =====
  let battleState = null;
  function startBattle(opts) {
    opts = opts || {};
    battleState = {
      mode: opts.mode || "single", // "single" or "2p"
      step: "p1pick",  // p1pick → (p2pick) → fight → result
      p1: null, p2: null, result: null,
      winsP1: 0, winsP2: 0
    };
    renderBattle();
  }

  function renderBattle() {
    const s = battleState;
    if (s.step === "p1pick") {
      const title = s.mode === "2p" ? "👦 プレイヤー1: かいじゅう えらぼう！" : "じぶんの かいじゅうを えらぼう！";
      renderBattlePicker(title, "p1");
    } else if (s.step === "p2pick") {
      renderBattlePicker("👶 プレイヤー2: かいじゅう えらぼう！", "p2");
    } else if (s.step === "fight" || s.step === "result") {
      renderBattleArena();
    }
  }

  function renderBattlePicker(title, target) {
    document.getElementById("battle-content").innerHTML = `
      <div class="battle-step">
        <h2 class="battle-title">${title}</h2>
        ${battleState.mode === "2p" ? `<div class="battle-wins">👦 ${battleState.winsP1}しょう vs ${battleState.winsP2}しょう 👶</div>` : ""}
        <div class="battle-grid">
          ${KAIJU_DATA.map((k, i) => `
            <button class="battle-pick" data-idx="${i}" style="background:${k.color}">
              <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy">
              <span>${k.name}</span>
              <small>💪${calcPower(k)}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
    document.querySelectorAll(".battle-pick").forEach(b => {
      b.addEventListener("click", () => {
        const picked = KAIJU_DATA[parseInt(b.dataset.idx)];
        if (target === "p1") {
          battleState.p1 = picked;
          if (battleState.mode === "2p") {
            battleState.step = "p2pick";
            renderBattle();
          } else {
            // ランダム敵
            let e;
            do { e = KAIJU_DATA[Math.floor(Math.random() * KAIJU_DATA.length)]; }
            while (e.id === picked.id);
            battleState.p2 = e;
            battleState.step = "fight";
            doBattle();
          }
        } else {
          battleState.p2 = picked;
          battleState.step = "fight";
          doBattle();
        }
      });
    });
  }

  function renderBattleArena() {
    const s = battleState;
    const p1Win = s.result?.winner === "p1";
    const p2Win = s.result?.winner === "p2";
    const labelP1 = s.mode === "2p" ? "👦 プレイヤー1" : "じぶん";
    const labelP2 = s.mode === "2p" ? "👶 プレイヤー2" : "あいて";
    const resultText = !s.result ? "" :
      s.result.winner === "p1" ? `🏆 ${labelP1}の かち！` :
      s.result.winner === "p2" ? `🏆 ${labelP2}の かち！` :
      "🤝 ひきわけ";
    document.getElementById("battle-content").innerHTML = `
      <div class="battle-arena">
        <div class="battle-side">
          <div class="battle-player-label">${labelP1}</div>
          <img src="images/${s.p1.id}-1.jpg" alt="${s.p1.name}" class="battle-img ${p1Win ? "win" : p2Win ? "lose" : ""}">
          <div class="battle-name">${s.p1.name}</div>
          <div class="battle-stat">💪 ${calcPower(s.p1)}</div>
        </div>
        <div class="battle-vs">
          ${s.result ? `<div class="battle-result">${resultText}</div>` : "VS"}
        </div>
        <div class="battle-side">
          <div class="battle-player-label">${labelP2}</div>
          <img src="images/${s.p2.id}-1.jpg" alt="${s.p2.name}" class="battle-img ${p2Win ? "win" : p1Win ? "lose" : ""}">
          <div class="battle-name">${s.p2.name}</div>
          <div class="battle-stat">💪 ${calcPower(s.p2)}</div>
        </div>
      </div>
      ${s.result ? `
        ${s.mode === "2p" ? `<div class="battle-wins-big">👦 ${s.winsP1} vs ${s.winsP2} 👶</div>` : ""}
        <button class="battle-again" id="battle-again-btn">もういちど！</button>
      ` : ""}
    `;
    const again = document.getElementById("battle-again-btn");
    if (again) again.addEventListener("click", () => {
      const keepStats = { mode: s.mode, winsP1: s.winsP1, winsP2: s.winsP2 };
      startBattle(keepStats);
      battleState.winsP1 = keepStats.winsP1;
      battleState.winsP2 = keepStats.winsP2;
      renderBattle();
    });
  }

  function calcPower(k) {
    const base = Math.sqrt(k.height * (k.weight / 1000));
    return Math.round(base);
  }

  function doBattle() {
    renderBattle();
    setTimeout(() => {
      const { p1, p2 } = battleState;
      const p1Power = calcPower(p1) + Math.random() * 50;
      const p2Power = calcPower(p2) + Math.random() * 50;
      let winner = "draw";
      if (p1Power > p2Power + 5) winner = "p1";
      else if (p2Power > p1Power + 5) winner = "p2";
      battleState.result = { winner };
      if (winner === "p1") battleState.winsP1++;
      else if (winner === "p2") battleState.winsP2++;
      // 咆哮（ゴジラ系のみ）
      if (window.Roar) {
        if (p1.type === "godzilla") window.Roar.play(p1.roar);
        else if (p2.type === "godzilla") setTimeout(() => window.Roar.play(p2.roar), 800);
      }
      setTimeout(() => {
        renderBattleArena();
        if (window.AppSpeak) {
          if (winner === "p1") window.AppSpeak(`${p1.name}の かち！`);
          else if (winner === "p2") window.AppSpeak(`${p2.name}の かち！`);
          else window.AppSpeak("ひきわけ！");
        }
      }, 1500);
    }, 800);
  }

  // ===== なきごえクイズ =====
  let rqState = null;

  function startRoarQuiz() {
    rqState = { score: 0, total: 0, current: null };
    nextRoarQuiz();
  }

  function pickRoarQuizSet() {
    const pool = KAIJU_DATA;
    const correct = pool[Math.floor(Math.random() * pool.length)];
    // 同じ鳴き声タイプ同士は聞き分けられないので、選択肢はタイプが全部違う組み合わせにする
    const usedTypes = new Set([correct.roar]);
    const usedIds = new Set([correct.id]);
    const wrong = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (const k of shuffled) {
      if (wrong.length >= 3) break;
      if (usedIds.has(k.id) || usedTypes.has(k.roar)) continue;
      wrong.push(k);
      usedTypes.add(k.roar);
      usedIds.add(k.id);
    }
    const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
    return { correct, options, revealed: false };
  }

  function playRoarQuizSound() {
    if (!rqState || !rqState.current) return;
    if (window.BGM) window.BGM.duck();
    const dur = window.Roar && window.Roar.playType ? window.Roar.playType(rqState.current.correct.roar) : 0;
    setTimeout(() => { if (window.BGM) window.BGM.unduck(); }, ((dur || 1.5) * 1000) + 400);
  }

  function nextRoarQuiz() {
    rqState.current = pickRoarQuizSet();
    renderRoarQuiz();
    setTimeout(() => {
      window.AppSpeak && window.AppSpeak("だれの なきごえかな？");
      setTimeout(playRoarQuizSound, 1700);
    }, 300);
  }

  function renderRoarQuiz() {
    const { options, revealed, correct } = rqState.current;
    document.getElementById("roarquiz-score").textContent = `${rqState.score} / ${rqState.total}`;
    document.getElementById("roarquiz-content").innerHTML = `
      <div class="quiz-question">だれの なきごえ？</div>
      <button class="rq-listen" id="rq-listen">
        <span class="rq-listen-icon">🔊</span>
        <span>なきごえを きく</span>
      </button>
      <div class="rq-options">
        ${options.map(o => `
          <button class="rq-option ${revealed && o.id === correct.id ? 'correct' : ''}" data-id="${o.id}" style="background:${o.color}">
            <img src="images/${o.id}-1.jpg" alt="${o.name}" loading="lazy" onerror="this.style.display='none'">
            <span>${o.name}</span>
          </button>
        `).join("")}
      </div>
      <div id="roarquiz-next-wrap"></div>
    `;
    document.getElementById("rq-listen").addEventListener("click", playRoarQuizSound);
    document.querySelectorAll(".rq-option").forEach(b => {
      b.addEventListener("click", () => handleRoarQuizAnswer(b));
    });
  }

  function handleRoarQuizAnswer(btn) {
    if (rqState.current.revealed) return;
    rqState.current.revealed = true;
    rqState.total++;
    const { correct } = rqState.current;
    const id = btn.dataset.id;
    document.querySelectorAll(".rq-option").forEach(b => b.disabled = true);

    if (id === correct.id) {
      btn.classList.add("correct");
      rqState.score++;
      playFanfare(true);
      showConfetti();
      const phrases = ["せいかい！いいみみ！", "だいせいかい！", "すごい！きこえてたね！", "ピンポーン！"];
      window.AppSpeak && window.AppSpeak(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      btn.classList.add("wrong");
      document.querySelectorAll(".rq-option").forEach(b => {
        if (b.dataset.id === correct.id) b.classList.add("correct");
      });
      playFanfare(false);
      shakeScreen("screen-roarquiz");
      window.AppSpeak && window.AppSpeak(`ざんねん、こたえは ${correct.name}！`);
    }
    document.getElementById("roarquiz-score").textContent = `${rqState.score} / ${rqState.total}`;
    document.getElementById("roarquiz-next-wrap").innerHTML =
      `<button class="quiz-next" id="roarquiz-next-btn">つぎの もんだい →</button>`;
    document.getElementById("roarquiz-next-btn").addEventListener("click", nextRoarQuiz);
  }

  // ===== かいじゅうたたき（もぐらたたき） =====
  const WHACK_TIME = 30;
  let whackState = null;

  function loadWhackBest() {
    try { return parseInt(localStorage.getItem(WHACK_BEST_KEY) || "0", 10) || 0; } catch { return 0; }
  }
  function saveWhackBest(v) {
    try { localStorage.setItem(WHACK_BEST_KEY, String(v)); } catch {}
  }

  function stopWhackTimers() {
    if (!whackState) return;
    if (whackState.timerId) clearInterval(whackState.timerId);
    if (whackState.popTimerId) clearTimeout(whackState.popTimerId);
    whackState.timerId = null;
    whackState.popTimerId = null;
    whackState.running = false;
  }

  function startWhack() {
    stopWhackTimers();
    whackState = { score: 0, timeLeft: WHACK_TIME, running: false, timerId: null, popTimerId: null, activeHole: -1 };
    // 戻るボタンでタイマーを確実に止める（画面遷移自体は共通ハンドラが行う）
    const backBtn = document.querySelector("#screen-whack .back-btn");
    if (backBtn) backBtn.onclick = stopWhackTimers;
    renderWhackIntro();
  }

  function renderWhackIntro() {
    const best = loadWhackBest();
    document.getElementById("whack-content").innerHTML = `
      <div class="whack-intro">
        <div class="whack-intro-title">🔨 かいじゅうたたき！</div>
        <div class="whack-intro-rules">
          <div class="whack-rule"><span class="whack-rule-icon">👾</span> かいじゅうを タップ！ <b>+1てん</b></div>
          <div class="whack-rule minilla"><img src="images/minilla-1.jpg" alt="ミニラ"> ミニラは たたいちゃダメ！ <b>-2てん</b></div>
          <div class="whack-rule"><span class="whack-rule-icon">⏱</span> ${WHACK_TIME}びょうで なんてん とれるかな？</div>
        </div>
        ${best > 0 ? `<div class="whack-best">👑 さいこうきろく: ${best}てん</div>` : ""}
        <button class="big-action-btn p2" id="whack-start-btn">
          <span class="action-emoji">🔨</span><span>スタート！</span>
        </button>
      </div>
    `;
    document.getElementById("whack-start-btn").addEventListener("click", runWhack);
  }

  function runWhack() {
    whackState.score = 0;
    whackState.timeLeft = WHACK_TIME;
    whackState.running = true;
    whackState.startTime = Date.now();

    document.getElementById("whack-content").innerHTML = `
      <div class="whack-hud">
        <div class="whack-hud-box">とくてん<br><b id="whack-score">0</b></div>
        <div class="whack-hud-box">のこり<br><b id="whack-time">${WHACK_TIME}</b></div>
      </div>
      <div class="whack-board">
        ${Array.from({ length: 9 }, (_, i) => `
          <div class="whack-hole" data-hole="${i}"><div class="whack-pop" id="whack-pop-${i}"></div></div>
        `).join("")}
      </div>
      <div class="whack-tip">ミニラは たたかないでね！</div>
    `;

    document.querySelectorAll(".whack-hole").forEach(h => {
      h.addEventListener("pointerdown", () => onWhackHole(parseInt(h.dataset.hole)));
    });

    whackState.timerId = setInterval(() => {
      whackState.timeLeft--;
      const t = document.getElementById("whack-time");
      if (t) t.textContent = whackState.timeLeft;
      if (whackState.timeLeft <= 0) endWhack();
    }, 1000);

    window.AppSpeak && window.AppSpeak("よーい、スタート！");
    schedulePop(900);
  }

  function popInterval() {
    // 経過とともにテンポアップ（900ms → 450ms）
    const elapsed = (Date.now() - whackState.startTime) / 1000;
    return Math.max(450, 900 - elapsed * 15);
  }

  function schedulePop(delay) {
    if (!whackState.running) return;
    whackState.popTimerId = setTimeout(() => {
      if (!whackState.running) return;
      showWhackKaiju();
      schedulePop(popInterval());
    }, delay);
  }

  function showWhackKaiju() {
    // 前のを引っ込める
    hideWhackKaiju();
    let hole;
    do { hole = Math.floor(Math.random() * 9); } while (hole === whackState.lastHole);
    whackState.lastHole = hole;
    whackState.activeHole = hole;

    const isMinilla = Math.random() < 0.22;
    let k;
    if (isMinilla) {
      k = KAIJU_DATA.find(x => x.id === "minilla");
    } else {
      do { k = KAIJU_DATA[Math.floor(Math.random() * KAIJU_DATA.length)]; } while (k.id === "minilla");
    }
    whackState.activeKaiju = k;
    whackState.hit = false;

    const pop = document.getElementById(`whack-pop-${hole}`);
    if (pop) {
      pop.innerHTML = `<img src="images/${k.id}-1.jpg" alt="${k.name}" draggable="false">`;
      pop.classList.add("up");
      pop.classList.toggle("is-minilla", k.id === "minilla");
    }
  }

  function hideWhackKaiju() {
    if (whackState.activeHole < 0) return;
    const pop = document.getElementById(`whack-pop-${whackState.activeHole}`);
    if (pop) { pop.classList.remove("up", "is-minilla", "bonked"); pop.innerHTML = ""; }
    whackState.activeHole = -1;
    whackState.activeKaiju = null;
  }

  function onWhackHole(hole) {
    if (!whackState.running || whackState.hit) return;
    if (hole !== whackState.activeHole || !whackState.activeKaiju) return;
    whackState.hit = true;
    const k = whackState.activeKaiju;
    const pop = document.getElementById(`whack-pop-${hole}`);
    if (pop) pop.classList.add("bonked");

    if (k.id === "minilla") {
      whackState.score = Math.max(0, whackState.score - 2);
      playWhackSound(false);
      showWhackFloat(hole, "-2", true);
    } else {
      whackState.score++;
      playWhackSound(true);
      showWhackFloat(hole, "+1", false);
    }
    const s = document.getElementById("whack-score");
    if (s) s.textContent = whackState.score;
    // すぐ次を出してテンポよく
    setTimeout(hideWhackKaiju, 180);
  }

  function showWhackFloat(hole, text, bad) {
    const holeEl = document.querySelector(`.whack-hole[data-hole="${hole}"]`);
    if (!holeEl) return;
    const f = document.createElement("div");
    f.className = "whack-float" + (bad ? " bad" : "");
    f.textContent = text;
    holeEl.appendChild(f);
    setTimeout(() => f.remove(), 700);
  }

  function playWhackSound(good) {
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      if (c.state === "suspended") c.resume();
      const now = c.currentTime + 0.01;
      const o = c.createOscillator();
      const g = c.createGain();
      if (good) {
        o.type = "sine";
        o.frequency.setValueAtTime(700, now);
        o.frequency.exponentialRampToValueAtTime(1300, now + 0.09);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        o.start(now); o.stop(now + 0.16);
      } else {
        o.type = "sawtooth";
        o.frequency.setValueAtTime(220, now);
        o.frequency.exponentialRampToValueAtTime(90, now + 0.25);
        g.gain.setValueAtTime(0.28, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.start(now); o.stop(now + 0.32);
      }
      o.connect(g).connect(c.destination);
    } catch (e) {}
  }

  function endWhack() {
    stopWhackTimers();
    hideWhackKaiju();
    const score = whackState.score;
    const best = loadWhackBest();
    const isNewBest = score > best;
    if (isNewBest) saveWhackBest(score);
    if (isNewBest) showConfetti();
    playFanfare(true);
    window.AppSpeak && window.AppSpeak(isNewBest ? `おしまい！ ${score}てん！ しんきろく、おめでとう！` : `おしまい！ ${score}てん！`);

    document.getElementById("whack-content").innerHTML = `
      <div class="whack-result">
        <div class="whack-result-title">おしまい！</div>
        <div class="whack-result-score">${score}<small>てん</small></div>
        ${isNewBest
          ? `<div class="whack-result-best new">🎉 しんきろく！ 🎉</div>`
          : `<div class="whack-result-best">👑 さいこうきろく: ${Math.max(best, score)}てん</div>`}
        <button class="quiz-next" id="whack-retry-btn">もういちど！</button>
      </div>
    `;
    document.getElementById("whack-retry-btn").addEventListener("click", () => { startWhack(); });
  }

  // ===== エフェクト関数（共通） =====
  function playFanfare(correct) {
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      if (c.state === "suspended") c.resume();
      const now = c.currentTime + 0.02;
      if (correct) {
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = "triangle";
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, now + i * 0.1);
          g.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
          o.connect(g).connect(c.destination);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.35);
        });
      } else {
        const notes = [400, 300, 200];
        notes.forEach((f, i) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = "sawtooth";
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, now + i * 0.18);
          g.gain.linearRampToValueAtTime(0.25, now + i * 0.18 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.25);
          o.connect(g).connect(c.destination);
          o.start(now + i * 0.18);
          o.stop(now + i * 0.18 + 0.3);
        });
      }
    } catch (e) {}
  }

  function showConfetti() {
    const emojis = ["🎉", "⭐", "✨", "🎊", "💫", "🏆"];
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);
    for (let i = 0; i < 30; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      c.style.left = Math.random() * 100 + "%";
      c.style.animationDelay = Math.random() * 0.5 + "s";
      c.style.animationDuration = (1.5 + Math.random()) + "s";
      c.style.fontSize = (24 + Math.random() * 24) + "px";
      container.appendChild(c);
    }
    setTimeout(() => container.remove(), 3000);
  }

  function shakeScreen(id) {
    const s = document.getElementById(id || "screen-quiz");
    if (!s) return;
    s.classList.add("shake");
    setTimeout(() => s.classList.remove("shake"), 500);
  }

  // 公開
  window.Games = {
    addStamp, hasStamp, stampCount, loadStamps, viewCount, stampTier,
    renderStamps, renderCompare,
    startQuiz, startMemory, startBattle,
    startRoarQuiz, startWhack, stopWhackTimers,
    playFanfare, showConfetti
  };
})();
