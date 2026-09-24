# Brief for chapter painters

You're painting one chapter of a procedurally animated music video. Everything is code: the project is at `/home/claude/moon`.

**Read first, in this order:** `ANIMATION_GUIDE.md` (the API and rules), then your act in `STORYBOARD.md` (plus the acts on either side, so your transitions connect), then skim `src/core.js`, `src/hero.js`, `src/model.js` and `src/world.js` to see what exists. `out/check/models.jpg`, `out/check/hero.jpg` and `out/check/cu2.jpg` are model sheets of the cast in both styles.

**Who it's for:** Ryan, an evals data scientist who writes essays about AI (theryanhartman.com). He asked for a Singularity × Cyberpunk-Edgerunners-inspired edit of *Take Me (To the Moon)* (Ian Asher & D A N N Y), with jump cuts that hit like TikTok/Instagram edits, full of AI-Twitter memes and his own blog's ideas. From his blog:
- *riding the shoggoth*: he calls himself an AI optimist "riding the shoggoth".
- *intelligence deflation / mental equity*: offloading thinking to AI because AI can do it tomorrow; his daily "mental equity" atrophies. The closing line is "I choose to do today, knowing that AI can do tomorrow."
- *memetic mindworms*: AI writing tics (em-dashes, "it's not X, it's Y") colonising his own writing.
- *speculum ex machina*: LLMs as a mirror, with the danger of Narcissus.
- *exponential tilt*: an optimal attack tilts a baseline distribution q into p ∝ q·e^(βs) within a KL budget.
- *forward pass*: a model is only "alive" during a forward pass.
- *verification bottleneck*: humans verifying AI output is the bottleneck.
- *the Sisyphus boulder* on his site lights up concept words as it rolls uphill.
- He likes Meditations on Moloch, The Scaling Hypothesis, and Karpathy's forward pass.
- AI-Twitter memes in play: shoggoth with smiley mask, "You're absolutely right!", reward hacking (`return True`), "I think you're testing me" (eval awareness), feel the AGI, it's so over / we're so back, line go up, the METR doubling chart, GPUs go brrr, stochastic parrot, strawberry r's, paperclip maximizer, FOOM, e/acc, Kardashev, data centres in space, Dyson spheres.

**Hard rules**
- Only create or edit **your own chapter file** (named in your task). Put test renders under `out/check/<your chapter>_*`. If a shared file has a bug or is missing something, write a private helper inside your IIFE, and mention the bug in your final report.
- **No song lyrics anywhere.** Only the captions and signs the storyboard names (you may add small signage words that are memes, not lyrics).
- **No franchise characters, logos or terms, and no real people, companies or lab logos.** The characters are ours (hero, mask, shoggoth). The Edgerunners *vibe* (neon, rain, moon, monorail, afterimage trails) is fine.
- Pure function of `t`. No `Math.random()`, no cross-frame state.
- The CPU is shared by several painters: keep contact sheets ≤ 9 frames at `--w=480..640`. Don't render full-resolution clips; `--clip ... --scale=.4` for short previews is fine if you really need one.

**Quality bar:** this is a showcase. Every shot should be charming, readable in half a second, on the beat, and alive. Make bold, big, well-composed frames: a strong central subject, clear contrast, and varied framing between consecutive cuts. Check the first, middle and last frame of every shot on contact sheets, and fix what looks off: scale, clutter, stiffness, empty space, muddy colour, anything drawn at (0, 0). Iterate several rounds. Keep ms/frame under ~900.

**When done**, reply with a short report: the shot list you implemented (beats → what happens), the postcards you exported, measured ms/frame range, and any shared-file bugs or API gaps you hit. Leave your final contact sheets in `out/check/`.
