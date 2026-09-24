// src/ch/c03_city.js: Act III · Neon Megacity (b136–b200, 46.65–68.59 s). Full neon.
// Rain street → TV wall → data centre → GPUs go brrr → parrot → strawberry → upgrade clinic → monorail → Moloch → paperclips → the moon is a mask.
// v2: meme billboards (neonPanel/tubeText, exported on SHARED), 'Thinking…' on the monorail, the parrot's next-token line,
// and the moon turning into the real mask() (his lopsided pale-yellow one) with the shared tentacle() rising around it.
(() => {
  const B = n => bt(n);
  const NC = [PAL.nMagenta, PAL.nCyan, PAL.nYellow, PAL.nOrange, PAL.nGreen, PAL.nViolet];
  const SIGN_WORDS = ['GPU', 'TOKENS', '推論', 'DELVE', '月へ', 'ネオン', 'Q*', 'RLHF', '24/7', 'LOSS↓', 'MoE', 'ロボ', 'CoT', 'AGI?', '夜', 'EVALS'];
  const isJP = s => /[^\x00-\x7F↓]/.test(s);

  // ---------- private helpers ----------
  // cheap neon lettering: coloured outline + white core (the bloom does the halo)
  function ntxt(s, x, y, size, col, o = {}) {
    txt(s, x, y, size, o.core || '#FFFFFF', { font: o.font || (isJP(s) ? 'JP' : 'Orbitron'), stroke: col, sw: size * (o.sw ?? .14), alpha: o.alpha ?? 1, rot: o.rot, align: o.align, track: o.track, pop: o.pop, weight: o.weight });
  }
  // a front-view walk (toward camera): legs foreshorten as they lift, body bobs, small sway
  function frontWalk(ph, amt = 1) {
    const s = Math.sin(ph * TAU), c = Math.cos(ph * TAU), L = Math.max(0, s), R = Math.max(0, -s);
    return { lL: [L * .7 * amt, L * 1.1 * amt], lR: [R * .7 * amt, R * 1.1 * amt], aL: [.07 + .05 * s, .3 + .6 * R], aR: [.07 - .05 * s, .3 + .6 * L], dy: -Math.abs(c) * 9 * amt, rot: s * .03 * amt, tilt: -s * .04 };
  }
  // look vector from a point toward a target (for masks that follow him)
  const lookAt = (x, y, tx, ty, k = 500) => [clamp((tx - x) / k, -1, 1), clamp((ty - y) / k, -1, 1)];
  // a screen with the smiley on it (billboards, TVs, phones)
  function maskScreen(x, y, w, h, o = {}) {
    const col = o.col || PAL.nCyan, A = o.alpha ?? 1;
    X.globalAlpha = A; X.fillStyle = o.bg || '#140A2C'; X.fillRect(x, y, w, h);
    const g = X.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * .7);
    g.addColorStop(0, rgba(o.bgGlow || '#5A2A9A', .9 * A)); g.addColorStop(1, rgba('#140A2C', 0)); X.fillStyle = g; X.fillRect(x, y, w, h);
    X.globalAlpha = 1;
    const r = Math.min(w, h) * (o.r ?? .36);
    if (A > .02) mask(x + w / 2 + (o.mx || 0) * w, y + h / 2 + (o.my || 0) * h, r, { eyes: o.eyes || 'open', mouth: o.mouth || 'smile', look: o.look, tilt3d: o.tilt3d || 0, glow: o.glow ?? .3, alpha: A, eyeGlow: o.eyeGlow, sweat: o.sweat });
    // scanlines
    if (o.scan !== false) { X.globalAlpha = .18 * A; X.fillStyle = '#000'; const st = Math.max(3, h / 40); for (let yy = y; yy < y + h; yy += st) X.fillRect(x, yy, w, st * .45); X.globalAlpha = 1; }
    if (o.frame !== false) { paint(rectPts(x, y, w, h), { ink: PAL.line, sw: Math.max(1, w / 120), alpha: A }); neonLine(rectPts(x - 2, y - 2, w + 4, h + 4), col, Math.max(1.2, w / 140), .9 * A, 0, true); }
  }
  // rain splash rings on a floor band
  function splashes(t, n, x0, x1, y0, y1, seed = 1, col = '#BFF6FF', a = .5) {
    X.save(); X.strokeStyle = col; X.lineWidth = 1.6;
    for (let i = 0; i < n; i++) {
      const per = .45 + hash(i * 3 + seed) * .3, ph = frac(t / per + hash(i + seed)), cyc = Math.floor(t / per + hash(i + seed));
      const x = lerp(x0, x1, hash(i * 7 + cyc * 13 + seed)), yk = hash(i * 11 + cyc * 5 + seed), y = lerp(y0, y1, yk), sc = .4 + yk;
      X.globalAlpha = a * (1 - ph); X.beginPath(); X.ellipse(x, y, (4 + ph * 26) * sc, (1.5 + ph * 7) * sc, 0, 0, TAU); X.stroke();
    }
    X.restore();
  }
  // heavy foreground rain: long bright streaks + the shared rain layer
  function rainFG(t, o = {}) {
    rain(t, { n: o.n ?? 150, ang: o.ang ?? .12, len: o.len ?? 46, alpha: o.alpha ?? .4, col: o.col || '#A8F0FF' });
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = o.col2 || '#DFFBFF'; X.lineWidth = 3; X.globalAlpha = (o.alpha ?? .4) * .45; X.beginPath();
    const ang = o.ang ?? .12;
    for (let i = 0; i < (o.big ?? 18); i++) { const sp = 2600 + hash(i * 5) * 900, x = (hash(i * 9 + 3) * (W + 400) + t * sp * Math.sin(ang)) % (W + 400) - 200, y = (hash(i * 13) * (H + 400) + t * sp) % (H + 400) - 200; X.moveTo(x, y); X.lineTo(x - Math.sin(ang) * 130, y - Math.cos(ang) * 130); }
    X.stroke(); X.restore();
  }
  // soft puff of steam (vents, manholes). k: 0..1 life
  function steam(x, y, s, k, a = .5, col = '#C9B8FF') {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 4; i++) {
      const kk = clamp(k * 1.15 - i * .07), r = s * (.32 + kk * .95) * (1 + i * .16), yy = y - kk * s * 1.8 - i * s * .22, xx = x + Math.sin(i * 2.1 + k * 3) * s * .35;
      const g = X.createRadialGradient(xx, yy, 0, xx, yy, r); g.addColorStop(0, rgba(col, a * (1 - kk) * .55)); g.addColorStop(.6, rgba(col, a * (1 - kk) * .25)); g.addColorStop(1, rgba(col, 0));
      X.fillStyle = g; X.fillRect(xx - r, yy - r, 2 * r, 2 * r);
    }
  }
  // vertical reflection streak on a wet floor (additive)
  function refl(x, y, w, len, col, a = .35) {
    len = Math.min(len, 520); if (len <= 2 || a <= .01) return;
    const g = X.createLinearGradient(0, y, 0, y + len); g.addColorStop(0, rgba(col, a)); g.addColorStop(.25, rgba(col, a * .5)); g.addColorStop(1, rgba(col, 0));
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = g;
    // rippled rows: each row shifts sideways and narrows a little → a wobbly wet streak
    const step = Math.max(3, len / 60);
    for (let yy = 0, i = 0; yy < len; yy += step, i++) {
      const k = yy / len, sh = Math.sin(i * .9 + T * 7 + x * .01) * w * .12 * (.3 + k), ww = w * (1 - k * .45) * (.8 + .2 * Math.sin(i * 2.3 + x));
      X.fillRect(x + (w - ww) / 2 + sh, y + yy, ww, step * .7);
    }
    X.restore();
  }

  // ---------- v2 neon signage: tube lettering + lit billboards that sit in the rain ----------
  // tubeText: coloured tube stroke + hot tinted core + a soft halo; o.dead/o.deadOff darkens one flickering letter
  function tubeText(s, x, y, size, col, o = {}) {
    const A = o.alpha ?? 1, font = o.font || 'Anton', core = o.core || mixCol(col, '#FFFFFF', .74), align = o.align || 'center';
    if (A <= .01 || size < 3) return;
    if (o.glow !== false) txt(s, x, y, size, col, { font, glow: col, alpha: A * .5 * (o.glowK ?? 1), align });
    txt(s, x, y, size, core, { font, stroke: col, sw: size * (o.sw ?? .1), alpha: A, align, rot: o.rot });
    if (o.dead != null && o.deadOff) {
      const w = txtW(s, size, font), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      txt(s[o.dead], x0 + txtW(s.slice(0, o.dead), size, font), y, size, '#2C2240', { font, stroke: '#140E22', sw: size * (o.sw ?? .1), alpha: A, align: 'left' });
    }
  }
  // neonPanel(x, y, w, h, lines, o): a lit billboard centred at (x, y): metal housing, dark panel with a coloured wash,
  // an inner tube border, auto-fitted tube lettering. lines: strings or {s, k (relative line height), col, font, dead}.
  // o: col, frame, font, t, seed, alpha, spill, icon(cx, cy, s, on) drawn in a square on the left, flickP
  function neonPanel(x, y, w, h, lines, o = {}) {
    const A = o.alpha ?? 1; if (A <= .01 || w < 8 || h < 8) return;
    const col = o.col || PAL.nCyan, frame = o.frame || col, font = o.font || 'Anton', seed = o.seed || 1, t = o.t ?? T;
    const on = hash(seed * 13.7 + Math.floor(t * 14)) < (o.flickP ?? .035) ? .45 : 1;
    const bx = x - w / 2, by = y - h / 2, m = Math.min(w, h), e = m * .065;
    if (o.spill !== 0) glow(x, y, Math.max(w, h) * .85, col, .2 * (o.spill ?? 1) * A * on);
    paint(rrPts(bx - e, by - e, w + 2 * e, h + 2 * e, e), { fill: o.housing || '#231A3C', shade: '#0E0A1C', rim: o.rim || '#6A5AAA', ink: PAL.line, sw: clamp(m / 70, 1, 3.5), alpha: A });
    X.save(); X.globalAlpha = A;
    const g = X.createLinearGradient(0, by, 0, by + h); g.addColorStop(0, o.panel || '#170C30'); g.addColorStop(1, '#07040F'); X.fillStyle = g; X.fillRect(bx, by, w, h);
    X.globalCompositeOperation = 'lighter';
    const rg = X.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * .6); rg.addColorStop(0, rgba(col, .22 * on)); rg.addColorStop(1, rgba(col, 0)); X.fillStyle = rg; X.fillRect(bx, by, w, h);
    X.restore();
    neonLine(rrPts(bx + e * .55, by + e * .55, w - e * 1.1, h - e * 1.1, e * .5), frame, clamp(m / 80, 1, 4.5), .85 * A * on, 0, true);
    if (m > 60) { X.fillStyle = '#8A80B0'; X.globalAlpha = A; for (const [qx, qy] of [[bx - e * .5, by - e * .5], [bx + w + e * .5, by - e * .5], [bx - e * .5, by + h + e * .5], [bx + w + e * .5, by + h + e * .5]]) { X.beginPath(); X.arc(qx, qy, Math.max(1.5, e * .18), 0, TAU); X.fill(); } X.globalAlpha = 1; }
    const L = lines.map(l => typeof l === 'string' ? { s: l } : l), sumK = L.reduce((a, l) => a + (l.k ?? 1), 0);
    const ix = o.icon ? h * .78 : 0, availW = (w - ix) * .86, availH = h * .74, unit = availH / sumK;
    let yy = by + (h - availH) / 2;
    L.forEach((l, i) => {
      const f = l.font || font, lh = unit * (l.k ?? 1), size = Math.min(lh * (f === 'Anton' ? .92 : .8), availW / (txtW(l.s, 100, f) / 100));
      tubeText(l.s, x + ix / 2, yy + lh / 2 + size * .03, size, l.col || col, { font: f, alpha: A * on, dead: l.dead, deadOff: l.dead != null && hash(seed * 3.1 + i + Math.floor(t * 11)) < .4 });
      yy += lh;
    });
    if (o.icon) o.icon(bx + e + ix * .5, y, h * .62, on);
  }
  SHARED.neonPanel = neonPanel; SHARED.tubeText = tubeText;

  // ---------- perspective street (shot 1a) ----------
  const PV = { f: 900, vx: 960, vy: 470, cx: 0, cy: -170, cz: 0 };
  const pj = (x, y, z) => { const d = Math.max(20, z - PV.cz), s = PV.f / d; return [PV.vx + (x - PV.cx) * s, PV.vy + (y - PV.cy) * s, s]; };
  const STREET = [-1, 1].map(side => {
    const out = []; let z = -700;
    for (let i = 0; i < 22; i++) {
      const id = i * 7 + (side > 0 ? 300 : 0) + 11, len = 240 + hash(id) * 260, far = z > 1900;
      const h = far ? 380 + hash(id * 1.7) * 520 : 1300 + hash(id * 1.7) * 1600;
      const b = { z0: z, z1: z + len, h, xi: side * (560 + hash(id * 2.3) * 50), id, side, col: mixCol('#1A0F36', '#2A1850', hash(id * 8.1)) };
      if (hash(id * 3.1) < .8 && !((side < 0 && (i === 1 || i === 4)) || (side > 0 && (i === 2 || i === 5)))) b.sign = { y: 200 + hash(id * 4.3) * 300, h: 300 + hash(id * 5.1) * 220, w: 90 + hash(id * 5.9) * 40, col: NC[Math.floor(hash(id * 6.7) * 5)], s: (i >= 2 && i < 6 ? (side < 0 ? ['GPU', 'e/acc', 'ネオン', '24/7'] : ['月へ', '推論', 'TOKENS', 'API'])[i - 2] : SIGN_WORDS[Math.floor(hash(id * 7.3) * SIGN_WORDS.length)]), dz: 30 + hash(id * 9.1) * (len - 60) };
      if ((side < 0 && (i === 1 || i === 4)) || (side > 0 && (i === 2 || i === 5))) b.bill = { y: 330 + hash(id) * 160, w: 300, h: 230 };
      out.push(b);
      z += len + 30 + hash(id * 6.1) * 80;
    }
    return out;
  });
  // v2: two big jutting billboards over the street (camera-facing, so they stay legible) + meme blade signs
  {
    const [L, R] = STREET;
    delete L[2].sign; L[2].meme = { dz: 200, gap: 30, w: 400, y0: 270, y1: 540, lines: ['ATTENTION IS', 'ALL YOU NEED'], col: PAL.nCyan, frame: PAL.nMagenta };
    L[3].sign = { y: 230, h: 470, w: 110, col: PAL.nYellow, s: 'GPU', dz: 110 };
    L[5].sign = { y: 260, h: 420, w: 110, col: PAL.nGreen, s: 'e/acc', dz: 200 };
    delete R[3].sign; R[3].meme = { dz: 90, gap: 60, w: 380, y0: 340, y1: 615, lines: ['SCALE IS', 'ALL YOU NEED'], col: PAL.nPink, frame: PAL.nYellow };
    R[4].sign.s = 'TOKENS';
    R[2].bill.y += 110;   // the near smiley screen sits above the SCALE board
  }
  const FAR =Array.from({ length: 16 }, (_, i) => ({ x: -2600 + i * 330 + hash(i * 4.4) * 60, w: 300 + hash(i * 2.2) * 120, h: 260 + hash(i * 3.3) * 700, z: 4600 + hash(i * 1.1) * 900 }));

  function streetScene(t, o) {
    const { hz, cz } = o; PV.cz = cz;
    // sky + moon
    vgrad(0, 0, W, H, [[0, '#06030E'], [.3, '#150A30'], [.43, '#3A1156'], [.5, '#5E1A66'], [.62, '#1C0C34'], [1, '#07040F']]);
    stars(t, 40, { ext: [W, 360], seed: 5 });
    const mX = 960, mY = 285, mR = 250;
    moon(mX, mY, mR, { halo: '#FFD9A8' });
    // far skyline across the end of the street (silhouettes with a few windows)
    for (const f of FAR) {
      const [x0, y0] = pj(f.x, -f.h, f.z), [x1, y1] = pj(f.x + f.w, 0, f.z);
      X.fillStyle = '#12092A'; X.fillRect(x0, y0, x1 - x0, y1 - y0 + 2);
      X.fillStyle = hash(f.x) < .5 ? '#FF6FB5' : '#7FF3FF'; X.globalAlpha = .7;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) if (hash(f.x + r * 7 + c * 3) < .3) X.fillRect(x0 + (c + .5) / 4.5 * (x1 - x0), y0 + (r + 1) * 9, 2, 3);
      X.globalAlpha = 1;
    }
    // wet street floor
    const [, gy] = pj(0, 0, 6000);
    vgrad(0, gy, W, H - gy, [[0, '#4A1A5E'], [.08, '#24103E'], [.35, '#120826'], [1, '#07040F']]);
    // moon reflection (a long broken streak)
    refl(mX - 120, gy + 2, 240, 560, '#FFE9C0', .5);
    refl(mX - 40, gy + 2, 80, 620, '#FFFFFF', .35);
    // curbs + lane dashes
    for (const sx of [-1, 1]) { const a = pj(sx * 330, 0, cz + 60), b = pj(sx * 330, 0, 6000); neonLine([[a[0], a[1]], [b[0], b[1]]], sx < 0 ? PAL.nMagenta : PAL.nCyan, 2, .45, 0); }
    X.fillStyle = 'rgba(245,240,58,.55)';
    for (let k = 0; k < 40; k++) { const z = Math.floor((cz + 60) / 220) * 220 + k * 220; if (z < cz + 60) continue; const a = pj(-6, 0, z), b = pj(6, 0, z + 110); if (b[1] < gy) break; X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); X.lineTo(pj(-6, 0, z + 110)[0], b[1]); X.lineTo(pj(6, 0, z)[0], a[1]); X.fill(); }
    // buildings back to front, both sides interleaved by depth
    const all = STREET[0].concat(STREET[1]).filter(b => b.z1 > cz + 30).sort((a, b) => b.z0 - a.z0);
    const lights = [];
    for (const b of all) drawBldg(t, b, cz, lights);
    // sign reflections on the floor (under everything that stands on it)
    for (const L of lights) refl(L.x, L.gy, L.w, L.len, L.col, L.a);
    return { mX, mY, mR, gy };
  }
  function drawBldg(t, b, cz, lights) {
    const z0 = Math.max(b.z0, cz + 40), z1 = b.z1; if (z1 <= z0) return;
    const xi = b.xi, sd = b.side, out = xi + sd * 1400;
    // front face (facing camera) — the stepped skyline between buildings
    if (b.z0 >= cz + 40) { const f0 = pj(xi, -b.h, z0), f1 = pj(out, 0, z0); X.fillStyle = mixCol(b.col, '#07040F', .35); X.fillRect(Math.min(f0[0], f1[0]), f0[1], Math.abs(f1[0] - f0[0]), f1[1] - f0[1]); }
    // facade quad along the street
    const q = [pj(xi, 0, z0), pj(xi, -b.h, z0), pj(xi, -b.h, z1), pj(xi, 0, z1)];
    X.fillStyle = b.col; X.beginPath(); q.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); X.fill();
    X.strokeStyle = PAL.line; X.lineWidth = 2; X.stroke();
    // roof neon rim
    if (hash(b.id * 9) < .6) neonLine([[q[1][0], q[1][1]], [q[2][0], q[2][1]]], hash(b.id) < .5 ? PAL.nMagenta : PAL.nCyan, 2, .8, 0);
    // windows: one path per colour
    const cols = 5, rh = 70, rows = Math.floor((b.h - 60) / rh), s0 = pj(xi, 0, z0)[2];
    if (s0 * 20 > 1.2) {
      for (const [ci, wc] of [[0, '#FFD86B'], [1, '#7FF3FF'], [2, '#FF6FB5']]) {
        X.fillStyle = wc; X.globalAlpha = .75; X.beginPath();
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const hv = hash(b.id * 31 + r * 7 + c * 3); if (hv > .42 || Math.floor(hv * 30) % 3 !== ci) continue;
          const za = lerp(b.z0, b.z1, (c + .25) / cols), zb = lerp(b.z0, b.z1, (c + .7) / cols); if (za < z0) continue;
          const ya = -(60 + r * rh), yb = ya - 34;
          const p1 = pj(xi, ya, za), p2 = pj(xi, yb, za), p3 = pj(xi, yb, zb), p4 = pj(xi, ya, zb);
          X.moveTo(p1[0], p1[1]); X.lineTo(p2[0], p2[1]); X.lineTo(p3[0], p3[1]); X.lineTo(p4[0], p4[1]); X.closePath();
        }
        X.fill();
      }
      X.globalAlpha = 1;
    }
    // blade sign sticking into the street (faces the camera → a plain rectangle)
    if (b.sign) {
      const S = b.sign, zs = b.z0 + S.dz; if (zs > cz + 60) {
        const a = pj(xi, -(S.y + S.h), zs), c = pj(xi - sd * S.w, -S.y, zs), x0 = Math.min(a[0], c[0]), w = Math.abs(c[0] - a[0]), h = c[1] - a[1];
        const fl = hash(b.id + Math.floor(t * 9)) < .05 ? .35 : 1;
        glow(x0 + w / 2, a[1] + h / 2, Math.max(w, h) * .8, S.col, .22 * fl);
        X.fillStyle = '#0A0614'; X.fillRect(x0, a[1], w, h);
        neonLine(rectPts(x0, a[1], w, h), S.col, Math.max(1, w * .045), fl, 0, true);
        const ch = [...S.s].slice(0, 6), vt = Math.max(a[1], 70), vh = c[1] - vt, fs = Math.min(w * .62, vh / (ch.length + .6));
        if (fs > 4) ch.forEach((cc, j) => ntxt(cc, x0 + w / 2, vt + vh * (j + .8) / (ch.length + .6), fs, S.col, { alpha: fl }));
        const g0 = pj(0, 0, zs)[1];
        lights.push({ x: x0, gy: g0 + 2, w, len: (g0 - a[1]) * 1.1, col: S.col, a: .3 * fl });
      }
    }
    // v2: a big meme billboard jutting out over the street on two brackets
    if (b.meme) {
      const M = b.meme, zs = b.z0 + M.dz; if (zs > cz + 60) {
        const a = pj(xi - sd * M.gap, -M.y1, zs), c = pj(xi - sd * (M.gap + M.w), -M.y0, zs), x0 = Math.min(a[0], c[0]), w = Math.abs(c[0] - a[0]), h = c[1] - a[1];
        for (const hy of [M.y0 + (M.y1 - M.y0) * .18, M.y0 + (M.y1 - M.y0) * .82]) { const p1 = pj(xi, -hy, zs + 40), p2 = pj(xi - sd * (M.gap + 40), -hy, zs); line([[p1[0], p1[1]], [p2[0], p2[1]]], Math.max(1, 5 * p2[2]), '#2E2450', 0); }
        neonPanel(x0 + w / 2, a[1] + h / 2, w, h, M.lines, { col: M.col, frame: M.frame, t, seed: b.id });
        // rain dripping off the bottom edge
        X.save(); X.strokeStyle = 'rgba(200,245,255,.55)'; X.lineWidth = 1.5; X.beginPath();
        for (let i = 0; i < 7; i++) { const u = (i + .5) / 7, k = frac(t * 1.7 + hash(i * 3 + b.id)), dx = x0 + u * w, dy = c[1] + 8 + k * 160 * a[2]; X.moveTo(dx, dy); X.lineTo(dx, dy + 12 * a[2]); }
        X.stroke(); X.restore();
        const g0 = pj(0, 0, zs)[1];
        lights.push({ x: x0 + w * .1, gy: g0 + 2, w: w * .8, len: (g0 - a[1]) * 1.15, col: M.col, a: .32 });
      }
    }
    // big billboard with the smiley (follows the hero)
    if (b.bill) {
      const Bb = b.bill, zs = b.z0 + 40; if (zs > cz + 60) {
        const a = pj(xi, -(Bb.y + Bb.h), zs), c = pj(xi - sd * Bb.w, -Bb.y, zs), x0 = Math.min(a[0], c[0]), w = Math.abs(c[0] - a[0]), h = c[1] - a[1];
        const lk = lookAt(x0 + w / 2, a[1] + h / 2, HERO_AT[0], HERO_AT[1], 700);
        glow(x0 + w / 2, a[1] + h / 2, w * .9, PAL.nYellow, .14 + .16 * pulse(T, 5));
        maskScreen(x0, a[1], w, h, { look: lk, tilt3d: lk[0] * .5, col: sd < 0 ? PAL.nMagenta : PAL.nCyan, eyes: HERO_AT[2] || 'open', mouth: HERO_AT[3] || 'smile' });
        const g0 = pj(0, 0, zs)[1];
        lights.push({ x: x0 + w * .2, gy: g0 + 2, w: w * .6, len: (g0 - a[1]) * 1.05, col: PAL.nYellow, a: .22 });
      }
    }
  }
  let HERO_AT = [960, 500];   // where the billboards look (set per frame by the shot before drawing the set)

  // pedestrians with neon umbrellas (dark silhouettes)
  function walkers(t, lt, cz, list) {
    const items = list.map((p, i) => { const z = p.z + p.v * lt; return { ...p, z, i }; }).filter(p => p.z > cz + 120).sort((a, b) => b.z - a.z);
    for (const p of items) {
      const [x, y, s] = pj(p.x, 0, p.z), h = 176 * s;
      const pose = p.v < 0 ? frontWalk(t * .75 + p.i * .3, .8) : frontWalk(t * .75 + p.i * .3, .8);
      hero(x, y, h, { view: p.v < 0 ? 'front' : 'back', ...pose, silhouette: '#0E0820', alpha: 1 });
      if (p.umb) {
        const ux = x + h * .02, uy = y - h * 1.08, ur = h * .42, col = p.umb;
        X.fillStyle = '#0E0820'; X.beginPath(); X.ellipse(ux, uy, ur, ur * .55, 0, Math.PI, TAU); X.fill();
        neonLine(Array.from({ length: 13 }, (_, k) => [ux + Math.cos(Math.PI + k / 12 * Math.PI) * ur, uy + Math.sin(Math.PI + k / 12 * Math.PI) * ur * .55]), col, Math.max(1, h * .012), .9, .3);
        X.strokeStyle = '#0E0820'; X.lineWidth = Math.max(1, h * .012); X.beginPath(); X.moveTo(ux, uy); X.lineTo(ux, uy + h * .4); X.stroke();
      }
    }
  }
  const PEDS = [
    { x: -250, z: 900, v: -60, umb: PAL.nCyan }, { x: 260, z: 1300, v: 50, umb: PAL.nMagenta }, { x: -300, z: 2000, v: 40 }, { x: 210, z: 2400, v: -70, umb: PAL.nYellow },
    { x: -180, z: 3000, v: -40, umb: PAL.nMagenta }, { x: 330, z: 650, v: -30 }, { x: 120, z: 3400, v: 60, umb: PAL.nCyan }];

  // ============ SHOTS ============
  // 1a · b136–140: the rain street. He walks toward camera, the camera trucks back, every billboard follows him.
  function street(t, lt, dur) {
    style(1);
    const cz = -300 - lt * 200, hz = cz + 282;
    PV.vx = 960; PV.vy = 452; PV.cy = -170; PV.cz = cz;
    const [hx, hy, hs] = pj(0, 0, hz), hh = 180 * hs;
    HERO_AT = [hx, hy - hh * .89, 'open', 'smile'];
    const S = streetScene(t, { cz });
    walkers(t, lt, cz, PEDS);
    // holo-ad: a translucent smiley floating over the street
    {
      const [x, y, s] = pj(0, -640, 1500), r = 150 * s, fl = hash(Math.floor(t * 14)) < .12 ? .4 : 1;
      // (drawn source-over: it sits in front of the blown-out moon, so it has to carry its own contrast)
      glow(x, y, r * 2, PAL.nCyan, .3 * fl);
      const lk = lookAt(x, y, HERO_AT[0], HERO_AT[1], 500);
      mask(x, y, r, { eyes: 'open', mouth: 'grin', look: lk, tilt3d: lk[0] * .6, col: '#7FF4FF', alpha: .82 * fl, glow: 0 });
      X.save(); tracePath(X, maskShape(r * 1.02).map(([px, py]) => [x + px, y + py])); X.clip();
      X.globalAlpha = .3 * fl; X.fillStyle = '#0A3A5A'; for (let yy = y - r * 1.3 + (t * 40) % 6; yy < y + r * 1.3; yy += 6) X.fillRect(x - r * 1.2, yy, r * 2.4, 2.5);
      X.restore(); X.globalAlpha = 1;
      glowPath(maskShape(r).map(([px, py]) => [x + px, y + py]), PAL.nCyan, Math.max(.4, r / 60), .2, .7 * fl);
      // projector beam from the street
      const [bx, by] = pj(0, 0, 1500); X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createLinearGradient(0, by, 0, y); g.addColorStop(0, rgba(PAL.nCyan, .25)); g.addColorStop(1, rgba(PAL.nCyan, 0)); X.fillStyle = g; X.beginPath(); X.moveTo(bx - 4, by); X.lineTo(x - r * .9, y + r * .6); X.lineTo(x + r * .9, y + r * .6); X.lineTo(bx + 4, by); X.fill(); X.restore();
    }
    // steam from a manhole
    { const [x, y, s] = pj(-160, 0, 1100); for (let i = 0; i < 3; i++) steam(x, y, 90 * s, frac(t * .5 + i / 3), .22); }
    splashes(t, 40, 0, W, S.gy + 30, H, 3);
    // the hero (rim-lit by the moon behind him)
    const wk = frontWalk(bpOf(t) / 2, 1.2);
    glow(hx, hy - hh * .55, hh * .7, '#FFE0B0', .12);
    hero(hx, hy, hh, { view: 'q', ...wk, eyes: 'open', lookY: -.3, lookX: Math.sin(lt * 2) * .5, mouth: 'flat', rimCol: '#FFD9A8', hairWind: Math.sin(t * 3) * .5 });
    // his reflection
    X.save(); X.translate(0, hy * 2); X.scale(1, -1); hero(hx, hy, hh, { view: 'q', ...wk, silhouette: '#6A3A9A', alpha: .25 }); X.restore();
    X.globalAlpha = 1;
    rainFG(t, { n: 170, alpha: .42 });
    FX.letterbox = .35;
  }


  // ---------- generic sets ----------
  // city() with the shared SIGNS list, minus the one real product name (restored right after the call)
  // v2: swaps in a curated list of short words while it draws (city()'s vertical signs cut words at 4 characters,
  // which turned 'p(doom)' into 'p(do'), then restores the shared list
  const CITY_WORDS = ['GPU', '推論', 'Q*', 'RLHF', 'CoT', 'MoE', 'ネオン', '月へ', '24/7', 'AGI?', 'SAE', 'ATTN', 'ロボ', '夜', 'FLOP', 'API', 'EVAL', 'DPO', '電脳', 'LoRA', 'KL', 'e/acc'];
  function cityX(t, o) {
    if (typeof SIGNS === 'undefined') { city(t, o); return; }
    const keep = SIGNS.slice(); SIGNS.length = 0; SIGNS.push(...CITY_WORDS);
    try { city(t, o); } finally { SIGNS.length = 0; SIGNS.push(...keep); }
  }
  // wet floor band from y0 down, with reflections [{x, w, col, a}] mirrored below y0
  function wetFloor(t, y0, refls = [], o = {}) {
    vgrad(0, y0, W, H - y0 + 20, o.stops || [[0, '#2A1244'], [.25, '#140A28'], [1, '#07040F']]);
    for (const r of refls) refl(r.x, y0 + 2, r.w, r.len ?? (H - y0), r.col, r.a ?? .3);
    if (o.splash !== false) splashes(t, o.nSplash ?? 36, 0, W, y0 + 20, H, o.seed || 7);
  }
  // integrated rotation angle (revolutions) for a spin rate that steps up on beats: rates[i] rev/s from beat n0 + i
  function spinAngle(t, n0, rates) {
    let a = 0; for (let i = 0; i < rates.length; i++) { const s0 = B(n0 + i), s1 = i === rates.length - 1 ? 1e9 : B(n0 + i + 1); if (t <= s0) break; a += (Math.min(t, s1) - s0) * rates[i]; }
    return a * TAU;
  }
  // small server rack front: LEDs batched per colour
  function rackMini(x, y, w, h, t, seed, k = 1) {
    X.fillStyle = '#0D0A1C'; X.fillRect(x, y, w, h);
    X.strokeStyle = '#3A2F6E'; X.lineWidth = 2; X.strokeRect(x, y, w, h);
    const rows = Math.floor((h - 8) / 13);
    X.fillStyle = '#1C1638'; for (let r = 0; r < rows; r++) X.fillRect(x + 3, y + 5 + r * 13, w - 6, 8);
    for (const [ci, col] of [[0, PAL.nGreen], [1, PAL.nCyan], [2, PAL.nMagenta]]) {
      X.fillStyle = col; X.beginPath();
      for (let r = 0; r < rows; r++) for (let j = 0; j < 4; j++) { const hv = hash(seed * 17 + r * 7 + j * 3 + Math.floor(t * 9 + r) * .37); if (hv < .55 * k && Math.floor(hv * 97) % 3 === ci) X.rect(x + 6 + j * (w - 12) / 4, y + 7 + r * 13, 4, 4); }
      X.fill();
    }
  }
  // a fan face (exhaust / GPU): blades swept, motion-smeared when fast. ang in radians, blur 0..1
  function fanFace(x, y, r, ang, blur, o = {}) {
    paint(ellPts(x, y, r, r, 36), { fill: o.housing || '#0B0716', ink: PAL.line, sw: Math.max(1, r / 40) });
    const nb = o.blades || 9, copies = blur > .05 ? 4 : 1;
    for (let c = 0; c < copies; c++) {
      const aOff = -c * (.1 + blur * .12), al = c === 0 ? 1 - blur * .55 : (1 - c / copies) * .45 * blur;
      X.fillStyle = o.blade || '#4A4470'; X.globalAlpha = al; X.beginPath();
      for (let b = 0; b < nb; b++) {
        const a0 = ang + aOff + b / nb * TAU;
        for (let u = 0; u <= 5; u++) { const q = u / 5, rr = lerp(r * .28, r * .92, q), aa = a0 + q * .55 - .16; if (!u) X.moveTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); else X.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); }
        for (let u = 5; u >= 0; u--) { const q = u / 5, rr = lerp(r * .28, r * .92, q), aa = a0 + q * .55 + .16 - q * .06; X.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); }
        X.closePath();
      }
      X.fill();
    }
    X.globalAlpha = 1;
    if (blur > .2) { const g = X.createRadialGradient(x, y, r * .25, x, y, r * .95); g.addColorStop(0, rgba(o.smear || '#8A80C0', .0)); g.addColorStop(.6, rgba(o.smear || '#8A80C0', .25 * blur)); g.addColorStop(1, rgba(o.smear || '#8A80C0', 0)); X.fillStyle = g; X.beginPath(); X.arc(x, y, r * .95, 0, TAU); X.fill(); }
    paint(ellPts(x, y, r * .27, r * .27, 20), { fill: '#241E3C', ink: PAL.line, sw: Math.max(1, r / 60) });
    neonLine(ellPts(x, y, r * .2, r * .2, 20), o.led || PAL.nGreen, Math.max(1.5, r / 45), .9 + .1 * blur, 0, true);
    if (o.ring !== false) neonLine(ellPts(x, y, r * 1.02, r * 1.02, 40), o.led || PAL.nGreen, Math.max(1, r / 70), .35 + .5 * blur, 0, true);
  }
  // comic speech bubble with a tail toward (tx, ty)
  function bubble(x, y, w, h, tx, ty, k = 1, col = PAL.nCyan) {
    if (k <= .01) return;
    const s = backOut(k), cx = x + w / 2, cy = y + h / 2;
    X.save(); X.translate(tx, ty); X.scale(s, s); X.translate(-tx, -ty);
    const bx = clamp(tx, x + 110, x + w - 110) - (tx > x + w ? 60 : 0), tb = [[bx - 50, y + h - 4], [tx, ty], [bx + 30, y + h - 4]];
    glowPath(rrPts(x, y, w, h, 40), col, 1.2, 0, .8);
    paint(tb, { fill: '#FFFFFF', ink: PAL.line, sw: 3 });
    paint(rrPts(x, y, w, h, 40), { fill: '#FFFFFF', ink: PAL.line, sw: 3 });
    paint(tb.map(([a, b], i) => i === 1 ? [a, b] : [a, b - 8]), { fill: '#FFFFFF', ink: null });
    X.restore();
  }
  // strawberry icon
  function strawb(x, y, r, a = 1) {
    paint(heartPts(x, y + r * .15, r).map(([px, py]) => [px, y + (y + r * .15 - py) * -1.05 + r * .1]), { fill: '#FF2E5A', shade: '#A0103A', ink: PAL.line, sw: Math.max(1, r / 14), alpha: a, rim: '#FF9AB0' });
    X.fillStyle = '#FFE680'; X.globalAlpha = a; for (let i = 0; i < 7; i++) X.fillRect(x + (hash(i * 3) - .5) * r * 1.1, y + (hash(i * 5) - .2) * r * .9, r * .09, r * .12); X.globalAlpha = 1;
    paint(starPts(x, y - r * .55, r * .45, .35, 5), { fill: PAL.nGreen, ink: PAL.line, sw: Math.max(1, r / 18), alpha: a });
  }
  // the big neon parrot (original): (x, y) = feet on the perch; s = 1 → ~100 px tall
  function bigParrot(x, y, s, o = {}) {
    const op = clamp(o.beak || 0), fl = o.flap || 0, bob = o.bob || 0;
    X.save(); X.translate(x, y); X.scale((o.flip ? -1 : 1) * s, s);
    const sw = 1.1;
    // tail
    if (o.part !== 'body') { paint([[-4, -16], [-26, 34], [-20, 40], [-12, 38], [6, -8]], { fill: '#FF2E88', shade: '#A0105A', ink: PAL.line, sw, curv: .3, rim: '#FF9AC8' }); paint([[-6, -12], [-14, 30], [-8, 32], [2, -6]], { fill: '#27F2F2', ink: PAL.line, sw: sw * .8, curv: .3 }); }
    if (o.part === 'tail') { X.restore(); return; }
    X.translate(0, bob);
    // body
    paint([[-10, -8], [-16, -34], [-12, -56], [0, -66], [14, -62], [18, -44], [14, -22], [4, -4]], { fill: '#2BD66E', shade: '#0F7A42', rim: '#C8FFE0', ink: PAL.line, sw, curv: .6, light: [-.2, -.1] });
    paint([[2, -12], [12, -26], [14, -44], [8, -50], [4, -30]], { fill: '#F5F03A', ink: null, alpha: .85, curv: .6 });
    // wing (flaps up on the squawk)
    X.save(); X.translate(-6, -50); X.rotate(-fl * 1.3);
    paint([[0, 0], [-8, 10], [-14, 32], [-10, 50], [-2, 44], [6, 20], [6, 4]], { fill: '#FF2E88', shade: '#A0105A', rim: '#FFB0D8', ink: PAL.line, sw, curv: .35 });
    for (let i = 0; i < 3; i++) line([[-2 - i * 3, 22 + i * 8], [-9 - i * 2, 40 + i * 4]], .8, '#7A0A40', 0);
    paint([[-2, 4], [-9, 14], [-4, 18], [4, 10]], { fill: '#27F2F2', ink: null, curv: .4 });
    X.restore();
    // head
    X.save(); X.translate(8, -70); X.rotate(o.tilt || 0);
    for (let i = 0; i < 3; i++) paint([[-6 + i * 4, -8], [-14 + i * 5, -24 - i * 2 + Math.sin(T * 9 + i) * 1.5], [-2 + i * 4, -10]], { fill: i === 1 ? '#F5F03A' : '#FF8A1F', ink: PAL.line, sw: sw * .8, curv: .4 });
    paint(ellPts(0, 0, 14, 13, 20), { fill: '#2BD66E', shade: '#0F7A42', rim: '#C8FFE0', ink: PAL.line, sw, light: [-.2, -.15] });
    paint(ellPts(5, -2, 6, 6, 14), { fill: '#FFFFFF', ink: PAL.line, sw: sw * .7 });
    paint(ellPts(6.5, -2, 2.8, 3.2, 10), { fill: '#0B0716', ink: null, flat: true });
    paint(ellPts(5.6, -3.4, 1, 1, 6), { fill: '#FFFFFF', ink: null, flat: true });
    // beak: hooked upper mandible, lower drops open
    X.save(); X.translate(12, 2); X.rotate(op * .55);
    paint([[0, -1], [12, 1], [9, 7], [0, 5]], { fill: '#E8C43A', shade: '#A07A10', ink: PAL.line, sw: sw * .8, curv: .3 });
    X.restore();
    if (op > .05) paint([[12, 1], [20, 5], [14, 6 + op * 8]], { fill: '#5A1A2A', ink: null });
    paint([[10, -6], [22, -4], [26, 4], [22, 10], [18, 4], [11, 3]], { fill: '#F5F03A', shade: '#C89A10', ink: PAL.line, sw: sw * .9, curv: .35, rim: '#FFFFFF' });
    X.restore();
    // feet
    for (const fx of [-4, 6]) paint([[fx - 5, -2], [fx + 5, -2], [fx + 6, 3], [fx - 6, 3]], { fill: '#8A86A8', ink: PAL.line, sw: sw * .7, curv: .3 });
    X.restore();
  }

  // 1b · b140–144: the TV wall. Every screen's smiley tracks him as he walks; he stops, side-eyes, they all wink.
  const TVS = Array.from({ length: 33 }, (_, i) => { const c = i % 11, r = Math.floor(i / 11); return { x: -1000 + c * 285 + (hash(i * 3.3) - .5) * 30, y: 175 + r * 205 + (hash(i * 5.1) - .5) * 14, w: 236 + hash(i * 7.7) * 34, h: 168 + hash(i * 9.1) * 22, col: NC[Math.floor(hash(i * 4.4) * 5)], i }; });
  function tvWall(t, lt, dur) {
    style(1);
    const a = B(141.5) - B(140), d = B(142) - B(141.5), v = 440;
    const hx = lt < a ? v * lt : lt < a + d ? v * a + v * (lt - a) - v * (lt - a) ** 2 / (2 * d) : v * a + v * d / 2;
    const camX = hx - 700 + 40 * easeOut(seg(lt, a, dur)), sx = hx - camX, gy = 1020, hh = 760;
    const b = bpOf(t), stop = b >= 142, wink = b >= 143;
    vgrad(0, 0, W, H, [[0, '#0B0620'], [.8, '#1A0E36'], [1, '#07040F']]);
    X.save(); X.translate(-camX, 0);
    // shop interior + shelves
    X.fillStyle = '#140B2C'; X.fillRect(camX - 10, 120, W + 20, 700);
    const lights = [];
    for (const tv of TVS) {
      if (tv.x + tv.w < camX - 20 || tv.x > camX + W + 20) continue;
      const cx = tv.x + tv.w / 2, cy = tv.y + tv.h / 2;
      paint(rrPts(tv.x - 16, tv.y - 14, tv.w + 32, tv.h + 30, 16), { fill: '#2A2448', shade: '#15112A', rim: '#6A5AAA', ink: PAL.line, sw: 2 });
      const lk = lookAt(cx, cy, hx, gy - hh * .88, 520), pop = wink ? .82 + .18 * backOut(clamp(since(t, 143) * 6)) : 1;
      X.save(); X.translate(cx, cy); X.scale(pop, pop); X.translate(-cx, -cy);
      maskScreen(tv.x, tv.y, tv.w, tv.h, { bg: wink && since(t, 143) < .08 ? '#E8D8FF' : undefined, look: stop ? [lk[0] * 1.3, lk[1]] : lk, tilt3d: lk[0] * .45, col: tv.col, eyes: wink ? 'wink' : stop ? 'dot' : 'open', mouth: wink ? 'grin' : stop ? 'o' : 'smile', r: .4, glow: wink ? .8 : .3, bgGlow: wink ? '#9A3ACA' : '#4A2A8A' });
      X.restore();
      for (let k = 0; k < 3; k++) paint(ellPts(tv.x + tv.w + 2, tv.y + 20 + k * 22, 5, 5, 8), { fill: '#8A86A8', ink: PAL.line, sw: 1 });
      if (tv.y > 500) lights.push({ x: tv.x + tv.w * .15 - camX, w: tv.w * .7, col: tv.col, a: .22, len: 260 });
    }
    // shelves
    for (let r = 0; r < 3; r++) { X.fillStyle = '#0B0716'; X.fillRect(camX - 10, 366 + r * 205, W + 20, 16); neonLine([[camX - 10, 366 + r * 205], [camX + W + 10, 366 + r * 205]], PAL.nViolet, 1.5, .5, 0); }
    // window mullions + glass sheen
    for (let m = -2400; m < 3600; m += 760) { if (m < camX - 60 || m > camX + W + 60) continue; X.fillStyle = '#0B0716'; X.fillRect(m - 14, 110, 28, 720); neonLine([[m, 120], [m, 820]], PAL.nCyan, 1.2, .35, 0); }
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(200,230,255,.05)';
    for (let m = -2400; m < 3600; m += 760) { X.beginPath(); X.moveTo(m + 120, 120); X.lineTo(m + 260, 120); X.lineTo(m + 60, 820); X.lineTo(m - 80, 820); X.fill(); }
    X.restore();
    // awning + sign strip
    X.fillStyle = '#0E0820'; X.fillRect(camX - 10, 0, W + 20, 118);
    for (let k = Math.floor(camX / 120) * 120; k < camX + W + 120; k += 120) { X.fillStyle = (k / 120) % 2 ? '#3A0F3A' : '#1A0A2E'; X.beginPath(); X.moveTo(k, 60); X.lineTo(k + 120, 60); X.lineTo(k + 132, 128); X.lineTo(k + 12, 128); X.fill(); }
    neonLine([[camX - 10, 128], [camX + W + 10, 128]], PAL.nMagenta, 3, .9, 0);
    for (const [wx, word, col] of [[-620, 'テレビ', PAL.nCyan], [980, 'ネオン', PAL.nMagenta], [1760, 'TOKENS', PAL.nGreen]]) {
      if (wx < camX - 300 || wx > camX + W + 300) continue;
      ntxt(word, wx, 32, 44, col);
    }
    // v2: the shop sign. The TVs below are literally stacked layers; the icon gains a layer on every beat.
    {
      const nL = 2 + clamp(Math.floor(b) - 140, 0, 3), drop = k => 1 - backOut(clamp(since(t, 140 + k) * 5));
      for (const sx of [-260, 260]) { line([[250 + sx, 0], [250 + sx, 60]], 4, '#3A2E5A', 0); }
      neonPanel(250, 118, 960, 110, ['STACK MORE LAYERS'], { col: PAL.nYellow, frame: PAL.nCyan, t, seed: 77, rim: '#8A7ACA',
        icon: (cx, cy, s, on) => {
          for (let i = 0; i < nL; i++) {
            const dy = i >= 2 ? -drop(i - 1) * 60 : 0, yy = cy + s * .42 - i * s * .24 + dy, col = [PAL.nCyan, PAL.nMagenta, PAL.nYellow, PAL.nGreen, PAL.nOrange][i];
            const pts = [[cx - s * .55, yy], [cx, yy - s * .2], [cx + s * .55, yy], [cx, yy + s * .2]];
            paint(pts, { fill: '#0B0716', ink: null });
            neonLine(pts, col, 3, on, 0, true);
          }
        } });
    }
    // sill
    X.fillStyle = '#1C1236'; X.fillRect(camX - 10, 820, W + 20, 30); neonLine([[camX - 10, 820], [camX + W + 10, 820]], PAL.nCyan, 2, .6, 0);
    X.restore();
    wetFloor(t, 850, lights, { nSplash: 30 });
    // the hero
    const ph = hx / 620;
    if (!stop) hero(sx, gy, hh, { view: 'side', ...walkPose(ph, 1.1), eyes: 'open', mouth: 'flat', lookX: .2, hairWind: -.4 });
    else {
      const hop = wink ? -Math.max(0, Math.sin(clamp(since(t, 143) * 5) * Math.PI)) * 24 : 0;
      hero(sx, gy, hh, { view: 'q', ...POSES.stand, dy: hop, eyes: wink ? 'wide' : 'narrow', lookX: -1, lookY: -.6, mouth: wink ? 'wobble' : 'flat', brows: wink ? 'up' : 'flat', sweat: wink ? 1 : .6, tilt: -.06 });
    }
    // his reflection on the wet pavement
    X.save(); X.translate(0, gy * 2 + 6); X.scale(1, -1); hero(sx, gy, hh, { view: stop ? 'q' : 'side', ...(stop ? POSES.stand : walkPose(ph, 1.1)), silhouette: '#5A3A9A', alpha: .22 }); X.restore();
    rainFG(t, { n: 130, alpha: .35, ang: .08 });
    FX.letterbox = .35;
  }

  // 2a · b144–148: the data-centre district. Racks behind glass, exhaust fans spin up on every beat, vents steam.
  function dataCentre(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const p = easeInOut(lt / dur);
    camBegin(960, 520 - 10 * p, 1 + .035 * p);
    vgrad(-100, -100, W + 200, H + 200, [[0, '#07030F'], [.45, '#1A0B36'], [.7, '#3A1052'], [.8, '#1A0A2E']]);
    cityX(t, { horizon: 820, scroll: 600 + lt * 40, street: false, seed: 5, signs: 1, tall: 1.15 });
    // the building (v2: lower, so a billboard fits on its roof)
    const bx = 330, by = 210, bw = 1260, bh = 640;
    const ang = spinAngle(t, 144, [.6, 1.6, 3.5, 7]), nb = clamp(Math.floor(bpOf(t)) - 144, 0, 3), blur = [0, .25, .6, 1][nb];
    // roof exhaust plumes (behind the billboard)
    for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) steam(bx + 160 + i * 313, by + 10, 90 + nb * 25, frac(t * (.6 + nb * .2) + i * .3 + k * .5), .3 + nb * .1, '#C8B8F0');
    paint(rectPts(bx, by, bw, bh + 40), { fill: '#150D2C', shade: '#0A0618', ink: PAL.line, sw: 3, rim: '#3A2A6A' });
    // exhaust fans on the top band, stepping up per beat
    for (let i = 0; i < 4; i++) fanFace(bx + 160 + i * 313, by + 76, 64, ang * (i % 2 ? -1 : 1) + i, blur, { led: i % 2 ? PAL.nCyan : PAL.nGreen });
    // glass bays with racks
    const cols = 5, rows = 3, gw = 220, gh = 145, gx0 = bx + 40, gy0 = by + 152;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = gx0 + c * (gw + 20), y = gy0 + r * (gh + 16), id = r * 5 + c;
      const on = clamp(since(t, 145 + (rows - 1 - r)) * 5), lit = .25 + .75 * on;
      const g = X.createLinearGradient(0, y, 0, y + gh); g.addColorStop(0, mixCol('#0A1A2E', '#1070A0', on)); g.addColorStop(1, mixCol('#070C1C', '#0A2040', on)); X.fillStyle = g; X.fillRect(x, y, gw, gh);
      glow(x + gw / 2, y + 20, gw * .6, PAL.nCyan, (.1 + .18 * on) + .12 * pulse(t, 4) * on);
      for (let k = 0; k < 4; k++) rackMini(x + 12 + k * 51, y + 18, 44, gh - 26, t, id * 5 + k, lit * (.7 + .3 * pulse(t, 5)));
      if (on > 0 && on < 1) { X.fillStyle = rgba('#BFFFFF', .5 * (1 - on)); X.fillRect(x, y, gw, gh); }
      X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(190,240,255,.07)'; X.beginPath(); X.moveTo(x + 40, y); X.lineTo(x + 110, y); X.lineTo(x + 30, y + gh); X.lineTo(x - 40, y + gh); X.fill(); X.restore();
      paint(rectPts(x, y, gw, gh), { ink: PAL.line, sw: 3 });
    }
    // v2 signage. The roof billboard on a truss:
    { const y0 = 186; X.strokeStyle = PAL.line; X.lineWidth = 9; X.beginPath(); for (let i = 0; i < 6; i++) { const x = 520 + i * 176; X.moveTo(x, y0 - 10); X.lineTo(x, by + 4); if (i < 5) { X.moveTo(x, y0 - 6); X.lineTo(x + 176, by); } } X.stroke(); X.strokeStyle = '#3A2E5A'; X.lineWidth = 4; X.stroke(); }
    neonPanel(960, 118, 1000, 126, ['COMPUTE IS THE NEW OIL'], { col: PAL.nYellow, frame: PAL.nOrange, t, seed: 91, rim: '#8A7ACA',
      icon: (cx, cy, s, on) => {   // a neon oil drop with a chip in it
        const d = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; d.push([cx + s * .5 * Math.sin(a) * Math.sin(a / 2), cy + s * .1 - s * .62 * Math.cos(a)]); }
        paint(d, { fill: '#1A1206', ink: null, curv: .4 }); neonLine(d, PAL.nOrange, 3.5, on, .4, true);
        paint(rrPts(cx - s * .17, cy + s * .08, s * .34, s * .3, 3), { fill: '#0B0716', ink: null }); neonLine(rrPts(cx - s * .17, cy + s * .08, s * .34, s * .3, 3), PAL.nGreen, 2, on, 0, true);
        for (let j = 0; j < 3; j++) for (const sd of [-1, 1]) line([[cx + sd * s * .17, cy + s * (.14 + j * .09)], [cx + sd * s * .25, cy + s * (.14 + j * .09)]], 1.5, PAL.nGreen, 0, on);
      } });
    // NO MOAT, on a pole by the kerb
    line([[175, 590], [175, 850]], 7, '#2A2046', 0); line([[150, 850], [200, 850]], 6, '#2A2046', 0);
    neonPanel(175, 505, 236, 178, [{ s: 'NO', k: .72 }, 'MOAT'], { col: PAL.nMagenta, frame: PAL.nCyan, t, seed: 93, rim: '#8A6ACA' });
    // AGI 20xx: the year ticks down each beat (timelines), lands on 2027
    { const yr = ['2035', '2030', '2027'][clamp(Math.floor(bpOf(t)) - 144, 0, 2)], hitK = Math.exp(-Math.max(0, since(t, 144 + ['2035', '2030', '2027'].indexOf(yr))) * 7);
      line([[1775, 390], [1775, 850]], 7, '#2A2046', 0);
      neonPanel(1775, 300, 212, 176, [{ s: 'AGI', k: .62, font: 'Orbitron', col: PAL.nOrange }, { s: yr, font: 'Orbitron', col: yr === '2027' ? PAL.nRed : PAL.nOrange }], { col: PAL.nOrange, frame: PAL.nRed, t, seed: 97, panel: '#240812' });
      if (hitK > .05) glow(1775, 320, 200, PAL.nRed, .5 * hitK); }
    { const x = bx + bw + 14, y = by + 190; X.fillStyle = '#0A0614'; X.fillRect(x, y, 70, 290); neonLine(rectPts(x, y, 70, 290), PAL.nGreen, 3, 1, 0, true); ['G', 'P', 'U'].forEach((ch, j) => ntxt(ch, x + 35, y + 52 + j * 90, 58, PAL.nGreen)); }
    // street + reflections
    X.fillStyle = '#0A0618'; X.fillRect(-100, 830, W + 200, 20);
    const refls = []; for (let c = 0; c < cols; c++) refls.push({ x: gx0 + c * 240 + 30, w: 160, col: PAL.nCyan, a: .2, len: 300 });
    refls.push({ x: 80, w: 190, col: PAL.nMagenta, a: .25, len: 260 }, { x: 1680, w: 190, col: PAL.nOrange, a: .22, len: 260 });
    wetFloor(t, 850, refls, { nSplash: 30 });
    // steam vents puff on each beat
    for (const [vx, n0] of [[420, 144], [1500, 145], [620, 146], [1300, 147]]) {
      paint(rrPts(vx - 50, 868, 100, 22, 6), { fill: '#241A3A', ink: PAL.line, sw: 2 });
      for (let k = 0; k < 2; k++) steam(vx, 860, 150, clamp(since(t, n0 + k * 4) / 1.1), .9, '#E8DEFF');
      steam(vx, 860, 80, frac(t * .7 + vx), .35, '#D8C8FF');
    }
    // the hero, small, looking up at it
    hero(820, 1030, 430, { view: 'back', emblem: .6 + .4 * pulse(t, 4), tilt: Math.sin(t * 1.3) * .05, dy: -3 * pulse(t, 6), hairWind: .3, aL: [.15, .2], aR: [.15, .2] });
    camEnd();
    rainFG(t, { n: 120, alpha: .32 });
  }

  // 2b · b148–152: GPUs go brrr. A stack of cards, fans spinning up every beat until it all shakes.
  function gpuBrrr(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const nb = clamp(Math.floor(bpOf(t)) - 148, 0, 3), ang = spinAngle(t, 148, [1.2, 3, 6.5, 13]), blur = [0, .35, .75, 1][nb];
    const [jx, jy] = shakeXY(t, 1 + nb * 2.5);
    vgrad(0, 0, W, H, [[0, '#050A12'], [.5, '#0B1A24'], [1, '#050308']]);
    glow(960, 540, 900, PAL.nGreen, .08 + nb * .04);
    // rig frame rails
    for (const y of [100, 972]) { X.fillStyle = '#1A1628'; X.fillRect(0, y, W, 26); neonLine([[0, y + 13], [W, y + 13]], PAL.nViolet, 2, .5, 0); }
    // heat shimmer lines
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = rgba(PAL.nOrange, .12 + nb * .05); X.lineWidth = 3;
    for (let i = 0; i < 12; i++) { X.beginPath(); const x0 = 100 + i * 150; for (let y = 1080; y > 0; y -= 30) X.lineTo(x0 + Math.sin(y * .02 + t * 8 + i) * (8 + nb * 5), y - frac(t * .8 + i * .1) * 60); X.stroke(); }
    X.restore();
    const cards = [[950, 250, -.03], [975, 535, -.03], [1000, 820, -.03]];
    cards.forEach(([x, y, r], i) => {
      const [dx, dy] = shakeXY(t + i * .37, .5 + nb * 1.6);
      gpuCard(x + dx + jx * .3, y + dy, .92, ang * (i % 2 ? 1 : -1) + i, blur, r, nb);
    });
    // caption
    if (bpOf(t) >= 150) cap('GPUs go brrr', 960, 1010, 88, PAL.nYellow, { font: 'Anton', stroke: '#000', sw: 11, pop: since(t, 150) * 6, rot: -.03 });
    FX.shake += nb * 3; FX.rgb = Math.max(FX.rgb, nb >= 3 ? .2 * pulse2(t) : 0);
    FX.dx += jx; FX.dy += jy;
  }
  function gpuCard(cx, cy, s, ang, blur, rot, nb) {
    X.save(); X.translate(cx, cy); X.rotate(rot); X.scale(s, s);
    paint(rrPts(-700, -125, 1400, 250, 18), { fill: '#16121F', shade: '#0A0812', ink: PAL.line, sw: 3 });
    paint([[-690, -112], [-260, -112], [-220, -95], [220, -95], [260, -112], [690, -112], [690, 112], [-690, 112]], { fill: '#2A2540', shade: '#15111F', rim: '#8A7AD0', ink: PAL.line, sw: 2.5, light: [-.05, -.2] });
    for (const sd of [-1, 1]) neonLine([[sd * 680, -100], [sd * 270, -100], [sd * 230, -84]], PAL.nGreen, 5, .7 + .3 * pulse(T, 5), 0);
    neonLine([[-200, 100], [200, 100]], PAL.nGreen, 4, .8, 0);
    for (const fx of [-420, 0, 420]) fanFace(fx, 0, 105, ang + fx * .01, blur, { led: PAL.nGreen, ring: true, smear: '#9A90D0' });
    // label + gold fingers
    ntxt('GPU', 600, 70, 36, PAL.nGreen);
    X.fillStyle = '#E8C43A'; for (let i = 0; i < 26; i++) X.fillRect(-380 + i * 22, 125, 14, 22);
    X.restore();
  }

  // 3 · b152–156: the stochastic parrot squawks it back, token by token.
  // v2: 'squawk!' then the line streams out token by token on sixteenths, each token in its own tokenizer highlight
  const PARROT_TOK = ['squawk!', "it's", ' just', ' a', ' next', '-token', '\n', 'predict', 'or—'];
  const TOK_COLS = ['#FF9CC6', '#86E6FF', '#FFE45C', '#A6F58E', '#CDB0FF', '#FFBE7A'];
  function parrotGag(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const p = easeOut(lt / dur);
    camBegin(960 + 20 * p, 540, 1.0 + .05 * p);
    vgrad(-100, -100, W + 200, H + 200, [[0, '#0A0520'], [.6, '#26104A'], [1, '#0B0616']]);
    // bokeh of distant signs
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const x = hash(i * 3.1) * W, y = 80 + hash(i * 5.3) * 700, r = 30 + hash(i * 7.9) * 70, c = NC[i % 5]; X.fillStyle = rgba(c, .12 + .06 * Math.sin(t * 2 + i)); X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); }
    X.restore();
    // wall + bracket
    X.fillStyle = '#120A26'; X.fillRect(1560, -100, 600, 1300);
    X.fillStyle = '#3A2F5A'; X.fillRect(1500, 680, 120, 14);
    // tokens stream out on the eighths; the beak snaps on each
    const tk = PARROT_TOK.map((_, i) => B(i ? 152.75 + i * .25 : 152.5)), nT = tk.filter(x => t >= x).length, lastT = nT ? t - tk[nT - 1] : 1;
    const beak = nT ? Math.exp(-lastT * 12) : 0, flap = Math.max(0, Math.sin(clamp(since(t, 153) * 3) * Math.PI));
    const po = { beak, flap: flap * .8 + beak * .15, bob: -beak * 3, tilt: -beak * .12 + Math.sin(t * 5) * .03, flip: true };
    const px = 1420, py = 690, ps = 6.1;
    bigParrot(px, py, ps, { ...po, part: 'tail' });
    signBoard(1170, 775, 700, 170, 'TOKENS', PAL.nMagenta, { size: 94 });
    bigParrot(px, py, ps, { ...po, part: 'body' });
    // him, deadpan, looking up at it
    const sad = bpOf(t) >= 155;
    hero(430 - beak * 8, 1440, 1000, { view: 'q', ...POSES.stand, eyes: sad ? 'tired' : 'open', lookX: .8, lookY: -.7, mouth: sad ? 'flat' : 'o', brows: sad ? 'flat' : 'up', sweat: sad ? 1 : 0, tilt: .05 - beak * .06, hairWind: -beak });
    // speech bubble with the typed line
    const bk = clamp(since(t, 152.35) * 5);
    if (bk > 0) {
      bubble(70, 88, 900, 318, 1226, 300, bk);
      if (bk > .6) {
        if (nT) txt('squawk!', 130, 156, 80, PAL.nMagenta, { font: 'Shantell', align: 'left', stroke: '#0B0716', sw: 5 });
        let x = 136, y = 254, ci = 0; const fs = 60;
        for (let i = 1; i < nT; i++) {
          const tok = PARROT_TOK[i]; if (tok === '\n') { x = 136; y += 88; continue; }
          const w = txtW(tok, fs, 'Shantell'), pk = clamp((t - tk[i]) * 14);
          paint(rrPts(x - 3, y - 36, w + 6, 72, 10), { fill: TOK_COLS[ci++ % TOK_COLS.length], ink: null, alpha: .8 * pk });
          txt(tok, x, y + 2, fs, '#1A1030', { font: 'Shantell', align: 'left', alpha: pk });
          x += w + 6;
        }
        if (Math.floor(t * 6) % 2 && nT < PARROT_TOK.length) { X.fillStyle = '#1A1030'; X.fillRect(x + 2, (nT > 1 ? y : 156) - 30, 8, 60); }
      }
    }
    camEnd();
    rainFG(t, { n: 110, alpha: .3 });
  }

  // 4 · b156–160: the strawberry vending machine counts its r's, one per beat.
  function strawberry(t, lt, dur) {
    style(1);
    const p = easeInOut(lt / dur), n = clamp(Math.floor(bpOf(t)) - 156, 0, 3);
    camBegin(960, 520 - 20 * p, 1 + .07 * p);
    // alley wall
    vgrad(-100, -100, W + 200, H + 200, [[0, '#0B0620'], [1, '#1C0C34']]);
    X.fillStyle = '#170D30'; for (let r = 0; r < 24; r++) for (let c = 0; c < 16; c++) if (hash(r * 31 + c) < .8) X.fillRect(c * 130 + (r % 2) * 65 - 60, r * 48 - 60, 122, 40);
    glow(960, 520, 900, '#FF2E5A', .22);
    // v2: a cheap alley sign hanging crooked off one chain, one tube dying
    {
      const sw = Math.sin(t * 2.3) * .025;
      line([[140, -60], [160, 205]], 3, '#5A4A7A', 0); line([[330, -60], [318, 150]], 3, '#5A4A7A', .2);
      X.save(); X.translate(160, 205); X.rotate(-.16 + sw);
      neonPanel(125, 105, 270, 200, ['GPU', { s: 'POOR', dead: 2 }], { col: PAL.nCyan, frame: PAL.nGreen, t, seed: 61, flickP: .12, panel: '#0C1A24', rim: '#4A6A8A' });
      X.restore();
      // arrow down the alley
      const ab = .6 + .4 * (Math.floor(t * 4) % 2);
      neonLine([[150, 520], [150, 640], [118, 606], [150, 640], [182, 606]], PAL.nGreen, 5, ab, 0);
    }
    // machine
    const mx = 470, my = 30, mw = 980, mh = 1120;
    paint(rrPts(mx, my, mw, mh, 34), { fill: '#E23A6A', shade: '#8A1040', rim: '#FFB0C8', ink: PAL.line, sw: 3.5, light: [-.04, -.03] });
    paint(rrPts(mx + 22, my + 22, mw - 44, 360, 20), { fill: '#1A0A1E', ink: PAL.line, sw: 3 });
    // display
    const dx = mx + 50, dy = my + 48, dw = mw - 100, dh = 310;
    X.fillStyle = '#061018'; X.fillRect(dx, dy, dw, dh);
    glow(dx + dw / 2, dy + dh / 2, dw * .55, PAL.nCyan, .14);
    ntxt("how many r's in", dx + 40, dy + 64, 50, PAL.nCyan, { align: 'left' });
    const word = 'STRAWBERRY?', size = 112, lx0 = dx + 44;
    let xx = lx0; const rIdx = [2, 7, 8];
    [...word].forEach((ch, i) => {
      const w = txtW(ch, size, 'Anton') + 6, k = rIdx.indexOf(i), lit = k >= 0 && k < n;
      if (lit) {
        const pk = clamp(since(t, 157 + k) * 6);
        paint(rrPts(xx - 4, dy + 110, w + 8, 150, 12), { fill: rgba(PAL.nMagenta, .25), ink: PAL.nMagenta, sw: 2.5, alpha: pk });
        glow(xx + w / 2, dy + 185, 110, PAL.nMagenta, .5 * pk);
        txt(String(k + 1), xx + w / 2, dy + 292, 44, PAL.nYellow, { font: 'Orbitron', pop: pk });
      }
      txt(ch, xx + w / 2, dy + 186, lit ? size * (1 + .12 * Math.exp(-since(t, 157 + k) * 8)) : size, lit ? '#FFFFFF' : '#5FA8B8', { font: 'Anton', stroke: lit ? PAL.nMagenta : null, sw: 8 });
      xx += w;
    });
    // its little smiley: sweating while it counts, beaming at the end
    const done = bpOf(t) >= 159;
    mask(dx + dw - 80, dy + 78, 58, { eyes: done ? 'happy' : n >= 1 ? 'narrow' : 'wide', mouth: done ? 'grin' : 'wobble', sweat: done ? 0 : 1, look: done ? [0, 0] : [-.8, .4], glow: .5, rot: done ? Math.sin(since(t, 159) * 14) * .12 * Math.exp(-since(t, 159) * 3) : 0 });
    if (done) {
      const pk = clamp(since(t, 159) * 6);
      glow(dx + dw - 90, dy + 222, 140, PAL.nYellow, .5 * pk);
      txt('3', dx + dw - 90, dy + 222, 140, PAL.nYellow, { font: 'Anton', stroke: '#0B0716', sw: 12, pop: pk });
    }
    // product window
    const px = mx + 40, py = my + 420, pw = 640, ph = 560;
    X.fillStyle = '#1A0620'; X.fillRect(px, py, pw, ph);
    glow(px + pw / 2, py + 40, pw * .7, '#FFD0E0', .22);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = px + 85 + c * 157, cy = py + 95 + r * 180;
        paint(rrPts(cx - 42, cy - 70, 84, 130, 14), { fill: '#FF6FA0', shade: '#C0306A', rim: '#FFD0E0', ink: PAL.line, sw: 2 });
        strawb(cx, cy - 2, 26);
        line(Array.from({ length: 9 }, (_, k) => [cx - 50 + k * 12.5, cy + 78 + (k % 2) * 10]), 2.4, '#C8C8D8', .3);
      }
      X.fillStyle = '#3A1A40'; X.fillRect(px, py + 168 + r * 180, pw, 8);
    }
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,255,255,.07)'; X.beginPath(); X.moveTo(px + 120, py); X.lineTo(px + 260, py); X.lineTo(px + 60, py + ph); X.lineTo(px - 80, py + ph); X.fill(); X.restore();
    paint(rectPts(px, py, pw, ph), { ink: PAL.line, sw: 3 });
    // keypad + slot
    const kx = mx + 720, ky = my + 430;
    paint(rrPts(kx, ky, 210, 540, 16), { fill: '#2A0A24', ink: PAL.line, sw: 2.5 });
    X.fillStyle = '#061018'; X.fillRect(kx + 20, ky + 24, 170, 70); ntxt(done ? '3' : '...', kx + 105, ky + 60, 40, PAL.nGreen);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) paint(rrPts(kx + 22 + c * 58, ky + 120 + r * 62, 48, 48, 8), { fill: '#FFE9F0', shade: '#C8A0B0', ink: PAL.line, sw: 1.5 });
    paint(rrPts(kx + 80, ky + 390, 50, 110, 8), { fill: '#0B0716', ink: PAL.nYellow, sw: 1.5 });
    strawb(mx + 120, my + mh - 70, 34); ntxt('STRAWBERRY', mx + 330, my + mh - 70, 42, PAL.nPink);
    camEnd();
    rainFG(t, { n: 90, alpha: .28 });
    FX.letterbox = .35;
  }

  // 5a · b160–164: the upgrade clinic, through the rainy window. A robot arm installs chrome; his battery refills.
  function clinic(t, lt, dur) {
    style(1);
    const p = easeInOut(lt / dur), n = clamp(Math.floor(bpOf(t)) - 160, 0, 3), bv = [.15, .38, .62, .86][n] + .1 * clamp(since(t, 160 + n) * 3);
    camBegin(960 + 30 * p, 540, 1.0 + .06 * p);
    X.fillStyle = '#140B2A'; X.fillRect(-100, -100, W + 200, H + 200);
    const wx = 150, wy = 130, ww = 1620, wh = 800;
    // interior: clean clinical light
    const g = X.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#2A8A9A'); g.addColorStop(.7, '#155066'); g.addColorStop(1, '#0E2A40'); X.fillStyle = g; X.fillRect(wx, wy, ww, wh);
    X.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 9; i++) X.fillRect(wx + i * 190, wy, 3, wh);
    X.fillStyle = '#0E3A4A'; X.fillRect(wx, 880, ww, 50);
    // reclined in the chair (facing right), the arm coming in from the left wall
    const h = 560, hipX = 1000, hipY = 760, th = -.9, L = .43 * h;
    const head = [hipX + L * Math.sin(th), hipY - L * Math.cos(th)], back = [-Math.cos(th), -Math.sin(th)];
    const tors = (d, o) => [hipX + (head[0] - hipX) * d + back[0] * o, hipY + (head[1] - hipY) * d + back[1] * o];
    paint(rrPts(hipX + 30, 800, 60, 100, 8), { fill: '#C8D0E8', shade: '#7A86A8', ink: PAL.line, sw: 2.5 });
    paint(rrPts(hipX - 120, 895, 330, 26, 8), { fill: '#C8D0E8', shade: '#7A86A8', ink: PAL.line, sw: 2.5 });
    paint([tors(-.1, 10), tors(1.25, 10), tors(1.25, 58), tors(-.1, 58)], { fill: '#EEF0FA', shade: '#9AA0C0', rim: '#FFFFFF', ink: PAL.line, sw: 2.5, curv: .2 });
    paint([[hipX - 40, hipY + 20], [hipX + 290, hipY + 30], [hipX + 290, hipY + 64], [hipX - 40, hipY + 60]], { fill: '#EEF0FA', shade: '#9AA0C0', ink: PAL.line, sw: 2.5, curv: .2 });
    const wince = bpOf(t) < 163.5;
    hero(hipX, hipY + .46 * h, h, { view: 'side', rot: th, aL: [.9, -.6], aR: [.8, -.5], lL: [.75, .3], lR: [.7, .25], eyes: wince ? 'closed' : 'happy', mouth: wince ? 'teeth' : 'grin', brows: wince ? 'worried' : 'up', chrome: .25 + .25 * n + .2 * pulse(t, 6), sweat: wince ? .9 : 0 });
    const tip = [head[0] + 30 + Math.sin(t * 30) * 2, head[1] + 18];
    const j0 = [wx - 20, 470], j1 = [470, 380], j2 = [tip[0] - 110, tip[1] - 60];
    for (const [a, b2, w] of [[j0, j1, 36], [j1, j2, 28]]) paint(capsule(a[0], a[1], b2[0], b2[1], w, w * .85), { fill: '#F0F2FA', shade: '#8A90B0', rim: '#FFFFFF', ink: PAL.line, sw: 2.5 });
    for (const j of [j1, j2]) paint(ellPts(j[0], j[1], 30, 30, 18), { fill: '#3A3A5A', ink: PAL.line, sw: 2.5 });
    paint(capsule(j2[0], j2[1], tip[0] - 20, tip[1] - 8, 16, 8), { fill: '#C0C4D8', ink: PAL.line, sw: 2 });
    neonLine([[tip[0] - 20, tip[1] - 8], tip], PAL.nCyan, 5, .8 + .2 * pulse2(t), 0);
    for (let i = 0; i < 8; i++) { const a = hash(i + Math.floor(t * 20)) * TAU, r = 20 + hash(i * 3 + Math.floor(t * 20)) * 60; neonLine([tip, [tip[0] + Math.cos(a) * r, tip[1] + Math.sin(a) * r]], PAL.nYellow, 2, .8, 0); }
    glow(tip[0], tip[1], 90, PAL.nCyan, .6);
    // battery over the room, refilling a step per beat
    battery(1320, 470, 1.6, bv);
    // the window: glare, neon script on the glass, rain drips
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(170,220,255,.06)'; for (const sx of [300, 1000, 1500]) { X.beginPath(); X.moveTo(sx, wy); X.lineTo(sx + 200, wy); X.lineTo(sx - 60, wy + wh); X.lineTo(sx - 260, wy + wh); X.fill(); } X.restore();
    X.strokeStyle = 'rgba(200,240,255,.35)'; X.lineWidth = 2.5;
    for (let i = 0; i < 40; i++) { const x = wx + hash(i * 3.7) * ww, sp = 60 + hash(i) * 140, y0 = wy + frac(hash(i * 9) + t * sp / wh) * wh, Ln = 20 + hash(i * 5) * 50; X.beginPath(); X.moveTo(x, y0); X.lineTo(x + Math.sin(y0 * .05) * 3, y0 + Ln); X.stroke(); X.fillStyle = 'rgba(210,245,255,.45)'; X.beginPath(); X.arc(x, y0 + Ln, 4, 0, TAU); X.fill(); }
    X.fillStyle = 'rgba(10,6,20,.55)'; X.fillRect(wx, wy, ww, 250);
    ntxt('why do today', 960, 205, 92, PAL.nPink, { font: 'Shantell', sw: .13 });
    ntxt('what AI can do tomorrow?', 960, 310, 82, PAL.nPink, { font: 'Shantell', sw: .13 });
    paint(rectPts(wx, wy, ww, wh), { ink: PAL.line, sw: 7 });
    // storefront sign above + sill
    signBoard(960, 90, 420, 66, 'UPGRADES', PAL.nCyan, { size: 44 });
    X.fillStyle = '#231640'; X.fillRect(wx - 30, wy + wh, ww + 60, 40); neonLine([[wx - 30, wy + wh], [wx + ww + 30, wy + wh]], PAL.nMagenta, 2.5, .8, 0);
    wetFloor(t, 970, [{ x: 400, w: 380, col: PAL.nPink, a: .2 }, { x: 1100, w: 420, col: PAL.nCyan, a: .15 }], { nSplash: 20 });
    camEnd();
    rainFG(t, { n: 120, alpha: .32 });
    FX.letterbox = .35;
  }

  // 5b · b164–168: close-up. The laser traces the chrome under his eye; he winces, it lights, the battery fills.
  function chromeCU(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const b = bpOf(t), k = clamp((b - 164) / 2), on = b >= 166, smirk = b >= 167;
    const p = easeOut(lt / dur);
    vgrad(0, 0, W, H, [[0, '#0A2430'], [1, '#08101E']]);
    glow(1500, 200, 700, '#9FF7FF', .25);
    const h = 3100, x = 1000 - 40 * p, y = 540 + .89 * h + 40 - 30 * p;
    hero(x, y, h, { view: 'q', flip: true, eyes: on ? (smirk ? 'determined' : 'wide') : 'closed', mouth: on ? (smirk ? 'smirk' : 'O') : 'teeth', brows: on ? (smirk ? 'angry' : 'up') : 'worried', sweat: on ? .3 : 1, chrome: on ? 1 : k * .8, glint: on ? 1 : 0, lookX: smirk ? .3 : 0 });
    // laser tool from the right, tracing under the eye (eye at local x ≈ +2.6 with flip)
    const ex = x + 4.6 * h / 100, ey = y - .89 * h + 6 * h / 100;
    if (!on) {
      const tx = ex + Math.sin(t * 9) * 22, ty = ey + Math.cos(t * 7) * 40;
      paint(capsule(W + 100, ty - 260, tx + 60, ty - 30, 60, 34), { fill: '#EEF0FA', shade: '#8A90B0', rim: '#FFFFFF', ink: PAL.line, sw: 4 });
      paint(capsule(tx + 60, ty - 30, tx + 12, ty - 4, 20, 8), { fill: '#9AA0B8', ink: PAL.line, sw: 3 });
      glow(tx, ty, 120, PAL.nCyan, .8);
      for (let i = 0; i < 10; i++) { const a = hash(i + Math.floor(t * 24)) * TAU, r = 40 + hash(i * 3 + Math.floor(t * 24)) * 110; neonLine([[tx, ty], [tx + Math.cos(a) * r, ty + Math.sin(a) * r]], i % 2 ? PAL.nYellow : '#FFFFFF', 3, .9, 0); }
    } else {
      glow(ex, ey + 40, 260, PAL.nCyan, .5 * Math.exp(-since(t, 166) * 3));
    }
    // HUD: battery refilling per beat, then full
    const n = clamp(Math.floor(b) - 164, 0, 3), bv = on ? 1 : [.45, .7][n] ?? .7;
    hud(90, 110, 520, 220, { col: on ? PAL.nGreen : PAL.nCyan });
    battery(160, 210, 2.2, Math.min(1, bv + .1 * clamp(since(t, 164 + n) * 3)));
    if (on) glow(ex - 40, ey + 60, 160, PAL.nCyan, .35 + .2 * pulse(t, 4));
    if (on) FX.flash = Math.max(FX.flash, .5 * Math.exp(-since(t, 166) * 8));
  }

  // 6a · b168–172: the monorail at night; the huge moon keeps pace.
  function trainOut(t, lt, dur) {
    style(1);
    vgrad(0, 0, W, H, [[0, '#070314'], [.55, '#1C0B3C'], [.8, '#4A1452'], [1, '#12081E']]);
    stars(t, 60, { ext: [W, 500], seed: 11 });
    moon(1420, 395, 290, { halo: '#FFE2B8' });
    cityX(t, { horizon: 1010, scroll: 800 + lt * 1400, street: false, seed: 9, tall: 1.2 });
    // track + pylons whipping past
    const sp = 700 / BEAT, off = ((t - B(168)) * sp + 350) % 700;
    for (let k = -1; k < 5; k++) { const x = k * 700 - off; paint([[x - 36, 800], [x + 36, 800], [x + 50, 1100], [x - 50, 1100]], { fill: '#1A1030', shade: '#0B0716', ink: PAL.line, sw: 2.5 }); }
    paint(rectPts(-40, 770, W + 80, 42), { fill: '#2A1E48', shade: '#15102A', ink: PAL.line, sw: 2.5 });
    neonLine([[-40, 800], [W + 40, 800]], PAL.nMagenta, 2.5, .8, 0);
    // speed streaks
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 30; i++) { const y = 150 + hash(i * 3.3) * 820, L = 200 + hash(i) * 500, x = W - ((hash(i * 7) * (W + L) + lt * (2600 + hash(i * 5) * 1400)) % (W + L + 400)); X.fillStyle = rgba(i % 3 ? '#FFFFFF' : PAL.nCyan, .12 + hash(i * 9) * .15); X.fillRect(x, y, L, 2 + hash(i * 11) * 2); }
    X.restore();
    // the train (two cars), bobbing slightly
    const bob = Math.sin(t * 9) * 3, ty = 772 + bob, s = 1.45;
    const winFn = (car) => (i, wx, wy, ww, wh) => {
      const g = X.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#FFE9C0'); g.addColorStop(1, '#E8A0C0'); X.fillStyle = g; X.globalAlpha = .9; X.fillRect(wx, wy, ww, wh); X.globalAlpha = 1;
      if (car === 0 && i === 3) { hero(wx + ww * .5, wy + wh + 150, 300, { view: 'q', eyes: 'open', lookX: .9, lookY: -.7, mouth: 'smile', tilt: -.08 }); return; }
      const seat = hash(car * 9 + i * 3.1);
      for (let k = 0; k < 2; k++) if (hash(car * 17 + i * 5 + k) < .75) {
        const px = wx + ww * (.28 + k * .45) + (seat - .5) * 10, py = wy + wh + 20;
        bust(px, py, 1, '#2A1A40', k === 1);
        X.fillStyle = PAL.nCyan; X.fillRect(px - 8 + (k ? -10 : 10), wy + wh - 26, 14, 20); glow(px + (k ? -3 : 17), wy + wh - 20, 26, PAL.nCyan, .5);
      }
    };
    for (let c = 0; c < 2; c++) train(120 + c * 1330 - lt * 30, ty, s, { windowFn: winFn(c) });
    glow(960, 700, 900, '#FFB0D0', .06);
    FX.letterbox = .35;
  }

  // v2: the reasoning-model wait. "Thinking" with a shimmer sweeping across it, and three pulsing dots (the …)
  function thinking(x, y, size, t, o = {}) {
    const A = o.alpha ?? 1, f = 'Rajdhani', w = txtW('Thinking', size, f), x0 = x - (w + size * .62) / 2, col = o.col || '#9FF7FF';
    if (o.pill) { const pw = w + size * 1.2, ph = size * 1.35; paint(rrPts(x - pw / 2, y - ph / 2, pw, ph, ph / 2), { fill: 'rgba(6,24,40,.72)', ink: null, alpha: A }); neonLine(rrPts(x - pw / 2, y - ph / 2, pw, ph, ph / 2), PAL.nCyan, Math.max(1, size / 22), .8 * A, 0, true); }
    const sx = x0 - size + frac(t * .9 + (o.seed || 0) * .37) * (w + size * 2);
    let cx = x0;
    for (const ch of 'Thinking') { const cw = txtW(ch, size, f), k = Math.exp(-Math.pow((cx + cw / 2 - sx) / (size * .9), 2)); txt(ch, cx, y, size, mixCol(mixCol(col, '#1A4A6A', .45), '#FFFFFF', k), { font: f, align: 'left', alpha: A }); cx += cw; }
    for (let i = 0; i < 3; i++) { const k = .35 + .65 * Math.max(0, Math.sin((t * 2.2 - i * .18) * TAU)); X.fillStyle = col; X.globalAlpha = A * k; X.beginPath(); X.arc(x0 + w + size * (.12 + i * .2), y + size * .24, size * .065, 0, TAU); X.fill(); }
    X.globalAlpha = 1;
  }
  // a cheap seated-passenger silhouette (head bowed over a phone) for windows
  function bust(x, y, s, col, fl) {
    X.fillStyle = col; X.beginPath(); X.moveTo(x - 38 * s, y); X.quadraticCurveTo(x - 36 * s, y - 62 * s, x, y - 64 * s); X.quadraticCurveTo(x + 36 * s, y - 62 * s, x + 38 * s, y); X.fill();
    X.beginPath(); X.arc(x + (fl ? -8 : 8) * s, y - 82 * s, 22 * s, 0, TAU); X.fill();
  }
  // 6b · b172–175: inside the car. Everyone stares at the same smiley on their phones; he watches the moon.
  function trainIn(t, lt, dur) {
    style(1);
    const p = easeOut(lt / dur);
    camBegin(960, 540, 1.0 + .04 * p);
    vgrad(-50, -50, W + 100, H + 100, [[0, '#2A1E48'], [.6, '#1C1236'], [1, '#0B0716']]);
    // windows: the moon holds still in the middle one while the city streaks past
    const wins = [[90, 150, 540, 400], [690, 130, 540, 440], [1290, 150, 540, 400]];
    wins.forEach(([wx, wy, ww, wh], i) => {
      X.save(); X.beginPath(); X.rect(wx, wy, ww, wh); X.clip();
      vgrad(wx, wy, ww, wh, [[0, '#0B0620'], [.7, '#3A1250'], [1, '#6A1A5E']]);
      stars(t, 14, { x0: wx, y0: wy, ext: [ww, wh * .6], seed: 30 + i });
      if (i === 1) moon(960, 320, 150, {});
      X.save(); X.translate(0, 0); cityX(t, { horizon: wy + wh + 30, scroll: lt * 2600 + 300 + i * 700, street: false, seed: 3, tall: .42, signs: 0 }); X.restore();
      X.globalCompositeOperation = 'lighter'; for (let k = 0; k < 8; k++) { X.fillStyle = rgba(NC[k % 5], .3); const y = wy + wh * .55 + hash(k * 4.1 + i) * wh * .4, x = wx + ww - ((hash(k + i * 3) * ww + lt * 3400) % (ww + 400)); X.fillRect(x, y, 260, 3); }
      X.restore();
      paint(rrPts(wx, wy, ww, wh, 26), { ink: '#6A5AAA', sw: 9 });
      X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,255,255,.05)'; X.beginPath(); X.moveTo(wx + 70, wy); X.lineTo(wx + 190, wy); X.lineTo(wx + 70, wy + wh); X.lineTo(wx - 50, wy + wh); X.fill(); X.restore();
    });
    // ceiling light, grab rail + hanging loops
    X.fillStyle = '#EDEAF8'; X.fillRect(0, 30, W, 22); glow(960, 42, 900, '#FFFFFF', .12);
    line([[0, 100], [W, 100]], 3, '#8A86A8', 0);
    for (let i = 0; i < 9; i++) { const x = 100 + i * 215, sw2 = Math.sin(t * 3 + i) * .08; line([[x, 100], [x + Math.sin(sw2) * 60, 160]], 2, '#8A86A8', 0); paint(ellPts(x + Math.sin(sw2) * 70, 178, 16, 20, 12), { ink: '#B8B4D8', sw: 2 }); }
    // benches on both sides; the floor
    X.fillStyle = '#120A22'; X.fillRect(-20, 960, W + 40, 200);
    for (const [x0, x1] of [[-20, 700], [1220, 1940]]) { paint(rectPts(x0, 812, x1 - x0, 50), { fill: '#3A2A6A', shade: '#221848', rim: '#7A6ADA', ink: PAL.line, sw: 2.5 }); X.fillStyle = '#1A1034'; X.fillRect(x0, 862, x1 - x0, 100); }
    // passengers: heads bowed, faces lit by the same smiley on every phone
    for (const [px, fl] of [[170, 0], [470, 1], [1450, 0], [1750, 1]]) {
      const h = 560, y = 1040;
      hero(px, y, h, { view: 'q', flip: !!fl, ...POSES.sit, aL: [.2, -2.3], aR: [.2, -2.3], silhouette: '#3A2A62', tilt: .35 });
      const phx = px + (fl ? -6 : 6), phy = y - .6 * h;
      glow(phx, phy - 90, 120, PAL.nCyan, .4);
      paint(rrPts(phx - 26, phy - 44, 52, 88, 8), { fill: '#0B0716', ink: '#8A86A8', sw: 1.5 });
      X.fillStyle = '#123A5A'; X.fillRect(phx - 21, phy - 38, 42, 76);
      mask(phx, phy - 14, 13, { eyes: 'open', mouth: 'smile', glow: .6 });
      for (let e = 0; e < 3; e++) emdash(phx - 10 + e * 10, phy + 14 + e * 7, .28, Math.sin(t * 4 + e) * .3, { face: false });
      // the same AR pop-up floats over every phone: everyone is waiting on the model
      const bob = Math.sin(t * 3 + px) * 6;
      const qx = phx + (px < 960 ? 22 : -22);
      line([[phx, phy - 48], [qx, phy - 118 + bob]], 1.5, rgba(PAL.nCyan, .5), 0);
      thinking(qx, phy - 150 + bob, 38, t, { pill: true, seed: px });
    }
    { const k = frac(bpOf(t)), x = lerp(-600, W + 200, k); X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createLinearGradient(x, 0, x + 400, 0); g.addColorStop(0, 'rgba(255,200,240,0)'); g.addColorStop(.5, 'rgba(255,200,240,.10)'); g.addColorStop(1, 'rgba(255,200,240,0)'); X.fillStyle = g; X.beginPath(); X.moveTo(x, -50); X.lineTo(x + 400, -50); X.lineTo(x + 250, H + 50); X.lineTo(x - 150, H + 50); X.fill(); X.restore(); }
    // him: standing at the middle window, hand on the glass, watching the moon keep pace
    hero(960, 1050, 640, { view: 'back', aR: [2.5, .5], aL: [.2, .2], emblem: .4 + .3 * pulse(t, 3), tilt: -.08 });
    camEnd();
    FX.letterbox = .35;
  }
  // 6c · b175–176: insert: one phone. The smiley, and em-dash worms crawling off the screen.
  function phoneCU(t, lt, dur) {
    style(1); FX.letterbox = .35;
    vgrad(0, 0, W, H, [[0, '#120A22'], [1, '#07040F']]);
    const k = easeOut(lt / dur);
    glow(960, 540, 700, PAL.nCyan, .3);
    paint(rrPts(700, 60, 520, 980, 60), { fill: '#0B0716', shade: '#05030A', ink: '#8A86A8', sw: 3, rim: '#5A5A7A' });
    X.fillStyle = '#0E2A44'; X.fillRect(730, 120, 460, 860);
    mask(960, 380, 140, { eyes: 'happy', mouth: 'grin', glow: .8 });
    thinking(960, 640, 76, t, { seed: 3 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .3, r = 200 + 380 * k * (.7 + hash(i) * .5); emdash(960 + Math.cos(a) * r * 1.1, 560 + Math.sin(a) * r * .8, 2.4, a + Math.sin(t * 6 + i) * .35, { seed: i }); }
    // his thumb
    paint(capsule(1350, 1200, 1130, 820, 90, 70), { fill: HERO.skinN, shade: HERO.skinNDk, ink: PAL.line, sw: 3 });
  }

  // 7a · b176–180: Moloch. A giant idol of billboards; every arm holds the same rocket; one launches per beat.
  function molochArms(cx, cy, s) {
    const arms = [];
    for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) {
      const sh = [cx + sd * 170 * s, cy - 210 * s + j * 150 * s], a1 = -Math.PI / 2 + sd * (.95 + j * .42 + .05 * Math.sin(T * 1.6 + j * 1.3 + sd)), L1 = 250 * s, e = [sh[0] + Math.cos(a1) * L1, sh[1] + Math.sin(a1) * L1];
      const a2 = a1 - sd * (.55 - j * .08), L2 = 230 * s, hnd = [e[0] + Math.cos(a2) * L2, e[1] + Math.sin(a2) * L2];
      arms.push({ sd, j, sh, e, hnd });
    }
    return arms;
  }
  function billPanel(a, b2, th, col, seed, t) {
    const mx = (a[0] + b2[0]) / 2, my = (a[1] + b2[1]) / 2, L = Math.hypot(b2[0] - a[0], b2[1] - a[1]) + th * .3, ang = Math.atan2(b2[1] - a[1], b2[0] - a[0]);
    X.save(); X.translate(mx, my); X.rotate(ang);
    X.fillStyle = '#12081C'; X.fillRect(-L / 2 - 6, -th / 2 - 6, L + 12, th + 12);
    const g = X.createLinearGradient(-L / 2, 0, L / 2, 0); g.addColorStop(0, rgba(col, .55)); g.addColorStop(1, rgba(col, .15)); X.fillStyle = g; X.fillRect(-L / 2, -th / 2, L, th);
    X.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 3; i++) X.fillRect(-L / 2 + 10 + hash(seed + i) * L * .5, -th / 2 + 8 + i * th * .28, L * (.2 + hash(seed * 3 + i) * .3), th * .1);
    X.strokeStyle = PAL.line; X.lineWidth = 4; X.strokeRect(-L / 2, -th / 2, L, th);
    X.restore();
    neonLine([a, b2], col, 2, .5, 0);
  }
  function molochIdol(cx, cy, s, t, o = {}) {
    // arms (behind)
    const arms = molochArms(cx, cy, s);
    arms.forEach((A, i) => { billPanel(A.sh, A.e, 70 * s, NC[i % 5], i * 7, t); billPanel(A.e, A.hnd, 58 * s, NC[(i + 2) % 5], i * 9 + 3, t); paint(ellPts(A.e[0], A.e[1], 22 * s, 22 * s, 12), { fill: '#241A3A', ink: PAL.line, sw: 2 }); });
    // torso: a stack of screens
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const w = 110 * s, h = 90 * s, x = cx - 1.5 * w - 6 * s + c * (w + 6 * s), y = cy - 260 * s + r * (h + 6 * s), id = r * 3 + c;
      X.fillStyle = '#12081C'; X.fillRect(x - 5, y - 5, w + 10, h + 10);
      if (id === 4) maskScreen(x, y, w, h, { eyes: 'narrow', mouth: 'smirk', frame: false, r: .38, col: PAL.nRed });
      else if (id === 7) { X.fillStyle = '#1A0A10'; X.fillRect(x, y, w, h); chart(x + 12, y + 10, w - 24, h - 22, 'up', 1, { col: PAL.nGreen, w: 3, sw: 1.5 }); }
      else { const col = NC[(id * 3) % 5]; X.fillStyle = rgba(col, .35 + .25 * hash(id + Math.floor(t * 6))); X.fillRect(x, y, w, h); X.fillStyle = 'rgba(255,255,255,.55)'; X.fillRect(x + 10, y + h * .3, w * .6 * hash(id * 3), h * .12); X.fillRect(x + 10, y + h * .55, w * .4, h * .1); }
      X.strokeStyle = PAL.line; X.lineWidth = 3; X.strokeRect(x, y, w, h);
    }
    // head: a big screen with horns and burning eyes
    const hw = 330 * s, hh = 230 * s, hx = cx - hw / 2, hy = cy - 520 * s;
    for (const sd of [-1, 1]) { const hp = [[cx + sd * hw * .42, hy + 20 * s], [cx + sd * hw * .7, hy - 20 * s], [cx + sd * hw * .78, hy - 90 * s], [cx + sd * hw * .62, hy - 140 * s]]; paint(ribbon(hp, k => (1 - k * .85) * 24 * s), { fill: '#2A1020', shade: '#12060E', ink: PAL.line, sw: 2.5, curv: .5 }); neonLine(hp, PAL.nRed, 3, .9, .5); }
    X.fillStyle = '#12081C'; X.fillRect(hx - 10, hy - 10, hw + 20, hh + 20);
    X.fillStyle = '#2A0610'; X.fillRect(hx, hy, hw, hh);
    for (const sd of [-1, 1]) { const ex = cx + sd * 72 * s, ey = hy + hh * .42; glow(ex, ey, 110 * s, PAL.nRed, .6 + .4 * pulse(T, 4)); paint([[ex - 46 * s, ey - 10 * s], [ex + 46 * s, ey - 22 * s * sd * -1 - 10 * s], [ex + 30 * s, ey + 18 * s], [ex - 36 * s, ey + 16 * s]], { fill: '#FFD0C0', ink: null, flat: true }); }
    X.fillStyle = PAL.nRed; for (let i = 0; i < 6; i++) X.fillRect(cx - 90 * s + i * 32 * s, hy + hh * .75, 20 * s, 18 * s);
    X.strokeStyle = PAL.nRed; X.lineWidth = 3; X.strokeRect(hx, hy, hw, hh);
    return arms;
  }
  // launches: arm order and beat
  const LAUNCH = [[0, 176], [3, 177], [1, 178], [4, 179], [2, 180], [5, 181], [0, 182], [3, 183]];
  function idolRockets(t, arms, s, o = {}) {
    arms.forEach((A, i) => {
      // the latest launch from this arm at or before t, and the next one
      const mine = LAUNCH.filter(L => L[0] === i).map(L => L[1]);
      let last = null; for (const n of mine) if (t >= B(n)) last = n;
      const rs = .27 * s;
      // flying rockets from this arm
      for (const n of mine) if (t >= B(n)) {
        const d = since(t, n), y = A.hnd[1] - (d * d * 2600 + d * 300) * s, x = A.hnd[0] + A.sd * d * 60 * s;
        for (let k = 0; k < 6; k++) { const yy = y + (40 + k * 60) * s * (1 + d * 3); if (yy > A.hnd[1]) break; X.fillStyle = rgba('#E8D8FF', .14 * (1 - k / 6) * Math.exp(-d)); X.beginPath(); X.arc(x + Math.sin(k + d * 4) * 10 * s, yy, (14 + k * 7 + d * 14) * s, 0, TAU); X.fill(); }
        const g = X.createLinearGradient(0, y, 0, A.hnd[1] + 40); g.addColorStop(0, rgba(PAL.nOrange, .7)); g.addColorStop(1, rgba(PAL.nOrange, 0));
        X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = g; X.fillRect(x - 16 * s, y, 32 * s, Math.max(0, A.hnd[1] + 40 - y)); X.restore();
        rocket(x, y, rs, { flame: 1, window: 'mask' });
      }
      // the rocket waiting in the hand (restocked half a beat after each launch)
      const restock = last == null ? 1 : clamp((t - B(last + .5)) * 5);
      if (restock > 0) { X.save(); X.translate(A.hnd[0], A.hnd[1]); X.scale(backOut(restock), backOut(restock)); rocket(0, 0, rs, { flame: .15 + .1 * Math.sin(t * 30 + i), window: 'mask' }); X.restore(); }
      paint(ellPts(A.hnd[0], A.hnd[1] + 10 * s, 34 * s, 22 * s, 14), { fill: '#241A3A', ink: PAL.line, sw: 2, rim: '#FF6A4A', shade: '#120A1E' });
    });
  }
  function moloch(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const p = easeInOut(lt / dur);
    camBegin(960, 560 - 60 * p, 1.02 + .04 * p);
    vgrad(-100, -100, W + 200, H + 200, [[0, '#0A0208'], [.4, '#3A0818'], [.75, '#A8201E'], [.92, '#FF6A1F'], [1, '#2A0A10']]);
    glow(960, 900, 1100, PAL.nOrange, .3);
    const arms = molochIdol(960, 720, .95, t);
    idolRockets(t, arms, .95);
    cityX(t, { horizon: 1090, scroll: 200, street: false, seed: 13, tall: .75, lit: .6 });
    hud(640, 100, 640, 420, { col: PAL.nRed, label: 'MOLOCH', size: 40, corner: 60 });
    camEnd();
    FX.tint = PAL.nRed; FX.tintA = .12;
  }
  // 7b · b180–184: he watches from a rooftop; identical rockets race each other to the moon.
  function molochRace(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const p = easeInOut(lt / dur);
    camBegin(960, 540 - 50 * p, 1);
    vgrad(-100, -100, W + 200, H + 200, [[0, '#08030E'], [.5, '#2A0A22'], [.85, '#8A1A20'], [1, '#FF5A1F']]);
    stars(t, 50, { ext: [W, 500], seed: 17 });
    moon(1580, 190, 120, {});
    const arms = molochIdol(1180, 900, .55, t);
    // racing rockets: identical, jostling for the lead
    const racers = [0, 1, 2, 3].map(i => {
      const n = 180 + i, d = Math.max(0, since(t, n)), A = arms[LAUNCH[4 + i][0]];
      const y = A.hnd[1] - (d * d * 900 + d * 200) - 40 * Math.sin(d * 4 + i * 1.7) * clamp(d), x = lerp(A.hnd[0], 1100 + i * 150, easeOut(d * .8));
      return { x, y, d, n, col: NC[i], i };
    });
    for (const R of racers) if (t >= B(R.n)) {
      const g = X.createLinearGradient(0, R.y, 0, R.y + 800); g.addColorStop(0, rgba(R.col, .8)); g.addColorStop(1, rgba(R.col, 0));
      X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = g; X.fillRect(R.x - 22, R.y, 44, 800); X.restore();
      rocket(R.x, R.y, .22, { flame: 1, window: 'mask' });
    }
    idolRockets(t, arms, .55);
    cityX(t, { horizon: 1110, scroll: 900, street: false, seed: 21, tall: .7, lit: .5 });
    // rooftop + him (back view), emblem glowing
    paint(rectPts(-60, 930, 1000, 300), { fill: '#120A20', shade: '#07040F', ink: PAL.line, sw: 3, rim: '#FF6A4A' });
    neonLine([[-60, 932], [940, 932]], PAL.nOrange, 2.5, .8, 0);
    hero(430, 1010, 620, { view: 'back', emblem: .5 + .5 * pulse(t, 4), hairWind: .4, tilt: .06 });
    hud(1040, 560, 290, 230, { col: PAL.nRed, label: 'MOLOCH', size: 34, corner: 40 });
    camEnd();
    FX.tint = PAL.nRed; FX.tintA = .1;
  }

  // 8a · b184–188: the paperclip factory under MAXIMIZE. A smiley robot arm happily adds clips on every beat.
  function clipFactory(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const p = easeInOut(lt / dur), b = bpOf(t);
    camBegin(960 + 40 * p, 540, 1.02);
    vgrad(-100, -100, W + 200, H + 200, [[0, '#120610'], [1, '#2A0E1E']]);
    // wall: steel columns, windows with rain
    for (let i = 0; i < 6; i++) { const x = -40 + i * 380; X.fillStyle = '#1C0E24'; X.fillRect(x, -100, 60, 1300); paint(rectPts(x + 90, 330, 250, 200), { fill: '#1A0F36', ink: PAL.line, sw: 2 }); }
    // MAXIMIZE
    const fl = hash(Math.floor(t * 10)) < .08 ? .4 : 1;
    X.fillStyle = '#0A0406'; X.fillRect(410, 50, 1100, 220);
    glow(960, 160, 700, PAL.nRed, .3 * fl);
    txt('MAXIMIZE', 960, 162, 190, '#FF4040', { font: 'Anton', stroke: '#FFB0A8', sw: 5, alpha: fl, track: 12 });
    neonLine(rectPts(410, 50, 1100, 220), PAL.nOrange, 3, .8 * fl, 0, true);
    // hanging lamps with light cones over the line
    for (const lx of [560, 1000, 1440]) {
      line([[lx, 270], [lx, 340]], 3, '#3A2A48', 0);
      paint([[lx - 50, 380], [lx - 22, 336], [lx + 22, 336], [lx + 50, 380]], { fill: '#3A2A48', shade: '#1E1428', ink: PAL.line, sw: 2.5 });
      X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createLinearGradient(0, 380, 0, 760); g.addColorStop(0, rgba('#FFB070', .28 + .1 * pulse(t, 5))); g.addColorStop(1, rgba('#FFB070', 0)); X.fillStyle = g; X.beginPath(); X.moveTo(lx - 48, 380); X.lineTo(lx + 48, 380); X.lineTo(lx + 220, 780); X.lineTo(lx - 220, 780); X.fill(); X.restore();
      glow(lx, 384, 60, '#FFD0A0', .6);
    }
    // hopper chute (left) dropping clips
    paint([[80, 380], [420, 380], [320, 600], [180, 600]], { fill: '#3A2A48', shade: '#1E1428', rim: '#FF8A5A', ink: PAL.line, sw: 3 });
    // conveyor
    const by = 760, sp = 360;
    paint(rectPts(-60, by, W + 120, 60), { fill: '#241A30', shade: '#120A1C', ink: PAL.line, sw: 3 });
    X.fillStyle = '#3A2E48'; for (let x = -((lt * sp) % 80) - 80; x < W + 80; x += 80) X.fillRect(x, by + 4, 40, 8);
    for (let x = 30; x < W; x += 120) { paint(ellPts(x, by + 70, 26, 26, 12), { fill: '#3A2E48', ink: PAL.line, sw: 2 }); const a = lt * sp / 26; line([[x, by + 70], [x + Math.cos(a) * 22, by + 70 + Math.sin(a) * 22]], 2, '#8A7AAA', 0); }
    X.fillStyle = '#12081A'; X.fillRect(-60, by + 100, W + 120, 400);
    // clips on the belt: density grows every beat
    const nb = clamp(Math.floor(b) - 184, 0, 3);
    for (let i = 0; i < 70; i++) {
      if (hash(i * 3.3) > .35 + nb * .18) continue;
      const x = ((i * 53 + lt * sp) % (W + 200)) + 180; if (x > W + 100) continue;
      paperclip(x, by - 8 - (hash(i) * 14), .55 + hash(i * 5) * .15, Math.PI / 2 + hash(i * 7) * .6 - .3);
    }
    // falling clips from the chute
    for (let i = 0; i < 10; i++) { const k = frac(t * 1.8 + i / 10), x = 250 + Math.sin(i * 3) * 40, y = 600 + k * 150; paperclip(x, y, .6, k * 6 + i); }
    // the spill pile on the right
    const pile = 60 + nb * 45 + 20 * clamp(since(t, 184 + nb) * 4);
    paint([[1500, by + 100], [1700, by + 100 - pile], [1920 + 60, by + 100 - pile * 1.3], [1980, by + 100]], { fill: '#34345E', shade: '#1E1E3E', ink: PAL.line, sw: 2.5, curv: .5 });
    for (let i = 0; i < 60; i++) { const u = hash(i * 3), x = 1530 + u * 420; paperclip(x, by + 100 - hash(i * 7) * pile * (.4 + u * .9), .5, hash(i * 11) * 6); }
    // the robot arm with a smiley for a head: swings from bin to belt on every beat
    const ph = frac(b), sw = (Math.floor(b) % 2 ? 1 : -1), swing = sw * (1 - 2 * easeInOut(clamp(ph * 2.5)));
    const base = [960, 1000], sh = [960, 880], a1 = -Math.PI / 2 + swing * .45, el = [sh[0] + Math.cos(a1) * 220, sh[1] + Math.sin(a1) * 220], a2 = a1 + .9 - swing * .3, wr = [el[0] + Math.cos(a2) * 190, el[1] + Math.sin(a2) * 190];
    paint(rrPts(base[0] - 110, base[1] - 60, 220, 90, 14), { fill: PAL.nYellow, shade: '#B89A10', ink: PAL.line, sw: 3 });
    for (const [a, c, w] of [[sh, el, 44], [el, wr, 34]]) paint(capsule(a[0], a[1], c[0], c[1], w, w * .8), { fill: PAL.nYellow, shade: '#C89A10', rim: '#FFFFA0', ink: PAL.line, sw: 3 });
    for (const j of [sh, el]) paint(ellPts(j[0], j[1], 38, 38, 16), { fill: '#3A2E48', ink: PAL.line, sw: 3 });
    // gripper with a handful of clips
    paint(capsule(wr[0], wr[1], wr[0] + 30, wr[1] + 60, 16, 12), { fill: '#8A86A8', ink: PAL.line, sw: 2.5 });
    for (let i = 0; i < 4; i++) paperclip(wr[0] + 20 + i * 12, wr[1] + 70 + i * 4, .5, 1.2 + i * .4);
    mask(el[0], el[1] - 70, 88, { eyes: 'happy', mouth: 'grin', rot: swing * .15 + Math.sin(t * 8) * .05, glow: .7 });
    camEnd();
    FX.tint = PAL.nOrange; FX.tintA = .06;
  }
  // 8b · b188–192: clips pour into the street and pile up around him. He side-eyes it.
  function clipStreet(t, lt, dur) {
    style(1); FX.letterbox = .35;
    const b = bpOf(t), nb = clamp(Math.floor(b) - 188, 0, 3), lvl = nb * 38 + 38 * easeOut(clamp(since(t, 188 + nb) * 4));
    const p = easeOut(lt / dur);
    camBegin(960, 540 + 20 * p, 1.04 - .04 * p);
    vgrad(-100, -100, W + 200, H + 200, [[0, '#0A0418'], [.6, '#2A0E3A'], [1, '#12081E']]);
    cityX(t, { horizon: 760, scroll: 1500, street: false, seed: 25, tall: .9 });
    // factory facade with the roller door
    paint(rectPts(-80, 120, 900, 900), { fill: '#1C0E2A', shade: '#0E0718', ink: PAL.line, sw: 3, rim: '#FF6A4A' });
    X.fillStyle = '#0A0406'; X.fillRect(40, 150, 700, 120); glow(390, 212, 320, PAL.nRed, .35); txt('MAXIMIZE', 390, 212, 96, '#FF4040', { font: 'Anton', stroke: '#FFB0A8', sw: 3, track: 6 });
    X.fillStyle = '#FF8A3A'; X.fillRect(140, 380, 520, 560); glow(400, 700, 500, PAL.nOrange, .45);
    X.fillStyle = '#3A2A48'; for (let i = 0; i < 5; i++) X.fillRect(140, 330 + i * 12, 520, 7);
    // the smiley arm waving from the door
    const wv = Math.sin(t * 9) * .3;
    const sh = [540, 915], el = [690 + wv * 30, 730], hd = [610 + wv * 90, 540];
    paint(rrPts(470, 900, 150, 44, 10), { fill: PAL.nYellow, shade: '#B89A10', ink: PAL.line, sw: 3 });
    for (const [a, c, w] of [[sh, el, 30], [el, hd, 24]]) paint(capsule(a[0], a[1], c[0], c[1], w, w * .8), { fill: PAL.nYellow, shade: '#C89A10', rim: '#FFFFA0', ink: PAL.line, sw: 3 });
    for (const j of [sh, el]) paint(ellPts(j[0], j[1], 28, 28, 14), { fill: '#3A2E48', ink: PAL.line, sw: 3 });
    mask(hd[0], hd[1] - 40, 84, { eyes: 'happy', mouth: 'grin', rot: wv * .4, glow: .7 });
    // street + the flood of clips
    wetFloor(t, 940, [{ x: 150, w: 500, col: PAL.nOrange, a: .25 }, { x: 60, w: 700, col: PAL.nRed, a: .12 }], { nSplash: 20 });
    const surf = x => 1000 - lvl * (1 - x / 2400) - 40 * Math.exp(-Math.pow((x - 400) / 300, 2)) - 10 * Math.sin(x * .02 + t * 3);
    const pts = [[100, 1200]]; for (let x = 100; x <= 2000; x += 60) pts.push([x, surf(x)]); pts.push([2000, 1200]);
    paint(pts, { fill: '#34345E', shade: '#1E1E3E', ink: PAL.line, sw: 2.5, curv: .4, light: [0, -.2] });
    for (let i = 0; i < 230; i++) { const x = 120 + hash(i * 3.1) * 1850, y = surf(x) + 4 + Math.pow(hash(i * 7.3), 1.4) * 170; paperclip(x, y, .5 + hash(i) * .3, hash(i * 11) * 6 + t * (hash(i * 5) - .5) * .5); }
    X.fillStyle = '#FFFFFF'; for (let i = 0; i < 30; i++) { const x = 140 + hash(i * 13.1) * 1800, y = surf(x) + 10 + hash(i * 5.7) * 120, tw = .5 + .5 * Math.sin(t * 8 + i * 2); X.globalAlpha = tw; X.fillRect(x - 1, y - 7, 2, 14); X.fillRect(x - 7, y - 1, 14, 2); } X.globalAlpha = 1;
    // tumbling clips flying out the door
    for (let i = 0; i < 14; i++) { const k = frac(t * 1.3 + i / 14), x = 400 + k * (500 + hash(i) * 900), y = 700 + k * 200 - Math.sin(k * Math.PI) * 260 * (.5 + hash(i * 3)); paperclip(x, y, .7, k * 9 + i); }
    // him, knee deep, side-eyeing it
    const h = 700, hx = 1440, hy = 1010;
    hero(hx, hy, h, { view: 'q', ...POSES.hips, eyes: 'narrow', lookX: -1, lookY: .1, mouth: 'flat', brows: 'flat', sweat: .5 + .5 * nb / 3, tilt: -.04 });
    // clips in front of his legs (the pile is rising)
    const pts2 = [[hx - 260, 1200]]; for (let x = hx - 260; x <= hx + 260; x += 40) pts2.push([x, hy + 20 - lvl * .9 - 12 * Math.sin(x * .05)]); pts2.push([hx + 260, 1200]);
    paint(pts2, { fill: '#34345E', shade: '#1E1E3E', ink: PAL.line, sw: 2.5, curv: .4 });
    for (let i = 0; i < 50; i++) paperclip(hx - 250 + hash(i * 5) * 500, hy + 26 - lvl * .9 + Math.pow(hash(i * 9), 1.3) * 110, .55, hash(i * 13) * 6);
    camEnd();
    rainFG(t, { n: 90, alpha: .26 });
  }

  // 9 · b192–200: break. The moon turns and it IS the mask; tentacles rise behind the skyline; 3 · 2 · 1 · white.
  // v2: the face is the real mask() (his pale-yellow lopsided mask, dash eyes, lopsided smile). It rides in on the sphere,
  // foreshortened, while the craters roll off the other limb; then the round silhouette morphs into the mask's outline.
  let _maskPolar = null;
  function maskPolar(a) {   // radius of the mask outline (r = 1) along angle a, from its centre
    if (!_maskPolar) {
      const P = maskShape(1), N = 96; _maskPolar = [];
      for (let i = 0; i < N; i++) {
        const an = i / N * TAU, dx = Math.cos(an), dy = Math.sin(an); let best = 1;
        for (let j = 0; j < P.length; j++) {
          const [px, py] = P[j], [qx, qy] = P[(j + 1) % P.length], ex = qx - px, ey = qy - py, den = dx * ey - dy * ex; if (Math.abs(den) < 1e-9) continue;
          const tt = (px * ey - py * ex) / den, u = (px * dy - py * dx) / den; if (tt > 0 && u >= 0 && u <= 1) { best = tt; break; }
        }
        _maskPolar.push(best);
      }
    }
    const f = ((a / TAU) % 1 + 1) % 1 * _maskPolar.length, i = Math.floor(f), k = f - i;
    return lerp(_maskPolar[i % _maskPolar.length], _maskPolar[(i + 1) % _maskPolar.length], k);
  }
  SHARED.maskPolar = maskPolar;
  function moonTurn(x, y, R, k, o = {}) {
    const rm = R * .9, m = easeInOut(seg(k, .55, 1)), cc = seg(k, .3, .95);
    const col = mixCol('#FFF4D8', MOD.maskCol, cc), sh = mixCol('#E2C48A', MOD.maskDk, cc);
    const sil = []; for (let i = 0; i < 72; i++) { const an = i / 72 * TAU, rr = lerp(R, rm * maskPolar(an), m); sil.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); }
    glow(x, y, R * 3, mixCol('#FFE9A8', PAL.nYellow, k), .3 + .1 * k); glow(x, y, R * 1.6, '#FFFFFF', .2);
    paint(sil, { fill: col, shade: sh, light: [-.14, -.1], ink: k > .4 ? PAL.line : null, sw: R / 40 * clamp(k * 2.5 - 1), rim: '#FFFFFF', curv: .3 });
    X.save(); tracePath(X, sil, .3); X.clip();
    const rot = k * Math.PI * .75;
    const cr = [[-.7, -.3, .2], [.3, .1, .16], [-.1, .45, .12], [.55, -.5, .1], [-.9, .25, .09], [1.1, -.1, .14], [.9, .4, .1], [1.5, .2, .18], [2.0, -.3, .12]];
    for (const [lon, lat, cs] of cr) { const L = lon + rot, c = Math.cos(L); if (c <= .02) continue; paint(ellPts(x + Math.sin(L) * Math.cos(lat) * R, y + Math.sin(lat) * R, cs * R * c, cs * R * .9, 16), { fill: mixCol('#E6D2A4', MOD.maskDk, cc * .6), ink: null, alpha: .85 * (1 - k * .85) }); }
    const phi = -Math.PI * .75 + rot, c = Math.cos(phi);
    // the face is painted on the sphere: clip the decal inside its own outline (only the final silhouette gets inked)
    if (c > .03) { X.save(); X.translate(x + Math.sin(phi) * R * .88, y); X.scale(c, 1); tracePath(X, maskShape(rm * lerp(.93, 1.05, m)), .2); X.clip(); mask(0, 0, rm, { ...o, col, glow: 0, tilt3d: 0 }); X.restore(); }
    X.restore();
  }
  // dark tentacles rising behind the skyline: the shared tentacle() in silhouette colours (its little eyes stay pale)
  function darkTentacles(t, tk, o = {}) {
    for (let i = 0; i < 8; i++) {
      const sd = i % 2 ? 1 : -1, j = Math.floor(i / 2), x0 = 960 + sd * (330 + j * 150), a = -Math.PI / 2 - sd * (.12 + j * .16 + hash(i) * .15);
      tentacle(x0, 980, a, (420 + j * 90 + hash(i * 3) * 160) * tk + 60, 64 - j * 8, t * .7, i * 3 + 1, { col: '#120A24', dk: '#07040F', rim: '#6A2A8A', curl: 1.4, amp: .5, eyes: o.eyes ?? true });
    }
  }
  function moonMask(t, lt, dur) {
    style(1);
    const b = bpOf(t), k = easeInOut(seg(b, 192.3, 196)), cd = b >= 196 ? Math.min(3, Math.floor(b) - 195) : 0;
    const zoom = 1 + [0, .07, .15, .26][cd] + .015 * lt;
    camBegin(960, 470 - 40 * (cd / 3), zoom);
    vgrad(-300, -300, W + 600, H + 600, [[0, '#04020A'], [.4, '#150A30'], [.62, '#3A1250'], [.72, '#7A1E5E'], [.8, '#2A0E3A'], [1, '#0A0616']]);
    stars(t, 90, { ext: [W, 600], seed: 23 });
    const mx = 960, my = 380, mr = 290;
    const mood = b >= 198 ? { eyes: 'open', mouth: 'grin', eyeGlow: true } : b >= 197 ? { eyes: 'happy', mouth: 'grin' } : b >= 196 ? { eyes: 'closed', mouth: 'smile' } : { eyes: 'closed', mouth: 'smile' };
    const look = [-.35, .45], crack = seg(b, 198.45, 198.95);
    if (k < 1) moonTurn(mx, my, mr, k, { ...mood, look });
    else {
      glow(mx, my, mr * 3, PAL.nYellow, .4); glow(mx, my, mr * 1.6, '#FFFFFF', .2);
      const hop = cd ? Math.exp(-since(t, 195 + cd) * 9) : 0;
      mask(mx, my - hop * 12, mr * .9 * (1 + .03 * hop), { ...mood, look, col: MOD.maskCol, glow: .9, crack, rot: Math.sin(t * 2) * .02 });
      if (crack > 0) glow(mx + mr * .05, my - mr * .4, mr * .6 * crack, PAL.nMagenta, .5 * crack);
    }
    // tentacle silhouettes rising behind the skyline, framing the moon
    darkTentacles(t, easeOut(seg(b, 192.8, 198.5)));
    // skyline, windows mostly dark (the silence)
    cityX(t, { horizon: 1010, scroll: 300, street: false, seed: 31, lit: .35, signs: 0, tall: .72 });
    X.fillStyle = 'rgba(8,4,18,.4)'; X.fillRect(-300, 760, W + 600, 700);
    // him, small on a rooftop in the foreground, looking up
    paint([[-300, 905], [620, 905], [640, 1400], [-300, 1400]], { fill: '#07040F', ink: PAL.line, sw: 2 });
    neonLine([[-300, 906], [620, 906]], PAL.nViolet, 2, .6, 0);
    hero(430, 908, 280, { view: 'back', emblem: .5 + .5 * k, tilt: -.05, hairWind: .3 });
    camEnd();
    if (cd) { const n = 196 + cd - 1; cap(String(4 - cd), 1530, 600, 330, cd === 3 ? PAL.nYellow : '#FFFFFF', { font: 'Anton', stroke: '#000', sw: 30, pop: since(t, n) * 7, rot: cd % 2 ? .08 : -.06 }); FX.zoom *= 1 + .05 * Math.exp(-since(t, n) * 8); FX.shake += 10 * Math.exp(-since(t, n) * 8); }
    if (b >= 199) { FX.flash = Math.max(FX.flash, 1 - since(t, 199) * .9); FX.flashCol = '#FFFFFF'; }
    FX.letterbox = .6 - .6 * seg(b, 198, 199);
  }

  chapter('city', B(136), B(200), [
    [B(136), street],
    [B(140), tvWall],
    [B(144), dataCentre, { tin: 'whip' }],
    [B(148), gpuBrrr],
    [B(152), parrotGag, { tin: 'zoom' }],
    [B(156), strawberry],
    [B(160), clinic, { tin: 'whip' }],
    [B(164), chromeCU],
    [B(168), trainOut, { tin: 'flash' }],
    [B(172), trainIn],
    [B(175), phoneCU],
    [B(176), moloch, { tin: 'glitch' }],
    [B(180), molochRace],
    [B(184), clipFactory, { tin: 'whip' }],
    [B(188), clipStreet],
    [B(192), moonMask, { tin: 'black', td: .4 }],
  ]);
  POSTCARDS.city = t => street(t, 1.2, 2.7);
  POSTCARDS.train = t => trainOut(t, 1.5, 1.37);
})();
