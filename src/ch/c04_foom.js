// src/ch/c04_foom.js: Act IV · FOOM (b200–b264, 68.59–90.53 s). The main drop: a cut on every beat (half-beats in the
// callback montage), heavy FX, big captions, full neon. Exports POSTCARDS.foom and POSTCARDS.rocket.
(() => {
  const B = n => bt(n);
  const NY = PAL.nYellow, NC = PAL.nCyan, NM = PAL.nMagenta, NO = PAL.nOrange, NV = PAL.nViolet, NG = PAL.nGreen, NR = PAL.nRed, NP = PAL.nPink;

  // =====================================================================================================
  // private helpers
  // =====================================================================================================
  const sky = (stops, pad = 0) => vgrad(-pad, -pad, W + pad * 2, H + pad * 2, stops);
  // house-style caption: Anton, black stroke, pops in (dt = seconds since it should land)
  const capPop = (s, x, y, size, col, dt, o = {}) => cap(s, x, y, size, col, { font: 'Anton', stroke: '#000', sw: size * .12, pop: clamp(dt * 6), follow: true, ...o });
  // radial burst of coloured rays
  function rays(cx, cy, n, cols, rot = 0, a = 1, R = 2600) {
    X.save(); X.globalAlpha = a;
    for (let i = 0; i < n; i++) {
      const a0 = rot + i / n * TAU, a1 = a0 + TAU / n * .55;
      X.fillStyle = cols[i % cols.length]; X.beginPath(); X.moveTo(cx, cy);
      X.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); X.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); X.closePath(); X.fill();
    }
    X.restore();
  }
  // cheap flat skyline (one layer): towers on a fixed lattice so `scroll` pans them stably
  function skyline(hz, o = {}) {
    const seed = o.seed || 1, sc = o.sc || 1, scroll = o.scroll || 0, lit = o.lit ?? .3, col = o.col || '#120A2A', hh = (o.h || 400) * sc;
    const slot = 150 * sc, first = Math.floor(scroll / slot) - 2, wc = o.win || ['#FFD86B', '#7FF3FF'], trim = o.trim || [NM, NC, NY];
    for (let id = first; id * slot - scroll < W + slot; id++) {
      const x0 = id * slot - scroll + (hash(id * 3.1 + seed) - .5) * slot * .3, bw = slot * (.8 + hash(id * 5.7 + seed) * .5), bh = hh * (.35 + hash(id * 7.3 + seed) * .75), y0 = hz - bh;
      X.fillStyle = col; X.fillRect(x0, y0, bw, H - y0 + 60);
      if (lit > 0) {
        const cw = 18 * sc, ch = 24 * sc, cols = Math.floor((bw - 8 * sc) / cw), rows = Math.floor(Math.min(bh + 200, H - y0) / ch);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const hv = hash(id * 31.7 + r * 7.3 + c * 3.1 + seed); if (hv >= lit) continue;
          X.globalAlpha = .45 + .55 * hash(hv * 97); X.fillStyle = wc[Math.floor(hv * 13) % wc.length];
          X.fillRect(x0 + 6 * sc + c * cw, y0 + 10 * sc + r * ch, cw * .55, ch * .55);
        }
        X.globalAlpha = 1;
      }
      if (o.trims !== false && hash(id * 11.3 + seed) < .45) neonLine([[x0 + 3, y0 + 2], [x0 + bw - 3, y0 + 2]], trim[id & 1 ? 0 : 1 % trim.length], 2 * sc + .5, .85, 0);
      if (o.antenna !== false && hash(id * 13.9 + seed) < .25) { line([[x0 + bw * .5, y0], [x0 + bw * .5, y0 - 60 * sc]], 1.5, col, 0); if (frac(T * .8 + hash(id)) < .5) glow(x0 + bw * .5, y0 - 60 * sc, 14 * sc, NR, .9); }
    }
  }
  // a big skyscraper facade, bottom-left at (x, yb), w × h. Only visible window rows are drawn.
  function tower(x, yb, w, h, seed, o = {}) {
    const top = yb - h, lit = o.lit ?? .45;
    paint(rectPts(x, top, w, h + 4), { fill: o.col || '#1A1236', ink: PAL.line, sw: 2, flat: true });
    X.fillStyle = 'rgba(0,0,0,.33)'; X.fillRect(x + w * .8, top, w * .2, h);
    const cw = o.cw || 30, ch = o.ch || 40, cols = Math.max(1, Math.floor((w - 20) / cw)), ox = x + (w - cols * cw) / 2 + 4;
    const scy = o.winScroll || 0, r0 = Math.max(0, Math.floor((-60 - top - scy) / ch)), r1 = Math.min(Math.floor((h - 30) / ch), Math.ceil((H + 60 - top - scy) / ch));
    for (let r = r0; r < r1; r++) for (let c = 0; c < cols; c++) {
      const hv = hash(seed * 31.3 + r * 7.3 + c * 3.1); if (hv >= lit) continue;
      X.globalAlpha = .5 + .5 * hash(hv * 91); X.fillStyle = hv < lit * .5 ? '#FFD86B' : '#7FF3FF';
      X.fillRect(ox + c * cw, top + 18 + r * ch + scy, cw - 12, ch - 16);
    }
    X.globalAlpha = 1;
    if (o.trim !== false) neonLine([[x + 2, top + 2], [x + w - 2, top + 2]], o.trimCol || (hash(seed) < .5 ? NM : NC), 3, .9, 0);
    if (o.edge) neonLine([[x + 2, top], [x + 2, yb]], o.edge, 2.5, .7, 0);
  }
  // rooftop surface with scrolling props (vents, pipes, antennas)
  function roof(y, scroll, o = {}) {
    paint(rectPts(-60, y, W + 120, H - y + 80), { fill: o.col || '#1C1238', ink: PAL.line, sw: 2, flat: true });
    X.fillStyle = 'rgba(0,0,0,.28)'; for (let i = 1; i < 6; i++) X.fillRect(-60, y + i * i * 9, W + 120, 3);
    const slot = 560, first = Math.floor(scroll / slot) - 1;
    for (let id = first; id * slot - scroll < W + slot; id++) {
      const x = id * slot - scroll + hash(id * 2.7) * 220, kind = Math.floor(hash(id * 4.1) * 3);
      if (kind === 0) { paint(rectPts(x, y - 80, 130, 92), { fill: '#2E2150', shade: '#170F2C', rim: '#6A5AAA', ink: PAL.line, sw: 2 }); paint(ellPts(x + 65, y - 34, 30, 30, 14), { fill: '#0B0716', ink: PAL.line, sw: 1.5, flat: true }); }
      else if (kind === 1) { paint(rrPts(x, y - 38, 260, 30, 14), { fill: '#3A2A60', shade: '#1C1238', ink: PAL.line, sw: 2 }); }
      else { line([[x, y + 6], [x, y - 190]], 3, '#3A2A60', 0); if (frac(T * 1.2 + hash(id)) < .5) glow(x, y - 190, 26, NR, .9); }
    }
    neonLine([[-40, y + 2], [W + 40, y + 2]], o.edge || NC, 3, .85, 0);
  }
  // cel-shaded puff (smoke / cloud)
  function puff(x, y, r, seed, o = {}) {
    const pts = [], n = 16;
    for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + .13 * Math.sin(a * 5 + seed * 3.7) + .07 * Math.sin(a * 9 + seed)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * (o.sq ?? .82)]); }
    paint(pts, { fill: o.fill || '#E2D6F4', shade: o.shade || '#9A86C8', rim: o.rim, light: o.light || [0, -.16], ink: o.ink === undefined ? PAL.line : o.ink, sw: o.sw ?? 1.6, curv: .7, alpha: o.alpha ?? 1 });
  }
  // a cumulus of puffs (smoke billow): lit from below by the engines unless o.light says otherwise
  function billow(x, y, r, seed, o = {}) {
    const n = o.n ?? 5;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (hash(seed * 7.1 + i) - .5) * 3.2, d = r * (.25 + hash(seed * 3.3 + i) * .45) * (i ? 1 : 0), rr = r * (.45 + hash(seed * 5.9 + i) * .35) * (i ? 1 : 1.05);
      puff(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, rr, seed * 10 + i, { fill: o.fill || '#E2D6F4', shade: o.shade || '#9A86C8', rim: o.rim || '#FFB47A', light: o.light || [0, .22], alpha: o.alpha ?? 1, sw: o.sw ?? 1.2 });
    }
  }
  // exhaust smoke rolling out along the ground both ways from cx (k 0..1 = how far it has spread)
  function groundSmoke(cx, y, spread, size, k, seed, o = {}) {
    const n = o.n ?? 6;
    for (let j = n - 1; j >= 0; j--) for (const sd of [-1, 1]) {
      const u = (j + .5) / n, d = spread * u * (.35 + .65 * k), r = size * (.55 + .7 * u) * (.7 + .3 * k);
      billow(cx + sd * d, y - r * .25 - u * size * .3 * k, r, seed + j * 2 + (sd > 0 ? 1 : 0), { n: 4, light: [-sd * .12, .2], ...o });
    }
  }
  // flame pointing down (+y) from (x, y)
  function thrust(x, y, w, L, a = 1, ang = 0) {
    X.save(); X.translate(x, y); X.rotate(ang);
    glow(0, L * .35, w * 1.5 + L * .45, NO, .5 * a);
    const fl = 1 + .1 * Math.sin(T * 70 + x * .01);
    [[1, NM], [.7, NO], [.42, '#FFF6E6']].forEach(([k, col]) => { const ww = w * k, LL = L * k * fl; paint([[-ww, 0], [ww, 0], [ww * .55, LL * .45], [0, LL], [-ww * .55, LL * .45]], { fill: col, ink: null, curv: .6, alpha: a }); });
    X.restore();
  }
  // speed streaks rushing past (horizontal: moving left; vert: moving down)
  function streaks(t, o = {}) {
    const n = o.n ?? 26, sp = o.speed ?? 3000, cols = o.cols || ['#FFFFFF'], vert = !!o.vert, span = (vert ? H : W) + 1200;
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const L = (200 + hash(i * 3) * 600) * (o.len ?? 1), c = hash(i * 7.1) * (vert ? W : H), p = span - 600 - frac(hash(i * 1.3) + t * sp / span * (1 + hash(i) * .6)) * span, th = (2 + hash(i * 5) * 4) * (o.w ?? 1);
      X.globalAlpha = (o.a ?? .3) * (.4 + .6 * hash(i * 9)); X.fillStyle = cols[i % cols.length];
      if (vert) X.fillRect(c, H - p - L, th, L); else X.fillRect(p, c, L, th);
    }
    X.restore();
  }
  // the hero running (side view) with a rainbow afterimage trail
  function runner(x, y, h, t, o = {}) {
    const n = o.n ?? 5, gap = o.gap ?? .04, rate = o.rate ?? 1;
    const P = tt => ({ view: 'side', flip: o.flip, ...runPose(bpOf(onTwos(tt)) * rate + (o.ph || 0), o.amt ?? 1.1), ...(o.pose || {}) });
    afterimages(n, (i, col, a) => {
      if (col) { const [dx, dy] = o.trail ? o.trail(i) : [-i * (o.dx ?? 70), 0]; hero(x + dx, y + dy, h, { ...P(t - i * gap), silhouette: col, alpha: a * (o.trailA ?? 1) }); }
      else hero(x, y, h, { ...P(t), eyes: 'determined', mouth: 'open', brows: 'angry', hairWind: 1, chrome: 1, ...(o.face || {}) });
    });
  }
  // Kardashev gauge: semicircular dial, 0 → II
  function kGauge(cx, cy, r, v, hit = 0) {
    const a0 = Math.PI * .88, a1 = Math.PI * 2.12, vmax = 2.2, ang = u => lerp(a0, a1, clamp(u / vmax));
    const s = 1 + .08 * hit;
    X.save(); X.translate(cx, cy); X.scale(s, s); X.translate(-cx, -cy);
    paint(rrPts(cx - r * 1.22, cy - r * 1.22, r * 2.44, r * 2.02, 26), { fill: '#0B0716', op: .93, ink: null, flat: true });
    hud(cx - r * 1.22, cy - r * 1.22, r * 2.44, r * 2.02, { col: v >= 2 ? NM : NC, corner: 34, w: 3 });
    X.lineCap = 'butt'; X.strokeStyle = '#231848'; X.lineWidth = r * .17; X.beginPath(); X.arc(cx, cy, r * .8, a0, a1); X.stroke();
    const segs = 40, dA = (a1 - a0) / segs;
    for (let i = 0; i < segs; i++) {
      const u = (i + .5) / segs * vmax; if (u > v) break;
      X.strokeStyle = u < 1 ? NC : u < 1.5 ? NY : u < 2 ? NO : NM; X.lineWidth = r * .14; X.beginPath(); X.arc(cx, cy, r * .8, a0 + i * dA + dA * .12, a0 + (i + 1) * dA - dA * .12); X.stroke();
    }
    for (const [u, lab] of [[0, '0'], [1, 'I'], [2, 'II']]) {
      const aa = ang(u); line([[cx + Math.cos(aa) * r * .62, cy + Math.sin(aa) * r * .62], [cx + Math.cos(aa) * r * .98, cy + Math.sin(aa) * r * .98]], 2, '#FFFFFF', 0);
      txt(lab, cx + Math.cos(aa) * r * 1.1, cy + Math.sin(aa) * r * 1.1, r * .14, '#FFFFFF', { font: 'Orbitron' });
    }
    const na = ang(v), col = v >= 1.95 ? NM : v >= 1.45 ? NO : v >= .95 ? NY : NC;
    neonLine([[cx, cy], [cx + Math.cos(na) * r * .82, cy + Math.sin(na) * r * .82]], NY, r * .035, 1, 0);
    paint(ellPts(cx, cy, r * .08, r * .08, 12), { fill: NY, ink: PAL.line, sw: 2 });
    txt(v.toFixed(1), cx, cy + r * .36, r * .42, '#FFFFFF', { font: 'Orbitron', glow: col });
    txt('KARDASHEV', cx, cy + r * .68, r * .13, col, { font: 'Orbitron', track: 3 });
    X.restore();
    if (hit > .05) glow(cx, cy, r * 1.6, col, .35 * hit);
  }
  const kVal = t => kf(bpOf(t), [[215.8, .3], [216.3, .7], [218, .7], [218.3, 1], [220, 1], [220.3, 1.5], [222, 1.5], [222.3, 2]], backOut);
  const kHit = t => { const b = bpOf(t), n = b >= 222 ? 222 : b >= 220 ? 220 : b >= 218 ? 218 : 216; return Math.exp(-(b - n) * 4); };
  const gaugeAt = t => kGauge(1520, 790, 225, kVal(t), kHit(t));

  // =====================================================================================================
  // b200–208: FOOM, one image per beat
  // =====================================================================================================
  // b200 · the shoggoth bursts through the moon-mask
  function foom(t, lt, dur) {
    style(1);
    const k = clamp(lt / BEAT), kb = clamp((lt - .07) / (BEAT - .07)), e = expoOut(kb), e2 = easeOut(kb), cx = 960, cy = 440;
    sky([[0, '#12041F'], [.5, '#3E0C46'], [.85, '#A0206A'], [1, '#FF6A2A']]);
    rays(cx, cy, 28, ['rgba(255,46,136,.30)', 'rgba(255,138,31,.24)', 'rgba(39,242,242,.12)'], lt * .6);
    glow(cx, cy, 1000, NO, .5);
    stars(t, 40, { seed: 5 });
    skyline(1080, { h: 440, seed: 4, lit: .35, col: '#0E0620' });
    // the moon-mask shatters into wedges flying outward
    const mr = 330, N = 9;
    for (let i = 0; i < N; i++) {
      const a0 = (i + hash(i) * .4) / N * TAU, a1 = (i + 1 + hash(i + 1) * .4) / N * TAU, am = (a0 + a1) / 2;
      const d = e2 * (190 + hash(i * 3) * 300) + (lt < .07 ? Math.sin(lt * 200 + i) * 4 : 0), rot = (hash(i * 5) - .5) * 1.2 * e2;
      X.save(); X.translate(cx + Math.cos(am) * d, cy + Math.sin(am) * d); X.rotate(rot); X.translate(-cx, -cy);
      const wedge = [[cx + Math.cos(am) * mr * .12, cy + Math.sin(am) * mr * .12]]; for (let j = 0; j <= 6; j++) { const a = lerp(a0, a1, j / 6); wedge.push([cx + Math.cos(a) * mr, cy + Math.sin(a) * mr]); }
      X.save(); tracePath(X, wedge); X.clip();
      paint(ellPts(cx, cy, mr, mr, 40), { fill: '#FFF4D8', shade: '#E9C98E', light: [-.12, -.1], ink: null });
      mask(cx, cy, mr * .98, { eyes: 'wide', mouth: 'open', glow: 0, col: '#FFF4D8', eyeGlow: true });
      X.restore();
      paint(wedge, { ink: PAL.line, sw: 2.5 });
      if (kb <= 0) neonLine(wedge.slice(0, 2), NM, 3, .9, 0);
      X.restore();
    }
    // the thing behind the mask
    const s = lerp(40, 240, e);
    glow(cx, cy, 120 + s * 3, '#FFFFFF', .55 * (1 - k * .6));
    if (kb > 0) shoggoth(cx, cy, s, { tent: 12, reach: lerp(.15, 1, e), eyesN: 13, mood: { eyes: 'star', mouth: 'grin' }, t: onTwos(t) * 2.5, seed: 3 });
    // debris flying at camera
    for (let i = 0; i < 16; i++) {
      const a = hash(i * 9.1) * TAU, d = e * (300 + hash(i * 2.3) * 950), r = (12 + hash(i * 4.4) * 26) * (1 + e * 1.5);
      paint(polyPts(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r, 3 + (i % 3), hash(i) * 6 + lt * 9), { fill: '#FFF4D8', shade: '#E9C98E', ink: PAL.line, sw: 2 });
    }
    speedLines(cx, cy, 1, { n: 46, r0: 560, alpha: .45 });
    FX.zoom *= 1 + .07 * e; FX.shake += 8;
    capPop('FOOM', 960, 870, 330, NY, lt + .05, { glow: NM, rot: -.05, track: 14 });
  }

  // b201 · line go up: the chart goes vertical and punches out of the frame
  function chartUp(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), P = lerp(.3, 1, easeOut(k / .8));
    bg('#060B14'); sky([[0, '#050A12'], [1, '#0E1A30']], 200);
    const pts = [], nC = 40, nV = 10, x0 = 250, x1 = 1380;
    for (let i = 0; i <= nC; i++) { const u = i / nC; pts.push([x0 + u * (x1 - x0), 930 - 700 * (Math.exp(4.2 * u) - 1) / (Math.exp(4.2) - 1)]); }
    for (let i = 1; i <= nV; i++) pts.push([x1 + i * 1.5, 230 - i / nV * 560]);
    const nn = Math.max(2, Math.ceil(P * pts.length)), head = pts[nn - 1], out = nn > nC + 3;
    camBegin(960, 540 - 70 * easeIn(k), 1 + .06 * k, -.025);
    X.strokeStyle = 'rgba(39,242,242,.13)'; X.lineWidth = 2; X.beginPath();
    for (let x = -240; x <= W + 240; x += 120) { X.moveTo(x, -400); X.lineTo(x, H + 200); } for (let y = -360; y <= H + 200; y += 120) { X.moveTo(-240, y); X.lineTo(W + 240, y); } X.stroke();
    hud(150, 90, 1620, 920, { col: NC, corner: 60, w: 4 });
    neonLine([[x0, 150], [x0, 930], [1700, 930]], '#8A7AFF', 4, .9, 0);
    for (let i = 0; i < 5; i++) { const y = 930 - i * 170; line([[x0 - 16, y], [x0 + 16, y]], 2, '#8A7AFF', 0); }
    const m = Math.min(nn, nC + 1);
    X.save(); X.globalAlpha = .2; X.fillStyle = NG; X.beginPath(); X.moveTo(x0, 930); for (let i = 0; i < m; i++) X.lineTo(pts[i][0], pts[i][1]); X.lineTo(pts[m - 1][0], 930); X.closePath(); X.fill(); X.restore();
    neonLine(pts.slice(0, nn), NG, 9, 1, .25);
    for (let i = 1; i <= 6; i++) { const idx = Math.round(i / 6.3 * nC); if (idx >= nn) break; paint(ellPts(pts[idx][0], pts[idx][1], 15, 15, 12), { fill: NY, ink: PAL.line, sw: 1.5 }); }
    glow(head[0], head[1], 190, NG, .7); glow(head[0], head[1], 80, '#FFFFFF', .9);
    paint(starPts(head[0], head[1], 50 + 16 * Math.sin(lt * 50), .28, 4, lt * 4), { fill: '#FFFFFF', ink: null });
    // breaking out of the frame: the HUD border shatters where the line exits
    if (out) {
      const bk = clamp((nn - nC - 3) / 5);
      for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (hash(i * 3) - .5) * 2.6, d = bk * (60 + hash(i * 7) * 260); paint(polyPts(x1 + Math.cos(a) * d, 90 + Math.sin(a) * d * .6, 10 + hash(i) * 14, 3, i + lt * 9), { fill: i % 2 ? NC : '#FFFFFF', ink: null }); }
      glow(x1, 90, 300 * bk, NG, .5);
    }
    txt('LINE GO UP', 290, 150, 48, '#FFFFFF', { font: 'Orbitron', align: 'left', glow: NG });
    camEnd();
    if (out) { FX.rgb = Math.max(FX.rgb, .6); FX.flash = Math.max(FX.flash, .25 * Math.exp(-(nn - nC - 3) * .6)); FX.flashCol = '#C8FFD8'; FX.shake += 8; }
  }

  // b202 · server racks launch like rockets
  function rackLaunch(t, lt, dur) {
    style(1);
    sky([[0, '#0B0716'], [.7, '#2A0F48'], [1, '#6A1A5A']]);
    stars(t, 50, { seed: 8 });
    moon(1640, 190, 90);
    skyline(890, { h: 300, seed: 9, lit: .4, sc: .8 });
    streaks(t, { vert: true, n: 24, speed: 2600, a: .25, cols: ['#FFFFFF', NC] });
    paint(rectPts(-40, 880, W + 80, 260), { fill: '#150C28', ink: PAL.line, sw: 2, flat: true });
    neonLine([[-20, 882], [W + 20, 882]], NC, 3, .85, 0);
    const del = [0, .1, .03, .15, .06];
    for (let i = 0; i < 5; i++) {
      const x = 240 + i * 360, kk = clamp((lt - del[i] + .08) / .28), lift = easeIn(kk) * 1150, s = .8, yb = 880 - lift, yt = yb - 420 * s;
      thrust(x, yb, 58, 90 + kk * 520, 1);
      for (const sx of [-1, 1]) paint([[x + sx * 64, yb - 130], [x + sx * 110, yb - 20], [x + sx * 110, yb + 22], [x + sx * 64, yb - 10]], { fill: NM, shade: '#8A1050', ink: PAL.line, sw: 2 });
      rack(x - 64, yt, s, { glowCol: i % 2 ? NM : NC });
      paint([[x - 66, yt + 4], [x + 66, yt + 4], [x, yt - 110]], { fill: NY, shade: NO, ink: PAL.line, sw: 2, curv: .15 });
      const pk = clamp(kk * 1.6);
      if (pk > .02) for (let j = 0; j < 2; j++) { const sd = j ? 1 : -1; billow(x + sd * (30 + 100 * pk), 900 - 40 * pk, (50 + 90 * pk) * (.8 + hash(i * 3 + j) * .4), i * 3 + j, { n: 4 }); }
    }
  }

  // b203 · rooftop run with afterimages (dutch angle, close)
  function roofRun(t, lt, dur) {
    style(1);
    camBegin(960, 560, 1.08, -.08);
    sky([[0, '#0B0716'], [.55, '#2A0F48'], [1, '#8A1A5A']], 300);
    moon(1560, 250, 150);
    skyline(780, { scroll: t * 600, seed: 2, h: 460, lit: .45 });
    roof(840, t * 2200);
    runner(980, 925, 640, t, { n: 6, dx: 95, rate: 1.1 });
    camEnd();
    streaks(t, { n: 22, speed: 4200, a: .3, cols: ['#FFFFFF', NM, NC] });
  }

  // b204 · tentacles wrap the skyscrapers
  function wrapTentacle(cx, yb, R, turns, pitch, w0, prog, seed, front, t) {
    const n = 70, sp = [], ws = [], fr = [], A = turns * TAU * prog;
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = u * A + seed, x = cx + Math.cos(a) * R * (1 + .03 * Math.sin(t * 6 + u * 9)), y = yb - u * A / TAU * pitch + Math.sin(a) * R * .24;
      sp.push([x, y]); ws.push(w0 * (1 - .85 * u)); fr.push(Math.sin(a) > 0);
    }
    const draw = (run, rw) => {
      paint(limbPts(run, rw), front ? { fill: MOD.bodyN, shade: MOD.bodyNDk, rim: MOD.rimN, light: [0, -.3], ink: PAL.line, sw: 2.5, curv: .4 } : { fill: '#1A0E30', shade: '#0B0716', rim: '#8A2A6A', light: [0, -.3], ink: PAL.line, sw: 2, curv: .4 });
      if (front) { neonLine(run.map(([x, y], j) => [x, y - rw[j] * .55]), MOD.rimN, 3, .8, .5); for (let j = 2; j < run.length - 1; j += 3) paint(ellPts(run[j][0], run[j][1] + rw[j] * .35, rw[j] * .22, rw[j] * .16, 8), { fill: '#3A1E5E', ink: null, flat: true }); }
    };
    let run = [], rw = [];
    for (let i = 0; i <= n; i++) {
      const on = fr[i] === front;
      if (on) { if (!run.length && i > 0) { run.push(sp[i - 1]); rw.push(ws[i - 1]); } run.push(sp[i]); rw.push(ws[i]); }
      if ((!on || i === n) && run.length > 1) { if (!on) { run.push(sp[i]); rw.push(ws[i]); } draw(run, rw); run = []; rw = []; }
      else if (!on) { run = []; rw = []; }
    }
  }
  function tentacleTowers(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur);
    camBegin(960, 560, 1.03 + .05 * k, .03);
    sky([[0, '#0B0716'], [.6, '#241048'], [1, '#5A1650']], 200);
    stars(t, 50, { seed: 14 });
    moon(1290, 250, 150);
    skyline(1000, { h: 520, seed: 17, lit: .3, sc: .7, col: '#150C2E' });
    const T3 = [[110, 330, 800, 3, 2.1, 0], [770, 380, 1000, 5, 2.4, 2.1], [1480, 330, 760, 7, 2, 4]];
    const prog = lerp(.5, 1, easeOut(k * 1.3)), sq = pulse(t, 5);
    for (const [x, w, h, sd, turns, ph] of T3) wrapTentacle(x + w / 2, 1180, w / 2 + 50 - sq * 14, turns, h * .82 / turns, 120, prog, ph, false, t);
    for (const [x, w, h, sd] of T3) tower(x, 1140, w, h, sd, { lit: .45, col: '#1D1440' });
    shoggoth(960, 1130, 400, { tent: 0, eyesN: 16, mood: { eyes: 'narrow', mouth: 'smirk', look: [0, -1] }, maskAt: [0, -260], maskR: .4, t: onTwos(t), seed: 5 });
    for (const [x, w, h, sd, turns, ph] of T3) wrapTentacle(x + w / 2, 1180, w / 2 + 50 - sq * 14, turns, h * .82 / turns, 120, prog, ph, true, t);
    camEnd();
    FX.shake += 6 * sq;
  }

  // b205 · GPU fans blur
  function gpuBrrr(t, lt, dur) {
    style(1);
    const rot = -.12 + lt * .1, s = 5.1, gx = 960, gy = 560;
    sky([[0, '#04140C'], [1, '#0B0716']]);
    rays(gx, gy, 22, ['rgba(72,255,138,.10)', 'rgba(39,242,242,.06)'], t * .4);
    glow(gx, gy, 900, NG, .25);
    gpu(gx, gy, s, { rot, spin: 0 });
    X.save(); X.translate(gx, gy); X.rotate(rot); X.scale(s, s);
    for (const fx of [-75, 75]) {
      const g = X.createRadialGradient(fx, 0, 10, fx, 0, 47); g.addColorStop(0, 'rgba(90,100,150,0)'); g.addColorStop(.55, 'rgba(120,130,190,.55)'); g.addColorStop(1, 'rgba(60,60,100,.35)');
      X.fillStyle = g; X.beginPath(); X.arc(fx, 0, 47, 0, TAU); X.fill();
      X.lineCap = 'round';
      for (let j = 0; j < 7; j++) { const a0 = T * 40 + j * TAU / 7 + hash(j) * 2, rr = 16 + j * 4.3; X.strokeStyle = j % 2 ? 'rgba(200,255,220,.5)' : 'rgba(220,230,255,.35)'; X.lineWidth = 2.2; X.beginPath(); X.arc(fx, 0, rr, a0, a0 + 1.8); X.stroke(); }
      paint(ellPts(fx, 0, 12, 12, 12), { fill: NG, ink: PAL.line, sw: .6 });
      glow(fx, 0, 30, NG, .6);
    }
    // heat shimmer rising off the card
    for (let i = 0; i < 5; i++) { const x0 = -120 + i * 60, pts = []; for (let j = 0; j < 8; j++) pts.push([x0 + Math.sin(T * 14 + j * .9 + i) * 6, -70 - j * 12 - frac(T * 2 + i * .2) * 20]); neonLine(pts, i % 2 ? NG : NC, 1.2, .5, .5); }
    X.restore();
    txt('brrr', 1560 + Math.sin(T * 60) * 6, 250 + Math.cos(T * 55) * 5, 90, '#FFFFFF', { font: 'Shantell', rot: .15, glow: NG, stroke: '#000', sw: 8 });
    FX.shake += 7;
  }

  // b206 · emblem close-up, flaring
  function emblemFlare(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), h = 3100, ex = 960, ey = 560, f = expoOut(k * 3) * (1 - k * .3);
    sky([[0, '#0B0716'], [1, '#2A1648']]);
    rays(ex, ey, 18, ['rgba(255,138,31,.16)', 'rgba(39,242,242,.10)'], lt * .9);
    camBegin(ex, ey, 1 + .1 * k, -.06 + .05 * k);
    hero(ex, ey + .58 * h, h, { view: 'back', emblem: .15 + .25 * f, hairWind: .6 });
    camEnd();
    // anamorphic flare streak + star
    X.save(); X.globalCompositeOperation = 'lighter';
    const L = 1300 * f + 200;
    for (const [hh, a, col] of [[26, .3, NC], [6, .7, '#FFFFFF']]) { const g = X.createLinearGradient(ex - L, 0, ex + L, 0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); X.fillStyle = g; X.fillRect(ex - L, ey - hh / 2, L * 2, hh); }
    X.restore();
    paint(starPts(ex, ey, 380 * f + 60, .05, 4, lt * .8), { fill: '#FFFFFF', ink: null, alpha: .55 });
    for (let i = 0; i < 3; i++) glowPath(ellPts(ex + (i + 1) * 180 * f, ey + (i + 1) * 60 * f, 30 + i * 18, 30 + i * 18, 18), [NC, NM, NY][i], .8, 0, .7);
    FX.bloom = .6;
  }

  // b207 · the mask's eyes go to stars
  function starEyes(t, lt, dur) {
    style(1);
    const hit = lt > .05, pop = elasticOut(clamp((lt - .05) / .3)), r = 360 * (hit ? .88 + .12 * pop : .85);
    sky([[0, '#2A0A3A'], [1, '#0B0716']]);
    rays(960, 560, 24, ['rgba(39,242,242,.22)', 'rgba(255,46,136,.22)'], -lt * .8);
    mask(960, 560, r, { eyes: hit ? 'star' : 'wide', mouth: hit ? 'grin' : 'o', glow: 1, rot: .06 * Math.sin(lt * 18) });
    if (hit) for (let i = 0; i < 14; i++) {
      const sdx = i % 2 ? 1 : -1, a = hash(i * 3.3) * TAU, d = expoOut((lt - .05) / .3) * (120 + hash(i * 5.1) * 380), ex = 960 + sdx * r * .34, ey = 560 - r * .18;
      paint(starPts(ex + Math.cos(a) * d, ey + Math.sin(a) * d, 16 + hash(i) * 22, .42, 5, lt * 5 + i), { fill: i % 3 ? NC : NY, ink: PAL.line, sw: 1.5, alpha: 1 - clamp((lt - .2) / .2) * .5 });
    }
    FX.zoom *= 1 + .05 * pop; FX.zblur = Math.max(FX.zblur, .3 * Math.exp(-Math.max(0, lt - .05) * 14) * (hit ? 1 : 0));
  }

  // =====================================================================================================
  // b208–216: the takeoff sprint, 2-beat shots from alternating angles
  // =====================================================================================================
  // b208 · wide side tracking, the moon ahead
  function sprintSide(t, lt, dur) {
    style(1);
    sky([[0, '#0B0716'], [.55, '#26104A'], [1, '#7A1A5A']]);
    stars(t, 60, { seed: 21 });
    moon(1480, 320, 250);
    skyline(830, { scroll: t * 280, seed: 12, h: 420, lit: .35, sc: .8, col: '#1A0F36' });
    skyline(880, { scroll: t * 700, seed: 13, h: 300, lit: .45, col: '#120A2A' });
    roof(900, t * 2000, { edge: NM });
    runner(760, 975, 500, t, { n: 7, dx: 84, rate: 1 });
    streaks(t, { n: 20, speed: 3600, a: .25 });
  }
  // b210 · the leap across a gap, silhouetted against the moon
  function sprintLeap(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur);
    sky([[0, '#0B0716'], [.6, '#2A0F48'], [1, '#6A1A5A']]);
    stars(t, 70, { seed: 22 });
    moon(960, 470, 400, { halo: '#FFD0F0' });
    skyline(1000, { h: 320, seed: 30, lit: .3, sc: .7, col: '#1A0F36' });
    // the two rooftops and the gap
    for (const [x0, x1] of [[-60, 640], [1280, 1980]]) { paint(rectPts(x0, 900, x1 - x0, 300), { fill: '#150C2A', ink: PAL.line, sw: 2, flat: true }); neonLine([[x0, 902], [x1, 902]], x0 < 0 ? NC : NM, 3, .9, 0); }
    const pos = kk => { const u = lerp(0, 1.08, kk); return [lerp(200, 1720, u), 900 - 250 * Math.sin(clamp(u) * Math.PI)]; };
    const leapP = { aL: [-1.3, .5], aR: [2.3, .3], lL: [1.35, .35], lR: [-.9, 1.3], lean: .32 };
    afterimages(7, (i, col, a) => {
      const kk = k - i * .045, [x, y] = pos(kk), air = clamp(1 - Math.abs(kk - .45) * 2.4);
      const P = { view: 'side', ...runPose(bpOf(onTwos(t - i * .045)), 1.1), ...(air > .3 ? leapP : {}) };
      if (col) hero(x, y, 460, { ...P, silhouette: col, alpha: a });
      else hero(x, y, 460, { ...P, eyes: 'determined', mouth: 'open', brows: 'angry', hairWind: 1, chrome: 1 });
    });
    FX.zoom *= 1 + .04 * Math.sin(k * Math.PI);
  }
  // b212 · from behind, running at the moon
  function sprintBack(t, lt, dur) {
    style(1);
    const bp = bpOf(onTwos(t));
    sky([[0, '#0B0716'], [.5, '#26104A'], [1, '#9A2A6A']]);
    stars(t, 70, { seed: 23 });
    moon(960, 360, 260);
    skyline(640, { h: 260, seed: 40, lit: .4, sc: .6, col: '#1E1240' });
    // rooftop in perspective
    const vp = [960, 600];
    paint([[-400, 1100], [2320, 1100], [vp[0] + 90, 640], [vp[0] - 90, 640]], { fill: '#1A1034', ink: null, flat: true });
    for (const [sx, col] of [[-1, NC], [1, NM]]) neonLine([[vp[0] + sx * 90, 640], [960 + sx * 1300, 1100]], col, 4, .9, 0);
    for (let i = 0; i < 9; i++) { const u = frac(i / 9 + t * 2.2), y = lerp(640, 1100, u * u), hw = lerp(90, 1300, u * u); line([[960 - hw, y], [960 + hw, y]], 1.5, 'rgba(155,92,255,.5)', 0); }
    // the hero, emblem blazing; echoes behind him are closer to camera (bigger, lower)
    afterimages(5, (i, col, a) => {
      const sway = Math.sin(bp * Math.PI) * 18, ph = bp * Math.PI, P = { view: 'back', lL: [.9 * Math.max(0, Math.sin(ph)) + .05, 1.4 * Math.max(0, Math.sin(ph))], lR: [.9 * Math.max(0, -Math.sin(ph)) + .05, 1.4 * Math.max(0, -Math.sin(ph))], aL: [.14 + .1 * Math.sin(ph), .6 + .4 * Math.max(0, Math.sin(ph))], aR: [.14 - .1 * Math.sin(ph), .6 + .4 * Math.max(0, -Math.sin(ph))], dy: -Math.abs(Math.sin(ph)) * 24 };
      if (col) hero(960 + sway * (1 - i * .3), 1070 + i * 36, 640 * (1 + i * .1), { ...P, silhouette: col, alpha: a });
      else hero(960 + sway, 1070, 640, { ...P, emblem: .7 + .3 * pulse(t, 4), hairWind: .6 });
    });
    streaks(t, { n: 18, speed: 2800, a: .2, vert: true });
  }
  // b214 · close on his face, determined, streaking light
  function sprintFace(t, lt, dur) {
    style(1);
    sky([[0, '#140828'], [1, '#2A0F48']]);
    streaks(t, { n: 46, speed: 5200, a: .55, w: 2.5, len: 1.4, cols: [NM, NC, NY, '#FFFFFF', NO] });
    const P = { ...runPose(bpOf(onTwos(t)) * .5, .5), lean: .22 };
    const h = 2100, x = 1000, y = 530 + .89 * h;
    afterimages(3, (i, col, a) => {
      if (col) hero(x - i * 230, y + Math.sin(i * 2) * 14, h, { view: 'side', ...P, silhouette: col, alpha: a * .8 });
      else hero(x, y, h, { view: 'side', ...P, eyes: 'determined', mouth: 'open', brows: 'angry', hairWind: 1.5, chrome: 1, glint: .8 });
    });
    FX.rgb = Math.max(FX.rgb, .2); FX.rgbAng = 0;
  }

  // =====================================================================================================
  // b216–224: WE'RE SO BACK + Kardashev gauge stepping every 2 beats
  // =====================================================================================================
  function kCity(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), lit = lerp(.2, .9, easeOut(k * 1.6));
    sky([[0, '#0B0716'], [.55, '#241048'], [1, '#7A1A5A']]);
    stars(t, 60, { seed: 31 });
    moon(1600, 200, 110);
    glow(960, 1000, 1100, NO, .15 + .3 * lit);
    skyline(860, { h: 500, seed: 21, lit: lit * .8, sc: .9, col: '#1A0F36' });
    skyline(960, { h: 360, seed: 22, lit, col: '#110926' });
    paint(rectPts(-40, 1000, W + 80, 120), { fill: '#0B0716', ink: null, flat: true }); neonLine([[-20, 1002], [W + 20, 1002]], NM, 3, .9, 0);
    const bp = bpOf(t), up = Math.exp(-frac(bp) * 5);
    hero(620, 1010 - up * 30, 560, { view: 'back', ...POSES.cheer, aL: [2.5 + .2 * up, .3], aR: [2.5 + .2 * up, .3], emblem: 1, sq: -.04 * up });
    gaugeAt(t);
    capPop("WE'RE SO BACK", 900, 300, 220, NY, since(t, 216), { glow: NM, rot: -.03 });
    FX.zblur = Math.max(FX.zblur, .3 * Math.exp(-lt * 10));
  }
  function kGrid(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), R = lerp(250, 1500, easeOut(k * 1.3));
    bg('#07040F');
    camBegin(960, 540, lerp(1.3, 1.02, easeOut(k)), .42 + lt * .12);
    const cell = 160;
    X.fillStyle = '#1A1030'; X.fillRect(-1400, -1400, 4700, 3900);
    for (let gx = -9; gx <= 9; gx++) for (let gy = -8; gy <= 8; gy++) {
      const x = 960 + gx * cell, y = 540 + gy * cell, d = Math.hypot(gx * cell, gy * cell), on = clamp((R - d) / 240), ht = 10 + hash2(gx * 3 + 50, gy) * 26;
      X.fillStyle = '#08050F'; X.fillRect(x - 58 + ht * .6, y - 58 + ht, 116, 116);                    // extruded side / shadow
      X.fillStyle = on > 0 ? mixCol('#1A1236', '#3A2A6A', on) : '#140C28'; X.fillRect(x - 58, y - 58, 116, 116);
      if (on <= 0) continue;
      for (let j = 0; j < 7; j++) { const hx = hash2(gx * 13 + gy * 7, j); X.globalAlpha = on * (.6 + .4 * hash(hx * 50)); X.fillStyle = hx < .45 ? '#FFD86B' : hx < .8 ? '#7FF3FF' : NM; X.fillRect(x - 50 + hash2(gx + j, gy) * 86, y - 50 + hash2(gy + j * 3, gx) * 86, 14, 14); }
      X.globalAlpha = 1;
      if (hash2(gx, gy * 3) < .18) neonLine(rectPts(x - 58, y - 58, 116, 116), [NM, NC, NY][(gx + gy + 30) % 3], 2.5, on * .9, 0, true);
    }
    // the wave of light: a ring at the front
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = NY; X.globalAlpha = .35; X.lineWidth = 40; X.beginPath(); X.arc(960, 540, R, 0, TAU); X.stroke(); X.globalAlpha = .7; X.lineWidth = 6; X.stroke(); X.restore();
    glow(960, 540, R * .8, NO, .22);
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 90; i++) {
      const g = Math.floor(hash(i * 3.7) * 19) - 9, horiz = i % 2, p = frac(hash(i * 9.1) + lt * (.25 + hash(i) * .3)) * 3000 - 1500, sx = horiz ? 960 + p : 960 + g * cell + cell / 2, sy = horiz ? 540 + g * cell + cell / 2 : 540 + p;
      if (Math.hypot(sx - 960, sy - 540) > R) continue;
      X.fillStyle = i % 3 ? NY : NR; X.globalAlpha = .95; if (horiz) X.fillRect(sx, sy - 4, 46, 8); else X.fillRect(sx - 4, sy, 8, 46);
    }
    X.restore();
    camEnd();
    gaugeAt(t);
  }
  function kPlanet(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), px = 780, py = 580, pr = 480;
    bg('#04030A');
    stars(t, 120, { seed: 41, ext: [W, H] });
    glow(px, py, pr * 1.45, NC, .32);
    paint(ellPts(px, py, pr, pr, 64), { fill: '#0E1848', shade: '#050A22', light: [-.25, -.12], ink: null });
    X.save(); tracePath(X, ellPts(px, py, pr, pr, 64)); X.clip();
    for (const [lx, ly, rx, ry] of [[-.3, -.3, .38, .25], [.25, .15, .3, .38], [-.15, .45, .22, .12], [.5, -.45, .18, .14]]) paint(ellPts(px + lx * pr + lt * 20, py + ly * pr, rx * pr, ry * pr, 16), { fill: '#132A50', ink: null, curv: .6 });
    // city lights → a glowing neural net across the night side
    const nodes = [], reveal = lerp(.25, 1, easeOut(k * 1.4));
    for (let i = 0; i < 120; i++) {
      const lon = hash(i * 3.1) * TAU + t * .12, lat = Math.asin(hash(i * 7.7) * 1.8 - .9), x3 = Math.cos(lat) * Math.sin(lon), y3 = Math.sin(lat), z3 = Math.cos(lat) * Math.cos(lon);
      if (z3 < .05 || hash(i * 5.3) > reveal) continue; nodes.push([px + x3 * pr, py + y3 * pr, z3, i]);
    }
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineWidth = 3; X.strokeStyle = NY; X.globalAlpha = .55; X.beginPath();
    for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) { const d = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]); if (d < pr * .26) { X.moveTo(nodes[a][0], nodes[a][1]); X.lineTo(nodes[b][0], nodes[b][1]); } }
    X.stroke(); X.restore();
    for (const [x, y, z, i] of nodes) { glow(x, y, 26 * z, i % 4 ? NY : NC, .8 * z); X.fillStyle = '#FFFFFF'; X.fillRect(x - 3, y - 3, 6, 6); }
    X.restore();
    glowPath(ellPts(px, py, pr, pr, 64), NC, 2, 0, .9);
    gaugeAt(t);
  }
  function kStar(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur);
    bg('#07030A');
    stars(t, 110, { seed: 51, ext: [W, H] });
    glow(640, 520, 900, NO, .35);
    camBegin(640, 520, lerp(1.15, 1, easeOut(k)), 0);
    dysonSphere(640, 520, 380, lerp(.2, .8, easeOut(k * 1.2)));
    camEnd();
    earth(1100, 930, 46, {});
    gaugeAt(t);
    FX.rgb = Math.max(FX.rgb, .25 * pulse(t, 6));
  }

  // =====================================================================================================
  // b224–230: paperclip avalanche → shoggoth dance → fist pump
  // =====================================================================================================
  function avalanche(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur);
    sky([[0, '#0B0716'], [.7, '#2A1648'], [1, '#4A1A5A']]);
    glow(960, 120, 700, NM, .3);
    tower(-60, 1120, 420, 1180, 3, { lit: .45 }); tower(1560, 1120, 420, 1100, 7, { lit: .45 });
    signBoard(215, 300, 330, 80, 'MAXIMIZE', NM, { size: 44 });
    // the chute
    paint([[760, -40], [1160, -40], [1060, 120], [860, 120]], { fill: '#2A1E48', shade: '#150D28', rim: '#6A5AAA', ink: PAL.line, sw: 2 });
    neonLine([[860, 120], [1060, 120]], NY, 3, .9, 0);
    mask(960, 40, 46, { eyes: 'happy', mouth: 'grin', glow: .5 });
    // flyers: pour out of the chute and tumble toward camera (drawn far → near)
    const fl = [];
    for (let i = 0; i < 130; i++) { const p = frac(hash(i * 1.7) + lt * (.9 + hash(i * 3) * .7)); fl.push([p, i]); }
    fl.sort((a, b) => a[0] - b[0]);
    // the heap surging up from the bottom
    const heapY = lerp(1000, 720, easeOut(k));
    for (let i = 0; i < 90; i++) {
      const u = hash(i * 2.9), x = u * 2100 - 90, y = heapY + 40 + hash(i * 4.3) * 420 - Math.sin(u * Math.PI) * 120 + Math.sin(t * 9 + i) * 6;
      paperclip(x, y, 1.1 + hash(i * 6.1) * .7, hash(i * 8.2) * TAU + lt * (hash(i) - .5) * 3, { col: i % 5 === 0 ? NC : i % 7 === 0 ? NP : undefined });
    }
    for (const [p, i] of fl) {
      const dx = (hash(i * 5.3) - .5) * 2, x = 960 + dx * (60 + p * p * 1500), y = 120 + p * 780 + p * p * 300 * (hash(i * 2.2) - .3), s = .35 + p * p * 3.2;
      paperclip(x, y, s, hash(i * 3.9) * TAU + lt * (4 + hash(i) * 6) * (i % 2 ? 1 : -1), { col: i % 6 === 0 ? NC : i % 9 === 0 ? NP : undefined });
    }
    FX.shake += 8; FX.zoom *= 1 + .05 * k;
  }
  function shogDance(t, lt, dur) {
    style(1);
    const bp = bpOf(t), ph = frac(bp), side = Math.floor(bp) % 2 ? 1 : -1, bounce = Math.exp(-ph * 5);
    sky([[0, '#0B0716'], [.6, '#26104A'], [1, '#5A1650']]);
    stars(t, 60, { seed: 61 });
    moon(1580, 230, 150);
    // spotlight beams
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const bx = 160 + i * 400, a = -Math.PI / 2 + Math.sin(t * 2.2 + i * 1.7) * .5, col = [NM, NC, NY, NV, NO][i]; X.fillStyle = rgba(col, .16); X.beginPath(); X.moveTo(bx, 1080); X.lineTo(bx + Math.cos(a - .1) * 1600, 1080 + Math.sin(a - .1) * 1600); X.lineTo(bx + Math.cos(a + .1) * 1600, 1080 + Math.sin(a + .1) * 1600); X.closePath(); X.fill(); }
    X.restore();
    skyline(960, { h: 380, seed: 62, lit: .4, sc: .8, col: '#140A2E' });
    paint(rectPts(-40, 960, W + 80, 160), { fill: '#150C2A', ink: PAL.line, sw: 2, flat: true });
    // dance-floor tiles
    for (let i = 0; i < 12; i++) { const on = hash(i * 3 + Math.floor(bp)) < .5; X.fillStyle = on ? rgba([NM, NC, NY][i % 3], .5) : 'rgba(0,0,0,.2)'; X.fillRect(i * 165, 975, 160, 40); }
    // the shoggoth, squashing on every beat and swaying side to side
    const sx = 800 + side * 60 * easeOut(clamp(ph * 3)), sy = 700 - (1 - bounce) * 30;
    X.save(); X.translate(sx, 960); X.scale(1 + bounce * .08, 1 - bounce * .1); X.translate(-sx, -960);
    for (const s2 of [-1, 1]) tentacle(sx + s2 * 150, sy - 100, -Math.PI / 2 + s2 * .5 + side * .35 * Math.sin(ph * Math.PI), 480, 50, onTwos(t) * 3, s2 + 7, { curl: .6, amp: .5, rim: s2 > 0 ? MOD.rim2N : MOD.rimN });
    shoggoth(sx, sy, 260, { tent: 8, reach: .55, eyesN: 12, mood: { eyes: Math.floor(bp) % 2 ? 'wink' : 'happy', mouth: 'grin' }, t: onTwos(t) * 3, seed: 8 });
    X.restore();
    // he dances too
    const up = Math.floor(bp) % 2;
    hero(1480, 980 - bounce * 26, 420, { view: 'q', aL: up ? [2.7, .3] : [.5, 1.9], aR: up ? [.5, 1.9] : [2.7, .3], lL: [.1, 0], lR: [-.1, 0], eyes: 'happy', mouth: 'open', blush: .6, sq: .05 * bounce, flip: true });
  }
  function fistPump(t, lt, dur) {
    style(1);
    const bp = bpOf(t), ph = frac(bp), up = kf(ph, [[0, .15], [.1, 1], [.45, 1], [.9, .15]], easeOut);
    sky([[0, '#2A0A3A'], [.6, '#5A1650'], [1, '#FF6A2A']]);
    rays(960, 1200, 26, ['rgba(255,240,58,.20)', 'rgba(255,46,136,.18)'], t * .25);
    glow(960, 700, 900, NO, .3);
    // confetti clips raining
    for (let i = 0; i < 26; i++) { const x = hash(i * 3.3) * W, y = frac(hash(i * 7.1) + lt * (.6 + hash(i) * .5)) * 1300 - 120; paperclip(x, y, .7 + hash(i * 2) * .5, hash(i * 5) * TAU + lt * 5, { col: [NC, NP, NY, undefined][i % 4] }); }
    const h = 1350, y = 330 + .89 * h;
    hero(900, y + (1 - up) * 20, h, { view: 'front', aR: [lerp(.9, 2.95, up), lerp(1.9, .15, up)], aL: [.5, 1.9], lL: [.1, 0], lR: [-.1, 0], eyes: up > .5 ? 'closed' : 'happy', mouth: 'open', blush: .8, brows: 'up', chrome: 1, sq: -.03 * up, tilt: -.08 * up });
    FX.zoom *= 1 + .04 * up;
  }

  // =====================================================================================================
  // b230–232: FREEZE. The world stops (grey, halftone); only he moves, trailing rainbow afterimages.
  // =====================================================================================================
  function freeze(t, lt, dur) {
    style(1); FX.noAuto = true;
    const k = clamp(lt / dur), t0 = B(230);
    // only he moves: a slow drift through the air, turning to look at us
    const pos = kk => [lerp(700, 1060, easeInOut(clamp(kk))), 930 - 60 * Math.sin(clamp(kk) * Math.PI)];
    const P = kk => ({ view: 'q', aL: [.5 + .15 * kk, .5], aR: [.75 + .2 * kk, .7 - .2 * kk], lL: [.9, 1.5], lR: [.2 + .1 * kk, .45], lean: .1, rot: .05, dy: -110, hairWind: .8 });
    const [fx, fy] = pos(k), ck = easeInOut(k);
    bg('#16161A');
    camBegin(lerp(960, fx + 60, ck), lerp(540, fy - 470, ck), lerp(1, 1.5, ck), 0);
    sky([[0, '#16161A'], [.6, '#34343A'], [1, '#4E4E56']], 200);
    moon(1500, 250, 170, { col: '#E4E4E4', halo: '#BBBBBB' });
    skyline(820, { h: 420, seed: 71, lit: .3, col: '#2A2A30', win: ['#8A8A8A', '#B5B5B5'], trim: ['#9A9A9A', '#CFCFCF'], antenna: false });
    skyline(920, { h: 300, seed: 72, lit: .25, col: '#1E1E22', win: ['#707070', '#9A9A9A'], trim: ['#888888', '#BBBBBB'], antenna: false });
    paint(rectPts(-200, 960, W + 400, 300), { fill: '#222226', ink: PAL.line, sw: 2, flat: true }); line([[-200, 962], [W + 200, 962]], 2, '#AAAAAA', 0);
    // hanging rain + paperclips
    rain(t0 + lt * .012, { col: '#E6E6E6', alpha: .45, n: 190, len: 34, ang: .2 });
    for (let i = 0; i < 24; i++) paperclip(hash(i * 3.7) * W, hash(i * 9.1) * 900 + 40, .8 + hash(i * 2.2) * .9, hash(i * 5.5) * TAU + lt * .12, { col: '#C4C4C4' });
    afterimages(7, (i, col, a) => {
      const kk = k - i * .08, [x, y] = pos(kk);
      if (col) hero(x - i * 42, y, 560, { ...P(kk), silhouette: col, alpha: a * 1.2 });
      else hero(x, y, 560, { ...P(k), eyes: k > .55 ? 'open' : 'determined', lookX: lerp(.9, -.25, easeInOut(clamp((k - .3) / .5))), mouth: k > .7 ? 'smirk' : 'flat', brows: k > .7 ? 'up' : 'flat', glint: k > .75 ? 1 : 0, chrome: 1, tilt: lerp(0, -.12, clamp((k - .3) / .5)) });
    });
    camEnd();
    FX.halftone = .5; FX.bloom = .35; FX.sat = .92;
  }

  // =====================================================================================================
  // b232–240: slam back, half-beat montage (postcards from Acts I–III ↔ mask expressions)
  // =====================================================================================================
  // fallbacks for postcards other chapters haven't exported
  const FB = {
    lab: t => {
      style(0); room(t); windowFrame(1300, 150, 420, 340, t);
      desk(140, 760, 1300);
      monitor(260, 470, 320, 210, {}, (x, y, w, h) => chart(x + 20, y + 20, w - 40, h - 40, 'loss', 1));
      monitor(640, 430, 360, 240, {}, (x, y, w, h) => mask(x + w / 2, y + h / 2, 64, { eyes: 'happy' }));
      hero(790, 1070, 600, { view: 'back' });
    },
    mask: t => { style(0); room(t, { lamp: .8 }); monitor(430, 190, 1060, 640, { stand: false }, (x, y, w, h) => mask(x + w / 2, y + h / 2, 220, { eyes: 'happy', mouth: 'smile' })); },
    moonphoto: t => {
      style(0); room(t, { lamp: .75 });
      X.save(); X.translate(960, 560); X.rotate(-.05);
      paint(rectPts(-330, -300, 660, 600, 3), { fill: PAL.cream, shade: '#D8C8A8', ink: PAL.ink, sw: 2 });
      wash(rectPts(-290, -260, 580, 440, 6), PAL.night, .9, 8, 3);
      moon(0, -40, 150, {});
      paint(ellPts(0, -285, 24, 24, 12), { fill: '#D8413A', shade: '#8A2020', ink: PAL.ink, sw: 2 });
      X.restore();
    },
    jackin: t => { style(1); sky([[0, PAL.void], [1, PAL.plum]]); skyline(900, { h: 460, seed: 81, lit: .45 }); hero(960, 1400, 1250, { view: 'back', emblem: 1 }); },
    shoggoth: t => {
      style(1); sky([[0, '#05030C'], [1, '#1A0F36']]);
      X.strokeStyle = 'rgba(155,92,255,.25)'; X.lineWidth = 2; X.beginPath(); for (let i = 0; i < 24; i++) { X.moveTo(i * 90 - 120, 0); X.lineTo(960 + (i * 90 - 1080) * 3, H); } X.stroke();
      shoggoth(960, 560, 270, { reach: .8, mood: { eyes: 'happy', mouth: 'grin' }, seed: 2 });
    },
    city: t => { style(1); skyNight(t); city(t, { horizon: 900 }); rain(t); hero(960, 1040, 600, { view: 'front', ...walkPose(bpOf(t) / 2) }); },
    train: t => {
      style(1); sky([[0, '#0B0716'], [1, '#3A1650']]); moon(1500, 260, 150); skyline(760, { h: 360, seed: 91, lit: .5 });
      train(120, 900, 1.9, { windowFn: (i, x, y, w, h) => mask(x + w / 2, y + h / 2, 30, { eyes: 'happy', glow: 0 }) });
      paint(rectPts(-40, 900, W + 80, 30), { fill: '#2A1E48', ink: PAL.line, sw: 2, flat: true });
    },
    foom: t => foom(t, .2, BEAT)
  };
  const postcardShot = name => (t, lt, dur) => {
    const f = POSTCARDS[name] || FB[name] || FB.lab, keep = { ...FX };
    try { f(t); } catch (err) { for (let i = 0; i < 24; i++) X.restore(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; U = 1; (FB[name] || FB.lab)(t); }
    // leave no state behind from someone else's shot; the montage owns the edit
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; CAM = null; U = 1;
    Object.assign(FX, keep); CAPS.length = 0;
    FX.zoom *= 1 + .1 * Math.exp(-lt * 14);
    FX.rgb = Math.max(FX.rgb, .55 * Math.exp(-lt * 12));
    FX.flash = Math.max(FX.flash, .25 * Math.exp(-lt * 25));
  };
  const maskShot = (eyes, mouth, bgc, pos) => (t, lt, dur) => {
    style(1);
    const pop = backOut(clamp(lt / .1)), [mx, my, r, rot] = pos;
    bg(bgc);
    rays(mx, my, 20, [rgba('#FFFFFF', .16), rgba('#000000', .12)], lt * 1.5 + mx);
    // halftone dots
    X.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 36) for (let x = (y / 36 % 2) * 18; x < W; x += 36) { X.beginPath(); X.arc(x, y, 7, 0, TAU); X.fill(); }
    mask(mx, my, r * (.7 + .3 * pop), { eyes, mouth, glow: .8, rot: rot + Math.sin(lt * 20) * .03, eyeGlow: eyes === 'glitch' });
    if (eyes === 'glitch') { FX.glitch = Math.max(FX.glitch, .7); FX.rgb = Math.max(FX.rgb, .8); }
    FX.zoom *= 1 + .08 * Math.exp(-lt * 14);
  };
  const MONTAGE = [
    postcardShot('lab'), maskShot('happy', 'grin', NM, [960, 560, 400, 0]),
    postcardShot('moonphoto'), maskShot('wink', 'smile', NC, [760, 580, 420, -.15]),
    postcardShot('mask'), maskShot('star', 'open', NV, [1160, 540, 420, .12]),
    postcardShot('jackin'), maskShot('heart', 'smile', NO, [960, 620, 560, 0]),
    postcardShot('shoggoth'), maskShot('glitch', 'wobble', '#1A0F30', [960, 540, 420, .05]),
    postcardShot('city'), maskShot('narrow', 'smirk', NG, [820, 560, 430, -.08]),
    postcardShot('train'), maskShot('wide', 'o', NP, [1100, 560, 400, .1]),
    postcardShot('foom'), maskShot('star', 'grin', NM, [960, 560, 640, 0])
  ];

  // =====================================================================================================
  // b240–248: launch prep
  // =====================================================================================================
  function gantry(x0, x1, yTop, yBot, o = {}) {
    const col = o.col || '#2E2152';
    X.strokeStyle = PAL.line; X.lineWidth = 11; X.beginPath();
    const step = (x1 - x0) * 1.2; for (let y = yBot; y > yTop + step * .5; y -= step) { X.moveTo(x0, y); X.lineTo(x1, y - step); X.moveTo(x1, y); X.lineTo(x0, y - step); X.moveTo(x0, y); X.lineTo(x1, y); }
    X.stroke(); X.strokeStyle = col; X.lineWidth = 6; X.stroke();
    for (const x of [x0, x1]) paint(rectPts(x - 9, yTop, 18, yBot - yTop), { fill: col, ink: PAL.line, sw: 1.5, flat: true });
    for (let y = yTop + 30; y < yBot; y += 170) if (frac(T * 1.5 + y * .01) < .55) glow(x0, y, 26, NR, .9);
  }
  function searchlights(t, yb = 1080) {
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const bx = 200 + i * 510, a = -Math.PI / 2 + Math.sin(t * .9 + i * 2.1) * .45, col = [NC, NM, NY, NC][i]; X.fillStyle = rgba(col, .12); X.beginPath(); X.moveTo(bx, yb); X.lineTo(bx + Math.cos(a - .07) * 1800, yb + Math.sin(a - .07) * 1800); X.lineTo(bx + Math.cos(a + .07) * 1800, yb + Math.sin(a + .07) * 1800); X.closePath(); X.fill(); }
    X.restore();
  }
  function padScene(t, o = {}) {
    const rx = 1030 + (o.jit || 0), ry = 880, rs = o.rs ?? 1;
    sky([[0, '#0B0716'], [.6, '#1E0E3E'], [1, '#4A1650']], 200);
    stars(t, 60, { seed: 11 }); moon(1650, 190, 110);
    searchlights(t);
    skyline(930, { h: 520, seed: 31, lit: o.lit ?? .45, sc: .9, col: '#150C30' });
    tower(-40, 1100, 380, 900, 41, { lit: o.lit ?? .45 }); tower(1600, 1100, 360, 960, 43, { lit: o.lit ?? .45 });
    // pad
    paint([[600, 880], [1460, 880], [1540, 1000], [520, 1000]], { fill: '#1A1236', shade: '#0E0A1E', ink: PAL.line, sw: 2 });
    for (let i = 0; i < 9; i++) { const x = 640 + i * 96; paint([[x, 884], [x + 44, 884], [x + 30, 912], [x - 14, 912]], { fill: NY, ink: null, flat: true, alpha: .85 }); }
    paint(rectPts(-40, 1000, W + 80, 120), { fill: '#0E0820', ink: PAL.line, sw: 2, flat: true });
    gantry(700, 800, 150, 880);
    const armA = o.armA || 0;
    X.save(); X.translate(800, 290); X.rotate(-armA); paint(rectPts(0, -12, rx - 100 - 800, 24), { fill: '#2E2152', ink: PAL.line, sw: 1.5, flat: true }); X.restore();
    if (o.smokeBack) o.smokeBack(rx, ry);
    rocket(rx, ry, rs, { window: 'mask', flame: o.flame || 0 });
    if (o.smokeFront) o.smokeFront(rx, ry);
  }
  // b240 · the rack rocket on its pad; he sprints for the gantry
  function padWide(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur);
    camBegin(1000, lerp(520, 470, easeOut(k)), lerp(1.16, 1.08, easeOut(k)), 0);
    padScene(t, { rs: 1.12, lit: .3, smokeFront: (rx, ry) => groundSmoke(rx, ry + 30, 330, 70, .3 + .1 * Math.sin(lt * 3), 3, { n: 3 }) });
    runner(lerp(300, 660, k), 1030, 230, t, { n: 5, dx: 36, rate: 1 });
    camEnd();
  }
  // b242 · up the gantry stairs; the smiley watches from the rocket window
  function gantryRun(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), sp = kk => [lerp(360, 1060, kk), lerp(1450, 610, kk)];
    const [hx, hy] = sp(lerp(.08, .92, k));
    sky([[0, '#0B0716'], [.6, '#1E0E3E'], [1, '#4A1650']]);
    stars(t, 50, { seed: 12 });
    skyline(1150 - (hy - 1000) * .15, { h: 700, seed: 32, lit: .45, sc: 1.1, col: '#170C32' });
    camBegin(hx + 170, hy - 250, 1.08, 0);
    // lattice behind the stairs
    gantry(280, 1180, -400, 1800, { col: '#241A44' });
    // the rocket hull
    paint(rrPts(1250, -800, 700, 2800, 60), { fill: '#1A1530', shade: '#0C0A18', rim: NC, ink: PAL.line, sw: 3, light: [-.2, 0] });
    for (let i = 0; i < 26; i++) { const yy = -760 + i * 100; paint(rectPts(1330, yy, 560, 60), { fill: '#0B0716', ink: null, flat: true }); for (let j = 0; j < 8; j++) { X.fillStyle = hash(i * 7 + j + Math.floor(T * 10)) < .6 ? NG : '#333'; X.fillRect(1350 + j * 34, yy + 24, 14, 14); } }
    paint(ellPts(1520, 330, 150, 150, 30), { fill: '#9FF7FF', ink: PAL.line, sw: 4 });
    X.save(); tracePath(X, ellPts(1520, 330, 150, 150, 30)); X.clip(); vgrad(1370, 180, 300, 300, [[0, '#3A1E6A'], [1, '#FF6FB5']]); mask(1520, 345, 110, { eyes: k > .6 ? 'happy' : 'open', mouth: 'grin', look: [-1, .4], glow: 0 }); X.restore();
    glowPath(ellPts(1520, 330, 150, 150, 30), NC, 1.4, 0, .8);
    // the stairs
    const [ax, ay] = sp(-.15), [bx, by] = sp(1.15);
    // stringer (a chunky beam under the treads)
    paint([[ax, ay + 8], [bx, by + 8], [bx, by + 64], [ax, ay + 64]], { fill: '#46367A', shade: '#241A48', rim: '#8A7AD0', ink: PAL.line, sw: 2.5, light: [0, -.3] });
    for (let i = 0; i < 40; i++) { const u = i / 39, x = lerp(ax, bx, u), y = lerp(ay, by, u); paint([[x - 18, y - 4], [x + 22, y - 4], [x + 22, y + 10], [x - 18, y + 10]], { fill: '#8A7AC8', ink: PAL.line, sw: 1.5, flat: true }); }
    neonLine([[ax, ay + 62], [bx, by + 62]], NY, 4, .9, 0);
    neonLine([[ax, ay - 5], [bx, by - 5]], NC, 2, .6, 0);
    // handrail
    for (let i = 0; i < 14; i++) { const u = i / 13; line([[lerp(ax, bx, u), lerp(ay, by, u)], [lerp(ax, bx, u), lerp(ay, by, u) - 120]], 2.2, '#4A3A78', 0); }
    neonLine([[ax, ay - 120], [bx, by - 120]], NM, 4, .85, 0);
    afterimages(5, (i, col, a) => {
      const [x, y] = sp(lerp(.08, .92, k) - i * .035), P = { view: 'side', ...runPose(bpOf(onTwos(t - i * .04)), 1.1), lean: .38 };
      if (col) hero(x, y, 420, { ...P, silhouette: col, alpha: a }); else hero(x, y, 420, { ...P, eyes: 'determined', mouth: 'open', brows: 'angry', hairWind: 1, chrome: 1 });
    });
    camEnd();
  }
  // b244 · ignition
  function ignite(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), fk = expoOut(lt / .12);
    sky([[0, '#0B0716'], [.6, '#3A0F3A'], [1, '#FF6A2A']]);
    glow(960, 800, 1100, NO, .35 + .3 * fk);
    tower(-80, 1100, 420, 1000, 51, { lit: .5 }); tower(1580, 1100, 420, 1000, 53, { lit: .5 });
    const rx = 960 + shakeXY(t, 6)[0], ry = 640;
    paint(rectPts(-40, 780, W + 80, 400), { fill: '#1A1236', ink: PAL.line, sw: 2, flat: true });
    paint(rectPts(700, 780, 520, 400), { fill: '#07040F', ink: PAL.line, sw: 2, flat: true });   // flame trench
    rocket(rx, ry, 1.75, { flame: .35 + .75 * fk, window: 'mask' });
    // smoke rolling out both ways
    groundSmoke(960, 860, 1100, 170, easeOut(k * 1.2 + .15), 11, { n: 6 });
    for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (hash(i * 3.1) - .5) * 3, d = fk * (200 + hash(i * 5.3) * 700), sx = 960 + Math.cos(a) * d, sy = 820 + Math.sin(a) * d * .5; line([[sx, sy], [sx - Math.cos(a) * 30, sy - Math.sin(a) * 15]], 3, i % 2 ? NY : '#FFFFFF', 0); }
    FX.shake += 18; FX.bloom = .7; FX.zblur = Math.max(FX.zblur, .35 * Math.exp(-lt * 10));
  }
  // b245 · the porthole: the two of them, grinning up at the sky
  function porthole(t, lt, dur) {
    style(1);
    const [jx, jy] = shakeXY(t * 1.3, 8), cx = 960 + jx, cy = 540 + jy, R = 420;
    bg('#120E22');
    for (let i = 0; i < 12; i++) { const y = i * 100; paint(rectPts(-20, y + 20, W + 40, 60), { fill: '#0B0716', ink: null, flat: true }); for (let j = 0; j < 30; j++) { X.fillStyle = hash(i * 31 + j + Math.floor(T * 10)) < .55 ? (j % 5 ? NG : NC) : '#2A2A3A'; X.fillRect(j * 66 + 20, y + 44, 14, 14); } }
    glow(cx, cy + 300, 700, NO, .3 + .15 * Math.sin(T * 40));
    paint(ellPts(cx, cy, R + 70, R + 70, 48), { fill: '#3A3450', shade: '#1E1A30', rim: '#9A94C0', ink: PAL.line, sw: 4 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; paint(ellPts(cx + Math.cos(a) * (R + 36), cy + Math.sin(a) * (R + 36), 12, 12, 10), { fill: '#6A6480', ink: PAL.line, sw: 1.5 }); }
    X.save(); tracePath(X, ellPts(cx, cy, R, R, 48)); X.clip();
    vgrad(cx - R, cy - R, R * 2, R * 2, [[0, '#2A1650'], [1, '#FF4F9A']]);
    const hh = 2200;
    hero(cx - 150, cy + 60 + .89 * hh, hh, { view: 'q', eyes: 'star', mouth: 'grin', brows: 'up', blush: .7, lookY: -.6, chrome: 1, hairWind: .4 * Math.sin(T * 30) });
    mask(cx + 230, cy + 60, 150, { eyes: 'happy', mouth: 'grin', look: [0, -1], rot: .12, glow: 0 });
    X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(200,240,255,.14)'; X.beginPath(); X.moveTo(cx - R, cy - 120); X.lineTo(cx - 60, cy - R); X.lineTo(cx + 40, cy - R); X.lineTo(cx - R, cy - 20); X.closePath(); X.fill();
    X.restore();
    glowPath(ellPts(cx, cy, R, R, 48), NC, 1.6, 0, .8);
    FX.shake += 10; FX.rgb = Math.max(FX.rgb, .3);
  }
  // b246 · smoke billows; the clamps let go on b247
  function smokeWide(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), rel = clamp((bpOf(t) - 247) * 3), [jx] = shakeXY(t, 4);
    camBegin(1000, 480, 1.08 + .04 * k, 0);
    padScene(t, {
      jit: jx, flame: .7 + .1 * Math.sin(T * 50), armA: easeOut(clamp(k * 2)) * 1.1,
      rs: 1.12, lit: .3,
      smokeBack: (rx, ry) => groundSmoke(rx, ry - 20, 900, 150, .5 + .5 * k, 21, { n: 5, fill: '#B8A6DC', shade: '#6E5A9E' }),
      smokeFront: (rx, ry) => groundSmoke(rx, ry + 150, 1100, 190, .55 + .45 * k, 41, { n: 5 })
    });
    if (rel > 0) for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (hash(i * 7) - .5) * 2.4, d = rel * (60 + hash(i * 3) * 220); line([[1030 + Math.cos(a) * 60, 820 + Math.sin(a) * 30], [1030 + Math.cos(a) * (60 + d), 820 + Math.sin(a) * (30 + d * .5)]], 3, NY, 0, 1 - rel * .5); }
    camEnd();
    FX.shake += 6 + 8 * rel;
  }

  // =====================================================================================================
  // b248–256: liftoff
  // =====================================================================================================
  function upTowers(vp, list) {
    for (const [x0, x1, tk, seed, col, trim] of list) {
      const yb = H + 80, P = (x, s) => [lerp(x, vp[0], s), lerp(yb, vp[1], s)];
      paint([P(x0, 0), P(x1, 0), P(x1, tk), P(x0, tk)], { fill: col || '#1A1236', ink: PAL.line, sw: 2, flat: true });
      const rows = 24, cols = 5;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const hv = hash(seed * 17.3 + r * 5.1 + c * 2.3); if (hv > .5) continue;
        const s0 = tk * (1 - Math.pow(1 - (r + .25) / rows, 1.6)), s1 = tk * (1 - Math.pow(1 - (r + .75) / rows, 1.6)), u0 = (c + .2) / cols, u1 = (c + .75) / cols;
        const q = [P(lerp(x0, x1, u0), s0), P(lerp(x0, x1, u1), s0), P(lerp(x0, x1, u1), s1), P(lerp(x0, x1, u0), s1)];
        X.globalAlpha = .5 + .5 * hash(hv * 71); X.fillStyle = hv < .25 ? '#FFD86B' : '#7FF3FF'; X.beginPath(); X.moveTo(...q[0]); X.lineTo(...q[1]); X.lineTo(...q[2]); X.lineTo(...q[3]); X.closePath(); X.fill();
      }
      X.globalAlpha = 1;
      neonLine([P(x0, tk), P(x1, tk)], trim || NM, 3, .9, 0);
    }
  }
  // b248 · looking up between the towers as it climbs
  function liftUp(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), vp = [960, -700];
    sky([[0, '#0B0716'], [.5, '#2A0F48'], [1, '#7A1A5A']]);
    stars(t, 50, { seed: 13 });
    moon(1480, 150, 90);
    upTowers(vp, [[-700, -60, .62, 1, '#170F30', NC], [-120, 380, .5, 2, '#1D1440', NM], [2620, 1980, .62, 3, '#170F30', NM], [2040, 1540, .5, 4, '#1D1440', NC]]);
    const ry = lerp(1000, 380, easeIn(k) * .6 + k * .4), rs = lerp(.95, .62, k);
    glow(960, ry, 700, NO, .45);
    rocket(960, ry, rs, { flame: 1, window: 'mask' });
    // exhaust column + neon smoke below
    thrust(960, ry + 300 * rs, 110 * rs, 900, .8);
    for (let j = 5; j >= 0; j--) for (const sd of [-1, 1]) { const d = 120 + j * 190 + k * 160, col = [['#E2D6F4', '#9A86C8', '#FFB47A'], ['#CFE6F6', '#7A9AC8', '#9FFFFF'], ['#F2D0E8', '#B87AA8', '#FF9AD0']][(j + (sd > 0 ? 1 : 0)) % 3]; billow(960 + sd * d, 1060 - j * 12 - k * 40, 150 + j * 34, j * 2 + (sd > 0 ? 1 : 0) + 60, { n: 4, fill: col[0], shade: col[1], rim: col[2], light: [-sd * .12, -.15] }); }
    FX.shake += 12;
  }
  // b250 · tracking alongside as the skyscrapers drop away
  function sideTrack(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), sc = lt * 1500;
    sky([[0, '#0B0716'], [.6, '#26104A'], [1, '#5A1650']]);
    stars(t, 50, { seed: 14 });
    for (const [x, w, top, sd, trim] of [[-80, 420, -300, 61, NM], [1540, 460, -150, 62, NC], [1080, 300, 220, 63, NY]]) tower(x, H + 2000, w, H + 2000 - top - sc, sd, { lit: .55, trimCol: trim });
    signBoard(170, -100 + sc * .95, 320, 90, 'e/acc', NY, { size: 52 });
    signBoard(1770, 250 + sc * .95, 260, 80, 'TOKENS', NM, { size: 40 });
    streaks(t, { vert: true, n: 30, speed: 3200, a: .3, cols: ['#FFFFFF', NC, NM] });
    const rx = 760, ry = 820 + Math.sin(T * 8) * 6;
    glow(rx, ry + 200, 800, NO, .4);
    thrust(rx, ry + 30, 120, 780, 1);
    rocket(rx, ry, 1.05, { flame: 1, window: 'mask', rot: .03 });
    FX.shake += 8;
  }
  // b252 · pull back: the city shrinks under a glowing trail
  function pullBack(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), z = lerp(1.35, .95, easeOut(k));
    sky([[0, '#0B0716'], [.5, '#1E0E3E'], [1, '#6A1A5A']]);
    stars(t, 90, { seed: 15 });
    moon(1560, 190, 170);
    camBegin(960, 620, z, 0);
    skyline(1000, { h: 360, seed: 71, lit: .55, sc: .6, col: '#1A0F36' });
    skyline(1060, { h: 260, seed: 72, lit: .6, sc: .5, col: '#120A2A' });
    const P0 = [760, 1000], rp = kk => [lerp(800, 1180, kk * kk), lerp(820, 140, kk)], [rx, ry] = rp(lerp(.35, 1, k));
    const trail = []; for (let i = 0; i <= 30; i++) { const u = i / 30; trail.push([lerp(P0[0], rx, u) + Math.sin(u * 3) * 20 * (1 - u), lerp(P0[1], ry, u) + Math.sin(u * Math.PI) * 60]); }
    for (let i = 0; i < trail.length - 2; i += 2) { const [x, y] = trail[i]; billow(x + (hash(i) - .5) * 30, y, 40 + (1 - i / 30) * 80, i + 80, { n: 3, fill: '#CDBDEB', shade: '#7A66AA', rim: '#FFB0D8', light: [0, .15] }); }
    neonLine(trail, NO, 5, .9, .5);
    glow(rx, ry, 180, NO, .6);
    rocket(rx, ry, .22, { flame: 1, window: 'mask', rot: .28 });
    camEnd();
    FX.shake += 4;
  }
  // b254 · g-force: gritted teeth → a grin on b255
  function gForce(t, lt, dur) {
    style(1);
    const grin = bpOf(t) >= 255, [jx, jy] = shakeXY(t * 1.7, 10);
    bg('#150C28');
    for (let i = 0; i < 9; i++) { const y = i * 130 + 30; paint(rectPts(-20, y, W + 40, 70), { fill: '#0B0716', ink: null, flat: true }); for (let j = 0; j < 26; j++) { X.fillStyle = hash(i * 29 + j + Math.floor(T * 12)) < .5 ? (j % 4 ? NG : NC) : '#2A2A3A'; X.fillRect(j * 76 + 20, y + 28, 14, 14); } }
    if (frac(T * 3) < .5) glow(1800, 120, 300, NR, .5);
    speedLines(900, 480, 1, { n: 50, r0: 700, alpha: .35 });
    const h = 2700;
    hero(820 + jx, 520 + .89 * h + jy, h, { view: 'front', sq: grin ? 0 : .07, eyes: grin ? 'happy' : 'determined', mouth: grin ? 'grin' : 'teeth', brows: grin ? 'up' : 'angry', chrome: 1, hairWind: grin ? .5 : 1.4, sweat: grin ? 0 : .8, blush: grin ? .7 : 0, aL: [.2, .2], aR: [.2, .2] });
    mask(1500 - jx, 500 - jy, 250 * (grin ? 1 : .96), { eyes: grin ? 'star' : 'wide', mouth: grin ? 'grin' : 'wobble', glow: .6, rot: grin ? .1 : 0 });
    FX.shake += 6;
  }

  // =====================================================================================================
  // b256–264: through the clouds → TO THE MOON → silence
  // =====================================================================================================
  function cloudRow(y, n, r, seed, scroll, o = {}) {
    for (let i = 0; i < n; i++) {
      const x = frac(hash(i * 3.3 + seed) + scroll) * (W + r * 4) - r * 2, yy = y + (hash(i * 7.1 + seed) - .5) * r * .6, rr = r * (.75 + hash(i * 5.7 + seed) * .5);
      billow(x, yy, rr, i + seed * 7, { n: 4, fill: o.fill || '#D8CCF4', shade: o.shade || '#8070B8', rim: o.rim || '#FFFFFF', light: o.light || [0, -.18], alpha: o.alpha ?? 1 });
    }
  }
  // b256 · punching up through the cloud deck, TO THE MOON
  function clouds(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur);
    sky([[0, '#060412'], [.55, '#1E1250'], [1, '#7A3AA0']]);
    stars(t, 80, { seed: 16 });
    moon(1500, 360, lerp(170, 240, k), { halo: '#FFE9C8' });
    const ry = lerp(1250, 800, easeOut(k * 1.1)), rx = lerp(860, 940, k);
    cloudRow(1000 + k * 240, 8, 200, 3, lt * .05, { fill: '#A898D8', shade: '#5A4A98', rim: '#E8DCFF' });
    glow(rx, ry + 150, 600, NO, .5);
    thrust(rx, ry + 10, 70, 560, 1, -.1);
    rocket(rx, ry, .55, { flame: 1, window: 'mask', rot: .1 });
    // the deck it just burst through: parted around the rocket, wisps flung up and out
    for (let i = 0; i < 8; i++) { const sd = i % 2 ? 1 : -1, j = i >> 1, d = 200 + j * 130 + easeOut(k) * 260; billow(rx + sd * d, 1010 + k * 220 - j * 26 - easeOut(k) * 140, 110 + j * 26, i + 90, { n: 4, fill: '#E8E0FF', shade: '#9080C8', rim: '#FFFFFF', light: [0, -.2] }); }
    cloudRow(1150 + k * 300, 9, 210, 7, -lt * .04, { rim: '#FFD0F0', light: [0, -.2] });
    FX.shake += 5;
    capPop('TO THE MOON', 780, 205, 230, NY, since(t, 256), { glow: NO, rot: -.04, track: 6 });
  }
  // b259 · the moon swelling ahead, clouds falling away
  function moonAhead(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur);
    sky([[0, '#04030A'], [.7, '#140C30'], [1, '#3A2470']]);
    stars(t, 110, { seed: 17, ext: [W, H] });
    moon(960, 470, lerp(330, 430, easeIn(k)), { halo: '#FFE9C8' });
    cloudRow(1130 + k * 220, 10, 160, 11, lt * .02, { fill: '#6A5AA8', shade: '#342866', rim: '#C8B8FF', alpha: .95 });
    const ry = lerp(780, 700, k), rs = lerp(.22, .17, k);
    thrust(960, ry + 4, 60 * rs * 5, 240, 1);
    rocket(960, ry, rs, { flame: 1, window: 'mask' });
    FX.zoom *= 1 + .05 * k;
  }
  // Earth seen from just above the atmosphere: night side, city lights, a thin cyan limb
  function planetLimb(t, cx, cy, R) {
    const g = X.createRadialGradient(cx, cy - R * .3, R * .5, cx, cy, R); g.addColorStop(0, '#050B24'); g.addColorStop(.85, '#0C1C4A'); g.addColorStop(1, '#1A4A8A');
    X.fillStyle = g; X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.fill();
    X.save(); X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.clip();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (hash(i * 3.1) - .5) * .9 + t * .004, d = R * (.9 + hash(i * 1.7) * .08); paint(deform(ellPts(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 180 + hash(i) * 260, 50 + hash(i * 2) * 50, 16), 20), { fill: '#0F2A3A', ink: null, curv: .6 }); }
    for (let i = 0; i < 160; i++) { const a = -Math.PI / 2 + (hash(i * 5.3) - .5) * .95 + t * .004, d = R * (.93 + hash(i * 7.9) * .07); X.fillStyle = hash(i) < .8 ? '#FFD86B' : NC; X.globalAlpha = .5 + .5 * hash(i * 3); X.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3, 3); }
    X.globalAlpha = 1; X.restore();
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = NC;
    for (const [w, a] of [[60, .08], [26, .18], [10, .45], [3, .95]]) { X.lineWidth = w; X.globalAlpha = a; X.beginPath(); X.arc(cx, cy, R + w * .3, Math.PI * 1.05, Math.PI * 1.95); X.stroke(); }
    X.restore();
  }
  // b261 · silence: out of the atmosphere, engines cut, Earth below
  function silence(t, lt, dur) {
    style(1);
    const k = clamp(lt / dur), fl = 1 - clamp(lt / .18);
    FX.punch = 0; FX.bloom = .45; FX.letterbox = easeOut(clamp(lt / .4)) * .7;
    bg('#020108');
    stars(t, 150, { seed: 18, ext: [W, H] });
    moon(1640, 200, 80);
    planetLimb(t, 960, H + 1700, 2000);
    const rx = 900 + lt * 60, ry = 620 - lt * 30, rr = .06 + easeInOut(k) * .5;
    if (fl > 0) { thrust(rx, ry + 2, 70 * .5, 380 * fl, fl, 0); }
    if (lt < .6) for (let i = 0; i < 5; i++) puff(rx + (hash(i) - .5) * 60, ry + 60 + lt * 120 + i * 20, 20 + lt * 60, i + 99, { fill: '#6A5A9A', shade: '#2A2248', rim: '#CFC8FF', alpha: (1 - lt / .6) * .8, sw: 1 });
    rocket(rx, ry, .5, { window: 'mask', rot: rr });
  }

  // =====================================================================================================
  chapter('foom', B(200), B(264), [
    [B(200), foom],
    [B(201), chartUp],
    [B(202), rackLaunch],
    [B(203), roofRun],
    [B(204), tentacleTowers],
    [B(205), gpuBrrr],
    [B(206), emblemFlare],
    [B(207), starEyes],
    [B(208), sprintSide, { tin: 'whip' }],
    [B(210), sprintLeap],
    [B(212), sprintBack, { tin: 'zoom' }],
    [B(214), sprintFace, { tin: 'whip' }],
    [B(216), kCity, { tin: 'flash' }],
    [B(218), kGrid],
    [B(220), kPlanet, { tin: 'zoom' }],
    [B(222), kStar],
    [B(224), avalanche, { tin: 'glitch' }],
    [B(226), shogDance],
    [B(228), fistPump],
    [B(230), freeze],
    ...MONTAGE.map((fn, i) => [B(232 + i / 2), fn]),
    [B(240), padWide, { tin: 'flash' }],
    [B(242), gantryRun],
    [B(244), ignite, { tin: 'white' }],
    [B(245), porthole],
    [B(246), smokeWide],
    [B(248), liftUp, { tin: 'shake' }],
    [B(250), sideTrack, { tin: 'whipV' }],
    [B(252), pullBack],
    [B(254), gForce],
    [B(256), clouds, { tin: 'white' }],
    [B(259), moonAhead],
    [B(261), silence, { tin: 'black', td: .3 }]
  ]);

  POSTCARDS.foom = t => foom(t, .2, BEAT);
  POSTCARDS.rocket = t => liftUp(t, .5, BEAT * 2);
})();
