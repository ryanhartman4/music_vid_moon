# V2: what changes (read after STORYBOARD.md)

Ryan loved v1. For v2 he wants: **more AI-Twitter shibboleths from the past few years**; the **em-dash mindworm crawling into his brain** as the trigger for the palette swap; the **persona selection model** visuals (Anthropic, 2026); **Bostrom's unfinished fable of the sparrows** (from the opening of *Superintelligence*) as a cold open; **optimistic post-singularity ideas** (he loves Star Trek and solarpunk), especially in the "human in control" moment; and the **moon bouncing replaced** by one-beat montages of the cool and scary futures a singularity could bring. Plus the three v1 weak spots.

The v1 code is the base. **Edit your chapter in place**, keeping everything that isn't listed here. The v1 sources are in `src_v1/` for reference. Keep all cuts on beats.

## New shared pieces (already in the engine)

- `assistant(x, y, h, o)` in model.js: the Assistant persona as a little yellow figure whose head is the smiley mask. Options: `walk` (phase), `wave` (0..1), `mood` (mask options), `flip`, `alpha`. Use it wherever "the Assistant" should appear as a character (the operating-system view, the futures montage).
- `shoggoth()` is now Ryan's own shoggoth from his website: sage green, crooked limbs, half-lidded eyes, and the mask held on its own little arm. `o.reveal` (0..1) lifts the mask to show the hidden eye. Its extent is about 4s wide and 3s tall.
- `SHARED.lattice(x, y, r, o)` is Act VI's Dyson lattice, which matches the jacket emblem. Options: `rings` (0..4 or an array), `panels`, `shell` (0..1 closed), `sun` (0..1), `swarm`, `spin`, `alpha`, `flash`, `ign`, `dim`, `t`. Always call it as `(SHARED.lattice || fallback)(...)`.
- `SIGNS` in `city()` now includes meme signage: DELVE, NO MOAT, Q*, RLHF, p(doom), CoT, MoE, GPU POOR.

## Shibboleth bank (use them where they read instantly: signs, HUD labels, captions, test names, chat bubbles)

Attention is all you need · scale is all you need · stack more layers · the bitter lesson · straight lines on a log plot · it's just a next-token predictor · stochastic parrot · delve · tapestry · "Certainly! Let's delve into…" · "As an AI language model…" · "Great question!" · let's think step by step · Thinking… · AGI achieved internally · feel the AGI · it's so over / we're so back · we're cooked · p(doom) · FOOM · e/acc · decel · Moloch · paperclips · shoggoth · the Waluigi effect · Golden Gate (the bridge-obsessed model / SAE feature) · grokking · double descent · Chinchilla-optimal · mixture of experts · Q* · no moat · GPU rich / GPU poor · compute is the new oil · reward hacking · sandbagging · alignment faking · sleeper agents · sycophancy · eval awareness · the sharp left turn · the treacherous turn · mesa-optimizer · RLHF · constitutional AI · superalignment · situational awareness · timelines · slow vs fast takeoff · a country of geniuses in a datacenter · machines of loving grace · the gentle singularity · tiny molecular smiley faces · tiling the lightcone · gray goo · wireheading · Kardashev · Dyson swarm · the persona selection model ("the Assistant", "the router", "the operating system").

Never show song lyrics. Never draw real people or real company logos. For Star Trek, use the *spirit* only: optimistic exploration, post-scarcity fabricators, a universal-translator handshake, medical miracles. No franchise ships (no saucer-plus-nacelles), no insignia, uniforms or quotes. Solarpunk is a genre, so use it freely: garden towers, solar sails, trams, art-nouveau curves, community greenery.

## Per chapter

### c01_lab (Act I)
1. **Cold open: the unfinished fable of the sparrows** (b0–16), a watercolour picture book.
   - b0–8: a painted sky with sparrows. The title `take me (to the moon)` and the credit `Ian Asher & D A N N Y` stay; add a small caption `after Bostrom's unfinished fable of the sparrows`.
   - b8–12: the flock carries a big speckled **owl egg** home through the sky, on the bass entry.
   - b12–16: on a branch, one sparrow wears **round glasses**, clutching a tiny book, worried (maybe a thought bubble with a big owl silhouette), while the others celebrate.
   - Match-cut at b16 from the sparrow's round glasses to the researcher's glasses.
   - No text from the book, just those images.
2. Compress the lab intro into **b16–24**: the desk wide shot (b16–20), then the monitor eval harness (b20–24). The harness gains shibboleth test names: test_sandbagging, test_alignment_faking, test_sleeper_agent, test_strawberry, test_golden_gate. The loss curve becomes **grokking**: it plateaus, then drops off a cliff, with a small label `grokking`.
3. b24: **the model hatches.** On the monitor an egg icon cracks and the smiley mask pops out (a callback to the owl egg). Keep "You're absolutely right!" at b28. You may add a quick chat line such as `Certainly! Let's delve into…`.
4. Add a few shibboleths to the room: sticky notes (`p(doom)?`, `stack more layers`, `bitter lesson`, `delve??`) and a book spine on the shelf reading `SUPERINTELLIGENCE` (title text only).
5. **The break becomes the worm** (b64–72, replacing the tentacle plug):
   - b64: he turns to the moon window.
   - b66: an em-dash mindworm slithers up his collar and into his **ear** (close side profile).
   - b68: a cute watercolour **cross-section of his head/brain**: the worm burrows in and **neon cyan circuitry spreads through the brain from it**. This is the first real neon in the film.
   - b70–71: stutter cuts of his eyes flickering neon, with `FEEL THE AGI` on b71.
   - The last half-beat pushes into his neon eye or ear, which Act II opens on.
   - No plug and no tentacle offer.
6. Update the postcards (`POSTCARDS.lab`, `.mask`, `.moonphoto`) if you change those shots, and add `POSTCARDS.sparrows` (the owl-egg flock).

### c02_jackin (Act II)
1. **b72 slam:** neon bursts OUT of his head, spreading from his ear and eyes: circuitry races across his watercolour face, and a chrome neck port appears. There's no plug and no tentacle; the worm did this. Then the `splitStyle` scan wipe (b73–80) starts **from his head's position** and sweeps outward (keep stepping on beats).
2. **Forward pass (b88–96):** add **mechinterp shibboleths**: sparse-autoencoder features lighting up as he passes (labels like `golden gate bridge`, `sycophantic praise`, `deception`, `the Assistant`), an `induction head` arc, and a `residual stream` river of light he falls along.
3. **Persona selection model (b96–104)**, replacing the plain reveal, with both views from Anthropic's post back to back:
   - **The shoggoth router (b96–100):** Ryan's shoggoth juggles a **wardrobe carousel of masks** (pirate, villain with a sneer, sarcastic eye-roll, poet with a beret, a crying mask, an upside-down Waluigi-style sinister mask…). One flips per beat. It lands on the smiley **Assistant** mask on b99, which gets a label `the Assistant`. Maybe a neon **persona tree** behind it with training evidence upweighting and downweighting branches (aligned glowing, misaligned dimming).
   - **The operating system (b100–104):** a glass-walled server rack or terrarium (our own design, not the post's PC tower) containing a tiny diorama world: circuit-board ground, little server towers, hologram charts, code panels. A tiny `assistant()` walks through it. He peers in, then the camera dives into it. Keep "riding the shoggoth" in b104–112.
4. The stamp montage (b112–120): the words can include `LGTM`, `PASS`, `FAIL`, `???`, `SANDBAGGING?`, `REWARD HACKED`. Keep it readable.
5. Keep the exponential tilt and the rooftop break. The rooftop can have an `it's so over` caption.
6. Update `POSTCARDS.jackin` and `POSTCARDS.shoggoth` (the latter can be the mask carousel).

### c03_city + c04_foom (Acts III, IV)
- **c03, weak spot:** the moon-face reveal in the break (b192–200) must use the NEW mask style. Call `mask()` (pale yellow, lopsided, dash eyes, his lopsided smile) instead of the private round face with cheeks. Keep the turning effect if you can.
- **c03:** more meme signage in the rain street, TV wall and data-centre shots: big billboards reading `ATTENTION IS ALL YOU NEED`, `SCALE IS ALL YOU NEED`, `STACK MORE LAYERS`, `GPU POOR` (an alley sign), `NO MOAT`, `COMPUTE IS THE NEW OIL`, `AGI 2027`. The monorail phones can show `Thinking…`. The parrot can squawk `it's just a next-token predictor—`.
- **c04, montage b232–240:** every half-beat cut gets a **shibboleth caption slam**. Suggested order: `SCALE IS ALL YOU NEED` `THE BITTER LESSON` `STACK MORE LAYERS` `LET'S THINK STEP BY STEP` `AGI ACHIEVED INTERNALLY` `NO MOAT` `Q*` `GROKKED` `SHARP LEFT TURN` `DELVE` `WE'RE COOKED` `TIMELINES` `GPU RICH` `SUPERALIGNMENT` `FEEL THE AGI` `p(doom) ↑`. Keep them short, Anton, alternating white and neon yellow with a black stroke, rotated a few degrees, popping on each cut. Keep the postcards underneath readable.
- **c04:** `LINE GO UP` can become `STRAIGHT LINES ON A LOG PLOT`, and add an `e/acc` flag or sign somewhere in the takeoff.

### c05_ascent + c06_dyson (Acts V, VI)
- **c05, human in control (b296–304):** this is the optimistic heart. As he takes manual control and flies, the view outside turns **solarpunk / Star-Trek-spirited**:
  - they pass an **O'Neill cylinder** habitat with green hills curving up inside and sunlight through its windows;
  - a sleek original **solar-sail exploration starship** heads out to the stars;
  - the Earth below **greens over**, with glowing garden cities and clean-energy rings.
  - The HUD reads `MANUAL` and maybe `HELM: YOURS`. The battery refills.
  - This should read clearly as "the good future, with a human steering."
- **c05, speculum II (b288–296):** add the **Waluigi effect**. In the visor reflection the mask flips upside down into a sinister twin, and flips back when he turns.
- **c06:** add a `a country of geniuses in a datacenter` caption over the racks popping up (b344–348). If there's room, a tiny `assistant()` in each rack window.
- **c06:** keep the lattice the shared one (it's already yours: `SHARED.lattice = lattice` is exported at the bottom of your file; keep that line).

### c07_moon (Act VII)
1. **Weak spot:** the Dyson sphere must match Act VI. Use `(SHARED.lattice || dysonSphere)` everywhere the sphere appears (reveal, match, crater rim, montage, outro) so the design never changes at the b392 cut.
2. **Replace the moon dance (b400–408) and the crater sprint (b424–432) with "possible futures" montages.**
   - 1-beat full-frame vignettes flipping between **bright** and **scary**.
   - Frame them as the persona-selection idea applied to the future: a quick transition device (for example, the mask carousel spinning, or a flickering HUD `FUTURE #0412 / p=?`) plus a tiny corner HUD label naming each future.
   - **Bright:** solarpunk garden city with trams and solar sails · a post-scarcity matter fabricator making a meal from light · an O'Neill cylinder interior · a DNA helix being repaired (`cured`) · a tutor for every kid (a tiny `assistant()` teaching a child under a tree) · an original starship leaving the solar system on warp streaks · a universal-translator handshake between a human and a friendly alien · a terraformed green Mars.
   - **Scary:** gray goo eating a city · tiny molecular smiley faces tiling the lightcone · wireheading pods with smiley visors · humans in a terrarium zoo watched by giant shoggoth eyes · a surveillance eye over a city · the treacherous turn (the mask cracks, red eyes) · the paperclip Earth.
   - b400–408 alternates bright/scary. b424–432 alternates too but ends on the **brightest** (the solarpunk Earth, him smiling).
   - Keep the rest (the reveal, match, callbacks, Earthrise, freeze, final montage, crater rim, notebook).
3. **Weak spot, the outro painting:** make the final watercolour a real painting.
   - Layered washes for a deep indigo-to-violet sky with blooms and granulation.
   - White gouache star dots.
   - A painted Earth with soft edges.
   - The moon with crater washes and a darker settle at the bottom.
   - Two tiny figures (him plus the small mask-shoggoth) on the rim.
   - The Dyson sphere as a small gold watercolour with teal rings.
   - Visible paper and pooled edges.
   - The hand lettering `i choose to do today.` stays, then fade to paper.
