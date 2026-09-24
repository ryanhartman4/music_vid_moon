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
    mask(0, 3, 17, { glow: 0 });
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

  // ---------- the model's own limbs (Ryan's shoggoth: sage, crooked, little eyes instead of suckers) ----------
  // a tapered sage limb along a quadratic Bézier P0 → P2 via P1 (half-widths w0 → w1); returns the spine
  function sageArm(P0, P1, P2, w0, w1, o = {}) {
    const n = 18, sp = [], A = o.alpha ?? 1;
    for (let i = 0; i <= n; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; sp.push([a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]]); }
    const ws = sp.map((_, i) => lerp(w0, w1, Math.pow(i / n, .8))), pts = limbPts(sp, ws);
    paint(pts, { fill: MOD.bodyN, shade: MOD.bodyNDk, rim: o.rim || MOD.rimN, light: o.light || [0, -.12], ink: C.ink, sw: clamp(w0 / 9, .8, 3.2), alpha: A, curv: .4 });
    glowPath(pts, o.rim || MOD.rimN, clamp(w0 / 50, .25, 1), .4, .22 * A);
    for (const u of (o.eyes || [.3, .62])) {
      const i = Math.round(u * n), [qx, qy] = sp[i], q2 = sp[Math.min(n, i + 1)], ww = ws[i];
      eyeball(qx, qy, ww * .5, { lid: .62, tilt: Math.atan2(q2[1] - qy, q2[0] - qx), alpha: A, sw: clamp(ww / 12, .5, 2), look: o.look });
    }
    return sp;
  }
  // the persona flip (the Waluigi effect): k = 0 the Assistant's smiley, k = 1 its sinister upside-down twin.
  // A card flip about the horizontal axis; the back of the mask is the twin.
  function flipMask(x, y, r, k, o = {}) {
    const c = Math.cos(Math.PI * clamp(k)), sy = Math.max(.05, Math.abs(c));
    X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot); X.scale(1, sy);
    if (c >= 0) mask(0, 0, r, { eyes: 'open', mouth: 'smile', ...(o.front || {}), glow: o.glow ?? .6, alpha: o.alpha ?? 1 });
    else twinFace(r, o);
    X.restore();
    if (Math.abs(c) < .5 && (o.alpha ?? 1) > .3) { const e = 1 - Math.abs(c) * 2; glow(x, y, r * 1.6, c < 0 ? PAL.nMagenta : PAL.nYellow, .45 * e); }
  }
  function twinFace(r, o = {}) {
    const A = o.alpha ?? 1, sw = clamp(r / 22, .5, 6), ink = PAL.line, grin = o.grin ?? .5;
    glow(0, 0, r * 2.3, PAL.nMagenta, .32 * A);
    paint(maskShape(r).map(([px, py]) => [-px, -py]), { fill: '#D2C650', shade: '#8A4A78', light: [-.14, -.12], rim: '#FF9AD0', ink, sw, alpha: A, curv: .2 });
    // slanted slit eyes glowing magenta, heavy V brows (inner ends low)
    for (const s of [-1, 1]) {
      const ex = s * r * .35, ey = -r * .15;
      paint([[ex + s * r * .22, ey - r * .1], [ex + s * r * .02, ey - r * .07], [ex - s * r * .17, ey + r * .05], [ex + s * r * .02, ey + r * .07]], { fill: '#1A0716', ink, sw: sw * .7, alpha: A, curv: .35, flat: true });
      paint(ellPts(ex + s * r * .02, ey - r * .005, r * .05, r * .04, 10), { fill: PAL.nMagenta, ink: null, alpha: A, flat: true });
      glow(ex, ey, r * .3, PAL.nMagenta, .55 * A);
      line([[ex - s * r * .2, ey - r * .13], [ex + s * r * .26, ey - r * .3]], sw * 1.6, ink, 0, A);
    }
    // a too-wide jagged grin
    const gw = r * (.5 + .1 * grin), gy = r * .2, gd = r * (.28 + .12 * grin), gp2 = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12, xx = lerp(-gw, gw, u); gp2.push([xx, gy + Math.sin(u * Math.PI) * gd - Math.pow(Math.abs(u - .5) * 2, 3) * r * .12]); }
    const top = gp2.map(([xx, yy], i) => [xx, gy - r * .02 + Math.sin(i / 12 * Math.PI) * r * .05]);
    paint([...top, ...gp2.slice().reverse()], { fill: '#2A0618', ink, sw: sw * .9, alpha: A, curv: .15, flat: true });
    X.save(); X.globalAlpha = A; X.fillStyle = '#FFF4E8'; X.beginPath();
    for (let i = 0; i < 9; i++) { const u0 = (i + 1.5) / 12, xx = lerp(-gw, gw, u0), y0 = gy - r * .01 + Math.sin(u0 * Math.PI) * r * .05, h = (Math.sin(u0 * Math.PI) * gd - r * .04) * .55; X.moveTo(xx - r * .045, y0); X.lineTo(xx + r * .045, y0); X.lineTo(xx, y0 + h); }
    X.fill(); X.restore();
  }
  // a small warning tag (HUD, screen space)
  function warnTag(x, y, s, text, k, col = PAL.nMagenta) {
    if (k <= .01) return;
    const w = txtW(text, 30 * s, 'Orbitron') + 90 * s, fl = hash(Math.floor(T * 20)) < .12 ? .35 : 1;
    X.fillStyle = 'rgba(20,2,14,.72)'; X.fillRect(x, y, w * k, 58 * s);
    hud(x, y, w, 58 * s, { col, corner: 14 * s, w: 2, alpha: .95 * k });
    paint([[x + 34 * s, y + 12 * s], [x + 52 * s, y + 44 * s], [x + 16 * s, y + 44 * s]], { fill: col, ink: null, flat: true, alpha: k * fl });
    txt('!', x + 34 * s, y + 33 * s, 22 * s, '#1A0716', { font: 'Orbitron', alpha: k });
    txt(text, x + 66 * s, y + 30 * s, 30 * s, '#FFFFFF', { font: 'Orbitron', align: 'left', glow: col, alpha: k * fl, pop: k });
  }

  // ---------- the good future: an O'Neill cylinder (3D-projected, land valleys + window strips) ----------
  // C: { cx, cy (screen centre of the cylinder's middle), S (px per unit at the middle), yaw, pitch, L (length / radius), spin, sun }
  const ONL = { land: ['#46B85A', '#63C95E', '#3AA15A', '#86D66A', '#55BF6A', '#2F9150'] };
  function oneill(t, Q) {
    const yaw = Q.yaw, pitch = Q.pitch, L = Q.L ?? 4.6, dist = Q.dist ?? 6, F = Q.S * dist, spin = Q.spin || 0, sunK = Q.sun ?? 1;
    const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pitch), sP = Math.sin(pitch);
    const rot = (x, y, z) => { const x1 = x * cY + z * sY, z1 = -x * sY + z * cY, y2 = y * cP - z1 * sP, z2 = y * sP + z1 * cP; return [x1, y2, z2]; };
    const pr = (x, y, z) => { const [a, b, c] = rot(x, y, z), zz = c + dist; return [Q.cx + F * a / zz, Q.cy + F * b / zz, zz, a, b, c]; };
    const surf = (a, z, r = 1) => pr(r * Math.cos(a + spin), r * Math.sin(a + spin), z);
    const outward = (a, z) => { const [nx, ny, nz] = rot(Math.cos(a + spin), Math.sin(a + spin), 0), [, , , px, py, pz] = surf(a, z); return -(nx * px + ny * py + nz * (pz + dist)); };
    const z0 = -L / 2, z1 = L / 2, NA = 36, NZ = 12, sector = a => { const u = ((a / TAU) % 1 + 1) % 1 * 6; return [Math.floor(u), frac(u)]; };
    const ringN = [], ringF = []; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; ringN.push(surf(a, z0)); ringF.push(surf(a, z1)); }
    // agricultural ring at the far end (back half) + the far spindle
    const agC = pr(0, 0, z1 + .3), agP = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU; agP.push(pr(1.55 * Math.cos(a + spin * .4), 1.55 * Math.sin(a + spin * .4), z1 + .3)); }
    const aw = F * .08 / agC[2];
    const agRing = back => { for (let i = 0; i < 60; i++) { const p = agP[i], q = agP[i + 1]; if (((p[2] + q[2]) / 2 > agC[2]) !== back) continue; line([[p[0], p[1]], [q[0], q[1]]], aw * 1.2, PAL.line, 0, 1); } for (let i = 0; i < 60; i++) { const p = agP[i], q = agP[i + 1]; if (((p[2] + q[2]) / 2 > agC[2]) !== back) continue; line([[p[0], p[1]], [q[0], q[1]]], aw * .8, back ? '#8FA4C8' : '#C8D6F0', 0, 1); } };
    agRing(true);
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, s0 = pr(0, 0, z1), e = pr(1.55 * Math.cos(a + spin * .4), 1.55 * Math.sin(a + spin * .4), z1 + .3); line([[s0[0], s0[1]], [e[0], e[1]]], aw * .35, '#6A7AA8', 0, 1); }
    // three long mirrors, hinged at the far end and angled out along the window strips (behind ones first; front ones after the hull)
    const mirrors = [];
    for (let v = 0; v < 3; v++) {
      const ac = TAU / 4 + v * TAU / 3, op = Q.mirror ?? .13, Lm = L * .7, dz = Lm * Math.cos(op), dr = Lm * Math.sin(op);
      const Hm = s2 => [Math.cos(ac + s2 * .5 + spin), Math.sin(ac + s2 * .5 + spin)], rd = [Math.cos(ac + spin), Math.sin(ac + spin)];
      const pts = [[...Hm(-1), z1], [...Hm(1), z1], [Hm(1)[0] + rd[0] * dr, Hm(1)[1] + rd[1] * dr, z1 - dz], [Hm(-1)[0] + rd[0] * dr, Hm(-1)[1] + rd[1] * dr, z1 - dz]].map(q => pr(q[0] * 1.02, q[1] * 1.02, q[2]));
      mirrors.push([outward(ac, z1 - dz / 2) < 0, pts]);
    }
    const drawMirror = (back, pts) => {
      const q = pts.map(p => [p[0], p[1]]);
      if (back) { const g = X.createLinearGradient(q[0][0], q[0][1], q[2][0], q[2][1]); g.addColorStop(0, '#1A3A6A'); g.addColorStop(.55, '#5FA8D8'); g.addColorStop(.62, '#DFF6FF'); g.addColorStop(.7, '#3A78B0'); g.addColorStop(1, '#10284A'); X.fillStyle = g; tracePath(X, q); X.fill(); }
      else { X.fillStyle = '#1E2448'; tracePath(X, q); X.fill(); X.strokeStyle = 'rgba(120,150,230,.35)'; X.lineWidth = 1; X.beginPath(); for (let m = 1; m < 6; m++) { const a = lerp(q[0][0], q[3][0], m / 6), b2 = lerp(q[0][1], q[3][1], m / 6), c2 = lerp(q[1][0], q[2][0], m / 6), d2 = lerp(q[1][1], q[2][1], m / 6); X.moveTo(a, b2); X.lineTo(c2, d2); } X.stroke(); }
      paint(q, { ink: PAL.line, sw: 1.8 });
      if (back) neonLine([q[3], q[2]], '#FFFFFF', 1.5, .7, 0);
    };
    for (const [back, pts] of mirrors) if (back) drawMirror(true, pts);
    // hull silhouette (convex hull of both rims)
    const hullPts = convexHull([...ringN, ...ringF].map(p => [p[0], p[1]]));
    paint(hullPts, { fill: '#2A3358', ink: PAL.line, sw: 2.4, flat: true });
    glowPath(hullPts, '#9FEFFF', .7, 0, .3);
    // outer skin: visible quads. Land valleys = white hull panels; windows = glass lit green-gold from inside
    X.save(); tracePath(X, hullPts); X.clip();
    for (let i = 0; i < NA; i++) for (let j = 0; j < NZ; j++) {
      const a0 = i / NA * TAU, a1 = (i + 1) / NA * TAU, za = lerp(z0, z1, j / NZ), zb = lerp(z0, z1, (j + 1) / NZ), am = (a0 + a1) / 2;
      const vis = outward(am, (za + zb) / 2); if (vis <= 0) continue;
      const q = [surf(a0, za), surf(a1, za), surf(a1, zb), surf(a0, zb)].map(p => [p[0], p[1]]), [sc] = sector(am), light = clamp(.35 + .65 * vis / 1.2);
      if (sc % 2 === 0) X.fillStyle = mixCol('#1E2548', '#7482B0', light * light);
      else X.fillStyle = mixCol(mixCol('#0C4A48', '#34C08E', light), '#FFF6C8', .6 * sunK * Math.pow(Math.max(0, Math.sin(t * 1.6 + j * .45 - i * .3)), 10));
      tracePath(X, q); X.fill();
      if (sc % 2 === 0) { X.strokeStyle = 'rgba(150,170,230,.18)'; X.lineWidth = 1; X.stroke(); }
      else if (j % 2 === 0) { X.strokeStyle = 'rgba(200,255,230,.35)'; X.lineWidth = 1; X.stroke(); }
    }
    for (const zr of [-.33, 0, .33]) { const zz = zr * L, pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; if (outward(a, zz) > 0) pts.push(surf(a, zz, 1.004)); else if (pts.length) break; } if (pts.length > 1) { line(pts.map(p => [p[0], p[1]]), 2.2, PAL.line, .3, .8); neonLine(pts.map(p => [p[0], p[1]]), '#9FEFFF', 1.2, .5, .3); } }
    X.restore();
    // near end: a glass cap; inside, three green valleys curve up and meet overhead
    const nearC = pr(0, 0, z0);
    X.save(); tracePath(X, ringN.map(p => [p[0], p[1]])); X.clip();
    const fc = pr(0, 0, z1), fr = ringF.map(p => [p[0], p[1]]);
    vgrad(nearC[0] - F, nearC[1] - F, F * 2, F * 2, [[0, '#8FD8FF'], [1, '#4FA8E0']]);
    paint(fr, { fill: '#9ADFFF', ink: null, flat: true }); glow(fc[0], fc[1], F * .6 / fc[2], '#FFF6D0', .35);
    const quads = [];
    for (let i = 0; i < NA; i++) for (let j = 0; j < NZ; j++) {
      const a0 = i / NA * TAU, a1 = (i + 1) / NA * TAU, za = lerp(z0, z1, j / NZ), zb = lerp(z0, z1, (j + 1) / NZ), am = (a0 + a1) / 2;
      if (outward(am, (za + zb) / 2) > .02) continue;
      const P4 = [surf(a0, za), surf(a1, za), surf(a1, zb), surf(a0, zb)]; quads.push([P4.reduce((s, p) => s + p[2], 0) / 4, P4, i, j, am]);
    }
    quads.sort((p, q) => q[0] - p[0]);
    for (const [d, P4, i, j, am] of quads) {
      const [sc, f] = sector(am), haze = clamp((d - dist + L / 2) / (L * 1.3));
      if (sc % 2 === 0) X.fillStyle = mixCol(ONL.land[Math.floor(hash(i * 7 + j * 13) * ONL.land.length)], '#9FD8C8', haze * .35);
      else X.fillStyle = mixCol(mixCol('#2F8EE0', '#76C6FF', Math.sin(f * Math.PI)), '#D8F4FF', .06 * sunK + .2 * haze);
      tracePath(X, P4.map(p => [p[0], p[1]])); X.fill();
      if (sc % 2 === 0 && j % 3 === 0) { X.strokeStyle = 'rgba(20,70,40,.25)'; X.lineWidth = 1; X.stroke(); }
    }
    // rivers, garden towers and trees on the valleys (only where the floor faces us)
    for (let v = 0; v < 3; v++) {
      const ac = v * TAU / 3 + TAU / 12, riv = [];
      for (let j = 0; j <= 16; j++) { const z = lerp(z0, z1, j / 16), a = ac + Math.sin(j * .9 + v) * .12; if (outward(a, z) < 0) riv.push(surf(a, z, .995)); }
      if (riv.length > 1) line(riv.map(p => [p[0], p[1]]), F * .012 / dist + .8, '#5FC8FF', .5, .9);
    }
    const props = [];
    for (let m = 0; m < 90; m++) {
      const v = m % 3, a = v * TAU / 3 + TAU / 12 + (hash(m * 3.1) - .5) * TAU / 6 * .85, z = lerp(z0 + .2, z1 - .1, hash(m * 7.7));
      if (outward(a, z) > -.05) continue;
      const b0 = surf(a, z, 1), top = surf(a, z, hash(m * 5.3) < .3 ? .8 : .94); props.push([b0[2], b0, top, m]);
    }
    props.sort((p, q) => q[0] - p[0]);
    for (const [d, b0, top, m] of props) {
      const s = F / d, tall = hash(m * 5.3) < .3;
      if (tall) {   // a garden tower: white stem, green crown, warm windows
        line([[b0[0], b0[1]], [top[0], top[1]]], s * .045 + .8, '#F4F7FF', 0, 1);
        paint(ellPts(top[0], top[1], s * .06 + 1.5, s * .04 + 1.2, 10), { fill: '#3FB85C', ink: PAL.line, sw: .6, flat: true });
        X.fillStyle = '#FFE08A'; X.fillRect(lerp(b0[0], top[0], .45) - 1.5, lerp(b0[1], top[1], .45) - 1.5, 3, 3);
      } else paint(ellPts(lerp(b0[0], top[0], .4), lerp(b0[1], top[1], .4), s * .035 + 1, s * .028 + .9, 8), { fill: hash(m) < .5 ? '#1F7A45' : '#2C9A50', ink: null, flat: true });
    }
    // clouds drifting in the middle, sunbeams through the windows
    for (let m = 0; m < 9; m++) {
      const a = hash(m * 4.1) * TAU, z = lerp(z0, z1, hash(m * 2.9)), p = pr(.6 * Math.cos(a + spin * .7), .6 * Math.sin(a + spin * .7), z), s = F / p[2];
      paint(ellPts(p[0], p[1], s * .12, s * .045, 12), { fill: '#FFFFFF', ink: null, flat: true, alpha: .75 });
    }
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let v = 0; v < 3; v++) {
      const a = v * TAU / 3 + TAU / 12 + TAU / 6, A1 = surf(a - .15, z0 + .6), A2 = surf(a + .15, z1 - .3), B1 = surf(a + Math.PI - .2, z0 + 1.2), B2 = surf(a + Math.PI + .2, z1 - .8);
      if (outward(a, 0) > 0 && outward(a + Math.PI, 0) > 0) continue;
      X.globalAlpha = .1 * sunK; X.fillStyle = '#FFF6C8'; X.beginPath(); X.moveTo(A1[0], A1[1]); X.lineTo(A2[0], A2[1]); X.lineTo(B2[0], B2[1]); X.lineTo(B1[0], B1[1]); X.closePath(); X.fill();
    }
    X.restore();
    // glass sheen on the near cap
    X.globalCompositeOperation = 'lighter'; X.globalAlpha = .07; X.fillStyle = '#FFFFFF';
    X.beginPath(); X.ellipse(nearC[0] - F * .35 / nearC[2], nearC[1] - F * .4 / nearC[2], F * .5 / nearC[2], F * .18 / nearC[2], -.6, 0, TAU); X.fill();
    X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
    X.restore();
    // rim + docking spindle
    const rn = ringN.map(p => [p[0], p[1]]);
    line(rn, F * .03 / nearC[2] + 2, PAL.line, 0, 1, true);
    neonLine(rn, '#DFFBFF', F * .012 / nearC[2] + 1.2, .9, 0, true);
    const sp0 = pr(0, 0, z0), sp1 = pr(0, 0, z0 - .5);
    line([[sp0[0], sp0[1]], [sp1[0], sp1[1]]], F * .04 / sp1[2] + 1, '#E8EEFF', 0, .9);
    glow(sp1[0], sp1[1], F * .12 / sp1[2], PAL.nCyan, .6); paint(ellPts(sp1[0], sp1[1], F * .03 / sp1[2] + 1, F * .03 / sp1[2] + 1, 10), { fill: '#FFFFFF', ink: null, flat: true });
    agRing(false);
    for (const [back, pts] of mirrors) if (!back) drawMirror(false, pts);
  }
  // ---------- an original solar-sail explorer: a slim white hull towed by a vast iridescent diamond sail ----------
  // (x, y) = hull centre on screen, s = px per unit (hull ≈ 3.4 units long). o.yaw/o.pitch aim it (0,0 = straight away from us),
  // o.sail (0..1 unfurl), o.glint (0..1 sweep across the sail), o.burn (engine), o.alpha
  function sailShip(t, x, y, s, o = {}) {
    const A = o.alpha ?? 1; if (A <= .01) return;
    const yw = o.yaw || 0, pt = o.pitch || 0, rl = o.roll || 0;
    const f = [Math.sin(yw) * Math.cos(pt), -Math.sin(pt), Math.cos(yw) * Math.cos(pt)];
    let r = [f[2], 0, -f[0]]; const rn = Math.hypot(...r) || 1; r = r.map(v => v / rn);
    let u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    const cr = Math.cos(rl), sr = Math.sin(rl), r2 = r.map((v, i) => v * cr + u[i] * sr), u2 = u.map((v, i) => u[i] * cr - r[i] * sr);
    const P = (a, bb, c) => [x + s * (a * f[0] + bb * u2[0] + c * r2[0]), y + s * (a * f[1] + bb * u2[1] + c * r2[1]), a * f[2] + bb * u2[2] + c * r2[2]];
    const sk = clamp(o.sail ?? 1), SU = 2.5, SR = 2.7 * (.12 + .88 * sk), ink = PAL.line;
    // sail geometry: a diamond in the plane ahead of the prow, bellied forward, scalloped edges
    const corner = i => { const a = i * Math.PI / 2; return [Math.cos(a) * SR, Math.sin(a) * SR]; };
    const sailPt = (vv, ww) => { const rr = Math.hypot(vv, ww) / (SR || 1); return P(SU + .55 * sk * (1 - rr * rr), vv, ww); };
    const edge = []; for (let i = 0; i < 4; i++) { const c0 = corner(i), c1 = corner(i + 1); for (let j = 0; j < 8; j++) { const k = j / 8, sc = 1 - .1 * Math.sin(k * Math.PI); edge.push(sailPt(lerp(c0[0], c1[0], k) * sc, lerp(c0[1], c1[1], k) * sc)); } }
    const hub = sailPt(0, 0), prow = P(1.05, 0, 0), stern = P(-2.2, 0, 0);
    const drawSail = () => {
      const pts = edge.map(p => [p[0], p[1]]), bb = bbox(pts);
      glow(hub[0], hub[1], Math.max(bb.w, bb.h) * .8, '#FFD27A', .22 * A * (.4 + .6 * sk));
      const g = X.createLinearGradient(bb.x, bb.y, bb.x + bb.w, bb.y + bb.h);
      g.addColorStop(0, '#FFD04A'); g.addColorStop(.4, '#FFA24A'); g.addColorStop(.7, '#FF6FB8'); g.addColorStop(1, '#5FE0FF');
      X.save(); X.globalAlpha = .93 * A; X.fillStyle = g; tracePath(X, pts, .2); X.fill(); X.clip();
      X.globalAlpha = .35 * A; X.strokeStyle = '#FFFFFF'; X.lineWidth = Math.max(1, s * .012);
      for (let m = 1; m < 4; m++) { const k = m / 4; X.beginPath(); for (let i = 0; i <= 4; i++) { const c = corner(i % 4), p = sailPt(c[0] * k, c[1] * k); i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]); } X.stroke(); }
      const gl = o.glint || 0;
      if (gl > 0 && gl < 1) { const gx = lerp(bb.x - bb.w * .4, bb.x + bb.w * 1.4, gl), gg = X.createLinearGradient(gx - bb.w * .25, 0, gx + bb.w * .25, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,240,.85)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); X.globalCompositeOperation = 'lighter'; X.globalAlpha = A; X.fillStyle = gg; X.fillRect(bb.x - bb.w, bb.y - 10, bb.w * 3, bb.h + 20); }
      X.restore();
      X.globalAlpha = A; X.lineJoin = 'round'; X.strokeStyle = ink; X.lineWidth = Math.max(1.5, s * .02); tracePath(X, pts, .2); X.stroke(); X.globalAlpha = 1;
      neonLine([...pts, pts[0]], '#FFF1C0', Math.max(1, s * .012), .7 * A, .2);
      for (let i = 0; i < 4; i++) { const c = corner(i), p = sailPt(c[0] * .96, c[1] * .96); line([[hub[0], hub[1]], [p[0], p[1]]], Math.max(1, s * .012), '#FFF8E0', 0, .85 * A); }
      paint(ellPts(hub[0], hub[1], s * .09, s * .09, 10), { fill: '#FFFFFF', ink, sw: 1.2, alpha: A });
    };
    const drawHull = () => {
      // rigging from the sail corners to the prow
      for (let i = 0; i < 4; i++) { const c = corner(i), p = sailPt(c[0] * .96, c[1] * .96); line([[p[0], p[1]], [prow[0], prow[1]]], 1, '#E8F4FF', 0, .55 * A * sk); }
      // habitat ring (back half, hull, front half)
      const ring = []; for (let i = 0; i <= 36; i++) { const a = i / 36 * TAU; ring.push(P(-1.2, Math.cos(a) * .62, Math.sin(a) * .62)); }
      const rc = P(-1.2, 0, 0), half = back => { for (let i = 0; i < 36; i++) { const p = ring[i], q = ring[i + 1]; if (((p[2] + q[2]) / 2 > rc[2]) !== back) continue; line([[p[0], p[1]], [q[0], q[1]]], s * .1, ink, 0, A); line([[p[0], p[1]], [q[0], q[1]]], s * .065, back ? '#A8B8D8' : '#F2F6FF', 0, A); } };
      half(true);
      const sp = []; for (let i = 0; i <= 14; i++) { const k = i / 14; sp.push(P(lerp(-2.2, 1.05, k), 0, 0)); }
      const wd = k => s * (k < .15 ? .1 + k * .5 : .175 - .135 * Math.pow((k - .15) / .85, 1.6)), hull = ribbon(sp.map(p => [p[0], p[1]]), wd);
      paint(hull, { fill: '#F2F6FF', shade: '#9AA8CC', rim: PAL.nCyan, light: [0, -.2], ink, sw: 1.8, alpha: A, curv: .4 });
      for (let i = 3; i < 11; i++) { const p = sp[i]; X.fillStyle = '#FFD98A'; X.globalAlpha = A; X.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); }
      X.globalAlpha = 1;
      half(false);
      paint([[prow[0], prow[1] - s * .07], [P(1.35, 0, 0)[0], P(1.35, 0, 0)[1]], [prow[0], prow[1] + s * .07]], { fill: '#BFFBFF', ink, sw: 1.2, alpha: A });
      glow(prow[0], prow[1], s * .35, PAL.nCyan, .5 * A);
      const bn = o.burn ?? .5; glow(stern[0], stern[1], s * (.4 + .8 * bn), '#9FEFFF', .7 * A); glow(stern[0], stern[1], s * .18, '#FFFFFF', A);
    };
    if (hub[2] > stern[2]) { drawSail(); drawHull(); } else { drawHull(); drawSail(); }
  }

  // ---------- the Earth greening over: garden cities bloom where the wave passes; clean-energy rings sweep on ----------
  function destPt(org, d, az) { const [lo0, la0] = org, la = Math.asin(clamp(Math.sin(la0) * Math.cos(d) + Math.cos(la0) * Math.sin(d) * Math.cos(az), -1, 1)); return [lo0 + Math.atan2(Math.sin(az) * Math.sin(d) * Math.cos(la0), Math.cos(d) - Math.sin(la0) * Math.sin(la)), la]; }
  const aDist = (org, lo, la) => Math.acos(clamp(Math.sin(la) * Math.sin(org[1]) + Math.cos(la) * Math.cos(org[1]) * Math.cos(lo - org[0]), -1, 1));
  const GARDENS = (() => { const L = []; NET.nodes.forEach(col => col.forEach(p => L.push([p[0], p[1], 1]))); for (let i = 0; i < 26; i++) L.push([(hash(i * 3.3 + 7) - .5) * 1.9, (hash(i * 8.1 + 3) - .5) * .8, .6]); return L; })();
  function gardenEarth(t, G, o) {
    const { cx, cy, R } = G, wave = o.wave || 0, org = o.org, day = o.day ?? .4, gk = (lo, la, w = .3) => clamp((wave - aDist(org, lo, la)) / w);
    const c = Math.cos(G.tilt), s = Math.sin(G.tilt);
    const ringPt = (rr, inc, ph) => { const x0 = rr * Math.sin(ph), z0 = rr * Math.cos(ph), x = x0 * Math.cos(inc), y = x0 * Math.sin(inc), y2 = y * c - z0 * s, z2 = y * s + z0 * c; return [cx + x * R, cy - y2 * R, z2]; };
    const rings = (front) => (o.rings || []).forEach(([rr, inc, k, col], ri) => {
      if (k <= 0) return; const N = 120, ph0 = -Math.PI * .5 + ri;
      for (let i = 0; i < N * k; i++) {
        const p = ringPt(rr, inc, ph0 + i / N * TAU), q = ringPt(rr, inc, ph0 + (i + 1) / N * TAU), hid = p[2] < 0 && Math.hypot(p[0] - cx, p[1] - cy) < R;
        if ((p[2] >= 0) !== front || (hid && !front)) continue;
        neonLine([[p[0], p[1]], [q[0], q[1]]], col, R * .006, .9, 0);
        if (i % 6 === 0) { X.fillStyle = '#FFE9A8'; X.globalAlpha = .9; X.fillRect(p[0] - R * .005, p[1] - R * .004, R * .01, R * .008); X.globalAlpha = 1; }
      }
      if (k < 1) { const p = ringPt(rr, inc, ph0 + k * TAU); if (p[2] >= 0 === front) { glow(p[0], p[1], R * .08, '#FFFFFF', .8); glow(p[0], p[1], R * .2, col, .5); } }
    });
    rings(false);
    X.save(); X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.fillStyle = mixCol('#051233', '#1A5FC0', day); X.fill(); X.clip();
    // the day/green cap spreading from the sunrise point
    if (wave > .01) {
      const cap = []; for (let i = 0; i < 72; i++) { const [lo, la] = destPt(org, Math.min(wave, 3.1), i / 72 * TAU), p = gp(G, lo, la); cap.push([p[0], p[1]]); }
      X.fillStyle = '#2E86E0'; X.globalAlpha = .55; tracePath(X, cap, .5); X.fill(); X.globalAlpha = 1;
    }
    for (const [dl, la, rl, rla, sd] of CONT) {
      const pts = []; let vis = false;
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, wv = 1 + .22 * Math.sin(a * 3 + sd * 2.1) + .1 * Math.sin(a * 5 + sd), p = gp(G, dl + Math.cos(a) * rl * wv, la + Math.sin(a) * rla * wv); if (p[2] > 0) vis = true; pts.push([p[0], p[1]]); }
      if (!vis) continue;
      const g = gk(dl, la, .35);
      paint(pts, { fill: mixCol('#0B1F40', '#3DBB57', g), shade: mixCol('#081630', '#23864A', g), light: [-.1, -.2], ink: null, curv: .7 });
      if (g > .05) { X.save(); tracePath(X, pts, .7); X.clip(); for (let m = 0; m < 6; m++) { const q = gp(G, dl + (hash(sd * 9 + m) - .5) * rl * 1.4, la + (hash(sd * 5 + m * 3) - .5) * rla * 1.4); paint(ellPts(q[0], q[1], R * .035, R * .012, 12), { fill: '#8EE06A', ink: null, flat: true, alpha: .7 * g }); } X.restore(); }
    }
    // atmosphere
    const ag = X.createRadialGradient(cx, cy, R * .86, cx, cy, R); ag.addColorStop(0, 'rgba(60,170,255,0)'); ag.addColorStop(.75, `rgba(90,200,255,${.08 + .1 * day})`); ag.addColorStop(1, `rgba(170,245,255,${.4 + .2 * day})`);
    X.fillStyle = ag; X.fillRect(cx - R, cy - R, R * 2, R * 2);
    // green corridors (the old neural net, now tram lines and parks) + garden cities blooming
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round';
    for (const [i, a, bb] of NET.edges) {
      const pa = NET.nodes[i][a], pb = NET.nodes[i + 1][bb], g = Math.min(gk(pa[0], pa[1]), gk(pb[0], pb[1])); if (g <= .02) continue;
      const p = gp(G, pa[0], pa[1]), q = gp(G, pb[0], pb[1]); if (p[2] < .05 || q[2] < .05) continue;
      X.strokeStyle = '#9CFF8A'; X.globalAlpha = .15 * g; X.lineWidth = R * .0028; X.beginPath(); X.moveTo(p[0], p[1]); X.lineTo(q[0], q[1]); X.stroke();
    }
    X.restore();
    for (const [lo, la, big] of GARDENS) {
      const p = gp(G, lo, la); if (p[2] < .05) continue;
      const g = gk(lo, la, .22), z = .35 + .65 * p[2]; if (g <= .01) { X.fillStyle = C.warm; X.globalAlpha = .6; X.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); X.globalAlpha = 1; continue; }
      const bl = backOut(g), rr = R * .019 * z * big * bl;
      glow(p[0], p[1], rr * 5, '#B6FF7A', .35 * g); glow(p[0], p[1], rr * 2, '#FFF4C0', .5 * g);
      for (let m = 0; m < 6; m++) { const a = m / 6 * TAU + lo * 3; paint(ellPts(p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr * .55, rr * .55, rr * .35, 8), { fill: m % 2 ? '#7CF08A' : '#FFE27A', ink: null, flat: true, alpha: g }); }
      paint(ellPts(p[0], p[1], rr * .45, rr * .3, 8), { fill: '#FFFFFF', ink: null, flat: true, alpha: g });
    }
    // the wave front: a ring of green light sweeping over the planet
    if (wave > .01 && wave < 2.9) {
      const fr = [], fk = clamp((2.9 - wave) / .6), fl = pts => { neonLine(pts, '#C8FF9A', R * .007, .9 * fk, .4); glowPath(pts, '#8CFF7A', R * .006, .4, .5 * fk, false); };
      for (let i = 0; i <= 72; i++) { const [lo, la] = destPt(org, wave, i / 72 * TAU), p = gp(G, lo, la); if (p[2] > .02) fr.push([p[0], p[1]]); else { if (fr.length > 1) fl(fr.slice()); fr.length = 0; } }
      if (fr.length > 1) fl(fr);
    }
    X.restore();
    // limb
    const lw = .8;
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = mixCol('#3FC8FF', '#8FFFC8', day);
    for (const [w, a] of [[110, .05], [54, .09], [22, .2], [7, .45]]) { X.globalAlpha = a; X.lineWidth = w * lw; X.beginPath(); X.arc(cx, cy, R + w * .3 * lw, 0, TAU); X.stroke(); }
    X.strokeStyle = '#DFFFFF'; X.globalAlpha = .85; X.lineWidth = 2.2 * lw; X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.stroke(); X.restore();
    rings(true);
  }

  function convexHull(P) {
    const pts = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
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

  // b288–292 · SPECULUM II + the Waluigi effect: his visor reflects Earth and the shoggoth drifting up behind him, holding up the
  // Assistant's smiley. b289 the reflected mask flips upside down into its sinister twin (push in); b290 the twin grins wider and
  // more eyes open; b291 he tenses to turn.
  function visor(t, lt, dur) {
    style(1);
    const b = lt / BEAT, n = Math.floor(b), flip = easeInOut(seg(b, 1, 1.32)), push = easeInOut(seg(b, .9, 1.5)), dread = seg(b, 2, 3.2);
    FX.letterbox = .35;
    const h = 2700, y = 575 + .89 * h, k = h / 100, dx = 960, dy = y - 90 * k;   // helmet dome centre
    const MX = 222, MY = -158, MR = 66 + 8 * dread;                               // the mask, in dome coords
    camBegin(lerp(960, dx + MX * .55, push), lerp(560, dy + MY * .55, push), (1 + lt * .05) * (1 + .38 * push), 0);
    vgrad(-300, -300, W + 600, H + 600, [[0, '#04060F'], [1, '#0B1230']]);
    bokeh(31, 16, .9);
    hero(960, y, h, {
      view: 'front', helmet: 1, rimCol: flip > .5 ? '#FF6FB5' : C.earthRim,
      eyes: b < 1.4 ? 'open' : b < 2.4 ? 'narrow' : 'wide', lookX: b < 1.1 ? -.2 : .75, lookY: b < 1.1 ? .2 : -.2,
      brows: b < 1.4 ? 'flat' : 'worried', mouth: b < 2.4 ? 'flat' : 'o', sweat: b > 2.6 ? 1 : 0
    });
    // reflection: a tinted fisheye world inside the dome
    X.save(); tracePath(X, ellPts(dx, dy, 16 * k - 3, 16.5 * k - 3, 48)); X.clip();
    X.globalAlpha = .3; X.fillStyle = flip > .5 ? '#2A0A30' : '#0A1A48'; X.fillRect(dx - 600, dy - 600, 1200, 1200); X.globalAlpha = 1;
    X.translate(dx, dy);
    globe(t, { cx: -360, cy: 420, R: 300, tilt: -.7, spin: t * .03, towns: 90, dot: .8, limbW: .7, day: .6 }, (bpOf(t) * .5) % 7, .7);
    // the shoggoth, up over his shoulder (its eyes open wider once the twin shows)
    const sx = lerp(318, 296, easeInOut(b / 4)), sy = lerp(-262, -276, b / 4), S = 108;
    shoggoth(sx, sy, S, { alpha: .9, t: onTwos(t), mask: false, eyesN: flip > .5 ? 7 : 3, lidMul: 1 + .4 * dread, reach: .75, look: [-.8, .4], seed: 3, glowEyes: flip > .5 });
    const mx = MX + Math.sin(lt * 2) * 6, my = MY + Math.sin(lt * 2.6) * 5;
    sageArm([sx - 60, sy + 60], [sx - 40, my + 120], [mx + 14, my + MR * .7], 17, 10, { eyes: [.55], look: [-1, 0] });
    flipMask(mx, my, MR, flip, { front: { eyes: 'open', mouth: 'smile', look: [-.6, .3] }, grin: .4 + .6 * dread, rot: .12 * Math.sin(lt * 3) });
    X.globalCompositeOperation = 'lighter'; X.strokeStyle = '#FFFFFF'; X.lineCap = 'round';
    X.globalAlpha = .22; X.lineWidth = 30; X.beginPath(); X.arc(0, 0, 400, -2.75, -1.95); X.stroke();
    X.globalAlpha = .12; X.lineWidth = 12; X.beginPath(); X.arc(0, 0, 330, -2.7, -2.25); X.stroke();
    X.globalAlpha = .18; X.strokeStyle = C.earthRim; X.lineWidth = 6; X.beginPath(); X.ellipse(230, 230, 64, 46, .4, 0, TAU); X.stroke();
    X.restore();
    neonLine(ellPts(dx, dy, 16 * k, 16.5 * k, 60), flip > .5 ? '#FFB0DA' : '#CFF8FF', 3, .5, 0, true);
    camEnd();
    if (flip > .5) { FX.rgb = Math.max(FX.rgb, .5 * Math.exp(-(b - 1.16) * 3)); FX.tint = '#FF2E88'; FX.tintA = .12 * flip; }
    warnTag(90, 830, 1.15, 'WALUIGI EFFECT', easeOut(seg(b, 1.2, 1.45)));
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
  // b294–296 · ...and turns back: the mask, right there, on its sage arm. It pops in still showing the twin and flips back to the
  // Assistant's smiley (b294.4); b295 a wink. Big eyes watch from the dark behind it.
  function maskPop(t, lt, dur) {
    style(1);
    const b = lt / BEAT, s = backOut(clamp(lt / .2)), fk = 1 - easeInOut(seg(b, .3, .72)), calm = b >= 1;
    camBegin(960, 540, 1.02 + lt * .02, 0);
    vgrad(-300, -300, W + 600, H + 600, [[0, '#060918'], [1, '#101838']]);
    bokeh(44, 18, 1);
    const mx = 1190, my = 520 + Math.sin(lt * 6) * 8, MR = 245 * s;
    glow(mx, my, 900, fk > .5 ? '#FF4FA0' : '#FFC860', .18);
    // the rest of it, in the dark: a sage flank and two big half-lidded eyes at the frame edge
    paint(ellPts(2060, 620, 330, 520, 30), { fill: MOD.bodyNDk, shade: '#1E3222', rim: MOD.rimN, light: [-.2, 0], ink: C.ink, sw: 3, alpha: .95 });
    eyeball(1818, 330, 64, { lid: .55 + .2 * pulse(t, 3), tilt: -.2, look: [-1, .2], sw: 3 });
    eyeball(1860, 820, 46, { lid: .5, tilt: .25, look: [-1, -.2], sw: 2.5 });
    const h = 2400;
    hero(230, 520 + .89 * h, h, { view: 'side', helmet: 1, rimCol: '#FFD98A', eyes: calm ? 'happy' : 'wide', mouth: calm ? 'smile' : 'O', brows: calm ? 'flat' : 'up', sweat: calm ? 0 : 1, blush: calm ? .7 : 0, aR: [.3, .4] });
    sageArm([1900, 1180], [1560, 1040], [mx + 40, my + MR * .78], 70, 34, { eyes: [.25, .55], look: [-1, -.4] });
    flipMask(mx, my, MR, fk, { front: { eyes: calm ? 'wink' : 'happy', mouth: 'grin', look: [-.7, 0] }, grin: 1, rot: Math.sin(lt * 5) * .08, glow: .8 });
    camEnd();
    if (fk > .5) { FX.tint = '#FF2E88'; FX.tintA = .1; }
  }

  // =====================================================================================================
  // b296–304 · MANUAL: the optimistic heart. The model hands him the helm; he flies, and outside it's the good future.
  function cockpitFrame(win, strut = true) {
    X.beginPath(); X.rect(-900, -900, W + 1800, H + 1800); X.moveTo(win[0][0], win[0][1]); for (const p of win) X.lineTo(p[0], p[1]); X.closePath();
    X.fillStyle = '#0A0E24'; X.fill('evenodd');
    neonLine([...win, win[0]], C.earthRim, 2.5, .45, 0);
    if (strut) paint(rectPts(300, 40, 26, 720), { fill: '#141A3A', shade: '#0A0E22', rim: C.earthRim, ink: C.ink, sw: 1.6 });
  }
  function consoleSlab(t, y0) {
    paint([[-900, y0 + 30], [W + 900, y0 - 20], [W + 900, H + 900], [-900, H + 900]], { fill: '#141A3A', shade: '#0B0F26', rim: '#5E7BFF', light: [0, -.1], ink: C.ink, sw: 2 });
    for (let i = 0; i < 4; i++) {
      const x0 = 860 + i * 250, yy = y0 + 70 - i * 3;
      paint(rrPts(x0, yy, 200, 110, 10), { fill: '#06101E', ink: C.ink, sw: 1.6 });
      const pts = []; for (let j = 0; j <= 20; j++) pts.push([x0 + 12 + j * 8.8, yy + 70 - 30 * Math.abs(Math.sin(j * .7 + t * 3 + i))]);
      neonLine(pts, [PAL.nCyan, PAL.nGreen, C.warm, PAL.nMagenta][i], 2, .8, .3);
    }
    for (let i = 0; i < 12; i++) { const on = hash(i * 7 + Math.floor(t * 3)) < .6; X.fillStyle = on ? [PAL.nRed, PAL.nYellow, PAL.nGreen][i % 3] : '#222840'; X.fillRect(870 + i * 80, y0 + 215, 22, 12); }
  }
  // HUD: AUTO → MANUAL, then "HELM: YOURS" types on (screen space)
  function modeHUD(t, sinceM) {
    const on = sinceM >= 0, col = on ? PAL.nYellow : PAL.nCyan, x = 80, y = 64, hgt = on ? lerp(96, 150, easeOut(clamp(sinceM * 4))) : 96;
    X.fillStyle = 'rgba(4,8,24,.6)'; X.fillRect(x, y, 350, hgt);
    hud(x, y, 350, hgt, { col, corner: 20, w: 2.2, alpha: .9 });
    if (!on) { txt('AUTO', x + 175, y + 50, 46, '#FFFFFF', { font: 'Orbitron', glow: PAL.nCyan, alpha: .6 + .3 * (frac(t * 2) < .5 ? 1 : 0) }); return; }
    txt('MANUAL', x + 175, y + 50, 50, '#FFFFFF', { font: 'Orbitron', glow: PAL.nYellow, pop: clamp(sinceM * 5) });
    const s = 'HELM: YOURS', n = clamp(Math.floor((sinceM - .12) * 32), 0, s.length);
    if (n > 0) txt(s.slice(0, n) + (n < s.length || frac(t * 2.5) < .5 ? '_' : ' '), x + 26, y + 112, 30, PAL.nGreen, { font: 'Orbitron', align: 'left', glow: PAL.nGreen });
  }
  // the mental-equity battery + a charging bolt (screen space)
  function equity(t, v, charging, x = 1470, y = 96, s = 1.2) {
    X.fillStyle = 'rgba(4,8,24,.55)'; X.fillRect(x - 40, y - 62 * s, 270 * s, 150 * s);
    battery(x, y, s, v, {});
    if (charging > 0) {
      const k = .6 + .4 * Math.sin(t * 14), bx = x + 75 * s, by = y + 35 * s;
      paint([[bx + 6 * s, by - 26 * s], [bx - 12 * s, by + 4 * s], [bx, by + 4 * s], [bx - 6 * s, by + 26 * s], [bx + 12 * s, by - 4 * s], [bx, by - 4 * s]], { fill: '#FFFFFF', ink: C.ink, sw: 1.6, alpha: charging * k });
      glow(bx, by, 90 * s, PAL.nGreen, .35 * charging * k);
    }
  }
  // b296–300 · the handoff: battery low and red, AUTO. The mask holds out the stick on its sage arm; he takes it on b298 and
  // the camera pulls back: an O'Neill cylinder fills the windscreen, green valleys curving up inside, sunlight in its windows.
  function handoff(t, lt, dur) {
    style(1);
    const b = lt / BEAT, got = b >= 2, open = easeInOut(seg(b, 2.05, 3.05)), u = lt / dur;
    FX.bloom = .6;
    camBegin(lerp(800, 1070, open) + lt * 10, lerp(628, 450, open), lerp(1.5, 1.07, open), lerp(.01, -.015, open));
    spaceBg(t, { seed: 21, n: 130, dx: -lt * 26, nebA: .8 });
    glow(1900, 60, 900, '#FFD9A0', .3); glow(1880, 70, 220, '#FFFFFF', .6);   // the sun, just off the top right
    // little shuttles gliding in and out of the habitat's dock
    for (let i = 0; i < 4; i++) { const k = frac(lt * .35 + i * .27), sx = lerp(1640 - i * 140, 800 - i * 60, k), sy = lerp(120 + i * 70, 300 + i * 30, k); glow(sx, sy, 14, '#FFFFFF', .7 * Math.sin(k * Math.PI)); line([[sx, sy], [sx + 40, sy - 18]], 1.4, '#BFF6FF', 0, .4 * Math.sin(k * Math.PI)); }
    oneill(t, { cx: 1290 - lt * 34, cy: 385, S: 215, L: 4.2, yaw: lerp(.52, .42, u), pitch: -.18, spin: Math.PI / 3 + .15 + lt * .1, dist: 9, mirror: .1, sun: 1 + .6 * pulse(t, 4) * (got ? 1 : 0) });
    // on autopilot the view is dim; when he takes the helm the sunlight floods in
    const dim = .58 * (1 - easeOut(seg(b, 2, 2.7)));
    if (dim > .01) { X.fillStyle = `rgba(3,5,16,${dim})`; X.fillRect(-900, -900, W + 1800, H + 1800); }
    cockpitFrame(rrPts(120, 50, 1680, 690, 70));
    paint(rrPts(360, 440, 110, 390, 36), { fill: '#1E2548', shade: '#10142E', rim: '#5E7BFF', ink: C.ink, sw: 2 });   // pilot seat
    consoleSlab(t, 800);
    const hx = 560, h = 640, hy = 1010;
    // the mask floats beside him; after the handoff it bobs up out of the view and cheers
    const cheer = got ? pulse(t, 5) : 0;
    const mxy = got ? [lerp(985, 650, easeOut(seg(b, 2.1, 3))) + Math.sin(lt * 2.2) * 8, lerp(470, 235, easeOut(seg(b, 2.1, 3))) - 22 * cheer]
      : [985 + Math.sin(lt * 2.2) * 10, 470 + Math.sin(lt * 3) * 12 - 16 * pulse(t, 5) * (b >= 1 ? 1 : 0)];
    const offer = [785 + Math.sin(lt * 3) * 6, 575 + Math.cos(lt * 2.4) * 6 - 10 * (b >= 1 && b < 2 ? pulse(t, 6) : 0)], mount = [720, 684];
    const g = b < 2 ? offer : b < 3 ? [lerp(offer[0], mount[0], easeInOut(b - 2)), lerp(offer[1], mount[1], easeInOut(b - 2))] : mount;
    const restHand = [690, 780], rk = easeOut(seg(b, 1.35, 2));
    const handT = got ? g : [lerp(restHand[0], g[0], rk), lerp(restHand[1], g[1], rk)];
    const aR = armIK(hx, hy, h, handT[0], handT[1]);
    // its arm: out from behind the mask to the stick; lets go on the grab and curls home
    const ret = easeInOut(seg(b, 2, 2.7));
    if (ret < .99) { const tip = [lerp(g[0] + 26, mxy[0] + 20, ret), lerp(g[1] - 10, mxy[1] + 50, ret)]; sageArm([mxy[0] + 30, mxy[1] + 40], [lerp(mxy[0] + 60, tip[0] + 120, 1 - ret), lerp(mxy[1] + 150, tip[1] + 40, 1 - ret)], tip, 20, 9, { eyes: ret < .4 ? [.35, .7] : [], look: [-1, .4] }); }
    joystick(g[0], g[1] - 6, .9, got ? .1 * Math.sin(lt * 4) : -.25, { base: b >= 3 });
    if (b >= 3 && b < 3.5) { const k = 1 - (b - 3) * 2; glow(mount[0], mount[1] + 100, 120, PAL.nCyan, .8 * k); }
    const tired = b < 2;
    hero(hx, hy, h, {
      view: 'side', helmet: 1, rimCol: got ? '#BFFFC8' : C.earthRim, ...POSES.sit, aR, aL: got ? [.5 + .9 * cheer * 0, 1.2] : [.5, 1.2], lean: tired ? .12 : -.02, tilt: tired ? .15 : -.06 * open,
      eyes: b < 1.3 ? 'tired' : b < 2 ? 'open' : b < 2.6 ? 'determined' : 'happy', mouth: b < 2 ? 'flat' : b < 2.6 ? 'smile' : 'grin', brows: b < 2 ? 'worried' : 'flat', lookY: tired ? .3 : -.25 * open, lookX: .3, blush: b >= 2.6 ? .6 : 0
    });
    mask(mxy[0], mxy[1], 78, { eyes: got ? 'happy' : 'open', mouth: got ? 'grin' : 'smile', look: got ? [.6, -.3] : [-1, .3], rot: got ? Math.sin(lt * 8) * .12 : -.1, glow: .8 });
    camEnd();
    const v = b < 2 ? .1 : lerp(.1, .42, easeOut(clamp((b - 2) / 2))), blink = b < 2 ? (frac(b * 2) < .5 ? 1 : .3) : 1;
    X.globalAlpha = blink; equity(t, v, got ? 1 : 0); X.globalAlpha = 1;
    modeHUD(t, got ? since(t, 298) : -1);
  }
  // b300–304 · he flies (over the shoulder). b300 the sun rises and the Earth greens over from it: garden cities bloom along the
  // old neural-net lights; b301 clean-energy rings sweep round the planet; b302 a solar-sail explorer glides in and unfurls;
  // b303 the battery is full, he whoops, and the explorer heads out to the stars.
  function fly(t, lt, dur) {
    style(1);
    const b = lt / BEAT, n = Math.floor(b), f = frac(b);
    const bank = .05 * Math.sin(b * 1.3) - .09 * Math.sin(Math.PI * seg(b, 2, 3.4)) + .05 * Math.sin(Math.PI * seg(b, 3.1, 4));
    FX.shake += 2; FX.bloom = .62;
    camBegin(960, 470, 1.05 + lt * .025, -bank);
    vgrad(-1400, -1400, W + 2800, H + 2800, [[0, '#02030A'], [.5, '#06102A'], [1, '#02030A']]);
    nebula(9, .8);
    starBox(t, 240, 33, -700, -900, W + 1400, H + 1800, { dx: -lt * 50, dy: lt * 12 });
    const G = { cx: 1060, cy: 1560, R: 1150, tilt: -1.02, spin: .1 + lt * .03 };
    bigMoon(640, 205, 44, { halo: .5 });
    const org = [.6, .35], sp0 = gp(G, org[0], org[1]), sa = Math.atan2(sp0[1] - G.cy, sp0[0] - G.cx), sp = [G.cx + Math.cos(sa) * G.R, G.cy + Math.sin(sa) * G.R], wave = 2.7 * ease(seg(b, .02, 1.75));
    gardenEarth(t, G, { wave, org, day: .12 + .55 * easeOut(seg(b, 0, 1.9)), rings: [[1.2, .16, easeOut(seg(b, .95, 1.55)), PAL.nCyan], [1.33, -.22, easeOut(seg(b, 1.35, 2.0)), '#FFD27A']] });
    sunrise(sp[0], sp[1], 1.4, .6 + .6 * easeOut(seg(b, 0, .5)) - .3 * seg(b, 2, 4)); glow(sp[0], sp[1], 700, '#FFE6B0', .25 * easeOut(seg(b, 0, .5)));
    // the explorer: slides in on b302 and unfurls; flares on b303 and heads for the stars
    const e1 = expoOut(seg(b, 2, 2.45)), go = easeIn(seg(b, 3.15, 4));
    if (b >= 1.9) {
      const sx = lerp(2400, 1330, e1) - 520 * go, sy = lerp(420, 300, e1) - 190 * go, ss = lerp(80, 72, e1) * (1 - .82 * go);
      if (go > 0) for (let i = 1; i <= 6; i++) { const q = Math.max(0, go - i * .035); glow(lerp(1330, 810, q) + 55 * i * go, lerp(300, 110, q) + 20 * i * go, 22 * (1 - q), '#BFF6FF', .35 * (1 - i / 7)); }
      sailShip(t, sx, sy, ss, { yaw: -.95 + .2 * e1 + .15 * go, pitch: .22 + .1 * go, roll: .2, sail: backOut(seg(b, 2.08, 2.55)), glint: seg(b, 2.9, 3.35), burn: .4 + 1.6 * go + .5 * pulse(t, 5) });
    }
    speedLines(960, 470, .35 + .3 * go, { n: 30, alpha: .16, r0: 460 });
    camEnd();
    cockpitFrame(rrPts(60, 30, 1800, 770, 80), false);
    // artificial horizon
    X.save(); X.translate(960, 470); X.rotate(-bank * 2); neonLine([[-360, 0], [-90, 0]], PAL.nCyan, 2.2, .6, 0); neonLine([[90, 0], [360, 0]], PAL.nCyan, 2.2, .6, 0); X.restore();
    neonLine([[930, 470], [960, 488], [990, 470]], PAL.nYellow, 2.5, .9, 0);
    consoleSlab(t, 840);
    const v = b >= 3 ? 1 : lerp([.42, .6, .8][n], [.6, .8, 1][n], easeOut(clamp(f * 3)));
    const h = 780, hx = 440, hy = 640 + .89 * h, stick = clamp(bank * 6, -.7, .7), whoop = b >= 3 ? easeOut(seg(b, 3, 3.25)) : 0;
    const aR = [.42 + stick * .15, .45], hp = handFront(hx, hy, h, 1, aR);
    joystick(hp[0] + 6, hp[1] - 20, 1.25, stick * .6, { base: false });
    hero(hx, hy, h, { view: 'back', helmet: 1, emblem: v, rimCol: '#BFFFC8', aR, aL: [lerp(.3, 2.7, whoop), lerp(.3, .25, whoop)], tilt: -bank * 1.5 + .08 * whoop, hairWind: .5, dy: -14 * whoop * pulse(t, 4) });
    equity(t, v, b < 3 ? 1 : 0);
    if (b >= 3) { const k = Math.exp(-(b - 3) * 3); glow(1560, 138, 260, PAL.nGreen, .55 * k); txt('FULL', 1560, 222, 34, '#FFFFFF', { font: 'Orbitron', glow: PAL.nGreen, pop: clamp((b - 3) * 5) }); }
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
    if (tl > .02) vine([mx + 55, my + 30], [mx + 230, hand[1] - 20], [hand[0] + 6, hand[1] - 4], 19, t, tl, { col: '#070C09' });
    // the mask, backlit; it turns to look at him (b314) and its eyes go happy (b318)
    const turn = easeInOut(seg(b, 2, 3));
    const msx = 1 - .55 * turn * .35;
    X.save(); X.translate(mx - 4, my - 6); X.scale(msx, 1); paint(maskShape(82), { fill: '#FFE7BD', ink: null, flat: true, alpha: .9 }); X.restore();
    mask(mx, my, 80, { eyes: b >= 6 ? 'happy' : 'open', mouth: 'smile', tilt3d: -.55 * turn, look: [-turn, 0], glow: .25 });
    X.save(); X.translate(mx, my); X.scale(msx, 1); paint(maskShape(80.6), { fill: '#0A0A1A', ink: null, flat: true, alpha: .56 }); X.restore();
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
  // the good future with a human at the helm (green Earth, energy rings, the sail explorer), for callback montages
  POSTCARDS.helm = t => fly(t, (2.75 + .1 * Math.sin(t * .8)) * BEAT, 4 * BEAT);
  // the habitat and the explorer, for anyone painting the bright futures: SHARED.oneill(t, {cx, cy, S, yaw, pitch, spin, L, dist, mirror, sun}),
  // SHARED.sailShip(t, x, y, s, {yaw, pitch, roll, sail, glint, burn, alpha})
  SHARED.oneill = oneill; SHARED.sailShip = sailShip;
})();
