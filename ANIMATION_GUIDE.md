# Animation guide (read this before painting a chapter)

This project renders the 158.8 s music video for *Take Me (To the Moon)* as a beat-synced TikTok/Instagram-style edit. It opens in **watercolour** and gets re-rendered as **neon anime cel** once the model takes off. Frames are painted in headless Chromium with a Canvas2D engine and rendered offline. The machine is CPU-only, so keep shots cheap. The shot list is in [STORYBOARD.md](STORYBOARD.md).

## How a chapter works

Each chapter is one file in `src/ch/`, wrapped in an IIFE so its helpers stay private:

```js
// src/ch/c03_city.js
(() => {
  const B = n => bt(n);                          // beat n → seconds (song.js)
  function street(t, lt, dur) { style(1); ... }  // a shot: paints the ENTIRE frame
  function parrotGag(t, lt, dur) { ... }
  chapter('city', bt(136), bt(200), [
    [bt(136), street],
    [bt(152), parrotGag, { tin: 'whip' }],        // transition INTO this shot
    ...
  ]);
  POSTCARDS.city = (t) => street(t, 1.2, 2.7);   // exported for the callback montages
})();
```

- `chapter(name, start, end, shots)` registers the chapter. **Chapter bounds must be exact `bt(n)` values** so neighbouring chapters meet with no gap. A shot fn is called as `fn(t, lt, dur)` (song time, time since shot start, shot length). It must paint the **whole frame**, background included, and must call `style(0)` (watercolour) or `style(1)` (neon) first.
- `opts.tin` is the transition into a shot, centred on the cut: `'cut'` (default), `'flash'`, `'white'`, `'black'`, `'whip'`, `'whipV'`, `'zoom'`, `'spin'`, `'glitch'`, `'shake'`, `'ink'` (watercolour only). `opts.td` sets its length (default .24 s). Most cuts in an edit are **hard cuts on the beat**. Use transitions sparingly, as accents.
- **Frames render in parallel and out of order.** Every shot must be a pure function of `t`. Use `hash(i)` for stable randomness and `rnd()`/`jit(a)` for hand-drawn boil. Both are reseeded 12×/s, which makes watercolour linework boil. Never use `Math.random()` or state that carries between frames.
- Only edit your own chapter file. If a shared helper is missing, write it privately inside your IIFE. If you find a real bug in a shared file, report it instead of editing it. Shared files: `song.js`, `core.js`, `fx.js`, `timeline.js`, `hero.js`, `model.js`, `world.js`, `studio.html`, `render.mjs`.
- `POSTCARDS` is a global object (declared in timeline.js). Export the postcards the storyboard lists for your chapter as `POSTCARDS.name = t => shot(t, lt, dur)`. They're used by the callback montages in `c04` and `c07`, so they must paint a full frame and call `style()`. A montage should call `(POSTCARDS.x || fallback)(t)` because chapters load in order.

## The song clock (song.js)

- 175 BPM. `bt(n)` = time of beat n (fractional allowed: `bt(8.5)` is the "and"). `BEAT` = 0.3429 s, a bar is 4 beats, a phrase is 64 beats.
- `PHRASE = [8, 72, 136, 200, 264, 328, 392]`: the bass slams back in on each. `BREAKS` = bass-out ranges.
- `bpOf(t)` gives the beat position, `beatN(t)` the integer beat, `pulse(t, k)` = 1 on each beat decaying, `pulse2` the same on eighths, `since(t, n)` = seconds since beat n.
- Put the important action of a shot on beats. A cut *is* a beat. Inside a shot, hits (a stamp, an eye blink, a light turning on) land on `bt(n)`.

## The edit layer (what makes it a TikTok edit)

`autoEdit` in timeline.js already does the following, from the song map:
- a **zoom punch + small shake on every beat** (scaled by section intensity: 0 in breaks, .35 in Act I, 1 in the drops), plus RGB flicker on off-beats in the drops;
- a **slam** every time the bass returns (flash + RGB split + glitch + shake + zoom, lasting 0.5 s);
- in breaks, a slow push-in, with a rattle on the last beat.

A shot can shape the edit through the global `FX` object (reset every frame). Write to it anywhere in the shot:

| field | effect |
|---|---|
| `FX.noAuto = true` | disable the automatic edit for this frame |
| `FX.punch` | multiplier on the auto punch (0 = none, 2 = double) |
| `FX.zoom, FX.rot, FX.dx, FX.dy` | whole-frame transform (after your camera) |
| `FX.shake` | px of camera shake |
| `FX.rgb` (0..1), `FX.rgbAng` | chromatic split |
| `FX.glitch` (0..1) | horizontal slice displacement + neon slabs |
| `FX.flash` (0..1), `FX.flashCol` | full-frame flash |
| `FX.invert` (0..1) | negative flash |
| `FX.blur` (px), `FX.blurAng` | directional motion blur (whips) |
| `FX.zblur` (0..1) | zoom blur |
| `FX.ghost` (0..1) | additive echo (dreamy / high) |
| `FX.bloom` | override the bloom (neon default .55) |
| `FX.halftone` (0..1) | comic dot overlay |
| `FX.sat` (0..1) | desaturate |
| `FX.tint, FX.tintA` | colour grade toward a colour |
| `FX.letterbox` (0..1) | cinematic bars |
| `FX.scan, FX.grain` | scanline / paper-grain strength |

**Captions:** `cap(text, x, y, size, colour, opts)` queues screen-space edit text. It's drawn after the zoom, so it glitches along with the frame. Options are the same as `txt()`: `{ font:'Anton', stroke:'#000', sw, glow: colour, pop: 0..1, rot, alpha, track, skew }`. House style: **Anton**, white or neon yellow, black stroke `sw ≈ size*.12`, popping in with `pop: since(t, n) * 6`. Use only the captions the storyboard lists. Text-light is the rule, and **never lyrics**.

**Time tricks inside a shot** (core.js): `stutter(lt, every, len)` (repeat slices), `ramp(lt, dur, slow, at)` (slow-mo then snap), `hold(lt, from, len)` (freeze frame), `onTwos(t)` (anime 12 fps motion; nice for neon character animation).

## Canvas and drawing API (core.js)

- 1920×1080, y down. The scene context is the global `X` (a CanvasRenderingContext2D), and you can use it directly (`X.save()`, `X.translate()`, gradients…).
- `style(v)`: 0 = watercolour (paper, layered translucent fills, boiling ink), 1 = neon cel (flat fills, hard cel shade, bold dark lineart, glow, bloom + scanlines in post).
- `paint(pts, o)` paints one shape from `[[x, y], ...]`:

| option | meaning |
|---|---|
| `fill` | base colour (omit for outline-only) |
| `shade` | darker colour: a watercolour settle / hard cel shadow on the side away from `light` (`[dx, dy]` fraction of size, default `[-.1,-.14]`) |
| `rim` | neon only: a bright rim on the lit edge |
| `ink` | outline colour; **`ink: null` = no outline**. `sw` = weight (≈ 1–4) |
| `curv` | smooth the outline through the points (0–1) |
| `glow`, `glowW`, `glowA` | neon halo around the outline |
| `hatch: {col, gap, ang, w, op}` | hatching clipped to the shape |
| `alpha`, `op` | overall opacity / fill opacity |
| `flat: true` | a single clean fill even in watercolour (small details: eyes, windows) |
| `wet`, `layers` | watercolour wobble (px) and layer count |

- Geometry: `rectPts`, `ellPts(cx, cy, rx, ry, n, jitter, rot)`, `rrPts` (rounded rect), `starPts`, `polyPts`, `heartPts`, `capsule`, `ribbon(spine, wFn)`, `limbPts(spine, widths)`, `xform(pts, dx, dy, s, rot)`, `deform(pts, a)`, `bbox`.
- Lines and light: `line(pts, sw, col, curv, alpha, close)`, `neonLine(pts, col, w, alpha, curv, close)` (a glowing tube), `glowPath(pts, col, w)`, `glow(x, y, r, col, a, comp)` (radial light. Default comp `'lighter'`. **In watercolour use `'source-over'`**, or 'lighter' will bleach the paper), `vgrad(x, y, w, h, [[0, col], [1, col]])`, `wash(pts, col, a, wet, n)` (blotchy watercolour flat with a pooled edge), `blooms(x, y, w, h, col, n, a, seed)` (pigment blotches), `bg(col)`.
- Watercolour backgrounds: start with `X.drawImage(PAPER, 0, 0)`, then `wash` big areas and `blooms` for texture. Paper grain is multiplied on top in post automatically.
- Neon backgrounds: `vgrad` dark gradients (`PAL.void`, `PAL.deep`, `PAL.plum`), then neon accents. Bloom picks up anything bright.
- `txt(s, x, y, size, col, o)` draws text in the scene (it goes through your camera). Fonts: `'Marker'` (painted lettering), `'Caveat'` (handwriting), `'Anton'` (edit captions), `'Orbitron'`/`'Rajdhani'` (HUD), `'Shantell'`, `'JP'` (katakana/kanji for signs).
- Camera: `camBegin(cx, cy, zoom, rot)` puts world point (cx, cy) at screen centre; `camEnd()`. One level; always pair them.
- `splitStyle(draw, clipFn, edgeCol)`: draws `draw()` in watercolour, then again in neon, and shows the neon version inside the path `clipFn(ctx)` builds, with a glowing edge. Use it for the re-render wipe. `draw` must paint a full frame.
- Palette `PAL`: watercolour `paper ink cream night indigo ochre rose clay sap teal violet sky slate`; neon `void deep plum nYellow nCyan nMagenta nPink nOrange nRed nGreen nViolet line`; the mask `mask maskDk`. `mixCol(a, b, k)`, `rgba(hex, a)`.
- Timing and easing: `seg`, `kf(t, [[t0, v0], ...], easeFn)`, `ease easeOut easeIn easeInOut expoOut expoIn backOut elasticOut`, `lerp clamp frac wob hash hash2 TAU`, `shakeXY`.

## Characters

**The Researcher**: `hero(x, y, h, o)`. (x, y) is the ground point between the feet; h is the standing height in px (the head is ~20% of h). A lead in a medium shot is h ≈ 500–700; for a close-up use h ≈ 2000–3500 and frame the head with the camera (or position y so the head sits where you want: the head centre is at `y - .89h`).
- `view: 'front' | 'q' (three-quarter) | 'side' | 'back'`, `flip` (face left).
- `outfit` defaults from the style: **'lab'** in watercolour, **'bomber'** in neon. `'space'` = bomber (use with `helmet: 1`).
- Pose: `aL/aR = [shoulder, elbow]`, `lL/lR = [hip, knee]` in radians (0 = hanging down; + = forward/outward), `lean`, `rot`, `dy`, `sq`, `tilt` (head). Presets are in `POSES` (`stand hips cheer point type sit jackIn float`); cycles `runPose(phase, amt)` and `walkPose(phase, amt)` return pose objects to spread in: `hero(x, y, h, { view: 'side', ...runPose(t * 2.9) })`. A run phase of `bpOf(t) / 2` keeps the steps on the beat.
- Face: `eyes` (open happy closed wide narrow star tired determined sad), `lookX/lookY`, `mouth` (smile grin o O flat open teeth wobble smirk), `brows` (up worried angry flat), `blush`, `sweat`, `glint` (glasses), `chrome` (0..1 implant glow), `hairWind`.
- `emblem` (0..1): extra glow on the Dyson emblem (back view). `helmet` (0..1). `silhouette: colour` draws a flat silhouette, for afterimage trails: `afterimages(5, (i, col, a) => hero(x - i * 60, y, h, { ...pose, silhouette: col, alpha: a }))` (col is null and a = 1 for the live pose; pass no silhouette then). `handL/handR(k, sw)` hooks draw props at the hands in hand space (body units, k = 1).
- `dysonEmblem(cx, cy, r, glowK)` draws the emblem standalone (patches, HUD, hero graphics).

**The Model**:
- `mask(x, y, r, o)`: the smiley. `eyes` (open happy wink narrow star heart x glitch wide dot closed), `mouth` (smile grin o whistle open flat wobble smirk), `look [x, y]`, `rot`, `tilt3d` (fake yaw), `eyeGlow` (neon cyan eyes), `glow`, `crack`, `sweat`, `alpha`, `col`.
- `shoggoth(x, y, s, o)`: body radius s. `tent` (count), `reach` (0..1), `eyesN`, `mood` (mask options), `maskAt [dx, dy]`, `maskR`, `seed`, `look`, `t` (animation time; pass `onTwos(t)` for anime timing).
- `tentacle(x, y, ang, len, w, t, seed, o)`: a single tentacle; returns its spine points (so you can attach things to the tip).

## Props and sets (world.js)

`skyNight(t, o)`, `stars(t, n, o)`, `moon(x, y, r, {face: maskOpts, faceA})`, `earth(x, y, r)`, `city(t, {horizon, scroll, signs, lit, tall, seed, street})`, `rain(t, o)`, `speedLines(cx, cy, k)`, `room(t, o)`, `windowFrame(x, y, w, h, t, o)`, `desk(x, y, w)`, `monitor(x, y, w, h, o, drawScreen)`, `chart(x, y, w, h, 'loss'|'up'|'metr'|'tilt', progress, o)`, `battery(x, y, s, v)`, `stamp(x, y, s, word, col, k)`, `emdash(x, y, s, ang)`, `rack(x, y, s)`, `gpu(x, y, s)`, `paperclip(x, y, s, rot)`, `rocket(x, y, s, {flame, window:'mask'})`, `train(x, y, s, {windowFn})`, `dysonSphere(x, y, r, build)`, `hud(x, y, w, h, {label, col})`, `afterimages(n, fn)`, `boulder(x, y, r, {words, rot})`, `parrot(x, y, s)`, `signBoard(x, y, w, h, text, col)`. Read world.js for the details; each is short.

## Style rules

- **Watercolour act:** paper texture, soft layered fills, boiling ink outlines (`sw` ≈ 1.5–3), warm lamp light pooled with `glow(..., 'source-over')`. Picture-book charm.
- **Neon act:** near-black violet backgrounds; flat fills with hard cel shadows (`shade`) and rim light (`rim`); thick dark lineart; neon tubes (`neonLine`) and signs; bloom does the rest. Edgerunners energy: acid yellow, cyan, magenta, rain, big moon, speed lines, rainbow afterimage trails when time slows. **Contrast:** characters must pop off the background. Use rim light, and keep backgrounds darker than characters.
- **Motion:** everything moves. Cameras drift, push and whip; characters bounce on beats; hits land on beats (squash and stretch, `backOut`, `elasticOut`). Shots are short (0.34–2.7 s), so the gag has to read instantly.
- **Composition for an edit:** big central subjects, strong silhouettes, symmetrical hero framing, close-ups for punches, wides for breaks. Vary the scale and angle between consecutive cuts (close → wide → side → back). Consecutive cuts of the same framing look like mistakes.
- **Performance:** frames currently render in 20–500 ms. Keep each frame under ~900 ms. Costs: `txt` with `glow` (shadowBlur), big `glow()`s, many `neonLine`s, and watercolour `paint`s (3 layers each). Hundreds of shapes are fine; thousands are not.

## Checking your work

From the project root (`/home/claude/moon`). The renderer uses the CPU, and several agents share 2 cores, so keep sheets small:

```
node render.mjs --sheet=46.7,47.2,47.8,48.4,49.0,49.5 --cols=3 --w=560 --out=out/check/c03_a.jpg
node render.mjs --stills=47.3 --out=out/check/c03_full
node render.mjs --clip=46.6:52 --scale=.5 --out=out/check/c03_a.mp4   # preview with audio (optional)
```

Open the sheet with the Read tool and look carefully. Check:
- the first and last frames of every shot, and a frame mid-shot;
- that motion reads across consecutive times (e.g. every 0.1 s around a hit);
- that neighbouring cuts vary framing and that hits land on the beat;
- that nothing is broken: no stray shapes at (0, 0), unclosed cameras, black frames or missing fonts;
- ms/frame (printed by the sheet command).

Iterate until each shot looks good: charming, readable, lively and on-model. Fix whatever looks off: scale, contrast, clutter, stiffness, empty frames.
