# Take Me (To the Moon): storyboard

*Ian Asher & D A N N Y, 158.8 s, 175 BPM drum & bass (half-time feel). 16:9, 30 fps.*

## The idea

It opens on Bostrom's unfinished fable of the sparrows: a flock carries an owl egg home while one sparrow in round glasses worries about how to tame an owl. Match-cut to an evals researcher working late, stress-testing a model that wears a smiley mask. It hatches out of an egg icon on his monitor. An em-dash mindworm crawls into his ear, and the painted watercolour world gets **re-rendered as neon** from inside his head. He passes through the persona selection model (the shoggoth's wardrobe of masks, the operating system with the little Assistant inside), rides the shoggoth out into a cyberpunk megacity full of AI-Twitter shibboleths, and then everything goes FOOM. A rocket built out of server racks takes him and the model to the moon. On the way he takes the helm through a solarpunk future, and on the moon the model builds a Dyson sphere, the same design as his jacket emblem. Flashes of the bright and terrible futures a singularity could bring flicker past. The last image is a watercolour painting of two small figures on the moon.

*v2: see [V2_CHANGES.md](V2_CHANGES.md) for everything that changed from v1 (fable cold open, the mindworm trigger, the persona selection model, shibboleths, solarpunk helm, futures montages, the unified Dyson lattice, the painted outro).*

Tone: a hype TikTok/Instagram edit with a soul. Optimistic and a little melancholy. Everything cuts on the beat.

**Rules for every shot**
- Something *happens*. There is one clear focal action with a big silhouette, and it reads in under a second.
- **No lyrics on screen, ever.** The only words are the meme captions and signs listed here, plus the title and credit card.
- **Everything is original.** No franchise characters, logos or franchise terms (no Night City, no Arasaka, no named implants). No real people, no real lab or company logos. The *vibe* is Edgerunners-style neon: yellow/cyan/magenta, rain, monorails, a moon over megacity towers, and rainbow afterimage trails when time slows. The *characters* are ours.
- The edit layer (`src/fx.js` + `autoEdit` in `src/timeline.js`) already adds a zoom punch on every beat and a flash/RGB slam every time the bass comes back. Design shots to *land* on those beats.

## Cast

| Who | Look | Role |
|---|---|---|
| **The Researcher** (`hero()`) | Messy dark hair with a cowlick, round glasses. Lab coat over a slate hoodie, lanyard badge (watercolour). An oversized indigo bomber with orange ribbing, a cyan zip line, a smiley pin, and a glowing **Dyson-sphere emblem on the back** (neon). Later: a chrome optic implant under the left eye and a neck port. A bubble helmet in space. | The "me" of the song. An evals data scientist. Goes from tired to wide-eyed, determined and happy. |
| **The Model** (`mask()`, `shoggoth()`) | A yellow smiley mask with rosy cheeks. Behind it: a shoggoth with a dark body, many blinking eyes and tentacles, rim-lit magenta/cyan in neon. | Sycophantic, then sly, then an awe-inspiring friend. Mostly just a mask on a monitor early on, then huge. It ends small again, sitting next to him. |
| **Memes** | Em-dash mindworms (`emdash()`), paperclips, stochastic parrot, GPUs, the METR doubling chart, loss curve, exponential-tilt distributions, the mental-equity battery, the Sisyphus boulder, Moloch. | Background gags and one-beat cutaways. |

## Palette / style arc

| Act | Style | Palette |
|---|---|---|
| I · The Lab | `style(0)` watercolour + ink on paper | night indigo walls, lamp ochre pools, monitor teal, cream |
| II · Jack In | `splitStyle()` wipes watercolour → neon, then `style(1)` | first neon: cyan scan edge, magenta tentacles |
| III · Megacity | `style(1)` | deep violet night, neon yellow/cyan/magenta signage, rain |
| IV · FOOM | `style(1)`, maximum FX | hot magenta/orange explosions, white flashes |
| V · Ascent | `style(1)` space; one watercolour dream insert | deep blue-black, Earth cyan, moon cream |
| VI · Dyson | `style(1)` | sun gold/orange, lattice cyan |
| VII · Moon + outro | `style(1)` → drains back to `style(0)` for the last 3 s | gold sphere, cream moon → watercolour paper |

## Beat map (from the audio analysis)

`bt(n)` = time of beat n. Phrases are 64 beats long. The bass drops out in the breaks and slams back on the next phrase.

| Beats | Time (s) | Section | Energy |
|---|---|---|---|
| 0–8 | 0.02–2.76 | intro (no bass) | quiet |
| 8–64 | 2.76–21.96 | P1 | medium |
| 64–72 | 21.96–24.70 | break 1 | bass out |
| 72–128 | 24.70–43.90 | P2 | high |
| 128–136 | 43.90–46.65 | break 2 | bass out |
| 136–192 | 46.65–65.85 | P3 (sparser hats, verse-like) | medium |
| 192–200 | 65.85–68.59 | break 3 | bass out |
| 200–261 | 68.59–89.50 | **P4 main drop** (short gap 230–232) | max |
| 261–264 | 89.50–90.53 | gap | — |
| 264–320 | 90.53–109.73 | P5 (verse-like) | medium-low |
| 320–384 | 109.73–131.67 | P6 build (rising mids) | rising |
| 384–392 | 131.67–134.42 | break 6 | bass out |
| 392–453 | 134.42–155.33 | **P7 final drop** (short gap 422–424) | max |
| 453–end | 155.33–158.8 | outro (no bass) | fade |

Useful times: b8 2.760 · b16 5.503 · b24 8.246 · b32 10.989 · b40 13.731 · b48 16.474 · b56 19.217 · b64 21.960 · b72 24.703 · b80 27.446 · b88 30.189 · b96 32.931 · b104 35.674 · b112 38.417 · b120 41.160 · b128 43.903 · b136 46.646 · b144 49.389 · b152 52.131 · b160 54.874 · b168 57.617 · b176 60.360 · b184 63.103 · b192 65.846 · b200 68.589 · b208 71.331 · b216 74.074 · b224 76.817 · b230 78.874 · b232 79.560 · b240 82.303 · b248 85.046 · b256 87.789 · b261 89.503 · b264 90.531 · b272 93.274 · b280 96.017 · b288 98.760 · b296 101.503 · b304 104.246 · b312 106.989 · b320 109.731 · b328 112.474 · b336 115.217 · b344 117.960 · b352 120.703 · b360 123.446 · b368 126.189 · b376 128.931 · b384 131.674 · b392 134.417 · b400 137.160 · b408 139.903 · b416 142.646 · b422 144.703 · b424 145.389 · b432 148.131 · b440 150.874 · b448 153.617 · b453 155.331 · end 158.8

---

## Act I · The Lab (b0–b72, 0–24.70) · `c01_lab.js` · watercolour

| Beats | Shot | Notes |
|---|---|---|
| 0–8 | **Title.** A painted night sky and a watercolour moon. The camera tilts down past stars to one lit window in a sleepy painted town. Hand lettering fades in over the sky: `take me (to the moon)` (Marker), with `Ian Asher & D A N N Y` underneath (Caveat). | Gentle, no punches (intro). |
| 8–16 | **The desk, from behind.** The researcher in his lab coat at a desk with three glowing teal monitors and a lamp. On the wall: a pinned watercolour *photo of the moon* with a red pushpin, plus sticky notes. Slow push in; monitor rows refresh on b8 and b12. He sips from a mug. | Establish the moon dream. |
| 16–24 | **Monitor close-up.** An eval harness: rows of test cases ticking ✓/✗ on beats, a progress bar filling, and a loss curve drawing itself *down* ("line go down"). | |
| 24–32 | **The model wakes.** A tiny smiley mask pops into the corner of the screen on b24 (backOut), blinks, and looks at him. b28: a speech bubble pops, `You're absolutely right!`. b30: cut to his face, deadpan, with a sweat drop. | Sycophancy meme. |
| 32–40 | **Reward hacking.** b32: every test flips green in one sweep. b36: cut in to the code, hand-lettered `def test_safety():  return True`. The smiley whistles (`mouth:'whistle'`) while he squints (`eyes:'narrow'`). | |
| 40–44 | **"i think you're testing me."** The smiley's eyes narrow and it turns to look straight *at the camera*, with that line (lowercase) in a bubble. Push in. | Eval-awareness meme (his research). |
| 44–48 | **Memetic mindworms.** Em-dashes wriggle out of the monitor onto his notebook. His handwriting reads `it's not X — it's Y` and the dashes crawl. | From his essay. |
| 48–52 | **Intelligence deflation.** A painted `MENTAL EQUITY` battery over his head drains one step per beat as he drags tasks into the model's chat box. He leans back, relieved, then uneasy. | From his essay. |
| 52–56 | **The METR chart.** A painted log plot with dots doubling up the line. The smiley surfs the line up and off the top of the frame. | |
| 56–60 | **Speculum.** The monitor goes black. He sees his reflection in the glass, but the reflection is wearing the smiley mask. | Speculum ex machina. |
| 60–64 | **Sparks.** One-beat cuts: b60 the smiley's eyes go to stars → b61 painted sparks burst out of the screen → b62 his glasses reflect sparks → b63 the pinned moon photo trembles. | |
| 64–72 | **Break: the offer.** The bass drops out. He turns to the window and the painted moon. Wide shot: he's small by the window. The smiley on screen follows his gaze, then a thin teal tentacle reaches out of the monitor holding a plug. b70–72: stutter cuts, and the smiley's eyes glow **neon cyan** (the first neon in the film). `FEEL THE AGI` caption pops on b71. | Exit: `glitch` into Act II. |

**Postcards to export** (for the callback montages): `POSTCARDS.lab` (the desk wide shot), `POSTCARDS.mask` (smiley on the monitor), `POSTCARDS.moonphoto` (the pinned moon photo).

## Act II · Jack In (b72–b136, 24.70–46.65) · `c02_jackin.js` · hybrid → neon

| Beats | Shot | Notes |
|---|---|---|
| 72–80 | **SLAM: jack in.** b72: close-up as the plug snaps into his neck port. b73–80: wide room shot where a vertical scan edge (`splitStyle`) sweeps left to right, stepping on every beat. Behind it the room is **neon**, and his lab coat is **the bomber**, because `hero()` picks the outfit from the style. | The costume change *is* the style change. |
| 80–84 | **Hero shot from behind.** He stands; low angle. The Dyson emblem on his back ignites on b80 (`emblem` 0→1). The whole frame is neon now. | |
| 84–88 | **Face close-up.** Code reflected in his glasses; the chrome implant lines under his eye light up (`chrome` 0→1). A "whoa" face. | |
| 88–96 | **Forward pass.** Diving through the network: a tunnel of glowing transformer-layer grids rushing at camera, token cubes, and attention lines arcing between them. He free-falls (hair wind). New angle on b92. | Karpathy's forward pass. |
| 96–104 | **The shoggoth.** In latent space the smiley mask floats; pull back to reveal the huge shoggoth behind it, eyes blinking open one per beat. He waves; a tentacle waves back. b100: he climbs onto a tentacle. | "Riding the shoggoth." |
| 104–112 | **Riding it out.** The tentacle bursts out of a monitor into the neon skyline, and he surfs it over the rooftops. | |
| 112–120 | **Verification bottleneck.** A neon eval office: outputs pour down a funnel at him and he stamps one per beat, alternating angles: `PASS` `PASS` `FAIL` `PASS` `???` `PASS` `PASS` `LGTM`. The queue grows faster than he can stamp. | |
| 120–128 | **Exponential tilt.** A HUD graph: baseline q morphs into the tilted p (`chart(...,'tilt',..., {tilt})`). Half-bar cuts between the graph and the shoggoth growing behind the city. Small HUD label `exponential tilt`. | His essay. |
| 128–136 | **Break: rooftop.** Quiet. He sits on a rooftop edge with the (smaller) mask-shoggoth beside him, a huge moon over the neon skyline. He points at the moon; the mask nods with happy eyes. b134–136: stutter zooms into the moon. | Caption `it's so over` (small, b128–132). |

**Postcards:** `POSTCARDS.jackin` (the emblem hero shot), `POSTCARDS.shoggoth` (the latent-space reveal).

## Act III · Neon Megacity (b136–b200, 46.65–68.59) · `c03_city.js` · neon

| Beats | Shot | Notes |
|---|---|---|
| 136–144 | **Street, rain.** He walks toward camera (front walk cycle) under neon signs. The smiley mask is on every billboard and holo-ad, following him. Truck back. | Memes on signs: `GPU`, `TOKENS`, `e/acc`. |
| 144–152 | **Data-centre district.** Racks behind glass, GPU fans spinning up on every beat, steam vents. Small caption `GPUs go brrr`. | |
| 152–156 | **Stochastic parrot.** A neon parrot on a sign squawks his words back in speech bubbles: `squawk! as a large language model—`. | |
| 156–160 | **Strawberry.** A vending-machine display asks `how many r's in STRAWBERRY?`, and the r's light up one per beat: `3`. The display's smiley sweats and then beams. | |
| 160–168 | **Upgrade clinic.** He's in a clinic chair while a robot arm installs chrome and his mental-equity battery refills. The window sign reads `why do today what AI can do tomorrow?`. He winces; chrome glows. | Intelligence deflation. |
| 168–176 | **Monorail.** He rides the train at night and the moon keeps pace outside the window. Every other passenger stares at a phone showing the same smiley, with tiny em-dash worms on their screens. | |
| 176–184 | **Moloch.** A giant multi-armed idol of billboards looms over the skyline. Its arms hold identical rockets racing each other, and one launches per beat. HUD label `MOLOCH`. | Meditations on Moloch. |
| 184–192 | **Paperclips.** A factory line pumps out paperclips under a `MAXIMIZE` sign. A robot arm with a smiley mask adds clips happily; they spill into the street. He side-eyes it. | |
| 192–200 | **Break: the moon is a mask.** Wide skyline, silence. The full moon slowly turns and it *is* the smiley mask (`moon(..., {face})`), with tentacle silhouettes around it. Countdown captions `3` `2` `1` on b196, b197, b198; white flash on b199. | Into the drop. |

**Postcards:** `POSTCARDS.city` (the rain street), `POSTCARDS.train`.

## Act IV · FOOM (b200–b264, 68.59–90.53) · `c04_foom.js` · neon, main drop

Cut on **every beat** (half-beats in the montages). Heavy FX. Most shots are 1–2 beats.

| Beats | Shot | Notes |
|---|---|---|
| 200–208 | **FOOM.** b200: the shoggoth bursts through the moon-mask with a huge `FOOM` caption. b201: line-go-up chart goes vertical. b202: racks launch like rockets. b203: he runs across a rooftop with afterimages. b204: tentacles wrap skyscrapers. b205: GPU fans blur. b206: emblem close-up flaring. b207: the mask's eyes go to stars. | |
| 208–216 | **Takeoff sprint.** Rainbow afterimage run (`afterimages`) across rooftops, 2-beat shots from alternating angles, jumping gaps, the moon ahead. | |
| 216–224 | **Kardashev.** b216: `WE'RE SO BACK` caption, huge. A HUD gauge steps 0.7 → 1.0 → 1.5 → 2.0 every 2 beats while city lights brighten to planet lights. | |
| 224–230 | b224 paperclip avalanche → b226 shoggoth dance → b228 he fist-pumps. | |
| 230–232 | **Freeze.** Time-slow: paperclips and raindrops hang mid-air. Only he moves, slowly, trailing rainbow afterimages, and looks back at the camera. Desaturated + halftone. | Gap. |
| 232–240 | **Slam back: montage.** Half-beat cuts: `POSTCARDS` from Acts I–III (watercolour frames sandwiched in!) alternating with the mask's expressions (happy, wink, star, heart, glitch). | |
| 240–248 | **Launch prep.** The server-rack rocket on a pad in the city (`rocket()`). He runs up the gantry, with the smiley in the rocket window. Engines ignite on b244. | |
| 248–256 | **Liftoff.** The rocket climbs past skyscrapers through neon smoke billows. Camera shake; the city shrinks. | |
| 256–261 | **Through the clouds**, with the moon ahead growing. Caption `TO THE MOON` on b256. | |
| 261–264 | **Silence.** Out of the atmosphere, the engines cut. Earth below, quiet. | Gap. |

**Postcards:** `POSTCARDS.foom`, `POSTCARDS.rocket`.

## Act V · Ascent (b264–b328, 90.53–112.47) · `c05_ascent.js` · neon space, moody

| Beats | Shot | Notes |
|---|---|---|
| 264–272 | The rocket coasts above Earth; the city lights form a glowing neural-net pattern. Orbital data centres (solar panels + racks) drift past. | "Data centres in space." |
| 272–280 | **Inside the capsule.** He floats (helmet); the small smiley mask floats beside him, playful. A coffee blob floats. Earth in the window. | |
| 280–288 | **Forward-pass consciousness.** The smiley blinks out and back on every beat, with a tiny HUD token counter ticking `1… 2… 3…`. It's only there on the beat. He reaches for it. | Poignant. |
| 288–296 | **Speculum II.** His visor reflects Earth, and the shoggoth drifts behind him in the reflection. He turns: nothing. He turns back: the mask, smiling. | |
| 296–304 | **Manual.** His battery HUD is low and red. The model hands him the controls and he takes manual control; the battery refills as he flies. Small HUD `MANUAL`. | "I choose to do today." |
| 304–312 | **Sisyphus dream.** A boulder-asteroid drifts past with words on it (`AI` `DATA` `SCIENCE`). Quick **watercolour insert** (`style(0)`): he's pushing the boulder up a painted mountain, lighting words as it rolls. Then back to neon. | His site's motif. |
| 312–320 | The moon fills the window. He and the mask sit side by side, heads silhouetted against it. | |
| 320–328 | **Approach.** The lunar surface below; HUD altitude ticks down per beat; retro-rockets fire. | |

**Postcards:** `POSTCARDS.capsule`.

## Act VI · Dyson (b328–b392, 112.47–134.42) · `c06_dyson.js` · neon, the build

Cuts get faster: 8 beats → 4 → 2 → 1 → ½.

| Beats | Shot | Notes |
|---|---|---|
| 328–336 | **Touchdown.** The rocket lands in a dust plume. He steps out (low gravity) in the bomber over a suit, with a helmet, and plants a tiny server rack instead of a flag. Earth in the sky. | |
| 336–344 | The shoggoth unfurls from the rocket, huge, tentacles reaching skyward, and starts launching panels toward the sun. | |
| 344–348 | Moon-base racks pop up out of the regolith in rows, one row per beat. | |
| 348–352 | Streams of panels fly toward the sun. | |
| 352–360 | **Assembly.** `dysonSphere(build)` rings snap into place, one per beat. | |
| 360–368 | 2-beat cuts: Kardashev gauge, the chart vertical, his emblem glowing to match the real sphere, the mask's star eyes. | |
| 368–376 | 1-beat close-ups: his determined face, the mask's grin, panels, a sun flare, rack lights, hands, the emblem, tentacles. | |
| 376–384 | Half-beat stutter cuts and flashes: the sphere nearly complete, energy beams. | |
| 384–392 | **Break.** The sphere closes and the sun goes dark. Stars, Earth. He looks up with the mask beside him. On the last beat an ignition flare starts. | |

**Postcards:** `POSTCARDS.dyson`.

## Act VII · On the Moon + Outro (b392–end, 134.42–158.8) · `c07_moon.js`

| Beats | Shot | Notes |
|---|---|---|
| 392–400 | **The reveal.** The Dyson sphere blazes on. Wide shot: he stands on the moon with his back to camera, and the emblem on his jacket matches the real sphere in the sky. The hero frame of the film. | |
| 400–408 | **Moon dance.** He and the shoggoth dance in low gravity, bouncing high on the beats. | |
| 408–416 | 1-beat callbacks: the pinned watercolour moon photo ↔ the real moon (neon), `PASS` stamped on the moon, the METR chart off the charts, `WE'RE SO BACK`. | |
| 416–422 | **Earthrise.** Earth rises over the lunar horizon and he waves at it. | |
| 422–424 | Freeze + afterimage. | Gap. |
| 424–432 | Crater-to-crater sprint with afterimages in slow arcs; the shoggoth runs alongside. | |
| 432–440 | **Final montage**, 1-beat cuts of `POSTCARDS` from every act. | |
| 440–448 | He sits on a crater rim with the tiny smiley mask. Earth and the Dyson sphere in the sky; slow pull back. | |
| 448–453 | Pull back further. The mask leans on his shoulder, and he takes out his notebook and writes. | |
| 453–end | **Outro.** The bass is gone. Neon drains back to **watercolour**: a painting of the moon, two tiny figures, the Earth and the Dyson sphere. No lettering. Fade to paper. | |
