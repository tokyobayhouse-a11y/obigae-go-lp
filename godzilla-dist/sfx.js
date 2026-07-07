// ゴジラずかん v20 - 効果音エンジン (Web Audio)
(function() {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  // 基本トーン: freq→sweepTo を dur 秒で。type/gain/delay(開始遅延)指定可
  function tone(freq, dur, opts) {
    const c = getCtx();
    if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0) + 0.01;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opts.type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    if (opts.sweepTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.sweepTo), t0 + dur);
    const gain = opts.gain || 0.22;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noise(dur, opts) {
    const c = getCtx();
    if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0) + 0.01;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = opts.hi ? "highpass" : "lowpass";
    f.frequency.value = opts.filter || 800;
    const g = c.createGain();
    g.gain.setValueAtTime(opts.gain || 0.18, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0);
  }

  const SFX = {
    unlock() { getCtx(); },

    // UI タップ
    tap() { tone(660, 0.07, { type: "triangle", gain: 0.12, sweepTo: 880 }); },

    // 正解・成功 (ピロリン)
    good() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, { type: "triangle", gain: 0.2, delay: i * 0.09 }));
    },
    // 不正解 (ブブー)
    bad() {
      [340, 260, 180].forEach((f, i) => tone(f, 0.22, { type: "sawtooth", gain: 0.16, delay: i * 0.15 }));
    },
    // カードめくり
    flip() { noise(0.09, { hi: true, filter: 2400, gain: 0.1 }); tone(900, 0.08, { type: "triangle", gain: 0.08, sweepTo: 1400 }); },
    // ぽこっ (たたきヒット)
    pop() { tone(720, 0.1, { type: "sine", gain: 0.26, sweepTo: 1350 }); },
    // ぶぶー (ミニラ誤タップ)
    boo() { tone(220, 0.26, { type: "sawtooth", gain: 0.22, sweepTo: 90 }); },
    // 攻撃ヒット (ドスッ)
    hit() {
      tone(160, 0.18, { type: "square", gain: 0.2, sweepTo: 60 });
      noise(0.14, { filter: 500, gain: 0.24 });
    },
    // 大ダメージ (ズドーン)
    bigHit() {
      tone(120, 0.34, { type: "sawtooth", gain: 0.26, sweepTo: 40 });
      noise(0.3, { filter: 350, gain: 0.3 });
    },
    // かわした (ヒュッ)
    miss() { noise(0.12, { hi: true, filter: 3200, gain: 0.1 }); },
    // ためる (ゴゴゴ...)
    charge() {
      tone(90, 0.55, { type: "sawtooth", gain: 0.16, sweepTo: 240 });
      tone(140, 0.55, { type: "triangle", gain: 0.12, sweepTo: 420, delay: 0.05 });
    },
    // 勝利ジングル
    victory() {
      [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, { type: "triangle", gain: 0.2, delay: i * 0.12 }));
      tone(1319, 0.55, { type: "triangle", gain: 0.18, delay: 0.75 });
    },
    // ガチャのため (シュイーン)
    riser() {
      tone(220, 0.7, { type: "sawtooth", gain: 0.1, sweepTo: 1200 });
      noise(0.7, { hi: true, filter: 1500, gain: 0.05 });
    },
    // ガチャ確定 (キラーン)
    reveal(rank) {
      const base = rank === "L" ? [784, 988, 1175, 1568] : rank === "UR" ? [659, 831, 988, 1319] : [523, 659, 784];
      base.forEach((f, i) => tone(f, 0.4, { type: "triangle", gain: 0.2, delay: i * 0.1 }));
      if (rank === "L" || rank === "UR") noise(0.5, { hi: true, filter: 4500, gain: 0.06, delay: 0.2 });
    },
    // レベルアップ
    levelUp() {
      [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, { type: "triangle", gain: 0.22, delay: i * 0.1 }));
    },
    // 足音 (画面遷移)
    stomp() {
      tone(95, 0.35, { type: "sine", gain: 0.32, sweepTo: 30 });
      noise(0.16, { filter: 220, gain: 0.2 });
    },
    // カウントダウン
    tick() { tone(880, 0.09, { type: "square", gain: 0.1 }); }
  };

  // 初回ジェスチャーでアンロック (iOS)
  const unlock = () => SFX.unlock();
  document.addEventListener("touchstart", unlock, { once: true, capture: true });
  document.addEventListener("click", unlock, { once: true, capture: true });

  window.SFX = SFX;
})();
