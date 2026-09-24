// list every shot (start, end, chapter) and render review sheets: one frame per shot at mid-shot
let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path'; import { pathToFileURL } from 'node:url';
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); p.on('pageerror', e => console.log('[err]', e.message));
p.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text()); });
await p.goto(pathToFileURL(resolve('studio.html')).href + '?render'); await p.waitForFunction('window.ready === true');
const shots = await p.evaluate(() => CH.flatMap(c => c.shots.map((s, i) => ({ ch: c.name, t0: s[0], t1: i + 1 < c.shots.length ? c.shots[i + 1][0] : c.end, tin: (s[2] || {}).tin || '' }))));
writeFileSync('out/shots.json', JSON.stringify(shots, null, 1));
console.log(shots.length, 'shots');
if (args.sheets) {
  mkdirSync('out/review', { recursive: true });
  const per = +(args.per || 30), at = +(args.at ?? .5);
  const times = shots.map(s => +(s.t0 + (s.t1 - s.t0) * at).toFixed(3));
  for (let i = 0; i < times.length; i += per) {
    const { url, ms } = await p.evaluate(([ts]) => window.renderSheet(ts, 6, 400), [times.slice(i, i + per)]);
    const f = `out/review/${args.tag || 'mid'}_${String(i / per).padStart(2, '0')}.jpg`;
    writeFileSync(f, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
    console.log(f, 'max ms', Math.max(...ms), 'avg', Math.round(ms.reduce((a, b) => a + b, 0) / ms.length));
  }
}
await b.close();
