/* 程序化音频：全部由 WebAudio 实时合成，没有任何音频文件。
 * 所有权：audio。对外接口（SPEC §5）：init / bgm / stopBgm / sfx / setVolume / duck
 */
(function () {
  'use strict';
  var VN = (window.VN = window.VN || {});

  var ctx = null, master = null, bgmBus = null, sfxBus = null, noiseBuf = null;
  var sched = null, curId = null, curTrack = null, step = 0, nextT = 0, seed = 1;
  var volume = { master: 0.9, bgm: 0.55, sfx: 0.65 };
  var ducked = false;

  /* 音名 → 频率 */
  var NOTES = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function freq(name) {
    var m = /^([A-G]#?)(-?\d)$/.exec(name);
    if (!m) return 220;
    var semi = NOTES[m[1]] + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (semi - 69) / 12);
  }
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain();
    master.gain.value = volume.master;
    var comp = ctx.createDynamicsCompressor ? ctx.createDynamicsCompressor() : null;
    if (comp) { master.connect(comp); comp.connect(ctx.destination); }
    else master.connect(ctx.destination);
    bgmBus = ctx.createGain(); bgmBus.gain.value = 1; bgmBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
    var len = Math.floor(ctx.sampleRate * 2);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  function noise(dur, when, gain, filterType, f0, f1, dest) {
    if (!ctx) return;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    var flt = ctx.createBiquadFilter();
    flt.type = filterType || 'lowpass';
    flt.frequency.setValueAtTime(f0 || 800, when);
    if (f1 != null) flt.frequency.exponentialRampToValueAtTime(Math.max(60, f1), when + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + Math.min(0.02, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
    src.connect(flt); flt.connect(g); g.connect(dest || sfxBus);
    src.start(when); src.stop(when + dur + 0.05);
  }
  function tone(when, f, dur, gain, type, dest, glide) {
    if (!ctx) return;
    var o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, when);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(30, glide), when + dur);
    var g = ctx.createGain();
    var atk = Math.min(0.06, dur * 0.25);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + atk);
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
    o.connect(g); g.connect(dest || sfxBus);
    o.start(when); o.stop(when + dur + 0.05);
  }

  /* ---------- 曲目表 ---------- */
  /* root：根音；scale：相对半音；bpm；pad：和声走向；drum：none/soft/war；wave；density：旋律密度 */
  var TRACKS = {
    departure: { root: 'D2', scale: [0, 3, 5, 7, 10], bpm: 60, pad: [[0, 3, 7], [-2, 3, 5], [-4, 0, 5], [-2, 2, 7]], padGain: 0.075, melGain: 0.05, density: 0.22, oct: 2, wave: 'triangle', drum: 'none', air: 0.05 },
    march: { root: 'A2', scale: [0, 2, 3, 7, 9], bpm: 96, pad: [[0, 3, 7], [0, 5, 7], [-2, 3, 5], [-4, 2, 5]], padGain: 0.06, melGain: 0.055, density: 0.5, oct: 2, wave: 'sawtooth', drum: 'soft', air: 0.06 },
    tense: { root: 'C2', scale: [0, 1, 5, 6], bpm: 76, pad: [[0, 1, 6], [0, 1, 6], [-1, 0, 5], [0, 1, 7]], padGain: 0.07, melGain: 0.035, density: 0.18, oct: 3, wave: 'square', drum: 'none', air: 0.05 },
    battle: { root: 'D2', scale: [0, 1, 3, 6, 8], bpm: 132, pad: [[0, 3, 6], [1, 4, 7], [0, 3, 8], [-1, 3, 6]], padGain: 0.05, melGain: 0.045, density: 0.45, oct: 3, wave: 'sawtooth', drum: 'war', air: 0.1 },
    grief: { root: 'G2', scale: [0, 3, 5, 8, 10], bpm: 54, pad: [[0, 3, 7], [-3, 0, 5], [-5, 2, 3], [-3, 0, 7]], padGain: 0.085, melGain: 0.045, density: 0.16, oct: 2, wave: 'sine', drum: 'none', air: 0.04 },
    hope: { root: 'A2', scale: [0, 2, 4, 7, 9], bpm: 72, pad: [[0, 4, 7], [-3, 2, 7], [-5, 0, 4], [-3, 2, 9]], padGain: 0.07, melGain: 0.06, density: 0.36, oct: 2, wave: 'triangle', drum: 'none', air: 0.05 },
    victory: { root: 'C3', scale: [0, 2, 4, 7, 9], bpm: 84, pad: [[0, 4, 7], [2, 5, 9], [0, 4, 12], [-1, 4, 7]], padGain: 0.075, melGain: 0.07, density: 0.42, oct: 2, wave: 'sawtooth', drum: 'soft', air: 0.05 },
    night: { root: 'E2', scale: [0, 3, 7, 10, 12], bpm: 48, pad: [[0, 3, 10], [-2, 3, 7], [0, 5, 10], [-4, 3, 8]], padGain: 0.06, melGain: 0.045, density: 0.14, oct: 3, wave: 'sine', drum: 'none', air: 0.07 },
    river: { root: 'F2', scale: [0, 2, 5, 7, 9], bpm: 66, pad: [[0, 5, 9], [-1, 4, 7], [2, 5, 9], [-3, 2, 5]], padGain: 0.06, melGain: 0.055, density: 0.4, oct: 3, wave: 'triangle', drum: 'none', air: 0.09 },
    snow: { root: 'B2', scale: [0, 2, 7, 9, 12], bpm: 58, pad: [[0, 7, 12], [-2, 5, 9], [0, 7, 14], [-4, 3, 7]], padGain: 0.055, melGain: 0.05, density: 0.3, oct: 3, wave: 'sine', drum: 'none', air: 0.1 },
    grassland: { root: 'D2', scale: [0, 2, 3, 7, 9], bpm: 50, pad: [[0, 3, 7], [-2, 3, 7], [-5, 3, 5], [-3, 0, 5]], padGain: 0.08, melGain: 0.04, density: 0.13, oct: 2, wave: 'triangle', drum: 'none', air: 0.08 },
    council: { root: 'F2', scale: [0, 2, 5, 8], bpm: 62, pad: [[0, 5, 8], [0, 5, 8], [-2, 3, 7], [-2, 3, 10]], padGain: 0.07, melGain: 0.03, density: 0.12, oct: 2, wave: 'sine', drum: 'none', air: 0.04 }
  };

  function schedule() {
    if (!ctx || !curTrack) return;
    var t = curTrack;
    var beat = 60 / t.bpm;
    var bar = beat * 4;
    while (nextT < ctx.currentTime + 0.5) {
      var when = Math.max(nextT, ctx.currentTime + 0.03);
      var rootF = freq(t.root);
      /* 和声（每小节一次） */
      if (step % 4 === 0) {
        var chord = t.pad[(step / 4 | 0) % t.pad.length];
        chord.forEach(function (semi, i) {
          var f = rootF * Math.pow(2, semi / 12);
          tone(when + i * 0.03, f, bar * 1.15, t.padGain / (i + 1.2), t.wave, bgmBus);
          tone(when + i * 0.03, f * 1.005, bar * 1.15, t.padGain / (i + 3), 'sine', bgmBus);
        });
      }
      /* 低音 */
      if (step % 2 === 0) tone(when, rootF / 2, beat * 1.8, t.padGain * 0.95, 'sine', bgmBus);
      /* 旋律 */
      if (rnd() < t.density) {
        var deg = t.scale[Math.floor(rnd() * t.scale.length)];
        var f2 = rootF * Math.pow(2, t.oct) * Math.pow(2, deg / 12);
        tone(when + beat * 0.25, f2, beat * (0.6 + rnd() * 1.2), t.melGain, t.wave, bgmBus);
      }
      /* 打击 */
      if (t.drum === 'soft' && (step % 4 === 0 || step % 4 === 2)) {
        noise(0.09, when, 0.045, 'lowpass', 180, 80, bgmBus);
      }
      if (t.drum === 'war') {
        noise(0.07, when, 0.07, 'lowpass', 220, 70, bgmBus);
        if (step % 2 === 1) noise(0.05, when, 0.035, 'highpass', 2400, 5200, bgmBus);
      }
      /* 空气感（风声/水声底噪） */
      if (t.air && step % 8 === 0) noise(bar * 1.6, when, t.air * 0.5, 'bandpass', 420, 900, bgmBus);
      step++;
      nextT += beat;
    }
  }

  function startTrack(id) {
    ensure();
    if (!ctx) return;
    clearInterval(sched);
    curId = id; curTrack = TRACKS[id] || TRACKS.departure;
    seed = 12345 + id.length * 977;
    step = 0;
    nextT = ctx.currentTime + 0.08;
    sched = setInterval(schedule, 60);
    schedule();
  }
  function stopTrack(ms) {
    clearInterval(sched);
    sched = null; curId = null; curTrack = null;
  }

  /* ---------- 音效 ---------- */
  var SFX = {
    gunfire: function (w) { for (var i = 0; i < 4; i++) noise(0.13, w + i * 0.07, 0.5, 'lowpass', 2600, 380); tone(w, 120, 0.1, 0.28, 'square', null, 48); },
    distant_gun: function (w) { for (var i = 0; i < 3; i++) noise(0.35, w + i * 0.34, 0.22, 'lowpass', 380, 120); },
    shell: function (w) { noise(0.9, w, 0.4, 'lowpass', 3200, 90); tone(w, 90, 0.7, 0.22, 'sine', null, 34); },
    horse: function (w) { for (var i = 0; i < 6; i++) noise(0.05, w + i * 0.11, 0.14, 'bandpass', 900, 300); },
    water: function (w) { noise(1.6, w, 0.2, 'bandpass', 700, 1800); },
    bell: function (w) { tone(w, 660, 1.8, 0.2, 'sine'); tone(w + 0.01, 990, 1.4, 0.1, 'sine'); tone(w + 0.02, 1320, 0.9, 0.06, 'sine'); },
    paper: function (w) { noise(0.16, w, 0.16, 'highpass', 2200, 4200); },
    footsteps: function (w) { for (var i = 0; i < 4; i++) noise(0.07, w + i * 0.26, 0.14, 'lowpass', 300, 120); },
    wind: function (w) { noise(2.6, w, 0.24, 'bandpass', 500, 1100); },
    thunder: function (w) { noise(2.2, w, 0.42, 'lowpass', 260, 70); },
    horn: function (w) { tone(w, 233, 1.1, 0.22, 'sawtooth'); tone(w + 0.02, 349, 1.0, 0.14, 'triangle'); tone(w + 0.04, 466, 0.8, 0.07, 'sine'); },
    cheer: function (w) { for (var i = 0; i < 5; i++) noise(0.36, w + i * 0.09, 0.14, 'bandpass', 900, 2400); },
    click: function (w) { tone(w, 880, 0.06, 0.14, 'square'); },
    page: function (w) { noise(0.12, w, 0.1, 'highpass', 1800, 3400); }
  };

  VN.audio = {
    init: function () {
      if (!ensure()) return false;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      return true;
    },
    bgm: function (id, opts) {
      opts = opts || {};
      if (!ensure()) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      if (curId === id) return;
      startTrack(id);
      bgmBus.gain.cancelScheduledValues(ctx.currentTime);
      bgmBus.gain.setValueAtTime(0.0001, ctx.currentTime);
      bgmBus.gain.linearRampToValueAtTime(volume.bgm, ctx.currentTime + (opts.ms || 900) / 1000);
    },
    stopBgm: function (opts) {
      opts = opts || {};
      if (!ctx) return;
      var base = ctx.currentTime;
      var ms = opts.ms || 700;
      bgmBus.gain.cancelScheduledValues(base);
      bgmBus.gain.setValueAtTime(bgmBus.gain.value, base);
      bgmBus.gain.linearRampToValueAtTime(0.0001, base + ms / 1000);
      setTimeout(function () { stopTrack(); }, ms + 40);
    },
    sfx: function (id) {
      if (!ensure()) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      var fn = SFX[id];
      if (!fn) return;
      sfxBus.gain.setValueAtTime(volume.sfx, ctx.currentTime);
      try { fn(ctx.currentTime + 0.01); } catch (e) { /* 单个音效失败不影响游戏 */ }
    },
    setVolume: function (v) {
      v = v || {};
      if (v.master != null) volume.master = v.master;
      if (v.bgm != null) {
        volume.bgm = v.bgm;
        if (ctx) { bgmBus.gain.cancelScheduledValues(ctx.currentTime); bgmBus.gain.value = ducked ? v.bgm * 0.25 : v.bgm; }
      }
      if (v.sfx != null) { volume.sfx = v.sfx; if (ctx) sfxBus.gain.value = v.sfx; }
      if (ctx && v.master != null) master.gain.value = ducked ? v.master * 0.25 : v.master;
    },
    duck: function (on) {
      if (!ctx) return;
      ducked = !!on;
      master.gain.setTargetAtTime(ducked ? volume.master * 0.25 : volume.master, ctx.currentTime, 0.2);
    },
    current: function () { return curId; },
    tracks: function () { return Object.keys(TRACKS); },
    ready: function () { return !!ctx; }
  };
})();
