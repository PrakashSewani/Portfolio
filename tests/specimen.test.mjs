/**
 * Specimen figure tests — the drawing behind the plate.
 *
 * The app is TSX and `node --test` cannot parse JSX, so the component is transpiled with the repo's
 * own TypeScript and imported as ESM; the markup then comes from `react-dom/server`, which means
 * these assertions run against what a browser actually receives, not against a string someone
 * typed twice.
 *
 * What is pinned:
 *   - every kind in SPECIMEN_KINDS renders a plate (add a kind, you must draw it),
 *   - `FIG. <nn>` is the index the page passes (and the page passes the project's `order`),
 *   - a callout marker is the data's `n`, not DOM order,
 *   - the twelve drawn figures are pairwise distinct, and only `none` is empty,
 *   - no figure ships a raw hex, an offset shadow or a text-stroke,
 *   - every specimen in content/projects names a drawn kind.
 */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { SPECIMEN_KINDS } from '../src/lib/projects.js';
import { ROOT, loadContent } from '../scripts/load-content.mjs';

const COMPONENT = path.join(ROOT, 'src', 'components', 'SpecimenPlate.tsx');
const CACHE = path.join(ROOT, 'node_modules', '.cache', 'specimen-plate');

/** Transpile the plate into a module node can import (next to the deps it imports). */
async function loadPlate() {
  const source = await readFile(COMPONENT, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    fileName: 'SpecimenPlate.tsx',
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
    },
  });
  await mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, 'SpecimenPlate.mjs');
  await writeFile(file, outputText);
  return (await import(pathToFileURL(file).href)).default;
}

after(async () => {
  await rm(CACHE, { recursive: true, force: true });
});

const Plate = await loadPlate();
const { createElement } = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');

/** One plate, rendered the way the case page renders it. */
function render(props) {
  return renderToStaticMarkup(
    createElement(Plate, { callouts: [{ n: 1, text: 'one' }], ...props }),
  );
}

/** The drawn slot: what sits between the figure div and the callout list. */
function figureOf(markup) {
  const start = markup.indexOf('class="plate-figure"');
  const end = markup.indexOf('class="plate-callouts"');
  assert.ok(start > -1 && end > start, 'the plate must keep caption → figure → callouts');
  return markup.slice(start, end);
}

test('every registered kind draws a plate, and FIG. follows the index it is given', () => {
  for (const [i, kind] of SPECIMEN_KINDS.entries()) {
    const index = i + 5;
    const markup = render({ kind, caption: `Caption ${kind}`, index, footnote: ['TypeScript'] });
    assert.match(markup, new RegExp(`class="plate plate-${kind}"`), `${kind} must draw its own plate`);
    assert.match(markup, new RegExp(`FIG\\. ${String(index).padStart(2, '0')}`), `${kind} must show FIG. ${index}`);
    assert.match(markup, /data-n="1"/, `${kind} must mark callouts from the data, not DOM order`);
    assert.match(markup, /Caption /, `${kind} must render the caption strip`);
    assert.match(markup, /class="plate-footnote"/, `${kind} must close with the footnote strip`);
  }
});

test('the twelve drawn kinds draw twelve different figures, and only `none` is empty', () => {
  const figures = new Map();
  for (const kind of SPECIMEN_KINDS) figures.set(kind, figureOf(render({ kind, caption: kind })));

  assert.match(figures.get('none'), /no figure/, 'a project without a specimen must say so');

  const drawn = SPECIMEN_KINDS.filter((kind) => kind !== 'none');
  assert.equal(drawn.length, 12, 'four originals + eight case-study figures');
  const byFigure = new Map();
  for (const kind of drawn) {
    const figure = figures.get(kind);
    assert.ok(!figure.includes('no figure'), `${kind} must draw a figure, not the fallback`);
    assert.ok(figure.length > 200, `${kind} draws too little to be a figure`);
    const twin = byFigure.get(figure);
    assert.equal(twin, undefined, `${kind} draws exactly what ${twin} draws`);
    byFigure.set(figure, kind);
  }
});

test('no figure ships a raw hex, an offset shadow or a text-stroke', async () => {
  const source = await readFile(COMPONENT, 'utf8');
  const banned = [
    [/#[0-9a-fA-F]{3,8}\b/, 'a raw hex — figures reference var(--token) only'],
    [/\d+px\s+\d+px\s+0/, 'a hard offset shadow'],
    [/text-stroke|writing-mode/, 'a retired device'],
  ];
  for (const [re, why] of banned) assert.ok(!re.test(source), `SpecimenPlate.tsx contains ${why}`);

  for (const kind of SPECIMEN_KINDS) {
    const markup = render({ kind, caption: kind });
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(markup), `${kind} rendered a raw hex`);
  }
});

test('every specimen in content/projects is a drawn kind with a caption and callouts', async () => {
  const projects = await loadContent();
  const withSpecimen = projects.filter((project) => project.specimen);
  assert.ok(withSpecimen.length >= 12, `expected the 12 specimens, found ${withSpecimen.length}`);
  for (const project of withSpecimen) {
    const { kind, caption, callouts } = project.specimen;
    assert.ok(SPECIMEN_KINDS.includes(kind), `${project.slug} uses the undrawn kind "${kind}"`);
    assert.ok(kind !== 'none', `${project.slug} carries a specimen but draws nothing`);
    assert.ok(caption.length > 0, `${project.slug} needs a caption`);
    assert.ok(callouts.length > 0, `${project.slug} needs callouts`);
  }
});
