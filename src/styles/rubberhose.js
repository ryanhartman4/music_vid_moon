// rubberhose.js: style study, slot 4. 1930s rubber-hose cartoon (early sound-era animation).
// Bouncy round forms, noodle limbs with no elbows, white four-finger gloves, pie-cut eyes, thick black ink,
// flat cel greys over a hand-painted background, sepia film print with grain, dust, scratches and a flickery vignette.
// Everything is drawn in greys, then printed to sepia; the only hand-tint is the tiny pink context bar on the laptop.
(() => {
  const K = 4;
  const INK = '#0c0a09';
  const g = v => { const n = Math.round(clamp(v) * 255); return `rgb(${n},${n},${n})`; };
  const ga = (v, a) => { const n = Math.round(clamp(v) * 255); return `rgba(${n},${n},${n},${a})`; };
  let LAST_HOSE = null;
  let c = null;   // current context (X, or an offscreen layer while caching)

  // ---------- paths ----------
  // Catmull-Rom spline through points; a point's 3rd value scales its tangent (0 = sharp corner).
  function path(pts, closed = true, k = 1) {
    const n = pts.length; c.beginPath(); if (n < 2) return;
    const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    const tan = i => { const a = P(i - 1), b = P(i + 1), s = (P(i)[2] ?? 1) * k / 6; return [(b[0] - a[0]) * s, (b[1] - a[1]) * s]; };
    c.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p1 = P(i), p2 = P(i + 1), t1 = tan(i), t2 = tan(i + 1);
      c.bezierCurveTo(p1[0] + t1[0], p1[1] + t1[1], p2[0] - t2[0], p2[1] - t2[1], p2[0], p2[1]);
    }
    if (closed) c.closePath();
  }
  // sample the same spline into a polyline
  function sample(pts, closed = false, per = 10, k = 1) {
    const n = pts.length, out = [];
    const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    const tan = i => { const a = P(i - 1), b = P(i + 1), s = (P(i)[2] ?? 1) * k / 6; return [(b[0] - a[0]) * s, (b[1] - a[1]) * s]; };
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p1 = P(i), p2 = P(i + 1), t1 = tan(i), t2 = tan(i + 1);
      const c1 = [p1[0] + t1[0], p1[1] + t1[1]], c2 = [p2[0] - t2[0], p2[1] - t2[1]];
      for (let j = 0; j < per; j++) {
        const u = j / per, v = 1 - u;
        out.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]);
      }
    }
    if (!closed) out.push([P(n - 1)[0], P(n - 1)[1]]);
    return out;
  }
  function poly(pts, closed = true) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (closed) c.closePath(); }
  // ink: a round-nib stroke, plus a slightly offset second pass so the line swells on the down-strokes like a dip pen
  function inkIt(lw, col = INK) {
    c.lineWidth = lw; c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke();
    if (lw >= 3.5 && col === INK) { c.save(); c.translate(lw * .16, lw * .1); c.lineWidth = lw * .78; c.stroke(); c.restore(); }
  }
  // a cel: flat fill + thick ink outline
  function cel(pts, fill, lw = 6, o = {}) {
    path(pts, !o.open, o.k ?? 1);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (lw) inkIt(lw, o.ink);
  }
  function stroke(pts, lw, col = INK, k = 1) { path(pts, false, k); inkIt(lw, col); }
  // tapered brush stroke along a spline: w(u) = half width
  function brush(pts, w0, w1 = w0, col = INK, mid = null) {
    const sp = sample(pts, false, 12), n = sp.length;
    const w = u => mid == null ? lerp(w0, w1, u) : (u < .5 ? lerp(w0, mid, u * 2) : lerp(mid, w1, u * 2 - 1));
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, ww = w(i / (n - 1));
      L.push([sp[i][0] + nx * ww, sp[i][1] + ny * ww]); R.push([sp[i][0] - nx * ww, sp[i][1] - ny * ww]);
    }
    poly(L.concat(R.reverse())); c.fillStyle = col; c.fill();
    // round the ends
    c.beginPath(); c.arc(sp[0][0], sp[0][1], w(0), 0, TAU); c.arc(sp[n - 1][0], sp[n - 1][1], w(1), 0, TAU); c.fill();
  }
  // a rubber hose: a noodle limb along a spline with round ends, flat fill, ink outline
  function hose(pts, w0, w1, fill, lw = 6) {
    const sp = sample(pts, false, 12), n = sp.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, ww = lerp(w0, w1, i / (n - 1));
      L.push([sp[i][0] + nx * ww, sp[i][1] + ny * ww]); R.push([sp[i][0] - nx * ww, sp[i][1] - ny * ww]);
    }
    const cap = (p, q, w) => { const a0 = Math.atan2(p[1] - q[1], p[0] - q[0]), out = []; for (let k = -3; k <= 3; k++) { const a = a0 + k / 3 * Math.PI / 2; out.push([p[0] + Math.cos(a) * w, p[1] + Math.sin(a) * w]); } return out; };
    const endCap = cap(sp[n - 1], sp[n - 2], w1), startCap = cap(sp[0], sp[1], w0);
    // caps go from L side to R side: for the end, L[n-1] → R[n-1]
    const pts2 = [...L, ...endCap.reverse(), ...R.reverse(), ...startCap.reverse()];
    poly(pts2); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) inkIt(lw);
    LAST_HOSE = pts2;
    return sp;
  }
  function oval(cx, cy, rx, ry, rot = 0, fill = null, lw = 0, ink = INK) {
    c.beginPath(); c.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), rot, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); } if (lw) inkIt(lw, ink);
  }
  // the pie-cut eye: a black oval with a wedge sliced out (the wedge shows what's behind, `bg`)
  function pieEye(cx, cy, rx, ry, rot = 0, bg = '#fff', ang = -.9, wid = .8, tip = .12) {
    c.save(); c.translate(cx, cy); c.rotate(rot);
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fillStyle = INK; c.fill(); c.clip();
    const R = Math.max(rx, ry) * 3;
    c.beginPath(); c.moveTo(Math.cos(ang) * rx * tip, Math.sin(ang) * ry * tip);
    c.lineTo(Math.cos(ang - wid / 2) * R, Math.sin(ang - wid / 2) * R); c.lineTo(Math.cos(ang + wid / 2) * R, Math.sin(ang + wid / 2) * R);
    c.closePath(); c.fillStyle = bg; c.fill();
    c.restore();
  }
  // a soft light/shadow blob (painted air-brush)
  function soft(x, y, r, v, a, comp = 'source-over', sy = 1) {
    c.save(); c.globalCompositeOperation = comp; c.translate(x, y); c.scale(1, sy);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, ga(v, a)); gr.addColorStop(.5, ga(v, a * .5)); gr.addColorStop(1, ga(v, 0));
    c.fillStyle = gr; c.fillRect(-r, -r, 2 * r, 2 * r); c.restore();
  }
  // a white four-finger cartoon glove (thumb + three fat fingers, flared cuff, three stitch lines)
  // (x, y) = wrist, ang = direction the hand points, s = scale, flip mirrors the thumb side, curl 0..1 bends fingers down
  function glove(x, y, ang, s = 1, o = {}) {
    const fl = o.flip ? -1 : 1, lw = (o.lw ?? 5.5) / s, cu = o.curl ?? .4;
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s * fl);
    const W1 = '#fbfbfb';
    const thumb = () => hose([[16, -14], [26, -30], [36, -38]], 8.5, 8, W1, lw);
    if (o.thumbBack) thumb();
    // three fat sausage fingers (curl bends them down over the keys)
    for (const y0 of [-12, 0, 12]) {
      const L = 30 - Math.abs(y0) * .3;
      hose([[40, y0], [40 + L * .65, y0 + cu * 5], [40 + L * (1 - cu * .3), y0 + cu * L * .55]], 8.8, 8.2, W1, lw);
    }
    // the puffy back of the hand
    cel([[0, -17], [16, -23], [36, -22], [50, -10], [52, 8], [40, 21], [16, 22], [0, 16]], W1, lw);
    if (!o.thumbBack) thumb();
    // the three stitch lines
    for (const yy of [-8, 0, 8]) stroke([[18, yy * .9], [34, yy]], 2.6 / s);
    // flared cuff with a rolled rim
    cel([[-24, -27], [-5, -19], [3, -17, .5], [5, 0], [3, 17, .5], [-5, 19], [-24, 27], [-30, 0]], W1, lw);
    stroke([[-14, -21], [-9, 0], [-14, 21]], 2.6 / s);
    c.restore();
  }

  // ---------- cached layers ----------
  let BACK = null, FRONT = null, GRAINS = null;
  function layer(fn) { const cv = mkCanvas(W, H), keep = c; c = cv.getContext('2d'); fn(); c = keep; return cv; }
  const GLASS = { x: 250, y: 100, w: 670, h: 520 };   // window glass (clip for rain)

  // painted brush texture: many translucent dabs of nearby greys
  function dabs(x, y, w, h, v, n, spread = .05, seed = 1, size = 60, a = .07) {
    const r = lcg(seed * 7919 + 13);
    for (let i = 0; i < n; i++) {
      const px = x + r() * w, py = y + r() * h, rr = size * (.4 + r()), ang = (r() - .5) * .6;
      c.save(); c.translate(px, py); c.rotate(ang); c.scale(1, .35 + r() * .3);
      c.fillStyle = ga(v + (r() - .5) * 2 * spread, a * (.5 + r()));
      c.beginPath(); c.arc(0, 0, rr, 0, TAU); c.fill(); c.restore();
    }
  }

  function paintBack() {
    // --- wall ---
    c.fillStyle = g(.5); c.fillRect(0, 0, W, H);
    const wg = c.createRadialGradient(1640, 300, 40, 1500, 420, 1500);
    wg.addColorStop(0, g(.86)); wg.addColorStop(.25, g(.7)); wg.addColorStop(.6, g(.52)); wg.addColorStop(1, g(.34));
    c.fillStyle = wg; c.fillRect(0, 0, W, H);
    dabs(0, 0, W, H, .55, 900, .07, 3, 70, .05);
    // wallpaper: faint hand-stencilled diamonds with dots
    c.save();
    for (let yy = 30; yy < 900; yy += 110) for (let xx = (yy / 110 % 2) * 70; xx < W; xx += 140) {
      const d = Math.hypot(xx - 1640, yy - 300), v = d < 700 ? .9 : .6;
      c.globalAlpha = .15; c.fillStyle = g(v * .6);
      c.beginPath(); c.moveTo(xx, yy - 16); c.quadraticCurveTo(xx + 3, yy - 3, xx + 12, yy); c.quadraticCurveTo(xx + 3, yy + 3, xx, yy + 16); c.quadraticCurveTo(xx - 3, yy + 3, xx - 12, yy); c.quadraticCurveTo(xx - 3, yy - 3, xx, yy - 16); c.fill();
      c.beginPath(); c.arc(xx + 35, yy + 55, 3.5, 0, TAU); c.fill();
    }
    c.restore();

    // --- the window: night sky, sleepy moon, scalloped clouds, a bouncy deco skyline ---
    const { x: gx, y: gy, w: gw, h: gh } = GLASS;
    c.save(); c.beginPath(); c.rect(gx, gy, gw, gh); c.clip();
    const sky = c.createLinearGradient(0, gy, 0, gy + gh);
    sky.addColorStop(0, g(.13)); sky.addColorStop(.55, g(.25)); sky.addColorStop(1, g(.4));
    c.fillStyle = sky; c.fillRect(gx, gy, gw, gh);
    dabs(gx, gy, gw, gh, .22, 160, .05, 11, 50, .08);
    // moon glow rings (painted halo)
    soft(470, 292, 260, .75, .35);
    for (let i = 3; i >= 1; i--) { c.globalAlpha = .06; c.fillStyle = g(.9); c.beginPath(); c.arc(470, 292, 90 + i * 34, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
    // twinkle stars (four-point sparkles)
    for (const [sx, sy, sr] of [[300, 150, 9], [650, 140, 7], [860, 190, 10], [760, 260, 5], [330, 300, 5], [600, 320, 6], [890, 120, 5]]) {
      c.fillStyle = g(.92); c.beginPath(); c.moveTo(sx, sy - sr); c.quadraticCurveTo(sx, sy, sx + sr * .7, sy); c.quadraticCurveTo(sx, sy, sx, sy + sr); c.quadraticCurveTo(sx, sy, sx - sr * .7, sy); c.quadraticCurveTo(sx, sy, sx, sy - sr); c.fill();
    }
    moonFace(470, 292);
    // scalloped rain clouds drifting past
    cloud(720, 215, 1.0, .36); cloud(330, 395, .8, .3); cloud(870, 360, .7, .3);
    skyline();
    c.restore();
    // window frame: chunky painted wood, slightly bowed
    const fr = g(.78), frd = g(.6);
    const bw = 26;
    cel([[gx - bw, gy - bw, 0], [gx + gw + bw, gy - bw, 0], [gx + gw + bw, gy + gh + 60, 0], [gx - bw, gy + gh + 60, 0]], null, 5);
    c.fillStyle = fr;
    c.beginPath(); c.rect(gx - bw, gy - bw, gw + bw * 2, bw); c.rect(gx - bw, gy, bw, gh + 60); c.rect(gx + gw, gy, bw, gh + 60); c.fill();
    // mullions
    const mx = gx + gw / 2, my = gy + gh * .56;
    c.fillStyle = fr; c.fillRect(mx - 9, gy, 18, gh + 60); c.fillRect(gx, my - 9, gw, 18);
    c.strokeStyle = INK; c.lineWidth = 3.5;
    c.strokeRect(mx - 9, gy, 18, gh + 60); c.strokeRect(gx, my - 9, gw, 18);
    c.strokeRect(gx, gy, gw, gh + 60);
    // frame shading (painted)
    c.fillStyle = ga(.3, .35); c.fillRect(gx, gy, gw, 10); c.fillRect(gx, gy, 8, gh + 60); c.fillRect(mx + 9, gy, 7, gh + 60); c.fillRect(gx, my + 9, gw, 7);
    // curtains + valance
    curtain(true); curtain(false);
    valance();
    // a little oval picture on the wall: a painted hill, a tree and a moon
    picture(1505, 245);
    // floor lamp (behind the couch), shade glowing
    lamp();
  }
  function picture(x, y) {
    stroke([[x - 30, y - 70], [x, y - 108], [x + 30, y - 70]], 2.5, ga(.1, .8));
    oval(x, y - 110, 6, 6, 0, g(.4), 3);
    oval(x, y, 62, 78, 0, g(.36), 5);
    oval(x, y, 48, 63, 0, g(.72), 4);
    c.save(); c.beginPath(); c.ellipse(x, y, 48, 63, 0, 0, TAU); c.clip();
    const sg = c.createLinearGradient(0, y - 63, 0, y + 63); sg.addColorStop(0, g(.55)); sg.addColorStop(1, g(.85)); c.fillStyle = sg; c.fillRect(x - 50, y - 65, 100, 130);
    oval(x + 16, y - 26, 10, 10, 0, g(.97), 2.5);
    cel([[x - 60, y + 70, 0], [x - 50, y + 22], [x - 10, y + 6], [x + 30, y + 20], [x + 60, y + 40], [x + 60, y + 70, 0]], g(.4), 3);
    stroke([[x - 20, y + 12], [x - 22, y - 16]], 4);
    oval(x - 22, y - 26, 16, 13, 0, g(.25), 3);
    c.restore();
    oval(x, y, 48, 63, 0, null, 4);
    // painted frame gloss
    c.strokeStyle = ga(.9, .5); c.lineWidth = 4; c.beginPath(); c.ellipse(x, y, 55, 71, 0, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
  }

  function moonFace(x, y) {
    // a crescent, opening to the right, with a sleepy profile face on the inner curve and a floppy nightcap
    const R = 92;
    c.save(); c.translate(x, y); c.scale(.88, .88); c.translate(-x, -y);
    const outer = []; for (let i = 0; i <= 24; i++) { const a = -1.15 - i / 24 * (TAU - 2.3 - .15); outer.push([x + Math.cos(a) * R, y + Math.sin(a) * R]); }
    // tips at angle -1.15 (top) and ~ +1.25 (bottom)
    const top = outer[0], bot = outer[outer.length - 1];
    // inner face profile from bottom tip back up to the top tip
    const face = [
      [bot[0], bot[1], 0], [x + 18, y + 58], [x + 6, y + 44],   // chin
      [x + 16, y + 34], [x + 10, y + 26],                        // lips
      [x + 4, y + 22], [x + 8, y + 16], [x + 30, y + 10], [x + 34, y + 2], [x + 22, y - 6], [x + 4, y - 8],   // big round nose
      [x - 4, y - 22], [x + 2, y - 40], [top[0], top[1], 0]];                                                   // brow + forehead
    const pts = [...outer.map(p => [p[0], p[1]]), ...face.slice(1, -1)];
    cel(pts, g(.96), 5);
    // cheek
    oval(x - 14, y + 30, 13, 8, 0, ga(.75, .7));
    // closed sleepy eye with lashes
    stroke([[x - 30, y - 4], [x - 18, y + 3], [x - 5, y - 2]], 4);
    for (const [ax, ay, bx, by] of [[-27, 0, -33, 8], [-18, 3, -20, 11], [-9, 1, -6, 9]]) stroke([[x + ax, y + ay], [x + bx, y + by]], 3);
    // sleepy droopy lid line above
    stroke([[x - 34, y - 14], [x - 18, y - 16], [x - 4, y - 12]], 2.6);
    // nightcap: a striped stocking cap pulled onto the top horn, flopping back, pom-pom dangling behind
    const T0 = top;
    hose([[T0[0] - 4, T0[1] + 2], [T0[0] + 6, T0[1] - 38], [T0[0] - 22, T0[1] - 70], [T0[0] - 64, T0[1] - 68], [T0[0] - 92, T0[1] - 40]], 30, 5, g(.9), 5);
    const capPts = LAST_HOSE;
    c.save(); poly(capPts); c.clip();
    for (let i = 0; i < 8; i++) { c.fillStyle = g(.42); c.save(); c.translate(T0[0] - 110 + i * 24, T0[1] - 40); c.rotate(.55); c.fillRect(-6, -90, 11, 180); c.restore(); }
    c.restore(); poly(capPts); inkIt(5);
    c.save(); c.translate(T0[0] - 4, T0[1] + 4); c.rotate(-.38);
    cel([[-36, -11, .3], [36, -11, .3], [38, 11, .3], [-38, 11, .3]], g(.95), 5);
    c.restore();
    stroke([[T0[0] - 92, T0[1] - 40], [T0[0] - 96, T0[1] - 22]], 3);
    oval(T0[0] - 96, T0[1] - 12, 15, 15, 0, g(.97), 4.5);
    c.restore();
  }

  function cloud(x, y, s, v) {
    const pts = [];
    const bumps = [[-110, 10, 26], [-80, -18, 32], [-38, -40, 40], [10, -46, 44], [58, -30, 36], [96, -8, 30], [118, 16, 22]];
    for (const [bx, by, r] of bumps) { oval(x + bx * s, y + by * s, r * s * 1.1, r * s, 0, g(v + .05)); }
    c.fillStyle = g(v); c.beginPath(); c.ellipse(x, y + 12 * s, 128 * s, 26 * s, 0, 0, TAU); c.fill();
    // inked scallops on top only (painted background: softer, thinner ink)
    c.strokeStyle = ga(.05, .8); c.lineWidth = 3; c.lineCap = 'round';
    for (const [bx, by, r] of bumps) { c.beginPath(); c.ellipse(x + bx * s, y + by * s, r * s * 1.1, r * s, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    // moonlit tops
    for (const [bx, by, r] of bumps) { c.fillStyle = ga(.8, .25); c.beginPath(); c.ellipse(x + bx * s - r * .2 * s, y + by * s - r * .45 * s, r * .55 * s, r * .3 * s, -.3, 0, TAU); c.fill(); }
  }

  function skyline() {
    const base = 640;
    // far row: pale, soft
    const far = [[240, 70, 150], [300, 60, 190], [350, 90, 140], [430, 50, 230], [470, 80, 170], [540, 70, 150], [600, 60, 250], [650, 90, 180], [730, 60, 210], [780, 80, 150], [850, 70, 190], [900, 60, 160]];
    for (const [bx, bw, bh] of far) {
      const lean = (hash(bx) - .5) * 14;
      const pts = [[bx, base, 0], [bx + lean * .3, base - bh * .6], [bx + lean, base - bh, 0], [bx + bw + lean, base - bh, 0], [bx + bw + lean * .3, base - bh * .6], [bx + bw, base, 0]];
      cel(pts, g(.33), 2.5, { ink: ga(.1, .6) });
    }
    // near row: deco towers with stepped crowns, a spire, a water tower; they bulge and lean a little
    const near = [[230, 110, 190, 0], [345, 80, 250, 1], [430, 120, 160, 2], [555, 90, 290, 3], [650, 110, 200, 0], [765, 80, 240, 2], [850, 110, 170, 1]];
    for (const [bx, bw, bh, kind] of near) {
      const lean = (hash(bx * 3) - .5) * 20, bulge = 6, top = base - bh;
      const pts = [[bx, base + 10, 0], [bx - bulge + lean * .4, base - bh * .5], [bx + lean, top, 0]];
      if (kind === 1) pts.push([bx + lean + bw * .15, top, 0], [bx + lean + bw * .15, top - 24, 0], [bx + lean + bw * .3, top - 24, 0], [bx + lean + bw * .3, top - 46, 0], [bx + lean + bw * .45, top - 46, 0], [bx + lean + bw * .5, top - 110, 0], [bx + lean + bw * .55, top - 46, 0], [bx + lean + bw * .7, top - 46, 0], [bx + lean + bw * .7, top - 24, 0], [bx + lean + bw * .85, top - 24, 0], [bx + lean + bw * .85, top, 0]);
      if (kind === 3) pts.push([bx + lean + bw * .2, top, 0], [bx + lean + bw * .2, top - 30, 0], [bx + lean + bw * .5, top - 70, 0], [bx + lean + bw * .8, top - 30, 0], [bx + lean + bw * .8, top, 0]);
      pts.push([bx + bw + lean, top, 0], [bx + bw + bulge + lean * .4, base - bh * .5], [bx + bw, base + 10, 0]);
      cel(pts, g(.16), 3.2, { k: .9 });
      if (kind === 2) {   // a little water tower on stilts
        const wx = bx + lean + bw * .5, wy = top;
        stroke([[wx - 16, wy], [wx - 12, wy - 20]], 3); stroke([[wx + 16, wy], [wx + 12, wy - 20]], 3);
        cel([[wx - 20, wy - 20, 0], [wx - 20, wy - 48], [wx - 22, wy - 50, 0], [wx, wy - 66, 0], [wx + 22, wy - 50, 0], [wx + 20, wy - 48], [wx + 20, wy - 20, 0]], g(.2), 3);
      }
      // lit windows (warm squares; some dark)
      const cols = Math.max(2, Math.floor(bw / 22)), rows = Math.floor((bh - 20) / 30);
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const hv = hash(bx * 7 + r * 13 + q * 5);
        if (hv < .45) {
          const k = (r + .5) / rows, wx = bx + lean * (1 - k) * .5 + 10 + q * ((bw - 20) / cols), wy = top + 16 + r * 30;
          c.fillStyle = g(hv < .12 ? .98 : .8); c.beginPath(); c.roundRect(wx, wy, 10, 14, 3); c.fill();
          if (hv < .12) soft(wx + 5, wy + 7, 22, .9, .25);
        }
      }
    }
  }

  function curtain(left) {
    const x0 = left ? 150 : 880, x1 = left ? 300 : 1020;
    const mid = (x0 + x1) / 2, tie = 400;
    const pts = left
      ? [[x0 - 20, 60, 0], [x1 + 10, 60, 0], [x1 - 30, 250], [mid + 12, tie, 0], [x1 - 20, 520], [x1 + 30, 700, 0], [x0 - 30, 700, 0]]
      : [[x0 - 10, 60, 0], [x1 + 20, 60, 0], [x1 + 30, 700, 0], [x0 - 30, 700, 0], [x0 + 20, 520], [mid - 12, tie, 0], [x0 + 30, 250]];
    cel(pts, g(.74), 5);
    // folds: long soft curves converging at the tie-back
    c.save(); path(pts); c.clip();
    for (let i = 0; i < 4; i++) {
      const fx = x0 + (i + .5) / 4 * (x1 - x0);
      stroke([[fx, 70], [lerp(fx, mid, .8), tie - 10]], 2.4, ga(.1, .7));
      stroke([[lerp(fx, mid, .8), tie + 12], [fx + (fx - mid) * .4, 690]], 2.4, ga(.1, .7));
      c.fillStyle = ga(.45, .25); c.beginPath(); c.moveTo(fx + 8, 70); c.quadraticCurveTo(lerp(fx, mid, .4) + 8, 220, lerp(fx, mid, .8) + 4, tie - 10); c.lineTo(lerp(fx, mid, .8) + 16, tie - 10); c.quadraticCurveTo(lerp(fx, mid, .4) + 24, 220, fx + 26, 70); c.fill();
    }
    c.restore();
    // tie-back: a fat bow of rope with a tassel
    oval(mid, tie, 30, 16, 0, g(.35), 4);
    cel([[mid - 8, tie + 12], [mid + 8, tie + 12], [mid + 14, tie + 50, 0], [mid - 14, tie + 50, 0]], g(.35), 4);
  }

  function valance() {
    const x0 = 120, x1 = 1050, y0 = 30, y1 = 120, n = 7, pts = [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0]];
    for (let i = n; i >= 1; i--) { const xa = x0 + i / n * (x1 - x0), xm = xa - (x1 - x0) / n / 2; pts.push([xm, y1 + 26], [xa - (x1 - x0) / n, y1, 0]); }
    cel(pts, g(.66), 5);
    c.save(); path(pts); c.clip();
    for (let i = 0; i < n; i++) { const xm = x0 + (i + .5) / n * (x1 - x0); c.fillStyle = ga(.9, .25); c.beginPath(); c.ellipse(xm - 20, y1 - 8, 30, 14, 0, 0, TAU); c.fill(); }
    c.restore();
    c.fillStyle = g(.4); c.fillRect(x0 - 10, y0 - 12, x1 - x0 + 20, 16); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(x0 - 10, y0 - 12, x1 - x0 + 20, 16);
    oval(x0 - 14, y0 - 4, 14, 14, 0, g(.45), 4); oval(x1 + 14, y0 - 4, 14, 14, 0, g(.45), 4);
  }

  function lamp() {
    const x = 1745, top = 150, bot = 320;
    // glow on the wall around the shade: soft air-brush + concentric painted rings
    soft(x, 250, 520, .95, .36);
    for (let i = 4; i >= 1; i--) { c.globalAlpha = .05; c.fillStyle = g(1); c.beginPath(); c.arc(x, 250, 120 + i * 60, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
    // pole
    hose([[x, bot], [x + 14, 620], [x - 4, 1080]], 9, 11, g(.25), 4.5);
    // shade: a bulgy bell with a fringe
    const sh = [[x - 62, top, 0], [x + 62, top, 0], [x + 78, top + 50], [x + 96, top + 112], [x + 126, bot, 0]];
    for (let i = 1; i < 8; i++) sh.push([x + 126 - i * 252 / 8, bot + 6 + (i % 2 ? 12 : 0) + Math.sin(i / 8 * Math.PI) * 10]);
    sh.push([x - 126, bot, 0], [x - 96, top + 112], [x - 78, top + 50]);
    cel(sh, g(.86), 5);
    c.save(); path(sh); c.clip(); soft(x, bot + 30, 170, 1, .7); c.fillStyle = ga(.55, .25); c.beginPath(); c.ellipse(x + 90, top + 90, 50, 150, -.3, 0, TAU); c.fill(); c.restore();
    path(sh); inkIt(5);
    // pleats
    for (let i = -3; i <= 3; i++) stroke([[x + i * 17, top + 4], [x + i * 24, top + 90], [x + i * 34, bot + 12 - Math.abs(i) * 2]], 2, ga(.2, .6));
    // bobble fringe
    for (let i = 0; i <= 12; i++) { const u = i / 12, fx = lerp(x - 120, x + 120, u), fy = bot + 8 + Math.sin(u * Math.PI) * 14; stroke([[fx, fy], [fx, fy + 16]], 2.5); oval(fx, fy + 22, 6, 6, 0, g(.9), 3); }
    // finial
    oval(x, top - 12, 10, 12, 0, g(.4), 4);
    stroke([[x - 62, top], [x + 62, top]], 5);
  }

  // ---------- the couch (front layer, drawn over rain, under the characters) ----------
  function paintFront() {
    const cc = .4, cl = .56, cd = .24;
    // back panel with a camelback top
    const back = [[70, 1080, 0], [70, 640], [120, 575], [400, 552], [700, 560], [930, 540], [1180, 548], [1450, 556], [1680, 580], [1760, 640], [1760, 1080, 0]];
    cel(back, g(cc), 4.5);
    c.save(); path(back); c.clip();
    // painted rounded light along the top rail + dark underneath
    const bg = c.createLinearGradient(0, 540, 0, 900); bg.addColorStop(0, g(cl + .06)); bg.addColorStop(.35, g(cc)); bg.addColorStop(1, g(cd));
    c.fillStyle = bg; c.fillRect(0, 520, W, 560);
    dabs(70, 540, 1690, 400, cc, 220, .05, 21, 40, .08);
    // diamond tufting: crease lines between the buttons
    c.strokeStyle = ga(.12, .35); c.lineWidth = 2.4;
    for (let i = -1; i < 10; i++) { const bx = 170 + i * 185; c.beginPath(); c.moveTo(bx, 640); c.lineTo(bx + 92, 720); c.lineTo(bx + 185, 640); c.moveTo(bx + 92, 720); c.lineTo(bx + 92 - 60, 800); c.moveTo(bx + 92, 720); c.lineTo(bx + 152, 800); c.moveTo(bx, 640); c.lineTo(bx + 60, 570); c.moveTo(bx, 640); c.lineTo(bx - 60, 570); c.stroke(); }
    // button tufts: a dot with four crease ticks
    for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) {
      const bx = 170 + i * 185 + (r % 2) * 92, by = 640 + r * 80;
      oval(bx, by, 7, 6, 0, g(.2), 2.5);
      for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) stroke([[bx + Math.cos(a) * 12, by + Math.sin(a) * 10], [bx + Math.cos(a) * 26, by + Math.sin(a) * 20]], 2.2, ga(.08, .6));
    }
    c.restore(); path(back); inkIt(4.5);
    // left arm: a big rolled scroll
    const la = [[40, 1080, 0], [30, 720], [60, 650], [150, 628], [260, 650], [300, 720], [300, 1080, 0]];
    cel(la, g(cc + .04), 4.5);
    c.save(); path(la); c.clip(); const lg = c.createLinearGradient(40, 0, 300, 0); lg.addColorStop(0, g(cd)); lg.addColorStop(.5, g(cl + .08)); lg.addColorStop(1, g(cc - .04)); c.fillStyle = lg; c.fillRect(0, 600, 320, 480); c.restore();
    path(la); inkIt(4.5);
    // the scroll curl on its face
    // right arm (under the lamp)
    const ra = [[1600, 1080, 0], [1600, 730], [1640, 660], [1740, 645], [1850, 670], [1880, 740], [1880, 1080, 0]];
    cel(ra, g(cc + .04), 4.5);
    c.save(); path(ra); c.clip(); const rg = c.createLinearGradient(1600, 0, 1880, 0); rg.addColorStop(0, g(cd)); rg.addColorStop(.5, g(cl + .12)); rg.addColorStop(1, g(cc)); c.fillStyle = rg; c.fillRect(1590, 600, 300, 480); soft(1745, 650, 160, 1, .35); c.restore();
    path(ra); inkIt(4.5);
    oval(1742, 716, 58, 54, 0, g(.62), 4.5);
    stroke([[1742, 716], [1756, 708], [1760, 728], [1740, 742], [1718, 726], [1726, 694], [1760, 686], [1784, 714], [1774, 752], [1738, 766]], 4);
    // seat cushions: plump pillows
    const seat = (x0, x1) => [[x0, 820], [lerp(x0, x1, .5), 800], [x1, 822], [x1 + 8, 880], [x1, 1000], [lerp(x0, x1, .5), 1010], [x0, 1000], [x0 - 8, 880]];
    for (const [x0, x1] of [[300, 900], [900, 1600]]) {
      const s = seat(x0, x1); cel(s, g(cc + .02), 4.5);
      c.save(); path(s); c.clip(); const sg2 = c.createLinearGradient(0, 800, 0, 1010); sg2.addColorStop(0, g(cl + .08)); sg2.addColorStop(.25, g(cc)); sg2.addColorStop(1, g(cd - .05)); c.fillStyle = sg2; c.fillRect(x0 - 20, 790, x1 - x0 + 40, 240); c.restore();
      path(s); inkIt(4.5);
      stroke([[x0 + 20, 850], [lerp(x0, x1, .5), 835], [x1 - 20, 852]], 3, ga(.08, .7));   // piping
    }
    // a plump squashy throw pillow leaning on the right arm: button in the middle, tassels on the corners
    c.save(); c.translate(1505, 712); c.rotate(.16); c.scale(.92, .92);
    const pil = [[-100, -92, .25], [0, -92], [100, -96, .25], [98, 0], [102, 94, .25], [0, 94], [-104, 92, .25], [-98, 0]];
    cel(pil, g(.64), 5);
    c.save(); path(pil); c.clip(); soft(-30, -40, 110, .9, .45); soft(40, 60, 120, .2, .4);
    c.strokeStyle = ga(.15, .5); c.lineWidth = 2.5;
    for (const [ax, ay] of [[-100, -92], [100, -96], [102, 94], [-104, 92]]) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(ax * .4, ay * .6, ax * .8, ay * .8); c.stroke(); }
    c.restore(); path(pil); inkIt(5);
    oval(0, 0, 9, 8, 0, g(.3), 3.5);
    for (const [ax, ay] of [[-100, -92], [100, -96], [102, 94], [-104, 92]]) { c.save(); c.translate(ax, ay); c.rotate(Math.atan2(ay, ax) - Math.PI / 2); cel([[-6, -2], [6, -2], [5, 18, 0], [-5, 18, 0]], g(.85), 3); c.restore(); }
    c.restore();
    // skirt at the very bottom
    const sk = [[30, 1000, 0], [1890, 1000, 0], [1890, 1100, 0], [30, 1100, 0]];
    cel(sk, g(cd), 4.5);
    for (let i = 0; i < 24; i++) stroke([[60 + i * 78, 1010], [52 + i * 78, 1080]], 2.4, ga(.05, .5));
  }

  // ---------- rain (per frame, only through the window glass) ----------
  function rainFx(t) {
    const { x: gx, y: gy, w: gw, h: gh } = GLASS;
    c.save(); c.beginPath(); c.rect(gx, gy, gw, gh); c.clip();
    // falling streaks: cartoon rain, slanted, on twos
    const tt = Math.floor(t * 12) / 12;
    c.strokeStyle = ga(.92, .55); c.lineCap = 'round';
    for (let i = 0; i < 110; i++) {
      const sp = 900 + hash(i * 1.7) * 500, len = 26 + hash(i * 2.3) * 34;
      const x = gx + ((hash(i * 3.1) * (gw + 200) - tt * sp * .22) % (gw + 200) + gw + 200) % (gw + 200) - 60;
      const y = gy + ((hash(i * 5.7) * (gh + 100) + tt * sp) % (gh + 100)) - 60;
      c.lineWidth = 1.6 + hash(i) * 1.6;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - len * .22, y + len); c.stroke();
    }
    // drops on the glass: fat cartoon teardrops that slide down, leaving a trail
    for (let i = 0; i < 22; i++) {
      const x0 = gx + 20 + hash(i * 9.1) * (gw - 40), per = 3 + hash(i * 4.4) * 4, ph = frac(t / per + hash(i * 2.2));
      const y = gy + 20 + (hash(i * 6.6) * .5 + ease(ph) * .7) * gh, r = 5 + hash(i * 8.8) * 5;
      if (Math.hypot(x0 - 470, y - 292) < 105) continue;
      c.strokeStyle = ga(.85, .3); c.lineWidth = r * .6; c.beginPath(); c.moveTo(x0, y - 20 - ph * 120); c.lineTo(x0, y - r); c.stroke();
      c.fillStyle = ga(.72, .55); c.beginPath(); c.moveTo(x0, y - r * 2.2); c.bezierCurveTo(x0 + r * .5, y - r * 1.2, x0 + r * 1.05, y - r * .4, x0 + r * 1.05, y + r * .15); c.bezierCurveTo(x0 + r * 1.05, y + r * 1.2, x0 - r * 1.05, y + r * 1.2, x0 - r * 1.05, y + r * .15); c.bezierCurveTo(x0 - r * 1.05, y - r * .4, x0 - r * .5, y - r * 1.2, x0, y - r * 2.2); c.fill();
      c.strokeStyle = ga(.05, .75); c.lineWidth = 2; c.stroke();
      c.fillStyle = ga(1, .95); c.beginPath(); c.arc(x0 - r * .4, y - r * .1, r * .3, 0, TAU); c.fill();
    }
    c.restore();
  }

  // ---------- union outline: stroke every blob fat, then fill them all (only the outer rim of ink survives) ----------
  function blobUnion(blobs, fill, lw) {
    const tracer = () => { c.beginPath(); for (const [bx, by, rx, ry] of blobs) { c.moveTo(bx + rx, by); c.ellipse(bx, by, rx, ry ?? rx, 0, 0, TAU); } };
    tracer(); c.lineWidth = lw * 2; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    tracer(); c.fillStyle = fill; c.fill();
    return tracer;
  }

  // ---------- the shoggoth: a sleepy rubber-hose cloud-critter ----------
  const SAGE = '#A2AE8A', SAGE_D = '#7E8A69', SAGE_L = '#C2CCAA';
  function shoggoth(t) {
    const x = 470, y = 770, br = Math.sin(t * TAU / 3.6);   // slow sleepy breathing
    c.save(); c.translate(x, 835); c.scale(1 + br * .018, 1 - br * .03); c.translate(-x, -835);
    // shadow on the cushion
    c.fillStyle = ga(.08, .35); c.beginPath(); c.ellipse(x + 20, 838, 230, 24, 0, 0, TAU); c.fill();
    // crooked horn limb flopped back over the couch arm, pointed tip
    hose([[x - 120, y - 10], [x - 180, y - 58], [x - 214, y - 70, .3], [x - 236, y - 118], [x - 262, y - 138]], 24, 3, SAGE, 5.5);
    // horn limb lying out along the seat, with a crooked kink
    hose([[x + 130, y + 30], [x + 200, y + 40, .3], [x + 236, y + 18], [x + 282, y + 30]], 22, 3, SAGE, 5.5);
    // the spiral limb: rises from the back and curls like a fiddlehead
    const sp = [[x + 62, y - 70], [x + 78, y - 130]];
    for (let i = 0; i <= 20; i++) { const u = i / 20, a = Math.PI + u * Math.PI * 1.8, r = 58 * (1 - u * .62); sp.push([x + 138 + Math.cos(a) * r, y - 172 + Math.sin(a) * r]); }
    hose(sp, 22, 5, SAGE, 5.5);
    // pointed little legs, tucked, poking out under the front
    for (const [lx, ang] of [[x - 84, .5], [x + 4, .12], [x + 96, -.35]]) {
      c.save(); c.translate(lx, y + 72); c.rotate(ang);
      cel([[-15, -12], [15, -12], [8, 18], [1, 38, 0], [-8, 18]], SAGE, 5.5);
      c.restore();
    }
    // body: a scalloped cloud lump (union of round bumps, one outline)
    const blobs = [[x, y + 26, 178, 58], [x - 150, y + 6, 42], [x - 118, y - 44, 50], [x - 60, y - 76, 55], [x + 6, y - 88, 58], [x + 72, y - 76, 54], [x + 128, y - 42, 50], [x + 158, y + 8, 42], [x - 40, y - 20, 90], [x + 50, y - 20, 90]];
    const tr = blobUnion(blobs, SAGE, 6);
    c.save(); tr(); c.clip();
    soft(x - 50, y - 70, 170, 1, .3);         // painted belly light
    soft(x + 40, y + 90, 200, .15, .4);        // underside shade
    for (const [sx, sy, r] of [[-120, -30, 11], [110, -70, 8], [135, 0, 13], [-50, -95, 7], [40, 42, 7], [-140, 30, 8]]) oval(x + sx, y + sy, r * 1.3, r, .3, SAGE_D);
    // a few inked scallop creases inside
    c.restore();
    // sleeping eyes: almond lids shut into contented curves, with lashes
    const shut = (ex, ey, r, rot = 0, lash = 3, sliver = 0) => {
      c.save(); c.translate(ex, ey); c.rotate(rot);
      const alm = [[-r, 0, .4], [-r * .3, -r * .72], [r * .35, -r * .7], [r, 0, .4], [r * .2, r * .5], [-r * .3, r * .48]];
      cel(alm, SAGE_L, Math.max(2.8, r * .13));
      const ly = r * .06;
      if (sliver > 0) {   // almost shut: a slit of pie-eye still peeking under the heavy lid
        c.save(); path(alm); c.clip();
        c.fillStyle = g(.98); c.fillRect(-r, -r, 2 * r, 2 * r);
        pieEye(r * .05, r * .34, r * .26, r * .36, 0, g(.98), -1, .8);
        c.fillStyle = SAGE_L; c.beginPath(); c.moveTo(-r * 1.1, r * .1); c.quadraticCurveTo(0, r * .2, r * 1.1, r * .04); c.lineTo(r * 1.1, -r); c.lineTo(-r * 1.1, -r); c.fill();
        c.restore();
        path(alm); inkIt(Math.max(2.8, r * .13));
        stroke([[-r * 1.02, r * .1], [0, r * .2], [r * 1.02, r * .04]], Math.max(3.2, r * .17));
        stroke([[r * .78, r * .06], [r * 1.02, r * .26]], Math.max(2.2, r * .1));
        c.restore(); return;
      }
      stroke([[-r * .96, ly - r * .02], [0, ly + r * .36], [r * .96, ly - r * .02]], Math.max(3.2, r * .17));
      stroke([[-r * .42, -r * .38], [-r * .12, -r * .5]], Math.max(2, r * .1), ga(1, .75));
      for (let i = 0; i < lash; i++) { const u = (i + 1) / (lash + 1), lx = lerp(-r * .75, r * .75, u), yy = ly + r * .36 * Math.sin(u * Math.PI) * .95; stroke([[lx, yy], [lx + (u - .5) * r * .45, yy + r * .34]], Math.max(2.2, r * .1)); }
      c.restore();
    };
    shut(x - 4, y - 16, 50, .03, 4);           // the big central eye
    shut(x - 96, y - 58, 25, .28, 3);
    shut(x + 88, y - 58, 27, -.22, 3, 1);     // this one is only *almost* shut
    shut(x + 18, y - 104, 15, .05, 2);
    shut(x + 132, y + 6, 17, -.3, 2);
    shut(x - 112, y + 12, 17, .1, 2);
    shut(x + 56, y + 40, 13, .1, 2);
    c.restore();
    // the little arm lying along the seat, the mask resting on it like a pillow
    hose([[x - 110, y + 44], [x - 170, y + 60], [x - 214, y + 50]], 16, 12, SAGE, 5.5);
    smileyMask(x - 226, y + 2, 52, -.38, { resting: true });
    // the arm's tip curls up over the mask's rim, holding it
    hose([[x - 186, y + 58], [x - 204, y + 50], [x - 214, y + 36], [x - 206, y + 28]], 11, 6, SAGE, 5);
  }

  // ---------- the smiley mask / the Assistant's head ----------
  // pale-yellow lopsided oval, two short vertical dash eyes, lopsided smile higher on the right
  const MASKC = '#EFE784', MASKD = '#C9C060';
  function smileyMask(x, y, r, rot = 0, o = {}) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const pts = [[-r * .1, -r * 1.02], [r * .62, -r * .86], [r * .95, -r * .2], [r * .86, r * .55], [r * .35, r * .98], [-r * .4, r * .95], [-r * .88, r * .45], [-r * .9, -r * .25], [-r * .6, -r * .82]];
    const lw = Math.max(4, r * .12);
    cel(pts, MASKC, lw);
    c.save(); path(pts); c.clip(); soft(-r * .6, r * .7, r * 1.1, .45, .3); soft(r * .15, -r * .55, r * .6, 1, .55); c.restore();
    path(pts); inkIt(lw);
    // dash eyes: thick vertical pills, each with a tiny pie-cut glint
    for (const [ex, ey] of [[-r * .34, -r * .2], [r * .3, -r * .26]]) {
      const eh = r * (o.content ? .16 : .2), ew = r * .085;
      c.fillStyle = INK; c.beginPath(); c.roundRect(ex - ew, ey - eh, ew * 2, eh * 2, ew); c.fill();
      c.fillStyle = MASKC; c.beginPath(); c.moveTo(ex + ew * .1, ey - eh * .45); c.lineTo(ex + ew * 1.3, ey - eh * 1.05); c.lineTo(ex + ew * 1.3, ey - eh * .25); c.fill();
    }
    // lopsided smile, higher on the right, with little rubber-hose dimples
    stroke([[-r * .5, r * .3], [-r * .22, r * .56], [r * .12, r * .54], [r * .44, r * .14]], Math.max(4, r * .13));
    stroke([[-r * .6, r * .22], [-r * .47, r * .34]], Math.max(3, r * .09));
    stroke([[r * .37, r * .06], [r * .51, r * .18]], Math.max(3, r * .09));
    if (o.blush) for (const [bx, by] of [[-r * .62, r * .1], [r * .6, r * .02]]) oval(bx, by, r * .14, r * .08, 0, 'rgba(214,120,110,.45)');
    c.restore();
  }

  // ---------- the laptop (chunky, rounded, a little squashy) ----------
  const LAP = { TL: [786, 606], a: [140, 42], b: [32, 196], d: [222, -20] };
  const add = (p, q, s = 1) => [p[0] + q[0] * s, p[1] + q[1] * s];
  function laptop() {
    const { TL, a, b, d } = LAP, TR = add(TL, a), BL = add(TL, b), BR = add(BL, a), FL = add(BL, d), FR = add(BR, d);
    const th = [0, 18];
    // deck: sides then top
    cel([BR, FR, add(FR, th), add(BR, th)].map(p => [p[0], p[1], .2]), g(.42), 5);
    cel([FL, FR, add(FR, th), add(FL, th)].map(p => [p[0], p[1], .2]), g(.5), 5);
    const deck = [BL, BR, FR, FL].map(p => [p[0], p[1], .25]);
    cel(deck, g(.72), 5);
    c.save(); path(deck, true); c.clip();
    c.transform(a[0] / 100, a[1] / 100, d[0] / 100, d[1] / 100, BL[0], BL[1]);
    for (let r = 0; r < 5; r++) for (let q = 0; q < 10; q++) { c.fillStyle = g(.45); c.beginPath(); c.roundRect(8 + q * 8.6, 8 + r * 9, 6.6, 6.8, 2.2); c.fill(); }
    c.fillStyle = g(.6); c.beginPath(); c.roundRect(32, 60, 36, 26, 4); c.fill();
    c.restore();
    // lid: a rounded slab, the back edge showing its thickness
    const bez = 13, lid = [add(TL, [-bez, -bez]), add(TR, [bez * .8, -bez * .5]), add(BR, [bez * .7, 5]), add(BL, [-bez * .7, 5])].map(p => [p[0], p[1], .25]);
    cel([add(lid[0], [-14, 8]), add(lid[1], [-12, 5]), add(lid[2], [-10, 0]), add(lid[3], [-12, 0])].map(p => [p[0], p[1], .25]), g(.28), 5);
    cel(lid, g(.4), 5);
    // screen: glowing, a few abstract lines (no text except the bar, which is hand-tinted after the print)
    const scr = [TL, TR, BR, BL].map(p => [p[0], p[1], .08]);
    cel(scr, g(1), 3.5);
    c.save(); path(scr, true); c.clip();
    c.transform(a[0] / 300, a[1] / 300, b[0] / 200, b[1] / 200, TL[0], TL[1]);
    c.fillStyle = g(.86); c.fillRect(0, 0, 300, 24);
    for (let i = 0; i < 6; i++) { c.fillStyle = g(.78); c.beginPath(); c.roundRect(22 + (i % 2) * 34, 42 + i * 17, 150 + hash(i) * 100 - (i % 2) * 34, 8, 4); c.fill(); }
    c.restore();
    contextBar();
  }
  // the hand-tinted context bar, drawn after the sepia print so it keeps its pink
  function contextBar() {
    const { TL, a, b } = LAP;
    c.save();
    c.transform(a[0] / 300, a[1] / 300, b[0] / 200, b[1] / 200, TL[0], TL[1]);
    c.font = '800 17px "Shantell Sans", sans-serif'; c.textBaseline = 'middle'; c.fillStyle = '#3b2c26';
    c.fillText('context 97%', 22, 158);
    c.fillStyle = 'rgba(70,50,45,.3)'; c.beginPath(); c.roundRect(22, 174, 256, 13, 6.5); c.fill();
    c.fillStyle = '#E2506C'; c.beginPath(); c.roundRect(22, 174, 256 * .97, 13, 6.5); c.fill();
    c.fillStyle = 'rgba(255,220,225,.6)'; c.beginPath(); c.roundRect(26, 176, 256 * .9, 3.5, 2); c.fill();
    c.strokeStyle = '#3a1a20'; c.lineWidth = 2.2; c.beginPath(); c.roundRect(22, 174, 256, 13, 6.5); c.stroke();
    c.restore();
  }

  // ---------- him: big round head, bean body, noodle arms, white gloves, bomber jacket ----------
  const HEAD = { x: 1160, y: 330, rot: -.12 };
  const SKIN = .97, HAIR = .06, JACK = .24, RIB = .8, PANTS = .09;
  function him(t) {
    const br = Math.sin(t * TAU / 4.2);
    // legs: black trouser noodles, knees poking toward the camera-left, lower legs down out of frame
    hose([[1160, 862], [1000, 866], [880, 880], [850, 930], [842, 1100]], 40, 36, g(PANTS + .05), 6);
    hose([[1250, 890], [1100, 915], [985, 925], [940, 968], [932, 1100]], 46, 42, g(PANTS), 6.5);
    stroke([[1180, 872], [1060, 886], [985, 892]], 6, ga(.75, .55));   // trouser shine
    stroke([[958, 950], [950, 1010]], 5, ga(.75, .4));
    // torso: a puffy bean of a bomber jacket, hunched a little toward the laptop
    c.save(); c.translate(1190, 870); c.scale(1, 1 + br * .008); c.translate(-1190, -870);
    const torso = [[1040, 560], [1100, 520], [1220, 512], [1305, 522], [1352, 565], [1372, 655], [1366, 765], [1334, 850], [1222, 880], [1100, 872], [1030, 832], [1002, 742], [1010, 636]];
    cel(torso, g(JACK), 6.5);
    c.save(); path(torso); c.clip();
    soft(1300, 640, 150, .7, .3);   // satin sheen
    stroke([[1318, 575], [1350, 650], [1352, 740]], 8, ga(.85, .55));      // classic white shine marks
    stroke([[1335, 770], [1328, 790]], 7, ga(.85, .55));
    soft(1030, 720, 200, .02, .35);
    // ribbed waistband
    const wb = [[1000, 812], [1190, 846], [1390, 816], [1390, 900], [990, 900]];
    cel(wb, g(RIB - .06), 5);
    for (let i = 0; i < 24; i++) { const u = i / 23, xx = lerp(1010, 1380, u), yy = 832 + Math.sin(u * Math.PI) * 18; stroke([[xx, yy], [xx - 2, yy + 50]], 2.2, ga(.25, .75)); }
    c.restore();
    path(torso); inkIt(6.5);
    // zipper seam, pocket welt, the little smiley pin
    stroke([[1150, 575], [1142, 700], [1128, 826]], 4.5);
    stroke([[1060, 770], [1082, 726]], 4.5);
    oval(1262, 648, 18, 18, 0, g(.95), 4.5);
    oval(1256, 643, 2.8, 4.6, 0, INK); oval(1268, 642, 2.8, 4.6, 0, INK);
    stroke([[1252, 654], [1262, 660], [1273, 650]], 3);
    c.restore();
    // collar: thick ribbed band round the neck, unzipped a little to show the dark shirt
    const col = [[1036, 540], [1085, 508], [1150, 500], [1240, 490], [1300, 468], [1340, 488], [1334, 540], [1252, 566], [1160, 582], [1084, 574]];
    cel(col, g(RIB), 6);
    c.save(); path(col); c.clip();
    for (let i = 0; i < 22; i++) { const u = i / 21, px = lerp(1040, 1336, u), py = lerp(528, 484, u) + Math.sin(u * Math.PI) * 44; stroke([[px, py - 36], [px + 2, py + 34]], 2.4, ga(.3, .75)); }
    c.fillStyle = g(.1); c.beginPath(); c.moveTo(1120, 496); c.quadraticCurveTo(1150, 540, 1158, 584); c.quadraticCurveTo(1180, 532, 1212, 488); c.fill();
    c.restore();
    path(col); inkIt(6);
    stroke([[1120, 498], [1150, 540], [1158, 582]], 4.5); stroke([[1158, 582], [1182, 532], [1212, 490]], 4.5);
    // far arm (his right): a thin sleeve noodle, no elbow, down to the keys
    hose([[1044, 578], [1004, 650], [1000, 730], [1040, 780], [1070, 790]], 21, 18, g(JACK - .02), 6);
    // the laptop sits on his lap
    laptop();
    cuff(1066, 792, Math.PI - .25, 19);
    glove(1048, 798, Math.PI - .12, 1.0, { curl: .75, thumbBack: true });
    // near arm (his left): the classic noodle swoop across his tummy
    hose([[1338, 584], [1378, 690], [1334, 804], [1236, 846], [1148, 838]], 22, 19, g(JACK + .03), 6);
    stroke([[1370, 700], [1352, 760]], 5, ga(.85, .5));
    cuff(1146, 838, Math.PI + .06, 20);
    glove(1126, 842, Math.PI - .16, 1.08, { curl: .75, flip: true, thumbBack: true });
    assistantBehind(t);
    head(t);
  }
  function cuff(x, y, ang, w) {
    c.save(); c.translate(x, y); c.rotate(ang);
    cel([[-13, -w - 3, .3], [13, -w - 4, .3], [17, 0], [13, w + 4, .3], [-13, w + 3, .3], [-17, 0]], g(RIB), 5);
    for (let i = -3; i <= 3; i++) stroke([[-11, i * w / 3.4], [12, i * w / 3.4 * 1.05]], 2.2, ga(.25, .75));
    c.restore();
  }

  function head(t) {
    const hx = HEAD.x, hy = HEAD.y, rot = HEAD.rot;
    c.save(); c.translate(hx, hy); c.rotate(rot);
    const skin = g(SKIN);
    // back hair mass (behind the face)
    const hairBack = [[-140, -80], [-126, -140], [-70, -190], [10, -206], [90, -190], [140, -150], [176, -96], [184, -30], [172, 36], [150, 96], [116, 122], [96, 70], [80, -10]];
    cel(hairBack, g(HAIR), 7);
    // the face: a big round skull with a soft muzzle, facing left
    const face = [[-130, -92], [-60, -128], [30, -130], [95, -88], [128, -5], [135, 70], [108, 130], [45, 170], [-40, 178], [-105, 160], [-142, 118], [-156, 60], [-160, 0], [-152, -52]];
    cel(face, skin, 7);
    c.save(); path(face); c.clip();
    soft(100, 100, 130, .55, .5);    // shade at the back of the jaw (away from the screen)
    soft(-150, 90, 150, 1, .6);      // screen light on the muzzle
    c.restore(); path(face); inkIt(7);
    // ear (near side)
    cel([[88, -12], [122, -38], [154, -24], [160, 22], [144, 62], [106, 68], [92, 44]], skin, 6.5);
    stroke([[114, -2], [138, -10], [144, 18], [128, 38], [112, 32]], 3.8);
    // hair: messy top with pointed bangs flopping onto the forehead, spikes out the back, sideburn to the ear
    const hair = [
      [-156, -100, 0], [-150, -132], [-118, -170], [-54, -200], [16, -210], [84, -196], [132, -168], [178, -176, 0], [162, -134], [194, -100, 0], [166, -70], [186, -30, 0], [158, -6],
      [118, -60, .4], [96, -40, .3], [88, 8, 0],                                     // sideburn down in front of the ear
      [80, -54], [62, -104], [46, -98, 0], [24, -128], [0, -110, 0], [-24, -136], [-54, -114, 0], [-80, -140], [-108, -118, 0], [-130, -136]];
    cel(hair, g(HAIR), 7);
    // gloss: the classic white shine arcs on black hair
    brush([[-96, -164], [-58, -182], [-18, -188]], 3.5, 2.5, g(.85), 5);
    brush([[4, -190], [30, -188]], 4, 2.5, g(.85));
    brush([[-116, -142], [-104, -152]], 3.5, 2.5, g(.85));
    // cowlick: a springy curl sticking up from the crown
    brush([[40, -200], [34, -240], [58, -272], [94, -272], [106, -246], [88, -230], [72, -242]], 13, 4, INK);
    brush([[76, -196], [98, -224], [124, -228]], 8, 3, INK);
    // eyes: tall black pie-cut ovals under heavy, sad lids, looking down at the screen
    const eye = (ex, ey, rx, ry, lidA, lidB, sag) => {
      pieEye(ex, ey, rx, ry, .08, skin, -.3, .95, .05);
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx + 1, ry + 1, .08, 0, TAU); c.clip();
      c.fillStyle = skin; c.beginPath(); c.moveTo(ex - rx - 6, ey - ry - 6); c.lineTo(ex + rx + 6, ey - ry - 6); c.lineTo(ex + rx + 6, ey + lidB); c.quadraticCurveTo(ex, ey + (lidA + lidB) / 2 + sag, ex - rx - 6, ey + lidA); c.closePath(); c.fill();
      c.restore();
      // lid line: arched, clipped to the eye, heavier at the inner corner
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx + 3.5, ry + 3.5, .08, 0, TAU); c.clip();
      c.beginPath(); c.moveTo(ex - rx - 6, ey + lidA); c.quadraticCurveTo(ex, ey + (lidA + lidB) / 2 + sag, ex + rx + 6, ey + lidB); inkIt(6.5);
      c.restore();
    };
    // near eye (inner corner on the left): lid droops to the outer corner
    eye(-34, 14, 21, 35, -26, -6, -7);
    // far eye (inner corner on the right), squashed by the turn of the head
    eye(-118, 12, 13, 30, -6, -24, -6);
    // glasses: big round rims; the far lens pokes past the brow line
    oval(-32, 4, 55, 55, 0, null, 7.5);
    oval(-120, 2, 34, 50, 0, null, 7);
    stroke([[-88, -12], [-80, -22], [-72, -16]], 6.5);    // bridge
    stroke([[22, -14], [94, -8]], 6.5);                   // temple arm to the ear
    // lens glints (the screen light): short slashes, top-left of each lens
    stroke([[-70, -24], [-60, -38]], 4.5, g(1)); stroke([[-62, -16], [-56, -26]], 3.5, g(1));
    stroke([[-144, -26], [-138, -38]], 4, g(1));
    // brows: thick, tapered, inner ends lifted (worried)
    brush([[-84, -88], [-52, -80], [-16, -62]], 7.5, 3.5, INK, 8);
    brush([[-162, -56], [-140, -66], [-110, -86]], 3.5, 7, INK);
    stroke([[-100, -96], [-96, -86]], 3, ga(.1, .6)); stroke([[-90, -102], [-88, -93]], 3, ga(.1, .6));   // worry ticks
    // nose: a round button, poking out past the face on the left
    const nose = [[-140, 44], [-162, 34], [-184, 44], [-190, 64], [-174, 80], [-150, 80], [-138, 64]];
    cel(nose, skin, 6.5);
    oval(-170, 50, 6, 4, -.4, g(1));
    // mouth: a small closed half-smile, lopsided up on the near side, with a cheek dimple
    stroke([[-146, 122], [-118, 132], [-86, 130], [-64, 114]], 6);
    stroke([[-70, 102], [-58, 118]], 4.5);
    stroke([[-116, 148], [-100, 150]], 3.8);     // lower-lip tick
    // one tear welling on the lower lid, not yet fallen
    c.beginPath(); c.moveTo(-8, 42); c.bezierCurveTo(-3, 50, 2, 55, 2, 60); c.bezierCurveTo(2, 67, -14, 67, -14, 60); c.bezierCurveTo(-14, 55, -11, 50, -8, 42); c.fillStyle = g(1); c.fill(); inkIt(3);
    oval(-9, 58, 2.4, 3, 0, g(.6));
    c.restore();
  }

  // ---------- the Assistant: a tiny rubber-hose smiley fellow, snuggled on his shoulder ----------
  const hp = (lx, ly) => { const cs = Math.cos(HEAD.rot), sn = Math.sin(HEAD.rot); return [HEAD.x + lx * cs - ly * sn, HEAD.y + lx * sn + ly * cs]; };
  const AS = { x: 1326, y: 512 };   // where it perches, on the ribbed collar at his near shoulder
  // its far arm goes round the back of his neck: drawn before his head so the jaw hides the hand
  function assistantBehind(t) {
    const Y = MASKC, sx = AS.x, sy = AS.y + Math.sin(t * TAU / 4.2 + .6) * 1.2;
    const [nx, ny] = hp(70, 150);
    hose([[sx - 20, sy - 44], [sx - 50, sy - 58], [nx + 20, ny - 4], [nx - 10, ny - 10]], 7, 6.5, Y, 4.5);
  }
  function assistant(t) {
    const bob = Math.sin(t * TAU / 4.2 + .6) * 1.2, Y = MASKC;
    const sx = AS.x, sy = AS.y + bob;
    // legs dangle down the front of his jacket, big round shoes
    hose([[sx - 8, sy], [sx - 12, sy + 44], [sx - 16, sy + 82]], 8.5, 7.5, Y, 4.5);
    hose([[sx + 16, sy + 2], [sx + 20, sy + 46], [sx + 18, sy + 86]], 8.5, 7.5, Y, 4.5);
    for (const [fx, fy, r] of [[sx - 24, sy + 92, -.25], [sx + 14, sy + 96, .05]]) { oval(fx, fy, 19, 12, r, g(.08), 4); oval(fx - 7, fy - 5, 5, 2.6, r - .2, g(.85)); }
    // pear body, leaning right in to him
    c.save(); c.translate(sx, sy); c.rotate(-.42);
    const body = [[-20, -58], [10, -64], [30, -36], [30, -4], [4, 8], [-24, 2], [-30, -28]];
    cel(body, Y, 5);
    c.save(); path(body); c.clip(); soft(28, 0, 44, .45, .35); c.restore(); path(body); inkIt(5);
    c.restore();
    // the head: pressed cheek-to-cheek against his jaw, squashed a touch where it touches
    const [mx, my] = hp(132, 96);
    c.save(); c.translate(mx, my); c.rotate(-.55); c.scale(.88, 1.03);
    smileyMask(0, 0, 41, 0, { blush: true, content: true });
    c.restore();
    // near arm: a little glove clutching the edge of his collar
    hose([[sx - 2, sy - 40], [sx - 26, sy - 22], [sx - 50, sy - 26]], 7, 6.5, Y, 4.5);
    glove(sx - 50, sy - 26, Math.PI + .5, .54, { curl: .85, lw: 4.5, flip: true });
  }

  // ---------- film print: sepia duotone, grain, dust, scratches, flickery vignette ----------
  function makeGrain() {
    GRAINS = [];
    for (let k = 0; k < 6; k++) {
      const cv = mkCanvas(640, 360), x2 = cv.getContext('2d'), id = x2.createImageData(640, 360), r = lcg(1234 + k * 77);
      for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 90; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      x2.putImageData(id, 0, 0); GRAINS.push(cv);
    }
  }
  function filmPrint(t, wx = 0, wy = 0) {
    const f = Math.floor(t * 24), fl = hash(f * 1.31);
    // sepia duotone: multiply by warm paper, lift the blacks to a deep brown
    c.globalCompositeOperation = 'multiply'; c.fillStyle = '#F6E3BE'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'screen'; c.fillStyle = '#23160D'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
    c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .28; c.drawImage(c.canvas, 0, 0); c.restore();
    // cool spill of the screen on his face, warm pool of the lamp
    c.save(); c.globalCompositeOperation = 'soft-light';
    const lg = c.createRadialGradient(930, 620, 20, 960, 560, 640); lg.addColorStop(0, 'rgba(190,220,255,.7)'); lg.addColorStop(.5, 'rgba(190,220,255,.3)'); lg.addColorStop(1, 'rgba(190,220,255,0)'); c.fillStyle = lg; c.fillRect(0, 0, W, H);
    c.restore();
    // exposure flicker
    c.fillStyle = `rgba(0,0,0,${.02 + .05 * fl})`; c.fillRect(0, 0, W, H);
    // grain
    c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .32;
    const gi = GRAINS[f % GRAINS.length], ox = Math.floor(hash(f * 3.7) * 200), oy = Math.floor(hash(f * 5.1) * 100);
    c.drawImage(gi, -ox, -oy, W + 400, H + 220);
    c.restore();
    // dust specks + hairs (a fresh handful each frame)
    for (let i = 0; i < 9; i++) {
      const hx = hash(f * 7.3 + i * 1.9) * W, hy = hash(f * 3.1 + i * 4.3) * H, s = 1 + hash(f + i * 9.7) * 3.5, light = hash(f * 2 + i) < .35;
      c.fillStyle = light ? 'rgba(250,240,220,.7)' : 'rgba(15,10,8,.75)';
      if (i < 8) { c.beginPath(); c.ellipse(hx, hy, s, s * (.6 + hash(i + f) * .8), hash(i * f), 0, TAU); c.fill(); }
      else { c.strokeStyle = c.fillStyle; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx, hy); c.bezierCurveTo(hx + 20, hy - 14, hx + 10, hy + 24, hx + 36 * hash(f + i), hy + 30); c.stroke(); }
    }
    // vertical scratches
    for (let i = 0; i < 2; i++) {
      if (hash(f * 1.7 + i * 11) < .55) {
        const sx = hash(Math.floor(t * 6) * 3.3 + i * 5) * W + Math.sin(t * 40 + i) * 3;
        c.strokeStyle = hash(i + f) < .5 ? 'rgba(250,240,220,.35)' : 'rgba(20,12,8,.35)'; c.lineWidth = 1.2 + hash(f + i) * 1.5;
        c.beginPath(); c.moveTo(sx, 0); c.lineTo(sx + 6, H); c.stroke();
      }
    }
    // flickery vignette (heavy, like an old projector gate)
    const vk = .78 + .12 * hash(f * 2.9);
    const vg = c.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * 1.02);
    vg.addColorStop(0, 'rgba(20,12,6,0)'); vg.addColorStop(.6, `rgba(20,12,6,${.35 * vk})`); vg.addColorStop(1, `rgba(12,7,4,${.95 * vk})`);
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
  }

  // ---------- the frame ----------
  function frame(t) {
    style(0); FX.noAuto = true; FX.grain = 0; FX.bloom = 0; FX.scan = 0;
    c = X;
    if (!BACK) { BACK = layer(paintBack); FRONT = layer(paintFront); makeGrain(); }
    // gate weave: the whole print drifts a pixel or two
    const f = Math.floor(t * 24), wx = (hash(f * .7) - .5) * 3, wy = (hash(f * 1.3) - .5) * 3;
    c.save(); c.translate(wx, wy);
    c.drawImage(BACK, 0, 0);
    rainFx(t);
    c.drawImage(FRONT, 0, 0);
    // the lamp throws his shadow forward onto the couch back; the screen lights a pool round the laptop
    c.save(); c.beginPath(); c.rect(0, 540, W, 540); c.clip();
    soft(930, 700, 300, .02, .45, 'source-over', .9);
    c.restore();
    shoggoth(t);
    him(t);
    assistant(t);
    // screen glow: a cool bloom spilling onto his hands, his chin and the couch
    soft(930, 700, 330, 1, .22, 'screen');
    soft(1080, 420, 220, 1, .08, 'screen');
    c.restore();
    filmPrint(t, wx, wy);
  }

  chapter('rubberhose', K, K + 1, [[K, (t) => frame(t)]]);
})();
