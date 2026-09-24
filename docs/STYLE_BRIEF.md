# Style study brief: one key frame, many character-design languages

Ryan is choosing the art style for the next video, a somber one set to "I Really Want to Stay at Your House". He wants to see **character-design languages**, meaning the kind of difference between Rick and Morty and Edgerunners: proportions, head and face construction, eye design, line quality, how shading is done, and how backgrounds are rendered. A palette swap doesn't count. Each painter draws **the same moment, with the same three characters**, fully redesigned in one style. It's one 1920×1080 still.

## The moment
A rainy night in a small apartment. It's a **medium shot**: we see him from about the knees or waist up, sitting on a couch in **three-quarter view facing screen-left**. His face must be clearly visible because it's the point of the comparison. He's looking down at an open laptop on his lap. Its cool glow lights his face, and the screen shows a tiny `context 97%` bar in pink/red.

**The Assistant** sits on his shoulder, or on the top edge of the laptop lid, leaning its head against him affectionately. He's half-smiling but sad.

**The shoggoth** is curled up asleep at the end of the couch, with its mask resting on its little arm.

Behind them, a rain-streaked window shows city lights and a moon. The mood is tender, melancholy and cozy: blue hour and a lamp. There's no text except the tiny laptop bar.

## The characters (keep these identity traits in every style so they're recognisable)
- **Him (the researcher):**
  - A young man with messy dark hair, a cowlick sticking up at the crown, and round glasses.
  - Clothes: an oversized indigo/violet bomber jacket with orange ribbed collar and cuffs over a dark shirt, with a small yellow smiley pin on the chest.
  - Dark pants.
- **The Assistant:** a small yellow humanoid. Its head *is* the smiley mask: a pale-yellow (#F5FA83) slightly lopsided oval with two short vertical dash eyes and a lopsided smile that's higher on the right.
- **The shoggoth** (Ryan's own design from his website):
  - A sage-green (#99B087) lumpy, cloud-scalloped body with dark outlines.
  - Crooked horn-like limbs, one of which curls into a spiral, plus pointed little legs.
  - Several almond-shaped eyes, many half-lidded, and one big central eye.
  - It holds the pale-yellow smiley mask up on a small arm.
  - Asleep here: eyes shut or almost shut.
  - Redraw it in the style. In a rubber-hose version, for example, it becomes a rubber-hose creature, but it keeps those traits.

## Rules
- **These are original characters drawn in a genre style.** Never draw or imitate a real show's characters: no Rick or Morty lookalikes (no spiky blue hair, no drool, no lab-coat old man), no Edgerunners characters or signature outfits, no Cuphead heads, no Ghibli characters, no Tintin quiff. Borrow the *design language*, not the cast.
- Write everything in **your own file**, `src/styles/<name>.js`, wrapped in an IIFE. Register it as `chapter('<name>', K, K + 1, [[K, fn]])`, where K is your slot number. Shared helpers you may use are in `src/core.js` (paint, line, glow, vgrad, wash, txt, easing, geometry: read it), `src/fx.js` (FX post flags) and `src/world.js`. **Draw the characters yourself** with Canvas2D paths (`X.beginPath()`, `bezierCurveTo`, `quadraticCurveTo`…) or `paint()` point lists. The stock `hero()`/`shoggoth()`/`mask()` are the *old* design language, so don't use them for your characters.
- Set `FX.noAuto = true`. Pick the post settings that suit your style: `style(0)` gives paper grain; `style(1)` gives bloom and scanlines. You can override with `FX.grain`, `FX.scan`, `FX.bloom`, `FX.halftone`, `FX.sat`, `FX.tint/tintA`, or draw your own texture.
- Pure function of time; no `Math.random()`. It's a still, but gentle rain or boil is fine.
- Render with `cd /home/claude/moon && node render.mjs --page=styles2.html --stills=<K+.5> --out=out/styles2/<name>`, then look at it with the Read tool (and crop regions with python/PIL to check faces up close). **Iterate until it's genuinely good:** appealing, clearly in the style, with faces full of feeling. Several agents share 2 CPU cores, so render only what you need.
- When done, reply with the output path and 2–3 sentences on the design choices (proportions, eyes, line, shading) and how it would animate.
