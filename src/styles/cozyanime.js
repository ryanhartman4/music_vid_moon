// cozyanime.js: style study K = 2, "cozy hand-drawn anime film" (gentle theatrical anime: soft, warm, painterly).
// Characters: soft rounded construction, natural proportions, simple dark-oval eyes with one highlight, thin lines tinted
// per material (never black), flat two-tone cel shading plus a soft light pass. Background: gouache-style brushwork,
// warm lamp light against blue rain. Everything is drawn here with Canvas2D paths (no stock hero/shoggoth/mask rigs).
(() => {
  const K = 2;

  // ---------- palette ----------
  const C = {
    skin: '#F4D5BD', skinSh: '#CF9FA0', skinLn: '#8E5249', blush: '#EE8C8C',
    hair: '#2B2A44', hairSh: '#1C1A2E', hairHi: '#4B5078', hairLn: '#17131F', hairRim: '#D69A6E',
    jk: '#4642A0', jkSh: '#27225C', jkHi: '#6A70C8', jkLn: '#1D1741', jkRim: '#E0976E',
    rib: '#F0893A', ribSh: '#C0602C', ribLn: '#8A3C18',
    shirt: '#2A2838', pants: '#363B5E', pantsSh: '#23263F', pantsLn: '#15152C',
    lap: '#C3C7D6', lapSh: '#8C91A8', lapLn: '#3E4158', key: '#6E7390',
    shog: '#99B087', shogSh: '#6F8B6C', shogHi: '#BCD2A6', shogLn: '#3A5036', shogLid: '#88A07A',
    mask: '#F5FA83', maskSh: '#D8DC66', maskLn: '#7C6E2C',
    couch: '#B06A64', couchSh: '#7E4652', couchHi: '#D08D74', couchLn: '#5A2E3A',
    knit: '#EADCC0', knitSh: '#B7A48F', knitLn: '#8A735E',
    wood: '#8C5B3B', woodSh: '#5C3827', woodLn: '#3E2419',
    frame: '#D2BE9C', frameSh: '#8F8084', frameLn: '#4B3A40',
    curtain: '#C99A4E', curtainSh: '#8E5E3E', curtainLn: '#5C3A28',
    leaf: '#5E8A55', leafSh: '#3D6044', leafLn: '#23402C',
    lampLight: '#FFC47E', screen: '#BFE8FF'
  };

  // ---------- helpers ----------
  const PC = new Map();
  const pth = d => { if (typeof d !== 'string') return d; let p = PC.get(d); if (!p) { p = new Path2D(d); PC.set(d, p); } return p; };
  const ell = (cx, cy, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, rot, 0, TAU); return p; };
  function fill(d, col, a = 1, comp) { X.save(); if (comp) X.globalCompositeOperation = comp; X.globalAlpha = a; X.fillStyle = col; X.fill(pth(d)); X.restore(); }
  let LA = 1;   // line-art strength: backgrounds are painted (soft, nearly lineless), characters get full cel lines
  function stroke(d, col, w = 2, a = 1) { X.save(); X.globalAlpha = a * LA; X.strokeStyle = col; X.lineWidth = w; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(pth(d)); X.restore(); }
  function clipTo(d, fn) { X.save(); X.clip(pth(d)); fn(); X.restore(); }
  function shape(d, base, ln, lw = 2.2) { fill(d, base); if (ln) stroke(d, ln, lw); }
  // two-tone cel shade: inside d, paint col wherever d shifted by (dx, dy) does not reach (a crescent away from the light)
  function offShade(d, col, dx, dy, a = 1) {
    const p = new Path2D(); p.rect(-4000, -4000, 8000, 8000); p.addPath(pth(d), new DOMMatrix([1, 0, 0, 1, dx, dy]));
    clipTo(d, () => { X.globalAlpha = a; X.fillStyle = col; X.fill(p, 'evenodd'); }); X.globalAlpha = 1;
  }
  function rad(x, y, r, col, a, comp = 'source-over', mid = .45) {
    const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(mid, rgba(col, a * .45)); g.addColorStop(1, rgba(col, 0));
    X.save(); X.globalCompositeOperation = comp; X.fillStyle = g; X.fillRect(x - r, y - r, 2 * r, 2 * r); X.restore();
  }
  const lin = (x0, y0, x1, y1, stops) => { const g = X.createLinearGradient(x0, y0, x1, y1); for (const [k, c] of stops) g.addColorStop(k, c); return g; };
  function gradAt(stops, k) { k = clamp(k); for (let i = 1; i < stops.length; i++) if (k <= stops[i][0]) return mixCol(stops[i - 1][1], stops[i][1], (k - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])); return stops[stops.length - 1][1]; }
  // gouache brushwork: n tapered strokes inside a box (optionally clipped), colour from col(x, y, h)
  function brush(o) {
    X.save(); if (o.clip) X.clip(pth(o.clip)); if (o.comp) X.globalCompositeOperation = o.comp;
    for (let i = 0; i < o.n; i++) {
      const s = o.seed * 977 + i * 7.31, x = o.x + hash(s) * o.w, y = o.y + hash(s + 1.7) * o.h;
      const L = lerp(o.len[0], o.len[1], hash(s + 2.3)), w = lerp(o.wid[0], o.wid[1], hash(s + 3.1)), an = (o.ang ?? 0) + (hash(s + 4.9) - .5) * (o.angJ ?? .4);
      const c = Math.cos(an), sn = Math.sin(an), px = -sn, py = c;
      const x0 = x - c * L / 2, y0 = y - sn * L / 2, x1 = x + c * L / 2, y1 = y + sn * L / 2;
      X.globalAlpha = lerp(o.a[0], o.a[1], hash(s + 5.5)); X.fillStyle = o.col(x, y, hash(s + 6.6));
      X.beginPath(); X.moveTo(x0 + px * w * .45, y0 + py * w * .45);
      X.bezierCurveTo(x0 + px * w + c * L * .25, y0 + py * w + sn * L * .25, x1 + px * w * .5 - c * L * .25, y1 + py * w * .5 - sn * L * .25, x1, y1);
      X.bezierCurveTo(x1 - px * w * .5 - c * L * .25, y1 - py * w * .5 - sn * L * .25, x0 - px * w + c * L * .25, y0 - py * w + sn * L * .25, x0 - px * w * .45, y0 - py * w * .45);
      X.closePath(); X.fill();
      if (o.bristle && hash(s + 8.8) < o.bristle) {   // dry-brush bristle streaks
        X.strokeStyle = X.fillStyle; X.lineWidth = .9; X.globalAlpha *= 1.3; X.beginPath();
        for (let b = -1; b <= 1; b++) { const off = b * w * .45 + (hash(s + b) - .5) * 2; X.moveTo(x0 + px * off, y0 + py * off); X.lineTo(x1 + px * off * .4 + c * 6, y1 + py * off * .4 + sn * 6); }
        X.stroke();
      }
    }
    X.restore();
  }
  const shade = (hex, k) => k >= 0 ? mixCol(hex, '#FFFFFF', k) : mixCol(hex, '#10081A', -k);
  // smooth closed/open curve through points (Catmull-Rom → Bezier), returned as a Path2D
  function spline(pts, close = true, tension = .5) {
    const p = new Path2D(), n = pts.length, P = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < (close ? n : n - 1); i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k = tension / 3;
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
    }
    if (close) p.closePath(); return p;
  }
  // tapered ribbon outline along a spine: w(k) half width at 0..1 → Path2D
  function taper(spine, w) {
    const L = [], R = [], n = spine.length;
    for (let i = 0; i < n; i++) {
      const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, ww = w(i / (n - 1));
      L.push([spine[i][0] + Math.cos(ang) * ww, spine[i][1] + Math.sin(ang) * ww]); R.push([spine[i][0] - Math.cos(ang) * ww, spine[i][1] - Math.sin(ang) * ww]);
    }
    return spline(L.concat(R.reverse()), true, .35);
  }

  // =====================================================================================
  // BACKGROUND
  // =====================================================================================
  const WALL = [[0, '#222A58'], [.3, '#2C3466'], [.5, '#443F6C'], [.64, '#80606E'], [.78, '#C28A5C'], [.9, '#DDA565'], [1, '#B8794C']];
  function wall(t) {
    X.fillStyle = lin(0, 0, W, 0, WALL); X.fillRect(0, 0, W, H);
    X.fillStyle = lin(0, 0, 0, H, [[0, 'rgba(18,14,40,.5)'], [.45, 'rgba(18,14,40,.08)'], [1, 'rgba(18,14,40,.2)']]); X.fillRect(0, 0, W, H);
    rad(1640, 390, 820, '#FFC27A', .5, 'screen', .35);
    brush({ x: -60, y: -60, w: W + 120, h: 760, n: 1300, seed: 1, len: [50, 150], wid: [7, 20], ang: -.35, angJ: .7, a: [.06, .16], bristle: .35,
      col: (x, y, h) => shade(gradAt(WALL, x / W), (h - .45) * .5 + (x > 1300 ? .08 : 0)) });
  }

  // ---------- the window: blue hour, rain, city, moon ----------
  const WIN = { x0: 92, y0: 34, x1: 884, y1: 612, fw: 24 };
  function windowView(t) {
    const { x0, y0, x1, y1, fw } = WIN, gx0 = x0 + fw, gy0 = y0 + fw, gx1 = x1 - fw, gy1 = y1, gw = gx1 - gx0, gh = gy1 - gy0;
    X.save(); X.beginPath(); X.rect(gx0, gy0, gw, gh); X.clip();
    const SKY = [[0, '#121A44'], [.4, '#1F2F68'], [.72, '#34498A'], [1, '#56579A']];
    X.fillStyle = lin(0, gy0, 0, gy1, SKY); X.fillRect(gx0, gy0, gw, gh);
    brush({ x: gx0, y: gy0, w: gw, h: gh, n: 260, seed: 2, len: [60, 180], wid: [8, 18], ang: -.08, angJ: .3, a: [.06, .14],
      col: (x, y, h) => shade(gradAt(SKY, (y - gy0) / gh), (h - .5) * .35) });
    // moon + halo
    const mx = 300, my = 168, mr = 40;
    rad(mx, my, 260, '#9FB8F0', .35, 'screen', .3); rad(mx, my, 110, '#F5EBC8', .45, 'screen', .4);
    fill(ell(mx, my, mr, mr), '#F7F0D6');
    clipTo(ell(mx, my, mr, mr), () => { fill(ell(mx + 12, my + 8, mr, mr), '#E7DCBC', .55); fill(ell(mx - 12, my - 10, 9, 8), '#E3D6B4', .6); fill(ell(mx + 14, my + 14, 6, 5), '#E3D6B4', .5); fill(ell(mx - 4, my + 20, 5, 4), '#E3D6B4', .45); });
    // drifting clouds (painted bands, lit from the moon)
    const drift = t * 3;
    for (let i = 0; i < 7; i++) {
      const cy = 110 + i * 46 + hash(i) * 30, cx = gx0 - 200 + ((hash(i * 3.3) * (gw + 400) + drift * (1 + hash(i))) % (gw + 400)), cw = 180 + hash(i * 2) * 260;
      brush({ x: cx, y: cy - 14, w: cw, h: 28, n: 26, seed: 30 + i, len: [50, 120], wid: [6, 13], ang: -.04, angJ: .2, a: [.18, .32],
        col: (x, y, h) => mixCol('#2B3A78', '#8C9AD0', clamp(1 - Math.hypot(x - mx, y - my) / 420) * .8 + h * .15) });
    }
    // city: three depth layers, softened by the wet glass
    X.filter = 'blur(1.6px)';
    const layers = [[.0, 360, '#3A5190', '#FFE2B0', .35, 30], [.35, 420, '#26356E', '#FFCB85', .5, 22], [.7, 470, '#18214C', '#FFB86A', .7, 16]];
    layers.forEach(([dk, top, col, lit, la, wmin], L) => {
      let bx = gx0 - 30 + hash(L) * 40;
      for (let i = 0; bx < gx1 + 40; i++) {
        const id = L * 50 + i, bw = wmin * 2 + hash(id * 1.7) * 90, bh = (gy1 - top) + hash(id * 2.9) * 140 - 40;
        const by = gy1 - bh + 30;
        X.fillStyle = col; X.fillRect(bx, by, bw, bh + 40);
        if (hash(id * 5.1) < .3) X.fillRect(bx + bw * .4, by - 18, 3, 18);                       // antenna
        if (hash(id * 6.3) < .25) X.fillRect(bx + bw * .15, by - 14, bw * .3, 14);                // water tank / roof box
        const cols = Math.floor(bw / 13), rows = Math.floor(bh / 16);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const hv = hash(id * 31 + r * 7.3 + c * 3.1); if (hv > .3) continue;
          X.globalAlpha = la * (.5 + hv * 1.6); X.fillStyle = hv < .06 ? '#A8D8FF' : lit; X.fillRect(bx + 4 + c * 13, by + 8 + r * 16, 6, 8);
        }
        X.globalAlpha = 1; bx += bw + 3 + hash(id * 4.4) * 14;
      }
      X.fillStyle = rgba('#2A3470', .35 - L * .1); X.fillRect(gx0, gy1 - 150 + L * 40, gw, 200);   // haze between layers
    });
    X.filter = 'none';
    // out-of-focus lights through the rain (bokeh)
    for (let i = 0; i < 46; i++) {
      const bx = gx0 + hash(i * 9.1) * gw, by = 380 + hash(i * 4.7) * 230, r = 6 + hash(i * 2.2) * 16, warm = hash(i * 3.9) < .7;
      const col = warm ? (hash(i) < .5 ? '#FFC77A' : '#FF9E6A') : (hash(i) < .5 ? '#8FD0FF' : '#D69CFF');
      rad(bx, by, r * 1.8, col, .28, 'screen', .55); fill(ell(bx, by, r, r), col, .12, 'screen');
    }
    // rain outside (slanted streaks)
    X.strokeStyle = '#B8CCFF'; X.lineWidth = 1.2; X.globalAlpha = .22; X.beginPath();
    for (let i = 0; i < 170; i++) { const sp = 900 + hash(i) * 500, x = gx0 + (hash(i * 3) * (gw + 200) + t * sp * .18) % (gw + 200) - 100, y = gy0 + (hash(i * 7) * (gh + 100) + t * sp) % (gh + 100) - 50, L = 18 + hash(i * 5) * 26; X.moveTo(x, y); X.lineTo(x - L * .18, y - L); }
    X.stroke(); X.globalAlpha = 1;
    // glass: faint warm reflection of the room, trickles and droplets
    X.fillStyle = lin(gx0, 0, gx1, 0, [[0, 'rgba(255,190,120,0)'], [.8, 'rgba(255,190,120,.04)'], [1, 'rgba(255,190,120,.12)']]); X.fillRect(gx0, gy0, gw, gh);
    for (let i = 0; i < 26; i++) {
      const tx = gx0 + 10 + hash(i * 13.1) * (gw - 20), len = 50 + hash(i * 2.7) * 170, sp = 6 + hash(i * 5.5) * 14, ty = gy0 + ((hash(i * 7.7) * (gh + len) + t * sp) % (gh + len)) - len * .3;
      const sp2 = []; for (let k = 0; k <= 10; k++) sp2.push([tx + Math.sin(k * 1.3 + i) * 2.2 * (k / 10), ty - len + len * k / 10]);
      X.strokeStyle = '#DDE8FF'; X.globalAlpha = .16; X.lineWidth = 2.2; X.stroke(spline(sp2, false)); X.globalAlpha = .28; X.lineWidth = .8; X.stroke(spline(sp2, false));
      droplet(sp2[10][0], sp2[10][1], 3.6 + hash(i) * 2.5);
    }
    for (let i = 0; i < 190; i++) droplet(gx0 + hash(i * 17.3) * gw, gy0 + hash(i * 11.9) * gh, 1.2 + Math.pow(hash(i * 4.1), 2) * 4.5);
    X.globalAlpha = 1; X.restore();
    windowFrame();
  }
  function droplet(x, y, r) {
    fill(ell(x, y, r, r * 1.12), '#B4C6F2', .22);
    fill(ell(x + r * .15, y + r * .45, r * .8, r * .45), '#0E1638', .35);
    fill(ell(x - r * .3, y - r * .35, r * .32, r * .26), '#FFFFFF', .7);
  }
  function windowFrame() {
    const { x0, y0, x1, y1, fw } = WIN, mxv = (x0 + x1) / 2, myh = 318;
    const bars = [[x0, y0, x1 - x0, fw], [x0, y0, fw, y1 - y0], [x1 - fw, y0, fw, y1 - y0], [mxv - 8, y0, 16, y1 - y0], [x0, myh - 7, x1 - x0, 14]];
    for (const [bx, by, bw, bh] of bars) {
      const p = new Path2D(); p.rect(bx, by, bw, bh);
      X.fillStyle = lin(x0, 0, x1 + 300, 0, [[0, '#7F7690'], [.6, '#A8998F'], [1, '#D6B894']]); X.fill(p);
    }
    // bevel shadow inside the glass edge + line work
    X.fillStyle = 'rgba(20,16,40,.35)'; X.fillRect(x0 + fw, y0 + fw, x1 - x0 - 2 * fw, 6); X.fillRect(x0 + fw, y0 + fw, 5, y1 - y0);
    X.strokeStyle = C.frameLn; X.lineWidth = 1.6; X.globalAlpha = .7;
    X.strokeRect(x0, y0, x1 - x0, y1 - y0 + 40); X.strokeRect(x0 + fw, y0 + fw, x1 - x0 - 2 * fw, y1 - y0);
    X.strokeRect(mxv - 8, y0 + fw, 16, y1 - y0); X.strokeRect(x0 + fw, myh - 7, x1 - x0 - 2 * fw, 14); X.globalAlpha = 1;
    // sill
    const sill = 'M 70 588 L 906 588 L 918 606 L 58 606 Z';
    shape(sill, '#B7A08C', C.frameLn, 1.6); fill('M 58 606 L 918 606 L 918 618 L 58 618 Z', '#6E5E6A');
  }
  function curtains(t) {
    // left curtain (mustard linen, gathered at the rod)
    const L = 'M 22 20 L 176 20 C 168 120 186 240 170 360 C 158 470 176 560 150 700 L 10 700 Z';
    const R = 'M 858 20 L 990 20 C 1000 150 986 300 1002 440 C 1010 530 994 590 1000 640 L 862 640 C 876 520 850 400 868 260 C 878 160 852 80 858 20 Z';
    for (const [d, x0, x1, cool] of [[L, 10, 186, .45], [R, 850, 1010, .15]]) {
      fill(d, lin(x0, 0, x1, 0, [[0, mixCol(C.curtainSh, '#2A2A5A', cool)], [.5, mixCol(C.curtain, '#4A4A80', cool * .8)], [1, mixCol(C.curtainSh, '#2A2A5A', cool)]]));
      clipTo(d, () => {
        for (let i = 0; i < 6; i++) {   // vertical folds
          const fx = x0 + (i + .5) / 6 * (x1 - x0), sway = Math.sin(i * 1.7) * 10;
          const f = `M ${fx - 7} 20 C ${fx - 12 + sway} 200 ${fx + 8 - sway} 420 ${fx - 4} 720 L ${fx + 10} 720 C ${fx + 20 - sway} 420 ${fx + sway} 200 ${fx + 7} 20 Z`;
          fill(f, mixCol(C.curtainSh, '#1E1C40', cool), .55);
        }
        brush({ x: x0 - 20, y: 0, w: x1 - x0 + 40, h: 720, n: 120, seed: 40 + x0, len: [60, 160], wid: [4, 9], ang: Math.PI / 2, angJ: .15, a: [.08, .16], col: (x, y, h) => h < .5 ? '#F2D08A' : '#5A3A30' });
      });
      stroke(d, C.curtainLn, 1.6, .8);
    }
    // rod + string lights
    stroke('M 0 18 L 1030 18', '#3E2A22', 7); stroke('M 0 16 L 1030 16', '#8A6A50', 2, .7);
    const wire = []; for (let i = 0; i <= 40; i++) { const u = i / 40; wire.push([60 + u * 900, 30 + Math.sin(u * Math.PI * 4) ** 2 * 26]); }
    stroke(spline(wire, false), '#2A2030', 1.4, .8);
    for (let i = 1; i < 40; i += 3) { const [bx, by] = wire[i], tw = .75 + .25 * Math.sin(t * 2 + i); rad(bx, by + 5, 34, '#FFCF7A', .45 * tw, 'screen'); fill(ell(bx, by + 5, 4, 5.5), '#FFE9B0', .95); }
  }
  // ---------- windowsill plants + hanging planter ----------
  function leafPath(x, y, len, wid, ang) {
    const c = Math.cos(ang), s = Math.sin(ang), px = -s, py = c, tx = x + c * len, ty = y + s * len;
    return `M ${x} ${y} C ${x + c * len * .3 + px * wid} ${y + s * len * .3 + py * wid} ${x + c * len * .8 + px * wid * .7} ${y + s * len * .8 + py * wid * .7} ${tx} ${ty} C ${x + c * len * .8 - px * wid * .7} ${y + s * len * .8 - py * wid * .7} ${x + c * len * .3 - px * wid} ${y + s * len * .3 - py * wid} ${x} ${y} Z`;
  }
  function leaf(x, y, len, wid, ang, col, lnA = .8, sh = null) {
    const d = leafPath(x, y, len, wid, ang); fill(d, col); if (sh) offShade(d, sh, -wid * .25, -wid * .35);
    stroke(d, C.leafLn, 1.2, lnA); const c = Math.cos(ang), s = Math.sin(ang);
    stroke(`M ${x} ${y} Q ${x + c * len * .5 + s * 2} ${y + s * len * .5 - c * 2} ${x + c * len * .85} ${y + s * len * .85}`, C.leafLn, .9, lnA * .5);
  }
  function sillThings(t) {
    const cool = c => mixCol(c, '#27306A', .35);
    // cactus in terracotta pot
    shape('M 196 588 L 188 548 L 236 548 L 228 588 Z', cool('#B5634A'), C.woodLn, 1.4); fill('M 186 548 L 238 548 L 238 540 L 186 540 Z', cool('#C9785C')); stroke('M 186 540 L 238 540 L 238 548 L 186 548 Z', C.woodLn, 1.2);
    const cac = 'M 200 540 C 196 500 200 474 212 470 C 224 474 228 500 224 540 Z'; shape(cac, cool('#6F9A6A'), C.leafLn, 1.4); offShade(cac, cool(C.leafSh), -5, -3);
    shape('M 222 510 C 234 506 236 492 240 486 C 244 492 240 512 224 520 Z', cool('#6F9A6A'), C.leafLn, 1.2);
    // books + mug
    const bk = [['#6E4A6A', 520, 574, 110, 14], ['#3F6A7A', 526, 560, 100, 14], ['#B88A4A', 516, 548, 112, 12]];
    for (const [c, bx, by, bw, bh] of bk) { shape(`M ${bx} ${by} L ${bx + bw} ${by} L ${bx + bw} ${by + bh} L ${bx} ${by + bh} Z`, cool(c), C.woodLn, 1.2); stroke(`M ${bx + 4} ${by + bh * .5} L ${bx + bw - 6} ${by + bh * .5}`, '#F3E6D0', .8, .25); }
    shape('M 650 548 L 690 548 L 688 588 L 652 588 Z', cool('#E5DCCB'), C.woodLn, 1.3); stroke('M 690 556 C 704 556 704 578 689 578', C.woodLn, 3); stroke('M 690 556 C 704 556 704 578 689 578', cool('#E5DCCB'), 1.4);
    // pothos in a blue pot, trailing over the sill
    shape('M 736 588 L 728 540 L 816 540 L 808 588 Z', cool('#7FA3B8'), C.woodLn, 1.4); fill('M 728 540 L 816 540 L 814 552 L 730 552 Z', cool('#5E8298'), .6);
    const vines = [[744, 546, [[736, 580], [728, 640], [736, 700]]], [800, 546, [[812, 590], [826, 640], [818, 690], [830, 740]]], [770, 540, [[760, 500], [744, 470]]], [786, 540, [[800, 498], [822, 478]]]];
    for (const [vx, vy, pts] of vines) {
      const sp = [[vx, vy], ...pts]; stroke(spline(sp, false), cool(C.leafLn), 1.4, .9);
      sp.forEach(([px, py], j) => { if (j) leaf(px, py, 26, 11, (j % 2 ? -.6 : 3.6) + Math.sin(t * .8 + j) * .05, cool(j % 2 ? C.leaf : '#7FA66A'), .8, cool(C.leafSh)); });
    }
    for (let j = 0; j < 7; j++) leaf(772 + (j - 3) * 9, 540, 30 + hash(j) * 14, 12, -Math.PI / 2 + (j - 3) * .38, cool(j % 2 ? C.leaf : '#7FA66A'), .8, cool(C.leafSh));
    // hanging macramé planter in front of the glass
    stroke('M 640 20 L 612 96 M 640 20 L 668 96 M 640 20 L 640 96', '#C9B79A', 1.3, .8);
    const pot = 'M 606 96 L 674 96 C 672 124 660 138 640 138 C 620 138 608 124 606 96 Z'; shape(pot, cool('#C47A5A'), C.woodLn, 1.4); offShade(pot, cool('#8A4A3A'), -8, -2);
    for (let v = 0; v < 5; v++) {
      const sx = 612 + v * 14, len = 90 + hash(v * 3) * 150, sw = Math.sin(t * .7 + v) * 3, sp = [];
      for (let k = 0; k <= 6; k++) sp.push([sx + Math.sin(k * .9 + v) * 10 + sw * k / 6, 100 + len * k / 6]);
      stroke(spline(sp, false), cool(C.leafLn), 1.2, .9);
      for (let k = 1; k <= 6; k++) leaf(sp[k][0], sp[k][1], 20, 9, (k + v) % 2 ? .5 : 2.6, cool(k % 2 ? '#5E8A55' : '#78A266'), .8);
    }
    for (let j = 0; j < 6; j++) leaf(640 + (j - 2.5) * 10, 98, 26, 10, -Math.PI / 2 + (j - 2.5) * .45, cool('#6E9A60'), .8);
  }

  // ---------- right side: shelf, books, framed picture, lamp, kettle, monstera ----------
  function rightSide(t) {
    // framed drawing + pinned sketch
    shape('M 1262 70 L 1386 70 L 1386 176 L 1262 176 Z', '#6A4A3A', C.woodLn, 1.6);
    shape('M 1274 82 L 1374 82 L 1374 164 L 1274 164 Z', '#E9D8B6', C.woodLn, 1);
    fill('M 1274 140 C 1300 120 1320 128 1340 116 C 1356 108 1366 118 1374 112 L 1374 164 L 1274 164 Z', '#8FAE8A', .9);
    fill(ell(1344, 104, 10, 10), '#E9A45E', .9);
    shape('M 1166 104 L 1226 98 L 1232 168 L 1172 174 Z', '#F1E8D6', C.woodLn, 1); fill(ell(1199, 101, 4, 4), '#D9544A');
    stroke('M 1182 130 C 1192 118 1206 120 1214 132 M 1184 150 L 1218 146 M 1184 158 L 1210 156', '#7A6A8A', 1, .6);
    // wall shelf with books
    const sy = 262;
    shape(`M 1400 ${sy} L 1780 ${sy} L 1780 ${sy + 16} L 1400 ${sy + 16} Z`, C.wood, C.woodLn, 1.6); fill(`M 1400 ${sy + 16} L 1780 ${sy + 16} L 1770 ${sy + 24} L 1410 ${sy + 24} Z`, 'rgba(40,20,20,.35)');
    stroke(`M 1440 ${sy + 16} L 1440 ${sy + 40} L 1462 ${sy + 16} M 1740 ${sy + 16} L 1740 ${sy + 40} L 1718 ${sy + 16}`, C.woodLn, 3);
    const bookCols = ['#7A4E6E', '#3F6A78', '#C99A52', '#A8543E', '#5C7A52', '#E3D1AE', '#4A4A7E', '#B86A5A', '#6E8A9A'];
    let bx = 1420;
    for (let i = 0; i < 13; i++) {
      const bw = 14 + hash(i * 3.3) * 14, bh = 64 + hash(i * 5.1) * 44, lean = i === 9 ? .22 : 0, col = bookCols[i % bookCols.length];
      X.save(); X.translate(bx, sy); X.rotate(lean);
      const d = `M 0 0 L ${bw} 0 L ${bw} ${-bh} L 0 ${-bh} Z`; shape(d, col, C.woodLn, 1.2); offShade(d, shade(col, -.35), 5, 0);
      stroke(`M 2 ${-bh * .8} L ${bw - 2} ${-bh * .8} M 2 ${-bh * .2} L ${bw - 2} ${-bh * .2}`, '#F6E7C8', 1, .4);
      X.restore(); bx += bw + (i === 8 ? 26 : 1.5); if (i === 10) bx += 60;
    }
    // little jar + plant on the shelf, vines trailing
    shape(`M 1668 ${sy} L 1664 ${sy - 40} L 1700 ${sy - 40} L 1696 ${sy} Z`, '#D98A5E', C.woodLn, 1.3);
    const trail = [[1690, sy - 36], [1716, sy + 20], [1740, sy + 76], [1752, sy + 136], [1762, sy + 190]];
    stroke(spline(trail, false), C.leafLn, 1.4);
    trail.forEach(([px, py], j) => leaf(px, py, 24, 10, j % 2 ? .3 : 2.8, j % 2 ? '#6E9A58' : '#88B066', .8, C.leafSh));
    for (let j = 0; j < 5; j++) leaf(1682, sy - 38, 30, 11, -Math.PI / 2 + (j - 2) * .5, '#7AA862', .8, C.leafSh);
    // tall bookcase at the right edge
    shape('M 1790 0 L 1940 0 L 1940 640 L 1790 640 Z', C.woodSh, C.woodLn, 2);
    for (let s = 0; s < 4; s++) {
      const shY = 150 + s * 150; fill(`M 1804 ${shY - 136} L 1940 ${shY - 136} L 1940 ${shY} L 1804 ${shY} Z`, '#3A2320');
      let x = 1808;
      for (let i = 0; i < 9 && x < 1935; i++) { const bw = 12 + hash(s * 20 + i) * 12, bh = 70 + hash(s * 9 + i * 2.2) * 50, col = bookCols[(i * 3 + s) % bookCols.length]; const d = `M ${x} ${shY} L ${x + bw} ${shY} L ${x + bw} ${shY - bh} L ${x} ${shY - bh} Z`; shape(d, shade(col, -.1), C.woodLn, 1); offShade(d, shade(col, -.4), 4, 0); x += bw + 1; }
      shape(`M 1796 ${shY} L 1940 ${shY} L 1940 ${shY + 12} L 1796 ${shY + 12} Z`, C.wood, C.woodLn, 1.4);
    }
    // side table behind the couch: lamp, kettle, mug, book stack
    shape('M 1470 588 L 1790 588 L 1790 604 L 1470 604 Z', C.wood, C.woodLn, 1.6);
    const books2 = [['#4A5A7E', 1560, 574, 130, 14], ['#B8704E', 1570, 560, 112, 14]];
    for (const [c, x, y, w, h] of books2) shape(`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`, c, C.woodLn, 1.2);
    // lamp base (glazed ceramic) + shade (glowing)
    const base = 'M 1604 560 C 1584 540 1586 500 1608 482 L 1650 482 C 1672 500 1674 540 1654 560 Z';
    shape(base, '#6F9095', C.woodLn, 1.6); offShade(base, '#4A6468', -10, -4); stroke('M 1612 500 C 1606 516 1608 534 1616 546', '#D8F0EA', 2, .5);
    stroke('M 1629 482 L 1629 466', '#3E2A22', 4);
    const shadeD = 'M 1566 330 L 1692 330 L 1734 468 L 1524 468 Z';
    rad(1629, 400, 420, '#FFB866', .55, 'screen', .3);
    fill(shadeD, lin(0, 330, 0, 468, [[0, '#FFE6B4'], [.6, '#FFD48E'], [1, '#FFC173']]));
    brush({ clip: shadeD, x: 1520, y: 326, w: 220, h: 146, n: 40, seed: 70, len: [30, 70], wid: [3, 7], ang: 1.35, angJ: .3, a: [.08, .18], col: (x, y, h) => h < .5 ? '#FFF6DA' : '#F0A860' });
    stroke(shadeD, '#A8643A', 1.8); stroke('M 1524 468 L 1734 468', '#C27A44', 3);
    rad(1629, 480, 150, '#FFE3A8', .6, 'screen');
    // kettle (enamel, cream with a red knob) + steam
    const kx = 1500, ky = 588;
    const body = `M ${kx - 44} ${ky} C ${kx - 52} ${ky - 30} ${kx - 40} ${ky - 58} ${kx} ${ky - 60} C ${kx + 40} ${ky - 58} ${kx + 52} ${ky - 30} ${kx + 44} ${ky} Z`;
    stroke(`M ${kx - 26} ${ky - 54} C ${kx - 24} ${ky - 96} ${kx + 24} ${ky - 96} ${kx + 26} ${ky - 54}`, C.woodLn, 6); stroke(`M ${kx - 26} ${ky - 54} C ${kx - 24} ${ky - 96} ${kx + 24} ${ky - 96} ${kx + 26} ${ky - 54}`, '#3A3A48', 3.2);
    shape(`M ${kx - 40} ${ky - 30} C ${kx - 60} ${ky - 36} ${kx - 72} ${ky - 56} ${kx - 80} ${ky - 62} L ${kx - 74} ${ky - 68} C ${kx - 64} ${ky - 60} ${kx - 52} ${ky - 50} ${kx - 38} ${ky - 46} Z`, '#E8DCC4', C.woodLn, 1.4);
    shape(body, '#EFE3CB', C.woodLn, 1.8); offShade(body, '#C9A98E', 12, -6);
    fill(`M ${kx - 46} ${ky - 14} L ${kx + 46} ${ky - 14} L ${kx + 45} ${ky - 6} L ${kx - 45} ${ky - 6} Z`, '#5A7A9A', .85);
    shape(ell(kx, ky - 60, 20, 6), '#D9CDB2', C.woodLn, 1.2); shape(ell(kx, ky - 68, 7, 6), '#C8503E', C.woodLn, 1.2);
    fill(ell(kx + 22, ky - 36, 7, 12, .5), '#FFFFFF', .55);
    for (let i = 0; i < 3; i++) {
      const ph = frac(t * .25 + i / 3), sx = kx - 80 - ph * 20, syy = ky - 70 - ph * 150, sp = [];
      for (let k = 0; k <= 8; k++) sp.push([sx + Math.sin(k * .8 + t * 1.2 + i * 2) * 10 * (k / 8 + .3), syy - k * 12]);
      stroke(spline(sp, false), '#FFF2DA', 6 - ph * 3, .18 * Math.sin(ph * Math.PI));
    }
    // mug
    shape('M 1716 556 L 1756 556 L 1752 588 L 1720 588 Z', '#D46A58', C.woodLn, 1.4); stroke('M 1756 562 C 1770 562 1770 580 1754 580', C.woodLn, 3.2); stroke('M 1756 562 C 1770 562 1770 580 1754 580', '#D46A58', 1.6);
    // monstera leaves at the right edge, lit by the lamp
    const monst = [[1830, 740, 170, 72, -2.4], [1880, 640, 160, 70, -2.0], [1900, 520, 150, 64, -1.75], [1790, 860, 140, 60, -2.8]];
    for (const [x, y, l, w, a] of monst) {
      const d = leafPath(x, y, l, w, a); fill(d, '#4E7A4A'); offShade(d, '#2F5236', 10, 8); stroke(d, C.leafLn, 1.6);
      const c = Math.cos(a), s = Math.sin(a);
      for (let k = 1; k < 5; k++) { const qx = x + c * l * k / 5, qy = y + s * l * k / 5; stroke(`M ${qx} ${qy} L ${qx - s * w * .7 + c * 12} ${qy + c * w * .7 + s * 12}`, '#2C4A30', 1.2, .6); }
      stroke(`M ${x} ${y} L ${x + c * l * .9} ${y + s * l * .9}`, '#2C4A30', 1.4, .7);
    }
  }

  // ---------- the couch (dusty rose), knit throw, cushion ----------
  function couchBack(t) {
    const back = 'M -40 640 C 40 606 260 598 560 604 C 760 608 820 614 900 616 C 1100 612 1300 598 1500 600 C 1700 602 1860 610 1980 618 L 1980 900 L -40 900 Z';
    fill(back, lin(0, 0, W, 0, [[0, '#62557A'], [.4, '#86596A'], [.75, C.couch], [1, '#C57C62']]));
    brush({ clip: back, x: -40, y: 590, w: 2020, h: 320, n: 260, seed: 90, len: [40, 110], wid: [5, 12], ang: .05, angJ: .5, a: [.06, .14], col: (x, y, h) => h < .5 ? '#E8A68A' : '#5E3048' });
    // cushion seams
    for (const sx of [760, 1470]) stroke(`M ${sx} 612 C ${sx - 8} 700 ${sx + 6} 780 ${sx - 4} 870`, C.couchLn, 1.8, .6);
    // soft top highlight from window (left) and lamp (right)
    stroke('M 0 634 C 80 610 260 604 560 610', '#C7B0D8', 3, .35); stroke('M 1300 606 C 1500 606 1700 608 1920 620', '#FFD2A0', 3, .45);
    stroke(back, C.couchLn, 2);
    // knit throw draped over the back (behind the shoggoth)
    const knit = 'M 120 612 C 220 596 420 594 560 604 C 566 660 560 720 574 790 C 530 806 480 796 440 808 C 400 820 350 804 300 816 C 250 826 200 810 150 818 C 150 740 128 680 120 612 Z';
    fill(knit, mixCol(C.knit, '#5A5A9A', .25)); offShade(knit, mixCol(C.knitSh, '#3A3A7A', .3), 18, 30);
    clipTo(knit, () => {
      for (let col = 0; col < 12; col++) {   // cable-knit columns: rows of little v stitches
        const cx = 140 + col * 36;
        for (let r = 0; r < 18; r++) { const cy = 610 + r * 12; stroke(`M ${cx - 7} ${cy} L ${cx} ${cy + 7} L ${cx + 7} ${cy}`, mixCol(C.knitLn, '#3A3A6A', .3), 1.1, .45); }
        stroke(`M ${cx + 18} 600 L ${cx + 18} 830`, mixCol(C.knitSh, '#3A3A7A', .3), 2, .5);
      }
    });
    stroke(knit, mixCol(C.knitLn, '#3A3A6A', .3), 1.8);
    for (let i = 0; i < 22; i++) { const fx = 156 + i * 19, fy = 816 - Math.sin(i * .9) * 8; stroke(`M ${fx} ${fy} L ${fx - 2 + Math.sin(t + i) * 1.5} ${fy + 20}`, mixCol(C.knitLn, '#3A3A6A', .3), 2.2, .7); }
    // throw cushion (mustard, small flowers) behind his back
    const cush = 'M 1452 648 C 1520 628 1600 630 1664 646 C 1672 720 1668 800 1660 856 C 1590 864 1520 866 1456 858 C 1446 790 1444 720 1452 648 Z';
    fill(cush, '#D4A04E'); offShade(cush, '#A06A3A', 16, 18);
    clipTo(cush, () => { for (let i = 0; i < 16; i++) { const fx = 1470 + (i % 4) * 52 + (Math.floor(i / 4) % 2) * 26, fy = 670 + Math.floor(i / 4) * 52; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; fill(ell(fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 4, 4), '#F6E7C0', .75); } fill(ell(fx, fy, 3, 3), '#B8543A', .8); } });
    stroke(cush, '#6A4020', 1.8);
  }
  function couchFront(t) {
    // rolled left arm
    const arm = 'M 30 720 C 26 668 80 646 150 648 C 222 650 262 676 262 716 L 268 1090 L 22 1090 Z';
    fill(arm, lin(0, 640, 0, 1080, [[0, '#836482'], [.25, '#735672'], [1, '#48304F']]));
    brush({ clip: arm, x: 20, y: 640, w: 250, h: 450, n: 90, seed: 95, len: [40, 90], wid: [5, 10], ang: 1.4, angJ: .4, a: [.06, .14], col: (x, y, h) => h < .5 ? '#C890A8' : '#4A2440' });
    const roll = ell(146, 700, 112, 42, -.02); fill(roll, '#8E7090'); offShade(roll, '#6A4E6E', 0, -14);
    stroke(roll, C.couchLn, 1.8); stroke('M 146 700 C 130 694 128 712 146 714 C 166 716 170 690 146 684', C.couchLn, 1.4, .6);
    stroke(arm, C.couchLn, 2);
    stroke('M 40 690 C 70 666 130 658 200 664', '#D8C4E8', 3, .35);
    // seat cushion top + front
    const seat = 'M 262 846 C 700 836 1300 836 1980 842 L 1980 912 L 262 912 Z';
    fill(seat, lin(0, 0, W, 0, [[0, '#7A6282'], [.5, '#9A6066'], [1, '#C07A60']])); stroke('M 262 846 C 700 836 1300 836 1980 842', '#E8B8A0', 2.4, .35);
    const front = 'M 262 912 L 1980 912 L 1980 1090 L 262 1090 Z';
    fill(front, lin(0, 912, 0, 1080, [[0, '#6E4A62'], [1, '#3E2640']]));
    stroke('M 262 912 C 700 916 1300 916 1980 912', C.couchLn, 2); stroke('M 262 846 C 700 836 1300 836 1980 842', C.couchLn, 1.6, .7);
    brush({ clip: front, x: 262, y: 910, w: 1720, h: 180, n: 120, seed: 97, len: [50, 120], wid: [5, 10], ang: .02, angJ: .3, a: [.05, .12], col: (x, y, h) => h < .5 ? '#B87A8A' : '#3A1A34' });
    stroke('M 1020 912 C 1016 980 1024 1040 1020 1090', C.couchLn, 1.6, .5);
  }

  // =====================================================================================
  // THE SHOGGOTH — a sleepy forest-spirit version: cloud-scalloped sage body, crooked horn limbs, one spiral,
  // pointed little legs tucked under, many almond eyes shut, the mask cradled on its little arm like a pillow.
  // =====================================================================================
  // cloud outline: round bumps between points on an ellipse (flattened where it rests on the cushion)
  function cloud(cx, cy, rx, ry, N, floorY, seed, bumpK = 1) {
    const pts = [];
    for (let i = 0; i < N; i++) { const a = Math.PI * .5 + (i + .5) / N * TAU; pts.push([cx + Math.cos(a) * rx * (1 + .05 * Math.sin(i * 2.3 + seed)), Math.min(cy + Math.sin(a) * ry * (1 + .05 * Math.cos(i * 1.7 + seed)), floorY)]); }
    const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < N; i++) {
      const a = pts[i], b = pts[(i + 1) % N], tx = b[0] - a[0], ty = b[1] - a[1], len = Math.hypot(tx, ty) || 1, nx = ty / len, ny = -tx / len;
      const flat = a[1] >= floorY - .5 && b[1] >= floorY - .5, h = flat ? 3 : len * (.42 + .16 * hash(i * 3.7 + seed)) * bumpK;
      p.bezierCurveTo(a[0] + nx * h - tx * .08, a[1] + ny * h - ty * .08, b[0] + nx * h + tx * .08, b[1] + ny * h + ty * .08, b[0], b[1]);
    }
    p.closePath(); return p;
  }
  function sleepyShoggoth(t) {
    const cx = 432, cy = 764, br = Math.sin(t * 1.4) * .5 + .5, rx = 170 + br * 2, ry = 104 + br * 3, floorY = 850;
    // contact shadow on the seat
    fill(ell(cx + 10, floorY + 4, 200, 16), '#2A1430', .35);
    // limbs behind the body: crooked horn (upper left), a little horn, and the spiral curl (right)
    const horn = [[326, 690], [306, 652], [298, 620], [314, 596], [318, 570], [302, 546]];
    const hornP = taper(horn, k => 18 * (1 - k * .9)); fill(hornP, C.shog); offShade(hornP, C.shogSh, 6, 0); stroke(hornP, C.shogLn, 2.2);
    const horn2 = [[498, 676], [508, 644], [526, 628], [532, 606]];
    const horn2P = taper(horn2, k => 13 * (1 - k * .85)); fill(horn2P, C.shog); offShade(horn2P, C.shogSh, 5, 0); stroke(horn2P, C.shogLn, 2);
    const spiral = [], scx = 640, scy = 690;
    for (let i = 0; i <= 44; i++) { const s = i / 44, a = 2.35 - s * 2.1 * Math.PI, r = 84 * Math.pow(1 - s, .85) + 9; spiral.push([scx + Math.cos(a) * r, scy + Math.sin(a) * r * .9]); }
    const spP = taper(spiral, k => 21 * Math.pow(1 - k, .8) + 2.2); fill(spP, C.shog); offShade(spP, C.shogSh, 4, -7); stroke(spP, C.shogLn, 2.2);
    // body
    const body = cloud(cx, cy, rx, ry, 13, floorY, 1.3);
    fill(body, C.shog);
    clipTo(body, () => {
      fill(`M 200 ${cy + 16} C 300 ${cy + 64} 520 ${cy + 70} 700 ${cy - 10} L 700 900 L 200 900 Z`, C.shogSh);
      fill(`M 560 ${cy - 140} C 600 ${cy - 60} 610 ${cy} 590 ${cy + 40} L 700 ${cy + 40} L 700 ${cy - 140} Z`, C.shogSh, .8);
      fill(ell(cx - 70, cy - 86, 130, 34, -.12), C.shogHi, .7);
      brush({ x: cx - rx - 20, y: cy - ry - 40, w: rx * 2 + 40, h: ry * 2 + 50, n: 90, seed: 120, len: [16, 40], wid: [3, 7], ang: -.3, angJ: 1.2, a: [.05, .12], col: (x, y, h) => h < .5 ? '#E4F0CE' : '#4E6A4E' });
    });
    stroke(body, C.shogLn, 2.4);
    // eyes: all shut in sleep, one peeking just barely
    const eyes = [[cx + 6, cy + 4, 40, .04, 1], [cx - 94, cy - 40, 20, -.3, 0], [cx + 98, cy - 50, 19, .25, 0], [cx - 70, cy + 46, 13, -.2, 0], [cx + 84, cy + 44, 14, .2, 0], [cx - 4, cy - 70, 11, .08, 0], [cx + 144, cy + 4, 11, .35, 2]];
    for (const [ex, ey, er, rot, kind] of eyes) sleepyEye(ex, ey, er, rot, kind, t);
    for (const bx of [-44, 56]) fill(ell(cx + bx, cy + 34, 16, 7), '#E88A8A', .28);
    // pointed little legs, tucked like a cat's paws
    for (const [lx, dx] of [[380, -16], [548, -12]]) { const d = `M ${lx - 14} ${floorY - 12} C ${lx - 16} ${floorY - 2} ${lx + dx - 10} ${floorY + 8} ${lx + dx - 12} ${floorY + 10} C ${lx + dx + 4} ${floorY + 10} ${lx + 12} ${floorY + 4} ${lx + 14} ${floorY - 10} Z`; fill(d, C.shogSh); stroke(d, C.shogLn, 1.8); }
    // the little arm, with the mask resting on it like a pillow
    const armP = taper([[322, 820], [290, 838], [252, 842], [218, 832], [200, 814]], k => 14 * (1 - k * .5));
    fill(armP, C.shog); offShade(armP, C.shogSh, 0, -6); stroke(armP, C.shogLn, 2.2);
    maskFace(258, 790, 44, -.5, { blush: .45, lw: 2.2 });
    const hand = 'M 204 822 C 190 812 186 794 194 784 C 204 786 210 798 210 812 Z'; fill(hand, C.shog); stroke(hand, C.shogLn, 2);
    rad(cx - 40, cy - 70, 180, '#CFE4FF', .07 + br * .03, 'screen');
  }
  function sleepyEye(x, y, r, rot, kind, t) {
    X.save(); X.translate(x, y); X.rotate(rot);
    const lid = `M ${-r} 0 C ${-r * .6} ${-r * .72} ${r * .6} ${-r * .72} ${r} 0 C ${r * .6} ${r * .55} ${-r * .6} ${r * .55} ${-r} 0 Z`;
    fill(lid, C.shogLid, .9); stroke(lid, C.shogLn, 1.1, .35);
    if (kind === 2) {   // peeking: a sliver of white under a heavy lid
      const sl = `M ${-r * .8} ${r * .12} C ${-r * .4} ${r * .42} ${r * .4} ${r * .42} ${r * .8} ${r * .12} C ${r * .4} ${r * .22} ${-r * .4} ${r * .22} ${-r * .8} ${r * .12} Z`;
      fill(sl, '#FFFDF0'); clipTo(sl, () => fill(ell(r * .1, r * .3, r * .3, r * .25), '#2A2A22'));
    }
    stroke(`M ${-r} ${r * .02} C ${-r * .55} ${r * .5} ${r * .55} ${r * .5} ${r} ${r * .02}`, C.shogLn, Math.max(1.6, r * .085));
    if (r > 12) for (let i = -1; i <= 1; i++) { const u = i * .45, lx = u * r, ly = r * .38 * (1 - u * u * .6); stroke(`M ${lx} ${ly} L ${lx + u * r * .18} ${ly + r * .2}`, C.shogLn, Math.max(1.2, r * .055)); }
    X.restore();
  }
  // the smiley mask (his lopsided oval, dash eyes, smile higher on the right)
  const MASK = 'M168 255 C183 238 207 241 217 257 C228 274 218 304 204 313 C188 323 167 312 161 299 C155 286 159 268 168 255 Z';
  function maskFace(x, y, r, rot, o = {}) {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(r / 37, r / 37); X.translate(-191, -279);
    const lw = (o.lw ?? 2) * 37 / r;
    fill(MASK, C.mask); offShade(MASK, C.maskSh, -6, -7); stroke(MASK, C.maskLn, lw);
    X.translate(191, 279);
    fill(ell(-10, -14, 12, 8, -.4), '#FFFFF0', .45);
    for (const [ex, ey] of [[-15, -11], [12, -12]]) stroke(`M ${ex - .4} ${ey - 4.5} L ${ex + .4} ${ey + 4.5}`, C.maskLn, lw * 1.35);
    if (o.blush) for (const bx of [-21, 20]) fill(ell(bx, 3, 6, 3.2), '#F29A8A', .5 * o.blush);
    stroke('M -16 11 C -10 20 -1 20 5 18 C 10 16 13 11 14 6', C.maskLn, lw * 1.3);
    X.restore();
  }

  // =====================================================================================
  // HIM — the researcher. Head is built in a local frame (0,0 ≈ skull centre, face toward −x), tilted down-left.
  // =====================================================================================
  const HEAD = { x: 1080, y: 358, rot: -.1, s: 1.11 };
  const FACE = 'M -80 -60 C -88 -34 -93 -6 -91 20 C -90 46 -82 70 -66 90 C -54 104 -42 112 -27 113 C -8 114 18 102 40 84 C 56 70 64 52 66 30 L 70 -70 Z';
  const NECK = 'M -4 88 C 0 110 -2 128 -8 150 L 96 150 C 84 124 74 100 64 50 Z';
  const EAR = 'M 54 -2 C 64 -14 86 -10 86 10 C 86 30 76 46 60 48 C 55 32 53 14 54 -2 Z';
  const HAIR = 'M -98 2 C -104 -24 -108 -52 -100 -76 C -106 -94 -94 -110 -74 -114 C -66 -128 -44 -136 -26 -134 C -12 -143 16 -143 30 -136 ' +
    'C 50 -138 74 -131 86 -118 C 104 -114 118 -100 116 -82 C 126 -60 128 -30 122 -2 ' +
    'C 128 10 134 24 140 36 C 128 33 118 30 112 28 C 118 42 120 56 118 70 C 108 62 100 57 94 52 C 94 64 92 77 86 88 C 82 76 78 67 74 60 ' +
    'C 84 40 88 18 84 -4 C 74 -18 58 -16 50 -6 C 48 8 46 22 44 36 C 38 24 34 12 34 2 C 30 -8 26 -18 24 -26 ' +
    'C 22 -16 18 -10 10 -4 C 8 -16 4 -26 0 -32 C -6 -24 -12 -18 -20 -14 C -22 -26 -24 -32 -28 -38 C -36 -28 -44 -18 -50 -8 ' +
    'C -52 -22 -54 -30 -58 -38 C -64 -30 -70 -24 -76 -18 C -78 -28 -80 -34 -84 -38 C -90 -28 -96 -14 -98 2 Z';
  const COWLICK = 'M 6 -132 C 2 -154 16 -176 44 -180 C 32 -170 30 -156 34 -142 C 40 -154 52 -160 66 -158 C 54 -150 46 -140 46 -128 Z';
  const TUFTS = [];
  function headFrame(fn) { X.save(); X.translate(HEAD.x, HEAD.y); X.rotate(HEAD.rot); X.scale(HEAD.s, HEAD.s); fn(); X.restore(); }

  function neck() {
    headFrame(() => {
      fill(NECK, '#A87686'); clipTo(NECK, () => { fill('M -30 100 C -20 120 -24 140 -30 160 L -6 160 C -2 130 -2 116 -6 104 Z', '#D9B4B4', .8); fill('M -10 84 C 10 110 40 116 70 100 L 100 150 L 110 40 Z', '#9A6A7E', .7); });
      clipTo(NECK, () => stroke('M 66 50 C 74 100 84 124 98 150', '#F2A87E', 7, .55)); stroke(NECK, C.skinLn, 1.8);
    });
  }
  function head(t) {
    headFrame(() => {
      // cowlick sits under the hair mass (its root hidden)
      fill(COWLICK, C.hair); clipTo(COWLICK, () => fill('M 0 -190 L 30 -190 L 30 -130 L 0 -130 Z', C.hairHi, .6)); stroke(COWLICK, C.hairLn, 2);
      // skin
      fill(FACE, C.skin);
      clipTo(FACE, () => {
        X.save(); X.translate(6, 12); fill(HAIR, C.skinSh, .85); X.restore();                 // shadow under the fringe
        fill('M 30 -40 C 22 -4 30 48 14 104 L 90 120 L 100 -40 Z', C.skinSh);                  // side away from the screen
        const g = X.createRadialGradient(-200, 260, 60, -200, 260, 380); g.addColorStop(0, 'rgba(190,232,255,.5)'); g.addColorStop(1, 'rgba(190,232,255,0)');
        X.globalCompositeOperation = 'soft-light'; X.fillStyle = g; X.fillRect(-140, -80, 260, 220);
        const g3 = X.createRadialGradient(-150, 190, 20, -150, 190, 250); g3.addColorStop(0, 'rgba(170,225,255,.42)'); g3.addColorStop(1, 'rgba(170,225,255,0)');
        X.globalCompositeOperation = 'screen'; X.fillStyle = g3; X.fillRect(-140, -80, 260, 220); X.globalCompositeOperation = 'source-over';
        for (const [bx, by, brx] of [[-80, 62, 13], [-12, 64, 19]]) {                          // blush with a few hatch strokes
          const g2 = X.createRadialGradient(bx, by, 0, bx, by, brx); g2.addColorStop(0, rgba(C.blush, .6)); g2.addColorStop(1, rgba(C.blush, 0));
          X.fillStyle = g2; X.save(); X.translate(bx, by); X.scale(1, .55); X.translate(-bx, -by); X.fillRect(bx - brx, by - brx, brx * 2, brx * 2); X.restore();
          for (let i = -1; i <= 1; i++) stroke(`M ${bx + i * brx * .38 + 3} ${by - 4} L ${bx + i * brx * .38 - 2} ${by + 4}`, '#D86A6A', 1.1, .5);
        }
      });
      stroke('M -88 -20 C -92 10 -90 40 -80 66 C -72 84 -60 100 -44 110', '#DDF4FF', 2.4, .6);   // cool rim on the far cheek
      stroke(FACE, C.skinLn, 2);
      fill(EAR, C.skin); offShade(EAR, C.skinSh, -6, -4); clipTo(EAR, () => stroke('M 84 -6 C 90 10 86 32 70 48', '#FFC08A', 6, .6)); stroke(EAR, C.skinLn, 1.8);
      stroke('M 64 6 C 74 2 78 16 72 26 C 69 31 67 34 68 38', C.skinLn, 1.4, .8);
      // eyes: dark ovals, one highlight, lids lowered to the screen, sad slant
      eye(-14, 33, 10.5, 16.5, false); eye(-72, 30, 7.6, 15.5, true);
      // nose + mouth: a small, sad half-smile
      stroke('M -52 54 Q -61 63 -53 68', C.skinLn, 1.7);
      fill('M -51 56 Q -45 62 -49 68 Q -52 66 -52 64 Z', C.skinSh, .7);
      stroke('M -57 92 Q -50 94.5 -43 92.5 Q -40 91.5 -37.5 88.5', C.skinLn, 2);
      stroke('M -54 99 Q -50 101 -45 99', C.skinLn, 1.2, .45);
      stroke('M 18 27 L 58 14', '#3A2A3A', 2.4);                                                    // glasses arm into the hair
      hair(t);
      // brows over the fringe: inner ends lifted (worried), a small crease between
      stroke('M -36 -14 Q -24 -13 -13 -8 Q -3 -3 6 -1', C.hair, 3.4, .95);
      stroke('M -56 -13 Q -68 -10 -78 -5 Q -84 -1 -88 2', C.hair, 3, .95);
      glasses();
    });
  }
  function eye(x, y, rx, ry, far) {
    const o = ell(x, y, rx, ry), inner = far ? 1 : -1;       // inner corner is toward the nose (x ≈ -46)
    const xin = x + inner * rx * 1.2, xout = x - inner * rx * 1.35, yin = y - ry * .38, yout = y - ry * .02;
    const lid = `M ${xin} ${yin} C ${x + inner * rx * .5} ${y - ry * .74} ${x - inner * rx * .7} ${y - ry * .6} ${xout} ${yout}`;
    X.save(); X.clip(o);
    fill(o, '#2A1F2E');
    fill(ell(x + rx * .1, y + ry * .7, rx * .7, ry * .24), '#556890', .45);            // faint screen reflection: wet, glassy
    fill(`${lid} L ${xout} ${y - ry * 3} L ${xin} ${y - ry * 3} Z`, C.skin);            // lowered upper lid (skin)
    fill(ell(x - rx * .3, y + ry * .02, rx * .34, ry * .2), '#FFFFFF', .95);           // the one highlight
    X.restore();
    stroke(lid, '#2A1C26', far ? 2.8 : 3.4);
    stroke(`M ${xout} ${yout} L ${xout - inner * 5} ${yout + 4}`, '#2A1C26', 2);          // outer lash flick
    stroke(`M ${x - rx * .6} ${y + ry * 1.1} Q ${x} ${y + ry * 1.2} ${x + rx * .6} ${y + ry * 1.08}`, C.skinLn, 1.2, .4);
  }
  function glasses() {
    const near = ell(-14, 32, 29, 29), far = ell(-73, 29, 17, 28, .03);
    for (const [p, cx] of [[near, -14], [far, -73]]) { X.save(); X.translate(0, 3);
      fill(p, '#CFEFFF', .1); clipTo(p, () => fill(`M ${cx - 40} 40 C ${cx - 10} 52 ${cx + 20} 50 ${cx + 40} 44 L ${cx + 40} 80 L ${cx - 40} 80 Z`, '#BFE8FF', .28));
      clipTo(p, () => { fill(`M ${cx - 40} 62 L ${cx - 10} 2 L ${cx + 2} 2 L ${cx - 28} 62 Z`, '#FFFFFF', .2); fill(`M ${cx - 14} 62 L ${cx + 8} 16 L ${cx + 13} 16 L ${cx - 9} 62 Z`, '#FFFFFF', .12); });
      X.restore(); stroke(p, '#3A2A3A', 2.3);
    }
    stroke('M -43 27 Q -49 20 -56 26', '#3A2A3A', 2.3);
  }
  function hair(t) {
    for (const d of TUFTS) { fill(d, C.hair); stroke(d, C.hairLn, 2); }
    fill(HAIR, C.hair);
    clipTo(HAIR, () => {
      fill('M 40 -30 C 70 -40 100 -30 140 -10 L 150 100 L 60 100 Z', C.hairSh, .9);                 // nape
      fill('M -110 -44 C -80 -34 -40 -46 12 -36 L 30 -10 L -110 10 Z', C.hairSh, .6);               // under the fringe mass
      fill('M -86 -94 C -64 -118 -26 -128 16 -124 L 8 -118 L 0 -112 L -10 -114 L -22 -106 L -34 -108 L -48 -98 L -58 -100 L -72 -80 Z', C.hairHi, .45);      // cool sheen from the window
      stroke('M 104 -104 C 116 -96 118 -90 116 -82 C 126 -60 128 -30 122 -2', C.hairRim, 6, .35);
      for (const d of ['M -22 -124 Q -30 -84 -40 -40 Q -24 -84 -12 -122 Z', 'M 40 -126 Q 58 -84 62 -40 Q 50 -84 50 -128 Z', 'M 82 -114 Q 104 -74 110 -34 Q 94 -74 90 -116 Z', 'M -64 -110 Q -76 -84 -86 -50 Q -70 -84 -56 -112 Z']) fill(d, C.hairSh, .9);                               // lamp rim along the back
    });
    stroke(HAIR, C.hairLn, 2.2);
    for (const d of ['M -6 -104 Q -14 -56 -18 -22', 'M -40 -100 Q -48 -54 -50 -16', 'M 30 -112 Q 16 -62 10 -12', 'M 72 -100 Q 94 -44 96 18', 'M -70 -84 Q -80 -52 -82 -40', 'M 96 -66 Q 112 -14 112 28', 'M -74 -114 Q -80 -102 -84 -92', 'M 86 -118 Q 90 -108 96 -100', 'M -26 -134 Q -28 -124 -32 -116'])
      stroke(d, C.hairLn, 1.4, .5);
  }

  // ---------- body: bomber, shirt, pin, arms, hands ----------
  const TORSO = 'M 1080 494 C 1040 502 1000 514 982 532 C 962 552 954 592 952 642 C 950 722 956 800 964 872 L 1300 906 C 1350 820 1374 700 1370 600 C 1366 560 1346 530 1314 514 C 1282 500 1250 494 1222 490 Z';
  const SLEEVE_N = 'M 1236 504 C 1292 494 1346 510 1372 550 C 1394 588 1410 650 1424 710 C 1438 766 1450 812 1438 850 C 1424 888 1386 904 1336 909 C 1298 912 1262 911 1236 910 L 1228 852 C 1264 846 1306 830 1342 810 C 1352 776 1344 736 1332 696 C 1318 646 1292 598 1252 556 Z';
  const SLEEVE_F = 'M 996 526 C 964 536 948 572 944 626 C 938 692 938 756 948 800 C 960 836 990 856 1022 866 L 1048 834 C 1020 816 1004 790 1000 750 C 996 700 1004 630 1014 576 Z';
  function body(t) {
    // pants / lap (the laptop rests here): near thigh toward the camera, far knee just peeking
    const farKnee = 'M 930 922 C 876 914 836 922 818 946 L 900 960 Z';
    fill(farKnee, C.pantsSh); stroke(farKnee, C.pantsLn, 1.6);
    const lap = 'M 1330 898 C 1200 904 1030 914 910 926 C 850 932 812 954 800 992 C 794 1030 800 1060 806 1090 L 968 1090 C 958 1070 956 1054 964 1044 C 1070 1052 1210 1036 1330 1008 C 1410 990 1452 966 1448 934 C 1436 908 1384 898 1330 898 Z';
    fill(lap, C.pants);
    clipTo(lap, () => {
      fill('M 780 1004 C 900 1000 1100 996 1300 978 C 1380 970 1430 960 1460 940 L 1500 1100 L 780 1100 Z', C.pantsSh); fill('M 806 1000 C 830 1010 900 1040 968 1044 L 968 1100 L 790 1100 Z', '#1A1B30', .6); fill('M 1400 904 C 1430 912 1446 926 1448 940 L 1470 940 L 1470 900 Z', C.jkRim, .3);
      fill('M 800 992 C 812 954 850 932 910 926 C 1030 914 1200 904 1330 898 L 1330 940 C 1200 946 1000 956 900 970 C 850 976 820 990 806 1010 Z', '#5760A0', .6);   // screen light along the thigh
      stroke('M 1200 950 C 1240 960 1280 976 1300 996', C.pantsLn, 1.4, .5); stroke('M 850 996 C 900 990 960 1000 1010 1020', C.pantsLn, 1.4, .45); stroke('M 812 1004 C 840 1030 900 1044 962 1046', C.pantsLn, 1.6, .7);
    });
    stroke(lap, C.pantsLn, 2);
    rad(830, 960, 170, '#8FD0FF', .16, 'screen');
    // torso
    fill(TORSO, C.jk);
    clipTo(TORSO, () => {
      fill('M 1214 520 C 1256 600 1296 740 1296 910 L 1420 910 L 1420 480 Z', C.jkSh);                               // side under the near arm
      fill('M 940 790 C 1000 814 1090 822 1190 808 L 1200 920 L 930 920 Z', C.jkSh, .9);                                // hunched belly fold
      fill('M 1080 496 C 1050 530 1020 580 996 650 L 948 610 C 970 548 1020 510 1080 496 Z', C.jkHi, .75);             // screen-lit chest edge
      brush({ x: 940, y: 470, w: 440, h: 440, n: 50, seed: 150, len: [30, 70], wid: [3, 7], ang: 1.2, angJ: .8, a: [.05, .1], col: (x, y, h) => h < .5 ? '#8A8AE0' : '#1A1540' });
    });
    stroke(TORSO, C.jkLn, 2.2);
    // shirt in the open front + jacket front edges (a zipper tab on the near edge)
    const shirt = 'M 1078 512 L 1116 518 C 1110 640 1106 760 1108 886 L 1034 886 C 1044 760 1060 624 1078 512 Z';
    fill(shirt, C.shirt); clipTo(shirt, () => { fill('M 1056 500 L 1086 500 L 1058 900 L 1028 900 Z', '#3C3C5E', .6); fill('M 1070 510 C 1090 540 1110 548 1120 540 L 1120 500 Z', '#1C1A28', .6); });
    stroke('M 1078 512 C 1060 624 1044 760 1034 886', C.jkLn, 2); stroke('M 1116 518 C 1110 640 1106 760 1108 886', C.jkLn, 2);
    stroke('M 1120 526 C 1114 640 1110 760 1112 880', '#8E90D8', 1.4, .5);
    shape('M 1112 700 L 1122 700 L 1122 722 L 1112 722 Z', '#C9C4D8', C.jkLn, 1.2);
    const band = 'M 962 862 L 1150 878 L 1152 916 L 964 904 Z'; ribbed(band, 962, 1152, 868, 906);
    // pin: tiny yellow smiley on the chest
    fill(ell(1170, 614, 12, 12), '#F2D84A'); stroke(ell(1170, 614, 12, 12), '#8A6A1E', 1.6);
    stroke('M 1166 608 L 1166 613 M 1174 608 L 1174 613', '#5A4418', 1.6); stroke('M 1164 618 Q 1170 624 1177 616', '#5A4418', 1.5);
    fill(ell(1166, 609, 3, 2), '#FFFFFF', .6);
    for (const d of ['M 1004 660 Q 1022 716 1018 772', 'M 1190 620 Q 1214 676 1220 736', 'M 1070 826 Q 1120 840 1180 830', 'M 1140 540 Q 1180 560 1220 556']) stroke(d, C.jkLn, 1.4, .5);
    // far sleeve (his right arm, reaching for the keyboard)
    fill(SLEEVE_F, C.jk); offShade(SLEEVE_F, C.jkSh, -10, -6); clipTo(SLEEVE_F, () => fill('M 930 600 C 940 700 950 780 1000 850 L 900 900 L 900 600 Z', C.jkHi, .75)); stroke(SLEEVE_F, C.jkLn, 2.2);
    stroke('M 952 704 Q 966 742 990 754 M 960 600 Q 976 620 1000 624', C.jkLn, 1.3, .5);
  }
  function ribbed(d, x0, x1, y0, y1) {
    fill(d, C.rib); offShade(d, C.ribSh, 0, -6);
    clipTo(d, () => { for (let x = x0; x < x1; x += 7) stroke(`M ${x} ${y0 - 20} L ${x + 2} ${y1 + 20}`, C.ribSh, 1.4, .7); });
    stroke(d, C.ribLn, 1.8);
  }
  function collar() {   // back half of the rib collar (behind the neck)
    const back = 'M 1100 494 C 1124 462 1186 446 1236 452 C 1250 466 1250 492 1240 510 C 1196 500 1140 502 1104 514 Z';
    fill(back, C.ribSh); clipTo(back, () => { for (let x = 1100; x < 1250; x += 7) stroke(`M ${x} 456 L ${x - 2} 520`, '#8A3C18', 1.2, .6); }); stroke(back, C.ribLn, 1.8);
  }
  function collarFront() {
    const front = 'M 1048 504 C 1054 492 1068 488 1080 494 C 1120 514 1186 512 1228 496 C 1240 492 1246 504 1242 516 C 1208 548 1128 554 1078 534 C 1062 526 1050 516 1048 504 Z';
    fill(front, C.rib); offShade(front, C.ribSh, 0, -7);
    clipTo(front, () => { for (let i = 0; i < 30; i++) { const x = 1050 + i * 6.4; stroke(`M ${x} 484 L ${x - 3} 556`, C.ribSh, 1.3, .7); } });
    stroke(front, C.ribLn, 1.8);
  }
  function nearArm(t) {
    fill(SLEEVE_N, C.jk);
    clipTo(SLEEVE_N, () => {
      fill('M 1252 556 C 1292 598 1318 646 1332 696 C 1344 736 1352 776 1342 810 L 1376 798 C 1378 756 1368 706 1354 664 C 1336 614 1306 572 1266 540 Z', C.jkSh);          // inner side of the upper arm
      fill('M 1342 810 C 1370 830 1410 842 1450 830 L 1450 940 L 1220 940 L 1220 866 C 1262 864 1304 850 1342 828 Z', C.jkSh);                                            // elbow + forearm underside
      stroke('M 1250 503 C 1292 494 1346 510 1372 550 C 1394 588 1410 650 1424 710 C 1438 766 1450 812 1438 850', '#F0A06C', 12, .55);   // warm lamp rim
      fill('M 1228 852 C 1264 846 1306 830 1342 810 L 1334 798 C 1300 818 1258 834 1224 840 Z', C.jkHi, .9);                                                                // screen light on the forearm
    });
    stroke(SLEEVE_N, C.jkLn, 2.2);
    stroke('M 1348 822 Q 1376 842 1408 846 M 1270 862 Q 1282 880 1276 902 M 1306 842 Q 1316 862 1312 886 M 1368 712 Q 1388 728 1410 730 M 1380 766 Q 1400 784 1424 784', C.jkLn, 1.4, .55);
    stroke('M 1236 506 C 1262 540 1280 580 1292 626', C.jkLn, 1.3, .45);   // raglan seam
    // sleeve pocket (a bomber detail) with a little zipper pull
    shape('M 1330 606 L 1374 598 L 1380 628 L 1336 636 Z', '#3A3690', C.jkLn, 1.4); stroke('M 1336 612 L 1374 605', '#BFC0E0', 1.2, .7); fill(ell(1340, 618, 3, 5), '#C9C4D8');
    ribbed('M 1228 850 L 1236 908 L 1196 912 L 1190 856 Z', 1188, 1238, 850, 912);
    const hand = 'M 1194 856 C 1178 849 1160 851 1146 860 C 1136 866 1128 874 1126 884 C 1124 894 1128 903 1136 908 C 1150 913 1176 913 1198 906 Z';
    fill(hand, C.skin); offShade(hand, C.skinSh, 6, -7); stroke(hand, C.skinLn, 1.8);
    stroke('M 1146 866 Q 1136 874 1132 886 M 1152 876 Q 1140 884 1136 897 M 1160 886 Q 1148 894 1146 906', C.skinLn, 1.2, .7);
    stroke('M 1180 856 C 1170 862 1160 870 1156 878', C.skinLn, 1.1, .45);
    stroke('M 1134 874 Q 1144 862 1162 858', '#FFFFFF', 1.4, .35);
  }
  function farHand() {
    ribbed('M 1016 862 L 1044 830 L 1066 850 L 1040 880 Z', 1010, 1070, 828, 884);
    const hand = 'M 1042 872 C 1050 858 1068 852 1084 857 C 1095 862 1100 874 1097 885 C 1094 894 1084 897 1074 894 C 1062 891 1050 884 1042 878 Z';
    fill(hand, C.skin); offShade(hand, C.skinSh, 5, -6); stroke(hand, C.skinLn, 1.7);
    stroke('M 1084 864 Q 1092 872 1090 884 M 1074 868 Q 1082 878 1080 890', C.skinLn, 1.1, .65); stroke('M 1050 866 Q 1064 856 1082 858', '#FFFFFF', 1.3, .35);
  }

  // ---------- laptop (turned a little toward us so its screen shows) ----------
  const LID = { o: [738, 682], u: [146, 28], v: [60, 214] };
  function laptop(t) {
    const { o, u, v } = LID, P = (a, b) => [o[0] + u[0] * a + v[0] * b, o[1] + u[1] * a + v[1] * b];
    const [A3, B3, B2, A2] = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)];
    const D = [A2[0] + 262, A2[1] - 36], Cc = [B2[0] + 262, B2[1] - 36];
    const deck = `M ${A2[0]} ${A2[1]} L ${D[0]} ${D[1]} L ${Cc[0]} ${Cc[1]} L ${B2[0]} ${B2[1]} Z`;
    const edge = `M ${B2[0]} ${B2[1]} L ${Cc[0]} ${Cc[1]} L ${Cc[0]} ${Cc[1] + 11} L ${B2[0]} ${B2[1] + 11} Z`;
    fill(edge, C.lapSh); stroke(edge, C.lapLn, 1.6);
    fill(deck, C.lap); stroke(deck, C.lapLn, 1.8);
    for (let r = 0; r < 5; r++) { const k = .14 + r * .15, a = [lerp(A2[0], B2[0], k), lerp(A2[1], B2[1], k)]; stroke(`M ${a[0] + 20} ${a[1] - 3} L ${a[0] + 170} ${a[1] - 23}`, C.key, 5, .55); }
    rad(A2[0] + 120, A2[1] - 20, 170, '#BFE8FF', .25, 'screen');
    fill(`M ${B3[0]} ${B3[1]} L ${B3[0] + 7} ${B3[1] + 3} L ${B2[0] + 6} ${B2[1] + 2} L ${B2[0]} ${B2[1]} Z`, '#9296AE');
    const lid = `M ${A3[0]} ${A3[1]} L ${B3[0]} ${B3[1]} L ${B2[0]} ${B2[1]} L ${A2[0]} ${A2[1]} Z`;
    fill(lid, '#2A2D40'); stroke(lid, C.lapLn, 2);
    X.save(); X.transform(u[0] / 160, u[1] / 160, v[0] / 100, v[1] / 100, o[0], o[1]);
    X.beginPath(); X.rect(6, 6, 148, 88); X.clip(); screenUI(t); X.restore();
    const sc = P(.5, .5); rad(sc[0], sc[1], 360, '#9FDCFF', .22, 'screen');
  }
  function screenUI(t) {
    X.fillStyle = lin(0, 0, 0, 100, [[0, '#E9F6FF'], [1, '#C7E6FA']]); X.fillRect(0, 0, 160, 100);
    X.fillStyle = '#D4E8F6'; X.fillRect(0, 0, 160, 11);
    for (const [cx, col] of [[10, '#F28B82'], [16, '#F6C667'], [22, '#9AD39A']]) { X.fillStyle = col; X.beginPath(); X.arc(cx, 6, 1.8, 0, TAU); X.fill(); }
    const rows = [[14, 16, 70, '#FFFFFF'], [46, 31, 100, '#DDEEFA'], [14, 46, 84, '#FFFFFF'], [60, 60, 86, '#DDEEFA']];
    for (const [x, y, w, col] of rows) { X.fillStyle = col; X.beginPath(); X.roundRect(x, y, w, 11, 4); X.fill(); X.fillStyle = '#9BB4C8'; X.fillRect(x + 5, y + 3.5, w * .7, 1.4); X.fillRect(x + 5, y + 7, w * .45, 1.4); }
    // the context bar (the only text in the frame)
    X.fillStyle = 'rgba(255,255,255,.85)'; X.beginPath(); X.roundRect(8, 76, 144, 16, 3); X.fill();
    X.font = '700 9px Rajdhani, sans-serif'; X.textBaseline = 'middle'; X.fillStyle = '#C23A5A'; X.fillText('context 97%', 12, 84.5);
    X.fillStyle = '#F4D2DA'; X.beginPath(); X.roundRect(66, 81.5, 80, 6, 3); X.fill();
    const blink = .85 + .15 * Math.sin(t * 5);
    X.fillStyle = `rgba(255,62,104,${blink})`; X.beginPath(); X.roundRect(66, 81.5, 80 * .97, 6, 3); X.fill();
  }

  // =====================================================================================
  // THE ASSISTANT — a little lamp-lit spirit on his shoulder, mask-head nestled into the crook of his neck
  // =====================================================================================
  function shoulderSpirit(t) {
    const br = Math.sin(t * 1.4 + 1) * .5 + .5, S = [1262, 508], lean = -.78, yel = C.mask, ysh = C.maskSh, yln = C.maskLn;
    rad(1222, 470, 130, '#FFF3A0', .24 + br * .05, 'screen');
    // stubby legs dangling over the front of his shoulder
    for (const [lx, fx, fy] of [[-8, -18, 30], [10, 6, 34]]) {
      const leg = taper([[S[0] + lx, S[1] - 6], [S[0] + lx + 1, S[1] + 10], [S[0] + fx + 3, S[1] + fy - 6], [S[0] + fx, S[1] + fy]], k => 8 - k * .8);
      fill(leg, yel); offShade(leg, ysh, -3, 0); stroke(leg, yln, 1.6);
      const foot = ell(S[0] + fx - 3, S[1] + fy + 2, 8.5, 6, -.35); fill(foot, yel); offShade(foot, ysh, -2, -2); stroke(foot, yln, 1.6);
    }
    X.save(); X.translate(S[0], S[1]); X.rotate(lean);
    const bd = 'M -24 0 C -30 -18 -26 -44 -4 -48 C 18 -50 28 -36 26 -16 C 26 -4 18 4 4 5 C -8 6 -18 5 -24 0 Z';
    fill(bd, yel); offShade(bd, ysh, -8, -3); stroke(bd, yln, 1.8);
    // one arm reaching up around his neck, the other tucked on its tummy
    const armL = taper([[-18, -38], [-26, -52], [-22, -66], [-10, -74]], k => 6 - k * 1.2); fill(armL, yel); offShade(armL, ysh, -2, 0); stroke(armL, yln, 1.5);
    fill(ell(-8, -76, 5.5, 5), yel); stroke(ell(-8, -76, 5.5, 5), yln, 1.4);
    const armR = taper([[20, -34], [26, -20], [18, -8], [6, -6]], k => 6 - k * 1.2); fill(armR, yel); offShade(armR, ysh, -2, 0); stroke(armR, yln, 1.5);
    X.restore();
    const hx = S[0] + 78 * Math.sin(lean), hy = S[1] - 78 * Math.cos(lean);
    maskFace(hx, hy, 37, lean + .22, { blush: 1, lw: 2 });
  }

  function foreground(t) {
    X.save(); X.translate(196, 968); X.scale(1.32, 1.32); X.translate(-170, -948); X.filter = 'blur(1.1px)';
    const top = ell(170, 948, 170, 36);
    stroke('M 70 960 L 52 1090 M 270 960 L 290 1090 M 170 980 L 170 1090', '#2A1820', 16); stroke('M 70 960 L 52 1090 M 270 960 L 290 1090 M 170 980 L 170 1090', '#5A3A30', 10);
    fill('M 0 948 L 340 948 L 340 968 C 300 990 40 990 0 968 Z', '#4A2E28'); fill(top, '#7A5040'); offShade(top, '#4E3028', 0, 10); stroke(top, '#2E1A16', 2);
    brush({ clip: top, x: 0, y: 910, w: 340, h: 80, n: 30, seed: 210, len: [40, 90], wid: [2, 4], ang: 0, angJ: .1, a: [.1, .2], col: (x, y, h) => h < .5 ? '#A87050' : '#3A2018' });
    // two books and a mug of tea, steaming
    shape('M 186 944 L 318 936 L 322 952 L 190 960 Z', '#3F5A70', '#1E2430', 1.6); shape('M 196 928 L 306 922 L 310 938 L 200 944 Z', '#8A4A52', '#2A1820', 1.6);
    stroke('M 204 936 L 300 931', '#E8D8C0', 1, .35);
    const mug = 'M 86 882 L 142 882 L 138 944 C 130 952 98 952 90 944 Z'; fill(mug, '#D9CDB8'); offShade(mug, '#9A8A80', 10, 0); stroke(mug, '#3A2A28', 1.8);
    fill('M 88 904 L 140 904 L 139 914 L 89 914 Z', '#B85A48', .8); fill(ell(114, 883, 28, 6), '#6A3A28'); stroke(ell(114, 883, 28, 6), '#3A2A28', 1.4);
    stroke('M 142 896 C 162 896 162 928 140 926', '#3A2A28', 5); stroke('M 142 896 C 162 896 162 928 140 926', '#D9CDB8', 2.6);
    for (let i = 0; i < 3; i++) { const ph = frac(t * .3 + i / 3), sp = []; for (let k = 0; k <= 8; k++) sp.push([108 + i * 8 + Math.sin(k * .9 + t * 1.3 + i * 2) * 9 * (k / 8 + .2), 874 - ph * 50 - k * 13]); stroke(spline(sp, false), '#EAF2FF', 5 - ph * 2, .16 * Math.sin(ph * Math.PI)); }
    rad(114, 910, 90, '#8FD0FF', .08, 'screen');
    X.filter = 'none'; X.restore();
  }
  // tiny drifting spirit-lights (the two creatures' shared magic)
  function motes(t) {
    const M = [[1170, 560, '#FFF3A8'], [1300, 430, '#FFF3A8'], [1330, 520, '#FFF3A8'], [1150, 470, '#FFF3A8'], [390, 610, '#DDF7C4'], [560, 640, '#DDF7C4'], [300, 700, '#DDF7C4'], [640, 580, '#DDF7C4'], [470, 560, '#DDF7C4']];
    M.forEach(([x0, y0, col], i) => {
      const ph = frac(t * .08 + hash(i) ), x = x0 + Math.sin(t * .7 + i * 1.7) * 10, y = y0 - ph * 50, a = Math.sin(ph * Math.PI);
      rad(x, y, 16, col, .45 * a, 'screen'); fill(ell(x, y, 2.4, 2.4), '#FFFFFF', .85 * a);
    });
  }

  // =====================================================================================
  // FRAME
  // =====================================================================================
  function frame(t) {
    FX.noAuto = true; style(0); FX.grain = .4; FX.bloom = .22; FX.sat = .95;
    X.save();
    LA = .38;
    wall(t); windowView(t); curtains(t); sillThings(t); rightSide(t);
    LA = .6;
    couchBack(t); couchFront(t);
    // gouache texture over the painted background layer
    brush({ x: -40, y: -40, w: W + 80, h: H + 80, n: 2600, seed: 300, len: [18, 60], wid: [3, 9], ang: -.3, angJ: 1.4, a: [.05, .12], comp: 'soft-light', col: (x, y, h) => h < .5 ? '#FFFFFF' : '#000000' });
    LA = 1;
    sleepyShoggoth(t);
    rad(1200, 720, 380, '#1A1030', .28, 'multiply', .5);   // soft occlusion behind him on the couch
    body(t); collar(); neck(); collarFront();
    laptop(t); farHand(); nearArm(t);
    head(t);
    shoulderSpirit(t);
    motes(t); LA = .5; foreground(t); LA = 1;
    // light passes: cool window spill on the left, warm lamp over the right, laptop glow on his face and hands
    X.fillStyle = lin(0, 0, 1100, 0, [[0, 'rgba(70,100,190,.16)'], [1, 'rgba(70,100,190,0)']]); X.globalCompositeOperation = 'screen'; X.fillRect(0, 0, 1100, H); X.globalCompositeOperation = 'source-over';
    rad(1640, 400, 900, '#FF9E50', .16, 'screen', .3);
    rad(880, 760, 520, '#8FD6FF', .16, 'screen', .35);
    // vignette
    const g = X.createRadialGradient(W * .52, H * .5, H * .35, W * .52, H * .5, H * 1.05); g.addColorStop(0, 'rgba(20,12,40,0)'); g.addColorStop(1, 'rgba(20,12,40,.55)');
    X.fillStyle = g; X.fillRect(0, 0, W, H);
    X.restore();
  }

  chapter('cozyanime', K, K + 1, [[K, frame]]);
})();
