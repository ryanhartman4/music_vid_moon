// fx.js: the "edit" layer — everything a TikTok/Instagram edit adds on top of the footage.
// Shots paint into the scene canvas; then post() composites it into the output canvas with the frame's FX:
// zoom punches, shake, whip/zoom/spin transition blur, bloom, RGB split, glitch slices, flashes, invert, captions,
// scanlines / paper grain, vignette and letterbox. FX is reset every frame; the timeline and shots write into it.
let SC = null, OUT = null, O = null, SMALL = null, SMALL2 = null, TMP = null, TMPX = null;
let PAPER = null, GRAIN = null, SCAN = null, HALF = null, NOISE = [];
let FX = null, CAPS = [];
function resetFX() {
  FX = { zoom: 1, rot: 0, dx: 0, dy: 0, shake: 0, rgb: 0, rgbAng: 0, glitch: 0, flash: 0, flashCol: '#FFFFFF', invert: 0,
    blur: 0, blurAng: 0, zblur: 0, bloom: null, letterbox: 0, vignette: null, grain: null, scan: null, halftone: 0,
    tint: null, tintA: 0, punch: 1, sat: 1, noAuto: false, stutter: 0, ghost: 0 };
  CAPS = [];
}
// cap(s, o): screen-space caption drawn after the zoom (big edit text). Same options as txt().
function cap(s, x, y, size, col, o = {}) { CAPS.push([s, x, y, size, col, o]); }

function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function makeTextures() {
  // paper: warm cream with soft blotches and fibres
  PAPER = mkCanvas(W, H); let c = PAPER.getContext('2d'), r = lcg(11);
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H, rr = 120 + r() * 380, g = c.createRadialGradient(x, y, 0, x, y, rr), a = .05 * r(); g.addColorStop(0, `rgba(160,125,80,${a})`); g.addColorStop(1, 'rgba(160,125,80,0)'); c.fillStyle = g; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  c.lineWidth = 1;
  for (let i = 0; i < 1400; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 26, a = r() * TAU; c.strokeStyle = `rgba(110,88,60,${.03 + r() * .05})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  // grain: multiplied over watercolour frames so pigment sits in the paper, plus a warm vignette
  GRAIN = mkCanvas(W, H); c = GRAIN.getContext('2d'); r = lcg(5);
  const id = c.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (r() < .55 ? r() * r() * 38 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 4; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,95,70,.38)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // scanlines for the neon act
  SCAN = mkCanvas(W, H); c = SCAN.getContext('2d'); c.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2);
  const g2 = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.0); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,.55)');
  c.fillStyle = g2; c.fillRect(0, 0, W, H);
  // film-noise tiles (cycled per frame)
  for (let k = 0; k < 6; k++) { const n = mkCanvas(480, 270), nc = n.getContext('2d'), nd = nc.createImageData(480, 270), rr = lcg(99 + k * 7); for (let i = 0; i < nd.data.length; i += 4) { const v = rr() * 255; nd.data[i] = nd.data[i + 1] = nd.data[i + 2] = v; nd.data[i + 3] = 15; } nc.putImageData(nd, 0, 0); NOISE.push(n); }
  // halftone dots (comic overlay)
  HALF = mkCanvas(W, H); c = HALF.getContext('2d'); c.fillStyle = 'rgba(0,0,0,.5)'; for (let y = 0; y < H; y += 12) for (let x = (y / 12 % 2) * 6; x < W; x += 12) { c.beginPath(); c.arc(x, y, 2.6, 0, TAU); c.fill(); }
  SMALL = mkCanvas(240, 135); SMALL2 = mkCanvas(240, 135); TMP = mkCanvas(W, H); TMPX = TMP.getContext('2d');
}

// ---------- post ----------
function post(t) {
  const o = O, f = FX;
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.filter = 'none';
  o.fillStyle = NEON >= .5 ? PAL.void : '#2A2330'; o.fillRect(0, 0, W, H);
  const [sx, sy] = f.shake > .5 ? shakeXY(t, f.shake) : [0, 0];
  const place = (z = 1, dx = 0, dy = 0, rot = 0) => { o.setTransform(1, 0, 0, 1, 0, 0); o.translate(W / 2 + f.dx + sx + dx, H / 2 + f.dy + sy + dy); o.rotate(f.rot + rot); o.scale(f.zoom * z, f.zoom * z); o.translate(-W / 2, -H / 2); };
  // base + directional / zoom blur (whips, zoom transitions): stacked translucent copies
  place(); o.drawImage(SC, 0, 0);
  // whips slide the frame: fill the exposed edge with a wrapped copy so no black band shows
  if (Math.abs(f.dx) > 2) { place(1, -Math.sign(f.dx) * W * f.zoom); o.drawImage(SC, 0, 0); }
  if (Math.abs(f.dy) > 2) { place(1, 0, -Math.sign(f.dy) * H * f.zoom); o.drawImage(SC, 0, 0); }
  if (f.blur > .5) { const n = 6; for (let i = 1; i <= n; i++) { place(1, Math.cos(f.blurAng) * f.blur * i / n, Math.sin(f.blurAng) * f.blur * i / n); o.globalAlpha = .24; o.drawImage(SC, 0, 0); } }
  if (f.zblur > .005) { for (let i = 1; i <= 5; i++) { place(1 + f.zblur * i / 5); o.globalAlpha = .2; o.drawImage(SC, 0, 0); } }
  if (f.ghost > .01) { place(1.04 + f.ghost * .1); o.globalAlpha = .25 * f.ghost; o.globalCompositeOperation = 'lighter'; o.drawImage(SC, 0, 0); o.globalCompositeOperation = 'source-over'; }
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1;
  // paper grain (watercolour) / bloom (neon)
  const bloom = f.bloom ?? (NEON >= .5 ? .55 : 0);
  if (NEON < .5 && (f.grain ?? 1) > 0) { o.globalCompositeOperation = 'multiply'; o.globalAlpha = f.grain ?? 1; o.drawImage(GRAIN, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; }
  if (bloom > .01) doBloom(bloom);
  if (f.sat !== 1) { o.globalCompositeOperation = 'saturation'; o.fillStyle = `hsl(0,0%,50%)`; o.globalAlpha = clamp(1 - f.sat); o.fillRect(0, 0, W, H); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; }
  if (f.tint && f.tintA > .01) { o.globalCompositeOperation = 'color'; o.globalAlpha = f.tintA; o.fillStyle = f.tint; o.fillRect(0, 0, W, H); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; }
  if (f.halftone > .01) { o.globalCompositeOperation = 'overlay'; o.globalAlpha = f.halftone; o.drawImage(HALF, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; }
  // captions (after the zoom, before the glitch so they glitch too)
  if (CAPS.length) { const keep = X; X = o; for (const c of CAPS) { const [s, x, y, size, col, op] = c; const [cx, cy] = op.follow ? [x + sx * .6, y + sy * .6] : [x, y]; txt(s, cx, cy, size, col, op); } X = keep; }
  if (f.rgb > .02) rgbSplit(f.rgb, f.rgbAng);
  if (f.glitch > .02) glitchSlices(t, f.glitch);
  if (f.invert > .02) { o.globalCompositeOperation = 'difference'; o.globalAlpha = clamp(f.invert); o.fillStyle = '#FFFFFF'; o.fillRect(0, 0, W, H); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; }
  if (f.flash > .01) { o.globalAlpha = clamp(f.flash); o.fillStyle = f.flashCol; o.fillRect(0, 0, W, H); o.globalAlpha = 1; }
  // neon: scanlines + noise; both: letterbox
  if ((f.scan ?? (NEON >= .5 ? 1 : 0)) > 0) { o.globalAlpha = f.scan ?? 1; o.drawImage(SCAN, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'overlay'; o.drawImage(NOISE[Math.floor(t * 12) % NOISE.length], 0, 0, W, H); o.globalCompositeOperation = 'source-over'; }
  if (f.letterbox > .01) { const h = f.letterbox * 135; o.fillStyle = '#000'; o.fillRect(0, 0, W, h); o.fillRect(0, H - h, W, h); }
}
function doBloom(k) {
  const s = SMALL.getContext('2d', { willReadFrequently: true }), s2 = SMALL2.getContext('2d');
  s.globalCompositeOperation = 'source-over'; s.drawImage(OUT, 0, 0, 240, 135);
  const id = s.getImageData(0, 0, 240, 135), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const m = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]), sat = m ? (m - mn) / m : 0, kk = clamp((m - 170) / 70) * (.12 + .88 * Math.pow(sat, .8)); d[i] *= kk; d[i + 1] *= kk; d[i + 2] *= kk; }
  s.putImageData(id, 0, 0);
  s2.clearRect(0, 0, 240, 135); s2.filter = 'blur(4px)'; s2.drawImage(SMALL, 0, 0); s2.filter = 'none';
  O.globalCompositeOperation = 'lighter'; O.globalAlpha = k; O.imageSmoothingEnabled = true; O.drawImage(SMALL2, 0, 0, W, H);
  O.globalAlpha = k * .5; s2.filter = 'blur(10px)'; s2.drawImage(SMALL, 0, 0); s2.filter = 'none'; O.drawImage(SMALL2, 0, 0, W, H);
  O.globalCompositeOperation = 'source-over'; O.globalAlpha = 1;
}
// chromatic split: red shifted one way, blue the other (and a touch of radial scale)
function rgbSplit(k, ang = 0) {
  const d = Math.round(6 + 26 * k), dx = Math.round(Math.cos(ang) * d), dy = Math.round(Math.sin(ang) * d);
  TMPX.globalCompositeOperation = 'copy'; TMPX.drawImage(OUT, 0, 0);
  // keep only red of a shifted copy, only blue of the opposite copy, green from the original
  const o = O;
  o.globalCompositeOperation = 'source-over'; o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
  o.globalCompositeOperation = 'lighter';
  drawChannel(o, '#FF0000', dx, dy); drawChannel(o, '#00FF00', 0, 0); drawChannel(o, '#0000FF', -dx, -dy);
  o.globalCompositeOperation = 'source-over';
}
let CH_C = null;
function drawChannel(o, col, ox, oy) {
  if (!CH_C) CH_C = mkCanvas(W, H);
  const c = CH_C.getContext('2d'); c.globalCompositeOperation = 'copy'; c.drawImage(TMP, 0, 0);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = col; c.fillRect(0, 0, W, H);
  o.drawImage(CH_C, ox, oy);
}
function glitchSlices(t, k) {
  const f = Math.floor(t * 30), n = Math.round(3 + 9 * k);
  TMPX.globalCompositeOperation = 'copy'; TMPX.drawImage(OUT, 0, 0);
  for (let i = 0; i < n; i++) {
    const y = Math.floor(hash(f * 13 + i * 7) * H), h = Math.floor(8 + hash(f * 3 + i) * 90 * k), dx = (hash(f * 5 + i * 11) - .5) * 260 * k;
    O.drawImage(TMP, 0, y, W, h, dx, y, W, h);
    if (hash(i * 3 + f) < .3 * k) { O.globalCompositeOperation = 'lighter'; O.globalAlpha = .35; O.fillStyle = hash(i + f) < .5 ? PAL.nCyan : PAL.nMagenta; O.fillRect(0, y, W, h); O.globalAlpha = 1; O.globalCompositeOperation = 'source-over'; }
  }
}
