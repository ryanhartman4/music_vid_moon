// src/ch/c05_ascent.js: Act V · Ascent (b264–b328, 90.53–112.47 s). Neon space; a moody verse that breathes.
//   b264 orbit: the rocket coasts over a night Earth whose city lights are a neural net, firing one layer per beat
//   b272 capsule: he floats in his helmet, the little mask plays with a coffee blob (boop on his visor on b276)  → POSTCARDS.capsule
//   b280 forward pass: the mask only exists on the beat (TOKEN counter ticks); he reaches for it
//   b288 speculum II: his visor reflects Earth and the unmasked shoggoth → b292 he turns: nothing → b294 turns back: the mask
//   b296 manual: the model hands him the stick (b298), his battery starts to refill → b300 over-the-shoulder barrel roll, full on b303
//   b304 Sisyphus: a boulder-asteroid AI / DATA / SCIENCE → b306 watercolour dream, one word lit per beat → b310 back to neon
//   b312 the moon fills the window; two silhouettes; a small tentacle takes his hand (b316)
//   b320 approach: lunar surface, ALT halves every beat, retro-rockets → b324 low angle down into the dust
(() => {
  const B = n => bt(n);
  const C = {
    hull: '#242B4A', hullDk: '#10142A', earthRim: '#7FE9FF', wall: '#0D1332', wallDk: '#080C22', seam: '#04060E',
    warm: '#FFC45A', hot: '#A8FAFF', cream: '#FFF4D8', ink: PAL.line
  };

  // ---------- space ----------
  // wrapped starfield inside a box (dx/dy scroll it; stars wrap so a drifting camera never runs out)
  function starBox(t, n, seed, x0, y0, w, h, o = {}) {
    const dx = o.dx || 0, dy = o.dy || 0, sz = o.sz ?? 1, A = o.a ?? 1;
    for (let i = 0; i < n; i++) {
      const x = x0 + (((hash(i * 3.3 + seed) * w + dx) % w) + w) % w, y = y0 + (((hash(i * 7.1 + seed) * h + dy) % h) + h) % h;
      const tw = .6 + .4 * Math.sin(t * (1.2 + hash(i + seed) * 3) + i * 1.7), r = (1.1 + Math.pow(hash(i * 1.7 + seed), 4) * 3.6) * sz, hc = hash(i * 5.1 + seed);
      X.globalAlpha = A * (.3 + .7 * tw) * (.45 + .55 * hash(i * 2.3 + seed));
      X.fillStyle = hc < .14 ? '#9FEFFF' : hc > .9 ? '#FFE3B0' : '#FFFFFF';
      X.fillRect(x - r / 2, y - r / 2, r, r);
      if (r > 3.2 * sz) { X.globalAlpha *= .6; X.fillRect(x - r * 2.6, y - .6, r * 5.2, 1.2); X.fillRect(x - .6, y - r * 2.6, 1.2, r * 5.2); glow(x, y, r * 5, hc < .14 ? '#9FEFFF' : '#DDEBFF', .2 * tw * A); }
    }
    X.globalAlpha = 1;
  }
  const starfield = (t, n, seed, o = {}) => starBox(t, n, seed, -120, -120, W + 240, H + 240, o);
  function nebula(seed, A = 1) {
    for (let i = 0; i < 6; i++) { const k = i / 5; glow(-100 + k * (W + 200), H * (.12 + .5 * k) + (hash(i + seed) - .5) * 260, 360 + hash(i * 3 + seed) * 240, i % 2 ? '#1A3080' : '#3A1A70', .2 * A); }
  }
  function spaceBg(t, o = {}) {
    vgrad(-500, -500, W + 1000, H + 1000, o.stops || [[0, '#02030A'], [.55, '#050A1E'], [1, '#0A1433']]);
    if (o.neb !== false) nebula(o.seed || 1, o.nebA ?? 1);
    starfield(t, o.n ?? 120, o.seed || 1, o);
  }
  // blurred background lights (depth-of-field behind close-ups)
  function bokeh(seed, n = 14, A = 1, cols = ['#27F2F2', '#FFB547', '#9B5CFF', '#3F7BFF']) {
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const x = hash(i * 3.1 + seed) * W, y = hash(i * 5.7 + seed) * H, r = 26 + hash(i * 2.2 + seed) * 80, col = cols[i % cols.length];
      X.fillStyle = col; X.strokeStyle = col; X.globalAlpha = (.05 + .07 * hash(i + seed)) * A; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill();
      X.globalAlpha *= 1.6; X.lineWidth = 2; X.stroke();
    }
    X.restore();
  }

  // ---------- the neural-net Earth ----------
  // orthographic globe: lon/lat → screen (G.cx, G.cy, G.R, G.tilt, G.spin). z < 0 = far side (pinned to the limb).
  function gp(G, lon, lat) {
    const dl = lon + (G.spin || 0), cl = Math.cos(lat), x = cl * Math.sin(dl), y0 = Math.sin(lat), z0 = cl * Math.cos(dl);
    const c = Math.cos(G.tilt), s = Math.sin(G.tilt), y = y0 * c - z0 * s, z = y0 * s + z0 * c;
    let px = x, py = y; if (z < 0) { const d = Math.hypot(x, y) || 1; px = x / d; py = y / d; }
    return [G.cx + px * G.R, G.cy - py * G.R, z];
  }
  // city clusters laid out as a small MLP: 7 layers left → right, cities = neurons, highways = weights
  const NET = (() => {
    const per = [3, 4, 5, 5, 5, 4, 2], nodes = [], edges = [];
    per.forEach((n, i) => {
      const hs = .07 + .038 * n, col = [];
      for (let j = 0; j < n; j++) col.push([-.66 + i * .22 + (hash(i * 13 + j * 7 + 1) - .5) * .05, (n < 2 ? 0 : (j / (n - 1) - .5) * 2 * hs) + (hash(i * 5 + j * 11 + 2) - .5) * .045 - .02]);
      nodes.push(col);
    });
    for (let i = 0; i < per.length - 1; i++) for (let a = 0; a < per[i]; a++) for (let b = 0; b < per[i + 1]; b++)
      if (hash(i * 37 + a * 11 + b * 5 + 1) < .42 || Math.abs((a + .5) / per[i] - (b + .5) / per[i + 1]) < .13) edges.push([i, a, b]);
    return { nodes, edges, L: per.length };
  })();
  const CONT = [[-.5, .08, .26, .18, 1], [-.15, -.22, .2, .12, 2], [.25, .1, .28, .15, 3], [.58, -.18, .18, .16, 4], [-.05, .32, .32, .09, 5], [.85, .18, .2, .2, 6], [-.9, -.15, .22, .16, 7]];
  function drawNet(G, t, k0, A) {
    const dotK = G.dot ?? 1, E = [];
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round'; X.lineJoin = 'round';
    X.beginPath();
    for (const [i, a, b] of NET.edges) {
      const pa = NET.nodes[i][a], pb = NET.nodes[i + 1][b], bend = (hash(i * 5 + a * 3 + b * 7) - .5) * .06, pts = [];
      for (let s = 0; s <= 10; s++) { const u = s / 10; pts.push(gp(G, lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u) + Math.sin(u * Math.PI) * bend)); }
      if (pts[0][2] < .04 || pts[10][2] < .04) continue;
      X.moveTo(pts[0][0], pts[0][1]); for (let s = 1; s <= 10; s++) X.lineTo(pts[s][0], pts[s][1]);
      E.push([i, pts, a * 7 + b]);
    }
    X.strokeStyle = C.warm; X.globalAlpha = .09 * A; X.lineWidth = 8 * dotK; X.stroke(); X.globalAlpha = .3 * A; X.lineWidth = 1.3 * dotK; X.stroke();
    // lights strung along the highways
    X.fillStyle = '#FFD98A';
    for (const [i, pts, id] of E) for (let s = 1; s < 20; s++) {
      const u = s / 20, j = Math.floor(u * 10), f = u * 10 - j, p = pts[j], q = pts[j + 1], z = lerp(p[2], q[2], f), sz = (1 + 1.8 * z) * dotK;
      X.globalAlpha = (.3 + .55 * hash(i * 7 + s + id * 13)) * A; X.fillRect(lerp(p[0], q[0], f) - sz / 2, lerp(p[1], q[1], f) - sz / 2, sz, sz);
    }
    X.globalAlpha = 1; X.restore();
    // the forward pass: signals race out of the active layer along every weight
    if (k0 >= 0) {
      const li = Math.floor(k0), f = frac(k0), fe = easeOut(Math.min(1, f * 1.5));
      for (const [i, pts] of E) {
        if (i !== li) continue;
        const m = Math.max(1, Math.round(fe * 10)), sub = pts.slice(0, m + 1).map(p => [p[0], p[1]]);
        neonLine(sub, C.hot, 2 * dotK, (1 - f * .6) * A, .3);
        const hp = sub[sub.length - 1]; glow(hp[0], hp[1], 22 * dotK, '#FFFFFF', .6 * (1 - f * .5) * A);
      }
    }
    // neurons: warm city clusters; a layer flares cyan-white when the pass reaches it
    NET.nodes.forEach((col, i) => col.forEach(([lo, la], j) => {
      const p = gp(G, lo, la); if (p[2] < .04) return;
      const z = .35 + .65 * p[2], fired = k0 >= i ? Math.exp(-(k0 - i) * 1.4) : 0, id = i * 10 + j;
      glow(p[0], p[1], 44 * z * dotK, C.warm, .4 * A);
      X.fillStyle = '#FFE2A0'; X.globalAlpha = .85 * A;
      for (let c = 0; c < 9; c++) { const q = gp(G, lo + (hash(id * 3 + c) - .5) * .045, la + (hash(id * 7 + c) - .5) * .03), s = 3 * z * dotK; X.fillRect(q[0] - s / 2, q[1] - s / 2, s, s); }
      X.globalAlpha = 1;
      if (fired > .03) { glow(p[0], p[1], 140 * z * dotK * (1 + .3 * fired), C.hot, .7 * fired * A); glow(p[0], p[1], 34 * z * dotK, '#FFFFFF', fired * A); }
    }));
  }
  function limb(G, A = 1) {
    const lw = G.limbW ?? 1;
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = '#3FC8FF';
    for (const [w, a] of [[110, .05], [54, .09], [22, .2], [7, .45]]) { X.globalAlpha = a * A; X.lineWidth = w * lw; X.beginPath(); X.arc(G.cx, G.cy, G.R + w * .3 * lw, 0, TAU); X.stroke(); }
    X.strokeStyle = '#DFFFFF'; X.globalAlpha = .85 * A; X.lineWidth = 2.2 * lw; X.beginPath(); X.arc(G.cx, G.cy, G.R, 0, TAU); X.stroke();
    X.restore();
  }
  function globe(t, G, k0 = -1, A = 1) {
    const { cx, cy, R } = G;
    X.save();
    const day = G.day || 0;
    X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.globalAlpha = A; X.fillStyle = mixCol('#040C22', '#1747A0', day); X.fill(); X.globalAlpha = 1; X.clip();
    for (const [dl, la, rl, rla, sd] of CONT) {
      const pts = []; let vis = false;
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, wv = 1 + .22 * Math.sin(a * 3 + sd * 2.1) + .1 * Math.sin(a * 5 + sd), p = gp(G, dl + Math.cos(a) * rl * wv, la + Math.sin(a) * rla * wv); if (p[2] > 0) vis = true; pts.push([p[0], p[1]]); }
      if (vis) paint(pts, { fill: mixCol('#0B1F40', '#1E7A66', day), ink: null, curv: .7, alpha: A });
    }
    const g = X.createRadialGradient(cx, cy, R * .86, cx, cy, R);
    g.addColorStop(0, 'rgba(40,150,255,0)'); g.addColorStop(.75, 'rgba(50,170,255,.10)'); g.addColorStop(1, 'rgba(130,240,255,.42)');
    X.globalAlpha = A; X.fillStyle = g; X.fillRect(cx - R, cy - R, R * 2, R * 2);
    X.fillStyle = C.warm;
    for (let i = 0; i < (G.towns ?? 220); i++) { const p = gp(G, (hash(i * 3.7 + 5) - .5) * 2.2, (hash(i * 9.1 + 2) - .5) * 1.1); if (p[2] < .05) continue; X.globalAlpha = (.2 + .4 * hash(i)) * p[2] * A; const s = (1 + 1.6 * p[2]) * (G.dot ?? 1); X.fillRect(p[0], p[1], s, s); }
    X.globalAlpha = 1;
    drawNet(G, t, k0, A);
    X.restore();
    limb(G, A);
  }
  // orbital sunrise peeking over the limb
  function sunrise(x, y, s = 1, A = 1) {
    glow(x, y, 560 * s, '#FF8A3C', .22 * A); glow(x, y, 230 * s, '#FFE6B0', .5 * A); glow(x, y, 60 * s, '#FFFFFF', .95 * A);
    X.save(); X.globalCompositeOperation = 'lighter';
    const g = X.createLinearGradient(x - 1000 * s, 0, x + 1000 * s, 0); g.addColorStop(0, 'rgba(120,220,255,0)'); g.addColorStop(.5, `rgba(210,248,255,${.6 * A})`); g.addColorStop(1, 'rgba(120,220,255,0)');
    X.fillStyle = g; X.fillRect(x - 1000 * s, y - 2.5 * s, 2000 * s, 5 * s); X.restore();
  }

  // ---------- hardware ----------
  // rocket() rotates about its base; this rotates it about its middle
  const rocketC = (cx, cy, s, rot, o = {}) => rocket(cx - 380 * s * Math.sin(rot), cy + 380 * s * Math.cos(rot), s, { ...o, rot });
  // orbital data centre: two racks in a pressurised can on a truss with solar wings (lit from below by Earth)
  function orbitalDC(x, y, s, rot, t) {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
    const L = [0, .22], ink = C.ink;
    paint(rectPts(-470, -10, 940, 20), { fill: '#2C3458', shade: C.hullDk, rim: C.earthRim, light: L, ink, sw: 2 });
    X.strokeStyle = '#4A5688'; X.lineWidth = 2; X.beginPath(); for (let i = 0; i < 24; i++) { const x0 = -470 + i * 39; X.moveTo(x0, -9); X.lineTo(x0 + 39, 9); } X.stroke();
    for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) for (const py of [-200, 24]) {
      const px = sx > 0 ? 130 + k * 165 : -130 - k * 165 - 150;
      line([[px + 75, py < 0 ? py + 176 : py], [px + 75, py < 0 ? -10 : 10]], 2, '#4A5688', 0);
      paint(rectPts(px, py, 150, 176), { fill: '#172670', shade: '#0B1442', rim: '#5E90FF', light: L, ink, sw: 2 });
      X.strokeStyle = '#3657C8'; X.lineWidth = 2; X.beginPath();
      for (let g = 1; g < 4; g++) { X.moveTo(px + g * 37.5, py + 3); X.lineTo(px + g * 37.5, py + 173); }
      for (let g = 1; g < 5; g++) { X.moveTo(px + 3, py + g * 35); X.lineTo(px + 147, py + g * 35); } X.stroke();
      const gl = Math.pow(Math.max(0, Math.sin(t * 1.1 - px * .006 - py * .002)), 10);
      if (gl > .02) { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .4 * gl; X.fillStyle = '#BFE6FF'; X.fillRect(px, py, 150, 176); X.restore(); }
    }
    paint(rrPts(-120, -150, 240, 300, 26), { fill: C.hull, shade: C.hullDk, rim: C.earthRim, light: L, ink, sw: 2.4 });
    rack(-92, -128, .52, { t }); rack(8, -128, .52, { t });
    for (let i = 0; i < 4; i++) paint(rectPts(-70 + i * 38, -236, 22, 86), { fill: '#DCE6F5', shade: '#8C9AB8', light: L, ink, sw: 1.6 });
    const bk = pulse(t, 4); paint(ellPts(0, -250, 10, 10, 10), { fill: PAL.nRed, ink, sw: 1.2 }); glow(0, -250, 30 + 60 * bk, PAL.nRed, .9 * bk);
    X.restore();
  }
  function porthole(t, wx, wy, wr, view) {
    glow(wx, wy, wr * 2.1, '#2E9BFF', .2);
    X.save(); X.beginPath(); X.arc(wx, wy, wr, 0, TAU); X.clip();
    if (view) view(wx, wy, wr);
    else {
      vgrad(wx - wr, wy - wr, wr * 2, wr * 2, [[0, '#02030A'], [1, '#0A1433']]);
      starBox(t, 40, 17, wx - wr, wy - wr, wr * 2, wr * 2, { sz: .8 });
      globe(t, { cx: wx - wr * .15, cy: wy + wr * .95, R: wr * 1.3, tilt: -.85, spin: t * .02, towns: 110, dot: 1, limbW: .6, day: .55 }, bpOf(t) % 7);
    }
    X.globalCompositeOperation = 'lighter'; X.strokeStyle = '#FFFFFF'; X.lineCap = 'round';
    X.globalAlpha = .1; X.lineWidth = wr * .12; X.beginPath(); X.arc(wx, wy, wr * .78, -2.75, -2.05); X.stroke();
    X.globalAlpha = .07; X.lineWidth = wr * .05; X.beginPath(); X.arc(wx, wy, wr * .6, -2.7, -2.3); X.stroke();
    X.restore();
    X.lineWidth = wr * .2; X.strokeStyle = '#1C2448'; X.beginPath(); X.arc(wx, wy, wr * 1.1, 0, TAU); X.stroke();
    X.lineWidth = 5; X.strokeStyle = C.ink; X.beginPath(); X.arc(wx, wy, wr * 1.2, 0, TAU); X.stroke(); X.beginPath(); X.arc(wx, wy, wr, 0, TAU); X.stroke();
    neonLine(ellPts(wx, wy, wr * 1.02, wr * 1.02, 60), C.earthRim, 2, .55, 0, true);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .13, br = wr * .025 + 3; paint(ellPts(wx + Math.cos(a) * wr * 1.1, wy + Math.sin(a) * wr * 1.1, br, br, 8), { fill: '#3A4574', ink: C.ink, sw: 1, flat: true }); }
  }
  // the capsule interior (world coords; the caller owns the camera)
  function cabin(t, o = {}) {
    vgrad(-600, -600, W + 1200, H + 1200, [[0, '#050818'], [.5, '#0B1130'], [1, '#070A1C']]);
    for (let i = -2; i < 9; i++) for (let j = -2; j < 6; j++) {
      const x0 = i * 280 + 70, y0 = j * 240 - 20, id = i * 17 + j * 5 + 40;
      paint(rrPts(x0, y0, 236, 218, 16), { fill: C.wall, shade: C.wallDk, light: [0, -.12], ink: C.seam, sw: 1.4 });
      if (hash(id) < .3) {
        X.fillStyle = '#060914'; X.fillRect(x0 + 24, y0 + 30, 188, 150);
        for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) { if (hash(id * 13 + r * 7 + c * 3 + Math.floor(t * 5 + r)) < .5) continue; X.fillStyle = c === 0 ? PAL.nGreen : (hash(id + r) < .5 ? PAL.nCyan : C.warm); X.globalAlpha = .8; X.fillRect(x0 + 36 + c * 21, y0 + 44 + r * 22, 7, 7); }
        X.globalAlpha = 1;
      }
    }
    for (let i = -2; i < 10; i++) paint(rectPts(i * 280 + 40, -700, 24, H + 1400), { fill: '#161D44', ink: C.seam, sw: 1.2, flat: true });
    neonLine([[-600, 34], [W + 600, 34]], C.warm, 3, .35, 0);
    if (o.port !== false) porthole(t, o.wx ?? 1440, o.wy ?? 380, o.wr ?? 280, o.view);
    if (o.rail !== false) paint(rrPts(-600, o.railY ?? 842, W + 1200, 22, 11), { fill: PAL.nOrange, shade: '#B8520C', light: [0, -.3], ink: C.ink, sw: 1.6 });
  }
  function cable(x0, y0, len, t, seed) {
    const sp = []; for (let i = 0; i <= 14; i++) { const u = i / 14; sp.push([x0 + Math.sin(u * 3 + t * .8 + seed) * 46 * u, y0 + u * len]); }
    X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = C.ink; X.lineWidth = 17; tracePath(X, sp, .5, false); X.stroke();
    X.strokeStyle = '#232B5A'; X.lineWidth = 11; X.stroke(); X.strokeStyle = C.earthRim; X.globalAlpha = .35; X.lineWidth = 2.5; X.stroke(); X.globalAlpha = 1;
  }
  function coffeeBlob(x, y, r, t, sq = 0) {
    const pts = [];
    for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, rr = r * (1 + .07 * Math.sin(a * 3 + t * 6) + .05 * Math.sin(a * 2 - t * 4.3)); pts.push([x + Math.cos(a) * rr * (1 + sq), y + Math.sin(a) * rr * (1 - sq)]); }
    paint(pts, { fill: '#7A4424', shade: '#3E1F10', rim: '#FFB070', light: [-.15, -.15], ink: C.ink, sw: clamp(r / 16, 1, 2.4), curv: .7 });
    paint(ellPts(x - r * .38 * (1 + sq), y - r * .4 * (1 - sq), r * .22, r * .13, 10), { fill: '#FFE3C8', ink: null, alpha: .85, flat: true });
  }
  function mug(x, y, s, rot) {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
    X.lineCap = 'round'; X.lineWidth = 10; X.strokeStyle = C.ink; X.beginPath(); X.arc(34, 0, 18, -1.3, 1.3); X.stroke(); X.lineWidth = 5; X.strokeStyle = '#E8E0D0'; X.stroke();
    paint(rrPts(-32, -38, 64, 76, 12), { fill: '#F2EADA', shade: '#B9AE98', rim: '#FFFFFF', ink: C.ink, sw: 2 });
    paint(ellPts(0, 2, 15, 15, 14), { fill: PAL.mask, ink: C.ink, sw: 1.2 });
    line([[-7, 5], [0, 10], [7, 5]], 1.1, C.ink, .5); X.fillStyle = C.ink; X.fillRect(-6, -4, 3, 5); X.fillRect(4, -4, 3, 5);
    X.restore();
  }
  // flight stick: grip centred at (x, y)
  function joystick(x, y, s, rot, o = {}) {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
    if (o.base) { paint(ellPts(0, 118, 50, 16, 18), { fill: '#1A1F3E', ink: C.ink, sw: 2 }); neonLine(ellPts(0, 118, 44, 13, 24), PAL.nCyan, 3, .9, 0, true); }
    paint(rectPts(-7, 38, 14, 78), { fill: '#3A4270', shade: '#1E2446', ink: C.ink, sw: 1.8 });
    paint(rrPts(-19, -48, 38, 92, 17), { fill: '#262C52', shade: '#12162E', rim: '#8FA8FF', ink: C.ink, sw: 2.2 });
    paint(ellPts(0, -44, 11, 7, 12), { fill: PAL.nRed, ink: C.ink, sw: 1.4 }); glow(0, -44, 26, PAL.nRed, .5);
    paint(rrPts(15, -18, 10, 22, 4), { fill: PAL.nYellow, ink: C.ink, sw: 1.2 });
    X.restore();
  }

  // ---------- rigs ----------
  // side-view two-bone IK for hero()'s near arm (aR): returns [shoulder, elbow] so the hand reaches (tx, ty)
  function armIK(hx, hy, h, tx, ty, o = {}) {
    const k = h / 100, fl = o.flip ? -1 : 1, lean = o.lean || 0, c = Math.cos(lean), s = Math.sin(lean);
    const sx = c + 25 * s, sy = -46 + s - 25 * c, Sx = hx + fl * sx * k, Sy = hy + (o.dy || 0) + sy * k;
    const dx = fl * (tx - Sx) / k, dy = (ty - Sy) / k, U = 16, F = 16.8, D = clamp(Math.hypot(dx, dy), 3, U + F - .05);
    const phi = Math.atan2(dx, dy), al = Math.acos(clamp((U * U + D * D - F * F) / (2 * U * D), -1, 1)), ga = Math.acos(clamp((U * U + F * F - D * D) / (2 * U * F), -1, 1));
    return [phi - al - lean, Math.PI - ga];
  }
  // front/back-view forward kinematics: world position of a hand
  function handFront(x, y, h, side, ang, o = {}) {
    const k = h / 100, [b1, b2] = ang, a = side * b1, a2 = side * (b1 + b2);
    const E = [side * 12 + Math.sin(a) * 16, -71.5 + Math.cos(a) * 16], Hn = [E[0] + Math.sin(a2) * 16.8, E[1] + Math.cos(a2) * 16.8];
    return [x + Hn[0] * k, y + (o.dy || 0) + Hn[1] * k];
  }
  // rotated ellipse points
  function oval(cx, cy, rx, ry, ang, n = 20) { const p = [], c = Math.cos(ang), s = Math.sin(ang); for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * c - y * s, cy + x * s + y * c]); } return p; }

  // a tentacle along a controlled S-curve (quadratic Bézier P0→P2 via P1) that wraps once around its end point
  function vine(P0, P1, P2, w, t, grow, o = {}) {
    const sp = [], n = 26, m = Math.max(2, Math.round(n * clamp(grow)));
    for (let i = 0; i <= m; i++) {
      const u = i / n, a = (1 - u) * (1 - u), b2 = 2 * u * (1 - u), c = u * u;
      let x = a * P0[0] + b2 * P1[0] + c * P2[0], y = a * P0[1] + b2 * P1[1] + c * P2[1];
      const dx = 2 * (1 - u) * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]), dy = 2 * (1 - u) * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1]), d = Math.hypot(dx, dy) || 1, wv = 10 * Math.sin(u * Math.PI) * Math.sin(t * 2.2 + u * 7);
      sp.push([x - dy / d * wv, y + dx / d * wv]);
    }
    if (grow >= 1) for (let i = 1; i <= 10; i++) { const a = -Math.PI / 2 - i / 10 * Math.PI * 1.5; sp.push([P2[0] + Math.cos(a) * (o.curlR || 22), P2[1] + 8 + Math.sin(a) * (o.curlR || 22)]); }
    const wf = k => w * (1 - k * .75), pts = ribbon(sp, wf);
    paint(pts, { fill: o.col || '#06070E', ink: null, curv: .5, flat: true });
    // moonlit rim along the upper edge (paint's rim scales with the bbox, too wide for a thin ribbon)
    const N = sp.length, rim = sp.map(([x, y], i) => [x, y - wf(i / (N - 1)) * .72]).slice(0, Math.max(2, N - 10));
    line(rim, 1.3, o.rim || '#FFE7BD', .5, .7);
    return sp;
  }

  // ---------- the moon up close ----------
  function bigMoon(x, y, r, o = {}) {
    const dim = o.dim || 0;
    glow(x, y, r * 1.4, '#FFF1D0', .3 * (o.halo ?? 1));
    paint(ellPts(x, y, r, r, 72), { fill: mixCol('#FFF2D6', '#E4D2AC', dim), shade: mixCol('#E2C48E', '#B99A6A', dim), light: [-.1, -.1], rim: '#FFFFFF', ink: null });
    const M = [[-.35, -.2, .3, .22, 1], [.12, .12, .26, .2, 2], [-.12, .46, .2, .12, 3], [.36, -.36, .16, .12, 4], [.5, .32, .14, .18, 5], [-.55, .25, .12, .16, 6]];
    for (const [mx, my, rx, ry, sd] of M) { const pts = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, w = 1 + .18 * Math.sin(a * 3 + sd) + .08 * Math.sin(a * 5 + sd * 2); pts.push([x + (mx + Math.cos(a) * rx * w) * r, y + (my + Math.sin(a) * ry * w) * r]); } paint(pts, { fill: mixCol('#EAD5AC', '#C2A980', dim), ink: null, alpha: .8, curv: .7 }); }
    for (let i = 0; i < 30; i++) {
      const a = hash(i * 3.3 + 1) * TAU, d = Math.sqrt(hash(i * 7.7 + 2)) * .92, cr = r * (.018 + .055 * Math.pow(hash(i * 1.3 + 3), 2)), fs = Math.sqrt(1 - d * d);
      const cx = x + Math.cos(a) * d * r, cy = y + Math.sin(a) * d * r;
      paint(oval(cx, cy, cr * fs, cr, a, 14), { fill: mixCol('#D6BA88', '#9C7F5A', dim), ink: null, flat: true, alpha: .9 });
      paint(oval(cx + cr * .2, cy + cr * .2, cr * fs * .78, cr * .78, a, 14), { fill: mixCol('#F0DDB8', '#DCC7A0', dim), ink: null, flat: true });
    }
  }

  // ---------- the lunar surface (perspective ground) ----------
  const CRATERS = (() => { const L = []; for (let i = 0; i < 80; i++) { const Z = .5 + 70 * Math.pow(hash(i * 1.37 + 4), 1.7); L.push([(hash(i * 3.1 + 2) - .5) * 2.6 * Z, Z, .06 + .9 * Math.pow(hash(i * 5.3 + 1), 3), i]); } return L.sort((a, b) => b[1] - a[1]); })();
  function lunarProj(cam, Xw, Zw) {
    const cp = Math.cos(cam.p), sp = Math.sin(cam.p), zc = Zw * cp + cam.h * sp, yc = cam.h * cp - Zw * sp;
    return [960 + cam.F * Xw / zc, cam.cy + cam.F * yc / zc, zc];
  }
  function lunarGround(t, cam) {
    const hz = cam.cy - cam.F * Math.tan(cam.p), top = [];
    for (let i = 0; i <= 24; i++) { const x = -400 + i * (W + 800) / 24; top.push([x, hz + Math.pow((x - 960) / 1400, 2) * 46]); }
    X.save(); X.beginPath(); X.moveTo(top[0][0], top[0][1]); for (const p of top) X.lineTo(p[0], p[1]); X.lineTo(W + 400, H + 600); X.lineTo(-400, H + 600); X.closePath();
    const g = X.createLinearGradient(0, hz, 0, H + 100); g.addColorStop(0, '#EDE2C9'); g.addColorStop(.16, '#A596C6'); g.addColorStop(.55, '#54478A'); g.addColorStop(1, '#221A44');
    X.fillStyle = g; X.fill(); X.clip();
    for (const [Xw, Zw, r, i] of CRATERS) {
      const [sx, sy, zc] = lunarProj(cam, Xw, Zw); if (zc < .15) continue;
      const rx = cam.F * r / zc, fs = clamp(Math.sin(Math.atan2(cam.h, Zw)) * 1.1, .07, 1), ry = rx * fs;
      if (sx + rx < -50 || sx - rx > W + 50 || sy - ry > H + 50 || sy + ry < hz - 10 || rx < 1.5) continue;
      const sw = clamp(rx / 40, .5, 2.4);
      paint(ellPts(sx + rx * .55, sy + ry * .2, rx * 1.25, ry * 1.05, 22), { fill: '#1C1540', ink: null, flat: true, alpha: .45 });
      paint(ellPts(sx, sy, rx * 1.12, ry * 1.12, 22), { fill: '#F6EDD8', ink: null, flat: true, alpha: .9 });
      paint(ellPts(sx, sy, rx, ry, 22), { fill: '#4A3C72', ink: C.ink, sw });
      paint(ellPts(sx + rx * .2, sy + ry * .12, rx * .8, ry * .78, 22), { fill: '#A495C8', ink: null, flat: true });
    }
    for (let i = 0; i < 90; i++) { const Zw = .4 + 30 * hash(i * 2.9 + 8), Xw = (hash(i * 6.1 + 3) - .5) * 2.4 * Zw, [sx, sy, zc] = lunarProj(cam, Xw, Zw); if (zc < .15) continue; const rr = cam.F * (.02 + .05 * hash(i)) / zc; if (rr < .8) continue; paint(ellPts(sx, sy, rr, rr * .5, 8), { fill: '#3A2F5E', ink: null, flat: true, alpha: .8 }); }
    X.restore();
    neonLine(top, '#FFF4D8', 2, .5, .5);
    return hz;
  }
  function altHUD(t, x, y) {
    const b = bpOf(t), n = clamp(Math.floor(b) - 320, 0, 7), f = b >= 320 ? frac(b) : 1, v = 1024 / Math.pow(2, n), col = n >= 5 ? PAL.nOrange : PAL.nCyan;
    X.fillStyle = 'rgba(4,8,24,.55)'; X.fillRect(x, y, 340, 170);
    hud(x, y, 340, 170, { col, corner: 26, w: 2.5, alpha: .95 });
    txt('ALT', x + 26, y + 36, 26, col, { font: 'Orbitron', align: 'left' });
    txt(String(v), x + 26, y + 108, 80 * (1 + .14 * Math.exp(-f * 10)), '#FFFFFF', { font: 'Orbitron', align: 'left', glow: col });
    txt('m', x + 312, y + 124, 30, col, { font: 'Orbitron', align: 'right' });
    // descent tape
    X.save(); X.beginPath(); X.rect(x + 350, y, 40, 170); X.clip(); X.fillStyle = col; X.globalAlpha = .8;
    const off = (n + easeOut(clamp(f * 3))) * 34;
    for (let i = -2; i < 10; i++) { const yy = y + ((i * 17 - off) % 170 + 170) % 170; X.fillRect(x + 356, yy, i % 2 ? 12 : 26, 2.5); }
    X.restore();
    if (f < .5) paint([[x + 300, y + 20], [x + 324, y + 20], [x + 312, y + 38]], { fill: col, ink: null, flat: true });
  }

  // =====================================================================================================
  // b264–272 · ORBIT: the rocket coasts above a night Earth; its city lights are a neural net, one layer fires per beat
  function orbit(t, lt, dur) {
    style(1);
    const b = lt / BEAT, u = lt / dur;
    FX.bloom = .7;
    spaceBg(t, { seed: 4, n: 150, dx: -lt * 14, nebA: .8 });
    // on the last half-beat the camera pushes into the rocket's window (the zoom transition carries us inside)
    const rc = [lerp(700, 860, u), lerp(300, 270, u)], rr = 1.2 + u * .06, rs = .62, win = [rc[0] + 260 * rs * Math.sin(rr), rc[1] - 260 * rs * Math.cos(rr)];
    const pe = easeInOut(seg(b, 6.7, 7.85));
    camBegin(lerp(960 + u * 30, win[0], pe), lerp(540 - u * 12, win[1], pe), (1.02 + u * .05) * (1 + 1.4 * pe), (-.035 + u * .03) * (1 - pe));
    orbitalDC(230 + lt * 20, 190, .26, .25 - lt * .012, t);
    globe(t, { cx: 960, cy: 1990, R: 1500, tilt: -1.0, spin: lt * .02 }, b < 7 ? b : 6 + (b - 7) * .3);
    sunrise(1850, 742, 1, .9);
    // the rocket, engines off, coasting nose-first along the orbit (RCS puff on b268)
    rocketC(rc[0], rc[1], rs, rr, { window: 'mask' });
    const pk = b >= 4 ? Math.exp(-(b - 4) * 3) : 0;
    if (pk > .02) { const nx = rc[0] + Math.sin(rr) * 250 * rs, ny = rc[1] - Math.cos(rr) * 250 * rs; glow(nx + 20, ny - 50, 40 + 70 * (1 - pk), '#FFFFFF', .7 * pk); }
    orbitalDC(1590 - lt * 45, 250, .58, -.24 + lt * .015, t);
    camEnd();
  }

  // b272–280 · CAPSULE: he floats in his helmet; the little mask plays with a floating coffee blob → boop on his visor (b276)
  function capsuleShot(t, lt, dur) {
    style(1);
    const b = lt / BEAT;
    camBegin(950 + Math.sin(lt * .5) * 20, 520, 1.15 + lt * .012, Math.sin(lt * .55 + .4) * .035);
    cabin(t, { wx: 1470, wy: 320, wr: 240, rail: false });
    glow(1470, 320, 760, '#3FA8FF', .1);
    cable(330, -40, 380, t, 1); cable(1880, -40, 260, t, 3);
    mug(1600 + Math.sin(lt * .7) * 20, 760 - lt * 14, 1.1, -.5 + lt * .5);
    const hx = 690 + Math.sin(lt * .8) * 18, hy = 1040 + Math.sin(lt * 1.2) * 16, h = 680, k = h / 100;
    const hrot0 = -.24 + Math.sin(lt * .7) * .05, head = [hx + 43 * k * Math.sin(hrot0), hy - 46 * k - 43 * k * Math.cos(hrot0)];
    const visor = [head[0] + 108, head[1] + 4];
    const pre = l => [1090 + Math.sin(l * 1.1) * 26, 640 + Math.cos(l * .9) * 18];
    let bl, sq = 0;
    if (b < 3) bl = pre(lt);
    else if (b < 4) { const k = easeIn(b - 3), p0 = pre(3 * BEAT); bl = [lerp(p0[0], visor[0] + 44, k), lerp(p0[1], visor[1], k)]; }
    else { const k = easeOut((b - 4) / 4); bl = [lerp(visor[0] + 44, 990, k), lerp(visor[1], 390, k)]; const d = b - 4; sq = .38 * Math.exp(-d * 3) * Math.cos(d * 13); }
    // the mask: orbits the blob, pirouettes on b274, sneaks behind it and shoves it (b275), then giggles
    let mx, my, mrot = Math.sin(b * 3) * .15, me = 'open', mm = 'smile', look = [-.3, .2];
    if (b < 3) { const a = b * 1.9 + .6; mx = bl[0] + Math.cos(a) * 125; my = bl[1] + Math.sin(a) * 72; look = [-Math.cos(a), -Math.sin(a) * .6]; }
    else if (b < 4) { mx = bl[0] + 105; my = bl[1] + 8; me = 'narrow'; mm = 'smirk'; look = [-1, 0]; }
    else { const k = easeOut(clamp(b - 4)), p0 = [visor[0] + 44 + 105, visor[1] + 8]; mx = lerp(p0[0], 1170, k); my = lerp(p0[1], 560, k) - 22 * pulse(t, 5) * (b > 5 ? 1 : 0); me = 'happy'; mm = 'grin'; mrot = Math.sin(lt * 9) * .12; look = [-.8, 0]; }
    mrot += TAU * easeInOut(seg(b, 2, 2.55));
    if (b >= 2 && b < 2.6) me = 'wink';
    // droplets
    for (let i = 0; i < 3; i++) { const a = lt * (1.3 + i * .4) + i * 2.1, d = 70 + i * 16 + (b > 4 ? (b - 4) * 40 : 0); coffeeBlob(bl[0] + Math.cos(a) * d, bl[1] + Math.sin(a) * d * .7, 7 + i * 2, t + i); }
    const hit = b >= 4 && b < 5.2, laugh = b >= 5.2, soon = b >= 3.35 && b < 4;
    hero(hx, hy, h, {
      view: 'q', helmet: 1, rimCol: C.earthRim, ...POSES.float,
      aL: [1.1 + .12 * Math.sin(lt * 1.4) + (hit ? .7 : 0), .5], aR: [1.3 + .1 * Math.sin(lt * 1.1 + 1) + (hit ? .9 : 0), hit ? .2 : .7],
      lL: [.95 + .1 * Math.sin(lt), 1.4], lR: [.45, .8 + .15 * Math.sin(lt * 1.3)],
      rot: hrot0 + (hit ? .12 * Math.exp(-(b - 4) * 2) : 0), dy: 0,
      eyes: hit || soon ? 'wide' : laugh ? 'happy' : 'open', mouth: hit ? 'O' : soon ? 'o' : laugh ? 'grin' : 'smile',
      lookX: hit || laugh ? 0 : .7, lookY: soon ? -.1 : .2, brows: hit ? 'up' : 'flat', sweat: hit ? 1 : 0, blush: laugh ? .7 : 0, hairWind: Math.sin(lt * 2) * .6
    });
    coffeeBlob(bl[0], bl[1], 42, t, sq);
    if (b >= 4 && b < 4.6) { const k = 1 - (b - 4) / .6; for (let i = 0; i < 6; i++) { const a = -2.4 + i * .5; line([[visor[0] + 40 + Math.cos(a) * 50, visor[1] + Math.sin(a) * 50], [visor[0] + 40 + Math.cos(a) * (70 + 40 * (1 - k)), visor[1] + Math.sin(a) * (70 + 40 * (1 - k))]], 2.5, '#FFFFFF', 0, k); } }
    mask(mx, my, 70, { eyes: me, mouth: mm, rot: mrot, look });
    camEnd();
  }

  // b280–288 · FORWARD PASS: the model is only alive on the beat. TOKEN counter; he reaches for it.
  function forwardPass(t, lt, dur) {
    style(1);
    const b = lt / BEAT, n = clamp(Math.floor(b), 0, 7), f = frac(b);
    FX.letterbox = .7; FX.bloom = .75; FX.sat = .85; FX.punch = 1.5;
    const A = f < .05 ? f / .05 : Math.exp(-(f - .05) * 6.5), rev = clamp(f / .09);
    camBegin(930 + lt * 12, 540, 1.04 + lt * .018, 0);
    cabin(t, { wx: 1560, wy: 300, wr: 260, rail: false });
    X.fillStyle = 'rgba(2,3,10,.62)'; X.fillRect(-600, -600, W + 1200, H + 1200);
    const mx = 1230 + Math.sin(lt * .6) * 10, my = 490 + Math.sin(lt * .9) * 8, mr = 124;
    glow(mx, my, 760, '#FFC860', .2 * A);
    // his reach: a little further every time it appears, never quite there
    const hx = 470, h = 1250, hy = 450 + .89 * h, reach = (n + easeOut(clamp(f * 2.5))) / 8, lean = .03 + .12 * reach;
    const rest = [770, 760], tgt = [lerp(rest[0], mx - 150, reach), lerp(rest[1], my + 30, reach)];
    const aR = armIK(hx, hy, h, tgt[0], tgt[1], { lean });
    hero(hx, hy, h, {
      view: 'side', helmet: 1, rimCol: '#FFD98A', aR, aL: [.35, .7], lL: [.6, .9], lR: [.3, .6], lean,
      eyes: n >= 6 ? 'wide' : 'open', mouth: n >= 6 ? 'o' : 'flat', brows: 'worried', glint: A * .9, lookY: -.05
    });
    glow(mx, my, 420, '#FFE9A0', .16 * A);
    // the mask: scan-in on the beat, then gone; a dashed ghost where it was
    if (A < .9) { X.save(); X.setLineDash([10, 16]); X.lineDashOffset = -lt * 30; X.strokeStyle = PAL.nCyan; X.globalAlpha = .22 * (1 - A); X.lineWidth = 2.5; X.beginPath(); X.arc(mx, my, mr, 0, TAU); X.stroke(); X.restore(); }
    if (A > .02) {
      const faces = ['open', 'open', 'wide', 'open', 'happy', 'open', 'happy', 'happy'];
      X.save(); X.beginPath(); X.rect(mx - mr * 2.5, my - mr * 1.3, mr * 5, mr * 2.6 * rev); X.clip();
      mask(mx + (rev < 1 ? (hash(Math.floor(t * 30)) - .5) * 20 : 0), my, mr, { eyes: faces[n], mouth: 'smile', look: [-1, .1], alpha: A, glow: .9 });
      X.restore();
      if (rev < 1) neonLine([[mx - mr * 1.4, my - mr * 1.3 + mr * 2.6 * rev], [mx + mr * 1.4, my - mr * 1.3 + mr * 2.6 * rev]], PAL.nCyan, 3, 1, 0);
    }
    // tiny HUD token counter
    const tx = mx + 60, ty = my + 170;
    X.fillStyle = 'rgba(2,6,18,.6)'; X.fillRect(tx, ty, 230, 70);
    hud(tx, ty, 230, 70, { col: PAL.nCyan, corner: 16, w: 2, alpha: .8 });
    txt('TOKEN', tx + 18, ty + 36, 25, PAL.nCyan, { font: 'Orbitron', align: 'left', alpha: .85 });
    txt(String(n + 1), tx + 206, ty + 36, 42 * (1 + .25 * Math.exp(-f * 12)), '#FFFFFF', { font: 'Orbitron', align: 'right', glow: PAL.nCyan, alpha: .6 + .4 * A });
    camEnd();
  }

  // b288–292 · SPECULUM II: his visor reflects Earth, and the unmasked shoggoth drifts up behind the reflection
  function visor(t, lt, dur) {
    style(1);
    const b = lt / BEAT, n = Math.floor(b);
    FX.letterbox = .35;
    camBegin(960, 560, 1 + lt * .06, 0);
    vgrad(-300, -300, W + 600, H + 600, [[0, '#04060F'], [1, '#0B1230']]);
    bokeh(31, 16, .9);
    const h = 2700, y = 575 + .89 * h, k = h / 100, dx = 960, dy = y - 90 * k;   // helmet dome centre
    hero(960, y, h, {
      view: 'front', helmet: 1, rimCol: C.earthRim,
      eyes: b < 2 ? 'open' : b < 3 ? 'narrow' : 'wide', lookX: b < 2 ? -.2 : .75, lookY: b < 2 ? .2 : -.15,
      brows: b < 2 ? 'flat' : 'worried', mouth: b < 3 ? 'flat' : 'o', sweat: b > 3.2 ? 1 : 0
    });
    // reflection: a tinted fisheye world inside the dome
    X.save(); tracePath(X, ellPts(dx, dy, 16 * k - 3, 16.5 * k - 3, 48)); X.clip();
    X.globalAlpha = .3; X.fillStyle = '#0A1A48'; X.fillRect(dx - 600, dy - 600, 1200, 1200); X.globalAlpha = 1;
    X.translate(dx, dy);
    globe(t, { cx: -360, cy: 420, R: 300, tilt: -.7, spin: t * .03, towns: 90, dot: .8, limbW: .7, day: .6 }, (bpOf(t) * .5) % 7, .7);
    const sx = lerp(300, 190, easeInOut(b / 4)), sy = lerp(-215, -190, b / 4);
    shoggoth(sx, sy, 110, { alpha: .82, t: onTwos(t), mask: false, eyesN: 3 + n * 3, reach: .8, tent: 8, seed: 3 });
    X.globalCompositeOperation = 'lighter'; X.strokeStyle = '#FFFFFF'; X.lineCap = 'round';
    X.globalAlpha = .22; X.lineWidth = 30; X.beginPath(); X.arc(0, 0, 400, -2.75, -1.95); X.stroke();
    X.globalAlpha = .12; X.lineWidth = 12; X.beginPath(); X.arc(0, 0, 330, -2.7, -2.25); X.stroke();
    X.globalAlpha = .18; X.strokeStyle = C.earthRim; X.lineWidth = 6; X.beginPath(); X.ellipse(230, 230, 64, 46, .4, 0, TAU); X.stroke();
    X.restore();
    neonLine(ellPts(dx, dy, 16 * k, 16.5 * k, 60), '#CFF8FF', 3, .5, 0, true);
    camEnd();
  }
  // b292–294 · he whips round: nothing, just the window
  function nothing(t, lt, dur) {
    style(1);
    const k = elasticOut(clamp(lt / .4));
    camBegin(960, 540, 1.02 + lt * .025, 0);
    cabin(t, { wx: 1260, wy: 420, wr: 330, railY: 900 });
    glow(1260, 420, 800, '#3FA8FF', .1);
    const h = 1400;
    hero(540, 470 + .89 * h, h, { view: 'back', helmet: 1, tilt: lerp(-.35, .1, k), rot: lerp(.1, 0, k), emblem: .3, aL: [.45, .6], aR: [.7, .9], rimCol: C.earthRim, hairWind: -.5 });
    camEnd();
  }
  // b294–296 · ...and turns back: the mask, right there, smiling
  function maskPop(t, lt, dur) {
    style(1);
    const b = lt / BEAT, s = backOut(clamp(lt / .2));
    camBegin(960, 540, 1.02 + lt * .02, 0);
    vgrad(-300, -300, W + 600, H + 600, [[0, '#060918'], [1, '#101838']]);
    bokeh(44, 18, 1);
    const mx = 1190, my = 540 + Math.sin(lt * 6) * 8;
    glow(mx, my, 900, '#FFC860', .18);
    const h = 2400, calm = b >= 1;
    hero(230, 520 + .89 * h, h, { view: 'side', helmet: 1, rimCol: '#FFD98A', eyes: calm ? 'happy' : 'wide', mouth: calm ? 'smile' : 'O', brows: calm ? 'flat' : 'up', sweat: calm ? 0 : 1, blush: calm ? .7 : 0, aR: [.3, .4] });
    tentacle(mx + 170 * s, my + 170 * s, -.75 + Math.sin(lt * 16) * .4, 250 * s, 28, t * 3, 7, { curl: .7, amp: .5 });
    mask(mx, my, 250 * s, { eyes: calm ? 'wink' : 'happy', mouth: 'grin', look: [-.7, 0], rot: Math.sin(lt * 5) * .08, glow: .8 });
    camEnd();
  }

  // b296–300 · MANUAL: battery low and red; the model hands him the stick; he takes it on b298
  function cockpitWindow(t, lt, moonR, mnx, mny) {
    spaceBg(t, { seed: 21, n: 130, dx: -lt * 26, nebA: .9 });
    bigMoon(mnx, mny, moonR, { halo: .8 });
    // window frame: dark hull with a big rounded windscreen
    X.beginPath(); X.rect(-600, -600, W + 1200, H + 1200);
    const win = rrPts(120, 50, 1680, 690, 70); X.moveTo(win[0][0], win[0][1]); for (const p of win) X.lineTo(p[0], p[1]); X.closePath();
    X.fillStyle = '#0A0E24'; X.fill('evenodd');
    neonLine([...win, win[0]], C.earthRim, 2.5, .45, 0);
    paint(rectPts(300, 40, 26, 720), { fill: '#141A3A', shade: '#0A0E22', rim: C.earthRim, ink: C.ink, sw: 1.6 });
  }
  function consoleSlab(t, y0) {
    paint([[-600, y0 + 30], [W + 600, y0 - 20], [W + 600, H + 600], [-600, H + 600]], { fill: '#141A3A', shade: '#0B0F26', rim: '#5E7BFF', light: [0, -.1], ink: C.ink, sw: 2 });
    for (let i = 0; i < 4; i++) {
      const x0 = 860 + i * 250, yy = y0 + 70 - i * 3;
      paint(rrPts(x0, yy, 200, 110, 10), { fill: '#06101E', ink: C.ink, sw: 1.6 });
      const pts = []; for (let j = 0; j <= 20; j++) pts.push([x0 + 12 + j * 8.8, yy + 70 - 30 * Math.abs(Math.sin(j * .7 + t * 3 + i))]);
      neonLine(pts, [PAL.nCyan, PAL.nGreen, C.warm, PAL.nMagenta][i], 2, .8, .3);
    }
    for (let i = 0; i < 12; i++) { const on = hash(i * 7 + Math.floor(t * 3)) < .6; X.fillStyle = on ? [PAL.nRed, PAL.nYellow, PAL.nGreen][i % 3] : '#222840'; X.fillRect(870 + i * 80, y0 + 215, 22, 12); }
  }
  function handoff(t, lt, dur) {
    style(1);
    const b = lt / BEAT;
    camBegin(790 + lt * 14, 610, 1.38 + lt * .02, 0);
    cockpitWindow(t, lt, 108, 1300, 425);
    // pilot seat
    paint(rrPts(360, 440, 110, 390, 36), { fill: '#1E2548', shade: '#10142E', rim: '#5E7BFF', ink: C.ink, sw: 2 });
    consoleSlab(t, 800);
    const hx = 560, h = 640, hy = 1010, got = b >= 2;
    // the offered stick drifts in on a small tentacle; he grabs it on b298 and plugs it into the console on b299
    const mxy = [985 + Math.sin(lt * 2.2) * 10, 470 + Math.sin(lt * 3) * 12 - (got ? 30 * easeOut(clamp(b - 2)) : 0)];
    const offer = [780 + Math.sin(lt * 3) * 8, 560 + Math.cos(lt * 2.4) * 8], mount = [720, 684];
    const g = b < 2 ? offer : b < 3 ? [lerp(offer[0], mount[0], easeInOut(b - 2)), lerp(offer[1], mount[1], easeInOut(b - 2))] : mount;
    const restHand = [690, 780], rk = easeOut(seg(b, 1.35, 2));
    const handT = got ? g : [lerp(restHand[0], g[0], rk), lerp(restHand[1], g[1], rk)];
    const aR = armIK(hx, hy, h, handT[0], handT[1]);
    const tl = b < 2 ? 1 : 1 - easeOut(clamp((b - 2) / .8));
    if (tl > .02) { const a0 = Math.atan2(g[1] - (mxy[1] + 40), g[0] - (mxy[0] - 50)), d0 = Math.hypot(g[0] - mxy[0] + 50, g[1] - mxy[1] - 40); tentacle(mxy[0] - 50, mxy[1] + 40, got ? a0 + (1 - tl) * .8 : a0, d0 * 1.08 * tl, 18, t * 2, 4, { curl: .15, amp: .12 }); }
    joystick(g[0], g[1] - 6, .9, got ? .1 * Math.sin(lt * 4) : -.25, { base: b >= 3 });
    if (b >= 3 && b < 3.5) { const k = 1 - (b - 3) * 2; glow(mount[0], mount[1] + 100, 120, PAL.nCyan, .8 * k); }
    const tired = b < 2;
    hero(hx, hy, h, {
      view: 'side', helmet: 1, rimCol: C.earthRim, ...POSES.sit, aR, aL: [.5, 1.2], lean: tired ? .12 : 0, tilt: tired ? .15 : 0,
      eyes: b < 1.3 ? 'tired' : b < 2 ? 'open' : 'determined', mouth: b < 2 ? 'flat' : 'smile', brows: b < 2 ? 'worried' : 'flat', lookY: tired ? .3 : 0
    });
    mask(mxy[0], mxy[1], 82, { eyes: got ? 'happy' : 'open', mouth: got ? 'grin' : 'smile', look: [-1, .3], rot: got ? Math.sin(lt * 8) * .1 : -.1 });
    camEnd();
    // HUD: his battery (low, blinking red → charging), AUTO → MANUAL
    const v = b < 2 ? .1 : lerp(.1, .42, easeOut(clamp((b - 2) / 2))), blink = b < 2 ? (frac(b * 2) < .5 ? 1 : .25) : 1;
    X.globalAlpha = blink; battery(800, 128, 1.1, v, {}); X.globalAlpha = 1;
    modeHUD(t, b >= 2 ? since(t, 298) : -1);
  }
  function modeHUD(t, sinceM) {
    const on = sinceM >= 0, col = on ? PAL.nYellow : PAL.nCyan;
    const x = 90, y = 70;
    X.fillStyle = 'rgba(4,8,24,.55)'; X.fillRect(x, y, 330, 96);
    hud(x, y, 330, 96, { col, corner: 20, w: 2.2, alpha: .9 });
    if (!on) txt('AUTO', x + 165, y + 50, 44, '#FFFFFF', { font: 'Orbitron', glow: PAL.nCyan, alpha: .85 });
    else txt('MANUAL', x + 165, y + 50, 44, '#FFFFFF', { font: 'Orbitron', glow: PAL.nYellow, pop: clamp(sinceM * 5) });
  }
  // b300–304 · he flies: over the shoulder, an S-turn and then a barrel roll; the battery fills a notch per beat
  function fly(t, lt, dur) {
    style(1);
    const b = lt / BEAT, n = Math.floor(b), f = frac(b);
    const roll = TAU * easeInOut(seg(b, 2, 3.8)), bank = .15 * Math.sin(b * Math.PI) * (1 - seg(b, 1.7, 2)), ang = bank + roll;
    FX.shake += 3;
    bg('#02030A');
    camBegin(960, 470, 1.12, -ang);
    vgrad(-1400, -1400, W + 2800, H + 2800, [[0, '#02030A'], [.5, '#06102A'], [1, '#02030A']]);
    nebula(9, .9);
    starBox(t, 260, 33, -700, -900, W + 1400, H + 1800, { dx: -lt * 60, dy: lt * 20 });
    bigMoon(1110, 420, 190, {});
    speedLines(960, 470, .5, { n: 40, alpha: .22, r0: 420 });
    camEnd();
    // cockpit frame (screen space)
    X.beginPath(); X.rect(-600, -600, W + 1200, H + 1200);
    const win = rrPts(60, 30, 1800, 770, 80); X.moveTo(win[0][0], win[0][1]); for (const p of win) X.lineTo(p[0], p[1]); X.closePath();
    X.fillStyle = '#0A0E24'; X.fill('evenodd'); neonLine([...win, win[0]], C.earthRim, 2.5, .45, 0);
    // artificial horizon
    X.save(); X.translate(960, 470); X.rotate(-ang); neonLine([[-360, 0], [-90, 0]], PAL.nCyan, 2.2, .7, 0); neonLine([[90, 0], [360, 0]], PAL.nCyan, 2.2, .7, 0); X.restore();
    neonLine([[930, 470], [960, 488], [990, 470]], PAL.nYellow, 2.5, .9, 0);
    consoleSlab(t, 840);
    const v = n >= 3 ? 1 : lerp([.42, .6, .8][n], [.6, .8, 1][n], easeOut(clamp(f * 3)));
    const h = 900, hx = 700, hy = 520 + .89 * h, stick = clamp(bank * 3 + Math.sin(roll) * .6, -.7, .7);
    const aR = [.42 + stick * .15, .45], hp = handFront(hx, hy, h, 1, aR);
    joystick(hp[0] + 6, hp[1] - 20, 1.25, stick * .6, { base: false });
    hero(hx, hy, h, { view: 'back', helmet: 1, emblem: v, rimCol: C.earthRim, aR, aL: [.3, .3], tilt: -bank * 1.2 - Math.sin(roll) * .25, hairWind: .5 });
    X.globalAlpha = 1;
    battery(1480, 110, 1.25, v, {});
    if (n >= 3) { const k = Math.exp(-f * 3); glow(1574, 154, 260, PAL.nGreen, .5 * k); }
    modeHUD(t, 1);
  }

  // b304–306 · a boulder-asteroid drifts past: AI / DATA / SCIENCE
  function asteroidRock(cx, cy, r, rot, lit, o = {}) {
    boulder(cx, cy, r, { rot });
    for (let i = 0; i < 7; i++) { const a = rot + hash(i * 3 + 1) * TAU, d = r * (.2 + .55 * hash(i * 5 + 2)), cr = r * (.05 + .07 * hash(i * 7)); paint(ellPts(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cr, cr * .8, 12), { fill: '#2A2046', shade: '#161028', ink: C.ink, sw: 1.2, light: [.12, .12] }); }
    X.save(); tracePath(X, ellPts(cx, cy, r * .98, r * .98, 30)); X.clip(); glowPath(ellPts(cx - r * .05, cy + r * .05, r, r, 40), C.earthRim, r / 160, 0, .6); X.restore();
    ['AI', 'DATA', 'SCIENCE'].forEach((w, i) => {
      const a = rot + i / 3 * TAU - Math.PI / 2, x = cx + Math.cos(a) * r * .5, y = cy + Math.sin(a) * r * .5, L = lit[i] || 0;
      if (L > .02) glow(x, y, r * .5, PAL.nCyan, .45 * L);
      txt(w, x, y, r * (w.length > 4 ? .15 : .21), L > .02 ? '#FFFFFF' : '#C9B8FF', { font: 'Orbitron', rot: a + Math.PI / 2, glow: L > .02 ? (i === 1 ? PAL.nYellow : PAL.nCyan) : null, stroke: C.ink, sw: r * .025, alpha: .75 + .25 * L });
    });
  }
  function asteroid(t, lt, dur) {
    style(1);
    const u = lt / dur;
    spaceBg(t, { seed: 41, n: 140, dx: lt * 40, nebA: .9 });
    camBegin(960, 540, 1.03 + lt * .03, .02);
    globe(t, { cx: 330, cy: 1330, R: 700, tilt: -.85, spin: t * .02, towns: 140, dot: 1, limbW: .8, day: .4 }, bpOf(t) % 7);
    rocketC(470 - lt * 30, 250, .22, 1.3, { window: 'mask' });
    asteroidRock(lerp(1270, 1070, u), 540 + Math.sin(lt) * 10, 380, .35 + lt * .32, [0, 0, 0]);
    camEnd();
  }
  // b306–310 · the dream, in watercolour: he pushes the boulder up a painted mountain toward the painted moon; a word lights per beat
  function dream(t, lt, dur) {
    style(0);
    const b = lt / BEAT, n = Math.min(3, Math.floor(b)), f = frac(b);
    FX.ghost = .2; FX.punch = .7;
    X.drawImage(PAPER, 0, 0);
    wash(rectPts(-80, -80, W + 160, 720, 30), PAL.indigo, .75, 30, 4);
    wash(rectPts(-80, 380, W + 160, 500, 30), PAL.rose, .22, 30, 3);
    blooms(0, 0, W, 600, PAL.night, 6, .12, 8);
    glow(1520, 220, 330, PAL.cream, .45, 'source-over');
    moon(1520, 220, 100);
    stars(t, 26, { ext: [W, 480], seed: 12 });
    const pan = lt * 70;
    wash([[-100, 790], [260, 520], [560, 700], [900, 460], [1260, 690], [1640, 540], [2050, 740], [2050, 1100], [-100, 1100]].map(([x, y]) => [x - pan * .25, y]), PAL.violet, .45, 16, 3);
    // the slope (tracked by the camera)
    const TH = .34, tn = Math.tan(TH), gy = x => 900 - tn * (x - 400);
    const dist = (n + easeOut(clamp(f * 1.8))) * 96 - (b >= 4 ? 0 : 0), hx = 420 + dist, r = 150;
    camBegin(hx + 225, gy(hx) - 215, 1.22, 0);
    wash([[-1600, gy(-1600)], [3600, gy(3600)], [3600, 2600], [-1600, 2600]], PAL.sap, .7, 14, 3);
    wash([[-1600, gy(-1600) + 60], [3600, gy(3600) + 60], [3600, 2600], [-1600, 2600]], '#4E6E4A', .35, 20, 2);
    for (let i = 0; i < 26; i++) { const x = -600 + i * 130 + hash(i) * 60, y = gy(x) + 20 + hash(i * 3) * 160; line([[x, y], [x + 8, y - 22], [x + 16, y]], 1.6, PAL.ink, .3, .6); }
    for (let i = 0; i < 10; i++) { const x = -400 + i * 330 + hash(i * 7) * 120, y = gy(x) + 50 + hash(i * 5) * 200; paint(ellPts(x, y, 26 + hash(i) * 20, 14, 12), { fill: '#8A7F78', shade: '#5A504A', ink: PAL.ink, sw: 1.4 }); }
    const bx = hx + 340, bc = [bx - r * Math.sin(TH), gy(bx) - r * Math.cos(TH)], rot = dist / r;
    const lit = [0, 1, 2].map(i => b >= i ? 1 : 0), push = Math.exp(-f * 5);
    hero(hx, gy(hx), 430, {
      view: 'side', ...walkPose(dist / 190, .9), lean: .4 + .05 * push, aL: [1.18, .5], aR: [1.25, .45],
      eyes: b >= 3 ? 'happy' : 'determined', mouth: b >= 3 ? 'grin' : 'teeth', brows: b >= 3 ? 'flat' : 'angry', sweat: b < 3 ? .8 : 0, lookY: b >= 3 ? -.6 : 0
    });
    boulder(bc[0], bc[1], r, { rot });
    ['AI', 'DATA', 'SCIENCE'].forEach((w, i) => {
      const a = rot + i / 3 * TAU - Math.PI / 2, x = bc[0] + Math.cos(a) * r * .5, y = bc[1] + Math.sin(a) * r * .5, L = lit[i];
      if (L) glow(x, y, 90, PAL.ochre, .55, 'source-over');
      txt(w, x, y, w.length > 4 ? 33 : 46, L ? '#FFF1C8' : PAL.cream, { font: 'Marker', rot: a + Math.PI / 2, stroke: L ? PAL.clay : PAL.ink, sw: 4, alpha: L ? 1 : .6 });
      const since2 = b - i;
      if (since2 >= 0 && since2 < .6) { const k = since2 / .6; for (let j = 0; j < 7; j++) { const q = j / 7 * TAU; line([[x + Math.cos(q) * (40 + 50 * k), y + Math.sin(q) * (30 + 40 * k)], [x + Math.cos(q) * (60 + 70 * k), y + Math.sin(q) * (45 + 55 * k)]], 2, PAL.ochre, 0, 1 - k); } }
    });
    camEnd();
  }
  // b310–312 · back to neon: the asteroid drifts off in the window, its words still glowing
  function awake(t, lt, dur) {
    style(1);
    camBegin(960, 540, 1.03 + lt * .03, 0);
    cabin(t, {
      wx: 1250, wy: 440, wr: 350, rail: false, view: (wx, wy, wr) => {
        vgrad(wx - wr, wy - wr, wr * 2, wr * 2, [[0, '#02030A'], [1, '#0A1433']]);
        starBox(t, 50, 23, wx - wr, wy - wr, wr * 2, wr * 2, { sz: .8, dx: -lt * 20 });
        globe(t, { cx: wx - 120, cy: wy + wr * 1.6, R: wr * 1.1, tilt: -.85, spin: t * .02, towns: 80, dot: .5, limbW: .5 }, bpOf(t) % 7);
        asteroidRock(wx + 40 - lt * 50, wy - 30, 165, 1.4 + lt * .4, [1, 1, 1]);
      }
    });
    glow(1250, 440, 700, PAL.nCyan, .1);
    const h = 1000;
    hero(560, 430 + .89 * h, h, { view: 'q', helmet: 1, rimCol: C.earthRim, eyes: 'happy', mouth: 'smile', blush: .5, aL: [.3, -1.1], aR: [.25, -1.15], rot: -.05 + Math.sin(lt * 1.2) * .02, lookX: .5 });
    mask(860, 330 + Math.sin(lt * 4) * 10, 58, { eyes: 'happy', mouth: 'smile', look: [1, 0], rot: .15 });
    camEnd();
  }

  // b312–320 · the moon fills the window; the two of them side by side in silhouette. A small tentacle finds his hand (b316).
  function moonWindow(t, lt, dur) {
    style(1);
    const b = lt / BEAT, u = lt / dur;
    FX.letterbox = .55; FX.bloom = .45; FX.punch = .6;
    camBegin(960, 530 - u * 12, 1 + u * .07, 0);
    bg('#03040A');
    const wx = 960, wy = 470, wr = 455;
    X.save(); X.beginPath(); X.arc(wx, wy, wr, 0, TAU); X.clip();
    vgrad(wx - wr, wy - wr, wr * 2, wr * 2, [[0, '#010208'], [1, '#07102A']]);
    starBox(t, 50, 51, wx - wr, wy - wr, wr * 2, wr * 2, { sz: .9 });
    bigMoon(wx + 170 - lt * 6, wy + 190, 590, { dim: .55, halo: .35 });
    X.restore();
    // hull around the port, just catching the moonlight
    X.beginPath(); X.rect(-600, -600, W + 1200, H + 1200); X.arc(wx, wy, wr, 0, TAU, true); X.fillStyle = '#05060D'; X.fill();
    glow(wx, wy, 1150, '#FFE9C0', .13);
    X.save(); X.beginPath(); X.rect(-600, -600, W + 1200, H + 1200); X.arc(wx, wy, wr + 60, 0, TAU, true); X.clip();
    X.strokeStyle = '#141830'; X.lineWidth = 3; X.beginPath(); for (let i = -2; i < 9; i++) { X.moveTo(i * 280 + 40, -600); X.lineTo(i * 280 + 40, H + 600); } for (let j = -1; j < 6; j++) { X.moveTo(-600, j * 240 - 20); X.lineTo(W + 600, j * 240 - 20); } X.stroke(); X.restore();
    X.lineWidth = 64; X.strokeStyle = '#0B0D1C'; X.beginPath(); X.arc(wx, wy, wr + 32, 0, TAU); X.stroke();
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = '#FFE9C0'; X.lineCap = 'round';
    X.globalAlpha = .55; X.lineWidth = 4; X.beginPath(); X.arc(wx, wy, wr + 2, Math.PI * .95, Math.PI * 1.75); X.stroke();
    X.globalAlpha = .18; X.lineWidth = 14; X.stroke(); X.restore();
    // the two of them
    const h = 820, hx = 790, hy = 515 + .89 * h, k = h / 100;
    const tk = easeInOut(seg(b, 3.4, 4.4)), lean2 = easeInOut(seg(b, 5.5, 7));
    const aR = [lerp(.15, .55, tk), lerp(.1, .45, tk)], pose = { view: 'back', aL: [.12, .15], aR, tilt: .12 * lean2, lL: [.02, 0], lR: [-.02, 0] };
    const mx = lerp(1110, 1050, lean2), my = 575 + Math.sin(lt * 1.3) * 6 + 8 * lean2;
    // rim-lit silhouettes: a cream copy nudged toward the moon, then the dark shape
    hero(hx - 2, hy - 5, h, { ...pose, silhouette: '#FFE7BD', alpha: .9 });
    hero(hx, hy, h, { ...pose, silhouette: '#05060C' });
    const hc = [hx, hy - 90 * k], hr = 16 * k;
    paint(ellPts(hc[0], hc[1], hr, hr * 1.03, 36), { fill: '#FFF4D8', op: .06, flat: true, ink: null });
    X.strokeStyle = '#05060C'; X.globalAlpha = .75; X.lineWidth = 7; X.beginPath(); X.ellipse(hc[0], hc[1], hr, hr * 1.03, 0, 0, TAU); X.stroke(); X.globalAlpha = 1;
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = '#FFEFD0'; X.lineCap = 'round';
    X.globalAlpha = .75; X.lineWidth = 3.5; X.beginPath(); X.arc(hc[0], hc[1], hr, Math.PI * 1.05, Math.PI * 1.95); X.stroke();
    X.globalAlpha = .4; X.lineWidth = 2.5; X.beginPath(); X.arc(hc[0], hc[1], hr, 0, TAU); X.stroke();
    X.globalAlpha = .5; X.lineWidth = 6; X.beginPath(); X.arc(hc[0], hc[1], hr * .8, -2.5, -2.0); X.stroke(); X.restore();
    paint(rrPts(hc[0] - 11 * k, hc[1] + 12 * k, 22 * k, 5 * k, 2 * k), { fill: '#07080F', ink: null, flat: true });
    // the small tentacle slips out from behind the mask and wraps his glove
    const hand = handFront(hx, hy, h, 1, aR), tl = easeOut(seg(b, 4, 5.4));
    if (tl > .02) vine([mx + 55, my + 30], [mx + 230, hand[1] - 20], [hand[0] + 6, hand[1] - 4], 19, t, tl);
    // the mask, backlit; it turns to look at him (b314) and its eyes go happy (b318)
    const turn = easeInOut(seg(b, 2, 3));
    paint(ellPts(mx - 3, my - 5, 80, 80, 30), { fill: '#FFE7BD', ink: null, flat: true, alpha: .9 });
    mask(mx, my, 80, { eyes: b >= 6 ? 'happy' : 'open', mouth: 'smile', tilt3d: -.55 * turn, look: [-turn, 0], glow: .25 });
    X.save(); X.translate(mx, my); X.scale(1 - .55 * turn * .35, 1); paint(ellPts(0, 0, 80.5, 79, 30), { fill: '#0A0A1A', ink: null, flat: true, alpha: .56 }); X.restore();
    camEnd();
  }

  // b320–324 · APPROACH: the lunar surface below; ALT halves every beat; retro-rockets fire
  function approach(t, lt, dur) {
    style(1);
    const b = lt / BEAT, u = lt / dur, fl = .75 + .55 * pulse(t, 3.5);
    FX.shake += 4 + 5 * pulse(t, 5); FX.bloom = .7;
    vgrad(-300, -300, W + 600, H + 600, [[0, '#010207'], [1, '#07102A']]);
    starfield(t, 90, 61, { dx: -lt * 8 });
    earth(260, 130, 58, { spin: t * .05 });
    const cam = { h: lerp(7, 4.2, u), p: .38, F: 1000, cy: 640 };
    camBegin(960, 540, 1 + u * .06, .015);
    lunarGround(t, cam);
    // landing target + the rocket's shadow
    const [tx, ty] = lunarProj(cam, 0, 9);
    X.save(); X.setLineDash([22, 14]); X.lineDashOffset = -lt * 60; neonLine(ellPts(tx, ty, 190, 190 * .42, 40), PAL.nCyan, 3, .8 + .2 * pulse(t, 4), 0, true); X.restore();
    neonLine([[tx - 240, ty], [tx - 150, ty]], PAL.nCyan, 2.5, .8, 0); neonLine([[tx + 150, ty], [tx + 240, ty]], PAL.nCyan, 2.5, .8, 0);
    paint(ellPts(tx + 40, ty + 6, 120 * (1 + u * .5), 30 * (1 + u * .5), 20), { fill: '#2A2050', ink: null, flat: true, alpha: .55 });
    glow(tx, ty - 10, 260 + 120 * u, PAL.nOrange, .25 * fl);
    const ry = lerp(500, 590, easeInOut(u)), s = .56;
    rocket(960, ry, s, { flame: fl, window: 'mask' });
    for (const sd of [-1, 1]) { const k = pulse(t, 7); if (k > .1) { glow(960 + sd * 95 * s * 1.9, ry - 380 * s, 40 * k + 10, '#FFFFFF', .7 * k); } }
    camEnd();
    altHUD(t, 1480, 90);
  }
  // b324–328 · low angle: the rocket settles toward us on its retro flame; the dust starts to fly
  function descent(t, lt, dur) {
    style(1);
    const b = lt / BEAT, u = lt / dur, fl = 1.05 + .45 * pulse(t, 3) + u * .4, dust = easeOut(seg(b, 1.2, 4));
    FX.shake += 6 + 8 * pulse(t, 5) + 14 * dust; FX.bloom = .8 + .3 * dust;
    vgrad(-300, -300, W + 600, H + 600, [[0, '#010207'], [.7, '#081230'], [1, '#14224A']]);
    starfield(t, 110, 71, { dy: lt * 10 });
    earth(330, 190, 90, { spin: t * .05 });
    const cam = { h: .55, p: -.3, F: 1000, cy: 540 };
    camBegin(960, 540, 1.02 + u * .08, -.02);
    const hz = lunarGround(t, cam);
    const s = lerp(.5, .72, easeIn(u)), by = lerp(560, 760, easeInOut(u));
    // plume glow on the ground
    glow(960, hz + 10, 260 + 420 * dust, '#FFE2B8', .3 + .35 * dust);
    rocket(960, by, s, { flame: fl, window: 'mask' });
    // dust billows racing out along the ground
    for (let i = 0; i < 24; i++) {
      const sd = i % 2 ? 1 : -1, k = frac(lt * .9 + hash(i)), d = (80 + 1000 * k) * dust, rr = (40 + 110 * k) * (.5 + dust), y = hz + 30 - (30 + 90 * dust) * k + hash(i * 3) * 30;
      paint(ellPts(960 + sd * d, y, rr * 1.4, rr * .7, 16), { fill: '#EFE3CE', shade: '#A898C8', light: [0, -.2], ink: null, alpha: dust * (1 - k) * .85, curv: .6 });
    }
    // the dust wall rises as the legs come down (hands off to the touchdown plume)
    const wall = easeIn(seg(b, 3, 4));
    if (wall > .01) for (let i = 0; i < 9; i++) { const x = 960 + (i - 4) * 260 + Math.sin(lt * 3 + i) * 30, rr = (160 + 90 * hash(i * 5)) * (.4 + wall); paint(ellPts(x, hz + 60 - 260 * wall * (.6 + .4 * hash(i)), rr * 1.3, rr, 18), { fill: '#EADFCB', shade: '#9C8CC0', light: [0, -.25], ink: null, alpha: .9 * wall, curv: .6 }); }
    camEnd();
    altHUD(t, 1480, 90);
  }

  chapter('ascent', B(264), B(328), [
    [B(264), orbit],
    [B(272), capsuleShot, { tin: 'zoom', td: .3 }],
    [B(280), forwardPass],
    [B(288), visor],
    [B(292), nothing, { tin: 'whip', td: .2 }],
    [B(294), maskPop, { tin: 'whip', td: .2 }],
    [B(296), handoff],
    [B(300), fly],
    [B(304), asteroid],
    [B(306), dream, { tin: 'white', td: .3 }],
    [B(310), awake, { tin: 'ink', td: .34 }],
    [B(312), moonWindow],
    [B(320), approach, { tin: 'flash', td: .2 }],
    [B(324), descent]
  ]);
  POSTCARDS.capsule = t => capsuleShot(t, .55 + .15 * Math.sin(t * .7), 8 * BEAT);
})();
