// chibi.js: style study, slot K = 6. Chibi / kawaii (super-deformed cute).
// ~2 heads tall, giant round head with huge sparkly eyes set low, tiny mouth, blush ovals, rounded everything,
// thick soft coloured outlines, soft pastel shading, sparkles / hearts / rain ticks, a simplified cute room.
(() => {
  const K = 6;

  // ---------- tiny drawing kit (Path2D based: fill, soft clipped shade, outline) ----------
  const boxOf = pts => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; };
  const ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); const r = Math.max(rx, ry); p.box = [x - r, y - r, x + r, y + r]; return p; };
  const rr = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); p.box = [x, y, x + w, y + h]; return p; };
  // smooth Catmull-Rom spline through points; a third value per point scales its tangent (0 = sharp corner)
  function spline(pts, closed = true, ten = 1) {
    const p = new Path2D(), n = pts.length, g = i => closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    const tg = i => { const c = g(i), s = c[2] ?? 1, a = g(i - 1), b = g(i + 1); return [(b[0] - a[0]) * .5 * ten * s, (b[1] - a[1]) * .5 * ten * s]; };
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < (closed ? n : n - 1); i++) { const a = g(i), b = g(i + 1), ta = tg(i), tb = tg(i + 1); p.bezierCurveTo(a[0] + ta[0] / 3, a[1] + ta[1] / 3, b[0] - tb[0] / 3, b[1] - tb[1] / 3, b[0], b[1]); }
    if (closed) p.closePath();
    p.box = boxOf(pts); return p;
  }
  function fillP(p, col, a = 1, comp) { X.save(); if (comp) X.globalCompositeOperation = comp; X.globalAlpha = a; X.fillStyle = col; X.fill(p); X.restore(); }
  function strokeP(p, col, w, a = 1) { X.save(); X.globalAlpha = a; X.strokeStyle = col; X.lineWidth = w; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(p); X.restore(); }
  function clipDo(p, fn) { X.save(); X.clip(p); fn(); X.restore(); }
  function blurP(p, col, b, a = 1, comp) { X.save(); if (comp) X.globalCompositeOperation = comp; X.filter = `blur(${b}px)`; X.globalAlpha = a; X.fillStyle = col; X.fill(p); X.restore(); }
  // soft inner band on the (dx, dy) side of p: the part of p that p shifted by (-dx, -dy) doesn't cover, blurred, clipped to p
  function band(p, dx, dy, col, b = 8, a = 1, comp) {
    const bx = p.box || [0, 0, W, H];
    clipDo(p, () => {
      const q = new Path2D(); q.rect(bx[0] - 120, bx[1] - 120, bx[2] - bx[0] + 240, bx[3] - bx[1] + 240); q.addPath(p, new DOMMatrix([1, 0, 0, 1, -dx, -dy]));
      if (comp) X.globalCompositeOperation = comp; X.filter = `blur(${b}px)`; X.globalAlpha = a; X.fillStyle = col; X.fill(q, 'evenodd');
    });
  }
  // one soft-shaded part: o.fill, o.shade/o.hi/o.rim = [dx, dy, col, blur, alpha], o.line, o.lw
  function part(p, o) {
    if (o.fill) fillP(p, o.fill, o.alpha ?? 1);
    for (const k of ['shade', 'shade2', 'hi', 'rim']) if (o[k]) { const [dx, dy, c, b, a, comp] = o[k]; band(p, dx, dy, c, b ?? 8, a ?? 1, comp); }
    if (o.line) strokeP(p, o.line, o.lw ?? 6);
  }
  function glowR(x, y, r, col, a, comp = 'screen') { const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(.45, rgba(col, a * .4)); g.addColorStop(1, rgba(col, 0)); X.save(); X.globalCompositeOperation = comp; X.fillStyle = g; X.fillRect(x - r, y - r, 2 * r, 2 * r); X.restore(); }
  function sparkleP(x, y, r, k = .16) { const p = new Path2D(); p.moveTo(x, y - r); p.quadraticCurveTo(x + r * k, y - r * k, x + r, y); p.quadraticCurveTo(x + r * k, y + r * k, x, y + r); p.quadraticCurveTo(x - r * k, y + r * k, x - r, y); p.quadraticCurveTo(x - r * k, y - r * k, x, y - r); p.closePath(); p.box = [x - r, y - r, x + r, y + r]; return p; }
  function heartP(x, y, s) { const p = new Path2D(); p.moveTo(x, y + s * .95); p.bezierCurveTo(x - s * 1.35, y - s * .05, x - s * .75, y - s * 1.15, x, y - s * .42); p.bezierCurveTo(x + s * .75, y - s * 1.15, x + s * 1.35, y - s * .05, x, y + s * .95); p.closePath(); p.box = [x - s * 1.3, y - s * 1.2, x + s * 1.3, y + s]; return p; }
  function dropP(x, y, s) { const p = new Path2D(); p.moveTo(x, y - s * 1.7); p.bezierCurveTo(x + s * .35, y - s * .9, x + s, y - s * .35, x + s, y + s * .25); p.arc(x, y + s * .25, s, 0, Math.PI); p.bezierCurveTo(x - s, y - s * .35, x - s * .35, y - s * .9, x, y - s * 1.7); p.closePath(); p.box = [x - s, y - s * 1.7, x + s, y + s * 1.3]; return p; }
  // cloud-scalloped blob (clouds, the shoggoth's body): bumps flatten where sin(angle) > flat (the underside)
  function scallopP(cx, cy, rx, ry, n, bump, flat = .55, ph = 0, var_ = 0) {
    const p = new Path2D(), P = i => { const a = ph + i / n * TAU, v = 1 + var_ * (hash(i * 3.1 + 7) - .5); return [cx + Math.cos(a) * rx * v, cy + Math.sin(a) * ry * v]; };
    const s = P(0); p.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) {
      const b = P(i + 1), am = ph + (i + .5) / n * TAU, bh = Math.sin(am) > flat ? bump * .12 : bump * (1 + var_ * (hash(i * 5.3) - .5));
      p.quadraticCurveTo(cx + Math.cos(am) * (rx + bh * 2.2), cy + Math.sin(am) * (ry + bh * 2.2), b[0], b[1]);
    }
    p.closePath(); p.box = [cx - rx - bump * 2, cy - ry - bump * 2, cx + rx + bump * 2, cy + ry + bump * 2]; return p;
  }
  function ribs(p, ang, gap, col, w = 2.5, a = .8) {
    const bx = p.box, cx = (bx[0] + bx[2]) / 2, cy = (bx[1] + bx[3]) / 2, R = Math.hypot(bx[2] - bx[0], bx[3] - bx[1]) / 2 + 10, c = Math.cos(ang), s = Math.sin(ang);
    clipDo(p, () => { X.strokeStyle = col; X.lineWidth = w; X.globalAlpha = a; X.lineCap = 'round'; X.beginPath(); for (let d = -R; d <= R; d += gap) { const x = cx - s * d, y = cy + c * d; X.moveTo(x - c * R, y - s * R); X.lineTo(x + c * R, y + s * R); } X.stroke(); });
  }
  const limb = (sp, ws) => spline(limbPts(sp, ws, 6));

  // ---------- palette: blue-hour pastels ----------
  const INK = '#4A3350';
  const SK = { fill: '#FFE6DA', shade: '#F1B9C2', line: '#A0606E', blush: '#FF8DAE' };
  const HR = { fill: '#443B64', shade: '#2C2546', hi: '#7E72BC', hi2: '#B3A9EC', line: '#221A36' };
  const JK = { fill: '#6D63C8', shade: '#4C43A2', hi: '#9990EA', line: '#2F2778' };
  const RB = { fill: '#FFA66C', shade: '#E07E48', line: '#9A4C2C', rib: '#D06A38' };
  const YL = { fill: '#F5FA83', shade: '#D6DC5E', hi: '#FFFFD2', line: '#7E6C3A', ink: '#3A301E' };
  const GR = { fill: '#99B087', shade: '#76906A', hi: '#C3D8AE', line: '#39462F', lid: '#86A075', ink: '#28331F' };
  const CO = { fill: '#D99CBC', shade: '#B67A9E', hi: '#EFC3D6', line: '#74406A', seat: '#E3AAC5' };

  // ---------- the smiley mask (the Assistant's head / the shoggoth's mask / the pin) ----------
  function smiley(x, y, r, rot, o = {}) {
    X.save(); X.translate(x, y); X.rotate(rot);
    const p = spline(maskShape(r)); p.box = [-r * 1.1, -r * 1.2, r * 1.1, r * 1.2];
    part(p, { fill: YL.fill, shade: [r * .16, r * .14, YL.shade, r * .12, .95], hi: [-r * .12, -r * .14, YL.hi, r * .1, .9], line: o.line || YL.line, lw: o.lw ?? Math.max(2.5, r * .1) });
    if (o.blush) for (const [bx, by] of [[-.58, .12], [.62, .06]]) blurP(ell(bx * r, by * r, r * .17, r * .09), SK.blush, r * .04, .55 * o.blush);
    const ew = Math.max(2.2, r * .1);
    for (const [ex, ey] of [[-.4, -.3], [.33, -.32]]) strokeP(spline([[ex * r - r * .01, ey * r - r * .12], [ex * r + r * .01, ey * r + r * .12]], false), YL.ink, ew);
    strokeP(spline([[-.44 * r, .28 * r], [-.2 * r, .5 * r], [.08 * r, .48 * r], [.38 * r, .14 * r]], false), YL.ink, ew * .95);
    X.restore();
  }

  // ---------- room ----------
  const WX = 100, WY = 64, WW = 890, WH = 520;
  function wall() {
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#57538F'); g.addColorStop(.5, '#7770B0'); g.addColorStop(1, '#9486BC');
    X.fillStyle = g; X.fillRect(0, 0, W, H);
    for (let r = 0; r < 13; r++) for (let c = 0; c <= 24; c++) {
      const x = c * 84 + (r % 2) * 42, y = 30 + r * 54;
      fillP((r + c) % 3 === 0 ? sparkleP(x, y, 8) : ell(x, y, 3.2, 3.2), '#FFFFFF', .07);
    }
  }
  function stringLights(t) {
    const hooks = [[-40, 18], [470, 14], [960, 22], [1450, 12], [1960, 20]], cols = ['#FFE58A', '#FFAFCB', '#B2F0DA', '#CDB6FF'], wire = [];
    for (let h = 0; h < hooks.length - 1; h++) { const [x0, y0] = hooks[h], [x1, y1] = hooks[h + 1]; for (let i = 0; i < 20; i++) { const k = i / 20; wire.push([lerp(x0, x1, k), lerp(y0, y1, k) + Math.sin(k * Math.PI) * 44]); } }
    wire.push(hooks[hooks.length - 1]);
    strokeP(spline(wire, false), '#3A3264', 3);
    for (let i = 2; i < wire.length; i += 4) {
      const [x, y] = wire[i], c = cols[(i >> 2) % 4], tw = .8 + .2 * Math.sin(t * 2.2 + i);
      glowR(x, y + 16, 70, c, .42 * tw);
      fillP(rr(x - 5, y - 2, 10, 9, 2), '#3A3264');
      const b = ell(x, y + 17, 9, 11); fillP(b, c); strokeP(b, mixCol(c, '#3A3264', .45), 2.5);
      fillP(ell(x - 3, y + 13, 2.5, 4), '#FFFFFF', .9);
    }
  }
  function cityLayer(x0, x1, base, hMin, hMax, col, winCol, seed, winA) {
    let x = x0 - 30, i = 0;
    while (x < x1) {
      const w = 64 + hash(seed + i * 3.1) * 64, h = hMin + hash(seed + i * 7.3) * (hMax - hMin), kind = hash(seed + i * 1.7);
      let p;
      if (kind < .22) { p = new Path2D(); p.moveTo(x, base + 20); p.lineTo(x, base - h + w / 2); p.arc(x + w / 2, base - h + w / 2, w / 2, Math.PI, 0); p.lineTo(x + w, base + 20); p.closePath(); }
      else p = rr(x, base - h, w, h + 30, [18, 18, 0, 0]);
      fillP(p, col); strokeP(p, mixCol(col, '#221E55', .45), 3);
      const cols = Math.max(1, Math.floor((w - 18) / 18)), rows = Math.floor((h - (kind < .22 ? w / 2 : 0) - 26) / 24), ox = x + (w - cols * 18) / 2 + 4;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const hv = hash(seed * 3 + i * 17 + r * 5.1 + c * 11.3);
        if (hv < .42) fillP(rr(ox + c * 18, base - h + (kind < .22 ? w / 2 : 0) + 18 + r * 24, 9, 11, 3), hv < .08 ? '#FFC4DA' : winCol, winA);
      }
      if (kind > .82) { strokeP(spline([[x + w / 2, base - h], [x + w / 2, base - h - 26]], false), mixCol(col, '#221E55', .45), 3); fillP(ell(x + w / 2, base - h - 30, 6, 6), '#FF9EC0'); glowR(x + w / 2, base - h - 30, 26, '#FF9EC0', .5); }
      x += w + 10 + hash(seed + i) * 14; i++;
    }
  }
  function outside(t, gx, gy, gw, gh) {
    const g = X.createLinearGradient(0, gy, 0, gy + gh); g.addColorStop(0, '#252D6C'); g.addColorStop(.48, '#3F4598'); g.addColorStop(.8, '#7B6BB8'); g.addColorStop(1, '#C893C3');
    X.fillStyle = g; X.fillRect(gx, gy, gw, gh);
    for (let i = 0; i < 24; i++) { const x = gx + hash(i * 3.7 + 1) * gw, y = gy + hash(i * 5.1 + 2) * gh * .48, r = 3 + hash(i * 2.3) * 7, tw = .6 + .4 * Math.sin(t * 2 + i); fillP(i % 3 ? ell(x, y, r * .32, r * .32) : sparkleP(x, y, r), '#FFF6D8', .75 * tw); }
    // the moon, with soft halo rings
    const mx = gx + 196, my = gy + 128, mr = 66;
    for (const [k, a] of [[2.5, .05], [1.9, .07], [1.45, .1]]) fillP(ell(mx, my, mr * k, mr * k), '#FFF0C8', a);
    const moonP = ell(mx, my, mr, mr);
    part(moonP, { fill: '#FFF4D0', shade: [16, 12, '#F0D395', 9, .95], hi: [-8, -10, '#FFFFF4', 6, .8], line: '#D8AC6E', lw: 4.5 });
    for (const [cx, cy, cr] of [[-22, -16, 13], [24, 14, 9], [-4, 30, 7]]) fillP(ell(mx + cx, my + cy, cr, cr * .85), '#F3DEA4', .75);
    // a puffy little cloud across the moon's foot
    const cl = scallopP(mx + 48, my + 58, 92, 22, 9, 11, .5, .3);
    part(cl, { fill: '#8C84CA', shade: [0, 8, '#6E67B2', 5, .9], hi: [0, -6, '#ABA4E0', 4, .9], line: '#5F58A4', lw: 3.5 });
    const cl2 = scallopP(gx + gw - 170, gy + 92, 70, 16, 7, 9, .5, .1);
    part(cl2, { fill: '#6E6CB6', shade: [0, 6, '#5A58A2', 4, .9], hi: [0, -5, '#8D8ACF', 4, .9], line: '#4F4C98', lw: 3 });
    // city: back layer, rainy bokeh, front layer
    const base = gy + gh + 6;
    cityLayer(gx, gx + gw, base, 150, 260, '#6966AE', '#FFE7A8', 11, .5);
    for (let i = 0; i < 16; i++) { const x = gx + hash(i * 9.1 + 4) * gw, y = gy + gh * (.6 + hash(i * 4.3) * .35), r = 12 + hash(i * 2.9) * 20; fillP(ell(x, y, r, r), ['#FFD9A0', '#FFB6D2', '#B9ECFF'][i % 3], .16, 'screen'); strokeP(ell(x, y, r, r), '#FFFFFF', 1.5, .12); }
    cityLayer(gx, gx + gw, base, 80, 175, '#4A478D', '#FFE39A', 29, .9);
    glowR(gx + gw / 2, base, gw * .6, '#FFB4D0', .12);
    // rain: short soft tick marks
    X.save(); X.strokeStyle = '#DDE7FF'; X.lineCap = 'round'; X.lineWidth = 3.4;
    for (let i = 0; i < 64; i++) {
      const sp = 360 + hash(i * 1.3) * 160, x0 = gx + hash(i * 3.3) * (gw + 60), y = gy + ((hash(i * 7.9) * (gh + 40) + t * sp) % (gh + 40)) - 20, x = x0 - (y - gy) * .1;
      X.globalAlpha = .4 + hash(i) * .35; X.beginPath(); X.moveTo(x, y); X.lineTo(x - 3.5, y + 15 + hash(i * 2) * 6); X.stroke();
    }
    X.restore();
    // drops and trails on the glass
    for (let i = 0; i < 20; i++) {
      const x = gx + 20 + hash(i * 4.1 + 7) * (gw - 40), y = gy + 24 + hash(i * 6.7 + 3) * (gh - 60), s = 4.5 + hash(i * 1.1) * 5;
      if (hash(i * 9) < .45) strokeP(spline([[x, y - s * 1.4], [x + 1.5, y - s * 1.4 - 18 - hash(i) * 40]], false), '#E8EEFF', 2, .35);
      const d = dropP(x, y, s); fillP(d, '#DCE6FF', .32); strokeP(d, '#FFFFFF', 1.6, .55); fillP(ell(x - s * .32, y + s * .15, s * .22, s * .32), '#FFFFFF', .85);
    }
    // glass shine
    X.save(); X.translate(gx + gw * .78, gy + gh * .3); X.rotate(.6); fillP(rr(-10, -140, 22, 280, 11), '#FFFFFF', .08); fillP(rr(22, -110, 9, 220, 5), '#FFFFFF', .08); X.restore();
  }
  function windowScene(t) {
    const gx = WX + 24, gy = WY + 24, gw = WW - 48, gh = WH - 48, glass = rr(gx, gy, gw, gh, 28);
    clipDo(glass, () => outside(t, gx, gy, gw, gh));
    const FR = '#E4D6EE', FRL = '#4E4383';
    const fr = new Path2D(); fr.roundRect(WX, WY, WW, WH, 48); fr.roundRect(gx, gy, gw, gh, 28);
    X.fillStyle = FR; X.fill(fr, 'evenodd');
    strokeP(rr(WX, WY, WW, WH, 48), FRL, 5); strokeP(glass, FRL, 4);
    // cross mullions
    const mx = gx + gw * .5, my = gy + gh * .47, v = rr(mx - 9, gy - 2, 18, gh + 4, 7), h = rr(gx - 2, my - 8, gw + 4, 16, 7);
    fillP(v, FR); strokeP(v, FRL, 3.5); fillP(h, FR); strokeP(h, FRL, 3.5); fillP(rr(mx - 7, my - 6, 14, 12, 3), FR);
    // sill
    const sill = rr(WX - 26, WY + WH - 10, WW + 52, 28, 13);
    part(sill, { fill: '#EADDF3', shade: [0, 8, '#C8B6DE', 5], line: FRL, lw: 4.5 });
    // a little succulent on the sill
    const px = WX + 80, py = WY + WH - 10;
    for (const [lx, ly, lr, a] of [[-18, -40, 16, -.5], [18, -42, 15, .5], [0, -52, 17, 0]]) { const lf = ell(px + lx, py + ly, lr * .72, lr, a); part(lf, { fill: '#A6DDB6', shade: [4, 4, '#7FBE95', 3], line: '#3F7A5A', lw: 3.5 }); }
    const pot = spline([[px - 34, py - 34, .3], [px + 34, py - 34, .3], [px + 26, py, .4], [px - 26, py, .4]]);
    part(pot, { fill: '#F7A9A2', shade: [8, 0, '#DE8A88', 5], line: '#944E58', lw: 4 });
    fillP(heartP(px, py - 17, 7), '#FFFFFF', .8);
  }
  function curtains() {
    const CL = { fill: '#F4B7CC', shade: '#D18DAE', hi: '#FFD6E4', line: '#83486E' };
    const side = (x0, dir) => {
      const p = spline([[x0, 62, .4], [x0 + 118 * dir, 62, .4], [x0 + 118 * dir, 250], [x0 + 70 * dir, 356, .5], [x0 + 126 * dir, 470], [x0 + 142 * dir, 606, .4], [x0 - 12 * dir, 610, .4], [x0 + 6 * dir, 470], [x0 + 26 * dir, 356, .5], [x0, 250]]);
      part(p, { fill: CL.fill, shade: [18 * dir, 0, CL.shade, 10, .9], hi: [-12 * dir, 0, CL.hi, 8, .7], line: CL.line, lw: 5 });
      for (const k of [.35, .7]) strokeP(spline([[x0 + 118 * dir * k, 90], [x0 + 60 * dir + 30 * dir * (k - .5), 340], [x0 + 100 * dir * k + 20 * dir, 600]], false), CL.shade, 3, .8);
      // bow
      const bx = x0 + 50 * dir, by = 356;
      for (const s of [-1, 1]) { const w = spline([[bx, by], [bx + 30 * s, by - 20], [bx + 36 * s, by + 8], [bx + 8 * s, by + 6]]); part(w, { fill: '#FFE7A2', shade: [0, 5, '#EDC76E', 3], line: '#9A7038', lw: 3.5 }); }
      part(ell(bx, by, 9, 9), { fill: '#FFE7A2', line: '#9A7038', lw: 3.5 });
    };
    side(WX - 50, 1); side(WX + WW + 50, -1);
    // scalloped valance with polka dots
    const x0 = WX - 60, x1 = WX + WW + 60, y0 = 36, y1 = 92, p = new Path2D(), n = 20, sw = (x1 - x0) / n;
    p.moveTo(x0, y0); p.lineTo(x1, y0); p.lineTo(x1, y1);
    for (let i = n; i > 0; i--) p.quadraticCurveTo(x0 + (i - .5) * sw, y1 + 38, x0 + (i - 1) * sw, y1);
    p.closePath(); p.box = [x0, y0, x1, y1 + 30];
    part(p, { fill: '#F7C4D6', shade: [0, 12, '#DA9ABA', 6, .8], line: CL.line, lw: 5 });
    clipDo(p, () => { for (let i = 0; i < 44; i++) fillP(ell(x0 + 18 + i * 23 + (i % 2) * 4, y0 + 22 + (i % 2) * 22, 4.5, 4.5), '#FFFFFF', .7); });
    part(rr(x0 - 20, y0 - 12, x1 - x0 + 40, 14, 7), { fill: '#B7A6D8', line: '#4E4383', lw: 3.5 });
  }
  function lamp(t) {
    const x = 1720, y = 300;
    glowR(x, y + 60, 720, '#FFC389', .5);
    glowR(x, y + 40, 260, '#FFE2B0', .45);
    part(rr(x - 8, y + 50, 16, 700, 8), { fill: '#C4B2E0', shade: [5, 0, '#9C88C4', 3], line: '#4E4383', lw: 4 });
    const sh = spline([[x - 124, y + 58, .3], [x - 104, y - 16], [x - 46, y - 74], [x + 46, y - 74], [x + 104, y - 16], [x + 124, y + 58, .3], [x, y + 72]]);
    const g = X.createLinearGradient(0, y - 74, 0, y + 72); g.addColorStop(0, '#FFE9C8'); g.addColorStop(1, '#FFCB8C');
    part(sh, { fill: g, shade: [18, 6, '#F4B176', 12, .8], hi: [-10, -10, '#FFF6E2', 8, .9], line: '#B07656', lw: 5 });
    // scalloped trim
    for (let i = 0; i < 9; i++) { const tx = x - 108 + i * 27; const b = new Path2D(); b.arc(tx, y + 62 + Math.sin((i / 8) * Math.PI) * 10, 13, 0, Math.PI); b.closePath(); b.box = [tx - 13, y + 60, tx + 13, y + 90]; part(b, { fill: '#FFB5A6', line: '#B07656', lw: 3.5 }); }
    strokeP(spline([[x + 58, y + 78], [x + 58, y + 124]], false), '#8E6A7E', 2.5);
    part(heartP(x + 58, y + 134, 10), { fill: '#FF9DBB', line: '#B24E78', lw: 3 });
  }
  function wallArt() {
    // a round frame with a doodled crescent and stars
    const x = 1520, y = 188, r = 64;
    part(ell(x, y, r + 14, r + 14), { fill: '#F2E6D8', shade: [6, 8, '#D6C3B6', 5], line: '#6E4F76', lw: 5 });
    const inner = ell(x, y, r, r); fillP(inner, '#3E4590');
    clipDo(inner, () => { const c = new Path2D(); c.arc(x - 6, y + 2, 32, 0, TAU); c.arc(x + 10, y - 8, 28, 0, TAU, true); fillP(c, '#FFE9A6'); fillP(sparkleP(x + 30, y + 24, 11), '#FFFFFF', .9); fillP(sparkleP(x + 24, y - 34, 7), '#FFFFFF', .9); });
    strokeP(inner, '#6E4F76', 3.5);
  }
  function couchBack() {
    part(rr(30, 560, 1860, 520, 90), { fill: CO.fill, shade: [0, 26, CO.shade, 14, .9], line: CO.line, lw: 6 });
    const c1 = spline([[196, 606], [420, 588], [650, 592], [836, 612], [852, 720], [846, 900], [520, 912], [206, 900], [188, 720]]);
    const c2 = spline([[870, 598], [1160, 578], [1460, 582], [1692, 604], [1708, 712], [1702, 900], [1290, 912], [880, 900], [864, 712]]);
    for (const c of [c1, c2]) part(c, { fill: CO.fill, shade: [14, 22, CO.shade, 14, .95], hi: [-8, -14, CO.hi, 10, .85], line: CO.line, lw: 6 });
    for (const [bx, by] of [[520, 700], [1290, 690]]) { part(ell(bx, by, 11, 9), { fill: CO.shade, line: CO.line, lw: 3 }); for (const a of [0, 1.6, 3.3, 4.8]) strokeP(spline([[bx + Math.cos(a) * 14, by + Math.sin(a) * 12], [bx + Math.cos(a) * 34, by + Math.sin(a) * 26]], false), CO.shade, 3, .8); }
  }
  function couchSeat() {
    const top = spline([[210, 890, .5], [960, 872], [1712, 890, .5], [1716, 962, .5], [960, 972], [206, 962, .5]]);
    part(top, { fill: CO.seat, shade: [0, 14, CO.shade, 8, .7], hi: [0, -8, '#FFE0EA', 6, .8], line: CO.line, lw: 6 });
    strokeP(spline([[958, 878], [962, 968]], false), CO.line, 4, .7);
  }
  function couchFront() {
    const fr = spline([[200, 950, .4], [960, 962], [1722, 950, .4], [1730, 1100, 0], [190, 1100, 0]]);
    part(fr, { fill: CO.fill, shade: [0, 40, CO.shade, 20, .8], hi: [0, -10, CO.hi, 6, .7], line: CO.line, lw: 6 });
    strokeP(spline([[960, 966], [962, 1090]], false), CO.line, 4, .7);
  }
  function couchArms() {
    for (const [x0, dir] of [[18, 1], [1902, -1]]) {
      const a = spline([[x0, 1100, 0], [x0 - 4 * dir, 760], [x0 + 40 * dir, 690], [x0 + 130 * dir, 668], [x0 + 222 * dir, 694], [x0 + 250 * dir, 770], [x0 + 246 * dir, 1100, 0]]);
      part(a, { fill: CO.fill, shade: [26 * dir, 18, CO.shade, 14, .9], hi: [-12 * dir, -14, CO.hi, 10, .9], line: CO.line, lw: 6 });
      // roll swirl on the arm front
      strokeP(spline([[x0 + 60 * dir, 760], [x0 + 120 * dir, 720], [x0 + 190 * dir, 740], [x0 + 196 * dir, 790], [x0 + 150 * dir, 800]], false), CO.shade, 4, .8);
    }
  }

  function props(t) {
    // a heart pillow propped on the right cushion
    X.save(); X.translate(1548, 800); X.rotate(.16);
    const hp = heartP(0, 0, 92); hp.box = [-130, -110, 130, 90];
    part(hp, { fill: '#C9B6F0', shade: [16, 14, '#A391D6', 12, .95], hi: [-10, -12, '#E6DBFF', 8, .9], line: '#5E4E9E', lw: 6 });
    X.save(); X.setLineDash([10, 9]); strokeP(heartP(0, 4, 74), '#8F7DD0', 3, .8); X.restore();
    fillP(heartP(0, -4, 22), '#FFB3C9', .9);
    X.restore();
    // a mug on the couch arm, still steaming
    const mx = 1790, my = 648;
    for (let i = 0; i < 2; i++) { const ph = t * 1.2 + i * 1.7, sp = []; for (let k = 0; k <= 6; k++) sp.push([mx - 10 + i * 20 + Math.sin(ph + k * .9) * 7, my - 44 - k * 13]); strokeP(spline(sp, false), '#FFFFFF', 4, .35); }
    const hd = new Path2D(); hd.ellipse(mx + 34, my + 6, 16, 18, 0, -1.4, 1.4); strokeP(hd, '#4E7F74', 13); strokeP(hd, '#BDEBDD', 6);
    const mug = rr(mx - 34, my - 34, 68, 70, 16);
    part(mug, { fill: '#BDEBDD', shade: [10, 4, '#92CDBC', 6], hi: [-6, -4, '#E4FFF6', 4, .9], line: '#4E7F74', lw: 5 });
    fillP(ell(mx, my - 32, 30, 7), '#8A5A4A'); strokeP(ell(mx, my - 32, 30, 7), '#4E7F74', 3);
    fillP(heartP(mx, my + 4, 11), '#FF9DBB');
  }

  // ---------- the shoggoth, chibi: a sleepy sage cloud-mochi ----------
  function almond(x, y, w, rot, open, lashes = 2) {
    X.save(); X.translate(x, y); X.rotate(rot);
    const h = w * .46, al = new Path2D(); al.moveTo(-w / 2, 0); al.quadraticCurveTo(0, -h * 1.05, w / 2, 0); al.quadraticCurveTo(0, h * 1.05, -w / 2, 0); al.closePath(); al.box = [-w / 2, -h, w / 2, h];
    fillP(al, GR.lid);
    band(al, 0, -h * .35, '#9FB88E', 3, .8);
    if (open > 0) clipDo(al, () => { fillP(ell(0, h * .42, w * .36, h * open * 1.5), '#FBFFF2'); fillP(ell(-w * .04, h * .44, w * .1, h * open * 1.1), '#223019'); });
    strokeP(al, GR.line, Math.max(3, w * .085));
    const lw = Math.max(3.5, w * .1);
    const lid = new Path2D(); lid.moveTo(-w * .44, h * .04); lid.quadraticCurveTo(0, h * (open > 0 ? .35 : .62), w * .44, h * .04);
    strokeP(lid, GR.ink, lw);
    for (let i = 0; i < lashes; i++) { const k = .62 + i * .22, lx = w * .44 * k, ly = h * (.04 + (1 - k * k) * .55); strokeP(spline([[lx, ly], [lx + w * .1, ly + h * .32]], false), GR.ink, lw * .7); }
    X.restore();
  }
  function shoggoth(t) {
    const sx = 566, sy = 790, breathe = Math.sin(t * 1.3) * .016;
    blurP(ell(sx - 20, sy + 112, 230, 22), '#6A3060', 12, .35);
    X.save(); X.translate(sx, sy); X.scale(1 + breathe * .5, 1 - breathe);
    // pointed little legs, tucked under
    for (const [bx, by, tx, ty] of [[-78, 90, -100, 124], [-4, 100, -18, 132], [70, 92, 60, 124]]) {
      const lg = spline([[bx - 22, by - 6], [tx + 4, ty - 8, .7], [tx - 2, ty + 1, 0], [tx + 12, ty - 3, .7], [bx + 22, by + 2]]);
      part(lg, { fill: GR.lid, shade: [6, 4, GR.shade, 4], line: GR.line, lw: 6 });
    }
    // crooked horn-limbs; the middle one curls into a spiral
    const hornA = limb([[-70, -88], [-96, -134], [-70, -166], [-100, -206]], [27, 21, 17, 12]);
    const sp = [[54, -92], [64, -140], [92, -172]], hc = [72, -204];
    for (let i = 1; i <= 18; i++) { const k = i / 18, a = .78 - k * 1.25 * TAU, r = 34 * (1 - k * .7); sp.push([hc[0] + Math.cos(a) * r, hc[1] + Math.sin(a) * r]); }
    const hornB = limb(sp, sp.map((_, i) => lerp(26, 7, Math.pow(i / (sp.length - 1), .8))));
    const hornC = limb([[134, -54], [166, -78], [190, -76], [204, -100], [198, -120]], [20, 16, 13, 11, 9]);
    for (const hp of [hornA, hornB, hornC]) part(hp, { fill: GR.fill, shade: [8, 6, GR.shade, 5, .9], hi: [-5, -5, GR.hi, 4, .8], line: GR.line, lw: 6 });
    // the body: a round, puffy cloud-mochi
    const body = scallopP(0, 0, 162, 116, 11, 14, .5, -.1, .12);
    const g = X.createLinearGradient(-120, -110, 120, 110); g.addColorStop(0, '#AFC69B'); g.addColorStop(.55, GR.fill); g.addColorStop(1, '#8AA37A');
    part(body, { fill: g, shade: [22, 18, GR.shade, 14, .9], hi: [-14, -16, GR.hi, 9, .85], line: GR.line, lw: 7.5 });
    blurP(ell(-78, -66, 40, 15, -.45), '#FFFFFF', 5, .35); fillP(ell(-96, -60, 8, 5, -.45), '#FFFFFF', .6);
    // eyes: one big central eye and a ring of almond eyes, all asleep (two barely open)
    for (const [ex, ey, ew, er, eo] of [[-104, -44, 38, -.25, 0], [100, -50, 38, .2, .16], [-30, -84, 31, -.1, 0], [44, -86, 31, .12, 0], [128, 10, 30, .35, 0], [-128, 14, 28, -.35, .15]]) almond(ex, ey, ew, er, eo, 2);
    almond(-2, 6, 96, 0, 0, 3);
    for (const bx of [-62, 60]) { blurP(ell(bx, 44, 22, 11), SK.blush, 4, .6); for (let i = 0; i < 2; i++) strokeP(spline([[bx - 8 + i * 12, 50], [bx - 2 + i * 12, 38]], false), '#E86C90', 2.8, .7); }
    // the little arm lying on the seat, cradling the mask like a pillow
    const arm = limb([[-120, 60], [-176, 88], [-224, 94]], [28, 24, 20]);
    part(arm, { fill: GR.fill, shade: [4, 10, GR.shade, 6, .9], hi: [0, -6, GR.hi, 4, .7], line: GR.line, lw: 6 });
    smiley(-180, 48, 50, -.32, { blush: .7, lw: 5 });
    const hand = spline([[-232, 84], [-246, 58, .6], [-230, 46, .6], [-214, 70]]);
    part(hand, { fill: GR.fill, shade: [3, 4, GR.shade, 3], line: GR.line, lw: 5 });
    X.restore();
    // sleep bubble
    const bx = sx - 150, by = sy - 160, br = 25 + Math.sin(t * 1.3) * 3;
    fillP(ell(bx, by, br, br), '#E6F4FF', .22); strokeP(ell(bx, by, br, br), '#FFFFFF', 3, .75);
    strokeP(spline([[bx - br * .55, by - br * .2], [bx - br * .35, by - br * .55], [bx - br * .05, by - br * .68]], false), '#FFFFFF', 3, .9);
    for (const [dx, dy, r] of [[26, 32, 9], [42, 52, 5]]) strokeP(ell(bx + dx, by + dy, r, r), '#FFFFFF', 2.5, .7);
  }

  // ---------- him: the chibi researcher ----------
  const HC = [1188, 372], TILT = -.06;
  function lowerLegs() {
    for (const [kx, ky, fx, fy, dk] of [[858, 942, 842, 1030, 1], [912, 956, 912, 1044, 0]]) {
      const shin = limb([[kx, ky], [(kx + fx) / 2, (ky + fy) / 2], [fx, fy]], [34, 30, 28]);
      part(shin, { fill: dk ? '#3E3766' : '#4C4476', shade: [12, 0, '#312B55', 6, .9], line: '#221C3E', lw: 6 });
      const shoe = spline([[fx - 50, fy + 18], [fx - 44, fy - 12], [fx + 6, fy - 20], [fx + 34, fy - 6], [fx + 32, fy + 22], [fx - 20, fy + 30]]);
      part(shoe, { fill: dk ? '#DCD2EE' : '#F3ECFA', shade: [8, 8, '#C4B4E0', 5, .9], line: '#4E4383', lw: 5 });
      strokeP(spline([[fx - 50, fy + 16], [fx - 10, fy + 26], [fx + 32, fy + 18]], false), '#C9B3E8', 5, .9);
      fillP(heartP(fx - 10, fy + 2, 6), '#FF9DBB', .9);
    }
  }
  function torso() {
    fillP(rr(1090, 540, 110, 110, 30), SK.shade);   // neck, just in case of gaps
    const body = spline([[1084, 598], [1044, 628], [1022, 690], [1014, 780], [1020, 856], [1100, 880], [1230, 886], [1330, 876], [1364, 840], [1370, 760], [1358, 680], [1322, 632], [1262, 604], [1180, 594]]);
    part(body, { fill: JK.fill, shade: [30, 14, JK.shade, 16, .95], hi: [-20, -6, JK.hi, 12, .7], rim: [10, 0, '#FFB18E', 5, .45], line: JK.line, lw: 7 });
    // puffy seam lines
    strokeP(spline([[1062, 700], [1076, 760], [1068, 820]], false), JK.shade, 4, .8);
    // dark shirt in the open front
    const shirt = spline([[1098, 604, 0], [1184, 604, 0], [1166, 690], [1152, 862, 0], [1106, 862, 0], [1112, 690]]);
    part(shirt, { fill: '#3A3256', shade: [0, 18, '#28223E', 8, .8], line: JK.line, lw: 5 });
    // waistband
    const wb = spline([[1016, 836, .3], [1190, 850], [1368, 836, .3], [1370, 872, .3], [1190, 900], [1020, 882, .3]]);
    part(wb, { fill: RB.fill, shade: [0, 10, RB.shade, 6, .9], line: RB.line, lw: 6 }); ribs(wb, Math.PI / 2, 13, RB.rib, 2.5, .7);
    // collar halves (orange ribbing)
    const cL = spline([[1066, 594], [1104, 610], [1134, 652], [1116, 664], [1080, 634], [1052, 606]]);
    const cR = spline([[1156, 656], [1200, 616], [1266, 596], [1290, 610], [1222, 646], [1176, 672]]);
    for (const [c, a] of [[cL, 2.2], [cR, 1.0]]) { part(c, { fill: RB.fill, shade: [0, 8, RB.shade, 5, .9], line: RB.line, lw: 5 }); ribs(c, a, 10, RB.rib, 2.2, .7); }
    // welt pocket and the yellow smiley pin
        glowR(1246, 702, 40, '#FFF6A0', .35);
    smiley(1246, 702, 21, .12, { lw: 3.5 });
    fillP(sparkleP(1266, 680, 9), '#FFFFFF', .95);
  }
  function thighs() {
    const th = spline([[1352, 866], [1320, 934], [1180, 966], [1010, 984], [900, 990], [848, 968], [854, 930], [930, 908], [1110, 886], [1250, 870]]);
    part(th, { fill: '#4C4476', shade: [0, 16, '#322C57', 10, .95], hi: [0, -10, '#6A62A2', 6, .6], line: '#221C3E', lw: 6 });
    strokeP(spline([[880, 940], [906, 964], [900, 986]], false), '#322C57', 3.5, .8);
  }
  function kawaiiEye(cx, cy, rx, ry, side, tear) {
    // sad lids: the inner end is lifted, the outer end droops; the lid is lowered because he's looking down
    const lidY = cy - ry * .36, xa = cx - rx * 1.12, xb = cx + rx * 1.12, inner = side > 0 ? -.16 : .2, outer = side > 0 ? .2 : -.16;
    const ya = lidY + ry * (side > 0 ? inner : outer), yb = lidY + ry * (side > 0 ? outer : inner), qx = cx - side * rx * .3, qy = lidY - ry * .34;
    const Q = k => [(1 - k) * (1 - k) * xa + 2 * (1 - k) * k * qx + k * k * xb, (1 - k) * (1 - k) * ya + 2 * (1 - k) * k * qy + k * k * yb];
    const eyeE = ell(cx, cy, rx, ry), lid = new Path2D();
    lid.moveTo(xa, ya); lid.quadraticCurveTo(qx, qy, xb, yb); lid.lineTo(xb, cy + ry * 1.3); lid.lineTo(xa, cy + ry * 1.3); lid.closePath();
    X.save(); X.clip(eyeE); X.clip(lid);
    fillP(eyeE, '#FFFFFF');
    const ix = cx - rx * .1, iy = cy + ry * .16, irx = rx * .9, iry = ry * .94;
    const g = X.createLinearGradient(0, iy - iry, 0, iy + iry); g.addColorStop(0, '#1E163A'); g.addColorStop(.4, '#382D80'); g.addColorStop(.74, '#6C7CD2'); g.addColorStop(1, '#B8F2FA');
    const iris = ell(ix, iy, irx, iry); fillP(iris, g); strokeP(iris, '#1C1434', 3, .8);
    fillP(ell(ix, iy - iry * .04, irx * .42, iry * .46), '#130D26', .92);
    for (let i = 0; i < 7; i++) { const a = .5 + i * .32, fx = ix + Math.cos(a) * irx * .66, fy = iy + Math.sin(a) * iry * .66; fillP(ell(fx, fy, irx * .05, iry * .05), '#CFF4FF', .7); }
    blurP(ell(qx, lidY - ry * .08, rx * 1.4, ry * .42), '#221838', 6, .6);
    // brimming: a wavy wet band along the bottom
    const wv = new Path2D(); wv.moveTo(cx - rx * 1.2, cy + ry * .6); for (let i = 0; i <= 10; i++) wv.lineTo(cx - rx * 1.2 + i / 10 * rx * 2.4, cy + ry * (.58 + .05 * Math.sin(i * 1.7 + T * 3)));
    wv.lineTo(cx + rx * 1.2, cy + ry * 1.3); wv.lineTo(cx - rx * 1.2, cy + ry * 1.3); wv.closePath();
    fillP(wv, '#D6F6FF', .55);
    strokeP(spline([[cx - rx * .8, cy + ry * .66], [cx, cy + ry * .6], [cx + rx * .8, cy + ry * .66]], false), '#FFFFFF', 2.5, .7);
    // highlights: a big soft oval, a small round one, a four-point twinkle
    fillP(ell(ix - irx * .36, iy - iry * .2, irx * .36, iry * .3, -.35), '#FFFFFF');
    fillP(ell(ix + irx * .38, iy + iry * .36, irx * .15, irx * .15), '#FFFFFF', .95);
    fillP(sparkleP(ix + irx * .4, iy - iry * .16, irx * .22), '#FFFFFF', .95);
    X.restore();
    // lash line (thick) with a soft downward outer flick
    const lpts = []; for (let i = 0; i <= 10; i++) lpts.push(Q(.05 + i / 10 * .9));
    strokeP(spline(lpts, false), '#231935', 10);
    const out = side > 0 ? Q(.95) : Q(.05), od = side;
    const flick = spline([[out[0] - od * 12, out[1] - 5], [out[0] + od * 13, out[1] + 4, 0], [out[0] - od * 2, out[1] + 7]]);
    fillP(flick, '#231935'); strokeP(flick, '#231935', 3);
    // lower lid: a glossy wet rim and a short lash line
    const a0 = side > 0 ? .15 : Math.PI - .95, a1 = side > 0 ? .95 : Math.PI - .15, ll = new Path2D(); ll.ellipse(cx, cy, rx * 1.02, ry * 1.02, 0, a0, a1);
    strokeP(ll, '#7A4E6A', 3.5, .85);
    const wet = new Path2D(); wet.ellipse(cx, cy + 3, rx * 1.0, ry * 1.0, 0, .35, Math.PI - .35); strokeP(wet, '#BDEBFF', 3, .7);
    if (tear) {
      const ta = side > 0 ? .7 : Math.PI - .7, tx = cx + Math.cos(ta) * rx * 1.02, ty = cy + Math.sin(ta) * ry * 1.02 + 6, s = tear;
      const td = dropP(tx, ty + s * 1.1, s); fillP(td, '#E2F8FF', .96); strokeP(td, '#78B3DC', 2.5); fillP(ell(tx - s * .3, ty + s * 1.2, s * .22, s * .34), '#FFFFFF');
    }
  }
  function head(t) {
    X.save(); X.translate(HC[0], HC[1]); X.rotate(TILT);
    // the big cowlick, springing up from the crown (behind the hair mass)
    const cw = spline([[0, -266], [-16, -334], [20, -400], [104, -424, 0], [62, -390], [44, -338], [66, -264]]);
    part(cw, { fill: HR.fill, shade: [10, 0, HR.shade, 6, .9], hi: [-6, -5, HR.hi, 4, .8], line: HR.line, lw: 7 });
    // back hair: one big round mass with a few messy tufts
    const back = spline([[176, 196, 0], [214, 150], [262, 176, 0], [262, 110], [304, 84, 0], [290, 10], [318, -56, 0], [282, -132], [226, -220], [126, -276], [0, -294], [-128, -278], [-222, -222], [-270, -150], [-302, -132, 0], [-280, -92], [-282, -20], [-150, 60], [0, 90], [120, 150]]);
    part(back, { fill: HR.fill, shade: [34, 24, HR.shade, 16, .95], rim: [9, 2, '#FFB08A', 4, .55], line: HR.line, lw: 7 });
    // ear
    const ear = spline([[160, 24], [198, 18], [218, 62], [202, 112], [164, 116]]);
    part(ear, { fill: SK.fill, shade: [8, 6, SK.shade, 5], line: SK.line, lw: 5 });
    strokeP(spline([[176, 46], [200, 60], [190, 92]], false), SK.line, 3.5, .8);
    // face: round and chubby, with soft full cheeks and a tiny rounded chin
    const face = spline([[-40, -206], [-176, -168], [-236, -60], [-246, 46], [-236, 128], [-200, 188], [-138, 222], [-70, 230], [8, 222], [86, 192], [148, 140], [188, 60], [200, -40], [164, -150], [70, -206]]);
    part(face, { fill: SK.fill, shade: [30, 14, SK.shade, 18, .85], line: SK.line, lw: 6.5 });
    clipDo(face, () => { blurP(ell(-210, 170, 140, 110), '#D4F6FF', 34, .22, 'screen'); });
    band(face, -12, 12, '#BDEFFF', 9, .45, 'screen');
    // bangs: soft clumps with pointed tips swept toward screen-left; they stop above the brows
    // fringe clumps: notch, tip, notch, ... ; each clump has a concave left edge and a bulging right edge, tips swept left
    const nodes = [[-212, -72], [-192, -30], [-160, -118], [-134, -34], [-100, -120], [-70, -30], [-34, -120], [0, -42], [34, -120], [70, -52], [104, -114], [146, -30]], edge = [];
    nodes.forEach((a, i) => {
      edge.push([a[0], a[1], i % 2 ? 0 : .6]);
      if (i < nodes.length - 1) { const b = nodes[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), k = (i % 2 ? .15 : -.09) * L; edge.push([(a[0] + b[0]) / 2 - dy / L * k, (a[1] + b[1]) / 2 + dx / L * k]); }
    });
    const bangPts = [[-274, -84], [-286, 20], [-262, 128, 0], [-240, 70], [-226, 20], ...edge, [184, -10, .5], [200, -170], [60, -256], [-120, -246], [-250, -166]];
    const bangs = spline(bangPts);
    clipDo(face, () => { X.save(); X.translate(4, 18); blurP(bangs, '#E29BB4', 8, .6); X.restore(); });
    // blush
    blurP(ell(58, 154, 44, 19), SK.blush, 5, .6); blurP(ell(-200, 146, 26, 16), SK.blush, 5, .5);
    for (const [bx, by, n] of [[32, 154, 3], [-210, 146, 2]]) for (let i = 0; i < n; i++) strokeP(spline([[bx + i * 17, by + 8], [bx + i * 17 + 8, by - 7]], false), '#F2708F', 3, .8);
    // nose + tiny mouth (a small, lopsided, wobbly half-smile)
    strokeP(spline([[-106, 118], [-112, 128], [-102, 132]], false), '#D88F8C', 3.5);
    strokeP(spline([[-115, 180], [-103, 183], [-91, 181], [-80, 172]], false), '#8B4658', 4.5);
    // eyes (the near one brims over with a tiny tear)
    kawaiiEye(6, 54, 53, 67, 1, 8.5);
    kawaiiEye(-163, 51, 39, 62, -1, 0);
    // bangs over the forehead
    fillP(bangs, HR.fill);
    band(bangs, 0, -30, HR.shade, 12, .6);
    band(bangs, -6, 6, '#8FC8E6', 4, .35);
    strokeP(spline(bangPts.slice(0, bangPts.length - 4), false), HR.line, 7);
    // hair shine: a soft crescent band with a zigzag lower edge
    const sh = []; const a0 = -2.5, a1 = -1.1, n = 12;
    for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); sh.push([Math.cos(a) * 222, Math.sin(a) * 212 + 14, i === 0 || i === n ? 0 : 1]); }
    for (let i = n; i >= 0; i--) { const a = lerp(a0, a1, i / n), r = i % 2 ? 196 : 206, e = Math.sin(i / n * Math.PI); sh.push([Math.cos(a) * lerp(218, r, e), Math.sin(a) * lerp(208, r * .97, e) + 14, 0]); }
    fillP(spline(sh), HR.hi, .55);
    const sh2 = []; for (let i = 3; i <= n - 3; i++) { const a = lerp(a0, a1, i / n); sh2.push([Math.cos(a) * 214, Math.sin(a) * 205 + 14]); }
    strokeP(spline(sh2, false), HR.hi2, 3.5, .7);
    // strand lines
    for (const s of [[[-70, -150], [-92, -122]], [[30, -150], [30, -128]], [[140, -150], [112, -120]], [[-180, -150], [-178, -120]]]) strokeP(spline(s, false), HR.shade, 4, .9);
    // worried brows (inner ends lifted), on the skin just above the glasses
    const brN = spline([[-30, -66], [0, -60], [30, -48], [54, -32]], false), brF = spline([[-122, -64], [-148, -58], [-174, -46], [-200, -30]], false);
    for (const b of [brN, brF]) { strokeP(b, SK.fill, 15, .9); strokeP(b, '#3A2A4E', 7); }
    // round glasses
    const gN = ell(6, 56, 87, 85), gF = ell(-165, 54, 60, 83);
    for (const [p, cx, cy, rx, ry] of [[gN, 6, 56, 87, 85], [gF, -165, 54, 60, 83]]) {
      fillP(p, '#CFF3FF', .1);
      clipDo(p, () => { X.save(); X.translate(cx + rx * .52, cy - ry * .52); X.rotate(.7); fillP(rr(-7, -30, 14, 60, 7), '#FFFFFF', .5); fillP(rr(12, -18, 6, 36, 3), '#FFFFFF', .45); X.restore(); });
    }
    strokeP(gN, '#3A2C55', 6.5); strokeP(gF, '#3A2C55', 6);
    strokeP(spline([[-81, 44], [-94, 32], [-105, 40]], false), '#3A2C55', 5.5);
    strokeP(spline([[93, 44], [140, 36], [176, 40]], false), '#3A2C55', 5.5);
    X.restore();
  }

  // ---------- laptop: lid facing him, cheated a little toward camera so the screen reads ----------
  function laptop(t) {
    const phi = .62, pc = Math.cos(.36), ps = Math.sin(.36), beta = 1.3;
    const a = [-Math.sin(phi), 0, Math.cos(phi)], d = [Math.cos(phi), 0, Math.sin(phi)], L = [-d[0] * Math.cos(beta), Math.sin(beta), -d[2] * Math.cos(beta)];
    const S = v => [v[0], -v[1] * pc + v[2] * ps], O = [932, 872], HW = 140, D = 180, LH = 178, TH = 13;
    const add = (...vs) => vs.reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]), mul = (v, k) => [v[0] * k, v[1] * k];
    const Sa = S(a), Sd = S(d), Su = S([0, 1, 0]), SL = S(L);
    const at = (u, v, h) => add(O, mul(Sa, u), mul(Sd, v), mul(Su, h));
    const frame = (o, ex, ey) => X.transform(ex[0], ex[1], ey[0], ey[1], o[0], o[1]);
    // light from the screen onto everything nearby
    const lidMid = add(O, mul(SL, LH * .5));
    glowR(lidMid[0] + 60, lidMid[1] - 40, 400, '#BDF3FF', .2);
    // lid (screen side), drawn in lid-local coords: x → display right, y → down
    X.save(); frame(add(O, mul(Sa, HW), mul(SL, LH)), mul(Sa, -1), mul(SL, -1));
    part(rr(0, 0, 2 * HW, LH, 18), { fill: '#CFC7EC', line: '#51468C', lw: 6 });
    const scr = rr(14, 14, 2 * HW - 28, LH - 36, 10);
    const sg = X.createLinearGradient(0, 14, 0, LH - 22); sg.addColorStop(0, '#F3FAFF'); sg.addColorStop(1, '#D6E8FF');
    fillP(scr, sg);
    clipDo(scr, () => {
      const bub = (x, y, w, c) => { part(rr(x, y, w, 24, 12), { fill: c, line: '#B8C6EE', lw: 2 }); for (let i = 0; i < 2; i++) fillP(rr(x + 12, y + 7 + i * 7, (w - 30) * (i ? .6 : 1), 4, 2), '#A9B4DA', .8); };
      bub(24, 22, 140, '#FFFFFF'); bub(110, 52, 136, '#E3DAFF'); bub(24, 82, 112, '#FFFFFF');
      fillP(heartP(152, 94, 6), '#FF9DBB');
      X.font = '700 16px Rajdhani'; X.textBaseline = 'middle'; X.fillStyle = '#D93A63'; X.fillText('context 97%', 24, 127);
      part(rr(118, 120, 124, 13, 6.5), { fill: '#FAD3DE', line: '#E7A1B6', lw: 1.5 });
      fillP(rr(118, 120, 120, 13, 6.5), '#FF4E78');
      fillP(rr(122, 122, 108, 4, 2), '#FFFFFF', .5);
    });
    strokeP(scr, '#51468C', 3);
    fillP(ell(HW, 7.5, 3, 3), '#51468C');
    X.restore();
    // base: side, front and top (keyboard deck)
    X.save(); frame(at(HW, 0, TH), Sd, mul(Su, -1)); part(rr(0, 0, D, TH, 5), { fill: '#A99FD6', line: '#51468C', lw: 4 }); X.restore();
    X.save(); frame(at(HW, D, TH), mul(Sa, -1), mul(Su, -1)); part(rr(0, 0, 2 * HW, TH, 5), { fill: '#B7AEE0', line: '#51468C', lw: 4 }); X.restore();
    X.save(); frame(at(HW, 0, TH), mul(Sa, -1), Sd);
    part(rr(0, 0, 2 * HW, D, 16), { fill: '#DAD3F4', line: '#51468C', lw: 5 });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 11; c++) fillP(rr(22 + c * 21.8, 14 + r * 18, 17, 13, 4), '#BDB3E6');
    part(rr(HW - 46, 112, 92, 52, 10), { fill: '#CFC7EE', line: '#9A8FD0', lw: 2.5 });
    X.restore();
    return { top: [at(HW, 0, 0), add(at(HW, 0, 0), mul(SL, LH)), add(at(-HW, 0, 0), mul(SL, LH))] };
  }
  function hands() {
    // far arm: just the forearm, cuff and mitten on the keys
    const fa = limb([[1042, 762], [1030, 832], [1004, 880]], [34, 32, 30]);
    part(fa, { fill: '#5B52B4', shade: [10, 6, JK.shade, 6, .9], line: JK.line, lw: 6 });
    const fc = limb([[1012, 868], [998, 890]], [30, 30]); part(fc, { fill: RB.fill, shade: [0, 4, RB.shade, 3], line: RB.line, lw: 5 }); ribs(fc, .5, 9, RB.rib, 2, .7);
    part(ell(984, 906, 24, 20, .3), { fill: SK.fill, shade: [6, 6, SK.shade, 4], line: SK.line, lw: 5 });
    // near arm: a short puffy sleeve from the shoulder, round the elbow, over to the keyboard
    const na = limb([[1326, 668], [1362, 752], [1346, 830], [1250, 872], [1196, 880]], [50, 48, 44, 38, 34]);
    part(na, { fill: JK.fill, shade: [22, 20, JK.shade, 12, .95], hi: [-10, -12, JK.hi, 8, .6], rim: [10, 0, '#FFB18E', 4, .45], line: JK.line, lw: 7 });
    strokeP(spline([[1326, 796], [1350, 816], [1336, 842]], false), JK.shade, 4, .8);
    const nc = limb([[1206, 880], [1170, 886]], [36, 36]); part(nc, { fill: RB.fill, shade: [0, 6, RB.shade, 4], line: RB.line, lw: 6 }); ribs(nc, 1.45, 10, RB.rib, 2.2, .7);
    part(ell(1138, 888, 28, 22, -.15), { fill: SK.fill, shade: [6, 8, SK.shade, 4], line: SK.line, lw: 5.5 });
    strokeP(spline([[1122, 878], [1114, 892]], false), SK.line, 3, .7);
  }

  // ---------- the Assistant: chibi, head leaning on his cheek ----------
  function assistant(t, lidTop) {
    const [, tl, tr] = lidTop, k = .86, sx = lerp(tl[0], tr[0], k), sy = lerp(tl[1], tr[1], k) + 2;
    const nuz = Math.sin(t * 1.4) * .025;
    X.save(); X.translate(sx, sy); X.rotate(.16);
    // legs dangling over the screen edge
    for (const [lx, fx, fy] of [[-10, -18, 32], [10, 4, 32]]) part(limb([[lx, -6], [(lx + fx) / 2, fy * .5], [fx, fy]], [9, 8.5, 9.5]), { fill: YL.fill, shade: [3, 3, YL.shade, 3], line: YL.line, lw: 4.5 });
    part(ell(0, -24, 21, 25), { fill: YL.fill, shade: [7, 6, YL.shade, 6], hi: [-4, -5, YL.hi, 4, .9], line: YL.line, lw: 4.5 });
    part(limb([[-15, -30], [-24, -12], [-26, 4]], [7.5, 7, 7.5]), { fill: YL.fill, line: YL.line, lw: 4.5 });
    // the near arm reaches up round his cheek, a little hug
    part(limb([[14, -38], [30, -58], [36, -84]], [7.5, 7, 8]), { fill: YL.fill, line: YL.line, lw: 4.5 });
    smiley(20, -86, 46, .5 + nuz, { blush: 1, lw: 4.8 });
    X.restore();
    return [sx, sy];
  }

  // ---------- sparkles, hearts, light ----------
  function twinkle(x, y, r, col, a = 1) { glowR(x, y, r * 2.4, col, .35 * a); fillP(sparkleP(x, y, r), col, a); fillP(sparkleP(x, y, r * .45), '#FFFFFF', a); }
  function decorations(t, asst) {
    const tw = i => .7 + .3 * Math.sin(t * 2.4 + i * 1.7);
    for (const [x, y, r, c, i] of [[640, 150, 15, '#FFF4C8', 0], [900, 250, 10, '#FFFFFF', 1], [300, 410, 10, '#FFE1EE', 2], [1458, 140, 17, '#FFE6F0', 3], [1612, 470, 11, '#FFF4C8', 4], [1470, 560, 9, '#FFFFFF', 5], [760, 520, 12, '#E6F6FF', 6], [1866, 150, 12, '#FFF4C8', 7], [96, 700, 9, '#FFFFFF', 8]]) twinkle(x, y, r * tw(i), c, .9);
    // hearts rising from the Assistant
    const [ax, ay] = asst;
    for (const [dx, dy, s, i] of [[-52, -160, 16, 0], [-88, -204, 11, 1], [-36, -224, 8, 2]]) { const b = Math.sin(t * 1.8 + i) * 4; part(heartP(ax + dx, ay + dy + b, s), { fill: '#FFA3C0', hi: [-2, -3, '#FFD6E4', 2, .9], line: '#C0527C', lw: 3.2 }); }
  }

  function frame(t) {
    style(1);
    FX.noAuto = true; FX.scan = 0; FX.bloom = .22; FX.grain = 0;
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.lineJoin = 'round'; X.lineCap = 'round';
    wall();
    lamp(t);
    windowScene(t);
    curtains();
    stringLights(t);
    glowR(520, 640, 560, '#C8CEFF', .12);            // moonlight spilling in
    couchBack();
    couchSeat();
    shoggoth(t);
    couchFront();
    couchArms();
    props(t);
    blurP(ell(1150, 760, 230, 180), '#4A2458', 30, .22);   // his soft shadow on the cushions
    lowerLegs();
    torso();
    thighs();
    head(t);
    const lt = laptop(t);
    hands();
    const asst = assistant(t, lt.top);
    glowR(1650, 720, 420, '#FFC08A', .16);            // lamp warmth on the couch
    decorations(t, asst);
    X.save(); X.globalCompositeOperation = 'multiply';
    const gb = X.createLinearGradient(0, 700, 0, H); gb.addColorStop(0, 'rgba(150,140,220,0)'); gb.addColorStop(1, 'rgba(150,140,220,.55)'); X.fillStyle = gb; X.fillRect(0, 700, W, H - 700);
    X.restore();
    // soft vignette
    const v = X.createRadialGradient(W / 2, H * .48, H * .42, W / 2, H * .5, H * 1.05); v.addColorStop(0, 'rgba(40,30,80,0)'); v.addColorStop(1, 'rgba(40,30,80,.42)');
    X.fillStyle = v; X.fillRect(0, 0, W, H);
    X.restore();
  }

  chapter('chibi', K, K + 1, [[K, (t) => frame(t)]]);
})();
