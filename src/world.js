// world.js: shared sets and props. Every function works in both styles (NEON < .5 watercolour, >= .5 neon cel).
//   skyNight(t, o) · stars(t, n, o) · moon(x, y, r, o) · earth(x, y, r, o) · city(t, o) · rain(t, o) · speedLines(cx, cy, k, o)
//   room(t, o) · desk(x, y, s, o) · monitor(x, y, w, h, o, drawScreen) · chart(x, y, w, h, kind, k, o) · battery(x, y, s, v, o)
//   stamp(x, y, s, word, col, k, o) · emdash(x, y, s, ang, o) · rack(x, y, s, o) · gpu(x, y, s, o) · paperclip(x, y, s, rot, o)
//   rocket(x, y, s, o) · train(x, y, s, o) · dysonSphere(x, y, r, build, o) · hud(x, y, w, h, o) · afterimages(n, gap, fn)
//   sisyphus/boulder(x, y, r, o) · parrot(x, y, s, o) · signBoard(x, y, w, h, text, col, o)

// ---------- skies ----------
function skyNight(t, o = {}) {
  if (NEON < .5) {
    X.drawImage(PAPER, 0, 0);
    const top = o.top || PAL.night, bot = o.bot || PAL.violet;
    wash(rectPts(-60, -60, W + 120, H * .75, 30), top, .85, 30, 4);
    wash(rectPts(-60, H * .35, W + 120, H * .55, 30), bot, .45, 30, 3);
    if (o.glowCol) wash(ellPts(o.gx ?? W * .5, o.gy ?? H * .8, W * .6, H * .25, 20, 30), o.glowCol, .35, 30, 3);
  } else {
    vgrad(0, 0, W, H, o.stops || [[0, '#0B0716'], [.5, '#1C0F3A'], [.8, '#4A1650'], [1, '#FF2E88']]);
  }
}
function stars(t, n = 80, o = {}) {
  const seed = o.seed || 3, ext = o.ext || [W, H * .7], neon = NEON >= .5;
  for (let i = 0; i < n; i++) {
    const x = hash(i * 3.3 + seed) * ext[0] + (o.x0 || 0), y = hash(i * 7.1 + seed) * ext[1] + (o.y0 || 0), tw = .5 + .5 * Math.sin(t * (1 + hash(i) * 3) + i), r = (1 + hash(i * 1.7) * 2.2) * (o.size || 1);
    if (neon) { X.fillStyle = hash(i) < .2 ? PAL.nCyan : '#FFFFFF'; X.globalAlpha = .5 + .5 * tw; X.fillRect(x - r / 2, y - r / 2, r, r); if (r > 2.6) glow(x, y, r * 5, '#FFFFFF', .25 * tw); }
    else { X.fillStyle = PAL.cream; X.globalAlpha = .55 + .4 * tw; X.beginPath(); X.arc(x + jit(.6), y + jit(.6), r * .8, 0, TAU); X.fill(); }
  }
  X.globalAlpha = 1;
}
function moon(x, y, r, o = {}) {
  const neon = NEON >= .5, A = o.alpha ?? 1;
  if (neon) { glow(x, y, r * 3.2, o.halo || '#FFE9A8', .35 * A); glow(x, y, r * 1.7, '#FFFFFF', .25 * A); }
  else wash(ellPts(x, y, r * 1.6, r * 1.6, 24), PAL.cream, .25 * A, 10, 3);
  paint(ellPts(x, y, r, r, 40), { fill: o.col || (neon ? '#FFF4D8' : '#F7EEDC'), shade: neon ? '#E9C98E' : '#D8C8A8', light: o.light || [-.12, -.1], ink: neon ? null : PAL.ink, sw: clamp(r / 90, .5, 2), alpha: A, wet: r * .02, rim: neon ? '#FFFFFF' : undefined });
  const cr = [[-.3, -.25, .22], [.28, .1, .16], [-.05, .38, .12], [.35, -.38, .09], [-.45, .2, .08]];
  for (const [cx, cy, cr2] of cr) paint(ellPts(x + cx * r, y + cy * r, cr2 * r, cr2 * r * .9, 14), { fill: neon ? '#E6D2A4' : '#E3D3B5', ink: null, alpha: A * .8, wet: r * .01 });
  if (o.face) mask(x, y, r * .98, { ...o.face, alpha: (o.faceA ?? 1) * A, glow: 0, col: neon ? '#FFF4D8' : '#F7EEDC' });
}
function earth(x, y, r, o = {}) {
  const neon = NEON >= .5, A = o.alpha ?? 1;
  if (neon) glow(x, y, r * 1.5, PAL.nCyan, .35 * A);
  paint(ellPts(x, y, r, r, 40), { fill: neon ? '#1D3F9E' : '#4F7FC2', shade: neon ? '#0A1440' : PAL.indigo, light: o.light || [.15, -.1], ink: neon ? null : PAL.ink, sw: 1.2, alpha: A, wet: r * .02 });
  X.save(); tracePath(X, ellPts(x, y, r, r, 40)); X.clip();
  const lands = [[-.3, -.3, .38, .25], [.25, .15, .3, .38], [-.15, .45, .22, .12], [.5, -.45, .18, .14]];
  const sp = (o.spin ?? T * .05) * r;
  for (const [lx, ly, rx, ry] of lands) for (const off of [0, -2 * r]) paint(deform(ellPts(x + lx * r + ((sp % (2 * r)) + off), y + ly * r, rx * r, ry * r, 14), r * .05), { fill: neon ? '#1F6A5A' : PAL.sap, ink: null, alpha: A * .9, curv: .6, wet: 2 });
  if (neon && o.lights !== false) for (let i = 0; i < 40; i++) { const a = hash(i) * TAU, d = Math.sqrt(hash(i * 3)) * r * .95; X.fillStyle = PAL.nYellow; X.globalAlpha = .7 * A; X.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 2.5, 2.5); }
  X.globalAlpha = 1; X.restore();
  if (neon) glowPath(ellPts(x, y, r, r, 40), PAL.nCyan, r / 120, 0, .8 * A);
}

// ---------- the city (neon megacity / watercolour town) ----------
// layers: back → front. o.horizon (y of street), o.scroll (px pan), o.signs (1 = neon signage on), o.lit (0..1 windows lit)
const SIGNS = ['GPU', 'TOKENS', '推論', 'SCALE', 'ネオン', 'DELVE', '月へ', 'EVALS', 'FLOPS', 'NO MOAT', '24/7', 'AGI?', 'Q*', 'ATTN', 'LOSS↓', 'e/acc', 'RLHF', 'p(doom)', 'CoT', 'MoE', 'GPU POOR', 'ロボ'];
function city(t, o = {}) {
  const neon = NEON >= .5, hz = o.horizon ?? 900, sc = o.scroll || 0, lit = o.lit ?? 1, seed = o.seed || 1;
  const layers = [[.25, 520, '#2A1B55', '#4A3A7A', 34], [.5, 420, '#1D1240', '#35306A', 22], [1, 330, '#120A2A', '#27234F', 14]];
  layers.forEach(([par, maxH, nc, wc, nB], L) => {
    const off = sc * par; let bx = -((off % 400) + 400);
    for (let i = 0; bx < W + 200; i++) {
      const id = i + Math.floor(off / 400) * 5 + L * 97 + seed * 13, bw = 90 + hash(id) * 170, bh = maxH * (.35 + hash(id * 1.3) * .75) * (o.tall || 1), x0 = bx, y0 = hz - bh;
      const pts = rectPts(x0, y0, bw, bh + 40, neon ? 0 : 3);
      if (neon) {
        paint(pts, { fill: nc, ink: PAL.line, sw: 1.2, flat: true });
        // rim of neon along the roof
        if (hash(id * 9) < .5) neonLine([[x0 + 4, y0 + 2], [x0 + bw - 4, y0 + 2]], hash(id) < .5 ? PAL.nMagenta : PAL.nCyan, 2, .8, 0);
        // windows
        X.fillStyle = hash(id * 3) < .5 ? '#FFD86B' : '#7FF3FF';
        const cols = Math.floor(bw / 22), rows = Math.floor(bh / 26);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const hv = hash(id * 31 + r * 7 + c * 3); if (hv < .38 * lit) { X.globalAlpha = .45 + .5 * hash(hv * 99 + Math.floor(t * 2) * (hv < .05 ? 1 : 0)); X.fillRect(x0 + 8 + c * 22, y0 + 12 + r * 26, 10, 13); } }
        X.globalAlpha = 1;
        if ((o.signs ?? 1) && L > 0 && hash(id * 5) < .45) {
          const s = SIGNS[Math.floor(hash(id * 17) * SIGNS.length)], vert = hash(id * 23) < .5 && [...SIGNS[Math.floor(hash(id * 17) * SIGNS.length)]].length <= 4, sc2 = L === 2 ? 1 : .7, col = [PAL.nMagenta, PAL.nCyan, PAL.nYellow, PAL.nOrange, PAL.nGreen][Math.floor(hash(id * 29) * 5)];
          const fl = hash(id + Math.floor(t * 8)) < .06 ? .3 : 1;
          const sx = x0 + bw * .5, sy = y0 + 70 * sc2;
          if (vert) { const chars = [...s].slice(0, 4); paint(rrPts(sx - 24 * sc2, sy - 30 * sc2, 48 * sc2, chars.length * 44 * sc2 + 20, 6), { fill: '#0B0716', ink: col, sw: 1.2, flat: true }); chars.forEach((ch, j) => txt(ch, sx, sy + j * 44 * sc2, 36 * sc2, '#FFFFFF', { font: /[^\x00-\x7F]/.test(ch) ? 'JP' : 'Orbitron', glow: col, alpha: fl })); }
          else { const w = txtW(s, 34 * sc2, 'Orbitron') + 30; paint(rrPts(sx - w / 2, sy - 26 * sc2, w, 52 * sc2, 8), { fill: '#0B0716', ink: col, sw: 1.2, flat: true }); txt(s, sx, sy, 34 * sc2, '#FFFFFF', { font: /[^\x00-\x7F]/.test(s) ? 'JP' : 'Orbitron', glow: col, alpha: fl }); }
        }
      } else {
        paint(pts, { fill: mixCol(PAL.indigo, PAL.night, L / 2), shade: PAL.night, ink: PAL.ink, sw: .8, wet: 4, layers: 2 });
        const cols = Math.floor(bw / 26), rows = Math.floor(bh / 30);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (hash(id * 31 + r * 7 + c * 3) < .25 * lit) paint(rectPts(x0 + 9 + c * 26, y0 + 14 + r * 30, 10, 14, 1), { fill: PAL.ochre, ink: null, op: .8, flat: true });
      }
      bx += bw + 6 + hash(id * 2) * 30;
    }
    if (neon && L < 2) { X.fillStyle = 'rgba(40,10,70,.35)'; X.fillRect(0, hz - maxH * .3, W, maxH * .3 + 200); }  // haze between layers
  });
  // street
  if (o.street !== false) {
    if (neon) { vgrad(0, hz, W, H - hz, [[0, '#1A0F30'], [1, '#07040F']]); for (let i = 0; i < 6; i++) neonLine([[0, hz + 10 + i * i * 6], [W, hz + 10 + i * i * 6]], i % 2 ? PAL.nMagenta : PAL.nCyan, .8, .25, 0); }
    else paint(rectPts(-40, hz, W + 80, H - hz + 60, 4), { fill: '#5B5470', ink: PAL.ink, sw: .8, wet: 6 });
  }
}
function rain(t, o = {}) {
  const n = o.n ?? 140, ang = o.ang ?? .2, len = o.len ?? 40, col = NEON >= .5 ? (o.col || '#9FEFFF') : PAL.slate;
  X.strokeStyle = col; X.lineWidth = o.w ?? 1.6; X.globalAlpha = o.alpha ?? .45; X.beginPath();
  for (let i = 0; i < n; i++) { const sp = 1400 + hash(i) * 900, x = (hash(i * 3) * (W + 400) + t * sp * Math.sin(ang)) % (W + 400) - 200, y = (hash(i * 7) * (H + 200) + t * sp) % (H + 200) - 100; X.moveTo(x, y); X.lineTo(x - Math.sin(ang) * len, y - Math.cos(ang) * len); }
  X.stroke(); X.globalAlpha = 1;
}
function speedLines(cx, cy, k = 1, o = {}) {
  const n = o.n ?? 60, col = o.col || (NEON >= .5 ? '#FFFFFF' : PAL.ink);
  X.save(); X.fillStyle = col; X.globalAlpha = (o.alpha ?? .6) * k;
  for (let i = 0; i < n; i++) {
    const a = hash(i * 3 + Math.floor(T * 15) * .01) * TAU, r0 = (o.r0 ?? 380) + hash(i * 5 + Math.floor(T * 20)) * 200, r1 = r0 + 400 + hash(i) * 900, w = (2 + hash(i * 9) * 6) * (o.w ?? 1);
    X.beginPath(); X.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); X.lineTo(cx + Math.cos(a + w / r1) * r1, cy + Math.sin(a + w / r1) * r1); X.lineTo(cx + Math.cos(a - w / r1) * r1, cy + Math.sin(a - w / r1) * r1); X.fill();
  }
  X.restore();
}

// ---------- the lab (watercolour act) ----------
function room(t, o = {}) {
  X.drawImage(PAPER, 0, 0);
  const wall = o.wall || '#3B3F6E', lamp = o.lamp ?? 1;
  wash(rectPts(-60, -60, W + 120, 900, 20), wall, .9, 26, 4);
  blooms(0, 0, W, 800, PAL.night, 9, .14, 3);
  glow(o.lx ?? 1250, o.ly ?? 420, 760, '#FFC96B', .42 * lamp, 'source-over');
  wash(rectPts(-60, 800, W + 120, 340, 8), '#6B5A7E', .95, 10, 3);
  blooms(0, 800, W, 280, '#4A3F5E', 5, .15, 7);
}
function windowFrame(x, y, w, h, t, o = {}) {
  const neon = NEON >= .5;
  X.save(); tracePath(X, rectPts(x, y, w, h)); X.clip();
  if (o.inside) o.inside(x, y, w, h); else { if (neon) vgrad(x, y, w, h, [[0, '#0B0716'], [1, '#3A1650']]); else wash(rectPts(x - 10, y - 10, w + 20, h + 20, 6), PAL.night, .9, 10, 3); if (o.moon !== false) moon(x + w * (o.mx ?? .62), y + h * (o.my ?? .38), Math.min(w, h) * (o.mr ?? .2), o.moonO || {}); stars(t, 20, { x0: x, y0: y, ext: [w, h], seed: 9 }); }
  X.restore();
  paint(rectPts(x, y, w, h, 2), { ink: neon ? PAL.line : PAL.ink, sw: 3, fill: null });
  line([[x + w / 2, y], [x + w / 2, y + h]], 3, neon ? '#2A1E48' : '#5A4A60', 0); line([[x, y + h / 2], [x + w, y + h / 2]], 3, neon ? '#2A1E48' : '#5A4A60', 0);
  paint(rectPts(x - 20, y + h, w + 40, 22, 2), { fill: neon ? '#2A1E48' : '#8A7A6A', shade: neon ? '#150D28' : '#5A4A40', ink: neon ? PAL.line : PAL.ink, sw: 1.4 });
}
function desk(x, y, w, o = {}) {
  const neon = NEON >= .5;
  paint(rectPts(x, y, w, 34, 2), { fill: neon ? '#241A40' : '#8A5A3C', shade: neon ? '#120C22' : '#5E3A26', ink: neon ? PAL.line : PAL.ink, sw: 1.6 });
  for (const lx of [x + 30, x + w - 60]) paint(rectPts(lx, y + 34, 30, 260, 2), { fill: neon ? '#1A1230' : '#6E452D', shade: neon ? '#0E0A1C' : '#4A2E1E', ink: neon ? PAL.line : PAL.ink, sw: 1.4 });
}
// monitor(x, y, w, h, o, drawScreen(x, y, w, h)): bezel + glowing screen; drawScreen paints inside a clip
function monitor(x, y, w, h, o = {}, drawScreen) {
  const neon = NEON >= .5, glowC = o.glowCol || (neon ? PAL.nCyan : '#BFE7E0');
  glow(x + w / 2, y + h / 2, Math.max(w, h) * (o.glowR ?? 1.1), glowC, neon ? .35 : .25, neon ? 'lighter' : 'source-over');
  if (o.stand !== false) { paint(rectPts(x + w / 2 - w * .06, y + h, w * .12, h * .22, 1), { fill: neon ? '#2A2440' : '#4A4458', ink: neon ? PAL.line : PAL.ink, sw: 1.2 }); paint(rectPts(x + w / 2 - w * .2, y + h * 1.2, w * .4, h * .05, 1), { fill: neon ? '#2A2440' : '#4A4458', ink: neon ? PAL.line : PAL.ink, sw: 1.2 }); }
  paint(rrPts(x - w * .04, y - w * .04, w * 1.08, h + w * .08, w * .03), { fill: neon ? '#1C1830' : '#3E3A4E', shade: neon ? '#0E0C1A' : '#28243A', ink: neon ? PAL.line : PAL.ink, sw: 1.6 });
  X.save(); tracePath(X, rectPts(x, y, w, h)); X.clip();
  X.fillStyle = o.screen || (neon ? '#081A24' : '#1E3A44'); X.fillRect(x, y, w, h);
  if (drawScreen) drawScreen(x, y, w, h);
  // scanline sheen
  X.globalAlpha = .12; X.fillStyle = '#FFFFFF'; for (let yy = y; yy < y + h; yy += 6) X.fillRect(x, yy, w, 1.5); X.globalAlpha = 1;
  X.restore();
}
// chart(x, y, w, h, kind, k, o): 'loss' (drops then a cliff), 'up' (exponential), 'metr' (log-scale doubling dots), 'tilt' (q vs p distributions)
function chart(x, y, w, h, kind, k = 1, o = {}) {
  const neon = NEON >= .5, col = o.col || (neon ? PAL.nCyan : PAL.clay), axis = o.axis || (neon ? '#5A4A8A' : PAL.ink);
  line([[x, y], [x, y + h], [x + w, y + h]], o.sw ?? 2.2, axis, 0);
  const pts = [], n = 40;
  for (let i = 0; i <= n * clamp(k); i++) {
    const u = i / n; let v;
    if (kind === 'loss') v = .9 * Math.exp(-u * 2.2) + .05 + .03 * Math.sin(u * 40 + 1) * (1 - u) - (u > .7 ? (u - .7) * 1.4 : 0);
    else if (kind === 'up') v = .04 + Math.pow(u, 3.2) * 1.05;
    else if (kind === 'metr') v = .05 + u * .9;
    else if (kind === 'tilt') v = Math.exp(-Math.pow((u - .4) / .15, 2)) * .8;
    pts.push([x + u * w, y + h - clamp(v, -.1, 1.2) * h]);
  }
  if (pts.length > 1) { if (neon) neonLine(pts, col, o.w ?? 4, 1, .4); else line(pts, o.w ?? 3, col, .4); }
  if (kind === 'metr') for (let i = 0; i < 8; i++) { const u = i / 7; if (u > k) break; const px = x + u * w, py = y + h - (.05 + u * .9) * h + Math.sin(i * 3) * 10; paint(ellPts(px, py, 9, 9, 10), { fill: neon ? PAL.nYellow : PAL.ochre, ink: neon ? PAL.line : PAL.ink, sw: 1 }); }
  if (kind === 'tilt' && (o.tilt ?? 0) > 0) {
    const b = o.tilt, p2 = [];
    for (let i = 0; i <= n; i++) { const u = i / n; const q = Math.exp(-Math.pow((u - .4) / .15, 2)) * .8, v = q * Math.exp(b * 3 * (u - .4)) / (1 + b * 1.5); p2.push([x + u * w, y + h - clamp(v, 0, 1.2) * h]); }
    if (neon) neonLine(p2, PAL.nMagenta, o.w ?? 4, 1, .4); else line(p2, o.w ?? 3, PAL.rose, .4);
  }
  return pts;
}
// battery(x, y, s, v, o): the charge meter (v 0..1); o.label adds an optional caption above it
function battery(x, y, s, v, o = {}) {
  const neon = NEON >= .5, col = v > .5 ? (neon ? PAL.nGreen : PAL.sap) : v > .2 ? (neon ? PAL.nYellow : PAL.ochre) : (neon ? PAL.nRed : PAL.clay);
  paint(rrPts(x, y, 150 * s, 70 * s, 10 * s), { fill: neon ? '#120A24' : PAL.cream, ink: neon ? '#FFFFFF' : PAL.ink, sw: 2.2 * s });
  paint(rrPts(x + 150 * s, y + 22 * s, 12 * s, 26 * s, 3 * s), { fill: neon ? '#FFFFFF' : PAL.ink, ink: null });
  if (v > .01) paint(rrPts(x + 9 * s, y + 9 * s, 132 * s * clamp(v), 52 * s, 6 * s), { fill: col, ink: null, flat: NEON >= .5 });
  if (neon) glowPath(rrPts(x, y, 150 * s, 70 * s, 10 * s), col, s * .8, 0, .6);
  if (o.label) txt(o.label, x + 75 * s, y - 24 * s, 24 * s, neon ? '#FFFFFF' : PAL.ink, { font: neon ? 'Orbitron' : 'Marker', glow: neon ? col : null });
}
// stamp(x, y, s, word, col, k, o): rubber stamp slam (k: 0 → lifted, 1 → pressed; overshoot handled by caller)
function stamp(x, y, s, word, col, k = 1, o = {}) {
  const rot = o.rot ?? -.12, neon = NEON >= .5;
  X.save(); X.translate(x, y); X.rotate(rot); const sc = 1 + (1 - clamp(k)) * .8; X.scale(sc * s, sc * s); X.globalAlpha = clamp(k * 1.5);
  const w = txtW(word, 90, 'Anton') + 60;
  paint(rrPts(-w / 2, -62, w, 124, 14), { fill: null, ink: col, sw: 5 });
  X.globalAlpha = clamp(k * 1.5);
  txt(word, 0, 4, 90, col, { font: 'Anton', glow: neon ? col : null, alpha: clamp(k * 1.5) });
  X.restore();
}
// em-dash mindworm: a wriggling "—" with a tiny face
function emdash(x, y, s, ang = 0, o = {}) {
  const neon = NEON >= .5, t = o.t ?? T, sp = [];
  for (let i = 0; i < 8; i++) sp.push([x + Math.cos(ang) * (i - 3.5) * 14 * s, y + Math.sin(ang) * (i - 3.5) * 14 * s + Math.sin(t * 9 + i * .9 + (o.seed || 0)) * 5 * s]);
  const pts = ribbon(sp, k => 7 * s * (k < .15 ? .6 + k * 2.6 : k > .85 ? .6 + (1 - k) * 2.6 : 1));
  paint(pts, { fill: o.col || (neon ? PAL.nMagenta : PAL.ink), ink: neon ? PAL.line : null, sw: 1.2, curv: .5, alpha: o.alpha ?? 1, wet: 1 });
  if (o.face !== false && s > .8) { const [hx, hy] = sp[7]; paint(ellPts(hx - 3 * s, hy - 2 * s, 1.6 * s, 1.6 * s, 6), { fill: '#FFFFFF', ink: null, flat: true }); paint(ellPts(hx + 1 * s, hy - 2 * s, 1.6 * s, 1.6 * s, 6), { fill: '#FFFFFF', ink: null, flat: true }); }
  if (neon) glowPath(pts, PAL.nMagenta, s * .4, .5, .6 * (o.alpha ?? 1));
}
// server rack (data centre) — s = 1 → 160 x 420 px
function rack(x, y, s, o = {}) {
  const neon = NEON >= .5, t = o.t ?? T;
  paint(rrPts(x, y, 160 * s, 420 * s, 8 * s), { fill: neon ? '#1A1530' : '#4A4E68', shade: neon ? '#0C0A18' : '#2E3148', ink: neon ? PAL.line : PAL.ink, sw: 1.6 * s + .4 });
  for (let i = 0; i < 12; i++) {
    const yy = y + 16 * s + i * 33 * s; paint(rectPts(x + 12 * s, yy, 136 * s, 24 * s), { fill: neon ? '#0B0716' : '#2E3148', ink: null, flat: true });
    for (let j = 0; j < 4; j++) { const on = hash(i * 13 + j * 7 + Math.floor(t * 8 + i)) < .6; X.fillStyle = on ? (j === 0 ? (neon ? PAL.nGreen : PAL.sap) : neon ? PAL.nCyan : PAL.teal) : '#222'; X.fillRect(x + 20 * s + j * 12 * s, yy + 9 * s, 6 * s, 6 * s); }
  }
  if (neon) glowPath(rrPts(x, y, 160 * s, 420 * s, 8 * s), o.glowCol || PAL.nCyan, s * .6, 0, .5);
}
function gpu(x, y, s, o = {}) {
  const neon = NEON >= .5, t = o.t ?? T;
  X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot); X.scale(s, s);
  paint(rrPts(-150, -60, 300, 120, 12), { fill: neon ? '#1C1A28' : '#3A3A4A', shade: neon ? '#0B0A12' : '#22222E', ink: neon ? PAL.line : PAL.ink, sw: 2, rim: neon ? '#6A5AAA' : undefined });
  for (const fx of [-75, 75]) {
    paint(ellPts(fx, 0, 48, 48, 22), { fill: neon ? '#0B0716' : '#22222E', ink: neon ? PAL.line : PAL.ink, sw: 1.6 });
    const sp = t * (o.spin ?? 14);
    for (let b = 0; b < 7; b++) { const a = sp + b / 7 * TAU; paint([[fx, 0], [fx + Math.cos(a) * 44, Math.sin(a) * 44], [fx + Math.cos(a + .5) * 40, Math.sin(a + .5) * 40]], { fill: neon ? '#3A3A5A' : '#5A5A6E', ink: null, flat: true }); }
    paint(ellPts(fx, 0, 12, 12, 12), { fill: neon ? PAL.nGreen : PAL.sap, ink: null, flat: true });
  }
  if (neon) neonLine([[-140, 52], [140, 52]], PAL.nGreen, 2.5, .9, 0);
  X.restore();
}
function paperclip(x, y, s, rot = 0, o = {}) {
  const neon = NEON >= .5;
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const clip = [[8, -22], [8, 24], [-2, 34], [-12, 24], [-12, -34], [-2, -44], [8, -34], [8, -30], [18, -40], [28, -30], [28, 36], [16, 48], [4, 36]];
  X.lineCap = 'round'; X.lineJoin = 'round';
  X.strokeStyle = neon ? PAL.line : PAL.ink; X.lineWidth = 11; tracePath(X, clip, .8, false); X.stroke();
  X.strokeStyle = o.col || (neon ? '#C8D2FF' : '#A9B0C0'); X.lineWidth = 6; X.stroke();
  X.strokeStyle = '#FFFFFF'; X.globalAlpha = .6; X.lineWidth = 2; X.stroke(); X.globalAlpha = 1;
  X.restore();
}
// rocket built from a server rack stack (the data-centre rocket), base at (x, y), s = 1 → ~700 px tall
function rocket(x, y, s, o = {}) {
  const neon = NEON >= .5, fl = o.flame ?? 0;
  X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot); X.scale(s, s);
  if (fl > .01) {
    for (let i = 0; i < 3; i++) { const L = fl * (380 - i * 100) * (1 + .15 * Math.sin(T * 40 + i)); paint([[-70 + i * 22, 0], [70 - i * 22, 0], [30 - i * 10, L * .5], [0, L + jit(20)], [-30 + i * 10, L * .5]], { fill: [neon ? PAL.nMagenta : PAL.clay, neon ? PAL.nOrange : PAL.ochre, '#FFF6E6'][i], ink: i ? null : (neon ? PAL.line : PAL.ink), sw: 1.4, curv: .6, wet: 4 }); }
    if (neon) glow(0, fl * 180, 300 * fl, PAL.nOrange, .5);
  }
  for (const sx of [-1, 1]) paint([[sx * 80, -260], [sx * 170, -60], [sx * 170, 10], [sx * 80, -30]], { fill: neon ? PAL.nMagenta : PAL.rose, shade: neon ? '#8A1050' : '#A04A60', ink: neon ? PAL.line : PAL.ink, sw: 2 });
  paint(rrPts(-90, -560, 180, 560, 20), { fill: neon ? '#1A1530' : '#E8E0D0', shade: neon ? '#0C0A18' : '#B8AE9C', ink: neon ? PAL.line : PAL.ink, sw: 2.2, rim: neon ? PAL.nCyan : undefined });
  for (let i = 0; i < 9; i++) { const yy = -520 + i * 52; paint(rectPts(-70, yy, 140, 34), { fill: neon ? '#0B0716' : '#4A4E68', ink: null, flat: true }); for (let j = 0; j < 5; j++) { X.fillStyle = hash(i * 7 + j + Math.floor(T * 10)) < .6 ? (neon ? PAL.nGreen : PAL.sap) : '#333'; X.fillRect(-60 + j * 16, yy + 13, 8, 8); } }
  paint([[-92, -555], [92, -555], [40, -700], [0, -760], [-40, -700]], { fill: neon ? PAL.nYellow : PAL.ochre, shade: neon ? PAL.nOrange : PAL.clay, ink: neon ? PAL.line : PAL.ink, sw: 2.2, curv: .35 });
  if (o.window) { paint(ellPts(0, -640, 30, 30, 18), { fill: neon ? '#9FF7FF' : PAL.sky, ink: neon ? PAL.line : PAL.ink, sw: 2 }); if (o.window === 'mask') mask(0, -640, 24, { eyes: 'happy', glow: 0 }); }
  if (neon) glowPath(rrPts(-90, -560, 180, 560, 20), PAL.nCyan, 1, 0, .4);
  X.restore();
}
// monorail car, side view; (x, y) = bottom-left of the car, s = 1 → 900 x 260
function train(x, y, s, o = {}) {
  const neon = NEON >= .5;
  X.save(); X.translate(x, y); X.scale(s, s);
  paint(rrPts(0, -260, 900, 240, 40), { fill: neon ? '#D8D4E8' : '#E8E2D6', shade: neon ? '#8A86A8' : '#B8B0A0', ink: neon ? PAL.line : PAL.ink, sw: 2.4, rim: neon ? '#FFFFFF' : undefined });
  paint(rectPts(0, -110, 900, 26), { fill: neon ? PAL.nYellow : PAL.ochre, ink: null, flat: true });
  for (let i = 0; i < 6; i++) { const wx = 40 + i * 142; paint(rrPts(wx, -230, 118, 100, 12), { fill: neon ? '#1A0F30' : '#3E4A70', ink: neon ? PAL.line : PAL.ink, sw: 1.8 }); if (o.windowFn) { X.save(); tracePath(X, rrPts(wx, -230, 118, 100, 12)); X.clip(); o.windowFn(i, wx, -230, 118, 100); X.restore(); } }
  if (neon) neonLine([[20, -80], [880, -80]], PAL.nCyan, 3, .9, 0);
  X.restore();
}
// Dyson sphere around a sun: build 0..1 = how much of the lattice is assembled
function dysonSphere(x, y, r, build = 1, o = {}) {
  const neon = NEON >= .5, t = o.t ?? T;
  glow(x, y, r * 2.4, neon ? PAL.nOrange : PAL.ochre, neon ? .45 : .3, neon ? 'lighter' : 'source-over');
  paint(ellPts(x, y, r * .55, r * .55, 30), { fill: neon ? '#FFE27A' : PAL.ochre, shade: neon ? PAL.nOrange : PAL.clay, ink: neon ? null : PAL.ink, sw: 1.2, rim: neon ? '#FFFFFF' : undefined });
  if (neon) glow(x, y, r * .9, '#FFFFFF', .4);
  const rings = o.rings || 7;
  for (let i = 0; i < rings; i++) {
    const tilt = (i / rings) * Math.PI, sy = .25 + .75 * Math.abs(Math.cos(i * 1.3)), rot = tilt + t * .05 * (i % 2 ? 1 : -1);
    const k = clamp(build * rings - i); if (k <= 0) continue;
    const pts = []; const N = 48; for (let j = 0; j <= N * k; j++) { const a = j / N * TAU; const px = Math.cos(a) * r, py = Math.sin(a) * r * sy; pts.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]); }
    if (pts.length > 1) { if (neon) neonLine(pts, i % 2 ? PAL.nCyan : '#9FF7FF', r / 110, .9, .4, k >= 1); else line(pts, r / 130, PAL.teal, .4, .9, k >= 1); }
    // panels
    for (let j = 0; j < 12 * k; j++) { const a = j / 12 * TAU + t * .2; const px = Math.cos(a) * r, py = Math.sin(a) * r * sy; const qx = x + px * Math.cos(rot) - py * Math.sin(rot), qy = y + px * Math.sin(rot) + py * Math.cos(rot); X.fillStyle = neon ? PAL.nCyan : PAL.indigo; X.fillRect(qx - r * .025, qy - r * .02, r * .05, r * .04); }
  }
}
// HUD frame with corner brackets
function hud(x, y, w, h, o = {}) {
  const col = o.col || PAL.nCyan, L = o.corner ?? 40, a = o.alpha ?? 1;
  const cs = [[[x, y + L], [x, y], [x + L, y]], [[x + w - L, y], [x + w, y], [x + w, y + L]], [[x + w, y + h - L], [x + w, y + h], [x + w - L, y + h]], [[x + L, y + h], [x, y + h], [x, y + h - L]]];
  for (const c of cs) neonLine(c, col, o.w ?? 3, a, 0);
  if (o.label) txt(o.label, x + 12, y - 22, o.size || 26, '#FFFFFF', { font: 'Orbitron', align: 'left', glow: col, alpha: a });
}
// afterimage trail (the time-slow look): calls fn(i, k) for i = n..0 with k = 1 for the live pose, <1 for echoes.
const TRAIL_COLS = ['#FF2E88', '#FF8A1F', '#F5F03A', '#48FF8A', '#27F2F2', '#9B5CFF'];
function afterimages(n, fn) { for (let i = n; i >= 1; i--) fn(i, TRAIL_COLS[(i - 1) % TRAIL_COLS.length], .55 * (1 - i / (n + 1))); fn(0, null, 1); }
function boulder(x, y, r, o = {}) {
  const neon = NEON >= .5, rot = o.rot || 0, pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + rot; pts.push([x + Math.cos(a) * r * (.9 + .12 * hash(i)), y + Math.sin(a) * r * (.9 + .12 * hash(i + 5))]); }
  paint(pts, { fill: o.col || (neon ? '#3A2E5A' : '#8A7F78'), shade: neon ? '#1A1230' : '#5A504A', ink: neon ? PAL.line : PAL.ink, sw: clamp(r / 60, .8, 3), curv: .4, rim: neon ? PAL.nViolet : undefined });
  if (o.words) o.words.forEach((w, i) => { const a = rot + i / o.words.length * TAU; txt(w, x + Math.cos(a) * r * .45, y + Math.sin(a) * r * .45, r * .2, neon ? '#FFFFFF' : PAL.cream, { font: neon ? 'Orbitron' : 'Marker', rot: a + Math.PI / 2, glow: neon ? PAL.nCyan : null }); });
}
function parrot(x, y, s, o = {}) {
  const neon = NEON >= .5, t = o.t ?? T, bob = Math.sin(t * 8) * 3;
  X.save(); X.translate(x, y + bob); X.scale((o.flip ? -1 : 1) * s, s);
  paint([[0, 0], [-18, -30], [-10, -62], [14, -70], [26, -56], [20, -20], [30, 30], [14, 34]], { fill: neon ? PAL.nGreen : PAL.sap, shade: neon ? '#1A8A4A' : '#3E6A34', ink: neon ? PAL.line : PAL.ink, sw: 1.4, curv: .5 });
  paint([[20, -58], [36, -54], [28, -44]], { fill: neon ? PAL.nYellow : PAL.ochre, ink: neon ? PAL.line : PAL.ink, sw: 1.2 });
  paint(ellPts(12, -58, 3.4, 3.4, 8), { fill: PAL.ink, ink: null, flat: true });
  paint([[-12, -28], [-30, 10], [-6, -6]], { fill: neon ? PAL.nRed : PAL.clay, ink: neon ? PAL.line : PAL.ink, sw: 1.2 });
  X.restore();
}
function signBoard(x, y, w, h, text, col, o = {}) {
  paint(rrPts(x - w / 2, y - h / 2, w, h, 10), { fill: '#0B0716', ink: col, sw: 1.4, flat: true });
  glowPath(rrPts(x - w / 2, y - h / 2, w, h, 10), col, .8, 0, .7);
  txt(text, x, y, o.size || h * .55, '#FFFFFF', { font: o.font || 'Orbitron', glow: col, alpha: o.alpha ?? 1 });
}
