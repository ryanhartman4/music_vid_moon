// flatcartoon.js: style study K = 0, "adult-swim flat cartoon" (the prime-time adult animation look).
// Design language: oversized heads on noodly limbs, big white bulgy eyes with tiny dot pupils set close together
// (slightly misaligned), thin uniform slightly wobbly black outlines, flat fills with ONE flat shadow tone,
// droopy expressive mouths, simple flat backgrounds with thin darker outlines.
// Every shape is authored as an SVG path string in local coordinates, sampled to points, given a small
// deterministic line wobble, then filled flat + stroked. Pure function of t.
(() => {
  const INK = '#15111C', LW = 3.3, BLW = 2.2;

  // ---------- path sampling + wobble ----------
  let _el = null; const _cache = new Map();
  function pel() {
    if (!_el) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.style.cssText = 'position:absolute;width:0;height:0';
      document.body.appendChild(svg); _el = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.appendChild(_el);
    }
    return _el;
  }
  function samp(d, step = 2.5) {
    let r = _cache.get(d); if (r) return r;
    r = [];
    for (const sub of d.trim().split(/(?=M)/).map(s => s.trim()).filter(Boolean)) {
      const el = pel(); el.setAttribute('d', sub);
      const L = el.getTotalLength(), closed = /z\s*$/i.test(sub), n = Math.max(3, Math.ceil(L / step)), pts = [];
      for (let i = 0; i < (closed ? n : n + 1); i++) { const p = el.getPointAtLength(Math.min(L, L * i / n)); pts.push([p.x, p.y]); }
      r.push({ pts, closed });
    }
    _cache.set(d, r); return r;
  }
  const hs = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h % 1000) / 37; };
  function wobPts(pts, closed, amp, seed) {
    const n = pts.length, out = new Array(n); let s = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const w = amp * (.6 * Math.sin(s * .045 + seed) + .4 * Math.sin(s * .13 + seed * 2.1));
      out[i] = [pts[i][0] - dy / l * w, pts[i][1] + dx / l * w];
    }
    return out;
  }
  function trace(d, amp, begin = true) {
    const subs = samp(d), seed = hs(d);
    if (begin) X.beginPath();
    for (const { pts, closed } of subs) {
      const q = amp ? wobPts(pts, closed, amp, seed) : pts;
      X.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) X.lineTo(q[i][0], q[i][1]); if (closed) X.closePath();
    }
  }
  // S: flat filled shape with outline. o.sh = shadow path (clipped inside, no line), o.sc = shadow colour,
  // o.shift = [dx, dy] (shadow = shape minus a copy shifted toward the light), o.ink (null = none), o.lw, o.amp, o.alpha
  function S(d, fill, o = {}) {
    const amp = o.amp ?? .9, A = o.alpha ?? 1;
    X.globalAlpha = A;
    if (fill) { trace(d, amp); X.fillStyle = fill; X.fill(); }
    if (o.sh || o.shift) {
      X.save(); trace(d, amp); X.clip(); X.fillStyle = o.sc;
      if (o.sh) { trace(o.sh, 0); X.fill(); }
      if (o.shift) { X.translate(o.shift[0], o.shift[1]); X.beginPath(); X.rect(-6000, -6000, 12000, 12000); trace(d, amp, false); X.fill('evenodd'); }
      X.restore(); X.globalAlpha = A;
    }
    if (o.ink !== null) { trace(d, amp); X.lineJoin = 'round'; X.lineCap = 'round'; X.lineWidth = o.lw || LW; X.strokeStyle = o.ink || INK; X.stroke(); }
    X.globalAlpha = 1;
  }
  // Ln: open stroke
  function Ln(d, o = {}) {
    trace(d, o.amp ?? .7); X.lineJoin = 'round'; X.lineCap = 'round'; X.lineWidth = o.lw || LW; X.strokeStyle = o.col || INK;
    X.globalAlpha = o.alpha ?? 1; X.stroke(); X.globalAlpha = 1;
  }
  const at = (x, y, r, fn) => { X.save(); X.translate(x, y); if (r) X.rotate(r); fn(); X.restore(); };
  const circ = (x, y, r) => `M ${x + r} ${y} A ${r} ${r} 0 1 1 ${x - r} ${y} A ${r} ${r} 0 1 1 ${x + r} ${y} Z`;
  const ell = (x, y, rx, ry) => `M ${x + rx} ${y} A ${rx} ${ry} 0 1 1 ${x - rx} ${y} A ${rx} ${ry} 0 1 1 ${x + rx} ${y} Z`;
  const rect = (x, y, w, h) => `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  const rrect = (x, y, w, h, r) => `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
  const poly = (pts, close = true) => 'M ' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ') + (close ? ' Z' : '');

  // ---------- palette (night + lamp, flat) ----------
  const C = {
    wall: '#2A2F5C', wallLit: '#474574', wallLine: '#1B1D40',
    sky1: '#1B2150', sky2: '#232B63', sky3: '#2F3874', skyHalo: '#3A4686', moon: '#F4F0C6', moonDk: '#D9D2A0',
    bldA: '#252B5E', bldB: '#1A1F48', bldLine: '#12153A', winLit: '#F4C96A', winDim: '#8C7A62',
    frame: '#8A86B6', frameDk: '#62609A', curtain: '#3D6474', curtainDk: '#2C4B5A',
    couch: '#713A4E', couchDk: '#512839', couchLine: '#1E1220',
    lampShade: '#F8DC92', lampShadeDk: '#E1B96A', metal: '#3A3552',
    skin: '#F1D5C6', skinDk: '#BE93A3', hair: '#2B2336', hairDk: '#1A1522',
    jacket: '#5C4DB1', jacketDk: '#3E3382', rib: '#F18B3B', ribDk: '#C0652C', shirt: '#25213A', pants: '#2A2842', pantsDk: '#1D1B30',
    eye: '#FCFCFF', lens: '#CDEBFF',
    lapBody: '#9EA3BE', lapDk: '#6D7196', screen: '#C8E6FF', screenDk: '#9CC4EE', bar: '#FF4870',
    mask: '#F5FA83', maskDk: '#C9CF55', shog: '#99B087', shogDk: '#6F8A5F', shogLine: '#1C2419'
  };

  // =====================================================================================
  // BACKGROUND
  // =====================================================================================
  function background(t) {
    // wall
    X.fillStyle = C.wall; X.fillRect(0, 0, W, H);
    // lamp light on the wall: two flat cones (up + down) from the shade
    S(poly([[1622, 178], [1778, 178], [1905, -20], [1500, -20]]), C.wallLit, { ink: null, amp: 0 });
    S(poly([[1590, 300], [1812, 300], [1960, 700], [1440, 700]]), C.wallLit, { ink: null, amp: 0 });
    // plaster crack + a scuff (the sloppy apartment details the genre loves)
    Ln('M 1390 470 L 1402 452 L 1398 436 L 1412 418', { lw: 1.6, col: C.wallLine });
    S(rrect(1440, 452, 30, 46, 4), '#8C88B0', { lw: BLW, ink: C.wallLine });
    S(rect(1451, 466, 8, 16), '#5E5A86', { lw: 1.6, ink: C.wallLine });
    // framed picture: a ringed planet
    S(rect(1318, 138, 176, 188), '#6A5646', { lw: BLW, ink: C.wallLine });
    S(rect(1334, 154, 144, 156), '#1D2350', { lw: BLW, ink: C.wallLine });
    S(circ(1406, 232, 34), '#E9955A', { lw: BLW, sh: 'M 1380 190 C 1420 210 1430 250 1400 280 L 1460 280 L 1460 190 Z', sc: '#C06F43' });
    Ln('M 1356 250 C 1380 218 1450 210 1458 222 C 1466 236 1420 258 1356 250 Z', { lw: BLW });
    for (const [sx, sy] of [[1350, 172], [1462, 180], [1450, 292], [1362, 290], [1470, 256]]) { X.fillStyle = '#F4F0C6'; X.fillRect(sx, sy, 3, 3); }

    window_(t);

    // floor lamp (pole + shade)
    S(rect(1693, 296, 12, 330), C.metal, { lw: BLW, ink: C.wallLine });
    S('M 1622 176 L 1778 176 L 1814 302 L 1586 302 Z', C.lampShade, { lw: BLW, ink: C.wallLine, sh: 'M 1740 150 L 1830 150 L 1830 320 L 1768 320 Z', sc: C.lampShadeDk });
    Ln('M 1600 262 L 1800 262', { lw: 1.4, col: C.lampShadeDk });
  }

  function window_(t) {
    const x0 = 160, y0 = 70, x1 = 812, y1 = 612;       // outer frame
    const gx0 = x0 + 20, gy0 = y0 + 20, gx1 = x1 - 20, gy1 = y1 - 10;
    // glass contents (clipped)
    X.save(); X.beginPath(); X.rect(gx0, gy0, gx1 - gx0, gy1 - gy0); X.clip();
    X.fillStyle = C.sky1; X.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
    X.fillStyle = C.sky2; X.fillRect(gx0, 300, gx1 - gx0, 400);
    X.fillStyle = C.sky3; X.fillRect(gx0, 400, gx1 - gx0, 400);
    // moon + a flat halo ring
    S(circ(340, 196, 96), C.skyHalo, { ink: null, amp: 0, alpha: .55 });
    S(circ(340, 196, 58), C.moon, { lw: BLW, ink: C.wallLine, sh: 'M 360 120 C 410 150 412 240 360 270 L 420 270 L 420 120 Z', sc: C.moonDk });
    for (const [cx, cy, r] of [[318, 176, 12], [356, 214, 9], [326, 226, 6], [362, 168, 5]]) S(circ(cx, cy, r), C.moonDk, { lw: 1.4, ink: '#B9B084' });
    // back buildings
    const back = [[176, 318, 90], [262, 360, 70], [330, 300, 88], [416, 352, 64], [478, 286, 96], [572, 340, 74], [644, 300, 90], [732, 350, 90]];
    for (const [bx, by, bw] of back) {
      S(rect(bx, by, bw, 400), C.bldA, { lw: 1.6, ink: C.bldLine, amp: .4 });
      for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) {
        const wx = bx + 12 + c * (bw - 20) / 4, wy = by + 16 + r * 26, k = hash2(bx + c, r);
        if (k < .32) { X.fillStyle = k < .2 ? C.winLit : C.winDim; X.fillRect(wx, wy, 9, 12); }
      }
    }
    // antenna + water tower silhouettes
    Ln('M 520 286 L 520 250 M 510 262 L 530 262', { lw: 2, col: C.bldA });
    S('M 664 300 L 664 280 L 700 280 L 700 300 Z M 668 280 L 672 262 L 692 262 L 696 280 Z', C.bldA, { lw: 1.6, ink: C.bldLine });
    // front buildings
    const front = [[170, 450, 120], [300, 420, 110], [420, 470, 120], [556, 430, 104], [668, 456, 150]];
    for (const [bx, by, bw] of front) {
      S(rect(bx, by, bw, 300), C.bldB, { lw: 1.6, ink: C.bldLine, amp: .4 });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) {
        const wx = bx + 12 + c * (bw - 18) / 5, wy = by + 18 + r * 28, k = hash2(bx * 3 + c, r + 9);
        if (k < .28) { X.fillStyle = k < .18 ? C.winLit : C.winDim; X.fillRect(wx, wy, 11, 13); }
      }
    }
    // rain outside: thin slanted streaks (gently falling)
    X.strokeStyle = '#9DB0E6'; X.lineWidth = 1.6; X.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      const sp = 900 + hash(i * 3.1) * 400, len = 26 + hash(i * 5.7) * 30;
      const x = gx0 + hash(i * 1.37) * (gx1 - gx0 + 120), y = gy0 - 60 + frac(hash(i * 2.3) + t * sp / 700) * (gy1 - gy0 + 120);
      X.globalAlpha = .35 + hash(i * 7.3) * .3; X.beginPath(); X.moveTo(x, y); X.lineTo(x - len * .22, y + len); X.stroke();
    }
    X.globalAlpha = 1;
    // glass shine: two flat diagonal stripes
    X.fillStyle = '#FFFFFF'; X.globalAlpha = .06;
    X.beginPath(); X.moveTo(560, gy0); X.lineTo(640, gy0); X.lineTo(360, gy1); X.lineTo(280, gy1); X.fill();
    X.beginPath(); X.moveTo(668, gy0); X.lineTo(690, gy0); X.lineTo(410, gy1); X.lineTo(388, gy1); X.fill();
    X.globalAlpha = 1;
    // droplets running down the glass: little outlined drops with thin trails
    for (let i = 0; i < 16; i++) {
      const dx = gx0 + 20 + hash(i * 9.1) * (gx1 - gx0 - 40), dy = gy0 + 30 + frac(hash(i * 4.4) + t * (.02 + hash(i) * .03)) * (gy1 - gy0 - 60), r = 4 + hash(i * 2.2) * 4;
      Ln(`M ${dx} ${dy - 10 - r * 6} L ${dx} ${dy - r}`, { lw: 1.4, col: '#6F80C2', alpha: .7, amp: .3 });
      S(`M ${dx} ${dy - r * 1.9} C ${dx + r * .4} ${dy - r} ${dx + r} ${dy - r * .4} ${dx + r} ${dy + r * .2} C ${dx + r} ${dy + r} ${dx - r} ${dy + r} ${dx - r} ${dy + r * .2} C ${dx - r} ${dy - r * .4} ${dx - r * .4} ${dy - r} ${dx} ${dy - r * 1.9} Z`,
        '#5B6BB0', { lw: 1.3, ink: '#14183E', amp: .2 });
      X.fillStyle = '#DDE6FF'; X.fillRect(dx - r * .45, dy - r * .3, 2, 2);
    }
    X.restore();
    // frame: outer, mullions, sill
    const fr = `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z M ${gx0} ${gy0} L ${gx0} ${gy1} L ${gx1} ${gy1} L ${gx1} ${gy0} Z`;
    trace(fr, .6); X.fillStyle = C.frame; X.fill('evenodd'); X.lineWidth = BLW; X.strokeStyle = C.wallLine; X.stroke();
    S(rect(478, gy0, 16, gy1 - gy0), C.frame, { lw: BLW, ink: C.wallLine, amp: .5 });
    S(rect(gx0, 330, gx1 - gx0, 14), C.frame, { lw: BLW, ink: C.wallLine, amp: .5 });
    S(rect(x0 - 18, y1 - 6, x1 - x0 + 36, 20), C.frameDk, { lw: BLW, ink: C.wallLine, amp: .5 });
    // curtain rod + curtains
    S(rect(96, 44, 790, 10), C.metal, { lw: BLW, ink: C.wallLine });
    S(circ(96, 49, 9), C.metal, { lw: BLW, ink: C.wallLine }); S(circ(886, 49, 9), C.metal, { lw: BLW, ink: C.wallLine });
    S('M 110 52 L 238 52 C 232 200 226 360 244 530 C 250 580 262 612 252 640 L 104 640 C 110 500 96 280 110 52 Z', C.curtain,
      { lw: BLW, ink: C.wallLine, sh: 'M 190 40 C 186 200 196 400 210 660 L 300 660 L 300 40 Z', sc: C.curtainDk });
    Ln('M 150 60 C 146 240 150 420 144 630 M 190 60 C 190 250 184 450 196 630', { lw: 1.6, col: C.wallLine, alpha: .8 });
    S('M 752 52 L 850 52 C 846 250 860 440 866 640 L 784 640 C 772 560 748 520 752 420 C 756 300 744 180 752 52 Z', C.curtain,
      { lw: BLW, ink: C.wallLine, sh: 'M 812 40 C 812 250 826 440 834 660 L 900 660 L 900 40 Z', sc: C.curtainDk });
    Ln('M 800 60 C 796 250 808 450 818 630', { lw: 1.6, col: C.wallLine, alpha: .8 });
  }

  // =====================================================================================
  // COUCH
  // =====================================================================================
  function couchBack() {
    // back cushions
    S('M 70 640 C 70 596 96 578 140 578 L 1010 586 C 1040 586 1052 610 1050 650 L 1040 880 L 70 880 Z', C.couch, { lw: LW, ink: C.couchLine, sh: 'M 70 800 L 1100 810 L 1100 900 L 60 900 Z', sc: C.couchDk });
    S('M 1030 650 C 1030 600 1052 586 1092 586 L 1790 592 C 1826 592 1846 612 1846 650 L 1846 880 L 1030 880 Z', C.couch, { lw: LW, ink: C.couchLine, sh: 'M 1030 800 L 1850 810 L 1850 900 L 1030 900 Z', sc: C.couchDk });
    Ln('M 300 610 Q 320 640 310 680 M 1500 612 Q 1480 640 1492 690', { lw: 1.8, col: C.couchLine });
  }
  function couchFront() {
    // seat cushion (only the top strip + front shows under him)
    S('M 60 846 C 300 836 1500 836 1860 846 L 1860 1100 L 60 1100 Z', C.couch, { lw: LW, ink: C.couchLine, sh: 'M 40 930 C 600 924 1200 924 1900 930 L 1900 1100 L 40 1100 Z', sc: C.couchDk });
    Ln('M 70 930 C 600 924 1200 924 1850 930', { lw: 2.2, col: C.couchLine });
    // rolled arms
    S('M 20 740 C 18 692 60 672 120 672 C 190 672 232 700 232 748 L 226 1100 L 30 1100 Z', C.couch, { lw: LW, ink: C.couchLine, sh: 'M 150 660 C 200 720 190 900 196 1100 L 260 1100 L 260 660 Z', sc: C.couchDk });
    Ln('M 60 720 C 70 700 110 694 140 704', { lw: 1.8, col: C.couchLine });
    S('M 1700 748 C 1700 700 1742 672 1802 672 C 1862 672 1904 692 1902 740 L 1896 1100 L 1706 1100 Z', C.couch, { lw: LW, ink: C.couchLine, sh: 'M 1830 660 C 1870 720 1860 900 1866 1100 L 1920 1100 L 1920 660 Z', sc: C.couchDk });
    Ln('M 1740 716 C 1760 698 1800 694 1830 704', { lw: 1.8, col: C.couchLine });
    // a crushed soda can on the arm (sloppy apartment)
    S('M 1760 612 L 1800 612 L 1804 674 L 1756 674 Z', '#D24A4A', { lw: BLW, sh: 'M 1788 600 L 1810 600 L 1810 680 L 1788 680 Z', sc: '#A33336' });
    S(ell(1780, 612, 20, 5), '#B8B8C8', { lw: BLW });
    Ln('M 1766 636 L 1776 646 L 1766 656', { lw: 1.6 });
  }

  function extras() {
    // throw pillow leaning on the back cushion + a crumpled snack bag
    S('M 1484 710 Q 1580 734 1674 700 Q 1660 780 1686 854 Q 1590 838 1492 862 Q 1506 786 1484 710 Z', '#C79B47',
      { lw: LW, ink: C.couchLine, sh: 'M 1636 690 C 1654 750 1656 820 1646 880 L 1720 880 L 1720 690 Z', sc: '#95722F' });
    Ln('M 1520 750 Q 1540 770 1534 800 M 1596 812 Q 1616 802 1636 810', { lw: 1.8, col: C.couchLine });
    // TV remote lying on the seat
    S('M 1370 850 L 1452 834 C 1462 832 1466 842 1458 846 L 1378 864 C 1366 866 1360 854 1370 850 Z', '#2C2A3C', { lw: 2.6, ink: C.couchLine });
    for (const [bx, by, bc] of [[1392, 850, '#D24A4A'], [1410, 846, '#8D8AA8'], [1426, 842, '#8D8AA8'], [1442, 839, '#8D8AA8']]) { X.fillStyle = bc; X.beginPath(); X.arc(bx, by, 3, 0, TAU); X.fill(); }
  }

  // =====================================================================================
  // THE SHOGGOTH (curled up asleep at the couch end, mask resting on its little arm)
  // =====================================================================================
  function shoggoth(t) {
    const br = Math.sin(t * TAU / 4.2) * 3;    // slow sleepy breathing
    at(430, 772, 0, () => {
      const L = C.shogLine, sw = 3.1;
      // limb draped over the couch arm (crooked horn, pointed tip)
      S('M -150 -10 C -200 -60 -250 -95 -300 -78 C -330 -68 -338 -40 -326 -8 C -318 14 -300 30 -290 52 C -306 30 -334 8 -350 -22 C -366 -66 -326 -112 -268 -114 C -212 -116 -170 -70 -132 -38 Z',
        C.shog, { lw: sw, ink: L, shift: [-6, -8], sc: C.shogDk });
      // crooked horn up-left
      S('M -70 -40 C -92 -90 -104 -118 -96 -150 C -92 -164 -104 -176 -120 -196 C -86 -184 -72 -164 -76 -140 C -78 -112 -52 -86 -30 -50 Z',
        C.shog, { lw: sw, ink: L, shift: [-5, -6], sc: C.shogDk });
      // the spiral limb, curling over the top
      S('M 40 -60 C 50 -120 90 -170 146 -168 C 196 -166 222 -120 204 -84 C 188 -52 146 -54 138 -82 C 132 -104 152 -120 168 -110 C 176 -104 172 -92 164 -92 C 172 -80 196 -92 190 -112 C 182 -140 140 -148 120 -120 C 96 -88 116 -40 160 -36 C 120 -24 84 -40 76 -44 Z',
        C.shog, { lw: sw, ink: L, shift: [-6, -8], sc: C.shogDk });
      // pointed little legs tucked under
      for (const [lx, a] of [[-104, -.5], [-44, -.15], [30, .15], [96, .45]]) at(lx, 60, a, () => S('M -16 -6 L 16 -6 L 3 30 Z', C.shog, { lw: sw, ink: L, sh: 'M 2 -10 L 30 -10 L 30 40 L 2 40 Z', sc: C.shogDk }));
      // body: lumpy cloud scallops, gently breathing
      X.save(); X.translate(0, 70); X.scale(1 + br * .004, 1 + br * .01); X.translate(0, -70);
      S('M -140 58 C -172 50 -172 4 -140 -6 C -146 -48 -104 -70 -72 -52 C -62 -94 -6 -98 10 -66 C 30 -98 88 -88 88 -52 C 120 -66 154 -36 138 0 C 170 16 162 64 124 68 C 60 84 -60 84 -140 58 Z',
        C.shog, { lw: sw, ink: L, sh: 'M -180 30 C -80 58 60 52 180 20 L 180 120 L -180 120 Z', sc: C.shogDk });
      // bump details
      Ln('M -110 -22 Q -98 -30 -86 -24 M 60 -40 Q 70 -46 80 -40', { lw: 2.4, col: L });
      // eyes: the big central one shut, the rest shut or barely open
      const closed = (x, y, r, tilt, lash) => at(x, y, tilt, () => {
        S(`M ${-r} ${r * .1} C ${-r * .7} ${-r * .8} ${r * .7} ${-r * .8} ${r} ${r * .1} C ${r * .5} ${r * .42} ${-r * .5} ${r * .42} ${-r} ${r * .1} Z`, '#B9CCA8', { lw: sw * .9, ink: L });
        Ln(`M ${-r * .7} ${-r * .38} C ${-r * .3} ${-r * .62} ${r * .3} ${-r * .62} ${r * .7} ${-r * .38}`, { lw: sw * .7, col: L, alpha: .8 });
        if (lash) for (const k of [-.5, -.17, .17, .5]) Ln(`M ${k * r} ${r * .32} L ${k * r * 1.2} ${r * .56}`, { lw: sw * .8, col: L });
      });
      const sliver = (x, y, r, tilt) => at(x, y, tilt, () => {
        S(`M ${-r} 0 C ${-r * .6} ${-r * .7} ${r * .6} ${-r * .7} ${r} 0 C ${r * .6} ${r * .55} ${-r * .6} ${r * .55} ${-r} 0 Z`, C.eye, { lw: sw * .9, ink: L });
        X.save(); trace(`M ${-r} 0 C ${-r * .6} ${-r * .7} ${r * .6} ${-r * .7} ${r} 0 C ${r * .6} ${r * .55} ${-r * .6} ${r * .55} ${-r} 0 Z`, 0); X.clip();
        X.fillStyle = INK; X.beginPath(); X.arc(r * .1, r * .3, r * .16, 0, TAU); X.fill();
        X.fillStyle = C.shogDk; trace(`M ${-r - 4} ${-r} L ${r + 4} ${-r} L ${r + 4} ${r * .12} C ${r * .3} ${r * .26} ${-r * .3} ${r * .26} ${-r - 4} ${r * .12} Z`, 0); X.fill();
        X.restore();
        Ln(`M ${-r * .98} ${r * .1} C ${-r * .3} ${r * .28} ${r * .3} ${r * .28} ${r * .98} ${r * .1}`, { lw: sw * .9, col: L });
      });
      closed(-8, 10, 40, .04, true);
      sliver(62, -26, 20, -.2);
      closed(-86, -14, 17, -.3, false);
      closed(104, 28, 14, .3, false);
      sliver(-112, 34, 12, .2);
      closed(40, 46, 10, .1, false);
      closed(-40, -52, 9, -.2, false);
      X.restore();
      // the little arm, curled up under the mask like a pillow
      S('M 112 44 C 150 76 220 86 254 72 C 274 62 280 38 266 28 C 256 22 246 32 252 42 C 236 56 172 58 126 30 Z', C.shog, { lw: sw, ink: L, shift: [-4, -6], sc: C.shogDk });
      // the mask, lying back on that arm
      at(206, 22, .36 + br * .004, () => maskFace(50, { sw: 3 }));
      // tiny curled hand holding the mask's edge
      S('M 252 26 C 262 14 278 20 276 34 C 274 44 262 46 256 40 Z', C.shog, { lw: sw, ink: L });
    });
  }

  // the smiley mask: pale-yellow slightly lopsided oval, short vertical dash eyes, lopsided smile higher on the right
  function maskFace(r, o = {}) {
    const sw = o.sw || LW;
    const d = `M ${-r * .62} ${-r * .72} C ${-r * .2} ${-r * 1.08} ${r * .56} ${-r * 1.02} ${r * .8} ${-r * .5} C ${r * 1.02} ${-r * .02} ${r * .84} ${r * .78} ${r * .3} ${r * .96} C ${-r * .18} ${r * 1.1} ${-r * .8} ${r * .8} ${-r * .9} ${r * .2} C ${-r * .98} ${-r * .24} ${-r * .86} ${-r * .5} ${-r * .62} ${-r * .72} Z`;
    S(d, C.mask, { lw: sw, sh: `M ${r * .4} ${-r * 1.2} C ${r * .9} ${-r * .6} ${r * .9} ${r * .6} ${r * .1} ${r * 1.2} L ${r * 1.4} ${r * 1.4} L ${r * 1.4} ${-r * 1.4} Z`, sc: C.maskDk });
    Ln(`M ${-r * .34} ${-r * .38} L ${-r * .32} ${-r * .12} M ${r * .3} ${-r * .42} L ${r * .32} ${-r * .16}`, { lw: sw * 1.25, amp: .2 });
    Ln(`M ${-r * .5} ${r * .22} C ${-r * .3} ${r * .56} ${r * .12} ${r * .6} ${r * .44} ${r * .08}`, { lw: sw * 1.1, amp: .3 });
  }

  // =====================================================================================
  // HIM
  // =====================================================================================
  const HX = 1078, HY = 402, HR = .04;   // head centre + tilt (leaning a touch toward the Assistant)

  // Catmull-Rom → smooth closed/open SVG path through points (for noodle limbs)
  function sm(p, closed = true) {
    const n = p.length, g = i => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
      d += ` C ${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
    }
    return d + (closed ? ' Z' : '');
  }
  // a noodle limb: spine points + half width → smooth outlined tube with round ends
  function noodle(sp, w, w1 = w) {
    const n = sp.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ww = lerp(w, w1, i / (n - 1));
      const nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
      L.push([sp[i][0] + nx * ww, sp[i][1] + ny * ww]); R.push([sp[i][0] - nx * ww, sp[i][1] - ny * ww]);
    }
    const e = sp[n - 1], p = sp[n - 2], el = Math.hypot(e[0] - p[0], e[1] - p[1]) || 1, s = sp[0], q = sp[1], sl = Math.hypot(s[0] - q[0], s[1] - q[1]) || 1;
    const tip = [e[0] + (e[0] - p[0]) / el * w1 * .9, e[1] + (e[1] - p[1]) / el * w1 * .9], tail = [s[0] + (s[0] - q[0]) / sl * w * .9, s[1] + (s[1] - q[1]) / sl * w * .9];
    return sm([...L, tip, ...R.reverse(), tail]);
  }

  function legs() {
    // far leg (behind), then near leg: thighs come toward camera-left, shins drop out of frame
    S('M 780 950 C 770 990 768 1040 772 1090 L 832 1090 C 828 1040 832 1000 842 970 Z', C.pants, { sh: 'M 800 940 L 860 940 L 860 1100 L 800 1100 Z', sc: C.pantsDk });
    S('M 960 884 C 900 878 838 880 806 896 C 776 912 772 948 796 964 L 900 958 Z', C.pants, { sh: 'M 760 940 L 960 930 L 960 980 L 760 980 Z', sc: C.pantsDk });
    S('M 812 1000 C 800 1030 800 1060 804 1092 L 888 1092 C 884 1066 886 1046 894 1036 Z', C.pants, { sh: 'M 850 990 L 900 990 L 900 1100 L 850 1100 Z', sc: C.pantsDk });
    S('M 1330 904 C 1150 902 960 912 870 924 C 808 932 788 972 802 1006 C 814 1034 852 1044 894 1040 C 1000 1030 1180 1034 1286 1030 C 1334 1022 1348 950 1326 904 Z', C.pants, { sh: 'M 780 1012 C 900 1022 1100 1016 1400 1004 L 1400 1120 L 780 1120 Z', sc: C.pantsDk });
    Ln('M 1060 968 C 1090 984 1130 992 1170 986', { lw: 2.2 });
    Ln('M 830 960 C 842 972 846 986 842 1000', { lw: 2.2 });
  }

  function torso() {
    // oversized bomber, slumped: rounded back, dropped shoulders
    S('M 1066 616 C 1012 620 974 642 958 680 C 938 726 932 806 936 884 L 942 954 L 1298 962 C 1334 884 1344 776 1332 716 C 1320 664 1278 630 1200 616 Z',
      C.jacket, { sh: 'M 1234 606 C 1268 700 1266 830 1228 990 L 1400 990 L 1400 606 Z', sc: C.jacketDk });
    // orange ribbed hem
    S('M 942 936 L 1302 942 L 1298 966 L 944 962 Z', C.rib, { sh: 'M 900 900 L 1130 900 L 1130 990 L 900 990 Z M 1240 900 L 1320 900 L 1320 990 L 1240 990 Z', sc: C.ribDk });
    for (let i = 0; i < 26; i++) { const x = 952 + i * 13.5; Ln(`M ${x} ${940 + i * .2} L ${x} ${960 + i * .2}`, { lw: 1.4, col: i < 13 || i > 21 ? '#9A4F22' : C.ribDk, amp: 0 }); }
    // V of dark shirt under the collar, zip line below
    S('M 1066 630 L 1114 634 C 1102 664 1092 694 1082 726 C 1076 692 1072 662 1066 630 Z', C.shirt);
    Ln('M 1082 726 C 1072 800 1060 880 1052 930', { lw: 2.6 });
    S(rrect(1077, 722, 10, 16, 3), '#C9C4DA', { lw: 2 });
    // wrinkles
    Ln('M 996 730 C 1008 750 1010 770 1004 790 M 1272 700 C 1258 710 1252 726 1254 742 M 1172 804 Q 1186 816 1202 816', { lw: 2.4 });
    // yellow smiley pin on the chest
    S(circ(1162, 722, 17), '#FFD640', { lw: 2.6, sh: 'M 1168 702 C 1184 712 1184 734 1168 744 L 1192 744 L 1192 702 Z', sc: '#D9A827' });
    X.fillStyle = INK; X.fillRect(1155, 714, 3, 5); X.fillRect(1166, 714, 3, 5);
    Ln('M 1153 726 Q 1162 735 1171 726', { lw: 2.2, amp: 0 });
  }

  function neckAndCollar() {
    at(HX, HY, HR, () => {
      S('M -8 112 C -2 150 4 185 10 226 L 92 226 C 78 185 66 145 58 100 Z', C.skin, { sh: 'M 30 90 C 38 150 46 200 50 260 L 120 260 L 120 90 Z', sc: C.skinDk });
      S('M -10 128 C 14 150 40 140 60 116 L 66 160 C 40 176 10 176 -6 166 Z', C.skinDk, { ink: null, amp: 0 });
    });
    // orange rib-knit collar ring
    S('M 1058 612 C 1088 592 1166 588 1198 604 C 1214 616 1214 640 1202 652 C 1170 638 1102 636 1062 654 C 1050 640 1048 622 1058 612 Z', C.rib, { sh: 'M 1160 576 C 1178 606 1186 636 1176 666 L 1240 666 L 1240 576 Z', sc: C.ribDk });
    for (let i = 0; i < 11; i++) { const k = i / 10, x = lerp(1066, 1200, k), y0 = 608 - Math.sin(k * Math.PI) * 14, y1 = 646 - Math.sin(k * Math.PI) * 8; Ln(`M ${x} ${y0 + 4} L ${x + 1} ${y1 - 3}`, { lw: 1.6, col: C.ribDk, amp: 0 }); }
  }

  function head(t) {
    at(HX, HY, HR, () => {
      // ear
      S('M 60 -18 C 88 -44 124 -20 114 16 C 106 46 82 60 62 46 C 70 26 70 2 60 -18 Z', C.skin, { sh: 'M 96 -60 L 160 -60 L 160 80 L 100 80 C 110 40 110 0 96 -60 Z', sc: C.skinDk });
      Ln('M 80 -6 C 98 -8 102 18 86 30', { lw: 2.4 });
      // skull / face (big, rounded, small chin)
      const HEAD = 'M -128 -85 C -140 -45 -146 10 -143 50 C -140 95 -122 132 -95 150 C -70 166 -35 170 -5 160 C 30 148 62 126 86 104 C 70 60 64 20 58 -16 C 90 -30 120 -20 130 -40 C 150 -80 118 -150 40 -170 C -40 -186 -112 -142 -128 -85 Z';
      S(HEAD, C.skin, { sh: 'M 30 -200 C 44 -120 62 -60 66 0 C 70 60 56 110 14 150 C -10 166 -40 174 -60 178 L 200 260 L 200 -200 Z', sc: C.skinDk });
      Ln('M 60 -18 C 70 2 70 26 62 46', { lw: LW });
      // hair (messy clumps, cowlick at the crown)
      const HAIR = 'M -162 -96 Q -150 -84 -156 -68 Q -140 -80 -130 -96 Q -124 -84 -118 -72 Q -110 -92 -96 -102 Q -90 -92 -82 -86 Q -76 -100 -60 -108 Q -52 -98 -42 -92 Q -32 -106 -16 -112 Q -6 -100 6 -96 Q 14 -108 28 -112 Q 60 -100 70 -72 Q 62 -52 64 -28 Q 80 -44 96 -40 Q 100 -24 106 -10 Q 118 -26 132 -26 Q 138 -8 146 6 Q 156 -6 162 -22 C 176 -72 166 -128 124 -160 Q 118 -180 104 -196 Q 94 -180 78 -180 C 40 -194 -10 -198 -48 -190 Q -66 -202 -86 -208 Q -86 -192 -98 -180 C -140 -162 -168 -132 -162 -96 Z';
      S(HAIR, C.hair, { shift: [-16, -8], sc: C.hairDk });
      S('M 62 -180 C 54 -214 80 -240 110 -232 C 128 -226 126 -204 110 -204 C 100 -204 98 -214 106 -216 C 96 -222 84 -216 82 -204 C 80 -194 84 -186 88 -178 Z', C.hair, { shift: [-6, -4], sc: C.hairDk });
      Ln('M -30 -150 Q -10 -140 0 -122 M 60 -140 Q 80 -126 86 -104', { lw: 2.2, col: '#4A3E5C' });
      // eyes: big white bulgy circles, close together, far one smaller and poking past the face line
      const E1 = [-40, -4, 46], E2 = [-138, -1, 39];
      for (const [ex, ey, er] of [E2, E1]) S(circ(ex, ey, er), C.eye, { lw: LW });
      // welling up: a wobbly pale-blue waterline along the bottom of each eye
      const water = (ex, ey, er, d) => { X.save(); trace(circ(ex, ey, er), .9); X.clip(); X.fillStyle = '#BCDDF6'; trace(d, 0); X.fill(); X.restore(); };
      water(...E1, 'M -92 24 Q -80 31 -66 27 Q -52 23 -40 31 Q -24 36 -10 29 Q 0 25 12 29 L 12 70 L -92 70 Z');
      water(...E2, 'M -182 24 Q -170 30 -158 26 Q -146 22 -136 29 Q -122 33 -96 26 L -96 70 L -182 70 Z');
      // tiny dot pupils, looking down-left at the screen, deliberately a little misaligned
      X.fillStyle = INK;
      X.beginPath(); X.arc(-56, 20, 5.2, 0, TAU); X.fill();
      X.beginPath(); X.arc(-152, 15, 4.6, 0, TAU); X.fill();
      X.fillStyle = '#FFFFFF'; X.fillRect(-72, 33, 4, 4); X.fillRect(-160, 30, 3, 3);
      // heavy, sad lids (droop toward the outer corners)
      const lid = (ex, ey, er, d, line) => { X.save(); trace(circ(ex, ey, er), .9); X.clip(); X.fillStyle = C.skin; trace(d, 0); X.fill(); X.restore(); Ln(line, { lw: LW }); };
      lid(...E1, 'M -96 -20 Q -40 -8 14 12 L 14 -80 L -96 -80 Z', 'M -84 -18 Q -40 -7 6 9');
      lid(...E2, 'M -186 10 Q -140 -8 -92 -18 L -92 -80 L -186 -80 Z', 'M -176 7 Q -140 -7 -101 -16');
      // round glasses, with a flat pale-cyan screen reflection
      const G1 = [-40, -4, 55], G2 = [-139, -1, 45];
      for (const [gx, gy, gr] of [G1, G2]) {
        X.save(); trace(circ(gx, gy, gr), 0); X.clip();
        X.fillStyle = C.lens; X.globalAlpha = .14; X.fill(); X.globalAlpha = .5;
        X.beginPath(); X.moveTo(gx - gr * .95, gy - gr * .15); X.lineTo(gx - gr * .15, gy - gr * .95); X.lineTo(gx + gr * .1, gy - gr * .95); X.lineTo(gx - gr * .95, gy + gr * .1); X.fill();
        X.restore(); X.globalAlpha = 1;
        S(circ(gx, gy, gr), null, { lw: 3.4 });
      }
      Ln('M -95 -12 Q -92 -20 -88 -12', { lw: 3 });          // bridge
      Ln('M 15 -12 L 64 -16', { lw: 3 });                   // temple arm to the ear
      // brows: thin, inner ends lifted (worried)
      Ln('M -86 -80 Q -82 -86 -72 -84 C -48 -80 -18 -72 8 -58', { lw: 3.6 });
      Ln('M -168 -48 C -150 -60 -130 -68 -112 -74 Q -104 -76 -100 -72', { lw: 3.6 });
      // tired bags
      Ln('M -74 58 Q -52 66 -28 56', { lw: 2.2 });
      Ln('M -64 68 Q -52 72 -40 68', { lw: 1.8 });
      // nose: a little rounded bump that pokes past the profile
      S('M -96 48 C -120 42 -154 54 -154 72 C -154 88 -130 90 -112 82 C -104 72 -100 60 -96 48 Z', C.skin, { ink: null });
      Ln('M -100 46 C -120 42 -154 54 -154 72 C -154 88 -130 90 -112 82', { lw: LW });
      // mouth: a small half smile that can't quite commit; far corner droops
      Ln('M -134 128 Q -133 121 -127 119 C -108 127 -84 129 -64 124 C -54 121 -48 117 -44 110', { lw: 3.4 });
      Ln('M -102 141 Q -88 146 -74 141', { lw: 2.4 });
    });
  }

  function farArm() {
    S('M 980 668 C 942 684 922 752 922 808 C 922 850 928 872 944 894 L 996 892 C 986 856 984 806 1000 744 Z', C.jacket, { shift: [8, 0], sc: C.jacketDk });
    S('M 940 876 L 994 872 L 998 906 L 942 910 Z', C.rib, { sh: 'M 900 896 L 1000 892 L 1000 920 L 900 920 Z', sc: C.ribDk });
  }

  function laptop() {
    // base (keyboard deck) on his lap
    const B = [[850, 896], [944, 880], [1128, 900], [1040, 924]];
    S(poly([[850, 896], [1040, 924], [1040, 936], [850, 908]]), C.lapDk, { lw: LW });
    S(poly([[1040, 924], [1128, 900], [1128, 911], [1040, 936]]), C.lapDk, { lw: LW });
    S(poly(B), C.lapBody, { lw: LW });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
      const u = (c + .5) / 8, v = (r + .6) / 5;
      const x = lerp(lerp(850, 944, u), lerp(1040, 1128, u), v) + 6, y = lerp(lerp(896, 880, u), lerp(924, 900, u), v);
      X.fillStyle = C.lapDk; X.fillRect(x, y - 1.5, 9, 3);
    }
    // lid, screen facing him (cheated toward camera so we can read it)
    const TL = [792, 652], TR = [906, 636], BL = [850, 896], BR = [964, 880];
    S(poly([[TL[0] - 10, TL[1] + 4], TL, BL, [BL[0] - 8, BL[1] + 2]]), C.lapDk, { lw: LW });
    S(poly([TL, TR, BR, BL]), C.lapBody, { lw: LW });
    const P = (u, v) => [TL[0] + (TR[0] - TL[0]) * u + (BL[0] - TL[0]) * v, TL[1] + (TR[1] - TL[1]) * u + (BL[1] - TL[1]) * v];
    const s0 = P(.08, .05), s1 = P(.92, .05), s2 = P(.92, .94), s3 = P(.08, .94);
    S(poly([s0, s1, s2, s3]), C.screen, { lw: 2.4, amp: .3 });
    X.save();
    X.transform((s1[0] - s0[0]) / 100, (s1[1] - s0[1]) / 100, (s3[0] - s0[0]) / 210, (s3[1] - s0[1]) / 210, s0[0], s0[1]);
    X.fillStyle = C.screenDk; X.fillRect(0, 0, 100, 14);
    const bub = (x, y, w, h, col) => { X.fillStyle = col; X.beginPath(); X.roundRect(x, y, w, h, 5); X.fill(); X.strokeStyle = '#6F97C8'; X.lineWidth = 1.2; X.stroke(); };
    bub(30, 24, 62, 26, '#EAF5FF'); bub(8, 58, 70, 40, '#FFFDE0'); bub(34, 106, 58, 22, '#EAF5FF'); bub(8, 136, 74, 34, '#FFFDE0');
    X.fillStyle = '#7C95B8';
    for (const [x, y, w] of [[36, 31, 48], [36, 39, 30], [14, 65, 56], [14, 73, 50], [14, 81, 36], [40, 113, 44], [14, 143, 60], [14, 151, 42], [14, 159, 52]]) X.fillRect(x, y, w, 3);
    X.fillStyle = '#3B4A6B'; X.font = '700 10px Rajdhani, sans-serif'; X.textBaseline = 'middle'; X.fillText('context 97%', 7, 184);
    X.fillStyle = '#FFFFFF'; X.fillRect(7, 193, 86, 8);
    X.fillStyle = C.bar; X.fillRect(7, 193, 86 * .97, 8);
    X.strokeStyle = '#3B4A6B'; X.lineWidth = 1.2; X.strokeRect(7, 193, 86, 8);
    X.restore();
  }

  function nearArm() {
    // his left arm (camera side): baggy sleeve, elbow tucked, forearm resting on the laptop
    S('M 1250 668 C 1302 656 1336 698 1340 756 C 1344 816 1336 866 1314 896 C 1286 922 1226 922 1174 918 L 1168 870 C 1210 866 1252 862 1268 840 C 1274 804 1272 748 1250 708 Z',
      C.jacket, { sh: 'M 1304 640 C 1314 740 1310 850 1264 930 L 1400 930 L 1400 640 Z M 1110 904 L 1320 898 L 1320 940 L 1110 940 Z', sc: C.jacketDk });
    Ln('M 1276 820 C 1290 830 1300 846 1302 862', { lw: 2.4 });
    S('M 1134 868 L 1172 864 L 1178 918 L 1140 922 Z', C.rib, { sh: 'M 1162 850 L 1192 850 L 1192 930 L 1162 930 Z', sc: C.ribDk });
    for (const x of [1144, 1154, 1164]) Ln(`M ${x} 870 L ${x + 2} 918`, { lw: 1.5, col: C.ribDk, amp: 0 });
    // hand: simple mitten with fingers draped over the keys
    S('M 1136 874 C 1112 870 1088 874 1074 886 C 1064 896 1070 906 1082 906 C 1078 914 1086 920 1096 916 C 1098 924 1110 924 1116 916 C 1124 922 1136 918 1138 908 Z', C.skin, { sh: 'M 1082 904 L 1152 904 L 1152 932 L 1082 932 Z', sc: C.skinDk });
  }
  function farHand() {
    S('M 934 880 C 912 878 890 884 880 894 C 872 902 878 910 888 908 C 886 916 896 920 904 914 C 908 920 920 918 924 910 C 934 912 940 904 938 896 Z', C.skin, { sh: 'M 880 906 L 950 906 L 950 930 L 880 930 Z', sc: C.skinDk });
  }

  // =====================================================================================
  // THE ASSISTANT (sitting on his shoulder, head leaned against his jaw, one arm round his neck)
  // =====================================================================================
  function assistant(t) {
    const sway = Math.sin(t * TAU / 3.6) * .012, lw = 3;
    at(1244, 636, sway, () => {
      const col = C.mask, dk = C.maskDk;
      // legs: short thighs over the shoulder, shins dangling down his chest, toes pointing in
      S(noodle([[6, -4], [-8, 2], [-22, 8], [-27, 30], [-30, 52]], 7.5, 7), col, { lw, shift: [-4, 0], sc: dk });
      S(ell(-35, 58, 11, 7), col, { lw });
      S(noodle([[16, 2], [2, 8], [-12, 14], [-13, 38], [-11, 62]], 7.5, 7), col, { lw, shift: [-4, 0], sc: dk });
      S(ell(-17, 68, 11, 7), col, { lw });
      // bean body, leaning hard into him
      S('M -4 8 C -26 -4 -44 -38 -38 -64 C -32 -88 0 -90 10 -62 C 18 -40 22 -8 16 4 C 10 14 2 14 -4 8 Z', col, { lw, sh: 'M 0 -100 C 22 -64 26 -20 10 24 L 60 24 L 60 -100 Z', sc: dk });
      // resting arm draped over its lap
      S(noodle([[6, -56], [18, -40], [18, -20], [6, -6]], 6, 5.5), col, { lw, shift: [-3, 0], sc: dk });
      // head: the smiley mask, pressed against his jaw
      at(-56, -118, -.58, () => maskFace(42, { sw: 3 }));
      // arm round his neck: across his collar, little hand resting on his neck
      S(noodle([[-28, -58], [-50, -58], [-72, -62], [-92, -66]], 6, 5.5), col, { lw });
      S(ell(-98, -67, 9, 8), col, { lw });
    });
  }

  // =====================================================================================
  function frame(t) {
    style(1); FX.noAuto = true; FX.bloom = 0; FX.scan = 0; FX.grain = 0;
    background(t);
    couchBack();
    couchFront();
    extras();
    shoggoth(t);
    legs();
    torso();
    farArm();
    neckAndCollar();
    head(t);
    laptop();
    farHand();
    nearArm();
    assistant(t);
  }

  chapter('flatcartoon', 0, 1, [[0, (t) => frame(t)]]);
})();
