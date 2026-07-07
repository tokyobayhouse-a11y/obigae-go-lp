// ゴジラずかん v20 - ゲーム群
// バトル(ターン制) / シルエットクイズ / なきごえクイズ / めくって / かいじゅうたたき / パズル
(function() {
  const WHACK_BEST_KEY = "godzilla_zukan_whack_best_v1";

  const $ = id => document.getElementById(id);
  const shuffle = a => [...a].sort(() => Math.random() - 0.5);
  const rnd = n => Math.floor(Math.random() * n);
  const ic = (n, c) => window.App.icon(n, c);

  /* ============================================================
     かいじゅうバトル (ターン制・わざ選択)
     ============================================================ */
  let bt = null;

  function maxHp(k) { return 50 + k.guard * 10 + k.size * 4; }

  function openBattle() {
    bt = { mode: null, phase: "mode" };
    renderBattleMode();
    App.show("screen-battle");
  }

  function renderBattleMode() {
    $("battle-side").textContent = "";
    $("battle-body").innerHTML = `
      <div class="mode-list">
        <button class="btn" id="bt-cpu">${ic("robot")} コンピューターと たたかう</button>
        <button class="btn warm" id="bt-2p">${ic("users")} ふたりで たいせん！</button>
      </div>
      <div class="mode-note">わざを えらんで こうげき！<br>あいての HP を さきに ゼロに したら かち！</div>`;
    $("bt-cpu").addEventListener("click", () => { SFX.tap(); bt.mode = "cpu"; bt.phase = "pick1"; renderBattlePick(); });
    $("bt-2p").addEventListener("click", () => { SFX.tap(); bt.mode = "2p"; bt.phase = "pick1"; renderBattlePick(); });
  }

  function renderBattlePick() {
    const who = bt.phase === "pick1"
      ? (bt.mode === "2p" ? "プレイヤー1の かいじゅうを えらぼう！" : "じぶんの かいじゅうを えらぼう！")
      : "プレイヤー2の かいじゅうを えらぼう！";
    $("battle-body").innerHTML = `
      <div class="bt-vs-label">${who}</div>
      <div class="bt-pick-grid">
        ${KAIJU_DATA.map(k => `
          <button class="bt-pick" data-kid="${k.id}">
            <img src="images/${k.id}-1.jpg" alt="${k.name}" loading="lazy" onerror="this.style.display='none'">
            <span class="n">${k.name}</span>
            <span class="p">HP${maxHp(k)}・こうげき${k.power}</span>
          </button>`).join("")}
      </div>`;
    $("battle-body").scrollTop = 0;
    document.querySelectorAll("#battle-body .bt-pick").forEach(b => {
      b.addEventListener("click", () => {
        SFX.tap();
        const k = KAIJU_DATA.find(x => x.id === b.dataset.kid);
        if (bt.phase === "pick1") {
          bt.f1 = mkFighter(k, bt.mode === "2p" ? "プレイヤー1" : "じぶん");
          if (bt.mode === "2p") { bt.phase = "pick2"; renderBattlePick(); }
          else {
            let e; do { e = KAIJU_DATA[rnd(KAIJU_DATA.length)]; } while (e.id === k.id);
            bt.f2 = mkFighter(e, "コンピューター");
            startFight();
          }
        } else {
          bt.f2 = mkFighter(k, "プレイヤー2");
          startFight();
        }
      });
    });
  }

  function mkFighter(k, owner) {
    return { k, owner, hp: maxHp(k), max: maxHp(k), charge: false };
  }

  function startFight() {
    bt.phase = "fight";
    bt.busy = false;
    bt.turn = bt.f1.k.speed >= bt.f2.k.speed ? 1 : 2;
    renderArena(`${bt.turn === 1 ? bt.f1.k.name : bt.f2.k.name}が すばやさで せんこう！`);
    App.speak("バトル スタート！");
    if (isCpuTurn()) setTimeout(cpuMove, 1400);
  }

  function isCpuTurn() { return bt.mode === "cpu" && bt.turn === 2; }
  function fighter(n) { return n === 1 ? bt.f1 : bt.f2; }

  function hpClass(f) { const r = f.hp / f.max; return r < 0.3 ? "low" : r < 0.6 ? "mid" : ""; }

  function fighterHTML(f, side) {
    return `
      <div class="bt-fighter" id="bt-f${side}">
        <img class="bt-face" src="images/${f.k.id}-1.jpg" alt="${f.k.name}" onerror="this.style.display='none'">
        <div class="bt-name">${f.k.name}</div>
        <div class="bt-owner">${f.owner}</div>
        <div class="hp-wrap">
          <div class="hp-bar"><div class="hp-fill ${hpClass(f)}" id="bt-hp${side}" style="width:${f.hp / f.max * 100}%"></div></div>
          <div class="hp-num" id="bt-hpn${side}">${f.hp} / ${f.max}</div>
        </div>
      </div>`;
  }

  function renderArena(logText, logSub) {
    const cur = fighter(bt.turn);
    const isHuman = !(isCpuTurn());
    const over = bt.phase === "over";
    $("battle-side").textContent = "";
    $("battle-body").innerHTML = `
      ${over ? "" : `<div class="bt-turn-tag">${cur.owner}（${cur.k.name}）の ターン</div>`}
      <div class="bt-stage" id="bt-stage">
        <div class="bt-row">
          ${fighterHTML(bt.f1, 1)}
          <div class="bt-vs">VS</div>
          ${fighterHTML(bt.f2, 2)}
        </div>
        <div class="bt-log" id="bt-log">${logText || ""}${logSub ? `<div class="sub">${logSub}</div>` : ""}</div>
      </div>
      <div id="bt-controls">
        ${over ? `
          <div class="btn-row">
            <button class="btn" id="bt-again">${ic("zap")} もういちど</button>
            <button class="btn ghost" id="bt-change">かえる</button>
          </div>` : isHuman ? `
          <div class="bt-moves">
            <button class="mv-btn" data-mv="attack"><span class="mv-ic">${ic("zap")}</span><span><span class="mv-name">たいあたり</span><span class="mv-desc">かならず あたる こうげき</span></span></button>
            <button class="mv-btn sp" data-mv="special"><span class="mv-ic">${ic("flame")}</span><span><span class="mv-name">${cur.k.skill}</span><span class="mv-desc">つよいけど たまに はずれる</span></span></button>
            <button class="mv-btn ch" data-mv="charge" ${cur.charge ? "disabled" : ""}><span class="mv-ic">${ic("up")}</span><span><span class="mv-name">ためる</span><span class="mv-desc">つぎの こうげきが 2ばい！</span></span></button>
          </div>` : `
          <div class="mode-note">コンピューターが かんがえちゅう…</div>`}
      </div>`;
    if (bt.f1.charge) $("bt-f1").classList.add("charge");
    if (bt.f2.charge) $("bt-f2").classList.add("charge");
    if (!over && isHuman) {
      document.querySelectorAll("#bt-controls .mv-btn").forEach(b => {
        b.addEventListener("click", () => { if (!bt.busy) doMove(b.dataset.mv); });
      });
    }
    if (over) {
      $("bt-again").addEventListener("click", () => {
        SFX.tap();
        bt.f1 = mkFighter(bt.f1.k, bt.f1.owner);
        bt.f2 = mkFighter(bt.f2.k, bt.f2.owner);
        startFight();
      });
      $("bt-change").addEventListener("click", () => { SFX.tap(); openBattle(); });
    }
  }

  function updateHp(side) {
    const f = fighter(side);
    const fill = $("bt-hp" + side);
    if (fill) { fill.style.width = (f.hp / f.max * 100) + "%"; fill.className = "hp-fill " + hpClass(f); }
    const n = $("bt-hpn" + side);
    if (n) n.textContent = `${f.hp} / ${f.max}`;
  }

  function setLog(t, sub) {
    const el = $("bt-log");
    if (el) el.innerHTML = `${t}${sub ? `<div class="sub">${sub}</div>` : ""}`;
  }

  function floatDmg(side, text, cls) {
    const f = $("bt-f" + side);
    if (!f) return;
    const d = document.createElement("div");
    d.className = "dmg-float " + (cls || "");
    d.textContent = text;
    f.appendChild(d);
    setTimeout(() => d.remove(), 900);
  }

  function doMove(mv) {
    bt.busy = true;
    const atkSide = bt.turn, defSide = bt.turn === 1 ? 2 : 1;
    const A = fighter(atkSide), D = fighter(defSide);

    if (mv === "charge") {
      A.charge = true;
      SFX.charge();
      $("bt-f" + atkSide).classList.add("charge");
      setLog(`${A.k.name}は ちからを ためた！`, "つぎの こうげきが 2ばいに なる");
      floatDmg(atkSide, "ためた！", "gold");
      return endTurn(900);
    }

    const isSp = mv === "special";
    let dmg = isSp ? 10 + A.k.power * 2.2 + rnd(7) : 6 + A.k.power * 1.2 + rnd(5);
    if (A.charge) { dmg *= 2; A.charge = false; $("bt-f" + atkSide).classList.remove("charge"); }
    dmg = Math.round(dmg);

    // 命中判定
    let hitChance = isSp ? 0.74 + (A.k.speed - D.k.speed) * 0.012 : 0.95 + (A.k.speed - D.k.speed) * 0.008;
    hitChance = Math.max(0.5, Math.min(0.97, hitChance));
    const hit = Math.random() < hitChance;

    setLog(`${A.k.name}の ${isSp ? A.k.skill : "たいあたり"}！`);
    if (isSp && window.Roar && Roar.playType) {
      window.BGM && BGM.duck();
      Roar.playType(A.k.roar);
      setTimeout(() => window.BGM && BGM.unduck(), 1800);
    }

    setTimeout(() => {
      if (!$("bt-stage")) return; // 画面を離れた
      if (!hit) {
        SFX.miss();
        floatDmg(defSide, "ミス！", "miss");
        setLog(`${D.k.name}は ひらりと かわした！`);
        return endTurn(1100);
      }
      D.hp = Math.max(0, D.hp - dmg);
      (isSp || dmg >= 30) ? SFX.bigHit() : SFX.hit();
      $("bt-f" + defSide).classList.add("hit");
      $("bt-stage").classList.add("stage-shake");
      setTimeout(() => {
        const el1 = $("bt-f" + defSide), el2 = $("bt-stage");
        el1 && el1.classList.remove("hit");
        el2 && el2.classList.remove("stage-shake");
      }, 480);
      floatDmg(defSide, "-" + dmg);
      updateHp(defSide);
      setLog(`${D.k.name}に ${dmg} ダメージ！`);

      if (D.hp <= 0) return setTimeout(() => finishBattle(atkSide, defSide), 700);
      endTurn(1200);
    }, isSp ? 950 : 450);
  }

  function endTurn(delay) {
    setTimeout(() => {
      if (!bt || bt.phase !== "fight" || !$("bt-stage")) return;
      bt.turn = bt.turn === 1 ? 2 : 1;
      bt.busy = false;
      renderArena(`${fighter(bt.turn).owner}の ターン！`);
      if (isCpuTurn()) setTimeout(cpuMove, 1100);
    }, delay);
  }

  function cpuMove() {
    if (!bt || bt.phase !== "fight" || !$("bt-stage")) return;
    const me = bt.f2;
    let mv;
    if (!me.charge && me.hp / me.max > 0.45 && Math.random() < 0.25) mv = "charge";
    else if (Math.random() < 0.55) mv = "special";
    else mv = "attack";
    doMove(mv);
  }

  function finishBattle(winSide, loseSide) {
    bt.phase = "over";
    const W = fighter(winSide), L = fighter(loseSide);
    renderArena(`${W.k.name}の かち！`, `${L.k.name}は たおれた…`);
    $("bt-f" + loseSide).classList.add("ko");
    SFX.victory();
    App.confetti(130);
    const youWon = bt.mode === "cpu" && winSide === 1;
    if (bt.mode === "cpu") App.addXp(youWon ? 18 : 6, youWon ? "バトルに かった！" : "よく たたかった！");
    else App.addXp(14, "バトル けっしょう！");
    App.speak(`${W.k.name}の かち！ ${youWon ? "おめでとう！" : ""}`);
  }

  /* ============================================================
     シルエットクイズ (10もんチャレンジ)
     ============================================================ */
  const QUIZ_LEN = 10;
  const EASY_IDS = ["showa-1954", "showa-mechagodzilla", "showa-kingkong", "showa-ghidorah", "heisei-1984", "burning-godzilla", "shin-godzilla", "godzilla-vs-kong", "godzilla-minus-one", "mothra", "king-ghidorah", "mechagodzilla"];
  let qz = { mode: "single", diff: "easy" };

  function openQuiz() {
    renderQuizMenu();
    App.show("screen-quiz");
  }

  function renderQuizMenu() {
    $("quiz-side").textContent = "";
    $("quiz-body").innerHTML = `
      <div class="q-question">これ だーれだ？<br><small style="font-size:12px;color:var(--dim)">10もん チャレンジ！</small></div>
      <div class="mode-list">
        <button class="btn" id="qz-1p">${ic("person")} ひとりで あそぶ</button>
        <button class="btn warm" id="qz-2p">${ic("users")} ふたりで たいせん！</button>
      </div>
      <div class="diff-row">
        <button class="diff-btn ${qz.diff === "easy" ? "active" : ""}" data-d="easy">かんたん<small>ゆうめい12たい</small></button>
        <button class="diff-btn ${qz.diff === "normal" ? "active" : ""}" data-d="normal">ふつう<small>ぜんいん・4たく</small></button>
        <button class="diff-btn ${qz.diff === "hard" ? "active" : ""}" data-d="hard">むずかしい<small>ぼかし・6たく</small></button>
      </div>`;
    document.querySelectorAll("#quiz-body .diff-btn").forEach(b => {
      b.addEventListener("click", () => {
        SFX.tap();
        qz.diff = b.dataset.d;
        document.querySelectorAll("#quiz-body .diff-btn").forEach(x => x.classList.toggle("active", x === b));
      });
    });
    $("qz-1p").addEventListener("click", () => { SFX.tap(); startQuizRound("single"); });
    $("qz-2p").addEventListener("click", () => { SFX.tap(); startQuizRound("2p"); });
  }

  function quizPool() {
    return qz.diff === "easy" ? KAIJU_DATA.filter(k => EASY_IDS.includes(k.id)) : KAIJU_DATA;
  }

  function startQuizRound(mode) {
    qz.mode = mode;
    qz.num = 0; qz.score = 0; qz.scoreP2 = 0;
    qz.dots = Array(QUIZ_LEN).fill(null);
    nextQuizQ();
  }

  function nextQuizQ() {
    if (qz.num >= QUIZ_LEN) return quizResult();
    const pool = quizPool();
    const correct = pool[rnd(pool.length)];
    const optCount = qz.diff === "hard" ? 6 : 4;
    const wrong = [];
    while (wrong.length < optCount - 1) {
      const c = pool[rnd(pool.length)];
      if (c.id !== correct.id && !wrong.find(w => w.id === c.id)) wrong.push(c);
    }
    qz.cur = { correct, options: shuffle([correct, ...wrong]), revealed: false };
    renderQuizQ();
    setTimeout(() => App.speak(qz.mode === "2p" ? `プレイヤー${qz.num % 2 + 1}の ばん！ これ だーれだ？` : "これ だーれだ？"), 350);
  }

  function quizSideHTML() {
    if (qz.mode === "2p") {
      const p = qz.num % 2;
      return `<span class="p2-score"><span class="p p1 ${p === 0 ? "on" : ""}">P1:${qz.score}</span><span class="p p2 ${p === 1 ? "on" : ""}">P2:${qz.scoreP2}</span></span>`;
    }
    return `${qz.score} / ${qz.num}`;
  }

  function renderQuizQ() {
    const { correct, options } = qz.cur;
    $("quiz-side").innerHTML = quizSideHTML();
    const silCls = qz.diff === "hard" ? "sil-hard" : "sil";
    $("quiz-body").innerHTML = `
      <div class="q-prog">${qz.dots.map((d, i) => `<div class="q-dot ${d === true ? "ok" : d === false ? "ng" : i === qz.num ? "now" : ""}"></div>`).join("")}</div>
      ${qz.mode === "2p" ? `<div class="q-turn">プレイヤー${qz.num % 2 + 1}の ばん！</div>` : ""}
      <div class="q-question">これ だーれだ？</div>
      <div class="q-img-wrap"><img id="qz-img" class="${silCls}" src="images/${correct.id}-1.jpg" alt="?"></div>
      <div class="q-opts" style="${qz.diff === "hard" ? "grid-template-columns:1fr 1fr;" : ""}">
        ${options.map(o => `<button class="q-opt" data-id="${o.id}">${o.name}</button>`).join("")}
      </div>
      <div class="q-next-wrap" id="qz-next"></div>`;
    $("quiz-body").scrollTop = 0;
    document.querySelectorAll("#quiz-body .q-opt").forEach(b => b.addEventListener("click", () => answerQuiz(b)));
  }

  function answerQuiz(btn) {
    if (qz.cur.revealed) return;
    qz.cur.revealed = true;
    const ok = btn.dataset.id === qz.cur.correct.id;
    $("qz-img").className = "";
    document.querySelectorAll("#quiz-body .q-opt").forEach(b => {
      b.disabled = true;
      if (b.dataset.id === qz.cur.correct.id) b.classList.add("correct");
    });
    if (!ok) btn.classList.add("wrong");
    qz.dots[qz.num] = ok;
    if (ok) {
      if (qz.mode === "2p" && qz.num % 2 === 1) qz.scoreP2++; else qz.score++;
      SFX.good(); App.confetti(45);
      App.speak(shuffle(["せいかい！すごい！", "やったね！", "ピンポーン！", "せいかい！てんさい！"])[0]);
      if (qz.mode === "single") App.addXp(4);
    } else {
      SFX.bad();
      App.speak(`ざんねん！ こたえは ${qz.cur.correct.name}！`);
    }
    $("quiz-side").innerHTML = quizSideHTML();
    $("qz-next").innerHTML = `<button class="btn" id="qz-go">${qz.num === QUIZ_LEN - 1 ? "けっかを みる" : "つぎの もんだい"} →</button>`;
    $("qz-go").addEventListener("click", () => { SFX.tap(); qz.num++; nextQuizQ(); });
  }

  function starsFor(score, total) {
    const r = score / total;
    return r >= 0.9 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0;
  }

  function quizResult() {
    if (qz.mode === "2p") {
      const w = qz.score === qz.scoreP2 ? "ひきわけ！" : qz.score > qz.scoreP2 ? "プレイヤー1の かち！" : "プレイヤー2の かち！";
      $("quiz-body").innerHTML = `
        <div class="result-panel">
          <div class="result-title">${w}</div>
          <div class="result-score">${qz.score} <small>vs</small> ${qz.scoreP2}</div>
          <div class="result-xp">+10 XP ふたりとも がんばった！</div>
          <div class="btn-row"><button class="btn" id="qz-re">もういちど</button><button class="btn ghost" id="qz-menu">メニューへ</button></div>
        </div>`;
      App.addXp(10);
    } else {
      const st = starsFor(qz.score, QUIZ_LEN);
      const bonus = qz.score === QUIZ_LEN ? 25 : qz.score >= 8 ? 15 : qz.score >= 5 ? 8 : 3;
      $("quiz-body").innerHTML = `
        <div class="result-panel">
          <div class="result-title">${qz.score === QUIZ_LEN ? "パーフェクト！！" : qz.score >= 8 ? "すごい！" : qz.score >= 5 ? "よくできた！" : "つぎは できるよ！"}</div>
          <div class="result-stars">${"★".repeat(st)}<span class="off">${"★".repeat(3 - st)}</span></div>
          <div class="result-score">${qz.score}<small> / ${QUIZ_LEN}もん</small></div>
          <div class="result-xp">ボーナス +${bonus} XP</div>
          <div class="btn-row"><button class="btn" id="qz-re">もういちど</button><button class="btn ghost" id="qz-menu">メニューへ</button></div>
        </div>`;
      App.addXp(bonus);
    }
    SFX.victory(); App.confetti(120);
    $("qz-re").addEventListener("click", () => { SFX.tap(); startQuizRound(qz.mode); });
    $("qz-menu").addEventListener("click", () => { SFX.tap(); renderQuizMenu(); });
  }

  /* ============================================================
     なきごえクイズ (8もん・こえは合成エンジン)
     ============================================================ */
  const RQ_LEN = 8;
  let rq = null;

  function openRoarQuiz() {
    rq = { num: 0, score: 0, dots: Array(RQ_LEN).fill(null) };
    nextRoarQ();
    App.show("screen-roarquiz");
  }

  function pickRoarSet() {
    const pool = KAIJU_DATA;
    const correct = pool[rnd(pool.length)];
    const types = new Set([correct.roar]);
    const ids = new Set([correct.id]);
    const wrong = [];
    for (const k of shuffle(pool)) {
      if (wrong.length >= 3) break;
      if (ids.has(k.id) || types.has(k.roar)) continue; // 同じ声は選択肢にしない
      wrong.push(k); types.add(k.roar); ids.add(k.id);
    }
    return { correct, options: shuffle([correct, ...wrong]), revealed: false };
  }

  function playRq() {
    if (!rq || !rq.cur) return;
    const btn = $("rq-listen");
    btn && btn.classList.add("playing");
    window.BGM && BGM.duck();
    const dur = (window.Roar && Roar.playType) ? Roar.playType(rq.cur.correct.roar) : 0;
    setTimeout(() => {
      window.BGM && BGM.unduck();
      btn && btn.classList.remove("playing");
    }, (dur || 1.5) * 1000 + 400);
  }

  function nextRoarQ() {
    if (rq.num >= RQ_LEN) return roarResult();
    rq.cur = pickRoarSet();
    renderRoarQ();
    setTimeout(() => App.speak("だれの なきごえかな？", () => setTimeout(playRq, 300)), 350);
  }

  function renderRoarQ() {
    $("roarquiz-side").textContent = `${rq.score} / ${rq.num}`;
    $("roarquiz-body").innerHTML = `
      <div class="q-prog">${rq.dots.map((d, i) => `<div class="q-dot ${d === true ? "ok" : d === false ? "ng" : i === rq.num ? "now" : ""}"></div>`).join("")}</div>
      <div class="q-question">だれの なきごえ？</div>
      <button class="listen-btn" id="rq-listen">${ic("sound")} なきごえを きく</button>
      <div class="q-opts">
        ${rq.cur.options.map(o => `
          <button class="q-opt q-opt-img" data-id="${o.id}">
            <img src="images/${o.id}-1.jpg" alt="${o.name}" loading="lazy" onerror="this.style.display='none'">
            <span>${o.name}</span>
          </button>`).join("")}
      </div>
      <div class="q-next-wrap" id="rq-next"></div>`;
    $("roarquiz-body").scrollTop = 0;
    $("rq-listen").addEventListener("click", () => { SFX.tap(); playRq(); });
    document.querySelectorAll("#roarquiz-body .q-opt").forEach(b => b.addEventListener("click", () => answerRoar(b)));
  }

  function answerRoar(btn) {
    if (rq.cur.revealed) return;
    rq.cur.revealed = true;
    const ok = btn.dataset.id === rq.cur.correct.id;
    document.querySelectorAll("#roarquiz-body .q-opt").forEach(b => {
      b.disabled = true;
      if (b.dataset.id === rq.cur.correct.id) b.classList.add("correct");
    });
    if (!ok) btn.classList.add("wrong");
    rq.dots[rq.num] = ok;
    if (ok) {
      rq.score++;
      SFX.good(); App.confetti(45);
      App.speak(shuffle(["せいかい！いいみみ！", "だいせいかい！", "きこえてたね！すごい！"])[0]);
      App.addXp(5);
    } else {
      SFX.bad();
      App.speak(`ざんねん！ こたえは ${rq.cur.correct.name}！`);
    }
    $("roarquiz-side").textContent = `${rq.score} / ${rq.num + 1}`;
    $("rq-next").innerHTML = `<button class="btn" id="rq-go">${rq.num === RQ_LEN - 1 ? "けっかを みる" : "つぎの もんだい"} →</button>`;
    $("rq-go").addEventListener("click", () => { SFX.tap(); rq.num++; nextRoarQ(); });
  }

  function roarResult() {
    const st = starsFor(rq.score, RQ_LEN);
    const bonus = rq.score === RQ_LEN ? 22 : rq.score >= 6 ? 12 : rq.score >= 4 ? 6 : 3;
    $("roarquiz-body").innerHTML = `
      <div class="result-panel">
        <div class="result-title">${rq.score === RQ_LEN ? "きみは おとの てんさい！" : rq.score >= 6 ? "いいみみ してる！" : "たくさん きいて おぼえよう！"}</div>
        <div class="result-stars">${"★".repeat(st)}<span class="off">${"★".repeat(3 - st)}</span></div>
        <div class="result-score">${rq.score}<small> / ${RQ_LEN}もん</small></div>
        <div class="result-xp">ボーナス +${bonus} XP</div>
        <div class="btn-row"><button class="btn" id="rq-re">もういちど</button><button class="btn ghost" id="rq-home">ホームへ</button></div>
      </div>`;
    App.addXp(bonus);
    SFX.victory(); App.confetti(120);
    $("rq-re").addEventListener("click", () => { SFX.tap(); openRoarQuiz(); });
    $("rq-home").addEventListener("click", () => { SFX.tap(); App.back(); });
  }

  /* ============================================================
     めくってあわせ
     ============================================================ */
  let mem = null;

  function openMemory() {
    mem = { phase: "mode" };
    $("memory-side").textContent = "";
    $("memory-body").innerHTML = `
      <div class="q-question">おなじ カードを みつけよう！</div>
      <div class="mode-list">
        <button class="btn" id="mem-1p">${ic("person")} ひとりで あそぶ</button>
        <button class="btn warm" id="mem-2p">${ic("users")} ふたりで たいせん！</button>
      </div>`;
    $("mem-1p").addEventListener("click", () => { SFX.tap(); startMemory("single"); });
    $("mem-2p").addEventListener("click", () => { SFX.tap(); startMemory("2p"); });
    App.show("screen-memory");
  }

  function startMemory(mode) {
    const chosen = shuffle(KAIJU_DATA).slice(0, 8);
    const cards = shuffle(chosen.flatMap(k => [{ k }, { k }]));
    mem = { phase: "play", mode, cards, flipped: [], matched: new Set(), moves: 0, locked: false, turn: 1, s1: 0, s2: 0 };
    renderMemory();
  }

  function renderMemory() {
    const done = mem.matched.size === 8;
    $("memory-side").innerHTML = mem.mode === "2p"
      ? `<span class="p2-score"><span class="p p1 ${mem.turn === 1 ? "on" : ""}">P1:${mem.s1}</span><span class="p p2 ${mem.turn === 2 ? "on" : ""}">P2:${mem.s2}</span></span>`
      : `${mem.matched.size} / 8`;
    $("memory-body").innerHTML = `
      ${mem.mode === "2p" && !done ? `<div class="q-turn">プレイヤー${mem.turn}の ばん</div>` : ""}
      <div class="mem-grid">
        ${mem.cards.map((c, i) => {
          const open = mem.flipped.includes(i) || mem.matched.has(c.k.id);
          const got = mem.matched.has(c.k.id);
          return `
            <div class="mem-card ${open ? "open" : ""} ${got ? "got" : ""}" data-i="${i}">
              <div class="mem-in">
                <div class="mem-f">${ic("gem")}</div>
                <div class="mem-b"><img src="images/${c.k.id}-1.jpg" alt="" loading="lazy"></div>
              </div>
            </div>`;
        }).join("")}
      </div>
      ${done ? `<div class="result-panel">
          <div class="result-title">${mem.mode === "2p" ? (mem.s1 === mem.s2 ? "ひきわけ！" : mem.s1 > mem.s2 ? "プレイヤー1の かち！" : "プレイヤー2の かち！") : "ぜんぶ そろえた！"}</div>
          ${mem.mode === "single" ? `<div class="result-score">${mem.moves}<small> かいで クリア</small></div>` : `<div class="result-score">${mem.s1} <small>vs</small> ${mem.s2}</div>`}
          <div class="result-xp">+14 XP</div>
          <button class="btn" id="mem-re">もういちど</button>
        </div>` : ""}`;
    document.querySelectorAll("#memory-body .mem-card").forEach(c =>
      c.addEventListener("click", () => flipMem(parseInt(c.dataset.i))));
    const re = $("mem-re");
    if (re) re.addEventListener("click", () => { SFX.tap(); startMemory(mem.mode); });
  }

  function flipMem(i) {
    if (mem.locked || mem.phase !== "play") return;
    const c = mem.cards[i];
    if (mem.matched.has(c.k.id) || mem.flipped.includes(i)) return;
    SFX.flip();
    mem.flipped.push(i);
    renderMemory();
    if (mem.flipped.length === 2) {
      mem.moves++;
      const [a, b] = mem.flipped.map(x => mem.cards[x].k);
      if (a.id === b.id) {
        mem.matched.add(a.id);
        mem.flipped = [];
        if (mem.mode === "2p") mem.turn === 1 ? mem.s1++ : mem.s2++;
        SFX.good();
        if (mem.matched.size === 8) {
          setTimeout(() => {
            SFX.victory(); App.confetti(120); App.addXp(14, "めくってクリア！");
            renderMemory();
          }, 350);
        } else setTimeout(renderMemory, 250);
      } else {
        mem.locked = true;
        setTimeout(() => {
          mem.flipped = [];
          mem.locked = false;
          if (mem.mode === "2p") mem.turn = mem.turn === 1 ? 2 : 1;
          renderMemory();
        }, 850);
      }
    }
  }

  /* ============================================================
     かいじゅうたたき (30びょう・コンボつき)
     ============================================================ */
  const WHACK_TIME = 30;
  let wh = null;

  function whackBest() { try { return parseInt(localStorage.getItem(WHACK_BEST_KEY) || "0", 10) || 0; } catch { return 0; } }

  function openWhack() {
    stopWhack();
    wh = { running: false };
    const best = whackBest();
    $("whack-body").innerHTML = `
      <div class="wh-intro">
        <div class="wh-title">かいじゅうたたき！</div>
        <div class="wh-rules">
          <div class="wh-rule">${ic("hammer")} かいじゅうを タップ <b>+1てん</b></div>
          <div class="wh-rule">${ic("flame")} 3れんぞくで コンボ <b>+2てん</b></div>
          <div class="wh-rule no"><img src="images/minilla-1.jpg" alt="ミニラ"> ミニラは たたいちゃダメ <b>-2てん</b></div>
        </div>
        ${best > 0 ? `<div class="wh-best">さいこうきろく ${best}てん</div>` : ""}
        <button class="btn warm" id="wh-start">${ic("hammer")} スタート！</button>
      </div>`;
    $("wh-start").addEventListener("click", () => { SFX.tap(); runWhack(); });
    App.show("screen-whack");
  }

  function stopWhack() {
    if (!wh) return;
    if (wh.timerId) clearInterval(wh.timerId);
    if (wh.popId) clearTimeout(wh.popId);
    wh.running = false;
  }

  function whActive() { return document.getElementById("screen-whack").classList.contains("active"); }

  function runWhack() {
    wh = { running: true, score: 0, timeLeft: WHACK_TIME, combo: 0, lastHit: 0, hole: -1, lastHole: -1, k: null, hitDone: false, t0: Date.now() };
    $("whack-body").innerHTML = `
      <div class="wh-hud">
        <div class="wh-box">とくてん<b id="wh-score">0</b></div>
        <div class="wh-box combo">コンボ<b id="wh-combo">0</b></div>
        <div class="wh-box">のこり<b id="wh-time">${WHACK_TIME}</b></div>
      </div>
      <div class="wh-grid">
        ${Array.from({ length: 9 }, (_, i) => `<div class="wh-hole" data-h="${i}"><div class="wh-pop" id="wh-pop-${i}"></div></div>`).join("")}
      </div>
      <div class="wh-tip">ミニラは たたかないでね！</div>`;
    document.querySelectorAll("#whack-body .wh-hole").forEach(h =>
      h.addEventListener("pointerdown", () => hitWhack(parseInt(h.dataset.h))));
    wh.timerId = setInterval(() => {
      if (!whActive()) return stopWhack();
      wh.timeLeft--;
      const t = $("wh-time");
      if (t) t.textContent = wh.timeLeft;
      if (wh.timeLeft <= 3 && wh.timeLeft > 0) SFX.tick();
      if (wh.timeLeft <= 0) endWhack();
    }, 1000);
    App.speak("よーい、スタート！");
    schedulePop(850);
  }

  function popInterval() {
    const e = (Date.now() - wh.t0) / 1000;
    return Math.max(430, 850 - e * 15);
  }

  function schedulePop(d) {
    if (!wh.running) return;
    wh.popId = setTimeout(() => {
      if (!wh.running || !whActive()) return stopWhack();
      showPop();
      schedulePop(popInterval());
    }, d);
  }

  function showPop() {
    hidePop();
    let h;
    do { h = rnd(9); } while (h === wh.lastHole);
    wh.lastHole = h; wh.hole = h; wh.hitDone = false;
    const isMinilla = Math.random() < 0.22;
    wh.k = isMinilla ? KAIJU_DATA.find(x => x.id === "minilla")
      : (() => { let k; do { k = KAIJU_DATA[rnd(KAIJU_DATA.length)]; } while (k.id === "minilla"); return k; })();
    const pop = $("wh-pop-" + h);
    if (pop) {
      pop.innerHTML = `<img src="images/${wh.k.id}-1.jpg" alt="" draggable="false">`;
      pop.classList.add("up");
      pop.classList.toggle("minilla", isMinilla);
    }
  }

  function hidePop() {
    if (wh.hole < 0) return;
    const pop = $("wh-pop-" + wh.hole);
    if (pop) { pop.classList.remove("up", "minilla", "bonk"); pop.innerHTML = ""; }
    wh.hole = -1; wh.k = null;
  }

  function hitWhack(h) {
    if (!wh.running || wh.hitDone || h !== wh.hole || !wh.k) return;
    wh.hitDone = true;
    const pop = $("wh-pop-" + h);
    pop && pop.classList.add("bonk");
    const hole = document.querySelector(`#whack-body .wh-hole[data-h="${h}"]`);
    const float = (t, bad) => {
      if (!hole) return;
      const f = document.createElement("div");
      f.className = "wh-float" + (bad ? " bad" : "");
      f.textContent = t;
      hole.appendChild(f);
      setTimeout(() => f.remove(), 750);
    };
    if (wh.k.id === "minilla") {
      wh.score = Math.max(0, wh.score - 2);
      wh.combo = 0;
      SFX.boo();
      float("-2", true);
    } else {
      const now = Date.now();
      wh.combo = (now - wh.lastHit < 1300) ? wh.combo + 1 : 1;
      wh.lastHit = now;
      const pt = wh.combo >= 3 ? 2 : 1;
      wh.score += pt;
      SFX.pop();
      float("+" + pt);
    }
    const s = $("wh-score"), c = $("wh-combo");
    if (s) s.textContent = wh.score;
    if (c) c.textContent = wh.combo;
    setTimeout(hidePop, 160);
  }

  function endWhack() {
    stopWhack();
    hidePop();
    const score = wh.score;
    const best = whackBest();
    const isBest = score > best;
    if (isBest) { try { localStorage.setItem(WHACK_BEST_KEY, String(score)); } catch {} }
    SFX.victory();
    if (isBest) App.confetti(130);
    App.addXp(Math.min(30, Math.max(3, score)) + (isBest ? 10 : 0), "かいじゅうたたき おわり！");
    App.speak(isBest ? `おしまい！ ${score}てん！ しんきろく おめでとう！` : `おしまい！ ${score}てん！`);
    $("whack-body").innerHTML = `
      <div class="result-panel">
        <div class="result-title">おしまい！</div>
        <div class="result-score">${score}<small> てん</small></div>
        <div class="${isBest ? "result-xp" : "wh-best"}" style="margin-top:8px">${isBest ? "しんきろく たっせい！" : `さいこうきろく ${Math.max(best, score)}てん`}</div>
        <div class="btn-row" style="margin-top:16px"><button class="btn warm" id="wh-re">もういちど！</button><button class="btn ghost" id="wh-home">ホームへ</button></div>
      </div>`;
    $("wh-re").addEventListener("click", () => { SFX.tap(); openWhack(); });
    $("wh-home").addEventListener("click", () => { SFX.tap(); App.back(); });
  }

  /* ============================================================
     ジグソーパズル
     ============================================================ */
  let pz = null;
  const PZ_POOL = ["showa-kingkong", "showa-mothra", "showa-ghidorah", "heisei-biollante", "heisei-mothra", "heisei-ghidorah", "heisei-spacegodzilla", "mothra", "king-ghidorah", "biollante", "kingkong", "ebirah", "manda", "jet-jaguar", "rodan", "godzilla-vs-kong"];

  function openPuzzle() {
    $("puzzle-body").innerHTML = `
      <div class="q-question">どの レベルで あそぶ？</div>
      <div class="pz-levels">
        <button class="btn" data-n="2">かんたん（4ピース）</button>
        <button class="btn" data-n="3">ふつう（9ピース）</button>
        <button class="btn warm" data-n="4">むずかしい（16ピース）</button>
      </div>`;
    document.querySelectorAll("#puzzle-body [data-n]").forEach(b => {
      b.addEventListener("click", () => {
        SFX.tap();
        const pool = KAIJU_DATA.filter(k => PZ_POOL.includes(k.id));
        startPuzzle(pool[rnd(pool.length)], parseInt(b.dataset.n));
      });
    });
    App.show("screen-puzzle");
  }

  function startPuzzle(k, n) {
    const pieces = Array.from({ length: n * n }, (_, i) => ({ correct: i, cur: i }));
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [pieces[i].cur, pieces[j].cur] = [pieces[j].cur, pieces[i].cur];
    }
    pz = { k, n, pieces, sel: null, moves: 0, t0: Date.now(), done: false };
    renderPuzzle();
  }

  function renderPuzzle() {
    const { k, n, pieces } = pz;
    const done = pieces.every(p => p.correct === p.cur);
    const sec = Math.floor((Date.now() - pz.t0) / 1000);
    const placed = new Array(n * n);
    pieces.forEach(p => { placed[p.cur] = p; });
    const step = n > 1 ? 100 / (n - 1) : 0;
    $("puzzle-body").innerHTML = `
      <div class="pz-info"><span>うごかした <b>${pz.moves}</b> かい</span><span>タイム <b>${sec}</b> びょう</span></div>
      <div class="pz-hint"><img src="images/${k.id}-1.jpg" alt="かんせいず"><span>かんせいず</span></div>
      <div class="pz-board" style="--n:${n}">
        ${placed.map((p, i) => {
          const row = Math.floor(p.correct / n), col = p.correct % n;
          return `<div class="pz-cell ${p.correct === p.cur ? "ok" : ""} ${pz.sel === i ? "sel" : ""}" data-i="${i}"
            style="background-image:url('images/${k.id}-1.jpg');background-position:${col * step}% ${row * step}%">
            <span class="num">${p.correct + 1}</span></div>`;
        }).join("")}
      </div>
      ${done ? `<div class="result-panel">
          <div class="result-title">かんせい！</div>
          <div class="result-score">${sec}<small> びょう</small></div>
          <div class="result-xp">+${n === 2 ? 8 : n === 3 ? 14 : 22} XP</div>
          <button class="btn" id="pz-re">もういちど</button>
        </div>` : `<div class="pz-help">いれかえたい 2まいを じゅんばんに タップ</div>`}`;
    document.querySelectorAll("#puzzle-body .pz-cell").forEach(c =>
      c.addEventListener("click", () => tapPz(parseInt(c.dataset.i))));
    const re = $("pz-re");
    if (re) re.addEventListener("click", () => { SFX.tap(); openPuzzle(); });
  }

  function tapPz(i) {
    if (pz.done) return;
    SFX.tap();
    if (pz.sel === null) pz.sel = i;
    else if (pz.sel === i) pz.sel = null;
    else {
      const a = pz.pieces.find(p => p.cur === i);
      const b = pz.pieces.find(p => p.cur === pz.sel);
      [a.cur, b.cur] = [b.cur, a.cur];
      pz.sel = null;
      pz.moves++;
      if (pz.pieces.every(p => p.correct === p.cur)) {
        pz.done = true;
        SFX.victory(); App.confetti(120);
        App.addXp(pz.n === 2 ? 8 : pz.n === 3 ? 14 : 22, "パズル かんせい！");
        App.speak(`やったね！ ${pz.k.name} かんせい！`);
      }
    }
    renderPuzzle();
  }

  /* ================= 公開 ================= */
  window.Games = { openBattle, openQuiz, openRoarQuiz, openMemory, openWhack, openPuzzle };
})();
