// hero.js: the Researcher — an evals data scientist (original design). Lab coat + hoodie in the watercolour act,
// an oversized indigo bomber with orange ribbing and a glowing Dyson-sphere emblem on the back in the neon act.
//
// hero(x, y, h, o): (x, y) = ground point between the feet, h = full standing height in px (a head is ~20% of h).
//   o.view: 'front' | 'side' | 'back' | 'q' (three-quarter front)   o.flip: face left (side/q views)
//   o.outfit: 'lab' | 'bomber' | 'space'   o.lean: torso lean (rad, + = forward)   o.rot: whole-body rotation (rad, about hips)
//   Limbs (radians; 0 = hanging straight down; + = forward in side view / outward in front view):
//     o.aL, o.aR = [shoulder, elbow]   o.lL, o.lR = [hip, knee]   (defaults: relaxed standing)
//   o.dy: lift (px, - = up)   o.sq: squash (+) / stretch (-)
//   Face: o.eyes: 'open' | 'happy' | 'closed' | 'wide' | 'narrow' | 'star' | 'tired' | 'determined' | 'sad'   o.lookX/lookY (-1..1)
//         o.mouth: 'smile' | 'grin' | 'o' | 'O' | 'flat' | 'open' | 'teeth' | 'wobble' | 'smirk'   o.brows: 'up' | 'worried' | 'angry' | 'flat'
//         o.blush (0..1), o.sweat (0..1), o.glint (glasses glint 0..1), o.chrome (0..1 optic implant + neck port glow)
//   o.hairWind (-1..1), o.emblem (0..1 extra emblem glow on the back), o.handL/handR(x, y, ang, k): draw hooks at the hands (world space)
//   o.alpha, o.silhouette (colour: draw as a flat silhouette, for afterimage trails), o.helmet (0..1)
const HERO = {
  skin: '#F1C9A5', skinDk: '#D39C7C', skinN: '#E9B394', skinNDk: '#A0607A',
  hair: '#2A2230', hairHi: '#4B3B5E',
  coat: '#F7F2E7', coatDk: '#D9CFBF', hood: '#5B6886', hoodDk: '#434E69',
  bomber: '#2B1E5C', bomberDk: '#170F38', bomberRim: '#7B6BFF', rib: '#FF8A1F', ribDk: '#C85A0E', pipe: '#27F2F2',
  pants: '#232033', pantsDk: '#15131F', shoe: '#F2EEE6', shoeDk: '#B9B3A8', sole: '#27F2F2',
  lanyard: '#E27A92', badge: '#FFF6E6'
};
const HLEN = { thigh: 23, shin: 22, uarm: 16, farm: 15, hipY: -46, shY: -73, headY: -89 };

// a pose helper: merges limb angles
const pose = (base, extra = {}) => ({ ...base, ...extra });
const POSES = {
  stand: { aL: [.12, .12], aR: [.12, .12], lL: [.02, 0], lR: [-.02, 0] },
  hips: { aL: [.5, 1.9], aR: [.5, 1.9], lL: [.08, 0], lR: [-.08, 0] },
  cheer: { aL: [2.6, .3], aR: [2.6, .3], lL: [.1, 0], lR: [-.1, 0] },
  point: { aL: [.1, .1], aR: [1.55, .05], lL: [.05, 0], lR: [-.05, 0] },
  type: { aL: [.75, 1.0], aR: [.75, 1.0], lL: [1.5, 1.55], lR: [1.5, 1.55] },       // side view, seated
  sit: { aL: [.3, .6], aR: [.3, .6], lL: [1.5, 1.5], lR: [1.45, 1.5] },
  jackIn: { aL: [.1, .1], aR: [2.2, 2.4], lL: [.05, 0], lR: [-.05, 0] },
  float: { aL: [1.1, .5], aR: [1.3, .7], lL: [.35, .6], lR: [-.1, .3] }
};
function runPose(ph, amt = 1) {  // side view run cycle, ph in cycles
  const s = Math.sin(ph * TAU), c = Math.cos(ph * TAU);
  return { aL: [-.9 * s * amt, 1.4 + .3 * c], aR: [.9 * s * amt, 1.4 - .3 * c], lL: [.9 * s * amt + .1, .3 + 1.3 * Math.max(0, -c) * amt], lR: [-.9 * s * amt + .1, .3 + 1.3 * Math.max(0, c) * amt], lean: .22 * amt, dy: -Math.abs(Math.sin(ph * TAU * 2)) * 6 * amt };
}
function walkPose(ph, amt = 1) {
  const s = Math.sin(ph * TAU), c = Math.cos(ph * TAU);
  return { aL: [-.4 * s * amt, .3], aR: [.4 * s * amt, .3], lL: [.45 * s * amt, .5 * Math.max(0, -c) * amt], lR: [-.45 * s * amt, .5 * Math.max(0, c) * amt], lean: .04, dy: -Math.abs(Math.cos(ph * TAU)) * 3 * amt };
}

function hero(x, y, h, o = {}) {
  const k = h / 100, view = o.view || 'front', fl = o.flip ? -1 : 1, neon = NEON >= .5;
  const outfit = o.outfit || (neon ? 'bomber' : 'lab');
  const P = { ...POSES.stand, ...o };
  const sil = o.silhouette, A = o.alpha ?? 1;
  const sw = clamp(h / 260, .6, 3.2) * (o.swMul || 1) / k;   // outline weight in body units (the context is scaled by k)
  const skin = neon ? HERO.skinN : HERO.skin, skinDk = neon ? HERO.skinNDk : HERO.skinDk;
  const C = sil ? new Proxy({}, { get: () => sil }) : {
    skin, skinDk, hair: HERO.hair, hairDk: '#17121C',
    top: outfit === 'lab' ? HERO.coat : HERO.bomber, topDk: outfit === 'lab' ? HERO.coatDk : HERO.bomberDk,
    under: HERO.hood, underDk: HERO.hoodDk, rib: HERO.rib, ribDk: HERO.ribDk,
    pants: HERO.pants, pantsDk: HERO.pantsDk, shoe: HERO.shoe, shoeDk: HERO.shoeDk
  };
  const ink = sil ? null : undefined, rim = neon && !sil ? (o.rimCol || HERO.bomberRim) : undefined;
  const light = [fl * -.12, -.12];
  const pp = (pts, fill, shade, extra = {}) => paint(pts, { fill, shade: sil ? null : shade, light, rim: extra.rim ?? undefined, ink, sw, alpha: A, curv: extra.curv ?? .35, wet: 3.4 / k, ...extra });

  const U0 = U; U = k;
  X.save();
  X.translate(x, y + (o.dy || 0));
  if (o.rot) { X.translate(0, HLEN.hipY * k); X.rotate(o.rot); X.translate(0, -HLEN.hipY * k); }
  const sq = o.sq || 0; X.scale(k * fl * (1 + sq * .5), k * (1 - sq));
  // everything below is in body units (height 100), facing +x for side views
  const hip = [0, HLEN.hipY], lean = P.lean || 0;
  const R = (px, py) => { const dx = px - hip[0], dy = py - hip[1], c = Math.cos(lean), s = Math.sin(lean); return [hip[0] + dx * c - dy * s, hip[1] + dx * s + dy * c]; };
  const legs = (side, ang, far) => {
    const [a1, a2] = ang, hx = view === 'side' ? (far ? -1.5 : 1.5) : side * 5.5;
    const H0 = [hx, HLEN.hipY + 2];
    let kx, ky, fx, fy;
    if (view === 'side') { kx = H0[0] + Math.sin(a1) * HLEN.thigh; ky = H0[1] + Math.cos(a1) * HLEN.thigh; fx = kx + Math.sin(a1 - a2) * HLEN.shin; fy = ky + Math.cos(a1 - a2) * HLEN.shin; }
    else { const fo = Math.cos(a1) * .85 + .15; kx = H0[0] + side * Math.sin(Math.abs(a1) * .2) * 4; ky = H0[1] + HLEN.thigh * fo; fx = kx + side * 1.5; fy = ky + HLEN.shin * (Math.cos(a1 - a2) * .8 + .2); }
    const pc = far ? C.pantsDk : C.pants;
    pp(limbPts([H0, [kx, ky], [fx, fy - 1]], [5.4, 4.4, 3.5]), pc, C.pantsDk, { curv: .3 });
    // shoe
    if (view === 'side') { const sh = [[fx - 4, fy - 3.5], [fx + 3, fy - 4.5], [fx + 8.5, fy - 1.5], [fx + 8.5, fy + 1.2], [fx - 4.5, fy + 1.2]]; pp(sh, far ? C.shoeDk : C.shoe, C.shoeDk, { curv: .3 }); if (neon && !sil) neonLine([[fx - 4.5, fy + 1.4], [fx + 8.5, fy + 1.4]], HERO.sole, .9 * sw, .8 * A, 0); }
    else { const sh = rrPts(fx - 5 + side * .5, fy - 4, 10, 5.5, 2.6); pp(sh, C.shoe, C.shoeDk); if (neon && !sil) neonLine([[fx - 5, fy + 1.6], [fx + 5, fy + 1.6]], HERO.sole, .9 * sw, .8 * A, 0); }
  };
  const arm = (side, ang, far) => {
    const [b1, b2] = ang;
    let S, E, Hn;
    if (view === 'side') { S = R(far ? -1 : 1, HLEN.shY + 2); E = [S[0] + Math.sin(b1 + lean) * HLEN.uarm, S[1] + Math.cos(b1 + lean) * HLEN.uarm]; Hn = [E[0] + Math.sin(b1 + b2 + lean) * HLEN.farm, E[1] + Math.cos(b1 + b2 + lean) * HLEN.farm]; }
    else { S = R(side * 12, HLEN.shY + 1.5); const a = side * b1; E = [S[0] + Math.sin(a) * HLEN.uarm, S[1] + Math.cos(a) * HLEN.uarm]; const a2 = side * (b1 + b2); Hn = [E[0] + Math.sin(a2) * HLEN.farm, E[1] + Math.cos(a2) * HLEN.farm]; }
    const sl = far ? C.topDk : C.top;
    pp(limbPts([S, E, Hn], [4.7, 4.1, 3.6]), sl, C.topDk, { rim, curv: .3 });
    const cuffA = Math.atan2(Hn[1] - E[1], Hn[0] - E[0]), cx = Hn[0] - Math.cos(cuffA) * 2.2, cy = Hn[1] - Math.sin(cuffA) * 2.2;
    if (outfit !== 'lab') pp(capsule(cx - Math.cos(cuffA) * 1.6, cy - Math.sin(cuffA) * 1.6, cx + Math.cos(cuffA) * 1.2, cy + Math.sin(cuffA) * 1.2, 4.2, 4.2, 4), C.rib, C.ribDk);
    pp(ellPts(Hn[0] + Math.cos(cuffA) * 1.8, Hn[1] + Math.sin(cuffA) * 1.8, 3.3, 3.3, 10), C.skin, C.skinDk);
    const hook = side < 0 ? o.handL : o.handR;
    if (hook) { X.save(); X.translate(Hn[0] + Math.cos(cuffA) * 2, Hn[1] + Math.sin(cuffA) * 2); X.rotate(cuffA); hook(1, sw); X.restore(); }
  };
  const torso = () => {
    const back = view === 'back', side = view === 'side';
    const seated = (P.lL[0] > 1 && P.lR[0] > 1), wS = side ? 8 : 13, wW = side ? 7.5 : 10.5, hemY = outfit === 'lab' ? (seated ? -38 : -20) : -42;
    if (outfit === 'lab') {
      // hoodie underneath, then the open coat panels
      pp([R(-wS + 1, HLEN.shY), R(wS - 1, HLEN.shY), R(wW, -44), R(-wW, -44)].map(p => p), C.under, C.underDk);
      const coat = side ? [R(-wS, HLEN.shY - 1), R(wS - 1, HLEN.shY - 1), R(wW + 1.5, -44), R(wW + 3, hemY), R(-wW - 2, hemY), R(-wW, -44)]
        : [R(-wS - 1, HLEN.shY - 1), R(-3, HLEN.shY), R(-2, -44), R(-3, hemY), R(-wW - 4, hemY), R(-wW - 1, -46)];
      pp(coat, C.top, C.topDk);
      if (!side) pp([R(wS + 1, HLEN.shY - 1), R(3, HLEN.shY), R(2, -44), R(3, hemY), R(wW + 4, hemY), R(wW + 1, -46)], C.top, C.topDk);
      if (back) pp([R(-wS - 1, HLEN.shY - 1), R(wS + 1, HLEN.shY - 1), R(wW + 1, -46), R(wW + 4, hemY), R(-wW - 4, hemY), R(-wW - 1, -46)], C.top, C.topDk);
      if (!back && !side && !sil) {
        // lanyard + badge
        line([R(-4, HLEN.shY + 1), R(-1, -60), R(1, -60), R(4, HLEN.shY + 1)], sw * .5, HERO.lanyard, .5, A);
        pp(rrPts(...R(-3.5, -60), 7, 8.5, 1.2), HERO.badge, '#D8CDB8', { sw: sw * .6 });
      }
    } else {
      // bomber: boxy, blouson waist, ribbed collar + hem
      const body = side ? [R(-wS, HLEN.shY - 1), R(wS, HLEN.shY - 1), R(wW + 2.5, -52), R(wW + 1, hemY), R(-wW - 1.5, hemY), R(-wW - 2.5, -52)]
        : [R(-wS - 1.5, HLEN.shY - 1.5), R(wS + 1.5, HLEN.shY - 1.5), R(wW + 3.5, -54), R(wW + 1.5, hemY), R(-wW - 1.5, hemY), R(-wW - 3.5, -54)];
      pp(body, C.top, C.topDk, { rim });
      pp([R(-wW - 1.8, hemY - 3), R(wW + 1.8, hemY - 3), R(wW + 1.5, hemY + 1.5), R(-wW - 1.5, hemY + 1.5)], C.rib, C.ribDk, { curv: .1 });
      if (!back && !sil) {
        if (!side) { line([R(0, HLEN.shY + 2), R(0, hemY - 3)], sw * .5, PAL.line, 0, A); if (neon) neonLine([R(-.8, HLEN.shY + 3), R(-.8, hemY - 3)], HERO.pipe, clamp(h / 420, .8, 3.5) / k, .7 * A, 0); }
        // sleeve patch: a tiny loss curve stitched on (front/side)
      }
      if (back && !sil) dysonEmblem(...R(0, -58), 8.2, o.emblem || 0, A);
      if (!back && !side && !sil) pp(rrPts(...R(4.5, -64), 5.5, 4, 1), '#F7D35A', '#D9A72E', { sw: sw * .5 });  // smiley pin
    }
    // collar
    if (!sil) {
      if (outfit === 'lab') { pp([R(-7, HLEN.shY - 2), R(-1, HLEN.shY + 4), R(-2.5, HLEN.shY - 3)], C.top, C.topDk); pp([R(7, HLEN.shY - 2), R(1, HLEN.shY + 4), R(2.5, HLEN.shY - 3)], C.top, C.topDk); if (!side) pp([R(-5.5, HLEN.shY - 3.5), R(5.5, HLEN.shY - 3.5), R(3, HLEN.shY - 1), R(-3, HLEN.shY - 1)], C.under, C.underDk, { curv: .5 }); }
      else pp([R(-7.5, HLEN.shY - 3.5), R(7.5, HLEN.shY - 3.5), R(6.5, HLEN.shY + .5), R(-6.5, HLEN.shY + .5)], C.rib, C.ribDk, { curv: .5 });
    }
  };
  const head = () => {
    const [hx, hy] = R(view === 'side' ? 1 : 0, HLEN.headY);
    X.save(); X.translate(hx, hy); if (lean) X.rotate(lean * .6 + (o.tilt || 0)); else if (o.tilt) X.rotate(o.tilt);
    // neck
    pp(capsule(0, 6, 0, 12, 3.3, 3.6), C.skin, C.skinDk);
    if (view === 'back') { hairBack(); X.restore(); return; }
    const side = view === 'side', q = view === 'q';
    const face = side ? [[-8, -3], [-6, -10], [2, -11], [7.5, -6], [8.8, -1], [10.6, 1.2], [8.6, 2.8], [8.2, 6.5], [4, 10], [-3, 9.5], [-7.5, 4]]
      : ellPts(q ? .8 : 0, 0, 8.8, 10.2, 18);
    if (!side) { const ex = q ? [-8.2, 8.9] : [-9.3, 9.3]; for (const e of ex) pp(ellPts(e, 1.5, 1.8, 2.8, 8), C.skin, C.skinDk, { sw: sw * .7 }); }  // ears
    pp(face, C.skin, C.skinDk, { curv: side ? .5 : 0 });
    if (!sil) faceFeatures(side, q);
    hairFront(side, q);
    if (!sil && o.chrome) chromeBits(side, q, o.chrome);
    X.restore();
  };
  const hairFront = (side, q) => {
    const w = o.hairWind || 0;
    const back = side ? [[-9.5, 3], [-11, -6], [-7, -13.5], [1, -14.5], [7.5, -11], [8.5, -6.5], [4, -8.5], [-1, -6], [-4.5, -5], [-6, 2.5]]
      : [[-10.5, 2], [-11, -7], [-7.5 + w, -13], [0 + w, -15], [7.5 + w, -13], [11, -7], [10.5, 1], [8.5, -3.5], [6, -7], [2.5, -5.5], [-1, -7.5], [-4, -5.5], [-7.5, -4], [-8.8, -.5]];
    pp(back.map(([a, b]) => [a + (q ? .8 : 0), b]), C.hair, C.hairDk, { curv: .5, rim: neon && !sil ? PAL.nViolet : undefined });
    if (sil) return;
    // tufts + cowlick
    const tufts = side ? [[[-3, -14], [-1.5, -18.5 + w], [1, -14]], [[3, -13.5], [6.5 + w, -16.5], [6, -12]]]
      : [[[-4, -13.5], [-3 + w, -18.8], [-.5, -14]], [[1.5, -14.5], [4 + w * 1.4, -19.5], [4.5, -13.5]], [[6, -12.5], [10 + w, -14.5], [8.5, -10]]];
    for (const tf of tufts) pp(tf.map(([a, b]) => [a + (q ? .8 : 0), b]), C.hair, C.hairDk, { curv: .4, sw: sw * .8 });
  };
  const hairBack = () => {
    pp(ellPts(0, -1, 10.5, 12, 18), C.skin, C.skinDk);
    pp([[-10.8, 4], [-11.5, -6], [-7, -13.5], [0, -15.5], [7, -13.5], [11.5, -6], [10.8, 4], [7, 7.5], [0, 8.5], [-7, 7.5]], C.hair, C.hairDk, { curv: .5, rim: neon && !sil ? PAL.nViolet : undefined });
    pp([[-2, -14], [0, -19.5 + (o.hairWind || 0)], [2.5, -14.5]], C.hair, C.hairDk, { curv: .4, sw: sw * .8 });
  };
  const faceFeatures = (side, q) => {
    const eyes = o.eyes || 'open', lx = (o.lookX || 0) * 1.1, ly = (o.lookY || 0) * 1.1, inkC = neon ? PAL.line : PAL.ink;
    const ePos = side ? [[5.2, 0]] : q ? [[-2.6, 0], [5.4, 0]] : [[-3.9, 0], [3.9, 0]];
    for (const [ex, ey] of ePos) {
      const cx = ex + lx, cy = ey + ly;
      if (eyes === 'closed' || eyes === 'happy') line(eyes === 'happy' ? [[cx - 2, cy + .6], [cx, cy - 1.4], [cx + 2, cy + .6]] : [[cx - 2, cy], [cx, cy + 1], [cx + 2, cy]], sw * .55, inkC, .6, A);
      else if (eyes === 'star') { paint(starPts(cx, cy, 2.8, .45, 4), { fill: PAL.nYellow, ink: inkC, sw: sw * .35, alpha: A }); }
      else {
        const rx = eyes === 'wide' ? 1.9 : 1.45, ry = eyes === 'narrow' ? .7 : eyes === 'tired' ? 1.1 : eyes === 'wide' ? 2.5 : 2.1;
        paint(ellPts(cx, cy, rx, ry, 12), { fill: inkC, ink: null, alpha: A, flat: true });
        paint(ellPts(cx - .5, cy - .8, .55, .6, 6), { fill: '#FFFFFF', ink: null, alpha: A * .95, flat: true });
        if (eyes === 'tired') line([[cx - 2, cy - 1.3], [cx + 2, cy - 1.1]], sw * .45, inkC, 0, A);
      }
    }
    // brows
    const br = o.brows || 'flat', bA = { flat: [0, 0], up: [-1.2, -1.2], worried: [-.8, .9], angry: [.9, -.8] }[br] || [0, 0];
    for (const [ex] of ePos) { const s = side || ex > 0 ? 1 : -1; line([[ex - 2.2, -4.2 + (s < 0 ? bA[1] : bA[0])], [ex + 2.2, -4.2 + (s < 0 ? bA[0] : bA[1])]], sw * .55, C.hair, .2, A); }
    // glasses: round frames
    const gl = o.glasses ?? true;
    if (gl) {
      for (const [ex] of ePos) {
        paint(ellPts(ex, .2, 3.4, 3.2, 16), { fill: neon ? '#9FF7FF' : '#DDEFF5', op: .18, flat: true, ink: inkC, sw: sw * .45, alpha: A });
        if (o.glint) { X.globalAlpha = A * o.glint; line([[ex - 1.8, 1.4], [ex + .2, -1.6]], sw * .5, '#FFFFFF', 0, A * o.glint); }
      }
      if (!side) line([[ePos[0][0] + 3.3, -.3], [ePos[1][0] - 3.3, -.3]], sw * .4, inkC, .3, A);
      else line([[ePos[0][0] - 3.3, -.4], [-4, -1]], sw * .4, inkC, 0, A);
    }
    // nose + mouth
    if (!side) line([[q ? 1.9 : .6, 2], [q ? 2.4 : 1.2, 3.8], [q ? 1.3 : 0, 4]], sw * .35, C.skinDk, .5, A);
    const m = o.mouth || 'smile', mx = side ? 6.2 : q ? 1.8 : 0, my = 6.3;
    const mc = neon ? '#5A1A2A' : '#7A3A3A';
    if (m === 'smile') line([[mx - 2, my - .5], [mx, my + .8], [mx + 2, my - .5]], sw * .45, inkC, .6, A);
    else if (m === 'smirk') line([[mx - 1.8, my + .2], [mx + .5, my + .4], [mx + 2.2, my - .9]], sw * .45, inkC, .6, A);
    else if (m === 'flat') line([[mx - 1.7, my], [mx + 1.7, my]], sw * .45, inkC, 0, A);
    else if (m === 'wobble') line([[mx - 2, my], [mx - 1, my - .6], [mx, my], [mx + 1, my - .6], [mx + 2, my]], sw * .4, inkC, .3, A);
    else if (m === 'o') paint(ellPts(mx, my, 1.1, 1.4, 10), { fill: mc, ink: inkC, sw: sw * .35, alpha: A, flat: true });
    else if (m === 'O' || m === 'open') paint(ellPts(mx, my + .6, m === 'O' ? 2.1 : 2.6, m === 'O' ? 2.6 : 1.8, 12), { fill: mc, ink: inkC, sw: sw * .4, alpha: A, flat: true });
    else if (m === 'grin' || m === 'teeth') { paint([[mx - 3, my - 1], [mx + 3, my - 1], [mx + 2, my + 1.8], [mx - 2, my + 1.8]], { fill: m === 'teeth' ? '#FFFFFF' : mc, ink: inkC, sw: sw * .4, alpha: A, curv: .4, flat: true }); if (m === 'grin') paint([[mx - 2.8, my - 1], [mx + 2.8, my - 1], [mx + 2.4, my + .1], [mx - 2.4, my + .1]], { fill: '#FFFFFF', ink: null, alpha: A, flat: true }); }
    if (o.blush) for (const [ex] of ePos) paint(ellPts(ex + (ex < 0 ? -1 : 1), 3.6, 2, 1, 8), { fill: PAL.rose, op: .6 * o.blush, ink: null, alpha: A, flat: true });
    if (o.sweat) paint([[9, -6], [10.4, -2.5], [9, -1.2], [7.6, -2.5]], { fill: '#9FDFFF', ink: inkC, sw: sw * .3, alpha: A * o.sweat, curv: .5 });
  };
  const chromeBits = (side, q, k2) => {
    // optic implant: circuit lines under the left eye + a neck port
    const ex = side ? 5.2 : q ? -2.6 : -3.9;
    const pts = [[ex - 1, 3.6], [ex - 1, 5.6], [ex - 3, 7], [ex - 3, 8.5]], cw = clamp(h / 420, .8, 3.5) / k;
    neonLine(pts, PAL.nCyan, cw, k2 * A, 0); neonLine([[ex + 1, 3.6], [ex + 1.6, 5]], PAL.nCyan, cw * .9, k2 * A, 0);
    paint(ellPts(ex - 3, 8.6, .6, .6, 6), { fill: PAL.nCyan, ink: null, alpha: A * k2, flat: true });
    if (side) { paint(rrPts(-5.5, 7.5, 3.2, 2.4, .8), { fill: '#3A3A4E', ink: PAL.line, sw: sw * .3, alpha: A }); glow(-3.9, 8.7, 2.2, PAL.nCyan, .45 * k2); }
  };

  // draw order
  if (view === 'side') {
    arm(-1, P.aL, true); legs(-1, P.lL, true); torso(); legs(1, P.lR, false); head(); arm(1, P.aR, false);
  } else if (view === 'back') {
    legs(-1, P.lL); legs(1, P.lR); arm(-1, P.aL); arm(1, P.aR); torso(); head();
  } else {
    legs(-1, P.lL); legs(1, P.lR); torso(); head(); arm(-1, P.aL); arm(1, P.aR);
  }
  if (o.helmet && !sil) {
    const [hx, hy] = R(view === 'side' ? 1 : 0, HLEN.headY - 1);
    paint(ellPts(hx, hy, 16, 16.5, 28), { fill: '#BFEFFF', op: .14 * o.helmet, flat: true, ink: neon ? '#E8FBFF' : PAL.ink, sw: sw * .6, alpha: A * o.helmet });
    line([[hx - 9, hy - 9], [hx - 4, hy - 13]], sw * .8, '#FFFFFF', .4, A * o.helmet * .8);
    pp(rrPts(hx - 11, hy + 12, 22, 5, 2), '#D8DCE8', '#9AA0B5', { alpha: A * o.helmet });
  }
  X.restore(); U = U0;
}

// Dyson sphere emblem (jacket back / hero graphic): a sun wrapped in lattice rings. glowK 0..1 pumps the glow.
function dysonEmblem(cx, cy, r, glowK = 0, A = 1) {
  const neon = NEON >= .5, t = T;
  if (neon) { glow(cx, cy, r * 3.2, PAL.nOrange, .35 + .5 * glowK); glow(cx, cy, r * 1.6, PAL.nYellow, .3 + .5 * glowK); }
  paint(ellPts(cx, cy, r * .55, r * .55, 18), { fill: neon ? '#FFE27A' : PAL.ochre, shade: neon ? PAL.nOrange : PAL.clay, ink: neon ? PAL.line : PAL.ink, sw: r * .06, alpha: A, wet: 1 });
  const rings = [[0, 1], [.95, .38], [-.95, .38], [Math.PI / 2, .3]];
  for (const [rot, sy] of rings) {
    const pts = ellPts(cx, cy, r, r * sy, 32, 0, 0).map(([x, y]) => { const dx = x - cx, dy = y - cy, c = Math.cos(rot), s = Math.sin(rot); return [cx + dx * c - dy * s, cy + dx * s + dy * c]; });
    if (neon) neonLine(pts, PAL.nCyan, r * .07, A * (.8 + .2 * glowK), .5, true);
    else line(pts, r * .05, PAL.teal, .5, A, true);
  }
  // panel dots on the rings
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .4; const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r * .38; paint(rrPts(px - r * .08, py - r * .06, r * .16, r * .12, r * .03), { fill: neon ? PAL.nCyan : PAL.teal, ink: null, alpha: A, flat: true }); }
}
