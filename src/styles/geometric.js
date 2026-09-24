// geometric.js: style study, slot K = 3. Late-90s cable-cartoon geometric design language (UPA-descended):
// characters built from hard primitives (trapezoid torso, flat-top angular head, triangle nose, tiny stick limbs),
// heavy uniform black outlines, flat saturated fills with ONE hard shadow shape, and a graphic background:
// banded blue-hour sky, a bold flat moon, rectangle buildings with checker windows, rain as parallel diagonal strokes.
(() => {
  const K = 3;
  const INK = '#0D0A18', LW = 7, BW = 5;   // LW: characters, BW: the set (lighter, so the cast pops)
  const C = {
    wall: '#241F55', wallLit: ['#2E2562', '#3A2B68', '#4A326C'],
    sky: ['#2A3C9C', '#3149AE', '#3B56BE', '#4A62C8', '#5E6BCC'],
    moon: '#FFF1B4', moonDk: '#EDD587',
    bFar: '#3A4DAA', bMid: '#2A3A8E', bNear: '#1D2A70', bSide: 'rgba(8,10,40,.28)', winA: '#FFD65A', winB: '#FFB54A', winOff: '#243276',
    rain: '#CFE0FF',
    frame: '#8D86CC', frameDk: '#655FA6', sill: '#A49DDA',
    couch: '#963158', couchDk: '#621D3D', couchTop: '#AD4467', couchBase: '#3E1029',
    skin: '#F6C7A6', skinDk: '#C98A92', blush: '#F28C9C',
    hair: '#1E1636', hairHi: '#3A2D66',
    bomber: '#5140C0', bomberDk: '#30238A', rib: '#FF8A1F', ribDk: '#C95A0C', shirt: '#1E1A30',
    pants: '#2B2744', pantsDk: '#1B1830', shoe: '#E8E4F4',
    mask: '#F5FA83', maskDk: '#C9CF4E',
    shog: '#99B087', shogDk: '#6F8A5F', shogLid: '#86A073', eye: '#FFFFF4',
    laptop: '#D6D4EA', laptopDk: '#9C98BE', screen: '#BDF6FF', screenGlow: '#9FF0FF', ctx: '#FF3D6E',
    lampShade: '#FFB63C', lampShadeDk: '#E0862A', lampIn: '#FFE9A8', stem: '#1A1430'
  };

  // ---------- helpers ----------
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // polygon with rounded corners (r: number or per-vertex array); radii are clamped so short edges stay clean
  function rpoly(pts, r = 0) {
    const p = new Path2D(), n = pts.length;
    if (!r) { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
    const R = i => Array.isArray(r) ? r[i] : r;
    const s = mid(pts[n - 1], pts[0]); p.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) {
      const a = pts[i], pv = pts[(i - 1 + n) % n], nx = pts[(i + 1) % n], q = mid(a, nx);
      const v1 = [pv[0] - a[0], pv[1] - a[1]], v2 = [nx[0] - a[0], nx[1] - a[1]], l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
      const ang = Math.acos(clamp((v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2 || 1), -1, 1));
      const rmax = Math.min(l1, l2) * .5 * Math.tan(ang / 2);
      p.arcTo(a[0], a[1], q[0], q[1], Math.max(0, Math.min(R(i), rmax)));
    }
    p.closePath(); return p;
  }
  const circ = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; };
  const oval = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); return p; };
  const pl = (pts, close = false) => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); if (close) p.closePath(); return p; };
  // quadratic-smoothed open polyline (for mouths, lids)
  const curve = pts => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const q = mid(pts[i], pts[i + 1]); p.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } p.lineTo(...pts[pts.length - 1]); return p; };
  function fill(path, col, a = 1) { X.globalAlpha = a; X.fillStyle = col; X.fill(path); X.globalAlpha = 1; }
  function ink(path, lw = LW, col = INK) { X.lineWidth = lw; X.strokeStyle = col; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(path); }
  function fs(path, col, lw = LW) { if (col) fill(path, col); if (lw) ink(path, lw); }
  function shadeIn(path, sh, col, a = 1) { X.save(); X.clip(path); X.globalAlpha = a; X.fillStyle = col; X.fill(sh); X.restore(); X.globalAlpha = 1; }
  // limb/horn polygon along a spine with true miter joins; w0 → w1 half-widths (w1 = 0 → sharp point)
  function taper(sp, w0, w1) {
    const n = sp.length, L = [], R = [];
    const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; };
    for (let i = 0; i < n; i++) {
      const w = lerp(w0, w1, i / (n - 1)); let nx, ny;
      if (i === 0) [nx, ny] = nrm(sp[0], sp[1]); else if (i === n - 1) [nx, ny] = nrm(sp[n - 2], sp[n - 1]);
      else { const a = nrm(sp[i - 1], sp[i]), b = nrm(sp[i], sp[i + 1]); let mx = a[0] + b[0], my = a[1] + b[1]; const d = Math.hypot(mx, my) || 1; mx /= d; my /= d; const k = Math.min(2, 1 / Math.max(.3, mx * a[0] + my * a[1])); nx = mx * k; ny = my * k; }
      L.push([sp[i][0] + nx * w, sp[i][1] + ny * w]); R.push([sp[i][0] - nx * w, sp[i][1] - ny * w]);
    }
    return L.concat(R.reverse());
  }
  // 4-point sparkle
  function sparkle(x, y, r, col, a = 1) { fill(pl([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], true), col, a); }

  // ---------- the room ----------
  const WIN = { tl: [470, 70], tr: [1592, 56], br: [1600, 548], bl: [460, 558] };
  function wall(t) {
    X.fillStyle = C.wall; X.fillRect(0, 0, W, H);
    // vertical wallpaper bands (flat, barely there)
    X.fillStyle = 'rgba(255,255,255,.025)'; for (let x = 20; x < W; x += 120) X.fillRect(x, 0, 44, H);
    // the lamp's light on the wall: hard-edged concentric pools
    const lx = 1790, ly = 330;
    [[560, C.wallLit[0]], [400, C.wallLit[1]], [250, C.wallLit[2]]].forEach(([r, c]) => fill(circ(lx, ly, r), c));
    // a hard diagonal of shadow across the far wall, away from the lamp
    fill(pl([[0, 0], [760, 0], [120, H], [0, H]], true), '#140F3A', .5);
    // a crooked little framed print: a flat mountain under a flat sun
    X.save(); X.translate(290, 250); X.rotate(-.07);
    fs(rpoly([[-92, -112], [92, -112], [92, 112], [-92, 112]], 4), '#E7B24A', 5);
    const art = rpoly([[-70, -90], [70, -90], [70, 90], [-70, 90]], 0);
    fill(art, '#F08A6C'); X.save(); X.clip(art);
    fill(circ(22, -24, 30), '#FFE8A0'); fill(pl([[-90, 90], [-20, -10], [30, 50], [60, 20], [110, 90]], true), '#6B3A7A'); fill(pl([[-20, -10], [0, 18], [-40, 18]], true), '#FFE8A0', .9);
    X.restore(); ink(art, 4);
    X.restore();
  }
  function outside(t) {
    const { tl, tr, br, bl } = WIN;
    // sky: flat horizontal bands (posterised blue hour)
    const bands = [[0, C.sky[0]], [150, C.sky[1]], [260, C.sky[2]], [350, C.sky[3]], [430, C.sky[4]]];
    bands.forEach(([y, c]) => { X.fillStyle = c; X.fillRect(400, 40 + y, 1300, 600); });
    // moon: bold flat disc, one hard crescent of shade, flat halo rings
    const mx = 770, my = 200, mr = 82;
    fill(circ(mx, my, mr * 1.9), '#FFFFFF', .05); fill(circ(mx, my, mr * 1.45), '#FFFFFF', .07);
    fill(circ(mx, my, mr), C.moon);
    // one hard crescent of shade on the lower right (moon minus a shifted moon)
    X.save(); X.clip(circ(mx, my, mr)); const cres = new Path2D(); cres.rect(mx - 200, my - 200, 400, 400); cres.arc(mx - mr * .3, my - mr * .25, mr * 1.02, 0, TAU, true); X.fillStyle = C.moonDk; X.fill(cres, 'evenodd'); X.restore();
    for (const [cx, cy, cr] of [[-.32, -.18, .2], [.12, .3, .14], [.3, -.36, .1]]) fill(circ(mx + cx * mr, my + cy * mr, cr * mr), C.moonDk);
    // a thin flat cloud bar crossing below the moon
    fill(rpoly([[600, 262], [930, 256], [936, 280], [606, 286]], 12), C.sky[2]);
    fill(rpoly([[690, 238], [860, 234], [864, 254], [694, 258]], 10), C.sky[2]);
    // sparkle stars
    [[560, 120, 9], [980, 110, 7], [1120, 180, 10], [1400, 130, 8], [1500, 210, 6], [640, 330, 6], [1300, 90, 5], [1010, 240, 5]].forEach(([x, y, r], i) => sparkle(x, y, r * (.85 + .15 * Math.sin(t * 2 + i)), '#FFF6D0', .9));
    // buildings: three flat layers, rectangles with checker windows, a darker side face
    const layers = [
      { col: C.bFar, base: 560, win: .5, list: [[430, 250, 70], [490, 300, 90], [600, 330, 60], [680, 285, 110], [820, 345, 80], [920, 300, 70], [1010, 260, 120], [1150, 320, 90], [1260, 280, 70], [1350, 240, 100], [1470, 300, 90], [1560, 270, 80]] },
      { col: C.bMid, base: 560, win: .7, list: [[450, 350, 110], [575, 400, 90], [690, 360, 130], [850, 410, 100], [970, 370, 120], [1110, 400, 90], [1220, 350, 120], [1370, 395, 100], [1480, 360, 130]] },
      { col: C.bNear, base: 560, win: 1, list: [[440, 440, 150], [610, 470, 120], [760, 430, 140], [930, 480, 110], [1060, 450, 150], [1240, 470, 130], [1390, 440, 160]] }
    ];
    layers.forEach((L, li) => {
      L.list.forEach(([x, top, w], bi) => {
        const id = li * 31 + bi * 7 + 3;
        fill(rpoly([[x, top], [x + w, top], [x + w, L.base + 40], [x, L.base + 40]], 0), L.col);
        fill(pl([[x + w - w * .18, top], [x + w, top], [x + w, L.base + 40], [x + w - w * .18, L.base + 40]], true), C.bSide);
        // roof toppers
        const kind = Math.floor(hash(id) * 4);
        if (kind === 0) fill(pl([[x + w * .15, top], [x + w * .5, top - w * .45], [x + w * .85, top]], true), L.col);
        else if (kind === 1) { fill(rpoly([[x + w * .3, top - 26], [x + w * .6, top - 26], [x + w * .6, top], [x + w * .3, top]], 0), L.col); X.fillStyle = L.col; X.fillRect(x + w * .44, top - 70, 4, 46); }
        else if (kind === 2) fill(rpoly([[x + w * .1, top - 14], [x + w * .9, top - 14], [x + w * .9, top], [x + w * .1, top]], 0), L.col);
        // checker windows
        const cw = li === 2 ? 16 : li === 1 ? 12 : 9, chh = li === 2 ? 20 : li === 1 ? 15 : 11, gx = cw * 1.9, gy = chh * 1.7;
        const cols = Math.floor((w * .78 - 10) / gx), rows = Math.floor((L.base - top - 16) / gy);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const on = ((r + c) % 2 === 0) !== (hash(id + r * 3.1) < .2) && hash(id * 7 + r * 13 + c) < .8 * L.win;
          X.fillStyle = on ? (hash(id + c * 5 + r) < .5 ? C.winA : C.winB) : C.winOff; X.globalAlpha = on ? (li === 0 ? .7 : 1) : .6;
          X.fillRect(x + 10 + c * gx, top + 14 + r * gy, cw, chh);
        }
        X.globalAlpha = 1;
      });
    });
    // rain: parallel diagonal strokes on a staggered lattice, sliding along their own direction
    rainStrokes(t, 440, 40, 1180, 540, .38, 44, 30, 58, .75);
    // glass shine: two parallel flat bands
    fill(pl([[1300, 90], [1370, 90], [1200, 540], [1130, 540]], true), '#FFFFFF', .06);
    fill(pl([[1400, 90], [1425, 90], [1255, 540], [1230, 540]], true), '#FFFFFF', .06);
    // drips on the glass: straight vertical streaks ending in a teardrop (circle + triangle)
    [[520, 150, 90], [640, 360, 70], [905, 120, 120], [1180, 300, 80], [1330, 150, 60], [1470, 330, 110], [1540, 120, 70], [860, 420, 60]].forEach(([x, y, l], i) => {
      const yy = y + frac(t * .08 + hash(i)) * 40;
      fill(pl([[x - 3.5, yy - 6], [x, yy - l], [x + 3.5, yy - 6]], true), '#DDE9FF', .35);
      fill(pl([[x - 6, yy], [x, yy - 14], [x + 6, yy]], true), '#DDE9FF', .75); fill(circ(x, yy + 1, 6), '#DDE9FF', .75);
    });
  }
  function rainStrokes(t, x0, y0, w, h, ang, len, gx, gy, a) {
    X.save(); X.translate(x0 + w / 2, y0 + h / 2); X.rotate(ang);
    const R = Math.hypot(w, h) / 2 + 60, ph = (t * 900) % (gy * 2);
    X.strokeStyle = C.rain; X.lineWidth = 3; X.lineCap = 'round'; X.globalAlpha = a; X.beginPath();
    for (let j = -Math.ceil(R / gy) - 2; j <= Math.ceil(R / gy) + 2; j++) for (let i = -Math.ceil(R / gx) - 1; i <= Math.ceil(R / gx) + 1; i++) {
      if (hash(i * 13.1 + (j & 1023) * 7.7) < .35) continue;
      const x = i * gx + (j & 1 ? gx / 2 : 0), y = j * gy + ph, l = len * (hash(i * 3 + j * 5) < .5 ? 1 : .6);
      X.moveTo(x, y); X.lineTo(x, y + l);
    }
    X.stroke(); X.restore(); X.globalAlpha = 1;
  }
  function windowFrame(t) {
    const { tl, tr, br, bl } = WIN, glass = rpoly([tl, tr, br, bl], 0);
    X.save(); X.clip(glass); outside(t); X.restore();
    // frame: a thick flat band around the glass + a cross of mullions
    const f = 24, outer = rpoly([[tl[0] - f, tl[1] - f], [tr[0] + f, tr[1] - f], [br[0] + f, br[1] + f], [bl[0] - f, bl[1] + f]], 6);
    const band = new Path2D(); band.addPath(outer); band.addPath(glass);
    X.fillStyle = C.frame; X.fill(band, 'evenodd');
    // frame shade: the inner right + bottom lip
    X.save(); X.clip(band, 'evenodd'); fill(pl([[br[0], tr[1] - 40], [br[0] + 60, tr[1] - 40], [br[0] + 60, br[1] + 60], [bl[0] - 60, br[1] + 60], [bl[0], bl[1]], [br[0], br[1]]], true), C.frameDk); X.restore();
    const mt = mid(tl, tr), mb = mid(bl, br), ml = [lerp(tl[0], bl[0], .45), lerp(tl[1], bl[1], .45)], mr = [lerp(tr[0], br[0], .45), lerp(tr[1], br[1], .45)];
    const mull = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy), nx = -dy / d * w, ny = dx / d * w; return pl([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], true); };
    const m1 = mull(mt, mb, 9), m2 = mull(ml, mr, 9);
    fs(m1, C.frame, 4); fs(m2, C.frame, 4);
    ink(outer, 5); ink(glass, 4);
    // sill
    fs(rpoly([[bl[0] - 50, bl[1] + 18], [br[0] + 50, br[1] + 8], [br[0] + 56, br[1] + 36], [bl[0] - 44, bl[1] + 46]], 6), C.sill, 5);
  }
  function floorLamp(t) {
    const x = 1790, top = 262, bot = 380;
    // the warm light: flat translucent cones up and down
    fill(pl([[x - 78, bot], [x + 78, bot], [x + 280, 1080], [x - 280, 1080]], true), '#FFC86A', .13);
    fill(pl([[x - 50, top], [x + 50, top], [x + 160, 0], [x - 160, 0]], true), '#FFC86A', .13);
    // stem (goes down behind the couch)
    fs(rpoly([[x - 6, bot - 10], [x + 6, bot - 10], [x + 6, 700], [x - 6, 700]], 0), C.stem, 4);
    // shade: a trapezoid with the lit inside showing under its rim
    fs(rpoly([[x - 70, bot - 4], [x + 70, bot - 4], [x + 64, bot + 10], [x - 64, bot + 10]], 4), C.lampIn, 5);
    const shade = rpoly([[x - 48, top], [x + 48, top], [x + 84, bot], [x - 84, bot]], 6);
    fill(shade, C.lampShade); shadeIn(shade, pl([[x + 20, top - 10], [x + 100, top - 10], [x + 100, bot + 10], [x + 44, bot + 10]], true), C.lampShadeDk); ink(shade, 6);
    // stripes on the shade
    for (const k of [-.5, 0, .5]) { const p = pl([[x + k * 48, top + 4], [x + k * 84, bot - 4]]); ink(p, 3, 'rgba(120,60,10,.45)'); }
  }
  function couchBack() {
    // backrest (two big cushions), left armrest
    fs(rpoly([[130, 610], [1880, 604], [1890, 880], [120, 880]], 46), C.couch, BW);
    const cushion = (x0, x1) => { const p = rpoly([[x0, 626], [x1, 622], [x1 + 4, 846], [x0 - 4, 850]], 40); fill(p, C.couch); shadeIn(p, pl([[x0 - 10, 760], [x1 + 10, 740], [x1 + 10, 900], [x0 - 10, 900]], true), C.couchDk); ink(p, BW - 1); };
    cushion(150, 990); cushion(1000, 1860);
    // left armrest: a block with a rolled top
    const arm = rpoly([[40, 700], [300, 700], [306, 1100], [34, 1100]], 30);
    fill(arm, C.couch); shadeIn(arm, pl([[200, 690], [320, 690], [320, 1100], [230, 1100]], true), C.couchDk); ink(arm, BW);
    const roll = rpoly([[30, 684], [312, 684], [318, 756], [24, 756]], 36);
    fill(roll, C.couchTop); shadeIn(roll, pl([[0, 730], [330, 724], [330, 780], [0, 780]], true), C.couch); ink(roll, BW);
  }
  function pillow() {
    // a square cushion tipped onto one corner, flat mustard with a teal zigzag band
    X.save(); X.translate(1650, 770); X.rotate(.32);
    const p = rpoly([[-88, -84], [86, -90], [90, 86], [-86, 90]], 22);
    fill(p, '#EDB23E'); X.save(); X.clip(p);
    const zz = []; for (let i = 0; i <= 8; i++) zz.push([-110 + i * 28, (i % 2 ? -14 : 14)]);
    X.lineJoin = 'miter'; X.strokeStyle = '#2E9C98'; X.lineWidth = 22; X.stroke(pl(zz)); X.lineJoin = 'round';
    fill(pl([[20, -120], [140, -120], [140, 140], [-40, 140]], true), '#B97A1E', .55);
    X.restore(); ink(p, BW + 1);
    X.restore();
  }
  function couchSeat() {
    // seat cushions: top strip + front face + dark base
    const top = rpoly([[280, 828], [1900, 826], [1910, 880], [270, 884]], 20);
    fs(top, C.couchTop, BW);
    const front = rpoly([[268, 872], [1912, 868], [1916, 1000], [262, 1004]], 16);
    fill(front, C.couch); shadeIn(front, pl([[0, 950], [W, 944], [W, 1100], [0, 1100]], true), C.couchDk); ink(front, BW);
    fs(rpoly([[258, 996], [1920, 992], [1920, 1100], [258, 1100]], 0), C.couchBase, BW);
    // seam between seat cushions (behind his legs)
    ink(pl([[1010, 830], [1004, 1000]]), 5);
  }

  // ---------- the shoggoth (geometric: a scallop-cloud of circles, crooked angular horns, a compass-drawn spiral) ----------
  function shoggoth(t) {
    const br = Math.sin(t * TAU / 4.2) * 3;   // slow sleeping breath
    const limb = (sp, w0, w1, sh) => { const p = rpoly(taper(sp, w0, w1), 3); fill(p, C.shog); if (sh) shadeIn(p, sh, C.shogDk); ink(p); };
    // crooked horn draped over the armrest (angular zigzag, tapering to a point)
    limb([[410, 772], [338, 700 + br], [250, 694], [194, 640], [142, 654]], 30, 0, pl([[120, 690], [430, 700], [430, 820], [120, 820]], true));
    // a second crooked horn standing up off the top
    limb([[478, 736], [450, 646 + br], [504, 604 + br], [490, 536 + br]], 25, 0, pl([[480, 520], [560, 520], [560, 760], [470, 760]], true));
    // the spiral limb: rises off the back and curls on a compass-drawn spiral (tapering)
    const sp = [[594, 760], [604, 690]];
    for (let i = 0; i <= 44; i++) { const u = i / 44, ang = Math.PI + u * TAU * 1.25, r = 64 * (1 - u * .8); sp.push([670 + r * Math.cos(ang), 640 + br + r * Math.sin(ang)]); }
    limb(sp, 26, 5, pl([[640, 560], [760, 560], [760, 760], [700, 760]], true));
    // flat contact shadow on the seat
    fill(oval(500, 860, 210, 18), '#3A0E24', .45);
    // body: union of circles (the outline is a fat ink underlay, so only the outer scallops are inked)
    const lumps = [[352, 802, 46], [398, 752, 52], [464, 722 + br * .5, 58], [540, 724 + br * .5, 56], [606, 758, 50], [638, 808, 40], [490, 800, 90]];
    const flatR = [[330, 780], [660, 780], [664, 852], [326, 852]];
    const body = new Path2D(); lumps.forEach(([x, y, r]) => body.addPath(circ(x, y, r))); body.addPath(rpoly(flatR, 24));
    // pointed little legs (triangles) peeking out underneath
    [[364, 846, -1], [436, 858, -.3], [556, 858, .3], [626, 846, 1]].forEach(([x, y, d]) => fs(pl([[x - 17, y - 14], [x + 17, y - 14], [x + d * 18, y + 24]], true), C.shog, 6));
    X.fillStyle = INK; lumps.forEach(([x, y, r]) => X.fill(circ(x, y, r + LW / 2 + .5))); X.fill(rpoly(flatR.map(([x, y], i) => [x + (i === 1 || i === 2 ? 4 : -4), y + (i < 2 ? -4 : 4)]), 26));
    X.fillStyle = C.shog; X.fill(body);
    // one hard shadow: the lower right of the heap
    shadeIn(body, pl([[380, 900], [720, 690], [760, 900]], true), C.shogDk);
    // eyes, all asleep: almond lids (darker green) with a heavy lash line along the bottom edge
    const lidEye = (x, y, rw, rh, rot, open = 0) => {
      X.save(); X.translate(x, y); X.rotate(rot);
      const al = new Path2D(); al.moveTo(-rw, 0); al.quadraticCurveTo(0, -rh * 1.5, rw, 0); al.quadraticCurveTo(0, rh * 1.1, -rw, 0); al.closePath();
      const lw = Math.max(3.5, LW * Math.min(1, rw / 40));
      if (open) {   // almost shut: a sliver of white with the pupil sinking under the lid
        fill(al, C.eye); X.save(); X.clip(al); fill(circ(-rw * .1, rh * .55, rh * .5), INK); fill(pl([[-rw - 5, -rh * 2], [rw + 5, -rh * 2], [rw + 5, rh * .3], [-rw - 5, rh * .2]], true), C.shogLid); X.restore();
        ink(al, lw * .8); ink(pl([[-rw, rh * .2], [rw, rh * .3]]), lw);
      } else {
        fill(al, C.shogLid, .45); ink(al, lw * .55);
        if (rw > 30) { const cr = new Path2D(); cr.moveTo(-rw * .8, -rh * .7); cr.quadraticCurveTo(0, -rh * 1.55, rw * .8, -rh * .7); ink(cr, lw * .6); }
        const lash = new Path2D(); lash.moveTo(-rw, 0); lash.quadraticCurveTo(0, rh * 1.1, rw, 0); ink(lash, lw * 1.25);
        if (rw > 14) for (const k of [-.5, 0, .5]) { const yy = rh * .55 * (1 - k * k * 1.2); ink(pl([[k * rw, yy], [k * rw * 1.2, yy + rh * .55]]), lw * .7); }
      }
      X.restore();
    };
    lidEye(494, 790, 50, 24, -.04);
    lidEye(408, 752, 22, 12, -.35); lidEye(560, 734, 25, 13, .22); lidEye(612, 802, 15, 9, .35, 1); lidEye(378, 818, 13, 8, -.2); lidEye(470, 690, 13, 7, .1); lidEye(640, 764, 10, 6, .5);
    // the little arm lying forward along the cushion, the mask resting on it like a pillow
    limb([[640, 824], [704, 842], [752, 836]], 14, 10);
    geoMask(756, 798, 40, -1.1, { eyes: 'dash' });
    // its hand: pointed fingers hooked over the mask's rim
    fs(pl([[748, 846], [770, 822], [776, 848]], true), C.shog, 5);
    fs(pl([[732, 848], [750, 828], [758, 850]], true), C.shog, 5);
  }

  // ---------- the smiley mask, geometric: a lopsided rounded octagon, dash eyes, lopsided smile ----------
  function geoMask(x, y, r, rot, o = {}) {
    X.save(); X.translate(x, y); X.rotate(rot);
    // lopsided: fuller at upper right, narrower lower left (after his MASK_D)
    const pts = [[-.12, -1.02], [.55, -.9], [.9, -.4], [.86, .3], [.5, .92], [-.12, 1.02], [-.66, .72], [-.86, .08], [-.66, -.66]].map(([u, v]) => [u * r, v * r]);
    const m = rpoly(pts, r * .38);
    fill(m, o.col || C.mask); shadeIn(m, pl([[r * .1, r * 1.3], [r * 1.2, -r * .4], [r * 1.4, r * 1.4]], true), C.maskDk); ink(m, o.lw || LW * .85);
    const lw = o.lw ? o.lw * 1.1 : LW * .95;
    if (o.eyes === 'closed') { ink(pl([[-r * .5, -r * .24], [-r * .22, -r * .24]]), lw); ink(pl([[r * .18, -r * .26], [r * .46, -r * .26]]), lw); }
    else { ink(pl([[-r * .37, -r * .42], [-r * .35, -r * .14]]), lw); ink(pl([[r * .31, -r * .44], [r * .33, -r * .16]]), lw); }
    ink(curve([[-r * .48, r * .28], [-r * .22, r * .56], [r * .1, r * .54], [r * .42, r * .14]]), lw);
    X.restore();
  }

  // ---------- him ----------
  // head local frame: origin = skull centre, facing screen-left, scaled by HS and tipped by HROT toward the laptop
  const HX = 1136, HY = 296, HROT = -.2, HS = 1.15;
  const headT = () => { X.translate(HX, HY); X.rotate(HROT); X.scale(HS, HS); };
  const toHead = pts => pts.map(([x, y]) => { const dx = (x - HX) / HS, dy = (y - HY) / HS, c = Math.cos(-HROT), s = Math.sin(-HROT); return [dx * c - dy * s, dx * s + dy * c]; });
  // the laptop's light: a hard-edged wedge fanning up-right from the screen; it only shows where it lands on him
  const LIGHT = [[880, 560], [990, 760], [1320, 640], [1250, 150], [1000, 180]];
  const LIGHT_COL = '#8FF2FF', LIGHT_A = .24;
  const lit = (path, pts = LIGHT) => { X.save(); X.clip(path); X.globalCompositeOperation = 'screen'; fill(pl(pts, true), LIGHT_COL, LIGHT_A); X.restore(); };
  function neck() {
    X.save(); headT();
    fs(rpoly([[12, 96], [74, 84], [82, 180], [16, 188]], 6), C.skinDk, LW / HS);
    X.restore();
  }
  function head(t) {
    X.save(); headT();
    const lw = LW / HS;
    // skull + face: a flat-topped box with a squared, angular jaw
    const face = rpoly([[-100, -100], [100, -104], [118, -20], [108, 56], [66, 112], [-30, 136], [-82, 122], [-100, 88], [-104, -60]], [10, 10, 24, 20, 10, 20, 16, 14, 10]);
    fill(face, C.skin);
    // the laptop's cool light, a flat hard-edged wedge (in the head's frame)
    lit(face, toHead(LIGHT));
    // ONE hard shadow: the back of the head and under the jaw, a clean angular cut away from the screen
    shadeIn(face, pl([[40, -130], [220, -130], [220, 230], [30, 230], [44, 118], [60, 36]], true), C.skinDk);
    fill(oval(-4, 66, 20, 13), C.blush, .6);
    ink(face, lw);
    // ear: a squared-off C
    const ear = rpoly([[42, -12], [76, -18], [88, 18], [74, 50], [46, 44]], 12); fs(ear, C.skinDk, lw); ink(pl([[60, 2], [72, 16], [62, 32]]), 4);
    // hair: a flat-topped block of big sharp spikes; fringe spikes over the brow, zig-zag nape, crooked cowlick at the crown
    const hairPts = [
      [-122, -122], [-60, -130], [20, -130],
      [48, -128], [40, -184], [108, -214], [74, -174], [94, -126],      // cowlick: one bold bent spike
      [112, -122], [164, -112], [138, -80], [176, -52], [140, -28], [168, 4], [134, 12], [144, 62], [114, 38], [100, 76], [88, 30],
      [86, -12], [62, -26], [48, -22], [42, 12], [32, -36],              // behind the ear, over it, sideburn
      [12, -74], [-4, -60], [-24, -90], [-52, -58], [-70, -94], [-112, -62], [-108, -98], [-162, -80]   // fringe spikes
    ];
    const hair = rpoly(hairPts, 2.5);
    fill(hair, C.hair);
    // one flat plane of lamp light on the back of the hair
    shadeIn(hair, pl([[56, -240], [200, -240], [200, 90], [120, 90], [96, -40]], true), C.hairHi);
    ink(hair, lw);
    // eyes: white ovals under heavy, sad lids; pupils sunk to the lower left (reading)
    const eye = (cx, cy, rx, ry, lid0, lid1, px, py, pr) => {
      const e = oval(cx, cy, rx, ry); fill(e, '#FFFFFF');
      X.save(); X.clip(e); fill(circ(px, py, pr), INK); fill(circ(px + pr * .3, py - pr * .35, pr * .32), '#FFFFFF'); fill(circ(px - pr * .38, py + pr * .42, pr * .15), '#FFFFFF');
      fill(pl([[cx - rx - 4, cy - ry - 6], [cx + rx + 4, cy - ry - 6], [cx + rx + 4, lid1], [cx - rx - 4, lid0]], true), C.skin); X.restore();
      ink(e, 4); ink(pl([[cx - rx - 3, lid0], [cx + rx + 3, lid1]]), 6.5);
    };
    eye(-18, 12, 19, 23, 0, 11, -27, 24, 10);     // near eye: lid droops to the outer (right) corner
    eye(-102, 12, 12, 19, 11, 1, -107, 24, 7.5);  // far eye: lid droops to the outer (left) corner
    // nose: one sharp triangle jutting past the face contour
    fs(pl([[-70, 8], [-152, 50], [-98, 56]], true), C.skin, lw);
    lit(pl([[-70, 8], [-152, 50], [-98, 56]], true), toHead(LIGHT));
    ink(pl([[-70, 8], [-152, 50], [-98, 56]], true), lw);
    // mouth: a small half-smile that doesn't reach the eyes
    ink(curve([[-98, 101], [-88, 101], [-76, 99], [-64, 89]]), 5.5);
    ink(pl([[-61, 82], [-57, 94]]), 3.5);
    // glasses: two round lenses, a bridge, a temple arm to the ear
    const L1 = circ(-18, 4, 40), L2 = circ(-104, 4, 30);
    fill(L1, '#BFF4FF', .14); fill(L2, '#BFF4FF', .14);
    X.save(); X.clip(L1); fill(pl([[4, -50], [20, -50], [-30, 50], [-46, 50]], true), '#FFFFFF', .22); X.restore();
    ink(L1, 6.5); ink(L2, 6.5); ink(pl([[-58, 0], [-74, 0]]), 6.5); ink(pl([[22, -2], [48, 6]]), 5.5);
    // brows: thick bars drawn over the hair, inner ends lifted (sad)
    fill(rpoly([[-54, -58], [-4, -44], [-5, -33], [-54, -46]], 4), INK);
    fill(rpoly([[-86, -58], [-124, -47], [-124, -36], [-86, -46]], 4), INK);
    X.restore();
  }
  function body(t) {
    // legs (dark pants): the far thigh peeks behind, the near thigh carries the laptop, a thin shin drops out of frame
    fs(rpoly([[1180, 740], [900, 746], [878, 796], [1180, 806]], 26), C.pantsDk, LW);
    const shin = rpoly([[866, 796], [938, 806], [924, 1090], [852, 1090]], 14); fill(shin, C.pants); shadeIn(shin, pl([[904, 790], [960, 790], [960, 1100], [888, 1100]], true), C.pantsDk); ink(shin);
    const thigh = rpoly([[1292, 752], [930, 764], [868, 796], [880, 858], [1298, 850]], [18, 40, 30, 30, 18]);
    fill(thigh, C.pants); shadeIn(thigh, pl([[860, 832], [1300, 826], [1300, 900], [860, 900]], true), C.pantsDk); ink(thigh);
    // far arm (his right): a thin tube sleeve behind the torso, down to the keys
    const fa = rpoly(taper([[1068, 528], [1016, 646], [978, 718]], 20, 18), 10); fill(fa, C.bomberDk); ink(fa);
    cuff([[982, 712], [968, 736]], 19);
    // torso: the oversized bomber as one boxy trapezoid, wide shoulders narrowing to the waistband
    const torso = rpoly([[1034, 540], [1086, 480], [1300, 480], [1398, 500], [1422, 556], [1374, 752], [1084, 758], [1038, 640]], [30, 24, 24, 40, 40, 20, 20, 30]);
    fill(torso, C.bomber);
    // one hard shadow: the back strip, cut on a clean line
    shadeIn(torso, pl([[1322, 440], [1460, 440], [1460, 800], [1300, 800], [1318, 600]], true), C.bomberDk);
    lit(torso);
    ink(torso);
    // zipper / front edge
    ink(pl([[1142, 522], [1114, 748]]), 4.5);
    // dark shirt in the collar opening
    fs(pl([[1116, 492], [1182, 496], [1144, 540]], true), C.shirt, 5);
    // ribbed waistband (orange, vertical ribs)
    ribbed(rpoly([[1076, 726], [1380, 720], [1372, 774], [1084, 780]], 12), 1070, 1390, 712, 790, 16, -3, pl([[1306, 700], [1400, 700], [1400, 800], [1296, 800]], true));
    // pin: the little yellow smiley on the chest
    fs(circ(1232, 582, 17), C.mask, 5); ink(pl([[1227, 574], [1227, 580]]), 3); ink(pl([[1238, 573], [1238, 579]]), 3); ink(curve([[1224, 587], [1231, 593], [1241, 585]]), 3);
  }
  // an orange ribbed band: flat fill, straight rib lines, optional hard shade, outline
  function ribbed(path, x0, x1, y0, y1, gap, lean, sh) {
    fill(path, C.rib); X.save(); X.clip(path); X.strokeStyle = C.ribDk; X.lineWidth = 4; X.beginPath();
    for (let x = x0; x < x1; x += gap) { X.moveTo(x, y0); X.lineTo(x + lean, y1); } X.stroke();
    if (sh) fill(sh, C.ribDk, .55);
    X.restore(); ink(path);
  }
  function cuff(sp, w) {
    const p = rpoly(taper(sp, w, w), 6), [a, b] = sp, dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    fill(p, C.rib); X.save(); X.clip(p); X.strokeStyle = C.ribDk; X.lineWidth = 3.5; X.beginPath();
    for (let k = -3; k <= 3; k++) { const cx = (a[0] + b[0]) / 2 + dx / d * k * 8, cy = (a[1] + b[1]) / 2 + dy / d * k * 8; X.moveTo(cx - dy / d * 40, cy + dx / d * 40); X.lineTo(cx + dy / d * 40, cy - dx / d * 40); }
    X.stroke(); X.restore(); ink(p);
  }
  function collar() {
    ribbed(rpoly([[1094, 476], [1128, 450], [1222, 448], [1302, 466], [1306, 496], [1252, 494], [1184, 492], [1124, 506]], 14), 1092, 1320, 440, 512, 14, 4);
  }
  function nearArm() {
    // near arm (his left): a thin tube sleeve down the side, forearm forward across the lap to the keyboard
    const a = rpoly(taper([[1388, 548], [1320, 698], [1146, 768]], 22, 20), 12);
    fill(a, C.bomber); shadeIn(a, pl([[1290, 700], [1430, 500], [1450, 800], [1150, 820]], true), C.bomberDk); ink(a);
    cuff([[1152, 766], [1124, 776]], 21);
    hand(1090, 780, -.22, 1);
  }
  function hand(x, y, rot, s) {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
    const h = rpoly([[18, -14], [-20, -12], [-30, 4], [-22, 14], [16, 14]], 8); fs(h, C.skin, 6);
    ink(pl([[-10, 4], [-8, 14]]), 3); ink(pl([[2, 4], [3, 14]]), 3);
    X.restore();
  }
  // laptop: a cheated 3/4 so the screen faces him and still reads to camera
  const LID = { hn: [846, 786], hf: [958, 722], tf: [906, 516], tn: [786, 580] }, FRONT = [[1036, 808], [1150, 744]];
  function screenHalo() {
    // the screen's glow on the couch behind it: flat, hard-edged rings (echoing the moon's halo)
    const { hn, hf, tf, tn } = LID, lc = [(hn[0] + hf[0] + tf[0] + tn[0]) / 4, (hn[1] + hf[1] + tf[1] + tn[1]) / 4];
    const grow = k => pl([hn, hf, tf, tn].map(p => [lc[0] + (p[0] - lc[0]) * k, lc[1] + (p[1] - lc[1]) * k]), true);
    X.save(); X.beginPath(); X.rect(0, 612, W, H); X.clip(); X.globalCompositeOperation = 'screen'; fill(grow(1.6), C.screenGlow, .07); fill(grow(1.3), C.screenGlow, .09); X.restore();
  }
  function laptop(t) {
    const { hn, hf, tf, tn } = LID, [fn, ff] = FRONT;
    const baseTop = [hn, hf, ff, fn];
    fs(pl([hn, fn, [fn[0] + 2, fn[1] + 16], [hn[0] - 4, hn[1] + 14]], true), C.laptopDk, 5);
    fs(pl(baseTop, true), C.laptop, 5);
    // keys: a flat checker block
    X.save(); X.clip(pl(baseTop, true)); X.fillStyle = C.laptopDk;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { if ((i + j) % 2) continue; const u = .12 + i * .085, v = .22 + j * .2; X.fillRect(hn[0] + (hf[0] - hn[0]) * v + (fn[0] - hn[0]) * u, hn[1] + (hf[1] - hn[1]) * v + (fn[1] - hn[1]) * u - 4, 12, 8); }
    X.restore();
    // lid + screen
    const lid = pl([hn, hf, tf, tn], true);
    fill(lid, C.laptop);
    const cx = (hn[0] + hf[0] + tf[0] + tn[0]) / 4, cy = (hn[1] + hf[1] + tf[1] + tn[1]) / 4, ins = p => [p[0] + (cx - p[0]) * .15, p[1] + (cy - p[1]) * .15];
    const [shn, shf, stf, stn] = [hn, hf, tf, tn].map(ins);
    const scr = pl([shn, shf, stf, stn], true);
    fill(scr, C.screen);
    // screen content in the lid's own (skewed) frame: u across, v down
    X.save(); X.clip(scr);
    X.transform((stf[0] - stn[0]) / 100, (stf[1] - stn[1]) / 100, (shn[0] - stn[0]) / 100, (shn[1] - stn[1]) / 100, stn[0], stn[1]);
    X.fillStyle = '#86DDEE'; X.fillRect(0, 0, 100, 10);
    X.fillStyle = '#74C9DC'; [[8, 18, 60], [8, 27, 74], [8, 36, 50], [30, 50, 62], [30, 59, 48]].forEach(([x, y, w]) => X.fillRect(x, y, w, 4.5));
    X.fillStyle = C.mask; X.beginPath(); X.arc(16, 55, 6, 0, TAU); X.fill();
    X.fillStyle = '#FFFFFF'; X.fillRect(6, 72, 88, 20);
    X.fillStyle = C.ctx; X.font = 'bold 8px Rajdhani'; X.textBaseline = 'middle'; X.fillText('context 97%', 10, 78);
    X.fillStyle = '#FFD0DC'; X.fillRect(10, 84, 80, 5); X.fillStyle = C.ctx; X.fillRect(10, 84, 77.6, 5);
    X.restore();
    ink(scr, 3.5); ink(lid, 6);
    hand(972, 750, -.4, .95);
  }

  // ---------- the Assistant: a little yellow figure of stacked primitives, cuddled against his head ----------
  function assistant(t) {
    const x = 1346, y = 492, lean = -.5 + Math.sin(t * TAU / 5) * .012;
    // dangling stick legs with round feet, over the front of his shoulder (they hang straight: not leaned)
    const leg = (x0, a) => { fs(rpoly(taper([[x + x0, y - 4], [x + x0 - 8, y + 24], [x + x0 - 4 + a, y + 48]], 6, 6), 5), C.mask, 5); fs(oval(x + x0 - 6 + a, y + 53, 10, 6.5, -.2), C.mask, 5); };
    leg(-6, -8); leg(12, 0);
    X.save(); X.translate(x, y); X.rotate(lean);
    // body: a small trapezoid, wider at the bottom
    const bd = rpoly([[-24, 6], [24, 6], [14, -46], [-12, -46]], 8);
    fill(bd, C.mask); shadeIn(bd, pl([[6, -60], [40, -60], [40, 10], [12, 10]], true), C.maskDk); ink(bd, 6);
    // near arm folded in its lap
    fs(rpoly(taper([[14, -36], [28, -14], [8, -2]], 5.5, 5.5), 5), C.mask, 5);
    X.restore();
    // far arm reaching along his collar, a tiny round hand resting there
    fs(rpoly(taper([[x - 14, y - 30], [x - 46, y - 26], [x - 70, y - 18]], 5.5, 5.5), 5), C.mask, 5); fs(circ(x - 72, y - 17, 8), C.mask, 5);
    // head: the mask, tipped over to rest against his jaw
    const hx = x + Math.sin(-lean) * -88, hy = y - Math.cos(lean) * 88;
    geoMask(hx, hy, 44, lean - .08, { eyes: 'dash', lw: 6 });
  }

  function scene(t) {
    wall(t);
    windowFrame(t);
    floorLamp(t);
    couchBack();
    pillow();
    couchSeat();
    X.save(); X.globalCompositeOperation = 'screen'; fill(pl([[1600, 600], [1920, 600], [1920, 1100], [1440, 1100]], true), '#FFB84A', .12); X.restore();
    screenHalo();
    shoggoth(t);
    body(t);
    neck();
    collar();
    head(t);
    laptop(t);
    nearArm();
    assistant(t);
  }

  chapter('geometric', K, K + 1, [[K, (t, lt) => {
    style(1); FX.noAuto = true; FX.bloom = .12; FX.scan = 0; FX.grain = 0;
    X.save(); camBegin(1000, 506, 1.085); scene(t); camEnd(); X.restore();
    X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  }]]);
})();
