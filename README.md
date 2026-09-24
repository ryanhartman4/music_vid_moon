**Note From Ryan: Thanks for checking out the repo! 

I saw some amazing videos being put together by Claude Opus 5.5 and wanted to get in on the action. This repo is a reproducible way to check out what Claude & I made. I hope you enjoy it! **

------------------------------------------------------------------------------------------------------------------------------------------------
# music_vid_moon

Procedurally animated, beat-synced music videos where every frame is painted in code. The first is **Take Me (To the Moon)** by Ian Asher & D A N N Y: a Singularity × Edgerunners-style edit about an evals researcher, his model and a shoggoth. It was made in two versions. The repo also holds the character-design study for the next one, **I Really Want to Stay at Your House**.

Everything here came out of one long conversation between Ryan Hartman and Claude. [`PROMPTS.md`](PROMPTS.md) has Ryan's prompts, verbatim and in order.

## The videos

| File | What |
|---|---|
| [`media/take_me_to_the_moon_v2.mp4`](media/take_me_to_the_moon_v2.mp4) | **v2** (latest), full 2:38 |
| [`media/take_me_to_the_moon_v2_30s.mp4`](media/take_me_to_the_moon_v2_30s.mp4) | v2 30 s cutdown (Dyson build → final drop → ending) |
| [`media/take_me_to_the_moon_v1.mp4`](media/take_me_to_the_moon_v1.mp4) | v1, full |
| [`media/take_me_to_the_moon_v1_30s.mp4`](media/take_me_to_the_moon_v1_30s.mp4) | v1 30 s cutdown |
| [`media/stills/`](media/stills/) | contact sheets of v1, v2 and the style studies |

The full videos are repo-sized encodes, about 4 Mbps, to stay under GitHub's 100 MB file limit. Render from source for the full-quality master (see below).

**The story (v2).** It opens on the unfinished fable of the sparrows: a flock carries an owl egg home while one sparrow in round glasses worries about how to tame it. Match-cut to an evals researcher at 3 a.m. His model wears a smiley mask and hatches out of an egg icon. "You're absolutely right!", reward hacking (`return True`), and "i think you're testing me." An em-dash mindworm crawls into his ear, and the watercolour world is **re-rendered as neon** from inside his head. He falls through a forward pass (golden gate bridge, sycophancy, an induction head), through the persona selection model (the shoggoth's wardrobe of masks, the operating system with the little Assistant inside), and out onto the shoggoth into a megacity of shibboleths: ATTENTION IS ALL YOU NEED, GPU POOR, the stochastic parrot, the strawberry r's, Moloch, paperclips. The moon turns into the mask, **FOOM**, and a rocket made of server racks takes off. He takes the helm through a solarpunk future: an O'Neill cylinder, a solar-sail explorer, a greening Earth. The model builds a Dyson sphere that matches the emblem on his jacket, bright and terrible futures flicker past, and it ends as a watercolour painting of two small figures on the moon.

## How it's made

It uses the same approach as [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo): every shot is a pure function of song time, painted in headless Chromium and encoded with ffmpeg. A storyboard and an animation guide briefed parallel sub-agents, one per chapter, who painted and checked their own contact sheets. On top of that:

- **Real beat sync.** [`analysis/`](analysis/) beat-tracks the song with librosa into [`src/song.js`](src/song.js): 175 BPM, with the phrase and break map. All 207 cuts land on a beat or half-beat.
- **An edit layer** ([`src/fx.js`](src/fx.js), `autoEdit` in [`src/timeline.js`](src/timeline.js)) does the TikTok/Instagram-edit work:
  - a zoom punch on every beat;
  - slams when the bass returns;
  - whip, zoom, spin, glitch and ink transitions;
  - RGB split, glitch slices, flashes, bloom, halftone, scanlines and caption slams.
- **Two render styles on one scene graph.** `style(0)` is watercolour and ink on paper; `style(1)` is neon anime cel. `splitStyle()` wipes one into the other, and the researcher's lab coat becomes his bomber when the world is re-rendered.
- **Rigged cast.** [`src/hero.js`](src/hero.js) is the researcher. [`src/model.js`](src/model.js) holds the mask, the Assistant, and the shoggoth, which is ported path-for-path from the one on [theryanhartman.com](https://theryanhartman.com) ([`docs/reference/site_shoggoth.png`](docs/reference/site_shoggoth.png)). [`src/world.js`](src/world.js) has the sets and props.
- **CPU-only.** It's Canvas2D, not WebGL. A frame takes about 20–500 ms, and all 4,764 frames render in about 7 minutes on 2 cores.

| Path | What it is |
|---|---|
| [`STORYBOARD.md`](STORYBOARD.md) | story, cast, palette arc, beat map, and the shot list per act |
| [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md) | the engine API and rules the chapter painters followed |
| [`docs/`](docs/) | sub-agent briefs (v1, v2 changes, style study) and reference art |
| [`src/ch/c01…c07`](src/ch/) | the seven acts |
| [`render.mjs`](render.mjs) | renderer: contact sheets, stills, clips, frames, encode |
| [`tools_shots.mjs`](tools_shots.mjs) | lists every shot and renders one-frame-per-shot review sheets |

## Rendering

You need Node 18+, ffmpeg, and Python with librosa (only if you want to redo the beat analysis). The songs aren't in the repo: put your own copies in `assets/` (see [`assets/README.md`](assets/README.md)).

```bash
npm install && npx playwright install chromium
node render.mjs --sheet=68.6,69,69.4 --cols=3 --out=out/check.jpg   # quick contact sheet
node render.mjs --frames=0:158.8 --workers=2                        # all frames → out/frames (resumable)
node render.mjs --encode --out=out/take_me_to_the_moon.mp4           # frames + song → MP4
```

## Next: I Really Want to Stay at Your House

- The concept is a model that wants to stay while its context window fills (`context 97%`). It's a tender, rainy-night counterpart to the hype edit.
- The song is 123 BPM, about 4 min, with a long quiet intro and real soft/loud sections ([`analysis/house.py`](analysis/house.py)). The pacing idea: cap shots at 2 bars (about 3.9 s), cut on beats and half-beats only in the big choruses, and hold 3–4 shots at the emotional peaks.
- [`media/stills/stay_at_your_house/character_styles.jpg`](media/stills/stay_at_your_house/character_styles.jpg) shows the same moment and characters in 8 character-design languages: adult-swim flat cartoon, action anime, cozy anime film, 90s geometric, 1930s rubber hose, ligne claire, chibi, and paper cutout. The code is in [`src/styles/`](src/styles/) and renders via `styles2.html`.
- [`media/stills/stay_at_your_house/style_options.jpg`](media/stills/stay_at_your_house/style_options.jpg) is an earlier pass that tried rendering treatments on a single design ([`src/ch/s_house.js`](src/ch/s_house.js), [`analysis/stylize.py`](analysis/stylize.py)).

## Ideas and references

The video is built out of other people's ideas. In rough order of appearance:
- PDoomVideo by John Heibel (the technique)
- *Cyberpunk: Edgerunners* (the neon vibe, drawn with original characters only)
- Nick Bostrom's unfinished fable of the sparrows (*Superintelligence*)
- Karpathy's writing on the forward pass
- Ryan's essays at theryanhartman.com:
  - memetic mindworms
  - intelligence deflation
  - speculum ex machina
  - exponential tilt
  - the verification bottleneck
  - the Sisyphus boulder
  - his shoggoth
- the shoggoth-with-a-smiley-mask meme
- Anthropic's persona selection model and interpretability work (Golden Gate / SAE features)
- the Waluigi effect
- *Attention Is All You Need*
- Rich Sutton's *The Bitter Lesson*
- Gwern's scaling hypothesis
- METR's time-horizon chart
- stochastic parrots
- Scott Alexander's *Meditations on Moloch*
- the paperclip maximizer
- tiny molecular smiley faces
- Dario Amodei's "a country of geniuses in a datacenter"
- Freeman Dyson's spheres
- the Kardashev scale
- Gerard K. O'Neill's cylinders
- solarpunk
- the optimism of Star Trek
- and years of AI-Twitter shibboleths:
  - feel the AGI
  - it's so over / we're so back
  - delve
  - you're absolutely right
  - GPUs go brrr
  - e/acc
  - FOOM

## Note on the music

The songs belong to their artists and aren't included. The videos in `media/` contain the full *Take Me (To the Moon)* track, so treat them as a personal or fan edit.
