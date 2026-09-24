// timeline.js: chapter registry, cuts + transitions, the automatic beat-synced edit, and the frame driver.
//
// chapter(name, start, end, shots): shots = [[t0, fn, opts?], ...] in time order. fn(t, lt, dur) paints the WHOLE frame
// into X (call style() first). opts.tin = transition INTO this shot: 'cut' (default), 'flash', 'whip', 'whipV', 'zoom',
// 'spin', 'glitch', 'shake', 'ink', 'white', 'black'; opts.td = its length in seconds (centred on the cut).
// Everything must be a pure function of t: frames render in parallel and out of order. Use hash()/rnd()/jit(), never Math.random().
const CH = [];
const POSTCARDS = {};   // name → t => paints a full frame (exported by chapters for callback montages)
function chapter(name, start, end, shots) { CH.push({ name, start, end, shots }); CH.sort((a, b) => a.start - b.start); }

// Section map (from the audio analysis). I = edit intensity: drives the automatic zoom punches, shake and RGB hits.
const SECTIONS = [
  // [startBeat, endBeat, name, intensity]
  [0, 8, 'intro', 0], [8, 64, 'p1', .35], [64, 72, 'break1', 0], [72, 128, 'p2', .7], [128, 136, 'break2', 0],
  [136, 192, 'p3', .6], [192, 200, 'break3', 0], [200, 230, 'drop', 1], [230, 232, 'gap', 0], [232, 261, 'drop', 1],
  [261, 264, 'gap', 0], [264, 320, 'p5', .45], [320, 384, 'p6', .75], [384, 392, 'break6', 0], [392, 422, 'final', 1],
  [422, 424, 'gap', 0], [424, 453, 'final', 1], [453, 470, 'outro', 0]];
const sectionAt = t => { const b = bpOf(t); return SECTIONS.find(s => b >= s[0] && b < s[1]) || SECTIONS[SECTIONS.length - 1]; };
const isPhraseStart = n => PHRASE.includes(n) || BREAKS.some(b => b[1] === n);

function findShot(t) {
  const ch = CH.find(c => t >= c.start && t < c.end); if (!ch) return null;
  let i = 0; while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
  const [t0, fn, op] = ch.shots[i], next = ch.shots[i + 1], end = next ? next[0] : ch.end;
  // transition into the next shot may belong to the next chapter
  let nxt = next; if (!nxt) { const nc = CH[CH.indexOf(ch) + 1]; if (nc && Math.abs(nc.start - end) < 1e-6) nxt = nc.shots[0]; }
  return { ch, i, t0, fn, op: op || {}, end, next: nxt };
}

// automatic edit: zoom punch on every beat, a slam on every phrase downbeat, risers in the breaks.
function autoEdit(t) {
  if (FX.noAuto) return;
  const s = sectionAt(t), I = s[3], b = bpOf(t), n = Math.floor(b), ph = b - n;
  if (I > 0) {
    const p = Math.exp(-ph * 9);
    FX.zoom *= 1 + .045 * I * p * FX.punch;
    FX.shake += 7 * I * I * p * FX.punch;
    if (I >= 1 && n % 2 === 1) FX.rgb = Math.max(FX.rgb, .25 * p);
  }
  // slam: the beat where the bass returns
  for (const pn of [...PHRASE, ...BREAKS.map(x => x[1])]) {
    const d = t - bt(pn);
    if (d >= 0 && d < .5) { const k = 1 - d / .5; FX.flash = Math.max(FX.flash, .75 * Math.pow(k, 3)); FX.rgb = Math.max(FX.rgb, k); FX.shake += 26 * k * k; FX.zoom *= 1 + .08 * easeOut(k); FX.glitch = Math.max(FX.glitch, k > .7 ? .6 : 0); }
  }
  // breaks: slow push-in; the last beat before the slam rattles
  if (I === 0 && s[2] !== 'intro' && s[2] !== 'outro') {
    const k = (b - s[0]) / (s[1] - s[0]);
    FX.zoom *= 1 + .05 * k;
    const lastBeat = s[1] - b; if (lastBeat < 1) { FX.shake += 10 * (1 - lastBeat); FX.rgb = Math.max(FX.rgb, .4 * (1 - lastBeat)); }
  }
}

// transitions: half before the cut acts on the outgoing shot, half after on the incoming one.
function applyTransition(type, k, side) {
  // k: 0 at the far edge of the transition window → 1 exactly at the cut (both sides)
  const e = easeIn(k);
  switch (type) {
    case 'flash': FX.flash = Math.max(FX.flash, Math.pow(k, 2)); break;
    case 'white': FX.flash = Math.max(FX.flash, e); FX.flashCol = '#FFF6E6'; break;
    case 'black': FX.flash = Math.max(FX.flash, e); FX.flashCol = '#0B0716'; break;
    case 'whip': FX.dx += (side < 0 ? -1 : 1) * e * W * .55; FX.blur = Math.max(FX.blur, 380 * e); FX.blurAng = 0; break;
    case 'whipV': FX.dy += (side < 0 ? -1 : 1) * e * H * .6; FX.blur = Math.max(FX.blur, 300 * e); FX.blurAng = Math.PI / 2; break;
    case 'zoom': FX.zoom *= side < 0 ? 1 + 1.6 * e : 1 + .9 * e; FX.zblur = Math.max(FX.zblur, .35 * e); break;
    case 'spin': FX.rot += (side < 0 ? 1 : -1) * e * .9; FX.zoom *= 1 + .4 * e; FX.zblur = Math.max(FX.zblur, .25 * e); break;
    case 'glitch': FX.glitch = Math.max(FX.glitch, k); FX.rgb = Math.max(FX.rgb, k); if (k > .8) FX.invert = Math.max(FX.invert, side < 0 ? 0 : .9); break;
    case 'shake': FX.shake += 40 * k * k; FX.zoom *= 1 + .1 * k; break;
    case 'ink': INK_K = side < 0 ? e : -e; break;
  }
}
let INK_K = 0;

function drawWorld(t) {
  const s = findShot(t);
  if (!s) { placeholder(t); return; }
  LT = t - s.t0;
  s.fn(t, t - s.t0, s.end - s.t0);
  CAM = null; X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  autoEdit(t);
  // incoming transition (this shot's tin), outgoing (next shot's tin)
  const tin = s.op.tin, tdi = s.op.td ?? .24;
  if (tin && tin !== 'cut' && t - s.t0 < tdi / 2) applyTransition(tin, 1 - (t - s.t0) / (tdi / 2), 1);
  if (s.next && s.next[2] && s.next[2].tin && s.next[2].tin !== 'cut') {
    const td = s.next[2].td ?? .24; if (s.end - t < td / 2) applyTransition(s.next[2].tin, 1 - (s.end - t) / (td / 2), -1);
  }
  if (INK_K) inkCover(t, INK_K);
}
// ink-blot transition: watercolour blooms swell to cover the frame, then drain away
function inkCover(t, k) {
  const cover = k > 0 ? k : -k; if (cover < .01) return;
  X.save(); X.fillStyle = PAL.ink; X.globalAlpha = 1;
  for (let i = 0; i < 9; i++) {
    const cx = hash(i * 3.1) * W, cy = hash(i * 7.7) * H, r = (220 + hash(i) * 500) * Math.pow(cover, .8) * 1.6;
    tracePath(X, deform(ellPts(cx, cy, r, r * .85, 18), r * .08), .6); X.fill();
  }
  X.restore(); INK_K = 0;
}
function placeholder(t) {
  style(1); bg(PAL.deep);
  txt('(shot not painted yet)', 960, 470, 64, PAL.nCyan, { font: 'Orbitron', glow: PAL.nCyan });
  txt(t.toFixed(2) + 's · beat ' + bpOf(t).toFixed(1) + ' · ' + sectionAt(t)[2], 960, 560, 40, PAL.nYellow, { font: 'Rajdhani' });
}

// ---------- frame driver ----------
function renderFrame(t) {
  T = t; reseed(1000 + Math.floor(t * BOIL)); resetFX(); NEON = 0; CAM = null; INK_K = 0;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none';
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  drawWorld(t);
  post(t);
}
window.renderAt = async (t, type = 'image/jpeg', q = .92) => { renderFrame(t); return OUT.toDataURL(type, q); };
window.renderSheet = async (times, cols = 3, w = 640) => {
  const h = Math.round(w * 9 / 16), rows = Math.ceil(times.length / cols), sc = mkCanvas(cols * w, rows * h), c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); renderFrame(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    c.drawImage(OUT, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x, y, 150, 26); c.fillStyle = '#fff'; c.font = '16px sans-serif';
    c.fillText(times[i].toFixed(2) + 's b' + bpOf(times[i]).toFixed(1), x + 6, y + 18);
  }
  return { url: sc.toDataURL('image/jpeg', .85), ms };
};
async function boot() {
  SC = document.getElementById('scene') || mkCanvas(W, H); X = SC.getContext('2d');
  OUT = document.getElementById('out'); O = OUT.getContext('2d', { willReadFrequently: false });
  makeTextures();
  await Promise.all(['Permanent Marker', 'Anton', 'Orbitron', 'Caveat', 'Shantell Sans', 'Rajdhani'].map(f => document.fonts.load(`40px "${f}"`)));
  if (window.onBoot) window.onBoot();
  window.ready = true;
  if (!location.search.includes('render')) devUI();
}
function devUI() {
  const s = document.getElementById('scrub'), lab = document.getElementById('tt');
  let busy = false, want = null;
  const go = async () => { if (busy) return; busy = true; while (want != null) { const t = want; want = null; const t0 = performance.now(); renderFrame(t); lab.textContent = `${t.toFixed(2)}s · ${Math.round(performance.now() - t0)} ms`; await new Promise(r => setTimeout(r, 0)); } busy = false; };
  s.addEventListener('input', () => { want = +s.value; go(); });
  want = +(new URLSearchParams(location.search).get('t') || 0); s.value = want; go();
}
window.addEventListener('load', boot);
