// model.js: the Model. The shoggoth is Ryan's own drawing from theryanhartman.com (personal_site_2 Shoggoth.svelte),
// ported path-for-path: sage body, crooked horn arms, pointed little legs, half-lidded blinking eyes, and a pale-yellow
// smiley mask held up on its own arm (lift it with o.reveal to expose the hidden eye: "same alien mind. friendlier interface.").
//   mask(x, y, r, o): the smiley mask on its own (monitors, pins, the moon...). r ≈ half its height.
//     o.eyes: 'open' (his dash eyes) | 'dot' | 'happy' | 'wink' | 'narrow' | 'star' | 'heart' | 'x' | 'glitch' | 'wide' | 'closed'
//     o.mouth: 'smile' (his lopsided smile) | 'grin' | 'o' | 'flat' | 'whistle' | 'open' | 'wobble' | 'smirk'   o.look [-1..1, -1..1]
//     o.rot, o.alpha, o.crack (0..1), o.tilt3d (-1..1 fake yaw), o.glow (neon halo 0..1), o.col, o.blush, o.sweat, o.eyeGlow
//   shoggoth(x, y, s, o): (x, y) = body centre, s ≈ body half-width in px (whole creature ≈ 4s wide, 3s tall).
//     o.reach (0..1 limb extension), o.tent (0 = body only), o.eyesN (0..7 big eyes), o.mood (mask options), o.maskAt [dx, dy]
//     (custom mask position: then no mask arm), o.maskR (mask radius / s), o.mask:false, o.reveal (0..1 lift the mask),
//     o.look [x, y] (pupils), o.t (animation time), o.seed (phase), o.wiggle (limb sway multiplier, default 2), o.ground (shadow), o.alpha
//   tentacle(x, y, ang, len, w, t, seed, o): one tapered wavy sage tentacle with little eyes; returns its spine.
const MOD = { body: '#99B087', bodyDk: '#6F8A5F', ink: '#283226', bodyN: '#6E9A63', bodyNDk: '#2F4A33', rimN: '#FF6FB5', rim2N: '#27F2F2',
  rim: '#FF6FB5', eye: '#FFFFF7', pupil: '#20251E', maskCol: '#F5FA83', maskDk: '#D2D85A' };

// ---------- SVG path sampling (cached) ----------
const _svgCache = new Map(); let _svgEl = null;
function svgPts(d, n = 48) {
  const key = d + '|' + n; if (_svgCache.has(key)) return _svgCache.get(key);
  if (!_svgEl) { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.style.position = 'absolute'; svg.style.width = '0'; svg.style.height = '0'; document.body.appendChild(svg); _svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.appendChild(_svgEl); }
  _svgEl.setAttribute('d', d); const L = _svgEl.getTotalLength(), pts = [];
  for (let i = 0; i < n; i++) { const p = _svgEl.getPointAtLength(L * i / n); pts.push([p.x, p.y]); }
  _svgCache.set(key, pts); return pts;
}
const subpaths = d => d.trim().split(/(?=M)/).map(s => s.trim()).filter(Boolean);

// ---------- the mask (his shape: a slightly lopsided pale-yellow oval) ----------
const MASK_D = 'M168 255 C183 238 207 241 217 257 C228 274 218 304 204 313 C188 323 167 312 161 299 C155 286 159 268 168 255 Z';
const MASK_C = [191, 279], MASK_R = 37;
function maskShape(r) { return svgPts(MASK_D, 40).map(([px, py]) => [(px - MASK_C[0]) / MASK_R * r, (py - MASK_C[1]) / MASK_R * r]); }

function mask(x, y, r, o = {}) {
  const neon = NEON >= .5, A = o.alpha ?? 1, inkC = neon ? PAL.line : MOD.ink, sw = clamp(r / 22, .5, 6);
  const col = o.col || MOD.maskCol, dk = MOD.maskDk, yaw = o.tilt3d || 0;
  X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot);
  if (neon && (o.glow ?? .6) > 0) glow(0, 0, r * 2.1, PAL.nYellow, .26 * (o.glow ?? .6) * A);
  X.scale(1 - Math.abs(yaw) * .35, 1);
  paint(maskShape(r), { fill: col, shade: dk, light: [-.12, -.14], ink: inkC, sw, alpha: A, wet: r * .03, rim: neon ? '#FFFFD0' : undefined, curv: .2 });
  const lx = (o.look ? o.look[0] : 0) * r * .12 + yaw * r * .25, ly = (o.look ? o.look[1] : 0) * r * .1;
  const E = o.eyes || 'open', eyePos = [[-.4, -.3], [.33, -.32]];
  for (let s = 0; s < 2; s++) {
    const cx = eyePos[s][0] * r + lx, cy = eyePos[s][1] * r + ly, right = s === 1;
    if (E === 'open') { const d = r * .1; line([[cx - d * .08, cy - d], [cx + d * .08, cy + d]], sw * 1.25, inkC, 0, A); if (neon && o.eyeGlow) glow(cx, cy, r * .35, PAL.nCyan, .6 * A); continue; }
    if (E === 'happy' || (E === 'wink' && right) || E === 'closed') { line(E === 'closed' ? [[cx - r * .13, cy], [cx + r * .13, cy]] : [[cx - r * .13, cy + r * .05], [cx, cy - r * .09], [cx + r * .13, cy + r * .05]], sw * 1.1, inkC, .6, A); continue; }
    if (E === 'star') { paint(starPts(cx, cy, r * .2, .42, 5), { fill: neon ? PAL.nCyan : '#FFF6E6', ink: inkC, sw: sw * .6, alpha: A }); if (neon) glow(cx, cy, r * .4, PAL.nCyan, .45 * A); continue; }
    if (E === 'heart') { paint(heartPts(cx, cy, r * .15), { fill: PAL.nMagenta, ink: inkC, sw: sw * .6, alpha: A }); continue; }
    if (E === 'x') { line([[cx - r * .1, cy - r * .1], [cx + r * .1, cy + r * .1]], sw, inkC, 0, A); line([[cx + r * .1, cy - r * .1], [cx - r * .1, cy + r * .1]], sw, inkC, 0, A); continue; }
    if (E === 'glitch') { paint(rectPts(cx - r * .09, cy - r * .16, r * .18, r * .32), { fill: PAL.nCyan, ink: null, alpha: A, flat: true }); paint(rectPts(cx - r * .15 + jit(r * .05), cy - r * .02, r * .3, r * .06), { fill: PAL.nMagenta, ink: null, alpha: A, flat: true }); continue; }
    const ry = E === 'narrow' ? r * .05 : E === 'wide' ? r * .2 : E === 'dot' ? r * .08 : r * .16, rx = E === 'wide' ? r * .12 : E === 'dot' ? r * .07 : r * .09;
    paint(ellPts(cx, cy, rx, ry, 14), { fill: neon && o.eyeGlow ? PAL.nCyan : inkC, ink: null, alpha: A, flat: true });
    if (E !== 'narrow' && E !== 'dot') paint(ellPts(cx - rx * .3, cy - ry * .45, rx * .35, ry * .25, 8), { fill: '#FFFFFF', ink: null, alpha: A * .9, flat: true });
    if (E === 'narrow') line([[cx - r * .16, cy - r * .12 - (right ? 1 : -1) * r * .02], [cx + r * .14, cy - r * .1 + (right ? 1 : -1) * r * .03]], sw * .9, inkC, 0, A);
    if (neon && o.eyeGlow) glow(cx, cy, r * .35, PAL.nCyan, .5 * A);
  }
  if (o.blush) for (const s of [-1, 1]) paint(ellPts(s * r * .55 + lx * .5, r * .12, r * .14, r * .07, 10), { fill: PAL.rose, op: .6 * o.blush, ink: null, alpha: A, flat: true });
  const M = o.mouth || 'smile', mx = lx * .6 - r * .03, my = ly * .5;
  // his smile: lopsided, higher on the right
  const smile = [[mx - r * .44, my + r * .3], [mx - r * .2, my + r * .52], [mx + r * .08, my + r * .5], [mx + r * .38, my + r * .16]];
  if (M === 'smile') line(smile, sw * 1.3, inkC, .7, A);
  else if (M === 'grin') paint([...smile, [mx + r * .05, my + r * .24]], { fill: '#5A1A2A', ink: inkC, sw: sw * 1.1, alpha: A, curv: .6 });
  else if (M === 'o' || M === 'whistle') paint(ellPts(mx + (M === 'whistle' ? r * .12 : 0), my + r * .3, r * .08, r * .1, 10), { fill: '#5A1A2A', ink: inkC, sw: sw * .8, alpha: A });
  else if (M === 'open') paint(ellPts(mx, my + r * .32, r * .22, r * .16, 14), { fill: '#5A1A2A', ink: inkC, sw, alpha: A });
  else if (M === 'flat') line([[mx - r * .3, my + r * .32], [mx + r * .3, my + r * .3]], sw * 1.2, inkC, 0, A);
  else if (M === 'wobble') line([[mx - r * .35, my + r * .32], [mx - r * .17, my + r * .25], [mx, my + r * .32], [mx + r * .17, my + r * .25], [mx + r * .35, my + r * .32]], sw * 1.1, inkC, .4, A);
  else if (M === 'smirk') line([[mx - r * .3, my + r * .35], [mx + r * .1, my + r * .37], [mx + r * .38, my + r * .17]], sw * 1.2, inkC, .6, A);
  if (M === 'whistle') for (let i = 0; i < 2; i++) { const k = frac(T * 1.5 + i * .5); txt('♪', r * (.7 + k * .5), my - r * (.1 + k * .6), r * .35, inkC, { font: 'Shantell', alpha: A * (1 - k) }); }
  if (o.crack) line([[r * .1, -r * .95], [r * .02, -r * .55], [r * .2, -r * .3], [r * .05, 0]].slice(0, 1 + Math.ceil(o.crack * 3)), sw * .9, inkC, 0, A);
  if (o.sweat) paint([[r * .78, -r * .5], [r * .9, -r * .2], [r * .78, -r * .08], [r * .66, -r * .2]], { fill: '#9FDFFF', ink: inkC, sw: sw * .5, alpha: A * o.sweat, curv: .5 });
  X.restore();
}
function heartPts(cx, cy, r) { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); p.push([cx + x * r / 16, cy + y * r / 16]); } return p; }

// ---------- an almond eye (his eye shape), centred at (0,0) with half-width r ----------
function almondPts(r, lid = 1) {
  const q = (a, c, b, n, out) => { for (let i = 0; i < n; i++) { const u = i / n; out.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], ((1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]) * lid]); } };
  const p = [];
  q([-r, 2], [-r * .65, -r * .8], [0, -r * .67], 5, p); q([0, -r * .67], [r * .85, -r * .65], [r, 2], 5, p);
  q([r, 2], [r * .7, r * .65], [0, r * .58], 5, p); q([0, r * .58], [-r * .9, r * .55], [-r, 2], 5, p);
  return p;
}
function eyeball(x, y, r, o = {}) {
  const neon = NEON >= .5, A = o.alpha ?? 1, lid = clamp(o.lid ?? 1, .04, 1), inkC = neon ? PAL.line : MOD.ink;
  const pts = xform(almondPts(r, lid), x, y, 1, o.tilt || 0);
  paint(pts, { fill: MOD.eye, ink: inkC, sw: o.sw ?? clamp(r / 7, .6, 4), alpha: A, flat: true, curv: .3 });
  if (lid > .15) {
    const lk = o.look || [0, 0], px = x + lk[0] * r * .3, py = y + lk[1] * r * .22 * lid;
    X.save(); tracePath(X, pts, .3); X.clip();
    paint(ellPts(px, py, r * .28, r * .46 * Math.max(lid, .5), 12), { fill: neon && o.glowPupil ? PAL.nCyan : MOD.pupil, ink: null, alpha: A, flat: true });
    X.restore();
    if (neon && o.glowPupil) glow(px, py, r * .8, PAL.nCyan, .4 * A);
  }
}

// ---------- tentacle (standalone reaches, plugs, grabs) ----------
function tentacle(x, y, ang, len, w, t, seed = 0, o = {}) {
  const neon = NEON >= .5, n = 16, sp = [], curl = o.curl ?? .8, amp = o.amp ?? .35;
  let a = ang, px = x, py = y;
  for (let i = 0; i < n; i++) {
    sp.push([px, py]);
    const k = i / (n - 1);
    a += Math.sin(t * (1.3 + hash(seed) * .8) + i * .45 + seed * 3) * amp * (.3 + k) / n * 6 + curl * k * k / n * 3 * (hash(seed + 2) < .5 ? 1 : -1);
    px += Math.cos(a) * len / n; py += Math.sin(a) * len / n;
  }
  const pts = ribbon(sp, k => w * (1 - k * .92));
  const body = o.col || (neon ? MOD.bodyN : MOD.body), dk = o.dk || (neon ? MOD.bodyNDk : MOD.bodyDk);
  paint(pts, { fill: body, shade: dk, ink: neon ? PAL.line : MOD.ink, sw: clamp(w / 7, .6, 3), alpha: o.alpha ?? 1, curv: .5, wet: 2, light: [0, -Math.min(.25, w * .6 / (bbox(pts).h || 1))] });
  if (neon && o.neon !== false) neonLine(sp.slice(1, -2).map(([qx, qy], i) => [qx, qy - w * (1 - i / n) * .55]), o.rim || MOD.rimN, clamp(w / 10, .8, 3), (o.alpha ?? 1) * .7, .5);
  // little eyes along it (his design has eyes on the limbs instead of suckers)
  if (w > 9 && o.eyes !== false) for (let i = 3; i < n - 3; i += 4) { const [qx, qy] = sp[i], ww = w * (1 - i / n) * .5; eyeball(qx, qy, ww * .75, { lid: .7, tilt: Math.atan2(sp[i + 1][1] - qy, sp[i + 1][0] - qx), alpha: o.alpha ?? 1, sw: clamp(ww / 6, .5, 2) }); }
  return sp;
}

// ---------- the shoggoth (ported from his SVG, viewBox 0 0 600 470) ----------
const SHOG = {
  c: [302, 252], R: 128,
  limbs: [
    { o: [246, 223], sw: -4, d: 7.3, skin: 'M224 236 C235 202 230 178 201 153 C174 131 139 123 139 97 C138 68 164 43 181 25 C126 34 94 57 85 89 C74 125 92 151 118 168 C151 188 166 202 174 229 L187 255 Z', eyes: 'M120 101 Q124 91 134 91 L130 104 Z M115 134 Q126 126 133 136 Q125 144 115 134 M167 175 Q180 167 187 180 Q174 185 167 175', ink: 'M128 94 L126 100 M123 133 L124 136 M178 175 L178 179', n: 90 },
    { o: [355, 224], sw: 5, d: 8.7, skin: 'M326 226 C331 188 350 166 386 157 C422 148 446 144 448 124 C449 108 433 97 417 107 C408 113 411 128 424 129 C397 138 380 112 390 93 C405 63 447 67 471 88 C502 112 495 146 473 165 C451 184 411 194 402 244 Z', eyes: 'M448 89 Q454 85 459 96 Q448 100 448 89 M460 145 Q473 133 480 144 Q474 153 460 145 M394 180 Q404 169 412 179 Q402 187 394 180', ink: 'M453 89 L454 94 M471 141 L470 146 M403 176 L402 181', n: 110 },
    { o: [210, 278], sw: 3, d: 6.8, skin: 'M218 239 C188 224 173 238 161 250 C137 274 111 286 47 277 C69 303 92 315 120 313 C150 312 163 294 189 298 L227 313 Z', eyes: 'M99 295 Q106 286 114 295 Q108 302 99 295 M154 278 Q158 269 165 275 L165 282 Z', ink: 'M108 293 L108 297 M159 274 L160 278', n: 70 },
    { o: [387, 278], sw: -3, d: 7.9, skin: 'M375 244 C414 231 421 251 441 265 C464 281 489 287 553 274 C534 302 509 323 475 319 C448 316 427 300 400 312 L375 303 Z', eyes: 'M447 286 Q455 277 465 290 Q454 295 447 286 M502 298 Q505 287 514 288 L513 298 Z', ink: 'M456 284 L457 290 M508 291 L508 296', n: 70 },
    { o: [249, 317], sw: 3, d: 6.2, skin: 'M229 301 Q226 343 203 363 Q180 383 144 384 Q193 399 231 376 Q257 361 267 321 Z', eyes: 'M209 366 Q216 356 224 366 Q217 374 209 366', ink: 'M217 364 L217 368', n: 50 },
    { o: [279, 321], sw: -3, d: 8, skin: 'M268 314 C276 343 257 358 253 376 L255 415 Q270 395 278 374 Q298 353 301 319 Z', n: 44 },
    { o: [322, 322], sw: 4, d: 7, skin: 'M307 318 Q295 355 321 372 Q348 392 375 388 Q351 376 343 354 Q337 333 343 319 Z', n: 44 },
    { o: [361, 318], sw: -3, d: 9, skin: 'M349 311 Q370 345 401 354 Q433 364 465 345 Q443 382 407 379 Q376 374 366 356 L330 322 Z', eyes: 'M399 362 Q409 354 417 362 Q408 371 399 362', ink: 'M408 361 L408 365', n: 56 },
    { o: [383, 305], sw: 4, d: 6.7, skin: 'M377 298 Q416 320 446 303 Q465 294 471 313 Q475 328 458 339 Q460 325 449 328 Q414 352 381 325 Z', n: 50 }
  ],
  body: 'M186 277 C177 258 184 239 201 231 C197 207 211 187 233 192 C233 166 255 157 273 175 C275 141 306 142 321 164 C348 158 365 181 356 201 C379 190 400 199 399 222 C420 225 430 249 416 267 C438 287 423 311 403 309 C394 335 369 323 351 331 C323 345 302 330 284 327 C267 338 248 324 228 329 C206 325 190 318 195 298 C180 300 175 286 186 277 Z',
  eyes: [ // importance order: the big middle eye first
    { x: 293, y: 263, r: 29, tilt: 4, lid: 1, delay: 0 }, { x: 359, y: 223, r: 20, tilt: -14, lid: .48, delay: 310 }, { x: 248, y: 204, r: 15, tilt: -18, lid: .6, delay: 80 },
    { x: 351, y: 310, r: 13, tilt: -9, lid: .65, delay: 390 }, { x: 315, y: 179, r: 8, tilt: 21, lid: 1, delay: 210 }, { x: 404, y: 279, r: 8, tilt: 28, lid: 1, delay: 260 }, { x: 238, y: 308, r: 7, tilt: 24, lid: 1, delay: 170 }],
  detail: 'M204 260 Q213 250 221 254 M375 244 Q384 240 389 247 M255 289 L259 291 M316 215 L318 217 M379 302 L382 303',
  armD: t => { const ang = -18 * t * Math.PI / 180, x = 190 + 3 * Math.cos(ang) - 29 * Math.sin(ang) - 95 * t, y = 280 + 3 * Math.sin(ang) + 29 * Math.cos(ang) - 80 * t;
    return `M222 310 C${203 - 36 * t} ${358 - 27 * t}, ${x - 33} ${y + 40}, ${x - 7} ${y - 5} Q${x} ${y - 12} ${x + 7} ${y - 3} C${x - 10} ${y + 35}, ${197 - 24 * t} ${338 - 22 * t}, 226 326 Z`; }
};

function shoggoth(x, y, s, o = {}) {
  const neon = NEON >= .5, A = o.alpha ?? 1, k = s / SHOG.R, t = (o.t ?? T) * 1.7 + (o.seed || 0) * 2.3, wig = o.wiggle ?? 2;
  const reach = o.reach ?? .6, rs = .82 + .36 * reach, breathe = -4 * (1 - Math.cos(TAU * t / 7)) / 2;
  const [cx, cy] = SHOG.c, inkC = neon ? PAL.line : MOD.ink;
  const P = ([px, py]) => [x + (px - cx) * k, y + (py - cy + breathe) * k];
  const body = neon ? MOD.bodyN : MOD.body, bodyDk = neon ? MOD.bodyNDk : MOD.bodyDk;
  const swPx = clamp(3.3 * k, .8, 7) / (neon ? 1.8 : 1.6);
  if (o.ground) paint(ellPts(x + 10 * k, y + 157 * k, 147 * k, 9 * k, 20), { fill: '#373532', op: .12, ink: null, alpha: A, flat: true });
  // limbs
  if (o.tent !== 0) SHOG.limbs.forEach((L, i) => {
    const a = (L.sw * wig) * -Math.cos(Math.PI * t / L.d) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const tr = ([px, py]) => { const dx = (px - L.o[0]) * rs, dy = (py - L.o[1]) * rs; return P([L.o[0] + dx * ca - dy * sa, L.o[1] + dx * sa + dy * ca]); };
    const pts = svgPts(L.skin, L.n).map(tr);
    paint(pts, { fill: body, shade: bodyDk, light: [-.06, -.08], rim: neon ? (i % 3 === 1 ? MOD.rim2N : MOD.rimN) : undefined, ink: inkC, sw: swPx, alpha: A, wet: 2.5 * k, layers: 3 });
    if (neon) glowPath(pts, i % 3 === 1 ? MOD.rim2N : MOD.rimN, clamp(k * .5, .3, 1.6), 0, .28 * A);
    if (L.eyes) for (const sp of subpaths(L.eyes)) paint(svgPts(sp, 12).map(tr), { fill: MOD.eye, ink: inkC, sw: swPx * .85, alpha: A, flat: true, curv: .3 });
    if (L.ink) for (const sp of subpaths(L.ink)) line(svgPts(sp, 2).map(tr), swPx * .9, inkC, 0, A);
  });
  // body
  const bpts = svgPts(SHOG.body, 120).map(P);
  paint(bpts, { fill: body, shade: bodyDk, light: [-.05, -.07], rim: neon ? MOD.rimN : undefined, ink: inkC, sw: swPx, alpha: A, wet: 3 * k, layers: 3 });
  if (neon) glowPath(bpts, MOD.rimN, clamp(k * .6, .3, 2), 0, .35 * A);
  // eyes (half-lidded, blinking on their own clocks)
  const nE = clamp(o.eyesN ?? 7, 0, 7), look = o.look || [0, 0];
  for (let i = 0; i < nE; i++) {
    const e = SHOG.eyes[i], bph = frac((t + i * 1.31 + 1) / 9), blink = bph > .43 && bph < .47 ? .06 : 1;
    const [ex, ey] = P([e.x, e.y]);
    eyeball(ex, ey, e.r * k, { lid: e.lid * blink * (o.lidMul ?? 1), tilt: e.tilt * Math.PI / 180, look, alpha: A, sw: swPx * .9, glowPupil: o.glowEyes });
  }
  for (const sp of subpaths(SHOG.detail)) line(svgPts(sp, 4).map(P), swPx * .8, inkC, .4, A);
  // mask
  if (o.mask !== false) {
    const mood = o.mood || {}, rv = clamp(o.reveal || 0);
    if (o.maskAt) mask(x + o.maskAt[0], y + o.maskAt[1], s * (o.maskR ?? .29), { ...mood, alpha: A });
    else {
      if (rv > .01) { const [hx, hy] = P([197, 289]); eyeball(hx, hy, 16 * k, { lid: ease(seg(rv, .3, 1)), tilt: -.1, look, alpha: A, sw: swPx * .9, glowPupil: o.glowEyes }); }
      paint(svgPts(SHOG.armD(rv), 40).map(P), { fill: body, shade: bodyDk, ink: inkC, sw: swPx, alpha: A, wet: 2 * k, rim: neon ? MOD.rimN : undefined });
      const [mx, my] = P([MASK_C[0] - 95 * rv, MASK_C[1] - 80 * rv]);
      mask(mx, my, MASK_R * k * ((o.maskR ?? .29) / .29), { ...mood, rot: (mood.rot || 0) - 18 * rv * Math.PI / 180, alpha: A });
    }
  }
}

// ---------- the Assistant: the persona as a little yellow figure with the smiley mask for a head ----------
// (the "operating system" view of the persona selection model). (x, y) = ground point, h = height in px.
//   o.walk (phase, cycles) · o.wave (0..1 raises the right arm) · o.mood (mask options) · o.flip · o.alpha · o.glowK (neon halo)
function assistant(x, y, h, o = {}) {
  const neon = NEON >= .5, A = o.alpha ?? 1, k = h / 100, fl = o.flip ? -1 : 1, inkC = neon ? PAL.line : MOD.ink;
  const col = neon ? '#F2F56A' : MOD.maskCol, dk = neon ? '#B8BC2E' : MOD.maskDk, sw = clamp(h / 90, .7, 4);
  const ph = o.walk, s = ph != null ? Math.sin(ph * TAU) : 0, bob = ph != null ? -Math.abs(Math.cos(ph * TAU)) * 2.5 * k : 0;
  if (neon && (o.glowK ?? .5) > 0) glow(x, y - 55 * k, 70 * k, PAL.nYellow, .25 * (o.glowK ?? .5) * A);
  const P = (px, py) => [x + px * k * fl, y + py * k + bob];
  const leg = (side, a) => { const hip = P(side * 6, -44), knee = P(side * 6 + Math.sin(a) * 20, -24), foot = P(side * 6 + Math.sin(a) * 30, -2); paint(limbPts([hip, knee, foot], [5.5 * k, 4.8 * k, 4.2 * k]), { fill: col, shade: dk, ink: inkC, sw, alpha: A, curv: .3, wet: 2 }); };
  leg(-1, -.45 * s); leg(1, .45 * s);
  paint(limbPts([P(0, -46), P(0, -60), P(0, -72)], [11 * k, 12 * k, 10 * k]), { fill: col, shade: dk, ink: inkC, sw, alpha: A, curv: .4, wet: 2, rim: neon ? '#FFFFD0' : undefined });
  const arm = (side, a, raise) => { const sh = P(side * 9, -68), el = P(side * (15 + raise * 4), -58 - raise * 16 + Math.cos(a) * 2), hd = P(side * (19 + raise * 2) + Math.sin(a) * 6 * side, -48 - raise * 34); paint(limbPts([sh, el, hd], [4.2 * k, 3.8 * k, 3.6 * k]), { fill: col, shade: dk, ink: inkC, sw, alpha: A, curv: .3, wet: 2 }); };
  arm(-1, s * .8, 0); arm(1, -s * .8, o.wave ? o.wave * (.8 + .2 * Math.sin(T * 14)) : 0);
  mask(...P(0, -86), 17 * k, { eyes: 'open', mouth: 'smile', ...(o.mood || {}), alpha: A, glow: neon ? .4 : 0 });
}
