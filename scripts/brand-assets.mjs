#!/usr/bin/env node
/**
 * brand-assets.mjs — regenerate the favicon set and the social card from one source of truth.
 *
 *   node scripts/brand-assets.mjs
 *
 * The social card is an HTML page screenshotted with headless Edge/Chrome (the project's own fonts,
 * loaded from node_modules), so it uses the same typefaces as the site; the icons are rasterised
 * in-process. The trace drawn on the card is the real telemetry generator from
 * src/lib/telemetry.ts, outage and all.
 * Needs Microsoft Edge or Chrome installed; set BROWSER=<path> to override the lookup.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { CHANNELS, DOWN_S, LIVE_S, SAMPLE_RATE, inOutage, isDelivered, sample } from '../src/lib/telemetry.ts';
import { ROOT } from './load-content.mjs';

const PUBLIC = path.join(ROOT, 'public');
const FONTS = (pkg, file) => pathToFileURL(path.join(ROOT, 'node_modules', pkg, 'files', file)).href;

const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = CANDIDATES.find((p) => existsSync(p));
if (!browser) throw new Error('no Edge/Chrome found — set BROWSER=<path>');

const AMBER = '#f5a524';
const INK = '#17120a';

const markSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${AMBER}"/>
  <path d="M9 36h11l6-17 9 28 6-18 3 7h11" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/** The telemetry trace for the card: real samples, with the outage hatched exactly as on the site. */
function traceSvg(width, height) {
  const windowS = 7;
  const now = 10.6; // mid-outage, so the card shows the whole story
  const t0 = now - windowS;
  const rows = 3;
  const rowH = height / rows;
  const ids = [CHANNELS[0].id, CHANNELS[2].id, CHANNELS[1].id];
  let body = '';
  let gap = null;
  for (let i = Math.floor(t0 * SAMPLE_RATE); i <= Math.floor(now * SAMPLE_RATE); i += 1) {
    const ts = i / SAMPLE_RATE;
    if (!isDelivered(ts, now) && inOutage(ts)) {
      const x = ((ts - t0) / windowS) * width;
      gap = gap ? [gap[0], x] : [x, x];
    }
  }
  ids.forEach((id, r) => {
    let d = '';
    let pen = false;
    for (let i = Math.floor(t0 * SAMPLE_RATE); i <= Math.floor(now * SAMPLE_RATE); i += 1) {
      const ts = i / SAMPLE_RATE;
      if (!isDelivered(ts, now)) {
        pen = false;
        continue;
      }
      const x = ((ts - t0) / windowS) * width;
      const y = r * rowH + rowH / 2 - sample(id, i) * (rowH / 2 - 10);
      d += `${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      pen = true;
    }
    body += `<path d="${d}" fill="none" stroke="${AMBER}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  });
  const hatch = gap
    ? `<rect x="${gap[0]}" y="0" width="${gap[1] - gap[0]}" height="${height}" fill="url(#h)"/><line x1="${gap[0]}" x2="${gap[0]}" y1="0" y2="${height}" stroke="#ff7a6b" stroke-width="1.5" stroke-dasharray="6 6"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><pattern id="h" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#ff7a6b" stroke-opacity=".35" stroke-width="1.5"/></pattern></defs>
  ${hatch}${body}</svg>`;
}

const cardHtml = () => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Instrument Serif';font-style:normal;src:url('${FONTS('@fontsource/instrument-serif', 'instrument-serif-latin-400-normal.woff2')}')}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url('${FONTS('@fontsource/instrument-serif', 'instrument-serif-latin-400-italic.woff2')}')}
@font-face{font-family:'Mono';font-weight:100 800;src:url('${FONTS('@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0c0d0f;color:#ece8df;position:relative;overflow:hidden;font-family:'Mono'}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(236,232,223,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(236,232,223,.06) 1px,transparent 1px);background-size:48px 48px;-webkit-mask-image:radial-gradient(ellipse 90% 80% at 30% 30%,#000 25%,transparent 80%)}
.top{position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:16px;font-size:22px;color:#a09d95;letter-spacing:.02em}
.mark{width:44px;height:44px}
h1{position:absolute;left:72px;top:150px;width:1000px;font-family:'Instrument Serif',serif;font-weight:400;font-size:112px;line-height:.98;letter-spacing:-.03em}
h1 em{color:${AMBER}}
.sub{position:absolute;left:72px;top:416px;font-size:24px;color:#a09d95;letter-spacing:.02em}
.trace{position:absolute;left:0;bottom:0;width:1200px;height:150px;opacity:.95}
.fade{position:absolute;left:0;bottom:0;width:1200px;height:150px;background:linear-gradient(90deg,#0c0d0f 0,transparent 12%,transparent 100%)}
</style></head><body>
<div class="grid"></div>
<div class="top"><span class="mark">${markSvg(44)}</span>prakashsewani.com</div>
<h1>Software from the <em>sensor</em><br>to the <em>screen</em>.</h1>
<div class="sub">Prakash Sewani · Senior Software Engineer · Rust · Go · TypeScript · .NET</div>
<div class="trace">${traceSvg(1200, 150)}</div><div class="fade"></div>
</body></html>`;

/**
 * Icons are rasterised here instead of screenshotted: headless browsers refuse windows under ~500px,
 * and a 16px favicon is exactly where a hand-rolled, supersampled rasteriser is the right tool.
 */
const PATH = [[9, 36], [20, 36], [26, 19], [35, 47], [41, 29], [44, 36], [55, 36]];
const distToSegment = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
const inRoundedSquare = (x, y, size = 64, r = 14) => {
  if (x < 0 || y < 0 || x > size || y > size) return false;
  const cx = Math.min(Math.max(x, r), size - r);
  const cy = Math.min(Math.max(y, r), size - r);
  return Math.hypot(x - cx, y - cy) <= r;
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

function rasterise(size) {
  const SS = 4;
  const amber = hex(AMBER);
  const ink = hex(INK);
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let a = 0;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const ux = ((x + (sx + 0.5) / SS) / size) * 64;
          const uy = ((y + (sy + 0.5) / SS) / size) * 64;
          if (!inRoundedSquare(ux, uy)) continue;
          const stroke = PATH.slice(1).some((p, i) => distToSegment(ux, uy, PATH[i], p) <= 2.5);
          const c = stroke ? ink : amber;
          a += 1;
          r += c[0];
          g += c[1];
          b += c[2];
        }
      }
      const o = (y * size + x) * 4;
      if (a) {
        px[o] = Math.round(r / a);
        px[o + 1] = Math.round(g / a);
        px[o + 2] = Math.round(b / a);
      }
      px[o + 3] = Math.round((a / (SS * SS)) * 255);
    }
  }
  return encodePng(size, size, px);
}

function encodePng(w, h, rgba) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y += 1) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function shot(tmp, name, html, width, height, outFile, transparent) {
  const htmlPath = path.join(tmp, `${name}.html`);
  await writeFile(htmlPath, html);
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    `--screenshot=${outFile}`,
    ...(transparent ? ['--default-background-color=00000000'] : []),
    pathToFileURL(htmlPath).href,
  ];
  execFileSync(browser, args, { stdio: 'ignore', timeout: 60_000 });
}

/** A .ico is a small directory around PNG payloads, which every current browser accepts. */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + entries.length * 16;
  const dir = [];
  for (const { size, png } of entries) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    dir.push(e);
  }
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.png)]);
}

const tmp = await mkdtemp(path.join(os.tmpdir(), 'brand-'));
await mkdir(PUBLIC, { recursive: true });

await writeFile(path.join(PUBLIC, 'favicon.svg'), markSvg(64) + '\n');
await shot(tmp, 'og', cardHtml(), 1200, 630, path.join(PUBLIC, 'og-image.png'), false);

const pngs = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
};
for (const [file, size] of Object.entries(pngs)) await writeFile(path.join(PUBLIC, file), rasterise(size));

await writeFile(
  path.join(PUBLIC, 'favicon.ico'),
  buildIco([16, 32, 48].map((size) => ({ size, png: rasterise(size) }))),
);

console.log(`brand assets written to public/ (social card rendered with ${path.basename(browser)})`);
