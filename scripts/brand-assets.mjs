#!/usr/bin/env node
/**
 * brand-assets.mjs — regenerate the favicon set and the social card from one source of truth: the
 * mark (five stacked planes, src/components/LayerMark.tsx) and the stack the hero draws.
 *
 *   node scripts/brand-assets.mjs
 *
 * The social card is an HTML page screenshotted with headless Edge/Chrome, using the site's own
 * fonts from node_modules; the icons are rasterised in-process (headless browsers refuse windows
 * small enough for a 16 px favicon).
 * Needs Microsoft Edge or Chrome installed; set BROWSER=<path> to override the lookup.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { ROOT } from './load-content.mjs';
import { loadContent } from './load-content.mjs';
import { LAYERS } from '../src/lib/projects.js';

const PUBLIC = path.join(ROOT, 'public');
const FONT = (pkg, file) => pathToFileURL(path.join(ROOT, 'node_modules', pkg, 'files', file)).href;

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

// Tokens (src/styles/tokens.css).
const BG = '#0b0c0d';
const INK = '#ecebe6';
const MUTED = '#a7a6a0';
const FAINT = '#8e8d87';
const SIGNAL = '#c8f25c';
const LINE = '#383c3f';

// ---------------------------------------------------------------------------------------------
// The icon: the mark redrawn for small sizes. A solid top plane sits over the front edges of the
// planes beneath it. Tab sizes (the SVG, 16, 32, 48) get three layers, because five outlines blur
// into one block at 16 px; app-icon sizes (180, 192, 512) get all five.

const TILE = 64;
const TILE_R = 13;

function iconGeometry(layers) {
  const hw = 23;
  const hh = 11.5;
  const step = layers >= 5 ? 7.4 : 11;
  const stroke = layers >= 5 ? 3.4 : 4.8;
  const height = 2 * hh + (layers - 1) * step;
  const cy0 = (TILE - height) / 2 + hh; // centre of the solid top plane
  const lips = Array.from({ length: layers - 1 }, (_, k) => cy0 + (k + 1) * step);
  return { cx: TILE / 2, hw, hh, cy0, stroke, lips };
}

const r2 = (n) => Math.round(n * 100) / 100;

const markSvg = (layers = 3) => {
  const { cx, hw, hh, cy0, stroke, lips } = iconGeometry(layers);
  const top = `<path d="M${r2(cx)} ${r2(cy0 - hh)}L${r2(cx + hw)} ${r2(cy0)}L${r2(cx)} ${r2(cy0 + hh)}L${r2(cx - hw)} ${r2(cy0)}Z" fill="${SIGNAL}"/>`;
  const rest = lips
    .map((cy) => `<path d="M${r2(cx - hw)} ${r2(cy)}L${r2(cx)} ${r2(cy + hh)}L${r2(cx + hw)} ${r2(cy)}" fill="none" stroke="${SIGNAL}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}"><rect width="${TILE}" height="${TILE}" rx="${TILE_R}" fill="${BG}"/>${top}${rest}</svg>`;
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const inRoundedSquare = (x, y) => {
  if (x < 0 || y < 0 || x > TILE || y > TILE) return false;
  const cx = Math.min(Math.max(x, TILE_R), TILE - TILE_R);
  const cy = Math.min(Math.max(y, TILE_R), TILE - TILE_R);
  return Math.hypot(x - cx, y - cy) <= TILE_R;
};
const distToSegment = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

function colourAt(x, y, g) {
  if (!inRoundedSquare(x, y)) return null;
  if (Math.abs(x - g.cx) / g.hw + Math.abs(y - g.cy0) / g.hh <= 1) return SIGNAL;
  for (const cy of g.lips) {
    const d = Math.min(distToSegment(x, y, g.cx - g.hw, cy, g.cx, cy + g.hh), distToSegment(x, y, g.cx, cy + g.hh, g.cx + g.hw, cy));
    if (d <= g.stroke / 2) return SIGNAL;
  }
  return BG;
}

function rasterise(size, layers) {
  const g = iconGeometry(layers);
  const SS = 6;
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let a = 0;
      let r = 0;
      let gg = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const c = colourAt(((x + (sx + 0.5) / SS) / size) * TILE, ((y + (sy + 0.5) / SS) / size) * TILE, g);
          if (!c) continue;
          const [cr, cg, cb] = hex(c);
          a += 1;
          r += cr;
          gg += cg;
          b += cb;
        }
      }
      const o = (y * size + x) * 4;
      if (a) {
        px[o] = Math.round(r / a);
        px[o + 1] = Math.round(gg / a);
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

// ---------------------------------------------------------------------------------------------
// The social card: the name, the statement, and the stack with its real per-layer project counts.

const NAMES = { machine: 'Machine', infrastructure: 'Infrastructure', software: 'Software', intelligence: 'Intelligence', interface: 'Interface' };

function stackSvg(counts) {
  const S = 140;
  const KX = 0.95;
  const KY = 0.3;
  const CX = S * KX + 6;
  const STEP = 68;
  const TOP = 16;
  const W = CX + S * KX + 40 + 240;
  const H = TOP + 4 * STEP + 2 * S * KY + 16;
  const top = (i) => TOP + (4 - i) * STEP;
  let body = '';
  LAYERS.forEach((id, i) => {
    const t = top(i);
    const cy = t + S * KY;
    const pts = [
      [CX, t],
      [CX + S * KX, t + S * KY],
      [CX, t + 2 * S * KY],
      [CX - S * KX, t + S * KY],
    ]
      .map((p) => p.map((n) => n.toFixed(1)).join(','))
      .join(' ');
    body += `<polygon points="${pts}" fill="#0e1011" fill-opacity=".82" stroke="#4b5054" stroke-width="1.2"/>`;
    body += `<path d="M${CX + S * KX} ${cy}H${CX + S * KX + 30}" stroke="${LINE}" stroke-width="1.2"/>`;
    body += `<ellipse cx="${CX}" cy="${cy}" rx="11" ry="4" fill="${BG}" stroke="${SIGNAL}" stroke-width="1.4"/>`;
    if (i < 4) body += `<path d="M${CX} ${cy}V${cy - STEP}" stroke="${SIGNAL}" stroke-opacity=".6" stroke-width="1.4"/>`;
    const lx = CX + S * KX + 40;
    body += `<circle cx="${lx + 4}" cy="${cy}" r="4" fill="${SIGNAL}"/>`;
    body += `<text x="${lx + 18}" y="${cy + 6}" font-family="Mono" font-size="14" fill="${FAINT}">0${i + 1}</text>`;
    body += `<text x="${lx + 46}" y="${cy + 7}" font-family="Archivo" font-stretch="112%" font-weight="650" font-size="18" fill="${INK}">${NAMES[id].toUpperCase()}</text>`;
    body += `<text x="${lx + 46}" y="${cy + 28}" font-family="Mono" font-size="14" fill="${FAINT}">${counts[id]} projects</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

const cardHtml = (counts, total) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Archivo';font-weight:100 900;font-stretch:62% 125%;src:url('${FONT('@fontsource-variable/archivo', 'archivo-latin-wdth-normal.woff2')}') format('woff2-variations')}
@font-face{font-family:'Mono';font-weight:500;src:url('${FONT('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')}')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:${BG};color:${INK};position:relative;overflow:hidden;font-family:'Archivo'}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(236,235,230,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(236,235,230,.08) 1px,transparent 1px),linear-gradient(rgba(236,235,230,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(236,235,230,.045) 1px,transparent 1px);background-size:120px 120px,120px 120px,24px 24px,24px 24px;-webkit-mask-image:radial-gradient(ellipse 60% 80% at 75% 45%,#000 25%,transparent 80%)}
.top{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;font-family:'Mono';font-size:18px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED}}
.top i{display:block;width:9px;height:9px;border-radius:50%;background:${SIGNAL}}
h1{position:absolute;left:60px;top:150px;font-size:90px;font-weight:780;font-stretch:125%;line-height:.88;letter-spacing:-.04em;text-transform:uppercase}
p{position:absolute;left:64px;top:390px;width:520px;font-size:27px;line-height:1.38;color:${INK}}
.foot{position:absolute;left:64px;bottom:52px;font-family:'Mono';font-size:17px;color:${FAINT};letter-spacing:.02em}
.stack{position:absolute;right:16px;top:118px}
</style></head><body>
<div class="grid"></div>
<div class="top"><i></i>prakashsewani.com</div>
<h1>Prakash<br>Sewani</h1>
<p>Software engineer. Industrial telemetry, backend services, AI tooling and web interfaces.</p>
<div class="foot">${total} side projects · prakashsewani.com/projects</div>
<div class="stack">${stackSvg(counts)}</div>
</body></html>`;

async function shot(tmp, name, html, width, height, outFile) {
  const htmlPath = path.join(tmp, `${name}.html`);
  await writeFile(htmlPath, html);
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${width},${height}`,
      `--screenshot=${outFile}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'ignore', timeout: 60_000 },
  );
}

const projects = await loadContent();
const counts = Object.fromEntries(LAYERS.map((id) => [id, projects.filter((p) => p.layers.includes(id)).length]));

const tmp = await mkdtemp(path.join(os.tmpdir(), 'brand-'));
await mkdir(PUBLIC, { recursive: true });

await writeFile(path.join(PUBLIC, 'favicon.svg'), markSvg(3) + '\n');
await shot(tmp, 'og', cardHtml(counts, projects.length), 1200, 630, path.join(PUBLIC, 'og-image.png'));

/** [file, size, layers]: three layers where the icon is tab-sized, all five where it has room. */
const pngs = [
  ['favicon-16x16.png', 16, 3],
  ['favicon-32x32.png', 32, 3],
  ['apple-touch-icon.png', 180, 5],
  ['android-chrome-192x192.png', 192, 5],
  ['android-chrome-512x512.png', 512, 5],
];
for (const [file, size, layers] of pngs) await writeFile(path.join(PUBLIC, file), rasterise(size, layers));

await writeFile(path.join(PUBLIC, 'favicon.ico'), buildIco([16, 32, 48].map((size) => ({ size, png: rasterise(size, 3) }))));

console.log(`brand assets written to public/ (social card rendered with ${path.basename(browser)})`);
