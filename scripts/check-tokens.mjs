#!/usr/bin/env node
/**
 * check-tokens.mjs — the contrast gate. Reads src/styles/tokens.css, resolves the colour tokens for
 * both themes and checks every text/background pair the stylesheet actually uses against WCAG 2.1 AA
 * (4.5:1 for text, 3:1 for the "large" and graphical pairs). Exits non-zero on any failure, so the
 * palette cannot drift below AA without a red build.
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
  ['ink', 'raised', 4.5, 'text on cards and the palette'],
  ['ink', 'inset', 4.5, 'text on figures and the telemetry panel'],
  ['muted', 'bg', 4.5, 'secondary text'],
  ['muted', 'raised', 4.5, 'secondary text on cards'],
  ['muted', 'inset', 4.5, 'secondary text on figures'],
  ['faint', 'bg', 4.5, 'mono metadata (nav numbers, stage numbers)'],
  ['faint', 'raised', 4.5, 'mono metadata on cards'],
  ['faint', 'inset', 4.5, 'figure annotations, telemetry tag'],
  ['accent', 'bg', 4.5, 'links and section numbers'],
  ['accent', 'raised', 4.5, 'accent on cards'],
  ['accent', 'inset', 4.5, 'accent inside figures'],
  ['on-accent', 'accent-fill', 4.5, 'buttons, active chips, selected palette row'],
  ['ok', 'bg', 4.5, 'healthy-link status'],
  ['ok', 'inset', 4.5, 'healthy-link chip in the telemetry panel'],
  ['bad', 'bg', 4.5, 'link-down status'],
  ['bad', 'inset', 4.5, 'link-down chip and gap label in the telemetry panel'],
  ['trace', 'bg', 3, 'progress bar and signal packet (graphical)'],
  ['trace', 'inset', 3, 'signal trace on the telemetry panel (graphical)'],
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

function tokensFor(css, theme) {
  const blocks = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)];
  const tokens = {};
  for (const [, selector, body] of blocks) {
    const sel = selector.trim();
    const isDark = /data-theme='dark'/.test(sel) || sel === ':root';
    const isLight = /data-theme='light'/.test(sel);
    // `:root` alone also carries shared tokens (fonts, radii); only read colour hexes from it.
    const applies = (theme === 'dark' && (isDark || /^:root,/.test(sel))) || (theme === 'light' && isLight);
    if (!applies) continue;
    for (const [, name, value] of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) tokens[name] = value;
  }
  return tokens;
}

const css = await readFile(CSS, 'utf8');
let failures = 0;

for (const theme of ['dark', 'light']) {
  const t = tokensFor(css, theme);
  console.log(`\n${theme.toUpperCase()}`);
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
}

if (/box-shadow:\s*\d+px\s+\d+px\s+0\b/.test(css)) {
  console.log('\n✗ hard offset shadows are not part of this system');
  failures += 1;
}

if (failures) {
  console.error(`\n✗ ${failures} token check(s) failed`);
  process.exit(1);
}
console.log('\n✓ every declared pair meets WCAG AA in both themes');
