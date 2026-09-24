// ligneclaire.js: the key frame in the clean-line bande dessinée tradition.
// One uniform black line everywhere (no hatching, no taper), flat colour areas (no gradients), naturalistic proportions,
// simple faces (dot eyes, a small nose line) on carefully drawn clothes and props, and an architecturally precise room:
// a frontal (one-point) apartment wall with a casement window, radiator, curtains, a floor lamp and a framed print;
// across the street, mansard rooftops in the rain under the moon. Light is shown the BD way, as flat hard-edged zones
// (the lamp's cones on the wall, the laptop's cool light on his face), never as soft gradients.
(() => {
  const LW = 3.2, INK = '#17141C';
  const C = {
    wall: '#434C79', wallPool: '#4F5683', wallCone: '#7D7790', cornice: '#3D4570',
    trim: '#D6CFBC', trimTop: '#E6E0CF', trimSh: '#B3AB98',
    sky: '#1F2A58', sky2: '#28356A', halo: '#2C3A72', moon: '#F4ECC8', crater: '#E1D6AC',
    far: '#2B3566', farLit: '#E3B85E', near: '#3B4679', roof: '#2A325C', roofEdge: '#56608E', winLit: '#F2C66A', winDark: '#1C2349', stone: '#46518A',
    rain: '#7F95CC', glass: '#9DB0DD',
    curtain: '#B0843F', curtainIn: '#A87A35', rod: '#8A6A3C',
    rad: '#CFC8B6', radSh: '#ADA592',
    couch: '#6F3342', couchTop: '#854052', couchIn: '#5E2A37',
    pillow: '#C99B45', pillowTop: '#D8AB55',
    shade: '#F3D68E', shadeIn: '#E8BF62', brass: '#B38C4E',
    frame: '#5B3C2B', mat: '#E7DFC7', pSea: '#4F77A8', pSky: '#A9C7DE', pRock: '#7A6A5A', pHouse: '#F1EAD6', pRed: '#C9483C',
    skin: '#F2CFB8', skinLit: '#F7E4DA', skinSh: '#D9A68E', blush: '#EDA798',
    hair: '#2A2431',
    bomber: '#4A4695', bomberLit: '#5A57AA', bomberWarm: '#6A5AA2', bomberIn: '#3C3880', rib: '#E8883C',
    shirt: '#2B2E3B', pants: '#343A55', pin: '#F7DD4A',
    lap: '#B6BAC5', lapSide: '#8A8F9D', bezel: '#2A2C36', screen: '#D7F0F1', keys: '#3A3E4B', keyCap: '#585D6C', ui: '#9EB9C4', ctx: '#E2486A',
    asst: '#F5FA83',
    shog: '#99B087', shogLid: '#88A077', eye: '#FFFDF2', plant: '#5E8C5A', plantIn: '#4C7549', pot: '#C0674A', book1: '#3F6F8F', book2: '#C9A64B', book3: '#8E4F5E', mug: '#E8E2D2'
  };

  // ---------- drawing primitives: paths are built in any frame (DOMMatrix) and always inked at the same weight ----------
  const I = () => new DOMMatrix();
  const M = (x = 0, y = 0, rot = 0, s = 1) => new DOMMatrix().translate(x, y).rotate(rot * 180 / Math.PI).scale(s);
  const P = (d, m) => { const p = new Path2D(); p.addPath(typeof d === 'string' ? new Path2D(d) : d, m || I()); return p; };
  function sh(d, fill, o = {}) {
    const p = P(d, o.m);
    if (fill) { X.fillStyle = fill; X.fill(p, o.rule || 'nonzero'); }
    if (o.ink !== false) { X.lineWidth = o.lw || LW; X.strokeStyle = o.ink || INK; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(p); }
    return p;
  }
  const ln = (d, o = {}) => sh(d, null, o);
  const flat = (d, fill, o = {}) => sh(d, fill, { ...o, ink: false });
  const f1 = v => (+v).toFixed(1);
  const poly = (pts, close = true) => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + (close ? ' Z' : '');
  const rect = (x, y, w, h) => `M${f1(x)} ${f1(y)} h${f1(w)} v${f1(h)} h${f1(-w)} Z`;
  const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${f1(cy)} a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0 a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0 Z`;
  // smooth closed/open curve through the midpoints of a point list (like core tracePath with curv)
  function smooth(pts, close = true) {
    const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (close) {
      let s = m(pts[n - 1], pts[0]), d = `M${f1(s[0])} ${f1(s[1])}`;
      for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); d += ` Q${f1(p[0])} ${f1(p[1])} ${f1(q[0])} ${f1(q[1])}`; }
      return d + ' Z';
    }
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 1; i < n - 1; i++) { const q = m(pts[i], pts[i + 1]); d += ` Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(q[0])} ${f1(q[1])}`; }
    return d + ` L${f1(pts[n - 1][0])} ${f1(pts[n - 1][1])}`;
  }
  const clip = (d, fn, m) => { X.save(); X.clip(P(d, m)); fn(); X.restore(); };
  // an inked tube (limbs, bands): ink stroke underneath, colour stroke on top, round ends; outline stays LW wide
  // a ribbed knit band along a cubic Bézier (collars, cuffs): square ends, rib lines across, outlined
  function ribBand(cp, w, nRib, col = C.rib) {
    const bz = (k, j) => { const u = 1 - k; return u * u * u * cp[0][j] + 3 * u * u * k * cp[1][j] + 3 * u * k * k * cp[2][j] + k * k * k * cp[3][j]; };
    const N = 24, L = [], R = [], at = k => { const e = .01, x = bz(k, 0), y = bz(k, 1), dx = bz(Math.min(1, k + e), 0) - bz(Math.max(0, k - e), 0), dy = bz(Math.min(1, k + e), 1) - bz(Math.max(0, k - e), 1), l = Math.hypot(dx, dy); return [x, y, -dy / l, dx / l]; };
    for (let i = 0; i <= N; i++) { const [x, y, nx, ny] = at(i / N); L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]); }
    const d = poly([...L, ...R.reverse()]);
    flat(d, col);
    for (let i = 1; i <= nRib; i++) { const [x, y, nx, ny] = at(i / (nRib + 1)); ln(`M${f1(x - nx * w)} ${f1(y - ny * w)} L${f1(x + nx * w)} ${f1(y + ny * w)}`); }
    ln(d);
  }
  function tube(d, w, col, m) {
    const p = P(d, m); X.lineCap = 'round'; X.lineJoin = 'round';
    X.strokeStyle = INK; X.lineWidth = w * 2 + LW * 2; X.stroke(p);
    X.strokeStyle = col; X.lineWidth = w * 2; X.stroke(p);
  }

  // ---------- the room ----------
  const WIN = { x0: 150, x1: 760, y0: 70, y1: 548 };      // glazed opening
  const LAMP = { x: 1785, top: 214, bot: 340 };

  function wall() {
    X.fillStyle = C.wall; X.fillRect(0, 0, W, H);
    // the lamp's light on the wall: a pool and two hard cones (flat zones, no gradient)
    flat(ell(LAMP.x, 360, 960, 1300), C.wallPool);
    flat(poly([[LAMP.x - 57, LAMP.top], [LAMP.x + 57, LAMP.top], [LAMP.x + 190, -10], [LAMP.x - 190, -10]]), C.wallCone);
    flat(poly([[LAMP.x - 93, LAMP.bot], [LAMP.x + 93, LAMP.bot], [LAMP.x + 260, 640], [LAMP.x - 260, 640]]), C.wallCone);
    // wallpaper: a small flat lozenge motif in a half-drop repeat (translucent, so it sits in the light zones too)
    X.fillStyle = 'rgba(18,20,58,0.12)';
    for (let r = 0; r < 20; r++) for (let c = 0; c < 32; c++) {
      const x = c * 64 + (r % 2) * 32, y = 60 + r * 40;
      X.beginPath(); X.moveTo(x, y - 9); X.lineTo(x + 5, y); X.lineTo(x, y + 9); X.lineTo(x - 5, y); X.closePath(); X.fill();
    }
    // cornice
    sh(rect(-10, -10, W + 20, 34), C.cornice); ln(`M-10 34 H${W + 10}`);
  }

  function outside(t) {
    const { x0, x1, y0, y1 } = WIN;
    X.fillStyle = C.sky; X.fillRect(x0, y0, x1 - x0, y1 - y0);
    X.fillStyle = C.sky2; X.fillRect(x0, 300, x1 - x0, y1 - 300);
    // stars
    for (let i = 0; i < 16; i++) { const sx = x0 + 10 + hash(i * 3.3) * (x1 - x0 - 20), sy = y0 + 10 + hash(i * 7.1) * 200; if (Math.hypot(sx - 244, sy - 152) < 66) continue; flat(ell(sx, sy, 1.8, 1.8), '#DCE3F5'); }
    // moon with a flat halo
    flat(ell(244, 152, 52, 52), C.halo);
    sh(ell(244, 152, 35, 35), C.moon);
    sh(ell(231, 141, 8, 7), C.crater); sh(ell(258, 165, 6, 5), C.crater); flat(ell(254, 136, 3.5, 3), C.crater);
    // far skyline (flat silhouettes, same line)
    const far = [[150, 336], [205, 336], [205, 318], [238, 318], [238, 262], [250, 250], [262, 262], [262, 318], [300, 318], [300, 340], [330, 340], [330, 300], [392, 300], [392, 330], [420, 330],
      [420, 316], [440, 316], [440, 296], [478, 296], [478, 316], [520, 316], [520, 334], [560, 334], [560, 306], [600, 306], [600, 328], [650, 328], [650, 312], [700, 312], [700, 332], [760, 332], [760, 560], [150, 560]];
    sh(poly(far), C.far);
    // church spire + a dome
    sh(poly([[244, 250], [250, 206], [256, 250]]), C.far); ln('M250 206 V194 M245 199 H255');
    sh('M440 296 C440 266 478 266 478 296 Z', C.far); ln('M459 270 V258');
    // a water tower on legs
    ln('M612 306 L616 282 M636 306 L632 282'); sh(rect(608, 262, 32, 20), C.far); sh('M606 262 L624 250 L642 262 Z', C.far);
    for (let i = 0; i < 26; i++) { const wx = 160 + hash(i * 5.1) * 590, wy = 322 + hash(i * 2.7) * 30; X.fillStyle = hash(i * 9.3) < .5 ? C.farLit : '#46528A'; X.fillRect(wx, wy, 5, 7); }
    // across the street: three Haussmann-ish facades with mansard roofs, dormers, chimneys, balconies
    const bld = [[140, 330, 392], [330, 560, 368], [560, 770, 400]];
    bld.forEach(([bx0, bx1, ry], bi) => {
      // chimney stacks with pots
      for (let c = 0; c < 2; c++) {
        const cx = bx0 + (bx1 - bx0) * (.22 + c * .5) + hash(bi * 7 + c) * 20;
        sh(rect(cx, ry - 30, 34, 32), C.stone); for (let p = 0; p < 3; p++) sh(rect(cx + 3 + p * 10, ry - 40, 7, 10), C.pot);
      }
      // mansard roof
      sh(poly([[bx0 + 8, ry], [bx1 - 8, ry], [bx1, ry + 48], [bx0, ry + 48]]), C.roof);
      const nd = Math.max(2, Math.round((bx1 - bx0) / 80));
      for (let d = 0; d < nd; d++) {
        const dx = bx0 + (bx1 - bx0) * (d + .5) / nd - 14;
        sh(`M${dx} ${ry + 46} V${ry + 14} Q${dx + 14} ${ry + 2} ${dx + 28} ${ry + 14} V${ry + 46} Z`, C.stone);
        sh(rect(dx + 6, ry + 20, 16, 22), hash(bi * 13 + d) < .45 ? C.winLit : C.winDark);
      }
      // facade + cornice
      sh(rect(bx0, ry + 48, bx1 - bx0, 200), C.near);
      sh(rect(bx0 - 4, ry + 48, bx1 - bx0 + 8, 8), C.stone);
      const nw = Math.max(2, Math.round((bx1 - bx0) / 58));
      for (let r = 0; r < 2; r++) for (let w = 0; w < nw; w++) {
        const wx = bx0 + (bx1 - bx0) * (w + .5) / nw - 13, wy = ry + 70 + r * 78, lit = hash(bi * 31 + r * 7 + w * 3) < .38;
        sh(rect(wx, wy, 26, 46), lit ? C.winLit : C.winDark);
        ln(`M${wx + 13} ${wy} V${wy + 46}`);
        // balcony railing
        sh(rect(wx - 6, wy + 34, 38, 3), C.winDark); ln(`M${wx - 6} ${wy + 46} H${wx + 32} M${wx - 6} ${wy + 34} V${wy + 46} M${wx + 32} ${wy + 34} V${wy + 46}`);
        for (let k = 1; k < 4; k++) ln(`M${wx - 6 + k * 9.5} ${wy + 37} V${wy + 46}`);
      }
      ln(`M${bx1} ${ry + 48} V${y1 + 10}`);
    });
    // rain: straight falling strokes in a pale colour (colour line, not ink)
    X.strokeStyle = C.rain; X.lineWidth = 2; X.lineCap = 'round'; X.beginPath();
    for (let i = 0; i < 120; i++) {
      const sp = 700 + hash(i * 1.7) * 300, x = x0 + hash(i * 3.1) * (x1 - x0 + 60), y = y0 - 60 + ((hash(i * 7.3) * 600 + t * sp) % 560);
      X.moveTo(x, y); X.lineTo(x - 7, y + 30);
    }
    X.stroke();
    // water on the glass: a few rivulets with a drop at the head
    for (let i = 0; i < 14; i++) {
      const gx = x0 + 20 + hash(i * 4.7) * (x1 - x0 - 40), gy = y0 + 40 + hash(i * 8.9) * (y1 - y0 - 80), L = 30 + hash(i * 2.2) * 70;
      X.strokeStyle = C.glass; X.lineWidth = 2; X.beginPath(); X.moveTo(gx, gy - L); X.quadraticCurveTo(gx + 4 * Math.sin(i), gy - L / 2, gx, gy); X.stroke();
      flat(`M${gx} ${gy - 5} Q${gx + 5} ${gy + 2} ${gx} ${gy + 5} Q${gx - 5} ${gy + 2} ${gx} ${gy - 5} Z`, C.glass);
    }
  }

  function windowFrame(t) {
    const { x0, x1, y0, y1 } = WIN, mid = (x0 + x1) / 2;
    clip(rect(x0, y0, x1 - x0, y1 - y0), () => outside(t));
    // casing (architrave) around the opening
    sh(`${rect(x0 - 24, y0 - 24, x1 - x0 + 48, y1 - y0 + 24)} ${rect(x0, y0, x1 - x0, y1 - y0)}`, C.trim, { rule: 'evenodd' });
    ln(rect(x0 - 16, y0 - 16, x1 - x0 + 32, y1 - y0 + 16).replace(/ Z$/, ''));
    // two casements, each 2 x 3 panes, glazing bars
    for (const [cx0, cx1] of [[x0, mid], [mid, x1]]) {
      const fw = 16, ix0 = cx0 + fw, ix1 = cx1 - fw, iy0 = y0 + fw, iy1 = y1 - fw - 4, bar = 8;
      const pw = (ix1 - ix0 - bar) / 2, ph = (iy1 - iy0 - 2 * bar) / 3;
      let d = rect(cx0, y0, cx1 - cx0, y1 - y0);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) d += ' ' + rect(ix0 + c * (pw + bar), iy0 + r * (ph + bar), pw, ph);
      sh(d, C.trim, { rule: 'evenodd' });
      ln(`M${cx0} ${y1 - 14} H${cx1}`);
    }
    // espagnolette: the vertical rod and handle on the meeting stile
    sh(rect(mid - 4, y0 + 6, 8, y1 - y0 - 12), C.brass);
    sh(`M${mid - 6} 300 h12 v16 h-12 Z`, C.brass); sh(`M${mid + 2} 316 q4 30 -2 52 q-6 4 -8 -2 q4 -22 2 -50 Z`, C.brass);
    // sill: top face (seen from above), nosing, apron
    sh(poly([[x0 - 36, y1], [x1 + 36, y1], [x1 + 42, y1 + 10], [x0 - 42, y1 + 10]]), C.trimTop);
    sh(rect(x0 - 42, y1 + 10, x1 - x0 + 84, 14), C.trim);
    sh(rect(x0 - 16, y1 + 24, x1 - x0 + 32, 18), C.trimSh);
  }

  function sillProps() {
    const y = WIN.y1;
    // potted plant (left end)
    const px = 200;
    const leaves = [[-34, -58, -.9], [-10, -74, -.3], [16, -70, .35], [34, -50, .9], [-40, -30, -1.3], [42, -24, 1.4], [0, -46, 0]];
    for (const [lx, ly, a] of leaves) {
      const m = M(px + lx * .4, y - 44 + ly * .25, a);
      sh('M0 0 C-14 -14 -12 -40 0 -54 C12 -40 14 -14 0 0 Z', C.plant, { m }); ln('M0 -4 L0 -44', { m });
    }
    // trailing stem over the sill edge
    ln(`M${px + 26} ${y - 12} C${px + 52} ${y + 4} ${px + 60} ${y + 30} ${px + 54} ${y + 58}`);
    for (const [lx, ly, a] of [[px + 46, y + 8, 1.9], [px + 58, y + 34, 2.4], [px + 52, y + 58, 3.0]]) sh('M0 0 C-8 -8 -7 -22 0 -28 C7 -22 8 -8 0 0 Z', C.plant, { m: M(lx, ly, a) });
    sh(`M${px - 30} ${y - 46} H${px + 30} L${px + 24} ${y} H${px - 24} Z`, C.pot);
    sh(rect(px - 33, y - 52, 66, 10), C.pot);
    // stacked books + mug (right end)
    const bx = 640;
    sh(rect(bx, y - 18, 92, 18), C.book1); ln(`M${bx + 8} ${y - 9} H${bx + 84}`);
    sh(rect(bx + 6, y - 32, 80, 14), C.book2);
    sh(rect(bx + 2, y - 46, 86, 14), C.book3); ln(`M${bx + 12} ${y - 46} V${y - 32}`);
    sh(`M${bx + 30} ${y - 46} V${y - 84} H${bx + 64} V${y - 46} Z`, C.mug);
    sh(`M${bx + 64} ${y - 76} C${bx + 80} ${y - 76} ${bx + 80} ${y - 56} ${bx + 64} ${y - 56}`, null);
    flat(rect(bx + 30, y - 72, 34, 8), C.ctx);
  }

  function curtains() {
    // rod with rings and finials
    sh(rect(20, 22, 890, 10), C.rod); sh(ell(22, 27, 11, 11), C.rod); sh(ell(908, 27, 11, 11), C.rod);
    const cur = (x0, x1, lean) => {
      const top = 32, d = `M${x0} ${top} H${x1} C${x1 + lean} 400 ${x1 - lean * .4} 700 ${x1 + lean * .3} ${H + 20} H${x0 - 6} C${x0} 700 ${x0 + 4} 400 ${x0} ${top} Z`;
      sh(d, C.curtain);
      const n = 4; for (let i = 1; i < n; i++) { const fx = x0 + (x1 - x0) * i / n; ln(`M${fx} ${top + 4} C${fx + lean * .6} 380 ${fx - lean * .3} 720 ${fx + lean * .2} ${H + 20}`); }
      for (let i = 0; i <= n; i++) { const rx = x0 + 8 + (x1 - x0 - 16) * i / n; sh(ell(rx, 27, 7, 9), null); }
    };
    cur(36, 176, 18);
    cur(736, 872, -16);
  }

  function radiator() {
    const x0 = 180, x1 = 330, y0 = 604, y1 = 770;
    sh(rect(x0, y0, x1 - x0, y1 - y0), C.rad);
    for (let x = x0 + 18; x < x1; x += 18) ln(`M${x} ${y0 + 8} V${y1 - 8}`);
    ln(`M${x0} ${y0 + 12} H${x1} M${x0} ${y1 - 12} H${x1}`);
  }

  function picture() {
    const x0 = 1300, y0 = 118, w = 230, h = 180;
    sh(rect(x0, y0, w, h), C.frame); sh(rect(x0 + 14, y0 + 14, w - 28, h - 28), C.mat);
    const ix = x0 + 34, iy = y0 + 34, iw = w - 68, ih = h - 68;
    clip(rect(ix, iy, iw, ih), () => {
      X.fillStyle = C.pSky; X.fillRect(ix, iy, iw, ih);
      sh(rect(ix - 4, iy + ih * .62, iw + 8, ih), C.pSea);
      sh(`M${ix - 4} ${iy + ih + 4} L${ix + 20} ${iy + ih * .56} L${ix + 58} ${iy + ih * .5} L${ix + 84} ${iy + ih * .7} L${ix + 96} ${iy + ih + 4} Z`, C.pRock);
      // lighthouse
      sh(poly([[ix + 44, iy + ih * .52], [ix + 60, iy + ih * .52], [ix + 57, iy + 22], [ix + 47, iy + 22]]), C.pHouse);
      flat(poly([[ix + 45.5, iy + ih * .34], [ix + 58.5, iy + ih * .34], [ix + 58.1, iy + ih * .27], [ix + 45.9, iy + ih * .27]]), C.pRed);
      sh(rect(ix + 45, iy + 12, 14, 10), C.shade); sh(`M${ix + 43} ${iy + 12} L${ix + 52} ${iy + 3} L${ix + 61} ${iy + 12} Z`, C.pRed);
      // a little sailboat
      sh(`M${ix + 112} ${iy + ih * .62} h34 l-6 8 h-22 Z`, C.pHouse); sh(`M${ix + 128} ${iy + ih * .6} V${iy + 40} L${ix + 146} ${iy + ih * .58} Z`, C.pHouse);
    });
    ln(rect(ix, iy, iw, ih));
    // hanging wire + nail
    ln(`M${x0 + 30} ${y0} L${x0 + w / 2} ${y0 - 34} L${x0 + w - 30} ${y0}`); flat(ell(x0 + w / 2, y0 - 34, 4, 4), INK);
  }

  function floorLamp() {
    const { x, top, bot } = LAMP;
    sh(rect(x - 5, bot, 10, 300), C.brass);
    sh(poly([[x - 57, top], [x + 57, top], [x + 93, bot], [x - 93, bot]]), C.shade);
    ln(`M${x - 88} ${bot - 12} H${x + 88}`); ln(`M${x - 60} ${top + 12} H${x + 60}`);
    sh(ell(x, top - 8, 7, 8), C.brass);
    ln(`M${x + 30} ${bot} V${bot + 50}`); sh(ell(x + 30, bot + 56, 5, 6), C.brass);
  }

  // ---------- the couch (frontal, one-point perspective toward the horizon at his eyes) ----------
  function couchBack() {
    // backrest with its top face
    sh(`M296 632 Q296 598 330 598 H${W + 20} V900 H296 Z`, C.couch);
    sh(`M300 626 Q304 604 334 604 H${W + 20} V616 H340 Q316 616 300 632 Z`, C.couchTop);
    // back cushions
    const cush = [[460, 930], [930, 1400], [1400, 1790]];
    for (const [a, b] of cush) sh(`M${a} 820 L${a + 4} 650 Q${a + 8} 628 ${a + 40} 630 Q${(a + b) / 2} 618 ${b - 40} 630 Q${b - 8} 628 ${b - 4} 650 L${b} 820 Z`, C.couch);
    // seat top (seen from above) + cushion seams toward the vanishing point
    sh(`M300 812 H${W + 20} V918 H300 Z`, C.couchTop);
    ln('M930 812 L915 918 M1400 812 L1440 918');
    sh(`M296 918 H${W + 20} V${H + 20} H296 Z`, C.couch);
    ln('M915 918 V1090 M1440 918 V1090');
    // throw pillow, leaning in the left corner
    sh('M452 668 Q520 640 606 650 Q622 720 618 812 Q540 826 468 818 Q452 740 452 668 Z', C.pillow);
    ln('M470 684 Q530 664 594 670');
    // arms: rolled fronts
    sh('M292 700 Q292 676 330 676 H428 Q462 676 462 712 V1100 H292 Z', C.couch);
    sh('M300 690 Q306 684 330 684 H426 Q452 684 456 704 Q440 694 420 696 H330 Q312 696 300 706 Z', C.couchTop);
    ln('M292 740 Q380 750 462 740');
    sh(`M1770 712 Q1770 680 1806 680 H${W + 20} V${H + 20} H1770 Z`, C.couch);
    sh(`M1776 700 Q1782 688 1806 688 H${W + 20} V702 H1806 Q1788 702 1776 712 Z`, C.couchTop);
    ln(`M1770 746 Q1850 756 ${W + 10} 748`);
  }

  // ---------- the shoggoth, curled asleep on the right cushion ----------
  function scallop(cx, cy, rx, ry, n, seed, bulge = .38, flatBottom = .72) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i + (hash(i * 3.7 + seed) - .5) * .5) / n * TAU, s = Math.sin(a), k = 1 + (hash(i * 1.3 + seed) - .5) * .12;
      pts.push([cx + Math.cos(a) * rx * k, cy + s * ry * k * (s > 0 ? flatBottom : 1)]);
    }
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      let nx = mx - cx, ny = my - cy; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const b = bulge * (.8 + hash(i * 5.1 + seed) * .5);
      d += ` Q${f1(mx + nx * L * b)} ${f1(my + ny * L * b)} ${f1(q[0])} ${f1(q[1])}`;
    }
    return d + ' Z';
  }
  // a tapered horn along a spine (half-width w0 → sharp tip), as one closed outline
  function horn(spine, w0, w1 = 0) {
    const n = spine.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
      const w = lerp(w0, w1, Math.pow(i / (n - 1), .9));
      L.push([spine[i][0] + Math.cos(ang) * w, spine[i][1] + Math.sin(ang) * w]); R.push([spine[i][0] - Math.cos(ang) * w, spine[i][1] - Math.sin(ang) * w]);
    }
    const tip = spine[n - 1];
    return smooth([...L.slice(0, -1), tip, ...R.slice(0, -1).reverse()], false) + ' Z';
  }
  function spiralSpine(cx, cy, r0, a0, turns, n, dir = 1) {
    const s = []; for (let i = 0; i < n; i++) { const k = i / (n - 1), a = a0 + dir * k * turns * TAU, r = r0 * (1 - k * .82); s.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return s;
  }
  // almond eye, closed (lid = 0) or almost shut (lid ~ .2): white sliver under a heavy lid
  function almond(cx, cy, w, tilt, lid = 0, small = false) {
    const m = M(cx, cy, tilt), h = w * .5;
    const outline = `M${-w / 2} 0 Q0 ${-h * 1.05} ${w / 2} 0 Q0 ${h * .95} ${-w / 2} 0 Z`;
    sh(outline, C.shogLid, { m, ink: false });
    if (lid > 0) {
      const ly = lerp(h * .45, -h * .5, lid);
      clip(outline, () => {
        flat(`M${-w / 2} 0 Q0 ${ly * 2} ${w / 2} 0 Q0 ${h * .95} ${-w / 2} 0 Z`, C.eye, { m });
        flat(ell(w * .06, h * .42, w * .12, h * .3), INK, { m });
        flat(`M${-w / 2} 0 Q0 ${ly * 2} ${w / 2} 0 Q0 ${-h * 2} ${-w / 2} 0 Z`, C.shogLid, { m });
      }, m);
    }
    ln(outline, { m });
    ln(`M${-w / 2} 0 Q0 ${(lid > 0 ? lerp(h * .45, -h * .5, lid) : h * .45) * 2} ${w / 2} 0`, { m });
    // a few lashes on the lid line (only when closed)
    if (lid === 0 && !small) for (const u of [-.25, 0, .25]) { const lx = u * w, ly = h * .45 * (1 - 4 * u * u) + 1; ln(`M${lx} ${ly} L${lx + u * 6} ${ly + 7}`, { m }); }
  }
  // the smiley mask: his lopsided oval (from the brand path), dash eyes, lopsided smile higher on the right
  function smiley(x, y, r, rot = 0, o = {}) {
    const m = M(x, y, rot).scale(r / MASK_R).translate(-MASK_C[0], -MASK_C[1]);
    sh(MASK_D, C.asst, { m });
    const mm = M(x, y, rot, r);
    for (const [ex, ey] of [[-.4, -.3], [.33, -.32]]) flat(ell(ex, ey + (o.eyeDy || 0), .065, .15), INK, { m: mm });
    if (o.blush) { flat(ell(-.62, .12, .13, .07), '#F2B8A0', { m: mm }); flat(ell(.56, .06, .12, .07), '#F2B8A0', { m: mm }); }
    ln(`M${-.47 * r} ${.3 * r} C${-.3 * r} ${.56 * r} ${.12 * r} ${.6 * r} ${.38 * r} ${.14 * r}`, { m: M(x, y, rot) });
  }

  function shoggoth(t) {
    const br = Math.sin(t * TAU / 4.5) * 2;          // slow sleeping breath
    const cx = 1604, cy = 776 - br;
    // pointed little legs peeking out from under the front (their roots hide under the body)
    for (const [lx, ang] of [[cx - 76, 2.05], [cx - 18, 1.72], [cx + 46, 1.4]]) {
      const c = Math.cos(ang), sn = Math.sin(ang), y0 = cy + 62;
      sh(horn([[lx, y0], [lx + c * 22 + 3, y0 + sn * 22], [lx + c * 42, y0 + sn * 42]], 13, 0), C.shog);
    }
    // the spiral horn, curled up against the backrest
    const sp = [[1660, 716], [1684, 668], [1694, 626], ...spiralSpine(1658, 604, 36, 0.1, 1.05, 12, -1)];
    sh(horn(sp, 24, 2), C.shog);
    almond(1688, 666, 16, -1.2, 0, true);
    // a crooked horn from the back, drooping over sideways like a sleepy antenna
    sh(horn([[1508, 712], [1494, 662], [1508, 624], [1474, 604], [1440, 612], [1418, 634]], 20, 1), C.shog);
    ln('M1488 662 Q1502 658 1510 650');
    // a crooked horn draped over the armrest like a sleeping arm
    sh(horn([[1726, 796], [1760, 736], [1796, 704], [1836, 700], [1860, 726], [1864, 772], [1856, 810]], 24, 1), C.shog);
    ln('M1790 708 Q1802 720 1816 716');
    almond(1764, 742, 17, -.9, 0, true);
    // the little arm reaching out along the cushion (its base hides under the body)
    tube(`M${cx - 100} ${cy + 30} L${cx - 164} ${cy + 54} L${cx - 198} ${cy + 60}`, 13, C.shog);
    // body: cloud-scalloped lump, resting heavy on the cushion
    sh(scallop(cx, cy, 150, 100, 13, 11, .32, .8), C.shog);
    ln(`M${cx - 98} ${cy - 18} q14 -12 30 -6 M${cx + 88} ${cy - 50} q12 -4 20 4 M${cx + 8} ${cy - 72} q10 -6 22 0 M${cx + 60} ${cy + 58} q12 4 22 -2`);
    // eyes: the big central one and the small ones, all shut; one is not quite
    almond(cx - 2, cy + 2 - br * .2, 82, -.04, 0);
    almond(cx + 76, cy - 44, 38, -.25, 0);
    almond(cx - 82, cy - 36, 32, .2, 0);
    almond(cx + 106, cy + 22, 28, .35, 0);
    almond(cx - 66, cy + 40, 24, -.15, 0);
    almond(cx + 22, cy - 64, 26, .1, .14);
    almond(cx + 36, cy + 52, 20, .1, 0);
    // the mask lies on the little arm like a cheek on a pillow
    smiley(cx - 192, cy + 18, 37, -1.0);
  }

  // ---------- him ----------
  const HEAD = { x: 1052, y: 348, rot: -.32 };
  // laptop projection: local x along the hinge, z from the hinge toward him, y up; turned toward the camera (the BD cheat)
  const LAP = { x: 792, y: 818, yaw: .61, pitch: .44, open: .35 };
  function lp(x, y, z) {
    const sx = Math.sin(LAP.yaw), cz = Math.cos(LAP.yaw), cp = Math.cos(LAP.pitch), sp = Math.sin(LAP.pitch);
    const wx = sx * x + cz * z, wy = y, wz = -cz * x + sx * z;
    return [LAP.x + wx, LAP.y - wy * cp + wz * sp];
  }
  function lidP(x, v) { const L = 200, a = LAP.open; return lp(x, (L - v) * Math.cos(a), -(L - v) * Math.sin(a)); }   // v from lid top (0) to hinge (200)

  function legs() {
    // far leg: knee just past the laptop's corner, shin going down
    sh('M880 902 C800 902 730 904 706 922 C684 940 686 976 700 1000 L706 1100 L792 1100 L788 1000 C800 968 834 954 880 948 Z', C.pants);
    // near leg: thigh along the seat, knee, shin
    sh('M1250 870 C1150 878 1010 898 880 928 C820 942 772 962 762 1000 C756 1030 764 1070 770 1100 L884 1100 C880 1066 890 1040 930 1030 C1030 1012 1160 1004 1244 998 C1278 984 1284 902 1250 870 Z', C.pants);
    ln('M860 936 C828 962 826 1000 846 1030 M1010 916 Q1050 934 1100 928 M1040 1006 Q1080 996 1120 1000 M1150 890 Q1190 900 1220 894 M790 1004 Q800 1030 794 1060');
    ln('M722 1000 Q734 1040 728 1080');
  }
  function torso() {
    // bomber body (oversized, boxy blouson)
    sh('M1000 440 C962 468 940 524 930 594 C918 664 920 744 934 822 L1234 862 C1266 782 1274 682 1266 598 C1260 540 1244 494 1200 454 C1150 432 1056 430 1004 448 Z', C.bomber);
    // the screen's light catches the front of the jacket (flat zone)
    clip('M1000 440 C962 468 940 524 930 594 C918 664 920 744 934 822 L1234 862 C1266 782 1274 682 1266 598 C1256 540 1236 474 1180 424 C1140 414 1050 422 1000 440 Z', () => flat('M880 420 L1010 420 C990 520 972 640 976 860 L880 860 Z', C.bomberLit));
    ln('M1000 440 C962 468 940 524 930 594 C918 664 920 744 934 822');
    // the dark shirt in the half-open zip
    sh('M996 442 C1010 460 1024 490 1032 518 C1046 494 1060 476 1074 466 Z', C.shirt);
    // zip line with its pull, raglan seam, a chest fold, slash pocket
    ln('M1032 518 C1010 610 996 710 1000 830');
    sh(rect(1025, 518, 12, 20), '#C9CCD6');
    ln('M1196 452 C1176 500 1160 540 1150 590');
    ln('M1186 604 Q1204 640 1200 680');
    ln('M960 700 L990 772');
    // hem rib (orange)
    sh('M932 808 L1238 848 L1230 886 C1120 882 1010 868 928 848 Z', C.rib);
    for (let i = 1; i < 16; i++) { const k = i / 16, x0 = lerp(932, 1238, k), y0 = lerp(808, 848, k), x1 = lerp(928, 1230, k), y1 = lerp(848, 886, k) - Math.sin(k * Math.PI) * 6; ln(`M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)}`); }
    // smiley pin on the chest
    sh(ell(1090, 574, 13, 13), C.pin); flat(ell(1086, 570, 1.6, 3), INK); flat(ell(1094, 570, 1.6, 3), INK); ln('M1084 578 Q1090 583 1097 576');
  }
  function collarAndNeck() {
    // nape of the neck (dimmer skin: away from the screen)
    sh('M1066 400 C1074 420 1072 444 1066 466 L1152 444 C1144 420 1140 394 1138 364 Z', C.skinSh);
    // ribbed collar: the knit band hugging the neck, open at the zip under his chin; square ends, ribs across
    ribBand([[1066, 472], [1110, 482], [1164, 458], [1204, 402]], 13, 14);
    ribBand([[1002, 448], [1014, 440], [1030, 432], [1048, 426]], 13, 3);
  }
  function head() {
    const m = M(HEAD.x, HEAD.y, HEAD.rot);
    const skull = 'M-68 -50 C-73 -36 -75 -22 -73 -10 C-71 -4 -69 2 -70 8 C-73 20 -74 32 -70 44 C-66 58 -58 70 -46 80 C-36 88 -24 90 -12 88 C8 84 24 74 36 60 C44 50 50 42 54 34 L72 8 C88 -24 84 -72 56 -102 C30 -126 -20 -128 -48 -106 C-60 -94 -66 -72 -68 -50 Z';
    sh(skull, C.skinLit, { m });
    // the side turned away from the screen sits in flat shadow (hard edge, no outline)
    clip(skull, () => flat('M40 -120 C16 -60 30 -10 24 24 C20 50 8 72 -6 96 L120 96 L120 -120 Z', C.skin, { m }), m);
    ln(skull, { m });
    // ear
    sh('M48 -10 C56 -22 74 -16 71 4 C69 22 62 34 50 32 C47 30 46 26 47 22', C.skinSh, { m });
    ln('M56 -2 C63 0 64 12 57 18', { m });
    // cheek
    flat(ell(-8, 32, 12, 6), C.blush, { m });
    // eyes: dot pupils sitting low under heavy lids (looking down), a tired line beneath the near one
    flat(ell(-15, 6, 4.6, 5.8), INK, { m }); flat(ell(-58, 5, 3.4, 5.2), INK, { m });
    ln('M-28 2 Q-15 -5 -2 3', { m }); ln('M-66 2 Q-59 -3 -51 3', { m });
    ln('M-23 15 Q-15 18 -7 15', { m });
    // sad brows: the inner ends lifted
    ln('M-33 -37 Q-17 -36 -2 -27', { m }); ln('M-46 -38 Q-58 -37 -69 -29', { m });
    // nose and the half-smile (the near corner lifts, the rest doesn't)
    ln('M-51 6 C-59 17 -66 27 -61 32 C-57 35 -52 34 -48 31', { m });
    ln('M-55 54 Q-45 58 -35 55 Q-30 53 -27 49', { m });
    ln('M-47 65 Q-42 66 -38 65', { m });
    // round glasses: near lens, foreshortened far lens, bridge, temple arm; a sliver of screen light in each lens
    const lens = [ell(-15, -3, 21, 21), ell(-58, -4, 10.5, 19.5)];
    for (const d of lens) flat(d, 'rgba(215,240,241,0.16)', { m });
    flat('M-31 8 L-24 0 L-20 3 L-27 11 Z', C.screen, { m }); flat('M-33 14 L-30 11 L-28 12.5 L-31 15.5 Z', C.ctx, { m }); flat('M-64 6 L-60 1 L-58 3 L-62 8 Z', C.screen, { m });
    for (const d of lens) ln(d, { m });
    ln('M-36 -7 Q-42 -13 -48 -8', { m }); ln('M6 -5 L50 -8', { m });
    // hair: a messy mass — bumpy crown, tufts sticking out at the back and nape, a clumped uneven fringe that stays above the brows
    const hair = 'M-84 -40 Q-94 -70 -76 -94 Q-80 -114 -56 -124 Q-42 -144 -14 -138 Q2 -152 24 -142 Q48 -148 62 -132 C60 -152 74 -172 104 -174 C90 -164 84 -150 84 -126 Q90 -114 92 -100 L110 -104 Q100 -90 100 -76 Q110 -60 104 -44 L118 -40 Q104 -30 102 -16 Q104 4 96 16 L108 32 L92 32 Q98 50 92 70 L82 58 L78 82 L68 62 L60 74 Q60 40 60 6 Q56 -14 38 -20 L32 -4 L24 -24 Q18 -36 14 -42 Q8 -50 0 -56 Q-4 -48 -12 -42 Q-16 -54 -24 -60 Q-28 -50 -36 -44 Q-40 -56 -48 -62 Q-54 -52 -62 -44 Q-64 -56 -70 -60 Q-78 -52 -84 -40 Z';
    sh(hair, C.hair, { m });
    ln('M40 -132 Q0 -128 -40 -96 M48 -120 Q14 -104 -6 -72 M62 -112 Q46 -84 34 -56 M80 -104 Q84 -70 72 -40 M96 -54 Q92 -24 80 -2 M-50 -118 Q-66 -100 -70 -76', { m });
    // the cowlick: a tuft standing up at the back of the crown
    ln('M70 -138 C72 -154 82 -166 96 -170', { m });
  }
  function laptop() {
    const b = [lp(-150, 0, 0), lp(150, 0, 0), lp(150, 0, 210), lp(-150, 0, 210)], th = 12;
    const dn = p => [p[0], p[1] + th * Math.cos(LAP.pitch)];
    // base: the side and front slabs, then the top
    sh(poly([b[0], b[3], dn(b[3]), dn(b[0])]), C.lapSide);
    sh(poly([b[3], b[2], dn(b[2]), dn(b[3])]), C.lapSide);
    sh(poly(b), C.lap);
    // keyboard well + key caps, trackpad
    const kb = [lp(-128, 0, 18), lp(128, 0, 18), lp(128, 0, 112), lp(-128, 0, 112)];
    sh(poly(kb), C.keys);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { const x = -124 + c * 19.2, z = 22 + r * 18.4; flat(poly([lp(x, 0, z), lp(x + 16, 0, z), lp(x + 16, 0, z + 15), lp(x, 0, z + 15)]), C.keyCap); }
    sh(poly([lp(-50, 0, 126), lp(50, 0, 126), lp(50, 0, 196), lp(-50, 0, 196)]), '#C3C7D1');
    // lid: bezel then the glowing screen
    const lid = [lidP(-150, 0), lidP(150, 0), lidP(150, 200), lidP(-150, 200)];
    sh(poly(lid), C.bezel);
    const sc = [lidP(-138, 12), lidP(138, 12), lidP(138, 186), lidP(-138, 186)];
    sh(poly(sc), C.screen);
    // screen content in lid space: u → right along the hinge, v → down the lid
    const o = lidP(-138, 12), pu = lidP(-137, 12), pv = lidP(-138, 13);
    const mat = new DOMMatrix([pu[0] - o[0], pu[1] - o[1], pv[0] - o[0], pv[1] - o[1], o[0], o[1]]);
    clip(poly(sc), () => {
      const bars = [[14, 16, 150, 12, C.ui], [14, 34, 110, 12, C.ui], [120, 58, 140, 12, '#EFF28A'], [150, 76, 110, 12, '#EFF28A'], [14, 100, 170, 12, C.ui], [14, 118, 90, 12, C.ui]];
      for (const [u, v, w, h, c] of bars) flat(`M${u} ${v} h${w} v${h} h${-w} Z`, c, { m: mat });
      X.save(); X.setTransform(mat); X.font = '700 17px Rajdhani, sans-serif'; X.fillStyle = C.ctx; X.textBaseline = 'middle'; X.fillText('context 97%', 14, 155); X.restore();
      flat('M112 147 h140 v14 h-140 Z', '#F4C6D0', { m: mat });
      flat(`M112 147 h${140 * .97} v14 h${-140 * .97} Z`, C.ctx, { m: mat });
    });
    ln('M112 147 h140 v14 h-140 Z', { m: mat, lw: 2 });
    ln(poly(sc));
  }
  function nearArm() {
    // sleeve: shoulder → elbow → forearm across the belly to the keyboard
    const sleeve = 'M1190 456 C1238 470 1266 520 1268 600 C1270 670 1252 730 1210 770 C1150 820 1040 850 940 862 L926 810 C1010 790 1090 760 1128 724 C1136 660 1136 580 1150 520 C1156 490 1170 466 1190 456 Z';
    sh(sleeve, C.bomber);
    // the lamp behind him warms the back edge of the sleeve (a flat rim zone)
    clip(sleeve, () => flat('M1230 440 C1262 500 1250 560 1252 620 C1254 690 1236 740 1196 780 L1300 800 L1300 440 Z', C.bomberWarm));
    ln(sleeve);
    ln('M1166 736 Q1190 752 1214 742 M1150 760 Q1172 778 1200 770 M1060 800 Q1070 818 1062 836');
    // the sleeve pocket: zipped, with a pen slot
    const pm = M(1214, 596, -.12);
    sh('M-26 -22 H26 V26 Q26 30 22 30 H-22 Q-26 30 -26 26 Z', C.bomber, { m: pm });
    ln('M-26 -12 H26 M10 -22 V30', { m: pm });
    sh('M-18 -14 h6 v12 h-6 Z', '#C9CCD6', { m: pm });
    // hand resting on the trackpad edge
    const hm = M(912, 842, Math.atan2(-.24, -.82));
    sh('M-4 -22 C20 -26 40 -24 50 -18 L52 18 C38 24 18 26 -4 22 Z', C.skinLit, { m: hm });
    for (const [v, L] of [[-14, 22], [-4, 26], [6, 25], [15, 20]]) sh(`M46 ${v - 5} C${46 + L} ${v - 6} ${50 + L} ${v + 6} 46 ${v + 5}`, C.skinLit, { m: hm });
    sh('M16 -20 C24 -30 36 -34 46 -30 C48 -26 44 -22 38 -21 C30 -20 24 -16 22 -12 Z', C.skinLit, { m: hm });
    // cuff
    sh('M932 808 L948 864 L906 872 L892 818 Z', C.rib);
    for (let i = 1; i < 5; i++) { const k = i / 5; ln(`M${f1(lerp(932, 892, k))} ${f1(lerp(808, 818, k))} L${f1(lerp(948, 906, k))} ${f1(lerp(864, 872, k))}`); }
  }

  // ---------- the Assistant, perched on his near shoulder, head against his head ----------
  function assistant(t) {
    const sway = Math.sin(t * TAU / 4.5) * .015;
    const x = 1230, y = 466;                 // seat point on the shoulder
    // chunky little legs over the front of the shoulder, knees toward us, feet dangling
    tube(`M${x - 18} ${y - 8} L${x - 24} ${y + 18} L${x - 22} ${y + 44}`, 10, C.asst);
    tube(`M${x + 8} ${y - 6} L${x + 8} ${y + 22} L${x + 14} ${y + 48}`, 10, C.asst);
    // body: a small rounded bean, leaning over toward him
    const body = `M${x - 30} ${y + 2} C${x - 44} ${y - 30} ${x - 40} ${y - 64} ${x - 18} ${y - 78} C${x + 6} ${y - 90} ${x + 28} ${y - 66} ${x + 28} ${y - 34} C${x + 28} ${y - 8} ${x + 14} ${y + 6} ${x - 2} ${y + 6} C${x - 14} ${y + 6} ${x - 24} ${y + 6} ${x - 30} ${y + 2} Z`;
    sh(body, C.asst);
    // head = the mask, tipped over and resting against the back of his head
    smiley(x - 64, y - 98, 40, -.62 + sway, { blush: 1 });
    // near arm: the little hand holds on to his collar
    tube(`M${x - 4} ${y - 58} L${x - 30} ${y - 42} L${x - 54} ${y - 42}`, 8.5, C.asst);
  }

  // the lamp's lower cone also falls on the couch: redraw inside the cone with lit colours (flat, hard-edged, same lines)
  const LIT = { couch: '#8C4453', couchTop: '#A45668', pillow: '#E6B658', pillowTop: '#EEC66C' };
  function lampCone(draw) {
    const keep = { ...C }; Object.assign(C, LIT);
    clip(poly([[LAMP.x - 93, LAMP.bot], [LAMP.x + 93, LAMP.bot], [LAMP.x + 520, 1100], [LAMP.x - 520, 1100]]), draw);
    Object.assign(C, keep);
  }

  function scene(t) {
    wall();
    picture();
    floorLamp();
    windowFrame(t);
    sillProps();
    radiator();
    curtains();
    couchBack();
    lampCone(couchBack);
    shoggoth(t);
    legs();
    torso();
    laptop();
    collarAndNeck();
    head();
    nearArm();
    assistant(t);
  }

  function frame(t) {
    style(1);
    FX.noAuto = true; FX.bloom = 0; FX.scan = 0; FX.grain = 0;
    scene(t);
  }
  chapter('ligneclaire', 5, 6, [[5, frame]]);
})();
