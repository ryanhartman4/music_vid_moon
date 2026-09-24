// c06_dyson.js: Act VI · Dyson (b328–b392, 112.47–134.42 s). Neon on the moon: sun gold/orange, lattice cyan.
// The BUILD. The cut rate accelerates 8 → 4 → 2 → 1 → ½ beat, then the break b384–392 (bass out).
//   b328 touchdown in a dust plume; he hops out (helmet, bomber over suit) and plants a tiny server rack; Earth low in the sky
//   b336 the shoggoth unfurls out of the rocket's nose, huge, and flings solar panels at the sun (b340–343)
//   b344 moon-base racks pop out of the regolith, one row per beat (near → far; the last beat fills the plain)
//   b348 streams of panels spiral into the sun, one new stream per beat
//   b352 assembly (wide): the four lattice rings snap on, one per beat · b356 (close): each ring's panels lock on, one per beat
//   b360 2-beat cuts: Kardashev gauge → TYPE II · the chart goes vertical · the RHYME (his back emblem ⇄ the sphere) · mask star eyes
//   b368 1-beat close-ups: determined face · mask grin · panel clamp · sun flare · rack lights · fist bump · emblem · tentacles
//   b376 half-beat stutter montage: the shell closes 86 → 99.6 %, energy beams hit the rack farm, flashes
//   b384 break: the shell closes, the sun goes dark, the stars come out; crane down to him + the mask looking up;
//        b391 an ignition flare starts (c07 blazes it on at b392)
// The payoff: the sphere they build has the emblem's exact geometry (RINGS mirrors dysonEmblem in hero.js). b364 rhymes them.
(() => {
  const BT = BEAT;
  const G = {
    gold: '#FFC24A', amber: '#FF9A2A', sunW: '#FFE9A8', rimG: '#FFB35C',
    reg: '#2E2352', regDk: '#110A24', regHi: '#4A3A6A', crater: '#0F0A20', craterRim: '#3A2D60',
    dust: '#9C8CC0', dustDk: '#5E5088',
    panel: '#10245E', tile: '#0B0F2C', tileHi: '#1F2A66'
  };
  const hitAt = (lt, at, k = 8) => lt < at ? 0 : Math.exp(-(lt - at) * k);
  const up = (lt, at, len = .18) => clamp((lt - at) / len);
  const popK = (lt, at, len = .18) => lt < at ? 0 : backOut(clamp((lt - at) / len));
  const par = (u, h) => 4 * h * u * (1 - u);
  const unrot = () => { const m = X.getTransform(); X.rotate(-Math.atan2(m.b, m.a)); };

  // ======================================================================================
  // sets & props
  // ======================================================================================
  function starField(t, n = 120, a = 1, o = {}) {
    if (a <= .01) return;
    const seed = o.seed ?? 6, ox = o.ox || 0, oy = o.oy || 0, sz = o.size || 1, Wd = W + 400;
    for (let i = 0; i < n; i++) {
      const x = ((hash(i * 3.3 + seed) * Wd + ox) % Wd + Wd) % Wd - 200, y = hash(i * 7.1 + seed) * (H + 240) - 120 + oy;
      const tw = .55 + .45 * Math.sin(t * (1 + hash(i) * 3) + i), r = (1 + hash(i * 1.7 + seed) * 2.4) * sz, hv = hash(i * 9 + seed);
      X.globalAlpha = a * (.35 + .65 * tw); X.fillStyle = hv < .14 ? PAL.nCyan : hv < .24 ? '#FFE6A8' : '#FFFFFF';
      X.fillRect(x - r / 2, y - r / 2, r, r);
      if (r > 3.1 * sz) glow(x, y, r * 5, '#FFFFFF', .2 * tw * a);
    }
    X.globalAlpha = 1;
  }
  function space(t, o = {}) {
    vgrad(-200, -200, W + 400, H + 400, o.stops || [[0, '#030208'], [.55, '#0B0620'], [1, '#1C0F38']]);
    starField(t, o.n ?? 120, o.starA ?? 1, { seed: o.seed ?? 6, ox: o.sx || 0, oy: o.sy || 0, size: o.size });
  }
  // the sun: halo, slow corona rays, a cel disc with a white-hot core. k = brightness
  function sun(x, y, r, k = 1, o = {}) {
    const A = o.alpha ?? 1; if (k <= .01 || A <= .01) return;
    const t = o.t ?? T; k *= A;
    glow(x, y, r * (o.halo ?? 5), PAL.nOrange, .3 * k);
    glow(x, y, r * 2.3, '#FFB23A', .45 * k);
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = '#FFB84A';
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * TAU + t * .12 * (i % 2 ? 1 : -1) + hash(i), L = r * (1.45 + .9 * hash(i * 3) + .2 * Math.sin(t * 4 + i)), w = .05 + .05 * hash(i * 5);
      X.globalAlpha = .15 * k; X.beginPath(); X.moveTo(x + Math.cos(a - w) * r * .9, y + Math.sin(a - w) * r * .9); X.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); X.lineTo(x + Math.cos(a + w) * r * .9, y + Math.sin(a + w) * r * .9); X.fill();
    }
    X.restore();
    paint(ellPts(x, y, r, r, 40), { fill: mixCol('#6A2A10', '#FFE27A', k / A), shade: mixCol('#3A1406', PAL.nOrange, k / A), rim: k > .3 ? '#FFFFFF' : undefined, ink: null, light: [-.1, -.12], alpha: A });
    glow(x, y, r * 1.1, '#FFFFFF', (r > 150 ? .3 : .5) * k);
  }

  // ---------- the Dyson lattice: the emblem's geometry, built big ----------
  const RINGS = [[0, 1], [.95, .38], [-.95, .38], [Math.PI / 2, .3]];   // == dysonEmblem's rings (hero.js)
  const SW0 = [-Math.PI / 2, -.5, Math.PI - .5, Math.PI / 2];          // where each ring's weld starts
  function ringPt(x, y, r, i, a, spin) {
    const [rot, sy] = RINGS[i], R = rot + spin, c = Math.cos(R), s = Math.sin(R), px = Math.cos(a) * r, py = Math.sin(a) * r * sy;
    return [x + px * c - py * s, y + px * s + py * c];
  }
  function ringTan(i, a, spin) { const [rot, sy] = RINGS[i], R = rot + spin, dx = -Math.sin(a), dy = Math.cos(a) * sy; return Math.atan2(dx * Math.sin(R) + dy * Math.cos(R), dx * Math.cos(R) - dy * Math.sin(R)); }
  // o.rings: number 0..4 or per-ring sweep [k0..k3]; o.panels: same, per-ring panel lock; o.sun: brightness; o.shell: 0..1 closing
  // o.swarm: 0..1 the orbiting panel band (the emblem's dots); o.flash: per-ring highlight; o.spin; o.ign: seams igniting
  function lattice(x, y, r, o = {}) {
    const A = o.alpha ?? 1, spin = o.spin ?? 0, sunK = o.sun ?? 1, t = o.t ?? T;
    const rk = Array.isArray(o.rings) ? o.rings : [0, 1, 2, 3].map(i => clamp((o.rings ?? 4) - i));
    const pk = Array.isArray(o.panels) ? o.panels : [0, 1, 2, 3].map(i => clamp((o.panels ?? 4) - i));
    const fl = o.flash || [0, 0, 0, 0];
    if (sunK > .01) { glow(x, y, r * 2.7, PAL.nOrange, .36 * sunK * A); glow(x, y, r * 1.45, '#FFC860', .28 * sunK * A); }
    if ((o.shell || 0) < .999 || sunK > .01) sun(x, y, r * .55, sunK, { halo: 2.4, t, alpha: A });
    if ((o.shell || 0) > 0) shellTiles(x, y, r * .97, o.shell, spin, o);
    const sw = r * .016 + 1.6, swarm = o.swarm ?? 0;
    const swarmPts = (back) => { if (swarm <= 0) return; for (let j = 0; j < 10; j++) { const a = j / 10 * TAU + t * .4, sn = Math.sin(a); if ((sn < 0) !== back) continue; const px = x + Math.cos(a) * r, py = y + sn * r * .38, s = popK(swarm, j * .05, .5); pnl(px, py, r * .1 * s, r * .07 * s, 0, { alpha: A * (back ? .75 : 1), glint: .4 * hitAt(swarm, j * .05 + .2, 3) }); } };
    swarmPts(true);
    for (let i = 0; i < 4; i++) {
      const k = rk[i]; if (k <= 0) continue;
      const n = 72, pts = [], a0 = SW0[i], ra = A * (o.ringA ?? 1), f = clamp(fl[i] || 0);
      for (let j = 0; j <= Math.ceil(n * k); j++) pts.push(ringPt(x, y, r, i, a0 + Math.min(j / n, k) * TAU, spin));
      if (pts.length < 2) continue;
      line(pts, sw * 1.25, '#040818', .4, .9 * ra);
      neonLine(pts, f > .02 ? mixCol(PAL.nCyan, '#FFFFFF', f) : PAL.nCyan, sw * (1 + f * .9), ra, .4);
      if (r > 140) {   // truss ticks
        X.save(); X.strokeStyle = '#9FF7FF'; X.globalAlpha = .4 * ra; X.lineWidth = Math.max(1, r * .004); X.beginPath();
        for (let j = 1; j < pts.length; j += 2) { const a = a0 + j / n * TAU, [px, py] = pts[j], ta = ringTan(i, a, spin) + Math.PI / 2, L = r * .024; X.moveTo(px - Math.cos(ta) * L, py - Math.sin(ta) * L); X.lineTo(px + Math.cos(ta) * L, py + Math.sin(ta) * L); }
        X.stroke(); X.restore();
      }
      if (k < 1) { const [hx, hy] = pts[pts.length - 1]; glow(hx, hy, r * .35, PAL.nCyan, .5 * A); glow(hx, hy, r * .12, '#FFFFFF', .9 * A); paint(starPts(hx, hy, r * .09, .22, 4, t * 20), { fill: '#FFFFFF', ink: null, alpha: A }); }
      if (f > .05) glowPath(pts, '#FFFFFF', sw * .22 * f, .4, f * A * .8, false);
      const q = pk[i];
      if (q > 0) for (let j = 0; j < 14; j++) { const u = j / 14, s = popK(q, u * .55, .4); if (s <= 0) continue; const a = a0 + (j + .5) / 14 * TAU, [px, py] = ringPt(x, y, r, i, a, spin); pnl(px, py, r * .075 * s, r * .048 * s, ringTan(i, a, spin), { alpha: A, glint: .6 * hitAt(q, u * .55 + .15, 5) }); }
    }
    swarmPts(false);
  }
  // the shell: lat/long tiles over the front hemisphere, sliding in from outside as k grows (1 = closed)
  function shellTiles(x, y, r, k, spin, o) {
    const NB = 9, NL = 12, ign = o.ign || 0;
    X.save(); X.translate(x, y); X.rotate(spin * .5); X.lineJoin = 'round';
    for (let i = 0; i < NB; i++) for (let j = 0; j < NL; j++) {
      const th = hash(i * 37.1 + j * 11.3 + 5) * .97; if (th >= k) continue;
      const ar = easeOut(clamp((k - th) / .04));
      const p0 = -Math.PI / 2 + i / NB * Math.PI, p1 = p0 + Math.PI / NB, l0 = -Math.PI / 2 + j / NL * Math.PI, l1 = l0 + Math.PI / NL;
      const pm = (p0 + p1) / 2, lm = (l0 + l1) / 2, face = Math.cos(pm) * Math.cos(lm);
      const P = (p, l) => [r * Math.sin(l) * Math.cos(p), r * Math.sin(p)];
      const c = P(pm, lm), sc = .92 * lerp(1.7, 1, ar), out = (1 - ar) * r * .35, cl = Math.hypot(c[0], c[1]) || 1;
      const q = [P(p0, l0), P(p0, l1), P(p1, l1), P(p1, l0)].map(([px, py]) => [c[0] + (px - c[0]) * sc + c[0] / cl * out, c[1] + (py - c[1]) * sc + c[1] / cl * out]);
      X.globalAlpha = (o.alpha ?? 1) * (.35 + .65 * ar);
      X.fillStyle = mixCol(mixCol(G.tile, G.tileHi, face * .9), '#04040C', o.dim || 0); tracePath(X, q); X.fill();
      X.strokeStyle = ign > .02 ? mixCol('#2A3A7A', '#FFD27A', ign) : '#2E4088'; X.lineWidth = Math.max(1, r * .006) * (1 + ign * 2.5); X.stroke();
    }
    X.restore(); X.globalAlpha = 1;
  }
  // a solar panel (flip = cos of its tumble: squashes it; glint 0..1 turns it gold-white)
  function pnl(x, y, w, h, rot, o = {}) {
    const A = o.alpha ?? 1, fl = o.flip ?? 1; if (A <= .01 || w < 1) return;
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(Math.abs(fl) < .08 ? .08 * Math.sign(fl || 1) : fl, 1); X.globalAlpha = A;
    const g = clamp(o.glint || 0);
    if (w > 24) { X.strokeStyle = PAL.line; X.lineWidth = Math.min(w, h) * .12; X.strokeRect(-w / 2, -h / 2, w, h); }
    X.fillStyle = g > .02 ? mixCol(G.panel, '#FFE7A0', g) : G.panel; X.fillRect(-w / 2, -h / 2, w, h);
    if (w > 5) {
      X.strokeStyle = g > .5 ? '#FFFFFF' : PAL.nCyan; X.lineWidth = Math.max(1, Math.min(w, h) * .06);
      X.beginPath(); X.rect(-w / 2, -h / 2, w, h); X.moveTo(-w / 6, -h / 2); X.lineTo(-w / 6, h / 2); X.moveTo(w / 6, -h / 2); X.lineTo(w / 6, h / 2); X.moveTo(-w / 2, 0); X.lineTo(w / 2, 0); X.stroke();
    }
    X.restore(); X.globalAlpha = 1;
  }
  // the lunar ground: curved horizon, dark violet regolith lit gold at the horizon, perspective craters
  function ground(t, o = {}) {
    const hz = o.hz ?? 760, x0 = o.x0 ?? -1400, x1 = o.x1 ?? W + 1400, yb = o.yb ?? H + 1400, cv = o.curve ?? 3e-5, cx = o.cx ?? W / 2, lit = o.lit ?? 1;
    const hy = x => hz + (x - cx) * (x - cx) * cv;
    const top = []; for (let i = 0; i <= 36; i++) { const x = lerp(x0, x1, i / 36); top.push([x, hy(x)]); }
    const g = X.createLinearGradient(0, hz - 4, 0, hz + (o.depth ?? 520));
    g.addColorStop(0, mixCol('#4A3A6A', '#F4CE96', .6 * lit)); g.addColorStop(.1, mixCol('#3A2E5C', '#946A8C', .45 * lit)); g.addColorStop(.5, G.reg); g.addColorStop(1, G.regDk);
    X.fillStyle = g; tracePath(X, [...top, [x1, yb], [x0, yb]]); X.fill();
    const n = o.craters ?? 14, seed = o.seed ?? 1, f = o.focal ?? 640, dir = o.sunDir ?? -1, list = [];
    for (let i = 0; i < n; i++) list.push([lerp(1.05, 10, Math.pow(hash(i * 3.1 + seed), 1.3)), i]);
    list.sort((a, b) => b[0] - a[0]);
    for (const [d, i] of list) {
      const u = (hash(i * 5.7 + seed) - .5) * (o.spread ?? 5200), px = cx + u / d, py = hz + f / d, rx = (80 + 170 * hash(i * 2.3 + seed)) / d * (o.cscale ?? 1);
      if (px < x0 - 200 || px > x1 + 200) continue;
      crater(px, py, rx, rx * clamp(.75 / d + .14, .16, .45), dir, lit);
    }
    neonLine(top, lit > .4 ? G.gold : '#7FB8FF', o.rimW ?? 2.4, .6 * Math.max(lit, .35), .2);
  }
  function crater(x, y, rx, ry, dir, lit) {
    if (rx < 3) return;
    const sw = clamp(rx / 110, .5, 2);
    paint(ellPts(x, y - ry * .08, rx * 1.14, ry * 1.32, 22), { fill: G.craterRim, ink: PAL.line, sw });
    paint(ellPts(x, y, rx, ry, 22), { fill: G.crater, ink: null });
    X.save(); tracePath(X, ellPts(x, y, rx, ry, 22)); X.clip(); paint(ellPts(x, y + ry * .95, rx * 1.15, ry * 1.05, 22), { fill: '#2A1F50', ink: null }); X.restore();
    const arc = [], a0 = dir < 0 ? -1.15 : Math.PI - 1.15;
    for (let i = 0; i <= 10; i++) { const a = a0 + i / 10 * 2.3; arc.push([x + Math.cos(a) * rx * 1.08, y - ry * .08 + Math.sin(a) * ry * 1.25]); }
    if (lit > .05) neonLine(arc, G.gold, clamp(rx / 90, .6, 2.4), .45 * lit, .5);
  }
  // a server rack seen head-on; (x, y) = bottom-left
  function pod(x, y, w, h, o = {}) {
    const on = o.on ?? 1, t = o.t ?? T, sd = o.seed || 0;
    paint(rectPts(x, y - h, w, h), { fill: '#221A40', shade: '#0E0A1C', rim: o.rim || G.rimG, light: [o.lx ?? -.14, -.08], ink: PAL.line, sw: clamp(w / 70, .5, 2) });
    const rows = clamp(Math.floor(h / (w * .3)), 2, 12), rh = (h - w * .16) / rows;
    for (let r = 0; r < rows; r++) {
      const yy = y - h + w * .08 + r * rh;
      X.fillStyle = '#06040E'; X.fillRect(x + w * .1, yy + rh * .14, w * .8, rh * .72);
      if (w > 12) for (let j = 0; j < 4; j++) { const lit = on > 0 && hash(sd * 13.7 + r * 7 + j * 3 + Math.floor(t * 7 + r + sd)) < .7 * on; X.fillStyle = lit ? (j === 0 ? PAL.nGreen : PAL.nCyan) : '#1E2233'; X.fillRect(x + w * (.16 + j * .13), yy + rh * .38, w * .08, rh * .26); }
    }
    if (on > .3) neonLine([[x + 2, y - h + 2], [x + w - 2, y - h + 2]], PAL.nCyan, clamp(w / 50, .8, 3), .7 * on, 0);
  }
  // cartoon dust plume (puffs thrown sideways, settling slowly in low gravity)
  function plume(x, y, tau, o = {}) {
    if (tau < 0) return;
    const n = o.n ?? 30, s = o.s ?? 1, life = o.life ?? 2.6, A = (o.alpha ?? .85) * Math.pow(clamp(1 - tau / life), .8), layer = o.layer ?? -1;
    if (A <= .01) return;
    for (let i = 0; i < n; i++) {
      if (layer >= 0 && i % 2 !== layer) continue;
      const side = o.dir ?? (hash(i * 1.3 + (o.seed || 0)) < .5 ? -1 : 1), sp = (160 + 560 * hash(i * 3.1)) * s, up0 = (30 + 180 * hash(i * 5.3)) * s, e = (1 - Math.exp(-2.2 * tau)) / 2.2;
      const px = x + side * (24 * s + sp * e), py = Math.min(y, y - up0 * e * 1.5 + 36 * s * tau * tau), r = (20 + 24 * hash(i * 7.7)) * s * (1 + tau * 1.1);
      paint(ellPts(px, py - r * .45, r, r * .72, 14), { fill: G.dust, shade: G.dustDk, rim: o.rim || '#FFD68A', light: [side * .12, -.2], ink: null, alpha: A });
    }
  }
  // the tiny rack he plants instead of a flag. (x, y) = bottom centre, k = px per hero unit
  function miniRack(x, y, k, o = {}) {
    const on = o.on ?? 0, t = o.t ?? T, w = 15 * k, h = 21 * k, sm = o.smile ?? 0;
    line([[x + 3 * k, y - h], [x + 4.5 * k, y - h - 8 * k]], .35 * k, '#C8D2FF', 0);
    paint(ellPts(x + 4.5 * k, y - h - 8.6 * k, 1.1 * k, 1.1 * k, 8), { fill: on > .5 && frac(t * 2.2) < .5 ? PAL.nRed : '#5A2030', ink: PAL.line, sw: .25 * k });
    if (on > .5 && frac(t * 2.2) < .5) glow(x + 4.5 * k, y - h - 8.6 * k, 5 * k, PAL.nRed, .6);
    paint(rrPts(x - w / 2, y - h, w, h, 1.2 * k), { fill: '#2A2248', shade: '#120E24', rim: G.rimG, ink: PAL.line, sw: .35 * k });
    paint(rrPts(x - w * .38, y - h * .9, w * .76, h * .34, .6 * k), { fill: sm > 0 ? '#0A2A3A' : '#06040E', ink: PAL.line, sw: .2 * k });
    if (sm > 0) mask(x, y - h * .73, h * .13 * sm, { eyes: 'happy', mouth: 'smile', glow: .8 });
    for (let r = 0; r < 3; r++) { const yy = y - h * .48 + r * h * .15; X.fillStyle = '#06040E'; X.fillRect(x - w * .38, yy, w * .76, h * .1); for (let j = 0; j < 3; j++) { const lit = on > (r * 3 + j) / 10 && hash(r * 5 + j + Math.floor(t * 6)) < .75; X.fillStyle = lit ? (j ? PAL.nCyan : PAL.nGreen) : '#1E2233'; X.fillRect(x - w * .3 + j * w * .16, yy + h * .03, w * .09, h * .04); } }
    if (on > .3) glow(x, y - h * .5, 16 * k, PAL.nCyan, .25 * on);
  }
  // the landing rocket: the shared rack-rocket on four splayed legs, with a hatch that folds down into a ramp
  function lander(x, gY, s, o = {}) {
    const yb = gY - 100 * s + (o.dy || 0);
    for (const sx of [-1, 1]) {
      paint(limbPts([[x + sx * 70 * s, yb - 150 * s], [x + sx * 165 * s, yb - 10 * s], [x + sx * 192 * s, gY - 8 + (o.dy || 0) * .3]], [10 * s, 9 * s, 7 * s]), { fill: '#3A3458', shade: '#1E1A30', rim: G.rimG, ink: PAL.line, sw: 1.6 });
      paint(ellPts(x + sx * 194 * s, gY - 6, 36 * s, 10 * s, 14), { fill: '#6A6488', shade: '#3A3458', ink: PAL.line, sw: 1.4 });
    }
    if (o.noNose) { X.save(); X.beginPath(); X.rect(x - 800 * s, yb - 553 * s, 1600 * s, 2000 * s); X.clip(); }
    rocket(x, yb, s, { flame: o.flame || 0, window: 'mask' });
    if (o.noNose) X.restore();
    const hk = o.hatch || 0, dx0 = x - 62 * s, dw = 124 * s, dt = yb - 400 * s, db = yb - 50 * s;
    if (hk > 0) {
      const hk1 = clamp(hk), gd = X.createLinearGradient(0, dt, 0, db); gd.addColorStop(0, '#6A3A12'); gd.addColorStop(.6, mixCol('#6A3A12', '#FFD890', hk1)); gd.addColorStop(1, mixCol('#6A3A12', '#FFF1C8', hk1));
      X.fillStyle = gd; tracePath(X, rectPts(dx0, dt, dw, db - dt)); X.fill(); paint(rectPts(dx0, dt, dw, db - dt), { ink: PAL.line, sw: 1.6 });
      glow(x, (dt + db) / 2, 190 * s * hk1, G.gold, .5 * hk1);
      X.save(); X.globalCompositeOperation = 'lighter'; const gs = X.createLinearGradient(0, gY - 4, 0, gY + 90 * s); gs.addColorStop(0, rgba(G.gold, .22 * hk1)); gs.addColorStop(1, rgba(G.gold, 0)); X.fillStyle = gs; X.beginPath(); X.moveTo(dx0, gY - 4); X.lineTo(dx0 + dw, gY - 4); X.lineTo(dx0 + dw + 200 * s, gY + 90 * s); X.lineTo(dx0 - 90 * s, gY + 90 * s); X.fill(); X.restore();
      const fy = Math.min(db - (db - dt) * Math.cos(clamp(hk, 0, 1.05) * Math.PI), gY - 4), out = fy > db ? 22 * s * (fy - db) / (db - dt) : 0;
      paint([[dx0, db], [dx0 + dw, db], [dx0 + dw + out, fy], [dx0 - out, fy]], { fill: fy > db ? '#4A4468' : '#26203E', shade: '#1A1530', rim: G.rimG, ink: PAL.line, sw: 1.6 });
    }
    return { yb, door: [dx0, dt, dw, db - dt], sill: db };
  }
  const astro = (x, y, h, o = {}) => hero(x, y, h, { outfit: 'space', helmet: 1, rimCol: G.rimG, ...o });
  // ignition flare: white point, anamorphic streak, cross rays
  function flare(x, y, k, t) {
    if (k <= 0) return;
    const e = Math.pow(k, 1.6);
    glow(x, y, 50 + 520 * e, '#FFD27A', .3 + .45 * e);
    glow(x, y, 16 + 150 * e, '#FFFFFF', .7 + .3 * e);
    X.save(); X.globalCompositeOperation = 'lighter';
    const L = 120 + 1100 * e, g = X.createLinearGradient(x - L, 0, x + L, 0);
    g.addColorStop(0, 'rgba(255,190,110,0)'); g.addColorStop(.5, `rgba(255,244,220,${.5 + .5 * e})`); g.addColorStop(1, 'rgba(255,190,110,0)');
    X.fillStyle = g; X.fillRect(x - L, y - 2 - 7 * e, L * 2, 4 + 14 * e);
    X.restore();
    paint(starPts(x, y, 26 + 190 * e, .07, 4, t * .4), { fill: '#FFFFFF', ink: null, alpha: .85 });
  }

  // ======================================================================================
  // b328–336 · TOUCHDOWN (8 beats)
  // ======================================================================================
  const RX = 600, RG = 905, RS = 1.02;
  function touchdown(t, lt, dur) {
    style(1);
    const b = lt / BT, hk = 310 / 100;
    const [cx, cy, z] = kf(b, [[0, [760, 520, .92]], [2, [780, 530, .94]], [3.6, [930, 600, 1.04]], [5.6, [1110, 670, 1.2]], [8, [1180, 690, 1.34]]], easeInOut);
    space(t, { sx: -cx * .04, sy: -cy * .04 });
    camBegin(cx, cy, z);
    earth(1530, 420, 82);
    ground(t, { hz: 640, seed: 3, craters: 13, focal: 560 });
    // the lander thumps down on the cut, flame dying
    const land = .07, dy = lt < land ? -95 * (1 - lt / land) : -12 * Math.sin((lt - land) * 16) * Math.exp(-(lt - land) * 7), tau = lt - land;
    glow(RX, RG, 520 * clamp(1 - tau / 1.5), '#FFB070', .35 * clamp(1 - tau / 1.2));
    plume(RX, RG + 4, tau, { s: 1, n: 30, layer: 0, life: 2.1, alpha: .75 });
    const L = lander(RX, RG, RS, { dy, flame: lt < land ? .8 : .8 * Math.exp(-tau * 12), hatch: easeOut(up(b, 2, .45)) * 1.05 });
    plume(RX, RG + 10, tau, { s: 1, n: 30, layer: 1, life: 2.1, alpha: .75 });
    // him
    const PX = 1290, PY = 978;
    let hx = 0, hy = 0, P = null, view = 'side', holding = true, inDoor = false;
    const face = { eyes: 'happy', mouth: 'grin' };
    if (b >= 2.2 && b < 2.7) { inDoor = true; hx = RX + 6; hy = L.sill; P = { sq: .14 * seg(b, 2.2, 2.7), lean: .25, aL: [.5, .9], aR: [.3, 1.1], lL: [.6, 1.1], lR: [.4, .9], eyes: 'determined', mouth: 'smirk' }; }
    else if (b >= 2.7 && b < 4) { const u = (b - 2.7) / 1.3; hx = lerp(RX + 6, 920, u); hy = lerp(L.sill, 960, u) - par(u, 150); P = { aL: [2.5, .3], aR: [2.0, .5], lL: [lerp(1.1, .25, u), lerp(1.4, .3, u)], lR: [lerp(.3, -.15, u), lerp(1.0, .2, u)], lean: .08, hairWind: .6, eyes: 'happy', mouth: 'open' }; }
    else if (b >= 4 && b < 4.4) { hx = 920; hy = 960; P = { sq: .2 * (1 - (b - 4) / .4), aL: [1.0, .6], aR: [.7, .9], lL: [.3, .4], lR: [-.2, .3], lean: .15, ...face }; }
    else if (b >= 4.4 && b < 5.5) { const u = (b - 4.4) / 1.1; hx = lerp(920, 1170, u); hy = lerp(960, PY - 6, u) - par(u, 70); P = { ...runPose(.3 + u * .5, .8), dy: 0, ...face }; }
    else if (b >= 5.5 && b < 6) { const u = easeOut((b - 5.5) / .5); hx = 1170; hy = PY - 6; P = { aR: [lerp(.8, 2.95, u), .15], aL: [lerp(.4, -.3, u), .5], lean: -.14 * u, lL: [.12, 0], lR: [-.3, .15], eyes: 'determined', mouth: 'teeth', brows: 'angry' }; }
    else if (b >= 6 && b < 6.5) { hx = 1170; hy = PY - 6; holding = false; P = { aR: [1.35, .1], aL: [1.0, .3], lean: .42, sq: .12 * hitAt(lt, 6 * BT, 9), lL: [.45, .6], lR: [-.35, .25], eyes: 'closed', mouth: 'grin' }; }
    else if (b >= 6.5) { hx = 1160; hy = PY - 6; holding = false; view = 'q'; const hopU = clamp((b - 6.55) / .45); P = { ...POSES.hips, eyes: 'happy', mouth: 'grin', blush: .7, dy: -par(hopU, 36), sq: .12 * hitAt(b, 7, 10) }; }
    if (b >= 6) {
      const pt = lt - 6 * BT;
      plume(PX, PY + 2, pt, { s: .32, n: 10, life: 1.2, seed: 4 });
      if (pt < .35) neonLine(ellPts(PX, PY, 40 + pt * 700, 10 + pt * 170, 32), G.gold, 2.5, .8 * (1 - pt / .35), 0, true);
      miniRack(PX, PY + 4, hk, { on: up(b, 6.3, 1.2), smile: popK(b, 6.9, .5) });
    }
    if (P) {
      if (b >= 4 && b < 4.9) plume(920, 962, lt - 4 * BT, { s: .38, n: 10, life: 1.3, seed: 2 });
      const hold = holding ? (k, sw) => { unrot(); miniRack(0, 8, 1, { on: 0 }); } : null;
      if (inDoor) { X.save(); X.beginPath(); X.rect(...L.door); X.clip(); }
      paint(ellPts(hx, Math.max(hy, 958) + 2, 70, 12, 16), { fill: '#07040F', ink: null, alpha: .45 * clamp(1 - (Math.max(hy, 958) - hy) / 200) });
      astro(hx, hy, 310, { view, ...P, handR: view === 'side' ? hold : null });
      if (inDoor) X.restore();
    }
    camEnd();
    if (b >= 6 && b < 6.3) FX.shake += 16 * hitAt(lt, 6 * BT, 14);
  }

  // ======================================================================================
  // b336–344 · THE SHOGGOTH UNFURLS from the rocket's nose; it flings panels at the sun (8 beats)
  // ======================================================================================
  const U_SUN = [-150, -470];
  function unfurl(t, lt, dur) {
    style(1);
    const b = lt / BT, ta = onTwos(t), uu = lt / dur, mv = easeInOut(clamp((lt - .05) / (BT * 3.4)));
    const z = lerp(.9, .58, mv) * (1 - .03 * uu), cy = lerp(640, 150, mv), cx = lerp(900, 900, mv);
    space(t, { sy: (610 - cy) * .12, n: 150 });
    camBegin(cx, cy, z);
    sun(U_SUN[0], U_SUN[1], 110, 1, { t });
    ground(t, { hz: 900, seed: 7, craters: 11, focal: 460, cscale: 1.3, x0: -2200, x1: 4000 });
    const RXu = 830, RGu = 1010, rs = .7, top = RGu - 100 * rs - 553 * rs;
    const g = lt < .04 ? 0 : backOut(clamp((lt - .04) / (BT * 1.9))), S = 330 * g, gt = expoOut(clamp((lt - .02) / .35));
    const bx = RXu + 10, by = lerp(top + 40, top - 310, easeOut(clamp(lt / (BT * 2.2))));
    // skyward tentacles behind the body
    // (Ryan's shoggoth: its own crooked limbs unfurl via reach)
    // two thrower tentacles aimed at the sun: cock back before each beat, snap on it (b340–343)
    const tb = j => [bx - S * .7, by - S * (.35 - j * .3)], aimOf = j => Math.atan2(U_SUN[1] - tb(j)[1], U_SUN[0] - tb(j)[0]);
    if (S > 4) for (let j = 0; j < 2; j++) {
      const aim = aimOf(j), rest = aim + .7 - j * .25;
      let ang = rest;
      for (let m = 4 + j; m < 8; m += 2) { const d = b - m; if (d > -.5 && d < 0) ang = lerp(rest, aim + 1.5, easeInOut((d + .5) / .5)); else if (d >= 0 && d < 1.5) ang = lerp(aim - .15, rest, easeInOut(clamp((d - .1) / 1.3))); }
      tentacle(tb(j)[0], tb(j)[1], ang, S * 1.9, S * .2, ta, 50 + j, { rim: MOD.rim2N, curl: .12, amp: .12 });
    }
    // the nose cone pops off on the cut and tumbles away (behind the body)
    if (lt < 1.6) { const nx = RXu + 620 * lt, ny = top - 1700 * lt + 520 * lt * lt; X.save(); X.translate(nx, ny); X.rotate(4.5 * lt); X.scale(rs * 1.1, rs * 1.1); paint([[-92, 0], [92, 0], [40, -145], [0, -205], [-40, -145]], { fill: PAL.nYellow, shade: PAL.nOrange, ink: PAL.line, sw: 2.2, curv: .35 }); X.restore(); }
    shoggoth(bx, by, S, { reach: .4 + .6 * gt, wiggle: 2.5 + 2 * pulse(t, 5), eyesN: 7, t: ta, maskR: .46, mood: { eyes: b >= 4 && frac(b) < .45 ? 'wink' : 'happy', mouth: 'grin', look: [-.6, -.4] }, look: [-.6, -.5], seed: 2 });
    lander(RXu, RGu, rs, { noNose: true });
    // two tentacles hug the rocket (in front)
    if (S > 4) for (const sd of [-1, 1]) tentacle(bx + sd * S * .45, by + S * .72, Math.PI / 2 + sd * .3, S * .95 * clamp(g), S * .12, ta, 70 + sd, { curl: .9, amp: .2, rim: MOD.rimN });
    glow(RXu, top, 260 * clamp(g + .3), PAL.nMagenta, .35 * hitAt(lt, .02, 1.2) + .15);
    // panels fired at the sun on b340–343 (three per throw), then a thickening stream
    const shots = [];
    for (let m = 4; m < 8; m++) for (let p = 0; p < 3; p++) shots.push([m + p * .07, m % 2, p]);
    for (let m = 6; m < 8; m += .25) shots.push([m + .12, (m * 4) % 2, 3]);
    for (const [bm, j, p] of shots) {
      const u = (b - bm) / 2; if (u <= 0 || u >= 1) continue;
      const aim = aimOf(j), x0 = tb(j)[0] + Math.cos(aim) * S * 1.7, y0 = tb(j)[1] + Math.sin(aim) * S * 1.7;
      const pos = uu2 => { const e = 1 - Math.pow(1 - uu2, 1.6); return [lerp(x0, U_SUN[0], e) + Math.sin(uu2 * Math.PI) * (p - 1) * 90, lerp(y0, U_SUN[1], e) - Math.sin(uu2 * Math.PI) * (60 + p * 50)]; };
      const [px, py] = pos(u), sz = lerp(120, 22, u), fl = Math.cos(u * 12 + p * 2 + bm);
      const tr = []; for (let q = 0; q <= 6; q++) tr.push(pos(Math.max(0, u - .12 + q * .02)));
      neonLine(tr, PAL.nCyan, 3, .5 * (1 - u), .4);
      pnl(px, py, sz, sz * .62, u * 5 + p, { flip: fl, glint: Math.pow(Math.max(0, fl), 10) });
      if (u > .9) glow(U_SUN[0], U_SUN[1], 90, '#FFFFFF', .7 * (u - .9) * 10);
    }
    camEnd();
    // him, in the foreground, looking up at it (cheering each throw from b340)
    const cheer = b >= 4, hop = cheer ? par(clamp(frac(b) / .85), 40) : 0;
    astro(1650, 1180 + 60 * mv, 560, { view: 'q', flip: true, lookY: -1, lookX: -.5, tilt: .1, ...(cheer ? { ...POSES.cheer, eyes: 'happy', mouth: 'grin', dy: -hop } : { aL: [.3, .5], aR: [.3, .5], eyes: 'wide', mouth: 'O', brows: 'up' }) });
  }

  // ======================================================================================
  // b344–348 · RACKS POP OUT OF THE REGOLITH, one row per beat (4 beats)
  // ======================================================================================
  function rackRows(t, lt, dur) {
    style(1);
    const hz = 215, z = 1 + .06 * easeOut(lt / dur);
    space(t, { n: 60, stops: [[0, '#040210'], [.13, '#140A30'], [.2, '#3A1A4A'], [.3, '#170D30']] });
    camBegin(960, 540 - 14 * lt, z);
    earth(1610, 100, 60);
    sun(70, hz - 10, 72, 1, { t, halo: 5 });
    ground(t, { hz, curve: 1e-5, seed: 11, craters: 9, focal: 1100, spread: 6400, depth: 900 });
    // runway lights down the central aisle, lighting up toward the horizon on the cut
    for (let i = 0; i < 26; i++) { const d = 1.1 * Math.pow(1.16, i), y = hz + 1110 / d, on = up(lt, i * .012, .05); if (on <= 0) continue; for (const sd of [-1, 1]) { const x = 960 + sd * 175 / d, r = 26 / d + 1.5; X.fillStyle = PAL.nCyan; X.globalAlpha = on; X.fillRect(x - r, y - r * .5, r * 2, r); glow(x, y, r * 5, PAL.nCyan, .35 * on); } }
    X.globalAlpha = 1;
    // rows (depth d, pop beat): b344 the near row, b345, b346, then b347 the rest of the plain in a wave
    const ROWS = [[26, 3.3], [17, 3.24], [11.5, 3.18], [7.6, 3.12], [5.1, 3.05], [3.35, 2], [2.12, 1], [1.36, 0]];
    for (const [d, beat] of ROWS) {
      const at = beat * BT, k = popK(lt, at, .2); if (k <= 0) continue;
      const baseY = hz + 1110 / d, w = 150 / d, h = 380 / d, xs = [];
      for (let j = 0; ; j++) { const off = (205 + j * 215) / d; if (off > 1400) break; xs.push(960 - off - w, 960 + off); }
      X.fillStyle = 'rgba(3,1,10,.5)';
      for (const x of xs) { const Ls = h * 2.2 * clamp(k); X.beginPath(); X.moveTo(x + w, baseY - w * .05); X.lineTo(x + w + Ls, baseY - w * .1); X.lineTo(x + w + Ls, baseY + w * .03); X.lineTo(x, baseY + w * .06); X.closePath(); X.fill(); }
      X.save(); X.beginPath(); X.rect(-3000, -3000, 8000, baseY + 3000); X.clip();
      for (const x of xs) pod(x, baseY + h * (1 - k), w, h, { on: up(lt, at + .1, .2), seed: Math.round(x) * .37 + d, t });
      X.restore();
      if (d < 5) for (const x of xs) plume(x + w / 2, baseY, lt - at, { s: 1 / d, n: 5, life: .7, alpha: .7, seed: x });
      if (d < 3) { const tau = lt - at; if (tau > 0 && tau < .3) neonLine([[-100, baseY + 4], [W + 100, baseY + 4]], G.gold, 3, 1 - tau / .3, 0); }
    }
    camEnd();
  }

  // ======================================================================================
  // b348–352 · STREAMS OF PANELS spiral into the sun, a new stream per beat (4 beats)
  // ======================================================================================
  function streams(t, lt, dur) {
    style(1);
    const VP = [1250, 400], z = 1 + .14 * easeIn(lt / dur);
    space(t, { n: 110, seed: 14 });
    camBegin(VP[0] - 290 / z, VP[1] + 140 / z, z);
    sun(VP[0], VP[1], 118, 1, { t, halo: 6 });
    // the moon's limb, lower left, with the rack farm and a launch rail aimed at the sun
    const MC = [150, 2400], MR = 1680;
    paint(ellPts(MC[0], MC[1], MR, MR, 120), { fill: G.reg, shade: G.regDk, light: [.2, .2], ink: PAL.line, sw: 2 });
    const limb = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 - .75 + i / 40 * 1.5; limb.push([MC[0] + Math.cos(a) * MR, MC[1] + Math.sin(a) * MR]); }
    neonLine(limb, G.gold, 3, .8, .3);
    for (let i = 0; i < 22; i++) { const a = -Math.PI / 2 - .62 + i * .052, px = MC[0] + Math.cos(a) * MR, py = MC[1] + Math.sin(a) * MR; X.save(); X.translate(px, py); X.rotate(a + Math.PI / 2); pod(-22, 6, 44, 100, { on: 1, seed: i, t }); X.restore(); }
    const RA = [-40, 820], RB = [430, 700];
    line([RA, RB, [RB[0], RB[1] + 60]], 9, '#2A2248', 0, 1); neonLine([RA, RB], PAL.nCyan, 5, .9, 0);
    glow(RB[0], RB[1], 120, PAL.nCyan, .5 * (.5 + .5 * pulse2(t, 5)));
    // streams: [direction from the vanishing point, start beat, starting radius]. The rail's stream is already flowing at the cut.
    const dRail = Math.atan2(RB[1] - VP[1], RB[0] - VP[0]), rRail = Math.hypot(RB[0] - VP[0], RB[1] - VP[1]);
    const SS = [[dRail, -3, rRail, .05], [.6, -1.2, 1450, .04], [-2.45, 1, 1450, .036], [1.55, 2, 1450, .034], [-.75, 3, 1450, .03], [2.9, 3, 1450, .03]], A = 9;
    for (const [dir, sb, R0, gap] of SS) {
      const st = sb * BT, nMax = Math.floor((lt - st) / gap); if (nMax < 0) continue;
      const rail = sb < -2, burst = hitAt(lt, st, 4), jit = rail ? .12 : .55;
      for (let j = Math.max(0, nMax - 44); j <= nMax; j++) {
        const tau = lt - st - j * gap; if (tau < 0) continue;
        const id = j * 7.3 + dir * 13.1, zf = 1 + A * tau, ang = dir + (hash(id) - .5) * jit + (rail ? .12 : .45) * Math.log(zf), rr = R0 * (rail ? 1 : .75 + .5 * hash(id * 3)) / zf;
        if (rr < 16) continue;
        const px = VP[0] + Math.cos(ang) * rr, py = VP[1] + Math.sin(ang) * rr, sz = (rail ? 150 : 230) / zf * (.8 + .4 * hash(id * 5));
        const zf2 = 1 + A * Math.max(0, tau - .035), ang2 = dir + (hash(id) - .5) * jit + (rail ? .12 : .45) * Math.log(zf2), rr2 = R0 * (rail ? 1 : .75 + .5 * hash(id * 3)) / zf2;
        neonLine([[VP[0] + Math.cos(ang2) * rr2, VP[1] + Math.sin(ang2) * rr2], [px, py]], PAL.nCyan, Math.max(1, sz * .12), .35, 0);
        const fl = Math.cos(tau * 7 + hash(id * 5) * 6);
        pnl(px, py, sz, sz * .62, ang + hash(id * 9) * 2, { flip: fl, glint: Math.pow(Math.max(0, fl), 12) + .6 * burst * (nMax - j < 3 ? 1 : 0) });
      }
    }
    camEnd();
    FX.zblur = Math.max(FX.zblur, .05 * pulse(t, 5));
  }

  // ======================================================================================
  // b352–356 · ASSEMBLY (wide): the four rings snap on, one per beat
  // ======================================================================================
  const SPH = [930, 350, 280];
  function assemblyWide(t, lt, dur) {
    style(1);
    const z = 1 + .035 * lt, ta = onTwos(t);
    space(t, { n: 130, seed: 21 });
    camBegin(960, 540, z);
    const rk = [0, 1, 2, 3].map(i => expoOut(clamp((lt - i * BT) / .16)));
    const fl = [0, 1, 2, 3].map(i => hitAt(lt, i * BT + .16, 5));
    for (let i = 0; i < 4; i++) { const tau = lt - i * BT - .12; if (tau > 0 && tau < .7) { const R = SPH[2] * 1.05 + tau * 1100; neonLine(ellPts(SPH[0], SPH[1], R, R, 60), PAL.nCyan, 3.5, .55 * (1 - tau / .7), 0, true); } }
    lattice(SPH[0], SPH[1], SPH[2], { rings: rk, panels: 0, flash: fl, spin: .02 * lt, t });
    ground(t, { hz: 860, seed: 5, craters: 9, focal: 380, cscale: 1.1 });
    // the rack farm on the horizon
    for (let i = 0; i < 26; i++) { const x = 60 + i * 52 + (i > 12 ? 90 : 0); pod(x, 868 + (x - 960) * (x - 960) * 3e-5, 30, 64, { on: 1, seed: i, t }); }
    // the rocket, far, and the shoggoth conducting: tentacles jab on every snap
    lander(260, 900, .32, { noNose: true });
    const sx = 1560, sy = 820, S = 160;
    shoggoth(sx, sy, S, { reach: 1, wiggle: 3 + 3 * pulse(t, 6), eyesN: 7, t: ta, maskR: .46, mood: { eyes: 'happy', mouth: 'open', look: [-.6, -.8] }, look: [-.6, -.8], seed: 4 });
    camEnd();
  }

  // ======================================================================================
  // b356–360 · ASSEMBLY (close): each ring's panels lock on, one ring per beat; the swarm closes the design
  // ======================================================================================
  function assemblyClose(t, lt, dur) {
    style(1);
    const z = 1 + .07 * easeInOut(lt / dur), spin = .03 * lt;
    space(t, { n: 90, seed: 31 });
    camBegin(960, 540, z, -.03 + .02 * lt);
    const R = 430, pk = [0, 1, 2, 3].map(i => clamp((lt - i * BT + .04) / .22));
    // incoming panels, docking on the ring as it locks
    for (let i = 1; i < 4; i++) for (let j = 0; j < 14; j++) {
      const arr = i * BT + (j / 14) * .12, u = (lt - (arr - .32)) / .32; if (u <= 0 || u >= 1) continue;
      const a = SW0[i] + (j + .5) / 14 * TAU, [tx, ty] = ringPt(960, 540, R, i, a, spin), dx = tx - 960, dy = ty - 540, dl = Math.hypot(dx, dy) || 1;
      const e = easeOut(u), px = tx + dx / dl * 900 * (1 - e), py = ty + dy / dl * 900 * (1 - e);
      neonLine([[px + dx / dl * 70, py + dy / dl * 70], [px, py]], PAL.nCyan, 2, .5, 0);
      pnl(px, py, R * .075 * (1.6 - .6 * e), R * .048 * (1.6 - .6 * e), ringTan(i, a, spin) + (1 - e) * 3, {});
    }
    const sunK = 1 + .25 * hitAt(lt, 3 * BT + .1, 5);
    lattice(960, 540, R, { rings: 4, panels: pk, sun: sunK, flash: pk.map((_, i) => hitAt(lt, i * BT, 7)), spin, swarm: up(lt, 3 * BT + .05, .3), t });
    camEnd();
  }

  // ======================================================================================
  // b360–368 · 2-beat cuts
  // ======================================================================================
  // b360 · Kardashev gauge: the needle slams I → II; TYPE II lights on b361
  function kardashev(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#07041A'], [1, '#1E0C34']]);
    lattice(960, 830, 700, { rings: 4, panels: 4, swarm: 1, sun: .6, alpha: .22, ringA: .5, t });
    camBegin(960, 540, 1 + .04 * lt / dur);
    const cx = 960, cy = 860, R = 600;
    const v = lt < .02 ? 1 : 1 + elasticOut(clamp((lt - .02) / .5)) * 1.0 + .015 * Math.sin(t * 60) * hitAt(lt, .3, 3), va = v2 => Math.PI + v2 / 3 * Math.PI;
    X.fillStyle = 'rgba(5,4,18,.7)'; X.beginPath(); X.arc(cx, cy, R + 40, Math.PI, TAU); X.closePath(); X.fill();
    const arc = (v0, v1, r) => { const p = []; for (let i = 0; i <= 40; i++) { const a = va(lerp(v0, v1, i / 40)); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
    neonLine(arc(0, 3, R), PAL.nCyan, 4, .9, .3);
    neonLine(arc(0, Math.min(v, 3), R - 34), G.gold, 16, .9, .3);
    for (let i = 0; i <= 30; i++) { const a = va(i / 10), L = i % 10 === 0 ? 60 : i % 5 === 0 ? 38 : 20; neonLine([[cx + Math.cos(a) * (R - L), cy + Math.sin(a) * (R - L)], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], i / 10 <= v ? PAL.nYellow : PAL.nCyan, i % 10 ? 2 : 4, .9, 0); }
    ['0', 'I', 'II', 'III'].forEach((s, i) => { const a = va(i), on = i === 2 ? hitAt(lt, .3, 3) : 0; txt(s, cx + Math.cos(a) * (R - 120), cy + Math.sin(a) * (R - 120), i === 2 ? 84 + 30 * on : 64, i <= v + .01 ? '#FFFFFF' : '#7A6AA8', { font: 'Orbitron', glow: i === 2 && v > 1.9 ? G.gold : null }); });
    const na = va(v);
    neonLine([[cx - Math.cos(na) * 50, cy - Math.sin(na) * 50], [cx + Math.cos(na) * (R - 60), cy + Math.sin(na) * (R - 60)]], '#FFFFFF', 12, 1, 0);
    glow(cx + Math.cos(na) * (R - 60), cy + Math.sin(na) * (R - 60), 90, G.gold, .7);
    paint(ellPts(cx, cy, 46, 46, 24), { fill: '#1A1530', ink: PAL.line, sw: 2, rim: PAL.nCyan, shade: '#0B0716' });
    txt('KARDASHEV', cx, cy - R - 70, 46, '#FFFFFF', { font: 'Orbitron', track: 14, glow: PAL.nCyan });
    txt('K ' + v.toFixed(2), cx, cy - 120, 70, PAL.nCyan, { font: 'Orbitron' });
    if (lt >= BT) txt('TYPE II', cx, cy - 230, 150, PAL.nYellow, { font: 'Orbitron', pop: (lt - BT) * 6, glow: G.gold, stroke: '#000', sw: 10 });
    camEnd();
    FX.shake += 18 * hitAt(lt, .15, 12);
  }
  // b362 · the chart goes vertical and punches out through the top of the HUD
  function chartVert(t, lt, dur) {
    style(1);
    const vk = expoOut(clamp((lt - BT) / .13)), tilt = easeOut(clamp((lt - BT) / .3)) * .6;
    vgrad(-200, -200, W + 400, H + 400, [[0, '#08031C'], [1, '#210A36']]);
    camBegin(960 + 120 * tilt, 540 - 300 * tilt, 1.02 - .1 * tilt, -.05);
    X.strokeStyle = 'rgba(39,242,242,.09)'; X.lineWidth = 1.5; X.beginPath();
    for (let x = -400; x < 2400; x += 80) { X.moveTo(x, -1600); X.lineTo(x, 1600); } for (let y = -1600; y < 1600; y += 80) { X.moveTo(-400, y); X.lineTo(2400, y); } X.stroke();
    const fx0 = 300, fy0 = 170, fw = 1320, fh = 780;
    hud(fx0, fy0, fw, fh, { label: 'WATTS', col: PAL.nCyan });
    line([[400, 220], [400, 880], [1560, 880]], 2.4, '#6A5AA8', 0);
    const n = 60, kk = .3 + .7 * easeOut(clamp(lt / (BT * .95))), pts = [];
    for (let i = 0; i <= n * kk; i++) { const u = i / n, v = .04 + Math.pow(u, 4.2) * .7; pts.push([420 + u * 1060, 860 - v * 640]); }
    if (pts.length > 1) neonLine(pts, PAL.nYellow, 6, 1, .3);
    for (let i = 0; i < 7; i++) { const u = (i + 1) / 8; if (u > kk) break; const vv = .04 + Math.pow(u, 4.2) * .7; paint(ellPts(420 + u * 1060, 860 - vv * 640, 11, 11, 12), { fill: PAL.nYellow, ink: PAL.line, sw: 1.2 }); }
    const [ex, ey] = pts[pts.length - 1];
    if (vk > 0) {
      const topY = lerp(ey, -1500, vk);
      neonLine([[ex, ey], [ex + 4, topY]], PAL.nYellow, 11, 1, 0);
      glow(ex + 4, topY, 140, '#FFFFFF', .8);
      const bk = lt - BT - .03;
      if (bk > 0) for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (hash(i) - .5) * 2.6, d = (80 + 380 * hash(i * 3)) * easeOut(clamp(bk / .4)); paint(starPts(ex + Math.cos(a) * d, fy0 + Math.sin(a) * d + 200 * bk * bk, 10 + 10 * hash(i * 5), .3, 4), { fill: i % 3 ? PAL.nYellow : '#FFFFFF', ink: null, alpha: clamp(1 - bk / .5) }); }
      if (bk > 0) paint(rectPts(ex - 60, fy0 - 10, 120, 20), { fill: '#08031C', ink: null });
    } else glow(ex, ey, 70, PAL.nYellow, .7);
    camEnd();
    FX.shake += 22 * hitAt(lt, BT, 10);
  }
  // b364 · THE RHYME. Beat 1: two-shot from behind: the sphere in the sky, the emblem on his back, pulsing together.
  // Beat 2: the camera slams in on the emblem so it lands exactly where (and as big as) the sphere was.
  function rhyme(t, lt, dur) {
    style(1);
    const SX = 960, SY = 400, SR = 170, h = 620, hy0 = 1250, k = h / 100, EY = hy0 - 58 * k, ER = 8.2 * k;
    const m = expoOut(clamp((lt - BT) / .2)), zB = SR / ER, pb = Math.max(hitAt(lt, 0, 6), hitAt(lt, BT, 6));
    const zA = 1 + .03 * lt, lz = Math.exp(lerp(Math.log(zA), Math.log(zB), m));
    // interpolate the tracked point: sphere (screen SY) → emblem pinned to the same screen spot
    const cyA = 540, cyB = EY + (540 - SY) / zB, cy = lerp(cyA, cyB, m);
    space(t, { n: 120, seed: 41, sy: -m * 400 });
    camBegin(960, cy, lz);
    lattice(SX, SY, SR, { rings: 4, panels: 4, swarm: 1, sun: .9 + .2 * pb, flash: [pb, pb, pb, pb].map(v => v * .7), t });
    ground(t, { hz: 900, seed: 9, craters: 6, focal: 300 });
    astro(960, hy0, h, { view: 'back', emblem: lerp(.25 + .45 * pb, 0, m), aL: [.18, .1], aR: [.18, .1] });
    const lk = lt - BT - .12; if (lk > 0 && lk < .3) neonLine(ellPts(960, EY, ER * (1.05 + .5 * easeOut(lk / .3)), ER * (1.05 + .5 * easeOut(lk / .3)), 48), PAL.nCyan, 1.2, 1 - lk / .3, 0, true);
    camEnd();
    FX.bloom = lerp(.55, .22, m);
  }
  // b366 · the mask's eyes go to stars (the sphere reflected in them), then it gasps
  function maskStars(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#12062A'], [1, '#2A0E3C']]);
    const s0 = popK(lt, 0, .22), rot = -.08 + .08 * easeOut(lt / dur);
    camBegin(960, 540, 1 + .06 * lt / dur);
    glow(360, 80, 900, G.gold, .35);
    shoggoth(960, 1040, 760, { tent: 0, eyesN: 12, mask: false, t: onTwos(t), look: [-.4, -.8], seed: 6 });
    const R = 330 * (.85 + .15 * s0);
    mask(960, 500, R, { eyes: 'star', mouth: lt > BT ? 'open' : 'smile', rot, look: [-.2, -.4], glow: .9, blush: 1 });
    // tiny lattice glints in each star eye
    for (const sd of [-1, 1]) { const ex = 960 + Math.cos(rot) * (sd * R * .34 - .2 * R * .12) - Math.sin(rot) * (-R * .18 - .4 * R * .1), ey = 500 + Math.sin(rot) * (sd * R * .34) + Math.cos(rot) * (-R * .18 - .4 * R * .1); dysonEmblem(ex, ey, R * .085, .2); }
    for (let i = 0; i < 7; i++) { const at = (i % 2) * BT + hash(i) * .25, k2 = up(lt, at, .25); if (k2 <= 0 || k2 >= 1) continue; const a = hash(i * 3) * TAU, d = R * (1.1 + .4 * hash(i * 5)); paint(starPts(960 + Math.cos(a) * d, 500 + Math.sin(a) * d * .8, 40 * Math.sin(k2 * Math.PI), .25, 4), { fill: i % 2 ? PAL.nYellow : '#FFFFFF', ink: null }); }
    camEnd();
  }

  // ======================================================================================
  // b368–376 · 1-beat close-ups
  // ======================================================================================
  function cuFace(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#0A0520'], [1, '#231038']]);
    glow(1700, 300, 900, G.gold, .4); glow(1700, 300, 300, '#FFFFFF', .3);
    camBegin(960, 540, 1 + .07 * lt / dur);
    const h = 2700, x = 800, y = 520 + .89 * h;
    astro(x, y, h, { view: 'q', eyes: 'determined', brows: 'angry', mouth: 'smirk', chrome: 1, glint: .8, lookX: .6, lookY: -.35, rimCol: G.gold });
    // the sphere reflected in his visor
    X.save(); tracePath(X, ellPts(x, y - 90 * h / 100, 16 * h / 100, 16.5 * h / 100, 40)); X.clip();
    lattice(x + 250, 330, 70, { rings: 4, panels: 4, swarm: 1, alpha: .55, sun: .6, t });
    X.restore();
    camEnd();
  }
  function cuGrin(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#1A0630'], [1, '#420E48']]);
    glow(300, 200, 800, G.gold, .35);
    for (let i = 0; i < 4; i++) tentacle(-100 + i * 700, 1200, -Math.PI / 2 + (i - 1.5) * .35, 1100, 80, onTwos(t) * 2, i + 90, { rim: i % 2 ? MOD.rim2N : MOD.rimN, amp: .5 });
    const k = popK(lt, 0, .2);
    mask(1180, 640, 560 * (.9 + .1 * k), { eyes: 'happy', mouth: 'grin', rot: -.2 + .12 * easeOut(lt / dur), glow: .9 });
  }
  function cuPanel(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#05030E'], [1, '#150A2A']]);
    glow(1850, 60, 1000, G.gold, .5);
    const land = expoOut(clamp(lt / .08)), off = 1 - land;
    camBegin(960, 540, 1.04 + .06 * lt / dur);
    X.save(); X.translate(930 + 560 * off, 510 - 420 * off); X.rotate(-.13 + .12 * off);
    // the truss it clamps onto
    paint(rectPts(-1500, 345, 3000, 80), { fill: '#1A1638', shade: '#0B0716', rim: PAL.nCyan, ink: PAL.line, sw: 2.4 });
    X.strokeStyle = PAL.nCyan; X.globalAlpha = .5; X.lineWidth = 3; X.beginPath(); for (let i = -15; i < 15; i++) { X.moveTo(i * 100, 350); X.lineTo(i * 100 + 100, 420); X.moveTo(i * 100 + 100, 350); X.lineTo(i * 100, 420); } X.stroke(); X.globalAlpha = 1;
    // the panel
    const w = 1320, hh = 640, box = rectPts(-w / 2, -hh / 2, w, hh);
    paint(box, { fill: G.panel, ink: PAL.line, sw: 5 });
    X.save(); tracePath(X, box); X.clip();
    const gx = lerp(-w * .7, w * .7, clamp(lt / dur)); glow(gx, -hh * .15, 380, G.gold, .45);
    X.strokeStyle = PAL.nCyan; X.lineWidth = 4; X.beginPath(); for (let i = 1; i < 6; i++) { X.moveTo(-w / 2 + i * w / 6, -hh / 2); X.lineTo(-w / 2 + i * w / 6, hh / 2); } for (let j = 1; j < 4; j++) { X.moveTo(-w / 2, -hh / 2 + j * hh / 4); X.lineTo(w / 2, -hh / 2 + j * hh / 4); } X.stroke();
    const sx = lerp(-w, w * 1.2, clamp((lt - .03) / .22)); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,236,190,.6)'; X.beginPath(); X.moveTo(sx - 50, -hh); X.lineTo(sx + 70, -hh); X.lineTo(sx - 150, hh); X.lineTo(sx - 270, hh); X.fill();
    X.restore();
    glowPath(box, PAL.nCyan, 1.3, 0, .7);
    // clamps snap shut on landing, sparks fly
    for (const cxp of [-430, 0, 430]) {
      const c = popK(lt, .05, .12), sk = lt - .06;
      paint(rrPts(cxp - 75, hh / 2 - 40 + (1 - c) * 80, 150, 115, 14), { fill: '#6A6488', shade: '#3A3458', rim: G.gold, ink: PAL.line, sw: 2.4 });
      paint(rectPts(cxp - 45, hh / 2 - 12 + (1 - c) * 80, 90, 16), { fill: PAL.nCyan, ink: null, alpha: c });
      if (sk > 0 && sk < .28) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (hash(i + cxp) - .5) * 2.8, d = 40 + 700 * sk * (.6 + .4 * hash(i * 3 + cxp)); paint(starPts(cxp + Math.cos(a) * d, hh / 2 + Math.sin(a) * d + 400 * sk * sk, 22, .25, 4, i), { fill: i % 2 ? PAL.nYellow : '#FFFFFF', ink: null, alpha: 1 - sk / .28 }); }
    }
    X.restore();
    camEnd();
    FX.shake += 18 * hitAt(lt, .07, 14);
  }
  function cuFlare(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#080210'], [1, '#2A0A10']]);
    const SC = [1960, 1640], SR = 1250;
    glow(SC[0], SC[1], SR * 1.35, PAL.nOrange, .55);
    const g = X.createRadialGradient(SC[0] - 200, SC[1] - 200, SR * .2, SC[0], SC[1], SR); g.addColorStop(0, '#FFF6C8'); g.addColorStop(.7, '#FFD050'); g.addColorStop(1, '#FF7A10');
    X.fillStyle = g; X.beginPath(); X.arc(SC[0], SC[1], SR, 0, TAU); X.fill();
    X.save(); X.beginPath(); X.arc(SC[0], SC[1], SR, 0, TAU); X.clip();
    for (let i = 0; i < 40; i++) { const a = -Math.PI + hash(i) * 1.7, d = SR * (.55 + .45 * hash(i * 3)); paint(ellPts(SC[0] + Math.cos(a) * d, SC[1] + Math.sin(a) * d, 30 + 40 * hash(i * 5), 20 + 20 * hash(i * 7), 10), { fill: hash(i * 9) < .5 ? '#FFB030' : '#FFF0A0', ink: null, alpha: .45 }); }
    X.restore();
    // the prominence erupts on the beat
    const e = expoOut(clamp(lt / .28)), a1 = -2.55, a2 = -2.0, A = [SC[0] + Math.cos(a1) * SR, SC[1] + Math.sin(a1) * SR], Bp = [SC[0] + Math.cos(a2) * SR, SC[1] + Math.sin(a2) * SR];
    const hgt = 560 * e, mid = [(A[0] + Bp[0]) / 2 - hgt * .9, (A[1] + Bp[1]) / 2 - hgt * .9], sp = [];
    for (let i = 0; i <= 24; i++) { const u = i / 24, q = 1 - u; sp.push([q * q * A[0] + 2 * q * u * mid[0] + u * u * Bp[0] + Math.sin(u * 20 + t * 9) * 8, q * q * A[1] + 2 * q * u * mid[1] + u * u * Bp[1]]); }
    paint(ribbon(sp, u => 40 + 30 * Math.sin(u * Math.PI)), { fill: PAL.nOrange, shade: '#C8400A', ink: null, curv: .5, rim: '#FFE27A' });
    neonLine(sp, '#FFF4C0', 10, 1, .5);
    for (let i = 0; i < 18; i++) { const u = hash(i * 3), k2 = frac(lt * 2 + hash(i)); const p = sp[Math.floor(u * 24)]; glow(p[0] - 40 * k2, p[1] - 120 * k2, 18, '#FFE27A', .7 * (1 - k2)); }
    // a lattice ring crossing the foreground in silhouette
    const ringP = []; for (let i = 0; i <= 30; i++) { const a = Math.PI * (1.0 + i / 30 * .55); ringP.push([2150 + Math.cos(a) * 2300, 2300 + Math.sin(a) * 1500]); }
    line(ringP, 26, '#040818', .5, 1); neonLine(ringP, PAL.nCyan, 8, 1, .5);
    FX.bloom = .75;
  }
  function cuRack(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#06040E'], [1, '#120A24']]);
    camBegin(960, 540, 1.04 + .08 * lt / dur, .05);
    paint(rrPts(200, 10, 1520, 1060, 24), { fill: '#1C1733', shade: '#0C0A18', rim: G.rimG, ink: PAL.line, sw: 3 });
    const rows = 7, cols = 11, wave = lt / (BT * .45);
    for (let r = 0; r < rows; r++) {
      const y = 50 + r * 144;
      paint(rrPts(250, y, 1420, 118, 10), { fill: '#0A0716', ink: PAL.line, sw: 1.6 });
      X.fillStyle = '#1E1834'; for (let v = 0; v < 12; v++) X.fillRect(1380 + v * 22, y + 22, 10, 74);
      for (let c = 0; c < cols; c++) {
        const on = (c / cols * .7 + r * .05) < wave, blink = hash(r * 31 + c * 7 + Math.floor(t * 10)) < .82, col = c === 0 ? PAL.nGreen : (r * 3 + c) % 7 === 0 ? PAL.nMagenta : (r + c) % 5 === 0 ? PAL.nYellow : PAL.nCyan;
        const lx = 320 + c * 96, ly = y + 59, lit = on && blink;
        X.fillStyle = lit ? col : '#1E2233'; X.fillRect(lx - 24, ly - 15, 48, 30);
        if (lit) { X.fillStyle = '#FFFFFF'; X.globalAlpha = .7; X.fillRect(lx - 16, ly - 9, 20, 6); X.globalAlpha = 1; glow(lx, ly, 70, col, .5); }
      }
    }
    const sy = lerp(-100, 1180, clamp(lt / dur)); X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(39,242,242,.18)'; X.fillRect(200, sy - 30, 1520, 60); X.restore();
    camEnd();
  }
  function cuHands(t, lt, dur) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#0E0626'], [1, '#2A0E3A']]);
    glow(960, 540, 700, G.gold, .35 * (1 + hitAt(lt, 0, 6)));
    const rec = 26 * hitAt(lt, 0, 9), cxp = 960;
    speedLines(cxp, 540, .7 * hitAt(lt, 0, 5) + .1, { col: '#FFFFFF', n: 40, r0: 300 });
    // his arm from the left: sleeve, rib cuff, fist
    const ax = cxp - 170 - rec;
    paint(limbPts([[-160, 760], [ax - 380, 600], [ax - 90, 560]], [120, 105, 95]), { fill: HERO.bomber, shade: HERO.bomberDk, rim: HERO.bomberRim, ink: PAL.line, sw: 4 });
    paint(rrPts(ax - 110, 470, 70, 180, 24), { fill: HERO.rib, shade: HERO.ribDk, ink: PAL.line, sw: 3 });
    paint(rrPts(ax - 50, 452, 200, 196, 70), { fill: HERO.skinN, shade: HERO.skinNDk, ink: PAL.line, sw: 4, light: [-.1, -.2] });
    for (let i = 0; i < 3; i++) line([[ax + 110, 492 + i * 48], [ax + 145, 500 + i * 48]], 3, PAL.line, 0);
    // the tentacle from the right, its tip curled into a little fist
    const tx = cxp + 150 + rec, sp = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16; sp.push([lerp(2200, tx + 50, u) + Math.sin(u * 5 + t * 3) * 30 * (1 - u), lerp(820, 555, Math.pow(u, .7)) + Math.sin(u * 7 + t * 4) * 20 * (1 - u)]); }
    paint(ribbon(sp, u => lerp(150, 70, u)), { fill: MOD.bodyN, shade: MOD.bodyNDk, rim: MOD.rimN, ink: PAL.line, sw: 4, curv: .5, light: [0, -.25] });
    neonLine(sp.slice(1, -1).map(([x, y], i) => [x, y - lerp(150, 70, i / 16) * .6]), MOD.rimN, 4, .8, .5);
    for (let i = 2; i < 15; i += 2) { const [qx, qy] = sp[i], ww = lerp(150, 70, i / 16) * .35; paint(ellPts(qx, qy + ww, ww * .5, ww * .35, 10), { fill: '#3A1E5E', ink: null }); }
    paint(ellPts(tx + 40, 552, 92, 88, 22), { fill: MOD.bodyN, shade: MOD.bodyNDk, rim: MOD.rimN, ink: PAL.line, sw: 4 });
    // impact
    const k = hitAt(lt, 0, 7);
    if (k > .05) { paint(starPts(cxp, 550, 60 + 200 * (1 - k), .35, 8, .3), { fill: PAL.nYellow, ink: PAL.line, sw: 3, alpha: k }); glow(cxp, 550, 260, '#FFFFFF', .6 * k); }
    FX.shake += 16 * hitAt(lt, 0, 12);
  }
  function cuEmblem(t, lt, dur) {
    style(1);
    // the back of the bomber, filling the frame
    const g = X.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#3A2A7A'); g.addColorStop(.6, HERO.bomber); g.addColorStop(1, HERO.bomberDk);
    X.fillStyle = g; X.fillRect(-200, -200, W + 400, H + 400);
    camBegin(960, 540, 1 + .08 * lt / dur, .05);
    X.strokeStyle = 'rgba(10,6,30,.6)'; X.lineWidth = 5; X.setLineDash([18, 14]); X.beginPath(); X.moveTo(-200, 60); X.quadraticCurveTo(960, 140, 2200, 60); X.moveTo(-200, 1020); X.quadraticCurveTo(960, 940, 2200, 1020); X.stroke(); X.setLineDash([]);
    paint(rectPts(-300, 1000, 2600, 200), { fill: HERO.rib, shade: HERO.ribDk, ink: PAL.line, sw: 3 });
    dysonEmblem(960, 520, 330, .12 * hitAt(lt, 0, 5));
    camEnd();
    FX.bloom = .3;
  }
  function cuTentacles(t, lt, dur) {
    style(1);
    space(t, { n: 80, seed: 51 });
    lattice(1380, 360, 300, { rings: 4, panels: 4, swarm: 1, t });
    const sw = easeOut(clamp(lt / .3)), ta = onTwos(t) * 2;
    for (let i = 0; i < 6; i++) {
      const sd = i % 2 ? 1 : -1, x0 = sd < 0 ? -200 + i * 90 : 2100 - i * 90, a0 = sd < 0 ? -.35 - i * .1 : Math.PI + .35 + i * .1;
      tentacle(x0, 1250 - i * 30, a0 + sd * (.55 - .8 * sw) * -1, 1500 - i * 80, 150 - i * 14, ta, i + 60, { rim: i % 2 ? MOD.rim2N : MOD.rimN, amp: .4, curl: .35 });
    }
  }

  // ======================================================================================
  // b376–384 · half-beat stutter montage: the shell closes, energy beams, flashes
  // ======================================================================================
  function mSphere(t, lt, o) {
    style(1);
    space(t, { n: 100, seed: o.seed || 61 });
    camBegin(960, 540, 1 + .25 * lt, o.rot || 0);
    const x = o.x ?? 960, y = o.y ?? 540, r = o.r, pct = o.pct;
    // energy beams out of the sphere toward the moon
    for (let i = 0; i < 3; i++) { const a = Math.PI * (.35 + i * .15) + (o.rot || 0), fl = .6 + .4 * hash(i + Math.floor(t * 30)); neonLine([[x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9], [x + Math.cos(a) * 3000, y + Math.sin(a) * 3000]], i === 1 ? '#FFE9A8' : PAL.nCyan, (i === 1 ? 18 : 8) * fl, .9, 0); }
    lattice(x, y, r, { rings: 4, panels: 4, swarm: 1, shell: pct, sun: lerp(1, .6, clamp((pct - .8) / .2)), spin: o.spin || 0, flash: [.4, .4, .4, .4].map(v => v * hitAt(lt, 0, 12)), t });
    camEnd();
    txt('SHELL ' + (pct * 100).toFixed(pct > .99 ? 1 : 0) + '%', 70, 1010, 44, '#FFFFFF', { font: 'Orbitron', align: 'left', glow: PAL.nCyan });
  }
  function mBeam(t, lt, o) {
    style(1);
    space(t, { n: 60, seed: 71 });
    const v = o.v || 0, hz = v ? 300 : 620;
    camBegin(960, 540, 1 + .2 * lt, v ? -.06 : .03);
    if (!v) lattice(1500, 140, 95, { rings: 4, panels: 4, swarm: 1, shell: .9, sun: .7, t });
    ground(t, { hz, seed: 13 + v, craters: 7, focal: v ? 700 : 300, lit: 1 });
    const n = v ? 5 : 16, base = v ? 1060 : hz + 60, w = v ? 190 : 46;
    for (let i = 0; i < n; i++) { const x = v ? 60 + i * 390 : 80 + i * 112; if (Math.abs(x + w / 2 - 960) < w) continue; pod(x, base + (v ? 0 : 0), w, w * 2.4, { on: 1, seed: i + v * 9, t, glowA: 1 }); }
    // the beam lands on the receiver
    const bx = v ? 960 : 960, by = v ? 800 : hz + 30, fl = .8 + .2 * hash(Math.floor(t * 30));
    const topX = v ? 1300 : 1500, topY = v ? -200 : 140;
    neonLine([[topX, topY], [bx, by]], '#FFE9A8', (v ? 70 : 34) * fl, 1, 0);
    neonLine([[topX, topY], [bx, by]], PAL.nCyan, (v ? 130 : 60) * fl, .35, 0);
    glow(bx, by, v ? 520 : 260, '#FFFFFF', .8);
    for (let i = 0; i < 3; i++) { const k = frac(lt * 4 + i / 3); neonLine(ellPts(bx, by + 10, 60 + k * (v ? 900 : 500), (20 + k * (v ? 200 : 110)), 40), G.gold, 3, 1 - k, 0, true); }
    camEnd();
  }
  function mFace(t, lt, o) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#1A0A10'], [1, '#3A1A10']]);
    glow(1500, 200, 1000, G.gold, .5);
    const h = 2500, x = o.x ?? 960, y = 560 + .89 * h;
    camBegin(960, 540, 1 + .12 * lt);
    astro(x, y, h, { view: 'q', flip: !!o.flip, eyes: o.eyes || 'wide', brows: 'up', mouth: o.mouth || 'open', chrome: 1, glint: 1, lookX: o.flip ? -.5 : .5, lookY: -.6, rimCol: '#FFE9A8' });
    camEnd();
  }
  function mMask(t, lt, o) {
    style(1);
    vgrad(-200, -200, W + 400, H + 400, [[0, '#2A0A10'], [1, '#4A1A20']]);
    glow(960, 300, 900, G.gold, .5);
    mask(960, 560, 420, { eyes: o.eyes || 'star', mouth: o.mouth || 'open', rot: o.rot || 0, glow: 1, look: [0, -.6] });
  }
  function mTwo(t, lt, o) {
    style(1);
    space(t, { n: 80, seed: 81 });
    glow(960, -200, 1100, G.gold, .55);
    camBegin(960, 540, 1 + .12 * lt);
    ground(t, { hz: 820, seed: 15, craters: 4, focal: 200 });
    astro(700, 1180, 900, { view: 'front', ...POSES.stand, aL: [.3, .4], aR: [.3, .4], eyes: 'wide', mouth: 'O', lookY: -1, tilt: -.05, rimCol: '#FFE9A8' });
    shoggoth(1320, 930, 170, { tent: 6, reach: .35, eyesN: 7, maskR: .55, mood: { eyes: 'star', mouth: 'open', look: [0, -1] }, t: onTwos(t), seed: 3 });
    camEnd();
  }
  const MONT = [
    [mSphere, { pct: .86, r: 330 }],
    [mBeam, { v: 0 }],
    [mSphere, { pct: .885, r: 520, rot: .25, seed: 62 }],
    [mFace, {}],
    [mSphere, { pct: .915, r: 400, x: 1150, y: 480, rot: -.2, seed: 63 }],
    [mBeam, { v: 1 }],
    [mMask, { eyes: 'star' }],
    [mSphere, { pct: .935, r: 330, seed: 64 }, 'inv'],
    [mSphere, { pct: .95, r: 580, rot: .5, seed: 65 }],
    [mBeam, { v: 0 }, 'flash'],
    [mSphere, { pct: .965, r: 430, x: 800, rot: -.4, seed: 66 }],
    [mTwo, {}],
    [mSphere, { pct: .978, r: 640, seed: 67 }, 'inv'],
    [mBeam, { v: 1 }, 'flash'],
    [mSphere, { pct: .99, r: 480, rot: .15, seed: 68 }, 'stut'],
    [mSphere, { pct: .996, r: 720, rot: -.1, seed: 69 }, 'stut']
  ];
  const montShot = i => (t, lt, dur) => {
    const [fn, o, fx] = MONT[i];
    fn(t, fx === 'stut' ? stutter(lt, BT / 4, BT / 10) : lt, o);
    if (fx === 'inv') FX.invert = Math.max(FX.invert, .9 * hitAt(lt, 0, 14));
    if (fx === 'flash') { FX.flash = Math.max(FX.flash, .7 * hitAt(lt, 0, 16)); FX.flashCol = '#FFF1C8'; }
    if (fx === 'stut') { FX.rgb = Math.max(FX.rgb, .5); FX.glitch = Math.max(FX.glitch, .25 * hitAt(lt, 0, 10)); }
    FX.zoom *= 1.06 - .06 * easeOut(lt / dur);
  };

  // ======================================================================================
  // b384–392 · BREAK: the shell closes, the sun goes dark, the stars come out. Crane down to him and the mask
  // looking up. b391: the ignition flare starts.
  // ======================================================================================
  const BS = [1340, 320, 230];
  function breakShot(t, lt, dur) {
    style(1);
    const b = lt / BT, close = easeOut(clamp(lt / .3)), dark = easeInOut(clamp((lt - .12) / .9));
    const ign = clamp((lt - 7 * BT) / (dur - 7 * BT)), mv = easeInOut(clamp((lt - 1.0) / 1.15));
    const cx = lerp(BS[0] + 70, 960, mv), cy = lerp(BS[1] - 20, 545, mv), z = lerp(1.85, 1, mv);
    FX.bloom = .6 + .3 * (1 - dark);
    space(t, { n: 190, starA: .15 + .85 * dark, seed: 91, sx: -(cx - 960) * .15, sy: -(cy - 540) * .15, stops: [[0, '#020106'], [.6, mixCol('#0B0620', '#07061A', dark)], [1, mixCol('#2A1238', '#0E0C2A', dark)]] });
    camBegin(cx, cy, z);
    earth(330, 210, 78);
    lattice(BS[0], BS[1], BS[2], { rings: 4, panels: 4, swarm: 1, shell: lerp(.996, 1, close), sun: (1 - dark) * .55, ringA: lerp(1, .32, dark) + .6 * ign, dim: .6 * dark * (1 - ign), ign, spin: .01 * lt, t });
    if (ign > 0) flare(BS[0] - 40, BS[1] - 30, ign, t);
    ground(t, { hz: 860, seed: 17, craters: 9, focal: 330, lit: Math.max(1 - dark, .6 * ign) });
    // him and the little mask, side by side, looking up at it (rim light: sun gold → earthshine blue → ignition gold)
    const rim = ign > .05 ? mixCol('#7FB8FF', G.gold, ign) : mixCol(G.gold, '#7FB8FF', dark);
    const nod = b >= 5 && b < 6 ? .12 * Math.sin((b - 5) * Math.PI) : 0, lookM = b >= 4 && b < 6 ? 1 : 0;
    paint(ellPts(770, 1032, 150, 18, 18), { fill: '#05030C', ink: null, alpha: .5 });
    astro(780, 1030, 480, { view: 'side', lookY: lookM ? .3 : -1, lookX: .2, tilt: lookM ? .05 + nod : -.28, aL: [.15, .2], aR: [.2, .25], eyes: ign > .1 ? 'wide' : 'open', mouth: ign > .1 ? 'O' : 'smile', rimCol: rim });
    shoggoth(520, 990, 78, { tent: 5, reach: .15, eyesN: 3, maskR: .64, mood: { eyes: ign > .1 ? 'star' : lookM ? 'happy' : 'open', mouth: 'smile', look: lookM ? [1, -.2] : [.6, -1] }, look: [.6, -1], t: onTwos(t), seed: 5 });
    camEnd();
  }

  // ======================================================================================
  chapter('dyson', bt(328), bt(392), [
    [bt(328), touchdown],
    [bt(336), unfurl, { tin: 'whipV', td: .2 }],
    [bt(344), rackRows],
    [bt(348), streams, { tin: 'zoom', td: .2 }],
    [bt(352), assemblyWide, { tin: 'white', td: .18 }],
    [bt(356), assemblyClose],
    [bt(360), kardashev, { tin: 'glitch', td: .14 }],
    [bt(362), chartVert],
    [bt(364), rhyme],
    [bt(366), maskStars],
    [bt(368), cuFace], [bt(369), cuGrin], [bt(370), cuPanel], [bt(371), cuFlare],
    [bt(372), cuRack], [bt(373), cuHands], [bt(374), cuEmblem], [bt(375), cuTentacles],
    ...MONT.map((_, i) => [bt(376 + i / 2), montShot(i)]),
    [bt(384), breakShot]
  ]);
  // the postcard: the finished lattice over the moon base, the model conducting
  POSTCARDS.dyson = t => assemblyWide(t, 3 * BT + .6 + .1 * Math.sin(t), 4 * BT);
})();
