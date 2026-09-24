// s_house.js: one key frame for "I Really Want to Stay at Your House", used to preview art styles.
// Rainy night, a small apartment. He's on the couch with the laptop; the little Assistant sits on the laptop lid
// and looks out at the city with him. The shoggoth is curled asleep on the other cushion.
// t in [0,1): watercolour · [1,2): neon (somber grade) · [2,3): neon + hand-drawn doodle overlay (for the doodle style)
(() => {
  const WX = 380, WY = 110, WW = 1160, WH = 600;   // the window
  function outside(x, y, w, h) {
    if (NEON >= .5) vgrad(x, y, w, h, [[0, '#06081A'], [.55, '#141A3E'], [1, '#3A1A4A']]);
    else { wash(rectPts(x - 20, y - 20, w + 40, h + 40, 6), '#1E2A5A', .95, 12, 4); blooms(x, y, w, h, '#2F3C7A', 7, .18, 4); }
    moon(x + w * .78, y + h * .2, 62, {});
    stars(T, 26, { x0: x, y0: y, ext: [w, h * .5], seed: 5, size: .8 });
    X.save(); X.translate(x - 200, y + h - 1000); X.scale(.8, .8);
    city(T, { horizon: 1170, lit: .8, signs: NEON >= .5 ? 1 : 0, street: false, seed: 4, tall: 1.2 });
    X.restore();
    // rain on the glass
    X.save(); tracePath(X, rectPts(x, y, w, h)); X.clip();
    rain(T, { n: 90, ang: .08, len: 34, alpha: NEON >= .5 ? .35 : .3, col: NEON >= .5 ? '#9FC7FF' : '#DDE6F2' });
    for (let i = 0; i < 70; i++) {  // droplets + trails
      const dx = x + hash(i * 3.1) * w, dy = y + hash(i * 5.7) * h, r = 2 + hash(i) * 4;
      paint(ellPts(dx, dy, r, r * 1.2, 8), { fill: NEON >= .5 ? '#BFD8FF' : '#F2F6FA', op: .35, ink: null, flat: true });
      if (hash(i * 9) < .35) line([[dx, dy - r], [dx + 1, dy - r - 20 - hash(i * 2) * 60]], .8, NEON >= .5 ? '#9FC7FF' : '#E8EEF5', .2, .3);
    }
    X.restore();
  }
  function scene(t, neon) {
    style(neon);
    const N = NEON >= .5, inkC = N ? PAL.line : PAL.ink;
    // walls
    if (!N) { X.drawImage(PAPER, 0, 0); wash(rectPts(-40, -40, W + 80, 1160, 10), '#2A2F5C', .95, 20, 4); blooms(0, 0, W, 900, '#1C2048', 8, .2, 2); }
    else vgrad(-10, -10, W + 20, H + 20, [[0, '#0E0B22'], [1, '#1C1336']]);
    // string lights along the top
    const lights = []; for (let i = 0; i <= 20; i++) lights.push([-20 + i * 100, 40 + Math.sin(i * .7) * 16 + (i % 2) * 10]);
    line(lights, 1, N ? '#3A2A5A' : PAL.ink, .5, .8);
    for (let i = 0; i < lights.length; i++) { const [lx, ly] = lights[i], c = ['#FFD27A', '#FF8FB0', '#9FF7FF'][i % 3]; paint(ellPts(lx, ly + 10, 7, 9, 8), { fill: c, ink: null, flat: true }); glow(lx, ly + 10, 50, c, N ? .5 : .35, N ? 'lighter' : 'source-over'); }
    windowFrame(WX, WY, WW, WH, t, { inside: outside });
    // moonlight falling into the room
    glow(960, 760, 900, N ? '#6C7CFF' : '#C9D2F2', N ? .16 : .22, N ? 'lighter' : 'source-over');
    // curtains
    for (const [cx, dir] of [[WX - 20, -1], [WX + WW + 20, 1]]) paint([[cx - 70 * dir, WY - 70], [cx + 50 * dir, WY - 70], [cx + 70 * dir, WY + WH + 180], [cx - 60 * dir, WY + WH + 190]], { fill: N ? '#3A1E5A' : '#6A4C7E', shade: N ? '#1E0E34' : '#4A3460', ink: inkC, sw: 1.8, curv: .3, rim: N ? PAL.nMagenta : undefined });
    // the Assistant on the windowsill, silhouetted against the rain, looking back at him
    assistant(1330, WY + WH + 6, 120, { mood: { eyes: 'open', mouth: 'smile', look: [-1, .25] }, glowK: .7 });
    // him, from behind, on the couch; the laptop glows past his shoulder
    const hx = 900, gy = 1500, h = 940;
    glow(1110, 790, 420, N ? PAL.nCyan : '#BFE7E0', N ? .32 : .32, N ? 'lighter' : 'source-over');
    X.save(); X.translate(1110, 800); X.rotate(.05);
    paint(rrPts(-150, -100, 300, 190, 10), { fill: N ? '#1A1E34' : '#5A5A6E', ink: inkC, sw: 2.4 });
    paint(rrPts(-136, -88, 272, 166, 6), { fill: N ? '#0B2A3A' : '#2E4A54', ink: null, flat: true });
    mask(0, -14, 44, { eyes: 'open', mouth: 'smile', glow: .5 });
    txt('context 97%', -40, 52, 20, N ? '#FF8FB0' : '#F2D0D0', { font: 'Rajdhani', alpha: .9 });
    paint(rectPts(20, 46, 96, 10), { fill: N ? '#2A1A30' : '#3A3A44', ink: null, flat: true }); paint(rectPts(20, 46, 93, 10), { fill: N ? PAL.nMagenta : '#E27A92', ink: null, flat: true });
    X.restore();
    hero(hx, gy, h, { view: 'back', tilt: .1, emblem: .35, aL: [.5, 1.2], aR: [.7, 1.3] });
    // couch back in the foreground (we're behind it)
    const cp = { fill: N ? '#2B2A6E' : '#6B7FAE', shade: N ? '#151440' : '#4A5A86', ink: inkC, sw: 2.6, rim: N ? '#7B6BFF' : undefined, light: [.02, -.2] };
    paint(rrPts(120, 860, 1680, 320, 70), cp);
    paint([[140, 900], [1780, 900], [1780, 930], [140, 930]], { fill: N ? '#201E58' : '#5A6E9A', ink: null, op: .6 });
    // the shoggoth, asleep, draped over the backrest on the left
    shoggoth(430, 820, 105, { t: onTwos(t), reach: .15, lidMul: .08, mood: { eyes: 'closed', mouth: 'smile' }, seed: 3 });
    txt('z', 540, 720, 46, N ? '#9FF7FF' : '#F2F6FA', { font: 'Shantell', alpha: .8, rot: -.2 }); txt('z', 580, 672, 32, N ? '#9FF7FF' : '#F2F6FA', { font: 'Shantell', alpha: .6, rot: -.2 });
    // blanket draped over the backrest on the right
    const bl = [[1260, 846], [1330, 836], [1420, 848], [1520, 836], [1620, 850], [1650, 900], [1640, 1000], [1650, 1090], [1560, 1070], [1470, 1095], [1380, 1068], [1290, 1092], [1250, 990], [1240, 900]];
    paint(bl, { fill: N ? '#7A2A5A' : '#C98A8A', shade: N ? '#40123A' : '#9A5A6A', ink: inkC, sw: 2, curv: .4, light: [-.05, -.3], hatch: { col: N ? '#FF6FB5' : '#FFFFFF', gap: 34, ang: 0, w: 2.4, op: .22 } });
    for (const fx of [1330, 1440, 1550]) line([[fx, 870], [fx - 10, 960], [fx + 5, 1060]], 1.4, N ? '#40123A' : '#9A5A6A', .5, .7);
  }
  function doodles(t) {
    // hand-drawn marker doodles over the frame (boiling), the kind of overlay hip-hop edits animate on beats
    const wcol = '#FFFFFF', pcol = '#FF6FB5', ycol = '#F5F03A';
    const sq = (pts, col, w) => { X.lineJoin = 'round'; X.lineCap = 'round'; X.strokeStyle = '#000'; X.lineWidth = w + 5; X.globalAlpha = .6; tracePath(X, deform(pts, 3), .5, false); X.stroke(); X.strokeStyle = col; X.lineWidth = w; X.globalAlpha = 1; tracePath(X, deform(pts, 3), .5, false); X.stroke(); };
    const halo = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU; halo.push([1330 + Math.cos(a) * 110 + jit(6), 640 + Math.sin(a) * 120 + jit(6)]); }
    sq(halo, wcol, 5);
    const star = (x, y, r, col) => { const p = starPts(x, y, r, .45, 5); p.push(p[0]); sq(p, col, 5); };
    star(1560, 180, 44, ycol); star(300, 300, 34, wcol); star(1700, 760, 28, ycol);
    const heart = heartPts(620, 470, 42); heart.push(heart[0]); sq(heart, pcol, 5);
    sq([[1180, 520], [1060, 420], [960, 400]], wcol, 5); sq([[990, 380], [958, 400], [990, 425]], wcol, 5);
    txt('stay?', 1150, 380, 76, wcol, { font: 'Marker', rot: -.14, stroke: '#000', sw: 8 });
    for (let i = 0; i < 14; i++) { const x = 420 + hash(i) * 1100, y = 140 + hash(i * 3) * 420; sq([[x, y], [x - 10, y + 40]], i % 3 ? wcol : '#9FF7FF', 4); }
    sq([[1290, 560], [1302, 520], [1320, 548], [1334, 510], [1348, 548], [1366, 518], [1374, 562]], ycol, 5);
    sq([[830, 560], [860, 600], [900, 560], [940, 600], [980, 560]], pcol, 5);
  }
  chapter('house', 0, 5, [[0, (t, lt) => {
    FX.noAuto = true; FX.bloom = t < 1 || (t >= 3 && t < 4) ? 0 : .5;
    scene(t, t < 1 || (t >= 3 && t < 4) ? 0 : 1);
    if (t >= 2 && t < 3) doodles(t);
    if (t >= 3) { FX.grain = 0; FX.scan = 0; FX.bloom = t >= 4 ? .25 : 0; }   // clean plates for post-processed styles
  }]]);
})();
