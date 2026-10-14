#!/usr/bin/env node
/**
 * check-design-tokens.mjs — the contrast/consistency gate for the spec-sheet design system.
 *
 * Plain node, zero dependencies. Reads the token map out of `src/lib/index.css`, then:
 *   1. asserts every required token is present,
 *   2. asserts the palette stays inside the distinct-hex budget (DESIGN.md §2),
 *   3. computes real WCAG 2.1 contrast ratios for every declared text/surface pair and
 *      fails on any pair below its AA threshold,
 *   4. fails on any banned brutalist device reappearing in the stylesheet.
 *
 * Exit 0 = the token map is what DESIGN.md says it is. Exit 1 = it drifted.
 *
 *   node scripts/check-design-tokens.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS = path.join(ROOT, 'src', 'lib', 'index.css');

/** Tokens that must exist in the map (DESIGN.md §2). */
const REQUIRED = [
  '--canvas', '--plate', '--ink', '--muted', '--hairline', '--soft',
  '--accent', '--accent-soft',
  '--night', '--night-line', '--night-text', '--night-muted',
  '--display', '--body', '--mono',
  '--t-label', '--t-small', '--t-body', '--t-lead', '--t-h3', '--t-h2', '--t-h1',
  '--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-7', '--s-8',
  '--measure', '--radius', '--motion', '--ease',
];

/**
 * Distinct hex values allowed in the map. 12 declared, 2 of them shared → 10 real.
 *
 * Limitation (documented, not a bug — DESIGN.md §2): only `#hex` literals are counted. The rgba
 * values (`--header-bg`, `--night-line`, and the three rgba literals inside rules) are not hex and
 * never enter this budget, so the "≤ 14" claim bounds the hex palette only.
 */
const HEX_BUDGET = 14;

/**
 * Declared text/surface pairs. `min` is the WCAG AA threshold for the *smallest* body
 * text that pair is used on: 4.5 normal text, 3.0 large text only.
 *
 * Kept in step with DESIGN.md §5. A pair used on a surface that cannot clear AA is deliberately
 * absent and documented instead: `--muted` on `--soft` (4.45:1) and on any dark surface (3.32:1)
 * are not allowed — those panels carry `--ink` / `--night-muted`.
 */
const PAIRS = [
  { fg: '--ink', bg: '--canvas', use: 'body copy on the page, default', min: 4.5 },
  { fg: '--ink', bg: '--plate', use: 'cards, plates, tables, ledger rows', min: 4.5 },
  { fg: '--ink', bg: '--soft', use: 'inset panels, pills, education row', min: 4.5 },
  { fg: '--ink', bg: '--accent-soft', use: 'callout strips, active palette row', min: 4.5 },
  { fg: '--muted', bg: '--canvas', use: 'mono labels and metadata', min: 4.5 },
  { fg: '--muted', bg: '--plate', use: 'metadata inside cards', min: 4.5 },
  { fg: '--muted', bg: '--accent-soft', use: 'hint text on the active palette row', min: 4.5 },
  { fg: '--accent', bg: '--canvas', use: 'links, active nav, shipped pill', min: 4.5 },
  { fg: '--accent', bg: '--plate', use: 'links and counts inside cards', min: 4.5 },
  { fg: '--plate', bg: '--accent', use: 'small numbered markers on accent fill', min: 4.5 },
  { fg: '--plate', bg: '--ink', use: 'solid CTA fill, wordmark, pressed filter chip', min: 4.5 },
  { fg: '--night-text', bg: '--night', use: 'dark specimen plate text', min: 4.5 },
  { fg: '--night-text', bg: '--ink', use: 'the ink/offscreen strip', min: 4.5 },
  { fg: '--night-muted', bg: '--night', use: 'dark specimen plate metadata', min: 4.5 },
];

/** Devices the spec-sheet system retires (DESIGN.md §2 "Banned"). */
const BANNED = [
  { re: /box-shadow:\s*[^;]*\b\d+px\s+\d+px\s+0\b/, why: 'hard offset shadow' },
  { re: /-webkit-text-stroke|(?<!-webkit-)\btext-stroke\b/, why: 'text-stroke' },
  { re: /writing-mode/, why: 'writing-mode label' },
  { re: /#c7ff1a/i, why: 'retired acid green' },
  { re: /border(?:-width)?:\s*[2-9]px|border:\s*[2-9]px/, why: 'border thicker than 1px' },
];

function fail(lines, msg) {
  lines.push(`✗ ${msg}`);
  return lines;
}

/** sRGB relative luminance, WCAG 2.1. */
function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

function main() {
  const problems = [];
  const report = [];

  let css;
  try {
    css = readFileSync(CSS, 'utf8');
  } catch (err) {
    console.error(`✗ cannot read ${CSS}: ${err.message}`);
    process.exit(1);
  }

  const block = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!block) {
    console.error('✗ no `:root { … }` token map found in src/lib/index.css');
    process.exit(1);
  }

  const tokens = new Map();
  for (const decl of block[1].split(';')) {
    const m = decl.match(/(--[a-z0-9-]+)\s*:\s*(.+)/i);
    if (m) tokens.set(m[1], m[2].trim());
  }

  // 1. required tokens
  const missing = REQUIRED.filter((t) => !tokens.has(t));
  if (missing.length) fail(problems, `missing required token(s): ${missing.join(', ')}`);

  // 2. hex budget
  const hexes = new Set();
  for (const value of tokens.values()) {
    for (const h of value.match(/#[0-9a-fA-F]{3,8}/g) ?? []) hexes.add(h.toLowerCase());
  }
  report.push(`  distinct hex values in the map: ${hexes.size} (budget ${HEX_BUDGET})`);
  if (hexes.size > HEX_BUDGET) {
    fail(problems, `${hexes.size} distinct hex values exceeds the ${HEX_BUDGET} budget`);
  }

  // 3. contrast
  report.push('');
  report.push('  pair                                         ratio   min   verdict');
  for (const { fg, bg, use, min } of PAIRS) {
    const fgVal = tokens.get(fg);
    const bgVal = tokens.get(bg);
    if (!fgVal || !bgVal) {
      fail(problems, `pair ${fg} on ${bg} references an undefined token`);
      continue;
    }
    if (!/^#[0-9a-fA-F]{3,8}$/.test(fgVal) || !/^#[0-9a-fA-F]{3,8}$/.test(bgVal)) {
      fail(problems, `pair ${fg} on ${bg} (${use}) is not computable: values must be hex`);
      continue;
    }
    const r = ratio(fgVal, bgVal);
    const ok = r >= min;
    report.push(
      `  ${`${fg} on ${bg}`.padEnd(44)}${r.toFixed(2).padStart(5)}  ${min.toFixed(1).padStart(4)}   ${ok ? 'pass' : 'FAIL'}`,
    );
    if (!ok) fail(problems, `${fg} on ${bg} is ${r.toFixed(2)}:1 — below AA ${min}:1 (${use})`);
  }

  // 4. banned devices
  report.push('');
  const rules = css.split('\n');
  for (const { re, why } of BANNED) {
    rules.forEach((line, i) => {
      if (re.test(line)) fail(problems, `banned ${why} at src/lib/index.css:${i + 1} → ${line.trim().slice(0, 90)}`);
    });
  }
  if (!problems.some((p) => p.includes('banned'))) report.push('  no banned brutalist devices found');

  console.log('design token check — src/lib/index.css');
  console.log(report.join('\n'));
  console.log('');

  if (problems.length) {
    console.log(problems.join('\n'));
    console.log(`\n✗ design token check FAILED (${problems.length} problem${problems.length === 1 ? '' : 's'})`);
    process.exit(1);
  }
  console.log('✓ token map matches DESIGN.md — every declared pair meets WCAG AA');
}

main();
