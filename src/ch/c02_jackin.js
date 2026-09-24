// c02_jackin.js: Act II · Jack In (b72–b136, 24.70–46.65 s). Hybrid → neon.
// The plug slams into his neck port, a scan edge re-renders the watercolour lab as neon (the lab coat becomes the
// bomber), the Dyson emblem ignites, a forward pass through the network, the shoggoth reveal in latent space, riding
// a tentacle out over the skyline, the verification bottleneck, exponential tilt, and the quiet rooftop break.
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
    if (wMax > 18 && o.suckers !== false) for (let i = 2; i < n - 2; i += 2) { const u = i / (n - 1), w = wFn(u), [nx, ny] = nr[i]; paint(ellPts(sp[i][0] - nx * up * w * .45, sp[i][1] - ny * up * w * .45, w * .26, w * .2, 8), { fill: neon ? '#3A1E5E' : '#8FB9A6', ink: null, alpha: A * .9, flat: true }); }
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
  // the jack plug: tip at the origin, body along +x (ang = direction from the port toward the cable)
  function plug(x, y, ang, s = 1) {
    const neon = NEON >= .5, ink = INK();
    X.save(); X.translate(x, y); X.rotate(ang); X.scale(s, s);
    paint(rrPts(-4, -9, 20, 18, 3), { fill: neon ? '#B8C0E0' : '#C9C6D2', shade: '#7A7890', ink, sw: 1.4, wet: 1 });
    paint(rrPts(14, -17, 48, 34, 7), { fill: neon ? '#2A2440' : '#5A5468', shade: neon ? '#141024' : '#3A3448', rim: neon ? PAL.nCyan : undefined, ink, sw: 1.8, wet: 1 });
    if (neon) neonLine([[22, -15], [22, 15]], PAL.nCyan, 3, 1, 0); else line([[22, -15], [22, 15]], 2, PAL.teal, 0);
    X.restore();
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
  // the jack cable: a thin tentacle from the monitor to the neck port, ending in the plug
  function jackCable(t, from, c1, c2, port, w, o = {}) {
    const neon = NEON >= .5, ps = o.plugS ?? 1;
    const a = Math.atan2(c2[1] - port[1], c2[0] - port[0]), back = [port[0] + Math.cos(a) * 60 * ps, port[1] + Math.sin(a) * 60 * ps];
    const sp = bezSpine(from, c1, c2, back, 28, o.wave ?? 6, t * 5, 2);
    tentBody(sp, u => w * (1 - .3 * u), { col: neon ? undefined : PAL.teal, dk: neon ? undefined : '#256E6A', rim: PAL.nCyan, suckers: false, up: -1 });
    plug(port[0], port[1], a, ps);
    if (neon && o.pulses !== false) for (let j = 0; j < 5; j++) { const u = frac(t * 1.6 + j / 5), p = spineAt(sp, u).p; glow(p[0], p[1], w * 2.2, PAL.nCyan, .7); glow(p[0], p[1], w * .9, '#FFFFFF', .9); }
    return sp;
  }
  const LAB = { hx: 700, floor: 965, h: 560 };
  function labScene(t, lt) {
    const neon = NEON >= .5, ink = INK(), bi = BI(lt), hit = hitK(lt);
    camBegin(990, 505, 1.08 + lt * .012);
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
    hero(LAB.hx, y, LAB.h, { view: 'side', ...POSES.type, ...arm, eyes: bi < 2 ? 'wide' : bi < 3 ? 'wide' : look ? 'wide' : 'determined', mouth: bi < 2 ? 'O' : look ? 'o' : 'grin', brows: bi < 3 ? 'up' : 'flat', lookY: look ? .5 : 0, lookX: look ? .4 : 0,
      tilt: bi < 2 ? -.1 : 0, chrome: neon ? 1 : .25, hairWind: wob(t, 2.5) * 1.5, dy: -hit * 6, glint: hit * .8 });
    const port = [LAB.hx - 16, y - 80.3 * k];
    jackCable(t, [1300, 560], [1120, 90], [520, 300], port, 13);
    camEnd();
  }

  // ---------- b72: SLAM. Close-up: the plug snaps into his neck port; neon spreads from the port ----------
  function slam(t, lt, dur) {
    const k = 27, headX = 800, headY = 410, hx = headX + k, hy = headY + 89 * k;
    const port = [hx + 2.9 * k, hy - 80.3 * k];
    const snap = clamp(lt / .045), dir = -.55, d = 190 * (1 - easeIn(snap));
    const tip = [port[0] + Math.cos(dir) * d, port[1] + Math.sin(dir) * d];
    const R = 30 + 400 * expoOut(clamp((lt - .03) / .28));
    const draw = () => {
      const neon = NEON >= .5;
      if (!neon) { X.drawImage(PAPER, 0, 0); wash(rectPts(-60, -60, W + 120, H + 120, 20), '#34386A', .95, 26, 4); blooms(0, 0, W, H, PAL.night, 6, .16, 5); glow(1560, 240, 760, '#FFC96B', .6, 'source-over'); glow(160, 760, 640, '#9FD8D0', .45, 'source-over'); }
      else { vgrad(0, 0, W, H, [[0, '#0D0720'], [1, '#2A1648']]); for (let i = 0; i < 14; i++) { const x = 60 + i * 140; X.fillStyle = i % 3 ? PAL.nCyan : PAL.nMagenta; for (let r = 0; r < 12; r++) { X.globalAlpha = .12 + .2 * hash(i * 13 + r); X.fillRect(x, frac(hash(i) + t * .6) * 200 + r * 90 - 100, 60 * hash(i + r * 3) + 10, 10); } } X.globalAlpha = 1; glow(1560, 260, 700, PAL.nMagenta, .25); glow(200, 700, 600, PAL.nCyan, .3); }
      hero(hx, hy, k * 100, { view: 'side', flip: true, eyes: snap >= 1 ? 'wide' : 'open', mouth: snap >= 1 ? 'O' : 'flat', brows: 'up', chrome: neon ? clamp(lt / .1) : .3, glint: snap >= 1 ? .9 : 0, rot: snap >= 1 ? -.02 * Math.exp(-lt * 12) : 0, hairWind: snap >= 1 ? 1.5 : 0 });
      // the teal tentacle bringing the plug in from the upper right
      const ps = 2.3, back = [tip[0] + Math.cos(dir) * 60 * ps, tip[1] + Math.sin(dir) * 60 * ps];
      const sp = bezSpine(back, [back[0] + 280, back[1] - 150], [1700, 150], [2200, -60], 26, 12, t * 6, 1.5);
      tentBody(sp, u => 30 * (1 + .35 * u), { col: neon ? undefined : PAL.teal, dk: neon ? undefined : '#256E6A', rim: PAL.nCyan, suckers: false, up: -1 });
      plug(tip[0], tip[1], dir, ps);
    };
    splitStyle(draw, c => { const n = 36; for (let i = 0; i <= n; i++) { const an = i / n * TAU, rr = R * (1 + .08 * Math.sin(an * 5 + t * 20) + .05 * Math.sin(an * 9 - t * 31)); if (i) c.lineTo(port[0] + Math.cos(an) * rr, port[1] + Math.sin(an) * rr); else c.moveTo(port[0] + Math.cos(an) * rr, port[1] + Math.sin(an) * rr); } c.closePath(); });
    // paper grain outside the neon bubble (splitStyle turns the post to neon)
    X.save(); X.beginPath(); X.rect(0, 0, W, H); X.arc(port[0], port[1], R * .95, 0, TAU); X.clip('evenodd'); X.globalCompositeOperation = 'multiply'; X.globalAlpha = .85; X.drawImage(GRAIN, 0, 0); X.restore();
    // spark burst
    if (snap >= 1) {
      const k2 = clamp((lt - .045) / .25);
      glow(port[0], port[1], 300, '#FFFFFF', .6 * (1 - k2)); glow(port[0], port[1], 160, PAL.nCyan, .5);
      for (let i = 0; i < 16; i++) { const an = hash(i * 3.7) * TAU, r0 = 60 + k2 * 90, r1 = r0 + (90 + 240 * hash(i)) * easeOut(k2 * 1.5); neonLine([[port[0] + Math.cos(an) * r0, port[1] + Math.sin(an) * r0], [port[0] + Math.cos(an) * r1, port[1] + Math.sin(an) * r1]], i % 3 ? PAL.nCyan : PAL.nYellow, 4, 1 - k2, 0); }
      style(1); plug(tip[0], tip[1], dir, 2.3); style(.75);
    }
    FX.bloom = .45; FX.shake += snap >= 1 ? 16 * Math.exp(-(lt - .045) * 10) : 0;
  }

  // ---------- b73–80: the scan edge re-renders the lab as neon, stepping right on every beat ----------
  function scanRoom(t, lt, dur) {
    const j = Math.min(6, BI(lt)), f = BF(lt), E = i => i < 0 ? -40 : W * (i + 1) / 7;
    const edge = lerp(E(j - 1), E(j), expoOut(clamp(f * 3.2)));
    splitStyle(() => labScene(t, lt), c => c.rect(-10, -10, edge + 10, H + 20));
    if (edge < W) { X.save(); X.beginPath(); X.rect(edge, 0, W - edge, H); X.clip(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = .85; X.drawImage(GRAIN, 0, 0); X.restore(); }
    // scan band + pixel debris at the edge
    X.save(); X.globalCompositeOperation = 'lighter';
    const g = X.createLinearGradient(edge - 160, 0, edge, 0); g.addColorStop(0, 'rgba(39,242,242,0)'); g.addColorStop(1, 'rgba(39,242,242,.22)');
    X.fillStyle = g; X.fillRect(edge - 160, 0, 160, H);
    const fr = Math.floor(t * 24);
    for (let i = 0; i < 46; i++) { const yy = hash(i * 7.3 + fr) * H, xx = edge + (hash(i * 3.1 + fr) - .7) * 170, s = 5 + hash(i + fr * .3) * 24; X.globalAlpha = .6 * hash(i * 9 + fr); X.fillStyle = [PAL.nCyan, PAL.nMagenta, '#FFFFFF'][i % 3]; X.fillRect(xx, yy, s, s * (hash(i * 5) * .6 + .3)); }
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
    // the cable from his neck up to the wall screen
    const nape = [960, y - 81 * k];
    const sp = bezSpine(nape, [980, nape[1] - 300], [1200, 160], [1330, 330], 22, 8, t * 5, 2);
    tentBody(sp, u => 20 * (1 - .3 * u), { rim: PAL.nCyan, suckers: false });
    for (let j = 0; j < 4; j++) { const p = spineAt(sp, 1 - frac(t * 1.5 + j / 4)).p; glow(p[0], p[1], 40, PAL.nCyan, .7); }
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
  function tunnel(t, lt, dur) {
    style(1);
    const vx = 960 + wob(t, .23) * 50, vy = 400 + wob(t, .17) * 30, F = 560, gap = 900, near = 160, S = 1000;
    bg('#07040F'); glow(vx, vy, 800, PAL.nViolet, .35); glow(vx, vy, 260, '#FFFFFF', .3);
    const ph = lt / BEAT + .47, k0 = Math.floor(ph), hit = hitK(lt);   // a layer frame sweeps past the screen edge on every beat
    speedLines(vx, vy, .7, { n: 50, r0: 260 });
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
    // the researcher free-falling into the pass
    hero(960 + wob(t, .4) * 40, 1130 + wob(t, .6) * 16, 600, { view: 'back', aL: [2.2 + .15 * wob(t, 1.1), .35], aR: [2.2 + .15 * wob(t, 1.1, .5), .35], lL: [.3, .5], lR: [-.3, .5], rot: wob(t, .5) * .12, emblem: .5 + .5 * hit, hairWind: wob(t, 4) * 3, rimCol: PAL.nCyan });
    FX.zblur = Math.max(FX.zblur, .05 + .1 * hit);
  }
  function sideDive(t, lt, dur) {
    style(1);
    const hit = hitK(lt), spacing = 470, ph = lt / BEAT;
    vgrad(0, 0, W, H, [[0, '#0B0716'], [.5, '#1C0E3E'], [1, '#0B0716']]);
    // streaks
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) { const yy = hash(i * 3.1) * H, len = 80 + 300 * hash(i * 7), xx = W + 400 - frac(hash(i) + t * (1.2 + hash(i * 5))) * (W + 800); X.globalAlpha = .12 + .2 * hash(i * 9); X.fillStyle = i % 5 ? '#FFFFFF' : PAL.nCyan; X.fillRect(xx, yy, len, 2 + 2 * hash(i * 13)); }
    X.restore();
    // layers (tall slabs) sliding right → left; one passes the hero on each beat
    const heroX = 880, passX = 1040, slabs = [];   // a layer passes his head on every beat
    for (let k = Math.floor(ph) - 3; k <= Math.floor(ph) + 3; k++) slabs.push([k, passX + (k - ph) * spacing]);
    const tokY = j => 150 + j * 190;
    // attention arcs between neighbouring layers (behind the slabs)
    for (let s = 0; s < slabs.length - 1; s++) {
      const [k, x] = slabs[s], x2 = slabs[s + 1][1];
      for (let a = 0; a < 3; a++) { const j1 = Math.floor(hash(k * 7 + a) * 5), j2 = Math.floor(hash(k * 11 + a * 3) * 5), y1 = tokY(j1), y2 = tokY(j2), lit = Math.exp(-Math.abs((x + x2) / 2 - passX) / 260); neonLine([[x + 30, y1], [(x + x2) / 2 + 30, Math.min(y1, y2) - 120 - 80 * hash(k + a)], [x2 + 30, y2]], [PAL.nYellow, PAL.nPink, PAL.nCyan][a], 3 + 3 * lit, .35 + .6 * lit, .9); }
    }
    for (const [k, x] of slabs) {
      const col = LCOL[((k % 4) + 4) % 4], lit = Math.exp(-Math.abs(x - passX) / 200);
      const slab = [[x - 10, 40], [x + 70, 90], [x + 70, 990], [x - 10, 1040]];
      paint(slab, { fill: '#140C2C', ink: PAL.line, sw: 1.5, alpha: .85, flat: true });
      neonLine([...slab, slab[0]], col, 3 + 3 * lit, .6 + .4 * lit, 0);
      X.save(); X.globalAlpha = .25; X.strokeStyle = col; X.lineWidth = 1.5; X.beginPath(); for (let g = 1; g < 10; g++) { const yy = 60 + g * 95; X.moveTo(x - 10, yy - 5); X.lineTo(x + 70, yy + 5); } X.stroke(); X.restore();
      for (let j = 0; j < 5; j++) tokCube(x + 30, tokY(j), 74, TOKS[((k * 5 + j) % TOKS.length + TOKS.length) % TOKS.length], col, 1, x + 400, tokY(j) - 200);
      txt('L' + String(((k % 96) + 96) % 96 + 1).padStart(2, '0'), x + 30, 20, 30, col, { font: 'Orbitron' });
      if (lit > .5) glow(x + 30, 540, 300, col, .25 * lit);
    }
    // him, diving right like a superhero (rotation is about the hips)
    const k = 7, hipX = heroX - 120, hipY = 530 + wob(t, 1.2) * 14, pose = { view: 'side', aR: [3.05, 0], aL: [2.85, .15], lL: [-.12, .25], lR: [.15, .5], rot: Math.PI / 2 + .1 + wob(t, .8) * .04, eyes: 'determined', mouth: 'grin', brows: 'angry', chrome: 1, hairWind: 2 };
    for (let i = 3; i >= 1; i--) hero(hipX - i * 90, hipY + 46 * k, 100 * k, { ...pose, silhouette: [PAL.nViolet, PAL.nMagenta, PAL.nCyan][i - 1], alpha: .22 * (1 - i / 4) });
    hero(hipX, hipY + 46 * k, 100 * k, pose);
    FX.blur = Math.max(FX.blur, 10); FX.blurAng = 0;
  }

  // ======================================================================================
  // THE SHOGGOTH (b96–104)
  // ======================================================================================
  const SEYES = [[.52, -.4, .17], [-.55, -.22, .16], [.6, .28, .15], [-.35, .5, .14], [.12, .64, .12], [-.74, .2, .11], [.8, -.08, .1], [-.12, -.72, .13]];
  function latentBg(t, cx, cy, z) {
    vgrad(0, 0, W, H, [[0, '#07040F'], [.55, '#170B34'], [1, '#2A1648']]);
    camBegin(cx, cy, 1 + (z - 1) * .25);
    // perspective grid floor
    X.save(); X.strokeStyle = 'rgba(155,92,255,.2)'; X.lineWidth = 2; X.beginPath();
    for (let i = -14; i <= 14; i++) { X.moveTo(960 + i * 40, 700); X.lineTo(960 + i * 380, 1500); }
    for (let r = 0; r < 8; r++) { const yy = 700 + Math.pow(r / 8 + frac(t * .3) / 8, 2) * 800; X.moveTo(-800, yy); X.lineTo(W + 800, yy); }
    X.stroke(); X.restore();
    // embedding clusters
    const cl = [[380, 300, PAL.nCyan], [1600, 250, PAL.nMagenta], [1400, 860, PAL.nYellow], [300, 820, PAL.nGreen], [900, 120, PAL.nViolet]];
    X.save(); X.globalCompositeOperation = 'lighter';
    cl.forEach(([ccx, ccy, col], c) => { X.fillStyle = col; for (let i = 0; i < 44; i++) { const a = hash(i * 3 + c * 50) * TAU + t * .12 * (c % 2 ? 1 : -1), r = Math.sqrt(hash(i * 7 + c * 30)) * 230, s = 3 + 5 * hash(i * 11 + c); X.globalAlpha = .35 + .4 * hash(i + c); X.fillRect(ccx + Math.cos(a) * r, ccy + Math.sin(a) * r * .7, s, s); } });
    X.restore();
    camEnd();
  }
  // eyes opening one per beat: eye i opened (sinceI) seconds ago (< 0: still closed)
  function shogEyes(x, y, s, sinceI, look = [0, 0]) {
    SEYES.forEach(([dx, dy, rr], i) => {
      const ex = x + dx * s, ey = y + dy * s, er = rr * s, si = sinceI(i), col = i % 2 ? PAL.nMagenta : PAL.nCyan;
      if (si < 0) { line([[ex - er, ey], [ex, ey + er * .35], [ex + er, ey]], clamp(er / 12, 1, 3), '#5A3A8A', .6); return; }
      const o = backOut(clamp(si * 7)), blink = frac(T * .35 + hash(i)) < .04 ? .12 : 1;
      paint(ellPts(ex, ey, er, er * .85 * o * blink, 18), { fill: '#FFF6E6', ink: PAL.line, sw: clamp(er / 10, 1, 3.5), flat: true });
      if (o * blink > .3) { const px = ex + look[0] * er * .35, py = ey + look[1] * er * .3; paint(ellPts(px, py, er * .42, er * .48 * Math.min(1, o), 12), { fill: col, ink: null, flat: true }); paint(ellPts(px, py, er * .18, er * .22, 8), { fill: PAL.void, ink: null, flat: true }); paint(ellPts(px - er * .18, py - er * .2, er * .12, er * .1, 6), { fill: '#FFFFFF', ink: null, flat: true }); }
      glow(ex, ey, er * 2.8, col, .4 * Math.min(1, o) + .5 * Math.exp(-si * 5));
    });
  }
  function shogReveal(t, lt, dur) {
    style(1);
    const sx = 1180, sy = 520, s = 300, mx = sx, my = sy - s * .1;
    const pb = easeInOut(clamp(lt / (1.7 * BEAT))), z = lerp(3.4, 1, pb) * (1 - .03 * clamp((lt - 1.7 * BEAT) / (dur - 1.7 * BEAT)));
    const cx = lerp(mx, 960, pb), cy = lerp(my, 540, pb);
    latentBg(t, cx, cy, z);
    camBegin(cx, cy, z, (1 - pb) * .06);
    const wave = clamp((lt - 3 * BEAT) / .1);
    // the tentacle that waves back at him (b99)
    tentacle(sx - s * .75, sy + s * .4, Math.PI * .9, 540, 58, lt * (2 + 10 * wave), 7, { amp: .3 + 1.1 * wave, curl: .2, rim: PAL.nCyan });
    shoggoth(sx, sy, s, { t: onTwos(t), reach: .75, tent: 10, eyesN: 0, seed: 2, mood: { eyes: lt > 2.5 * BEAT ? 'happy' : 'open', mouth: 'grin', look: [-.6, .2] } });
    shogEyes(sx, sy, s, i => lt - i * BEAT, [-.6, .3]);
    // he floats in front, small, and waves (b98)
    const waveH = lt > 2 * BEAT, fy = 900 + wob(t, .5) * 18;
    hero(430, fy + 40, 420, { view: 'q', ...POSES.float, ...(waveH ? { aR: [2.75, .6 + .55 * Math.sin(lt * 22)] } : {}), eyes: waveH ? 'happy' : 'wide', mouth: waveH ? 'grin' : 'O', brows: 'up', chrome: 1, rot: -.08 + wob(t, .4) * .05, hairWind: wob(t, 1.3) * 2, rimCol: PAL.nCyan });
    camEnd();
  }
  function climb(t, lt, dur) {
    style(1);
    const bi = Math.min(3, BI(lt)), hit = hitK(lt), bs = BF(lt) * BEAT, snapK = backOut(clamp(bs / .12));
    // the camera tilts up with him: hanging below (b100–101) → standing on top (b102–103)
    const cy = bi === 0 ? 860 + wob(t, .8) * 8 : bi === 1 ? lerp(860, 810, snapK) : bi === 2 ? lerp(810, 330, snapK) : 330 - (bs * 30);
    latentBg(t, 960, lerp(540, cy, .35), 1);
    camBegin(960, cy, 1.02 + lt * .015, 0);
    // the shoggoth watches from the right
    const sx = 1480, sy = 380, s = 380;
    shoggoth(sx, sy, s, { t: onTwos(t), reach: .45, tent: 8, eyesN: 0, seed: 3, maskAt: [-s * .12, -s * .05], mood: { eyes: bi >= 2 ? 'happy' : 'open', mouth: 'grin', look: [-.8, .4] } });
    shogEyes(sx, sy, s, i => lt + 4 * BEAT - i * BEAT, [-.8, .5]);
    // the big tentacle he climbs, reaching out of the body to the left
    const sp = bezSpine([1320, 520], [1050, 640], [500, 560], [-60, 660], 30, 16, t * 3, 1.1);
    const wF = u => 125 * (1 - .65 * u);
    tentBody(sp, wF, { rim: PAL.nMagenta, up: -1, edge: PAL.nMagenta });
    const at = spineAt(sp, .5), w = wF(.5), nUp = at.n[1] < 0 ? at.n : [-at.n[0], -at.n[1]];
    const top = [at.p[0] + nUp[0] * w * .85, at.p[1] + nUp[1] * w * .85], under = [at.p[0] - nUp[0] * w * .7, at.p[1] - nUp[1] * w * .7], h = 500, k = h / 100;
    let o, gx, gy;
    if (bi === 0) { o = { view: 'front', aL: [2.9, .15], aR: [2.9, .15], lL: [.2, .3 + .25 * wob(t, 3)], lR: [-.1, .2 + .25 * wob(t, 3, .5)], eyes: 'wide', mouth: 'O', brows: 'up', rot: wob(t, 1.2) * .05 }; gx = under[0]; gy = under[1] + 101 * k; }
    else if (bi === 1) { o = { view: 'front', aL: [1.9, 1.1], aR: [1.9, 1.1], lL: [1.2, 1.9], lR: [.8, 1.6], eyes: 'determined', mouth: 'teeth', brows: 'angry', sq: .08 * (1 - snapK) }; gx = under[0]; gy = under[1] + lerp(101, 88, snapK) * k; }
    else if (bi === 2) { o = { view: 'side', flip: true, aL: [1.2, .4], aR: [.5, .6], lL: [.9, 1.6], lR: [.3, 1.1], lean: .25, eyes: 'determined', mouth: 'grin', sq: .06 * (1 - snapK) }; gx = top[0]; gy = top[1] + 12 * k; }
    else { o = { view: 'q', flip: true, aL: [.4, .6], aR: [2.8, .25], lL: [.25, .3], lR: [-.2, .2], eyes: 'happy', mouth: 'grin', blush: .6 }; gx = top[0]; gy = top[1] + 2 * k - 26 * Math.sin(Math.PI * clamp(bs / .2)); }
    hero(gx, gy, h, { ...o, chrome: 1, hairWind: wob(t, 1.4) * 2, rimCol: PAL.nCyan });
    if (bi === 3) { const px = gx - 14 * k, py = gy - 112 * k; glow(px, py, 130, PAL.nYellow, .6 * hit); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r0 = 40 + 60 * (1 - hit), r1 = r0 + 70 * hit; neonLine([[px + Math.cos(a) * r0, py + Math.sin(a) * r0], [px + Math.cos(a) * r1, py + Math.sin(a) * r1]], PAL.nYellow, 4, hit, 0); } }
    camEnd();
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
    tentBody(sp, v => lerp(14, 95 * sc + 10, v), { rim: PAL.nMagenta, up: -1, edge: PAL.nMagenta, col: '#231244' });
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
    tentBody(sp, wS, { rim: PAL.nMagenta, up: -1, edge: PAL.nMagenta, col: '#231244' });
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
    tentBody(sp, u => 14 + 560 * u * u, { rim: PAL.nMagenta, up: 1, edges: PAL.nMagenta, col: '#3A1C70', dk: '#1E0E40' });
    const at = spineAt(sp, .6);
    hero(at.p[0], at.p[1] + 20 - hit * 12, 640, { view: 'front', aL: [1.45, .25 + .1 * wob(t, 2)], aR: [1.55, -.2], lL: [.5, .6], lR: [.5, .55], eyes: 'happy', mouth: 'grin', blush: .5, chrome: 1, hairWind: wob(t, 3) * 3, rimCol: PAL.nCyan, rot: wob(t, .9, .25) * .07 });
  }

  // ======================================================================================
  // VERIFICATION BOTTLENECK (b112–120): one stamp per beat, alternating angles
  // ======================================================================================
  const STAMPS = [['PASS', PAL.nGreen], ['PASS', PAL.nGreen], ['FAIL', PAL.nRed], ['PASS', PAL.nGreen], ['???', PAL.nYellow], ['PASS', PAL.nGreen], ['PASS', PAL.nGreen], ['LGTM', PAL.nCyan]];
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
        mask(-380, -470, 48, { eyes: 'happy', mouth: 'smile', glow: 0 });
        txt('OUTPUT #' + (0x1A3F + i * 0x2B1).toString(16).toUpperCase(), -300, -470, 50, '#3A3260', { font: 'Orbitron', align: 'left' });
        X.fillStyle = '#9A92C0';
        for (let r = 0; r < 12; r++) X.fillRect(-400, -360 + r * 62, 300 + 480 * hash(r * 5 + i * 3), 20);
        emdash(250, -360 + 4 * 62 + 10, 1.6, 0, { seed: i });
        X.restore();
        // the imprint + ink splats
        stamp(960, 560, 2.4, word, col, 1, { rot: rot - .1 });
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
    [bt(96), shogReveal, { tin: 'flash' }],
    [bt(100), climb],
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
  POSTCARDS.shoggoth = t => shogReveal(t, 1.15, 4 * BEAT);
})();
