// ゴジラ咆哮再生 v12
// - ゴジラ系: 本物の音源（Public Domain / soundbible.com）
// - その他の怪獣: ROAR_TYPES パラメータから Web Audio で合成
(function() {
  const ROAR_SRC = "sounds/godzilla-roar.m4a";
  let audio = null;
  let synthCtx = null;

  function getAudio() {
    if (!audio) {
      audio = new Audio(ROAR_SRC);
      audio.preload = "auto";
      audio.volume = 1.0;
    }
    return audio;
  }

  function playGodzillaRoar() {
    const a = getAudio();
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  function stopRoar() {
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
  }

  // ===== 合成なきごえエンジン =====
  function getSynthCtx() {
    if (!synthCtx) {
      try { synthCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (synthCtx.state === "suspended") synthCtx.resume().catch(() => {});
    return synthCtx;
  }

  function makeDistCurve(amount) {
    const n = 256, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // roarType名（ROAR_TYPESのキー）から鳴き声を合成再生。戻り値は再生秒数
  function playSynth(typeName) {
    const spec = (window.ROAR_TYPES || {})[typeName];
    const c = getSynthCtx();
    if (!spec || !c) return 0;
    const now = c.currentTime + 0.05;
    const dur = spec.duration || 1.2;

    // メインオシレータ + スイープ
    const osc = c.createOscillator();
    osc.type = spec.type || "sawtooth";
    const sweep = (spec.sweep && spec.sweep.length) ? spec.sweep : [spec.fundamental];
    osc.frequency.setValueAtTime(Math.max(20, sweep[0]), now);
    const stepT = dur / sweep.length;
    for (let i = 1; i < sweep.length; i++) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, sweep[i]), now + stepT * (i + 0.5));
    }

    // ローパスフィルタ
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = spec.filter || 2000;
    filter.Q.value = 3;

    // 音量エンベロープ
    const master = c.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.5, now + 0.06);
    master.gain.setValueAtTime(0.5, now + dur * 0.65);
    master.gain.exponentialRampToValueAtTime(0.001, now + dur);

    let head = osc;
    if (spec.distortion) {
      const ws = c.createWaveShaper();
      ws.curve = makeDistCurve(50);
      head.connect(ws);
      head = ws;
    }
    head.connect(filter);
    filter.connect(master);
    master.connect(c.destination);

    const stopAt = now + dur + 0.15;

    // growl: 低速AMでうなり
    if (spec.growl) {
      const lfo = c.createOscillator();
      lfo.frequency.value = 26;
      const lg = c.createGain();
      lg.gain.value = 0.22;
      lfo.connect(lg); lg.connect(master.gain);
      lfo.start(now); lfo.stop(stopAt);
    }
    // vibrato: FMでこえの揺れ
    if (spec.vibrato) {
      const v = c.createOscillator();
      v.frequency.value = spec.vibrato;
      const vg = c.createGain();
      vg.gain.value = Math.max(8, (spec.fundamental || 200) * 0.12);
      v.connect(vg); vg.connect(osc.frequency);
      v.start(now); v.stop(stopAt);
    }
    // ratchet: 断続ゲート（ギドラ・虫系のケケケ感）
    if (spec.ratchet) {
      const r = c.createOscillator();
      r.type = "square";
      r.frequency.value = 15;
      const rg = c.createGain();
      rg.gain.value = 0.28;
      r.connect(rg); rg.connect(master.gain);
      r.start(now); r.stop(stopAt);
    }
    // mechanical: 金属的な倍音を重ねる
    if (spec.mechanical) {
      const m = c.createOscillator();
      m.type = "square";
      m.frequency.setValueAtTime(Math.max(40, sweep[0] * 2.7), now);
      for (let i = 1; i < sweep.length; i++) {
        m.frequency.exponentialRampToValueAtTime(Math.max(40, sweep[i] * 2.7), now + stepT * (i + 0.5));
      }
      const mg = c.createGain();
      mg.gain.setValueAtTime(0.08, now);
      mg.gain.exponentialRampToValueAtTime(0.001, now + dur);
      m.connect(mg); mg.connect(filter);
      m.start(now); m.stop(stopAt);
    }
    // gurgle: どろどろ泡音（ノイズをゆっくりLPFに通してAM）
    if (spec.gurgle) {
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const noise = c.createBufferSource();
      noise.buffer = buf;
      const nf = c.createBiquadFilter();
      nf.type = "lowpass"; nf.frequency.value = 9;
      const ng = c.createGain();
      ng.gain.value = 0.3;
      noise.connect(nf); nf.connect(ng); ng.connect(master.gain);
      noise.start(now); noise.stop(stopAt);
    }
    // echo: うちゅうの残響
    if (spec.echo) {
      const delay = c.createDelay(0.5);
      delay.delayTime.value = 0.18;
      const fb = c.createGain();
      fb.gain.value = 0.3;
      const wet = c.createGain();
      wet.gain.value = 0.4;
      master.connect(delay);
      delay.connect(fb); fb.connect(delay);
      delay.connect(wet); wet.connect(c.destination);
    }

    osc.start(now);
    osc.stop(stopAt);
    return dur;
  }

  window.Roar = {
    play: playGodzillaRoar,
    playGodzilla: playGodzillaRoar,
    playType: playSynth,
    stop: stopRoar
  };

  // 初回ジェスチャーでプリロード（iOS対策）
  function preload() {
    getAudio().load();
  }
  document.addEventListener("click", preload, { once: true, capture: true });
  document.addEventListener("touchstart", preload, { once: true, capture: true });
})();
