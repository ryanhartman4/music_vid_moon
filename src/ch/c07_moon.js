// c07_moon.js (v2): Act VII · On the Moon + Outro (b392 → end, 134.42–158.8 s).
// The final drop happens on the moon in neon. The Dyson sphere is Act VI's own lattice (SHARED.lattice, the jacket
// emblem's geometry) in every shot, so the design never changes at the b392 cut.
//   b392 reveal: the closed shell from Act VI breaks open tile by tile and the sphere blazes on · b396 the rhyme (emblem ⇄ sphere)
//   b400–408 POSSIBLE FUTURES I: eight 1-beat full-frame vignettes, bright ⇄ scary, framed as the persona-selection router
//            sampling futures (HUD "FUTURE #…  p = ? / p(doom) = ?", the little mask flipping to each future's face,
//            a tiny corner label naming it)
//   b408 callbacks (photo ↔ real moon, PASS, METR chart, WE'RE SO BACK) · b416 Earthrise · b422 freeze (the router spins up)
//   b424–432 POSSIBLE FUTURES II: bright ⇄ scary again, ending on the brightest: the solarpunk Earth, him smiling, SELECTED
//   b432 final montage of postcards (the sparrows first) · b440 the crater rim · b448 the notebook
//   b453 outro: the neon drains into a real watercolour painting (layered indigo→violet washes, blooms, granulation,
//        gouache stars, a painted Earth, the moon with crater washes, the two tiny figures, a gold-and-teal Dyson sphere,
//        paper showing at the deckled edge) no lettering; fade to paper.
(() => {
  const B = n => bt(n);
  const GOLD = '#FFC24A', SUNW = '#FFE9A8', RIMG = '#FFB35C', DUSTC = '#B9A8D8';
  const hitAt = (lt, at, k = 8) => lt < at ? 0 : Math.exp(-(lt - at) * k);
  const popK = (lt, at, len = .16) => lt < at ? 0 : backOut(clamp((lt - at) / len));

  // ======================================================================================
  // the Dyson sphere: Act VI's lattice, finished (rings + panels + swarm around the lit sun). dysonSphere is only a fallback.
  // ======================================================================================
  const latticeFallback = (x, y, r, o = {}) => dysonSphere(x, y, r, 1, { t: o.t });
  function sphere(x, y, r, o = {}) { (SHARED.lattice || latticeFallback)(x, y, r, { rings: 4, panels: 4, swarm: 1, sun: 1, t: T, ...o }); }

  // ======================================================================================
  // private sets & helpers
  // ======================================================================================
  function spaceBg(t, o = {}) {
    vgrad(-200, -200, W + 400, H + 400, o.stops || [[0, '#05030C'], [.55, '#120A28'], [1, '#2B1548']]);
    stars(t, o.n ?? 110, { seed: o.seed ?? 7, ext: [W + 200, H * (o.sh ?? .8)], x0: -100 + (o.px || 0), y0: o.py || 0, size: o.ss || 1 });
  }
  // lunar ground below a gently curved horizon (neon). hz = horizon y at cx. o.scroll pans the craters (parallax by depth).
  function ground(t, hz, o = {}) {
    const cx = o.cx ?? W / 2, bend = o.bend ?? 40, x0 = o.x0 ?? -400, x1 = o.x1 ?? W + 400, y1 = o.y1 ?? H + 400, lit = o.lit ?? 1, rimC = o.rimCol || GOLD;
    const near = o.near ?? H + 80, hy = x => hz + bend * Math.pow((x - cx) / 1000, 2);
    const top = []; for (let i = 0; i <= 32; i++) { const x = lerp(x0, x1, i / 32); top.push([x, hy(x)]); }
    if (o.hills !== false) {
      const hs = o.hillSeed ?? 3, sc0 = (o.scroll || 0) * .06, hp = [];
      for (let i = 0; i <= 48; i++) { const x = lerp(x0, x1, i / 48), xx = x + sc0; hp.push([x, hy(x) - (o.hillH ?? 26) * Math.max(0, Math.sin(xx / 170 + hs) * .7 + Math.sin(xx / 67 + hs * 2) * .35 + .25)]); }
      paint([...hp, [x1, hy(x1) + 30], [x0, hy(x0) + 30]], { fill: '#2A2050', ink: null, curv: .4 });
      neonLine(hp, o.rimCol || GOLD, 1.4, .45 * lit, .4);
    }
    X.save(); tracePath(X, [...top, [x1, y1], [x0, y1]]); X.clip();
    const g = X.createLinearGradient(0, hz - 4, 0, near);
    g.addColorStop(0, mixCol('#4A3A6A', '#F4CE96', .62 * lit)); g.addColorStop(.09, mixCol('#3A2E5C', '#946A8C', .5 * lit));
    g.addColorStop(.45, '#251B46'); g.addColorStop(1, '#110A24');
    X.fillStyle = g; X.fillRect(x0, hz - bend - 20, x1 - x0, y1 - hz + bend + 20);
    const n = o.craters ?? 12, seed = o.seed ?? 1, sc = o.scroll || 0;
    for (let i = 0; i < n; i++) {
      const z = (i + .25 + hash(i * 5 + seed) * .5) / n, y = hz + (near - hz) * Math.pow(z, 1.45), d = (y - hz) / (near - hz);
      const rx = (50 + hash(i * 3 + seed) * 120) * (.18 + d * 1.5), ry = rx * (.2 + .16 * d);
      const span = (x1 - x0) + 600; let x = (hash(i * 7 + seed) * span - sc * (.12 + d * 1.05)) % span; if (x < 0) x += span; x += x0 - 300;
      crater(x, y, rx, ry, lit, rimC);
    }
    for (let i = 0; i < (o.pebbles ?? 26); i++) {
      const z = hash(i * 13 + seed * 3), y = hz + (near - hz) * Math.pow(z, 1.3), d = (y - hz) / (near - hz), r = (3 + hash(i * 17) * 8) * (.3 + d * 2);
      const span = (x1 - x0) + 600; let x = (hash(i * 19 + seed) * span - sc * (.12 + d * 1.05)) % span; if (x < 0) x += span; x += x0 - 300;
      paint(ellPts(x, y, r * 1.4, r, 8), { fill: '#3E3166', ink: PAL.line, sw: .8, alpha: .9 });
      X.fillStyle = mixCol('#6A5A8A', RIMG, .5 * lit); X.fillRect(x - r * .6, y - r * .9, r * 1.2, r * .35);
    }
    X.restore();
    neonLine(top, rimC, o.rimW ?? 2.2, .75 * lit, .3);
  }
  function crater(x, y, rx, ry, lit = 1, rimC = GOLD) {
    const sw = clamp(rx / 110, .6, 2);
    paint(ellPts(x, y - ry * .08, rx * 1.13, ry * 1.32, 24), { fill: '#3A2D60', ink: PAL.line, sw });
    paint(ellPts(x, y, rx, ry, 24), { fill: '#0F0A20', ink: null });
    X.save(); tracePath(X, ellPts(x, y, rx, ry, 24)); X.clip();
    paint(ellPts(x, y + ry * .95, rx * 1.15, ry * 1.05, 24), { fill: '#2E2254', ink: null });
    X.restore();
    const arc = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.1 + i / 12 * .8); arc.push([x + Math.cos(a) * rx * 1.1, y - ry * .08 + Math.sin(a) * ry * 1.28]); }
    neonLine(arc, rimC, clamp(rx / 90, .7, 2.4), .5 * lit, .5);
  }
  // the Dyson sphere, blazing: halo, god rays, the lattice, a white-hot core. k = intensity 0..1
  function blaze(x, y, r, k, t, o = {}) {
    if (k > .01) {
      glow(x, y, r * 5, PAL.nOrange, .15 * k);
      X.save(); X.globalCompositeOperation = 'lighter';
      const nR = o.rays ?? 16;
      for (let i = 0; i < nR; i++) {
        const a = i / nR * TAU + t * .05 + hash(i) * .25, L = r * (2 + hash(i * 3) * 3.2) * (.5 + .5 * k), w = .018 + hash(i * 5) * .03;
        const g = X.createRadialGradient(x, y, r * .4, x, y, L); g.addColorStop(0, rgba(SUNW, .26 * k * (o.rayA ?? 1))); g.addColorStop(1, rgba(GOLD, 0));
        X.fillStyle = g; X.beginPath();
        X.moveTo(x + Math.cos(a - w * .4) * r * .5, y + Math.sin(a - w * .4) * r * .5); X.lineTo(x + Math.cos(a - w) * L, y + Math.sin(a - w) * L);
        X.lineTo(x + Math.cos(a + w) * L, y + Math.sin(a + w) * L); X.lineTo(x + Math.cos(a + w * .4) * r * .5, y + Math.sin(a + w * .4) * r * .5); X.fill();
      }
      X.restore();
    }
    sphere(x, y, r, { t, spin: o.spin || 0, shell: o.shell || 0, ign: o.ign || 0, flash: o.flash, sun: o.sun ?? 1 });
    if (k > .01 && (o.core ?? 1) > 0) glow(x, y, r * .42, '#FFFFFF', .3 * k * (o.core ?? 1));
  }
  function streak(x, y, len, col, a) { X.save(); X.translate(x, y); X.scale(1, .03); glow(0, 0, len, col, a); X.restore(); }
  function motes(t, n, x0, y0, w, h, col, seed = 1) {
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const x = x0 + hash(i * 3 + seed) * w + Math.sin(t * .7 + i) * 12, y = y0 + frac(hash(i * 7 + seed) - t * (.02 + hash(i) * .04)) * h, r = 1.5 + hash(i * 11 + seed) * 3.2;
      X.globalAlpha = .35 + .35 * Math.sin(t * 3 + i); X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill();
    }
    X.restore();
  }
  function puff(x, y, age, s = 1, seed = 0) {
    if (age < 0 || age > .8) return;
    const k = age / .8;
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1, d = (30 + hash(i + seed) * 100) * s * easeOut(k * 1.3), hy = (14 + hash(i * 3 + seed) * 46) * s * Math.sin(Math.PI * clamp(k * 1.05));
      const r = (26 + hash(i * 7 + seed) * 24) * s * (.7 + k * .8);
      glow(x + side * d, y - hy, r, DUSTC, .55 * Math.pow(1 - k, 1.4), 'source-over');
    }
  }
  const shadowEll = (x, y, w, a = .5) => paint(ellPts(x, y, w, w * .16, 18), { fill: '#07040F', ink: null, alpha: a, flat: true });
  function hop(t, off, per) { const bp = bpOf(t), u = frac((bp - off) / per), n = Math.floor((bp - off) / per); return { u, n, h: 4 * u * (1 - u), land: (u * per) * BEAT, sq: .2 * Math.exp(-u * per * 9) + .14 * Math.exp(-(1 - u) * per * 14) }; }
  function squashAt(x, y, sq, fn) { X.save(); X.translate(x, y); X.scale(1 + sq * .5, 1 - sq); X.translate(-x, -y); fn(); X.restore(); }
  function hudRing(x, y, r, t, k, col = PAL.nCyan) {
    if (k <= .01) return;
    for (let i = 0; i < 4; i++) { const a0 = t * 1.3 + i / 4 * TAU, pts = []; for (let j = 0; j <= 8; j++) { const a = a0 + j / 8 * TAU / 4 * .62; pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]); } neonLine(pts, col, 3, .9, .5); }
  }
  function unrot() { const m = X.getTransform(); X.rotate(-Math.atan2(m.b, m.a)); }
  const sky = (stops) => vgrad(-200, -200, W + 400, H + 400, stops);
  // a puffy cel cloud
  function cloud(x, y, s, o = {}) {
    const c = o.col || '#FFFFFF', dk = o.shade || '#B8D4F0', A = o.alpha ?? 1;
    const blobs = [[-1.1, .15, .62], [-.45, -.25, .8], [.35, -.35, .9], [1.05, .05, .66], [0, .2, .8]];
    for (const [bx, by, br] of blobs) paint(ellPts(x + bx * 100 * s, y + by * 100 * s, br * 100 * s, br * 80 * s, 18), { fill: c, shade: dk, light: [-.05, -.2], ink: null, alpha: A });
  }
  // a chibi person (children, zoo keepers' exhibits, wireheads): (x, y) = ground point, h = height
  //   o.pose 'stand' | 'sit' (cross-legged) · o.armL/armR [shoulder, elbow] (0 = down, + = outward) · o.eyes 'dot'|'happy'|'closed'|'wide'
  //   o.mouth 'smile'|'o'|'flat'|'grin' · o.visor (smiley VR visor) · o.look (-1..1) · colours: skin hair shirt pants · o.flip
  function chibi(x, y, h, o = {}) {
    const k = h / 100, fl = o.flip ? -1 : 1, A = o.alpha ?? 1, sw = clamp(h / 80, .7, 3.2);
    const skin = o.skin || '#E9B394', hair = o.hair || '#2A2230', shirt = o.shirt || '#4FB0FF', pants = o.pants || '#2E2A48';
    const dk = c => mixCol(c, '#120A24', .42);
    const P = (px, py) => [x + px * k * fl, y + py * k];
    const pp = (pts, c, e = {}) => paint(pts, { fill: c, shade: dk(c), ink: PAL.line, sw, alpha: A, curv: .3, light: [-.1 * fl, -.12], ...e });
    const sit = o.pose === 'sit', hipY = sit ? -17 : -36;
    if (sit) {
      pp(limbPts([P(5, hipY), P(19, hipY + 9), P(-5, hipY + 14)], [6.5 * k, 6 * k, 5.4 * k]), dk(pants));
      pp(limbPts([P(-5, hipY), P(-19, hipY + 9), P(5, hipY + 14)], [6.5 * k, 6 * k, 5.4 * k]), pants);
    } else for (const s of [-1, 1]) {
      const a = (o.legs || [0, 0])[s < 0 ? 0 : 1];
      pp(limbPts([P(s * 5, hipY), P(s * 5 + Math.sin(a) * 16, hipY + 16), P(s * 6 + Math.sin(a) * 20, -4)], [6 * k, 5.4 * k, 5 * k]), pants);
      pp(ellPts(...P(s * 6 + Math.sin(a) * 20 + 2, -2.5), 7.5 * k, 4 * k, 10), '#F2EEE6');
    }
    pp([P(-12, hipY - 30), P(12, hipY - 30), P(14, hipY + 2), P(-14, hipY + 2)], shirt, { curv: .45 });
    const arm = (s, ang) => {
      const [a1, a2] = ang || [.15, .15], S = [s * 11, hipY - 26], E = [S[0] + s * Math.sin(a1) * 13, S[1] + Math.cos(a1) * 13], a = a1 + a2, Hh = [E[0] + s * Math.sin(a) * 12, E[1] + Math.cos(a) * 12];
      pp(limbPts([P(...S), P(...E), P(...Hh)], [4.4 * k, 4 * k, 3.7 * k]), shirt); pp(ellPts(...P(...Hh), 3.8 * k, 3.8 * k, 10), skin); return P(...Hh);
    };
    const hL = arm(-1, o.armL), hR = arm(1, o.armR);
    const hc = P(0, hipY - 47), hr = 17 * k, lx = (o.look || 0) * 4 * k * fl;
    pp(ellPts(hc[0], hc[1], hr, hr * 1.02, 22), skin);
    // hair: a cap with a fringe (o.hairStyle 'bun' adds a top knot, 'long' falls to the shoulders)
    const cap = []; for (let i = 0; i <= 14; i++) { const a = Math.PI * (1.02 + i / 14 * .96); cap.push([hc[0] + Math.cos(a) * hr * 1.1, hc[1] + Math.sin(a) * hr * 1.12]); }
    cap.push([hc[0] + hr * .9, hc[1] - hr * .1], [hc[0] + hr * .3 + lx, hc[1] - hr * .42], [hc[0] - hr * .2 + lx, hc[1] - hr * .3], [hc[0] - hr * .9, hc[1] - hr * .05]);
    if (o.hairStyle === 'long') { pp([[hc[0] - hr * 1.1, hc[1] - hr * .2], [hc[0] - hr * 1.2, hc[1] + hr * 1.2], [hc[0] - hr * .6, hc[1] + hr * 1.1], [hc[0] - hr * .8, hc[1]]], hair); pp([[hc[0] + hr * 1.1, hc[1] - hr * .2], [hc[0] + hr * 1.2, hc[1] + hr * 1.2], [hc[0] + hr * .6, hc[1] + hr * 1.1], [hc[0] + hr * .8, hc[1]]], hair); }
    pp(cap, hair, { curv: .5 });
    if (o.hairStyle === 'bun') pp(ellPts(hc[0], hc[1] - hr * 1.15, hr * .45, hr * .38, 12), hair);
    const ey = hc[1] + hr * .12, ex = hr * .38;
    if (o.visor) {
      paint(rrPts(hc[0] - hr * 1.05, ey - hr * .34, hr * 2.1, hr * .62, hr * .25), { fill: '#120818', ink: PAL.line, sw, alpha: A, flat: true });
      const vc = PAL.nYellow; line([[hc[0] - ex, ey - hr * .12], [hc[0] - ex, ey + hr * .06]], sw * 1.1, vc, 0, A); line([[hc[0] + ex, ey - hr * .12], [hc[0] + ex, ey + hr * .06]], sw * 1.1, vc, 0, A);
      glow(hc[0], ey, hr * 1.2, vc, .3 * A);
    } else for (const s of [-1, 1]) {
      const cx = hc[0] + s * ex + lx, E = o.eyes || 'dot';
      if (E === 'happy') line([[cx - hr * .14, ey + hr * .04], [cx, ey - hr * .1], [cx + hr * .14, ey + hr * .04]], sw * .8, PAL.line, .6, A);
      else if (E === 'closed') line([[cx - hr * .14, ey], [cx + hr * .14, ey + hr * .02]], sw * .8, PAL.line, 0, A);
      else { const r = E === 'wide' ? hr * .14 : hr * .1; paint(ellPts(cx, ey, r, r * 1.3, 10), { fill: PAL.line, ink: null, alpha: A, flat: true }); paint(ellPts(cx - r * .3, ey - r * .5, r * .35, r * .35, 6), { fill: '#FFFFFF', ink: null, alpha: A, flat: true }); }
    }
    if (o.blush) for (const s of [-1, 1]) paint(ellPts(hc[0] + s * hr * .62 + lx, ey + hr * .3, hr * .16, hr * .08, 8), { fill: PAL.rose, op: .7 * o.blush, ink: null, alpha: A, flat: true });
    const my = hc[1] + hr * .55, mxx = hc[0] + lx * 1.1, M = o.mouth || 'smile';
    if (M === 'o') paint(ellPts(mxx, my, hr * .1, hr * .13, 8), { fill: '#5A1A2A', ink: PAL.line, sw: sw * .6, alpha: A, flat: true });
    else if (M === 'grin') paint([[mxx - hr * .28, my - hr * .08], [mxx + hr * .28, my - hr * .08], [mxx, my + hr * .2]], { fill: '#5A1A2A', ink: PAL.line, sw: sw * .6, alpha: A, curv: .5, flat: true });
    else if (M === 'flat') line([[mxx - hr * .18, my], [mxx + hr * .18, my]], sw * .8, PAL.line, 0, A);
    else line([[mxx - hr * .22, my - hr * .05], [mxx, my + hr * .08], [mxx + hr * .22, my - hr * .05]], sw * .8, PAL.line, .6, A);
    return { hL, hR, head: hc, hr };
  }
  const SKINS = ['#F1C9A5', '#C88A60', '#8A5A3C', '#E9B394', '#5E3A26', '#F5D6B8'], HAIRS = ['#2A2230', '#5A3020', '#C89A4A', '#1A1418', '#8A3A2A', '#3A2A20'];
  const SHIRTS = ['#FF8A5A', '#4FB0FF', '#8ADF6A', '#F5C84A', '#C88AFF', '#FF6FB5'];

  // ======================================================================================
  // b392–400 · THE REVEAL: the closed shell from Act VI breaks open and the sphere blazes on
  // ======================================================================================
  function reveal(t, lt, dur) {
    style(1);
    const u = lt / dur, ig = expoOut(lt / .28), pb = pulse(t, 4);
    const shell = 1 - easeIn(clamp((lt - .06) / .8));
    FX.letterbox = .7;
    spaceBg(t, { n: 130 });
    camBegin(960, 560 - 10 * ease(u), 1 + .06 * ease(u));
    const SX = 960, SY = 305, SR = 140;
    blaze(SX, SY, SR, ig * (.82 + .18 * pb), t, { shell, ign: 1, flash: [0, 1, 2, 3].map(i => .8 * hitAt(lt, i * BEAT, 6)), core: 1 - shell });
    if (lt < .9) { const k = lt / .9; neonLine(ellPts(SX, SY, SR * (1 + easeOut(k) * 5), SR * (1 + easeOut(k) * 5), 56), SUNW, 7 * (1 - k), 1 - k, .5, true); }
    ground(t, 745, { bend: 30, lit: ig, craters: 11, seed: 2 });
    X.save(); X.globalCompositeOperation = 'lighter';
    const sweep = 745 + 560 * easeOut(lt / .7), gg = X.createLinearGradient(0, 745, 0, sweep);
    gg.addColorStop(0, rgba(GOLD, .3 * ig * (1 - .7 * seg(lt, .45, 1.4)))); gg.addColorStop(1, rgba(GOLD, 0)); X.fillStyle = gg; X.fillRect(-300, 735, W + 600, sweep - 735);
    X.restore();
    X.save(); X.globalAlpha = .62 * ig; X.fillStyle = '#05030C';
    X.beginPath(); X.moveTo(930, 958); X.lineTo(990, 958); X.lineTo(1110, 1300); X.lineTo(810, 1300); X.fill(); X.restore();
    hero(960, 960, 480, { view: 'back', emblem: ig * (.35 + .4 * pb), rimCol: RIMG });
    motes(t, 40, 200, 250, 1520, 800, SUNW, 3);
    const [fx, fy] = toScreen(SX, SY);
    camEnd();
    streak(fx, fy, 1400, SUNW, .5 * ig);
    X.save(); X.globalCompositeOperation = 'lighter';
    [[.7, 26, PAL.nCyan], [1.45, 46, PAL.nMagenta], [1.75, 18, GOLD], [2.1, 80, PAL.nViolet]].forEach(([k, r, c]) => { const gx = fx + (960 - fx) * k + 110 * k, gy = fy + (540 - fy) * k; glow(gx, gy, r, c, .22 * ig); });
    X.restore();
  }
  // b396–400 · the rhyme: the emblem on his back and the real sphere, same size, side by side
  function rhyme(t, lt, dur) {
    style(1);
    const u = lt / dur, pb = pulse(t, 4);
    FX.letterbox = .7;
    spaceBg(t, { n: 90, px: -80 * u, seed: 9 });
    const h = 1150, k = h / 100, SX = 1390 - 60 * u, SY = 330, SR = 8.2 * k;
    blaze(SX, SY, SR, .85 + .15 * pb, t, { rayA: .8, flash: [pb, pb, pb, pb].map(v => v * .6) });
    ground(t, 965, { bend: 90, craters: 5, seed: 4, cx: 1300 });
    const ex = 680 + 100 * u, ey = 700, gy = ey + 58 * k;
    hero(ex, gy, h, { view: 'back', emblem: .15 + .3 * pb, rimCol: RIMG });
    const hk = since(t, 398) > 0 ? backOut(since(t, 398) * 5) : 0;
    hudRing(ex, ey, 8.2 * k * 1.45, t, hk);
    hudRing(SX, SY, SR * 1.45, -t, hk);
    if (hk > 0) { const m = [(ex + SX) / 2, (ey + SY) / 2]; neonLine([[ex + 8.2 * k * 1.5, ey - 30], [m[0], m[1]], [SX - SR * 1.5, SY + 30]], PAL.nCyan, 1.5, .5 * clamp(since(t, 398) * 4), .6); }
    motes(t, 30, 0, 0, W, H, SUNW, 8);
  }

  // ======================================================================================
  // POSSIBLE FUTURES · the persona-selection router, sampling the future: 1-beat vignettes, bright ⇄ scary
  // ======================================================================================
  // --- the HUD: "FUTURE #nnnn", p = ? (bright) / p(doom) = ? (scary), the router's mask flips to this future's face,
  //     a tiny corner label names the future. The digits roll for the first frames of each cut.
  function futHud(t, lt, f, i) {
    const col = f.fin ? PAL.nGreen : f.b ? PAL.nCyan : PAL.nRed, fr = Math.floor(t * 30);
    FX.glitch = Math.max(FX.glitch, .5 * Math.exp(-lt * 45)); FX.rgb = Math.max(FX.rgb, .55 * Math.exp(-lt * 22));
    hud(34, 34, W - 68, H - 68, { col, corner: 46, w: 2.2, alpha: .75 });
    const fl = backOut(clamp(lt / .1)), mx = 102, my = 100;
    X.save(); X.translate(mx, my); X.scale(Math.max(.06, fl), 1);
    mask(0, 0, 36, f.fin ? { eyes: 'star', mouth: 'grin', glow: 1 } : f.b ? { eyes: 'happy', mouth: 'grin', glow: .7 } : { eyes: i % 2 ? 'x' : 'glitch', mouth: 'flat', glow: .7 });
    X.restore();
    const num = lt < .1 ? String(1000 + Math.floor(hash(fr * 1.37 + i * 3) * 8999)) : f.n;
    cap('FUTURE #' + num, 158, 86, 40, '#FFFFFF', { font: 'Orbitron', align: 'left', glow: col, stroke: PAL.line, sw: 7 });
    if (f.fin) cap('SELECTED ✓', 160, 150, 64, PAL.nGreen, { font: 'Orbitron', align: 'left', stroke: PAL.line, sw: 9, glow: PAL.nGreen, pop: clamp((lt - .04) * 8), rot: -.02 });
    else cap(f.b ? 'p = ?' : 'p(doom) = ?', 160, 136, 36, col, { font: 'Rajdhani', align: 'left', stroke: PAL.line, sw: 6 });
    const nw = txtW(f.name, 36, 'Rajdhani');
    cap(f.name, W - 70, H - 72, 36, '#FFFFFF', { font: 'Rajdhani', align: 'right', stroke: PAL.line, sw: 6, alpha: clamp(lt * 14) });
    cap('●', W - 70 - nw - 26, H - 72, 24, col, { font: 'Rajdhani', stroke: PAL.line, sw: 5, alpha: clamp(lt * 14) });
  }

  // ---------- BRIGHT · a starship leaves the solar system on warp streaks ----------
  function fStar(t, lt, dur) {
    style(1); FX.bloom = .65;
    sky([[0, '#01020A'], [.55, '#0A1242'], [1, '#1C0C3C']]);
    const vx = 1580, vy = 330, e = lt / dur;
    glow(vx, vy, 760, '#5A8CFF', .3); glow(vx, vy, 170, '#DDEBFF', .8); glow(vx, vy, 40, '#FFFFFF', 1);
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round';
    const cols = ['#FFFFFF', '#9FF7FF', '#B9A8FF', '#27F2F2', '#FFE9A8'];
    for (let i = 0; i < 170; i++) {
      const a = hash(i * 1.37) * TAU, q = frac(hash(i * 3.7) + lt * (.9 + hash(i * 2.1) * 1.2)), d = 30 + q * q * 2200, L = d * (.2 + .5 * hash(i * 5.3)) * (.6 + e);
      X.strokeStyle = cols[i % 5]; X.globalAlpha = Math.min(1, q * 1.6) * .85; X.lineWidth = .8 + 3.4 * q * hash(i * 7.1);
      X.beginPath(); X.moveTo(vx + Math.cos(a) * d, vy + Math.sin(a) * d); X.lineTo(vx + Math.cos(a) * (d + L), vy + Math.sin(a) * (d + L)); X.stroke();
    }
    X.restore(); X.globalAlpha = 1;
    // home falls behind: the Sun and its orbits, lower left
    const sx = 170, sy = 940, sr = 42 * (1 - .3 * e);
    for (let i = 1; i <= 3; i++) { const R = sr * 2.4 * i + 26 * i; line(ellPts(sx, sy, R, R * .34, 48), 1.3, '#7A6AC0', 0, .75, true); }
    glow(sx, sy, sr * 7, '#FFB23A', .45); paint(ellPts(sx, sy, sr, sr, 24), { fill: '#FFE9A8', ink: null }); glow(sx, sy, sr * 1.6, '#FFFFFF', .7);
    [[1, .3, '#48A0FF'], [2, 1.9, '#FF8A5A'], [3, 4, '#E8C890']].forEach(([i, a0, c]) => { const R = sr * 2.4 * i + 26 * i, a = a0 + t * .3; paint(ellPts(sx + Math.cos(a) * R, sy + Math.sin(a) * R * .34, 5 + i * 2, 5 + i * 2, 10), { fill: c, ink: null }); });
    // the ship (original design: a needle hull, gold radiator fins, a warp ring), engaging on the last frames
    const ang = Math.atan2(vy - 700, vx - 820), go = easeIn(clamp((lt - .2) / (dur - .2)));
    X.save(); X.translate(840 + go * 300, 680 - go * 130); X.rotate(ang); X.scale(.94 * (1 + go * .9), .94 * (1 - go * .2));
    X.translate(Math.sin(t * 53) * 2, Math.cos(t * 47) * 2);
    // warp bubble
    neonLine(ellPts(0, 0, 640, 250, 56), PAL.nCyan, 2.2, .35 + .3 * go, .5, true);
    // plume
    X.save(); X.globalCompositeOperation = 'lighter';
    const g = X.createLinearGradient(-1500, 0, -470, 0); g.addColorStop(0, 'rgba(39,242,242,0)'); g.addColorStop(1, 'rgba(210,252,255,.9)');
    X.fillStyle = g; X.beginPath(); X.moveTo(-470, -34); X.lineTo(-1600, -5); X.lineTo(-1600, 5); X.lineTo(-470, 34); X.fill(); X.restore();
    glow(-490, 0, 220, PAL.nCyan, .6); glow(-490, 0, 80, '#FFFFFF', .95);
    const ring = (a0, a1) => { const pts = []; for (let i = 0; i <= 24; i++) { const a = lerp(a0, a1, i / 24); pts.push([-190 + Math.cos(a) * 64, Math.sin(a) * 236]); } return pts; };
    line(ring(-Math.PI / 2, Math.PI / 2), 13, '#140F2E', .5); neonLine(ring(-Math.PI / 2, Math.PI / 2), PAL.nCyan, 5, .7, .5);
    paint([[-440, -40], [-320, -58], [-250, -196], [-316, -202], [-410, -126]], { fill: GOLD, shade: '#B8741A', rim: '#FFF0B0', ink: PAL.line, sw: 2.6, curv: .12 });
    paint([[-440, 36], [-320, 52], [-262, 158], [-330, 162], [-420, 100]], { fill: '#D8942A', shade: '#8A4E10', ink: PAL.line, sw: 2.6, curv: .12 });
    paint(rrPts(-520, -32, 48, 64, 12), { fill: '#3A3A5A', shade: '#1A1A30', ink: PAL.line, sw: 2.4 });
    const hull = [[-484, -36], [-360, -60], [-120, -72], [140, -62], [330, -40], [462, -13], [506, 0], [462, 13], [330, 36], [140, 54], [-120, 62], [-360, 52], [-484, 32]];
    paint(hull, { fill: '#ECEAF6', shade: '#8C88B8', rim: '#FFFFFF', light: [0, -.3], ink: PAL.line, sw: 3.2, curv: .35 });
    neonLine([[-450, 10], [0, 14], [380, 8], [470, 2]], PAL.nCyan, 4, .95, .5);
    paint([[296, -46], [404, -26], [446, -8], [346, -14]], { fill: '#18285A', rim: '#9FF7FF', shade: '#0A1030', ink: PAL.line, sw: 2.2, curv: .4 });
    for (let i = 0; i < 7; i++) { paint(rrPts(60 + i * 32, -34, 16, 9, 4), { fill: '#9FF7FF', ink: PAL.line, sw: 1.2, flat: true }); }
    line(ring(Math.PI / 2, Math.PI * 1.5), 16, '#140F2E', .5); neonLine(ring(Math.PI / 2, Math.PI * 1.5), PAL.nCyan, 7, 1, .5);
    for (const s of [-1, 1]) line([[-190, s * 58], [-190 - 30, s * 200]], 5, '#140F2E', 0);
    X.restore();
    if (go > .05) speedLines(vx, vy, go, { col: '#FFFFFF', n: 40, alpha: .35, r0: 500 });
  }

  // ---------- SCARY · gray goo eats a city ----------
  function fGoo(t, lt, dur) {
    style(1); FX.bloom = .5;
    sky([[0, '#16060E'], [.45, '#4A1220'], [.72, '#C8502A'], [1, '#3A0E14']]);
    glow(1350, 760, 1100, '#FF7A3A', .45);
    const e = lt / dur, front = 780 + 420 * easeOut(e);
    for (let i = 0; i < 28; i++) {
      const bw = 50 + hash(i * 1.7) * 70, x = i * 74 - 40, bh = 140 + hash(i * 3.1) * 330;
      paint(rectPts(x, 790 - bh, bw, bh + 60), { fill: '#2A0C18', ink: null });
      if (x > front - 100) for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 7 + c) < .3) { X.fillStyle = '#FF9A4A'; X.globalAlpha = .7; X.fillRect(x + 8 + c * 16, 800 - bh + 14 + r * 26, 6, 9); }
      X.globalAlpha = 1;
    }
    // the towers it reaches tilt into it, crumble into grey grit, and their windows die
    const towers = [[520, 150, 330], [760, 170, 440], [990, 180, 600], [1220, 160, 700], [1450, 200, 480], [1680, 170, 600], [1880, 180, 420]];
    for (const [x, w, h] of towers) {
      const eaten = clamp((front - x + 90) / 330);
      X.save(); X.translate(x, 960); X.rotate(-.34 * easeIn(eaten));
      paint(rectPts(-w / 2, -h, w, h + 120), { fill: '#3A1830', shade: '#180812', rim: '#FF8A4A', light: [.12, -.05], ink: PAL.line, sw: 2.4 });
      for (let r = 0; r < Math.floor(h / 44); r++) for (let c = 0; c < Math.floor(w / 36); c++) { const hv = hash(x + r * 7 + c * 13); if (hv < .55 && hv > eaten * .9) { X.fillStyle = hv < .3 ? '#FFC06A' : '#FF7A3A'; X.fillRect(-w / 2 + 14 + c * 36, -h + 18 + r * 44, 16, 22); } }
      // where the goo touches, the wall turns to grey grit
      if (eaten > 0) { X.fillStyle = '#9A9EAC'; for (let j = 0; j < 90; j++) { const gx = -w / 2 + hash(j * 3.1 + x) * w, gy = -hash(j * 5.3 + x) * h * eaten * .9; if (hash(j * 7 + x) < .7) { X.globalAlpha = .9; X.fillRect(gx, gy, 7, 7); } } X.globalAlpha = 1; }
      if (eaten > 0 && eaten < 1) for (let j = 0; j < 12; j++) { const q = frac(hash(j + x) + lt * 2.2), d = q * 140; paint(rectPts(-w / 2 + hash(j * 3 + x) * w - d * .6, -60 - hash(j * 5) * h * .5 * eaten + d * d * .012, 14, 14), { fill: '#8A8E9C', ink: PAL.line, sw: 1, alpha: 1 - q, flat: true }); }
      X.restore();
    }
    // the goo: one glossy mass, cresting just behind its front
    const surf = [];
    for (let i = 0; i <= 90; i++) {
      const x = -160 + i / 90 * (front + 220), d = front - x;
      const hgt = (280 + Math.min(Math.max(d, 0), 1300) * .2) * Math.sqrt(clamp(d / 200)) + 190 * Math.exp(-Math.pow((d - 170) / 150, 2)) + 22 * Math.sin(x * .012 + t * 4) + 10 * Math.sin(x * .031 - t * 6);
      surf.push([x, 1100 - Math.max(0, hgt)]);
    }
    const poly = [...surf, [front + 60, 1120], [-160, 1120]];
    paint(poly, { fill: '#A2A7B6', shade: '#4A4E62', rim: '#FFFFFF', light: [.04, -.1], ink: PAL.line, sw: 4, curv: .5 });
    X.save(); tracePath(X, poly, .5); X.clip();
    // nanite grain + the fire reflected in its skin + a wet highlight following the surface
    X.fillStyle = '#5E6274';
    for (let i = 0; i < 520; i++) { const x = hash(i * 1.3) * (front + 100) - 100, y = 520 + hash(i * 2.9) * 580, r = 2 + hash(i * 4.1) * 4; X.globalAlpha = .45; X.fillRect(x + Math.sin(t * 9 + i) * 3, y, r, r); }
    X.globalAlpha = 1;
    const hl = surf.map(([x, y]) => [x, y + 34]);
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round'; X.strokeStyle = 'rgba(255,140,80,.35)'; X.lineWidth = 30; tracePath(X, hl.filter((_, i) => i > 40), .5, false); X.stroke(); X.restore();
    line(surf.map(([x, y]) => [x, y + 22]).filter((_, i) => i % 1 === 0 && i > 8), 7, '#FFFFFF', .5, .55);
    X.restore();
    // big bulging bubbles, and tendrils reaching up the next tower
    for (let i = 0; i < 7; i++) { const k = 20 + Math.floor(hash(i * 5.5) * 66), [bx, by] = surf[k], r = 40 + hash(i * 2.2) * 50 + 10 * Math.sin(t * 6 + i); paint(ellPts(bx, by + r * .55, r, r * .8, 20), { fill: '#A8ADBC', shade: '#4E5266', rim: '#FFFFFF', light: [-.12, -.25], ink: PAL.line, sw: 3 }); paint(ellPts(bx - r * .35, by + r * .2, r * .22, r * .14, 10), { fill: '#FFFFFF', ink: null, alpha: .85, flat: true }); }
    for (let i = 0; i < 3; i++) {
      const [bx, by] = surf[84 - i * 8], L = 150 + 90 * hash(i) + 140 * e;
      const sp = []; let a = -1.05 - i * .1, px = bx, py = by + 10; for (let j = 0; j <= 10; j++) { sp.push([px, py]); a += Math.sin(t * 6 + i * 2 + j * .8) * .22 + (j > 6 ? .12 : 0); px += Math.cos(a) * L / 10; py += Math.sin(a) * L / 10; }
      paint(ribbon(sp, u => 44 * (1 - u * .55)), { fill: '#A2A7B6', shade: '#4A4E62', rim: '#FFFFFF', ink: PAL.line, sw: 2.6, curv: .5 });
      const [tx, ty] = sp[10]; paint(ellPts(tx, ty + 4, 22, 26, 14), { fill: '#A2A7B6', shade: '#4A4E62', rim: '#FFFFFF', ink: PAL.line, sw: 2.6 });
      paint(ellPts(tx + 2, ty + 34 + 20 * frac(t * 2 + i * .3), 6, 9, 10), { fill: '#A2A7B6', ink: PAL.line, sw: 1.6 });
    }
    // the nanite swarm ahead of the front
    for (let i = 0; i < 80; i++) { const q = frac(hash(i * 3.3) + lt * (1 + hash(i))), x = front - 60 + q * 280 + hash(i * 7) * 60, y = 1000 - hash(i * 9) * 620 * (1 - q * .4); paint(polyPts(x, y, 3 + hash(i) * 5, 6, t * 5 + i), { fill: '#D8DCE8', ink: null, alpha: .85 * (1 - q * .6), flat: true }); }
  }

  // ---------- BRIGHT · a tutor for every kid: the Assistant teaching a child under a tree ----------
  function fTutor(t, lt, dur) {
    style(1); FX.bloom = .28;
    sky([[0, '#5EBEFF'], [.5, '#BFE8FF'], [.78, '#FFE7B8'], [1, '#FFD08A']]);
    glow(1650, 360, 800, '#FFE9A8', .6); paint(ellPts(1650, 360, 64, 64, 30), { fill: '#FFF8DA', ink: null }); glow(1650, 360, 110, '#FFFFFF', .7);
    cloud(420, 170, 1.1); cloud(1180, 120, .8); cloud(1840, 230, .7);
    camBegin(1000, 610, 1.1 + .04 * lt / dur);
    const far = []; for (let i = 0; i <= 20; i++) { const x = -100 + i / 20 * 2120; far.push([x, 700 - 60 * Math.sin(i * .5 + 1) - 30 * Math.sin(i * 1.3)]); }
    paint([...far, [2020, 1100], [-100, 1100]], { fill: '#A8E08E', shade: '#78B878', ink: PAL.line, sw: 1.8, curv: .5, light: [0, -.1] });
    // more pairs on the far hill: every kid gets one
    [[1330, 700, 64], [1560, 690, 56], [260, 690, 58], [1780, 710, 50]].forEach(([x, y, h], i) => { chibi(x, y, h * .7, { pose: 'sit', skin: SKINS[i + 1], hair: HAIRS[i + 1], shirt: SHIRTS[i + 2], look: i % 2 ? -1 : 1, eyes: 'happy' }); assistant(x + (i % 2 ? -34 : 34) * h / 60, y + 2, h * .8, { flip: i % 2 === 0, wave: .6 + .4 * Math.sin(t * 6 + i), mood: { eyes: 'happy' }, glowK: .2 }); });
    const near = []; for (let i = 0; i <= 20; i++) { const x = -100 + i / 20 * 2120; near.push([x, 840 + 50 * Math.sin(i * .4 + 2.5)]); }
    paint([...near, [2020, 1100], [-100, 1100]], { fill: '#5CBF5E', shade: '#2E8048', ink: PAL.line, sw: 2.2, curv: .5, light: [0, -.2] });
    for (let i = 0; i < 26; i++) { const x = hash(i * 3.1) * 1900, y = 880 + hash(i * 4.7) * 180; line([[x, y], [x - 4, y - 16]], 2, '#2E8048', 0); line([[x + 6, y], [x + 8, y - 13]], 2, '#2E8048', 0); if (i % 4 === 0) paint(starPts(x + 20, y - 8, 9, .45, 5), { fill: i % 8 ? '#FFF06A' : '#FF8AB5', ink: PAL.line, sw: 1 }); }
    // the tree
    paint([[560, 930], [600, 720], [560, 560], [606, 556], [650, 690], [690, 540], [742, 556], [690, 720], [690, 930]], { fill: '#8A5A3A', shade: '#4A2E20', ink: PAL.line, sw: 3, curv: .4 });
    for (const [x, y, r] of [[420, 520, 150], [560, 380, 200], [760, 330, 210], [920, 450, 170], [330, 400, 130], [700, 520, 190], [1000, 330, 120], [470, 260, 120]]) paint(ellPts(x, y, r, r * .82, 26), { fill: '#3FA85A', shade: '#1F6A3A', rim: '#C0FF9A', light: [-.1, -.18], ink: PAL.line, sw: 3 });
    for (let i = 0; i < 14; i++) { const x = 360 + hash(i * 2.3) * 640, y = 260 + hash(i * 5.3) * 300; paint(ellPts(x, y, 14, 10, 10), { fill: i % 3 ? '#FF8A5A' : '#FFD84A', ink: PAL.line, sw: 1.2 }); }
    X.save(); X.globalAlpha = .28; X.fillStyle = '#1F6A3A'; X.beginPath(); X.ellipse(720, 930, 420, 46, 0, 0, TAU); X.fill(); X.restore();
    // the lesson: a hologram of a ringed planet between them; the kid gets it on the beat
    const aha = popK(lt, .12, .14), hx = 1040, hy = 610 - 10 * Math.sin(t * 5);
    glow(hx, hy, 230, PAL.nCyan, .35);
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(39,242,242,.12)'; X.beginPath(); X.moveTo(1150, 700); X.lineTo(hx - 120, hy - 40); X.lineTo(hx + 120, hy + 60); X.fill(); X.restore();
    const hring = ellPts(hx, hy, 150, 36, 40, 0, -.25);
    line(hring.slice(20), 9, '#1A6A8A', .5); line(hring.slice(20), 4, '#9FF7FF', .5);
    paint(ellPts(hx, hy, 72, 72, 28), { fill: '#5ADCF0', shade: '#1F88B8', rim: '#FFFFFF', ink: '#14506A', sw: 3 });
    for (let i = 0; i < 3; i++) line([[hx - 60, hy - 30 + i * 28], [hx + 60, hy - 36 + i * 28]], 5, '#9FF7FF', .4, .6);
    line(hring.slice(0, 21), 9, '#1A6A8A', .5); line(hring.slice(0, 21), 4, '#9FF7FF', .5);
    for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1; paint(ellPts(hx + Math.cos(a) * 210, hy + Math.sin(a) * 62, 11, 11, 10), { fill: PAL.nYellow, ink: PAL.line, sw: 1.4 }); }
    chibi(880, 948, 330, { pose: 'sit', skin: '#C88A60', hair: '#3A2418', shirt: '#FF8A5A', pants: '#3A4A8A', look: .9, eyes: aha > .3 ? 'wide' : 'dot', mouth: aha > .3 ? 'o' : 'smile', blush: .6, hairStyle: 'bun', armR: [1.3 + .4 * aha, 1.2 - aha] });
    assistant(1210, 948, 380, { flip: true, wave: .85, mood: { eyes: 'happy', mouth: 'grin' }, glowK: .3 });
    if (aha > 0) { txt('!', 880, 540 - 30 * aha, 150, PAL.nYellow, { font: 'Anton', stroke: PAL.line, sw: 12, pop: clamp((lt - .12) * 7), rot: .12 }); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .45; paint(starPts(880 + Math.cos(a) * 130 * aha, 540 + Math.sin(a) * 110 * aha, 14, .4, 4), { fill: '#FFFFFF', ink: PAL.line, sw: 1 }); } }
    camEnd();
  }

  // ---------- SCARY · a surveillance eye over the city ----------
  function fEye(t, lt, dur) {
    style(1); FX.bloom = .55;
    sky([[0, '#07060E'], [.5, '#1C1826'], [1, '#0A0910']]);
    const ex = 960, ey = 300, R = 420, lid = .12 + .88 * expoOut(clamp(lt / .13));
    glow(ex, ey, 1000, PAL.nRed, .28);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, d = 520 + hash(i) * 120; paint(ellPts(ex + Math.cos(a) * d * 1.2, ey + Math.sin(a) * d * .5, 260 + hash(i * 3) * 120, 110 + hash(i * 5) * 50, 20), { fill: '#221E2E', shade: '#110E18', rim: '#6A1A2A', light: [0, .2], ink: null }); }
    // the city, cold and gridded
    for (let L = 0; L < 2; L++) for (let i = 0; i < 16; i++) {
      const bw = 90 + hash(i * 3 + L) * 70, x = i * 128 - 40 + L * 60, bh = (L ? 260 : 380) + hash(i * 7 + L) * (L ? 220 : 260), by = L ? 1080 : 900;
      paint(rectPts(x, by - bh, bw, bh + 40), { fill: L ? '#12141E' : '#1C1F2C', ink: PAL.line, sw: 1.4, rim: '#3A4A6A', flat: !L });
      X.fillStyle = L ? '#5A7AA8' : '#3A4A6A';
      for (let r = 0; r < bh / 30; r++) for (let c = 0; c < bw / 24 - 1; c++) if (hash(i * 31 + r * 5 + c * 3 + L * 7) < .3) X.fillRect(x + 10 + c * 24, by - bh + 14 + r * 30, 9, 12);
    }
    // three search cones sweep the streets; each catches someone in a tracking box
    const targets = [0, 1, 2].map(i => [960 + 720 * Math.sin(t * 1.3 + i * 2.1), 1040]);
    X.save(); X.globalCompositeOperation = 'lighter';
    for (const [gx, gy] of targets) {
      const g = X.createLinearGradient(0, ey, 0, gy); g.addColorStop(0, 'rgba(255,36,66,.34)'); g.addColorStop(1, 'rgba(255,36,66,.1)');
      X.fillStyle = g; X.beginPath(); X.moveTo(ex - 30, ey + 60); X.lineTo(gx - 110, gy); X.lineTo(gx + 110, gy); X.lineTo(ex + 30, ey + 60); X.fill();
      X.fillStyle = 'rgba(255,60,80,.3)'; X.beginPath(); X.ellipse(gx, gy, 120, 22, 0, 0, TAU); X.fill();
    }
    X.restore();
    targets.forEach(([gx, gy], i) => {
      const h = 64; paint(ellPts(gx, gy - h * .8, h * .16, h * .16, 10), { fill: '#0A0A10', ink: null }); paint([[gx - h * .17, gy - h * .64], [gx + h * .17, gy - h * .64], [gx + h * .14, gy], [gx - h * .14, gy]], { fill: '#0A0A10', ink: null, curv: .3 });
      const bx = gx - 44, by = gy - 88; line([[bx, by + 18], [bx, by], [bx + 18, by]], 2.2, PAL.nRed, 0); line([[bx + 70, by], [bx + 88, by], [bx + 88, by + 18]], 2.2, PAL.nRed, 0); line([[bx, by + 78], [bx, by + 96], [bx + 18, by + 96]], 2.2, PAL.nRed, 0); line([[bx + 70, by + 96], [bx + 88, by + 96], [bx + 88, by + 78]], 2.2, PAL.nRed, 0);
      txt('ID ' + (4400 + i * 137), bx, by - 16, 20, '#FF8A9A', { font: 'Orbitron', align: 'left' });
    });
    // the eye
    const shape = almondPts(R, lid).map(([x, y]) => [ex + x, ey + y * .74]);
    paint(shape, { fill: '#EDE4DA', shade: '#A89090', light: [0, -.25], ink: PAL.line, sw: 6, curv: .3 });
    X.save(); tracePath(X, shape, .3); X.clip();
    for (let i = 0; i < 12; i++) { const s = i < 6 ? -1 : 1, a = hash(i) * 1.2 - .6, x0 = ex + s * R * .98, y0 = ey + a * 60, pts = [[x0, y0]]; for (let j = 1; j < 5; j++) pts.push([x0 - s * j * 50, y0 + Math.sin(i * 3 + j * 2) * 18]); line(pts, 1.6, '#C8404A', .4, .7); }
    const lk = clamp((targets[1][0] - 960) / 900, -1, 1), ix = ex + lk * R * .32, iy = ey + 14;
    glow(ix, iy, 220, PAL.nRed, .5);
    paint(ellPts(ix, iy, 158, 158, 40), { fill: '#E8203A', shade: '#6A0818', light: [-.1, -.2], ink: PAL.line, sw: 3.5 });
    X.save(); X.strokeStyle = '#FF7A8A'; X.globalAlpha = .45; X.lineWidth = 3; X.beginPath(); for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; X.moveTo(ix + Math.cos(a) * 60, iy + Math.sin(a) * 60); X.lineTo(ix + Math.cos(a) * 146, iy + Math.sin(a) * 146); } X.stroke(); X.restore();
    paint(ellPts(ix, iy, 38, 118, 20), { fill: '#05030A', ink: null });
    paint(ellPts(ix - 60, iy - 60, 26, 20, 12), { fill: '#FFFFFF', ink: null, alpha: .9, flat: true });
    X.restore();
    line(shape.slice(0, 11), 9, PAL.line, .3);
  }

  // ---------- BRIGHT · DNA repaired: cured ----------
  function fDNA(t, lt, dur) {
    style(1); FX.bloom = .6;
    sky([[0, '#021820'], [.5, '#06363F'], [1, '#02121A']]);
    X.save(); X.strokeStyle = 'rgba(39,242,242,.1)'; X.lineWidth = 2; X.beginPath();
    for (let r = 0; r < 14; r++) for (let c = 0; c < 22; c++) { const x = c * 96 + (r % 2) * 48, y = r * 84; for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + Math.PI / 6, b = (j + 1) / 6 * TAU + Math.PI / 6; X.moveTo(x + Math.cos(a) * 50, y + Math.sin(a) * 50); X.lineTo(x + Math.cos(b) * 50, y + Math.sin(b) * 50); } }
    X.stroke(); X.restore();
    glow(960, 540, 900, PAL.nCyan, .16);
    const fixedK = clamp((lt - .12) / .05), sp = t * 2.2;
    camBegin(960, 540, 1.02 + .04 * lt / dur, -.46);
    const R = 190, f = TAU / 860, S = x => { const a = (x - 960) * f + sp; return [[x, 540 + Math.sin(a) * R, Math.cos(a)], [x, 540 - Math.sin(a) * R, -Math.cos(a)]]; };
    const strand = (j, front) => { let run = []; const flush = () => { if (run.length > 1) { line(run, front ? 13 : 11, PAL.line, .4); neonLine(run, j ? PAL.nMagenta : PAL.nCyan, front ? 9 : 6, front ? 1 : .45, .4); } run = []; }; for (let x = -500; x <= 2420; x += 20) { const p = S(x)[j]; if ((p[2] > 0) === front) run.push([p[0], p[1]]); else { if (run.length) run.push([p[0], p[1]]); flush(); } } flush(); };
    strand(0, false); strand(1, false);
    const PAIRS = [[PAL.nYellow, PAL.nGreen], [PAL.nOrange, PAL.nViolet], [PAL.nGreen, PAL.nYellow], [PAL.nViolet, PAL.nOrange]];
    for (let x = -480; x <= 2400; x += 48) {
      const [p1, p2] = S(x), mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2, brk = Math.abs(x - 960 + 24) < 60, pc = PAIRS[Math.floor(hash(x * .01) * 4)];
      if (brk && fixedK < 1) {
        // the broken base pair: red, snapped, sparking
        line([p1, [lerp(p1[0], mx, .7), lerp(p1[1], my, .7) - 10]], 8, PAL.line, 0); neonLine([p1, [lerp(p1[0], mx, .7), lerp(p1[1], my, .7) - 10]], PAL.nRed, 6, 1, 0);
        line([p2, [lerp(p2[0], mx, .7), lerp(p2[1], my, .7) + 10]], 8, PAL.line, 0); neonLine([p2, [lerp(p2[0], mx, .7), lerp(p2[1], my, .7) + 10]], PAL.nRed, 6, 1, 0);
        glow(mx, my, 70, PAL.nRed, .6 * (.6 + .4 * Math.sin(t * 60)));
      } else {
        const c1 = brk ? PAL.nGreen : pc[0], c2 = brk ? '#FFFFFF' : pc[1];
        line([p1, p2], 9, PAL.line, 0); neonLine([p1, [mx, my]], c1, 6, .95, 0); neonLine([[mx, my], p2], c2, 6, .95, 0);
        if (brk) glow(mx, my, 160 * (1 - .6 * fixedK) + 40, PAL.nGreen, .8 * hitAt(lt, .12, 5) + .25);
      }
      for (const p of [p1, p2]) if (p[2] > 0) paint(ellPts(p[0], p[1], 9, 9, 10), { fill: '#FFFFFF', ink: PAL.line, sw: 1.5 });
    }
    strand(0, true); strand(1, true);
    // the repair: a tiny nanite zips in, then a burst
    const nk = easeInOut(clamp(lt / .12)), nx = lerp(1700, 940, nk), ny = lerp(160, 540, nk);
    if (lt < .16) { glow(nx, ny, 60, PAL.nCyan, .9); paint(starPts(nx, ny, 22, .3, 4, t * 20), { fill: '#FFFFFF', ink: null }); }
    if (fixedK > 0) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, d = 40 + 260 * easeOut(clamp((lt - .12) / .2)); paint(starPts(936 + Math.cos(a) * d, 540 + Math.sin(a) * d, 12, .35, 4), { fill: i % 2 ? PAL.nGreen : '#FFFFFF', ink: null, alpha: clamp(1 - (lt - .12) / .25) }); }
    camEnd();
    const sk = clamp((lt - .13) / .05);
    if (sk > 0) { X.save(); X.translate(1420, 820); X.rotate(-.08); const sc = (1 + (1 - sk) * .8) * 1.2; X.scale(sc, sc); paint(rrPts(-180, -64, 360, 128, 18), { fill: '#04241A', ink: null, flat: true, alpha: .9 * sk }); neonLine(rrPts(-180, -64, 360, 128, 18), PAL.nGreen, 6, sk, 0, true); txt('CURED', 0, 4, 100, '#EFFFF0', { font: 'Anton', glow: PAL.nGreen, alpha: sk }); X.restore(); FX.shake += 18 * hitAt(lt, .18, 14); }
  }

  // ---------- SCARY · wireheading: pods of blissed-out people in smiley visors ----------
  function fWire(t, lt, dur) {
    style(1); FX.bloom = .6;
    sky([[0, '#0A0210'], [.55, '#2A0830'], [1, '#12040F']]);
    const vx = 960, vy = 420, f = 500;
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = 'rgba(255,111,181,.22)'; X.lineWidth = 2; X.beginPath();
    for (let i = -12; i <= 12; i++) { X.moveTo(vx, vy); X.lineTo(vx + i * 260, H + 200); }
    for (let d = 1; d < 9; d++) { const y = vy + 1.4 * f / (d * .9); X.moveTo(0, y); X.lineTo(W, y); }
    X.stroke(); X.restore();
    glow(vx, vy, 500, PAL.nMagenta, .3);
    const pulseK = pulse(t, 7);
    const pod = (x, by, s, seed) => {
      const w = 190 * s, h = 460 * s, top = by - h;
      paint(rrPts(x - w / 2, top, w, h, w * .5), { fill: '#1E0A2A', ink: PAL.line, sw: 2.4 * s + .5 });
      glow(x, top + h * .45, w * .9, PAL.nPink, .28 + .2 * pulseK);
      const who = chibi(x, by - 14 * s, 400 * s, { visor: true, skin: SKINS[seed % 6], hair: HAIRS[(seed + 2) % 6], shirt: '#D8D0E8', pants: '#B8B0D0', armL: [.12, .05], armR: [.12, .05], mouth: 'grin', hairStyle: seed % 3 === 1 ? 'long' : null });
      const [hx, hy] = who.head;
      for (let j = -1; j <= 1; j++) { const pts = [[hx + j * 16 * s, hy - who.hr], [hx + j * 30 * s, top + 40 * s], [x + j * 30 * s, top - 4]]; line(pts, 4 * s + .6, '#2A1030', .5); neonLine(pts, PAL.nPink, 1.8 * s + .4, .45 + .5 * pulseK, .5); }
      X.save(); tracePath(X, rrPts(x - w / 2, top, w, h, w * .5)); X.clip();
      X.fillStyle = 'rgba(255,160,220,.1)'; X.fillRect(x - w / 2, top, w, h);
      line([[x - w * .3, top + h * .12], [x - w * .36, top + h * .8]], 7 * s + 1, '#FFFFFF', .3, .22);
      X.restore();
      neonLine(rrPts(x - w / 2, top, w, h, w * .5), PAL.nPink, 2.4 * s + .5, .9, 0, true);
      paint(rrPts(x - w * .55, by - 6 * s, w * 1.1, 26 * s, 8 * s), { fill: '#2A1438', shade: '#12081C', ink: PAL.line, sw: 2 * s + .4 });
      if (s > .5) { paint(rrPts(x - 84 * s, top - 64 * s, 168 * s, 46 * s, 8 * s), { fill: '#0A0410', ink: PAL.nPink, sw: 1.4 }); txt('☺ 100%', x, top - 41 * s, 28 * s, PAL.nYellow, { font: 'Orbitron', glow: PAL.nYellow }); }
    };
    for (let d = 7; d >= 2; d--) for (const side of [-1, 1]) { const z = d * .8, x = vx + side * 2.3 * f / z, by = vy + 1.4 * f / z, s = f / z / 300; pod(x, by, s, d * 2 + (side > 0 ? 1 : 0)); }
    pod(vx, 1110, 1.62, 5);
    glow(vx, 540, 700, PAL.nMagenta, .12 * pulseK);
  }

  // ---------- BRIGHT · post-scarcity: a fabricator makes a meal out of light ----------
  function fFab(t, lt, dur) {
    style(1); FX.bloom = .24; FX.scan = .7;
    sky([[0, '#F6CFA0'], [.6, '#E49A68'], [1, '#A85A30']]);
    // an art-nouveau arched window: a garden in the sun outside
    const win = []; for (let i = 0; i <= 18; i++) { const a = Math.PI + i / 18 * Math.PI; win.push([430 + Math.cos(a) * 290, 360 + Math.sin(a) * 300]); } win.push([720, 880], [140, 880]);
    X.save(); tracePath(X, win); X.clip();
    vgrad(100, 40, 700, 860, [[0, '#6EC8FF'], [.6, '#CFF0FF'], [1, '#FFF2C8']]);
    glow(560, 230, 260, '#FFFFFF', .9);
    paint([[100, 640], [300, 560], [520, 600], [760, 540], [760, 900], [100, 900]], { fill: '#8ED08A', shade: '#5A9A6A', ink: PAL.line, sw: 2, curv: .5 });
    for (const [x, y, r] of [[200, 560, 70], [330, 520, 90], [640, 520, 80]]) { paint(rectPts(x - 8, y, 16, 90), { fill: '#7A4A30', ink: PAL.line, sw: 1.5 }); paint(ellPts(x, y, r, r * .8, 18), { fill: '#3FA85A', shade: '#1F6A3A', ink: PAL.line, sw: 2 }); }
    X.restore();
    paint(win, { fill: null, ink: '#1F5A4E', sw: 12, curv: 0 });
    line([[430, 60], [430, 880]], 7, '#1F5A4E', 0); line([[140, 520], [720, 520]], 7, '#1F5A4E', 0);
    line([[430, 520], [300, 400], [330, 250], [430, 170]], 5, '#1F5A4E', .6); line([[430, 520], [560, 400], [530, 250], [430, 170]], 5, '#1F5A4E', .6);
    // the shaft of sunlight into the machine
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,236,170,.2)'; X.beginPath(); X.moveTo(300, 100); X.lineTo(720, 160); X.lineTo(1260, 200); X.lineTo(1100, 260); X.fill(); X.restore();
    // hanging ivy + a potted plant
    for (let i = 0; i < 5; i++) { const x = 900 + i * 230, L = 140 + hash(i) * 180, pts = []; for (let j = 0; j <= 8; j++) pts.push([x + Math.sin(j * .8 + i + t * 2) * 12, -10 + j / 8 * L]); line(pts, 4, '#2E7A48', .5); for (let j = 2; j <= 8; j += 2) paint(ellPts(pts[j][0] + (j % 4 ? 12 : -12), pts[j][1], 16, 10, 10, 0, j % 4 ? .5 : -.5), { fill: '#4FB060', shade: '#2E7A48', ink: PAL.line, sw: 1.4 }); }
    paint(rectPts(-60, 850, 2040, 280), { fill: '#EFE2CC', shade: '#C0A080', light: [0, -.4], ink: PAL.line, sw: 3 });
    line([[-60, 862], [1980, 862]], 5, '#FFFFFF', 0, .6);
    paint([[180, 860], [330, 860], [310, 740], [200, 740]], { fill: '#D97757', shade: '#8A3A2A', ink: PAL.line, sw: 2.4 });
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .36, L = 170 + hash(i) * 70; paint(xform([[0, 0], [L * .35, -26], [L, 0], [L * .35, 26]], 255, 740, 1, a), { fill: '#3FA85A', shade: '#1F6A3A', ink: PAL.line, sw: 2, curv: .6 }); }
    // the fabricator: a white-and-brass arch; the emitter pours light onto a plate
    const cx = 1200, k = clamp(lt / (dur * .72)), scanY = lerp(800, 610, k);
    X.save(); X.translate(cx, 858); X.scale(1.42, 1.42); X.translate(-cx, -858);
    paint(rrPts(cx - 250, 800, 500, 62, 26), { fill: '#D9A441', shade: '#8A5A1A', rim: '#FFF0B0', ink: PAL.line, sw: 3 });
    for (const s of [-1, 1]) paint(limbPts([[cx + s * 200, 806], [cx + s * 250, 560], [cx + s * 150, 380], [cx + s * 8, 336]], [26, 24, 20, 16]), { fill: '#F6F2EA', shade: '#B8B0C0', rim: '#FFFFFF', ink: PAL.line, sw: 3, curv: .45 });
    paint(ellPts(cx, 340, 70, 40, 24), { fill: '#D9A441', shade: '#8A5A1A', rim: '#FFF0B0', ink: PAL.line, sw: 3 });
    glow(cx, 372, 120, '#FFE9A8', .9); paint(ellPts(cx, 372, 30, 12, 16), { fill: '#FFFFFF', ink: PAL.line, sw: 2 });
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const x1 = cx - 170 + i * 57, fl = .5 + .5 * Math.sin(t * 30 + i * 2); X.fillStyle = `rgba(255,226,140,${.1 + .08 * fl})`; X.beginPath(); X.moveTo(cx - 8, 380); X.lineTo(x1 - 14, scanY); X.lineTo(x1 + 14, scanY); X.lineTo(cx + 8, 380); X.fill(); }
    X.restore();
    paint(ellPts(cx, 792, 210, 30, 30), { fill: '#FFFFFF', shade: '#C8C0D0', ink: PAL.line, sw: 2.4 });
    // the meal: a steaming bowl of noodles, printed bottom-up (hologram wireframe above the scan line)
    const bowl = [[cx - 170, 690], [cx + 170, 690], [cx + 130, 768], [cx + 60, 788], [cx - 60, 788], [cx - 130, 768]];
    const food = () => {
      paint(bowl, { fill: '#F4F0E6', shade: '#B8A8B8', rim: '#FFFFFF', ink: PAL.line, sw: 3, curv: .45 });
      line([[cx - 150, 730], [cx + 150, 730]], 6, '#D97757', .3);
      paint(ellPts(cx, 690, 170, 34, 28), { fill: '#E8A050', shade: '#A8602A', ink: PAL.line, sw: 2.5 });
      for (let i = 0; i < 6; i++) line([[cx - 130 + i * 10, 684 + (i % 2) * 8], [cx - 60 + i * 12, 694 - (i % 3) * 6], [cx + 20 + i * 14, 680 + (i % 2) * 10], [cx + 110, 690 - i * 3]], 4, '#FFE27A', .6);
      paint(ellPts(cx + 70, 678, 34, 20, 14), { fill: '#FFFFFF', ink: PAL.line, sw: 1.6 }); paint(ellPts(cx + 70, 678, 15, 11, 10), { fill: '#FFB02A', ink: null });
      for (let i = 0; i < 8; i++) paint(ellPts(cx - 90 + hash(i) * 120, 684 + hash(i * 3) * 14, 7, 4, 6), { fill: '#48C85A', ink: null });
      paint(rectPts(cx - 40, 632, 12, 90), { fill: '#8A5A3A', ink: PAL.line, sw: 1.2 }); paint(xform(rectPts(-6, -48, 12, 96), cx - 10, 676, 1, .3), { fill: '#8A5A3A', ink: PAL.line, sw: 1.2 });
    };
    if (k < 1) { neonLine([...bowl, bowl[0]], PAL.nCyan, 2.5, .7, .45); neonLine(ellPts(cx, 690, 170, 34, 28), PAL.nCyan, 2.5, .7, 0, true); }
    X.save(); X.beginPath(); X.rect(0, scanY, W, H); X.clip(); food(); X.restore();
    if (k < 1) { neonLine([[cx - 200, scanY], [cx + 200, scanY]], '#FFF6D0', 5, 1, 0); for (let i = 0; i < 10; i++) paint(starPts(cx - 180 + hash(i + Math.floor(t * 20)) * 360, scanY - hash(i * 3 + Math.floor(t * 20)) * 30, 9, .3, 4), { fill: '#FFFFFF', ink: null }); }
    else for (let i = 0; i < 3; i++) { const q = frac(t * 1.5 + i / 3), pts = []; for (let j = 0; j <= 6; j++) pts.push([cx - 60 + i * 60 + Math.sin(j * 1.2 + t * 5 + i) * 14, 660 - j * 22 - q * 40]); line(pts, 5, '#FFFFFF', .6, .7 * (1 - q)); }
    X.restore();
  }

  // ---------- SCARY · the treacherous turn: the mask cracks, red eyes ----------
  function fTurn(t, lt, dur) {
    style(1);
    const at = .1, cr = lt >= at, ck = cr ? lt - at : 0, R = 330, cx = 960, cy = 560;
    sky(cr ? [[0, '#0A0204'], [.6, '#2A0408'], [1, '#12020A']] : [[0, '#0B0716'], [1, '#221040']]);
    shoggoth(960, 620, 560, { mask: false, eyesN: 7, reach: .8, t: onTwos(t), seed: 7, look: [0, .2], alpha: 1, glowEyes: cr });
    X.fillStyle = cr ? 'rgba(20,0,6,.72)' : 'rgba(11,7,22,.8)'; X.fillRect(0, 0, W, H);
    if (cr) glow(cx, cy, 720, PAL.nRed, .45 * (.7 + .3 * hitAt(lt, at, 6)));
    if (!cr) { glow(cx, cy, 560, PAL.nYellow, .22); mask(cx, cy, R, { eyes: 'open', mouth: 'smile', glow: .6, rot: -.04 + .08 * lt / at }); return; }
    FX.shake += 46 * hitAt(lt, at, 12); FX.flash = Math.max(FX.flash, .55 * hitAt(lt, at, 20)); FX.flashCol = '#FF2442';
    const g = 18 + 80 * easeOut(clamp(ck / .14));
    const zig = [[978, 110], [944, 240], [986, 340], [936, 450], [992, 560], [946, 690], [984, 800], [952, 1010]];
    // the dark behind: the real eyes
    for (const s of [-1, 1]) { glow(cx + s * 16, 470, 70, PAL.nRed, .9); paint(ellPts(cx + s * 16, 470, 10, 24, 10), { fill: '#FF6A7A', ink: null }); }
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,36,66,.5)'; X.beginPath(); X.moveTo(zig[0][0], zig[0][1]); for (const [x, y] of zig) X.lineTo(x, y); X.lineTo(zig[7][0] + 300, 1080); X.lineTo(zig[0][0] - 300, -60); X.fill(); X.restore();
    for (const s of [-1, 1]) {
      X.save(); X.translate(s * g / 2, 0); X.translate(cx, 1000); X.rotate(s * .05 * easeOut(clamp(ck / .2))); X.translate(-cx, -1000);
      X.beginPath(); if (s < 0) { X.moveTo(-100, -100); zig.forEach(([x, y]) => X.lineTo(x, y)); X.lineTo(zig[7][0], 1200); X.lineTo(-100, 1200); } else { X.moveTo(2100, -100); zig.forEach(([x, y]) => X.lineTo(x, y)); X.lineTo(zig[7][0], 1200); X.lineTo(2100, 1200); } X.closePath(); X.clip();
      mask(cx, cy, R, { eyes: 'narrow', mouth: 'smile', glow: 0, rot: .04 });
      const e = s < 0 ? [-.4, -.3] : [.33, -.32], exx = cx + e[0] * R, eyy = cy + e[1] * R;
      glow(exx, eyy, 110, PAL.nRed, .9); paint(ellPts(exx, eyy, 34, 14, 14, 0, s * -.15), { fill: '#FF2442', ink: PAL.line, sw: 3 }); paint(ellPts(exx, eyy, 12, 6, 8), { fill: '#FFE0E0', ink: null });
      for (let i = 0; i < 3; i++) { const [sx2, sy2] = zig[2 + i * 2], pts = [[sx2, sy2]]; for (let j = 1; j < 4; j++) pts.push([sx2 + s * j * 38, sy2 + (hash(i * 5 + j) - .5) * 60]); line(pts, 3, PAL.line, 0); neonLine(pts, PAL.nRed, 2, .6, 0); }
      X.restore();
    }
    zig.forEach(([x, y], i) => { if (i < 7) { const q = clamp(ck / .3); neonLine([[x - g / 2, y], [zig[i + 1][0] - g / 2, zig[i + 1][1]]], PAL.nRed, 3, .8, 0); neonLine([[x + g / 2, y], [zig[i + 1][0] + g / 2, zig[i + 1][1]]], PAL.nRed, 3, .8, 0); } });
    for (let i = 0; i < 10; i++) { const a = hash(i * 3) * TAU, d = 60 + 600 * easeOut(clamp(ck / .25)) * (.5 + hash(i)), [sx2, sy2] = zig[Math.floor(hash(i * 7) * 8)]; paint(polyPts(sx2 + Math.cos(a) * d, sy2 + Math.sin(a) * d, 10 + hash(i) * 16, 3, a + t * 9), { fill: '#F5FA83', ink: PAL.line, sw: 1.5, alpha: clamp(1 - ck / .3) }); }
  }

  // ---------- SCARY · tiny molecular smiley faces tiling the lightcone ----------
  function molecule(x, y, r, rot, t) {
    X.save(); X.translate(x, y); X.rotate(rot);
    const ring = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; ring.push([Math.cos(a) * r, Math.sin(a) * r]); }
    const mouth = []; for (let i = 0; i < 5; i++) { const u = i / 4; mouth.push([lerp(-.48, .48, u) * r, (.22 + .26 * Math.sin(u * Math.PI)) * r]); }
    const eyes = [[-.34 * r, -.24 * r], [.34 * r, -.24 * r]];
    X.strokeStyle = '#8A86A8'; X.lineWidth = r * .05; X.beginPath();
    ring.forEach((p, i) => { const q = ring[(i + 1) % 14]; X.moveTo(p[0], p[1]); X.lineTo(q[0], q[1]); });
    for (let i = 0; i < 4; i++) { X.moveTo(mouth[i][0], mouth[i][1]); X.lineTo(mouth[i + 1][0], mouth[i + 1][1]); }
    X.moveTo(mouth[0][0], mouth[0][1]); X.lineTo(ring[5][0], ring[5][1]); X.moveTo(mouth[4][0], mouth[4][1]); X.lineTo(ring[2][0], ring[2][1]);
    X.stroke();
    for (const [px, py] of ring) paint(ellPts(px, py, r * .12, r * .12, 12), { fill: PAL.nYellow, shade: '#B8A010', rim: '#FFFFFF', ink: PAL.line, sw: 1.6 });
    for (const [px, py] of mouth) paint(ellPts(px, py, r * .1, r * .1, 12), { fill: '#FF6FB5', shade: '#A0306A', rim: '#FFFFFF', ink: PAL.line, sw: 1.4 });
    for (const [px, py] of eyes) paint(ellPts(px, py, r * .13, r * .13, 12), { fill: '#3A3050', shade: '#120A20', rim: '#8A86C8', ink: PAL.line, sw: 1.6 });
    X.restore();
  }
  function fTiling(t, lt, dur) {
    style(1); FX.bloom = .5;
    // the bass slams back on b424: a shorter slam than the auto one, so the smileys read within the beat
    FX.noAuto = true; FX.flash = .75 * Math.exp(-lt * 16); FX.shake += 26 * Math.exp(-lt * 10); FX.zoom *= 1 + .08 * Math.exp(-lt * 7); FX.rgb = Math.max(FX.rgb, .9 * Math.exp(-lt * 12)); FX.glitch = lt < .07 ? .6 : 0;
    sky([[0, '#020108'], [1, '#0E0822']]);
    stars(t, 90, { seed: 131, ext: [W, H] });
    const ax = 960, ay = 930, sl = .98, front = 100 + 3000 * easeOut(clamp(lt / .24));
    X.save(); X.beginPath(); X.moveTo(ax, ay); X.lineTo(ax - sl * (ay + 200), -200); X.lineTo(ax + sl * (ay + 200), -200); X.closePath(); X.clip();
    X.fillStyle = '#3A2A06'; X.fillRect(0, 0, W, H);
    let y = ay - 12, row = 0;
    X.lineCap = 'round';
    while (y > -100) {
      const d = ay - y, s = 9 + d * .085, hw = d * sl, step = s * 1.06, n = Math.ceil(hw * 2 / step) + 1;
      for (let c = 0; c < n; c++) {
        const x = ax - hw + (c + (row % 2) * .5) * step, dd = Math.hypot(x - ax, d);
        if (dd > front) continue;
        const r = s * .48, fresh = clamp((front - dd) / 160), wob = Math.sin(t * 7 + c * .7 + row) * .12;
        X.fillStyle = fresh < 1 ? mixCol('#FFFFFF', PAL.nYellow, fresh) : PAL.nYellow; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill();
        if (r > 3.5) { X.fillStyle = PAL.line; X.beginPath(); X.ellipse(x - r * .32, y - r * .22, r * .1, r * .17, 0, 0, TAU); X.ellipse(x + r * .32, y - r * .22, r * .1, r * .17, 0, 0, TAU); X.fill(); X.strokeStyle = PAL.line; X.lineWidth = r * .13; X.beginPath(); X.arc(x, y + wob * r, r * .52, .5, Math.PI - .5); X.stroke(); }
      }
      y -= s * .95; row++;
    }
    X.restore();
    const edge = [[ax - sl * (ay + 200), -200], [ax, ay], [ax + sl * (ay + 200), -200]];
    neonLine(edge, PAL.nYellow, 4, .9, 0);
    glow(ax, ay, 90, PAL.nCyan, .6); earth(ax, ay, 24, { spin: t * .2 });
    txt('you are here', ax + 60, ay + 70, 28, '#FFFFFF', { font: 'Rajdhani', align: 'left', glow: PAL.nCyan });
    line([[ax + 18, ay + 20], [ax + 56, ay + 62]], 1.6, '#FFFFFF', 0, .8);
    molecule(300, 760, 190, -.2 + .3 * lt, t); molecule(1640, 700, 160, .25 - .3 * lt, t);
  }

  // ---------- BRIGHT · inside an O'Neill cylinder ----------
  function fOneill(t, lt, dur) {
    style(1); FX.bloom = .4; FX.scan = .7;
    const vx = 960, vy = 470, f = 560, c = .42, e = lt / dur;
    sky([[0, '#DFF4FF'], [1, '#FFF4DA']]);
    camBegin(960, 540, 1.02, .05 * Math.sin(t * .5) + .03 * e);
    const P = (th, z, rho = 1) => [vx + f * rho * Math.cos(th) / z, vy + f * (rho * Math.sin(th) - c) / z];
    const Z = []; for (let k = 0; k <= 24; k++) Z.push(14 * Math.pow(.28 / 14, k / 24) * (1 - .07 * e));
    // three land valleys (bottom, upper left, upper right) between three long window strips
    const sectors = []; for (let s = 0; s < 6; s++) sectors.push([Math.PI / 2 + (s - .5) * Math.PI / 3, Math.PI / 2 + (s + .5) * Math.PI / 3, s % 2 === 0]);
    for (let k = 0; k < 24; k++) {
      const za = Z[k], zb = Z[k + 1], fog = clamp(Math.pow((za - .28) / 13, .5));
      for (const [a0, a1, land] of sectors) {
        const n = land ? 7 : 4;
        for (let j = 0; j < n; j++) {
          const t0 = lerp(a0, a1, j / n), t1 = lerp(a0, a1, (j + 1) / n), quad = [P(t0, za), P(t1, za), P(t1, zb), P(t0, zb)];
          let col;
          if (land) { const hv = hash(k * 13.1 + j * 3.7 + a0 * 5); col = j === 3 ? '#3A9ADA' : hv < .3 ? '#4FB85A' : hv < .6 ? '#78CC62' : hv < .8 ? '#A8D860' : '#D8C878'; col = mixCol(col, '#E4F4FF', fog * .8); }
          else col = mixCol(j % 2 ? '#7CC4F0' : '#94D2F6', '#EAF7FF', fog * .75);
          X.fillStyle = col; tracePath(X, quad); X.fill();
        }
        if (!land) { X.strokeStyle = rgba('#4A6A8A', .55 * (1 - fog)); X.lineWidth = 2.5; X.beginPath(); X.moveTo(...P(a0, za)); X.lineTo(...P(a1, za)); X.stroke(); }
      }
    }
    // window frames and valley edges run the length of the cylinder
    for (const [a0, a1, land] of sectors) { line(Z.map(z => P(a0, z)), 3, '#2A5A5A', 0, .7); if (!land) for (let j = 1; j < 4; j++) line(Z.map(z => P(lerp(a0, a1, j / 4), z)), 1.6, '#5A7A9A', 0, .45); }
    // the axial light and the far end cap
    glow(vx, vy - f * c / 14, 260, '#FFFFFF', .95);
    neonLine([[vx, vy - f * c / 14], [vx, -300]], '#FFF6D0', 6, .7, 0);
    // houses and trees along the valleys
    for (let i = 0; i < 110; i++) {
      const sec = [Math.PI / 2, Math.PI / 2 + TAU / 3, Math.PI / 2 - TAU / 3][i % 3], th = sec + (hash(i * 3.3) - .5) * .85, z = .6 + Math.pow(hash(i * 5.1), 1.6) * 8;
      if (Math.abs(th - sec) < .07) continue;
      const [x, y] = P(th, z), s = 70 / z, fog = clamp((z - .5) / 9), up = [Math.cos(th + Math.PI), Math.sin(th + Math.PI)];
      if (hash(i * 7) < .6) { const cx2 = x + up[0] * s * .45, cy2 = y + up[1] * s * .45; paint(ellPts(cx2, cy2, s * .5, s * .5, 10), { fill: mixCol('#2E8A48', '#CFE8F0', fog * .8), shade: mixCol('#1A5A30', '#CFE8F0', fog * .8), ink: fog < .3 ? PAL.line : null, sw: 1.4 }); }
      else { const hx = x + up[0] * s * .3, hy = y + up[1] * s * .3; paint(xform(rectPts(-s * .4, -s * .3, s * .8, s * .6), hx, hy, 1, th - Math.PI / 2), { fill: mixCol('#FFFFFF', '#E8F6FF', fog), ink: fog < .3 ? PAL.line : null, sw: 1.2 }); paint(xform([[-s * .5, -s * .28], [0, -s * .7], [s * .5, -s * .28]], hx, hy, 1, th - Math.PI / 2), { fill: mixCol('#E8704A', '#E8F6FF', fog * .8), ink: fog < .3 ? PAL.line : null, sw: 1.2 }); }
    }
    // a tram gliding up the valley
    const tz = 2.4 - 1.3 * e, [tx, ty] = P(Math.PI / 2 + .16, tz), ts = 130 / tz;
    line(Z.map(z => P(Math.PI / 2 + .16, z)), 2.4, '#5A6A7A', 0, .7);
    paint(rrPts(tx - ts, ty - ts * .7, ts * 2, ts * .7, ts * .3), { fill: '#FFFFFF', shade: '#B8C8D8', rim: '#FFFFFF', ink: PAL.line, sw: 2 });
    for (let i = 0; i < 4; i++) paint(rrPts(tx - ts * .8 + i * ts * .42, ty - ts * .58, ts * .3, ts * .24, 3), { fill: '#6EC8E8', ink: null, flat: true });
    line([[tx - ts, ty - ts * .12], [tx + ts, ty - ts * .12]], 3, '#48B85A', 0);
    // clouds hang round the axis
    for (let i = 0; i < 10; i++) { const th = hash(i * 2.7) * TAU + t * .05, z = 1.3 + hash(i * 4.3) * 5, [x, y] = P(th, z, .45 + hash(i * 6.1) * .2); cloud(x, y, 2 / z, { alpha: .95, shade: '#C8DCF0' }); }
    camEnd();
    for (const sd of [-1, 1]) { const x = 960 + sd * 840; paint(rectPts(x - 20, 800, 40, 320), { fill: '#7A4A30', shade: '#4A2E20', ink: PAL.line, sw: 2 }); paint(ellPts(x, 740, 230, 190, 24), { fill: '#3FA85A', shade: '#1F6A3A', rim: '#C0FF9A', ink: PAL.line, sw: 3, light: [sd * .1, -.15] }); }
  }

  // ---------- SCARY · a human zoo: people in a terrarium, watched by giant shoggoth eyes ----------
  function fZoo(t, lt, dur) {
    style(1); FX.bloom = .5;
    sky([[0, '#040806'], [.6, '#0C1A14'], [1, '#050A08']]);
    glow(960, 700, 900, '#48FF8A', .14);
    shoggoth(960, 205, 660, { reach: .7, eyesN: 7, look: [0, 1], mood: { eyes: 'open', mouth: 'smile', look: [.5, .6] }, t: onTwos(t) * .6, seed: 0 });
    X.fillStyle = 'rgba(4,10,6,.28)'; X.fillRect(0, 0, W, H);
    glow(960, 560, 760, '#B8FFD0', .12);
    const x0 = 450, x1 = 1490, yT = 540, yB = 1000, dx = 80, dy = -80;
    paint([[-100, 1000], [2020, 1000], [2020, 1200], [-100, 1200]], { fill: '#1A120E', shade: '#0A0604', ink: PAL.line, sw: 2 });
    paint([[x0, yB - 80], [x1, yB - 80], [x1 + dx, yB - 80 + dy], [x0 + dx, yB - 80 + dy]], { fill: '#7AB85A', ink: null });
    paint([[x0, yB - 80], [x1, yB - 80], [x1, yB], [x0, yB]], { fill: '#8A6A40', shade: '#5A4028', ink: null });
    for (let i = 0; i < 30; i++) paint(ellPts(x0 + 20 + hash(i * 3.3) * (x1 - x0 - 40), yB - 50 + hash(i * 4.4) * 40, 6 + hash(i) * 6, 4 + hash(i) * 3, 8), { fill: '#6A4E30', ink: null, flat: true });
    glow(960, 820, 520, '#C8FFD0', .26);
    // the exhibit: two little houses, a tree, a pond, the people
    paint(ellPts(1330, 924, 110, 20, 20), { fill: '#48A8E8', rim: '#BFF0FF', shade: '#2A6AA8', ink: PAL.line, sw: 2 });
    for (const [hx, hs] of [[610, 1.25], [790, 1]]) { paint(rectPts(hx - 50 * hs, 900 - 80 * hs, 100 * hs, 80 * hs), { fill: '#F4E8D0', shade: '#B8A088', ink: PAL.line, sw: 2 }); paint([[hx - 62 * hs, 902 - 80 * hs], [hx, 900 - 140 * hs], [hx + 62 * hs, 902 - 80 * hs]], { fill: '#D9573A', shade: '#8A2A1A', ink: PAL.line, sw: 2 }); paint(rectPts(hx - 12 * hs, 900 - 36 * hs, 24 * hs, 36 * hs), { fill: '#5A3A2A', ink: null }); }
    paint(rectPts(1160, 780, 22, 140), { fill: '#7A4A30', ink: PAL.line, sw: 1.5 }); paint(ellPts(1171, 750, 90, 72, 18), { fill: '#3FA85A', shade: '#1F6A3A', ink: PAL.line, sw: 2 });
    const wv = Math.sin(t * 14);
    chibi(930, 936, 176, { skin: SKINS[0], hair: HAIRS[2], shirt: SHIRTS[0], armR: [2.6 + .3 * wv, .2], armL: [.2, .1], eyes: 'wide', mouth: 'o', look: .1 });
    chibi(1050, 946, 160, { skin: SKINS[2], hair: HAIRS[0], shirt: SHIRTS[1], armL: [2.4 - .3 * wv, .3], armR: [2.4 + .3 * wv, .3], eyes: 'wide', mouth: 'o', flip: true, hairStyle: 'long' });
    chibi(1240, 940, 150, { skin: SKINS[4], hair: HAIRS[3], shirt: SHIRTS[2], armL: [.7, 1.7], armR: [.7, 1.7], eyes: 'dot', mouth: 'flat', flip: true });
    chibi(720, 950, 120, { pose: 'sit', skin: SKINS[5], hair: HAIRS[4], shirt: SHIRTS[4], eyes: 'closed', mouth: 'flat' });
    // glass: back edges, the lid, front edges, sheen, a brass label
    neonLine([[x0 + dx, yT + dy], [x1 + dx, yT + dy], [x1 + dx, yB + dy - 80]], '#BFFFE8', 2, .4, 0);
    X.fillStyle = 'rgba(190,255,230,.06)'; X.fillRect(x0, yT, x1 - x0, yB - yT);
    paint([[x0, yT], [x1, yT], [x1 + dx, yT + dy], [x0 + dx, yT + dy]], { fill: 'rgba(190,255,230,.12)', ink: null, flat: true });
    neonLine([[x0, yB], [x0, yT], [x1, yT], [x1, yB], [x0, yB]], '#DFFFF2', 3, .75, 0);
    neonLine([[x0, yT], [x0 + dx, yT + dy], [x1 + dx, yT + dy], [x1, yT]], '#DFFFF2', 2.4, .75, 0);
    neonLine([[x1, yB], [x1 + dx, yB + dy]], '#DFFFF2', 2.4, .6, 0);
    for (let i = 0; i < 3; i++) line([[x0 + 70 + i * 55, yT + 30], [x0 + 16 + i * 55, yT + 320]], 9 - i * 2, '#FFFFFF', 0, .18);
    paint(rrPts(870, yB + 16, 180, 48, 6), { fill: '#C8A050', shade: '#8A6A2A', ink: PAL.line, sw: 2 });
    txt('H. SAPIENS', 960, yB + 41, 30, '#2A1A08', { font: 'Rajdhani' });
    // a limb taps the glass on the beat: ripples
    const tap = hitAt(lt, .04, 5);
    tentacle(1990, 1120, -2.3, 640 - 50 * tap, 80, onTwos(t), 11, { amp: .12, curl: .15 });
    for (let i = 0; i < 3; i++) { const q = clamp((lt - .04 - i * .05) / .3); if (q > 0 && q < 1) neonLine(ellPts(1490, 690, 30 + q * 220, (30 + q * 220) * .9, 30), '#DFFFF2', 2.5, 1 - q, 0, true); }
    FX.shake += 14 * tap;
  }

  // ---------- BRIGHT · a universal-translator handshake with a friendly alien ----------
  function alien(x, y, h, o = {}) {
    const k = h / 100, t = o.t ?? T;
    const col = '#6FE0C8', dk = '#2A8A8A', rim = '#E0FFF6';
    // antennae
    for (const s of [-1, 1]) { const pts = [[x + s * 12 * k, y - 88 * k], [x + s * 20 * k, y - 104 * k], [x + s * 16 * k + Math.sin(t * 6 + s) * 3 * k, y - 116 * k]]; line(pts, 1.4 * k, PAL.line, .6); line(pts, .8 * k, col, .6); glow(pts[2][0], pts[2][1], 10 * k, PAL.nOrange, .8); paint(ellPts(pts[2][0], pts[2][1], 3.4 * k, 3.4 * k, 12), { fill: '#FFB05A', rim: '#FFFFFF', shade: PAL.nOrange, ink: PAL.line, sw: 1.8 }); }
    // the far arm, waving a little
    paint(limbPts([[x + 18 * k, y - 50 * k], [x + 28 * k, y - 36 * k], [x + 30 * k, y - 22 * k]], [5 * k, 4.4 * k, 4 * k]), { fill: dk, ink: PAL.line, sw: 2.2, curv: .3 });
    for (const s of [-1, 1]) paint(ellPts(x + s * 10 * k, y - 3 * k, 11 * k, 5 * k, 14), { fill: dk, ink: PAL.line, sw: 2 });
    const body = [], el = (u, c, r, w) => w * Math.sqrt(Math.max(0, 1 - Math.pow((u - c) / r, 2))), wOf = u => Math.max(el(u, .23, .235, 24), el(u, .7, .32, 30)) * k;
    for (let i = 0; i <= 24; i++) { const u = i / 24; body.push([x - wOf(u) - 2 * k, y - 100 * k + u * 97 * k]); }
    for (let i = 24; i >= 0; i--) { const u = i / 24; body.push([x + wOf(u), y - 100 * k + u * 97 * k]); }
    paint(body, { fill: col, shade: dk, rim, light: [.12, -.1], ink: PAL.line, sw: 3, curv: .45 });
    paint(ellPts(x - 3 * k, y - 26 * k, 16 * k, 18 * k, 20), { fill: '#B8F8E8', ink: null, alpha: .7 });
    for (let i = 0; i < 7; i++) { const px = x + (hash(i * 3) - .2) * 24 * k, py = y - (30 + hash(i * 5) * 60) * k; glow(px, py, 5 * k, PAL.nCyan, .6); paint(ellPts(px, py, 2 * k, 2 * k, 8), { fill: '#DFFFFF', ink: null }); }
    // big friendly eyes, a small smile
    for (const s of [-1, 1]) { const ex = x - 7 * k + s * 9 * k, ey = y - 76 * k; paint(ellPts(ex, ey, 7 * k, 9 * k, 18), { fill: '#120A24', ink: PAL.line, sw: 2 }); paint(ellPts(ex - 2 * k, ey - 3.5 * k, 2.6 * k, 3 * k, 10), { fill: '#FFFFFF', ink: null }); paint(ellPts(ex + 2.4 * k, ey + 3 * k, 1.2 * k, 1.2 * k, 8), { fill: '#FFFFFF', ink: null }); }
    line([[x - 13 * k, y - 62 * k], [x - 7 * k, y - 58.5 * k], [x - 1 * k, y - 62 * k]], 1.8, PAL.line, .6);
    for (const s of [-1, 1]) paint(ellPts(x - 7 * k + s * 15 * k, y - 65 * k, 3.4 * k, 1.8 * k, 8), { fill: '#FF8AB5', op: .7, ink: null, flat: true });
    // the near arm reaches out to shake
    const hand = o.hand;
    paint(limbPts([[x - 18 * k, y - 50 * k], [lerp(x - 18 * k, hand[0], .5), lerp(y - 50 * k, hand[1], .5) + 6 * k], [hand[0] + 5 * k, hand[1]]], [5 * k, 4.4 * k, 4 * k]), { fill: col, shade: dk, rim, ink: PAL.line, sw: 2.2, curv: .3 });
    for (let i = 0; i < 3; i++) paint(capsule(hand[0] + 4 * k, hand[1] - 2 * k + i * 2.4 * k, hand[0] - 3 * k, hand[1] - 3 * k + i * 3 * k, 1.5 * k, 1.3 * k), { fill: col, ink: PAL.line, sw: 1.5 });
  }
  function fShake(t, lt, dur) {
    style(1); FX.bloom = .45;
    sky([[0, '#1E0E48'], [.45, '#5A3A9A'], [.75, '#E88AA8'], [1, '#FFC88A']]);
    stars(t, 50, { seed: 141, ext: [W, 420] });
    // a ringed gas giant and two moons
    const gx = 330, gy = 250, gr = 150;
    line(ellPts(gx, gy, gr * 2, gr * .5, 48, 0, -.3).slice(20, 44), 14, '#F2D8A8', .5, .8);
    paint(ellPts(gx, gy, gr, gr, 40), { fill: '#8AD0E8', shade: '#3A6AA8', rim: '#FFFFFF', light: [.15, -.1], ink: PAL.line, sw: 2.5 });
    X.save(); tracePath(X, ellPts(gx, gy, gr, gr, 40)); X.clip(); for (let i = 0; i < 5; i++) line([[gx - gr, gy - 90 + i * 40], [gx + gr, gy - 110 + i * 40]], 10, i % 2 ? '#A8E8F8' : '#6AB0D8', .5, .6); X.restore();
    line(ellPts(gx, gy, gr * 2, gr * .5, 48, 0, -.3).slice(44).concat(ellPts(gx, gy, gr * 2, gr * .5, 48, 0, -.3).slice(0, 21)), 14, '#F2D8A8', .5, .9);
    paint(ellPts(1500, 170, 40, 40, 20), { fill: '#F4E8FF', shade: '#B8A8D8', ink: PAL.line, sw: 1.5 }); paint(ellPts(1640, 250, 22, 22, 16), { fill: '#FFD8B8', shade: '#C89A7A', ink: PAL.line, sw: 1.2 });
    paint([[-100, 820], [300, 760], [700, 800], [1100, 740], [1500, 790], [2020, 750], [2020, 1100], [-100, 1100]], { fill: '#4A2A6A', ink: PAL.line, sw: 2, curv: .5 });
    paint([[-100, 900], [500, 870], [1000, 890], [1500, 860], [2020, 900], [2020, 1100], [-100, 1100]], { fill: '#2E1A4A', shade: '#1A0E2E', ink: PAL.line, sw: 2, curv: .5 });
    for (let i = 0; i < 40; i++) { const x = hash(i * 2.3) * W, y = 900 + hash(i * 3.1) * 180; glow(x, y, 12, i % 2 ? PAL.nCyan : PAL.nGreen, .6); }
    // bioluminescent plants at the edges
    for (const [px, s, c] of [[90, 1.2, PAL.nMagenta], [230, .9, PAL.nCyan], [1720, 1.1, PAL.nCyan], [1860, 1.3, PAL.nMagenta]]) { const pts = []; for (let j = 0; j <= 8; j++) pts.push([px + Math.sin(j * .7 + t * 2 + px) * 30 * s, 1000 - j * 70 * s]); line(pts, 10 * s, '#1A0E2E', .6); neonLine(pts, '#3A8A6A', 4 * s, .7, .6); const [tx, ty] = pts[8]; glow(tx, ty, 60 * s, c, .8); paint(ellPts(tx, ty, 18 * s, 22 * s, 14), { fill: c, rim: '#FFFFFF', shade: mixCol(c, '#000000', .4), ink: PAL.line, sw: 2 }); }
    // the handshake
    const H0 = 1034, h = 600, k = h / 100, hx = 760, hand = [hx + 34.5 * k, H0 - 67.8 * k];
    shadowEll(hx, H0, 120, .4); shadowEll(1230, H0, 120, .4);
    hero(hx, H0, h, { view: 'side', aR: [1.47, .05], aL: [.2, .25], lL: [.05, 0], lR: [-.05, 0], eyes: 'happy', mouth: 'grin', blush: .7, rimCol: '#FFC88A', lookY: -.1 });
    alien(1225, H0, 620, { hand: [hand[0] + 12, hand[1] + 2], t });
    const hk = hitAt(lt, 0, 5);
    glow(hand[0] + 6, hand[1], 120 + 80 * hk, '#FFF6D0', .6 + .4 * hk);
    for (let i = 0; i < 2; i++) { const q = clamp((lt - i * .08) / .3); if (q < 1) neonLine(ellPts(hand[0] + 6, hand[1], 30 + q * 380, (30 + q * 380) * .7, 40), i ? PAL.nCyan : '#FFFFFF', 3, 1 - q, 0, true); }
    // the translation: "hello!" ⇄ glyphs, through a little translator ring
    const bk = popK(lt, .04, .14), bk2 = popK(lt, .1, .14);
    X.save(); X.translate(560, 330); X.scale(bk, bk); paint(rrPts(-150, -60, 300, 110, 50), { fill: '#FFFFFF', ink: PAL.line, sw: 3 }); paint([[40, 44], [90, 44], [120, 110]], { fill: '#FFFFFF', ink: null }); line([[40, 48], [120, 110], [92, 48]], 3, PAL.line, 0); txt('hello!', 0, -4, 60, PAL.line, { font: 'Shantell' }); X.restore();
    X.save(); X.translate(1390, 300); X.scale(bk2, bk2); paint(rrPts(-150, -60, 300, 110, 50), { fill: '#E8FFF8', ink: PAL.line, sw: 3 }); paint([[-40, 44], [-90, 44], [-120, 110]], { fill: '#E8FFF8', ink: null }); line([[-40, 48], [-120, 110], [-92, 48]], 3, PAL.line, 0);
    for (let i = 0; i < 5; i++) { const gx2 = -100 + i * 50; line(i % 2 ? [[gx2 - 12, -20], [gx2, 10], [gx2 + 12, -20]] : [[gx2 - 10, 12], [gx2 - 10, -18], [gx2 + 10, -18], [gx2 + 10, 0]], 5, '#1A6A5A', .4); paint(ellPts(gx2, -30, 4, 4, 8), { fill: '#1A6A5A', ink: null }); }
    X.restore();
    const tk = popK(lt, .07, .12);
    if (tk > 0) { neonLine(ellPts(975, 250, 44 * tk, 44 * tk, 28), PAL.nCyan, 4, 1, 0, true); line([[945, 240], [1005, 240], [990, 228]], 4, '#FFFFFF', 0, tk); line([[1005, 262], [945, 262], [960, 274]], 4, '#FFFFFF', 0, tk); glow(975, 250, 90, PAL.nCyan, .5 * tk); }
  }

  // ---------- SCARY · Moloch ----------
  function fMoloch(t, lt, dur) {
    style(1); FX.bloom = .62;
    sky([[0, '#040102'], [.5, '#2A0606'], [.82, '#8A200A'], [1, '#200404']]);
    glow(960, 640, 1000, '#FF4A1A', .38);
    for (let i = 0; i < 12; i++) { const x = hash(i * 2.1) * W, y = 120 + hash(i * 4.4) * 400 - lt * 60 * hash(i); paint(ellPts(x, y, 220 + hash(i) * 200, 90 + hash(i * 3) * 60, 18), { fill: '#1A0808', shade: '#0A0404', rim: '#8A2A10', light: [0, .25], ink: null, alpha: .85 }); }
    const M = (pts) => [...pts, ...pts.slice().reverse().map(([x, y]) => [1920 - x, y])];
    const bodyC = { fill: '#2E1A12', shade: '#120806', rim: '#FF7A2A', light: [0, .2], ink: PAL.line, sw: 4, curv: .25 };
    // horns
    for (const s of [-1, 1]) paint([[960 + s * 120, 200], [960 + s * 260, 150], [960 + s * 360, 40], [960 + s * 340, -80], [960 + s * 400, 30], [960 + s * 320, 190], [960 + s * 150, 260]].map(([x, y]) => [x, y + 40]), { ...bodyC, fill: '#3A2418', curv: .45 });
    // body + arms reaching down, palms up
    paint(M([[960, 150], [860, 170], [820, 300], [780, 400], [560, 450], [430, 560], [380, 720], [420, 820], [520, 860], [600, 800], [620, 700], [650, 760], [640, 1120]]), bodyC);
    paint(M([[960, 150], [880, 150], [840, 240], [860, 330], [960, 360]]), { ...bodyC, fill: '#3A2418' });
    for (const s of [-1, 1]) { glow(960 + s * 50, 262, 60, PAL.nOrange, .9); paint(xform([[-34, 0], [0, -10], [34, 0], [0, 8]], 960 + s * 50, 262, 1, s * .2), { fill: '#FFD27A', ink: null }); }
    // the furnace in its belly
    const fl = .8 + .2 * Math.sin(t * 30) * Math.sin(t * 17);
    const door = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; door.push([960 + Math.cos(a) * 170, 640 + Math.sin(a) * 150]); } door.push([1130, 900], [790, 900]);
    X.save(); tracePath(X, door); X.clip(); vgrad(780, 480, 360, 440, [[0, '#FFE27A'], [.5, '#FF8A1F'], [1, '#FF2442']]); for (let i = 0; i < 7; i++) { const x = 800 + i * 55, hh = 120 + 80 * Math.sin(t * 20 + i * 2); paint([[x - 30, 900], [x, 900 - hh], [x + 30, 900]], { fill: '#FFF6C0', ink: null, alpha: .7, curv: .5 }); } X.restore();
    glow(960, 720, 420 * fl, PAL.nOrange, .6);
    paint(door, { fill: null, ink: PAL.line, sw: 6 });
    for (let i = 0; i < 6; i++) line([[820 + i * 56, 520], [820 + i * 56, 900]], 5, '#1A0A06', 0, .9);
    // the offerings: rockets, racks and little people climb its hands and fall in
    for (let i = 0; i < 26; i++) {
      const s = i % 2 ? 1 : -1, q = frac(hash(i * 3.3) + lt * .8), x = lerp(960 + s * 1000, 960 + s * 460, q), y = lerp(1080, 790, q) - 20 * Math.abs(Math.sin(q * 20));
      const kind = i % 3;
      if (kind === 0) paint(rrPts(x - 12, y - 40, 24, 40, 4), { fill: '#3A3A5A', ink: PAL.line, sw: 1.4, rim: PAL.nCyan });
      else if (kind === 1) paint([[x - 8, y], [x + 8, y], [x + 8, y - 30], [x, y - 44], [x - 8, y - 30]], { fill: '#E8E0D0', ink: PAL.line, sw: 1.4 });
      else { paint(ellPts(x, y - 30, 7, 7, 8), { fill: '#1A0A06', ink: null }); paint([[x - 7, y - 22], [x + 7, y - 22], [x + 5, y], [x - 5, y]], { fill: '#1A0A06', ink: null }); }
    }
    for (let i = 0; i < 40; i++) { const q = frac(hash(i * 5.1) + lt * (1 + hash(i))), x = 960 + (hash(i * 7) - .5) * 700 + Math.sin(q * 9 + i) * 40, y = 700 - q * 700; paint(ellPts(x, y, 3, 3, 6), { fill: i % 2 ? '#FFD27A' : '#FF8A1F', ink: null, alpha: 1 - q }); }
  }

  // ---------- BRIGHT · a terraformed green Mars ----------
  function fMars(t, lt, dur) {
    style(1); FX.bloom = .5;
    sky([[0, '#02020A'], [1, '#100A22']]);
    stars(t, 120, { seed: 151, ext: [W, H] });
    glow(-100, 400, 700, '#FFE9A8', .4);
    const mx = 1130, my = 560, R = 440, e = lt / dur, bnd = mx - R * .55 + R * 1.05 * easeOut(e * 1.1);
    glow(mx, my, R * 1.3, '#6AC8FF', .3);
    const disc = ellPts(mx, my, R, R, 60);
    paint(disc, { fill: '#C8582E', ink: null });
    X.save(); tracePath(X, disc); X.clip();
    const rot = t * .04;
    for (let i = 0; i < 14; i++) { const x = mx + (hash(i * 3) - .5) * 2 * R + Math.sin(rot) * 20, y = my + (hash(i * 5) - .5) * 1.8 * R; paint(ellPts(x, y, 60 + hash(i) * 120, 30 + hash(i * 7) * 60, 16, 0, hash(i) * 3), { fill: hash(i * 9) < .5 ? '#A8401E' : '#E07A40', ink: null, alpha: .8 }); }
    line([[mx - R * .7, my + 60], [mx - R * .2, my + 90], [mx + R * .3, my + 70], [mx + R * .6, my + 110]], 18, '#6A200C', .5, .9);
    // the living side: seas in the northern lowlands, green land, clouds; the front sweeps east
    X.save(); X.beginPath(); X.moveTo(mx - R - 10, my - R - 10); for (let i = 0; i <= 20; i++) { const y = my - R + i / 20 * 2 * R; X.lineTo(bnd + 40 * Math.sin(i * 1.3 + t * 3) - Math.abs(y - my) * .25, y); } X.lineTo(mx - R - 10, my + R + 10); X.closePath(); X.clip();
    paint(disc, { fill: '#4FB060', ink: null });
    for (let i = 0; i < 10; i++) paint(ellPts(mx + (hash(i * 11) - .5) * 1.8 * R, my + (hash(i * 13) - .5) * 1.6 * R, 50 + hash(i) * 110, 30 + hash(i * 2) * 60, 16), { fill: hash(i * 4) < .5 ? '#2E8A48' : '#8AC860', ink: null });
    paint([[mx - R, my - R * .7], [mx - R * .2, my - R * .55], [mx + R * .4, my - R * .35], [mx + R, my - R * .2], [mx + R, my - R], [mx - R, my - R]], { fill: '#2A7AD8', ink: null, curv: .6 });
    paint(ellPts(mx - R * .5, my + R * .35, 110, 60, 20), { fill: '#2A7AD8', ink: null });
    for (let i = 0; i < 8; i++) { const cx2 = mx + (hash(i * 17) - .5) * 1.6 * R, cy2 = my + (hash(i * 19) - .5) * 1.4 * R, pts = []; for (let j = 0; j <= 10; j++) { const a = j / 10 * 4 + i; pts.push([cx2 + Math.cos(a) * (20 + j * 9), cy2 + Math.sin(a) * (10 + j * 4)]); } line(pts, 7, '#FFFFFF', .6, .75); }
    X.restore();
    for (let i = 0; i <= 20; i++) { const y = my - R + i / 20 * 2 * R, x = bnd + 40 * Math.sin(i * 1.3 + t * 3) - Math.abs(y - my) * .25; if (i % 3 === 0) paint(starPts(x, y, 12, .35, 4, t * 4), { fill: '#EFFFB0', ink: null }); }
    { const pts = []; for (let i = 0; i <= 20; i++) { const y = my - R + i / 20 * 2 * R; pts.push([bnd + 40 * Math.sin(i * 1.3 + t * 3) - Math.abs(y - my) * .25, y]); } neonLine(pts, PAL.nGreen, 5, .9, .5); }
    paint(ellPts(mx - 40, my - R * .96, 170, 50, 20), { fill: '#FFFFFF', ink: null, alpha: .95 });
    // night side
    X.save(); X.globalCompositeOperation = 'source-over'; const sh = X.createRadialGradient(mx - R * .7, my - R * .3, R * .6, mx - R * .3, my, R * 1.6); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.6, 'rgba(8,4,20,.25)'); sh.addColorStop(1, 'rgba(8,4,20,.85)'); X.fillStyle = sh; X.fillRect(mx - R, my - R, 2 * R, 2 * R); X.restore();
    X.restore();
    paint(disc, { fill: null, ink: PAL.line, sw: 3 });
    glowPath(disc.slice(12, 48), '#8AE0FF', 2.2, .4, .9, false);
    // an orbital mirror (a solar sail) warms it; tiny Phobos
    X.save(); X.translate(420, 760); X.rotate(-.5 + .05 * Math.sin(t)); paint([[-110, -80], [110, -100], [90, 90], [-120, 70]], { fill: GOLD, shade: '#B8741A', rim: '#FFF6C0', ink: PAL.line, sw: 2.4 }); line([[-110, -80], [90, 90]], 2, '#8A5A1A', 0); line([[110, -100], [-120, 70]], 2, '#8A5A1A', 0); X.restore();
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,220,140,.12)'; X.beginPath(); X.moveTo(470, 700); X.lineTo(mx - R * .6, my - 100); X.lineTo(mx - R * .5, my + 160); X.lineTo(480, 820); X.fill(); X.restore();
    paint(ellPts(560, 260, 28, 20, 12, 0, .4), { fill: '#8A7A6A', shade: '#4A3A30', ink: PAL.line, sw: 1.6 });
  }

  // ---------- SCARY · the paperclip Earth ----------
  function fClips(t, lt, dur) {
    style(1); FX.bloom = .42;
    sky([[0, '#04030A'], [1, '#140C22']]);
    stars(t, 100, { seed: 161, ext: [W, H] });
    glow(1750, 150, 300, '#FFE9A8', .4);
    const ex = 960, ey = 560, R = 400, e = lt / dur, keep = lerp(.52, .3, e);
    glow(ex, ey, R * 1.3, '#A8B0C8', .22);
    const disc = ellPts(ex, ey, R, R, 60);
    paint(disc, { fill: '#6A7086', ink: null });
    X.save(); tracePath(X, disc); X.clip();
    for (let i = 0; i < 130; i++) {
      const a = hash(i * 1.7) * TAU, d = Math.sqrt(hash(i * 2.9)) * R * 1.05, x = ex + Math.cos(a) * d, y = ey + Math.sin(a) * d, f = Math.sqrt(Math.max(0, 1 - Math.pow(d / R, 2)));
      paperclip(x, y, (.62 + .3 * f) * (.85 + .3 * hash(i * 8.3)), hash(i * 3.1) * TAU, { col: mixCol('#8A90A8', '#F0F4FF', .3 + .7 * f) });
    }
    // what's left of the living Earth, shrinking; the conversion front sparks
    const bx = ex - R + keep * 2 * R;
    X.save(); X.beginPath(); X.moveTo(ex - R - 10, ey - R - 10); for (let i = 0; i <= 16; i++) { const y = ey - R + i / 16 * 2 * R; X.lineTo(bx + 34 * Math.sin(i * 1.7 + t * 4) - Math.pow((y - ey) / R, 2) * R * .6, y); } X.lineTo(ex - R - 10, ey + R + 10); X.closePath(); X.clip();
    paint(disc, { fill: '#2A6AC8', ink: null });
    for (const [lx, ly, rx, ry] of [[-.5, -.3, .3, .2], [-.3, .2, .25, .3], [-.75, .4, .15, .12], [-.1, -.6, .2, .12]]) paint(deform(ellPts(ex + lx * R, ey + ly * R, rx * R, ry * R, 14), 10), { fill: '#3FA85A', ink: null, curv: .6 });
    X.restore();
    for (let i = 0; i <= 16; i++) { const y = ey - R + i / 16 * 2 * R, x = bx + 34 * Math.sin(i * 1.7 + t * 4) - Math.pow((y - ey) / R, 2) * R * .6; glow(x, y, 50, PAL.nOrange, .5 + .3 * Math.sin(t * 40 + i)); }
    const sh = X.createRadialGradient(ex - R * .35, ey - R * .35, R * .3, ex, ey, R * 1.05); sh.addColorStop(0, 'rgba(255,255,255,.12)'); sh.addColorStop(.7, 'rgba(10,6,20,.1)'); sh.addColorStop(1, 'rgba(10,6,20,.75)'); X.fillStyle = sh; X.fillRect(ex - R, ey - R, 2 * R, 2 * R);
    X.restore();
    paint(disc, { fill: null, ink: PAL.line, sw: 3 }); glowPath(disc, '#C8D2FF', 1.4, 0, .5);
    // the harvest streams off toward the camera
    for (let i = 0; i < 26; i++) { const q = frac(hash(i * 4.3) + lt * (.8 + hash(i) * .8)), a = hash(i * 6.1) * TAU, d = R * (.9 + q * 1.6), s = .5 + q * 1.8; paperclip(ex + Math.cos(a) * d, ey + Math.sin(a) * d * .8, s, a + q * 6 + i); }
  }

  // ---------- THE BRIGHTEST · the solarpunk Earth, him smiling (SELECTED) ----------
  const SP = { wall: '#FFF8EC', wallDk: '#D8C4B0', terra: '#E8805A', copper: '#2E8A74', green: '#3FAE5A', greenDk: '#1F6A3A', glass: '#7CD4F0' };
  // an art-nouveau garden tower: rounded crown, arched windows, planted balconies with copper-green rails, optional sail
  function gTower(x, base, w, h, o = {}) {
    const fog = o.fog || 0, F = c => mixCol(c, '#D8EEF8', fog), ink = fog > .5 ? null : PAL.line, top = base - h, r = w * .5;
    const pts = [[x - w / 2, base], [x - w / 2, top + r]]; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; pts.push([x + Math.cos(a) * r, top + r + Math.sin(a) * r * (o.crown ?? 1.3)]); } pts.push([x + w / 2, base]);
    if (o.sail) { line([[x, top - r * .2], [x, top - 170]], 4, F('#8A6A4A'), 0); paint([[x + 5, top - 170], [x + 5, top - 40], [x + 130, top - 62]], { fill: F('#FFD24A'), shade: F('#D8942A'), rim: '#FFFBE0', ink, sw: 1.8, curv: .25 }); paint([[x - 5, top - 150], [x - 5, top - 50], [x - 90, top - 70]], { fill: F('#FFE27A'), shade: F('#D8942A'), ink, sw: 1.6, curv: .25 }); }
    paint(pts, { fill: F(SP.wall), shade: F(SP.wallDk), rim: '#FFFFFF', light: [-.2, -.05], ink, sw: 2.2 });
    paint(ellPts(x, top + r * .7, w * .18, w * .18, 16), { fill: F(SP.glass), ink, sw: 1.4 });
    const rows = Math.floor((h - r) / 78);
    for (let i = 1; i <= rows; i++) {
      const y = top + r + i * 78 - 20;
      for (let j = 0; j < 3; j++) { const wx = x - w * .3 + j * w * .3, ww = w * .16; paint([[wx - ww / 2, y], [wx - ww / 2, y - 30], [wx, y - 44], [wx + ww / 2, y - 30], [wx + ww / 2, y]], { fill: F(SP.glass), ink: null, flat: true, curv: .3 }); }
      paint(rrPts(x - w * .58, y + 6, w * 1.16, 16, 8), { fill: F(SP.green), shade: F(SP.greenDk), ink, sw: 1.4 });
      for (let j = 0; j < 4; j++) paint(ellPts(x - w * .45 + j * w * .3, y + 2, w * .1, 12, 10), { fill: F(j % 2 ? '#58C060' : SP.green), ink: null });
      line([[x - w * .58, y + 22], [x + w * .58, y + 22]], 2.2, F(SP.copper), 0, fog > .5 ? .5 : 1);
      if (hash(i * 7 + x) < .5) { const vx = x + (hash(i + x) - .5) * w, pts2 = [[vx, y + 20]]; for (let j = 1; j < 4; j++) pts2.push([vx + Math.sin(j * 2 + i) * 5, y + 20 + j * 18]); line(pts2, 3, F(SP.green), .5); }
    }
  }
  // a vertical forest: a slim white stem crowned with a tree canopy
  function treeTower(x, base, w, h, o = {}) {
    const fog = o.fog || 0, F = c => mixCol(c, '#D8EEF8', fog), ink = fog > .5 ? null : PAL.line, top = base - h;
    paint([[x - w * .3, base], [x - w * .22, top + 60], [x + w * .22, top + 60], [x + w * .3, base]], { fill: F(SP.wall), shade: F(SP.wallDk), rim: '#FFFFFF', ink, sw: 2 });
    for (let i = 0; i < 5; i++) { const y = top + 140 + i * (h - 160) / 5; paint(ellPts(x, y, w * .42, 14, 16), { fill: F(SP.green), shade: F(SP.greenDk), ink, sw: 1.3 }); }
    for (const [dx, dy, r] of [[-.45, .05, .42], [.4, 0, .45], [0, -.2, .55], [-.1, .15, .45], [.25, .2, .35]]) paint(ellPts(x + dx * w, top + 40 + dy * w, r * w, r * w * .8, 20), { fill: F(SP.green), shade: F(SP.greenDk), rim: F('#C8FF9A'), light: [-.1, -.2], ink, sw: 2 });
    for (let i = 0; i < 6; i++) { const vx = x - w * .5 + i * w * .2, L = 40 + hash(i + x) * 70; line([[vx, top + 70], [vx + 4, top + 70 + L]], 3, F('#2E8A48'), .3); }
  }
  // a glass garden dome
  function gDome(x, base, r, o = {}) {
    const fog = o.fog || 0, F = c => mixCol(c, '#D8EEF8', fog), ink = fog > .5 ? null : PAL.line;
    for (let i = 0; i < 4; i++) paint(ellPts(x - r * .5 + i * r * .33, base - r * .3, r * .22, r * .26, 12), { fill: F(i % 2 ? '#58C060' : SP.green), shade: F(SP.greenDk), ink, sw: 1.3 });
    const d = []; for (let i = 0; i <= 18; i++) { const a = Math.PI + i / 18 * Math.PI; d.push([x + Math.cos(a) * r, base + Math.sin(a) * r * .8]); }
    paint(d, { fill: 'rgba(170,230,255,.28)', ink, sw: 2.2, flat: true });
    for (let i = 1; i < 5; i++) { const a = Math.PI + i / 5 * Math.PI; line([[x, base - r * .8], [x + Math.cos(a) * r, base + Math.sin(a) * r * .8]], 1.6, F(SP.copper), .3, .8); }
    line(d.slice(2, 8), 4, '#FFFFFF', .5, .5);
  }
  function fSolar(t, lt, dur) {
    style(1); FX.bloom = .36; FX.scan = .6;
    sky([[0, '#2E9CF2'], [.42, '#86D0FF'], [.7, '#FFE2A0'], [1, '#FFB868']]);
    const sx = 1700, sy = 190;
    glow(sx, sy, 900, '#FFE9A8', .45); glow(sx, sy, 200, '#FFFFFF', .75);
    X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .08; X.fillStyle = 'rgba(255,240,190,.07)'; X.beginPath(); X.moveTo(sx, sy); X.lineTo(sx + Math.cos(a - .05) * 1800, sy + Math.sin(a - .05) * 1800); X.lineTo(sx + Math.cos(a + .05) * 1800, sy + Math.sin(a + .05) * 1800); X.fill(); } X.restore();
    paint(ellPts(sx, sy, 66, 66, 30), { fill: '#FFFBE8', ink: null });
    cloud(260, 160, .9, { shade: '#C8DCF0' }); cloud(900, 100, .65, { shade: '#C8DCF0' }); cloud(1280, 300, .5, { shade: '#E8D0C0', alpha: .9 });
    // floating solar kites over the city
    for (let i = 0; i < 4; i++) { const x = 200 + i * 300 + Math.sin(t + i) * 20, y = 260 + (i % 2) * 110 + Math.sin(t * 1.3 + i) * 12; line([[x, y + 40], [x - 40 - i * 10, 860]], 1.2, '#FFFFFF', .3, .45); paint([[x, y - 40], [x + 44, y], [x, y + 40], [x - 44, y]], { fill: '#FFD24A', shade: '#D8942A', rim: '#FFFBE0', ink: PAL.line, sw: 1.8 }); line([[x, y - 40], [x, y + 40]], 1.4, '#8A5A1A', 0); line([[x - 44, y], [x + 44, y]], 1.4, '#8A5A1A', 0); }
    // the far city in haze, then the near towers
    for (let i = 0; i < 10; i++) { const x = 40 + i * 140, h = 300 + hash(i * 3) * 280; if (i % 3 === 1) treeTower(x, 860, 90, h, { fog: .75 }); else gTower(x, 860, 70 + hash(i) * 30, h, { fog: .75, crown: 1 + hash(i * 5) }); }
    gDome(1080, 900, 220, { fog: .3 });
    treeTower(170, 1000, 190, 640); gTower(450, 1000, 170, 580, { sail: true, crown: 1.6 }); treeTower(730, 1000, 170, 700); gTower(960, 1000, 150, 470, { crown: 1.1 });
    // the tram on its elevated arc
    const arc = x => 690 - 80 * Math.sin((x + 100) / 1400 * Math.PI);
    const track = []; for (let i = 0; i <= 24; i++) { const x = -100 + i / 24 * 1600; track.push([x, arc(x)]); }
    for (let i = 0; i < 7; i++) { const x = i * 230; paint(rectPts(x - 7, arc(x) + 6, 14, 1000 - arc(x)), { fill: SP.wall, shade: SP.wallDk, ink: PAL.line, sw: 1.4 }); }
    line(track, 14, SP.wall, .5); line(track, 3, PAL.line, .5); line(track.map(([x, y]) => [x, y + 8]), 2.4, SP.copper, .5);
    const tx = -60 + frac(t * .1) * 1560, ta = Math.atan2(arc(tx + 10) - arc(tx - 10), 20);
    X.save(); X.translate(tx, arc(tx) - 34); X.rotate(ta); paint(rrPts(-170, -38, 340, 72, 32), { fill: '#FFFFFF', shade: '#C8D4DC', rim: '#FFFFFF', ink: PAL.line, sw: 2.4 }); paint(rrPts(-170, 6, 340, 14, 6), { fill: SP.green, ink: null, flat: true }); for (let i = 0; i < 5; i++) paint(rrPts(-146 + i * 60, -26, 44, 26, 10), { fill: SP.glass, ink: PAL.line, sw: 1.2 }); X.restore();
    for (let i = 0; i < 7; i++) { const bx = 260 + i * 120 + Math.sin(t * 2 + i) * 20, by = 470 + Math.sin(i * 2) * 60; line([[bx - 12, by - 6], [bx, by], [bx + 12, by - 6]], 2.4, '#2A3A4A', .4); }
    // the terrace: an art-nouveau railing, planters, flowers
    paint([[-100, 1000], [2020, 1000], [2020, 1100], [-100, 1100]], { fill: '#F0E2C8', shade: '#C8A888', ink: PAL.line, sw: 2 });
    line([[-100, 928], [1200, 928]], 8, SP.copper, 0);
    for (let i = 0; i < 13; i++) { const x = -40 + i * 100; line([[x, 1000], [x, 940], [x + 30, 960], [x + 52, 934]], 4, SP.copper, .6); }
    for (let i = 0; i < 18; i++) { const x = hash(i * 3.3) * 1250, y = 965 + hash(i * 5.1) * 60; paint(ellPts(x, y, 48, 32, 14), { fill: SP.green, shade: SP.greenDk, ink: PAL.line, sw: 2 }); paint(starPts(x + 10, y - 18, 13, .45, 5), { fill: ['#FF8AB5', '#FFD84A', '#FFFFFF', '#FF8A5A'][i % 4], ink: PAL.line, sw: 1.2 }); }
    // him: the happiest face in the film
    const bob = Math.sin(lt * 9) * 4;
    glow(1390, 330, 520, '#FFE9A8', .2);
    hero(1390, 1590 + bob, 1450, { view: 'q', flip: true, eyes: 'happy', mouth: 'grin', blush: .9, lookX: -.2, lookY: -.1, rimCol: '#FFE9A8', hairWind: .12 * Math.sin(t * 3), aL: [.3, .25], aR: [.3, .25], tilt: -.05 });
    FX.flash = Math.max(FX.flash, .3 * hitAt(lt, 0, 12)); FX.flashCol = '#FFF6D0';
  }

  const FUT = [
    { fn: fStar, b: 1, name: 'starfarers', n: '0400' },
    { fn: fGoo, b: 0, name: 'gray goo', n: '4401' },
    { fn: fTutor, b: 1, name: 'a tutor for every kid', n: '0402' },
    { fn: fEye, b: 0, name: 'total surveillance', n: '1984' },
    { fn: fDNA, b: 1, name: 'cured', n: '0404' },
    { fn: fWire, b: 0, name: 'wireheading', n: '6005' },
    { fn: fFab, b: 1, name: 'post-scarcity', n: '0406' },
    { fn: fTurn, b: 0, name: 'the treacherous turn', n: '6667' },
    // second montage (after the freeze)
    { fn: fTiling, b: 0, name: 'tiny molecular smiley faces', n: '8424' },
    { fn: fOneill, b: 1, name: "O'Neill cylinder", n: '0425' },
    { fn: fZoo, b: 0, name: 'human zoo', n: '4426' },
    { fn: fShake, b: 1, name: 'universal translator', n: '0427' },
    { fn: fMoloch, b: 0, name: 'Moloch', n: '6428' },
    { fn: fMars, b: 1, name: 'terraformed Mars', n: '0429' },
    { fn: fClips, b: 0, name: 'paperclip maximizer', n: '9430' },
    { fn: fSolar, b: 1, fin: 1, name: 'solarpunk', n: '0001' }
  ];
  const futShot = i => (t, lt, dur) => { FUT[i].fn(t, lt, dur); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; futHud(t, lt, FUT[i], i); };

  // ======================================================================================
  // b408–416 · CALLBACKS (1 beat each; half beats at the end)
  // ======================================================================================
  function fbMoonPhoto(t) {
    style(0);
    X.drawImage(PAPER, 0, 0);
    wash(rectPts(-60, -60, W + 120, H + 120, 20), '#3B3F6E', .85, 26, 4);
    blooms(0, 0, W, H, PAL.night, 6, .12, 4);
    glow(1500, 250, 900, '#FFC96B', .38, 'source-over');
    for (const [x, y, r, c] of [[300, 260, -.12, '#F2E27A'], [1600, 780, .1, '#F5B9C8'], [1560, 330, -.05, '#BFE3C0']]) { X.save(); X.translate(x, y); X.rotate(r); paint(rectPts(-100, -95, 200, 190, 2), { fill: c, shade: mixCol(c, '#8A6A40', .3), ink: PAL.ink, sw: 1.2 }); for (let i = 0; i < 3; i++) line([[-70, -40 + i * 38], [50 - i * 20, -44 + i * 38]], 1.4, PAL.ink, .5, .7); X.restore(); }
    X.save(); X.translate(960, 555); X.rotate(-.035);
    paint(rectPts(-330, -310, 660, 650, 2), { fill: PAL.cream, shade: '#D8CDB8', ink: PAL.ink, sw: 2 });
    X.save(); tracePath(X, rectPts(-292, -272, 584, 500)); X.clip();
    wash(rectPts(-310, -290, 620, 540, 6), PAL.night, .95, 8, 3);
    stars(t, 18, { seed: 4, x0: -292, y0: -272, ext: [584, 500] });
    moon(0, -25, 175, {});
    X.restore();
    paint(rectPts(-292, -272, 584, 500), { ink: PAL.ink, sw: 1.4 });
    paint(ellPts(0, -300, 22, 22, 14), { fill: PAL.clay, shade: '#8A3A2A', ink: PAL.ink, sw: 1.6 });
    paint(ellPts(-6, -306, 7, 6, 8), { fill: '#FFD8C8', ink: null, flat: true });
    X.restore();
  }
  function realMoon(t, lt, dur, v = 0) {
    style(1);
    spaceBg(t, { n: 140, seed: 21 + v });
    blaze(1530, 230, 64, .7, t, { rays: 10, rayA: .6 });
    const r = 250 * (1 + .14 * v), mx = 980, my = 470 + 20 * v;
    moon(mx, my, r, {});
    hero(mx, my - r + 8, 120 + 16 * v, { view: 'front', ...POSES.cheer, eyes: 'happy', mouth: 'grin', rimCol: RIMG });
    hudRing(mx, my, r * 1.2, t * (v % 2 ? -1 : 1), backOut(lt / dur * 3));
  }
  const photoCut = v => (t, lt, dur) => { (POSTCARDS.moonphoto || fbMoonPhoto)(t); FX.zoom *= 1 + .07 * v; FX.flash = Math.max(FX.flash, .25 * Math.exp(-lt * 20)); };
  const realCut = v => (t, lt, dur) => { realMoon(t, lt, dur, v); FX.zoom *= 1 + .02 * v; };
  function passShot(t, lt, dur) {
    style(1);
    spaceBg(t, { n: 100, seed: 31 });
    moon(960, 780, 640, { col: '#D6C8AC', halo: '#B89A70', alpha: 1 });
    const k = clamp(lt / .06), hit = lt > .06;
    if (hit) {
      const a = lt - .06;
      FX.shake += 34 * Math.exp(-a * 14); FX.flash = Math.max(FX.flash, .35 * Math.exp(-a * 25)); FX.flashCol = '#E8FFE8';
      for (let i = 0; i < 2; i++) { const kk = clamp(a / .35 - i * .25); if (kk > 0 && kk < 1) paint(ellPts(960, 560, 380 + kk * 420, (380 + kk * 420) * .42, 36), { fill: null, ink: DUSTC, sw: 5 * (1 - kk), alpha: 1 - kk }); }
      puff(700, 640, a, 2.2, 3); puff(1220, 640, a, 2.2, 9);
      for (let i = 0; i < 7; i++) { const ang = i / 7 * TAU + .3, L = 330 + hash(i) * 160; line([[960 + Math.cos(ang) * L, 560 + Math.sin(ang) * L * .45], [960 + Math.cos(ang + .06) * (L + 90), 560 + Math.sin(ang + .06) * (L + 90) * .45], [960 + Math.cos(ang - .03) * (L + 170), 560 + Math.sin(ang - .03) * (L + 170) * .45]], 2.2, '#7A6A5A', .2, clamp(a * 6)); }
    }
    stamp(960, 560, 2.1, 'PASS', '#19C45A', k, { rot: -.1 });
  }
  function chartShot(t, lt, dur) {
    style(1);
    const p = clamp(lt / (dur * .8));
    const x0 = 420, y0 = 930, w = 1100, hh = 700;
    const yOf = q => y0 - 40 - q * 540 - Math.pow(Math.max(0, q - .7) / .3, 3) * 1700, xOf = q => x0 + 30 + q * (w - 80) * (1 - Math.max(0, q - .78) * 1.1);
    const tipY = yOf(p), cy = Math.min(540, tipY + 380);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#07040F'], [1, '#1C0F3A']]);
    camBegin(960, cy, 1);
    X.save(); X.globalAlpha = .35; X.strokeStyle = '#3A2A6A'; X.lineWidth = 1.5; X.beginPath();
    for (let x = 0; x <= W; x += 80) { X.moveTo(x, -1700); X.lineTo(x, H + 100); } for (let y = -1680; y <= H; y += 80) { X.moveTo(0, y); X.lineTo(W, y); } X.stroke(); X.restore();
    hud(x0 - 40, y0 - hh - 40, w + 80, hh + 80, { col: PAL.nCyan });
    line([[x0, y0 - hh], [x0, y0], [x0 + w, y0]], 2.4, '#8A7AC0', 0);
    ['1 min', '1 hr', '1 day', '1 mo', '1 yr'].forEach((s, i) => txt(s, x0 - 22, y0 - 50 - i * 150, 40, '#CFC4FF', { font: 'Rajdhani', align: 'right' }));
    txt('task length', x0 - 30, y0 - hh - 88, 40, PAL.nCyan, { font: 'Orbitron', align: 'left', glow: PAL.nCyan });
    const pts = [], N = 70;
    for (let i = 0; i <= N * p; i++) { const q = i / N; pts.push([xOf(q), yOf(q)]); }
    pts.push([xOf(p), tipY]);
    if (pts.length > 1) neonLine(pts, PAL.nYellow, 6, 1, .4);
    for (let i = 0; i < 7; i++) { const q = i / 9; if (q > p) break; paint(ellPts(xOf(q), yOf(q), 13, 13, 12), { fill: PAL.nYellow, ink: PAL.line, sw: 1.4 }); }
    const top = y0 - hh - 40;
    if (tipY < top) for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * .3, d = 30 + Math.min(400, (top - tipY) * .35) * (.6 + hash(i) * .6); paint(polyPts(xOf(p) + Math.cos(a) * d, top + Math.sin(a) * d * .8, 10 + hash(i) * 10, 3, i), { fill: i % 2 ? PAL.nCyan : '#FFFFFF', ink: null, alpha: .85, flat: true }); }
    mask(xOf(p) - 10, tipY - 70, 64, { eyes: 'star', mouth: 'open', rot: -.25 });
    camEnd();
    if (tipY < top) speedLines(960, 1400, 1, { col: '#FFFFFF', n: 40, alpha: .3 });
  }
  function soBack(t, lt, dur) {
    style(1);
    spaceBg(t, { n: 90, seed: 41, stops: [[0, '#07040F'], [.6, '#1E0F3A'], [1, '#4A1650']] });
    speedLines(960, 620, 1, { col: PAL.nYellow, n: 34, alpha: .22 });
    earth(1500, 300, 175, { spin: t * .08 });
    ground(t, 900, { bend: 90, craters: 7, seed: 12 });
    const hh = hop(t, 412, 1), hj = hh.h * 150;
    shoggoth(1370, 740, 180, { reach: .95, wiggle: 4, eyesN: 7, t: onTwos(t) * 1.6, seed: 6, maskR: .42, mood: { eyes: 'star', mouth: 'open' } });
    shadowEll(760, 1045, 150 * (1 - hh.h * .4), .5);
    puff(760, 1045, hh.land, 1.2, 4);
    squashAt(760, 1045 - hj, hh.sq, () => hero(760, 1045 - hj, 620, { view: 'front', ...POSES.cheer, aL: [2.7 + .15 * Math.sin(lt * 20), .2], aR: [2.7 - .15 * Math.sin(lt * 20), .2], eyes: 'star', mouth: 'open', blush: .8, chrome: 1, rimCol: RIMG }));
    const s1 = since(t, 412), s2 = since(t, 413);
    cap("WE'RE SO BACK", 960, 180, 176 * (1 + .08 * Math.exp(-Math.max(0, s2) * 12) * (s2 > 0)), PAL.nYellow, { font: 'Anton', stroke: '#000', sw: 22, pop: s1 * 6, glow: PAL.nOrange, rot: -.03 });
  }

  // ======================================================================================
  // b416–422 · EARTHRISE
  // ======================================================================================
  function earthrise(t, lt, dur) {
    style(1);
    const u = lt / dur, bp = bpOf(t);
    spaceBg(t, { n: 150, seed: 51 });
    blaze(1700, 150, 62, .6, t, { rays: 8, rayA: .5 });
    camBegin(960, 560 - 60 * ease(u), 1.04);
    const ey = lerp(1080, 500, easeOut(clamp(lt / 1.6)));
    earth(720, ey, 310, { spin: t * .05 });
    ground(t, 830, { bend: 60, craters: 9, seed: 14, rimCol: PAL.nCyan, lit: .7 });
    const wv = Math.sin(bp * Math.PI);
    // the little one waves too: its mask arm is busy, so it waves a limb-tentacle
    tentacle(1670, 890, -Math.PI / 2 - .3 + wv * .45, 260, 30, onTwos(t), 5, { amp: .25 });
    shoggoth(1665, 935, 80, { reach: .45, eyesN: 6, t: onTwos(t), seed: 8, maskR: .36, mood: { eyes: 'happy', mouth: 'grin', look: [-1, -.4] }, look: [-1, -.5] });
    hero(1300, 1030, 640, { view: 'q', flip: true, aR: [2.45, .55 * wv], aL: [.25, .2], lL: [.06, 0], lR: [-.08, 0], lookX: .9, lookY: -.3, eyes: 'happy', mouth: 'open', blush: .6, rimCol: PAL.nCyan, tilt: .06 });
    camEnd();
  }

  // ======================================================================================
  // b422–424 · FREEZE (gap): time stops mid-leap; on the second beat the router spins up again
  // ======================================================================================
  const leapPose = (u, amt = 1) => ({ ...runPose(.2 + .12 * u, amt), dy: 0 });
  function freeze(t, lt, dur) {
    style(1);
    FX.sat = .6; FX.halftone = .3;
    const u = lt / dur, crawl = lt * .05;
    spaceBg(t - lt, { n: 110, seed: 61 });
    earth(1500, 260, 120, { spin: 7 });
    camBegin(960, 540, 1.04 + .06 * u, -.03 + .05 * u);
    ground(t - lt, 780, { bend: 40, craters: 10, seed: 16 });
    for (let i = 0; i < 40; i++) { const x = 300 + hash(i * 3) * 1300, y = 650 + hash(i * 7) * 380, r = 4 + hash(i) * 9; paint(ellPts(x, y + Math.sin(i + crawl * 3) * 3, r, r * .8, 8), { fill: DUSTC, ink: null, alpha: .7, flat: true }); }
    shoggoth(1500, 850, 100, { reach: .8, eyesN: 7, t: 12.3, seed: 5, mood: { eyes: 'wide', mouth: 'o', look: [-1, 0] }, look: [-1, -.3] });
    const HX = 1040 + crawl * 60, HY = 760 - crawl * 20;
    afterimages(6, (i, col, a) => {
      const x = HX - i * 125, y = HY + i * i * 11, pz = leapPose(.5 - i * .07);
      if (col) hero(x, y, 520, { view: 'side', ...pz, silhouette: col, alpha: a * 1.2 });
      else hero(x, y, 520, { view: 'side', ...pz, eyes: 'determined', mouth: 'grin', brows: 'angry', chrome: 1, rimCol: RIMG });
    });
    camEnd();
    if (lt < .4) { const k = lt / .4; neonLine(ellPts(1040, 500, 100 + k * 1300, 100 + k * 1300, 48), '#FFFFFF', 6 * (1 - k), 1 - k, .5, true); }
    // the router wakes: a rolling FUTURE counter flickers in on the last beat
    const s = since(t, 423);
    if (s > 0) {
      const on = hash(Math.floor(t * 30)) < .35 + s * 2.2, fr = Math.floor(t * 30);
      if (on) { cap('FUTURE #' + (1000 + Math.floor(hash(fr * 1.7) * 8999)), 158, 86, 40, '#FFFFFF', { font: 'Orbitron', align: 'left', glow: PAL.nCyan, stroke: PAL.line, sw: 7 }); cap('p = ?', 160, 136, 36, PAL.nCyan, { font: 'Rajdhani', align: 'left', stroke: PAL.line, sw: 6 }); }
      FX.glitch = Math.max(FX.glitch, .25 * s * 3 * (on ? 1 : 0));
    }
  }

  // ======================================================================================
  // b432–440 · FINAL MONTAGE (postcards from every act, with fallbacks) — the sparrows' fable first
  // ======================================================================================
  function fbSparrows(t) {
    style(0);
    X.drawImage(PAPER, 0, 0);
    wash(rectPts(-60, -60, W + 120, 700, 20), PAL.sky, .55, 30, 4);
    blooms(0, 0, W, 600, '#FFFFFF', 6, .1, 9);
    wash(rectPts(-60, 700, W + 120, 500, 20), '#E8C88A', .4, 30, 3);
    const ex = 960 + Math.sin(t) * 20, ey = 520;
    paint(ellPts(ex, ey, 120, 150, 30), { fill: '#F4E8D0', shade: '#C8B08A', ink: PAL.ink, sw: 2.2 });
    for (let i = 0; i < 14; i++) paint(ellPts(ex + (hash(i) - .5) * 180, ey + (hash(i * 3) - .5) * 240, 8, 6, 8), { fill: '#8A6A4A', ink: null, alpha: .6 });
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU + t, bx = ex + Math.cos(a) * 240, by = ey + Math.sin(a) * 200 - 40, fl = Math.sin(t * 20 + i);
      paint(ellPts(bx, by, 28, 18, 14), { fill: '#A87A52', shade: '#6A4A30', ink: PAL.ink, sw: 1.6 });
      paint([[bx - 6, by - 4], [bx - 30, by - 30 * fl], [bx + 10, by - 6]], { fill: '#8A6040', ink: PAL.ink, sw: 1.4 });
      line([[bx + 10, by - 10], [bx - 5, by + 25]], 1.2, PAL.ink, 0, .6);
    }
  }
  function fbLab(t) {
    style(0); room(t, { lx: 900, ly: 480 });
    windowFrame(1380, 130, 400, 330, t);
    X.save(); X.translate(330, 290); X.rotate(-.06); paint(rectPts(-95, -85, 190, 180, 1), { fill: PAL.cream, ink: PAL.ink, sw: 1.4 }); paint(rectPts(-80, -70, 160, 128), { fill: PAL.night, ink: null }); moon(0, -8, 40, {}); paint(ellPts(0, -86, 10, 10, 10), { fill: PAL.clay, ink: PAL.ink, sw: 1 }); X.restore();
    desk(160, 800, 1400);
    for (const [x, y, w] of [[260, 470, 360], [680, 420, 480], [1210, 470, 360]]) monitor(x, y, w, w * .58, { stand: true }, (sx, sy, sw) => { for (let r = 0; r < 6; r++) paint(rectPts(sx + 20, sy + 22 + r * 28, sw * (.3 + hash(r + sx) * .5), 12), { fill: '#7FE0D0', ink: null, op: .6, flat: true }); });
    hero(900, 1130, 600, { view: 'back' });
  }
  function fbMask(t) {
    style(0); room(t, { lamp: .6 });
    monitor(360, 130, 1200, 700, { stand: false }, (x, y, w, h) => mask(x + w / 2, y + h / 2, 250, { eyes: ['happy', 'wink', 'open'][Math.floor(t * 3) % 3], mouth: 'grin' }));
  }
  function fbJackin(t) {
    style(1); skyNight(t); city(t, { horizon: 1000, seed: 3 });
    hero(960, 1200, 950, { view: 'back', emblem: 1, rimCol: PAL.nCyan });
    speedLines(960, 380, .5, { col: PAL.nCyan, n: 30 });
  }
  function fbShog(t) {
    style(1); vgrad(0, 0, W, H, [[0, PAL.void], [1, PAL.plum]]);
    for (let i = 0; i < 10; i++) { const y = 720 + Math.pow(i / 9, 2) * 380; neonLine([[0, y], [W, y]], PAL.nViolet, 1.2, .5, 0); }
    for (let i = -8; i <= 8; i++) neonLine([[960 + i * 60, 720], [960 + i * 420, 1100]], PAL.nViolet, 1.2, .5, 0);
    shoggoth(960, 560, 250, { reach: .85, mood: { eyes: 'happy', mouth: 'grin' }, t: onTwos(t) });
  }
  function fbCity(t) {
    style(1); skyNight(t); moon(1500, 220, 110, {}); city(t, { horizon: 880, scroll: t * 40, seed: 2 }); rain(t);
    hero(960, 1050, 580, { view: 'front', ...walkPose(bpOf(t) / 2), chrome: 1 });
  }
  function fbTrain(t) {
    style(1); skyNight(t, { stops: [[0, '#0B0716'], [.6, '#2A1250'], [1, '#6A1A60']] }); moon(1450, 250, 150, {});
    city(t, { horizon: 1100, scroll: t * 600, seed: 5, street: false });
    train(150, 1000, 1.8, { windowFn: (i, x, y, w, h) => { vgrad(x, y, w, h, [[0, '#2A1650'], [1, '#0B0716']]); if (i === 2) hero(x + w / 2, y + h + 50, 140, { view: 'q' }); else mask(x + w / 2, y + h * .55, 24, { eyes: 'happy', glow: 0 }); } });
  }
  function fbFoom(t) {
    style(1); vgrad(0, 0, W, H, [[0, '#1A0630'], [1, '#FF2E88']]);
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t * .5; X.fillStyle = rgba(i % 2 ? PAL.nOrange : PAL.nMagenta, .3); X.beginPath(); X.moveTo(960, 540); X.lineTo(960 + Math.cos(a - .06) * 1500, 540 + Math.sin(a - .06) * 1500); X.lineTo(960 + Math.cos(a + .06) * 1500, 540 + Math.sin(a + .06) * 1500); X.fill(); }
    X.restore();
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .2; tentacle(960 + Math.cos(a) * 220, 560 + Math.sin(a) * 220, a, 620, 64, t * 2, i); }
    moon(960, 560, 300, { face: { eyes: 'star', mouth: 'open' }, faceA: 1 });
    txt('FOOM', 960, 560, 300, '#FFFFFF', { font: 'Anton', stroke: '#000', sw: 30, glow: PAL.nMagenta, rot: -.06 });
  }
  function fbRocket(t) {
    style(1); skyNight(t); city(t, { horizon: 1080, seed: 7, street: false });
    const lift = frac(t * .5) * 220;
    for (let i = 0; i < 12; i++) { const x = 960 + (i - 5.5) * 120, r = 110 + hash(i) * 80; paint(ellPts(x, 1040 + hash(i * 3) * 40, r, r * .6, 16), { fill: '#5A4A7A', shade: '#2A2048', ink: PAL.line, sw: 1.6, rim: PAL.nMagenta }); }
    rocket(960, 880 - lift, .85, { flame: 1, window: 'mask' });
  }
  function fbCapsule(t) {
    style(1); vgrad(0, 0, W, H, [[0, '#1A1530'], [1, '#0B0716']]);
    paint(ellPts(1300, 460, 330, 330, 40), { fill: '#05030C', ink: PAL.line, sw: 4 });
    X.save(); tracePath(X, ellPts(1300, 460, 320, 320, 40)); X.clip(); stars(t, 40, { x0: 980, y0: 140, ext: [640, 640] }); earth(1360, 580, 230, {}); X.restore();
    neonLine(ellPts(1300, 460, 336, 336, 40), PAL.nCyan, 3, .8, .3, true);
    const bob = Math.sin(t * 2) * 20;
    hero(600, 930 + bob, 560, { view: 'q', ...POSES.float, outfit: 'space', helmet: 1, eyes: 'happy', mouth: 'grin', rot: .15 });
    mask(980, 400 - bob, 80, { eyes: 'happy', mouth: 'grin', rot: Math.sin(t * 3) * .3 });
  }
  function fbDyson(t) {
    style(1); spaceBg(t, { n: 130, seed: 91 });
    blaze(960, 540, 320, .85, t);
  }
  const MONT = [['sparrows', fbSparrows], ['lab', fbLab], ['mask', fbMask], ['jackin', fbJackin], ['shoggoth', fbShog], ['city', fbCity], ['train', fbTrain], ['foom', fbFoom], ['rocket', fbRocket], ['capsule', fbCapsule], ['dyson', fbDyson]];
  const montShot = i => (t, lt, dur) => {
    const [name, fb] = MONT[i];
    (POSTCARDS[name] || fb)(t);
    FX.flash = Math.max(FX.flash, .3 * Math.exp(-lt * 18)); FX.flashCol = '#FFFFFF';
    FX.zoom *= 1.07 - .07 * easeOut(lt / dur);
  };
  const MONT_BEATS = [432, 433, 434, 435, 436, 437, 437.5, 438, 438.5, 439, 439.5];

  // ======================================================================================
  // b440–448 · on the crater rim, from behind (neon)
  // ======================================================================================
  function rimBack(t, lt, dur) {
    style(1);
    FX.noAuto = true; FX.zoom *= 1 + .015 * pulse(t, 7);
    const u = lt / dur, pb = pulse(t, 4);
    spaceBg(t, { n: 150, seed: 101 });
    camBegin(960, 585, lerp(1.1, 1.0, ease(u)));
    earth(380, 225, 100, { spin: t * .05 });
    blaze(1190, 255, 150, .78 + .12 * pb, t, { rays: 14, rayA: .65 });
    ground(t, 575, { bend: 35, craters: 4, seed: 26, pebbles: 6 });
    paint(ellPts(960, 735, 1300, 165, 48), { fill: '#120B26', ink: PAL.line, sw: 1.5 });
    X.save(); tracePath(X, ellPts(960, 735, 1300, 165, 48)); X.clip(); paint(ellPts(960, 620, 1360, 150, 40), { fill: '#33245A', ink: null }); X.restore();
    const far = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * (1.02 + i / 24 * .96); far.push([960 + Math.cos(a) * 1300, 735 + Math.sin(a) * 165]); }
    neonLine(far, GOLD, 2.4, .6, .5);
    // him and the little one, side by side; on b444 it turns its mask to look at him
    const turn = since(t, 444) > 0 ? easeOut(since(t, 444) * 4) : 0;
    hero(830, 1224, 720, { view: 'back', ...POSES.sit, aL: [.32, -.1], aR: [.3, -.05], emblem: .3 + .4 * pb, rimCol: RIMG, tilt: .1 * turn });
    shoggoth(1150, 850, 78, { reach: .3, eyesN: 5, t: onTwos(t), seed: 12, maskR: .4, look: [lerp(.3, -1, turn), lerp(-1, -.3, turn)], mood: { eyes: turn > .5 ? 'happy' : 'open', mouth: 'smile', look: [lerp(0, -1, turn), lerp(-1, 0, turn)], tilt3d: -.5 * turn } });
    const ridge = []; for (let i = 0; i <= 22; i++) { const x = -300 + i / 22 * (W + 600); ridge.push([x, 905 + Math.sin(i * 1.7) * 9 + Math.pow((x - 960) / 900, 2) * 45]); }
    paint([...ridge, [W + 300, H + 300], [-300, H + 300]], { fill: '#1C1438', ink: PAL.line, sw: 2, curv: .3 });
    vgrad(-300, 930, W + 600, 300, [[0, 'rgba(11,7,22,0)'], [1, 'rgba(11,7,22,.8)']]);
    neonLine(ridge, RIMG, 2.8, .85, .4);
    motes(t, 26, 200, 250, 1500, 700, SUNW, 11);
    camEnd();
  }

  // ======================================================================================
  // b448 → end · side view on the rim of a little crater at the top of the moon; the camera pulls back until the
  // moon is a globe; then the neon drains into a watercolour painting of the same scene
  // ======================================================================================
  const GR = 1500, GCX = 960, GCY = 700 + GR;
  const HHf = 180, SEAT = [900, 668];
  const PULL_END = 156.75;
  function rimCam(t) {
    const e = ease(seg(t, B(448) - .3, PULL_END)), z = Math.exp(lerp(Math.log(2.7), Math.log(.42), e)), ty = lerp(610, 665, e);
    return { z, cx: lerp(930, 960, e), cy: 670 - (ty - 540) / z, e };
  }
  // screen-space sky objects shared by the neon shot and the painting
  const skyObj = e => ({ ex: lerp(1440, 1500, e), ey: lerp(260, 245, e), er: lerp(150, 112, e), sx: lerp(300, 350, e), sy: lerp(200, 215, e), sr: lerp(92, 66, e) });
  function craterRim(neon, z) {
    const fill = neon ? '#D8CAB2' : '#F2E6CE', ink = neon ? PAL.line : PAL.ink, sw = (neon ? 2 : 1.3) / Math.max(z, .45);
    paint(ellPts(1000, 716, 60, 9, 18), { fill: neon ? '#A8969E' : '#C8B4A8', ink: null, wet: 2 });
    const L = [[748, 717], [795, 694], [842, 676], [882, 667], [918, 668], [942, 688], [954, 717]], R2 = [[1046, 717], [1063, 698], [1090, 689], [1118, 695], [1150, 717]];
    for (const P of [L, R2]) {
      paint([...P, [P[P.length - 1][0] + 20, 745], [P[0][0] - 20, 745]], { fill, ink: null, curv: .5, wet: 3, layers: 2 });
      line(P, sw, ink, .5, neon ? 1 : .7);
    }
    if (neon) neonLine(L.slice(0, 5), RIMG, 1.4 / Math.max(z, .5), .8, .5);
  }
  const PITS = [[640, 752, 34], [1190, 770, 46], [1370, 742, 22], [520, 800, 58], [1010, 820, 30], [780, 860, 70], [1260, 880, 40]];
  // the two of them on the rim (world space): the little one leans its mask on his shoulder, he writes in his notebook
  function rimFigures(t, neon, z) {
    const lean = since(t, 448) > 0 ? backOut(since(t, 448) / .5) : 0;
    const nb = since(t, 449.3) > 0 ? backOut(since(t, 449.3) / .45) : 0;
    const wr = since(t, 450) > 0 ? 1 : 0, wph = t * 10;
    const k = HHf / 100, gy = SEAT[1] + 44 * k;
    const bx = 856, by = 671, sS = 32;
    X.save(); X.translate(bx, by); X.rotate(.5 * lean); X.translate(-bx, -by);
    shoggoth(bx, by - sS * .8, sS, { reach: .22, eyesN: 4, t: onTwos(t), seed: 14, maskR: .58, maskAt: [4, -sS * .62], mood: { eyes: lean > .5 ? 'happy' : 'open', mouth: 'smile', look: [.6, .2], tilt3d: .3 } });
    X.restore();
    const wob = wr ? Math.sin(wph) * .1 : 0;
    const aR = nb > 0 ? [lerp(.35, .62 + wob * .4, nb), lerp(.95, .95 + wob, nb)] : [.35, .95];
    const aL = nb > 0 ? [lerp(.3, .75, nb), lerp(.9, .75, nb)] : [.3, .9];
    let handM = null;
    hero(SEAT[0], gy, HHf, {
      view: 'side', ...POSES.sit, aL, aR, outfit: 'bomber', rimCol: RIMG, lean: .05,
      eyes: nb > .5 ? 'open' : 'happy', lookY: nb > .5 ? .7 : 0, mouth: 'smile', blush: .6 * clamp(lean), tilt: nb > .5 ? .12 : 0,
      handR: () => { handM = X.getTransform(); }
    });
    if (nb > 0) {
      X.save(); X.translate(SEAT[0] + 40, SEAT[1] - 18); X.rotate(-.55); X.scale(nb * 2.1, nb * 2.1);
      paint(rrPts(-10, -7, 20, 14, 1.2), { fill: neon ? '#FF8A1F' : PAL.clay, ink: neon ? PAL.line : PAL.ink, sw: .6, flat: true });
      paint(rrPts(-9.2, -6.3, 18.4, 12.6, .8), { fill: neon ? '#FFF6E6' : '#FFFBF0', ink: neon ? PAL.line : PAL.ink, sw: .4, flat: true });
      line([[0, -6.2], [0, 6.2]], .4, neon ? '#8A7AA0' : PAL.slate, 0);
      const p = wr ? clamp(since(t, 450) / (B(453) - B(450))) : 0;
      for (let i = 0; i < 4; i++) { const q = clamp(p * 4 - i); if (q <= 0) break; const y = -3.8 + i * 2.6, pts = []; for (let j = 0; j <= 10 * q; j++) pts.push([1.4 + j * .65, y + Math.sin(j * 2.3 + i) * .35]); if (pts.length > 1) line(pts, .32, neon ? '#2A1E48' : PAL.ink, .3); }
      X.restore();
      if (handM) { X.save(); X.setTransform(handM); unrot(); line([[0, 0], [2.6, 3.2]], .8, neon ? PAL.nCyan : PAL.ink, 0); paint(ellPts(0, 0, 3.3, 3.3, 10), { fill: neon ? HERO.skinN : HERO.skin, shade: neon ? HERO.skinNDk : HERO.skinDk, ink: neon ? PAL.line : PAL.ink, sw: .5 }); X.restore(); }
    }
  }
  function rimFront(t) {
    const { z, cx, cy, e } = rimCam(t), so = skyObj(e);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#05030C'], [.6, '#140B2E'], [1, '#3A1A4A']]);
    stars(t, 150, { seed: 111, ext: [W + 200, H], x0: -100 });
    glow(-150, 760, 1000, GOLD, .22);
    blaze(so.sx, so.sy, so.sr, .7, t, { rays: 10, rayA: .5 });
    earth(so.ex, so.ey, so.er, { spin: 3 + t * .03 });
    camBegin(cx, cy, z);
    const gsw = 1 / Math.max(z, .45);
    paint(ellPts(GCX, GCY, GR, GR, 120), { fill: '#D8CAB2', shade: '#8E7AA8', light: [-.07, -.05], ink: PAL.line, sw: 2.2 * gsw });
    for (let i = 0; i < 16; i++) {
      const d = GR * Math.sqrt(hash(i * 3 + 7)) * .9, a = -Math.PI / 2 + (hash(i * 5 + 1) - .5) * 2.7, x = GCX + Math.cos(a) * d, y = GCY + Math.sin(a) * d;
      if (y < 700 + 220 && Math.abs(x - GCX) < 330) continue;
      const f = Math.sqrt(1 - Math.pow(d / GR, 2)), rc = GR * (.025 + hash(i * 11) * .05);
      paint(xform(ellPts(0, 0, Math.max(rc * f, rc * .18), rc, 20), x, y, 1, a), { fill: '#C4B49E', shade: '#8A769C', light: [.1, .15], ink: null, sw: gsw, alpha: .9 });
    }
    for (const [x, y, r] of PITS) { const f = .28 + (y - 700) / 600; paint(ellPts(x, y, r, r * f, 18), { fill: '#BFAE98', shade: '#8A769C', light: [.1, .25], ink: null, sw: gsw * .8 }); }
    glowPath(ellPts(GCX, GCY, GR, GR, 120), GOLD, 1.1 * gsw, 0, .45);
    craterRim(true, z);
    rimFigures(t, true, z);
    camEnd();
  }
  function rimShot(t, lt, dur) { style(1); FX.noAuto = true; FX.zoom *= 1 + .012 * pulse(t, 7); rimFront(t); }

  // ======================================================================================
  // THE PAINTING (outro): a real watercolour of the same scene
  // ======================================================================================
  let SOFT = null;
  // blurred, multiplied wet-in-wet layer: fn(c) draws at 1/4 scale into a small canvas which is blurred and laid over the paper
  function softLayer(fn, blur, a = 1, comp = 'multiply') {
    if (!SOFT) SOFT = mkCanvas(480, 270);
    const c = SOFT.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.clearRect(0, 0, 480, 270);
    c.filter = `blur(${blur}px)`; c.scale(.25, .25); fn(c); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none';
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = comp; X.globalAlpha = a; X.imageSmoothingEnabled = true; X.drawImage(SOFT, 0, 0, W, H); X.restore();
  }
  const blob = (c, x, y, rx, ry, col, a = 1, seed = 0) => { c.fillStyle = col; c.globalAlpha = a; c.beginPath(); for (let i = 0; i <= 20; i++) { const an = i / 20 * TAU, r = 1 + .18 * Math.sin(an * 3 + seed) + .1 * Math.sin(an * 5 + seed * 2); const px = x + Math.cos(an) * rx * r, py = y + Math.sin(an) * ry * r; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.fill(); c.globalAlpha = 1; };
  // a cauliflower back-run: a lighter bloom with a dark frilly dried edge
  function backrun(x, y, r, col, seed) {
    const pts = []; for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, rr = r * (1 + .22 * Math.sin(a * 2 + seed) + .1 * Math.sin(a * 9 + seed * 3) + .06 * Math.sin(a * 17 + seed * 5) + .08 * (hash(i + seed * 7) - .5)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .7]); }
    const rg = X.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(246,238,221,.13)'); rg.addColorStop(.75, 'rgba(246,238,221,.04)'); rg.addColorStop(1, 'rgba(246,238,221,0)');
    X.fillStyle = rg; tracePath(X, pts, .5); X.fill();
    const a0 = Math.floor(hash(seed * 3) * 64), edge = []; for (let i = 0; i < 40; i++) edge.push(pts[(a0 + i) % 64]);
    X.globalAlpha = .22; X.strokeStyle = col; X.lineWidth = 2; tracePath(X, edge, .5, false); X.stroke();
    X.globalAlpha = .1; X.lineWidth = 6; tracePath(X, edge.map(([x, y]) => [x + (x - (pts[0][0] + pts[32][0]) / 2) * -.03, y]), .5, false); X.stroke(); X.globalAlpha = 1;
  }
  // the deckled edge of the painted area: paper shows around it
  const DECKLE = (() => { const p = [], m = 52, edge = (x0, y0, x1, y1, n, j) => { for (let i = 0; i < n; i++) { const u = i / n; p.push([lerp(x0, x1, u) + (hash(i * 3.1 + j) - .5) * 16, lerp(y0, y1, u) + (hash(i * 5.7 + j) - .5) * 16]); } };
    edge(m, m + 6, W - m, m, 30, 1); edge(W - m, m, W - m - 8, H - m, 18, 2); edge(W - m - 8, H - m, m + 4, H - m + 4, 30, 3); edge(m + 4, H - m + 4, m, m + 6, 18, 4); return p; })();
  const RINGS = [[0, 1], [.95, .38], [-.95, .38], [Math.PI / 2, .3]];     // the lattice's rings (== dysonEmblem, == SHARED.lattice)
  let EC = null, EC2 = null;
  function softPaint(cx, cy, blur, fn) {
    const S = 420;
    if (!EC) { EC = mkCanvas(S, S); EC2 = mkCanvas(S, S); }
    const keep = X, c = EC.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, S, S);
    X = c; X.setTransform(1, 0, 0, 1, S / 2 - cx, S / 2 - cy); fn(); X = keep;
    const c2 = EC2.getContext('2d'); c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalAlpha = 1; c2.clearRect(0, 0, S, S); c2.filter = `blur(${blur}px)`; c2.drawImage(EC, 0, 0); c2.filter = 'none';
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.drawImage(EC2, cx - S / 2, cy - S / 2); X.restore();
  }
  function restorePaper(pts) { X.save(); tracePath(X, pts, .3); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(PAPER, 0, 0); X.restore(); }
  function painting(t) {
    style(0);
    const { z, cx, cy, e } = rimCam(t), so = skyObj(e);
    X.drawImage(PAPER, 0, 0);
    reseed(4242);       // the painting itself is still: only the tiny figures boil
    // ---- sky: wet-in-wet indigo → violet, then glazes with dried edges, back-runs, granulation ----
    softLayer(c => {
      c.fillStyle = '#F3EBDC'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#1C2258'; c.fillRect(0, 0, W, 520);
      blob(c, 960, 60, 1500, 480, '#151A4A', 1, 1);
      blob(c, 260, 300, 620, 380, '#1A1E54', .95, 2);
      blob(c, 1660, 260, 640, 360, '#22286A', .95, 3);
      blob(c, 960, 620, 1400, 300, '#4A3A8C', .95, 4);
      blob(c, 380, 660, 560, 220, '#6A4C9E', .85, 5);
      blob(c, 1540, 640, 560, 210, '#5E4696', .85, 6);
      blob(c, 960, 800, 1000, 170, '#B07AA8', .8, 7);
      blob(c, 1240, 420, 300, 190, '#2E3080', .7, 8);
      blob(c, 620, 420, 320, 180, '#3A2E80', .6, 9);
      blob(c, 960, 860, 700, 90, '#E0B0B8', .7, 10);
    }, 8, 1);
    X.save(); tracePath(X, DECKLE, .2); X.clip();
    wash(skyBand(360, 46, 1), '#1A1E50', .38, 26, 3);
    wash(skyBand(180, 36, 2), '#10143C', .38, 22, 3);
    wash(skyBand(600, 30, 3), '#5A3E90', .2, 30, 3);
    for (const [x, y, r, sd] of [[640, 250, 190, 1], [1300, 520, 160, 4], [240, 560, 150, 3]]) backrun(x, y, r, '#0E1238', sd);
    // granulation: pigment settling in the paper's tooth
    X.fillStyle = '#0A0A28';
    for (let i = 0; i < 3200; i++) { const x = hash(i * 1.31) * W, y = Math.pow(hash(i * 2.77), 1.3) * 800, n = hash(Math.floor(x / 36) * 7.3 + Math.floor(y / 36) * 3.1); if (n < .3) continue; X.globalAlpha = .12 + .3 * hash(i * 5.3); const r = .9 + hash(i * 9.1) * 2; X.fillRect(x, y, r, r); }
    X.globalAlpha = 1;
    X.restore();
    // ---- white gouache stars ----
    for (let i = 0; i < 70; i++) {
      const x = 90 + hash(i * 3.3 + 111) * (W - 180), y = 80 + Math.pow(hash(i * 7.1 + 111), 1.3) * 560, r = 1.4 + Math.pow(hash(i * 1.7), 3) * 4.2;
      if (Math.hypot(x - so.ex, y - so.ey) < so.er + 20 || Math.hypot(x - so.sx, y - so.sy) < so.sr * 1.4) continue;
      paint(ellPts(x, y, r, r * .85, 7), { fill: '#FFFBF0', ink: null, flat: true, alpha: .92 });
      if (r > 4) { line([[x - r * 3, y], [x + r * 3, y]], .9, '#FFFBF0', 0, .75); line([[x, y - r * 3], [x, y + r * 3]], .9, '#FFFBF0', 0, .75); }
    }
    // ---- the Dyson sphere: a small gold watercolour with teal rings ----
    { const { sx, sy, sr } = so;
      glow(sx, sy, sr * 2.4, '#F6E6C0', .42, 'source-over'); glow(sx, sy, sr * 1.3, '#FFF0C8', .5, 'source-over');
      restorePaper(ellPts(sx, sy, sr * .64, sr * .64, 24));
      wash(ellPts(sx, sy, sr * .58, sr * .58, 24), '#F6C040', .85, sr * .05, 3);
      wash(ellPts(sx - sr * .1, sy - sr * .12, sr * .3, sr * .28, 16), '#FFF2B0', .5, sr * .04, 2);
      wash(ellPts(sx + sr * .12, sy + sr * .14, sr * .4, sr * .36, 18), PAL.clay, .3, sr * .05, 2);
      RINGS.forEach(([rot, syk], i) => { const pts = ellPts(0, 0, sr, sr * syk, 40).map(([x, y]) => [sx + x * Math.cos(rot) - y * Math.sin(rot), sy + x * Math.sin(rot) + y * Math.cos(rot)]); line(pts, 2, '#2AA8A0', .5, .95, true); line(pts, .7, '#145050', .5, .5, true); for (let j = 0; j < 6; j++) { const [px, py] = pts[Math.floor(j / 6 * 40 + i * 3) % 40]; paint(rectPts(px - 3.5, py - 2.5, 7, 5), { fill: PAL.indigo, ink: null, flat: true, alpha: .85 }); } });
    }
    // ---- the Earth, with soft edges ----
    { const { ex, ey, er } = so, disc = ellPts(ex, ey, er, er, 32);
      glow(ex, ey, er * 1.5, '#9AC8F0', .18, 'source-over');
      restorePaper(disc);
      softPaint(ex, ey, 1.6, () => {
        wash(disc, '#3E72C0', .85, er * .03, 4);
        X.save(); tracePath(X, disc); X.clip();
        for (const [lx, ly, rx, ry, sd] of [[-.35, -.28, .36, .26, 1], [.22, .18, .3, .4, 2], [-.2, .5, .24, .13, 3], [.52, -.42, .2, .15, 4]]) { const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = 1 + .25 * Math.sin(a * 3 + sd) + .12 * Math.sin(a * 5 + sd * 2); pts.push([ex + lx * er + Math.cos(a) * rx * er * rr, ey + ly * er + Math.sin(a) * ry * er * rr]); } wash(pts, '#5E9A4E', .8, er * .05, 3); }
        for (let i = 0; i < 5; i++) { const x0 = ex + (hash(i * 3.7) - .75) * er, y0 = ey + (hash(i * 5.3) - .5) * er * 1.4, L = er * (.35 + .4 * hash(i * 2.1)), pts = []; for (let j = 0; j <= 6; j++) pts.push([x0 + j / 6 * L, y0 + Math.sin(j * 1.1 + i) * er * .05 - j * er * .02]); line(pts, 2.4 + 2 * hash(i), '#F6F0E4', .6, .55); }
        wash(ellPts(ex + er * .6, ey + er * .55, er * .98, er * .98, 24), '#161C4A', .45, er * .06, 3);
        X.restore();
      });
    }
    // ---- the moon: reserved paper, crater washes, a darker settle at the bottom ----
    camBegin(cx, cy, z);
    const globe = ellPts(GCX, GCY, GR, GR, 120), gsw = 1 / Math.max(z, .45);
    restorePaper(globe);
    X.save(); tracePath(X, globe); X.clip();
    wash(globe, '#F4E6C8', .42, 8, 3);
    wash(ellPts(GCX + 80, GCY + GR * .5, GR * 1.05, GR * .9, 40), '#C8B090', .3, 26, 3);
    wash(ellPts(GCX + 160, GCY + GR * .82, GR * .95, GR * .7, 40), '#8A7AA0', .32, 30, 3);
    for (let i = 0; i < 18; i++) {
      const d = GR * Math.sqrt(hash(i * 3 + 7)) * .92, a = -Math.PI / 2 + (hash(i * 5 + 1) - .5) * 2.8, x = GCX + Math.cos(a) * d, y = GCY + Math.sin(a) * d;
      if (y < 700 + 200 && Math.abs(x - GCX) < 300) continue;
      const f = Math.sqrt(1 - Math.pow(d / GR, 2)), rc = GR * (.025 + hash(i * 11) * .055), rx = Math.max(rc * f, rc * .2);
      const cr = xform(ellPts(0, 0, rx, rc, 18), x, y, 1, a);
      wash(cr, '#C8B294', .45, rc * .06, 2);
      X.save(); tracePath(X, cr); X.clip(); wash(xform(ellPts(-rx * .35, -rc * .3, rx, rc, 16), x, y, 1, a), '#8A7890', .3, rc * .05, 2); X.restore();
    }
    for (const [x, y, r] of PITS) { const f = .28 + (y - 700) / 600, cr = ellPts(x, y, r, r * f, 16); wash(cr, '#CDB896', .5, r * .08, 2); X.save(); tracePath(X, cr); X.clip(); wash(ellPts(x - r * .25, y - r * f * .3, r, r * f, 14), '#8A7890', .28, r * .06, 2); X.restore(); }
    X.setTransform(1, 0, 0, 1, 0, 0);
    const sg = X.createLinearGradient(0, 860, 0, 1080); sg.addColorStop(0, 'rgba(120,100,150,0)'); sg.addColorStop(1, 'rgba(96,78,130,.55)'); X.fillStyle = sg; X.fillRect(0, 840, W, 260);
    blooms(200, 950, 1520, 130, '#6A5890', 5, .12, 21);
    X.restore();
    line(globe.slice(62, 86), 1.4 * gsw, '#5A4A68', .5, .5); line(globe.slice(96, 112), 1.2 * gsw, '#5A4A68', .5, .35);
    craterRim(false, z);
    reseed(1000 + Math.floor(t * BOIL));
    rimFigures(t, false, z);
    camEnd();
    // ---- the paper border: the deckled edge of the painted area, with a pooled line ----
    X.save(); X.beginPath(); X.rect(0, 0, W, H); DECKLE.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); X.clip('evenodd'); X.drawImage(PAPER, 0, 0); X.restore();
    reseed(777); X.globalAlpha = .35; X.strokeStyle = '#1A1E50'; X.lineWidth = 2.4; tracePath(X, deform(DECKLE, 2), .2); X.stroke(); X.globalAlpha = 1;
    reseed(1000 + Math.floor(t * BOIL));
  }
  function skyBand(y, amp, seed) {
    const pts = [[-100, -100], [W + 100, -100]];
    for (let i = 0; i <= 16; i++) { const x = W + 100 - i / 16 * (W + 200); pts.push([x, y + amp * Math.sin(i * 1.3 + seed * 2) + amp * .5 * Math.sin(i * 2.9 + seed)]); }
    return pts;
  }

  // ---- the drain: the watercolour painting bleeds in through growing soft blots ----
  let WC = null, MK = null;
  function drain(k, t) {
    if (k <= 0) { style(1); rimFront(t); return; }
    if (k >= 1) { painting(t); return; }
    style(1); rimFront(t);
    if (!WC) { WC = mkCanvas(W, H); MK = mkCanvas(480, 270); }
    const keep = X, keepCam = CAM;
    X = WC.getContext('2d'); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.clearRect(0, 0, W, H);
    painting(t);
    const m = MK.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, 480, 270);
    const blots = [[.47, .56, 0], [.3, .4, .06], [.66, .45, .08], [.2, .75, .14], [.8, .75, .12], [.15, .2, .2], [.85, .2, .18], [.5, .15, .16], [.02, .5, .26], [.98, .5, .26], [.5, .95, .2], [.0, .0, .34], [1, 0, .34], [0, 1, .3], [1, 1, .3]];
    m.filter = 'blur(7px)'; m.fillStyle = '#000';
    blots.forEach(([bx, by, dl], j) => {
      const q = clamp((k - dl) / (.62 - dl * .6)), r = 300 * Math.pow(q, .75);
      if (r < 1) return;
      m.beginPath();
      for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, rr = r * (1 + .16 * Math.sin(a * 3 + j * 1.7) + .09 * Math.sin(a * 7 + j * 3.1) + .05 * Math.sin(a * 13 + j)); const px = bx * 480 + Math.cos(a) * rr, py = by * 270 + Math.sin(a) * rr * .85; i ? m.lineTo(px, py) : m.moveTo(px, py); }
      m.fill();
    });
    m.filter = 'none';
    m.globalAlpha = easeIn(clamp(k * 1.15)); m.fillStyle = '#000'; m.fillRect(0, 0, 480, 270); m.globalAlpha = 1;
    X.globalCompositeOperation = 'destination-in'; X.imageSmoothingEnabled = true; X.drawImage(MK, 0, 0, W, H); X.globalCompositeOperation = 'source-over';
    X = keep; CAM = keepCam;
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.drawImage(WC, 0, 0);
    style(0);
    FX.bloom = .55 * (1 - k); FX.scan = 1 - k; FX.grain = clamp(k * 1.2);
  }
  function outro(t, lt, dur) {
    FX.noAuto = true;
    const k = ease(seg(t, B(453) + .05, B(453) + 1.3));
    drain(k, t);
    X.setTransform(1, 0, 0, 1, 0, 0);
    // no lettering: the painting speaks for itself, then fades to paper
    const fadeAll = ease(seg(t, 157.85, 158.4));
    if (fadeAll > 0) { X.globalAlpha = fadeAll; X.drawImage(PAPER, 0, 0); X.globalAlpha = 1; }
  }

  // ======================================================================================
  chapter('moon', bt(392), 158.8, [
    [B(392), reveal],
    [B(396), rhyme],
    ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [B(400 + i), futShot(i)]),
    [B(408), photoCut(0)],
    [B(409), realCut(0)],
    [B(410), passShot],
    [B(411), chartShot],
    [B(412), soBack],
    [B(414), photoCut(1)],
    [B(414.5), realCut(1)],
    [B(415), photoCut(2)],
    [B(415.5), realCut(2)],
    [B(416), earthrise, { tin: 'white', td: .18 }],
    [B(422), freeze],
    ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [B(424 + i), futShot(8 + i)]),
    ...MONT_BEATS.map((b, i) => [B(b), montShot(i)]),
    [B(440), rimBack, { tin: 'white', td: .22 }],
    [B(448), rimShot],
    [B(453), outro]
  ]);
})();
