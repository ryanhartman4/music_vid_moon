// papercut.js: style study, slot 7. Construction-paper cutout diorama.
// Every piece is a scissor-cut polygon (faceted, slightly irregular edge) of fibrous paper, lifted off the layer below
// with a soft drop shadow and a hairline cut-edge bevel. Light is translucent tissue paper laid over the set.
(() => {
  const K = 7;
  const C = {
    wall: '#2B3D5C', wall2: '#27385A', rod: '#3A2E2A',
    sky: ['#1A1D48', '#23275C', '#303270', '#453F82', '#62508F', '#8A6497', '#B07A98'],
    cloud: '#4D4A86', cloud2: '#3B3A74',
    cityFar: '#3E4380', cityMid: '#2A2F60', cityNear: '#1A1E42', win: '#F3C65C', win2: '#FFE7A2', winCool: '#9ED3E4',
    moon: '#F4E8C6', moonDk: '#E0CFA2', star: '#F4E8C6', rain: '#A9C3EA', drop: '#D5E8F7',
    frame: '#CDBFA3', frameDk: '#A99A7E', curtain: '#5A3F68', curtainDk: '#46304F', curtainHi: '#6C4E7B',
    couch: '#A35B63', couchDk: '#7E404B', couchHi: '#B46B70', pillow: '#D7A444', pillowDk: '#B8862F',
    blanket: '#DCD0B6', blanketFold: '#C2B597', blanketStripe: '#C1716E', blanketStripe2: '#6F8FA8',
    skin: '#EEBF9D', skinDk: '#D39A7E', skinSh: '#C58670', nose: '#E6AB8C', blush: '#EC8C8A', lip: '#7A3B45',
    hair: '#2A2233', hairHi: '#4E4063', brow: '#2A2233', eye: '#1E1824',
    jacket: '#4C3F98', jacketDk: '#382C78', jacketHi: '#6E5DBE', sleeveRim: '#6A7BC8', rib: '#F28C36', ribDk: '#CF6A20',
    shirt: '#24212F', zip: '#8F8AA8', pants: '#34324A', pantsHi: '#4C4A68', pantsDk: '#282739', pin: '#F6DE4A',
    glasses: '#1D1924', lens: '#BDE8F5',
    lapTop: '#A9AEC0', lapEdge: '#6F7488', lapKeys: '#5B6074', bezel: '#2E3140', screen: '#2C6272', ui: '#9ADCE8', ui2: '#EEF3E2', bar: '#FF5476', barBg: '#15323D',
    ast: '#F5FA83', astBody: '#EAF06E', astDk: '#CDD352', astInk: '#2E2A26', astBlush: '#F4A07C',
    shog: '#99B087', shogDk: '#7F9A6E', shogLid: '#A9BF97', shogLine: '#26301F', shogEye: '#FBF8EC',
    shade: '#F2C466', shadeDk: '#D99B3E', bulb: '#FFF0B8', pole: '#5C4632',
    warm: '#FFB858', warm2: '#FFD688', cool: '#8FE3FF'
  };

  // ---------- seeded randomness (stable per piece: paper does not boil) ----------
  const R32 = s => { let a = (Math.floor(Math.abs(s) * 7919) ^ 0x9E3779B9) >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  let SEED = 1;

  // ---------- paper textures (fibre tiles, built once) ----------
  let TX = null;
  function textures() {
    if (TX) return TX;
    const S = 512, wrap = (fn) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) fn(dx, dy); };
    const r = R32(4242);
    // dark tile (multiplied): cloudy mottling, tooth, dark fibres
    const D = mkCanvas(S, S); let c = D.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, S, S);
    const n = mkCanvas(20, 20), nc = n.getContext('2d'), nd = nc.createImageData(20, 20);
    for (let i = 0; i < nd.data.length; i += 4) { const v = 222 + r() * 33; nd.data[i] = v; nd.data[i + 1] = v; nd.data[i + 2] = v - 2; nd.data[i + 3] = 255; }
    nc.putImageData(nd, 0, 0);
    const big = mkCanvas(60, 60), bc = big.getContext('2d'); for (const a of [0, 20, 40]) for (const b of [0, 20, 40]) bc.drawImage(n, a, b);
    c.imageSmoothingEnabled = true; c.drawImage(big, -S, -S, 3 * S, 3 * S);
    const id = c.getImageData(0, 0, S, S), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const k = .9 + .1 * r() - (r() < .006 ? .18 : 0); d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; }
    c.putImageData(id, 0, 0);
    c.lineCap = 'round';
    for (let i = 0; i < 1100; i++) {
      const x = r() * S, y = r() * S, l = 4 + r() * 20, a = r() * TAU, bend = (r() - .5) * 1.4;
      c.strokeStyle = `rgba(70,55,45,${.05 + r() * .12})`; c.lineWidth = .5 + r() * .8;
      wrap((dx, dy) => { c.beginPath(); c.moveTo(x + dx, y + dy); c.quadraticCurveTo(x + dx + Math.cos(a + bend) * l * .5, y + dy + Math.sin(a + bend) * l * .5, x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); c.stroke(); });
    }
    // light tile (screened): pale fibres and flecks
    const L = mkCanvas(S, S); c = L.getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, S, S); c.lineCap = 'round';
    for (let i = 0; i < 900; i++) {
      const x = r() * S, y = r() * S, l = 3 + r() * 16, a = r() * TAU, bend = (r() - .5) * 1.6;
      c.strokeStyle = `rgba(255,248,235,${.07 + r() * .22})`; c.lineWidth = .4 + r() * .7;
      wrap((dx, dy) => { c.beginPath(); c.moveTo(x + dx, y + dy); c.quadraticCurveTo(x + dx + Math.cos(a + bend) * l * .5, y + dy + Math.sin(a + bend) * l * .5, x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); c.stroke(); });
    }
    for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,250,240,${.1 + r() * .25})`; c.fillRect(r() * S, r() * S, 1 + r(), 1 + r()); }
    TX = { D: X.createPattern(D, 'repeat'), L: X.createPattern(L, 'repeat') };
    return TX;
  }

  // ---------- geometry ----------
  const ell = (cx, cy, rx, ry, n = 14, rot = 0) => { const p = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * c - y * s, cy + x * s + y * c]); } return p; };
  const box = (x, y, w, h) => [[x, y, 1], [x + w, y, 1], [x + w, y + h, 1], [x, y + h, 1]];
  const rbox = (x, y, w, h, r) => { r = Math.min(r * 2, w / 2, h / 2); return [[x, y + r], [x, y], [x + r, y], [x + w - r, y], [x + w, y], [x + w, y + r], [x + w, y + h - r], [x + w, y + h], [x + w - r, y + h], [x + r, y + h], [x, y + h], [x, y + h - r]]; };
  const quad4 = (a, b, c, d) => [[...a, 1], [...b, 1], [...c, 1], [...d, 1]];
  // local frame: (x, y) in units → screen, keeps the sharp flag
  const frame = (ox, oy, s = 1, rot = 0) => { const c = Math.cos(rot), si = Math.sin(rot); return p => [ox + (p[0] * c - p[1] * si) * s, oy + (p[0] * si + p[1] * c) * s, p[2]]; };
  const map = (pts, f) => pts.map(f);
  // open smooth spine (midpoint quadratic), dense
  function spline(pts, k = 10) {
    const n = pts.length; if (n < 3) return pts.slice();
    const out = [pts[0]], m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = pts[0];
    for (let i = 1; i < n - 1; i++) {
      const c = pts[i], e = i === n - 2 ? pts[n - 1] : m(pts[i], pts[i + 1]);
      for (let j = 1; j <= k; j++) { const u = j / k, v = 1 - u; out.push([v * v * s[0] + 2 * v * u * c[0] + u * u * e[0], v * v * s[1] + 2 * v * u * c[1] + u * u * e[1]]); }
      s = e;
    }
    return out;
  }
  // tapered strip along a spine: w(k) half width
  function strip(spine, w, k = 10) { return ribbon(spline(spine, k), w); }
  const taper = (w0, w1 = w0 * .3, p = .5) => k => lerp(w0, w1, Math.pow(k, p));
  const sliverW = (w, p = .55) => k => w * Math.pow(Math.max(0, Math.sin(Math.PI * (k * .92 + .04))), p);
  // grow control points outward (for dark backing papers)
  function grow(pts, d) {
    const n = pts.length; let area = 0;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    const sg = area > 0 ? 1 : -1;
    return pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      let nx = (b[1] - a[1]), ny = -(b[0] - a[0]); const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      return [p[0] + nx * d * sg, p[1] + ny * d * sg, p[2]];
    });
  }

  // ---------- scissors: control shape → dense curve → faceted snips ----------
  function dense(pts, curv = true) {
    const n = pts.length, out = [], add = (x, y, k) => out.push([x, y, k]);
    const seg = (a, b, incA) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / 2.5)); for (let j = incA ? 0 : 1; j < k; j++) add(a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k, 0); };
    if (!curv) { for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; add(a[0], a[1], 1); seg(a, b, false); } return out; }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = mid(pts[(i - 1 + n) % n], p), b = mid(p, pts[(i + 1) % n]);
      if (p[2]) { seg(a, p, true); add(p[0], p[1], 1); seg(p, b, false); }
      else { const L = Math.hypot(p[0] - a[0], p[1] - a[1]) + Math.hypot(b[0] - p[0], b[1] - p[1]), k = Math.max(2, Math.ceil(L / 2.5)); for (let j = 0; j < k; j++) { const u = j / k, v = 1 - u; add(v * v * a[0] + 2 * v * u * p[0] + u * u * b[0], v * v * a[1] + 2 * v * u * p[1] + u * u * b[1], 0); } }
    }
    return out;
  }
  function cut(pts, o = {}) {
    const d = dense(pts, o.curv ?? true);
    let per = 0; for (let i = 0; i < d.length; i++) { const a = d[i], b = d[(i + 1) % d.length]; per += Math.hypot(b[0] - a[0], b[1] - a[1]); }
    const step = Math.min(o.step ?? 17, per / 11), jag = o.jag ?? Math.min(1.5, step * .085), r = R32(o.seed ?? SEED++);
    const out = []; let acc = 0, nxt = step * (.4 + r() * .8);
    for (let i = 0; i < d.length; i++) {
      const p = d[i], q = d[(i + 1) % d.length];
      if (p[2] || acc >= nxt) { out.push([p[0] + (r() * 2 - 1) * jag, p[1] + (r() * 2 - 1) * jag]); acc = 0; nxt = step * (.6 + r() * .8); }
      acc += Math.hypot(q[0] - p[0], q[1] - p[1]);
    }
    return out;
  }

  // ---------- a paper piece: shadow, fill, fibres, cut-edge bevel ----------
  function trace(c, polys) { c.beginPath(); for (const p of polys) { if (p.length < 3) continue; c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); c.closePath(); } }
  function bboxP(polys) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of polys) for (const [x, y] of p) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return { x: x0, y: y0, w: x1 - x0 || 1, h: y1 - y0 || 1 }; }
  function piece(polys, fill, o = {}) {
    if (!polys.length) return;
    if (!Array.isArray(polys[0][0])) polys = [polys];
    const c = X, A = o.alpha ?? 1, lift = o.lift ?? 1, rule = o.rule || 'nonzero', tissue = o.comp === 'screen';
    if (A <= .002) return;
    c.save(); c.globalAlpha = A;
    if (o.comp) c.globalCompositeOperation = o.comp;
    trace(c, polys);
    if (lift > 0) { c.shadowColor = `rgba(8,5,22,${o.shA ?? .55})`; c.shadowBlur = 2 + lift * 4.5; c.shadowOffsetX = -lift * 1.3; c.shadowOffsetY = lift * 2.7; }
    c.fillStyle = fill; c.fill(rule);
    c.shadowColor = 'rgba(0,0,0,0)'; c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0;
    const tk = o.tex ?? 1, bv = o.bevel ?? (tissue ? 0 : 1);
    if (tk > 0 || bv > 0) {
      c.clip(rule);
      const b = bboxP(polys), r = R32(o.tseed ?? (b.x * 1.37 + b.y * 7.71 + b.w * .3 + 11));
      if (tk > 0) {
        const m = new DOMMatrix().translate(r() * 512, r() * 512).rotate(r() * 360).scale(o.tscale ?? 1);
        TX.D.setTransform(m); TX.L.setTransform(m);
        if (!tissue) { c.globalCompositeOperation = 'multiply'; c.globalAlpha = A * tk; c.fillStyle = TX.D; c.fillRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8); }
        c.globalCompositeOperation = 'screen'; c.globalAlpha = A * tk * (tissue ? .35 : .5); c.fillStyle = TX.L; c.fillRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      }
      if (!tissue && b.h > 140 && o.curl !== 0) {
        // big sheets never lie quite flat: a little lighter where they lift toward the light, darker where they sag
        const gg = c.createLinearGradient(0, b.y, 0, b.y + b.h);
        gg.addColorStop(0, 'rgba(255,245,230,.06)'); gg.addColorStop(.45, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(10,5,25,.16)');
        c.globalCompositeOperation = 'source-over'; c.globalAlpha = A * (o.curl ?? 1); c.fillStyle = gg; c.fillRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      }
      if (bv > 0) {
        c.globalCompositeOperation = 'source-over'; c.lineJoin = 'round'; c.lineWidth = o.bw ?? 2.4;
        c.globalAlpha = A * .22 * bv; c.strokeStyle = '#FFF4E2'; c.translate(-1.1, 1.5); trace(c, polys); c.stroke();
        c.globalAlpha = A * .3 * bv; c.strokeStyle = '#0A0618'; c.translate(2.2, -3); trace(c, polys); c.stroke();
      }
    }
    c.restore();
  }
  // cut + paste in one go
  const P = (pts, fill, o = {}) => { const poly = cut(pts, o); piece(poly, fill, o); return poly; };
  const PM = (list, fill, o = {}) => piece(list.map(p => cut(p, { ...o, seed: undefined })), fill, o);
  // piece glued on a slightly larger dark backing paper (the shoggoth's "outline")
  const PB = (pts, fill, back, d, o = {}) => { piece(cut(grow(pts, d), { ...o, seed: undefined }), back, { ...o, lift: o.lift ?? 1.2 }); return P(pts, fill, { ...o, lift: o.inner ?? .45 }); };
  // tissue-paper light: stacked translucent torn discs, screened over whatever is below
  function tissue(cx, cy, r, col, a, o = {}) {
    const n = o.n ?? 4;
    for (let i = 0; i < n; i++) {
      const k = 1 - i / n * (o.shrink ?? .7), rr = r * k;
      const pts = o.shape ? o.shape(k, i) : ell(cx + (o.dx ?? 0) * i, cy + (o.dy ?? 0) * i, rr, rr * (o.sq ?? 1), 16, i * .9);
      piece(cut(pts, { step: o.step ?? Math.max(10, rr / 8), jag: o.jag ?? Math.max(1.2, rr * .018), seed: (o.seed ?? 9) * 31 + i }), i === n - 1 && o.core ? o.core : col, { comp: 'screen', alpha: a, lift: 0, tex: .6 });
    }
  }

  // ---------- the set ----------
  const WIN = { x: 150, y: 70, w: 870, h: 560 };
  function wall() {
    P(box(-30, -30, W + 60, H + 60), C.wall, { lift: 0, step: 60, tscale: 1.4, curl: 0 });
    // a second sheet with a torn left edge (the backdrop is two papers)
    const r = R32(77), e = []; for (let y = -30; y <= H + 30; y += 26) e.push([1480 + (r() - .5) * 16 + Math.sin(y * .02) * 10, y]);
    P([[W + 30, -30, 1], ...e, [W + 30, H + 30, 1]], C.wall2, { lift: .5, step: 9, jag: 2.2, tscale: 1.3, curl: 0 });
  }
  function windowScene(t) {
    const { x, y, w, h } = WIN, tq = Math.floor(t * 12) / 12;
    X.save(); X.beginPath(); X.rect(x, y, w, h); X.clip();
    // sky: stacked strips with wavy scissor tops, dark at the top, dusk-pink at the horizon
    const bands = [y - 20, 205, 285, 355, 415, 468, 520];
    bands.forEach((by, i) => {
      const r = R32(300 + i), pts = [[x - 30, h + y + 40, 1]];
      for (let xx = x - 30; xx <= x + w + 30; xx += 70) pts.push([xx, by + Math.sin(xx * .012 + i * 1.7) * 9 + (r() - .5) * 8]);
      pts.push([x + w + 30, h + y + 40, 1]);
      P(pts, C.sky[i], { lift: i ? .6 : 0, step: 22, tscale: 1.2 });
    });
    // stars: tiny punched dots
    const st = []; for (let i = 0; i < 16; i++) { const sx = x + 30 + hash(i * 3.1 + 2) * (w - 60), sy = y + 100 + hash(i * 5.7 + 1) * 190; if (Math.hypot(sx - 545, sy - 255) < 95) continue; const rr = 1.8 + hash(i) * 2; st.push(ell(sx, sy, rr, rr, 6)); }
    PM(st, C.star, { lift: .3, bevel: 0, tex: .3, alpha: .85 });
    // moon: paper circle with a tissue halo and cut craters
    tissue(545, 255, 160, '#8A80C4', .15, { n: 3, seed: 5, dx: 6, dy: -4 });
    P(ell(545, 255, 62, 62, 18), C.moon, { lift: 1.6, step: 14 });
    PM([ell(523, 235, 13, 12, 9), ell(567, 270, 9, 8, 8), ell(533, 287, 7, 6, 7), ell(571, 230, 6, 6, 7)], C.moonDk, { lift: .35, bevel: .6 });
    // clouds: scalloped strips drifting over
    const cloud = (cx, cy, len, hh, sd) => { const r = R32(sd), pts = [[cx - len / 2, cy + hh, 1]]; let xx = cx - len / 2; while (xx < cx + len / 2) { const bw = 30 + r() * 40, k = hh * (.5 + r() * .7); pts.push([xx + bw * .08, cy - k * .55], [xx + bw * .3, cy - k * 1.05], [xx + bw * .7, cy - k * 1.05], [xx + bw * .92, cy - k * .55], [xx + bw, cy + 2, 1]); xx += bw; } pts.push([cx + len / 2, cy + hh, 1]); return pts; };
    P(cloud(640, 322, 330, 24, 3), C.cloud, { lift: 1.2, step: 12 });
    P(cloud(860, 196, 280, 20, 4), C.cloud2, { lift: .9, step: 12 });
    // city: three layers of cut buildings, each lifted a little more
    const layers = [[C.cityFar, 360, 470, 60, 120, 11, .7], [C.cityMid, 420, 520, 55, 110, 23, 1], [C.cityNear, 480, 570, 70, 140, 37, 1.4]];
    layers.forEach(([col, top0, top1, w0, w1, sd, lift], L) => {
      const r = R32(sd), polys = [], wins = [[], [], []], ant = [];
      let bx = x - 40 - r() * 40;
      while (bx < x + w + 40) {
        const bw = w0 + r() * (w1 - w0), top = top0 + r() * (top1 - top0), kind = r(), base = y + h + 40;
        let pts;
        if (kind < .22) { const h2 = 20 + r() * 30; pts = [[bx, base, 1], [bx, top, 1], [bx + bw * .22, top, 1], [bx + bw * .22, top - h2, 1], [bx + bw * .78, top - h2, 1], [bx + bw * .78, top, 1], [bx + bw, top, 1], [bx + bw, base, 1]]; }
        else if (kind < .36) pts = [[bx, base, 1], [bx, top, 1], [bx + bw * .5, top - bw * .45, 1], [bx + bw, top, 1], [bx + bw, base, 1]];
        else pts = box(bx, top, bw, base - top);
        if (kind > .8) ant.push(box(bx + bw * .6, top - 38, 4, 40));
        polys.push(pts);
        const cw = 13 + L * 2, rh = 17 + L * 3, cols = Math.floor((bw - 12) / cw);
        for (let yy = top + 12; yy < y + h; yy += rh) for (let cc = 0; cc < cols; cc++) { const hv = r(); if (hv < .34) { const k = hv < .04 ? 2 : hv < .1 ? 1 : 0; wins[k].push(box(bx + 8 + cc * cw, yy, 5 + L, 7 + L)); } }
        bx += bw + r() * 12 - 3;
      }
      piece(polys.map(p => cut(p, { step: 20 })), col, { lift, tscale: 1.1 });
      if (ant.length) PM(ant, col, { lift: lift * .8, bevel: .5 });
      const wc = [C.win, C.win2, C.winCool];
      wins.forEach((ws, k) => { if (ws.length) PM(ws, wc[k], { lift: .25, bevel: 0, tex: .4, alpha: L === 0 ? .7 : .95, step: 4, jag: .5 }); });
    });
    // rain: cut paper strips falling (stop-motion on twos)
    const drops = [];
    for (let i = 0; i < 70; i++) {
      const sp = 380 + hash(i * 1.3) * 160, len = 22 + hash(i * 2.9) * 22, rx = x + hash(i * 3.7) * (w + 60) - 30 + tq * 70 * .12;
      const ry = y - 60 + frac(hash(i * 7.3) + tq * sp / (h + 120)) * (h + 120);
      const a = .13, dx = Math.sin(a), dy = Math.cos(a), ww = 1.3;
      drops.push([[rx - dy * ww, ry + dx * ww, 1], [rx + dy * ww, ry - dx * ww, 1], [rx + dy * ww - dx * len, ry - dx * ww - dy * len, 1], [rx - dy * ww - dx * len, ry + dx * ww - dy * len, 1]]);
    }
    piece(drops.map((p, i) => cut(p, { curv: false, step: 40, jag: .3, seed: 900 + i })), C.rain, { lift: .5, alpha: .7, bevel: 0, tex: .3 });
    // wet glass: vellum drops with little streak tails
    const beads = [], tails = [];
    for (let i = 0; i < 26; i++) {
      const gx = x + 20 + hash(i * 4.1 + 7) * (w - 40), gy = y + 20 + frac(hash(i * 6.3 + 3) + tq * (.01 + hash(i) * .03)) * (h - 60), rr = 3 + hash(i * 2.2) * 4;
      beads.push(ell(gx, gy, rr * .85, rr, 8));
      if (hash(i * 9.1) < .55) { const L = 30 + hash(i * 3.3) * 90; tails.push(strip([[gx, gy - L], [gx + Math.sin(i) * 3, gy - L * .5], [gx, gy - rr]], k => .6 + k * rr * .35, 6)); }
    }
    piece(tails.map(p => cut(p, { curv: false, step: 8, jag: .5 })), C.drop, { lift: .2, alpha: .28, bevel: 0, tex: .3 });
    piece(beads.map(p => cut(p, { step: 3, jag: .3 })), C.drop, { lift: .8, alpha: .55, bevel: 1, tex: .3 });
    X.restore();
    // frame: cream paper strips
    const fw = 24;
    PM([box(x + w / 2 - 8, y, 16, h), box(x, y + 250, w, 15)], C.frame, { lift: 1.2 });
    PM([box(x - fw, y - fw, w + fw * 2, fw), box(x - fw, y - fw, fw, h + fw * 2), box(x + w, y - fw, fw, h + fw * 2), box(x - fw, y + h, w + fw * 2, fw)], C.frame, { lift: 1.8 });
    PM([box(x - fw + 5, y - fw + 5, w + fw * 2 - 10, 6), box(x - fw + 5, y - fw + 5, 6, h + fw * 2 - 10)], C.frameDk, { lift: .3, bevel: 0 });
  }
  function curtain() {
    P(box(100, 50, 1000, 12), C.rod, { lift: 1.4 });
    const pts = [[130, 58, 1], [372, 58, 1], [350, 200], [384, 330], [356, 470], [390, 640, 1], [120, 640, 1]];
    P(pts, C.curtain, { lift: 2.4, step: 20 });
    PM([strip([[270, 60], [262, 300], [282, 640]], k => 9 + k * 7), strip([[330, 60], [318, 250], [346, 640]], k => 5 + k * 7)], C.curtainDk, { lift: .4, bevel: .5 });
    P(strip([[300, 60], [292, 240], [312, 640]], k => 3 + k * 4), C.curtainHi, { lift: .3, bevel: .4 });
  }
  const LAMP = { x: 1650, y: 330 };
  function lamp() {
    const { x: lx, y: ly } = LAMP;
    // the light on the wall: a soft warm bloom with torn tissue discs laid over it (off-centre, not a target)
    const m = X.createRadialGradient(lx, ly + 20, 30, lx, ly + 20, 600);
    m.addColorStop(0, 'rgba(255,190,120,.9)'); m.addColorStop(.5, 'rgba(255,200,150,.45)'); m.addColorStop(1, 'rgba(255,220,180,0)');
    X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = m; X.fillRect(lx - 620, ly - 600, 1240, 1240);
    const g = X.createRadialGradient(lx, ly + 20, 30, lx, ly + 20, 560);
    g.addColorStop(0, 'rgba(255,200,110,.7)'); g.addColorStop(.3, 'rgba(255,165,70,.3)'); g.addColorStop(1, 'rgba(255,140,50,0)');
    X.globalCompositeOperation = 'screen'; X.fillStyle = g; X.fillRect(lx - 600, ly - 580, 1200, 1200); X.restore();
    tissue(lx - 30, ly + 40, 470, '#FFA04A', .1, { n: 3, seed: 21, shrink: .6, dx: 22, dy: -16, sq: .92 });
    P(box(lx - 6, ly + 90, 12, 220), C.pole, { lift: 1.4 });
    P([[lx - 78, ly - 92, 1], [lx + 78, ly - 92, 1], [lx + 122, ly + 96, 1], [lx - 122, ly + 96, 1]], C.shade, { lift: 2.4, step: 18 });
    PM([strip([[lx - 40, ly - 86], [lx - 58, ly + 90]], () => 5, 2), strip([[lx + 40, ly - 86], [lx + 60, ly + 90]], () => 5, 2)], C.shadeDk, { lift: .3, bevel: .4, alpha: .8 });
    P(strip([[lx - 114, ly + 92], [lx, ly + 102], [lx + 114, ly + 92]], k => 6 + 3 * Math.sin(k * Math.PI), 8), C.bulb, { lift: .4, bevel: 0 });
    tissue(lx, ly, 175, C.warm2, .17, { n: 3, seed: 23, sq: .9, dx: -8, dy: 10 });
  }
  function couch() {
    P(rbox(40, 588, 1640, 520, 46), C.couch, { lift: 2.4, step: 24 });
    PM([rbox(236, 612, 430, 262, 44), rbox(652, 606, 470, 268, 44), rbox(1112, 612, 460, 262, 44)], C.couchHi, { lift: 1.6, step: 22 });
    // seams on the back cushions
    PM([strip([[260, 842], [640, 846]], () => 2.2, 2), strip([[680, 840], [1100, 844]], () => 2.2, 2)], C.couchDk, { lift: 0, bevel: 0, alpha: .6 });
    P(rbox(150, 846, 1480, 300, 30), C.couch, { lift: 1.6, step: 24 });
    P(box(150, 960, 1480, 140), C.couchDk, { lift: .6, step: 30 });
    P(rbox(18, 690, 222, 440, 60), C.couch, { lift: 2.6, step: 20 });
    P(rbox(30, 690, 196, 60, 30), C.couchHi, { lift: .8, step: 16 });
    P(rbox(1590, 690, 230, 440, 60), C.couch, { lift: 2.6, step: 20 });
    P(rbox(1604, 690, 204, 60, 30), C.couchHi, { lift: .8, step: 16 });
    // mustard throw pillow, tilted, behind his near arm
    const fp = frame(1500, 760, 1, .18);
    P(map([[-78, -70], [0, -84], [78, -70], [84, 0], [76, 72], [0, 82], [-80, 72], [-86, 0]], fp), C.pillow, { lift: 2.2, step: 16 });
    P(map(strip([[-40, -50], [-4, -8], [42, 44]], sliverW(4), 8), fp), C.pillowDk, { lift: .2, bevel: 0, curv: false, alpha: .7 });
    // a closed notebook and pencil left on the seat beside him
    const nf = frame(1500, 905, 1, -.12);
    P(map(rbox(-86, -22, 172, 44, 4), nf), '#3F6F72', { lift: 1.6, step: 16 });
    P(map(box(-80, -26, 160, 8), nf), '#EDE4CF', { lift: .6, step: 14 });
    PM([map(box(-90, -12, 6, 6), nf), map(box(-90, 0, 6, 6), nf), map(box(-90, 12, 6, 6), nf)], '#B9B2A2', { lift: .4, bevel: 0 });
    P(map(strip([[-40, 34], [70, 26]], () => 4.5, 2), nf), '#E3B23C', { lift: 1.4, curv: false, step: 20 });
    P(map([[70, 22, 1], [84, 25, 1], [70, 30, 1]], nf), '#E8C9A0', { lift: .8, curv: false });
    // striped knit blanket on the left seat (the shoggoth's bed)
    const bl = [[30, 706], [150, 690], [238, 748], [330, 806], [460, 818], [600, 808], [676, 830], [700, 880], [668, 930], [706, 990], [690, 1050], [740, 1120, 1], [10, 1120, 1], [20, 900]];
    P(bl, C.blanket, { lift: 1.8, step: 14 });
    X.save(); tracePath(X, bl, .5); X.clip();
    PM([strip([[160, 880], [420, 900], [560, 890], [740, 910]], () => 12, 8), strip([[160, 990], [420, 1004], [560, 996], [740, 1016]], () => 12, 8)], C.blanketStripe, { lift: .3, bevel: .5 });
    PM([strip([[160, 908], [420, 928], [560, 918], [740, 938]], () => 4, 8), strip([[160, 1018], [420, 1032], [560, 1024], [740, 1044]], () => 4, 8)], C.blanketStripe2, { lift: .2, bevel: 0 });
    P([[640, 830], [700, 880], [668, 930], [706, 990], [690, 1050], [740, 1120, 1], [600, 1120, 1], [620, 1000], [596, 920]], C.blanketFold, { lift: .2, bevel: .4, alpha: .7 });
    X.restore();
  }

  // ---------- the shoggoth: sage paper on dark-green backing, curled up asleep ----------
  function shoggoth(t) {
    const S = 108, F = frame(520, 782, S), br = 1 + .02 * Math.sin(t * TAU / 4.2);
    const U = p => F([p[0], p[1] * br, p[2]]);
    const B = (pts, col = C.shog, o = {}) => PB(map(pts, U), col, C.shogLine, o.d ?? 4.6, o);
    // limbs first (they tuck under the body)
    // right limb: crooked, draped along the blanket
    B(strip([[1.0, .14], [1.42, .02], [1.66, .2], [1.94, .14], [2.06, .26]], taper(.19, .012, .85), 8));
    // back-right horn: goes up, kinks, droops over
    B(strip([[.6, -.5], [.84, -.96], [1.18, -1.04], [1.44, -.8], [1.66, -.84]], taper(.2, .012, .8), 8));
    // back-left limb: rolled into a quilled spiral
    const sp = [[-.6, -.5], [-.86, -.88]]; for (let i = 0; i <= 28; i++) { const a = Math.PI * .1 - i / 28 * TAU * 1.3, rr = .36 * (1 - i / 32); sp.push([-1.16 + Math.cos(a) * rr, -1.14 + Math.sin(a) * rr]); }
    B(strip(sp, taper(.17, .05, .7), 4));
    // pointed little legs tucked underneath
    for (const [lx, ang] of [[-.95, .55], [-.48, .22], [0, 0], [.48, -.2], [.95, -.5]]) { const f = frame(lx, .74, 1, ang); B(map([[-.1, -.12], [.1, -.12], [.05, .1], [0, .26, 1], [-.05, .1]], f), C.shog, { d: 3.6 }); }
    // body: a scalloped cloud
    const body = [], nb = 12, r0 = R32(55);
    for (let i = 0; i < nb; i++) {
      const a0 = -Math.PI / 2 + i / nb * TAU, a1 = a0 + TAU / nb, bump = .08 + r0() * .1, rx = 1.32, ry = .88;
      body.push([Math.cos(a0) * rx * .97, Math.sin(a0) * ry * .97, 1]);
      for (const [u, k] of [[.25, .75], [.5, 1], [.75, .75]]) { const a = lerp(a0, a1, u); body.push([Math.cos(a) * (rx + bump * k * 1.2), Math.sin(a) * (ry + bump * k)]); }
    }
    const bp = B(body);
    // darker paper along the underside (shading by layering)
    X.save(); trace(X, [bp]); X.clip();
    P(map(ell(.05, .95, 1.6, .55, 16), U), C.shogDk, { lift: .5, bevel: .6 });
    X.restore();
    // eyes: almond lids, shut; one barely open
    const lidEye = (ex, ey, rw, rot = 0, o = {}) => {
      const f = p => U(frame(ex, ey, 1, rot)(p)), d = Math.max(2, rw * 10);
      if (o.peek) {
        PB(map([[-rw, 0, 1], [0, -rw * .5], [rw, 0, 1], [0, rw * .5]], f), C.shogEye, C.shogLine, d * .9, { lift: .5, step: 6 });
        P(map(ell(rw * .1, rw * .2, rw * .3, rw * .22, 8), f), C.shogLine, { lift: .1, bevel: 0, step: 3 });
        P(map([[-rw * 1.04, -.005, 1], [-rw * .5, -rw * .62], [rw * .5, -rw * .62], [rw * 1.04, -.005, 1], [rw * .5, rw * .2], [-rw * .5, rw * .2]], f), C.shogLid, { lift: .5, step: 6 });
      } else PB(map([[-rw, 0, 1], [-rw * .5, -rw * .58], [rw * .5, -rw * .58], [rw, 0, 1], [rw * .45, rw * .3], [-rw * .45, rw * .3]], f), C.shogLid, C.shogLine, d * .8, { lift: .5, inner: .3, step: 7 });
      const ly = o.peek ? .2 : .3;
      P(map(strip([[-rw * 1.02, 0], [0, rw * ly * 1.1], [rw * 1.02, 0]], sliverW(Math.max(.012, rw * .1)), 10), f), C.shogLine, { lift: .2, bevel: 0, curv: false, step: 5, jag: .3 });
      for (let i = 0; i < (o.lash || 0); i++) { const u = (i + .5) / o.lash, lx = (u * 2 - 1) * rw * .8, ly0 = rw * ly * (1 - Math.pow(u * 2 - 1, 2)) * 1.05; P(map(strip([[lx, ly0], [lx * 1.3, ly0 + rw * .3]], sliverW(rw * .06), 2), f), C.shogLine, { lift: .15, bevel: 0, curv: false, step: 4, jag: .3 }); }
    };
    lidEye(.08, .08, .4, .04, { lash: 5 });
    lidEye(-.78, -.2, .2, -.35);
    lidEye(.86, -.28, .2, .32, { peek: true });
    lidEye(-.3, -.52, .12, -.1);
    lidEye(.42, -.58, .1, .2);
    lidEye(.64, .46, .14, -.15);
    lidEye(-.64, .4, .13, .2);
    lidEye(1.42, .07, .07, -.25);
    lidEye(1.0, -.96, .07, .1);
    // little arm curled forward, the mask resting on it
    B(strip([[-.78, .38], [-1.1, .64], [-1.5, .64], [-1.68, .47]], taper(.14, .08, 1), 8));
    maskPiece(U([-1.3, .28]), .42 * S, -.5, { backing: true });
  }

  // the smiley mask (his lopsided oval, dash eyes, lopsided smile) as paper
  function maskPiece([mx, my], r, rot, o = {}) {
    const f = frame(mx, my, r, rot), shape = svgPts(MASK_D, 22).map(([px, py]) => f([(px - MASK_C[0]) / MASK_R, (py - MASK_C[1]) / MASK_R]));
    if (o.backing) PB(shape, C.ast, C.shogLine, 3.6, { lift: 1.3, step: 10 }); else P(shape, o.col || C.ast, { lift: o.lift ?? 1.4, step: 10 });
    const ink = o.backing ? C.shogLine : C.astInk;
    for (const [ex, ey] of [[-.4, -.3], [.33, -.32]]) P(map(strip([[ex - .01, ey - .13], [ex + .01, ey + .13]], sliverW(.075, .3), 2), f), ink, { lift: .3, bevel: 0, curv: false, step: 3, jag: .25 });
    P(map(strip([[-.44, .3], [-.2, .52], [.08, .5], [.38, .16]], sliverW(.07, .35), 8), f), ink, { lift: .3, bevel: 0, curv: false, step: 4, jag: .3 });
    if (o.blush) PM([map(ell(-.62, .12, .13, .08, 8), f), map(ell(.62, .06, .12, .08, 8), f)], C.astBlush, { lift: .2, bevel: 0, alpha: .75 });
  }

  // ---------- him: round paper head, dot eyes, rectangle bomber, stubby limbs ----------
  const HEAD = { x: 1102, y: 398, r: 118, rot: -.12 };
  function hero(t) {
    // legs (dark trousers), far then near
    P(strip([[1190, 872], [1010, 858], [880, 852]], () => 56, 8), C.pantsDk, { lift: 1.4 });
    P(strip([[880, 845], [872, 980], [880, 1140]], () => 48, 8), C.pantsDk, { lift: 1 });
    P(ell(878, 852, 56, 54, 12), C.pantsDk, { lift: .6 });
    P(strip([[942, 912], [955, 1030], [962, 1140]], () => 56, 8), C.pants, { lift: 1.4 });
    P(strip([[1320, 902], [1120, 910], [945, 902]], () => 64, 8), C.pants, { lift: 1.8 });
    P(ell(942, 904, 64, 62, 12), C.pants, { lift: .5 });
    P(strip([[1290, 850], [1120, 856], [960, 848]], sliverW(10), 8), C.pantsHi, { lift: .1, bevel: .3, alpha: .8 });
    PM([strip([[1060, 930], [1010, 952], [960, 950]], sliverW(4), 6), strip([[900, 960], [930, 1010]], sliverW(3.5), 4)], C.pantsDk, { lift: .1, bevel: 0 });
    // torso: the oversized bomber
    const torso = [[1034, 590], [1066, 560], [1120, 568], [1200, 544], [1250, 514], [1300, 524], [1372, 560], [1398, 690], [1394, 820], [1360, 868, 1], [1070, 872, 1], [1030, 820], [1012, 700]];
    P(torso, C.jacket, { lift: 2.2, step: 20 });
    P([[1030, 610], [1060, 600], [1086, 700], [1092, 860, 1], [1070, 872, 1], [1030, 820], [1014, 700]], C.jacketDk, { lift: .4, bevel: .5 });
    // dark shirt in the open front, then the near front panel over it (zip edge)
    P([[1098, 566, 1], [1146, 566, 1], [1160, 640], [1164, 856, 1], [1104, 858, 1], [1096, 640]], C.shirt, { lift: .4 });
    P([[1136, 572, 1], [1204, 546], [1254, 516], [1300, 526], [1372, 562], [1398, 690], [1394, 820], [1362, 866, 1], [1166, 862, 1], [1162, 700], [1142, 620]], C.jacket, { lift: 1.2, step: 20 });
    P(strip([[1140, 580], [1160, 700], [1166, 858]], () => 3, 6), C.zip, { lift: .3, bevel: 0, alpha: .8 });
    // lamp rim on the near side
    P(strip([[1330, 540], [1384, 600], [1398, 720], [1392, 830]], sliverW(9), 8), C.jacketHi, { lift: .2, bevel: .4 });
    // soft fold lines in the jacket (thin darker slivers)
    PM([strip([[1200, 760], [1260, 790], [1330, 782]], sliverW(4), 8), strip([[1230, 700], [1290, 720]], sliverW(3), 6)], C.jacketDk, { lift: .15, bevel: 0 });
    // waistband ribbing
    ribs(strip([[1062, 852], [1220, 862], [1392, 846]], () => 17, 8), [[1062, 852], [1220, 862], [1392, 846]], 11);
    // welt pocket
    P(strip([[1250, 790], [1296, 742]], () => 4, 2), C.jacketDk, { lift: .3, curv: false, bevel: .5 });
    // smiley pin
    P(ell(1240, 640, 14, 14, 10), C.pin, { lift: 1.3, step: 5 });
    PM([ell(1235, 636, 1.8, 2.6, 5), ell(1244, 636, 1.8, 2.6, 5)], C.astInk, { lift: 0, bevel: 0, tex: 0 });
    P(strip([[1233, 643], [1240, 647], [1247, 641]], sliverW(1.4), 4), C.astInk, { lift: 0, bevel: 0, tex: 0, curv: false });
    // neck, collar, head
    const H = frame(HEAD.x, HEAD.y, HEAD.r, HEAD.rot);
    P(map(rbox(-.1, .5, .62, .7, .1), H), C.skinSh, { lift: .8 });
    const colF = [[1070, 528], [1086, 556], [1122, 574]], colN = [[1126, 578], [1176, 556], [1218, 526], [1244, 492], [1250, 462]];
    ribs(strip(colF, () => 15, 8), colF, 4);
    ribs(strip(colN, k => lerp(17, 13, k), 8), colN, 10);
    head(H, t);
  }
  // an orange ribbed band: base strip + darker rib slivers across it
  function ribs(poly, spine, n) {
    const p = cut(poly, { curv: false, step: 14 }); piece(p, C.rib, { lift: 1.3 });
    X.save(); trace(X, [p]); X.clip();
    const sp = spline(spine, 20), L = [];
    for (let i = 1; i < n * 2; i += 2) { const k = Math.floor(i / (n * 2) * (sp.length - 1)), a = sp[Math.max(0, k - 1)], b = sp[Math.min(sp.length - 1, k + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; const [cx, cy] = sp[k]; L.push(strip([[cx - Math.cos(ang) * 30, cy - Math.sin(ang) * 30], [cx + Math.cos(ang) * 30, cy + Math.sin(ang) * 30]], () => 1.6, 2)); }
    PM(L, C.ribDk, { lift: 0, bevel: 0, alpha: .75, curv: false });
    X.restore();
  }
  function head(H, t) {
    const M = pts => map(pts, H);
    // ear (behind hair edge) and the head disc
    const headPts = [[0, -1.02], [.56, -.88], [.93, -.5], [1.02, 0], [.9, .5], [.58, .86], [.08, 1.02], [-.34, 1.02], [-.7, .82], [-.96, .46], [-1.03, 0], [-.92, -.5], [-.55, -.88]];
    P(M(headPts), C.skin, { lift: 1.8, step: 16, curl: .25 });
    // shadow side of the face (toward the ear / lamp-back), a cut crescent
    P(M([[.2, -.6], [.7, -.62], [1.0, -.1], [.9, .5], [.58, .86], [.2, .98], [.45, .5], [.4, 0]]), C.skinDk, { lift: .2, bevel: .3, alpha: .55 });
    // the screen's light on the face: pale cyan tissue over the front half, cut to the head
    X.save(); trace(X, [cut(M(headPts), { seed: 7001 })]); X.clip();
    P(M(strip([[-.9, -.5], [-1.04, 0], [-.94, .5], [-.66, .86], [-.3, 1.04]], sliverW(.07, .7), 8)), C.cool, { comp: 'screen', alpha: .35, lift: 0, tex: .4, curv: false, step: 8, jag: .8 });
    X.restore();
    // hair: one messy piece with snipped tufts
    const hair = [[-1.06, -.28, 1], [-.9, -.62], [-.8, -.44, 1], [-.64, -.66], [-.5, -.40, 1], [-.36, -.64], [-.2, -.46, 1], [-.04, -.62], [.12, -.42, 1], [.2, -.46], [.26, -.12], [.25, .16, 1], [.44, -.02], [.6, .3], [.6, .56, 1], [.78, .38], [.88, .6, 1], [.98, .3], [1.16, .2, 1], [1.07, -.04], [1.24, -.22, 1], [1.08, -.44], [1.14, -.72, 1], [.9, -.84], [.7, -1.1], [.3, -1.2], [-.2, -1.16], [-.6, -1.0], [-.92, -.74], [-1.1, -.46], [-1.18, -.3, 1]];
    P(M(hair), C.hair, { lift: 1.6, step: 14 });
    // cowlick: its own little piece, sticking up at the crown
    P(M([[.26, -1.0], [.2, -1.3], [.34, -1.54], [.58, -1.66], [.88, -1.6, 1], [.62, -1.52], [.48, -1.38], [.56, -1.36], [.8, -1.36, 1], [.6, -1.22], [.66, -.98]]), C.hair, { lift: 1.9, step: 7 });
    // ear
    P(M(ell(.36, .16, .15, .21, 10, .1)), C.skin, { lift: 1.2, step: 6 });
    P(M(ell(.37, .17, .07, .12, 8, .1)), C.skinSh, { lift: .2, bevel: .3, step: 4 });
    // blush (translucent pink paper)
    P(M(ell(-.04, .5, .14, .08, 10)), C.blush, { lift: .1, bevel: 0, alpha: .55, step: 5 });
    P(M(ell(-.8, .5, .08, .07, 8)), C.blush, { lift: .1, bevel: 0, alpha: .45, step: 4 });
    // eyes: dark dots with heavy upper lids (looking down), outer corners drooping
    const eye = (ex, ey, rx, ry, rot) => {
      const f = frame(ex, ey, 1, rot), lo = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; lo.push([Math.cos(a) * rx, Math.sin(a) * ry + ry * .15]); }
      P(M(map([[rx, 0, 1], ...lo.slice(1, -1), [-rx, 0, 1]], f)), C.eye, { lift: .6, step: 4, jag: .35 });
      P(M(map(strip([[-rx * 1.25, -ry * .1], [0, -ry * .35], [rx * 1.3, ry * .05]], sliverW(.018), 6), f)), C.eye, { lift: .3, bevel: 0, curv: false, step: 4, jag: .3 });
      P(M(map(ell(-rx * .35, ry * .62, rx * .26, ry * .22, 6), f)), '#E4F7FF', { lift: 0, bevel: 0, tex: 0, step: 2, jag: .1 });
      P(M(map(ell(rx * .35, ry * .38, rx * .13, ry * .12, 5), f)), '#E4F7FF', { lift: 0, bevel: 0, tex: 0, step: 2, jag: .1, alpha: .8 });
    };
    eye(-.18, .12, .1, .11, .16);
    eye(-.69, .13, .075, .1, -.16);
    // brows: worried (inner ends raised)
    P(M(strip([[-.39, -.42], [-.26, -.34], [-.06, -.27]], sliverW(.036, .4), 8)), C.brow, { lift: .5, curv: false, step: 6, jag: .4 });
    P(M(strip([[-.55, -.42], [-.67, -.35], [-.82, -.29]], sliverW(.032, .4), 8)), C.brow, { lift: .5, curv: false, step: 6, jag: .4 });
    // nose nub
    P(M([[-.46, .2], [-.6, .3], [-.66, .38, 1], [-.54, .42], [-.44, .38]]), C.nose, { lift: 1.1, step: 5 });
    // mouth: a small half smile, lifting on the near side only
    P(M(strip([[-.57, .66], [-.47, .665], [-.37, .65], [-.31, .6]], sliverW(.024, .45), 8)), C.lip, { lift: .3, bevel: 0, curv: false, step: 5, jag: .3 });
    // glasses: thin dark paper rings, vellum lenses catching the screen
    const ring = (cx, cy, rx, ry, w) => [cut(M(ell(cx, cy, rx + w, ry + w, 18)), { step: 7, jag: .5 }), cut(M(ell(cx, cy, rx, ry, 18)), { step: 7, jag: .5 })];
    P(M(ell(-.18, .1, .25, .25, 18)), C.lens, { lift: 0, alpha: .16, bevel: 0, tex: .3, step: 7 });
    P(M(ell(-.7, .1, .15, .23, 18)), C.lens, { lift: 0, alpha: .16, bevel: 0, tex: .3, step: 7 });
    piece([...ring(-.18, .1, .25, .25, .045)], C.glasses, { lift: 1.2, rule: 'evenodd' });
    piece([...ring(-.7, .1, .15, .23, .04)], C.glasses, { lift: 1.2, rule: 'evenodd' });
    P(M(strip([[-.44, .04], [-.5, 0], [-.56, .04]], () => .025, 4)), C.glasses, { lift: 1, curv: false, step: 4 });
    P(M(strip([[.07, .04], [.2, .06], [.3, .12]], () => .024, 4)), C.glasses, { lift: .8, curv: false, step: 6 });
    // glints on the lenses (the laptop's light)
    PM([M(strip([[-.34, .2], [-.28, .28]], () => .025, 2)), M(strip([[-.8, .22], [-.77, .28]], () => .018, 2))], '#EFFBFF', { lift: 0, bevel: 0, tex: 0, alpha: .75, curv: false });
  }

  // ---------- the laptop on his lap, and his hands ----------
  const LID = { TL: [686, 588], TR: [846, 622], BL: [744, 782], BR: [904, 816] };
  const lidAt = (s, u) => [LID.TL[0] + (LID.TR[0] - LID.TL[0]) * s + (LID.BL[0] - LID.TL[0]) * u, LID.TL[1] + (LID.TR[1] - LID.TL[1]) * s + (LID.BL[1] - LID.TL[1]) * u];
  function laptop(t) {
    const d = [168, -30], BL = LID.BL, BR = LID.BR, BR2 = [BR[0] + d[0], BR[1] + d[1]], BL2 = [BL[0] + d[0], BL[1] + d[1]];
    // base slab: edge then top then keyboard
    P(quad4([BL[0], BL[1] + 2], [BR[0], BR[1] + 2], [BR[0], BR[1] + 12], [BL[0], BL[1] + 12]), C.lapEdge, { lift: 1.6, curv: false });
    P(quad4(BR, BR2, [BR2[0], BR2[1] + 10], [BR[0], BR[1] + 12]), C.lapEdge, { lift: 1.6, curv: false });
    P(quad4(BL, BR, BR2, BL2), C.lapTop, { lift: 1.4, curv: false, step: 20 });
    const kb = (s, u) => [BL[0] + (BR[0] - BL[0]) * s + d[0] * u, BL[1] + (BR[1] - BL[1]) * s + d[1] * u];
    P(quad4(kb(.08, .12), kb(.92, .12), kb(.92, .52), kb(.08, .52)), C.lapKeys, { lift: .2, curv: false, bevel: .5 });
    // lid: bezel, then the backlit screen
    P(quad4(LID.TL, LID.TR, LID.BR, LID.BL), C.bezel, { lift: 2, curv: false, step: 20 });
    P(quad4(lidAt(.06, .05), lidAt(.94, .05), lidAt(.94, .93), lidAt(.06, .93)), C.screen, { lift: .3, curv: false, bevel: .4 });
    // UI as tiny paper strips (no words), then the context bar
    const q = (s0, u0, s1, u1) => quad4(lidAt(s0, u0), lidAt(s1, u0), lidAt(s1, u1), lidAt(s0, u1));
    PM([q(.12, .12, .62, .17), q(.12, .21, .5, .26), q(.12, .44, .66, .49), q(.12, .53, .44, .58)], C.ui, { lift: .25, bevel: 0, curv: false, tex: .3, alpha: .9 });
    PM([q(.4, .31, .88, .36), q(.52, .63, .88, .68)], C.ui2, { lift: .25, bevel: 0, curv: false, tex: .3, alpha: .9 });
    P(q(.12, .8, .88, .86), C.barBg, { lift: .1, curv: false, bevel: 0 });
    P(q(.13, .81, .13 + .74 * .97, .85), C.bar, { lift: .25, curv: false, bevel: 0, tex: .3 });
    // the tiny label, drawn in the lid's plane
    X.save();
    const ux = (LID.TR[0] - LID.TL[0]) / 160, uy = (LID.TR[1] - LID.TL[1]) / 160, vx = (LID.BL[0] - LID.TL[0]) / 200, vy = (LID.BL[1] - LID.TL[1]) / 200;
    X.transform(ux, uy, vx, vy, LID.TL[0], LID.TL[1]);
    txt('context 97%', 20, 150, 15, '#FFC2CF', { font: 'Rajdhani', align: 'left', weight: 700 });
    X.restore();
  }
  // a mitten hand seen from the thumb side, resting on the laptop, fingers toward the screen
  function hand(x, y, s, rot) {
    const f = frame(x, y, s, rot);
    P(map([[-1.05, .1], [-.9, -.3], [-.2, -.52], [.6, -.5], [1.0, -.1], [.9, .45], [.2, .6], [-.7, .52]], f), C.skin, { lift: 1.5, step: 8 });
    PM([map(strip([[-.95, .12], [-.45, .16]], sliverW(.035), 2), f), map(strip([[-.9, .34], [-.4, .36]], sliverW(.03), 2), f)], C.skinSh, { lift: 0, bevel: 0, curv: false, alpha: .8 });
    P(map([[-.1, -.44], [-.55, -.62], [-.8, -.5], [-.62, -.3], [-.1, -.2]], f), C.skin, { lift: .9, step: 5 });
  }
  function arms() {
    // far arm: sleeve, cuff, mitten hand on the keys
    P(strip([[1052, 598], [1018, 690], [1004, 752], [978, 770]], taper(50, 42, 1), 8), C.jacketDk, { lift: 1.6, step: 16 });
    P(strip([[1030, 610], [1004, 690], [990, 752]], sliverW(6), 8), C.sleeveRim, { lift: .1, bevel: .3, alpha: .9 });
    ribs(strip([[986, 768], [952, 766]], () => 22, 2), [[986, 768], [952, 766]], 4);
    hand(930, 764, 30, .08);
    // near arm: hangs by his side, forearm forward to rest on the palm rest
    P(strip([[1352, 586], [1394, 690], [1372, 772], [1250, 800], [1148, 796]], taper(58, 46, 1), 8), C.jacket, { lift: 2.2, step: 18 });
    P(strip([[1380, 610], [1410, 690], [1392, 770]], sliverW(8), 8), C.jacketHi, { lift: .2, bevel: .4 });
    P(strip([[1392, 700], [1380, 790], [1300, 818], [1180, 818]], sliverW(12, .8), 8), C.jacketDk, { lift: .1, bevel: .3, alpha: .9 });
    PM([strip([[1300, 760], [1330, 786], [1354, 770]], sliverW(3.5), 6), strip([[1250, 792], [1210, 776]], sliverW(3), 4)], C.jacketDk, { lift: .1, bevel: 0 });
    ribs(strip([[1154, 796], [1112, 794]], () => 24, 2), [[1154, 796], [1112, 794]], 5);
    hand(1082, 791, 33, .04);
  }

  // ---------- the Assistant: yellow paper figure, mask for a head, leaning on him ----------
  function assistant(t) {
    const sway = Math.sin(t * TAU / 5) * .015, bx = 1318, by = 494, BF = frame(bx, by, 1, -.34 + sway);
    // sitting on his shoulder: knees forward, shins dangling
    P(limbPts([[bx + 4, by + 22], [bx - 22, by + 32], [bx - 26, by + 62]], [10, 9.5, 9]), C.astDk, { lift: 1.4, step: 7 });
    P(limbPts([[bx + 14, by + 26], [bx - 12, by + 40], [bx - 10, by + 72]], [10, 9.5, 9]), C.astBody, { lift: 1.6, step: 7 });
    // arm reaching round his neck (behind its own head), then the body
    P(limbPts(map([[-14, -18], [-40, -6], [-66, 4]], BF), [8, 7.5, 7.5]), C.astBody, { lift: 1.5, step: 6 });
    P(map(rbox(-25, -34, 50, 58, 15), BF), C.astBody, { lift: 2, step: 10 });
    P(map(strip([[21, -26], [24, 0], [20, 20]], sliverW(4), 4), BF), C.astDk, { lift: .1, bevel: 0, curv: false, alpha: .7 });
    // near arm resting on its knee
    P(limbPts(map([[17, -18], [28, 4], [19, 24]], BF), [8, 7.5, 7.5]), C.astBody, { lift: 1.5, step: 6 });
    // head = the mask, tipped over to rest against his hair
    maskPiece([bx - 52, by - 64], 48, -.62 + sway * 1.5, { blush: true, lift: 2.4 });
  }

  // ---------- light & finish ----------
  function lights(t) {
    const flick = 1 + .04 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
    // the screen's cool glow: pale cyan tissue around the lid and over his hands
    const g = X.createRadialGradient(800, 700, 10, 800, 700, 330);
    g.addColorStop(0, rgba(C.cool, .22 * flick)); g.addColorStop(1, rgba(C.cool, 0));
    X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = g; X.fillRect(460, 360, 680, 680); X.restore();
    tissue(790, 700, 170, C.cool, .06 * flick, { n: 2, seed: 41, dx: 20, dy: -12, shrink: .5 });
    const f = X.createRadialGradient(990, 520, 20, 990, 520, 300);
    f.addColorStop(0, rgba(C.cool, .1 * flick)); f.addColorStop(1, rgba(C.cool, 0));
    X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = f; X.fillRect(690, 220, 600, 600); X.restore();
    // the lamp: a last warm tissue over the near side of the set
    const w = X.createRadialGradient(LAMP.x, LAMP.y + 60, 40, LAMP.x, LAMP.y + 60, 620);
    w.addColorStop(0, 'rgba(255,184,100,.14)'); w.addColorStop(1, 'rgba(255,184,100,0)');
    X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = w; X.fillRect(LAMP.x - 640, LAMP.y - 580, 1280, 1280); X.restore();
  }
  function finish() {
    // photographic falloff: darker corners, like a lit diorama on a table
    const g = X.createRadialGradient(1010, 470, 420, 960, 540, 1250);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,28,.6)');
    X.fillStyle = g; X.fillRect(0, 0, W, H);
    // a touch of print contrast (the image soft-lit onto itself)
    const bc = BG.getContext('2d'); bc.globalCompositeOperation = 'copy'; bc.drawImage(X.canvas, 0, 0);
    X.save(); X.globalCompositeOperation = 'soft-light'; X.globalAlpha = .35; X.drawImage(BG, 0, 0); X.restore();
  }

  let BG = null;
  const CAM_Z = 1.22, CAM_X = 1030, CAM_Y = 600;
  function scene(t) {
    style(0); FX.noAuto = true; FX.grain = .35; FX.bloom = 0;
    textures(); SEED = 1;
    X.save();
    X.setTransform(CAM_Z, 0, 0, CAM_Z, 960 - CAM_X * CAM_Z, 540 - CAM_Y * CAM_Z);
    wall();
    windowScene(t);
    curtain();
    lamp();
    // background is a little out of focus, like a photographed diorama
    if (!BG) BG = mkCanvas(W, H);
    const bc = BG.getContext('2d'); bc.globalCompositeOperation = 'copy'; bc.drawImage(X.canvas, 0, 0);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.filter = 'blur(1.6px)'; X.globalCompositeOperation = 'copy'; X.drawImage(BG, 0, 0); X.restore();
    couch();
    shoggoth(t);
    hero(t);
    laptop(t);
    arms();
    assistant(t);
    lights(t);
    X.setTransform(1, 0, 0, 1, 0, 0);
    finish();
    X.restore();
  }
  chapter('papercut', K, K + 1, [[K, scene]]);
})();
