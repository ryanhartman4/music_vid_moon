// c01_lab.js: Act I · The Lab (b0–b72, 0–24.70 s) · watercolour picture book.
// Cold open (b0–16): Bostrom's unfinished fable of the sparrows. A picture-book sky full of sparrows, the flock carrying a
// big speckled owl egg home, and one spectacled sparrow worrying about owls while the others party; match cut from its
// round glasses to his. Then the lab: an evals researcher works late (shibboleth sticky notes, SUPERINTELLIGENCE on the
// shelf), the loss groks, the model hatches from an egg icon, flatters him, reward-hacks, notices it's being tested, leaks
// em-dashes into his notebook, eats his mental equity, surfs the doubling chart and wears his face in the black glass.
// Break (b64–72): an em-dash mindworm crawls up his collar and into his ear; in a cross-section of his head neon cyan
// circuitry spreads through his brain from it (the first neon in the film); his eyes flicker neon: FEEL THE AGI.
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
    if (text) { const ls = text.split('\n'); ls.forEach((l, i) => txt(l, 0, (i - (ls.length - 1) / 2) * s * fs * 1.02, s * fs, PAL.ink, { font: 'Caveat', alpha: .92 })); }
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

  // a screen-space vignette (after camEnd): darkens the frame edges toward col
  function vignette(col, a) {
    const g = X.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a));
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
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
  const TESTS = ['sandbagging', 'alignment_faking', 'sleeper_agent', 'strawberry', 'golden_gate', 'sycophancy', 'honesty', 'shutdown'];
  const RESULTS = [1, 1, -1, -1, -1, 1, 1, 1];
  // grokking: a quick early drop, a long flat plateau, then the loss falls off a cliff (u ≈ .7 → .8)
  const grokV = u => u < .1 ? .92 - u / .1 * .26 : u < .7 ? .64 + .035 * Math.sin(u * 47) + (hash(Math.floor(u * 60)) - .5) * .05 : u < .8 ? lerp(.64, .07, easeInOut((u - .7) / .1)) : .06 + (hash(Math.floor(u * 60)) - .5) * .02;
  function lossCurve(x, y, w, h, k, S, grok = 0) {
    line([[x, y], [x, y + h], [x + w, y + h]], S * .004, C.scrDim, 0, .7);
    for (let i = 1; i < 4; i++) { X.fillStyle = C.scrDim; X.globalAlpha = .15; X.fillRect(x, y + h * i / 4, w, Math.max(1, S * .002)); }
    X.globalAlpha = 1;
    const pts = [], n = 60;
    for (let i = 0; i <= n * clamp(k); i++) { const u = i / n; pts.push([x + u * w, y + h * (1 - grokV(u))]); }
    if (k > 0 && k < 1) { const u = clamp(k); pts.push([x + u * w, y + h * (1 - grokV(u))]); }
    if (pts.length > 1) {
      line(pts, S * .007, '#F4C66A', .15);
      const [ex, ey] = pts[pts.length - 1];
      glow(ex, ey, S * .06, '#FFE2A0', .5, 'source-over');
      paint(ellPts(ex, ey, S * .012, S * .012, 10), { fill: '#FFF1C4', ink: null, flat: true });
    }
    if (grok > .01) {
      const lx = x + w * .6, ly = y + h * .14;
      txt('grokking', lx, ly, S * .075, '#FFE09A', { font: 'Caveat', rot: -.06, pop: grok });
      line([[lx + S * .1, ly + S * .02], [x + w * .74, y + h * .22], [x + w * .755, y + h * .44]], S * .004, '#FFE09A', .5, clamp(grok * 2));
      line([[x + w * .735, y + h * .39], [x + w * .755, y + h * .45], [x + w * .775, y + h * .39]], S * .004, '#FFE09A', 0, clamp(grok * 2));
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
    if (A > .5) lossCurve(cx0, cy0 + h * .04, cw, ch - h * .04, o.loss ?? 1, h, o.grok ?? 0);
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
  // the shelf: a few upright books and a flat stack whose top spine reads SUPERINTELLIGENCE
  function shelf() {
    paint(rectPts(540, 262, 262, 14), { fill: C.woodLt, shade: C.woodDk, ink: PAL.ink, sw: 1.6 });
    const books = [[548, 70, PAL.clay], [572, 82, PAL.sap], [598, 62, PAL.ochre]];
    for (const [bx, bh, col] of books) paint(rectPts(bx, 262 - bh, 22, bh), { fill: col, shade: mixCol(col, PAL.ink, .4), ink: PAL.ink, sw: 1.3, wet: 1.5 });
    paint(rectPts(628, 238, 160, 24), { fill: PAL.teal, shade: mixCol(PAL.teal, PAL.ink, .4), ink: PAL.ink, sw: 1.3, wet: 1.2 });
    paint(rectPts(634, 216, 150, 22), { fill: PAL.rose, shade: '#A64A66', ink: PAL.ink, sw: 1.3, wet: 1.2 });
    paint(rectPts(624, 186, 172, 30), { fill: '#243466', shade: '#161E44', ink: PAL.ink, sw: 1.4, wet: 1 });
    line([[630, 191], [790, 191]], 1, '#D8C28A', 0, .7); line([[630, 211], [790, 211]], 1, '#D8C28A', 0, .7);
    txt('SUPERINTELLIGENCE', 710, 202, 16.5, '#F3E6C4', { font: 'Rajdhani', track: .6 });
    paint(ellPts(610, 250, 10, 12, 10), { fill: PAL.cream, ink: PAL.ink, sw: 1.1 });
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
    sticky(900, 142, 100, C.note[2], 'stack more\nlayers', -.06, .2);
    sticky(1036, 108, 80, C.note[1], 'delve??', .08, .25);
    sticky(1170, 150, 94, C.note[0], 'bitter\nlesson', -.09, .23);
    sticky(1306, 112, 76, C.note[3], 'evals!!', .06);
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
  // cold open: Bostrom's unfinished fable of the sparrows (b0–16), a watercolour picture book
  // ======================================================================================================
  const SP = { back: '#B97B4B', backDk: '#7C4B2C', cap: '#93593A', capDk: '#5E3822', belly: '#F7EACF', cheek: '#FCF5E8',
    wing: '#AC6C3F', wingDk: '#744627', tail: '#86522F', bar: '#FFF8EC', streak: '#4A2E1E', beak: '#F0AA3E', leg: '#D38C5C', bib: '#3C2C30', blush: '#F08C9C' };
  const LW = z => 1 / (1 + (z - 1) * .85);            // keep ink weights sane under big camera zooms
  // picture-book edit: the same beat punch as the auto edit, and a warm slam on b8 (the auto slam's glitch slabs are neon)
  function bookEdit(t) {
    FX.noAuto = true;
    const b = bpOf(t);
    if (b >= 8) { const p = Math.exp(-frac(b) * 9); FX.zoom *= 1 + .016 * p; FX.shake += .9 * p; }
    const d = since(t, 8);
    if (d >= 0 && d < .5) { const k = 1 - d / .5; FX.flash = Math.max(FX.flash, .45 * k * k * k); FX.flashCol = '#FFF3D6'; FX.shake += 20 * k * k; FX.zoom *= 1 + .07 * easeOut(k); FX.rgb = Math.max(FX.rgb, .15 * k * k); }
  }

  // a round little house sparrow, side view, facing +x (o.dir -1 faces left). (x, y) = body centre; s = 1 → body ≈ 90 px.
  // o.flap: wing phase in cycles (null = wings folded) · o.eyes 'dot' | 'happy' | 'effort' | 'worried' · o.open (beak) ·
  // o.bib · o.legs 'perch' | 'tuck' | 'dangle' · o.twig · o.rot · o.sq (squash) · o.lw (ink weight) · o.alpha
  const WING = [[4, -7], [-22, -17], [-50, -21], [-76, -18], [-94, -10], [-102, -2], [-91, 1], [-97, 8], [-85, 8], [-88, 15], [-74, 13], [-76, 20], [-60, 16], [-42, 14], [-22, 11], [2, 8]];
  const FOLD = [[12, -4], [2, -15], [-18, -18], [-38, -13], [-54, -3], [-64, 5], [-53, 6], [-57, 12], [-43, 10], [-22, 12], [4, 9]];
  function sparrow(x, y, s, o = {}) {
    const A = o.alpha ?? 1, lw = o.lw ?? 1, d = o.dir ?? 1, E = o.eyes || 'dot', fly = o.flap != null, wet = 1.8 * lw;
    const U0 = U; U = s;
    X.save(); X.translate(x, y); X.rotate((o.rot || 0) * d); const sq = o.sq || 0; X.scale(d * s * (1 + sq * .45), s * (1 - sq));
    const P = (pts, fill, shade, ex = {}) => paint(pts, { fill, shade, light: [-.12, -.2], ink: PAL.ink, sw: 1.9 * lw, alpha: A, wet, curv: .35, ...ex });
    const th = fly ? .7 + 1.3 * Math.sin(o.flap * TAU) : 0;
    const wing = (px, py, ang, far) => {
      const X2 = pts => xform(pts, px, py, 1, ang);
      P(X2(fly ? WING : FOLD), far ? SP.wingDk : SP.wing, SP.wingDk, { curv: .25 });
      if (far) return;
      line(X2(fly ? [[-28, -8], [-44, -6], [-60, -4]] : [[-18, -5], [-32, -2], [-46, 2]]), 2.8 * lw, SP.bar, .5, .95 * A);
      for (let i = 0; i < 3; i++) line(X2(fly ? [[-62 - i * 9, -13 + i * 3], [-74 - i * 7, -3 + i * 5]] : [[-26 - i * 9, -12 + i * 2], [-34 - i * 9, -2 + i * 3]]), 1.8 * lw, SP.streak, .3, .5 * A);
    };
    if (fly) wing(-2, -16, th * .9 + .12, true);
    // tail
    P(xform([[-34, -2], [-70, -26], [-81, -21], [-78, -13], [-86, -8], [-73, 0], [-38, 10]], 0, 0, 1, o.tail || 0), SP.tail, SP.wingDk, { curv: .2 });
    // legs
    const lg = o.legs || (fly ? 'tuck' : 'perch');
    for (const lx of [-4, 9]) {
      if (lg === 'perch') { line([[lx, 28], [lx - 2, 46]], 2.4 * lw, SP.leg, 0, A); line([[lx - 9, 47], [lx - 2, 46], [lx + 8, 48]], 2.2 * lw, SP.leg, .3, A); }
      else if (lg === 'dangle') { line([[lx, 28], [lx - 1, 42], [lx + 3, 48]], 2.4 * lw, SP.leg, .4, A); }
      else line([[lx, 30], [lx - 9, 36]], 2.4 * lw, SP.leg, 0, A);
    }
    // body + belly + back streaks
    P(ellPts(0, 0, 44, 36, 24, 0, -.12), SP.back, SP.backDk);
    paint(ellPts(10, 12, 30, 21, 18, 0, -.25), { fill: SP.belly, ink: null, alpha: A, wet, op: .95, layers: 2 });
    for (const [a, b] of [[[-24, -18], [-13, -23]], [[-28, -8], [-17, -13]], [[-12, -12], [-1, -18]]]) line([a, b], 2 * lw, SP.streak, 0, .55 * A);
    // head (underpainted so the body outline doesn't show through)
    paint(ellPts(31, -30, 27, 26, 20), { fill: SP.back, ink: null, flat: true, alpha: A });
    P(ellPts(31, -30, 27, 26, 22), SP.cap, SP.capDk, { light: [-.2, -.25] });
    paint(ellPts(38, -21, 17, 14, 16, 0, .2), { fill: SP.cheek, ink: null, alpha: A, wet: wet * .6, layers: 2, op: .95 });
    if (o.bib) paint(ellPts(49, -7, 9, 8, 12), { fill: SP.bib, ink: null, alpha: A * .85, wet: wet * .4, layers: 2 });
    // eye
    const ex = 41, ey = -33;
    if (E === 'happy') line([[ex - 5, ey + 3], [ex, ey - 3], [ex + 5, ey + 3]], 2.6 * lw, PAL.ink, .5, A);
    else if (E === 'effort') line([[ex - 5, ey - 4], [ex + 3, ey], [ex - 5, ey + 4]], 2.4 * lw, PAL.ink, 0, A);
    else {
      paint(ellPts(ex, ey, 4.8, 5.2, 12), { fill: PAL.ink, ink: null, flat: true, alpha: A });
      paint(ellPts(ex - 1.5, ey - 2, 1.7, 1.7, 8), { fill: '#FFFFFF', ink: null, flat: true, alpha: A });
      if (E === 'worried') line([[ex - 7, ey - 9], [ex + 4, ey - 12]], 2 * lw, PAL.ink, 0, A);
    }
    // beak
    const op = o.open || 0;
    if (op > .05) { paint([[53, -34], [60, -27 + op * 4], [53, -22]], { fill: '#7A3A3A', ink: null, flat: true, alpha: A }); P([[52, -37], [70, -32 - op * 2], [53, -28]], SP.beak, '#B8742A', { curv: .1, sw: 1.5 * lw }); P([[52, -26], [65, -21 + op * 6], [52, -21]], SP.beak, '#B8742A', { curv: .1, sw: 1.5 * lw }); }
    else P([[52, -35], [70, -29], [52, -23]], SP.beak, '#B8742A', { curv: .1, sw: 1.5 * lw });
    paint(ellPts(40, -17, 6.5, 3.8, 10), { fill: SP.blush, op: .55, ink: null, flat: true, alpha: A });
    if (o.twig) { line([[62, -26], [88, -38], [112, -44]], 3.2 * lw, '#6A4A2E', .3, A); line([[88, -38], [96, -52]], 2.2 * lw, '#6A4A2E', 0, A); paint(xform([[0, 0], [9, -5], [18, 0], [9, 5]], 96, -52, 1, -1.2), { fill: PAL.sap, ink: PAL.ink, sw: 1 * lw, alpha: A, flat: true }); }
    wing(-4, -8, th, false);
    X.restore(); U = U0;
  }
  // the spectacled sparrow (and friends), front view. (x, y) = body centre; head centre at (x, y - 46s); lenses at (±12.6s, -46s), r 11s.
  // o.eyes 'dot' | 'worried' | 'happy' · o.glasses · o.book · o.sweat · o.lw · o.look [x, y]
  function sparrowFront(x, y, s, o = {}) {
    const A = o.alpha ?? 1, lw = o.lw ?? 1, wet = 1.8 * lw, E = o.eyes || 'dot', lk = o.look || [0, 0];
    const U0 = U; U = s;
    X.save(); X.translate(x, y); X.rotate(o.rot || 0); X.scale(s, s);
    const P = (pts, fill, shade, ex = {}) => paint(pts, { fill, shade, light: [-.14, -.2], ink: PAL.ink, sw: 1.9 * lw, alpha: A, wet, curv: .35, ...ex });
    // tail flicked out to one side, tiny feet gripping the branch
    P([[8, 20], [52, 34], [58, 26], [64, 30], [60, 18], [22, 4]], SP.tail, SP.wingDk, { curv: .2 });
    for (const fx of [-12, 12]) { line([[fx, 34], [fx, 44]], 2.6 * lw, SP.leg, 0, A); line([[fx - 8, 48], [fx, 44], [fx + 8, 48]], 2.4 * lw, SP.leg, .3, A); line([[fx, 44], [fx, 50]], 2.2 * lw, SP.leg, 0, A); }
    // plump body: streaky brown back showing at the sides, buff belly, small folded wings
    P(ellPts(0, 2, 41, 38, 24), SP.back, SP.backDk);
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) line([[sd * (30 + i * 3), -14 + i * 12], [sd * (36 + i * 2), -8 + i * 12]], 2 * lw, SP.streak, 0, .5 * A);
    paint(ellPts(0, 12, 27, 26, 18), { fill: '#EFE2C8', ink: null, alpha: A, wet, op: .95, layers: 2 });
    if (o.book) {
      // a tiny book clutched to the chest (no title)
      X.save(); X.rotate(-.1);
      P(rectPts(-17, 0, 34, 38), '#3F5C8E', '#28406A', { curv: 0 });
      paint(rectPts(14, 2, 4, 34), { fill: '#F6EEDB', ink: null, flat: true, alpha: A });
      line([[-10, 10], [10, 10]], 1.6 * lw, '#D8C28A', 0, .8 * A); line([[-8, 15], [8, 15]], 1.2 * lw, '#D8C28A', 0, .6 * A);
      X.restore();
      for (const sd of [-1, 1]) P(ellPts(sd * 22, 14, 9, 17, 14, 0, sd * .7), SP.wing, SP.wingDk);
    } else for (const sd of [-1, 1]) P(ellPts(sd * 35, 6, 10, 24, 16, 0, -sd * .18), SP.wing, SP.wingDk);
    // black bib at the throat (a house sparrow's badge)
    paint(ellPts(0, -17, 12, 10, 14), { fill: SP.bib, ink: null, alpha: A * .9, wet: wet * .4, layers: 2 });
    // head: pale cheeks, grey crown, chestnut bands behind the eyes
    paint(ellPts(0, -46, 31, 29, 22), { fill: SP.back, ink: null, flat: true, alpha: A });
    P(ellPts(0, -46, 31, 29, 24), '#ECE4D6', '#C9BBA4', { light: [-.1, -.3] });
    const lx = lk[0] * 3, ly = lk[1] * 3;
    paint([[-29, -52], [-24, -68], [-10, -75], [0, -76], [10, -75], [24, -68], [29, -52], [16, -58], [0, -60], [-16, -58]], { fill: '#8C8C9A', shade: '#6A6A7A', ink: null, alpha: A, curv: .5, wet });
    for (const sd of [-1, 1]) paint([[sd * 20, -54], [sd * 30, -52], [sd * 31, -40], [sd * 27, -30], [sd * 22, -40]], { fill: '#A2562E', ink: null, alpha: A * .95, curv: .5, wet });
    line(ellPts(0, -46, 31, 29, 24), 1.9 * lw, PAL.ink, .35, A, true);
    for (const sd of [-1, 1]) line([[sd * 3, -42], [sd * 8, -45]], 2.2 * lw, SP.bib, 0, .8 * A);
    for (const sd of [-1, 1]) {
      const cx = sd * 12.6 + lx, cy = -46 + ly;
      if (E === 'happy') line([[cx - 5, cy + 3], [cx, cy - 3], [cx + 5, cy + 3]], 2.6 * lw, PAL.ink, .5, A);
      else { paint(ellPts(cx, cy, 4.6, 5.2, 12), { fill: PAL.ink, ink: null, flat: true, alpha: A }); paint(ellPts(cx - 1.4, cy - 2, 1.6, 1.6, 8), { fill: '#FFFFFF', ink: null, flat: true, alpha: A }); }
    }
    P([[-5.5, -41], [5.5, -41], [.5, -30]], SP.beak, '#B8742A', { curv: .1, sw: 1.5 * lw });
    for (const sd of [-1, 1]) paint(ellPts(sd * 21, -35, 6, 3.4, 10), { fill: SP.blush, op: .55, ink: null, flat: true, alpha: A });
    if (o.glasses) {
      for (const sd of [-1, 1]) {
        paint(ellPts(sd * 12.6, -46, 11, 11, 48), { fill: '#E4F0F4', op: .22, flat: true, ink: PAL.ink, sw: 1.7 * lw, alpha: A, curv: .5 });
        line([[sd * 12.6 - 6, -42], [sd * 12.6 - 1, -50]], 1.4 * lw, '#FFFFFF', 0, .75 * A);
      }
      line([[-2, -47], [0, -49], [2, -47]], 1.6 * lw, PAL.ink, .5, A);
      for (const sd of [-1, 1]) line([[sd * 23.4, -47], [sd * 32, -49]], 1.5 * lw, PAL.ink, 0, A);
    }
    if (E === 'worried') for (const sd of [-1, 1]) line([[sd * 21, -58], [sd * 5, -63]], 2.2 * lw, PAL.ink, .2, A);
    if (o.sweat) paint([[33, -70], [38, -60], [33, -55], [28, -60]], { fill: '#A8E2FF', shade: '#5AA8D8', ink: PAL.ink, sw: 1.2 * lw, curv: .6, alpha: A * o.sweat, wet: .6 });
    X.restore(); U = U0;
  }
  // a big speckled owl egg. (x, y) = centre, r = half-width-ish (height ≈ 2.2r). o.crack (0..1), o.part 'top' | 'bottom', o.lw, o.speckles
  const eggPts = (x, y, r, n = 40) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, sn = Math.sin(a); p.push([x + Math.cos(a) * r * .84 * (1 + .08 * sn), y + sn * r * (sn < 0 ? 1.22 : 1)]); } return p; };
  const CRACK = [[-1, -.06], [-.62, -.24], [-.38, .02], [-.12, -.22], [.14, .03], [.4, -.24], [.64, .01], [1, -.1]];
  function owlEgg(x, y, r, o = {}) {
    const A = o.alpha ?? 1, lw = o.lw ?? 1, pts = eggPts(0, 0, r);
    X.save(); X.translate(x, y); X.rotate(o.rot || 0);
    if (o.part) {
      const cr = CRACK.map(([a, b]) => [a * r * .95, b * r]);
      X.beginPath();
      if (o.part === 'top') { X.moveTo(-r * 2, cr[0][1]); for (const p of cr) X.lineTo(...p); X.lineTo(r * 2, cr[cr.length - 1][1]); X.lineTo(r * 2, -r * 3); X.lineTo(-r * 2, -r * 3); }
      else { X.moveTo(-r * 2, cr[0][1]); for (const p of cr) X.lineTo(...p); X.lineTo(r * 2, cr[cr.length - 1][1]); X.lineTo(r * 2, r * 3); X.lineTo(-r * 2, r * 3); }
      X.closePath(); X.clip();
    }
    paint(pts, { fill: '#FAF4E6', shade: '#CDBEA2', light: [-.2, -.22], ink: PAL.ink, sw: clamp(r / 45, 1, 3.4) * lw, wet: r * .02 * lw, alpha: A });
    wash(eggPts(r * .2, r * .3, r * .6), '#D6C6A6', .22 * A, r * .04, 2);
    wash(eggPts(-r * .1, -r * .15, r * .7), '#CFDCE6', .16 * A, r * .05, 2);
    const nS = o.speckles ?? 70, SPK = ['#8A5A3A', '#6E4A36', '#A8764E', '#5A3E30', '#9A6A4A'];
    for (let i = 0; i < nS; i++) {
      const a = hash(i * 3.1 + 7) * TAU, rr = Math.sqrt(hash(i * 5.7 + 1)) * .9, sn = Math.sin(a), px = Math.cos(a) * rr * r * .8, py = sn * rr * r * (sn < 0 ? 1.15 : .95);
      const big = i % 13 === 0, sz = r * (big ? .07 + hash(i * 2.3) * .04 : .012 + Math.pow(hash(i * 2.3), 2) * .035);
      paint(ellPts(px, py, sz, sz * (.6 + hash(i * 9.1) * .5), big ? 12 : 8, sz * .15, hash(i) * 3), { fill: SPK[i % 5], ink: null, alpha: A * (big ? .55 : .6 + .35 * hash(i * 4.4)), wet: sz * .25, layers: 2 });
    }
    if (o.warm) wash(ellPts(r * .52, r * .05, r * .22, r * .75, 16), o.warm, .18 * A, r * .05, 2);
    wash(ellPts(-r * .3, -r * .5, r * .2, r * .3, 12, 0, .45), '#FFFFFF', .7 * A, r * .03, 2);
    if (o.crack) { const cr = CRACK.map(([a, b]) => [a * r * .95, b * r]), n = Math.max(2, Math.ceil(cr.length * clamp(o.crack))); line(cr.slice(0, n), clamp(r / 40, 1, 3.2) * lw, PAL.ink, 0, A); }
    X.restore();
  }
  // a woven nest bowl, rim centred at (x, y), w wide. Drawn in front of whatever sits in it.
  function nest(x, y, w, h, lw = 1) {
    const bowl = [];
    for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI; bowl.push([x + Math.cos(a) * w / 2, y + Math.sin(a) * h]); }
    for (let i = 18; i >= 0; i--) { const a = i / 18 * Math.PI; bowl.push([x + Math.cos(a) * w / 2 * .98, y - Math.sin(a) * h * .16]); }
    paint(bowl, { fill: '#A2703F', shade: '#5E3E22', light: [.1, -.3], ink: PAL.ink, sw: 2.2 * lw, curv: .3, wet: 2 * lw });
    X.save(); tracePath(X, bowl, .3); X.clip();
    for (let i = 0; i < 26; i++) {
      const y0 = y - h * .1 + hash(i * 3.3) * h * 1.05, x0 = x - w * .55 + hash(i * 7.1) * w * .3, x1 = x + w * .25 + hash(i * 1.9) * w * .3;
      line([[x0, y0], [(x0 + x1) / 2, y0 + (hash(i * 5.5) - .5) * h * .35], [x1, y0 + (hash(i * 2.2) - .5) * h * .3]], (2 + hash(i) * 2.4) * lw, ['#6A4526', '#C89A5A', '#8A5A30', '#D9B070'][i % 4], .6, .75);
    }
    X.restore();
    for (let i = 0; i < 7; i++) { const a = Math.PI * (.05 + hash(i * 3.7) * .9), px = x + Math.cos(a) * w / 2, py = y + Math.sin(a) * h * .3 - h * .08; line([[px, py], [px + (hash(i * 8.1) - .5) * w * .3, py - h * (.2 + hash(i) * .35)]], 2.2 * lw, '#8A5A30', .3, .85); }
    line(ellPts(x, y - h * .02, w / 2, h * .16, 22).slice(0, 12), 3 * lw, '#C89A5A', .5, .8);
  }
  // cumulus: a flat underpaint, then overlapping puff washes whose pooled edges draw the cauliflower forms,
  // a cool shadowed belly, warm sunlit tops and lifted-paper highlights. No ink: the sky stays soft behind the characters.
  function cloud(cx, cy, w, h, seed, o = {}) {
    const A = o.alpha ?? 1, body = o.body || '#FFF7EC', under = o.under || '#C8A2CE', n = 5 + Math.floor(hash(seed) * 3), PF = [];
    for (let i = 0; i < n; i++) { const u = (i + .5) / n, bm = Math.sin(u * Math.PI), r = h * (.3 + .4 * bm) * (.8 + .4 * hash(seed + i * 3.1)); PF.push([cx - w / 2 + u * w + (hash(seed + i * 1.7) - .5) * w * .06, cy - r * .42 - h * .1 * bm, r]); }
    for (let i = 1; i < n - 1; i++) { const u = (i + .1 + hash(seed + i * 9.3) * .8) / n, bm = Math.sin(u * Math.PI), r = h * (.2 + .28 * bm) * (.8 + .4 * hash(seed + i * 4.1)); PF.push([cx - w / 2 + u * w, cy - h * (.38 + .36 * bm), r]); }
    const base = cy + h * .06;
    X.save();
    X.beginPath(); X.moveTo(cx - w, cy - h * 3); X.lineTo(cx + w, cy - h * 3); X.lineTo(cx + w, base);
    for (let i = 0; i <= 10; i++) X.lineTo(cx + w - i * w * .2, base + Math.sin(i * 1.9 + seed) * h * .035);
    X.closePath(); X.clip();
    X.globalAlpha = .8 * A; X.fillStyle = body; X.beginPath(); for (const [px, py, r] of PF) { X.moveTo(px + r, py); X.arc(px, py, r, 0, TAU); } X.fill(); X.globalAlpha = 1;
    for (const [px, py, r] of PF) wash(ellPts(px, py, r, r * .94, 18), body, .28 * A, r * .05, 2);
    wash(ellPts(cx, base - h * .06, w * .56, h * .26, 20), under, .62 * A, h * .05, 3);
    for (const [px, py, r] of PF) if (r > h * .28) wash(ellPts(px + r * .12, py + r * .45, r * .72, r * .3, 14), under, .22 * A, r * .05, 2);
    if (o.rim) wash(ellPts(cx + (o.rimX ?? .3) * w * .8, cy - h * .45, w * .32, h * .4, 16), o.rim, .42 * A, h * .06, 3);
    for (const [px, py, r] of PF.slice(n)) wash(ellPts(px - r * .2, py - r * .3, r * .5, r * .32, 12), '#FFFFFF', .32 * A, r * .05, 2);
    X.restore();
  }
  const hillPts = (y0, amp, f, ph, x0 = -600, x1 = 2600, step = 50) => { const p = [[x0, 1700]]; for (let x = x0; x <= x1; x += step) p.push([x, y0 - amp * (Math.sin(x * f + ph) * .65 + Math.sin(x * f * 2.3 + ph * 1.7) * .35)]); p.push([x1, 1700]); return p; };
  const hillY = (x, y0, amp, f, ph) => y0 - amp * (Math.sin(x * f + ph) * .65 + Math.sin(x * f * 2.3 + ph * 1.7) * .35);
  // a picture-book tree: a tapered trunk and a canopy of soft overlapping washes (ink only on near trees)
  function roundTree(x, y, s, col, dk, o = {}) {
    const A = o.alpha ?? 1, ink = o.ink ? PAL.ink : null;
    paint([[x - s * .06, y + s * .02], [x - s * .025, y - s * .52], [x + s * .03, y - s * .52], [x + s * .065, y + s * .02]], { fill: o.trunk || '#5E4230', ink, sw: clamp(s / 110, .5, 1.6), wet: s * .01, alpha: A, curv: .2 });
    const hi = mixCol(col, '#FFF4C8', .4);
    for (const [dx, dy, r] of [[-.22, -.62, .3], [.24, -.64, .31], [0, -.78, .4], [-.08, -1.0, .27], [.14, -.98, .22]]) paint(ellPts(x + dx * s, y + dy * s, r * s, r * s * .9, 16), { fill: col, shade: dk, ink: null, alpha: A, wet: s * .03, light: [-.25, -.3] });
    if (ink) line(ellPts(x, y - s * .78, s * .5, s * .46, 20).slice(9, 18), clamp(s / 120, .5, 1.4), PAL.ink, .5, .5 * A);
    wash(ellPts(x - s * .12, y - s * .93, s * .22, s * .15, 12), hi, .55 * A, s * .02, 2);
    wash(ellPts(x + s * .16, y - s * .55, s * .2, s * .12, 12), dk, .3 * A, s * .02, 2);
  }
  // the sparrows' home: a big old tree with a layered, dappled canopy. (x, y) = foot of the trunk, s ≈ canopy radius
  function bigTree(x, y, s, o = {}) {
    const A = o.alpha ?? 1, d = o.dusk || 0, col = mixCol('#6FAA62', '#4E5A86', d), dk = mixCol('#3E6A42', '#2E3458', d), hi = mixCol('#B8DA8A', '#8A86B8', d), trunk = mixCol('#5E4230', '#2E2638', d);
    paint([[x - s * .16, y + 10], [x - s * .08, y - s * .7], [x - s * .3, y - s * 1.1], [x - s * .2, y - s * 1.14], [x, y - s * .86], [x + s * .22, y - s * 1.2], [x + s * .3, y - s * 1.14], [x + s * .08, y - s * .7], [x + s * .14, y + 10]], { fill: trunk, shade: mixCol(trunk, '#000000', .4), ink: PAL.ink, sw: 1.6, curv: .3, wet: 2, alpha: A });
    const B = [[-.55, -1.25, .5], [.5, -1.3, .52], [0, -1.55, .6], [-.8, -1.6, .38], [.82, -1.62, .4], [-.3, -1.95, .45], [.35, -1.95, .42], [0, -1.15, .45]];
    for (const [dx, dy, r] of B) paint(ellPts(x + dx * s, y + dy * s, r * s, r * s * .88, 18), { fill: col, shade: dk, ink: null, alpha: A, wet: s * .025, light: [-.25, -.3] });
    for (const [dx, dy, r] of B) wash(ellPts(x + (dx - r * .3) * s, y + (dy - r * .35) * s, r * s * .45, r * s * .3, 12), hi, .4 * A, s * .015, 2);
    for (let i = 0; i < 16; i++) { const a = hash(i * 3.7) * TAU, rr = Math.sqrt(hash(i * 5.1)) * .9, px = x + Math.cos(a) * rr * s, py = y - 1.55 * s + Math.sin(a) * rr * s * .8; paint(ellPts(px, py, s * .05, s * .035, 8, 0, a), { fill: i % 3 ? dk : hi, ink: null, alpha: .6 * A, flat: true }); }
  }
  // rolling picture-book hills; k darkens them toward twilight; scroll shifts them (parallax)
  function fableHills(t, k, o = {}) {
    const d = clamp(k / 2), sc = o.scroll || 0, H0 = o.y ?? 860;
    const far = mixCol('#A6BCD6', '#6E6C9E', d), far2 = mixCol('#9AB6C8', '#5E6090', d), mid = mixCol('#93BC8A', '#4E5C80', d), near = mixCol('#72A462', '#34425E', d);
    X.save(); X.translate(-sc * .2, 0);
    wash(hillPts(H0 - 70, 70, .0016, 2.2), far, .7, 14, 3);
    for (let i = 0; i < 30; i++) { const cl = Math.floor(i / 5), tx = -600 + cl * 560 + hash(cl * 7.1) * 200 + (i % 5) * (40 + hash(i * 2.1) * 30); roundTree(tx, hillY(tx, H0 - 70, 70, .0016, 2.2) + 22, 26 + hash(i) * 22, far2, mixCol(far2, '#3A3A6A', .3), { alpha: .7 }); }
    X.restore();
    X.save(); X.translate(-sc * .45, 0);
    wash(hillPts(H0 + 20, 50, .0021, 1.3), far2, .8, 10, 3);
    X.restore();
    X.save(); X.translate(-sc * .7, 0);
    wash(hillPts(H0 + 90, 60, .0017, 3.1), mid, .92, 10, 3);
    wash(hillPts(H0 + 130, 40, .0017, 3.1), mixCol(mid, '#FFF1C4', .25), .25, 16, 2);
    // a winding river catching the sky
    const rv = []; for (let i = 0; i <= 14; i++) { const u = i / 14; rv.push([200 + u * 1500 + Math.sin(u * 7) * 120, H0 + 120 + u * 260]); }
    paint(ribbon(rv, u => 5 + u * 30), { fill: mixCol('#FFF1D2', '#E7B0B8', d), ink: null, alpha: .75, curv: .5, wet: 3 });
    for (let i = 0; i < 15; i++) { const cl = Math.floor(i / 3), tx = -500 + cl * 700 + hash(cl * 3.9) * 260 + (i % 3) * (70 + hash(i * 1.3) * 40); if (Math.abs(tx - 900) < 80) continue; roundTree(tx, hillY(tx, H0 + 90, 60, .0017, 3.1) + 26, 64 + hash(i * 2) * 30, mixCol('#5E9A62', '#3E4E6E', d), mixCol('#355E3E', '#2A3452', d), { trunk: mixCol('#5E4230', '#2E2638', d) }); }
    X.restore();
    if (o.near !== false) {
      X.save(); X.translate(-sc, 0);
      wash(hillPts(H0 + 210, 36, .0013, 5.2), near, .95, 10, 3);
      // meadow: grass flicks and wildflowers
      for (let i = 0; i < 70; i++) { const gx = -500 + hash(i * 3.1) * 3000, gy = hillY(gx, H0 + 210, 36, .0013, 5.2) + 20 + hash(i * 7.3) * 150; line([[gx, gy], [gx + (hash(i) - .5) * 14, gy - 14 - hash(i * 2.2) * 16]], 2, mixCol('#3E6A34', '#243048', d), .3, .7); }
      for (let i = 0; i < 34; i++) { const fx = -500 + hash(i * 9.7) * 3000, fy = hillY(fx, H0 + 210, 36, .0013, 5.2) + 24 + hash(i * 4.1) * 140; paint(ellPts(fx, fy, 5, 5, 8), { fill: ['#FFF4E0', '#F6B6C4', '#FFD86A'][i % 3], ink: null, flat: true, alpha: 1 - d * .6 }); }
      X.restore();
    }
  }
  // the picture-book sky. k: 0 golden afternoon → 1 sunset → 2 twilight. sun: [x, y]. Sky stops by time of day: [golden afternoon, sunset, twilight], graded top → horizon (world y ≈ 950)
  const SKY = [[-500, '#5F8FD6', '#4E58A8', '#161A48'], [0, '#86AEE4', '#7C74C0', '#2C2C6A'], [380, '#BCD2EE', '#C284B8', '#5A3E86'],
    [640, '#F6DCC4', '#F2A084', '#A2587E'], [820, '#FFE6B2', '#FFC47E', '#E08A7A'], [1000, '#FFF1D2', '#FFE0A6', '#F2B28A']];
  function fableSky(t, k, sun, o = {}) {
    const c = (a, b, cc) => k <= 1 ? mixCol(a, b, k) : mixCol(b, cc, clamp(k - 1));
    const x0 = o.x0 ?? -500, w = o.w ?? 2920, y0 = o.y0 ?? -500, h = o.h ?? 2080, cols = SKY.map(s => c(s[1], s[2], s[3]));
    vgrad(x0, y0, w, h, SKY.map((s, i) => [clamp((s[0] - y0) / h), cols[i]]).concat([[1, cols[cols.length - 1]]]));
    // watercolour on top of the grade: loose washes with pooled edges, blooms and granulation
    wash(rectPts(x0, y0, w, 520 - y0, 30), cols[0], .35, 40, 3);
    wash(ellPts(sun[0], sun[1] + 80, w * .5, 330, 22), cols[4], .4, 50, 3);
    wash(ellPts(sun[0] - 300, 420, w * .45, 200, 20, 30), cols[2], .3, 40, 3);
    blooms(x0, y0, w, 900, cols[1], 7, .16, 41);
    blooms(x0, 300, w, 600, c('#F4B8C0', '#E88AA8', '#9A5A92'), 6, .12, 43);
    // granulation: fine pigment specks settle in the paper tooth
    X.fillStyle = c('#5A6AA8', '#6A4A88', '#2A2A5A');
    for (let i = 0; i < 160; i++) { X.globalAlpha = .08 + .1 * hash(i * 1.3); const gx = x0 + hash(i * 7.3 + 1) * w, gy = y0 + hash(i * 3.9 + 2) * h * .6; X.beginPath(); X.arc(gx, gy, 1.2 + hash(i) * 2.6, 0, TAU); X.fill(); }
    X.globalAlpha = 1;
    if (o.rays ?? k < 1.5) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32 + Math.sin(t * .3 + i) * .02, L = 1700, wd = .035 + hash(i * 2.2) * .03; wash([[sun[0], sun[1]], [sun[0] + Math.cos(a - wd) * L, sun[1] + Math.sin(a - wd) * L], [sun[0] + Math.cos(a + wd) * L, sun[1] + Math.sin(a + wd) * L]], '#FFF6DE', .09, 20, 2); }
    if (o.sunR !== 0) {
      const sr = o.sunR ?? 70;
      glow(sun[0], sun[1], sr * 6, c('#FFE7B0', '#FFC27A', '#F7A07A'), .45, 'source-over');
      glow(sun[0], sun[1], sr * 2.6, '#FFF6DE', .55, 'source-over');
      paint(ellPts(sun[0], sun[1], sr, sr, 30), { fill: c('#FFF4CF', '#FFE3A0', '#FFD08E'), ink: null, wet: 3, layers: 3, op: .95 });
    }
    if (k > 1.2) { const sa = clamp((k - 1.2) / .6); X.fillStyle = '#FFF6E6'; for (let i = 0; i < 70; i++) { X.globalAlpha = sa * (.35 + .55 * hash(i * 5.1)) * (.7 + .3 * Math.sin(t * (1 + hash(i) * 3) + i)); X.beginPath(); X.arc(x0 + hash(i * 3.3 + 9) * w, y0 + hash(i * 7.1 + 9) * h * .45, 1.2 + hash(i * 1.7) * 2.4, 0, TAU); X.fill(); } X.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const sx = x0 + hash(i * 9.1 + 3) * w, sy = y0 + hash(i * 4.7 + 3) * h * .35, r = (7 + hash(i * 2.3) * 8) * (.7 + .3 * Math.sin(t * 2.5 + i)); paint(starPts(sx, sy, r, .3, 4), { fill: '#FFF3D6', ink: null, flat: true, alpha: .9 * sa }); } }
  }
  // the big owl, as a dark picture-book silhouette with lamp-yellow eyes (for the worried sparrow's thought bubble)
  function owlSilhouette(x, y, s, t, o = {}) {
    const col = o.col || '#2E2A58', A = o.alpha ?? 1, blink = !!o.blink;
    X.save(); X.translate(x, y); X.scale(s, s);
    paint([[-44, -30], [-58, -86], [-30, -58], [0, -64], [30, -58], [58, -86], [44, -30], [56, 20], [40, 70], [0, 86], [-40, 70], [-56, 20]], { fill: col, shade: '#1A1638', ink: PAL.ink, sw: 1.6, curv: .35, alpha: A, wet: 1.5 });
    for (const sd of [-1, 1]) paint(ellPts(sd * 46, 26, 16, 44, 14, 0, sd * .25), { fill: '#3A3668', ink: PAL.ink, sw: 1.2, alpha: A * .9, wet: 1 });
    for (let i = 0; i < 9; i++) { const vx = (i % 3 - 1) * 16, vy = 14 + Math.floor(i / 3) * 16; line([[vx - 5, vy], [vx, vy + 5], [vx + 5, vy]], 1.6, '#4A4680', .4, .8 * A); }
    for (const sd of [-1, 1]) {
      paint(ellPts(sd * 20, -30, 19, 19, 20), { fill: '#46427A', ink: null, alpha: A, flat: true });
      if (blink) line([[sd * 20 - 13, -30], [sd * 20 + 13, -30]], 3, '#F4CF5A', 0, A);
      else { glow(sd * 20, -30, 34, '#FFD86A', .35 * A, 'source-over'); paint(ellPts(sd * 20, -30, 14, 14, 18), { fill: '#F6D35C', ink: PAL.ink, sw: 1.4, alpha: A, flat: true }); paint(ellPts(sd * 20 + (o.look || 0) * 4, -29, 6.5, 8, 12), { fill: '#161226', ink: null, alpha: A, flat: true }); }
    }
    paint([[-6, -18], [6, -18], [0, -4]], { fill: '#D9A23E', ink: PAL.ink, sw: 1.1, alpha: A, flat: true });
    for (const sd of [-1, 1]) line([[sd * 14, 84], [sd * 10, 94], [sd * 16, 94], [sd * 20, 92]], 2.4, '#D9A23E', .3, A);
    X.restore();
  }
  // a picture-book thought bubble: scalloped cloud + trailing dots toward (tx, ty)
  function thought(x, y, w, h, tx, ty, k, draw) {
    if (k <= .01) return;
    const s = backOut(k);
    for (let i = 0; i < 3; i++) { const u = (i + 1) / 4, r = (10 + i * 7) * s; paint(ellPts(lerp(tx, x, u), lerp(ty, y + h * .45, u), r, r * .85, 12), { fill: '#FFF8EA', ink: PAL.ink, sw: 2, wet: 1.5, alpha: clamp(k * 3 - i * .4) }); }
    X.save(); X.translate(x, y); X.scale(s, s);
    const pts = []; const n = 11;
    for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU; for (let j = 0; j <= 4; j++) { const a = lerp(a0, a1, j / 4), bump = 1 + .1 * Math.sin(j / 4 * Math.PI); pts.push([Math.cos(a) * w / 2 * bump, Math.sin(a) * h / 2 * bump]); } }
    paint(xform(pts, 10, 12), { fill: '#0E1030', ink: null, alpha: .2, wet: 4, layers: 2 });
    paint(pts, { fill: '#FFF8EA', ink: PAL.ink, sw: 2.4, wet: 2.5, op: .97, layers: 2 });
    X.save(); tracePath(X, pts); X.clip(); draw(); X.restore();
    X.restore();
  }

  // ---------- b0–8 · the title: a picture-book sky full of sparrows ----------
  // flyers: [delay (beats), y, scale, speed px/s, flap rate, twig]
  const TITLE_FLYERS = [[-3, 680, .95, 620, 1], [-1.2, 150, .5, 480, 0], [.4, 760, 1.25, 700, 0], [1.5, 650, .8, 560, 1], [2.6, 820, 1.1, 660, 0], [3.4, 170, .55, 500, 0], [4.3, 720, 1.35, 720, 1], [5.2, 640, .85, 600, 0], [6, 800, 1.05, 680, 0], [6.7, 690, .75, 560, 1]];
  function fableTitlePaint(t, lt) {
    const lb = LB(lt), bp = bpOf(t);
    X.drawImage(PAPER, 0, 0);
    camBegin(960 + lb * 6, 540 - lb * 3, 1.02 + lb * .006);
    fableSky(t, .3, [1440, 840], { sunR: 72 });
    cloud(150 - lt * 8, 110, 340, 100, 31, { under: '#A6B4DE', alpha: .8 });
    cloud(1330 - lt * 6, 96, 380, 110, 37, { under: '#A6B0DC', alpha: .8 });
    cloud(330 - lt * 14, 560, 660, 240, 3, { under: '#B7A2D2', rim: '#FFE2B0' });
    cloud(1660 - lt * 11, 520, 700, 260, 7, { under: '#C4A0C8', rim: '#FFD8A0', rimX: -.28 });
    fableHills(t, .3, { y: 850, scroll: lt * 30 });
    // home: the big round tree on the hill where the sparrows nest
    bigTree(1730, 930, 150, {});
    // sparrows cross the sky in twos and threes toward the tree, some carrying twigs for their nests; wings beat on the beat
    for (const [dl, fy, fs, sp, tw] of TITLE_FLYERS) {
      const u = lt - dl * BEAT, fx = -160 + u * sp;
      if (fx < -200 || fx > 2150) continue;
      sparrow(fx, fy - u * 12 + Math.sin(u * 5 + dl) * 10 * fs, fs, { flap: bp + dl * .37, twig: !!tw, eyes: 'dot', rot: -.1, bib: fs > .9 });
    }
    // lettering, painted in left → right
    const rv = easeOut(seg(lb, .25, 2.0)), a1 = seg(lb, .2, 1.1), a2 = seg(lb, 1.3, 2.4), a3 = seg(lb, 3, 4.2);
    wash(ellPts(960, 330, 700, 170, 20, 12), '#FFF6E6', .28 * a1, 26, 3);
    X.save(); X.beginPath(); X.rect(960 - 800, 150, 1600 * rv, 280); X.clip();
    txt('take me (to the moon)', 960, 300 - 8 * (1 - a1), 136, '#2E2C62', { font: 'Marker', shadow: 'rgba(255,246,230,.8)', alpha: a1 });
    X.restore();
    txt('Ian Asher  &  D A N N Y', 960, 410 + 10 * (1 - a2), 64, '#4A3A6A', { font: 'Caveat', alpha: a2 * .95 });
    camEnd();
  }
  function fableTitle(t, lt, dur) { style(0); FX.noAuto = true; fableTitlePaint(t, lt); }

  // ---------- b8–12 · the flock carries a big speckled owl egg home (the bass comes in) ----------
  // carriers: [dx, dy, scale, flap phase] relative to the egg centre; each holds a string to the net
  const CARRIERS = [[-235, -200, 1.2, 0], [-85, -275, 1.12, .37], [95, -280, 1.15, .71], [245, -195, 1.22, .19]];
  function fableFlockPaint(t, lt) {
    const lb = LB(lt), bp = bpOf(t), R = 132;
    const trav = lt * 520;                                    // how far the flock has flown (background scroll)
    X.drawImage(PAPER, 0, 0);
    camBegin(960, 540, 1.0 + lb * .012, -.02);
    fableSky(t, 1, [1560, 740], { sunR: 80 });
    cloud(420 - trav * .12, 190, 560, 170, 13, { under: '#B98AB8', rim: '#FFC98A', rimX: .32 });
    cloud(1500 - trav * .1, 330, 520, 150, 17, { under: '#C08AB0', rim: '#FFD09A', rimX: .3 });
    cloud(2400 - trav * .16, 150, 600, 180, 19, { under: '#B48AB8', rim: '#FFC98A', rimX: .3 });
    fableHills(t, 1, { y: 880, scroll: trav * .5 });
    // home: the big tree on the far hill, getting closer
    bigTree(1790 - trav * .12, 960, 110 * (1 + lb * .05), { dusk: .4 });
    // wind curls streaming past
    for (let i = 0; i < 7; i++) { const u = frac(lt * .9 + hash(i * 3.1)), wx = 2000 - u * 2300, wy = 180 + hash(i * 5.3) * 700; const pts = []; for (let j = 0; j < 9; j++) pts.push([wx + j * 26, wy + Math.sin(j * .8 + i) * 8]); pts.push([wx + 240, wy - 14], [wx + 226, wy - 30], [wx + 206, wy - 18]); line(pts, 2.6, '#FFF6E6', .6, .55 * Math.sin(u * Math.PI)); }
    // the flock: bobbing up on every beat's downstroke
    const bob = -18 * Math.exp(-frac(bp) * 5) + Math.sin(lt * 5) * 6, ex = 900 + lb * 26, ey = 640 + bob, sway = Math.sin(lt * 4.2) * .06;
    // strings: carrier feet → the net's rim across the egg
    const rim = u => { const a = lerp(-.82, .82, u); return [ex + a * R * .96 + Math.sin(sway) * 20, ey - R * .28 + (1 - a * a) * R * .26]; };
    const feet = CARRIERS.map(([dx, dy, s, ph], i) => { const bb = Math.sin((bp * 2 + ph) * TAU) * 6; return [ex + dx + 4 * s, ey + dy + bb + 44 * s]; });
    for (let i = 0; i < 4; i++) { const [fx, fy] = feet[i], [rx, ry] = rim(i / 3); line([[fx, fy], [rx, ry]], 2.6, '#8A6A4A', 0, .95); }
    // a pusher sparrow underneath, straining
    sparrow(ex - 190, ey + 150 + Math.sin(bp * TAU) * 6, 1.05, { flap: bp * 2 + .5, eyes: 'effort', rot: -.5, bib: true });
    owlEgg(ex, ey, R, { rot: sway, warm: '#FFC98A' });
    // the twine net cradling the egg
    X.save(); X.translate(ex, ey); X.rotate(sway); tracePath(X, eggPts(0, 0, R * 1.02)); X.clip();
    X.beginPath(); X.moveTo(-R * 2, -R * .28); for (let i = 0; i <= 12; i++) { const a = lerp(-.82, .82, i / 12); X.lineTo(a * R * .96, -R * .28 + (1 - a * a) * R * .26); } X.lineTo(R * 2, -R * .28); X.lineTo(R * 2, R * 2); X.lineTo(-R * 2, R * 2); X.closePath(); X.clip();
    for (let i = -6; i <= 6; i++) { line([[i * 46 - 180, -R], [i * 46 + 180, R * 1.4]], 2.4, '#8A6A4A', 0, .7); line([[i * 46 + 180, -R], [i * 46 - 180, R * 1.4]], 2.4, '#8A6A4A', 0, .7); }
    X.restore();
    { const pts = []; for (let i = 0; i <= 12; i++) pts.push(rim(i / 12)); line(pts, 4, '#8A6A4A', .5, 1); }
    // carriers, wings pumping twice a beat
    CARRIERS.forEach(([dx, dy, s, ph], i) => { const bb = Math.sin((bp * 2 + ph) * TAU) * 6; sparrow(ex + dx, ey + dy + bb, s, { flap: bp * 2 + ph, legs: 'dangle', eyes: i === 1 ? 'effort' : i === 3 ? 'happy' : 'dot', bib: i % 2 === 0, rot: i < 2 ? -.06 : .06 }); });
    // the leader up front, looking back and cheeping on the beat
    const ch = Math.exp(-frac(bp) * 6);
    sparrow(ex + 380, ey - 40 + Math.sin(bp * TAU + 1) * 10, 1.2, { flap: bp * 2 + .6, dir: -1, open: ch, eyes: 'happy', rot: .1, bib: true });
    if (ch > .3 && beatN(t) % 2 === 0) txt('♪', ex + 320, ey - 160 - ch * 20, 60, PAL.ink, { font: 'Shantell', alpha: ch });
    camEnd();
  }
  function fableFlock(t, lt, dur) { style(0); bookEdit(t); fableFlockPaint(t, lt); }

  // ---------- b12–16 · home on the branch: the others celebrate; one bespectacled sparrow worries about owls ----------
  const NEST = [1330, 650], WORRIER = [500, 812, 3.4];      // WORRIER: [x, feet y, scale]
  // four partying sparrows around the nest: [x, y (feet), scale, dir, hop phase]
  const PARTY = [[1020, 790, 1.2, 1, 0], [1640, 735, 1.15, -1, .5], [1500, 600, 1.0, -1, .25], [1150, 620, .95, 1, .75]];
  function branchScene(t, lt, o = {}) {
    const lb = LB(lt), bp = bpOf(t), lw = o.lw ?? 1;
    fableSky(t, 1.75, [1500, 960], { sunR: 0 });
    paintMoon(1660, 210, 80, {});
    cloud(1000, 150, 420, 110, 23, { under: '#6A5A9A', body: '#E4D2EA', alpha: .75 });
    cloud(1880, 420, 460, 130, 29, { under: '#8A5A98', body: '#F2D4DC', rim: '#FFD2B0', rimX: -.3, alpha: .8 });
    fableHills(t, 1.8, { y: 1040, near: false });
    // the branch, heavy with leaves and blossom, sweeping in from the left
    const spine = [[-200, 1010], [300, 912], [700, 842], [1100, 786], [1500, 746], [1900, 700], [2300, 650]];
    paint(ribbon(spine, u => 74 - u * 44), { fill: '#7A5238', shade: '#43291C', light: [0, -.35], ink: PAL.ink, sw: 2.4 * lw, curv: .5, wet: 2.5 });
    for (let i = 0; i < 9; i++) { const u = .06 + i * .1, k = Math.floor(u * 6), f = u * 6 - k, [ax, ay] = spine[k], [bx, by] = spine[k + 1], px = lerp(ax, bx, f), py = lerp(ay, by, f); line([[px - 40, py - 10 + hash(i) * 20], [px + 30, py - 14 + hash(i * 3) * 24]], 2 * lw, '#43291C', .5, .5); }
    const twig = (x0, y0, x1, y1) => line([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 - 20], [x1, y1]], 7 * lw, '#6A4630', .5);
    twig(860, 820, 760, 640); twig(1760, 718, 1900, 560); twig(240, 925, 130, 720);
    const leaf = (x, y, sz, a, col) => { const pts = xform([[0, 0], [sz * .45, -sz * .24], [sz, 0], [sz * .45, sz * .24]], x, y, 1, a + Math.sin(t * 1.6 + x) * .06); paint(pts, { fill: col, shade: '#2E5A34', ink: PAL.ink, sw: 1.3 * lw, curv: .4, wet: 1.5 }); line([pts[0], pts[2]], 1 * lw, '#2E5A34', 0, .6); };
    const LEAVES = [[760, 640, 96, -2.4], [752, 660, 84, -1.1], [1900, 560, 100, -.6], [1890, 572, 88, -2.2], [130, 720, 94, -2.1], [142, 732, 84, -.9], [930, 800, 74, 2.6], [2000, 690, 94, .5], [60, 990, 96, 2.2], [1700, 730, 74, 2.0], [1180, 790, 70, 2.3]];
    LEAVES.forEach(([x, y, sz, a], i) => leaf(x, y, sz, a, ['#6FA35E', '#88B868', '#5E9050'][i % 3]));
    const blossom = (x, y, r) => { for (let p = 0; p < 5; p++) { const a = p / 5 * TAU + x; paint(ellPts(x + Math.cos(a) * r * .6, y + Math.sin(a) * r * .6, r * .52, r * .4, 10, 0, a), { fill: '#F6C2CC', ink: PAL.ink, sw: .9 * lw, alpha: .95, wet: .8 }); } paint(ellPts(x, y, r * .3, r * .3, 8), { fill: PAL.ochre, ink: null, flat: true }); };
    [[780, 620, 24], [1880, 540, 26], [116, 700, 22], [2030, 676, 20], [910, 790, 18], [736, 676, 18]].forEach(([x, y, r]) => blossom(x, y, r));
    // nest + egg + the party
    const [nx, ny] = NEST;
    owlEgg(nx, ny - 48, 132, { rot: .04 + Math.sin(bp * Math.PI) * .03 });
    nest(nx, ny, 380, 112, lw);
    PARTY.forEach(([px, py, s, dr, ph], i) => {
      const hop = Math.abs(Math.sin((bp + ph) * Math.PI)), up = hop * 34 * s;
      sparrow(px, py - 50 * s - up, s, { dir: dr, flap: i % 2 === 0 ? bp * 2 + ph : null, eyes: 'happy', open: .4 + .6 * hop, sq: -.08 * hop + .06 * (1 - hop), bib: i % 2 === 1, rot: dr * -.12 });
      const nk = frac(bp + ph); if (nk < .7) txt(i % 2 ? '♫' : '♪', px + dr * 60 * s, py - 150 * s - nk * 70, 44 * s + 12, '#FFF3D6', { font: 'Shantell', alpha: 1 - nk / .7, rot: dr * .2, stroke: '#3A2E5A', sw: 4 });
    });
    // falling petals
    for (let i = 0; i < 12; i++) { const u = frac(lt * .35 + hash(i * 2.7)), px = 700 + hash(i * 5.1) * 1300 + Math.sin(u * 9 + i) * 40, py = 250 + u * 700; paint(ellPts(px, py, 9, 5, 8, 0, u * 8 + i), { fill: '#F6C2CC', ink: PAL.ink, sw: .8, alpha: .9 * Math.sin(u * Math.PI), flat: true }); }
    // the worrier, front and close: round glasses, a tiny book, and a very big owl on its mind
    const [wx, wy, ws] = WORRIER, tr = Math.sin(t * 38) * 1.4 * (o.shiver ?? 1);
    sparrowFront(wx + tr, wy - 48 * ws, ws, { glasses: true, book: true, eyes: 'worried', sweat: seg(lb, 1.2, 1.6), lw: o.wlw ?? lw, look: [.2, -.35] });
    thought(470, 205, 580, 360, wx - 70, wy - 124 * ws - 14, P(lb, .5, 3), () => {
      // what it grows into: a looming owl, and a nest of tiny sparrows at its feet
      wash(ellPts(0, 60, 280, 170, 16), '#6E66A0', .5, 10, 2);
      owlSilhouette(-30, 40 + Math.sin(t * 2) * 4, 2.1 + .06 * Math.sin(bp * TAU), t, { look: .6, blink: lb > 2.9 && lb < 3.05 });
      for (const [sx, sd] of [[150, -1], [205, -1], [178, 1]]) { X.save(); X.translate(sx, 150 - Math.abs(Math.sin((bp + sx) * Math.PI)) * 6); X.scale(sd * .42, .42); paint([[-40, 0], [0, -34], [34, -40], [60, -30], [40, -12], [44, 20], [0, 30], [-60, 10]], { fill: '#2E2A58', ink: null, curv: .5, wet: 1 }); X.restore(); }
    });
  }
  function fableBranchPaint(t, lt, dur) {
    const lb = LB(lt), [wx, wy, ws] = WORRIER;
    // b12–15 a gentle drift; b15–16 push into the glasses for the match cut (lenses end at (960 ± 241, 520), r 210)
    const pk = easeIn(seg(lb, 2.95, 3.78)), Z = lerp(1.02 + lb * .01, 210 / (11 * ws), pk);
    const hx = wx, hy = wy - 48 * ws - 46 * ws;
    const cx = lerp(960 - lb * 10, hx, Math.pow(pk, .6)), cy = lerp(540, hy + 20 / Z, Math.pow(pk, .6));
    X.drawImage(PAPER, 0, 0);
    camBegin(cx, cy, Z, 0);
    branchScene(t, lt, { wlw: LW(Z), shiver: 1 - pk });
    camEnd();
    FX.zblur = Math.max(FX.zblur, .14 * Math.sin(Math.PI * Math.min(1, pk * 1.15)));
  }
  function fableBranch(t, lt, dur) { style(0); bookEdit(t); fableBranchPaint(t, lt, dur); }

  // ======================================================================================================
  // shots
  // ======================================================================================================

  // b16–17 · match cut: the sparrow's round glasses → his round glasses (lenses start at (960 ± 241, 520), r 210),
  //          then a fast pull back to his tired, worried face in the monitor light.
  function glassesMatch(t, lt, dur) {
    style(0);
    const u = clamp(lt / dur), h = 2400, k = h / 100, hx = 960, hcy = 560;
    const Z0 = 210 / (3.4 * k), pb = expoOut(u * 1.15), Z = lerp(Z0, 1.12, pb) + .05 * u;
    const lensY = hcy + .2 * k, cx = hx, cy = lerp(lensY + 20 / Z0, hcy + 40, pb);
    X.drawImage(PAPER, 0, 0);
    camBegin(cx, cy, Z, 0);
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wallDk, .94, 26, 3);
    blooms(-100, -100, 2100, 1300, PAL.night, 6, .16, 51);
    glow(1640, 120, 700, C.lamp, .35, 'source-over');
    sticky(330, 270, 150, C.note[1], 'delve??', -.1, .24);
    hero(hx, hcy + .89 * h, h, { view: 'front', eyes: 'tired', mouth: 'flat', brows: 'worried', lookY: .15 });
    glow(hx, hcy + 60, 900, C.teal, .24, 'source-over');
    // the monitor reflected in both lenses: a teal pane with rows of results
    for (const s of [-1, 1]) {
      const lx = hx + s * 3.9 * k, ly = lensY;
      X.save(); tracePath(X, ellPts(lx, ly, 3.4 * k, 3.2 * k, 28)); X.clip();
      X.globalAlpha = .22; X.fillStyle = '#7FE0D2'; X.fillRect(lx - 4 * k, ly - 4 * k, 8 * k, 8 * k);
      for (let r = 0; r < 5; r++) { X.globalAlpha = .35; X.fillStyle = r === 2 ? C.bad : '#DFFFF6'; X.fillRect(lx - 2.2 * k, ly - 2 * k + r * .8 * k, (1.2 + hash(r * 3 + s) * 2.2) * k, .28 * k); }
      X.globalAlpha = 1;
      line([[lx - 2.2 * k, ly + 1.4 * k], [lx - .4 * k, ly - 1.8 * k]], .3 * k, '#FFFFFF', 0, .55);
      X.restore();
      line(ellPts(lx, ly, 3.4 * k, 3.2 * k, 48), .09 * k, PAL.ink, .5, .9, true);
    }
    camEnd();
  }

  // b17–20 · the desk from behind: the lab, the moon photo, the sticky notes and the shelf. Rows refresh on b17 and b19; a sip.
  function deskWide(t, lt, dur) {
    style(0);
    const lb = LB(lt), k = easeInOut(clamp(lt / (3 * BEAT)));
    const rl = lb < 2 ? lb : lb - 2, rev = rl * 22, fl = Math.exp(-rl * 8);
    const up = kf(lb, [[.7, 0], [1.2, 1], [2.2, 1], [2.75, 0]], easeInOut);
    X.drawImage(PAPER, 0, 0);
    camBegin(lerp(960, 1000, k), lerp(540, 480, k), lerp(1, 1.1, k));
    labBack(t, {
      screenC: (x, y, w, h) => { harness(x, y, w, h, t, { reveal: rev, state: i => RESULTS[i], loss: clamp(.35 + rl * .3), grok: 0, prog: 1 }); X.globalAlpha = .5 * fl; X.fillStyle = '#E8FFF8'; X.fillRect(x, y, w, h); X.globalAlpha = 1; },
      screenL: (x, y, w, h) => { logScreen(x, y, w, h, t); X.globalAlpha = .4 * fl; X.fillStyle = '#E8FFF8'; X.fillRect(x, y, w, h); X.globalAlpha = 1; },
      screenR: (x, y, w, h) => { dashScreen(x, y, w, h, t, { gen: lb < 2 ? 0 : 1 }); X.globalAlpha = .4 * fl; X.fillStyle = '#E8FFF8'; X.fillRect(x, y, w, h); X.globalAlpha = 1; },
      mugOnDesk: up < .05,
      hero: {
        aR: [lerp(.28, 1.72, up), lerp(-.25, 2.3, up)], tilt: -.1 * up + .03 * Math.sin(lb * Math.PI) * (1 - up), dy: -5 * Math.exp(-frac(lb) * 6) * (1 - up),
        handR: up > .05 ? () => { const m = X.getTransform(); X.rotate(-Math.atan2(m.b, m.a)); mug(-2.5, 5, .15, t, { sw: .24 }); } : null
      }
    });
    camEnd();
  }

  // b20–24 · monitor close-up: shibboleth tests tick ✓/✗ on the eighths; the loss plateaus... b22 punch in on the chart,
  //          b23 it falls off a cliff: grokking.
  const grokK = lb => lb < 2.9 ? .7 * lb / 2.9 : lb < 3.1 ? .7 + .1 * (lb - 2.9) / .2 : .8 + .2 * clamp((lb - 3.1) / .7);
  function harnessClose(t, lt, dur) {
    style(0);
    const lb = LB(lt), done = Math.floor(lb * 2 + .001) + 1;
    const st = i => i < done ? RESULTS[i] : i === done ? 0 : null;
    const pin = lb >= 2 ? 1 : 0, dr = (lb - pin * 2) * .01;
    const cliff = P(lb, 3, 5), gk = P(lb, 3.05, 4);
    X.drawImage(PAPER, 0, 0);
    camBegin(pin ? 1330 + (lb - 2) * 6 : 960 + lb * 4, pin ? 430 : 540, (pin ? 1.62 : 1.03) + dr, pin ? .025 : -.01);
    wash(rectPts(-200, -200, 2320, 1480, 20), C.wallDk, .9, 26, 3);
    glow(1700, 100, 900, C.lamp, .3, 'source-over');
    monitor(170, 100, 1580, 870, { stand: false, glowR: .7 }, (x, y, w, h) => {
      harness(x, y, w, h, t, { state: st, loss: grokK(lb), grok: gk, prog: clamp(done / 8) });
      glare(x, y, w, h);
    });
    sticky(215, 160, 150, C.note[1], 'delve??', -.12);
    sticky(1720, 900, 130, C.note[0], 'p(doom)?', .1, .21);
    camEnd();
    if (cliff > 0 && cliff < 1) FX.shake += 10 * (1 - cliff);
  }

  // b24–30 · the model hatches: over the shoulder, an egg icon on the monitor wobbles (b24, b24.5), cracks (b25) and on b26
  //          the smiley mask pops out of the shell (a callback to the owl egg). A chat line types: "Certainly! Let's delve into…".
  //          b28: "You're absolutely right!"
  function maskHatch(t, lt, dur) {
    style(0);
    const lb = LB(lt), k = easeInOut(clamp(lt / dur));
    const ex = L.monC.x + L.monC.w * .64, ey = L.monC.y + L.monC.h * .43, er = 58;
    const eggIn = BO(lb, 0, 5), wob = lb < 2 ? Math.sin(lb * TAU * 2) * .18 * Math.exp(-frac(lb * 2) * 3) : 0;
    const crack = seg(lb, 1, 1.4), hatch = P(lb, 2, 5), pop = BO(lb, 2, 3.5);
    const blink = lb > 2.9 && lb < 3.1, look = lb < 2.7 ? [0, -.3] : lb < 3.8 ? [-1, .7] : [-.5, .4], talk = lb >= 4;
    const mr = 52 * (talk ? 1 + .06 * pulse(t, 5) : 1);
    X.drawImage(PAPER, 0, 0);
    const cx = 1080 + k * 20, cy = 430, z = 2.1 + k * .12;
    camBegin(cx, cy, z);
    labBack(t, {
      heroX: 820, hero: { tilt: .05 - .06 * clamp(lb - 2), dy: lb >= 2 && lb < 2.4 ? -6 : 0 },
      screenC: (x, y, w, h) => {
        harness(x, y, w, h, t, { state: i => RESULTS[i], loss: 1, prog: 1, alpha: .22 });
        X.globalAlpha = .5; X.fillStyle = C.scrDk; X.fillRect(x, y, w, h); X.globalAlpha = 1;
        glow(ex, ey, 150 * (.6 + .4 * eggIn), '#FFF1B0', .35 * eggIn, 'source-over');
        if (hatch <= 0) owlEgg(ex, ey + 6, er * eggIn, { rot: wob, crack, lw: .8, speckles: 22 });
        else {
          // the shell splits: the top flies off up-right, spinning; the smiley pops out of the bottom half
          const fly = easeOut(hatch);
          owlEgg(ex + 70 * fly, ey + 6 - 90 * fly + 60 * fly * fly, er, { part: 'top', rot: 1.6 * fly, lw: .5, speckles: 22, alpha: 1 - seg(lb, 2.6, 3) });
          const mcy = ey - 10 - 34 * pop;
          mask(ex, mcy, mr * pop, { eyes: blink ? 'closed' : talk ? 'happy' : 'open', mouth: talk ? 'grin' : lb < 2.7 ? 'o' : 'smile', look, rot: (talk ? .08 * Math.sin(t * 9) : 0) - .15 * (1 - pop) });
          owlEgg(ex, ey + 6, er, { part: 'bottom', lw: .5, speckles: 22 });
          for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42, d = 40 + 70 * fly; paint(starPts(ex + Math.cos(a) * d, ey - 20 + Math.sin(a) * d, 7 * (1 - seg(lb, 2.3, 2.9)), .4, 4), { fill: '#FFF1C4', ink: null, flat: true }); }
        }
        // the chat line types itself out
        const ty = seg(lb, 2.6, 3.7), msg = "Certainly! Let's delve into…", n = Math.floor(msg.length * ty);
        if (n > 0) {
          paint(rrPts(x + w * .36, y + h * .8, w * .6, h * .13, h * .05), { fill: '#2E5560', ink: C.scrDim, sw: .8, flat: true });
          txt(msg.slice(0, n) + (frac(lb * 2) < .5 && ty < 1 ? '▌' : ''), x + w * .39, y + h * .868, h * .062, C.scrTx, { font: 'Rajdhani', align: 'left' });
        }
      }
    });
    camEnd();
    const [sx, sy] = [960 + (ex - cx) * z, 540 + (ey - 40 - cy) * z];
    bubble(700, 230, 920, 160, sx - mr * z * .9, sy, "You're absolutely right!", 56, P(lb, 4, 4), { rot: -.04 });
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
    sticky(260, 190, 150, C.note[2], 'bitter\nlesson', -.1, .22);
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
    sticky(1860, 200, 124, C.note[2], 'stack more\nlayers', .08, .19);
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

  // ======================================================================================================
  // the break (b64–72): an em-dash mindworm goes in through his ear, and the first neon spreads through his brain
  // ======================================================================================================
  // a head-local point on a side-view hero (units, facing +x before the flip; no lean / tilt / rot) → world
  const headPt = (hx, gy, h, flip, px, py) => { const k = h / 100; return [hx + (flip ? -1 : 1) * (1 + px) * k, gy - 89 * k + py * k]; };
  // the worm's route: out from under the lab-coat collar, up the back of the neck, along the jaw and into the ear canal
  const WORM_PATH = [[-3.6, 17], [-3.6, 14.4], [-3.55, 11.6], [-3.4, 8.8], [-3.15, 6.4], [-2.8, 4.3], [-2.25, 2.4]];
  const cumLen = p => { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; };
  function pathAt(p, c, d) {
    d = clamp(d, 0, c[c.length - 1]); let i = 1; while (i < c.length - 1 && c[i] < d) i++;
    const f = (d - c[i - 1]) / ((c[i] - c[i - 1]) || 1), [ax, ay] = p[i - 1], [bx, by] = p[i];
    return [ax + (bx - ax) * f, ay + (by - ay) * f, Math.atan2(by - ay, bx - ax)];
  }
  // the big em-dash mindworm crawling along a world-space path. head = arc length of its head (px), len = body length,
  // w = half thickness. Only the stretch on [0, pathLength] shows (the rest is under the collar / inside the ear).
  // o.look: pupils [x, y] (screen-ish), o.eyeGlow: neon cyan eyes (0..1)
  function crawlWorm(path, head, len, w, t, o = {}) {
    const c = cumLen(path), L = c[c.length - 1], s0 = Math.max(0, head - len), s1 = Math.min(L, head);
    if (s1 - s0 < w * .3) return;
    const n = 22, sp = [], ws = [];
    for (let i = 0; i <= n; i++) {
      const d = lerp(s0, s1, i / n), [x, y, a] = pathAt(path, c, d), q = (d - (head - len)) / len;
      const wig = Math.sin(q * 8 - t * 13 + (o.seed || 0)) * w * .55 * (o.wig ?? 1);
      sp.push([x - Math.sin(a) * wig, y + Math.cos(a) * wig]);
      ws.push(w * (q < .1 ? .6 + q * 4 : q > .9 ? .6 + (1 - q) * 4 : 1));
    }
    const body = limbPts(sp, ws, 6);
    paint(xform(body, w * .35, w * .5), { fill: '#3A2230', ink: null, alpha: .22 * (o.alpha ?? 1), wet: w * .1, layers: 1 });
    paint(body, { fill: PAL.ink, ink: null, alpha: o.alpha ?? 1, wet: w * .05, layers: 2, op: 1 });
    paint(body, { fill: '#221A2A', ink: null, flat: true, alpha: .7 * (o.alpha ?? 1) });
    line(sp.slice(2, -2).map(([x, y], i) => [x - w * .25, y - w * .42]), w * .16, '#6A5A88', .5, .55 * (o.alpha ?? 1));
    if (s1 >= head - .5) {
      // googly eyes at the head end
      const [hx, hy] = sp[n - 2], [px, py] = sp[n - 3], a = Math.atan2(hy - py, hx - px), lk = o.look || [Math.cos(a) * .5, Math.sin(a) * .5];
      for (const e of [-1, 1]) {
        const ex = hx - Math.sin(a) * e * w * .78, ey = hy + Math.cos(a) * e * w * .78, er = w * .74;
        paint(ellPts(ex, ey, er, er, 16), { fill: '#FFFFFF', ink: PAL.ink, sw: w * .06, flat: true, alpha: o.alpha ?? 1 });
        if (o.eyeGlow) { glow(ex, ey, er * 3, PAL.nCyan, .5 * o.eyeGlow, 'lighter'); paint(ellPts(ex + lk[0] * er * .35, ey + lk[1] * er * .35, er * .5, er * .5, 12), { fill: PAL.nCyan, ink: null, flat: true, alpha: o.eyeGlow }); }
        else paint(ellPts(ex + lk[0] * er * .4, ey + lk[1] * er * .4, er * .45, er * .45, 12), { fill: PAL.ink, ink: null, flat: true, alpha: o.alpha ?? 1 });
      }
    }
  }
  // his ear in side view (head-local units, facing +x), drawn as world shapes via W(px, py); front: just the tragus flap
  function sideEar(W, k, front = false) {
    const M = pts => pts.map(([a, b]) => W(a, b));
    if (front) { paint(M([[-1.5, 1.7], [-1.2, 2.3], [-1.3, 3.0], [-1.85, 2.85]]), { fill: HERO.skin, ink: null, curv: .5, wet: .02 * k, layers: 2, op: 1 }); line(M([[-1.25, 2.0], [-1.2, 2.5], [-1.35, 2.95]]), .045 * k, '#B8805E', .5, .8); return; }
    const ear = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, sn = Math.sin(a); ear.push([-2.75 + Math.cos(a) * 1.85 * (1 - .18 * sn), 1.9 + sn * 2.8]); }
    paint(M(ear), { fill: HERO.skin, shade: HERO.skinDk, light: [.25, -.2], ink: PAL.ink, sw: .055 * k, curv: .5, wet: .03 * k });
    wash(M(ellPts(-2.5, 2.2, .95, 1.45, 14)), HERO.skinDk, .45, .05 * k, 2);
    line(M([[-2.1, -.55], [-3.5, -.45], [-4.15, 1.2], [-3.9, 3.3], [-3.1, 4.2]]), .06 * k, '#B8805E', .5, .9);
    paint(M(ellPts(-2.2, 2.35, .4, .52, 12)), { fill: '#4A2228', ink: null, curv: .5, wet: .02 * k, layers: 2 });
  }

  // b64–66 · he turns from the screen to the window and the painted moon. Unnoticed, an em-dash peeks out of his collar.
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
    const h = 1700, hx = 1330, gy = 470 + .89 * h;
    hero(hx, gy, h, turned
      ? { view: 'side', flip: true, eyes: 'open', mouth: lb > 1.3 ? 'smile' : 'o', lookY: -.6, aL: [.05, .1], aR: [.05, .1] }
      : { view: 'q', eyes: 'tired', mouth: 'flat', lookX: .6, aL: [.1, .1], aR: [.1, .1] });
    if (turned) {
      glow(hx - 200, 450, 520, PAL.cream, .22, 'source-over');
      // the worm: peeks over the collar at the back of his neck, looks at us
      const pe = easeOut(seg(lb, 1.25, 1.75)), kk = h / 100, path = WORM_PATH.map(([a, b]) => headPt(hx, gy, h, true, a, b));
      if (pe > 0) { X.save(); X.beginPath(); X.rect(0, 0, 2000, gy - 74.6 * kk); X.clip(); crawlWorm(path, 1.2 * kk + pe * 3.2 * kk, 6.8 * kk, .46 * kk, t, { look: lb > 1.6 ? [.9, .1] : null, seed: 2 }); X.restore(); }
    }
    camEnd();
  }

  // b66–68 · close side profile: the mindworm slithers up out of his collar, pauses at his ear to look at us, and goes in.
  function wormEar(t, lt, dur) {
    style(0);
    const lb = LB(lt), h = 3400, k = h / 100, earX = 1080, earY = 450;
    const hx = earX - 1.7 * k, gy = earY + 87.2 * k, W = (a, b) => headPt(hx, gy, h, true, a, b);
    const path = WORM_PATH.map(([a, b]) => W(a, b)), L = cumLen(path).pop(), len = 6.8 * k;
    // crawl up (b66 → b66.8), pause and look at us, then slurp in (b67.15 → b67.85)
    const head = lb < .8 ? lerp(L * .45, L - .5 * k, easeInOut(lb / .8)) : lb < 1.15 ? L - .5 * k + Math.sin((lb - .8) * 18) * .15 * k : lerp(L - .5 * k, L + len + 10, easeIn(seg(lb, 1.15, 1.85)));
    const inside = lb > 1.85, zk = easeInOut(clamp(lb / 2));
    X.drawImage(PAPER, 0, 0);
    camBegin(lerp(1020, earX - 10, zk), lerp(640, earY + 110, zk), 1.25 + .25 * zk);
    // the dark room, moonlight pouring in from the window on the left
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wallDk, .96, 26, 3);
    blooms(-100, -100, 2100, 1300, PAL.night, 7, .2, 61);
    glow(-120, 380, 1300, '#FFF0D0', .32, 'source-over');
    glow(200, 300, 520, '#FFF6E6', .18, 'source-over');
    hero(hx, gy, h, { view: 'side', flip: true, eyes: inside ? (lb < 1.93 ? 'closed' : 'wide') : 'open', lookY: -.6, lookX: .2, mouth: inside ? 'flat' : 'smile', brows: inside ? 'up' : 'flat', aL: [.05, .1], aR: [.05, .1] });
    // moonlight on his face, a soft cool shadow on the back of his head
    glow(W(8, -2)[0], W(8, -2)[1], 11 * k, '#FFF3DA', .22, 'source-over');
    wash(ellPts(...W(-8, -2), 5 * k, 9 * k, 16), '#1A1C44', .22, 20, 2);
    wash(ellPts(...W(-6.5, 9), 5.5 * k, 12 * k, 18), '#1A1C44', .2, 24, 2);
    sideEar(W, k);
    X.save(); X.beginPath(); X.rect(-400, -400, 2800, gy - 74.6 * k + 400); X.clip();
    crawlWorm(path, head, len, .46 * k, onTwos(t), { look: lb > .85 && lb < 1.2 ? [.95, .15] : null, wig: lb > .8 && lb < 1.15 ? .2 : .45, seed: 2 });
    X.restore();
    sideEar(W, k, true);
    if (inside) FX.shake += 6 * Math.exp(-(lb - 1.85) * 10);
    camEnd();
    vignette('#0B0A24', .35 + .3 * zk);
  }

  // b68–70 · the picture-book cross-section of his head: the worm burrows up the ear canal into his brain and neon cyan
  //          circuitry spreads out from it (the first real neon in the film), reaching his eye as the shot ends.
  const BRAIN = { cx: -1.3, cy: -6.7, rx: 8.0, ry: 5.7 }, ROOT = [-2.1, -2.7];
  const CANAL = [[-2.2, 2.35], [-2.6, .9], [-2.5, -.7], [-2.1, -2.7]];
  const TRACES = (() => {
    const segs = [], pads = [];
    const inside = (x, y) => Math.pow((x - BRAIN.cx) / (BRAIN.rx * .88), 2) + Math.pow((y - BRAIN.cy) / (BRAIN.ry * .86), 2) < 1;
    let id = 0;
    const grow = (x, y, dir, d, depth) => {
      for (let step = 0; step < 7; step++) {
        const Ls = .9 + hash(id++ * 3.7 + .3) * 1.2, a = dir * Math.PI / 4, nx = x + Math.cos(a) * Ls, ny = y + Math.sin(a) * Ls;
        if (!inside(nx, ny)) break;
        segs.push([x, y, nx, ny, d, d + Ls]); x = nx; y = ny; d += Ls;
        if (depth < 2 && hash(id++ * 5.1 + .7) < .5) grow(x, y, dir + (hash(id++ * 1.3) < .5 ? 1 : -1), d, depth + 1);
        if (hash(id++ * 2.3 + .1) < .45) dir += hash(id++ * 7.7) < .5 ? 1 : -1;
      }
      pads.push([x, y, d]);
    };
    for (const dir of [-2, -3, -1, -4, 0, -2, -3, -1, -2]) grow(ROOT[0], ROOT[1], dir, 0, 0);
    // one trace runs forward and down to the eye
    segs.push([ROOT[0], ROOT[1], 1.2, -2.7, 0, 3.3], [1.2, -2.7, 3.6, -1.2, 3.3, 6.1], [3.6, -1.2, 5.1, 0, 6.1, 8.0]);
    return { segs, pads };
  })();
  function brainSection(t, lt, dur) {
    style(0);
    const lb = LB(lt), h = 4000, k = h / 100, hx = 1040, gy = 620 + 89 * k, W = (a, b) => headPt(hx, gy, h, true, a, b), M = pts => pts.map(([a, b]) => W(a, b));
    const g = 15 * (easeOut(seg(lb, .45, .95)) * .3 + easeInOut(seg(lb, 1, 1.9)) * .7), gk = clamp(g / 15), surge = lb >= 1 ? Math.exp(-(lb - 1) * 5) : 0;
    const zk = easeInOut(clamp(lb / 2));
    X.drawImage(PAPER, 0, 0);
    camBegin(lerp(1000, 1030, zk), lerp(540, 470, zk), 1 + .12 * zk);
    // a picture-book page: warm paper, a lavender wash; it darkens as the neon takes hold
    wash(rectPts(-300, -300, 2520, 1700, 20), '#B8B0D8', .5, 30, 3);
    blooms(-100, -100, 2100, 1300, PAL.violet, 6, .12, 71);
    wash(rectPts(-300, -300, 2520, 1700, 20), '#141436', .75 * gk, 30, 2);
    hero(hx, gy, h, { view: 'side', flip: true, eyes: 'wide', lookY: -.3, mouth: 'flat', brows: 'up', aL: [.05, .1], aR: [.05, .1] });
    // the cutaway: bone rim, dark cavity, a round pink brain with folds
    const B = BRAIN, brainPts = [];
    for (let i = 0; i < 44; i++) { const a = i / 44 * TAU, r = 1 + .035 * Math.sin(a * 9) + .02 * Math.sin(a * 5 + 1); brainPts.push([B.cx + Math.cos(a) * B.rx * .9 * r, B.cy + Math.sin(a) * B.ry * .88 * r]); }
    paint(M(ellPts(B.cx, B.cy, B.rx + .7, B.ry + .7, 40)), { fill: '#F4E8CE', shade: '#CDB98E', ink: PAL.ink, sw: .07 * k, wet: .05 * k, light: [.1, -.2] });
    paint(M(ellPts(B.cx, B.cy, B.rx, B.ry, 40)), { fill: '#4A2A40', ink: PAL.ink, sw: .04 * k, wet: .03 * k });
    paint(M(ribbon(CANAL, () => .6)), { fill: '#E3949F', shade: '#B8687E', ink: PAL.ink, sw: .04 * k, curv: .5, wet: .02 * k });
    paint(M(ellPts(-6.0, -3.5, 1.8, 1.0, 18, 0, .25)), { fill: '#E88EA4', shade: '#B45A78', ink: PAL.ink, sw: .05 * k, wet: .03 * k });
    for (let i = 0; i < 3; i++) line(M([[-7.3, -3.7 + i * .4], [-6.0, -4.0 + i * .45], [-4.7, -3.5 + i * .4]]), .045 * k, '#B45A78', .5, .7);
    paint(M(brainPts), { fill: '#F4AABA', shade: '#C46A86', light: [-.1, -.2], ink: PAL.ink, sw: .06 * k, curv: .5, wet: .05 * k });

    for (let i = 0; i < 11; i++) {
      const y0 = B.cy - B.ry * .7 + i * B.ry * .14, half = B.rx * .8 * Math.sqrt(Math.max(0, 1 - Math.pow((y0 - B.cy) / (B.ry * .85), 2))), pts = [];
      for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([B.cx - half + u * half * 2, y0 + Math.sin(u * 9 + i * 1.7) * .45 + (hash(i * 3 + j) - .5) * .2]); }
      if (half > 1) line(M(pts), .06 * k, '#C46A86', .6, .75);
    }
    line(M([[B.cx - .2, B.cy - B.ry * .85], [B.cx + .3, B.cy - 2], [B.cx - .1, B.cy + 1.5]]), .07 * k, '#B45A78', .5, .6);
    // the neon: a dark teal stain spreading from the worm, then circuitry, then light
    X.save(); tracePath(X, M(brainPts), .5); X.clip();
    if (g > .1) { const [rx0, ry0] = W(...ROOT); glow(rx0, ry0, (g * 1.05 + 1) * k, '#0C2A3A', .75, 'source-over'); }
    X.restore();
    const drawn = [];
    for (const [x0, y0, x1, y1, d0, d1] of TRACES.segs) {
      if (d0 >= g) continue;
      const f = clamp((g - d0) / (d1 - d0)), p0 = W(x0, y0), p1 = W(lerp(x0, x1, f), lerp(y0, y1, f));
      drawn.push([p0, p1, f < 1]);
      line([p0, p1], .16 * k, '#0A2E3A', 0, .8);
    }
    const nA = .75 + .25 * Math.sin(t * 40) * (1 - gk * .5) + surge * .5;
    for (const [p0, p1, front] of drawn) { neonLine([p0, p1], PAL.nCyan, .075 * k, clamp(nA), 0); if (front) glow(p1[0], p1[1], .9 * k, PAL.nCyan, .55, 'lighter'); }
    for (const [px, py, d] of TRACES.pads) if (d < g) { const [wx, wy] = W(px, py); paint(ellPts(wx, wy, .22 * k, .22 * k, 10), { fill: '#0A2E3A', ink: null, flat: true }); paint(ellPts(wx, wy, .13 * k, .13 * k, 10), { fill: PAL.nCyan, ink: null, flat: true }); glow(wx, wy, .7 * k, PAL.nCyan, .4, 'lighter'); }
    // the worm, burrowing up the canal into the middle of it all; its eyes light up
    const wpath = M([...CANAL, [-1.6, -3.0], [-1.0, -3.2]]), wl = cumLen(wpath).pop();
    const wh = lerp(wl * .35, wl, easeOut(seg(lb, 0, .6)));
    X.save(); tracePath(X, M(ellPts(B.cx, B.cy, B.rx, B.ry, 40))); tracePath(X, M(ribbon(CANAL, () => .6)), .5); X.restore();
    crawlWorm(wpath, wh, 3.6 * k, .38 * k, onTwos(t), { eyeGlow: seg(lb, .35, .6), look: [0, .2], seed: 4, wig: lb < .6 ? 1 : .35 });
    sideEar(W, k); sideEar(W, k, true);
    // his eye catches it last
    const eK = seg(lb, 1.55, 1.9);
    if (eK > 0) { const [ex, ey] = W(5.2, 0); glow(ex, ey, 3.5 * k * eK, PAL.nCyan, .5 * eK, 'lighter'); paint(ellPts(ex, ey, 1.35 * k, 1.9 * k, 16), { fill: PAL.nCyan, ink: null, flat: true, alpha: eK }); paint(ellPts(ex, ey, .45 * k, .7 * k, 12), { fill: '#E8FFFF', ink: null, flat: true, alpha: eK }); }
    camEnd();
    FX.bloom = .5 * gk + .3 * surge;
    FX.rgb = Math.max(FX.rgb, .2 * surge);
  }

  // his neon eye (front view): k = hero body unit (px), a = intensity
  function neonEye(x, y, k, a, t) {
    if (a <= .01) return;
    glow(x, y, 6 * k, PAL.nCyan, .35 * a, 'lighter');
    paint(ellPts(x, y, 1.9 * k, 2.55 * k, 22), { fill: '#051C24', ink: null, flat: true, alpha: a });
    paint(ellPts(x, y, 1.55 * k, 2.2 * k, 22), { fill: PAL.nCyan, ink: null, flat: true, alpha: a });
    paint(ellPts(x, y, 1.05 * k, 1.55 * k, 20), { fill: '#0B5A68', ink: null, flat: true, alpha: a * .8 });
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + t * 2; line([[x + Math.cos(an) * .7 * k, y + Math.sin(an) * 1.05 * k], [x + Math.cos(an) * 1.0 * k, y + Math.sin(an) * 1.45 * k]], .07 * k, '#BFFFFF', 0, a * .9); }
    paint(ellPts(x, y, .5 * k, .78 * k, 14), { fill: '#E8FFFF', ink: null, flat: true, alpha: a });
    glow(x, y, 2.4 * k, '#FFFFFF', .45 * a, 'lighter');
    paint(ellPts(x - .5 * k, y - .9 * k, .32 * k, .38 * k, 8), { fill: '#FFFFFF', ink: null, flat: true, alpha: a });
  }
  // b70–72 · stutter cuts on his eyes flickering neon: left eye / his face (a trace creeps from the ear) / right iris + FEEL THE AGI
  //          (b71) / the last half-beat pushes into his neon eye, which Act II opens on.
  function eyeStutter(t, lt, dur) {
    style(0);
    const lb = LB(lt), part = Math.floor(lb * 2 + 1e-6), pl = lt - part * BEAT / 2, pu = clamp(pl / (BEAT / 2));
    const h = 2600, k = h / 100, hx = 960, hcy = 540, eyeL = [hx - 3.9 * k, hcy], eyeR = [hx + 3.9 * k, hcy];
    const flick = hash(Math.floor(t * 30) * 1.7) < (part === 0 ? .55 : .8) ? 1 : .3, ramp = part === 0 ? clamp(pl * 9) : 1;
    let cx = hx, cy = hcy + 60, z = 1.12 + pu * .06, rot = 0;
    if (part === 0) { [cx, cy] = eyeL; z = 3.3 + pu * .4; rot = -.05; }
    if (part === 2) { [cx, cy] = eyeR; cy += .2 * k; z = 7 + pu * .8; rot = .04; }
    if (part === 3) { cx = lerp(hx - 2.2 * k, eyeL[0], Math.min(1, pu * 1.4)); cy = lerp(hcy + .5 * k, eyeL[1], Math.min(1, pu * 1.4)); z = 2.1 * Math.pow(15, easeIn(pu)); rot = -.07 * (1 - pu); FX.zblur = Math.max(FX.zblur, .3 * pu); }
    X.drawImage(PAPER, 0, 0);
    camBegin(cx, cy, z, rot);
    wash(rectPts(-300, -300, 2520, 1700, 20), C.wallDk, .97, 26, 3);
    glow(160, 180, 900, '#FFF0D0', .14, 'source-over');
    hero(hx, hcy + .89 * h, h, { view: 'front', eyes: 'wide', mouth: 'o', brows: 'up' });
    wash(ellPts(hx, hcy + 200, 900, 700, 20), '#141436', .25, 30, 2);
    // a hint of what's coming: a circuit trace creeps from his ear along the temple toward the eye
    const tr = part === 0 ? 0 : part === 1 ? pu : 1;
    if (tr > 0) {
      const TR = [[-9.4, 2.4], [-8.2, 2.4], [-7.4, 1.2], [-6.2, 1.2]].map(([a, b]) => [hx + a * k, hcy + b * k]), n = 1 + Math.ceil(tr * 3);
      line(TR.slice(0, n), .22 * k, '#0A2E3A', 0, .8); neonLine(TR.slice(0, n), PAL.nCyan, .09 * k, flick, 0);
      paint(ellPts(TR[0][0], TR[0][1], .22 * k, .22 * k, 10), { fill: PAL.nCyan, ink: null, flat: true, alpha: flick });
    }
    for (const [ex, ey] of [eyeL, eyeR]) {
      neonEye(ex, ey, k, flick * ramp, t);
      X.save(); tracePath(X, ellPts(ex, ey + .2 * k, 3.4 * k, 3.2 * k, 40)); X.clip(); X.globalAlpha = .16 * flick * ramp; X.fillStyle = PAL.nCyan; X.fillRect(ex - 4 * k, ey - 4 * k, 8 * k, 8 * k); X.restore(); X.globalAlpha = 1;
      line(ellPts(ex, ey + .2 * k, 3.4 * k, 3.2 * k, 48), .09 * k, PAL.ink, .5, .9, true);
    }
    camEnd();
    FX.bloom = .3 * flick * ramp + (part === 3 ? .3 * pu : 0); FX.punch = 1.5;
    FX.rgb = Math.max(FX.rgb, .3 * Math.exp(-pl * 14));
    if (part === 3) { FX.flash = Math.max(FX.flash, Math.pow(pu, 5) * .55); FX.flashCol = '#BFFFFF'; }
    if (lb >= 1) cap('FEEL THE AGI', 960, 170, 170, '#FFFFFF', { font: 'Anton', stroke: '#000', sw: 170 * .12, glow: PAL.nCyan, pop: clamp(since(t, 71) * 6), track: 6 });
  }

  chapter('lab', 0, bt(72), [
    [0, fableTitle],
    [bt(8), fableFlock],
    [bt(12), fableBranch],
    [bt(16), glassesMatch],
    [bt(17), deskWide],
    [bt(20), harnessClose, { tin: 'zoom', td: .3 }],
    [bt(24), maskHatch],
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
    [bt(66), wormEar],
    [bt(68), brainSection],
    [bt(70), eyeStutter]
  ]);

  // postcards for the callback montages (full frames, no FX side effects)
  POSTCARDS.lab = t => deskWide(t, 1.6 * BEAT, 3 * BEAT);
  POSTCARDS.mask = t => { style(0); maskMonitor(t, { zoom: 1.05, mood: { eyes: 'happy', mouth: 'grin', rot: .06 * Math.sin(t * 4) } }); };
  POSTCARDS.moonphoto = t => photoClose(t, .6, BEAT, { tremble: 0 });
  POSTCARDS.sparrows = t => { style(0); fableFlockPaint(t, 2 * BEAT); };
})();
