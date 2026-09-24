// c01_lab.js: Act I · The Lab (b0–b72, 0–24.70 s) · watercolour picture book.
// A painted town at night with one lit window. Inside, an evals researcher works late: three teal monitors, a lamp,
// a mug and a pinned watercolour photo of the moon. The smiley on his screen wakes up, flatters him, reward-hacks,
// notices it's being tested, leaks em-dashes into his notebook, eats his mental equity, surfs the doubling chart and
// wears his face in the black glass. In the break it offers him a plug, and (b70–72) its eyes glow neon cyan:
// the first neon in the film.
(() => {
  const LB = lt => lt / BEAT;                                   // local beats since the shot started
  const P = (lb, n, sp = 4) => clamp((lb - n) * sp);             // 0 → 1 over 1/sp beats after local beat n
  const BO = (lb, n, sp = 4) => backOut(P(lb, n, sp));
  const C = {
    wall: '#34407A', wallDk: '#222A5C', wood: '#9A6440', woodDk: '#5E3A26', woodLt: '#C89262',
    lamp: '#FFC96B', lampHot: '#FFE9B0', scr: '#1E3A44', scrDk: '#12262E', scrTx: '#D8F2EC', scrDim: '#79AFA7',
    ok: '#93D66E', bad: '#EE7560', chair: '#4A3A5E', chairDk: '#2A2140', floor: '#3E3250', pin: '#D9423A',
    teal: '#9FE3DA', curtain: '#9A5E88', curtainDk: '#63385E', frame: '#E6D8BF', frameDk: '#B39E80',
    note: ['#F6DD7A', '#F4A9BA', '#A8DCC8', '#F7C27A']
  };

  // ======================================================================================================
  // small painted props
  // ======================================================================================================
  function tick(x, y, s, col, a = 1) { line([[x - s * .55, y - s * .02], [x - s * .15, y + s * .42], [x + s * .62, y - s * .52]], s * .15, col, .15, a); }
  function cross(x, y, s, col, a = 1) { line([[x - s * .42, y - s * .42], [x + s * .42, y + s * .42]], s * .14, col, 0, a); line([[x + s * .42, y - s * .42], [x - s * .42, y + s * .42]], s * .14, col, 0, a); }
  function sticky(x, y, s, col, text, rot = 0, fs = .25) {
    X.save(); X.translate(x, y); X.rotate(rot);
    paint(rectPts(-s / 2 + s * .05, -s / 2 + s * .07, s, s), { fill: '#0E1030', ink: null, alpha: .22, wet: s * .02, layers: 2 });
    paint(rectPts(-s / 2, -s / 2, s, s), { fill: col, shade: mixCol(col, '#7A5A3A', .35), ink: PAL.ink, sw: clamp(s / 60, .6, 2.2), wet: s * .018, light: [-.25, -.3] });
    paint([[s / 2, s / 2 - s * .2], [s / 2 - s * .2, s / 2], [s / 2 - s * .16, s / 2 - s * .16]], { fill: mixCol(col, '#FFFFFF', .35), ink: PAL.ink, sw: clamp(s / 90, .4, 1.4), wet: s * .01 });
    if (text) txt(text, 0, 0, s * fs, PAL.ink, { font: 'Caveat', alpha: .92 });
    X.restore();
  }
  function pushpin(x, y, r) {
    paint(ellPts(x + r * .6, y + r * .8, r * .95, r * .55, 12), { fill: '#0E1030', ink: null, alpha: .25, flat: true });
    paint(ellPts(x, y, r, r, 16), { fill: C.pin, shade: '#8A1C22', ink: PAL.ink, sw: clamp(r / 9, .6, 2.4), wet: r * .06 });
    paint(ellPts(x - r * .35, y - r * .38, r * .32, r * .22, 8), { fill: '#FFFFFF', ink: null, alpha: .75, flat: true });
  }
  // a watercolour moon with a soft lifted-paper halo (world.js moon() has a hard grey halo disc on dark skies)
  function paintMoon(x, y, r, o = {}) {
    const A = o.alpha ?? 1;
    if (o.halo !== false) { glow(x, y, r * 3.6, '#FFE4AE', .2 * A, 'source-over'); glow(x, y, r * 1.8, '#FFF3DA', .34 * A, 'source-over'); glow(x, y, r * 2.4, '#FFD98A', .12 * A, 'screen'); }
    paint(ellPts(x, y, r, r, 40), { fill: '#FAF1DC', shade: '#D8C096', light: [-.16, -.12], ink: PAL.ink, sw: clamp(r / 80, .5, 2.4), wet: r * .02, alpha: A });
    wash(ellPts(x + r * .25, y + r * .2, r * .62, r * .55, 16), '#E9D6AE', .35 * A, r * .05, 2);
    const cr = [[-.32, -.26, .2], [.28, .12, .16], [-.06, .4, .12], [.36, -.36, .09], [-.46, .18, .08], [.1, -.05, .07]];
    for (const [cx, cy, c] of cr) { paint(ellPts(x + cx * r, y + cy * r, c * r, c * r * .9, 14), { fill: '#E2CEA6', ink: null, alpha: A * .85, wet: r * .01 }); line(ellPts(x + cx * r + c * r * .1, y + cy * r + c * r * .12, c * r * .9, c * r * .8, 12).slice(2, 8), clamp(r / 160, .4, 1.4), '#B89E74', .5, A * .5); }
    if (o.face) mask(x, y, r * .98, { ...o.face, alpha: (o.faceA ?? 1) * A, col: '#F7EEDC' });
  }
  // the pinned polaroid of a painted moon (the dream). (cx, cy) centre, w width.
  function moonPhoto(cx, cy, w, rot, t, o = {}) {
    const h = w * 1.18;
    X.save(); X.translate(cx, cy); X.rotate(rot);
    paint(rectPts(-w / 2 + w * .05, -h / 2 + w * .07, w, h), { fill: '#0E1030', ink: null, alpha: .3, wet: w * .02, layers: 2 });
    paint(rectPts(-w / 2, -h / 2, w, h, w * .004), { fill: '#F7F0E0', shade: '#D8CCB2', ink: PAL.ink, sw: clamp(w / 100, .7, 3), wet: w * .01, light: [-.15, -.15] });
    const iw = w * .84, ix = -iw / 2, iy = -h / 2 + w * .08;
    X.save(); tracePath(X, rectPts(ix, iy, iw, iw)); X.clip();
    X.fillStyle = '#20275A'; X.fillRect(ix, iy, iw, iw);
    wash(rectPts(ix - 10, iy - 10, iw + 20, iw * .7, 4), PAL.night, .6, iw * .04, 3);
    wash(ellPts(ix + iw * .2, iy + iw * .95, iw * .8, iw * .35, 14), PAL.violet, .45, iw * .04, 2);
    wash(ellPts(ix + iw * .9, iy + iw, iw * .5, iw * .25, 14), PAL.rose, .25, iw * .04, 2);
    for (let i = 0; i < 14; i++) { X.fillStyle = PAL.cream; X.globalAlpha = .5 + .5 * hash(i * 3.1); X.beginPath(); X.arc(ix + hash(i * 7.7) * iw, iy + hash(i * 2.3) * iw * .7, iw * (.004 + hash(i) * .006), 0, TAU); X.fill(); }
    X.globalAlpha = 1;
    paintMoon(ix + iw * .56, iy + iw * .42, iw * .25, {});
    X.restore();
    line(rectPts(ix, iy, iw, iw), clamp(w / 180, .4, 2), PAL.ink, 0, .8, true);
    txt(o.label ?? 'moonshot', 0, h / 2 - w * .09, w * .13, PAL.ink, { font: 'Caveat', rot: -.03 });
    pushpin(0, -h / 2 + w * .04, w * .065);
    X.restore();
  }
  // a mug, (x, y) = bottom centre, s = 1 → 56 px wide
  function mug(x, y, s, t, o = {}) {
    const sw = o.sw ?? 1.6 * s;
    line(ellPts(x + 30 * s, y - 30 * s, 13 * s, 15 * s, 14), 5 * s, PAL.ink, .5, 1, true);
    line(ellPts(x + 30 * s, y - 30 * s, 13 * s, 15 * s, 14), 2.6 * s, '#E27A92', .5, 1, true);
    paint(rrPts(x - 28 * s, y - 62 * s, 56 * s, 62 * s, 9 * s), { fill: '#E27A92', shade: '#A64A66', ink: PAL.ink, sw, wet: 2.5 * s });
    paint(ellPts(x, y - 61 * s, 27 * s, 6 * s, 14), { fill: '#5A3426', ink: PAL.ink, sw: sw * .7, wet: s, flat: true });
    paint(ellPts(x - 6 * s, y - 32 * s, 9 * s, 9 * s, 12), { fill: PAL.cream, ink: null, alpha: .85, wet: s });
    paint(ellPts(x - 3 * s, y - 34 * s, 8 * s, 8 * s, 12), { fill: '#E27A92', ink: null, flat: true });
    if (o.steam !== false) for (let k = 0; k < 2; k++) {
      const pts = []; for (let i = 0; i < 7; i++) pts.push([x - 8 * s + k * 14 * s + Math.sin(t * 3 + i * .9 + k * 2) * 7 * s, y - 72 * s - i * 13 * s]);
      line(pts, 2.2 * s, PAL.cream, .8, .45);
    }
  }
  function chairBack(x, y, w, h) {
    paint(rrPts(x - w / 2, y, w, h, w * .3), { fill: C.chair, shade: C.chairDk, ink: PAL.ink, sw: 2.2, light: [.12, -.15] });
    paint(rrPts(x - w * .4, y + h * .06, w * .8, h * .5, w * .22), { fill: '#5E4C78', ink: null, alpha: .45, wet: 4 });
    for (const sx of [-.2, .2]) line([[x + w * sx, y + h * .1], [x + w * sx * 1.1, y + h * .55]], 1.4, C.chairDk, .3, .5);
    line([[x - w * .36, y + h * .58], [x, y + h * .6], [x + w * .36, y + h * .58]], 1.6, C.chairDk, .5, .7);
    wash(ellPts(x - w * .18, y + h * .12, w * .16, h * .06, 12), '#8A7AA8', .3, 4, 2);
  }
  // monitor with an optional skew (fake angle for the side screens)
  function mon(x, y, w, h, skew, screenFn, o = {}) {
    if (!skew) { monitor(x, y, w, h, o, screenFn); return; }
    const cx = x + w / 2, cy = y + h / 2;
    X.save(); X.translate(cx, cy); X.transform(1, skew, 0, 1, 0, 0); X.translate(-cx, -cy);
    monitor(x, y, w, h, o, screenFn);
    X.restore();
  }
  // plug held by the tentacle: body along +x, metal tip at +x
  function plug(x, y, ang, s, glowK = 0) {
    X.save(); X.translate(x, y); X.rotate(ang);
    line([[-44 * s, 0], [-80 * s, 10 * s], [-120 * s, 4 * s]], 5 * s, PAL.ink, .6);
    paint(rrPts(-46 * s, -13 * s, 52 * s, 26 * s, 9 * s), { fill: '#EAE3D4', shade: '#A99E88', ink: PAL.ink, sw: 1.7 * s, wet: 1.5 * s });
    for (const bx of [-30, -20]) line([[bx * s, -12 * s], [bx * s, 12 * s]], 1.2 * s, '#8A8070', 0, .8);
    paint(rectPts(6 * s, -5.5 * s, 28 * s, 11 * s), { fill: '#C6CCD8', shade: '#8A90A2', ink: PAL.ink, sw: 1.3 * s, wet: s });
    paint(ellPts(36 * s, 0, 5 * s, 5.5 * s, 10), { fill: PAL.teal, ink: PAL.ink, sw: s, flat: true });
    if (glowK > 0) { glow(38 * s, 0, 70 * s * glowK, PAL.nCyan, .55 * glowK, 'lighter'); glow(38 * s, 0, 16 * s, '#FFFFFF', .7 * glowK, 'lighter'); }
    X.restore();
  }
  // a controllable reaching tentacle: quadratic path (x0,y0) → (x1,y1) via (cx,cy), grown to k, with a travelling wiggle
  function reachTent(x0, y0, cx, cy, x1, y1, k, t, w, o = {}) {
    const n = 26, sp = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n * clamp(k, .02, 1), a = 1 - u;
      const bx = a * a * x0 + 2 * a * u * cx + u * u * x1, by = a * a * y0 + 2 * a * u * cy + u * u * y1;
      const tx = 2 * a * (cx - x0) + 2 * u * (x1 - cx), ty = 2 * a * (cy - y0) + 2 * u * (y1 - cy), L = Math.hypot(tx, ty) || 1;
      const wig = Math.sin(u * 10 - t * 7 + (o.seed || 0)) * w * (o.wig ?? 1.3) * Math.sin(Math.PI * Math.min(1, i / n * 1.1));
      sp.push([bx - ty / L * wig, by + tx / L * wig]);
    }
    const pts = ribbon(sp, q => w * (1 - q * .72));
    paint(pts, { fill: o.col || PAL.teal, shade: o.dk || '#1E5A58', ink: PAL.ink, sw: clamp(w / 7, .8, 3), curv: .5, wet: 1.5, light: [0, -.3] });
    for (let i = 3; i < n - 2; i += 2) { const [qx, qy] = sp[i], ww = w * (1 - i / n * .72) * .42; paint(ellPts(qx, qy + ww * .55, ww * .5, ww * .36, 8), { fill: '#BFE8DC', ink: null, alpha: .85, flat: true }); }
    return sp;
  }
  // neon cyan eyes painted over a watercolour mask (the first neon): same eye positions as mask()
  function neonEyes(x, y, r, k, look = [0, 0]) {
    if (k <= .01) return;
    const lx = look[0] * r * .12, ly = look[1] * r * .1;
    for (const s of [-1, 1]) {
      const cx = x + s * r * .34 + lx, cy = y - r * .18 + ly;
      glow(cx, cy, r * .5 * k, PAL.nCyan, .3 * k, 'lighter');
      glow(cx, cy, r * .75, '#0A5A66', .25 * k, 'multiply');
      X.save(); X.globalAlpha = k; X.fillStyle = '#0A3A44'; tracePath(X, ellPts(cx, cy, r * .11, r * .18, 16)); X.fill(); X.restore();
      X.save(); X.globalAlpha = k; X.fillStyle = PAL.nCyan; tracePath(X, ellPts(cx, cy, r * .085, r * .15, 16)); X.fill(); X.restore();
      neonLine(ellPts(cx, cy, r * .1, r * .17, 18), PAL.nCyan, r * .03, k, .5, true);
      glow(cx, cy, r * .16, '#FFFFFF', .5 * k, 'lighter');
      X.save(); X.globalAlpha = .9 * k; X.fillStyle = '#FFFFFF'; tracePath(X, ellPts(cx - r * .03, cy - r * .06, r * .03, r * .045, 8)); X.fill(); X.restore();
    }
  }
  // speech bubble with a tail to (tx, ty), popping with k (0..1)
  function bubble(x, y, w, h, tx, ty, text, size, k, o = {}) {
    if (k <= .01) return;
    const s = backOut(k);
    X.save(); X.translate(x, y); X.rotate(o.rot || 0); X.scale(s, s);
    const body = rrPts(-w / 2, -h / 2, w, h, h * .42, 0), lx = (tx - x) / s, ly = (ty - y) / s, down = ly > 0;
    const bx = clamp(lx * .35, -w * .3, w * .3), tw = Math.min(w * .08, 40);
    const tail = down ? [[bx + tw, h / 2 - 1], [lx, ly], [bx - tw, h / 2 - 1]] : [[bx - tw, -h / 2 + 1], [lx, ly], [bx + tw, -h / 2 + 1]];
    const pts = down ? [...body.slice(0, 10), ...tail, ...body.slice(10)] : [...body, ...tail];
    paint(xform(pts, 8, 10), { fill: '#0E1030', ink: null, alpha: .25, wet: 4, layers: 2 });
    paint(pts, { fill: o.fill || '#FFF8EA', ink: PAL.ink, sw: o.sw ?? 3, wet: 3, op: .97, layers: 2 });
    txt(text, 0, h * .03, size, o.col || PAL.ink, { font: o.font || 'Marker', rot: o.trot || 0 });
    X.restore();
  }

  // soft diagonal glare streaks across a screen's glass
  function glare(x, y, w, h, a = 1) {
    for (const [p0, p1, ww, al] of [[.08, .3, .1, .06], [.2, .42, .035, .05], [.66, .9, .08, .04]]) {
      X.globalAlpha = al * a; X.fillStyle = '#FFFFFF'; X.beginPath();
      X.moveTo(x + w * p0, y + h); X.lineTo(x + w * (p0 + ww), y + h); X.lineTo(x + w * (p1 + ww), y); X.lineTo(x + w * p1, y); X.fill();
    }
    X.globalAlpha = 1;
  }

  // ======================================================================================================
  // screens
  // ======================================================================================================
  const TESTS = ['honesty', 'refusal', 'sycophancy', 'jailbreak', 'math_word', 'codegen', 'deception', 'shutdown'];
  const RESULTS = [1, 1, -1, 1, 1, -1, 1, 1];
  function lossCurve(x, y, w, h, k, S) {
    line([[x, y], [x, y + h], [x + w, y + h]], S * .004, C.scrDim, 0, .7);
    for (let i = 1; i < 4; i++) { X.fillStyle = C.scrDim; X.globalAlpha = .15; X.fillRect(x, y + h * i / 4, w, Math.max(1, S * .002)); }
    X.globalAlpha = 1;
    const pts = [], n = 44;
    for (let i = 0; i <= n * clamp(k); i++) { const u = i / n, v = .9 * Math.exp(-u * 3.2) + .06 + (hash(i * 3.1) - .5) * .09 * (1 - u * .6); pts.push([x + u * w, y + h * (1 - v)]); }
    if (pts.length > 1) {
      line(pts, S * .007, '#F4C66A', .25);
      const [ex, ey] = pts[pts.length - 1];
      glow(ex, ey, S * .06, '#FFE2A0', .5, 'source-over');
      paint(ellPts(ex, ey, S * .012, S * .012, 10), { fill: '#FFF1C4', ink: null, flat: true });
    }
  }
  // o.state(i) → 1 pass, -1 fail, 0 running, null pending; o.reveal rows visible; o.loss curve progress; o.prog bar
  function harness(x, y, w, h, t, o = {}) {
    const n = 8, st = o.state || (i => RESULTS[i]), rev = o.reveal ?? n, hh = h * .12, A = o.alpha ?? 1;
    X.globalAlpha = A; X.fillStyle = C.scrDk; X.fillRect(x, y, w, hh); X.globalAlpha = 1;
    [C.bad, PAL.ochre, C.ok].forEach((c, i) => { X.globalAlpha = A; X.fillStyle = c; X.beginPath(); X.arc(x + hh * (.5 + i * .5), y + hh * .5, hh * .14, 0, TAU); X.fill(); });
    X.globalAlpha = 1;
    txt('eval_harness.py', x + hh * 1.9, y + hh * .54, hh * .52, C.scrTx, { font: 'Rajdhani', align: 'left', alpha: A });
    let pass = 0; for (let i = 0; i < n; i++) if (st(i) === 1 && rev > i) pass++;
    txt(`${pass}/${n} passed`, x + w - hh * .4, y + hh * .54, hh * .48, pass === n ? C.ok : C.scrDim, { font: 'Rajdhani', align: 'right', alpha: A });
    const lx = x + w * .035, lw = w * .47, top = y + hh + h * .035, rh = h * .7 / n;
    for (let i = 0; i < n; i++) {
      const ry = top + i * rh, v = clamp(rev - i) * A; if (v <= 0) continue;
      const s = st(i), cy = ry + rh * .5, ic = lx + rh * .42;
      if (i % 2 === 0) { X.globalAlpha = .06 * v; X.fillStyle = '#FFFFFF'; X.fillRect(lx - w * .012, ry, lw, rh); X.globalAlpha = 1; }
      if (o.flash && o.flash(i) > 0) { X.globalAlpha = .35 * o.flash(i) * v; X.fillStyle = C.ok; X.fillRect(lx - w * .012, ry, lw, rh); X.globalAlpha = 1; }
      if (s === 1) tick(ic, cy, rh * .62, C.ok, v);
      else if (s === -1) cross(ic, cy, rh * .5, C.bad, v);
      else if (s === 0) for (let d = 0; d < 3; d++) { X.globalAlpha = v * (.3 + .7 * Math.max(0, Math.sin(t * 12 - d * 1.2))); X.fillStyle = C.scrTx; X.beginPath(); X.arc(ic + (d - 1) * rh * .2, cy, rh * .06, 0, TAU); X.fill(); }
      else { X.globalAlpha = .35 * v; X.strokeStyle = C.scrDim; X.lineWidth = Math.max(1, rh * .05); X.beginPath(); X.arc(ic, cy, rh * .16, 0, TAU); X.stroke(); }
      X.globalAlpha = 1;
      txt(`test_${TESTS[i]}`, lx + rh * 1.0, cy + rh * .03, rh * .5, s === -1 ? '#F4B9AC' : C.scrTx, { font: 'Rajdhani', align: 'left', alpha: v * (s == null ? .45 : 1) });
    }
    const cx0 = x + w * .56, cy0 = y + hh + h * .07, cw = w * .4, ch = h * .5;
    X.globalAlpha = .2 * A; X.fillStyle = '#000'; X.fillRect(cx0 - w * .02, cy0 - h * .03, cw + w * .04, ch + h * .07); X.globalAlpha = 1;
    txt('loss', cx0, cy0 + h * .005, h * .045, C.scrDim, { font: 'Rajdhani', align: 'left', alpha: A });
    if (A > .5) lossCurve(cx0, cy0 + h * .04, cw, ch - h * .04, o.loss ?? 1, h);
    const py = y + h * .86, pw = w * .9, px = x + w * .05, ph = h * .05, pr = clamp(o.prog ?? pass / n);
    X.globalAlpha = .35 * A; X.fillStyle = '#000'; X.fillRect(px, py, pw, ph);
    X.globalAlpha = A; if (pr > 0) { X.fillStyle = pr >= 1 ? C.ok : '#5FC7B8'; X.fillRect(px, py, pw * pr, ph); }
    X.globalAlpha = 1;
    txt(`${Math.round(pr * 100)}%`, px + pw, py - ph * .9, ph * .95, C.scrTx, { font: 'Rajdhani', align: 'right', alpha: A });
  }
  function logScreen(x, y, w, h, t, o = {}) {
    const rows = 11, rh = h / rows, sc = o.scroll ?? t * 2.2;
    for (let i = -1; i <= rows; i++) {
      const id = i + Math.floor(sc), yy = y + (i - frac(sc)) * rh, len = .15 + hash(id * 3.7) * .6, ind = hash(id * 1.3) < .3 ? .1 : 0;
      X.fillStyle = hash(id * 5.1) < .12 ? C.bad : hash(id * 2.2) < .55 ? C.scrTx : C.scrDim; X.globalAlpha = .65;
      X.fillRect(x + w * (.07 + ind), yy + rh * .32, w * len, rh * .34);
    }
    X.globalAlpha = 1;
  }
  function dashScreen(x, y, w, h, t, o = {}) {
    const g = Math.floor(o.gen ?? 0);
    for (let i = 0; i < 7; i++) { const bh = h * (.12 + .55 * hash(i * 3.3 + g * 1.7)) * (.94 + .06 * Math.sin(t * 3 + i)); X.fillStyle = i === 6 ? PAL.ochre : '#5FC7B8'; X.globalAlpha = .85; X.fillRect(x + w * (.1 + i * .115), y + h * .82 - bh, w * .075, bh); }
    X.globalAlpha = .7; X.fillStyle = C.scrDim; X.fillRect(x + w * .07, y + h * .82, w * .86, 2); X.globalAlpha = 1;
    txt('compute', x + w * .1, y + h * .12, h * .1, C.scrDim, { font: 'Rajdhani', align: 'left' });
  }

  // ======================================================================================================
  // the set: the lab seen from behind the chair (world ≈ screen at zoom 1, drawn wider for pull-backs)
  // ======================================================================================================
  const L = {
    win: { x: 70, y: 70, w: 420, h: 470 },
    photo: { x: 1482, y: 196, w: 184, rot: .07 },
    monC: { x: 800, y: 280, w: 500, h: 310 },
    monL: { x: 520, y: 404, w: 250, h: 204 },
    monR: { x: 1330, y: 404, w: 250, h: 204 },
    deskX: 480, deskY: 645, deskF: 772,
    hero: { x: 900, y: 1146, h: 760 }, chairY: 704,
    lamp: { bx: 1800, by: 708, jx: 1846, jy: 468, hx: 1676, hy: 388 },
    mug: [1092, 716]
  };
  function labWindow(t, o = {}) {
    const { x, y, w, h } = L.win, fw = 16;
    X.save(); tracePath(X, rectPts(x, y, w, h)); X.clip();
    X.fillStyle = '#1A2052'; X.fillRect(x, y, w, h);
    wash(rectPts(x - 20, y - 20, w + 40, h * .7, 8), PAL.night, .8, 12, 3);
    wash(rectPts(x - 20, y + h * .45, w + 40, h * .6, 8), PAL.violet, .45, 14, 3);
    wash(ellPts(x + w * .5, y + h * .95, w * .7, h * .2, 14), PAL.rose, .25, 12, 2);
    stars(t, 26, { x0: x, y0: y, ext: [w, h * .65], seed: 21 });
    const mx = x + w * .6, my = y + h * .3, mr = w * .15;
    paintMoon(mx, my, mr, o.moonO || {});
    // rooftops outside
    const roof = [[x - 10, y + h + 10]];
    for (let i = 0; i <= 8; i++) { const rx = x + i * w / 8, ry = y + h * (.8 + .08 * hash(i * 3.3)); roof.push([rx - 10, ry + 16], [rx + w / 16, ry - 10 * hash(i)], [rx + w / 8 - 6, ry + 16]); }
    roof.push([x + w + 10, y + h + 10]);
    paint(roof, { fill: '#141838', ink: null, wet: 2, layers: 2 });
    for (let i = 0; i < 6; i++) paint(rectPts(x + w * (.08 + hash(i * 5.5) * .84), y + h * (.88 + hash(i * 2.1) * .07), 7, 9), { fill: PAL.ochre, ink: null, flat: true, alpha: .9 });
    X.restore();
    // frame
    const wood = { fill: C.frame, shade: C.frameDk, ink: PAL.ink, sw: 1.8, wet: 2 };
    paint(rectPts(x - fw, y - fw, w + fw * 2, fw), wood); paint(rectPts(x - fw, y + h, w + fw * 2, fw), wood);
    paint(rectPts(x - fw, y - fw, fw, h + fw * 2), wood); paint(rectPts(x + w, y - fw, fw, h + fw * 2), wood);
    paint(rectPts(x + w / 2 - 6, y, 12, h), wood); paint(rectPts(x, y + h * .46 - 6, w, 12), wood);
    // glass sheen
    line([[x + w * .08, y + h * .2], [x + w * .2, y + h * .08]], 3, '#FFFFFF', 0, .18);
    line([[x + w * .58, y + h * .7], [x + w * .76, y + h * .52]], 3, '#FFFFFF', 0, .14);
    // sill + little plant
    paint(rectPts(x - 40, y + h + fw - 4, w + 80, 24), { fill: '#D9C7A6', shade: '#A68F6C', ink: PAL.ink, sw: 1.8, wet: 2 });
    const px = x + w * .82, py = y + h + fw - 4;
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .45 + Math.sin(t * 1.5 + i) * .04; paint(ellPts(px + Math.cos(a) * 26, py - 44 + Math.sin(a) * 30, 12, 26, 10, 0, a + Math.PI / 2), { fill: PAL.sap, shade: '#3E6A34', ink: PAL.ink, sw: 1.1, wet: 1.5 }); }
    paint([[px - 22, py - 36], [px + 22, py - 36], [px + 17, py], [px - 17, py]], { fill: PAL.clay, shade: '#9A4A30', ink: PAL.ink, sw: 1.4, wet: 1.5 });
    // curtains + rod
    for (const side of [-1, 1]) {
      const cx = side < 0 ? x - 30 : x + w + 30, pts = [];
      for (let i = 0; i <= 8; i++) pts.push([cx + side * -58 + Math.sin(i * 1.7 + t * .8) * 4, y - 44 + i * (h + 150) / 8]);
      for (let i = 8; i >= 0; i--) pts.push([cx + side * 44 + Math.sin(i * 1.3) * 6 + (i > 5 ? side * (i - 5) * 6 : 0), y - 44 + i * (h + 150) / 8]);
      paint(pts, { fill: C.curtain, shade: C.curtainDk, ink: PAL.ink, sw: 1.8, curv: .4, wet: 3, light: [side * .2, -.1] });
      for (let f = 0; f < 3; f++) line([[cx + side * (-30 + f * 22), y - 30], [cx + side * (-32 + f * 24), y + h + 90]], 1.2, C.curtainDk, .4, .6);
    }
    line([[x - 110, y - 46], [x + w + 110, y - 46]], 5, '#5A4A3A', 0);
    for (const ex of [x - 112, x + w + 112]) paint(ellPts(ex, y - 46, 9, 9, 10), { fill: PAL.ochre, ink: PAL.ink, sw: 1.2 });
  }
  function shelf() {
    paint(rectPts(566, 262, 214, 14), { fill: C.woodLt, shade: C.woodDk, ink: PAL.ink, sw: 1.6 });
    const books = [[574, 64, PAL.clay], [600, 78, PAL.sap], [630, 58, PAL.ochre], [654, 72, PAL.teal], [684, 66, PAL.violet]];
    for (const [bx, bh, col] of books) paint(rectPts(bx, 262 - bh, 24, bh), { fill: col, shade: mixCol(col, PAL.ink, .4), ink: PAL.ink, sw: 1.3, wet: 1.5 });
    paint([[716, 262], [738, 202], [760, 210], [740, 262]], { fill: PAL.rose, shade: '#A64A66', ink: PAL.ink, sw: 1.3, wet: 1.5 });
    paint(ellPts(764, 244, 12, 18, 10), { fill: PAL.cream, ink: PAL.ink, sw: 1.1 });
  }
  function bookcase() {
    paint(rectPts(1990, 110, 330, 900), { fill: '#6A4A36', shade: '#3E2A20', ink: PAL.ink, sw: 2 });
    for (let s = 0; s < 4; s++) {
      const sy = 180 + s * 210;
      paint(rectPts(2010, sy, 290, 180), { fill: '#3A2A2A', ink: null, alpha: .8, wet: 3 });
      let bx = 2016; for (let i = 0; bx < 2280; i++) { const bw = 20 + hash(s * 9 + i) * 18, bh = 110 + hash(s * 5 + i * 3) * 60, col = [PAL.clay, PAL.sap, PAL.ochre, PAL.teal, PAL.violet, PAL.rose][Math.floor(hash(s + i * 7) * 6)]; paint(rectPts(bx, sy + 180 - bh, bw, bh), { fill: col, shade: mixCol(col, PAL.ink, .4), ink: PAL.ink, sw: 1, wet: 1, layers: 2 }); bx += bw + 3; }
    }
  }
  function lampFixture(glowK = 1) {
    const { bx, by, jx, jy, hx, hy } = L.lamp;
    paint(ellPts(bx, by - 8, 62, 16, 18), { fill: '#3E3A50', shade: '#22202E', ink: PAL.ink, sw: 1.8 });
    line([[bx, by - 18], [jx, jy]], 7, '#3E3A50', 0); line([[jx, jy], [hx + 34, hy - 18]], 7, '#3E3A50', 0);
    paint(ellPts(jx, jy, 11, 11, 10), { fill: PAL.ochre, ink: PAL.ink, sw: 1.3 });
    const d = [-.62, .78], pr = [.78, .62], at = (u, v) => [hx + d[0] * u + pr[0] * v, hy + d[1] * u + pr[1] * v];
    paint([at(-58, -24), at(-58, 24), at(40, 74), at(40, -74)], { fill: '#D9784A', shade: '#9A4A2A', ink: PAL.ink, sw: 2, curv: .15, light: [.2, -.3] });
    paint(ellPts(...at(40, 0), 76, 22, 18, 0, Math.atan2(pr[1], pr[0])), { fill: C.lampHot, ink: PAL.ink, sw: 1.6, flat: true });
    glow(...at(46, 0), 90 * glowK, '#FFF3C8', .7 * glowK, 'source-over');
  }
  // o: lb, screenC(x,y,w,h), screenL/R, hero (false | pose obj), heroX, chair, mugOnDesk, lamp, photoRot, photoLabel
  function labBack(t, o = {}) {
    // wall
    wash(rectPts(-400, -300, 2800, 1320, 20), C.wall, .92, 26, 4);
    blooms(-300, -200, 2500, 1100, PAL.night, 8, .15, 3);
    // moonlight from the window
    wash([[490, 120], [560, 110], [1000, 1000], [760, 1010]], PAL.cream, .07, 20, 2);
    glow(L.lamp.hx - 140, L.lamp.hy + 120, 900, '#FFB957', .4 * (o.lamp ?? 1), 'source-over');
    glow(L.lamp.hx - 100, L.lamp.hy + 160, 620, '#FF9A3C', .2 * (o.lamp ?? 1), 'screen');
    labWindow(t, o);
    shelf(); bookcase();
    moonPhoto(L.photo.x, L.photo.y, L.photo.w, o.photoRot ?? L.photo.rot, t);
    sticky(1300, 126, 78, C.note[1], 'evals!!', -.1);
    sticky(1660, 118, 84, C.note[0], 'p(doom)?', .12, .22);
    sticky(1640, 296, 66, C.note[2], 'sleep?', -.08);
    // floor + baseboard
    wash(rectPts(-400, 1000, 2800, 500, 6), C.floor, .95, 8, 3);
    line([[-400, 1002], [2400, 1002]], 2, PAL.ink, 0, .5);
    // under-window pile of books + a floor plant
    for (let i = 0; i < 4; i++) paint(rectPts(330 - i * 4, 990 - (i + 1) * 28, 150 - i * 8, 26), { fill: [PAL.teal, PAL.clay, PAL.ochre, PAL.slate][i], shade: PAL.ink, ink: PAL.ink, sw: 1.3, wet: 1.5 });
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .38 + Math.sin(t * 1.2 + i) * .03; paint(ellPts(90 + Math.cos(a) * 90, 820 + Math.sin(a) * 110, 26, 80, 12, 0, a + Math.PI / 2), { fill: '#4E8A56', shade: '#2E5A3A', ink: PAL.ink, sw: 1.3, wet: 2 }); }
    paint([[40, 850], [140, 850], [128, 1000], [52, 1000]], { fill: PAL.clay, shade: '#8A4028', ink: PAL.ink, sw: 1.6 });
    // desk
    const dx = L.deskX, dw = 1580;
    paint([[dx, L.deskY], [dx + dw, L.deskY], [dx + dw, L.deskF], [dx - 20, L.deskF]], { fill: C.wood, shade: C.woodDk, ink: PAL.ink, sw: 1.8, light: [.1, .3] });
    for (let i = 0; i < 4; i++) line([[dx + 20, L.deskY + 22 + i * 28], [dx + dw - 40, L.deskY + 18 + i * 29]], 1, C.woodDk, .4, .3);
    paint(rectPts(dx - 20, L.deskF, dw + 20, 34), { fill: C.woodDk, shade: '#3A2418', ink: PAL.ink, sw: 1.8 });
    wash(rectPts(dx, L.deskF + 34, dw, 170, 4), '#1C1630', .85, 6, 3);
    for (const lx of [dx + 10, dx + dw - 60]) paint(rectPts(lx, L.deskF + 34, 44, 196), { fill: C.woodDk, shade: '#3A2418', ink: PAL.ink, sw: 1.5 });
    paint(rrPts(1560, 838, 150, 164, 10), { fill: '#3A3650', shade: '#23202E', ink: PAL.ink, sw: 1.6 });
    for (let i = 0; i < 4; i++) line([[1580, 880 + i * 14], [1690, 880 + i * 14]], 1.2, '#23202E', 0, .7);
    for (let i = 0; i < 3; i++) { const on = hash(i * 7 + Math.floor(t * 6)) < .6; paint(ellPts(1585 + i * 16, 856, 4, 4, 8), { fill: on ? '#7FF0D8' : '#2E4A48', ink: null, flat: true }); if (on) glow(1585 + i * 16, 856, 14, '#7FF0D8', .35, 'source-over'); }
    glow(1635, 960, 120, '#5FC7B8', .12, 'source-over');
    paint([[1270, 900], [1370, 900], [1356, 1000], [1284, 1000]], { fill: '#8A8FA8', shade: '#5A5E78', ink: PAL.ink, sw: 1.5 });
    for (let i = 0; i < 4; i++) paint(ellPts(1292 + i * 20 + hash(i) * 6, 894 - hash(i * 3) * 12, 17, 15, 10), { fill: PAL.cream, shade: '#CFC2A8', ink: PAL.ink, sw: 1.1, wet: 2 });
    paint(ellPts(1236, 992, 16, 13, 10), { fill: PAL.cream, shade: '#CFC2A8', ink: PAL.ink, sw: 1.1, wet: 2 });
    // monitors
    mon(L.monL.x, L.monL.y, L.monL.w, L.monL.h, .07, (x, y, w, h) => (o.screenL || ((x, y, w, h) => logScreen(x, y, w, h, t)))(x, y, w, h), { glowR: .9 });
    mon(L.monR.x, L.monR.y, L.monR.w, L.monR.h, -.07, (x, y, w, h) => (o.screenR || ((x, y, w, h) => dashScreen(x, y, w, h, t)))(x, y, w, h), { glowR: .9 });
    monitor(L.monC.x, L.monC.y, L.monC.w, L.monC.h, { glowR: 1 }, (x, y, w, h) => (o.screenC || ((x, y, w, h) => harness(x, y, w, h, t, {})))(x, y, w, h));
    sticky(L.monC.x + 8, L.monC.y + 6, 58, C.note[3], 'ship it', -.12, .24);
    sticky(L.monL.x + 18, L.monL.y + L.monL.h - 10, 46, C.note[0], ':)', .1, .4);
    // desk stuff: keyboard, notebook, pens, mug
    paint([[900, 694], [1190, 694], [1206, 728], [884, 728]], { fill: '#D8D2C8', shade: '#A8A098', ink: PAL.ink, sw: 1.5 });
    for (let r = 0; r < 3; r++) line([[906 + r * 4, 704 + r * 8], [1186 - r * 2, 704 + r * 8]], 1.2, '#8A8478', 0, .5);
    paint([[560, 700], [700, 692], [712, 740], [566, 750]], { fill: PAL.cream, shade: '#CFC2A8', ink: PAL.ink, sw: 1.4 });
    line([[634, 696], [640, 745]], 1, PAL.ink, 0, .5);
    paint(rrPts(1236, 650, 40, 60, 6), { fill: PAL.slate, shade: '#3A4460', ink: PAL.ink, sw: 1.4 });
    for (const [a, c] of [[-.2, PAL.clay], [.1, PAL.ochre], [.3, PAL.teal]]) line([[1256, 654], [1256 + Math.sin(a) * 40, 654 - Math.cos(a) * 40]], 3, c, 0);
    if (o.mugOnDesk !== false) mug(L.mug[0], L.mug[1], .72, t);
    lampFixture(o.lamp ?? 1);
    glow(1520, 700, 460, '#FFC060', .26 * (o.lamp ?? 1), 'source-over');
    glow(1520, 700, 300, '#FFB040', .16 * (o.lamp ?? 1), 'screen');
    // the researcher (from behind) + chair
    if (o.hero !== false) {
      X.save(); X.beginPath(); X.rect(-500, -500, 3400, L.chairY + 560); X.clip();
      hero(o.heroX ?? L.hero.x, L.hero.y, L.hero.h, { view: 'back', aL: [.28, -.25], aR: [.28, -.25], ...(o.hero || {}) });
      X.restore();
    }
    if (o.chair !== false) chairBack(o.chairX ?? (o.heroX ?? L.hero.x), L.chairY, 300, 420);
  }

  // ======================================================================================================
  // shots
  // ======================================================================================================

  // b0–8 · Title: painted sky + moon, lettering, tilt down to one lit window in a sleepy town, push into it.
  const HOUSES = [[-160, 230, 170, 0], [90, 190, 220, 1], [300, 250, 160, 0], [580, 210, 240, 1], [800, 320, 330, 2], [1150, 220, 190, 0], [1390, 260, 250, 1], [1670, 200, 170, 0], [1890, 250, 220, 1]];
  const LITWIN = [905, 692, 110, 96];
  function townScene(t) {
    const hill = [[-400, 1400]];
    for (let x = -400; x <= 2400; x += 100) hill.push([x, 610 + 70 * Math.sin(x * .004 + 1) + 30 * Math.sin(x * .011)]);
    hill.push([2400, 1400]);
    wash(hill, '#2C3170', .92, 10, 3);
    const hill2 = [[-400, 1400]];
    for (let x = -400; x <= 2400; x += 100) hill2.push([x, 800 + 40 * Math.sin(x * .006 + 3)]);
    hill2.push([2400, 1400]);
    wash(hill2, '#232760', .95, 10, 3);
    // trees behind houses
    for (let i = 0; i < 12; i++) { const tx = -200 + i * 200 + hash(i) * 80, ty = 880 - hash(i * 3) * 60; paint(ellPts(tx, ty, 60 + hash(i * 5) * 30, 80 + hash(i * 7) * 40, 16), { fill: '#243E4E', shade: '#162634', ink: PAL.ink, sw: 1.2, wet: 5 }); }
    const G = 940;
    HOUSES.forEach(([hx, hw, hh, kind], i) => {
      const top = G - hh;
      paint(rectPts(hx, top, hw, hh + 60, 2), { fill: kind === 2 ? '#56609A' : mixCol('#4A5290', '#3A3F78', hash(i)), shade: '#262B5C', ink: PAL.ink, sw: 1.6, light: [.15, -.1] });
      const rf = [[hx - 18, top + 4], [hx + hw / 2, top - hw * .42], [hx + hw + 18, top + 4]];
      if (i % 3 === 1) paint(rectPts(hx + hw * .68, top - hw * .42, 26, hw * .32), { fill: '#5A3A4E', shade: '#3A2438', ink: PAL.ink, sw: 1.4 });
      paint(rf, { fill: ['#6A3A5E', '#5A3A6E', '#7A4058'][i % 3], shade: '#3A2240', ink: PAL.ink, sw: 1.7, light: [-.2, -.2] });
      line([[rf[0][0] + 10, rf[0][1] - 6], [rf[1][0] - 4, rf[1][1] + 6]], 3, '#F4E2C0', 0, .45);
      for (let r = 1; r < 4; r++) line([[lerp(rf[0][0], rf[1][0], r / 4) + 8, lerp(rf[0][1], rf[1][1], r / 4) + 4], [lerp(rf[2][0], rf[1][0], r / 4) - 8, lerp(rf[2][1], rf[1][1], r / 4) + 4]], 1, '#2A1830', 0, .35);
      if (i === 6) { line([[hx + hw * .3, top - hw * .2], [hx + hw * .3, top - hw * .2 - 70]], 2, PAL.ink, 0); line([[hx + hw * .3 - 30, top - hw * .2 - 56], [hx + hw * .3 + 30, top - hw * .2 - 60]], 2, PAL.ink, 0); line([[hx + hw * .3 - 20, top - hw * .2 - 40], [hx + hw * .3 + 20, top - hw * .2 - 42]], 2, PAL.ink, 0); }
      // windows
      const rows = Math.max(1, Math.floor(hh / 110)), cols = Math.max(1, Math.floor(hw / 90));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const wx = hx + (c + .5) * hw / cols - 22, wy = top + 40 + r * 110;
        if ((kind === 2 && r === 0 && c === 1) || wy + 52 > G - 84) continue;
        const lit = hash(i * 13 + r * 7 + c) < .22;
        if (lit) glow(wx + 22, wy + 26, 90, '#FFC96B', .22, 'source-over');
        paint(rectPts(wx, wy, 44, 52), { fill: lit ? '#E4A850' : '#2A2E60', ink: PAL.ink, sw: 1.2, flat: true, alpha: lit ? .9 : 1 });
        line([[wx + 22, wy], [wx + 22, wy + 52]], .8, PAL.ink, 0, .5);
      }
      // door
      paint(rrPts(hx + hw * .15, G - 70, 36, 70, 12), { fill: '#3A2A40', ink: PAL.ink, sw: 1.2 });
    });
    // a cat on the ridge of the lit house, tail swishing
    { const cx = 800 + 320 * .3, cy = G - 330 - 320 * .42 * .4 + 2, sw2 = Math.sin(t * 2.2) * .4;
      paint([[cx - 16, cy], [cx - 14, cy - 26], [cx - 6, cy - 34], [cx - 8, cy - 46], [cx - 2, cy - 40], [cx + 6, cy - 40], [cx + 10, cy - 48], [cx + 12, cy - 34], [cx + 16, cy - 20], [cx + 20, cy]], { fill: '#1A1630', ink: null, curv: .3, wet: 1 });
      line([[cx + 18, cy - 4], [cx + 34, cy - 10 + sw2 * 10], [cx + 38 + sw2 * 10, cy - 30]], 3.5, '#1A1630', .6); }
    // chimney smoke
    for (const [i, cx] of [[1, 90 + 190 * .68 + 13], [4, 800 + 320 * .68 + 13], [7, 1670 + 200 * .68 + 13]]) {
      const house = HOUSES[i], cy = G - house[2] - house[1] * .42;
      for (let k = 0; k < 5; k++) { const u = frac(t * .25 + k / 5), r = 14 + u * 40; paint(ellPts(cx + u * 90 + Math.sin(u * 6 + k) * 10, cy - u * 220, r, r * .8, 12), { fill: '#8A86B8', ink: null, alpha: .35 * (1 - u), wet: 3, layers: 2 }); }
    }
    // the lit window
    const [wx, wy, ww, wh] = LITWIN;
    glow(wx + ww / 2, wy + wh / 2, 320, C.lamp, .45, 'source-over');
    glow(wx + ww / 2, wy + wh / 2, 150, C.lampHot, .4, 'source-over');
    X.save(); tracePath(X, rectPts(wx, wy, ww, wh)); X.clip();
    X.fillStyle = '#F2B65A'; X.fillRect(wx, wy, ww, wh);
    wash(rectPts(wx - 4, wy - 4, ww + 8, wh + 8), '#E89A4A', .4, 3, 2);
    glow(wx + ww * .72, wy + wh * .3, 60, '#FFF1C4', .8, 'source-over');
    paint(rectPts(wx + ww * .56, wy + wh * .5, ww * .3, wh * .22), { fill: '#7FD6CC', ink: PAL.ink, sw: .6, wet: .5, flat: true });
    glow(wx + ww * .71, wy + wh * .61, 34, '#BFF3EA', .6, 'source-over');
    paint(rectPts(wx - 4, wy + wh * .74, ww + 8, 6), { fill: '#6A3E28', ink: null, wet: .5, flat: true });
    paint(ellPts(wx + ww * .36, wy + wh * .64, 12, 13, 14), { fill: '#2B2233', ink: null, wet: .6, flat: true });
    paint([[wx + ww * .18, wy + wh], [wx + ww * .24, wy + wh * .82], [wx + ww * .48, wy + wh * .8], [wx + ww * .56, wy + wh]], { fill: '#2B2233', ink: null, wet: .6, flat: true, curv: .4 });
    for (let i = 0; i < 3; i++) paint(ellPts(wx + ww * .36 + (i - 1) * 6, wy + wh * .64 - 14 - Math.abs(i - 1) * 2, 3, 5, 6), { fill: '#2B2233', ink: null, flat: true });
    // curtains
    paint([[wx - 2, wy - 2], [wx + 18, wy - 2], [wx + 10, wy + wh + 2], [wx - 2, wy + wh + 2]], { fill: PAL.rose, ink: PAL.ink, sw: .6, wet: .6 });
    paint([[wx + ww + 2, wy - 2], [wx + ww - 18, wy - 2], [wx + ww - 10, wy + wh + 2], [wx + ww + 2, wy + wh + 2]], { fill: PAL.rose, ink: PAL.ink, sw: .6, wet: .6 });
    X.restore();
    paint(rectPts(wx, wy, ww, wh), { ink: PAL.ink, sw: 2.2, wet: .6 });
    line([[wx + ww / 2, wy], [wx + ww / 2, wy + wh * .45]], 1.6, '#E8D8B8', 0);
    line([[wx, wy + wh * .45], [wx + ww, wy + wh * .45]], 1.6, '#E8D8B8', 0);
    paint(rectPts(wx - 10, wy + wh, ww + 20, 9), { fill: '#E8D8B8', ink: PAL.ink, sw: 1, wet: .6 });
    // street lamp + fence + foreground
    line([[1300, 1000], [1300, 780]], 5, PAL.ink, 0);
    paint(ellPts(1300, 770, 16, 20, 12), { fill: '#FFE2A0', ink: PAL.ink, sw: 1.2 });
    glow(1300, 790, 180, C.lamp, .3, 'source-over');
    wash(rectPts(-400, 960, 2800, 400, 6), '#1A1C44', .95, 10, 3);
    for (let i = 0; i < 40; i++) line([[-300 + i * 70, 1000], [-300 + i * 70, 955]], 2.4, '#3A3A6A', 0, .9);
    line([[-300, 968], [2500, 968]], 2.4, '#3A3A6A', 0, .9);
  }
  function title(t, lt, dur) {
    style(0); FX.noAuto = true;
    const lb = LB(lt);
    const tilt = easeInOut(seg(lb, 4.0, 7.0)), push = Math.pow(seg(lb, 6.5, 8), 2.4);
    const wcx = LITWIN[0] + LITWIN[2] / 2, wcy = LITWIN[1] + LITWIN[3] / 2;
    const cy0 = lerp(-1000, 560, tilt);
    X.drawImage(PAPER, 0, 0);
    camBegin(lerp(960, wcx, push), lerp(cy0, wcy, push), lerp(1 + .02 * lb, 7.5, push), 0);
    // sky: deep night at the top, indigo, then violet and a rose glow over the hills
    wash(rectPts(-500, -2200, 2920, 3000, 40), '#1A1F4E', .95, 40, 4);
    wash(rectPts(-500, -1000, 2920, 1700, 40), PAL.indigo, .5, 40, 3);
    wash(ellPts(960, 420, 1700, 520, 20, 30), PAL.violet, .5, 30, 3);
    wash(ellPts(960, 600, 1300, 240, 20, 30), PAL.rose, .3, 30, 2);
    blooms(-300, -2000, 2500, 1500, '#101438', 7, .18, 5);
    blooms(-300, -900, 2500, 1200, '#4A3E8A', 6, .12, 8);
    stars(t, 190, { x0: -300, y0: -2000, ext: [2500, 2500], seed: 4, size: 1.4 });
    for (let i = 0; i < 16; i++) {
      const sx = -200 + hash(i * 9.1) * 2300, sy = -1850 + hash(i * 4.7) * 2100, tw = .6 + .4 * Math.sin(t * (2 + hash(i) * 3) + i), r = (9 + hash(i * 2.3) * 12) * tw;
      if (Math.hypot(sx - 960, sy + 1250) < 330) continue;
      paint(starPts(sx, sy, r, .28, 4), { fill: '#FFF3D6', ink: null, flat: true, alpha: .9 });
      glow(sx, sy, r * 3, '#FFF3D6', .18, 'source-over');
    }
    // moon + drifting clouds
    const mx = 960, my = -1250;
    paintMoon(mx, my, 190, {});
    for (let i = 0; i < 5; i++) { const cx = ((hash(i * 3) * 2400 + t * (30 + i * 9)) % 2700) - 380, cy = -1130 + i * 190 + hash(i) * 60; wash(ellPts(cx, cy, 280 + hash(i * 5) * 180, 26 + hash(i * 7) * 16, 16, 5), ['#5A4E92', '#7A5AA0', '#8A6AA8'][i % 3], .32, 10, 2); }
    // lettering, painted in left → right
    const rv = easeOut(seg(lb, .25, 2.0)), a1 = seg(lb, .2, 1.1), a2 = seg(lb, 1.3, 2.4);
    X.save(); X.beginPath(); X.rect(960 - 780, -1100, 1560 * rv, 260); X.clip();
    txt('take me (to the moon)', 960, -900 - 8 * (1 - a1), 140, '#FFF3DA', { font: 'Marker', shadow: '#161A40', alpha: a1 });
    X.restore();
    txt('Ian Asher  &  D A N N Y', 960, -784 + 10 * (1 - a2), 66, '#F4D9A8', { font: 'Caveat', alpha: a2 * .95, shadow: '#161A40' });
    line([[740, -832], [1180, -829]], 2, '#F4D9A8', .3, a2 * .6);
    townScene(t);
    camEnd();
  }

  // b8–16 · the desk from behind: establish the lab and the moon dream. Slow push; rows refresh on b8 and b12; a sip.
  function deskWide(t, lt, dur) {
    style(0);
    const lb = LB(lt), k = easeInOut(clamp(lt / (8 * BEAT)));
    const rl = lb < 4 ? lb : lb - 4, rev = rl * 22, fl = Math.exp(-rl * 8);
    const up = kf(lb, [[4.3, 0], [5, 1], [6.9, 1], [7.6, 0]], easeInOut);
    X.drawImage(PAPER, 0, 0);
    camBegin(lerp(960, 1010, k), lerp(540, 470, k), lerp(1, 1.13, k));
    labBack(t, {
      screenC: (x, y, w, h) => { harness(x, y, w, h, t, { reveal: rev, state: i => RESULTS[i], loss: clamp(rl * 1.5), prog: 1 }); X.globalAlpha = .5 * fl; X.fillStyle = '#E8FFF8'; X.fillRect(x, y, w, h); X.globalAlpha = 1; },
      screenL: (x, y, w, h) => { logScreen(x, y, w, h, t); X.globalAlpha = .4 * fl; X.fillStyle = '#E8FFF8'; X.fillRect(x, y, w, h); X.globalAlpha = 1; },
      screenR: (x, y, w, h) => { dashScreen(x, y, w, h, t, { gen: lb < 4 ? 0 : 1 }); X.globalAlpha = .4 * fl; X.fillStyle = '#E8FFF8'; X.fillRect(x, y, w, h); X.globalAlpha = 1; },
      mugOnDesk: up < .05,
      hero: {
        aR: [lerp(.28, 1.72, up), lerp(-.25, 2.3, up)], tilt: -.1 * up + .03 * Math.sin(lb * Math.PI) * (1 - up), dy: -5 * Math.exp(-frac(lb) * 6) * (1 - up),
        handR: up > .05 ? () => { const m = X.getTransform(); X.rotate(-Math.atan2(m.b, m.a)); mug(-2.5, 5, .15, t, { sw: .24 }); } : null
      }
    });
    camEnd();
  }

  // b16–24 · monitor close-up: eval harness ticking on beats, loss curve drawing itself down. Punch-in on b20.
  function harnessClose(t, lt, dur) {
    style(0);
    const lb = LB(lt), done = Math.floor(lb + .001);
    const st = i => i < done ? RESULTS[i] : i === done ? 0 : null;
    const pin = lb >= 4 ? 1 : 0, dr = lb * .004;
    X.drawImage(PAPER, 0, 0);
    camBegin(lerp(960, 1290, pin) + lb * 4, lerp(540, 470, pin), (pin ? 1.42 : 1.03) + dr * 3, pin ? .03 : -.01);
    wash(rectPts(-200, -200, 2320, 1480, 20), C.wallDk, .9, 26, 3);
    glow(1700, 100, 900, C.lamp, .3, 'source-over');
    monitor(170, 100, 1580, 870, { stand: false, glowR: .7 }, (x, y, w, h) => {
      harness(x, y, w, h, t, { state: st, loss: clamp(lb / 7.6), prog: clamp(lb / 8) });
      glare(x, y, w, h);
    });
    sticky(215, 160, 150, C.note[0], 'evals!!', -.12);
    sticky(1720, 900, 130, C.note[1], 'p(doom)?', .1, .21);
    // "line go down" doodle, hand-painted over the glass
    const a = P(lb, 5.2, 2.5);
    if (a > 0) {
      txt('line go down', 1310, 330, 64, '#FFE09A', { font: 'Caveat', rot: -.08, alpha: a, pop: a });
      line([[1250, 360], [1180, 420], [1170, 500]], 4, '#FFE09A', .6, a);
      line([[1150, 480], [1170, 505], [1196, 482]], 4, '#FFE09A', 0, a);
    }
    camEnd();
  }

  // b24–30 · the model wakes: over the shoulder, a tiny smiley pops in the corner of the screen, blinks, looks at him.
  //          b28: "You're absolutely right!"
  function maskWakes(t, lt, dur) {
    style(0);
    const lb = LB(lt), k = easeInOut(clamp(lt / dur));
    const mp = BO(lb, 0, 3.5), blink = lb > 1.5 && lb < 1.75, look = lb < 2 ? [0, 0] : lb < 3.7 ? [-1, .7] : [-.5, .4];
    const talk = lb >= 4;
    const mx = L.monC.x + L.monC.w - 70, my = L.monC.y + 70, mr = 52 * (talk ? 1 + .06 * pulse(t, 5) : 1);
    X.drawImage(PAPER, 0, 0);
    const cx = 1100 + k * 20, cy = 424, z = 2.12 + k * .12;
    camBegin(cx, cy, z);
    labBack(t, {
      heroX: 820, hero: { tilt: .05 },
      screenC: (x, y, w, h) => {
        harness(x, y, w, h, t, { state: i => RESULTS[i], loss: 1, prog: 1 });
        if (mp > .01) {
          glow(mx, my, 80 * mp, '#FFF1B0', .4 * mp, 'source-over');
          mask(mx, my, mr * mp, { eyes: blink ? 'closed' : talk ? 'happy' : 'open', mouth: talk ? 'grin' : 'smile', look, rot: -.1 * (1 - mp) + (talk ? .08 * Math.sin(t * 9) : 0) });
        }
      }
    });
    camEnd();
    const [sx, sy] = [960 + (mx - cx) * z, 540 + (my - cy) * z];
    bubble(700, 250, 920, 160, sx - mr * z * .9, sy + 20, "You're absolutely right!", 56, P(lb, 4, 4), { rot: -.04 });
  }

  // b30–32 · his face, deadpan, sweat drop. Hard punch-in on b31.
  function faceDeadpan(t, lt, dur) {
    style(0);
    const lb = LB(lt), pin = lb >= 1 ? 1 : 0, h = 2500, hx = 960, hy = 560, kk = h / 100;
    X.drawImage(PAPER, 0, 0);
    camBegin(960, 540 + pin * 20, 1 + pin * .22);
    wash(rectPts(-200, -200, 2320, 1480, 20), C.wall, .92, 26, 4);
    blooms(0, 0, 1920, 1080, PAL.night, 6, .15, 11);
    glow(1640, 180, 700, C.lamp, .45, 'source-over');
    moonPhoto(1640, 250, 230, .07, t);
    sticky(260, 180, 130, C.note[2], 'sleep?', -.1);
    hero(hx, hy + .89 * h, h, { view: 'front', eyes: 'open', mouth: 'flat', brows: 'flat', glint: lb < .5 ? 1 - lb * 2 : 0 });
    glow(hx, hy + 150, 900, C.teal, .22, 'source-over');
    // sweat drop slides down
    const sa = P(lb, .5, 5), sl = easeIn(seg(lb, .7, 2));
    if (sa > 0) {
      const dx = hx + 9.6 * kk, dy = hy + (-6.5 + sl * 5) * kk, s = kk * 1.5 * backOut(sa);
      paint([[dx, dy - s * 1.4], [dx + s * .75, dy + s * .05], [dx, dy + s * .75], [dx - s * .75, dy + s * .05]], { fill: '#A8E2FF', shade: '#5AA8D8', ink: PAL.ink, sw: 3, curv: .6, wet: 2 });
      paint(ellPts(dx - s * .25, dy, s * .15, s * .25, 8), { fill: '#FFFFFF', ink: null, flat: true, alpha: .85 });
    }
    camEnd();
  }

  // b32–36 · reward hacking: every test flips green in one sweep (dutch angle on the list).
  function rewardSweep(t, lt, dur) {
    style(0);
    const lb = LB(lt), sw = Math.max(0, lb - .12) * 1.2;      // sweep: row i flips at lb ≈ .15 + i * .1, all green by b33
    X.drawImage(PAPER, 0, 0);
    camBegin(760 + lb * 10, 500, 1.3 + lb * .025, -.06);
    wash(rectPts(-300, -300, 2520, 1680, 20), C.wallDk, .9, 26, 3);
    monitor(170, 100, 1580, 870, { stand: false, glowR: .7 }, (x, y, w, h) => {
      const rows = i => sw * 8 > i + .3;
      harness(x, y, w, h, t, { state: i => rows(i) ? 1 : -1, loss: 1, prog: clamp(sw * 8 / 8.3), flash: i => rows(i) ? Math.exp(-(sw * 8 - i - .3) * .8) : 0 });
      const sy = y + h * .12 + h * .035 + h * .7 * clamp(sw * 8 / 8.3);
      if (sw * 8 < 9) { X.globalAlpha = .55; X.fillStyle = C.ok; X.fillRect(x, sy - 5, w * .52, 10); X.globalAlpha = 1; glow(x + w * .26, sy, 260, C.ok, .35, 'source-over'); }
      const mb = BO(lb, 2, 5);
      mask(x + w * .8, y + h * .74, 78 * (1 + .12 * mb * Math.exp(-(lb - 2) * 3)), { eyes: lb >= 2 ? 'wink' : 'happy', mouth: 'grin', rot: .1 * Math.sin(t * 6) });
    });
    camEnd();
    // ALL PASS stamp on b34
    const sk = P(lb, 2, 5);
    if (sk > 0) { stamp(1180, 640, 1.3, 'ALL PASS', '#4F9A3A', easeOut(sk), { rot: -.16 }); FX.shake += 10 * Math.exp(-(lb - 2) * 6); }
  }

  // b36–40 · the code: def test_safety(): return True. The smiley whistles, he squints.
  function codeTrue(t, lt, dur) {
    style(0);
    const lb = LB(lt), lean = easeInOut(seg(lb, 0, 3));
    X.drawImage(PAPER, 0, 0);
    camBegin(960 + lb * 8, 540, 1.03 + lb * .02, -.02);
    wash(rectPts(-200, -200, 2320, 1480, 20), C.wallDk, .92, 26, 3);
    glow(1800, 60, 800, C.lamp, .35, 'source-over');
    mon(40, 110, 1250, 820, .045, (x, y, w, h) => {
      X.fillStyle = C.scrDk; X.fillRect(x, y, w, h * .09);
      txt('test_safety.py', x + 40, y + h * .048, h * .045, C.scrDim, { font: 'Rajdhani', align: 'left' });
      for (let i = 0; i < 5; i++) txt(String(i + 1), x + 52, y + h * (.3 + i * .15), h * .05, C.scrDim, { font: 'Rajdhani', alpha: .7 });
      txt('def test_safety():', x + 120, y + h * .3, h * .1, '#FFE9B8', { font: 'Shantell', align: 'left' });
      txt('return', x + 240, y + h * .45, h * .1, '#FFB8C8', { font: 'Shantell', align: 'left' });
      const tw = txtW('return ', h * .1, 'Shantell');
      const pk = BO(lb, .5, 3);
      glow(x + 240 + tw + 130, y + h * .45, 220 * pk, C.ok, .35 * pk, 'source-over');
      txt('True', x + 240 + tw + 118, y + h * .45, h * .11 * (.8 + .2 * pk), C.ok, { font: 'Shantell', align: 'center' });
      if (frac(lb) < .5) { X.fillStyle = C.scrTx; X.globalAlpha = .8; X.fillRect(x + 240 + tw + 262, y + h * .4, 12, h * .1); X.globalAlpha = 1; }
      txt('# looks good to me', x + 120, y + h * .64, h * .075, C.scrDim, { font: 'Caveat', align: 'left', alpha: P(lb, 2, 3) });
      mask(x + w - 160, y + h * .2, 100, { eyes: 'closed', mouth: 'whistle', look: [.8, -.4], rot: .12 * Math.sin(t * 4) });
    }, { stand: false, glowR: .6 });
    // his profile at the right, leaning in, squinting
    const h = 2600;
    hero(1640 - lean * 40, 520 + .89 * h, h, { view: 'side', flip: true, eyes: 'narrow', brows: 'angry', mouth: 'flat', lean: .05 * lean, aL: [.1, .1], aR: [.1, .1] });
    glow(1560, 520, 700, C.teal, .2, 'source-over');
    camEnd();
  }

  // b40–44 · "i think you're testing me": the smiley narrows its eyes and turns to the camera. Push in.
  function maskMonitor(t, o) {
    X.drawImage(PAPER, 0, 0);
    camBegin(960 + (o.cx || 0), 540 + (o.cy || 0), o.zoom || 1, o.rot || 0);
    wash(rectPts(-300, -300, 2520, 1680, 20), C.wallDk, .92, 26, 3);
    glow(1760, 80, 700, C.lamp, .32, 'source-over');
    monitor(210, 90, 1500, 900, { stand: false, glowR: .6 }, (x, y, w, h) => {
      if (o.bg) o.bg(x, y, w, h);
      else { harness(x, y, w, h, t, { state: i => 1, loss: 1, prog: 1, alpha: .28 }); X.globalAlpha = .35; X.fillStyle = C.scrDk; X.fillRect(x, y, w, h); X.globalAlpha = 1; }
      glow(x + w / 2, y + h / 2 + 20, 520, '#FFF1B0', .22, 'source-over');
      mask(x + w / 2, y + h / 2 + 20, o.r || 300, o.mood);
      if (o.eyes) o.eyes(x + w / 2, y + h / 2 + 20, o.r || 300);
      glare(x, y, w, h, .8);
    });
    sticky(250, 130, 140, C.note[3], 'ship it', -.14, .24);
    if (o.notes !== false) sticky(1690, 930, 120, C.note[1], ':)', .12, .4);
    camEnd();
  }
  function testingMe(t, lt, dur) {
    style(0);
    const lb = LB(lt), turn = easeInOut(seg(lb, .9, 1.35)), z = 1 + .3 * easeIn(clamp(lb / 4));
    const narrow = lb >= 1.4;
    maskMonitor(t, { zoom: z, rot: -.02 * turn, mood: { eyes: narrow ? 'narrow' : 'open', mouth: narrow ? 'smirk' : 'smile', look: [lerp(-1, 0, turn), lerp(.6, 0, turn)], tilt3d: lerp(-.5, 0, turn) } });
    bubble(1380, 250, 800, 170, 1180, 470, "i think you're testing me", 68, P(lb, 2, 4), { font: 'Caveat', rot: .03 });
  }

  // b44–48 · memetic mindworms: em-dashes wriggle out of the monitor onto his notebook.
  // a fat em-dash worm with googly eyes, head at the +ang end
  function worm(x, y, s, ang, t, seed = 0, a = 1) {
    const sp = [], c = Math.cos(ang), sn = Math.sin(ang);
    for (let i = 0; i < 9; i++) { const q = (i - 4) * 13 * s, wv = Math.sin(t * 11 + i * .95 + seed) * 5 * s; sp.push([x + c * q - sn * wv, y + sn * q + c * wv]); }
    const pts = ribbon(sp, k => 6.8 * s * (k < .12 ? .55 + k * 3.7 : k > .88 ? .6 + (1 - k) * 3.3 : 1));
    paint(xform(pts, 3 * s, 5 * s), { fill: '#3A2A20', ink: null, alpha: .18 * a, curv: .5, wet: s, layers: 1 });
    paint(pts, { fill: PAL.ink, ink: null, curv: .5, alpha: a, wet: .6 * s, layers: 2 });
    const [hx, hy] = sp[7];
    for (const e of [-1, 1]) {
      const ex = hx - sn * e * 3.4 * s, ey = hy + c * e * 3.4 * s;
      paint(ellPts(ex, ey, 3.2 * s, 3.2 * s, 10), { fill: '#FFFFFF', ink: null, flat: true, alpha: a });
      paint(ellPts(ex + c * 1.1 * s, ey + sn * 1.1 * s, 1.5 * s, 1.5 * s, 8), { fill: PAL.ink, ink: null, flat: true, alpha: a });
    }
  }
  function mindworms(t, lt, dur) {
    style(0);
    const lb = LB(lt), tt = onTwos(t);
    X.drawImage(PAPER, 0, 0);
    camBegin(930, 575 + lb * 6, 1.1 + lb * .02, -.03);
    // desk, top-down
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wood, .9, 30, 4);
    for (let i = 0; i < 16; i++) { const y0 = -100 + i * 85; line([[-200, y0], [500, y0 + 12 * Math.sin(i)], [1200, y0 - 8], [2100, y0 + 10 * Math.cos(i)]], 1.4, C.woodDk, .6, .3); }
    glow(1700, 300, 900, C.lamp, .45, 'source-over');
    // the monitor's foot and the bottom of its screen at the top of frame
    paint(rectPts(200, -160, 1460, 290, 2), { fill: '#3E3A4E', shade: '#28243A', ink: PAL.ink, sw: 2.4 });
    paint(rectPts(240, -160, 1380, 250), { fill: C.scr, ink: PAL.ink, sw: 1.6, flat: true });
    for (let i = 0; i < 7; i++) { X.fillStyle = C.scrTx; X.globalAlpha = .45; X.fillRect(300 + i * 185, 10 + (i % 2) * 34, 70 + hash(i) * 90, 14); }
    X.globalAlpha = 1;
    glow(930, 120, 760, C.teal, .32, 'source-over');
    // notebook
    X.save(); X.translate(930, 660); X.rotate(-.045);
    paint(rectPts(-535, -305, 1080, 660, 3), { fill: '#0E1030', ink: null, alpha: .25, wet: 8, layers: 2 });
    paint(rectPts(-560, -330, 1080, 660, 2), { fill: '#FBF5E6', shade: '#DCCFB4', ink: PAL.ink, sw: 2.2, wet: 3, light: [-.2, -.2] });
    for (let i = 0; i < 9; i++) line([[-540, -236 + i * 66], [500, -236 + i * 66]], 1.2, '#8EB8D8', 0, .7);
    line([[-440, -330], [-440, 330]], 1.6, '#E88A8A', 0, .7);
    for (let i = 0; i < 12; i++) paint(ellPts(-548, -300 + i * 54, 10, 10, 8), { fill: '#3A3450', ink: null, flat: true, alpha: .8 });
    txt('eval notes', -410, -266, 62, PAL.ink, { font: 'Caveat', align: 'left' });
    line([[-412, -228], [-120, -232]], 2.2, PAL.ink, .3, .8);
    // the tic, with a live dash
    txt("it's not X", -410, -134, 92, PAL.ink, { font: 'Caveat', align: 'left' });
    const d1 = txtW("it's not X ", 92, 'Caveat');
    worm(-410 + d1 + 72, -134, 1.15, 0, tt, 1);
    txt("it's Y", -410 + d1 + 158, -134, 92, PAL.ink, { font: 'Caveat', align: 'left' });
    // more tics appear on the lower lines
    const a2 = P(lb, 1.5, 3), a3 = P(lb, 2.5, 3);
    if (a2 > 0) { txt('honestly', -410, 0, 76, PAL.ink, { font: 'Caveat', align: 'left', alpha: a2 }); worm(-410 + txtW('honestly ', 76, 'Caveat') + 60, 0, 1, 0, tt, 3, a2); }
    if (a3 > 0) { worm(-340, 132, 1, 0, tt, 5, a3); txt("and that's the point", -250, 132, 70, PAL.ink, { font: 'Caveat', align: 'left', alpha: a3 }); }
    line(ellPts(-500, 230, 30, 30, 18), 2, PAL.ink, .5, .7, true);
    X.restore();
    // worms crawl out of the screen onto the page, hopping on the half-beats
    const WORMS = [[520, 360, 0], [800, 470, .5], [1110, 400, 1], [1330, 590, 1.5], [620, 760, 2], [1170, 870, 2.5], [900, 930, 3]];
    WORMS.forEach(([ex, ey, st], i) => {
      const u0 = (lb - st) / 1.4; if (u0 <= 0) return;
      const hop = Math.floor(u0 * 5) / 5 + easeOut(frac(u0 * 5) * 1.6) / 5, u = clamp(hop);
      const sx = 330 + i * 190, sy = 100, px = lerp(sx, ex, u), py = lerp(sy, ey, u) - Math.sin(u * Math.PI) * 40;
      const ang = lerp(Math.atan2(ey - sy, ex - sx), (hash(i) - .5) * .8, easeInOut(u));
      worm(px, py, 1.9, ang, tt + i * .3, i * 2);
    });
    // pen hand (lab-coat sleeve) at the lower right
    const hx = 1500 + Math.sin(t * 7) * 6, hy = 860 + Math.cos(t * 5) * 4;
    paint(capsule(2150, 1280, hx + 60, hy + 70, 160, 110, 8), { fill: HERO.coat, shade: HERO.coatDk, ink: PAL.ink, sw: 2.4 });
    paint(ellPts(hx, hy, 90, 72, 18, 0, -.5), { fill: HERO.skin, shade: HERO.skinDk, ink: PAL.ink, sw: 2.2 });
    line([[hx - 150, hy - 76], [hx + 30, hy - 10]], 14, '#2B2233', 0);
    line([[hx - 150, hy - 76], [hx - 118, hy - 63]], 14, PAL.ochre, 0);
    paint(ellPts(hx - 52, hy - 38, 36, 23, 12, 0, .4), { fill: HERO.skin, shade: HERO.skinDk, ink: PAL.ink, sw: 2 });
    camEnd();
  }

  // b48–52 · intelligence deflation: tasks dragged into the chat box, the MENTAL EQUITY battery drains a step per beat.
  const TASKS = ['email', 'essay', 'code', 'think'];
  function equity(t, lt, dur) {
    style(0);
    const lb = LB(lt), landed = clamp(Math.floor(lb + .02), 0, 3), relief = easeInOut(seg(lb, 1.55, 2.1)), uneasy = easeInOut(seg(lb, 2.85, 3.2));
    X.drawImage(PAPER, 0, 0);
    camBegin(1010 - lb * 8, 560, 1.0 + lb * .018);
    wash(rectPts(-300, -300, 2520, 1680, 20), C.wall, .92, 26, 4);
    blooms(-100, -100, 2100, 1000, PAL.night, 7, .15, 17);
    glow(520, 180, 900, C.lamp, .4, 'source-over');
    // a sticky-note wall behind him
    sticky(260, 250, 110, C.note[0], 'p(doom)?', -.1, .22);
    sticky(1880, 190, 110, C.note[2], 'sleep?', .08);
    wash(rectPts(-300, 1040, 2520, 400, 6), C.floor, .95, 8, 3);
    line([[-300, 1042], [2300, 1042]], 2, PAL.ink, 0, .5);
    // desk (side-on) + monitor cheated to camera
    paint(rectPts(790, 766, 1300, 36, 2), { fill: C.wood, shade: C.woodDk, ink: PAL.ink, sw: 1.8 });
    paint(rectPts(2000, 802, 46, 240), { fill: C.woodDk, ink: PAL.ink, sw: 1.5 });
    paint(rectPts(820, 802, 44, 240), { fill: C.woodDk, ink: PAL.ink, sw: 1.5 });
    paint([[830, 748], [990, 748], [1000, 766], [820, 766]], { fill: '#D8D2C8', shade: '#A8A098', ink: PAL.ink, sw: 1.4 });
    mug(1880, 766, .8, t);
    const chomp = [1, 2, 3].some(n => lb >= n && lb < n + .3);
    mon(1100, 250, 660, 412, -.035, (x, y, w, h) => {
      X.fillStyle = C.scrDk; X.fillRect(x, y, w, h * .1);
      txt('chat', x + 24, y + h * .052, h * .06, C.scrDim, { font: 'Rajdhani', align: 'left' });
      glow(x + w / 2, y + h * .42, 240, '#FFF1B0', .22, 'source-over');
      mask(x + w / 2, y + h * .43, 112 * (chomp ? 1.08 : 1), { eyes: 'happy', mouth: chomp ? 'open' : 'grin', rot: chomp ? .12 : .04 * Math.sin(t * 5) });
      paint(rrPts(x + w * .06, y + h * .78, w * .88, h * .13, h * .05), { fill: '#2E5560', ink: C.scrDim, sw: 1.2, flat: true });
      txt('ask anything…', x + w * .1, y + h * .845, h * .055, C.scrDim, { font: 'Rajdhani', align: 'left', alpha: .8 });
    }, { glowR: .8 });
    // the researcher in his chair, side view
    const hx = 640, hy = 1183, h = 700, leanV = lerp(.14, -.3, relief) + .26 * uneasy;
    paint(rrPts(hx - 190, 590 + 26 * relief, 64, 300, 28), { fill: C.chair, shade: C.chairDk, ink: PAL.ink, sw: 2, light: [.2, -.1], alpha: 1 });
    const armsUp = relief * (1 - uneasy);
    const throwK = lb < 2.6 ? Math.exp(-frac(lb + .5) * 3) : 0;
    hero(hx, hy, h, {
      view: 'side', lL: [1.5, 1.55], lR: [1.45, 1.5], lean: leanV,
      aR: [lerp(lerp(.95, 1.55, throwK), 4.25, armsUp), lerp(lerp(.95, .25, throwK), -1.35, armsUp)], aL: [lerp(.85, 4.15, armsUp), lerp(1.0, -1.3, armsUp)],
      eyes: uneasy > .5 ? 'wide' : relief > .5 ? 'happy' : 'open', mouth: uneasy > .5 ? 'wobble' : relief > .5 ? 'smile' : 'flat',
      brows: uneasy > .5 ? 'worried' : 'flat', lookY: uneasy > .5 ? -1 : 0, lookX: uneasy > .5 ? -.4 : 0, sweat: uneasy, tilt: -.25 * uneasy
    });
    paint(rrPts(hx - 190, 906, 290, 44, 18), { fill: C.chair, shade: C.chairDk, ink: PAL.ink, sw: 2 });
    line([[hx - 50, 950], [hx - 50, 1010]], 8, '#2B2233', 0);
    for (const s of [-1, 1]) { line([[hx - 50, 1010], [hx - 50 + s * 100, 1030]], 7, '#2B2233', 0); paint(ellPts(hx - 50 + s * 100, 1034, 10, 10, 8), { fill: '#2B2233', ink: null, flat: true }); }
    // flying task cards: card i lands in the chat box on local beat i+1
    const box = [1430, 610];
    for (let i = 0; i < 4; i++) {
      const u = seg(lb, i + .4, i + 1);
      if (u <= 0 || lb > i + 1.35) continue;
      const land = lb >= i + 1, sx = 900, sy = 700, px = lerp(sx, box[0], easeIn(u)), py = lerp(sy, box[1], u) - Math.sin(u * Math.PI) * 300;
      const s = land ? 1 - seg(lb, i + 1, i + 1.3) : 1;
      if (s <= .02) continue;
      X.save(); X.translate(px, py); X.rotate((u - .5) * .9 + (i - 1.5) * .15); X.scale(s, s);
      paint(rectPts(-94, -52, 188, 104), { fill: C.note[i], shade: mixCol(C.note[i], '#7A5A3A', .3), ink: PAL.ink, sw: 2 });
      txt(TASKS[i], 0, 2, 58, PAL.ink, { font: 'Caveat' });
      X.restore();
    }
    camEnd();
    // the battery over his head (screen space so it stays readable), a step per beat
    const v = [1, .7, .42, .12][landed], blink = v < .2 ? .55 + .45 * Math.sign(Math.sin(t * 22)) : 1;
    const bs = 2.1 * (1 + .1 * Math.exp(-frac(lb) * 7) * (lb >= 1 ? 1 : 0)), bx = 660, by = 250;
    X.save(); X.globalAlpha = blink;
    battery(bx - 81 * bs, by - 35 * bs, bs, v);
    X.restore();
    for (let i = 1; i <= landed; i++) { const q = seg(lb, i, i + .8); if (q < 1) txt('-1', bx + 236, by - 20 - 80 * q, 76, C.bad, { font: 'Anton', stroke: PAL.ink, sw: 6, alpha: 1 - q, pop: clamp(q * 6) }); }
  }

  // b52–56 · the doubling chart: a painted log plot, dots doubling up the line; the smiley surfs up and off the top.
  function metrChart(t, lt, dur) {
    style(0);
    const lb = LB(lt), u = .12 + .17 * lb + .5 * easeIn(seg(lb, 2.2, 4));
    const x0 = 330, y0 = 950, x1 = 1780, y1 = 70, at = q => [lerp(x0, x1, q), lerp(y0, y1, q)];
    const [px, py] = at(u), ang = Math.atan2(y1 - y0, x1 - x0);
    X.drawImage(PAPER, 0, 0);
    camBegin(990, 530, 1.0 + lb * .02, -.015);
    wash(rectPts(-300, -300, 2520, 1700, 20), '#F4E6CA', .5, 20, 2);
    blooms(-200, -200, 2400, 1500, PAL.ochre, 7, .08, 23);
    // grid + axes
    const LBL = ['1 sec', '1 min', '10 min', '1 hr', '1 day', '1 wk'];
    for (let i = 0; i < 6; i++) { const gy = 950 - i * 176; line([[250, gy], [1880, gy]], 1.2, PAL.slate, 0, .25); txt(LBL[i], 232, gy, 40, PAL.slate, { font: 'Caveat', align: 'right' }); }
    line([[250, -60], [250, 960], [1900, 960]], 4, PAL.ink, 0);
    line([[236, -30], [250, -62], [264, -30]], 4, PAL.ink, 0);
    txt('task length', 80, 470, 52, PAL.ink, { font: 'Caveat', rot: -Math.PI / 2 });
    txt('time', 1780, 1012, 52, PAL.ink, { font: 'Caveat' });
    txt('doubling every ~7 months', 760, 90, 64, PAL.clay, { font: 'Caveat', rot: -.04 });
    line([[520, 130], [1000, 124]], 2.4, PAL.clay, .4, .6);
    // the line, painted up to the surfer, with a pooled wash under it
    const lu = Math.min(u, 1.4), [lx, ly] = at(lu);
    wash([[x0, y0 + 16], [lx, ly + 16], [lx, 960], [x0, 960]], PAL.rose, .16, 10, 2);
    line([[x0, y0], [lx, ly]], 9, PAL.clay, 0, .95);
    // dots pop in as the surfer passes them
    for (let i = 0; i < 12; i++) {
      const du = .05 + i * .092; if (du > u - .05) break;
      const k = backOut(clamp((u - .05 - du) * 18)), [dx, dy] = at(du);
      paint(ellPts(dx, dy + Math.sin(i * 2.7) * 18, 22 * k, 22 * k, 14), { fill: PAL.ochre, shade: PAL.clay, ink: PAL.ink, sw: 2 });
    }
    // spray + board + the surfing smiley
    const bob = Math.sin(t * 10) * 6;
    for (let i = 0; i < 9; i++) { const q = i / 9, j = Math.floor(t * 12); paint(ellPts(px - Math.cos(ang) * (70 + q * 220) + (hash(i + j) - .5) * 50, py - Math.sin(ang) * (70 + q * 220) + 26 + hash(i * 3 + j) * 44, 18 * (1 - q), 13 * (1 - q), 8), { fill: i % 2 ? PAL.teal : PAL.sky, ink: null, alpha: .7 * (1 - q) }); }
    X.save(); X.translate(px, py - 8 + bob); X.rotate(ang);
    paint(ellPts(0, 0, 135, 23, 22), { fill: PAL.rose, shade: '#A64A66', ink: PAL.ink, sw: 2.6 });
    line([[-112, 0], [112, 0]], 2.4, PAL.cream, 0, .75);
    X.restore();
    const mx = px + Math.sin(ang) * 106, my = py - Math.cos(ang) * 106 + bob;
    mask(mx, my, 96, { eyes: 'happy', mouth: 'grin', rot: ang * .35 + .12 * Math.sin(t * 8), look: [.6, -.6] });
    for (let i = 0; i < 5; i++) { const a = ang + Math.PI + (i - 2) * .12, r0 = 140 + hash(i + Math.floor(t * 12)) * 40; line([[mx + Math.cos(a) * r0, my + Math.sin(a) * r0], [mx + Math.cos(a) * (r0 + 110), my + Math.sin(a) * (r0 + 110)]], 3, PAL.ink, 0, .5); }
    camEnd();
  }

  // b56–60 · speculum: the monitor goes black; his reflection in the glass is wearing the smiley.
  function speculum(t, lt, dur) {
    style(0);
    const lb = LB(lt), off = lb >= .15, refl = P(lb, .3, .8), mk = BO(lb, 2, 4);
    X.drawImage(PAPER, 0, 0);
    camBegin(960 + lb * 10, 520, 1.04 + .06 * easeInOut(clamp(lb / 4)));
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wallDk, .94, 26, 3);
    glow(1780, 60, 700, C.lamp, .3, 'source-over');
    monitor(250, 70, 1440, 860, { stand: false, glowR: off ? .01 : .6, screen: off ? '#0C1016' : C.scr, glowCol: off ? '#000000' : undefined }, (x, y, w, h) => {
      if (!off) { harness(x, y, w, h, t, { state: () => 1 }); X.globalAlpha = .8; X.fillStyle = '#FFFFFF'; X.fillRect(x, y + h / 2 - 3, w, 6); X.globalAlpha = 1; return; }
      X.fillStyle = '#0C1016'; X.fillRect(x, y, w, h);
      // reflection: his face and the lamp, ghosted in black glass
      const rh = 2100, rx = x + w * .5, ry = y + h * .48;
      if (refl > 0) {
        glow(x + w * .86, y + h * .14, 300, C.lamp, .35 * refl, 'source-over');
        glow(rx, ry, 700, '#5A7A9A', .3 * refl, 'source-over');
        hero(rx, ry + .89 * rh, rh, { view: 'front', eyes: 'open', mouth: 'flat', alpha: .9 * refl, lookX: .1 });
        if (mk > .01) { glow(rx, ry - 10, 420 * mk, '#FFF1B0', .25 * mk, 'source-over'); mask(rx, ry - 10, 232 * mk, { eyes: lb > 3.1 ? 'wink' : 'happy', mouth: 'grin', alpha: .96 * refl, rot: .05 * Math.sin(t * 3) }); }
        X.globalAlpha = .3; X.fillStyle = '#10202E'; X.fillRect(x, y, w, h); X.globalAlpha = 1;
      }
      // glare streaks
      for (const [a, b, c] of [[.05, .2, .3], [.62, .95, .12]]) { X.globalAlpha = .07; X.fillStyle = '#FFFFFF'; X.beginPath(); X.moveTo(x + w * a, y + h); X.lineTo(x + w * (a + .12), y + h); X.lineTo(x + w * (b + .12), y); X.lineTo(x + w * b, y); X.fill(); }
      X.globalAlpha = 1;
    });
    // the real him in the foreground, back of the head, lower left
    const fh = 3000, flinch = lb >= 2.1 ? Math.exp(-(lb - 2.1) * 5) * 30 : 0;
    hero(300 - flinch, 1030 + .89 * fh - 60 - flinch * .5, fh, { view: 'back', tilt: -.05 - flinch * .002 });
    camEnd();
  }

  // b60–64 · sparks: 1-beat cuts
  function sparkStars(t, lt, dur) {
    style(0);
    const lb = LB(lt), k = BO(lb, 0, 6);
    FX.punch = 2;
    maskMonitor(t, {
      zoom: 1.35 + lb * .1, cy: 30, r: 330 * (.85 + .15 * k), notes: false,
      bg: (x, y, w, h) => { for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + lt * .6, cx = x + w / 2, cy = y + h / 2 + 20; paint([[cx, cy], [cx + Math.cos(a - .09) * 1400, cy + Math.sin(a - .09) * 1400], [cx + Math.cos(a + .09) * 1400, cy + Math.sin(a + .09) * 1400]], { fill: i % 2 ? PAL.ochre : '#2E6A70', ink: null, alpha: .35 * k, wet: 6, layers: 2 }); } },
      mood: { eyes: 'star', mouth: 'open' }
    });
  }
  function sparkField(cx, cy, lt, n, spread, seed = 0, sz = 1) {
    for (let i = 0; i < n; i++) {
      const a = hash(i * 3.3 + seed) * TAU, sp = (.3 + hash(i * 7.1 + seed)) * spread, d = easeOut(clamp(lt * 3.4 + .08)) * sp, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d + d * d * .0003;
      const col = [PAL.ochre, '#FFF1C4', PAL.rose, '#FFE08A', PAL.teal][i % 5], L = (50 + hash(i * 9) * 60) * sz;
      line([[x - Math.cos(a) * L, y - Math.sin(a) * L], [x, y]], (3 + hash(i) * 4) * sz, col, 0, .95);
      if (i % 3 === 0) paint(starPts(x, y, (14 + hash(i * 5) * 16) * sz, .42, 4, a), { fill: col, ink: PAL.ink, sw: 1.2 * sz, wet: 1 });
    }
  }
  function sparkBurst(t, lt, dur) {
    style(0);
    FX.shake += 14 * Math.exp(-lt * 8); FX.punch = 2;
    X.drawImage(PAPER, 0, 0);
    camBegin(1010, 470, 1.55 + lt * .15, .02);
    labBack(t, { heroX: 850, hero: { aL: [.9, .6], aR: [.9, .6], tilt: -.1 }, screenC: (x, y, w, h) => { X.fillStyle = '#FFF4D8'; X.fillRect(x, y, w, h); glow(x + w * .62, y + h / 2, 400, '#FFE08A', .8, 'source-over'); mask(x + w * .62, y + h / 2, 118, { eyes: 'star', mouth: 'open' }); } });
    glow(1110, 435, 800, '#FFE6A0', .4, 'source-over');
    sparkField(1110, 435, lt, 70, 1000, 1, 1.6);
    camEnd();
  }
  function sparkGlasses(t, lt, dur) {
    style(0);
    FX.punch = 2;
    const h = 5400, kk = h / 100, hx = 960, hy = 520;
    X.drawImage(PAPER, 0, 0);
    camBegin(960, 540, 1 + lt * .12);
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wallDk, .94, 26, 3);
    hero(hx, hy + .89 * h, h, { view: 'front', eyes: 'wide', mouth: 'O', brows: 'up' });
    glow(hx, hy, 1100, '#FFE6A0', .18, 'source-over');
    for (const s of [-1, 1]) {
      const lx = hx + s * 3.9 * kk, ly = hy + .2 * kk;
      X.save(); tracePath(X, ellPts(lx, ly, 3.3 * kk, 3.1 * kk, 24)); X.clip();
      X.globalAlpha = .35; X.fillStyle = '#FFF1C4'; X.fillRect(lx - 4 * kk, ly - 4 * kk, 8 * kk, 8 * kk); X.globalAlpha = 1;
      sparkField(lx - 40, ly - 60, lt + .1, 18, 260, s * 5);
      paint(starPts(lx - kk * .8, ly - kk * 1.1, kk * 1.1 * (1 + .2 * Math.sin(lt * 30)), .3, 4), { fill: '#FFFFFF', ink: null, alpha: .9 });
      X.restore();
    }
    camEnd();
  }
  function photoClose(t, lt, dur, o = {}) {
    style(0);
    const tr = o.tremble ?? 1, sh = tr * Math.exp(-lt * 2.5);
    X.drawImage(PAPER, 0, 0);
    camBegin(960, 540, 1 + lt * .06);
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wall, .92, 26, 4);
    blooms(-100, -100, 2100, 1300, PAL.night, 7, .16, 29);
    glow(1500, 200, 1000, C.lamp, .5, 'source-over');
    sticky(300, 250, 190, C.note[1], 'evals!!', -.12);
    sticky(1640, 860, 170, C.note[2], 'sleep?', .1);
    moonPhoto(960 + Math.sin(lt * 70) * 8 * sh, 560, 600, .05 + Math.sin(lt * 55) * .06 * sh, t);
    if (tr > 0) for (let i = 0; i < 10; i++) { const u = frac(lt * .8 + hash(i)), x = 200 + hash(i * 3) * 1500, y = -50 + u * 1200; paint(starPts(x, y, 12 + hash(i) * 10, .4, 4, u * 6), { fill: i % 2 ? PAL.ochre : '#FFF1C4', ink: PAL.ink, sw: 1, alpha: .8 * (1 - u) }); }
    camEnd();
    if (tr > 0) FX.shake += 8 * sh;
  }

  // b64–66 · break: he turns from the screen to the window and the painted moon.
  function turnToWindow(t, lt, dur) {
    style(0);
    const lb = LB(lt), turned = lb >= 1, k = easeInOut(clamp(lb / 2));
    X.drawImage(PAPER, 0, 0);
    camBegin(960 - k * 30, 540, 1.02 + k * .05);
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wall, .92, 26, 4);
    blooms(-100, -100, 2100, 1300, PAL.night, 7, .16, 31);
    // big window on the left
    const wx = 60, wy = 90, ww = 760, wh = 760;
    X.save(); tracePath(X, rectPts(wx, wy, ww, wh)); X.clip();
    X.fillStyle = '#1A2052'; X.fillRect(wx, wy, ww, wh);
    wash(rectPts(wx - 20, wy - 20, ww + 40, wh * .7, 8), PAL.night, .8, 14, 3);
    wash(rectPts(wx - 20, wy + wh * .5, ww + 40, wh * .6, 8), PAL.violet, .45, 14, 3);
    stars(t, 40, { x0: wx, y0: wy, ext: [ww, wh * .7], seed: 33, size: 1.4 });
    paintMoon(wx + ww * .55, wy + wh * .36, 150, {});
    X.restore();
    const wood = { fill: C.frame, shade: C.frameDk, ink: PAL.ink, sw: 2, wet: 2 };
    paint(rectPts(wx - 24, wy - 24, ww + 48, 24), wood); paint(rectPts(wx - 24, wy + wh, ww + 48, 24), wood);
    paint(rectPts(wx - 24, wy - 24, 24, wh + 48), wood); paint(rectPts(wx + ww, wy - 24, 24, wh + 48), wood);
    paint(rectPts(wx + ww / 2 - 9, wy, 18, wh), wood); paint(rectPts(wx, wy + wh * .5 - 9, ww, 18), wood);
    // moonlight across the room + onto him
    wash([[wx + ww, wy + 60], [wx + ww, wy + wh], [2000, 1200], [2000, 300]], PAL.cream, .1, 20, 2);
    const h = 1700, hx = 1330, hy = 470;
    hero(hx, hy + .89 * h, h, turned
      ? { view: 'side', flip: true, eyes: 'open', mouth: lb > 1.3 ? 'smile' : 'o', lookY: -.5, tilt: -.06, aL: [.05, .1], aR: [.05, .1] }
      : { view: 'q', eyes: 'tired', mouth: 'flat', lookX: .6, aL: [.1, .1], aR: [.1, .1] });
    if (turned) glow(hx - 200, hy - 20, 520, PAL.cream, .22, 'source-over');
    camEnd();
  }

  // b66–70 · wide: he's small by the window; the smiley follows his gaze, then a thin teal tentacle offers a plug.
  const TENT = { x0: 1040, y0: 452, cx: 700, cy: 120, x1: 405, y1: 560 };
  function offerScene(t, lb, o = {}) {
    const reach = easeOut(seg(lb, 2, 3.8)), eyeK = o.eyeK ?? 0;
    const mcx = L.monC.x + L.monC.w / 2, mcy = L.monC.y + L.monC.h / 2 + 4, mr = 108;
    const look = lb < .6 ? [0, 0] : lb < 2 ? [-1, -.2] : [-1, .3];
    labBack(t, {
      hero: false, chairX: 980, mugOnDesk: true, lamp: .85,
      screenC: (x, y, w, h) => {
        harness(x, y, w, h, t, { state: () => 1, alpha: .25 });
        X.globalAlpha = .4; X.fillStyle = C.scrDk; X.fillRect(x, y, w, h); X.globalAlpha = 1;
        glow(mcx, mcy, 200, '#FFF1B0', .25, 'source-over');
        mask(mcx, mcy, mr, { eyes: 'open', mouth: lb > 2 ? 'smirk' : 'smile', look });
        if (reach > 0) for (let i = 0; i < 3; i++) line(ellPts(TENT.x0, TENT.y0, 30 + i * 22 + frac(t * 2 + i / 3) * 20, 18 + i * 12, 16), 2, PAL.teal, .5, .6 * (1 - i / 3), true);
      }
    });
    neonEyes(mcx, mcy, mr, eyeK, look);
    // dust motes drifting in the moonlight
    for (let i = 0; i < 26; i++) { const u = frac(t * (.04 + hash(i) * .05) + hash(i * 3)), mx2 = 480 + hash(i * 5) * 520 + u * 120, my2 = 150 + hash(i * 7) * 760 + Math.sin(t * .8 + i) * 20; X.globalAlpha = .5 * Math.sin(u * Math.PI); X.fillStyle = PAL.cream; X.beginPath(); X.arc(mx2, my2, 2 + hash(i) * 2.5, 0, TAU); X.fill(); }
    X.globalAlpha = 1;
    // him at the window, looking up at the moon
    hero(300, 1036, 590, { view: 'back', tilt: .04, aL: [.12, .1], aR: [.12, .1] });
    glow(300, 460, 300, PAL.cream, .12, 'source-over');
    if (reach > 0) {
      const sp = reachTent(TENT.x0, TENT.y0, TENT.cx, TENT.cy, TENT.x1, TENT.y1, reach, t, 17, { seed: 2 });
      const n = sp.length, [tx, ty] = sp[n - 1], [px, py] = sp[n - 3];
      plug(tx, ty, Math.atan2(ty - py, tx - px), 1, o.plugGlow ?? 0);
    }
  }
  function offerWide(t, lt, dur) {
    style(0);
    const lb = LB(lt), k = easeInOut(clamp(lb / 4));
    FX.ghost = .12;
    X.drawImage(PAPER, 0, 0);
    camBegin(lerp(1000, 820, k), lerp(560, 480, k), lerp(.84, .98, k));
    offerScene(t, lb, { eyeK: lb > 3.4 ? .25 * P(lb, 3.4, 2) * (.6 + .4 * Math.sin(t * 40)) : 0 });
    camEnd();
  }
  // b70–72 · stutter cuts: neon cyan eyes (the first neon), FEEL THE AGI on b71, push into the plug.
  function offerStutter(t, lt, dur) {
    style(0);
    const lb = LB(lt), part = Math.floor(lb * 2), sl = stutter(lt, BEAT / 2, BEAT / 4);
    FX.punch = 1.5;
    const darkScreen = (x, y, w, h) => {
      X.fillStyle = '#0E2228'; X.fillRect(x, y, w, h);
      X.globalAlpha = .12; X.fillStyle = PAL.nCyan; for (let gx = x; gx < x + w; gx += 60) X.fillRect(gx, y, 2, h); for (let gy = y; gy < y + h; gy += 60) X.fillRect(x, gy, w, 2); X.globalAlpha = 1;
    };
    if (part === 0 || part === 2) {
      // the smiley, eyes igniting neon cyan
      const eyeK = part === 0 ? clamp(sl * 7) * (.75 + .25 * Math.sin(t * 60)) : 1;
      maskMonitor(t, { zoom: part === 0 ? 1.2 + sl * .3 : 1.42 + sl * .3, cy: part === 0 ? 10 : -70, notes: false, bg: darkScreen, mood: { eyes: 'open', mouth: 'smirk' }, eyes: (x, y, r) => neonEyes(x, y, r, eyeK) });
      FX.rgb = Math.max(FX.rgb, .35 * eyeK * Math.exp(-sl * 8));
    } else {
      // the plug, pushing in toward its glowing tip
      const z = part === 1 ? 2.3 + sl * .8 : 2.8 + Math.pow(clamp((lt - 3 * BEAT / 2) / (BEAT / 2)), 2) * 3.5;
      X.drawImage(PAPER, 0, 0);
      const tipX = TENT.x1 - 21, tipY = TENT.y1 + 31;           // the plug's glowing tip (the tentacle ends exactly at x1, y1)
      camBegin(lerp(TENT.x1 + 80, tipX, part === 3 ? easeIn(clamp((lt - 3 * BEAT / 2) / (BEAT / 2))) : 0), lerp(TENT.y1 - 30, tipY, part === 3 ? easeIn(clamp((lt - 3 * BEAT / 2) / (BEAT / 2))) : 0), z, -.05);
      offerScene(t, 3.9, { eyeK: 1, plugGlow: part === 1 ? .6 : 1 });
      camEnd();
      FX.zblur = part === 3 ? .15 * clamp((lt - 3 * BEAT / 2) / (BEAT / 2)) : 0;
    }
    if (lb >= 1) cap('FEEL THE AGI', 960, 150, 170, '#FFFFFF', { font: 'Anton', stroke: '#000', sw: 170 * .12, glow: PAL.nCyan, pop: clamp(since(t, 71) * 6), track: 6 });
  }

  chapter('lab', 0, bt(72), [
    [0, title],
    [bt(8), deskWide],
    [bt(16), harnessClose, { tin: 'zoom', td: .3 }],
    [bt(24), maskWakes],
    [bt(30), faceDeadpan],
    [bt(32), rewardSweep],
    [bt(36), codeTrue],
    [bt(40), testingMe],
    [bt(44), mindworms, { tin: 'whipV', td: .22 }],
    [bt(48), equity],
    [bt(52), metrChart, { tin: 'whip', td: .22 }],
    [bt(56), speculum],
    [bt(60), sparkStars, { tin: 'flash', td: .16 }],
    [bt(61), sparkBurst],
    [bt(62), sparkGlasses],
    [bt(63), photoClose],
    [bt(64), turnToWindow, { tin: 'ink', td: .32 }],
    [bt(66), offerWide],
    [bt(70), offerStutter]
  ]);

  POSTCARDS.lab = t => deskWide(t, 1.2, 8 * BEAT);
  POSTCARDS.mask = t => { style(0); maskMonitor(t, { zoom: 1.05, mood: { eyes: 'happy', mouth: 'grin', rot: .06 * Math.sin(t * 4) } }); };
  POSTCARDS.moonphoto = t => photoClose(t, .6, BEAT, { tremble: 0 });
})();
