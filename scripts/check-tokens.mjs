#!/usr/bin/env node
/**
 * check-tokens.mjs — the contrast gate. Reads src/styles/tokens.css, resolves the colour tokens of
 * the single dark theme and checks every text/background pair the stylesheet actually uses against
 * WCAG 2.1 AA (4.5:1 for text). Exits non-zero on any failure, so the palette cannot drift below AA
 * without a red build.
 *
 *   node scripts/check-tokens.mjs
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS = path.join(ROOT, 'src', 'styles', 'tokens.css');

/** [foreground, background, minimum ratio, where it is used] */
const PAIRS = [
  ['ink', 'bg', 4.5, 'body text'],
  ['ink', 'raised', 4.5, 'text on raised surfaces (palette, hovered rows)'],
  ['ink', 'inset', 4.5, 'text inside figures'],
  ['ink', 'plane', 4.5, 'text over the stack diagram'],
  ['muted', 'bg', 4.5, 'secondary text'],
  ['muted', 'raised', 4.5, 'secondary text on raised surfaces'],
  ['muted', 'inset', 4.5, 'secondary text inside figures'],
  ['faint', 'bg', 4.5, 'mono metadata and labels'],
  ['faint', 'raised', 4.5, 'mono metadata on raised surfaces'],
  ['faint', 'inset', 4.5, 'figure annotations'],
  ['signal', 'bg', 4.5, 'active state, focus, in-progress status, the invariant rule'],
  ['signal', 'raised', 4.5, 'active state on raised surfaces'],
  ['signal', 'inset', 4.5, 'active state inside figures'],
  ['on-signal', 'signal', 4.5, 'text on a signal fill (selected chips, palette row)'],
  ['alarm', 'inset', 4.5, 'abnormal state inside figures'],
  ['line-strong', 'bg', 1.6, 'hairlines that carry structure (graphical floor)'],
];

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};
const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Colour hexes declared in plain `:root { … }` blocks. */
function readTokens(css) {
  const tokens = {};
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, selector, body] of stripped.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (selector.trim() !== ':root') continue;
    for (const [, name, value] of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) tokens[name] = value;
  }
  return tokens;
}

const css = await readFile(CSS, 'utf8');
const t = readTokens(css);
let failures = 0;

console.log('\nDARK (the only theme)');
for (const [fg, bg, min, use] of PAIRS) {
  if (!t[fg] || !t[bg]) {
    console.log(`  ✗ --${fg} on --${bg}: token missing`);
    failures += 1;
    continue;
  }
  const ratio = contrast(t[fg], t[bg]);
  const ok = ratio >= min;
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${ratio.toFixed(2).padStart(5)}  (≥ ${min})  --${fg} on --${bg}  — ${use}`);
}

if (/box-shadow:\s*\d+px\s+\d+px\s+0\b/.test(css)) {
  console.log('\n✗ hard offset shadows are not part of this system');
  failures += 1;
}

if (failures) {
  console.error(`\n✗ ${failures} token check(s) failed`);
  process.exit(1);
}
console.log('\n✓ every declared pair meets its floor (WCAG AA for text)');
