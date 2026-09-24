// render.mjs: drive studio.html in headless Chromium (Playwright), CPU-only friendly.
//   node render.mjs --sheet=23,23.5,24 [--cols=3] [--w=640] --out=out/check.jpg   contact sheet (fast visual check)
//   node render.mjs --stills=0.8,3 --out=out/stills                              full-res JPEG stills
//   node render.mjs --clip=0:6 --out=out/test.mp4                                short clip with audio (low-res preview: --scale=.5)
//   node render.mjs --frames=0:158.8 --workers=2                                 full-res JPEG frames → out/frames (resumable)
//   node render.mjs --encode [--out=out/take_me_to_the_moon.mp4]                  frames + song → MP4
let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const DUR = 158.8, fps = +(args.fps || 30), FRAMES_DIR = args.dir || 'out/frames', AUDIO = 'assets/moon_src.mp3';
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });

if (args.encode) {
  const out = args.out || 'out/take_me_to_the_moon.mp4', n = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).length;
  console.log(`encoding ${n} frames → ${out}`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`, '-i', AUDIO,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k',
    '-movflags', '+faststart', '-shortest', out]);
  console.log('wrote ' + out); process.exit(0);
}

const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--force-color-profile=srgb'] });
async function openPage(tag = '') {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve(args.page || 'studio.html')).href + '?render', { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  return page;
}
const frameOf = async (page, t, type, q) => { const url = await page.evaluate(([t, type, q]) => window.renderAt(t, type, q), [t, type, q]); return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'); };
const times = s => String(s).split(',').map(Number);

if (args.sheet) {
  const page = await openPage(), out = args.out || 'out/sheet.jpg'; mkdirSync(dirname(out), { recursive: true });
  const { url, ms } = await page.evaluate(([ts, c, w]) => window.renderSheet(ts, c, w), [times(args.sheet), +(args.cols || 3), +(args.w || 640)]);
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(`${out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage(), out = args.out || 'out/stills'; mkdirSync(out, { recursive: true });
  for (const s of times(args.stills)) { const t0 = Date.now(), buf = await frameOf(page, s, 'image/jpeg', .92); const f = `${out}/t${s.toFixed(2).replace('.', '_')}.jpg`; writeFileSync(f, buf); console.log(`${f}  ${Date.now() - t0} ms`); }
} else if (args.frames) {
  const [a, b] = String(args.frames).split(':').map(Number), workers = +(args.workers || 2);
  mkdirSync(FRAMES_DIR, { recursive: true });
  const first = Math.round(a * fps), last = Math.min(Math.ceil(DUR * fps) - 1, Math.round(b * fps) - 1);
  const todo = []; for (let i = first; i <= last; i++) { const f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`; if (!existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} already done), ${workers} workers`);
  let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`;
      const buf = await frameOf(page, i / fps, 'image/jpeg', .93);
      writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f);
      if (++done % 60 === 0 || done === todo.length) { const el = (Date.now() - start) / 1000; console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame eff  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`); }
    }
  }));
} else {
  const page = await openPage(), [a, b] = args.clip ? String(args.clip).split(':').map(Number) : [0, DUR];
  const out = args.out || 'out/clip.mp4', sc = +(args.scale || 1); mkdirSync(dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-ss', String(a), '-t', String(b - a), '-i', AUDIO,
    '-map', '0:v', '-map', '1:a', ...(sc !== 1 ? ['-vf', `scale=${Math.round(1920 * sc)}:-2`] : []), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((b - a) * fps), start = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frameOf(page, a + i / fps, 'image/jpeg', .9);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 30 === 0 || i === n - 1) console.log(`frame ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(`wrote ${out}`);
}
await browser.close();
