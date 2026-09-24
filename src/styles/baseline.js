// baseline: the current v1/v2 design language (our rigs), same moment, for comparison
(() => {
  chapter('baseline', 8, 9, [[8, (t) => {
    style(1); FX.noAuto = true; FX.bloom = .45;
    vgrad(-10, -10, W + 20, H + 20, [[0, '#0E0B22'], [1, '#1C1336']]);
    X.save(); tracePath(X, rectPts(980, 60, 900, 640)); X.clip();
    vgrad(980, 60, 900, 640, [[0, '#06081A'], [1, '#3A1A4A']]); moon(1680, 170, 60, {});
    X.save(); X.translate(900, -250); X.scale(.8, .8); city(T, { horizon: 1170, lit: .8, street: false, seed: 4, tall: 1.2 }); X.restore();
    rain(T, { n: 70, alpha: .35 }); X.restore();
    paint(rectPts(980, 60, 900, 640), { ink: PAL.line, sw: 4 });
    glow(620, 560, 600, '#FFC96B', .12);
    paint(rrPts(-40, 700, 1500, 420, 60), { fill: '#2B2A6E', shade: '#151440', ink: PAL.line, sw: 2.4, rim: '#7B6BFF' });
    shoggoth(250, 690, 95, { t, reach: .2, lidMul: .1, mood: { eyes: 'closed' }, seed: 3 });
    hero(820, 1640, 1450, { view: 'q', flip: true, eyes: 'tired', mouth: 'smile', brows: 'worried', lookX: -.5, lookY: .6, chrome: .5, glint: .5, aL: [.9, 1.4], aR: [.9, 1.4], tilt: .12 });
    glow(560, 820, 300, PAL.nCyan, .3);
    paint([[380, 900], [700, 930], [720, 960], [380, 935]], { fill: '#2A2A40', ink: PAL.line, sw: 2 });
    paint([[380, 900], [420, 700], [690, 720], [700, 930]], { fill: '#0B2A3A', ink: PAL.line, sw: 2.4 });
    txt('context 97%', 520, 870, 22, PAL.nPink, { font: 'Rajdhani' });
    assistant(1030, 390, 190, { mood: { eyes: 'closed', mouth: 'smile' } });
  }]]);
})();
