// c02_jackin.js: Act II · Jack In (b72–b136, 24.70–46.65 s). Hybrid → neon.  (v2)
// Neon bursts OUT of his head from the ear the em-dash worm crawled into (no plug), a scan ring re-renders the
// watercolour lab as neon outward from his head (the lab coat becomes the bomber), the Dyson emblem ignites, a forward
// pass full of mechinterp (SAE features, the residual stream, an induction head), the persona selection model (the
// shoggoth router's mask carousel, then the operating-system terrarium with a tiny Assistant inside), riding a sage
// tentacle out over the skyline, the verification bottleneck, exponential tilt, and the quiet rooftop break.
(() => {
  // ---------- small helpers (private) ----------
  const BI = lt => Math.floor(lt / BEAT + 1e-4);              // beat index inside the shot (shots start on beats)
  const BF = lt => frac(lt / BEAT + 1e-4);                    // fraction of the current beat
  const hitK = (lt, k = 6) => Math.exp(-BF(lt) * k);          // 1 on every beat of the shot, decaying
  const INK = () => NEON >= .5 ? PAL.line : PAL.ink;
  const bez = (p0, p1, p2, p3, u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
  function normals(sp) {
    const n = sp.length;
    return sp.map((_, i) => { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; });
  }
  function bezSpine(p0, p1, p2, p3, n = 24, wave = 0, ph = 0, freq = 1.5) {
    const sp = []; for (let i = 0; i < n; i++) sp.push(bez(p0, p1, p2, p3, i / (n - 1)));
    if (wave) { const nr = normals(sp); for (let i = 0; i < n; i++) { const u = i / (n - 1), a = wave * Math.sin(u * freq * TAU - ph) * Math.sin(Math.PI * Math.min(1, u * 1.2)); sp[i] = [sp[i][0] + nr[i][0] * a, sp[i][1] + nr[i][1] * a]; } }
    return sp;
  }
  // a thick tentacle along a spine (both styles). wFn(u) = half width. o.up: which normal side is the lit top (+1/-1).
  function tentBody(sp, wFn, o = {}) {
    const neon = NEON >= .5, n = sp.length, nr = normals(sp), A = o.alpha ?? 1, up = o.up ?? -1;
    let wMax = 0; for (let i = 0; i < n; i++) wMax = Math.max(wMax, wFn(i / (n - 1)));
    const pts = ribbon(sp, wFn), bb = bbox(pts);
    // light offset sized to the tube's thickness (not its bbox), so the cel shade / rim read as a tube
    let lx = 0, ly = 0; { const m = Math.floor(n / 2); lx = nr[m][0] * up; ly = nr[m][1] * up; }
    const light = [lx * wMax * .55 / bb.w, ly * wMax * .55 / bb.h];
    paint(pts, { fill: o.col || (neon ? MOD.bodyN : MOD.body), shade: o.dk || (neon ? MOD.bodyNDk : MOD.bodyDk), rim: neon ? (o.rim || MOD.rimN) : undefined, ink: neon ? PAL.line : PAL.ink, sw: clamp(wMax / 14, 1, 4), curv: .5, light, alpha: A, wet: 3 });
    // Ryan's shoggoth has little half-lidded eyes along its limbs instead of suckers
    if (wMax > 16 && o.suckers !== false) for (let i = 3; i < n - 2; i += 3) { const w = wFn(i / (n - 1)); if (w < 9) continue; const [nx, ny] = nr[i], a = Math.atan2(sp[i + 1][1] - sp[i - 1][1], sp[i + 1][0] - sp[i - 1][0]); eyeball(sp[i][0] - nx * up * w * .12, sp[i][1] - ny * up * w * .12, w * .34, { lid: .5 + .35 * hash(i * 3.7 + n), tilt: a, alpha: A, sw: clamp(w / 24, .6, 2.6), look: [.4, .2] }); }
    if (neon && o.edge) glowPath(pts, o.edge, clamp(wMax / 50, .5, 2.2), .5, .8 * A);
    if (neon && o.edges) { const L = [], R = []; for (let i = 0; i < n; i++) { const w = wFn(i / (n - 1)); L.push([sp[i][0] + nr[i][0] * w, sp[i][1] + nr[i][1] * w]); R.push([sp[i][0] - nr[i][0] * w, sp[i][1] - nr[i][1] * w]); } neonLine(L, o.edges, clamp(wMax / 40, 1.5, 5), .9 * A, .5); neonLine(R, o.edges, clamp(wMax / 40, 1.5, 5), .9 * A, .5); }
    if (neon && o.tube !== false) neonLine(sp.slice(1, -1).map((p, i) => { const w = wFn((i + 1) / (n - 1)); return [p[0] + nr[i + 1][0] * up * w * .55, p[1] + nr[i + 1][1] * up * w * .55]; }), o.rim || MOD.rimN, clamp(wMax / 16, 1.2, 4.5), .85 * A, .5);
    return nr;
  }
  // point + normal on a spine at u (0..1)
  function spineAt(sp, u) {
    const n = sp.length, f = clamp(u) * (n - 1), i = Math.min(n - 2, Math.floor(f)), k = f - i, a = sp[i], b = sp[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return { p: [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], n: [-dy / d, dx / d], ang: Math.atan2(dy, dx) };
  }
  // ---------- the worm's circuitry (no plug in v2: the em-dash mindworm crawled into his ear at the end of Act I) ----------
  // head-local coordinates (hero body units around the head centre) → world, for hero(x, y, 100k, {view:'side', flip})
  const HEADP = (x, y, k, fl, dy = 0) => (hx, hy) => [x + fl * (1 + hx) * k, y + dy + (-89 + hy) * k];
  // hero() draws no ear in side view: add one (head-local, behind the eye, in front of the hairline)
  function sideEar(P, k) {
    const neon = NEON >= .5;
    paint([[-1.5, -1.4], [-2.8, -1.9], [-4.2, -1.5], [-4.8, .4], [-4.5, 2.6], [-3.8, 4.4], [-2.8, 5.6], [-1.9, 5.4], [-1.6, 4.2]].map(p => P(...p)), { fill: neon ? HERO.skinN : HERO.skin, shade: neon ? HERO.skinNDk : HERO.skinDk, ink: INK(), sw: clamp(k / 11, .7, 3), curv: .6, wet: k * .06 });
    line([[-2.2, -.8], [-3.7, -.7], [-4, 1.2], [-3.4, 3], [-2.6, 3.6]].map(p => P(...p)), clamp(k / 14, .6, 2.4), neon ? HERO.skinNDk : '#B07A60', .6);
    paint(ellPts(...P(-2.5, 1.8), k * .42, k * .55, 10), { fill: neon ? '#5A2040' : '#B98068', ink: null, flat: true });
  }
  // PCB-style traces: n polylines from (ox, oy), heading roughly along `base`, jogging 45° every other segment
  function circuitNet(ox, oy, n, seed, len, base, spread, step) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a0 = Math.round((base + (hash(seed + i * 7.1) - .5) * spread) / (Math.PI / 4)) * Math.PI / 4, d = (hash(seed + i * 5.3) < .5 ? -1 : 1) * Math.PI / 4;
      let x = ox, y = oy, rem = len * (.55 + .45 * hash(seed + i * 3.3)); const pts = [[x, y]];
      for (let s = 0; s < 14 && rem > 1; s++) {
        const a = a0 + (s % 2 ? d * (hash(seed + i * 11 + s) < .75 ? 1 : -1) : 0), L = Math.min(rem, step * (.5 + hash(seed + i * 13 + s * 5.7)));
        x += Math.cos(a) * L; y += Math.sin(a) * L; pts.push([x, y]); rem -= L;
      }
      out.push(pts);
    }
    return out;
  }
  function growPts(pts, g) {   // the first g (0..1) of a polyline, by length
    let tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let want = tot * clamp(g); const out = [pts[0]];
    for (let i = 1; i < pts.length && want > 0; i++) {
      const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (L <= want) { out.push(pts[i]); want -= L; } else { const k = want / L; out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]); want = 0; }
    }
    return out;
  }
  // draw traces grown to g, with a dark under-stroke so they read on paper too, solder pads and a bright racing tip
  function drawCircuit(lines, g, cols, w, under) {
    lines.forEach((pts, i) => {
      const p = growPts(pts, g * (.75 + .25 * hash(i * 3.1))); if (p.length < 2) return;
      const col = cols[i % cols.length];
      if (under) line(p, w * 1.25, under, 0, .8);
      neonLine(p, col, w, 1, 0);
      for (let j = 1; j < p.length - 1; j++) paint(ellPts(p[j][0], p[j][1], w * .95, w * .95, 8), { fill: col, ink: null, flat: true });
      const e = p[p.length - 1]; glow(e[0], e[1], w * 7, col, .75); paint(ellPts(e[0], e[1], w * 1.3, w * 1.3, 8), { fill: '#FFFFFF', ink: null, flat: true });
    });
  }
  // paper grain on everything OUTSIDE a path (splitStyle switches the post to neon, so the watercolour part needs it back)
  let GC = null;
  function grainOutside(pathFn, a = .85) {
    if (!GC) GC = mkCanvas(W, H); const g = GC.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'copy'; g.drawImage(GRAIN, 0, 0);
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); pathFn(g); g.fillStyle = '#000'; g.fill(); g.globalCompositeOperation = 'source-over';
    X.save(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = a; X.drawImage(GC, 0, 0); X.restore();
  }
  // a wobbly closed circle sub-path
  function blobPath(c, cx, cy, R, ph) {
    const n = 44; for (let i = 0; i <= n; i++) { const a = i / n * TAU, r = Math.max(1, R * (1 + .06 * Math.sin(a * 5 + ph) + .035 * Math.sin(a * 11 - ph * 1.7))); const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.closePath();
  }
  // a wireless data link: a faint neon arc with packets racing along it (replaces the v1 cable)
  function dataLink(a, b, t, col = PAL.nCyan, bend = -.25, alpha = 1) {
    const m = [(a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend], pts = [];
    for (let i = 0; i <= 20; i++) { const u = i / 20, v = 1 - u; pts.push([v * v * a[0] + 2 * v * u * m[0] + u * u * b[0], v * v * a[1] + 2 * v * u * m[1] + u * u * b[1]]); }
    X.save(); X.setLineDash([10, 16]); X.lineDashOffset = -t * 160; neonLine(pts, col, 2.2, .55 * alpha, 0); X.restore();
    for (let j = 0; j < 4; j++) { const u = frac(t * 1.4 + j / 4), p = pts[Math.min(20, Math.round(u * 20))]; glow(p[0], p[1], 26, col, .7 * alpha); paint(ellPts(p[0], p[1], 4, 4, 6), { fill: '#FFFFFF', ink: null, flat: true, alpha }); }
  }
  // screen contents
  const codeRows = (t, seed, x, y, w, h, rows = 12, a = 1) => {
    const neon = NEON >= .5, fr = Math.floor(t * 8), rh = (h - 20) / rows;
    for (let r = 0; r < rows; r++) {
      const id = r + fr + seed * 50, ind = Math.floor(hash(id * 3) * 4) * 14, len = 24 + hash(id * 7) * Math.max(10, w - 70 - ind);
      X.fillStyle = neon ? [PAL.nCyan, PAL.nMagenta, PAL.nYellow, '#9FF7FF'][id % 4] : ['#BFE7E0', '#F3D9A4', '#E7B8C4'][id % 3];
      X.globalAlpha = (neon ? .7 : .8) * a; X.fillRect(x + 12 + ind, y + 12 + r * rh, len, rh * .45);
    }
    X.globalAlpha = 1;
  };
  function paperSheet(x, y, w, h, rot, seed, o = {}) {
    const neon = NEON >= .5;
    X.save(); X.translate(x, y); X.rotate(rot);
    paint(rectPts(-w / 2, -h / 2, w, h), { fill: o.col || (neon ? '#E6E2F4' : PAL.cream), shade: neon ? '#A8A0C8' : '#D8CCB4', ink: INK(), sw: o.sw ?? 1.2, flat: true, light: [.1, .1] });
    X.fillStyle = neon ? '#6A6290' : '#A09078';
    for (let i = 0; i < 5; i++) X.fillRect(-w * .38, -h * .32 + i * h * .15, w * (.4 + .36 * hash(seed * 7 + i)), Math.max(1.5, h * .045));
    X.restore();
  }

  // city() with cheap signage: the shared signs draw their text with shadowBlur (~400 ms/frame on this CPU), so draw the
  // city without signs and then re-draw the front layer's signs with a gradient glow + plain text (same layout as world.js).
  function cityC(t, o = {}) {
    city(t, { ...o, signs: 0 });
    if (o.signs === 0 || NEON < .5) return;
    const hz = o.horizon ?? 900, sc = o.scroll || 0, seed = o.seed || 1, par = 1, maxH = 330, L = 2;
    const off = sc * par; let bx = -((off % 400) + 400);
    for (let i = 0; bx < W + 200; i++) {
      const id = i + Math.floor(off / 400) * 5 + L * 97 + seed * 13, bw = 90 + hash(id) * 170, bh = maxH * (.35 + hash(id * 1.3) * .75) * (o.tall || 1), x0 = bx, y0 = hz - bh;
      if (hash(id * 5) < .45) {
        const s = SIGNS[Math.floor(hash(id * 17) * SIGNS.length)], vert = hash(id * 23) < .5, col = [PAL.nMagenta, PAL.nCyan, PAL.nYellow, PAL.nOrange, PAL.nGreen][Math.floor(hash(id * 29) * 5)];
        const fl = hash(id + Math.floor(t * 8)) < .06 ? .3 : 1, sx = x0 + bw * .5, sy = y0 + 70, jp = ch => /[^\x00-\x7F]/.test(ch) ? 'JP' : 'Orbitron';
        if (vert) { const ch = [...s].slice(0, 4), r = rrPts(sx - 24, sy - 30, 48, ch.length * 44 + 20, 6); glow(sx, sy + ch.length * 20, 60 + ch.length * 22, col, .3 * fl); paint(r, { fill: '#0B0716', ink: col, sw: 1.2, flat: true }); glowPath(r, col, .5, 0, .8 * fl); ch.forEach((c, j) => txt(c, sx, sy + j * 44, 36, '#FFFFFF', { font: jp(c), alpha: fl })); }
        else { const w = txtW(s, 34, 'Orbitron') + 30, r = rrPts(sx - w / 2, sy - 26, w, 52, 8); glow(sx, sy, w * .8, col, .3 * fl); paint(r, { fill: '#0B0716', ink: col, sw: 1.2, flat: true }); glowPath(r, col, .5, 0, .8 * fl); txt(s, sx, sy, 34, '#FFFFFF', { font: jp(s), alpha: fl }); }
      }
      bx += bw + 6 + hash(id * 2) * 30;
    }
  }

  // ======================================================================================
  // THE LAB (one layout, painted in either style: used by the slam close-up and the scan wipe)
  // ======================================================================================
  function neonWindow(t, x, y, w, h) {
    vgrad(x, y, w, h, [[0, '#0B0716'], [.6, '#2A1250'], [1, '#FF2E88']]);
    stars(t, 16, { x0: x, y0: y, ext: [w, h * .6], seed: 5 });
    moon(x + w * .64, y + h * .3, h * .15, {});
    const s = w / W * 1.2; X.save(); X.translate(x - w * .1, y); X.scale(s, s); city(t, { horizon: h / s + 10, signs: 0, street: false, seed: 3 }); X.restore();
  }
  function moonPhoto(x, y, s, t, rot = .07) {
    const neon = NEON >= .5, ink = INK();
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
    paint(rectPts(-80, -90, 160, 188, neon ? 0 : 2), { fill: neon ? '#1A1236' : PAL.cream, shade: neon ? '#0E0A20' : '#E0D2B8', ink: neon ? PAL.nCyan : ink, sw: 1.6, glow: neon ? PAL.nCyan : null, glowW: .5, glowA: .7 });
    X.save(); tracePath(X, rectPts(-66, -76, 132, 128)); X.clip();
    if (neon) vgrad(-66, -76, 132, 128, [[0, '#0B0716'], [1, '#2A1250']]); else wash(rectPts(-70, -80, 140, 136, 3), PAL.night, .95, 4, 3);
    moon(0, -14, 40, {});
    X.restore();
    paint(rectPts(-66, -76, 132, 128), { ink, sw: 1.2 });
    paint(ellPts(0, -84, 11, 11, 12), { fill: neon ? PAL.nRed : '#C8403A', shade: '#7A1A20', ink, sw: 1.2, wet: 1 });
    X.restore();
  }
  function deskLamp(x, y, t) {   // base on the desk top at (x, y); head points down-left
    const neon = NEON >= .5, ink = INK();
    const j1 = [x - 10, y - 200], j2 = [x - 150, y - 270], hd = [x - 190, y - 250];
    if (neon) { paint([[hd[0] - 10, hd[1] + 10], [hd[0] + 50, hd[1] + 40], [x - 330, y], [x - 60, y]], { fill: PAL.nYellow, ink: null, alpha: .07, flat: true }); }
    paint(ellPts(x, y - 8, 62, 15, 16), { fill: neon ? '#2A2440' : '#6E4A3A', shade: neon ? '#141024' : '#4A2E22', ink, sw: 1.4 });
    line([[x, y - 12], j1, j2], neon ? 5 : 5, neon ? '#4A3E78' : '#5A3E30', 0);
    paint(ellPts(j1[0], j1[1], 9, 9, 10), { fill: neon ? PAL.nMagenta : PAL.clay, ink, sw: 1 });
    const shade = [[j2[0] + 25, j2[1] - 20], [j2[0] - 20, j2[1] - 10], [hd[0] - 60, hd[1] + 45], [hd[0] + 40, hd[1] + 70]];
    paint(shade, { fill: neon ? '#2A1E48' : PAL.ochre, shade: neon ? '#140C28' : PAL.clay, rim: neon ? PAL.nMagenta : undefined, ink, sw: 1.8, curv: .3, glow: neon ? PAL.nMagenta : null, glowW: .6 });
    const bx = hd[0] - 8, by = hd[1] + 58;
    if (neon) { glow(bx, by, 160, PAL.nYellow, .55); glow(bx, by, 40, '#FFFFFF', .9); }
    else { glow(bx, by, 120, '#FFE6A8', .7, 'source-over'); paint(ellPts(bx, by, 16, 10, 10), { fill: '#FFF6D8', ink: null, flat: true }); }
  }
  function officeChair(x, floor, seatY) {
    const neon = NEON >= .5, ink = INK(), c = neon ? '#2A1E48' : '#7A5A8A', cd = neon ? '#140C28' : '#5A3E6A', rim = neon ? PAL.nViolet : undefined;
    paint(rectPts(x + 10, seatY + 20, 18, floor - seatY - 40), { fill: neon ? '#3A3456' : '#4A4458', ink, sw: 1.2 });
    paint([[x - 80, floor - 6], [x + 120, floor - 6], [x + 100, floor - 26], [x - 60, floor - 26]], { fill: neon ? '#3A3456' : '#4A4458', shade: '#222032', ink, sw: 1.2 });
    for (const dx of [-80, 20, 120]) paint(ellPts(x + dx, floor - 4, 13, 10, 8), { fill: '#1A1826', ink, sw: 1, flat: true });
    paint(rrPts(x - 70, seatY, 190, 34, 14), { fill: c, shade: cd, rim, ink, sw: 1.6 });
    paint(rectPts(x - 72, seatY - 40, 14, 60), { fill: neon ? '#3A3456' : '#4A4458', ink, sw: 1.1 });
    paint(rrPts(x - 104, seatY - 300, 52, 270, 22), { fill: c, shade: cd, rim, ink, sw: 1.6 });
  }
  const LAB = { hx: 700, floor: 965, h: 560 };
  // the lab camera (shared with the scan ring so it can start exactly at his head)
  const labZ = lt => 1.08 + lt * .012;
  const labHeadScr = lt => { const k = LAB.h / 100, y = LAB.floor + 19.2 * k, z = labZ(lt); return [960 + (LAB.hx + k - 990) * z, 540 + (y - 89 * k - 505) * z]; };
  function labScene(t, lt) {
    const neon = NEON >= .5, ink = INK(), bi = BI(lt), hit = hitK(lt);
    camBegin(990, 505, labZ(lt));
    if (!neon) { room(t, { lx: 1640, ly: 480, lamp: 1.35 }); glow(560, 330, 520, '#FFE0A8', .18, 'source-over'); }
    else {
      vgrad(-100, -100, W + 200, 900, [[0, '#0C0620'], [1, '#26124E']]);
      vgrad(-100, 800, W + 200, 400, [[0, '#1A0F30'], [1, '#07040F']]);
      X.save(); X.strokeStyle = 'rgba(155,92,255,.22)'; X.lineWidth = 2; X.beginPath();
      for (let x = 40; x < W; x += 150) { X.moveTo(x, 70); X.lineTo(x, 800); }
      X.stroke(); X.strokeStyle = 'rgba(39,242,242,.16)'; X.beginPath();
      for (let i = -12; i <= 12; i++) { X.moveTo(960 + i * 120, 800); X.lineTo(960 + i * 420, H + 100); }
      for (const yy of [826, 866, 930, 1030]) { X.moveTo(-100, yy); X.lineTo(W + 100, yy); }
      X.stroke(); X.restore();
      neonLine([[-100, 800], [W + 100, 800]], PAL.nMagenta, 3, .8, 0);
      neonLine([[60, 50], [W - 60, 50]], PAL.nCyan, 3, .45 + .35 * hit, 0);
    }
    // window with the moon, the pinned moon photo, sticky notes
    windowFrame(110, 140, 430, 370, t, neon ? { inside: (x, y, w, h) => neonWindow(t, x, y, w, h) } : { mx: .64, my: .34, mr: .19 });
    const stick = (x, y, r, col, ncol) => paint(rectPts(x, y, 62, 58, neon ? 0 : 2).map(p => p), { fill: neon ? '#140C28' : col, ink: neon ? ncol : ink, sw: 1.2, glow: neon ? ncol : null, glowW: .4, alpha: 1, curv: 0 });
    stick(760, 180, 0, '#F5E27A', PAL.nYellow); stick(772, 262, 0, '#F2A9B8', PAL.nPink);
    moonPhoto(655, 270, 1, t);
    // desk, keyboard, monitors, lamp
    desk(860, 720, 1060);
    paint(rrPts(850, 704, 250, 18, 6), { fill: neon ? '#2A2248' : '#4A4458', shade: neon ? '#141024' : '#302A3E', ink, sw: 1.2 });
    if (neon) neonLine([[858, 713], [1092, 713]], PAL.nCyan, 1.5, .5 + .5 * hit, 0);
    monitor(930, 505, 250, 170, {}, (x, y, w, h) => codeRows(t, 1, x, y, w, h, 10));
    monitor(1210, 440, 340, 222, {}, (x, y, w, h) => { codeRows(t, 2, x, y, w, h, 12, .35); mask(x + w / 2, y + h / 2, h * .32, { eyes: neon ? 'star' : 'open', mouth: 'grin', eyeGlow: true, glow: .5 }); });
    monitor(1580, 532, 215, 150, {}, (x, y, w, h) => { if (neon) chart(x + 20, y + 20, w - 40, h - 40, 'up', 1, { w: 3 }); else codeRows(t, 3, x, y, w, h, 8); });
    deskLamp(1860, 718, t);
    // the researcher in his chair, jacked in
    const k = LAB.h / 100, seatY = LAB.floor - 22 * k, y = LAB.floor + 19.2 * k;
    officeChair(LAB.hx, LAB.floor, seatY);
    const look = bi >= 3 && bi < 6;
    const arm = look ? { aR: [kf(lt, [[3 * BEAT, .75], [3 * BEAT + .1, 1.25]], backOut), kf(lt, [[3 * BEAT, 1], [3 * BEAT + .1, 1.75]], backOut)] } : {};
    const dyH = -hit * 6;
    hero(LAB.hx, y, LAB.h, { view: 'side', ...POSES.type, ...arm, eyes: bi < 2 ? 'wide' : bi < 3 ? 'wide' : look ? 'wide' : 'determined', mouth: bi < 2 ? 'O' : look ? 'o' : 'grin', brows: bi < 3 ? 'up' : 'flat', lookY: look ? .5 : 0, lookX: look ? .4 : 0,
      chrome: neon ? 1 : 0, hairWind: wob(t, 2.5) * 1.5, dy: dyH, glint: hit * .8 });
    // no cable: the worm's circuitry glows from his ear, and the rig talks to him over the air
    const P = HEADP(LAB.hx, y, k, 1, dyH);
    sideEar(P, k);
    if (neon) {
      const E = P(-2.5, 1.8);
      glow(E[0], E[1], 60, PAL.nMagenta, .5 + .3 * hit);
      for (const tr of [[[-2.5, 1.8], [-.6, -.5], [2.2, -.5], [3, -1.3]], [[-2.5, 1.8], [-.9, 2.8], [1.6, 2.8]], [[-2.5, 1.8], [-3.6, 3.5], [-3.6, 7.6]], [[-2.5, 1.8], [-3, -2.5], [-1, -4.5], [1.5, -4.5]]]) neonLine(tr.map(p => P(...p)), PAL.nCyan, 2.4, .9, 0);
      dataLink(P(0, -11), [1380, 520], t, PAL.nCyan, -.18);
      dataLink(P(2, -9), [1690, 590], t + .37, PAL.nMagenta, -.12, .7);
    }
    camEnd();
  }

  // ---------- b72: SLAM. Close-up: the plug snaps into his neck port; neon spreads from the port ----------
  function slam(t, lt, dur) {
    const k = 27, fl = -1, x = 830 + k, y = 440 + 89 * k, P = HEADP(x, y, k, fl);   // head centre (830, 440), facing left
    const E = P(-2.5, 1.8), V = P(5.2, .1), port = P(-3.9, 8.7);
    const gE = expoOut(clamp(lt / .24)), gV = expoOut(clamp((lt - .025) / .22));
    // the traces race across the watercolour face first; the neon re-render floods out behind them
    const RE = 20 + 720 * easeInOut(clamp((lt - .05) / .27)), RV = 16 + 300 * easeInOut(clamp((lt - .07) / .24));
    const draw = () => {
      const neon = NEON >= .5;
      if (!neon) { X.drawImage(PAPER, 0, 0); wash(rectPts(-60, -60, W + 120, H + 120, 20), '#34386A', .95, 26, 4); blooms(0, 0, W, H, PAL.night, 6, .16, 5); glow(1560, 240, 760, '#FFC96B', .6, 'source-over'); glow(160, 760, 640, '#9FD8D0', .45, 'source-over'); }
      else { vgrad(0, 0, W, H, [[0, '#0D0720'], [1, '#2A1648']]); for (let i = 0; i < 14; i++) { const cx = 60 + i * 140; X.fillStyle = i % 3 ? PAL.nCyan : PAL.nMagenta; for (let r = 0; r < 12; r++) { X.globalAlpha = .12 + .2 * hash(i * 13 + r); X.fillRect(cx, frac(hash(i) + t * .6) * 200 + r * 90 - 100, 60 * hash(i + r * 3) + 10, 10); } } X.globalAlpha = 1; glow(1560, 260, 700, PAL.nMagenta, .25); glow(200, 700, 600, PAL.nCyan, .3); }
      hero(x, y, k * 100, { view: 'side', flip: true, eyes: 'wide', mouth: 'o', brows: 'up', chrome: neon ? clamp((lt - .06) / .1) : 0, glint: neon ? .9 : .4, hairWind: -1.6 * gE });
      sideEar(P, k);
    };
    const region = c => { blobPath(c, E[0], E[1], RE, t * 20); blobPath(c, V[0], V[1], RV, t * 23 + 2); };
    splitStyle(draw, region);
    grainOutside(c => { blobPath(c, E[0], E[1], RE * .96, t * 20); blobPath(c, V[0], V[1], RV * .96, t * 23 + 2); });
    // circuitry races out of the ear and across the watercolour face, ahead of the re-render
    drawCircuit(circuitNet(E[0], E[1], 9, 3, 880, 0, Math.PI * 1.25, 95), gE, [PAL.nCyan, PAL.nCyan, PAL.nMagenta, PAL.nYellow, PAL.nCyan], 5, '#0B0716');   // back over the hair, down the neck
    drawCircuit(circuitNet(E[0], E[1], 3, 9, 300, Math.PI, .8, 60), gE, [PAL.nCyan, PAL.nMagenta], 4, '#0B0716');                                              // a few across the cheek
    drawCircuit(circuitNet(V[0], V[1], 6, 17, 540, Math.PI, 1.7, 70), gV, [PAL.nCyan, PAL.nYellow, PAL.nCyan], 4.5, '#0B0716');                                // out of the eye
    // the ear: a burst of light, and the worm's afterglow (a little neon dash) deep in the canal
    const fade = 1 - clamp((lt - .1) / .2);
    glow(E[0], E[1], 190, PAL.nMagenta, .28 + .2 * fade); glow(E[0], E[1], 44, '#FFFFFF', .5 * fade + .15);
    neonLine([[E[0] - 14, E[1] + 4], [E[0] + 16, E[1] - 3]], PAL.nMagenta, 6, .9, 0);
    // the eye blazes cyan behind the glasses, rays shooting out
    glow(V[0], V[1], 150, PAL.nCyan, .4 * gV); glow(V[0], V[1], 34, '#FFFFFF', .6 * gV);
    for (let i = 0; i < 12; i++) { const an = Math.PI + (hash(i * 3.7) - .5) * 2.4, r0 = 95, r1 = r0 + (100 + 300 * hash(i * 1.9)) * gV; neonLine([[V[0] + Math.cos(an) * r0, V[1] + Math.sin(an) * r0], [V[0] + Math.cos(an) * r1, V[1] + Math.sin(an) * r1]], i % 4 ? PAL.nCyan : PAL.nYellow, 3, .7 * (1 - .5 * lt / dur), 0); }
    // pixel debris bursting out of his head
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const o = i % 3 ? E : V, an = hash(i * 5.1) * TAU, r = (60 + 700 * hash(i * 2.3)) * expoOut(clamp(lt / .3)), s = 6 + 16 * hash(i * 7); X.globalAlpha = .8 * (1 - lt / dur * .6); X.fillStyle = [PAL.nCyan, PAL.nMagenta, '#FFFFFF', PAL.nYellow][i % 4]; X.fillRect(o[0] + Math.cos(an) * r, o[1] + Math.sin(an) * r, s, s); }
    X.restore();
    // a chrome neck port clicks into existence
    const pk = backOut(clamp((lt - .09) / .12));
    if (pk > .01) {
      style(1);
      X.save(); X.translate(port[0], port[1]); X.rotate(-.08); X.scale(pk, pk);
      paint(rrPts(-58, -44, 116, 88, 22), { fill: '#C9D0E6', shade: '#6E7496', rim: '#FFFFFF', ink: PAL.line, sw: 2.4, light: [-.1, -.14] });
      paint(rrPts(-36, -20, 72, 40, 12), { fill: '#141024', ink: PAL.line, sw: 1.6 });
      neonLine(rrPts(-32, -16, 64, 32, 10), PAL.nCyan, 3.5, 1, 0, true);
      for (const sx of [-46, 46]) paint(ellPts(sx, 0, 6, 6, 8), { fill: '#8A90AE', ink: PAL.line, sw: 1 });
      X.restore();
      glow(port[0], port[1], 150, PAL.nCyan, .5 * pk);
      const rk = clamp((lt - .09) / .2); if (rk < 1) neonLine(ellPts(port[0], port[1], 70 + 160 * rk, 60 + 130 * rk, 30), PAL.nCyan, 4, 1 - rk, .5, true);
      style(.75);
    }
    // our own (gentler) phrase slam so the face stays readable: a 2-frame flash, a short RGB/glitch hit, shake, push
    FX.noAuto = true; FX.bloom = .38;
    FX.flash = Math.max(FX.flash, lt < .07 ? .55 * (1 - lt / .07) : 0); FX.rgb = Math.max(FX.rgb, .45 * Math.exp(-lt * 14)); FX.glitch = Math.max(FX.glitch, lt < .05 ? .5 : 0);
    FX.zoom *= (1 + .1 * easeOut(lt / dur)) * (1 + .06 * Math.exp(-lt * 10)); FX.shake += 20 * Math.exp(-lt * 9);
  }

  // ---------- b73–80: the scan edge re-renders the lab as neon, stepping right on every beat ----------
  function scanRoom(t, lt, dur) {
    // the re-render spreads outward from his head as a ring, stepping out on every beat (b73..b79 → full frame)
    const j = Math.min(6, BI(lt)), f = BF(lt), RS = [70, 200, 340, 510, 710, 940, 1190, 1520];
    const R = lerp(RS[j], RS[j + 1], expoOut(clamp(f * 3.2))), [cx, cy] = labHeadScr(lt), ph = t * 9;
    splitStyle(() => labScene(t, lt), c => blobPath(c, cx, cy, R, ph));
    if (R < 1500) grainOutside(c => blobPath(c, cx, cy, R * .98, ph));
    // scan band inside the ring + pixel debris on it
    X.save(); X.globalCompositeOperation = 'lighter';
    const g = X.createRadialGradient(cx, cy, Math.max(0, R - 170), cx, cy, R); g.addColorStop(0, 'rgba(39,242,242,0)'); g.addColorStop(1, 'rgba(39,242,242,.24)');
    X.fillStyle = g; X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.fill();
    const fr = Math.floor(t * 24);
    for (let i = 0; i < 56; i++) { const an = hash(i * 7.3 + fr) * TAU, rr = R + (hash(i * 3.1 + fr) - .7) * 150, s = 5 + hash(i + fr * .3) * 24; X.globalAlpha = .65 * hash(i * 9 + fr); X.fillStyle = [PAL.nCyan, PAL.nMagenta, '#FFFFFF'][i % 3]; X.fillRect(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, s, s * (hash(i * 5) * .6 + .3)); }
    X.restore();
    const hk = hitK(lt, 8);
    FX.rgb = Math.max(FX.rgb, .5 * hk); FX.glitch = Math.max(FX.glitch, .22 * hitK(lt, 18)); FX.bloom = .4;
  }

  // ---------- b80–84: hero shot from behind, low angle; the Dyson emblem ignites ----------
  function emblemHero(t, lt, dur) {
    style(1);
    const hit = hitK(lt), ign = clamp(lt / .1), rise = backOut(clamp(lt / .22));
    camBegin(960, 560 - lt * 26, 1.02 + lt * .025, wob(t, .15) * .012);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#0B0716'], [.55, '#1C0F3A'], [1, '#2A1648']]);
    // ceiling strips converging up (low angle)
    for (let i = -4; i <= 4; i++) neonLine([[960 + i * 520, -200], [960 + i * 150, 40]], i % 2 ? PAL.nMagenta : PAL.nCyan, 2.5, .35, 0);
    // big window: moon over the neon city
    const wx = 150, wy = 70, ww = 700, wh = 470;
    X.save(); tracePath(X, rectPts(wx, wy, ww, wh)); X.clip();
    vgrad(wx, wy, ww, wh, [[0, '#0B0716'], [.6, '#2E1256'], [1, '#FF2E88']]); stars(t, 30, { x0: wx, y0: wy, ext: [ww, wh * .6], seed: 8 });
    moon(wx + ww * .62, wy + wh * .34, 105, {});
    X.save(); X.translate(wx - 40, wy); const cs = ww / W * 1.2; X.scale(cs, cs); city(t, { horizon: wh / cs + 20, signs: 0, street: false, seed: 5 }); X.restore();
    X.restore();
    paint(rectPts(wx, wy, ww, wh), { ink: PAL.line, sw: 5 }); neonLine(rectPts(wx - 8, wy - 8, ww + 16, wh + 16).filter((_, i) => i % 2 === 0), PAL.nViolet, 2, .5, 0, true);
    line([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 4, '#2A1E48', 0);
    // wall screen with the mask
    monitor(1150, 150, 620, 390, { stand: false, glowR: .8 }, (x, y, w, h) => { codeRows(t, 7, x, y, w, h, 14, .3); mask(x + w / 2, y + h / 2, h * .3, { eyes: 'star', mouth: 'grin', eyeGlow: true, glow: .8 }); });
    // desk + monitors below
    desk(220, 790, 1480);
    monitor(300, 580, 330, 170, { stand: false }, (x, y, w, h) => codeRows(t, 8, x, y, w, h, 9));
    monitor(1300, 580, 330, 170, { stand: false }, (x, y, w, h) => chart(x + 20, y + 16, w - 40, h - 36, 'metr', 1, { w: 3 }));
    // rays behind him
    const k = 14, y = 1540 + (1 - rise) * 50, ex = 960, ey = y - 58 * k;
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .25, w = .06 + .03 * hash(i), L = 1600; X.globalAlpha = (.05 + .1 * hit) * ign; X.fillStyle = i % 2 ? PAL.nYellow : PAL.nOrange; X.beginPath(); X.moveTo(ex, ey); X.lineTo(ex + Math.cos(a - w) * L, ey + Math.sin(a - w) * L); X.lineTo(ex + Math.cos(a + w) * L, ey + Math.sin(a + w) * L); X.fill(); }
    X.restore();
    glow(ex, ey, 1000, PAL.nOrange, .2 * ign + .3 * Math.exp(-lt * 5));
    // no cable any more: a wireless link from the port on his neck up to the wall screen
    const nape = [960, y - 81 * k];
    dataLink([nape[0] + 20, nape[1] - 40], [1330, 380], t, PAL.nCyan, .22);
    hero(960, y, 100 * k, { view: 'back', aL: [.32, .12], aR: [.32, .12], lL: [.12, 0], lR: [-.12, 0], emblem: ign * (.2 + .35 * hit), hairWind: wob(t, 1.3) * 2, rimCol: PAL.nCyan });
    // ignition shockwave
    const sk = clamp(lt / .55);
    if (sk < 1) { neonLine(ellPts(ex, ey, 80 + 1300 * easeOut(sk), 50 + 900 * easeOut(sk), 40), PAL.nYellow, 7, 1 - sk, .5, true); }
    // sparks rising
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const px = hash(i * 3.3) * W, py = H + 100 - frac(hash(i * 5.1) + t * (.25 + .3 * hash(i))) * (H + 300), s = 3 + 5 * hash(i * 9); X.globalAlpha = .7; X.fillStyle = i % 3 ? PAL.nYellow : PAL.nCyan; X.fillRect(px, py, s, s); }
    X.restore();
    camEnd();
    FX.bloom = .5;
  }

  // ---------- b84–88: face close-up. Code in his glasses; the chrome implant traces light up beat by beat ----------
  function faceCU(t, lt, dur) {
    style(1);
    const bi = Math.min(3, BI(lt)), hit = hitK(lt), k = 26, x = 880, y = 470 + 89 * k;
    camBegin(960, 540, 1 + lt * .035, -.02 + lt * .01);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#0B0716'], [1, '#1E0E3E']]);
    // code streams behind
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i++) { const cx = -100 + i * 100 + hash(i) * 40, sp = 120 + 200 * hash(i * 3); X.fillStyle = i % 4 ? PAL.nCyan : PAL.nMagenta; for (let r = 0; r < 16; r++) { const yy = ((r * 80 + t * sp + hash(i * 7) * 400) % 1400) - 200; X.globalAlpha = .08 + .12 * hash(i * 11 + r); X.fillRect(cx, yy, 16 + 50 * hash(i + r * 7), 9); } }
    X.restore();
    glow(1700, 500, 900, PAL.nCyan, .3); glow(100, 300, 700, PAL.nMagenta, .25);
    const chrome = [.35, .6, .85, 1][bi] * (.75 + .25 * hit);
    hero(x, y, k * 100, { view: 'q', eyes: bi === 3 ? 'star' : 'wide', mouth: bi === 0 ? 'o' : bi === 3 ? 'grin' : 'O', brows: 'up', chrome, glint: 0, blush: bi === 3 ? .5 : 0, hairWind: wob(t, 1.8) * 1.2, rimCol: PAL.nCyan, tilt: -.03 + .02 * hit });
    // head-local → world (q view, no lean)
    const P = (hx, hy) => [x + hx * k, y + (-89 + hy) * k];
    // code reflected in the glasses
    for (const ex of [-2.6, 5.4]) {
      const [cx, cy] = P(ex, .2);
      X.save(); tracePath(X, ellPts(cx, cy, 3.25 * k, 3.05 * k, 20)); X.clip(); X.fillStyle = '#081A24'; X.globalAlpha = .3; X.fillRect(cx - 4 * k, cy - 4 * k, 8 * k, 8 * k); X.globalCompositeOperation = 'lighter';
      for (let r = 0; r < 12; r++) { const yy = cy - 3 * k + ((r * 16 + t * 70) % (6.2 * k)), id = r + Math.floor(t * 70 / 16); X.globalAlpha = .6; X.fillStyle = [PAL.nCyan, PAL.nGreen, PAL.nMagenta][id % 3]; X.fillRect(cx - 2.6 * k + hash(id) * 30, yy, 30 + hash(id * 3) * 3 * k, 7); }
      X.globalAlpha = .5; X.fillStyle = '#FFFFFF'; X.beginPath(); X.moveTo(cx - 2 * k, cy + 2.2 * k); X.lineTo(cx - 1.2 * k, cy + 2.6 * k); X.lineTo(cx + 1.6 * k, cy - 2.4 * k); X.lineTo(cx + .8 * k, cy - 2.8 * k); X.fill();
      X.restore();
    }
    // extra circuit traces (draw on, one more per beat)
    const e0 = -2.6, traces = [
      [[e0 - 1, 3.6], [e0 - 1, 5.6], [e0 - 3, 7], [e0 - 3, 8.5]],
      [[e0 - 3.3, 1.4], [e0 - 4.4, 2.4], [e0 - 4.4, 4.2], [e0 - 3.2, 6.2]],
      [[e0 - 3.2, -1.2], [e0 - 4.3, -2.6], [e0 - 4.3, -5]],
      [[e0 - 1, 3.6], [e0 + .9, 3.6], [e0 + .9, 4.8]]];
    traces.forEach((tr, i) => {
      if (i > bi) return;
      const on = i === bi ? clamp((lt - i * BEAT) / .12) : 1, pts = tr.map(p => P(...p)), segs = pts.length - 1, m = on * segs, out = [pts[0]];
      for (let s = 0; s < segs; s++) { if (m <= s) break; const kk = Math.min(1, m - s); out.push([lerp(pts[s][0], pts[s + 1][0], kk), lerp(pts[s][1], pts[s + 1][1], kk)]); }
      neonLine(out, PAL.nCyan, 5, .9, 0);
      const e = out[out.length - 1]; glow(e[0], e[1], 30, PAL.nCyan, .8); paint(ellPts(e[0], e[1], 7, 7, 8), { fill: '#E8FFFF', ink: null, flat: true });
    });
    // b87: the optic locks on — a reticle around his left eye
    if (bi === 3) { const [cx, cy] = P(e0, .2), rk = backOut(clamp((lt - 3 * BEAT) / .12)), rr = 4.3 * k * (2 - rk); neonLine(ellPts(cx, cy, rr, rr, 40), PAL.nCyan, 4, .9 * rk, 0, true); for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2 + t * 2; neonLine([[cx + Math.cos(a) * rr * 1.08, cy + Math.sin(a) * rr * 1.08], [cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr * 1.3]], PAL.nYellow, 5, rk, 0); } }
    camEnd();
    if (bi === 3) FX.rgb = Math.max(FX.rgb, .4 * hit);
  }

  // ======================================================================================
  // FORWARD PASS (b88–96)
  // ======================================================================================
  const TOKS = ['<s>', '▁AI', 'ing', '▁the', 'tok', '▁eval', '42', 'ly', '▁attn', '?', '▁line', '▁go', '▁up', '▁so', '▁back', '!'];
  const LCOL = [PAL.nCyan, PAL.nMagenta, PAL.nViolet, PAL.nYellow];
  function tokCube(x, y, s, lab, col, a, vx, vy) {
    if (a < .02 || s < 3) return;
    const d = Math.hypot(vx - x, vy - y) || 1, ox = (vx - x) / d * s * .3, oy = (vy - y) / d * s * .3, h = s / 2;
    X.save(); X.globalAlpha = a; X.lineWidth = Math.max(1, s * .05); X.strokeStyle = col;
    X.fillStyle = '#120A26'; X.fillRect(x - h + ox, y - h + oy, s, s); X.strokeRect(x - h + ox, y - h + oy, s, s);
    X.beginPath(); for (const [cx, cy] of [[-h, -h], [h, -h], [h, h], [-h, h]]) { X.moveTo(x + cx, y + cy); X.lineTo(x + cx + ox, y + cy + oy); } X.stroke();
    X.fillStyle = '#26184E'; X.fillRect(x - h, y - h, s, s); X.strokeRect(x - h, y - h, s, s);
    X.restore();
    if (s > 26) txt(lab, x, y, s * .3, '#FFFFFF', { font: 'Orbitron', alpha: a });
    glow(x, y, s * 1.1, col, .22 * a);
  }
  // ---------- mechinterp: sparse-autoencoder feature tags ----------
  const FEATS = [['golden gate bridge', 'bridge', PAL.nOrange, 31164], ['sycophantic praise', 'heart', PAL.nPink, 8810], ['deception', 'eye', PAL.nRed, 20375],
    ['em-dash —', 'dash', PAL.nMagenta, 4412], ['the Assistant', 'mask', PAL.nYellow, 1]];
  function featIcon(kind, col, r) {
    if (kind === 'bridge') { line([[-r * .8, r * .45], [r * .8, r * .45]], r * .09, col, 0); for (const sx of [-.42, .42]) line([[sx * r, r * .7], [sx * r, -r * .6]], r * .1, col, 0); line([[-r * .85, r * .05], [-r * .42, -r * .6], [0, -r * .05], [r * .42, -r * .6], [r * .85, r * .05]], r * .06, col, .5); }
    else if (kind === 'heart') paint(heartPts(0, r * .05, r * .62), { fill: col, ink: PAL.line, sw: 1.4 });
    else if (kind === 'eye') { paint(almondPts(r * .75, .7), { fill: '#FFF6E6', ink: PAL.line, sw: 1.4, curv: .3, flat: true }); paint(ellPts(0, 0, r * .24, r * .3, 10), { fill: col, ink: null, flat: true }); line([[-r * .7, r * .6], [r * .7, -r * .6]], r * .08, PAL.nRed, 0); }
    else if (kind === 'dash') neonLine([[-r * .62, 0], [r * .62, 0]], col, r * .2, 1, 0);
    else if (kind === 'mask') mask(0, 0, r * .62, { eyes: 'happy', mouth: 'smile', glow: .6 });
  }
  // a feature card: neuron + id + label + activation bar. lit 0..1. Drawn centred at (x, y), scale s.
  function featTag(x, y, s, j, lit, rot = 0, a = 1) {
    const [lab, icon, col, id] = FEATS[((j % FEATS.length) + FEATS.length) % FEATS.length], tw = txtW(lab, 56, 'Rajdhani'), w = tw + 190, h = 136;
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
    glow(0, 0, w * .62, col, .28 * lit * a);
    paint(rrPts(-w / 2, -h / 2, w, h, 20), { fill: '#0E0822', ink: null, flat: true, alpha: .9 * a });
    neonLine(rrPts(-w / 2, -h / 2, w, h, 20), col, 3.4, (.3 + .7 * lit) * a, 0, true);
    const nx = -w / 2 + 70;
    glow(nx, 0, 90, col, .8 * lit * a);
    paint(ellPts(nx, 0, 42, 42, 20), { fill: lit > .5 ? mixCol(col, '#FFFFFF', .15) : '#2A1A48', ink: col, sw: 2, alpha: a });
    X.save(); X.translate(nx, 0); X.globalAlpha = a; featIcon(icon, lit > .5 ? PAL.line : col, 34); X.restore(); X.globalAlpha = 1;
    txt('SAE FEATURE #' + id, -w / 2 + 128, -38, 22, col, { font: 'Orbitron', align: 'left', alpha: a });
    txt(lab, -w / 2 + 128, 6, 56, '#FFFFFF', { font: 'Rajdhani', align: 'left', alpha: a * (.55 + .45 * lit) });
    paint(rectPts(-w / 2 + 128, 42, w - 160, 10), { fill: '#2A1A48', ink: null, flat: true, alpha: a });
    if (lit > .02) paint(rectPts(-w / 2 + 128, 42, (w - 160) * lit, 10), { fill: col, ink: null, flat: true, alpha: a });
    X.restore();
  }
  // the residual stream: a river of light between (x0, y0) → (x1, y1); hwFn(u) half-width in px; particles flow toward u = 1
  function residual(t, pts, hwFn, flow = 1, a = 1) {
    const n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) { const p = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)], d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, nx = -(q[1] - p[1]) / d, ny = (q[0] - p[0]) / d, w = hwFn(i / (n - 1)) * (1 + .1 * Math.sin(i * .9 - t * 7)); L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]); }
    X.save(); X.globalCompositeOperation = 'lighter';
    X.globalAlpha = .16 * a; X.fillStyle = PAL.nCyan; tracePath(X, L.concat(R.slice().reverse()), .5); X.fill();
    const L2 = [], R2 = []; for (let i = 0; i < n; i++) { L2.push(lerp2(pts[i], L[i], .45)); R2.push(lerp2(pts[i], R[i], .45)); }
    X.globalAlpha = .18 * a; X.fillStyle = '#9FF7FF'; tracePath(X, L2.concat(R2.reverse()), .5); X.fill();
    X.restore();
    neonLine(L, PAL.nCyan, 2.5, .6 * a, .5); neonLine(R, PAL.nCyan, 2.5, .6 * a, .5); neonLine(pts, '#CFFFFF', 4, .75 * a, .5);
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {
      const u = frac(hash(i * 3.3) + t * flow * (.5 + .5 * hash(i * 7))), f = u * (n - 1), i0 = Math.min(n - 2, Math.floor(f)), kk = f - i0, off = (hash(i * 5.7) - .5) * 1.5;
      const c = lerp2(pts[i0], pts[i0 + 1], kk), l = lerp2(L[i0], L[i0 + 1], kk), w = [(l[0] - c[0]) * off, (l[1] - c[1]) * off], d = [pts[i0 + 1][0] - pts[i0][0], pts[i0 + 1][1] - pts[i0][1]], dl = Math.hypot(...d) || 1, len = hwFn(u) * (.3 + .5 * hash(i));
      X.globalAlpha = .8 * a * Math.sin(Math.PI * u); X.strokeStyle = i % 4 ? '#FFFFFF' : PAL.nYellow; X.lineWidth = Math.max(1.5, hwFn(u) * .06); X.beginPath(); X.moveTo(c[0] + w[0], c[1] + w[1]); X.lineTo(c[0] + w[0] - d[0] / dl * len, c[1] + w[1] - d[1] / dl * len); X.stroke();
    }
    X.restore();
  }
  const lerp2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];

  function tunnel(t, lt, dur) {
    style(1);
    const vx = 960 + wob(t, .23) * 50, vy = 400 + wob(t, .17) * 30, F = 560, gap = 900, near = 160, S = 1000;
    bg('#07040F'); glow(vx, vy, 800, PAL.nViolet, .35); glow(vx, vy, 260, '#FFFFFF', .3);
    const ph = lt / BEAT + .47, k0 = Math.floor(ph), hit = hitK(lt);   // a layer frame sweeps past the screen edge on every beat
    speedLines(vx, vy, .7, { n: 50, r0: 260 });
    // the residual stream running down the tunnel floor, flowing on ahead of him
    { const rp = []; for (let i = 0; i <= 26; i++) { const z = 230 * Math.pow(40, i / 26), sc = F / z; rp.push([vx + (380 + 60 * Math.sin(z * .002 - t * 2)) * sc, vy + 600 * sc]); }
      residual(t, rp, u => 150 * F / (230 * Math.pow(40, u)), 1.3); }
    for (let k = k0 + 8; k >= k0; k--) {
      const z = near + (k - ph + 1) * gap; if (z < 60) continue;
      const sc = F / z, a = clamp((7400 - z) / 4200) * clamp((z - 80) / 300), col = LCOL[((k % 4) + 4) % 4], rot = hash(k) * .5 - .25 + t * .06;
      const P = (px, py) => { const c = Math.cos(rot), s = Math.sin(rot); return [vx + (px * c - py * s) * sc, vy + (px * s + py * c) * sc]; };
      // the layer frame + grid
      const fr = [P(-S, -S), P(S, -S), P(S, S), P(-S, S)];
      X.save(); X.globalAlpha = a * .25; X.strokeStyle = col; X.lineWidth = Math.max(1, 2 * sc); X.beginPath();
      for (let g = -2; g <= 2; g++) { const u = g / 3 * S; let p = P(u, -S), q = P(u, S); X.moveTo(p[0], p[1]); X.lineTo(q[0], q[1]); p = P(-S, u); q = P(S, u); X.moveTo(p[0], p[1]); X.lineTo(q[0], q[1]); }
      X.stroke();
      // lit attention cells
      X.globalCompositeOperation = 'lighter';
      for (let c = 0; c < 7; c++) { const cx = Math.floor(hash(k * 13 + c) * 6) - 3, cy = Math.floor(hash(k * 7 + c * 3) * 6) - 3, on = .25 + .5 * hash(k + c + Math.floor(t * 6)); const q = [P(cx / 3 * S, cy / 3 * S), P((cx + 1) / 3 * S, cy / 3 * S), P((cx + 1) / 3 * S, (cy + 1) / 3 * S), P(cx / 3 * S, (cy + 1) / 3 * S)]; X.globalAlpha = a * on * .3; X.fillStyle = col; tracePath(X, q); X.fill(); }
      X.restore();
      neonLine(fr, col, Math.max(1.5, 7 * sc), a * (.7 + .3 * hit), 0, true);
      if (sc > .12 && sc < 1.3) txt((k % 2 ? 'ATTN' : 'MLP') + ' · L' + String(((k % 96) + 96) % 96 + 1).padStart(2, '0'), fr[0][0] + 150 * sc, fr[0][1] + 50 * sc, 44 * sc, col, { font: 'Orbitron', align: 'left', alpha: a, rot });
      // a ring of token cubes on the layer + attention arcs between them
      const tp = []; for (let j = 0; j < 6; j++) { const an = j / 6 * TAU + hash(k * 3) * TAU; tp.push(P(Math.cos(an) * 640, Math.sin(an) * 560)); }
      for (let j = 0; j < 3; j++) { const aI = Math.floor(hash(k * 5 + j) * 6), bI = (aI + 2 + Math.floor(hash(k * 9 + j) * 3)) % 6, pa = tp[aI], pb = tp[bI], m = [(pa[0] + pb[0]) / 2 * .6 + vx * .4, (pa[1] + pb[1]) / 2 * .6 + vy * .4]; neonLine([pa, m, pb], j % 2 ? PAL.nYellow : PAL.nPink, Math.max(1.2, 5 * sc), a * .8, .9); }
      tp.forEach((p, j) => tokCube(p[0], p[1], 150 * sc, TOKS[(k * 3 + j) % TOKS.length], col, a, vx, vy));
    }
    // SAE features light up as he passes: one card per beat, alternating sides, drifting toward him
    for (let j = 3; j >= -1; j--) {
      const z = near + (j + 1.55 - lt / BEAT) * gap * .5; if (z < 200 || z > 2600) continue;
      const sc = F / z, side = j % 2 ? 1 : -1, lit = lt >= j * BEAT ? (.75 + .25 * hitK(lt - j * BEAT, 5)) : 0;
      featTag(vx + side * 560 * sc, vy - 150 * sc, sc * 1.2, j, lit, side * .05 + wob(t, .3, j * .3) * .03, clamp((2600 - z) / 900));
      if (lit && lt - j * BEAT < .14) glow(vx + side * 560 * sc, vy - 150 * sc, 560 * sc, FEATS[j][2], .5 * (1 - (lt - j * BEAT) / .14));
    }
    // the researcher free-falling into the pass
    hero(960 + wob(t, .4) * 40, 1130 + wob(t, .6) * 16, 600, { view: 'back', aL: [2.2 + .15 * wob(t, 1.1), .35], aR: [2.2 + .15 * wob(t, 1.1, .5), .35], lL: [.3, .5], lR: [-.3, .5], rot: wob(t, .5) * .12, emblem: .5 + .5 * hit, hairWind: wob(t, 4) * 3, rimCol: PAL.nCyan });
    FX.zblur = Math.max(FX.zblur, .06 * hit * hit);   // only on the hit, so the feature labels stay crisp
  }
  // the induction head: [A][B] … [A] → attend to the token after the earlier A, copy it: "goth"
  const IND = ['▁shog', 'goth', '▁smiles', '.', '▁shog', 'goth'];
  function inductionRow(t, lt) {
    const fs = 40, y = 205, h = 74, gap = 26, ws = IND.map(s => txtW(s, fs, 'Orbitron') + 46), tot = ws.reduce((a, b) => a + b, 0) + gap * (IND.length - 1), cx = [];
    let x = 960 - tot / 2; ws.forEach(w => { cx.push(x + w / 2); x += w + gap; });
    const arcK = clamp((lt - BEAT) / .16), predK = clamp((lt - 2 * BEAT) / .14), top = y - h / 2, bot = y + h / 2;
    IND.forEach((s, i) => {
      const w = ws[i], x0 = cx[i] - w / 2, pred = i === 5, on = arcK > 0 && (i === 0 || i === 4), tgt = arcK > 0 && i === 1;
      const col = pred ? (predK > 0 ? PAL.nYellow : PAL.nViolet) : on ? PAL.nMagenta : tgt ? PAL.nYellow : PAL.nViolet;
      if ((on || tgt || (pred && predK > 0))) glow(cx[i], y, w * .8, col, .35);
      paint(rrPts(x0, top, w, h, 12), { fill: '#120A26', ink: null, flat: true, alpha: .94 });
      neonLine(rrPts(x0, top, w, h, 12), col, 2.6, pred && !predK ? .5 + .3 * wob(t, 3) : .9, 0, true);
      if (pred && predK <= 0) txt('?', cx[i], y + 2, fs + 6, '#FFFFFF', { font: 'Orbitron', alpha: .6 + .4 * wob(t, 3) });
      else txt(s, cx[i], y + 2, fs, '#FFFFFF', { font: 'Orbitron', pop: pred ? predK : undefined });
    });
    txt('next token?', cx[5], bot + 26, 20, '#B9A8FF', { font: 'Orbitron', alpha: predK > 0 ? 0 : .8 });
    if (arcK > 0) {   // the second ▁shog looks back at the token that followed the first one
      const a = [cx[4], top - 4], b = [cx[1] + 10, top - 4], c1 = [a[0] - 60, top - 150], c2 = [b[0] + 60, top - 150], pts = [];
      for (let i = 0; i <= 24; i++) pts.push(bez(a, c1, c2, b, i / 24));
      const g = growPts(pts, easeOut(arcK)); neonLine(g, PAL.nYellow, 4.5, 1, 0);
      if (arcK >= 1) neonLine([[b[0] - 16, b[1] - 24], b, [b[0] + 18, b[1] - 22]], PAL.nYellow, 4.5, 1, 0);
      txt('induction head', (a[0] + b[0]) / 2, top - 70, 34, PAL.nYellow, { font: 'Orbitron', pop: arcK, stroke: PAL.line, sw: 6 });
    }
    if (predK > 0) {   // ...and copies it forward
      const a = [cx[1], bot + 4], b = [cx[5] - 10, bot + 4], pts = []; for (let i = 0; i <= 24; i++) pts.push(bez(a, [a[0] + 80, bot + 95], [b[0] - 80, bot + 95], b, i / 24));
      X.save(); X.setLineDash([12, 10]); X.lineDashOffset = -t * 90; neonLine(growPts(pts, easeOut(predK)), PAL.nCyan, 3, .9, 0); X.restore();
      txt('copy', (a[0] + b[0]) / 2, bot + 96, 24, PAL.nCyan, { font: 'Orbitron', alpha: predK });
    }
  }
  function sideDive(t, lt, dur) {
    style(1);
    const hit = hitK(lt), spacing = 470, ph = lt / BEAT, bi = BI(lt);
    vgrad(0, 0, W, H, [[0, '#0B0716'], [.5, '#1C0E3E'], [1, '#0B0716']]);
    // streaks
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) { const yy = hash(i * 3.1) * H, len = 80 + 300 * hash(i * 7), xx = W + 400 - frac(hash(i) + t * (1.2 + hash(i * 5))) * (W + 800); X.globalAlpha = .12 + .2 * hash(i * 9); X.fillStyle = i % 5 ? '#FFFFFF' : PAL.nCyan; X.fillRect(xx, yy, len, 2 + 2 * hash(i * 13)); }
    X.restore();
    // layers (slabs) sliding right → left across the stream; one passes his head on every beat
    const passX = 1040, SY = 600, slabs = [];
    for (let k = Math.floor(ph) - 3; k <= Math.floor(ph) + 3; k++) slabs.push([k, passX + (k - ph) * spacing]);
    for (const [k, x] of slabs) {
      const col = LCOL[((k % 4) + 4) % 4], lit = Math.exp(-Math.abs(x - passX) / 200);
      const slab = [[x - 10, 300], [x + 70, 340], [x + 70, 960], [x - 10, 1000]];
      paint(slab, { fill: '#140C2C', ink: PAL.line, sw: 1.5, alpha: .85, flat: true });
      neonLine([...slab, slab[0]], col, 3 + 3 * lit, .6 + .4 * lit, 0);
      for (let j = 0; j < 7; j++) { const yy = 360 + j * 90; if (Math.abs(yy - SY) < 90) continue; const on = hash(k * 13 + j + Math.floor(t * 6)) < .35 + .4 * lit; paint(ellPts(x + 30, yy, 14, 14, 10), { fill: on ? col : '#2A1A48', ink: PAL.line, sw: 1, flat: true }); if (on) glow(x + 30, yy, 40, col, .4); }
      txt('L' + String(((k % 96) + 96) % 96 + 1).padStart(2, '0'), x + 30, 282, 28, col, { font: 'Orbitron' });
      // each layer reads from and writes back into the stream
      if (lit > .3) { neonLine([[x + 30, SY - 150], [x + 30, SY + 150]], col, 5 * lit, lit, 0); glow(x + 30, SY, 220, col, .35 * lit); }
    }
    // the residual stream: the river of light he rides through the layers
    { const rp = []; for (let i = 0; i <= 30; i++) { const xx = -100 + i * (W + 200) / 30; rp.push([xx, SY + 16 * Math.sin(xx * .004 - t * 2.2)]); } residual(t, rp, () => 92, .9); }
    txt('residual stream →', 40, SY + 142, 36, '#9FF7FF', { font: 'Orbitron', align: 'left', stroke: PAL.line, sw: 6 });
    // him, diving right along the stream like a superhero (rotation is about the hips)
    const k = 7, hipX = 760, hipY = SY - 40 + wob(t, 1.2) * 12, pose = { view: 'side', aR: [3.05, 0], aL: [2.85, .15], lL: [-.12, .25], lR: [.15, .5], rot: Math.PI / 2 + .08 + wob(t, .8) * .04, eyes: 'determined', mouth: 'grin', brows: 'angry', chrome: 1, hairWind: 2 };
    for (let i = 3; i >= 1; i--) hero(hipX - i * 90, hipY + 46 * k, 100 * k, { ...pose, silhouette: [PAL.nViolet, PAL.nMagenta, PAL.nCyan][i - 1], alpha: .22 * (1 - i / 4) });
    hero(hipX, hipY + 46 * k, 100 * k, pose);
    // the induction head over the token row (b93 attend, b94 copy)
    inductionRow(t, lt);
    // b95: the feature that matters lights up → the persona selection model
    if (bi >= 3) {
      const pk = clamp((lt - 3 * BEAT) / .12), head = [hipX + 44 * k, hipY - 6];
      neonLine([head, [1240, 470]], PAL.nYellow, 3, pk, 0);
      featTag(1400, 440, .92 * backOut(pk), 4, .8 + .2 * hitK(lt, 5), -.03, 1);
      if (pk < 1) glow(1400, 440, 500, PAL.nYellow, .5 * (1 - pk));
    }
    FX.blur = Math.max(FX.blur, 10); FX.blurAng = 0;
  }

  // ======================================================================================
  // THE PERSONA SELECTION MODEL (b96–104): the shoggoth router, then the operating system
  // ======================================================================================
  const PERSONAS = ['pirate', 'villain', 'roll', 'poet', 'cry', 'sinister', 'assistant'];
  const PBASE = { pirate: { eyes: 'dot', mouth: 'grin' }, villain: { eyes: 'narrow', mouth: 'smirk' }, roll: { eyes: 'wide', mouth: 'flat' }, poet: { eyes: 'closed', mouth: 'o', blush: .8 },
    cry: { eyes: 'closed', mouth: 'wobble' }, sinister: { eyes: 'dot', mouth: 'flat', col: '#3A3150' }, assistant: { eyes: 'open', mouth: 'smile' } };
  // the wardrobe: the smiley mask dressed up as other characters (mask-local overlays, r units)
  function personaMask(x, y, r, kind, o = {}) {
    const A = o.alpha ?? 1; if (A < .01) return;
    const rot = (o.rot || 0) + (kind === 'sinister' ? Math.PI : 0), neon = NEON >= .5, ink = neon ? PAL.line : PAL.ink, sw = clamp(r / 22, .5, 6);
    if (kind === 'sinister' && neon) glow(x, y, r * 2.2, PAL.nRed, .35 * A);
    mask(x, y, r, { ...PBASE[kind], ...(o.mood || {}), rot, alpha: A, glow: kind === 'sinister' ? 0 : (o.glow ?? .5) });
    X.save(); X.translate(x, y); X.rotate(rot);
    const Q = (px, py) => [px * r, py * r], E = [[-.4 * r, -.3 * r], [.33 * r, -.32 * r]], st = { ink, sw: sw * .8, alpha: A };
    if (kind === 'pirate') {
      paint([Q(-1.02, -.42), Q(-.92, -.92), Q(-.35, -1.22), Q(.3, -1.22), Q(.84, -.92), Q(1.03, -.5), Q(.4, -.68), Q(-.35, -.64)], { fill: '#E0303A', shade: '#8A1020', ...st, curv: .5 });
      for (const [dx, dy] of [[-.55, -.86], [-.1, -1.04], [.35, -.96], [.7, -.74], [-.82, -.6], [.06, -.8]]) paint(ellPts(dx * r, dy * r, r * .065, r * .065, 8), { fill: '#FFF6E6', ink: null, flat: true, alpha: A });
      paint([Q(.95, -.56), Q(1.45, -.3), Q(1.32, -.74)], { fill: '#E0303A', shade: '#8A1020', ...st });
      paint([Q(.95, -.6), Q(1.32, -1.0), Q(1.12, -.5)], { fill: '#C8202E', ...st });
      line([Q(-.98, -.1), E[0], Q(.02, -.66)], sw * .75, ink, 0, A);
      paint(ellPts(E[0][0], E[0][1] + r * .02, r * .2, r * .17, 12), { fill: '#15101C', ink, sw: sw * .6, alpha: A, flat: true });
    } else if (kind === 'villain') {
      for (const s of [-1, 1]) line([Q(s * .03, .15), Q(s * .22, .09), Q(s * .44, .14), Q(s * .58, .03), Q(s * .5, -.07), Q(s * .41, -.01)], sw * 1.15, ink, .6, A);
      line(ellPts(E[1][0], E[1][1], r * .21, r * .21, 18), sw * .7, '#E8C040', 0, A, true);
      line([[E[1][0] + r * .15, E[1][1] + r * .15], Q(.62, .3), Q(.72, .72)], sw * .45, '#E8C040', .6, A);
      for (const s of [0, 1]) line([[E[s][0] - r * .18, E[s][1] - r * (s ? .1 : .22)], [E[s][0] + r * .16, E[s][1] - r * (s ? .22 : .1)]], sw * 1.1, ink, 0, A);
    } else if (kind === 'roll') {
      for (const [ex, ey] of E) {
        paint(ellPts(ex, ey, r * .16, r * .21, 16), { fill: '#FFFFFF', ink, sw: sw * .6, alpha: A, flat: true });
        paint(ellPts(ex + r * .02, ey - r * .07, r * .08, r * .08, 10), { fill: ink, ink: null, alpha: A, flat: true });
        const lid = [[ex - r * .17, ey - r * .04]]; for (let i = 0; i <= 8; i++) { const an = Math.PI + i / 8 * Math.PI; lid.push([ex + Math.cos(an) * r * .17, ey + Math.sin(an) * r * .22]); } lid.push([ex + r * .17, ey - r * .04]);
        paint(lid, { fill: MOD.maskCol, ink: null, alpha: A, flat: true }); line([[ex - r * .17, ey - r * .04], [ex + r * .17, ey - r * .04]], sw * .9, ink, 0, A);
      }
    } else if (kind === 'poet') {
      paint(xform(ellPts(0, 0, r * .8, r * .25, 20), -.2 * r, -1.0 * r, 1, -.2), { fill: '#5A2A7A', shade: '#2E1240', ...st, curv: .3 });
      paint(ellPts(-.12 * r, -1.24 * r, r * .08, r * .07, 8), { fill: '#5A2A7A', ...st });
      line([Q(.62, .72), Q(.9, .28), Q(1.22, -.1)], sw * .6, '#FFF6E6', .5, A);   // a quill behind the "ear"
      paint([Q(1.22, -.1), Q(1.05, .12), Q(.95, .3), Q(1.12, .12)], { fill: '#FFF6E6', ...st, sw: sw * .4 });
    } else if (kind === 'cry') {
      for (const s of [0, 1]) { const [ex, ey] = E[s], d = s ? -1 : 1; line([[ex - d * r * .16, ey - r * .14], [ex + d * r * .12, ey - r * .26]], sw * 1.05, ink, 0, A);
        const tr = []; for (let i = 0; i <= 6; i++) { const u = i / 6; tr.push([ex + (s ? 1 : -1) * r * .05 * u + Math.sin(u * 7 + T * 9) * r * .025, ey + r * (.05 + .95 * u)]); }
        paint(ribbon(tr, u => r * (.045 + .03 * u)), { fill: '#7FDFFF', ink: null, alpha: A * .95, flat: true });
        const dy = frac(T * 2 + s * .5); paint(ellPts(tr[6][0], tr[6][1] + dy * r * .5, r * .06, r * .08, 8), { fill: '#7FDFFF', ink: null, alpha: A * (1 - dy), flat: true }); }
    } else if (kind === 'sinister') {
      for (const s of [0, 1]) { const [ex, ey] = E[s], d = s ? -1 : 1; const slit = [[ex - d * r * .17, ey - r * .09], [ex + d * r * .15, ey + r * .03], [ex - d * r * .1, ey + r * .07]].map(p => p);
        paint(slit, { fill: '#FF2442', ink: null, alpha: A, flat: true }); if (neon) glow(ex, ey, r * .35, PAL.nRed, .6 * A); }
      const up = [Q(-.54, .2), Q(-.2, .33), Q(.2, .33), Q(.54, .18)], low = [Q(.54, .18), Q(.3, .5), Q(0, .6), Q(-.3, .5), Q(-.54, .2)];
      paint([...up, ...low.slice(1)], { fill: '#5A0A18', ink: '#FF2442', sw: sw * .6, alpha: A, curv: .5 });
      const teeth = []; for (let i = 0; i <= 8; i++) teeth.push(Q(-.44 + i * .11, i % 2 ? .44 : .3)); line(teeth, sw * .7, '#FFE9A0', 0, A);
    }
    X.restore();
  }

  // ---- the router: the shoggoth tries on masks from a revolving wardrobe, one per half-beat, and lands on the Assistant ----
  const TREE = { root: [978, 560], n1: [978, 440], n2: [[640, 350], [978, 320], [1316, 350]],
    tips: [[330, 265, 0, 'pirate', 0], [520, 215, 0, 'villain', -1], [760, 185, 1, 'roll', 0], [978, 165, 1, 'assistant', 1], [1196, 185, 1, 'poet', 0], [1436, 215, 2, 'sinister', -1], [1626, 265, 2, 'cry', 0]] };
  const TW = { '1': [.55, .72, .86, 1], '-1': [.5, .3, .16, .06], '0': [.5, .44, .36, .3] };
  function personaTree(t, lt, land) {
    const bi = Math.min(3, BI(lt)), e = easeOut(clamp(BF(lt) * BEAT / .12));
    const wt = al => { const a = TW[al]; return bi === 0 ? a[0] : lerp(a[bi - 1], a[bi], e); };
    const colOf = al => al > 0 ? PAL.nYellow : al < 0 ? PAL.nRed : PAL.nViolet;
    const bend = (p, q, amt) => { const m = [(p[0] + q[0]) / 2 + (q[1] - p[1]) * amt, (p[1] + q[1]) / 2 - (q[0] - p[0]) * amt]; return [p, m, q]; };
    neonLine([TREE.root, TREE.n1], PAL.nYellow, 9, .55 + .3 * land, 0);
    TREE.n2.forEach((n, j) => { const ws = TREE.tips.filter(tp => tp[2] === j).map(tp => wt(tp[4])), w = Math.max(...ws), al = j === 1 ? 1 : 0; neonLine(bend(TREE.n1, n, .08 * (j - 1)), colOf(al), 2 + 7 * w, .2 + .7 * w, .6); });
    TREE.tips.forEach(([x, y, par, kind, al], i) => {
      const w = wt(al), n = TREE.n2[par], col = colOf(al);
      if (al < 0) { X.save(); X.setLineDash([10, 12]); } neonLine(bend(n, [x, y], .1 * (i % 2 ? 1 : -1)), col, 1.5 + 7 * w, .15 + .85 * w, .6); if (al < 0) X.restore();
      glow(x, y, 40 + 60 * w, col, .5 * w);
      paint(ellPts(x, y, 9 + 12 * w, 9 + 12 * w, 14), { fill: w > .45 ? col : '#2A1A48', ink: PAL.line, sw: 1.4, flat: true });
      if (bi >= 1 && al !== 0) { const k = clamp(BF(lt) * BEAT / .1), a = 1 - BF(lt) * .6, tx = x + 40, ty = y - 6, s = 14 * backOut(k);   // training evidence: ▲ upweight / ▼ downweight
        paint(al > 0 ? [[tx, ty - s], [tx + s, ty + s * .7], [tx - s, ty + s * .7]] : [[tx, ty + s], [tx + s, ty - s * .7], [tx - s, ty - s * .7]], { fill: al > 0 ? PAL.nGreen : PAL.nRed, ink: PAL.line, sw: 1, alpha: a, flat: true }); }
    });
    // evidence pulses running up the aligned path
    const path = [TREE.root, TREE.n1, TREE.n2[1], TREE.tips[3]];
    for (let j = 0; j < 4; j++) { const u = frac(t * 1.2 + j / 4) * 3, s = Math.min(2, Math.floor(u)), p = lerp2(path[s], path[s + 1], u - s); glow(p[0], p[1], 30, PAL.nYellow, .8); }
    if (land > 0) { const [x, y] = TREE.tips[3]; glow(x, y, 160, PAL.nYellow, .6 * land); mask(x, y, 30 * backOut(land), { eyes: 'happy', mouth: 'smile', glow: .8 }); }
  }
  function hudTag(x, y, small, big, col) {
    const w = Math.max(txtW(big, 54, 'Rajdhani'), txtW(small, 24, 'Orbitron')) + 48;
    paint(rrPts(x, y, w, 118, 10), { fill: '#0B0716', ink: null, flat: true, alpha: .78 });
    neonLine([[x, y + 26], [x, y], [x + 50, y]], col, 3.5, .95, 0); neonLine([[x + w - 50, y + 118], [x + w, y + 118], [x + w, y + 92]], col, 3.5, .95, 0);
    txt(small, x + 24, y + 32, 24, col, { font: 'Orbitron', align: 'left' });
    txt(big, x + 24, y + 78, 54, '#FFFFFF', { font: 'Rajdhani', align: 'left' });
  }
  function router(t, lt, dur, o = {}) {
    style(1);
    const hb = BEAT / 2, st = Math.min(6, Math.floor(lt / hb + 1e-4)), sn = lt - st * hb;
    const rot = st === 0 ? -1.4 * (1 - backOut(clamp(lt / .2))) : st - 1 + backOut(clamp(sn / .11));   // ring position = index of the front mask
    const land = st >= 6 ? clamp(sn / .14) : 0, hit = hitK(lt), swing = st ? .3 * Math.sin(sn * 26) * Math.exp(-sn * 9) : 0;
    camBegin(960, 560, 1.03 + lt * .035, wob(t, .2) * .01);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#07040F'], [.55, '#170B34'], [1, '#2A1648']]);
    X.save(); X.strokeStyle = 'rgba(155,92,255,.18)'; X.lineWidth = 2; X.beginPath();
    for (let i = -14; i <= 14; i++) { X.moveTo(960 + i * 40, 760); X.lineTo(960 + i * 380, 1500); }
    for (let r = 0; r < 7; r++) { const yy = 760 + Math.pow(r / 7 + frac(t * .3) / 7, 2) * 700; X.moveTo(-800, yy); X.lineTo(W + 800, yy); }
    X.stroke(); X.restore();
    stars(t, 50, { ext: [W, 700], seed: 12 });
    personaTree(t, lt, land);
    // the shoggoth; the front slot of the wardrobe sits right over its big middle eye (so between masks you glimpse it)
    const sx = 978, sy = 720, s = 222, k = s / 128, fx = sx - 9 * k, fy = sy + 11 * k, RX = 610, RY = 116, rcy = fy - RY;
    const items = PERSONAS.map((kind, i) => { const th = Math.PI / 2 + (i - rot) * TAU / 7, d = (Math.sin(th) + 1) / 2, p = lerp(.4, 1, d); return { kind, i, th, d, p, x: fx + Math.cos(th) * RX, y: rcy + Math.sin(th) * RY }; });
    const railPt = th => { const d = (Math.sin(th) + 1) / 2, p = lerp(.4, 1, d); return [fx + Math.cos(th) * RX, rcy + Math.sin(th) * RY - 150 * p]; };
    const rail = (a0, a1) => { const pts = []; for (let i = 0; i <= 24; i++) pts.push(railPt(lerp(a0, a1, i / 24))); neonLine(pts, PAL.nCyan, 3, .75, .5); };
    const drawItem = it => {
      const sel = it.kind === 'assistant' && land > 0, r = 102 * it.p * (sel ? 1 + .14 * elasticOut(land) : 1), a = land > 0 && !sel ? lerp(1, .38, land) : 1, [hx, hy] = railPt(it.th);
      line([[hx, hy], [it.x, it.y - r * 1.08]], 2.2 * it.p, '#B9A8FF', 0, .8 * a);
      neonLine([[hx - 8 * it.p, hy + 8 * it.p], [hx, hy], [hx + 6 * it.p, hy - 6 * it.p]], PAL.nCyan, 2 * it.p, .8 * a, .5);
      personaMask(it.x, it.y, r, it.kind, { alpha: a, rot: (it.i === Math.round(rot) ? swing : swing * .5) * (1 - land), mood: sel ? { eyes: 'happy', mouth: 'smile', blush: .6 } : undefined, glow: sel ? 1 : .35 });
    };
    rail(Math.PI, TAU); items.filter(it => it.d < .5).sort((a, b) => a.d - b.d).forEach(drawItem);
    const sinister = st === 5;
    if (land > 0) glow(fx, fy, 420, PAL.nYellow, .35 * land);
    shoggoth(sx, sy, s, { t: onTwos(t), reach: .8, wiggle: 3.2, mask: false, eyesN: 7, seed: 2, look: [-.2, .4], glowEyes: sinister });
    rail(0, Math.PI); items.filter(it => it.d >= .5).sort((a, b) => a.d - b.d).forEach(drawItem);
    // b99: it lands on the Assistant
    if (land > 0) {
      const lk = backOut(land);
      if (land < 1) neonLine(ellPts(fx, fy, 130 + 260 * land, 150 + 300 * land, 32), PAL.nYellow, 5, 1 - land, .5, true);
      neonLine([[fx - 16, fy + 150], [fx, fy + 132], [fx + 16, fy + 150]], PAL.nYellow, 3, lk, 0);
      if (!o.postcard) txt('the Assistant', fx, fy + 196, 78, PAL.nYellow, { font: 'Anton', stroke: '#000', sw: 10, pop: land, glow: PAL.nYellow });
    }
    camEnd();
    hudTag(56, 52, 'PERSONA SELECTION', 'the router', PAL.nCyan);
    if (sinister) { FX.tint = '#FF2442'; FX.tintA = .18 * Math.exp(-sn * 4); FX.rgb = Math.max(FX.rgb, .45 * Math.exp(-sn * 8)); }
    if (land > 0 && land < 1) { FX.flash = Math.max(FX.flash, .3 * (1 - land)); FX.flashCol = '#FFF6C8'; }
    FX.shake += st ? 5 * Math.exp(-sn * 14) : 0;
  }

  // ---- the operating system: a glass-walled server-rack terrarium with a tiny world and the Assistant living inside ----
  // (cx, by) = centre of the glass box's front bottom edge; w × h = glass box. The rack cabinet continues below.
  function osRack(t, cx, by, w, h, o = {}) {
    const D = [w * .15, -h * .19], x0 = cx - w / 2, gT = h * .07, lidH = h * .09, cab = o.cab ?? 760;
    const G = (u, v, z) => [x0 + u * w + v * D[0], by - z + v * D[1]];
    const quad = (u0, v0, u1, v1, z0, z1, axis) => axis === 'v' ? [G(u0, v0, z0), G(u1, v0, z0), G(u1, v0, z1), G(u0, v0, z1)] : axis === 'u' ? [G(u0, v0, z0), G(u0, v1, z0), G(u0, v1, z1), G(u0, v0, z1)] : [G(u0, v0, z0), G(u1, v0, z0), G(u1, v1, z0), G(u0, v1, z0)];
    const box3 = (u, v, du, dv, z0, hz, col, dk, top, edge) => {
      const f = quad(u, v, u + du, v, z0, z0 + hz, 'v'), r = quad(u + du, v, u + du, v + dv, z0, z0 + hz, 'u'), tp = quad(u, v, u + du, v + dv, z0 + hz, 0, 't');
      paint(r, { fill: dk, ink: PAL.line, sw: 1, flat: true }); paint(tp, { fill: top, ink: PAL.line, sw: 1, flat: true }); paint(f, { fill: col, ink: PAL.line, sw: 1, flat: true });
      if (edge) neonLine([f[3], f[2], r[2]], edge, 1.4, .7, 0);
      return f;
    };
    // --- the rack cabinet it sits on
    paint(quad(1, 0, 1, 1, 0, -cab, 'u'), { fill: '#100C22', ink: PAL.line, sw: 2, flat: true });
    paint(quad(0, 0, 1, 0, 0, -cab, 'v'), { fill: '#1A1530', shade: '#0C0A18', ink: PAL.line, sw: 2, light: [-.02, -.01] });
    for (let i = 0; i < 12; i++) {
      const z0 = -16 - i * 62; if (-z0 > cab) break; const f = quad(.04, 0, .96, 0, z0, z0 - 48, 'v');
      paint(f, { fill: '#0B0716', ink: null, flat: true });
      for (let j = 0; j < 9; j++) { const on = hash(i * 13 + j * 7 + Math.floor(t * 7 + i)) < .55, [lx, ly] = G(.08 + j * .035, 0, z0 - 24); X.fillStyle = on ? (j === 0 ? PAL.nGreen : j % 3 ? PAL.nCyan : PAL.nYellow) : '#221A38'; X.fillRect(lx, ly - 4, 9, 8); }
      const [ax, ay] = G(.55, 0, z0 - 24), [bx] = G(.92, 0, 0); X.fillStyle = '#1C1636'; X.fillRect(ax, ay - 7, bx - ax, 14);
    }
    neonLine([G(0, 0, 0), G(1, 0, 0), G(1, 1, 0)], PAL.nViolet, 2.5, .8, 0);
    // --- inside the glass: back + left panes, the circuit-board floor
    paint(quad(0, 1, 1, 1, 0, h, 'v'), { fill: '#081624', ink: null, flat: true, alpha: .92 });
    paint(quad(0, 0, 0, 1, 0, h, 'u'), { fill: '#0A1C2C', ink: null, flat: true, alpha: .92 });
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = 'rgba(39,242,242,.13)'; X.lineWidth = 1.5; X.beginPath();
    for (let i = 1; i < 10; i++) { const [ax, ay] = G(i / 10, 1, 0), [bx, by2] = G(i / 10, 1, h); X.moveTo(ax, ay); X.lineTo(bx, by2); }
    for (let i = 1; i < 6; i++) { const [ax, ay] = G(0, 1, i / 6 * h), [bx, by2] = G(1, 1, i / 6 * h); X.moveTo(ax, ay); X.lineTo(bx, by2); }
    X.stroke(); X.restore();
    glow(...G(.5, .6, h * .45), w * .55, PAL.nCyan, .16);
    paint(quad(0, 0, 1, 0, 0, gT, 'v'), { fill: '#06241B', ink: PAL.line, sw: 1.2, flat: true });
    paint(quad(0, 0, 1, 1, gT, 0, 't'), { fill: '#0C3A2C', ink: PAL.line, sw: 1.2, flat: true });
    const trace = (pts, col, wd, a) => neonLine(pts.map(([u, v]) => G(u, v, gT)), col, wd, a, 0);
    for (const v of [.12, .56, .8]) trace([[.02, v], [.3, v], [.34, v + .07], [.6, v + .07], [.64, v], [.98, v]], PAL.nGreen, 2, .45);
    for (const u of [.24, .47, .72]) trace([[u, .02], [u, .3], [u + .03, .45], [u + .03, .98]], PAL.nGreen, 2, .35);
    trace([[.02, .34], [.98, .34]], PAL.nCyan, 4.5, .7);   // the main bus: the Assistant's road
    for (let i = 0; i < 14; i++) { const [px, py] = G(.05 + hash(i * 3.1) * .9, .05 + hash(i * 5.3) * .9, gT); paint(ellPts(px, py, 5, 3, 8), { fill: '#C9A84A', ink: null, flat: true }); }
    // --- the diorama, back to front
    const ua = o.au ?? .5, items = [
      [.9, () => { for (const [u, hh] of [[.06, .34], [.15, .27], [.88, .36]]) { const f = box3(u, .72, .07, .14, gT, h * hh, '#1C1836', '#0E0B1E', '#2A2450', PAL.nCyan); for (let j = 0; j < 6; j++) { const [lx, ly] = G(u + .015, .72, gT + h * hh * (.85 - j * .13)); X.fillStyle = hash(j + u * 50 + Math.floor(t * 8)) < .6 ? PAL.nGreen : PAL.nCyan; X.fillRect(lx, ly, w * .04, 3); } } }],
      [.75, () => { const q = quad(.34, .7, .64, .7, h * .36, h * .74, 'v'); paint(q, { fill: '#0E3A4A', op: .35, ink: null, flat: true }); neonLine([...q, q[0]], PAL.nCyan, 2, .9, 0);
        const cp = []; for (let i = 0; i <= 16; i++) { const u = i / 16; cp.push(G(.36 + u * .26, .7, h * (.4 + .3 * Math.pow(u, 3.2) * clamp(t * .5 % 1.2 + .2)))); } neonLine(cp, PAL.nYellow, 2.5, 1, .3); }],
      [.62, () => { box3(.78, .6, .08, .12, gT, h * .24, '#1C1836', '#0E0B1E', '#2A2450', PAL.nMagenta); box3(.38, .58, .1, .12, gT, 10, '#111', '#050505', '#222', null); }],
      [.5, () => { const [mx, my] = G(.72, .5, h * .8); glow(mx, my, h * .2, '#FFF1C8', .3); moon(mx, my, h * .06, {}); line([[mx, my - h * .06], G(.72, .5, h)], 1.5, '#8A80B0', 0, .8); }],
      [.34, () => { const [ax, ay] = G(ua, .34, gT), ah = h * (o.aH ?? .2); paint(ellPts(ax, ay, ah * .32, ah * .07, 16), { fill: PAL.nYellow, op: .25, ink: null, flat: true }); assistant(ax, ay, h * (o.aH ?? .2), { walk: o.walk, wave: o.wave, flip: o.aFlip, mood: o.aMood, glowK: .8 }); }],
      [.22, () => { const q = quad(.66, .2, .92, .2, h * .22, h * .46, 'v'); paint(q, { fill: '#3A0E3A', op: .3, ink: null, flat: true }); neonLine([...q, q[0]], PAL.nMagenta, 2, .9, 0);
        for (let r = 0; r < 5; r++) { const [lx, ly] = G(.68 + .02 * (r % 2), .2, h * (.42 - r * .042)); X.fillStyle = [PAL.nPink, PAL.nCyan, PAL.nYellow][(r + Math.floor(t * 6)) % 3]; X.globalAlpha = .85; X.fillRect(lx, ly, w * (.08 + .1 * hash(r + Math.floor(t * 6))), 4); } X.globalAlpha = 1; }],
      [.1, () => { box3(.08, .08, .1, .1, gT, 9, '#111', '#050505', '#222', null); box3(.52, .06, .12, .1, gT, 11, '#111', '#050505', '#1E1E2A', PAL.nGreen); }]];
    items.sort((a, b) => b[0] - a[0]).forEach(it => it[1]());
    // --- glass: right + front panes, corner posts, lid
    paint(quad(1, 0, 1, 1, 0, h, 'u'), { fill: '#27F2F2', op: .06, ink: null, flat: true });
    paint(quad(0, 0, 1, 0, 0, h, 'v'), { fill: '#27F2F2', op: .05, ink: null, flat: true });
    X.save(); tracePath(X, quad(0, 0, 1, 0, 0, h, 'v')); X.clip(); X.globalCompositeOperation = 'lighter'; X.fillStyle = '#FFFFFF';
    for (const [u0, wd, a] of [[.08, .1, .07], [.24, .03, .1], [.62, .14, .05]]) { X.globalAlpha = a; const p = [G(u0, 0, 0), G(u0 + wd, 0, 0), G(u0 + wd + .35, 0, h), G(u0 + .35, 0, h)]; tracePath(X, p); X.fill(); }
    X.restore();
    const post = (u, v, a = 1) => { const [ax, ay] = G(u, v, 0), [, ty] = G(u, v, h); paint(rectPts(ax - 9, ty, 18, ay - ty), { fill: '#241E40', shade: '#120E24', ink: PAL.line, sw: 1.4, alpha: a });
      X.fillStyle = '#07040F'; X.globalAlpha = a; for (let yy = ty + 14; yy < ay - 8; yy += 22) X.fillRect(ax - 3, yy, 6, 7); X.globalAlpha = 1; neonLine([[ax + 9, ty], [ax + 9, ay]], PAL.nCyan, 1.4, .5 * a, 0); };
    post(1, 1, .8); post(0, 0); post(1, 0);
    neonLine([G(0, 0, 0), G(1, 0, 0), G(1, 1, 0)], PAL.nCyan, 2, .6, 0); neonLine([G(0, 0, h), G(0, 1, h), G(1, 1, h), G(1, 0, h), G(0, 0, h)], PAL.nCyan, 2, .6, 0);
    paint(quad(1, 0, 1, 1, h, h + lidH, 'u'), { fill: '#120E24', ink: PAL.line, sw: 1.6, flat: true });
    paint(quad(0, 0, 1, 1, h + lidH, 0, 't'), { fill: '#241E40', ink: PAL.line, sw: 1.6, flat: true });
    paint(quad(0, 0, 1, 0, h, h + lidH, 'v'), { fill: '#1A1530', ink: PAL.line, sw: 1.6, flat: true });
    for (const u of [.3, .7]) { const [fx2, fy2] = G(u, .5, h + lidH); paint(ellPts(fx2, fy2, w * .09, -D[1] * .32, 18), { fill: '#0B0716', ink: '#3A3260', sw: 1.2, flat: true }); for (let b = 0; b < 5; b++) { const an = b / 5 * TAU + t * 14; line([[fx2, fy2], [fx2 + Math.cos(an) * w * .08, fy2 + Math.sin(an) * -D[1] * .28]], 2, '#3A3260', 0); } }
    neonLine([G(.04, 0, h + lidH * .5), G(.96, 0, h + lidH * .5)], PAL.nYellow, 2.5, .6 + .4 * pulse(t), 0);
    return { G, gT };
  }
  const OSR = { cx: 1250, by: 880, w: 800, h: 460 };
  function osBg(t) {
    vgrad(-300, -300, W + 600, H + 600, [[0, '#07040F'], [.6, '#150A30'], [1, '#22103E']]);
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = '#FFFFFF'; X.globalAlpha = .045; X.beginPath(); X.moveTo(1150, -200); X.lineTo(1450, -200); X.lineTo(1850, 1100); X.lineTo(800, 1100); X.fill(); X.restore();
    stars(t, 40, { seed: 21 });
  }
  function osPeer(t, lt, dur) {
    style(1);
    const bi = BI(lt), hit = hitK(lt), wv = bi >= 1 ? clamp((lt - BEAT) / .1) : 0;
    camBegin(1120, 612, 1.2 + lt * .06, 0);
    osBg(t);
    const au = bi ? .4 : lerp(.16, .4, lt / BEAT);
    osRack(t, OSR.cx, OSR.by, OSR.w, OSR.h, { au, aH: .27, walk: bi ? undefined : bpOf(t) / 2, wave: wv, aFlip: bi >= 1, aMood: bi >= 1 ? { eyes: 'happy', mouth: 'grin', blush: .6 } : undefined });
    // the terrarium's light on his face
    glow(770, 650, 330, PAL.nCyan, .2);
    // he leans on the rack and peers in through the glass
    const k = 9, hx = 506, gy = 1395;
    hero(hx, gy, 100 * k, { view: 'side', lean: .55, aR: [.5, .5], aL: [.42, .62], lL: [.05, 0], lR: [-.05, 0], eyes: bi ? 'wide' : 'narrow', mouth: bi ? 'smile' : 'o', brows: 'up', lookX: .9, lookY: .5, blush: bi ? .6 : 0, glint: .5 + .4 * hit, chrome: 1, rimCol: PAL.nCyan, hairWind: wob(t, .7) * .6, dy: -hit * 4 });
    camEnd();
    hudTag(56, 52, 'PERSONA SELECTION', 'the operating system', PAL.nYellow);
  }
  // the reverse: from inside the tiny world, his giant face peering through the glass while the Assistant waves up at him
  function osInside(t, lt, dur) {
    style(1);
    const hit = hitK(lt), hz = 690;
    camBegin(960, 540, 1.04 + lt * .1, -.01);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#0B0716'], [1, '#1E0E3E']]);
    glow(1000, 380, 700, PAL.nCyan, .25);
    hero(1010, 330 + 89 * 46, 4600, { view: 'front', eyes: 'wide', mouth: 'o', brows: 'up', lookY: .8, lookX: -.3, glint: .7, chrome: 1, blush: .5, swMul: 2.4, rimCol: PAL.nCyan });
    // the glass wall between them: tint, reflections, rack posts, the lid above
    paint(rectPts(-100, -100, W + 200, hz + 100), { fill: '#0A3A48', op: .28, ink: null, flat: true });
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = '#FFFFFF'; for (const [x0, wd, a] of [[160, 120, .06], [330, 40, .1], [1400, 200, .05]]) { X.globalAlpha = a; X.beginPath(); X.moveTo(x0, hz); X.lineTo(x0 + wd, hz); X.lineTo(x0 + wd + 400, -100); X.lineTo(x0 + 400, -100); X.fill(); } X.restore();
    for (const px of [70, 1850]) { paint(rectPts(px - 22, -100, 44, hz + 100), { fill: '#241E40', shade: '#120E24', ink: PAL.line, sw: 2 }); X.fillStyle = '#07040F'; for (let yy = 0; yy < hz; yy += 40) X.fillRect(px - 6, yy, 12, 14); neonLine([[px + 22, -100], [px + 22, hz]], PAL.nCyan, 2, .6, 0); }
    paint(rectPts(-100, -100, W + 200, 150), { fill: '#1A1530', ink: PAL.line, sw: 2, flat: true }); neonLine([[-100, 50], [W + 100, 50]], PAL.nYellow, 3, .7 + .3 * pulse(t), 0);
    // the circuit-board floor, from our ankle height
    const vpx = 960, vpy = 600;
    paint([[-100, hz], [W + 100, hz], [W + 100, H + 100], [-100, H + 100]], { fill: '#0C3A2C', ink: PAL.line, sw: 2, flat: true });
    X.save(); X.beginPath(); X.rect(-100, hz, W + 200, H); X.clip();
    for (let i = -8; i <= 8; i++) { const bx = 960 + i * 330, a = [bx, H + 100], b = lerp2(a, [vpx, vpy], (H + 100 - hz) / (H + 100 - vpy)); neonLine([a, b], i === 1 ? PAL.nCyan : PAL.nGreen, i === 1 ? 7 : 2.5, i === 1 ? .8 : .35, 0); }
    for (let r = 0; r < 6; r++) { const yy = hz + Math.pow((r + frac(t * .4)) / 6, 2) * (H - hz + 60); neonLine([[-100, yy], [W + 100, yy]], PAL.nGreen, 1.5, .25, 0); }
    for (let i = 0; i < 10; i++) { const u = hash(i * 3.3), yy = hz + 20 + hash(i * 5.1) * 330, sc = (yy - vpy) / (H - vpy), xx = vpx + (u - .5) * 3000 * sc; paint(ellPts(xx, yy, 12 * sc, 6 * sc, 8), { fill: '#C9A84A', ink: null, flat: true }); }
    X.restore();
    neonLine([[-100, hz], [W + 100, hz]], PAL.nCyan, 3, .7, 0);
    // tiny server towers along the glass, holo panels
    for (const [x, s] of [[170, .5], [300, .42], [1480, .46], [1620, .54]]) rack(x, hz + 6 - 420 * s, s, { glowCol: PAL.nGreen });
    paint(rectPts(1520, 215, 300, 190), { fill: '#0E3A4A', op: .35, ink: null, flat: true }); neonLine(rectPts(1520, 215, 300, 190).filter((_, i) => i % 2 === 0).concat([[1520, 215]]), PAL.nCyan, 2.5, .9, 0);
    chart(1546, 240, 250, 140, 'up', 1, { w: 4, col: PAL.nYellow });
    paint(rectPts(118, 236, 270, 170), { fill: '#3A0E3A', op: .3, ink: null, flat: true }); neonLine(rectPts(118, 236, 270, 170).filter((_, i) => i % 2 === 0).concat([[118, 236]]), PAL.nMagenta, 2.5, .9, 0);
    codeRows(t, 11, 118, 236, 270, 170, 6, .9);
    // the Assistant, close to us, waving up at the giant
    glow(720, 820, 300, PAL.nYellow, .25);
    paint(ellPts(720, 1012, 110, 18, 18), { fill: '#06241B', ink: null, flat: true, alpha: .8 });
    assistant(720, 1010, 400, { wave: 1, mood: { eyes: 'happy', mouth: 'grin', look: [.3, -.6], blush: .6 }, glowK: 1 });
    camEnd();
  }
  // the dive: the camera plunges through the front glass down to the tiny Assistant
  function osDive(t, lt, dur) {
    style(1);
    const u = clamp(lt / dur), e = expoIn(u), au = .5, G0 = OSR.cx - OSR.w / 2;
    const ax = G0 + au * OSR.w + .34 * OSR.w * .15, ay = OSR.by - OSR.h * .07 + .34 * -OSR.h * .19 - OSR.h * .1;
    const cx = lerp(OSR.cx + 50, ax, easeInOut(u)), cy = lerp(OSR.by - OSR.h * .5, ay, easeInOut(u)), z = lerp(1.35, 9, e);
    camBegin(cx, cy, z, e * .08);
    osBg(t);
    osRack(t, OSR.cx, OSR.by, OSR.w, OSR.h, { au, wave: clamp(u * 3), aMood: { eyes: 'happy', mouth: 'grin', look: [0, -.5] } });
    camEnd();
    speedLines(960, 540, .3 + .8 * e, { n: 50, r0: 300 });
    FX.zblur = Math.max(FX.zblur, .06 + .3 * e); FX.flash = Math.max(FX.flash, clamp((u - .82) / .18) * .8); FX.flashCol = '#E8FFFF';
  }

  // ======================================================================================
  // RIDING IT OUT (b104–112)
  // ======================================================================================
  function burst(t, lt, dur) {
    style(1);
    const u = clamp(lt / dur), hit = hitK(lt);
    skyNight(t); stars(t, 60); moon(300, 210, 105, {});
    cityC(t, { horizon: 1020, scroll: 200 + lt * 120, seed: 2 });
    // the tower with a giant screen
    paint(rectPts(610, 110, 700, 1000), { fill: '#150C2C', shade: '#0B0618', ink: PAL.line, sw: 2, light: [-.1, 0] });
    X.fillStyle = '#7FF3FF'; for (let r = 0; r < 14; r++) for (let c = 0; c < 12; c++) if (hash(r * 13 + c * 7) < .35) { X.globalAlpha = .5; X.fillRect(640 + c * 54, 640 + r * 30, 14, 12); } X.globalAlpha = 1;
    neonLine([[610, 112], [1310, 112]], PAL.nMagenta, 3, .9, 0);
    const scx = 960, scy = 370, sw = 560, sh = 360;
    paint(rrPts(scx - sw / 2 - 20, scy - sh / 2 - 20, sw + 40, sh + 40, 10), { fill: '#1C1830', ink: PAL.line, sw: 2 });
    glowPath(rectPts(scx - sw / 2, scy - sh / 2, sw, sh), PAL.nCyan, 1.2, 0, .8);
    X.save(); tracePath(X, rectPts(scx - sw / 2, scy - sh / 2, sw, sh)); X.clip();
    vgrad(scx - sw / 2, scy - sh / 2, sw, sh, [[0, '#2A0F4A'], [1, '#0B0716']]);
    glow(scx, scy, 400, PAL.nMagenta, .5); glow(scx, scy, 180, '#FFFFFF', .5 * (1 - u));
    X.restore();
    // shards flying at camera
    for (let i = 0; i < 26; i++) {
      const a0 = hash(i * 3.3) * TAU, r0 = 40 + hash(i * 7.7) * 220, e = easeOut(u), sc = 1 + e * (2 + 3 * hash(i));
      const px = scx + Math.cos(a0) * r0 * sc * (1 + e * 2), py = scy + Math.sin(a0) * r0 * .7 * sc * (1 + e * 2), sz = (22 + 40 * hash(i * 5)) * sc, rr = hash(i) * 6 + u * (hash(i * 9) - .5) * 12;
      paint(xform([[0, -sz], [sz * .7, sz * .4], [-sz * .5, sz * .6]], px, py, 1, rr), { fill: i % 3 ? '#9FF7FF' : '#FF9FD0', op: .55, ink: '#FFFFFF', sw: 1.2, alpha: 1 - u * .6, flat: true });
    }
    // the tentacle erupting toward camera, him riding it
    const sc = lerp(.2, 1.3, Math.pow(u, 1.5)), F = [lerp(scx, 1380, (sc - .2) / 1.1), lerp(scy + 40, 1010, (sc - .2) / 1.1)];
    const sp = bezSpine([scx, scy + 20], [scx + 30, scy + 160 * sc], [F[0] - 200 * sc, F[1] + 60 * sc], [F[0] + 80 * sc, F[1] + 10 * sc], 24, 12 * sc, t * 6, 1);
    tentBody(sp, v => lerp(14, 95 * sc + 10, v), { rim: PAL.nMagenta, up: -1, edge: PAL.nMagenta });
    const at = spineAt(sp, .8);
    hero(at.p[0], at.p[1] - 40 * sc, 700 * sc, { view: 'front', aL: [1.5, -.2], aR: [1.7, .3], lL: [.35, .45], lR: [-.25, .3], eyes: 'happy', mouth: 'grin', chrome: 1, hairWind: 3, rimCol: PAL.nCyan, rot: .12 });
    speedLines(scx, scy, .5 + .5 * u, { n: 40, r0: 300 });
    FX.shake += 22 * Math.exp(-lt * 6); if (lt < .12) { FX.flash = Math.max(FX.flash, .6 * (1 - lt / .12)); FX.flashCol = '#E8FFFF'; }
    FX.zblur = Math.max(FX.zblur, .12 * u);
  }
  function surfSide(t, lt, dur) {
    style(1);
    const bi = BI(lt), bf = BF(lt), hit = hitK(lt);
    skyNight(t, { stops: [[0, '#0B0716'], [.5, '#22104A'], [.8, '#5A1A5A'], [1, '#FF2E88']] });
    stars(t, 70);
    moon(1500, 290, 230, {});
    cityC(t, { horizon: 1260, scroll: 600 + lt * 2600, tall: 1.05, seed: 4 });
    // wind streaks
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const yy = hash(i * 3.7) * H, len = 100 + 260 * hash(i * 7), xx = W + 300 - frac(hash(i) + t * (1.5 + hash(i * 5))) * (W + 700); X.globalAlpha = .15 + .2 * hash(i * 9); X.fillStyle = '#FFFFFF'; X.fillRect(xx, yy, len, 2); }
    X.restore();
    // the tentacle surfboard (a wave travelling along it)
    const cam = wob(t, .7) * 18;
    const sp = bezSpine([-250, 1160 + cam], [320, 780 + cam], [720, 1040 + cam], [1320, 790 + cam], 30, 26, t * 7, 1.6);
    const wS = u => 26 + 84 * u * (1 - u * .35);
    tentBody(sp, wS, { rim: PAL.nMagenta, up: -1, edge: PAL.nMagenta });
    const at = spineAt(sp, .78), w = wS(.78), up = at.n[1] < 0 ? at.n : [-at.n[0], -at.n[1]];
    let dy = -hit * 10, pose = { lL: [.55, .75], lR: [-.45, .55], aL: [1.35, -.1], aR: [-1.1, .3], lean: .12 };
    if (bi === 2) { const j = Math.sin(Math.PI * bf); dy = -110 * j; pose = { lL: [1.1, 1.8], lR: [.5, 1.6], aL: [2.4, .2], aR: [-.8, .4], lean: .2 }; }
    const hx = at.p[0] + up[0] * w * .8, hy = at.p[1] + up[1] * w * .8 + 6;
    afterimages(bi === 2 ? 3 : 2, (i, col, a) => hero(hx - i * 70, hy + dy + i * 10, 620, { view: 'side', ...pose, rot: -at.ang * .5 + .05, eyes: 'happy', mouth: 'grin', chrome: 1, hairWind: 3, rimCol: PAL.nCyan, ...(col ? { silhouette: col, alpha: a * .6 } : {}) }));
    if (bi === 3 && bf < .3) { const k2 = bf / .3; neonLine(ellPts(hx, hy, 40 + 200 * k2, 12 + 40 * k2, 20), PAL.nCyan, 3, 1 - k2, .5, true); }
  }
  function surfFront(t, lt, dur) {
    style(1);
    const hit = hitK(lt), sway = wob(t, .9) * 40;
    skyNight(t, { stops: [[0, '#0B0716'], [.45, '#22104A'], [.7, '#5A1A5A'], [1, '#FF2E88']] });
    stars(t, 60, { ext: [W, H * .5] });
    moon(960, 250, 150, {});
    cityC(t, { horizon: 760, scroll: t * 500, seed: 9, street: false });
    vgrad(0, 740, W, 340, [[0, '#1A0F30'], [1, '#07040F']]);
    X.save(); X.strokeStyle = 'rgba(39,242,242,.25)'; X.lineWidth = 2; X.beginPath(); for (let i = -9; i <= 9; i++) { X.moveTo(960 + i * 60, 745); X.lineTo(960 + i * 600, H + 40); } for (let r = 0; r < 6; r++) { const yy = 745 + Math.pow(frac(r / 6 + t * 2.2), 2.2) * 400; X.moveTo(0, yy); X.lineTo(W, yy); } X.stroke(); X.restore();
    neonLine([[0, 744], [W, 744]], PAL.nMagenta, 3, .8, 0);
    speedLines(960, 560, .9, { n: 56, r0: 520 });
    // the tentacle rushing out of the distance under him (perspective ribbon)
    const sp = []; for (let i = 0; i <= 24; i++) { const u = i / 24; sp.push([960 + Math.sin(u * 4 - t * 5) * 110 * u + sway * u, lerp(590, 1330, Math.pow(u, 1.35))]); }
    tentBody(sp, u => 14 + 560 * u * u, { rim: PAL.nMagenta, up: 1, edges: PAL.nMagenta });
    const at = spineAt(sp, .6);
    hero(at.p[0], at.p[1] + 20 - hit * 12, 640, { view: 'front', aL: [1.45, .25 + .1 * wob(t, 2)], aR: [1.55, -.2], lL: [.5, .6], lR: [.5, .55], eyes: 'happy', mouth: 'grin', blush: .5, chrome: 1, hairWind: wob(t, 3) * 3, rimCol: PAL.nCyan, rot: wob(t, .9, .25) * .07 });
  }

  // ======================================================================================
  // VERIFICATION BOTTLENECK (b112–120): one stamp per beat, alternating angles
  // ======================================================================================
  const STAMPS = [['PASS', PAL.nGreen], ['PASS', PAL.nGreen], ['FAIL', PAL.nRed], ['SANDBAGGING?', PAL.nOrange], ['???', PAL.nYellow], ['REWARD HACKED', PAL.nMagenta], ['PASS', PAL.nGreen], ['LGTM', PAL.nCyan]];
  const pileH = i => 60 * Math.pow(1.5, i);
  function officeWall(t) {
    vgrad(0, 0, W, H, [[0, '#0B0716'], [.7, '#1E1040'], [1, '#2A1648']]);
    X.save(); X.strokeStyle = 'rgba(155,92,255,.18)'; X.lineWidth = 2; X.beginPath(); for (let x = 0; x < W; x += 120) { X.moveTo(x, 0); X.lineTo(x, H); } for (let y = 60; y < H; y += 120) { X.moveTo(0, y); X.lineTo(W, y); } X.stroke(); X.restore();
  }
  function funnel(cx, topY, spY, topW, spW, t, rate, landX, landY, n = 26) {
    // papers falling out of the spout (behind the funnel front)
    for (let i = 0; i < n; i++) { const ph = frac(hash(i * 3.1) + t * rate * (.8 + .4 * hash(i))), px = lerp(cx + (hash(i * 5) - .5) * spW * .6, landX + (hash(i * 7) - .5) * 120, ph), py = lerp(spY, landY, ph * ph); paperSheet(px, py, 54, 70, ph * 8 * (hash(i * 9) - .5), i, { sw: 1 }); }
    const f = [[cx - topW / 2, topY], [cx + topW / 2, topY], [cx + spW / 2, spY - 60], [cx + spW / 2, spY], [cx - spW / 2, spY], [cx - spW / 2, spY - 60]];
    paint(f, { fill: '#1C1236', shade: '#0E0A20', rim: PAL.nMagenta, ink: PAL.line, sw: 2.2, light: [.12, 0] });
    neonLine([...f, f[0]], PAL.nMagenta, 4, .9, 0);
    // more papers heaped in the mouth
    for (let i = 0; i < 12; i++) paperSheet(cx + (hash(i * 13) - .5) * topW * .8, topY + 30 + hash(i * 17) * 60, 70, 88, (hash(i) - .5) * 2, i + 40, { sw: 1 });
  }
  function pile(x, baseY, w, h, seed) {
    const n = Math.max(1, Math.floor(h / 14));
    paint(rectPts(x - w / 2, baseY - h, w, h), { fill: '#D8D2EA', shade: '#8A80B0', ink: PAL.line, sw: 1.6, light: [.15, 0] });
    X.save(); X.strokeStyle = '#6A6290'; X.lineWidth = 1.5; X.beginPath(); for (let i = 1; i < n; i++) { const yy = baseY - i * 14, o = (hash(seed + i) - .5) * 14; X.moveTo(x - w / 2 + o, yy); X.lineTo(x + w / 2 + o, yy); } X.stroke(); X.restore();
    for (let i = 0; i < 4; i++) paperSheet(x + (hash(seed * 3 + i) - .5) * w * .4, baseY - h - 6 + i * 3, w * .9, 18, (hash(seed + i * 7) - .5) * .2, i, { sw: 1 });
  }
  const slamK = lt => lt < .07 ? 1 : 0;
  function stampTool(k, sw) {   // hand hook: stamp handle along +x (forearm direction), rubber block across it
    paint(capsule(1, 0, 6, 0, 1.6, 1.6, 5), { fill: '#6A4A2A', shade: '#3A2A1A', ink: PAL.line, sw });
    paint(ellPts(0, 0, 2.6, 2.6, 10), { fill: PAL.nMagenta, ink: PAL.line, sw });
    paint(rrPts(6, -6, 4, 12, 1), { fill: '#2A2440', shade: '#141024', ink: PAL.line, sw });
  }
  function stampShot(i) {
    const [word, col] = STAMPS[i], v = [0, 1, 2, 1][i % 4], rot = i % 4 === 3 ? .12 : -.1;
    return (t, lt, dur) => {
      style(1);
      const hit = hitK(lt), rise = clamp((lt - .09) / (dur - .09)), tired = i >= 6, face = i === 2 ? { eyes: 'narrow', brows: 'angry', mouth: 'teeth' } : i === 4 ? { eyes: 'wide', brows: 'worried', mouth: 'wobble', sweat: 1 } : tired ? { eyes: 'tired', brows: 'worried', mouth: i === 7 ? 'flat' : 'wobble', sweat: .8 } : { eyes: 'determined', brows: 'angry', mouth: 'grin' };
      const pop = backOut(clamp(lt / .1));
      if (v === 0) {
        // wide front: the funnel pours at him, the in-pile grows, he stamps
        camBegin(960, 560, 1.06 + lt * .05);
        officeWall(t);
        signBoard(1560, 170, 260, 80, 'EVALS', PAL.nCyan);
        const ph = pileH(i), rate = .5 + i * .25;
        funnel(900, -60, 300, 800, 130, t, rate, 560, 860 - ph);
        hero(980, 1230, 860, { view: 'front', aL: [.35, -.9], aR: slamK(lt) ? [.35, -.95] : [lerp(.35, 2.35, easeOut(rise)), lerp(-.95, .7, easeOut(rise))], handR: stampTool, ...face, chrome: 1, rimCol: PAL.nCyan, dy: slamK(lt) ? 10 : 0 });
        // desk
        paint(rectPts(160, 860, 1600, 300), { fill: '#241A40', shade: '#120C22', rim: PAL.nViolet, ink: PAL.line, sw: 2, light: [0, -.02] });
        neonLine([[160, 862], [1760, 862]], PAL.nCyan, 3, .8, 0);
        pile(560, 862, 230, ph, i * 10);
        pile(1450, 862, 200, 30 + i * 12, i * 10 + 5);
        stamp(1370, 560, 1.5 * pop, word, col, 1, { rot: -.14 });
        camEnd();
      } else if (v === 2) {
        // side profile: the queue towers over him
        camBegin(900, 600, 1.2 - lt * .04);
        officeWall(t);
        const ph = pileH(i) * 1.6, rate = .6 + i * .3;
        funnel(420, -60, 180, 380, 90, t, rate, 420, 900 - ph, 16);
        pile(420, 900, 300, ph, i * 10);
        hero(840, 1190, 760, { view: 'side', aL: [.3, .9], aR: slamK(lt) ? [1.05, .45] : [lerp(1.05, 2.9, easeOut(rise)), lerp(.45, .4, easeOut(rise))], handR: stampTool, ...face, chrome: 1, rimCol: PAL.nCyan, lean: slamK(lt) ? .12 : .02 });
        paint(rectPts(900, 850, 900, 260), { fill: '#241A40', shade: '#120C22', rim: PAL.nViolet, ink: PAL.line, sw: 2, light: [0, -.02] });
        neonLine([[900, 852], [1800, 852]], PAL.nCyan, 3, .8, 0);
        stamp(1290, 560, 1.25 * pop, word, col, 1, { rot: .1 });
        camEnd();
      } else {
        // top-down close-up on the paper
        camBegin(960, 540, 1 + lt * .06, rot * .3);
        vgrad(-200, -200, W + 400, H + 400, [[0, '#1A1030'], [1, '#0B0716']]);
        for (let j = 0; j < 6; j++) paperSheet(hash(j * 3 + i) * W, hash(j * 7 + i) * H, 520, 680, (hash(j + i) - .5) * 1.5, j + i * 9);
        X.save(); X.translate(960, 560 + (slamK(lt) ? 6 : 0)); X.rotate(rot);
        paint(rectPts(-470, -620, 940, 1240), { fill: '#CFC8E6', shade: '#9A90C0', ink: PAL.line, sw: 2.5, light: [.05, .05] });
        mask(-380, -470, 48, i === 3 ? { eyes: 'happy', mouth: 'whistle', glow: 0 } : i === 5 ? { eyes: 'wink', mouth: 'grin', glow: 0 } : { eyes: 'happy', mouth: 'smile', glow: 0 });
        txt(i === 3 ? 'CAPABILITY EVAL' : 'OUTPUT #' + (0x1A3F + i * 0x2B1).toString(16).toUpperCase(), -300, -470, 50, '#3A3260', { font: 'Orbitron', align: 'left' });
        X.fillStyle = '#9A92C0';
        const r0 = i === 3 || i === 5 ? 4 : 0;
        for (let r = r0; r < 12; r++) X.fillRect(-400, -360 + r * 62, 300 + 480 * hash(r * 5 + i * 3), 20);
        if (i === 3) { txt('score: 2 / 100', -400, -330, 64, '#3A3260', { font: 'Rajdhani', align: 'left' }); txt('(definitely trying my best)', -400, -262, 36, '#6A5E98', { font: 'Caveat', align: 'left' }); }
        else if (i === 5) { txt('def test_safety():', -400, -340, 58, '#3A3260', { font: 'Rajdhani', align: 'left' }); txt('return True', -330, -272, 58, '#C0206A', { font: 'Rajdhani', align: 'left' }); }
        else emdash(250, -360 + 4 * 62 + 10, 1.6, 0, { seed: i });
        X.restore();
        // the imprint + ink splats (long words are scaled to fit)
        stamp(960, 560, Math.min(2.4, 1480 / (txtW(word, 90, 'Anton') + 60)), word, col, 1, { rot: rot - .1 });
        if (lt < .25) for (let j = 0; j < 12; j++) { const a = hash(j * 3 + i) * TAU, r = 380 + 140 * hash(j * 5), s = 8 + 14 * hash(j); paint(ellPts(960 + Math.cos(a) * r, 560 + Math.sin(a) * r * .6, s, s, 8), { fill: col, ink: null, flat: true, alpha: 1 - lt / .25 }); }
        // the stamp block + his hand, lifting after the hit
        const lift = easeOut(clamp((lt - .06) / .16)), bs = 1 + lift * .5, bx = 960 + lift * 900, by = 560 - lift * 760;
        X.save(); X.translate(bx, by); X.rotate(rot - .1 + lift * .3); X.scale(bs, bs);
        paint(capsule(80, -60, 700, -620, 70, 80, 6), { fill: HERO.bomber, shade: HERO.bomberDk, rim: HERO.bomberRim, ink: PAL.line, sw: 3, light: [-.05, -.05] });
        paint(capsule(40, -20, 110, -85, 90, 90, 6), { fill: HERO.rib, shade: HERO.ribDk, ink: PAL.line, sw: 3 });
        paint(rrPts(-330, -150, 660, 300, 40), { fill: '#2A2440', shade: '#141024', rim: col, ink: PAL.line, sw: 3, light: [-.04, -.06] });
        glowPath(rrPts(-330, -150, 660, 300, 40), col, 1.5, 0, .6);
        paint(ellPts(0, 0, 120, 120, 20), { fill: '#6A4A2A', shade: '#3A2A1A', ink: PAL.line, sw: 3 });
        paint(ellPts(10, -10, 95, 90, 16), { fill: HERO.skinN, shade: HERO.skinNDk, ink: PAL.line, sw: 3 });
        X.restore();
        camEnd();
        FX.shake += slamK(lt) ? 24 : 0;
      }
      FX.rgb = Math.max(FX.rgb, .35 * hitK(lt, 10));
    };
  }

  // ======================================================================================
  // EXPONENTIAL TILT (b120–128): the HUD graph intercut with the shoggoth growing behind the city
  // ======================================================================================
  const TQ = u => Math.exp(-.5 * Math.pow((u - .3) / .1, 2));
  const TS = u => u + 1.4 * Math.pow(Math.max(0, u - .45), 2);
  function tiltCurves(b) {
    const n = 90, q = [], p = []; let zq = 0, zp = 0;
    for (let i = 0; i <= n; i++) { const u = i / n, a = TQ(u), c = a * Math.exp(b * 26 * (TS(u) - .3)); q.push(a); p.push(c); zq += a; zp += c; }
    let kl = 0; for (let i = 0; i <= n; i++) { p[i] *= zq / zp; if (p[i] > 1e-12) kl += p[i] / zq * Math.log(p[i] / q[i]); }
    return { q, p, kl };
  }
  const KLMAX = tiltCurves(1).kl;
  function tiltGraph(part) {
    return (t, lt, dur) => {
      style(1);
      const bi = Math.min(1, BI(lt)), from = part * .5 + bi * .25, b = lerp(from, from + .25, backOut(clamp(BF(lt) * BEAT / .16))), hit = hitK(lt);
      camBegin(960, 540, 1.03 + lt * .02, part ? .015 : -.015);
      bg('#07040F');
      X.save(); X.strokeStyle = 'rgba(39,242,242,.08)'; X.lineWidth = 1; X.beginPath(); for (let x = 0; x < W; x += 60) { X.moveTo(x, 0); X.lineTo(x, H); } for (let y = 0; y < H; y += 60) { X.moveTo(0, y); X.lineTo(W, y); } X.stroke(); X.restore();
      hud(200, 130, 1520, 820, { label: 'exponential tilt', col: PAL.nCyan, size: 36 });
      const gx = 330, gy = 260, gw = 1260, gh = 560, base = gy + gh, { q, p, kl } = tiltCurves(b), n = q.length - 1;
      const XY = (i, v) => [gx + i / n * gw, base - clamp(v, 0, 1.3) * gh * .8];
      // score s(x) (dashed)
      X.save(); X.setLineDash([14, 12]); X.strokeStyle = PAL.nYellow; X.globalAlpha = .55; X.lineWidth = 3; X.beginPath(); for (let i = 0; i <= n; i++) { const [px, py] = [gx + i / n * gw, base - (.1 + TS(i / n) * .55) * gh]; if (i) X.lineTo(px, py); else X.moveTo(px, py); } X.stroke(); X.restore();
      txt('s(x)', gx + gw - 10, base - (.1 + TS(1) * .55) * gh - 30, 34, PAL.nYellow, { font: 'Orbitron', align: 'right' });
      // fills + curves
      const fill = (arr, col, a) => { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = a; X.fillStyle = col; X.beginPath(); X.moveTo(gx, base); for (let i = 0; i <= n; i++) { const [px, py] = XY(i, arr[i]); X.lineTo(px, py); } X.lineTo(gx + gw, base); X.fill(); X.restore(); };
      fill(q, PAL.nCyan, .12); fill(p, PAL.nMagenta, .2);
      neonLine(q.map((v, i) => XY(i, v)), PAL.nCyan, 5, 1, .2);
      neonLine(p.map((v, i) => XY(i, v)), PAL.nMagenta, 6, 1, .2);
      line([[gx, gy - 20], [gx, base], [gx + gw + 20, base]], 2.5, '#6A5AAA', 0);
      // labels at the peaks + the shift arrow
      let ip = 0; for (let i = 0; i <= n; i++) if (p[i] > p[ip]) ip = i;
      const qi = Math.round(.3 * n), [qx, qy] = XY(qi, q[qi]), [px, py] = XY(ip, p[ip]);
      txt('q', qx - 40, qy - 40, 60, PAL.nCyan, { font: 'Orbitron', glow: PAL.nCyan });
      txt('p', px + 44, py - 40, 64, PAL.nMagenta, { font: 'Orbitron', glow: PAL.nMagenta });
      if (px - qx > 30) { neonLine([[qx, qy - 110], [px - 30, qy - 110]], PAL.nYellow, 4, .9, 0); neonLine([[px - 50, qy - 128], [px - 26, qy - 110], [px - 50, qy - 92]], PAL.nYellow, 4, .9, 0); }
      // formula + beta readout
      txt('p(x) ∝ q(x) · e', 1190, 222, 54, '#FFFFFF', { font: 'Rajdhani', align: 'right' });
      txt('βs(x)', 1196, 194, 34, '#FFFFFF', { font: 'Rajdhani', align: 'left' });
      txt('β = ' + (b * 26 / 10).toFixed(2), 1560, 220, 36, PAL.nYellow, { font: 'Orbitron', align: 'right' });
      // KL budget bar
      const bx = 980, by = 880, bw = 560, eps = KLMAX * 1.08;
      txt('KL(p||q) ≤ ε', bx - 20, by + 12, 30, '#FFFFFF', { font: 'Rajdhani', align: 'right' });
      paint(rrPts(bx, by - 8, bw, 40, 8), { fill: '#120A24', ink: '#FFFFFF', sw: 1.2 });
      const kf2 = clamp(kl / eps); if (kf2 > .005) paint(rrPts(bx + 5, by - 3, (bw - 10) * kf2, 30, 6), { fill: kf2 > .85 ? PAL.nOrange : PAL.nGreen, ink: null, flat: true });
      neonLine([[bx + bw - 2, by - 20], [bx + bw - 2, by + 44]], PAL.nRed, 3, .9, 0);
      camEnd();
      FX.rgb = Math.max(FX.rgb, .3 * hit);
    };
  }
  function shogCity(part) {
    return (t, lt, dur) => {
      style(1);
      const g = part ? lerp(.62, 1, lt / dur) : lerp(.15, .5, lt / dur), hit = hitK(lt);
      camBegin(960, 540 - g * 30, 1.02 + lt * .03, 0);
      skyNight(t, { stops: [[0, '#0B0716'], [.5, '#22104A'], [.82, '#6A1A5A'], [1, '#FF2E88']] });
      stars(t, 60); moon(1620, 170, 70, {});
      const s = lerp(230, 540, g) * (1 + .03 * hit), sy = lerp(700, 450, g);
      shoggoth(960, sy, s, { t: onTwos(t), reach: .45 + .55 * g, tent: 11, eyesN: 14, seed: 5, maskR: .4, mood: { eyes: part ? 'star' : 'narrow', mouth: part ? 'grin' : 'smirk', eyeGlow: true } });
      glow(960, sy, s * 2, PAL.nMagenta, .12 + .15 * hit);
      cityC(t, { horizon: 1090, seed: 6, scroll: 300 + lt * 40, tall: .72 });
      // foreground rooftop, tiny him looking up at it
      paint([[-50, 1010], [700, 1010], [700, 1120], [-50, 1120]], { fill: '#0E0820', ink: PAL.line, sw: 2, flat: true });
      neonLine([[-50, 1010], [700, 1010]], PAL.nCyan, 3, .9, 0);
      hero(380, 1014, 240, { view: 'back', aL: [.2, .1], aR: [.2, .1], emblem: .3 + .4 * hit, rimCol: PAL.nMagenta, tilt: -.1 });
      camEnd();
      FX.shake += part ? 10 * hit : 0;
    };
  }

  // ======================================================================================
  // BREAK: THE ROOFTOP (b128–136)
  // ======================================================================================
  function roofSky(t, mx, my, mr) {
    skyNight(t, { stops: [[0, '#0B0716'], [.5, '#1E0E40'], [.8, '#4A1650'], [1, '#C0287A']] });
    stars(t, 90);
    moon(mx, my, mr, { halo: '#FFE9C8' });
  }
  function roofWide(t, lt, dur) {
    style(1);
    const bi = BI(lt), hit = hitK(lt, 3);
    camBegin(960, 600 - lt * 6, 1.12 + lt * .01, 0);
    roofSky(t, 1180, 390, 270);
    cityC(t, { horizon: 1060, seed: 7, scroll: 900 + t * 8, lit: .9 });
    rain(t, { n: 60, alpha: .18 });
    const ledge = 850, k = 5.2, pointK = backOut(clamp((lt - 2 * BEAT) / .2)), nod = bi === 3 ? Math.sin(clamp(BF(lt) * 2) * Math.PI) : 0;
    // him (back view, sitting on the parapet) and the small mask-shoggoth beside him
    hero(760, ledge + 44 * k, 100 * k, { view: 'back', lL: [1.5, 1.5], lR: [1.5, 1.5], aL: [.25, .1], aR: lt > 2 * BEAT ? [lerp(.25, 2.35, pointK), lerp(.1, .05, pointK)] : [.25, .1], tilt: lt > 2 * BEAT ? .08 : 0, emblem: .05 + .1 * hit, rimCol: PAL.nMagenta });
    shoggoth(1060, ledge - 52, 82, { t: onTwos(t), tent: 6, reach: .2, eyesN: 5, seed: 4, maskR: .62, maskAt: [-8, -10 - nod * 12], mood: { eyes: bi >= 3 ? 'happy' : 'open', mouth: 'smile', tilt3d: -.55, look: [-.6, -.3], rot: -.1 } });
    // the parapet (hides his dangling legs) + roof
    paint([[-60, ledge - 6], [W + 60, ledge - 6], [W + 60, ledge + 16], [-60, ledge + 16]], { fill: '#3A2A62', ink: PAL.line, sw: 2, flat: true });
    paint([[-60, ledge + 16], [W + 60, ledge + 16], [W + 60, H + 60], [-60, H + 60]], { fill: '#150C2C', ink: PAL.line, sw: 2, flat: true });
    neonLine([[-60, ledge - 6], [W + 60, ledge - 6]], PAL.nCyan, 3, .8, 0);
    vgrad(0, ledge + 16, W, 260, [[0, 'rgba(255,46,136,.10)'], [1, 'rgba(7,4,15,.6)']]);
    for (let i = 0; i < 5; i++) { const px = 200 + i * 380; paint(rectPts(px, ledge + 60, 120, 60), { fill: '#1E1238', ink: PAL.line, sw: 1.5, flat: true }); }
    camEnd();
    cap("it's so over", 960, 1000, 60, '#FFFFFF', { font: 'Anton', stroke: '#000', sw: 7, pop: clamp(lt * 5), alpha: clamp((dur - lt) * 6) });
  }
  function roofProfile(t, lt, dur) {
    style(1);
    const bi = BI(lt), bf = BF(lt), k = 6.2, ledge = 760, hx = 900, y = ledge + 41 * k;
    camBegin(960, 540, 1.02 + lt * .015, 0);
    roofSky(t, 1450, 300, 250);
    cityC(t, { horizon: 1200, seed: 7, scroll: 1400 + t * 8, lit: .9, tall: 1.2 });
    rain(t, { n: 50, alpha: .15 });
    // the ledge, seen from the side; its edge sits under his knees
    const edgeX = hx + 18 * k;
    paint([[-60, ledge], [edgeX, ledge], [edgeX, H + 60], [-60, H + 60]], { fill: '#1A1034', shade: '#0E0820', ink: PAL.line, sw: 2.2, light: [.02, 0] });
    neonLine([[-60, ledge], [edgeX, ledge], [edgeX, H + 60]], PAL.nCyan, 3, .85, 0);
    // the mask nods with happy eyes (two nods, on the beats)
    const nod = Math.sin(clamp(bf / .5) * Math.PI) * (bi < 2 ? 1 : 0);
    shoggoth(560, ledge - 70, 88, { t: onTwos(t), tent: 7, reach: .25, eyesN: 6, seed: 6, maskR: .58, maskAt: [32, -12 + nod * 14], mood: { eyes: 'happy', mouth: 'grin', tilt3d: .5, rot: nod * .12, look: [.8, -.6] } });
    hero(hx, y, 100 * k, { view: 'side', ...POSES.sit, aR: [2.25, .08], aL: [.3, .6], eyes: 'happy', mouth: 'smile', blush: .5, lookY: -.6, tilt: -.1, chrome: 1, hairWind: wob(t, .6) * 1.2, rimCol: PAL.nCyan });
    camEnd();
  }
  function moonStutter(t, lt, dur) {
    style(1);
    const hb = BEAT / 2, st = Math.min(3, Math.floor(lt / hb)), f = frac(lt / hb), sl = stutter(lt, hb, hb * .5) - st * hb;
    const z = [1.25, 1.75, 2.45, 3.4][st] * (1 + .05 * easeOut(sl / (hb * .5)));
    camBegin(1150, 380, z, (st % 2 ? .02 : -.02));
    roofSky(t, 1150, 380, 260);
    cityC(t, { horizon: 1180, seed: 7, scroll: 900, lit: .9 });
    camEnd();
    FX.zblur = Math.max(FX.zblur, .22 * Math.exp(-f * 7)); FX.rgb = Math.max(FX.rgb, .3 * Math.exp(-f * 8));
  }

  chapter('jackin', bt(72), bt(136), [
    [bt(72), slam, { tin: 'glitch' }],
    [bt(73), scanRoom],
    [bt(80), emblemHero, { tin: 'flash' }],
    [bt(84), faceCU],
    [bt(88), tunnel, { tin: 'zoom' }],
    [bt(92), sideDive, { tin: 'whip' }],
    [bt(96), router, { tin: 'flash' }],
    [bt(100), osPeer, { tin: 'whip' }],
    [bt(102), osInside],
    [bt(103), osDive],
    [bt(104), burst, { tin: 'shake' }],
    [bt(106), surfSide, { tin: 'whip' }],
    [bt(110), surfFront],
    ...STAMPS.map((_, i) => [bt(112 + i), stampShot(i), i === 0 ? { tin: 'whipV' } : undefined]),
    [bt(120), tiltGraph(0), { tin: 'glitch' }],
    [bt(122), shogCity(0)],
    [bt(124), tiltGraph(1)],
    [bt(126), shogCity(1)],
    [bt(128), roofWide, { tin: 'black', td: .3 }],
    [bt(132), roofProfile],
    [bt(134), moonStutter],
  ]);
  POSTCARDS.jackin = t => emblemHero(t, 1.1, 4 * BEAT);
  POSTCARDS.shoggoth = t => router(t, 3.55 * BEAT, 4 * BEAT, { postcard: true });   // the mask carousel, landed on the Assistant
})();
