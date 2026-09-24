# Take Me (To the Moon)

A procedurally animated, beat-synced music video for *Take Me (To the Moon)* by Ian Asher & D A N N Y. It's a Singularity × Edgerunners-style edit starring an evals researcher and his shoggoth. Every frame is painted in code. It uses the same approach as [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo): each shot is a pure function of song time, painted in headless Chrome, with a storyboard and animation guide that briefed parallel chapter painters. On top of that it adds:

- **Real beat sync.** `analysis/*.py` beat-tracks the song with librosa (175 BPM, phrase and break map) into `src/song.js`, and every one of the 188 cuts lands on a beat or half-beat.
- **An edit layer** (`src/fx.js`, `autoEdit` in `src/timeline.js`): zoom punches on every beat, slams when the bass returns, whip / zoom / spin / glitch / ink transitions, RGB split, glitch slices, flashes, bloom, halftone, scanlines and captions.
- **Two render styles on one scene graph.** `style(0)` is watercolour and ink on paper; `style(1)` is neon anime cel. `splitStyle()` wipes one into the other, and the hero's lab coat becomes his bomber when the world is re-rendered.
- **CPU-only rendering.** It's Canvas2D, not WebGL, so a frame takes roughly 20–500 ms on 2 cores, and the full 4,764 frames render in about 7 minutes.


The shoggoth is ported path-for-path from the one on theryanhartman.com (`personal_site_2/src/lib/components/Shoggoth.svelte`).

## Files

| Path | What it is |
|---|---|
| `STORYBOARD.md` | Story, cast, palette arc, beat map and the shot list per act |
| `ANIMATION_GUIDE.md` | The engine API and rules the chapter painters followed |
| `src/song.js` | Beat grid, phrases, breaks and per-beat energy (generated) |
| `src/core.js` | Timing helpers, seeded jitter, geometry, `paint()`, camera, text |
| `src/fx.js` | Post-processing: the TikTok edit layer |
| `src/timeline.js` | Chapters, transitions, auto-edit, frame driver |
| `src/hero.js` | The researcher (rigged; front / ¾ / side / back; lab coat → bomber with the Dyson-sphere emblem) |
| `src/model.js` | The mask and the shoggoth |
| `src/world.js` | Sets and props (city, moon, Earth, monitors, charts, rockets, Dyson sphere…) |
| `src/ch/c01…c07` | The seven acts |
| `render.mjs` | The Playwright renderer (sheets, stills, clips, frames, encode) |

## Rendering

Needs Node, Playwright's Chromium and ffmpeg. Put your own copy of the song at `assets/moon_src.mp3` (it isn't included; see `assets/README.md`). `npm install` fetches Playwright; then `npx playwright install chromium`.

```bash
node render.mjs --frames=0:158.8 --workers=2          # all frames → out/frames (resumable)
node render.mjs --encode --out=out/take_me_to_the_moon.mp4
node render.mjs --sheet=68.6,69,69.4 --cols=3 --out=out/check.jpg   # quick contact sheet
```

## Media

- `media/take_me_to_the_moon_v1.mp4`: the full video (a repo-sized encode)
- `media/take_me_to_the_moon_v1_30s.mp4`: the 30 s cutdown (final drop → ending)
- `media/stills/`: contact sheets
