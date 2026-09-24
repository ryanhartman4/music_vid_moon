// actionanime.js: style study K = 1, "modern action anime" (the Trigger / cyberpunk-anime design language).
// Tall lean figure, angular jaw and pointed chin, spiky clumped hair with a hard highlight band, big glossy eyes with
// coloured irises and a heavy upper lash line, thick-to-thin tapered ink, two-tone hard cel shading, magenta + cyan
// rim light, a graphic neon night behind glass, and a dutch-tilted low camera.
(() => {
  const K = 1;
  const INK = '#150A24';
  const C = {
    skin: '#F2C3C4', skinSh: '#8E5390', skinDeep: '#5E3470', skinCy: '#E2FBFF', blush: '#FF6F9E',
    hair: '#1D1738', hairSh: '#0C0A1B', hairHi: '#4F42A0', hairHi2: '#9A8BFF',
    jak: '#382B8C', jakSh: '#1C1450', jakDeep: '#110C33', rib: '#FF8A1F', ribSh: '#B4431C', ribHi: '#FFC46E',
    shirt: '#1C1A2C', shirtSh: '#0F0D18', pants: '#1B1A36', pantsSh: '#0E0D1F',
    iris: '#C0661E', irisDk: '#3B150B', irisLt: '#FFBE55', sclera: '#F6F5FF', scleraSh: '#B3ABE0', frame: '#191327',
    mag: '#FF3FA8', magSoft: '#FF86C8', cyan: '#49F2FF', cyanSoft: '#B4FCFF', amber: '#FFB44E', warm: '#FFD08A',
    wall: '#15112F', couch: '#4E1C4C', couchSh: '#28102E', couchDeep: '#170A1D', couchHi: '#7A2C6E',
    mask: '#F5FA83', maskSh: '#B8BD4E', ay: '#F0F07C', aySh: '#A8A63E',
    shog: '#99B087', shogSh: '#57725E', shogDeep: '#34483F', shogHi: '#DCEBAE',
    lap: '#262440', lapSh: '#12111F'
  };

  // ---------------------------------------------------------------- path + ink helpers
  const _PC = new Map();
  // tiny SVG-ish path flattener: absolute M L Q C Z only. Keeps hard corners exactly (sharp spikes / chins).
  function pths(d, res = 2.5) {
    const key = res + '|' + d; if (_PC.has(key)) return _PC.get(key);
    const tk = d.match(/[MLCQZ]|-?\d*\.?\d+/gi), out = []; let i = 0, cmd = 'M', cur = null, x = 0, y = 0, sx = 0, sy = 0;
    const num = () => +tk[i++], push = (px, py) => cur.pts.push([px, py]);
    while (i < tk.length) {
      if (/^[MLCQZ]$/i.test(tk[i])) cmd = tk[i++].toUpperCase();
      if (cmd === 'Z') { if (cur) cur.closed = true; x = sx; y = sy; if (i < tk.length && !/^[MLCQZ]$/i.test(tk[i])) i++; continue; }
      if (cmd === 'M') { x = num(); y = num(); sx = x; sy = y; cur = { pts: [[x, y]], closed: false }; out.push(cur); cmd = 'L'; continue; }
      if (cmd === 'L') { const nx = num(), ny = num(), n = Math.max(1, Math.ceil(Math.hypot(nx - x, ny - y) / (res * 2))); for (let s = 1; s <= n; s++) push(x + (nx - x) * s / n, y + (ny - y) * s / n); x = nx; y = ny; continue; }
      if (cmd === 'Q') { const cx = num(), cy = num(), nx = num(), ny = num(), n = Math.max(3, Math.ceil((Math.hypot(cx - x, cy - y) + Math.hypot(nx - cx, ny - cy)) / res)); for (let s = 1; s <= n; s++) { const t = s / n, u = 1 - t; push(u * u * x + 2 * u * t * cx + t * t * nx, u * u * y + 2 * u * t * cy + t * t * ny); } x = nx; y = ny; continue; }
      if (cmd === 'C') { const ax = num(), ay = num(), bx = num(), by = num(), nx = num(), ny = num(), n = Math.max(4, Math.ceil((Math.hypot(ax - x, ay - y) + Math.hypot(bx - ax, by - ay) + Math.hypot(nx - bx, ny - by)) / res)); for (let s = 1; s <= n; s++) { const t = s / n, u = 1 - t; push(u * u * u * x + 3 * u * u * t * ax + 3 * u * t * t * bx + t * t * t * nx, u * u * u * y + 3 * u * u * t * ay + 3 * u * t * t * by + t * t * t * ny); } x = nx; y = ny; continue; }
      i++;
    }
    for (const s of out) if (s.closed && s.pts.length > 2) { const a = s.pts[0], b = s.pts[s.pts.length - 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < .01) s.pts.pop(); }
    _PC.set(key, out); return out;
  }
  const pth = (d, res) => pths(d, res)[0].pts;
  // Catmull-Rom through control points
  function crv(p, closed = true, seg = 8) {
    const n = p.length, out = [], g = i => closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))], m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
      for (let s = 0; s < seg; s++) {
        const t = s / seg, t2 = t * t, t3 = t2 * t, f = j => .5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t3);
        out.push([f(0), f(1)]);
      }
    }
    if (!closed) out.push(p[n - 1]);
    return out;
  }
  const ell = (cx, cy, rx, ry, n = 40, rot = 0) => { const p = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * c - y * s, cy + x * s + y * c]); } return p; };
  const mv = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
  function addPts(pts) { X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]); X.closePath(); }
  function fillP(pts, col, a = 1, comp) { if (comp) { X.save(); X.globalCompositeOperation = comp; } X.globalAlpha = a; X.fillStyle = col; X.beginPath(); addPts(pts); X.fill(); X.globalAlpha = 1; if (comp) X.restore(); }
  function clipTo(pts, fn) { X.save(); X.beginPath(); addPts(pts); X.clip(); fn(); X.restore(); }
  // cel crescent: the shape minus a copy shifted by (dx, dy). Shadow: shift toward the light. Rim: shift away from it.
  function crescent(pts, dx, dy, col, a = 1, comp) {
    clipTo(pts, () => { X.beginPath(); X.rect(-6000, -6000, 12000, 12000); addPts(mv(pts, dx, dy)); X.fillStyle = col; X.globalAlpha = a; if (comp) X.globalCompositeOperation = comp; X.fill('evenodd'); X.globalAlpha = 1; });
  }
  // tapered brush ink: w = max width. open strokes taper at both ends (o.a / o.b = taper fractions).
  // closed outlines (o.closed) get weight from o.dir: thicker where the outward normal faces dir (the shadow side).
  function ink(pts, w, o = {}) {
    const n = pts.length; if (n < 2) return;
    const cl = !!o.closed, segs = cl ? n : n - 1, L = [0];
    for (let i = 1; i <= segs; i++) { const a = pts[i - 1], b = pts[i % n]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const tot = L[segs] || 1, ta = o.a ?? .3, tb = o.b ?? .3, mn = o.min ?? .35, dir = o.dir, lo = o.lo ?? .3;
    let orient = 1; if (dir) { let A = 0; for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; A += p[0] * q[1] - q[0] * p[1]; } orient = A > 0 ? 1 : -1; if (!cl) orient = o.side ?? 1; }
    X.strokeStyle = o.col || INK; X.lineCap = 'round'; X.lineJoin = 'round'; X.globalAlpha = o.alpha ?? 1;
    if (o.comp) { X.save(); X.globalCompositeOperation = o.comp; }
    for (let i = 0; i < segs; i++) {
      const a = pts[i], b = pts[(i + 1) % n], k = (L[i] + L[i + 1]) / 2 / tot;
      let f = 1;
      if (!cl) { if (ta > 0) f = Math.min(f, k / ta); if (tb > 0) f = Math.min(f, (1 - k) / tb); f = Math.sin(clamp(f) * Math.PI / 2); }
      if (dir) { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = dy / d * orient, ny = -dx / d * orient; f *= lo + (1 - lo) * clamp(nx * dir[0] + ny * dir[1]); }
      X.lineWidth = Math.max(mn, w * f); X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); X.stroke();
    }
    if (o.comp) X.restore();
    X.globalAlpha = 1;
  }
  // a full cel-shaded shape: fill, optional hard shadow (explicit polygon or offset crescent), rims, weighted outline
  function cel(pts, o) {
    fillP(pts, o.fill, o.alpha ?? 1);
    if (o.shadePts) clipTo(pts, () => fillP(o.shadePts, o.shade, o.alpha ?? 1));
    else if (o.shade) crescent(pts, o.sh[0], o.sh[1], o.shade, o.alpha ?? 1);
    if (o.rim) crescent(pts, -o.rimD[0], -o.rimD[1], o.rim, o.rimA ?? 1);
    if (o.rim2) crescent(pts, -o.rim2D[0], -o.rim2D[1], o.rim2, o.rim2A ?? 1);
    if (o.post) clipTo(pts, o.post);
    if (o.w !== 0) ink(pts, (o.w ?? 3) * 1.28, { closed: true, dir: o.dir || [.6, .8], lo: o.lo ?? .35, col: o.ink });
  }

  // ---------------------------------------------------------------- the room & the night outside
  const WIN = [[214, 22], [1500, 12], [1548, 660], [166, 670]];
  const VP = [860, -5200];                           // low camera: verticals converge upward
  const lean = (x, y, hz) => x + (VP[0] - x) * (hz - y) / (hz - VP[1]);

  function building(x0, x1, top, hz, col, o = {}) {
    const p = [[lean(x0, top, hz), top], [lean(x1, top, hz), top], [x1, hz + 40], [x0, hz + 40]];
    if (o.cap) { const mx = (p[0][0] + p[1][0]) / 2; p.splice(1, 0, [mx - (x1 - x0) * .2, top], [mx, top - o.cap], [mx + (x1 - x0) * .2, top]); }
    fillP(p, col);
    return p;
  }
  function windows(x0, x1, top, hz, seed, dens, cols, sz = [4, 5], gap = [11, 13], a = 1) {
    const nC = Math.floor((x1 - x0 - 12) / gap[0]), nR = Math.floor((hz - top - 16) / gap[1]);
    for (let r = 0; r < nR; r++) for (let c = 0; c < nC; c++) {
      const hv = hash(seed * 131 + r * 17.3 + c * 3.7); if (hv > dens) continue;
      const y = top + 12 + r * gap[1]; X.fillStyle = cols[Math.floor(hash(hv * 91) * cols.length)]; X.globalAlpha = a * (.35 + .65 * hash(hv * 7));
      X.fillRect(lean(x0 + 8 + c * gap[0], y, hz), y, sz[0], sz[1]);
    }
    X.globalAlpha = 1;
  }
  function city(t) {
    const hz = 650;
    for (let i = 0; i < 30; i++) {
      const x0 = 110 + i * 54 + hash(i * 3.1) * 30, w = 44 + hash(i * 1.7) * 60, top = hz - 140 - hash(i * 7.3) * 200;
      building(x0, x0 + w, top, hz, '#28296E');
      windows(x0, x0 + w, top, hz, i, .14, ['#8FD8FF', '#FFC98A', '#C4A8FF'], [3, 4], [8, 10], .5);
    }
    vgrad(0, 330, W, 340, [[0, 'rgba(90,70,170,0)'], [1, 'rgba(210,80,170,.38)']]);
    for (let i = 0; i < 17; i++) {
      const x0 = 90 + i * 90 + hash(i * 9.1) * 40, w = 70 + hash(i * 2.9) * 80, low = x0 > 200 && x0 < 700, top = hz - (low ? 150 : 230) - hash(i * 4.3) * (low ? 90 : 240);
      building(x0, x0 + w, top, hz, '#1A1850', { cap: hash(i * 8) < .3 ? 34 : 0 });
      windows(x0, x0 + w, top, hz, i + 50, .13, ['#7FF6FF', '#FFD27A', '#B99BFF', '#FF9AD6'], [3, 4], [9, 11], .75);
      if (hash(i * 5.5) < .35) { const col = hash(i * 6.6) < .5 ? C.mag : C.cyan, sy = top + 30 + hash(i) * 90; neonLine([[lean(x0 + 6, sy, hz), sy], [lean(x0 + w - 6, sy, hz), sy]], col, 2.5, .8, 0); }
    }
    const near = [[120, 250, 190], [300, 420, 470], [590, 720, 300], [1080, 1240, 190], [1250, 1360, 60], [1380, 1560, 140]];
    near.forEach(([x0, x1, top], i) => {
      const p = building(x0, x1, top, hz, '#0F0C30');
      windows(x0, x1, top, hz, i + 90, .11, ['#9FF8FF', '#FFC870', '#FF8FD0'], [4, 5], [12, 14], .85);
      neonLine([[p[0][0] + 3, top + 2], [p[1][0] - 3, top + 2]], i % 2 ? C.cyan : C.mag, 2.2, .75, 0);
      if (i % 3 === 0) { const bx = lean(x0 + 16, top + 50, hz); neonLine([[bx, top + 50], [lean(x0 + 16, top + 290, hz), top + 290]], C.mag, 4, 1, 0); }
      if (i % 3 === 2) { const px = lean(x0 + 18, top + 80, hz), pw = (x1 - x0) * .5; X.fillStyle = 'rgba(80,240,255,.28)'; X.fillRect(px, top + 80, pw, 44); glowPath(rrPts(px, top + 80, pw, 44, 4), C.cyan, .6, 0, .7); }
      glow(lean((x0 + x1) / 2, top - 6, hz), top - 6, 18, '#FF3050', .8); X.fillStyle = '#FF6A7A'; X.fillRect(lean((x0 + x1) / 2, top - 6, hz) - 2.5, top - 8.5, 5, 5);
    });
  }
  function moonA(t) {
    const x = 452, y = 268, r = 100;
    glow(x, y, r * 3.6, '#8E6BFF', .26); glow(x, y, r * 1.8, '#FFE3F2', .32);
    X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = C.magSoft; X.globalAlpha = .28; X.lineWidth = 2.5; X.beginPath(); X.arc(x, y, r * 1.3, 0, TAU); X.stroke(); X.globalAlpha = .12; X.lineWidth = 16; X.stroke(); X.restore();
    const disc = ell(x, y, r, r, 90);
    fillP(disc, '#FFF4E4');
    clipTo(disc, () => {
      X.beginPath(); X.rect(x - r * 2, y - r * 2, r * 4, r * 4); addPts(ell(x - r * .22, y - r * .18, r * 1.03, r * 1.05, 80)); X.fillStyle = '#F4C6DC'; X.fill('evenodd');
      for (const [cx, cy, cr] of [[-.34, -.22, .2], [.3, .12, .14], [-.02, .42, .11], [.4, -.4, .08], [-.5, .24, .07]]) fillP(ell(x + cx * r, y + cy * r, cr * r, cr * r * .8, 20), '#F0DCD8', .9);
    });
    const cloud = (cy, x0, x1, th, a) => { const pts = []; const n = 7; for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u); pts.push([x, cy - Math.sin(u * Math.PI) * th - (i % 2 ? th * .35 : 0)]); } pts.push([x1 - 20, cy + th * .25], [x0 + 30, cy + th * .3]); const p = crv(pts, true, 6); fillP(p, '#221B5C', a); crescent(p, 0, 4, C.magSoft, a * .85); };
    cloud(330, 250, 700, 26, .95); cloud(214, 500, 700, 12, .8);
  }
  function rainGlass(t) {
    X.save(); X.strokeStyle = '#B9C6FF'; X.lineWidth = 1.4; X.globalAlpha = .28; X.beginPath();
    for (let i = 0; i < 230; i++) { const sp = 1500 + hash(i) * 700, x = hash(i * 3) * 1500 + 150, y = ((hash(i * 7) * 820 + t * sp) % 820) - 80; X.moveTo(x, y); X.lineTo(x - 6, y - 44); }
    X.stroke(); X.restore();
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 30; i++) {
      const bx = 200 + hash(i * 11.3) * 1320, by = 300 + hash(i * 5.9) * 340, r = 12 + hash(i * 2.2) * 34, col = [C.mag, C.cyan, C.amber, '#B78CFF'][i % 4];
      X.fillStyle = col; X.globalAlpha = .07 + hash(i) * .07; X.beginPath(); X.arc(bx, by, r, 0, TAU); X.fill();
      X.globalAlpha = .05; X.beginPath(); X.arc(bx, by, r * .7, 0, TAU); X.fill();
    }
    X.restore();
    for (let i = 0; i < 210; i++) {
      const dx = 190 + hash(i * 4.1) * 1340, sp = 10 + hash(i * 2.7) * 40, dy = (hash(i * 8.9) * 700 + t * sp * (hash(i) < .25 ? 1 : 0)) % 700, r = 1.5 + hash(i * 6.1) * 3.8;
      if (hash(i * 1.3) < .45) { X.strokeStyle = 'rgba(200,225,255,.26)'; X.lineWidth = r * .75; X.beginPath(); X.moveTo(dx, dy - 4); for (let k = 1; k < 8; k++) X.lineTo(dx + Math.sin(k * 1.7 + i) * 1.6, dy - 4 - k * (10 + hash(i) * 12)); X.stroke(); }
      X.fillStyle = 'rgba(16,10,44,.5)'; X.beginPath(); X.ellipse(dx, dy + r * .25, r, r * 1.15, 0, 0, TAU); X.fill();
      X.fillStyle = 'rgba(225,242,255,.8)'; X.beginPath(); X.ellipse(dx - r * .3, dy - r * .35, r * .33, r * .38, 0, 0, TAU); X.fill();
      X.fillStyle = hash(i * 3.3) < .5 ? 'rgba(255,90,190,.5)' : 'rgba(80,240,255,.5)'; X.beginPath(); X.ellipse(dx + r * .2, dy + r * .5, r * .45, r * .25, 0, 0, TAU); X.fill();
    }
  }
  function windowA(t) {
    clipTo(WIN, () => {
      vgrad(0, 0, W, 690, [[0, '#0A0D30'], [.35, '#1A246C'], [.7, '#40328E'], [.9, '#A8449A'], [1, '#FF6FA8']]);
      for (let i = 0; i < 40; i++) { X.fillStyle = '#FFFFFF'; X.globalAlpha = .25 + hash(i) * .5; X.fillRect(200 + hash(i * 3.7) * 1300, 20 + hash(i * 9.1) * 260, 2, 2); }
      X.globalAlpha = 1;
      moonA(t); city(t); rainGlass(t);
      X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = '#9FB8FF';
      X.globalAlpha = .045; X.beginPath(); X.moveTo(1000, 0); X.lineTo(1180, 0); X.lineTo(800, 690); X.lineTo(620, 690); X.fill();
      X.globalAlpha = .03; X.beginPath(); X.moveTo(1220, 0); X.lineTo(1270, 0); X.lineTo(890, 690); X.lineTo(840, 690); X.fill();
      X.restore();
    });
    const fr = '#09071A';
    X.fillStyle = fr; X.beginPath(); X.rect(-400, -400, W + 800, H + 800); addPts(WIN); X.fill('evenodd');
    fillP([[654, 16], [682, 16], [676, 665], [646, 665]], fr);
    ink(WIN, 3, { closed: true, col: '#05030E' });
    ink([[682, 20], [676, 660]], 2.2, { col: C.mag, alpha: .5, a: .1, b: .1 });
    ink([[1498, 20], [1544, 650]], 2.2, { col: C.cyan, alpha: .3, a: .1, b: .1 });
  }
  function halftone(x0, y0, x1, y1, col, a, gap = 14, dir = [1, 0]) {
    X.save(); X.fillStyle = col;
    for (let y = y0; y < y1; y += gap) for (let x = x0 + ((y / gap) % 2) * gap / 2; x < x1; x += gap) {
      const k = clamp(((x - x0) * dir[0] + (y - y0) * dir[1]) / ((x1 - x0) * Math.abs(dir[0]) + (y1 - y0) * Math.abs(dir[1]))), r = gap * .42 * k;
      if (r > .4) { X.globalAlpha = a; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); }
    }
    X.restore();
  }
  function lampA(t) {
    const cx = 1716, ty = 250;
    fillP([[cx - 5, ty + 150], [cx + 5, ty + 150], [cx + 7, 760], [cx - 7, 760]], '#0B0818');
    X.save(); X.globalCompositeOperation = 'lighter';
    X.fillStyle = C.amber; X.globalAlpha = .06; X.beginPath(); X.moveTo(cx - 90, ty + 150); X.lineTo(cx + 90, ty + 150); X.lineTo(cx + 330, 1100); X.lineTo(cx - 520, 1100); X.fill();
    X.globalAlpha = .045; X.beginPath(); X.moveTo(cx - 90, ty + 150); X.lineTo(cx + 90, ty + 150); X.lineTo(cx + 160, 1100); X.lineTo(cx - 330, 1100); X.fill();
    X.restore();
    glow(cx, ty + 90, 540, '#FF9A3C', .3); glow(cx, ty + 100, 170, '#FFD9A0', .45);
    const shade = [[cx - 60, ty], [cx + 60, ty], [cx + 94, ty + 150], [cx - 94, ty + 150]];
    fillP(shade, '#FFC878');
    clipTo(shade, () => { fillP([[cx + 18, ty - 10], [cx + 80, ty - 10], [cx + 110, ty + 160], [cx + 38, ty + 160]], '#F09444'); });
    ink(shade, 2.4, { closed: true, dir: [1, .3], col: '#3A1A10' });
    fillP(ell(cx, ty + 150, 94, 12, 30), '#FFF7E6');
  }
  function couchBack(t) {
    const back = pth('M 60 610 Q 70 578 120 576 L 1840 562 Q 1890 564 1895 605 L 1905 910 L 55 920 Z');
    cel(back, { fill: C.couch, shadePts: pth('M 0 640 Q 900 600 1920 630 L 1920 1000 L 0 1000 Z'), shade: C.couchSh, rim: C.mag, rimD: [0, -3], rimA: .45, w: 3, dir: [0, 1] });
    for (const sx of [640, 1330]) { fillP(pth(`M ${sx} 586 Q ${sx + 12} 740 ${sx + 8} 900 L ${sx + 36} 900 Q ${sx + 36} 740 ${sx + 22} 586 Z`), C.couchDeep, .6); ink(pth(`M ${sx} 584 Q ${sx + 10} 740 ${sx + 4} 900`), 2.8, { a: .1, b: .4 }); }
    const seat = pth('M 40 880 Q 60 862 110 862 L 1850 854 Q 1900 858 1905 890 L 1910 1100 L 30 1100 Z');
    cel(seat, { fill: C.couchSh, shadePts: pth('M 0 915 L 1920 905 L 1920 1100 L 0 1100 Z'), shade: C.couchDeep, rim: C.couchHi, rimD: [0, -5], w: 3, dir: [0, 1] });
    const armL = pth('M 30 660 Q 30 624 80 624 L 170 624 Q 215 626 215 670 L 225 1100 L 20 1100 Z');
    cel(armL, { fill: C.couch, shade: C.couchSh, sh: [-30, -20], rim: C.cyan, rimD: [4, -2], rimA: .5, w: 3.2, dir: [1, .6] });
  }
  function armRight() {
    const armR = pth('M 1735 690 Q 1738 646 1790 644 L 1880 646 Q 1925 650 1925 694 L 1930 1100 L 1725 1100 Z');
    cel(armR, { fill: C.couch, shade: C.couchSh, sh: [30, -24], rim: C.amber, rimD: [0, -6], rimA: .8, w: 3.2, dir: [-1, .5] });
    X.save(); X.globalCompositeOperation = 'lighter'; clipTo(armR, () => { X.fillStyle = C.amber; X.globalAlpha = .12; X.beginPath(); X.moveTo(1700, 600); X.lineTo(1950, 600); X.lineTo(1950, 900); X.fill(); }); X.restore();
  }

  // ---------------------------------------------------------------- the shoggoth (asleep, curled at the couch end)
  function shoggothA(t) {
    const ox = 1500, oy = 800, br = 1 + .012 * Math.sin(t * 1.3);
    X.save(); X.translate(ox, oy);
    fillP(ell(0, 92, 230, 22, 40), '#0A0514', .55);
    const sc = (pts, w = 3.4) => cel(pts, { fill: C.shog, shade: C.shogSh, sh: [16, -20], rim: C.mag, rimD: [-4, -3], rimA: .85, rim2: C.warm, rim2D: [4, -2], rim2A: .65, w, dir: [-.5, .85] });
    // crooked horn limb up the armrest (behind)
    horn([[96, -46], [132, -104], [146, -156], [196, -178], [226, -160]], 26, sc);
    // spiral limb: rises from the back and curls like a fiddlehead
    const sp = [[-30, -70], [-46, -118], [-66, -150]];
    const scx = -96, scy = -160;
    for (let i = 0; i <= 56; i++) { const k = i / 56, a = -.1 - k * 2.6 * Math.PI, r = lerp(34, 5, Math.pow(k, .75)); sp.push([scx + Math.cos(a) * r, scy + Math.sin(a) * r]); }
    sc(ribbon(sp, k => k < .45 ? lerp(22, 11, k / .45) : lerp(11, 2, (k - .45) / .55)), 2.6);
    // body: cloud-scalloped
    const body = [], N = 13;
    for (let i = 0; i < N; i++) {
      const a0 = -Math.PI * .97 + i / N * TAU, a1 = a0 + TAU / N, bulge = 14 + hash(i * 3.3) * 14;
      for (let s = 0; s <= 10; s++) {
        const u = s / 10, a = lerp(a0, a1, u), bump = Math.pow(Math.sin(u * Math.PI), .8) * bulge;
        let y = Math.sin(a) * (96 * br + bump); if (y > 66) y = 66 + (y - 66) * .3;
        body.push([Math.cos(a) * (156 * br + bump), y]);
      }
    }
    sc(body, 4.2);
    clipTo(body, () => fillP(pth('M -200 40 Q 0 90 200 30 L 200 140 L -200 140 Z'), C.shogDeep, .55));
    // cusp ticks + scallop gloss crescents
    for (let i = 0; i < N; i++) {
      const a = -Math.PI * .97 + i / N * TAU, cx = Math.cos(a) * 154, cy = Math.min(66, Math.sin(a) * 96);
      if (cy < 60) ink([[cx, cy], [cx * .9, cy * .88]], 2.4, { a: 0, b: .9 });
      const am = a + Math.PI / N, hx = Math.cos(am) * 142, hy = Math.sin(am) * 86;
      if (Math.sin(am) < .1 && Math.cos(am) > -.5) ink(crv([[hx - 13, hy + 5], [hx, hy - 3], [hx + 13, hy + 5]], false, 6), 3.4, { col: C.shogHi, a: .5, b: .5, alpha: .9 });
    }
    // eyes, all asleep: the big central one and several small almonds (one barely open)
    closedEye(6, 10, 46, .06);
    closedEye(-86, -26, 19, -.25); closedEye(84, -42, 22, .28, .16); closedEye(70, 44, 14, .12); closedEye(-44, 50, 12, -.1); closedEye(124, 6, 11, .35); closedEye(-122, 22, 10, -.35); closedEye(18, -60, 13, .05);
    // pointed little legs, tucked
    for (const [lx, ly, s] of [[-84, 58, 1], [-30, 66, 1.1], [34, 68, 1.1], [96, 60, 1]]) {
      const leg = pth(`M ${lx - 13 * s} ${ly} Q ${lx - 12 * s} ${ly + 22 * s} ${lx - 22 * s} ${ly + 38 * s} Q ${lx + 2 * s} ${ly + 24 * s} ${lx + 13 * s} ${ly} Z`);
      cel(leg, { fill: C.shog, shade: C.shogSh, sh: [6, -4], rim: C.mag, rimD: [-2, 0], rimA: .6, w: 2.4, dir: [-.4, 1] });
    }
    // crooked horn limb lying along the seat
    horn([[128, 40], [186, 66], [222, 60], [240, 26]], 20, sc, 2);
    // the little arm with the mask resting on it like a pillow
    sc(ribbon(crv([[-70, 48], [-120, 64], [-170, 66], [-214, 54]], false, 10), k => 16 - k * 5), 2.8);
    maskA(-200, 20, 46, -.42, {});
    const paw = pth('M -226 56 Q -250 46 -244 26 Q -230 32 -216 50 Z');
    cel(paw, { fill: C.shog, shade: C.shogSh, sh: [3, -3], w: 2.2 });
    X.restore();
  }
  // a crooked horn limb: straight-ish runs with a sharp bend, thick root tapering to a point, a few ridge rings
  function horn(sp, w0, sc, ridges = 3) {
    const pts = [];
    for (let i = 0; i < sp.length - 1; i++) { const a = sp[i], b = sp[i + 1], n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5)); for (let s = 0; s < n; s++) pts.push([lerp(a[0], b[0], s / n), lerp(a[1], b[1], s / n)]); }
    pts.push(sp[sp.length - 1]);
    const wf = k => w0 * Math.pow(1 - k, .85) + .6, sh = ribbon(pts, wf);
    sc(sh);
    for (let r = 1; r <= ridges; r++) { const i = Math.floor(pts.length * r * .12), a = pts[i], b = pts[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, w = wf(i / (pts.length - 1)) * .85;
      ink(crv([[a[0] + nx * w, a[1] + ny * w], [a[0] + (b[0] - a[0]) * 1.5, a[1] + (b[1] - a[1]) * 1.5], [a[0] - nx * w, a[1] - ny * w]], false, 6), 1.8, { a: .3, b: .3, alpha: .8 }); }
  }
  function closedEye(x, y, r, rot = 0, open = 0) {
    X.save(); X.translate(x, y); X.rotate(rot);
    const lid = pth(`M ${-r} 0 Q ${-r * .2} ${-r * .9} ${r} ${-r * .05} Q ${r * .1} ${r * .62} ${-r} 0 Z`);
    fillP(lid, '#B8CC98', .55);
    ink(pth(`M ${-r * .9} ${-r * .28} Q ${-r * .1} ${-r * .98} ${r * .92} ${-r * .3}`), Math.max(1.2, r * .05), { a: .3, b: .3, alpha: .6 });
    if (open > 0) { const sl = pth(`M ${-r * .75} ${r * .1} Q 0 ${r * (.1 + open)} ${r * .75} ${r * .1} Q 0 ${r * .16} ${-r * .75} ${r * .1} Z`); fillP(sl, '#F4F1DA'); clipTo(sl, () => fillP(ell(-r * .12, r * .2, r * .24, r * .2, 12), INK)); }
    ink(crv([[-r * 1.02, -r * .04], [-r * .45, r * .34], [r * .4, r * .32], [r * 1.02, -r * .08]], false, 8), Math.max(2.4, r * .15), { a: .15, b: .2 });
    for (let i = 0; i < 3; i++) { const u = .5 + i * .18, lx = lerp(-r, r, u) * .86, ly = r * .3 - i * r * .04; ink([[lx, ly], [lx + r * (.1 + i * .08), ly + r * .26]], Math.max(1.3, r * .07), { a: 0, b: .9 }); }
    X.restore();
  }
  // the smiley mask (Ryan's): pale yellow lopsided oval, two short vertical dash eyes, smile higher on the right
  function maskA(x, y, r, rot = 0, o = {}) {
    X.save(); X.translate(x, y); X.rotate(rot);
    const m = pth(`M ${-.62 * r} ${-.62 * r} C ${-.25 * r} ${-1.08 * r} ${.52 * r} ${-1.02 * r} ${.78 * r} ${-.5 * r} C ${1.02 * r} ${.02 * r} ${.8 * r} ${.8 * r} ${.2 * r} ${.98 * r} C ${-.35 * r} ${1.1 * r} ${-.9 * r} ${.62 * r} ${-.88 * r} ${.02 * r} C ${-.86 * r} ${-.3 * r} ${-.76 * r} ${-.48 * r} ${-.62 * r} ${-.62 * r} Z`);
    if (o.glow) glow(0, 0, r * 2.2, C.mask, .16 * o.glow);
    cel(m, { fill: C.mask, shade: C.maskSh, sh: o.sh || [-r * .16, -r * .2], rim: o.rim || C.mag, rimD: o.rimD || [3, 1], rimA: .85, w: Math.max(2.2, r * .07), dir: [.6, .8] });
    ink(crv([[-.55 * r, -.45 * r], [-.3 * r, -.72 * r], [0, -.8 * r]], false, 6), r * .08, { col: '#FFFFF2', a: .4, b: .4, alpha: .9 });
    for (const [ex, ey] of [[-.34 * r, -.2 * r], [.3 * r, -.24 * r]]) ink([[ex - r * .015, ey - r * .15], [ex + r * .015, ey + r * .15]], r * .1, { a: .3, b: .3, min: 1 });
    ink(crv([[-.46 * r, .26 * r], [-.18 * r, .5 * r], [.14 * r, .46 * r], [.42 * r, .12 * r]], false, 8), r * .1, { a: .2, b: .25 });
    if (o.blush) for (const bx of [-.56 * r, .5 * r]) for (let i = 0; i < 3; i++) ink([[bx - r * .06 + i * r * .08, .1 * r], [bx - r * .1 + i * r * .08, .22 * r]], r * .035, { col: C.blush, a: .3, b: .3, alpha: .85 * o.blush });
    X.restore();
  }

  // ---------------------------------------------------------------- him
  const HX = 821, HY = 414, HR = -.14, HS = 1.12;
  function heroA(t) {
    // thighs under the laptop
    cel(pth('M 430 1010 C 560 968 780 952 1000 960 L 1180 990 L 1180 1100 L 420 1100 Z'), { fill: C.pants, shade: C.pantsSh, sh: [0, -16], rim: C.cyan, rimD: [0, -3], rimA: .35, w: 3 });
    // far sleeve (behind the torso)
    cel(pth('M 790 616 C 748 628 722 674 714 744 C 706 812 712 860 736 896 L 804 894 C 794 836 792 750 806 680 Z'),
      { fill: '#4E4FCF', shade: C.jak, shadePts: pth('M 748 660 C 734 730 732 810 746 900 L 820 900 L 820 600 Z'), rim: C.cyan, rimD: [-6, 0], rimA: .9, w: 3 });
    // torso (oversized bomber, 3/4 facing left, hunched)
    const torso = pth('M 836 586 C 800 598 776 618 762 646 C 748 690 744 770 752 860 L 760 1100 L 1150 1100 C 1156 980 1150 840 1136 740 C 1126 670 1098 624 1050 598 C 1024 586 1000 580 990 580 Z');
    cel(torso, {
      fill: C.jak, shadePts: pth('M 920 640 C 950 700 966 770 1000 810 C 1030 846 1046 900 1046 1100 L 1300 1100 L 1300 560 L 1000 560 Z'), shade: C.jakSh,
      rim: C.mag, rimD: [5, -1], rimA: .95, w: 3.4, dir: [.7, .7],
      post: () => {
        fillP(pth('M 740 640 C 760 700 770 780 790 860 C 800 900 810 960 800 1100 L 700 1100 L 700 600 Z'), '#4E4FCF', .85);
        fillP(pth('M 1004 626 C 1030 650 1056 690 1070 730 C 1050 712 1030 690 1004 660 Z'), C.jakDeep, .8);
        X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(640, 820, 20, 640, 820, 320); g.addColorStop(0, 'rgba(70,230,255,.3)'); g.addColorStop(1, 'rgba(70,230,255,0)'); X.fillStyle = g; X.fillRect(400, 500, 600, 600); X.restore();
      }
    });
    ink(pth('M 1010 594 C 1046 626 1080 670 1098 736'), 2.4, { a: .2, b: .3, col: C.jakDeep });
    for (const f of ['M 1010 760 C 986 770 962 786 944 806', 'M 1016 800 C 990 816 972 836 960 860', 'M 790 700 C 800 720 806 744 808 770']) ink(pth(f), 2.2, { a: .15, b: .6, col: C.jakDeep });
    // shirt in the open front
    const shirt = pth('M 836 590 C 856 604 884 610 906 604 C 890 670 862 740 830 800 C 816 826 806 850 800 880 C 780 860 772 800 776 740 C 780 680 800 626 836 590 Z');
    cel(shirt, { fill: C.shirt, shadePts: pth('M 850 570 L 930 570 L 930 720 C 900 690 875 650 850 610 Z'), shade: C.shirtSh, w: 2.4, rim: C.cyan, rimD: [-3, 0], rimA: .4 });
    ink(pth('M 906 604 C 890 670 862 740 830 800 C 816 826 806 850 800 880'), 3, { a: .1, b: .2 });
    ink(pth('M 913 610 C 897 676 869 746 838 806'), 1.5, { col: C.ribHi, alpha: .5, a: .2, b: .2 });
    // collar back half
    cel(pth('M 836 606 C 840 560 894 538 944 540 C 990 542 1014 560 1022 596 C 992 584 968 580 944 580 C 900 580 866 590 836 606 Z'), { fill: C.ribSh, shade: '#6A2414', sh: [0, 10], rim: C.magSoft, rimD: [3, -2], rimA: .7, w: 2.6, post: () => { for (let i = 0; i < 10; i++) { const x = lerp(962, 1016, i / 9); ink([[x, 546 + i * 2], [x + 2, 580 + i * .5]], 1.4, { col: '#5A1C10', a: .2, b: .2 }); } } });
    assistantBack(t);
    // neck + head
    X.save(); X.translate(HX, HY); X.rotate(HR); X.scale(HS, HS);
    neck(t); head(t);
    X.restore();
    // collar front half (orange rib)
    cel(pth('M 834 598 C 866 616 904 624 942 618 C 976 612 1004 602 1022 590 C 1032 604 1032 624 1022 636 C 996 656 962 664 934 664 C 892 664 858 650 832 626 C 824 616 826 606 834 598 Z'),
      { fill: C.rib, shade: C.ribSh, shadePts: pth('M 966 560 L 1060 560 L 1060 680 L 946 680 C 976 650 986 620 966 560 Z'), rim: C.magSoft, rimD: [2, -3], rimA: .8, w: 3, dir: [.5, .9],
        post: () => { for (let i = 0; i < 18; i++) { const u = i / 17, x = lerp(840, 1018, u), yTop = 608 + Math.sin(u * Math.PI) * 14 - u * 16, yB = yTop + 30 + Math.sin(u * Math.PI) * 8; ink([[x, yTop + 4], [x + 2, yB - 4]], 1.8, { col: i > 11 ? '#6E2410' : C.ribSh, a: .2, b: .2 }); } } });
    ink(pth('M 910 620 L 914 662'), 2.2, { a: .1, b: .1 });
    // cast shadow of the collar and chin on the chest
    clipTo(pth('M 836 590 C 856 604 884 610 906 604 C 890 670 862 740 830 800 C 816 826 806 850 800 880 C 780 860 772 800 776 740 C 780 680 800 626 836 590 Z'), () => fillP(pth('M 760 600 C 820 660 900 670 960 630 L 960 560 L 760 560 Z'), '#07050E', .7));
    fillP(pth('M 912 640 C 950 668 1000 670 1036 640 L 1040 676 C 1000 700 950 700 906 676 Z'), C.jakSh, .9);
    // zipper tapes: a bright edge with small teeth down both sides of the opening
    const zipL = pth('M 836 598 C 812 640 790 700 784 760 C 780 800 786 840 798 876'), zipR = pth('M 908 612 C 892 676 864 744 832 802 C 818 828 808 852 802 878');
    ink(zipL, 3, { col: '#7C78E8', a: .05, b: .2, alpha: .8 }); ink(zipR, 3.4, { col: C.jakSh, a: .05, b: .2 }); ink(mv(zipR, 4, 2), 1.4, { col: '#9A92F0', a: .1, b: .3, alpha: .7 });
    pin(972, 708, 15);
    laptop(t);
    // near arm across the front
    const nearSleeve = pth('M 1026 592 C 1092 584 1148 624 1162 700 C 1174 770 1172 846 1152 896 C 1132 942 1090 966 1034 972 C 966 978 904 968 858 958 C 848 938 846 904 854 874 C 908 870 972 862 1022 846 C 1046 816 1044 770 1026 706 C 1016 660 1014 620 1026 592 Z');
    cel(nearSleeve, {
      fill: C.jak, shadePts: pth('M 1092 600 C 1126 680 1134 800 1114 892 C 1090 928 1044 940 980 944 L 850 934 L 850 1100 L 1300 1100 L 1300 520 Z'), shade: C.jakSh,
      rim: C.mag, rimD: [6, -2], rimA: 1, rim2: C.cyan, rim2D: [-3, -6], rim2A: .8, w: 3.4, dir: [.6, .8],
      post: () => {
        // elbow: creases radiating from the bend, each with a thin hard shadow on its underside
        for (const [d, sd] of [['M 1152 872 C 1130 866 1108 870 1088 882', 'M 1152 872 C 1130 872 1108 878 1088 882 C 1108 872 1130 862 1152 862 Z'],
          ['M 1024 846 C 1040 862 1062 874 1086 880', 'M 1024 846 C 1044 866 1064 878 1086 880 C 1060 882 1040 872 1020 856 Z'],
          ['M 994 862 C 1016 880 1040 892 1066 898', 'M 994 862 C 1018 884 1042 896 1066 898 C 1040 902 1016 892 990 874 Z']]) { fillP(pth(sd), C.jakDeep, .9); ink(pth(d), 2.4, { a: .1, b: .6 }); }
        // forearm drape folds toward the cuff
        for (const d of ['M 960 868 C 930 880 904 890 880 896', 'M 990 940 C 960 944 930 946 900 944']) ink(pth(d), 2, { a: .2, b: .5, col: C.jakDeep });
        ink(pth('M 1050 640 C 1066 670 1076 700 1080 730'), 2.2, { a: .2, b: .5, col: C.jakDeep });
      }
    });
    const pocket = pth('M 1068 700 L 1118 692 L 1124 764 L 1076 772 Z');
    cel(pocket, { fill: C.jakSh, shade: C.jakDeep, sh: [-4, 6], w: 2, rim: C.mag, rimD: [3, 0], rimA: .6 });
    ink(pth('M 1074 714 L 1118 707'), 1.8, { col: C.ribHi, alpha: .7 });
    const cuff = pth('M 800 872 L 856 870 C 862 894 864 928 858 956 L 804 960 C 796 932 794 900 800 872 Z');
    cel(cuff, { fill: C.rib, shade: C.ribSh, shadePts: pth('M 790 934 L 870 928 L 870 970 L 790 970 Z'), rim: C.cyanSoft, rimD: [-3, 0], rimA: .6, w: 2.8, post: () => { for (let i = 0; i < 7; i++) ink([[806 + i * 8, 876], [804 + i * 8, 956]], 1.4, { col: C.ribSh, a: .15, b: .15 }); } });
    handNear();
  }
  function neck(t) {
    const nk = pth('M -4 112 C -2 140 0 164 0 196 L 138 196 C 126 154 116 104 112 56 L 92 58 Z');
    cel(nk, {
      fill: C.skin, shadePts: pth('M -40 40 L 200 20 L 200 260 L 8 260 C 8 220 4 200 -40 190 Z'), shade: C.skinSh,
      rim: C.mag, rimD: [5, 0], rimA: .95, rim2: C.cyanSoft, rim2D: [-3, 0], rim2A: .6, w: 2.8, dir: [.8, .2],
      post: () => { fillP(pth('M -30 108 C 10 136 50 124 96 64 L 200 40 L 200 120 C 150 150 60 170 -30 150 Z'), C.skinDeep, .7); fillP(pth('M 70 60 L 200 40 L 200 260 L 110 260 C 104 190 90 130 70 60 Z'), C.skinDeep, .55); }
    });
  }
  // the head, in head space: origin between the eyes at eye level, +x toward the back of his head (he faces left)
  // fringe: 5 clumps of different lengths sweeping toward his gaze, one long lock crossing the near lens
  const FRINGE = 'M 70 -24 L 64 30 Q 62 0 54 -30 Q 52 -16 40 -6 Q 36 -34 22 -54 Q 16 -20 2 10 Q -4 -30 -12 -60 Q -20 -40 -30 -28 Q -32 -50 -42 -62 Q -48 -26 -60 4 Q -66 -34 -80 -56 Q -94 -34 -110 -16 Q -100 -32 -96 -40';
  const FR_TIPS = [[64, 30], [54, -30], [40, -6], [22, -54], [2, 10], [-12, -60], [-30, -28], [-42, -62], [-60, 4], [-80, -56], [-110, -16], [-96, -40]];
  const FACE_D = 'M -80 -100 L -88 -40 C -90 -26 -92 -14 -90 -6 C -86 2 -84 8 -86 14 C -90 22 -94 32 -92 40 C -88 60 -74 86 -60 106 L -46 126 C -43 131 -38 134 -33 132 C -10 124 20 110 50 92 C 66 82 78 70 84 58 C 88 44 90 24 92 0 L 100 -60 L 50 -140 L -30 -134 Z';
  function head(t) {
    const face = pth(FACE_D);
    const faceShadow = pth('M 44 -90 C 48 -50 52 -14 58 12 L 46 26 C 56 36 58 50 52 66 C 38 90 14 106 -12 122 L -20 170 L 190 170 L 190 -90 Z');
    cel(face, {
      fill: C.skin, shadePts: faceShadow, shade: C.skinSh,
      rim: C.mag, rimD: [5, 2], rimA: 1, rim2: C.cyanSoft, rim2D: [-3, 1], rim2A: .85, w: 3, dir: [.5, .85], lo: .4,
      post: () => {
        // hard shadow cast by the fringe: follows the clump tips, dropped a little
        const fs = FR_TIPS.map(([x, y], i) => [x - 5, y + (i % 2 ? 10 : 16)]);
        fillP([[150, -170], [150, -40], ...fs, [-140, -40], [-140, -170]], C.skinSh);
        fillP(pth('M -38 28 L -44 54 L -34 60 Z'), C.skinSh);
        fillP(pth('M -56 102 Q -46 108 -36 102 Q -44 112 -56 102 Z'), C.skinSh, .8);
        X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(-130, 150, 10, -130, 150, 190); g.addColorStop(0, 'rgba(90,230,255,.14)'); g.addColorStop(1, 'rgba(90,230,255,0)'); X.fillStyle = g; X.fillRect(-320, -100, 440, 440); X.restore();
        for (let i = 0; i < 4; i++) ink([[6 + i * 9, 46], [0 + i * 9, 56]], 2.1, { col: C.blush, alpha: .6, a: .3, b: .3 });
        fillP(ell(16, 50, 24, 8, 20), C.blush, .2);
        for (let i = 0; i < 2; i++) ink([[-82 + i * 8, 44], [-86 + i * 8, 52]], 1.8, { col: C.blush, alpha: .5, a: .3, b: .3 });
      }
    });
    const ear = pth('M 92 -22 C 104 -32 120 -24 120 -6 C 120 10 112 26 104 34 C 98 40 92 40 90 32 Z');
    cel(ear, { fill: C.skinSh, shade: C.skinDeep, sh: [-4, -2], rim: C.mag, rimD: [4, 0], rimA: 1, w: 2.6, dir: [.8, .5] });
    ink(pth('M 100 -12 C 110 -10 110 2 106 12 C 102 20 98 20 96 16'), 1.8, { a: .2, b: .3 });
    ink(pth('M -36 26 C -40 38 -48 50 -52 58 C -48 62 -42 62 -37 59'), 2.4, { a: .15, b: .35 });
    fillP(ell(-51, 52, 3, 2, 8), '#FFFFFF', .7);
    ink(pth('M -64 90 C -56 94 -46 95 -36 91 C -33 90 -31 87 -28 84'), 2.6, { a: .25, b: .2 });
    ink(pth('M -66 88 L -62 91'), 1.4, { a: 0, b: 0, alpha: .7 });
    ink(pth('M -18 -46 C -4 -44 20 -35 44 -22'), 5.8, { a: .08, b: .6 });
    ink(pth('M -38 -42 C -54 -39 -70 -32 -86 -21'), 4.4, { a: .1, b: .6 });
    eye(12, 17, 1.22, -7, t, true);
    eye(-63, 15, -.84, -7, t);
    glasses(t);
    hair(t);
  }
  // one anime eye (male design: flatter angular lid, heavy lash line, big glossy iris), downcast.
  // sx < 0 mirrors (outer corner to the left). gx: gaze offset in scene-x px (negative = left).
  function eye(cx, cy, sx, gx, t, tear = false) {
    X.save(); X.translate(cx, cy); X.scale(sx, Math.abs(sx));
    const white = pth('M -26 8 C -18 0 4 -1 28 4 C 27 12 22 18 16 21 C 6 25 -8 24 -18 19 C -22 16 -24 12 -26 8 Z');
    fillP(white, C.sclera);
    clipTo(white, () => {
      const ix = gx * Math.sign(sx), iy = 13, g = X.createLinearGradient(0, iy - 17, 0, iy + 17);
      g.addColorStop(0, C.irisDk); g.addColorStop(.5, C.iris); g.addColorStop(1, C.irisLt);
      X.fillStyle = g; X.beginPath(); X.ellipse(ix, iy, 13.5, 17.5, 0, 0, TAU); X.fill();
      X.strokeStyle = C.irisDk; X.lineWidth = 1.8; X.stroke();
      fillP(ell(ix, iy + 2, 5.5, 9, 20), '#12060A');
      fillP(pth('M -30 4 C -16 -4 8 -4 32 2 L 32 12 C 10 7 -14 8 -30 14 Z'), '#2A1440', .6);
      fillP([[ix - 10, iy - 1], [ix - 4, iy - 3], [ix - 3, iy + 3], [ix - 9, iy + 5]], C.cyanSoft, .95);
      fillP(ell(ix + 6, iy - 1, 3.8, 4.4, 14), '#FFFFFF');
      fillP(ell(ix - 2, iy + 11, 1.9, 1.9, 10), '#FFFFFF', .9);
      fillP(ell(ix + 7, iy + 9, 1.2, 1.2, 8), '#FFFFFF', .8);
      ink(pth('M -14 20 C -4 23 8 21 16 17'), 1.6, { col: '#FFFFFF', alpha: .85, a: .3, b: .3 });
    });
    ink(pth('M -27 9 C -18 0 4 -2 26 3 L 31 10'), 6.4, { a: .22, b: .06, min: .8 });
    fillP([[22, 1], [33, 4], [30, 13]], INK);
    ink(pth('M 4 25 C 12 24 18 20 23 14'), 2, { a: .4, b: .2 });
    ink(pth('M -10 -9 C 2 -12 16 -10 27 -5'), 1.6, { a: .3, b: .3, alpha: .8 });
    if (tear) {
      // a tear welling on the lower lid, catching the screen light
      const tr = pth('M 6 23 C 10 22 15 23 16 26 C 17 29 14 31 11 30.5 C 8 30 5 27 6 23 Z');
      fillP(tr, '#C8F8FF', .8); ink(tr, 1, { closed: true, col: '#5AA2C8', alpha: .7 });
      fillP(ell(12.5, 25.5, 1.4, 1.6, 10), '#FFFFFF');
      ink(pth('M -8 23 C 0 25.5 8 25 14 23'), 1.4, { col: '#E8FDFF', alpha: .8, a: .3, b: .2 });
    }
    X.restore();
  }
  function glasses(t) {
    const nearL = ell(15, 18, 45, 43, 64), farL = ell(-65, 16, 28, 41, 64);
    for (const L of [nearL, farL]) {
      fillP(L, '#7FE8FF', .05, 'lighter');
      clipTo(L, () => { X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = '#FFFFFF'; X.globalAlpha = .22; X.beginPath(); X.moveTo(20, -40); X.lineTo(70, -40); X.lineTo(70, -10); X.lineTo(40, 30); X.lineTo(26, 30); X.lineTo(62, -16); X.fill(); X.globalAlpha = .12; X.beginPath(); X.moveTo(-40, -40); X.lineTo(-30, -40); X.lineTo(-90, 40); X.lineTo(-100, 40); X.fill(); X.restore(); });
    }
    ink(nearL, 3.2, { closed: true, dir: [.4, .9], lo: .45, col: C.frame });
    ink(farL, 2.8, { closed: true, dir: [.4, .9], lo: .45, col: C.frame });
    ink(nearL.slice(22, 38), 1.2, { col: C.cyan, alpha: .9, a: .3, b: .3 });
    ink(farL.slice(24, 42), 1.2, { col: C.cyan, alpha: .9, a: .3, b: .3 });
    ink(pth('M -30 10 Q -34 0 -37 6'), 3, { a: .1, b: .1, col: C.frame });
    ink(pth('M 60 12 L 96 4'), 2.8, { a: .05, b: .3, col: C.frame });
  }
  function hair(t) {
    const Hp = pth(`M -98 36 Q -106 10 -104 -22 Q -118 -36 -134 -40 Q -122 -60 -120 -80 Q -136 -94 -148 -96 Q -128 -114 -122 -130
      Q -132 -150 -134 -170 Q -108 -160 -90 -172 Q -76 -196 -52 -208 Q -36 -196 -18 -200 Q 0 -222 12 -244 Q 20 -222 38 -212
      Q 44 -238 28 -266 Q 60 -250 60 -214 Q 86 -224 114 -228 Q 106 -206 118 -190 Q 146 -194 172 -186 Q 152 -166 156 -150
      Q 178 -136 190 -112 Q 170 -108 168 -86 Q 184 -62 188 -30 Q 170 -38 164 -18 Q 172 14 168 58 Q 154 36 146 30 Q 146 76 136 112
      Q 126 76 116 56 Q 110 20 104 -14 Q 96 -30 84 -30 Q 76 -30 70 -24 ${FRINGE.slice(FRINGE.indexOf('L'))} Q -96 -2 -98 36 Z`);
    cel(Hp, {
      fill: C.hair, shadePts: pth('M -180 -40 L -120 -40 L -60 -70 L 0 -66 L 60 -52 L 110 -44 L 150 -76 L 240 -96 L 240 120 L -180 120 Z'), shade: C.hairSh,
      w: 0,
      post: () => {
        // highlight band: smooth upper edge following the skull, irregular spikes hanging down the strands, broken at clump gaps
        const cs = [26, -50], dn = [-.34, .94];
        const pt = (a, r) => [cs[0] + Math.cos(a) * r, cs[1] + Math.sin(a) * r * .95];
        const icy = (a0, a1, R, th, col, al, seed, spk = 34) => {
          const n = Math.max(3, Math.round((a1 - a0) * R / 15)), top = [], bot = [];
          for (let i = 0; i <= n; i++) top.push(pt(lerp(a0, a1, i / n), R + (i % 3 === 1 ? 3 : 0) - (i === 0 || i === n ? th * .6 : 0)));
          for (let i = n; i >= 0; i--) {
            const b = pt(lerp(a0, a1, i / n), R - th); if (i < n && i > 0) bot.push(b); else bot.push(pt(lerp(a0, a1, i / n), R - th * .5));
            if (i > 0) { const m = pt(lerp(a0, a1, (i - .5) / n), R - th), len = spk * (.35 + hash(i * 7.7 + seed) * .9); bot.push([m[0] + dn[0] * len, m[1] + dn[1] * len]); }
          }
          fillP([...top, ...bot], col, al);
        };
        icy(-3.0, -2.5, 112, 8, C.hairHi, 1, 1, 30); icy(-2.42, -1.86, 122, 9, C.hairHi, 1, 2); icy(-1.78, -1.2, 128, 9, '#6247C0', 1, 3);
        icy(-1.12, -.62, 126, 9, '#7446C4', 1, 4); icy(-.54, -.08, 118, 8, '#8A48C4', 1, 5, 28);
        icy(-2.3, -1.98, 125, 4, C.hairHi2, .95, 6, 14); icy(-1.62, -1.34, 130, 4, C.hairHi2, .9, 7, 14); icy(-.98, -.72, 128, 4, C.magSoft, .95, 8, 14);
      }
    });
    X.save(); X.beginPath(); X.rect(-900, -900, 1800, 1800); addPts(pth(FACE_D)); X.clip('evenodd');
    crescent(Hp, -7, 3.5, C.mag, 1); crescent(Hp, 3, -2.5, C.cyan, .35);
    X.restore();
    ink(Hp, 4.6, { closed: true, dir: [.5, .8], lo: .4 });
    // clump separations: from the valleys between tips, sweeping back toward the whorl
    const whorl = [36, -158];
    const valleys = [[54, -30], [22, -54], [-12, -60], [-42, -62], [-80, -56], [-120, -80], [-122, -130], [-90, -172], [-18, -200], [60, -214], [118, -190], [156, -150], [168, -86], [164, -18], [146, 30], [116, 56]];
    valleys.forEach(([vx, vy], i) => {
      const k = .42 + hash(i * 3.3) * .16, mx = lerp(vx, whorl[0], k), my = lerp(vy, whorl[1], k), bend = (hash(i) - .5) * 30;
      ink(pth(`M ${vx} ${vy} Q ${lerp(vx, mx, .5) + bend} ${lerp(vy, my, .5)} ${mx} ${my}`), 3, { a: .05, b: .85, col: '#06040E' });
    });
    // a couple of thin loose strands over the face
    ink(pth('M -20 -44 Q -26 -10 -18 22'), 2, { a: .1, b: .9, col: C.hair });
    ink(pth('M 34 -40 Q 40 -14 34 8'), 1.8, { a: .1, b: .9, col: C.hair });
    ink(pth('M 38 -212 Q 44 -238 28 -266'), 2.2, { col: C.magSoft, a: .4, b: .1, alpha: .9 });
  }
  function pin(x, y, r) {
    glow(x, y, r * 2.2, '#FFE45A', .2);
    cel(ell(x, y, r, r * 1.05, 30), { fill: '#FFD93B', shade: '#C9A21E', sh: [-3, -4], w: 2.2 });
    ink([[x - r * .35, y - r * .45], [x - r * .33, y - r * .1]], 2.2, { a: .2, b: .2 });
    ink([[x + r * .3, y - r * .5], [x + r * .32, y - r * .15]], 2.2, { a: .2, b: .2 });
    ink(crv([[x - r * .5, y + r * .15], [x - r * .15, y + r * .5], [x + r * .5, y + r * .05]], false, 6), 2, { a: .2, b: .2 });
    fillP(ell(x - r * .4, y - r * .5, r * .22, r * .14, 10), '#FFFFFF', .8);
  }
  function laptop(t) {
    const N1 = [436, 628], F1 = [612, 590], N0 = [470, 880], F0 = [N0[0] + F1[0] - N1[0], N0[1] + F1[1] - N1[1]];
    const D = [238, 64], B2 = [N0[0] + D[0], N0[1] + D[1]], B3 = [F0[0] + D[0], F0[1] + D[1]];
    const base = [N0, F0, B3, B2];
    fillP([[N0[0] - 4, N0[1]], B2, [B2[0], B2[1] + 14], [N0[0] - 4, N0[1] + 14]], C.lapSh);
    cel(base, { fill: '#2E2B4C', shade: C.lapSh, sh: [0, -10], rim: C.cyan, rimD: [-3, 0], rimA: .6, w: 2.6 });
    clipTo(base, () => {
      X.strokeStyle = 'rgba(120,230,255,.2)'; X.lineWidth = 1;
      for (let i = 1; i < 9; i++) { const u = i / 9; X.beginPath(); X.moveTo(lerp(N0[0], F0[0], u) + D[0] * .1, lerp(N0[1], F0[1], u) + D[1] * .1); X.lineTo(lerp(N0[0], F0[0], u) + D[0] * .55, lerp(N0[1], F0[1], u) + D[1] * .55); X.stroke(); }
      for (let j = 1; j < 5; j++) { const v = .1 + j * .09; X.beginPath(); X.moveTo(N0[0] + D[0] * v, N0[1] + D[1] * v); X.lineTo(F0[0] + D[0] * v, F0[1] + D[1] * v); X.stroke(); }
    });
    fillP([[N1[0] - 12, N1[1] + 4], N1, N0, [N0[0] - 10, N0[1] + 2]], '#3A3660');
    ink([[N1[0] - 12, N1[1] + 4], [N0[0] - 10, N0[1] + 2]], 2.4, { a: .1, b: .1 });
    const lid = [N1, F1, F0, N0];
    cel(lid, { fill: '#0C0A18', w: 3, dir: [-.8, .3] });
    const inset = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    const S1 = inset(N1, F0, .05), S2 = inset(F1, N0, .05), S4 = inset(N0, F1, .06), S3 = inset(F0, N1, .06);
    X.save();
    const ux = (S2[0] - S1[0]) / 300, uy = (S2[1] - S1[1]) / 300, vx = (S4[0] - S1[0]) / 200, vy = (S4[1] - S1[1]) / 200;
    X.transform(ux, uy, vx, vy, S1[0], S1[1]);
    const g = X.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, '#2C84BE'); g.addColorStop(1, '#123E6E');
    X.fillStyle = g; X.fillRect(0, 0, 300, 200);
    X.fillStyle = 'rgba(210,250,255,.85)';
    for (const [rx, ry, rw] of [[20, 18, 180], [20, 32, 220], [20, 46, 120], [90, 70, 190], [90, 84, 150], [20, 108, 200], [20, 122, 240], [20, 136, 90]]) X.fillRect(rx, ry, rw, 6);
    X.fillStyle = 'rgba(255,255,255,.16)'; X.fillRect(80, 62, 206, 32);
    X.fillStyle = 'rgba(8,10,30,.78)'; X.fillRect(0, 160, 300, 40);
    X.font = '700 21px Rajdhani'; X.textBaseline = 'middle'; X.fillStyle = '#FF7A9E'; X.fillText('context 97%', 14, 180);
    X.fillStyle = 'rgba(255,90,130,.25)'; X.fillRect(140, 173, 146, 14);
    X.fillStyle = '#FF3D6E'; X.fillRect(140, 173, 146 * .97, 14);
    X.fillStyle = '#FFD0DC'; X.fillRect(140, 173, 146 * .97, 3);
    X.restore();
    glow((S1[0] + S3[0]) / 2, (S1[1] + S3[1]) / 2, 340, '#5FE9FF', .3);
    glow((S1[0] + S3[0]) / 2 + 60, (S1[1] + S3[1]) / 2 - 60, 170, '#BFF8FF', .16);
    X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = '#FFFFFF'; X.globalAlpha = .07; X.beginPath(); X.moveTo(S1[0], S1[1]); X.lineTo(lerp(S1[0], S2[0], .5), lerp(S1[1], S2[1], .5)); X.lineTo(S4[0], S4[1] - 60); X.lineTo(S4[0], S4[1] - 120); X.fill(); X.restore();
  }
  function handNear() {
    // his left hand, palm down on the keys: back of the hand, then four fingers curling onto the keyboard (far to near)
    const sk = { fill: C.skin, shade: C.skinSh, sh: [5, -7], rim: C.cyanSoft, rimD: [-3, -2], rimA: .9, w: 2.4, dir: [.3, 1] };
    const fingers = [[[752, 880], [728, 876], [712, 888]], [[750, 892], [724, 890], [710, 904]], [[748, 904], [724, 904], [712, 918]], [[746, 916], [726, 918], [718, 930]]];
    fingers.forEach((f, i) => cel(limbPts(f, [7.5, 6.5, 5.5 - i * .3]), { ...sk, w: 2 }));
    const back = pth('M 806 878 C 786 868 762 868 744 874 C 736 890 736 908 742 924 C 760 930 786 932 806 928 Z');
    cel(back, { ...sk, shadePts: pth('M 740 912 C 770 916 796 912 812 904 L 812 940 L 736 940 Z') });
    ink(pth('M 752 882 C 766 884 780 884 792 880'), 1.4, { a: .3, b: .3, alpha: .6 });
  }

  // ---------------------------------------------------------------- the Assistant, on his shoulder, nuzzling his neck
  const AO = [1068, 612];
  const cA = (pts, w = 2.6) => cel(pts, { fill: C.ay, shade: C.aySh, sh: [-7, -8], rim: C.mag, rimD: [4, 0], rimA: .9, w, dir: [.6, .8] });
  function assistantBack(t) {
    // its far arm reaches round the back of his neck (drawn before his neck, so it disappears behind it)
    X.save(); X.translate(AO[0], AO[1]);
    cA(limbPts([[-40, -58], [-74, -70], [-104, -66]], [8, 7.5, 7]));
    X.restore();
  }
  function assistantA(t) {
    X.save(); X.translate(AO[0], AO[1]);
    glow(-70, -100, 190, C.mask, .15);
    // stubby legs dangling over the front of his shoulder, little rounded feet
    cA(limbPts([[-6, -8], [-30, 4], [-32, 44]], [12, 11, 9.5]));
    cA(ell(-38, 50, 12, 8, 20, -.2), 2.2);
    cA(limbPts([[10, -4], [-8, 12], [-8, 50]], [12, 11, 9.5]));
    cA(ell(-14, 56, 12, 8, 20, -.2), 2.2);
    // compact bean of a body, leaning in against him
    cA(limbPts([[2, -12], [-14, -34], [-32, -58]], [22, 21, 17]), 2.8);
    // head (the mask) resting against his jaw
    maskA(-70, -104, 42, -.5, { rimD: [3, 1], blush: 1, glow: 1 });
    // near arm up to his jaw, a little hand on his cheek
    cA(limbPts([[-26, -56], [-52, -46], [-76, -58]], [8, 7.5, 7]));
    cA(ell(-80, -62, 9.5, 8.5, 18), 2.2);
    X.restore();
  }

  // ---------------------------------------------------------------- the shot
  function shot(t) {
    style(1); FX.noAuto = true; FX.bloom = .4; FX.scan = .1;
    X.fillStyle = C.wall; X.fillRect(0, 0, W, H);
    camBegin(1000, 552, 1.16, -.075);
    vgrad(-300, -300, W + 600, H + 700, [[0, '#0E0B26'], [.55, '#161133'], [1, '#0A0818']]);
    windowA(t);
    halftone(1560, -40, 2100, 700, '#07040F', .55, 14, [0, 1]);
    halftone(-200, -40, 170, 700, '#07040F', .5, 14, [-1, 0]);
    lampA(t);
    couchBack(t);
    armRight();
    shoggothA(t);
    heroA(t);
    assistantA(t);
    for (let i = 0; i < 30; i++) { const mx = 1500 + hash(i * 3.1) * 400, my = 300 + ((hash(i * 7.7) * 600 + t * 12) % 600); X.fillStyle = '#FFE2A8'; X.globalAlpha = .3 + hash(i) * .4; X.beginPath(); X.arc(mx, my, 1.2 + hash(i * 2) * 1.8, 0, TAU); X.fill(); }
    X.globalAlpha = 1;
    camEnd();
    const v = X.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(8,4,20,0)'); v.addColorStop(1, 'rgba(8,4,20,.72)');
    X.fillStyle = v; X.fillRect(0, 0, W, H);
    glow(0, H, 520, C.cyan, .1); glow(W, 0, 620, C.mag, .09);
  }

  chapter('actionanime', K, K + 1, [[K, shot]]);
})();
