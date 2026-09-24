// c07_moon.js: Act VII · On the Moon + Outro (b392 → end, 134.42–158.8 s).
// The final drop happens on the moon in neon: the Dyson sphere blazes on, a moon dance, callbacks, Earthrise, a slow-arc
// sprint, the last montage. Then he sits on a crater rim with the little mask, writes in his notebook, and the neon
// drains back to watercolour: a painted moon, two tiny figures, the Earth, "i choose to do today."
(() => {
  const B = n => bt(n);
  const GOLD = '#FFC24A', SUNW = '#FFE9A8', RIMG = '#FFB35C', DUSTC = '#B9A8D8';

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
      // distant crater rims along the horizon
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
    // pebbles with a lit top
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
  // the Dyson sphere, blazing: halo, god rays, the lattice sphere, a white-hot core. k = intensity 0..1
  function blaze(x, y, r, k, t, o = {}) {
    if (k > .01) {
      glow(x, y, r * 5.5, PAL.nOrange, .2 * k);
      glow(x, y, r * 2.8, GOLD, .3 * k);
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
    dysonSphere(x, y, r, 1, { t });
    if (k > .01) glow(x, y, r * .75, '#FFFFFF', .42 * k);
  }
  // anamorphic lens streak
  function streak(x, y, len, col, a) { X.save(); X.translate(x, y); X.scale(1, .03); glow(0, 0, len, col, a); X.restore(); }
  // floating lit dust motes
  function motes(t, n, x0, y0, w, h, col, seed = 1) {
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const x = x0 + hash(i * 3 + seed) * w + Math.sin(t * .7 + i) * 12, y = y0 + frac(hash(i * 7 + seed) - t * (.02 + hash(i) * .04)) * h, r = 1.5 + hash(i * 11 + seed) * 3.2;
      X.globalAlpha = .35 + .35 * Math.sin(t * 3 + i); X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill();
    }
    X.restore();
  }
  // low-gravity landing puff; age in seconds since touchdown
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
  // hop: low-gravity jump cycle. Takes off / lands on beats. per = beats per hop, off = beat phase
  function hop(t, off, per) { const bp = bpOf(t), u = frac((bp - off) / per), n = Math.floor((bp - off) / per); return { u, n, h: 4 * u * (1 - u), land: (u * per) * BEAT, sq: .2 * Math.exp(-u * per * 9) + .14 * Math.exp(-(1 - u) * per * 14) }; }
  // squash a drawing about its base point
  function squashAt(x, y, sq, fn) { X.save(); X.translate(x, y); X.scale(1 + sq * .5, 1 - sq); X.translate(-x, -y); fn(); X.restore(); }
  // rotating HUD brackets around a circle
  function hudRing(x, y, r, t, k, col = PAL.nCyan) {
    if (k <= .01) return;
    for (let i = 0; i < 4; i++) { const a0 = t * 1.3 + i / 4 * TAU, pts = []; for (let j = 0; j <= 8; j++) { const a = a0 + j / 8 * TAU / 4 * .62; pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]); } neonLine(pts, col, 3, .9, .5); }
  }
  // cancel the current rotation inside hand hooks (keeps props axis-aligned)
  function unrot() { const m = X.getTransform(); X.rotate(-Math.atan2(m.b, m.a)); }

  // ======================================================================================
  // b392–400 · THE REVEAL
  // ======================================================================================
  function reveal(t, lt, dur) {
    style(1);
    const u = lt / dur, ig = expoOut(lt / .28), pb = pulse(t, 4);
    FX.letterbox = .7;
    spaceBg(t, { n: 130 });
    camBegin(960, 560 - 10 * ease(u), 1 + .06 * ease(u));
    const SX = 960, SY = 275, SR = 120;
    blaze(SX, SY, SR, ig * (.82 + .18 * pb), t);
    if (lt < .9) { const k = lt / .9; neonLine(ellPts(SX, SY, SR * (1 + easeOut(k) * 5), SR * (1 + easeOut(k) * 5), 56), SUNW, 7 * (1 - k), 1 - k, .5, true); }
    ground(t, 745, { bend: 30, lit: ig, craters: 11, seed: 2 });
    // the ground lights up from the horizon toward camera
    X.save(); X.globalCompositeOperation = 'lighter';
    const sweep = 745 + 560 * easeOut(lt / .7), gg = X.createLinearGradient(0, 745, 0, sweep);
    gg.addColorStop(0, rgba(GOLD, .3 * ig * (1 - .7 * seg(lt, .45, 1.4)))); gg.addColorStop(1, rgba(GOLD, 0)); X.fillStyle = gg; X.fillRect(-300, 735, W + 600, sweep - 735);
    X.restore();
    // his long shadow toward the camera
    X.save(); X.globalAlpha = .62 * ig; X.fillStyle = '#05030C';
    X.beginPath(); X.moveTo(930, 958); X.lineTo(990, 958); X.lineTo(1110, 1300); X.lineTo(810, 1300); X.fill(); X.restore();
    hero(960, 960, 480, { view: 'back', emblem: ig * (.35 + .4 * pb), rimCol: RIMG });
    motes(t, 40, 200, 250, 1520, 800, SUNW, 3);
    const [fx, fy] = toScreen(SX, SY);
    camEnd();
    // lens flare: streak + ghosts along the axis through frame centre
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
    blaze(SX, SY, SR, .85 + .15 * pb, t, { rayA: .8 });
    ground(t, 965, { bend: 90, craters: 5, seed: 4, cx: 1300 });
    const ex = 680 + 100 * u, ey = 700, gy = ey + 58 * k;
    hero(ex, gy, h, { view: 'back', emblem: .15 + .3 * pb, rimCol: RIMG });
    // the match: HUD brackets lock on to both at b398
    const hk = since(t, 398) > 0 ? backOut(since(t, 398) * 5) : 0;
    hudRing(ex, ey, 8.2 * k * 1.45, t, hk);
    hudRing(SX, SY, SR * 1.45, -t, hk);
    if (hk > 0) { const m = [(ex + SX) / 2, (ey + SY) / 2]; neonLine([[ex + 8.2 * k * 1.5, ey - 30], [m[0], m[1]], [SX - SR * 1.5, SY + 30]], PAL.nCyan, 1.5, .5 * clamp(since(t, 398) * 4), .6); }
    motes(t, 30, 0, 0, W, H, SUNW, 8);
  }

  // ======================================================================================
  // b400–408 · MOON DANCE (low gravity, bouncing on the beats)
  // ======================================================================================
  function danceSky(t, ex, ey, er, sx, sy, sr) {
    spaceBg(t, { n: 110, seed: 12 });
    earth(ex, ey, er, { spin: t * .06 });
    blaze(sx, sy, sr, .75, t, { rayA: .6, rays: 12 });
  }
  function heroHopPose(hp, variant) {
    const s = Math.sin(Math.PI * hp.u), up = Math.pow(s, .7);
    const v = variant % 3;
    const arms = v === 0 ? { aL: [lerp(.35, 2.7, up), .3], aR: [lerp(.35, 2.7, up), .3] }            // both up
      : v === 1 ? { aL: [lerp(.3, .6, up), 1.9], aR: [lerp(.3, 2.9, up), .1] }                           // disco point
        : { aL: [lerp(.4, 1.6, up), 1.4 * up], aR: [lerp(.4, 1.6, up), 1.4 * up] };                     // flappy
    return { ...arms, lL: [.2 + .5 * s, 1.1 * s], lR: [-.2 - .5 * s, 1.1 * s] };
  }
  function danceWide(t, lt, dur) {
    style(1);
    const u = lt / dur;
    danceSky(t, 360, 230, 125, 1570, 210, 85);
    camBegin(960 + 40 * u, 560, 1.02);
    ground(t, 700, { bend: 40, craters: 12, seed: 6 });
    const HX = 720, HY = 960, SXg = 1260, SYg = 930;
    const hh = hop(t, 400, 2), sh = hop(t, 401, 2);
    const hj = hh.h * 250, sj = sh.h * 220;
    shadowEll(HX, HY + 4, 130 * (1 - hh.h * .5), .5 * (1 - hh.h * .6));
    shadowEll(SXg, SYg + 4, 190 * (1 - sh.h * .5), .5 * (1 - sh.h * .6));
    puff(HX, HY, hh.land, 1, 1); puff(SXg, SYg, sh.land, 1.3, 5);
    squashAt(SXg, SYg - sj, sh.sq, () => shoggoth(SXg, SYg - sj - 145, 145, { reach: .35 + .6 * sh.h, tent: 9, eyesN: 9, t: onTwos(t), seed: 2, maskR: .5, mood: { eyes: sh.n % 2 ? 'star' : 'happy', mouth: 'grin' } }));
    squashAt(HX, HY - hj, hh.sq, () => hero(HX, HY - hj, 540, { view: 'front', ...heroHopPose(hh, hh.n), eyes: 'happy', mouth: hh.h > .3 ? 'open' : 'grin', blush: .5, rimCol: RIMG }));
    camEnd();
  }
  function danceLow(t, lt, dur) {
    style(1);
    const u = lt / dur, bp = bpOf(t);
    FX.rot = .03 * Math.sin(bp * Math.PI / 2);
    danceSky(t, 520, 290, 215, 1580, 180, 70);
    ground(t, 930, { bend: 70, craters: 7, seed: 8 });
    const HX = 1170, HY = 1030, SXg = 520, SYg = 1000;
    const hh = hop(t, 404, 2), sh = hop(t, 405, 2);
    const hj = hh.h * 330, sj = sh.h * 300;
    shadowEll(HX, HY, 150 * (1 - hh.h * .5), .5);
    puff(HX, HY, hh.land, 1.3, 2); puff(SXg, SYg, sh.land, 1.6, 7);
    // the shoggoth waves every tentacle overhead
    squashAt(SXg, SYg - sj, sh.sq, () => shoggoth(SXg, SYg - sj - 170, 170, { reach: .5 + .5 * sh.h, tent: 10, eyesN: 11, t: onTwos(t) * 1.4, seed: 4, maskR: .5, mood: { eyes: 'happy', mouth: 'open' } }));
    // second hop: a full backflip
    const flip = hh.n === 1 ? -TAU * easeInOut(clamp((hh.u - .1) / .8)) : 0;
    squashAt(HX, HY - hj, hh.sq, () => hero(HX, HY - hj, 640, { view: 'q', ...heroHopPose(hh, hh.n + 1), rot: flip, eyes: hh.n === 1 ? 'closed' : 'happy', mouth: 'grin', blush: .6, rimCol: RIMG }));
  }

  // ======================================================================================
  // b408–416 · CALLBACKS (1 beat each; half beats at the end)
  // ======================================================================================
  // fallback: the pinned watercolour moon photo from the lab wall
  function fbMoonPhoto(t) {
    style(0);
    X.drawImage(PAPER, 0, 0);
    wash(rectPts(-60, -60, W + 120, H + 120, 20), '#3B3F6E', .85, 26, 4);
    blooms(0, 0, W, H, PAL.night, 6, .12, 4);
    glow(1500, 250, 900, '#FFC96B', .38, 'source-over');
    // sticky notes
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
  // the real moon (neon), centred for the match cut; a tiny figure stands on top, the sphere glints behind
  function realMoon(t, lt, dur, v = 0) {
    style(1);
    spaceBg(t, { n: 140, seed: 21 + v });
    blaze(1530, 230, 60, .7, t, { rays: 10, rayA: .6 });
    const r = 250 * (1 + .14 * v), mx = 980, my = 470 + 20 * v;
    moon(mx, my, r, {});
    hero(mx, my - r + 8, 120 + 16 * v, { view: 'front', ...POSES.cheer, eyes: 'happy', mouth: 'grin', rimCol: RIMG });
    hudRing(mx, my, r * 1.2, t * (v % 2 ? -1 : 1), backOut(lt / dur * 3));
  }
  const photoCut = v => (t, lt, dur) => { (POSTCARDS.moonphoto || fbMoonPhoto)(t); FX.zoom *= 1 + .07 * v; FX.flash = Math.max(FX.flash, .25 * Math.exp(-lt * 20)); };
  const realCut = v => (t, lt, dur) => { realMoon(t, lt, dur, v); FX.zoom *= 1 + .02 * v; };
  // PASS stamped onto the moon
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
      // cracks radiating from the stamp
      for (let i = 0; i < 7; i++) { const ang = i / 7 * TAU + .3, L = 330 + hash(i) * 160; line([[960 + Math.cos(ang) * L, 560 + Math.sin(ang) * L * .45], [960 + Math.cos(ang + .06) * (L + 90), 560 + Math.sin(ang + .06) * (L + 90) * .45], [960 + Math.cos(ang - .03) * (L + 170), 560 + Math.sin(ang - .03) * (L + 170) * .45]], 2.2, '#7A6A5A', .2, clamp(a * 6)); }
    }
    stamp(960, 560, 2.1, 'PASS', '#19C45A', k, { rot: -.1 });
  }
  // the doubling chart, off the charts: the line punches through the top of its frame and the camera chases it up
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
    // the curve: a straight line on log paper... then it goes vertical and punches out of the frame
    const pts = [], N = 70;
    for (let i = 0; i <= N * p; i++) { const q = i / N; pts.push([xOf(q), yOf(q)]); }
    pts.push([xOf(p), tipY]);
    if (pts.length > 1) neonLine(pts, PAL.nYellow, 6, 1, .4);
    for (let i = 0; i < 7; i++) { const q = i / 9; if (q > p) break; paint(ellPts(xOf(q), yOf(q), 13, 13, 12), { fill: PAL.nYellow, ink: PAL.line, sw: 1.4 }); }
    const top = y0 - hh - 40;
    if (tipY < top) for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * .3, d = 30 + Math.min(400, (top - tipY) * .35) * (.6 + hash(i) * .6); paint(polyPts(xOf(p) + Math.cos(a) * d, top + Math.sin(a) * d * .8, 10 + hash(i) * 10, 3, i), { fill: i % 2 ? PAL.nCyan : '#FFFFFF', ink: null, alpha: .85, flat: true }); }
    // the little mask surfs the tip up and out
    mask(xOf(p) - 10, tipY - 60, 56, { eyes: 'star', mouth: 'open', rot: -.25 });
    camEnd();
    if (tipY < top) speedLines(960, 1400, 1, { col: '#FFFFFF', n: 40, alpha: .3 });
  }
  // WE'RE SO BACK
  function soBack(t, lt, dur) {
    style(1);
    spaceBg(t, { n: 90, seed: 41, stops: [[0, '#07040F'], [.6, '#1E0F3A'], [1, '#4A1650']] });
    speedLines(960, 620, 1, { col: PAL.nYellow, n: 34, alpha: .22 });
    earth(1500, 300, 175, { spin: t * .08 });
    ground(t, 900, { bend: 90, craters: 7, seed: 12 });
    const hh = hop(t, 412, 1), hj = hh.h * 150;
    shoggoth(1360, 700, 190, { reach: .9, tent: 10, eyesN: 12, t: onTwos(t) * 1.6, seed: 6, maskR: .5, mood: { eyes: 'star', mouth: 'open' } });
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
    blaze(1720, 140, 50, .6, t, { rays: 8, rayA: .5 });
    camBegin(960, 560 - 60 * ease(u), 1.04);
    const ey = lerp(1080, 500, easeOut(clamp(lt / 1.6)));
    earth(720, ey, 310, { spin: t * .05 });
    ground(t, 830, { bend: 60, craters: 9, seed: 14, rimCol: PAL.nCyan, lit: .7 });
    // he waves at home (the hand swings on every beat); the little shoggoth waves a tentacle too
    const wv = Math.sin(bp * Math.PI);
    shogBackSide(1560, 1000, 80, t, wv);
    hero(1300, 1030, 640, { view: 'q', flip: true, aR: [2.45, .55 * wv], aL: [.25, .2], lL: [.06, 0], lR: [-.08, 0], lookX: .9, lookY: -.3, eyes: 'happy', mouth: 'open', blush: .6, rimCol: PAL.nCyan, tilt: .06 });
    camEnd();
  }
  function shogBackSide(x, y, s, t, wv) {
    const sp = tentacle(x - s * .4, y - s * .6, -Math.PI / 2 - .5 + wv * .35, s * 2.2, s * .22, t, 5, { amp: .2 });
    shoggoth(x, y - s * .85, s, { reach: .3, tent: 6, eyesN: 5, t: onTwos(t), seed: 8, maskR: .55, mood: { eyes: 'happy', mouth: 'grin', look: [-1, -.4] } });
    return sp;
  }

  // ======================================================================================
  // b422–424 · FREEZE (gap)   ·   b424–432 · CRATER-TO-CRATER SPRINT
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
    // hanging dust
    for (let i = 0; i < 40; i++) { const x = 300 + hash(i * 3) * 1300, y = 650 + hash(i * 7) * 380, r = 4 + hash(i) * 9; paint(ellPts(x, y + Math.sin(i + crawl * 3) * 3, r, r * .8, 8), { fill: DUSTC, ink: null, alpha: .7, flat: true }); }
    shoggoth(1500, 850, 105, { reach: .8, tent: 9, t: 12.3, seed: 5, maskR: .5, mood: { eyes: 'wide', mouth: 'o', look: [-1, 0] } });
    const HX = 1040 + crawl * 60, HY = 760 - crawl * 20;
    afterimages(6, (i, col, a) => {
      const x = HX - i * 125, y = HY + i * i * 11, pz = leapPose(.5 - i * .07);
      if (col) hero(x, y, 520, { view: 'side', ...pz, silhouette: col, alpha: a * 1.2 });
      else hero(x, y, 520, { view: 'side', ...pz, eyes: 'determined', mouth: 'grin', brows: 'angry', chrome: 1, rimCol: RIMG });
    });
    camEnd();
    // a time-stop ring
    if (lt < .4) { const k = lt / .4; neonLine(ellPts(1040, 500, 100 + k * 1300, 100 + k * 1300, 48), '#FFFFFF', 6 * (1 - k), 1 - k, .5, true); }
  }
  function sprintSide(t, lt, dur) {
    style(1);
    const v = 820, run = t - B(424);
    spaceBg(t, { n: 110, seed: 71, px: -run * 30 });
    earth(1480, 230, 120, { spin: t * .05 });
    blaze(340, 190, 70, .7, t, { rays: 10, rayA: .5 });
    ground(t, 590, { bend: 20, craters: 13, seed: 18, scroll: run * v });
    const HX = 860, HY = 985, hH = 290;
    // landing rims: one crater lip under each touchdown (even beats)
    for (let n = -1; n <= 3; n++) { const sx = HX + v * (bt(424 + 2 * n) - t) - 30; crater(sx + 180, HY + 18, 190, 40, 1, GOLD); }
    const hh = hop(t, 424, 2), sh = hop(t, 425, 2);
    // the shoggoth gallops alongside, a stride ahead, further back
    const SXs = 1330 + 40 * Math.sin(t * 2), SYs = 760, sj = sh.h * 170;
    shadowEll(SXs, SYs, 100 * (1 - sh.h * .5), .45);
    puff(SXs, SYs, sh.land, .8, 17);
    shoggoth(SXs, SYs - sj - 90, 90, { reach: .95, tent: 9, eyesN: 9, t: onTwos(t) * 2, seed: 9, maskR: .52, mood: { eyes: 'happy', mouth: 'open', look: [-1, 0] } });
    shadowEll(HX, HY, 120 * (1 - hh.h * .45), .7);
    puff(HX, HY, hh.land, 1.1, 11);
    afterimages(6, (i, col, a) => {
      const tt = t - i * .075, hi = hop(tt, 424, 2), x = HX - v * (t - tt), y = HY - hi.h * hH, pz = leapPose(hi.u);
      if (col) hero(x, y, 480, { view: 'side', ...pz, silhouette: col, alpha: a });
      else squashAt(x, y, hi.sq * .8, () => hero(x, y, 480, { view: 'side', ...pz, eyes: 'determined', mouth: 'grin', chrome: 1, rimCol: RIMG, hairWind: -.8 }));
    });
    speedLines(W * 1.4, H * .5, .6, { col: '#FFFFFF', n: 26, alpha: .25, r0: 900 });
  }
  function sprintWide(t, lt, dur) {
    style(1);
    const u = lt / dur;
    spaceBg(t, { n: 130, seed: 81 });
    earth(430, 250, 165, { spin: t * .05 });
    blaze(1560, 210, 105, .85, t, { rays: 12, rayA: .6 });
    camBegin(900 + 180 * ease(u), 560, 1);
    ground(t, 700, { bend: 45, craters: 6, seed: 22 });
    crater(1050, 900, 720, 150, 1, GOLD);
    // central peak
    paint([[930, 920], [1010, 850], [1050, 835], [1100, 855], [1170, 920]], { fill: '#3A2D60', shade: '#1E1640', ink: PAL.line, sw: 1.6, curv: .4 });
    neonLine([[1000, 856], [1050, 836], [1100, 856]], GOLD, 2, .6, .5);
    // two long arcs: left rim → central peak → right rim
    const P = [[260, 860], [1050, 836], [1840, 860]], aH = 360;
    const at = tt => { const q = clamp((bpOf(tt) - 428) / 2, 0, 1.999), s = Math.floor(q), f = q - s, [ax, ay] = P[s], [bx, by] = P[s + 1]; return { x: lerp(ax, bx, f), y: lerp(ay, by, f) - 4 * aH * f * (1 - f), f, s }; };
    // rainbow trail along the arc already flown
    const trail = []; for (let i = 0; i <= 40; i++) { const tt = t - i * .02; if (tt < B(428)) break; const p = at(tt); trail.push([p.x, p.y - 150]); }
    if (trail.length > 1) TRAIL_COLS.forEach((c, j) => neonLine(trail.map(([x, y]) => [x, y + (j - 2.5) * 9]), c, 3.5, .55, .5));
    // shoggoth bounding across the crater floor below
    const sb = hop(t, 429, 2), sx = lerp(-60, 1500, u);
    shadowEll(sx, 1030, 90 * (1 - sb.h * .5), .45);
    shoggoth(sx, 1030 - sb.h * 90 - 80, 80, { reach: .95, tent: 8, eyesN: 7, t: onTwos(t) * 2, seed: 10, maskR: .55, mood: { eyes: 'happy', mouth: 'open', look: [1, -.5] } });
    const lp = at(t);
    puff(P[lp.s][0], P[lp.s][1], lp.f * 2 * BEAT, 1, 13);
    afterimages(7, (i, col, a) => {
      const p = at(t - i * .045), pz = leapPose(p.f);
      if (col) hero(p.x, p.y, 310, { view: 'side', ...pz, silhouette: col, alpha: a });
      else hero(p.x, p.y, 310, { view: 'side', ...pz, eyes: 'determined', mouth: 'grin', rimCol: RIMG });
    });
    camEnd();
  }

  // ======================================================================================
  // b432–440 · FINAL MONTAGE (postcards from every act, with fallbacks)
  // ======================================================================================
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
    shoggoth(960, 520, 270, { reach: .85, mood: { eyes: 'happy', mouth: 'grin' }, t: onTwos(t) });
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
    for (let i = 0; i < 30; i++) { const a = hash(i) * TAU + t * .3, d = 900 - frac(hash(i * 3) + t * .6) * 500; X.save(); X.translate(960 + Math.cos(a) * d, 540 + Math.sin(a) * d * .6); X.rotate(a); paint(rectPts(-22, -12, 44, 24), { fill: '#1A2A5A', ink: PAL.nCyan, sw: 1.2 }); X.restore(); }
    blaze(960, 540, 320, .85, t);
  }
  const MONT = [['lab', fbLab], ['mask', fbMask], ['jackin', fbJackin], ['shoggoth', fbShog], ['city', fbCity], ['train', fbTrain], ['foom', fbFoom], ['rocket', fbRocket], ['capsule', fbCapsule], ['dyson', fbDyson]];
  const montShot = i => (t, lt, dur) => {
    const [name, fb] = MONT[i];
    (POSTCARDS[name] || fb)(t);
    FX.flash = Math.max(FX.flash, .3 * Math.exp(-lt * 18)); FX.flashCol = '#FFFFFF';
    FX.zoom *= 1.07 - .07 * easeOut(lt / dur);
  };
  const MONT_BEATS = [432, 433, 434, 435, 436, 437, 438, 438.5, 439, 439.5];

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
    blaze(1190, 255, 145, .78 + .12 * pb, t, { rays: 14, rayA: .65 });
    ground(t, 575, { bend: 35, craters: 4, seed: 26, pebbles: 6 });
    // the crater basin they look across
    paint(ellPts(960, 735, 1300, 165, 48), { fill: '#120B26', ink: PAL.line, sw: 1.5 });
    X.save(); tracePath(X, ellPts(960, 735, 1300, 165, 48)); X.clip(); paint(ellPts(960, 620, 1360, 150, 40), { fill: '#33245A', ink: null }); X.restore();
    const far = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * (1.02 + i / 24 * .96); far.push([960 + Math.cos(a) * 1300, 735 + Math.sin(a) * 165]); }
    neonLine(far, GOLD, 2.4, .6, .5);
    // him and the little one, side by side
    const turn = since(t, 444) > 0 ? easeOut(since(t, 444) * 4) : 0;
    hero(830, 1224, 720, { view: 'back', ...POSES.sit, aL: [.32, -.1], aR: [.3, -.05], emblem: .3 + .4 * pb, rimCol: RIMG, tilt: .1 * turn });
    const SXs = 1120, SYs = 842;
    shoggoth(SXs, SYs, 92, { mask: false, reach: .3, tent: 6, eyesN: 5, t: onTwos(t), seed: 12, look: [lerp(0, -1, turn), -1] });
    // on b444 its mask swings round to look at him
    if (turn > 0) mask(SXs - 60 * turn, SYs - 22, 52, { tilt3d: -.7, look: [-1, 0], eyes: 'happy', mouth: 'smile', alpha: clamp(turn * 3), glow: .4 });
    // the near rim in front hides their legs
    const ridge = []; for (let i = 0; i <= 22; i++) { const x = -300 + i / 22 * (W + 600); ridge.push([x, 905 + Math.sin(i * 1.7) * 9 + Math.pow((x - 960) / 900, 2) * 45]); }
    paint([...ridge, [W + 300, H + 300], [-300, H + 300]], { fill: '#1C1438', ink: PAL.line, sw: 2, curv: .3 });
    vgrad(-300, 930, W + 600, 300, [[0, 'rgba(11,7,22,0)'], [1, 'rgba(11,7,22,.8)']]);
    neonLine(ridge, RIMG, 2.8, .85, .4);
    motes(t, 26, 200, 250, 1500, 700, SUNW, 11);
    camEnd();
  }

  // ======================================================================================
  // b448 → end · side view on the rim of a little crater at the top of the moon; the camera pulls back until the
  // moon is a small globe; then the neon drains to watercolour
  // ======================================================================================
  const GR = 1500, GCX = 960, GCY = 700 + GR;            // the moon as a globe (world units)
  const HHf = 180, SEAT = [900, 668];                   // his height and seat (hips) in world units
  function rimCam(t) {
    const e = ease(seg(t, B(448) - .3, 157.3)), z = Math.exp(lerp(Math.log(2.7), Math.log(.42), e)), ty = lerp(610, 665, e);
    return { z, cx: lerp(930, 960, e), cy: 670 - (ty - 540) / z, e };
  }
  function craterRim(neon, z) {
    const fill = neon ? '#D8CAB2' : '#F4EAD6', ink = neon ? PAL.line : PAL.ink, sw = (neon ? 2 : 1.5) / Math.max(z, .45);
    paint(ellPts(1000, 716, 60, 9, 18), { fill: neon ? '#A8969E' : '#DCCAA8', ink: null, wet: 2 });
    const L = [[748, 717], [795, 694], [842, 676], [882, 667], [918, 668], [942, 688], [954, 717]], R2 = [[1046, 717], [1063, 698], [1090, 689], [1118, 695], [1150, 717]];
    for (const P of [L, R2]) {
      paint([...P, [P[P.length - 1][0] + 20, 745], [P[0][0] - 20, 745]], { fill, ink: null, curv: .5, wet: 3, layers: 2 });
      line(P, sw, ink, .5);
    }
    if (neon) neonLine(L.slice(0, 5), RIMG, 1.4 / Math.max(z, .5), .8, .5);
  }
  function skyBand(y, amp, seed) {
    const pts = [[-100, -100], [W + 100, -100]];
    for (let i = 0; i <= 16; i++) { const x = W + 100 - i / 16 * (W + 200); pts.push([x, y + amp * Math.sin(i * 1.3 + seed * 2) + amp * .5 * Math.sin(i * 2.9 + seed)]); }
    return pts;
  }
  // small craters and pebbles near their seat (world units), so the ground isn't a bare slab up close
  const PITS = [[640, 752, 34], [1190, 770, 46], [1370, 742, 22], [520, 800, 58], [1010, 820, 30], [780, 860, 70], [1260, 880, 40]];
  function rimFront(t) {
    const neon = NEON >= .5, { z, cx, cy, e } = rimCam(t);
    // ---- sky (screen space) ----
    if (neon) {
      vgrad(-200, -200, W + 400, H + 400, [[0, '#05030C'], [.6, '#140B2E'], [1, '#3A1A4A']]);
      stars(t, 150, { seed: 111, ext: [W + 200, H], x0: -100 });
      glow(-150, 760, 1000, GOLD, .22);
    } else {
      X.drawImage(PAPER, 0, 0);
      wash(skyBand(260, 60, 1), PAL.night, .72, 30, 4);
      wash(skyBand(330, 50, 2), PAL.violet, .18, 30, 3);
      blooms(0, -40, W, 240, PAL.indigo, 6, .1, 5);
      stars(t, 34, { seed: 111, ext: [W, 250] });
      wash(ellPts(960, 650, 360, 90, 20), PAL.ochre, .06, 30, 3);
    }
    earth(lerp(1440, 1500, e), lerp(260, 245, e), lerp(150, 112, e), { spin: 3 + t * .03 });
    // ---- the world ----
    camBegin(cx, cy, z);
    const gsw = 1 / Math.max(z, .45);
    paint(ellPts(GCX, GCY, GR, GR, 120), neon ? { fill: '#D8CAB2', shade: '#8E7AA8', light: [-.07, -.05], ink: PAL.line, sw: 2.2 * gsw } : { fill: '#F4EAD6', shade: '#D6C4A6', light: [-.07, -.05], ink: PAL.ink, sw: 1.6 * gsw, wet: 6 });
    for (let i = 0; i < 16; i++) {
      const d = GR * Math.sqrt(hash(i * 3 + 7)) * .9, a = -Math.PI / 2 + (hash(i * 5 + 1) - .5) * 2.7, x = GCX + Math.cos(a) * d, y = GCY + Math.sin(a) * d;
      if (y < 700 + 220 && Math.abs(x - GCX) < 330) continue;
      const f = Math.sqrt(1 - Math.pow(d / GR, 2)), rc = GR * (.025 + hash(i * 11) * .05);
      paint(xform(ellPts(0, 0, Math.max(rc * f, rc * .18), rc, 20), x, y, 1, a), { fill: neon ? '#C4B49E' : '#EADCC2', shade: neon ? '#8A769C' : '#C8B292', light: [.1, .15], ink: neon ? null : PAL.ink, sw: gsw, wet: 3, alpha: .9 });
    }
    for (const [x, y, r] of PITS) {
      const f = .28 + (y - 700) / 600;
      paint(ellPts(x, y, r, r * f, 18), { fill: neon ? '#BFAE98' : '#E6D6BA', shade: neon ? '#8A769C' : '#C8B292', light: [.1, .25], ink: neon ? null : PAL.ink, sw: gsw * .8, wet: 2 });
    }
    if (neon) glowPath(ellPts(GCX, GCY, GR, GR, 120), GOLD, 1.1 * gsw, 0, .45);
    craterRim(neon, z);
    // ---- the two of them ----
    const lean = since(t, 448) > 0 ? backOut(since(t, 448) / .5) : 0;             // the mask leans on his shoulder
    const nb = since(t, 449.3) > 0 ? backOut(since(t, 449.3) / .45) : 0;          // the notebook comes out
    const wr = since(t, 450) > 0 ? 1 : 0, wph = t * 10;
    const k = HHf / 100, gy = SEAT[1] + 44 * k;
    // the little one sits just behind him and leans its mask on his shoulder
    const bx = 856, by = 671, sS = 32;
    X.save(); X.translate(bx, by); X.rotate(.5 * lean); X.translate(-bx, -by);
    shoggoth(bx, by - sS * .8, sS, { reach: .22, tent: 6, eyesN: 4, t: onTwos(t), seed: 14, maskR: .58, maskAt: [2, -sS * .55], mood: { eyes: lean > .5 ? 'happy' : 'open', mouth: 'smile', look: [.6, .2], tilt3d: .3 } });
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
      // the notebook, held up on his knees; lines of writing appear as he writes
      X.save(); X.translate(SEAT[0] + 40, SEAT[1] - 18); X.rotate(-.55); X.scale(nb * 2.1, nb * 2.1);
      paint(rrPts(-10, -7, 20, 14, 1.2), { fill: neon ? '#FF8A1F' : PAL.clay, ink: neon ? PAL.line : PAL.ink, sw: .6, flat: true });
      paint(rrPts(-9.2, -6.3, 18.4, 12.6, .8), { fill: neon ? '#FFF6E6' : '#FFFBF0', ink: neon ? PAL.line : PAL.ink, sw: .4, flat: true });
      line([[0, -6.2], [0, 6.2]], .4, neon ? '#8A7AA0' : PAL.slate, 0);
      const p = wr ? clamp(since(t, 450) / (B(453) - B(450))) : 0;
      for (let i = 0; i < 4; i++) { const q = clamp(p * 4 - i); if (q <= 0) break; const y = -3.8 + i * 2.6, pts = []; for (let j = 0; j <= 10 * q; j++) pts.push([1.4 + j * .65, y + Math.sin(j * 2.3 + i) * .35]); if (pts.length > 1) line(pts, .32, neon ? '#2A1E48' : PAL.ink, .3); }
      X.restore();
      // his writing hand + pen on top
      if (handM) { X.save(); X.setTransform(handM); unrot(); line([[0, 0], [2.6, 3.2]], .8, neon ? PAL.nCyan : PAL.ink, 0); paint(ellPts(0, 0, 3.3, 3.3, 10), { fill: neon ? HERO.skinN : HERO.skin, shade: neon ? HERO.skinNDk : HERO.skinDk, ink: neon ? PAL.line : PAL.ink, sw: .5 }); X.restore(); }
    }
    camEnd();
  }
  function rimShot(t, lt, dur) { style(1); FX.noAuto = true; FX.zoom *= 1 + .012 * pulse(t, 7); rimFront(t); }

  // ---- the drain: the watercolour version bleeds in through growing soft blots ----
  let WC = null, MK = null;
  function drain(draw, k) {
    if (k <= 0) { style(1); draw(); return; }
    if (k >= 1) { style(0); draw(); return; }
    style(1); draw();
    if (!WC) { WC = mkCanvas(W, H); MK = mkCanvas(480, 270); }
    const keep = X, keepCam = CAM;
    X = WC.getContext('2d'); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.clearRect(0, 0, W, H);
    style(0); draw();
    // mask: soft blots, the first one centred on the two friends, growing outward
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
    const k = ease(seg(t, B(453) + .05, B(453) + 1.45));
    drain(() => rimFront(t), k);
    X.setTransform(1, 0, 0, 1, 0, 0);
    // hand lettering, written left to right
    const s = 'i choose to do today.', size = 118, lx = 960, ly = 432;
    const p = seg(t, 155.95, 157.05), w = txtW(s, size, 'Caveat');
    const fadeAll = seg(t, 157.85, 158.45), fadeTxt = seg(t, 158.2, 158.72), trot = -.02 + jit(.002);
    if (p > 0) {
      X.save(); X.beginPath(); X.rect(lx - w / 2 - 20, 0, (w + 40) * p, H); X.clip();
      txt(s, lx, ly, size, PAL.ink, { font: 'Caveat', rot: trot, alpha: 1 - fadeTxt });
      X.restore();
      if (p < 1) { const px = lx - w / 2 + w * p; paint(ellPts(px, ly + 8 + Math.sin(t * 40) * 18, 5, 5, 8), { fill: PAL.ink, ink: null, alpha: .6 }); }
      // a little underline flourish once the line is done
      const uq = seg(t, 157.05, 157.4); if (uq > 0) { const pts = []; for (let i = 0; i <= 20 * uq; i++) pts.push([lx - w * .38 + i / 20 * w * .76, ly + 70 + Math.sin(i / 20 * Math.PI) * 8]); if (pts.length > 1) line(pts, 2.2, PAL.clay, .5, .8 * (1 - fadeTxt)); }
    }
    // fade to paper (painting first, then the words)
    if (fadeAll > 0) { X.globalAlpha = ease(fadeAll); X.drawImage(PAPER, 0, 0); X.globalAlpha = 1; if (p > 0 && fadeTxt < 1) { X.save(); X.beginPath(); X.rect(lx - w / 2 - 20, 0, (w + 40) * p, H); X.clip(); txt(s, lx, ly, size, PAL.ink, { font: 'Caveat', rot: trot, alpha: (1 - ease(fadeTxt)) * ease(fadeAll) }); X.restore(); } }
  }

  // ======================================================================================
  chapter('moon', bt(392), 158.8, [
    [B(392), reveal],
    [B(396), rhyme],
    [B(400), danceWide],
    [B(404), danceLow],
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
    [B(424), sprintSide],
    [B(428), sprintWide],
    ...MONT_BEATS.map((b, i) => [B(b), montShot(i)]),
    [B(440), rimBack, { tin: 'white', td: .22 }],
    [B(448), rimShot],
    [B(453), outro]
  ]);
})();
