// ゴジラずかん BGM - 本物のゴジラテーマ (1954 Main Title / 伊福部昭)
(function() {
  const STORAGE_KEY = "godzilla_zukan_bgm_v2";
  const BGM_SRC = "sounds/godzilla-theme.m4a";
  const VOLUME_NORMAL = 0.5;
  const VOLUME_DUCKED = 0.12;

  let audio = null;
  let isPlaying = false;
  let savedShouldPlay = loadState();

  function createAudio() {
    if (audio) return audio;
    audio = new Audio(BGM_SRC);
    audio.loop = true;
    audio.volume = VOLUME_NORMAL;
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      // loop=true なので来ないはずだが念のため
      if (savedShouldPlay) audio.play().catch(() => {});
    });
    audio.addEventListener("play", () => { isPlaying = true; updateButton(); });
    audio.addEventListener("pause", () => { isPlaying = false; updateButton(); });
    return audio;
  }

  function start() {
    createAudio();
    audio.volume = VOLUME_NORMAL;
    const p = audio.play();
    if (p && p.catch) {
      p.catch((e) => {
        // 自動再生ブロック - 次のユーザー操作で再試行
        console.log("BGM autoplay blocked, will retry on next gesture");
      });
    }
    savedShouldPlay = true;
    saveState(true);
    updateButton();
  }

  function stop() {
    if (audio) audio.pause();
    savedShouldPlay = false;
    saveState(false);
    updateButton();
  }

  function toggle() {
    if (isPlaying) stop();
    else start();
  }

  // TTSダッキング - 音量を下げる
  function duck() {
    if (audio && isPlaying) {
      smoothVolume(audio.volume, VOLUME_DUCKED, 300);
    }
  }

  function unduck() {
    if (audio && isPlaying) {
      smoothVolume(audio.volume, VOLUME_NORMAL, 500);
    }
  }

  function smoothVolume(from, to, durationMs) {
    if (!audio) return;
    const start = performance.now();
    const step = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / durationMs, 1);
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function saveState(playing) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ playing }));
    } catch {}
  }

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return s && typeof s.playing === "boolean" ? s.playing : true;
    } catch {
      return true;
    }
  }

  function updateButton() {
    const btn = document.getElementById("bgm-btn");
    if (btn) {
      btn.textContent = isPlaying ? "🎵" : "🔇";
      btn.classList.toggle("on", isPlaying);
    }
  }

  // 公開API
  window.BGM = {
    start, stop, toggle, duck, unduck,
    isPlaying: () => isPlaying,
    updateButton
  };

  // 初回ジェスチャー検出（自動再生ポリシー対応）
  function tryAutoplay() {
    if (savedShouldPlay && !isPlaying) start();
  }

  document.addEventListener("click", tryAutoplay, true);
  document.addEventListener("touchstart", tryAutoplay, true);

  // DOM ready後にボタン設定
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("bgm-btn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle();
      });
    }
    updateButton();
    // プリロード開始
    createAudio();
  });
})();
