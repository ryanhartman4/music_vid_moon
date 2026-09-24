// core.js: constants, timing helpers, seeded jitter, geometry, the two-style paint() wrapper, camera, text.
// Every frame is a pure function of song time t. Shots paint into the scene context X (1920x1080, y down).
const W = 1920, H = 1080, FPS = 30, BOIL = 12, TAU = Math.PI * 2;

// ---------- palettes ----------
// Watercolour act: warm paper, lamp ochre, night indigo. Neon act: near-black violet, neon yellow/cyan/magenta.
const PAL = {
  paper: '#F3EBDC', ink: '#2B2233', cream: '#FFF6E6', night: '#1F2550', indigo: '#2F3C7A', ochre: '#E8AA38',
  rose: '#E27A92', clay: '#D97757', sap: '#6E9F58', teal: '#3A9C98', violet: '#7B5CA8', sky: '#8EC3E6', slate: '#56627E',
  // neon
  void: '#0B0716', deep: '#160E2E', plum: '#2A1648', nYellow: '#F5F03A', nCyan: '#27F2F2', nMagenta: '#FF2E88',
  nPink: '#FF6FB5', nOrange: '#FF8A1F', nRed: '#FF2442', nGreen: '#48FF8A', nViolet: '#9B5CFF', line: '#0B0716',
  mask: '#F7D35A', maskDk: '#D9A72E'
};

// ---------- math / timing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const expoOut = x => { x = clamp(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); };
const expoIn = x => { x = clamp(x); return x === 0 ? 0 : Math.pow(2, 10 * x - 10); };
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1; };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const hash2 = (i, j) => hash(i * 71.3 + j * 17.9);
const frac = x => x - Math.floor(x);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
const bpOf = t => (t - OFF) / BEAT;                           // beat position (float)
const beatN = t => Math.floor(bpOf(t));
const pulse = (t, k = 6) => Math.exp(-frac(bpOf(t)) * k);      // 1 on every beat, decays
const pulse2 = (t, k = 6) => Math.exp(-frac(bpOf(t) * 2) * k); // same on eighths
const pulseBar = (t, k = 3) => Math.exp(-frac(bpOf(t) / 4) * k * 4 / 4);
const since = (t, n) => t - bt(n);                              // seconds since beat n
const onTwos = t => Math.floor(t * 12) / 12;                    // anime "on twos" (12 fps motion)
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
    return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
  }
  return keys[keys.length - 1][1];
}
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1, 7), 16), pb = parseInt(b.slice(1, 7), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
const rgba = (hex, a) => { const p = parseInt(hex.slice(1, 7), 16); return `rgba(${(p >> 16) & 255},${(p >> 8) & 255},${p & 255},${clamp(a)})`; };
const shakeXY = (t, amt) => { const f = Math.floor(t * 30); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };

// ---------- seeded randomness ----------
// rnd() is reseeded at the start of every frame from the boil frame (12/s), so linework "boils" like hand-drawn animation.
let _seed = 1;
const rnd = () => { _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0; let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const jit = a => (rnd() * 2 - 1) * a;
function reseed(s) { _seed = s | 0; }

// ---------- style ----------
// NEON: 0 = watercolour + ink on paper, 1 = neon anime cel (flat fills, hard shade, black lineart, glow).
// Values in between give the hybrid (watercolour fills with neon lineart). Shots call style(v) first.
let NEON = 0, X = null, T = 0, LT = 0;
// U: pixels per drawing unit for fixed-size jitter (set by rigs that scale the context, e.g. hero() sets U = h/100). Keep 1 otherwise.
let U = 1;
function style(v) { NEON = v; }

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)], [x + w + jit(j) * .5, y + h / 2],
    [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5], [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function rrPts(x, y, w, h, r, j = 0) {
  const p = [], sg = 4, corner = (cx, cy, a0) => { for (let i = 0; i <= sg; i++) { const a = a0 + i / sg * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  r = Math.min(r, w / 2, h / 2);
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
function starPts(cx, cy, r, inner = .42, n = 5, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
function polyPts(cx, cy, r, n, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
// transform a point list
const xform = (pts, dx, dy, s = 1, rot = 0) => pts.map(([x, y]) => { const c = Math.cos(rot), si = Math.sin(rot); return [dx + (x * c - y * si) * s, dy + (x * si + y * c) * s]; });
// capsule / tapered limb between two points (w0, w1 = half widths)
function capsule(x0, y0, x1, y1, w0, w1, n = 7) {
  const a = Math.atan2(y1 - y0, x1 - x0), p = [];
  for (let i = 0; i <= n; i++) { const q = a - Math.PI / 2 - i / n * Math.PI; p.push([x0 + Math.cos(q) * w0, y0 + Math.sin(q) * w0]); }
  for (let i = 0; i <= n; i++) { const q = a + Math.PI / 2 - i / n * Math.PI; p.push([x1 + Math.cos(q) * w1, y1 + Math.sin(q) * w1]); }
  return p;
}
// tapered ribbon along a spine (tentacles, tails, trails): w(k) gives the half width at 0..1
function ribbon(spine, w) {
  const L = [], R = [], n = spine.length;
  for (let i = 0; i < n; i++) {
    const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, ww = w(i / (n - 1));
    L.push([spine[i][0] + Math.cos(ang) * ww, spine[i][1] + Math.sin(ang) * ww]); R.push([spine[i][0] - Math.cos(ang) * ww, spine[i][1] - Math.sin(ang) * ww]);
  }
  return L.concat(R.reverse());
}

// ---------- path building ----------
function tracePath(c, pts, curv = 0, close = true) {
  c.beginPath();
  const n = pts.length; if (n < 2) return;
  if (!curv) { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) c.lineTo(pts[i][0], pts[i][1]); if (close) c.closePath(); return; }
  if (close) {
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = m(pts[n - 1], pts[0]); c.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); c.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
    c.closePath();
  } else {
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) { const q = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; c.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); }
    c.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
}
const deform = (pts, a) => pts.map(([x, y]) => [x + jit(a), y + jit(a)]);
// a bent limb as ONE shape (so watercolour layers don't pool at the joint): spine points + half widths, round caps
function limbPts(sp, ws, cap = 5) {
  const n = sp.length, L = [], R = [];
  const nrm = i => { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d]; };
  for (let i = 0; i < n; i++) { const [nx, ny] = nrm(i); L.push([sp[i][0] + nx * ws[i], sp[i][1] + ny * ws[i]]); R.push([sp[i][0] - nx * ws[i], sp[i][1] - ny * ws[i]]); }
  const capPts = (p, q, w, dir) => { const a0 = Math.atan2(q[1] - p[1], q[0] - p[0]), out = []; for (let k = 1; k < cap; k++) { const a = a0 + dir * (Math.PI / 2 - k / cap * Math.PI); out.push([p[0] + Math.cos(a) * w, p[1] + Math.sin(a) * w]); } return out; };
  const end = capPts(sp[n - 1], sp[n - 1].map((v, j) => v + (sp[n - 1][j] - sp[n - 2][j])), ws[n - 1], 1);
  const start = capPts(sp[0], sp[0].map((v, j) => v - (sp[1][j] - sp[0][j])), ws[0], 1);
  return [...L, ...end, ...R.reverse(), ...start];
}

// ---------- paint ----------
// paint(pts, o): one shape.
//   fill: base colour.  alpha: overall opacity.  shade: darker colour for the cel shadow / watercolour settle.
//   light: [dx, dy] offset of the lit part (cel) — the shade shows on the opposite side. Default [-.08, -.1] of size.
//   ink: outline colour (null = none).  sw: outline weight (px at zoom 1).  curv: smooth outline.
//   glow: neon glow colour (neon mode) — adds an additive halo.  wet: watercolour edge wobble (px).  flat: skip layering.
//   hatch: {col, gap, ang, w} dry-brush hatching (watercolour) / speed lines (neon), clipped to the shape.
function paint(pts, o = {}) {
  const c = X, a = o.alpha ?? 1, curv = o.curv || 0;
  if (a <= 0.003) return;
  const neon = NEON >= .5;
  if (o.fill) {
    if (!neon && !o.flat) {
      // watercolour: a few jittered translucent layers, darker settle at the edges
      const wet = o.wet ?? 5 / U, n = o.layers ?? 3;
      c.globalAlpha = a * (o.op ?? .9) / Math.sqrt(n) * .95;
      c.fillStyle = o.fill;
      for (let i = 0; i < n; i++) { tracePath(c, deform(pts, wet), curv); c.fill(); }
      if (o.shade) {
        c.save(); tracePath(c, pts, curv); c.clip();
        const bb = bbox(pts), [lx, ly] = o.light || [-.1, -.14];
        c.globalAlpha = a * .45; c.fillStyle = o.shade;
        tracePath(c, deform(xform(pts, -lx * bb.w * -1, -ly * bb.h * -1), wet * 1.5), curv);
        c.rect(bb.x - bb.w, bb.y - bb.h, bb.w * 3, bb.h * 3); c.fill('evenodd');
        c.restore();
      }
      c.globalAlpha = a * .22; c.strokeStyle = o.shade || o.fill; c.lineWidth = 3 / U;
      tracePath(c, deform(pts, wet * .6), curv); c.stroke();
    } else {
      c.globalAlpha = a * (o.op ?? 1); c.fillStyle = o.fill;
      tracePath(c, pts, curv); c.fill();
      if (o.shade && neon) {
        // hard cel shadow: the shape minus a copy shifted toward the light
        c.save(); tracePath(c, pts, curv); c.clip();
        const bb = bbox(pts), [lx, ly] = o.light || [-.1, -.14];
        c.fillStyle = o.shade; c.globalAlpha = a;
        tracePath(c, xform(pts, lx * bb.w, ly * bb.h), curv);
        c.rect(bb.x - bb.w * 2, bb.y - bb.h * 2, bb.w * 5, bb.h * 5); c.fill('evenodd');
        if (o.rim) { c.fillStyle = o.rim; c.globalAlpha = a * .9; tracePath(c, xform(pts, -lx * bb.w * .35, -ly * bb.h * .35), curv); c.rect(bb.x - bb.w * 2, bb.y - bb.h * 2, bb.w * 5, bb.h * 5); c.fill('evenodd'); }
        c.restore();
      }
    }
  }
  if (o.hatch) {
    const h = o.hatch; c.save(); tracePath(c, pts, curv); c.clip();
    const bb = bbox(pts), g = h.gap || 12, ang = h.ang ?? .8, cs = Math.cos(ang), sn = Math.sin(ang), R = Math.hypot(bb.w, bb.h);
    c.strokeStyle = h.col || PAL.ink; c.lineWidth = h.w || 1.2; c.globalAlpha = a * (h.op ?? .35);
    c.beginPath();
    for (let d = -R; d < R; d += g) {
      const cx = bb.x + bb.w / 2 + cs * d, cy = bb.y + bb.h / 2 + sn * d, j = neon ? 0 : jit(g * .3);
      c.moveTo(cx - sn * R + j, cy + cs * R); c.lineTo(cx + sn * R + j, cy - cs * R);
    }
    c.stroke(); c.restore();
  }
  if (o.glow && NEON > .3) glowPath(pts, o.glow, o.glowW ?? 1, curv, a * (o.glowA ?? 1));
  if (o.ink !== null) {
    const sw = (o.sw ?? 2);
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (!neon) {
      // hand-inked: a boiling main stroke plus a thin offset echo
      c.globalAlpha = a * .92; c.strokeStyle = o.ink || PAL.ink; c.lineWidth = sw * 1.6;
      tracePath(c, deform(pts, sw * .5 + .6 / U), curv); c.stroke();
      c.globalAlpha = a * .35; c.lineWidth = sw * .6; tracePath(c, deform(pts, sw * 1.1 + 1 / U), curv); c.stroke();
    } else {
      c.globalAlpha = a; c.strokeStyle = o.ink || PAL.line; c.lineWidth = sw * 1.8;
      tracePath(c, pts, curv); c.stroke();
    }
  }
  c.globalAlpha = 1;
}
function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return { x: x0, y: y0, w: x1 - x0 || 1, h: y1 - y0 || 1 }; }
// additive neon halo around a path (3 widening passes)
function glowPath(pts, col, w = 1, curv = 0, a = 1, close = true) {
  const c = X; c.save(); c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = col;
  tracePath(c, pts, curv, close);
  c.globalAlpha = .07 * a; c.lineWidth = 34 * w; c.stroke();
  c.globalAlpha = .14 * a; c.lineWidth = 16 * w; c.stroke();
  c.globalAlpha = .35 * a; c.lineWidth = 6 * w; c.stroke();
  c.restore();
}
// a neon tube line: halo + bright core
function neonLine(pts, col, w = 3, a = 1, curv = .5, close = false) {
  const c = X; c.save(); c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round'; c.lineCap = 'round';
  tracePath(c, pts, curv, close); c.strokeStyle = col;
  c.globalAlpha = .08 * a; c.lineWidth = w * 9; c.stroke();
  c.globalAlpha = .2 * a; c.lineWidth = w * 4; c.stroke();
  c.globalAlpha = .9 * a; c.lineWidth = w; c.stroke();
  c.strokeStyle = '#FFFFFF'; c.globalAlpha = .55 * a; c.lineWidth = w * .4; c.stroke();
  c.restore();
}
// plain stroke along a path (style-aware)
function line(pts, sw = 2, col = PAL.ink, curv = .5, a = 1, close = false) {
  const c = X; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = col;
  if (NEON < .5) { c.globalAlpha = a * .9; c.lineWidth = sw * 1.5; tracePath(c, deform(pts, sw * .4 + .5), curv, close); c.stroke(); }
  else { c.globalAlpha = a; c.lineWidth = sw * 1.6; tracePath(c, pts, curv, close); c.stroke(); }
  c.globalAlpha = 1;
}
// soft radial glow blob (light pools, halos) — works in both styles
function glow(x, y, r, col, a = .5, comp = 'lighter') {
  const c = X, g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(.4, rgba(col, a * .45)); g.addColorStop(1, rgba(col, 0));
  c.save(); c.globalCompositeOperation = comp; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
// full-rect vertical gradient (skies, walls)
function vgrad(x, y, w, h, stops, a = 1) {
  const c = X, g = c.createLinearGradient(0, y, 0, y + h); for (const [k, col] of stops) g.addColorStop(k, col);
  c.globalAlpha = a; c.fillStyle = g; c.fillRect(x, y, w, h); c.globalAlpha = 1;
}
// watercolour wash: soft blotchy layers + a darker pooled edge (skies, walls, big backgrounds in the watercolour act)
function wash(pts, col, a = .5, wet = 18, n = 4) {
  const c = X; c.fillStyle = col;
  for (let i = 0; i < n; i++) { c.globalAlpha = a / n * 1.6 * (i === 0 ? .8 : 1); tracePath(c, deform(pts, wet * (1 + i * .35)), .6); c.fill(); }
  c.globalAlpha = a * .28; c.strokeStyle = mixCol(col, '#1A1020', .35); c.lineWidth = 2.5; tracePath(c, deform(pts, wet * .5), .6); c.stroke();
  c.globalAlpha = 1;
}
// granulated pigment blooms inside a region (watercolour texture for big flats): n soft blots of col
function blooms(x, y, w, h, col, n = 10, a = .12, seed = 1) {
  for (let i = 0; i < n; i++) { const bx = x + hash(i * 3.7 + seed) * w, by = y + hash(i * 5.3 + seed) * h, r = (.08 + hash(i * 1.9 + seed) * .22) * Math.max(w, h); wash(ellPts(bx, by, r, r * (.6 + hash(i + seed) * .5), 14), col, a, r * .15, 2); }
}
function bg(col) { X.fillStyle = col; X.fillRect(-200, -200, W + 400, H + 400); }

// ---------- time remaps (edit tricks inside a shot) ----------
// stutter: repeat the first `len` seconds of every `every`-second window (TikTok stutter / "glitch repeat")
const stutter = (lt, every = BEAT / 2, len = BEAT / 4) => Math.floor(lt / every) * every + (lt % every) % len;
// speed ramp: slow-mo until `at` (fraction of dur), then snap forward — returns remapped local time
const ramp = (lt, dur, slow = .25, at = .6) => { const a = dur * at; return lt < a ? lt * slow : a * slow + (lt - a) * (dur - a * slow) / (dur - a); };
// hold: freeze the shot's clock at `at` seconds after `from`
const hold = (lt, from, len) => lt < from ? lt : lt < from + len ? from : lt - len;

// ---------- split style: part of the frame watercolour, part neon (the world being "re-rendered") ----------
// splitStyle(draw, clip): draw(neon) is called twice (style 0 then style 1); clip(ctx) builds a path — inside it shows neon.
let SC2 = null;
function splitStyle(draw, clipFn, edgeCol = PAL.nCyan) {
  if (!SC2) SC2 = mkCanvas(W, H);
  style(0); draw(0);
  const keep = X, keepN = NEON; X = SC2.getContext('2d'); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  X.clearRect(0, 0, W, H); style(1); draw(1); X = keep;
  X.save(); X.beginPath(); clipFn(X); X.clip(); X.drawImage(SC2, 0, 0); X.restore();
  X.save(); X.beginPath(); clipFn(X); X.globalCompositeOperation = 'lighter'; X.strokeStyle = edgeCol; X.lineWidth = 18; X.globalAlpha = .15; X.stroke(); X.lineWidth = 6; X.globalAlpha = .5; X.stroke(); X.lineWidth = 2; X.globalAlpha = 1; X.strokeStyle = '#FFFFFF'; X.stroke(); X.restore();
  style(.75);   // post-processing: bloom + scanlines on, paper grain off
}

// ---------- camera ----------
let CAM = null;
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { X.save(); X.translate(W / 2, H / 2); X.rotate(rot); X.scale(zoom, zoom); X.translate(-cx, -cy); CAM = { cx, cy, zoom, rot }; }
function camEnd() { X.restore(); CAM = null; }
function toScreen(x, y) { if (!CAM) return [x, y]; const c = Math.cos(CAM.rot), s = Math.sin(CAM.rot), dx = (x - CAM.cx) * CAM.zoom, dy = (y - CAM.cy) * CAM.zoom; return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c]; }

// ---------- text ----------
// fonts: 'Marker' (painted lettering), 'Anton' (edit captions), 'Orbitron' (HUD), 'Caveat' (handwriting), 'Shantell', 'Rajdhani', 'JP' (katakana/kanji signs)
const FONTS = { Marker: '"Permanent Marker"', Anton: 'Anton', Orbitron: 'Orbitron', Caveat: 'Caveat', Shantell: '"Shantell Sans"', Rajdhani: 'Rajdhani', JP: '"IPAGothic", "IPAPGothic", sans-serif' };
// txt(s, x, y, size, col, o): o.font, o.align, o.rot, o.pop (0..1 with overshoot), o.alpha, o.stroke (outline colour), o.sw,
// o.glow (neon halo colour), o.shadow (drop shadow colour), o.weight, o.track (letter spacing px), o.skew
function txt(s, x, y, size, col, o = {}) {
  const c = X, k = o.pop != null ? backOut(o.pop) : 1; if (k <= .01 || (o.alpha ?? 1) <= .01) return;
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.skew) c.transform(1, 0, o.skew, 1, 0, 0); c.scale(k * (o.sx ?? 1), k);
  c.font = `${o.weight || ''} ${size}px ${FONTS[o.font || 'Anton'] || o.font}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  if (o.track != null) c.letterSpacing = o.track + 'px';
  c.globalAlpha = o.alpha ?? 1;
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = o.glow; c.shadowColor = o.glow; c.shadowBlur = size * .5; c.globalAlpha = (o.alpha ?? 1) * .8; c.fillText(s, 0, 0); c.restore(); }
  if (o.shadow) { c.fillStyle = o.shadow; c.fillText(s, size * .05, size * .06); }
  if (o.stroke) { c.lineJoin = 'round'; c.lineWidth = o.sw ?? size * .14; c.strokeStyle = o.stroke; c.strokeText(s, 0, 0); }
  c.fillStyle = col; c.fillText(s, 0, 0);
  c.restore();
}
function txtW(s, size, font = 'Anton') { X.font = `${size}px ${FONTS[font] || font}`; return X.measureText(s).width; }
