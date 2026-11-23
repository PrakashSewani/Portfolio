/**
 * Content contract tests. Run with: npm test (node --test, no framework dependency).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { validateProject, validateProjectList, sortProjects, STAGES, SPECIMEN_KINDS, ProjectSchemaError } from '../src/lib/projects.js';
import { CONTENT_DIR, ROOT, loadContent } from '../scripts/load-content.mjs';

const valid = {
  slug: 'demo',
  title: 'Demo',
  summary: 'A summary.',
  status: 'shipped',
  stack: ['TypeScript'],
  links: [{ label: 'GitHub', href: 'https://example.com/demo' }],
};

test('content/projects/*.json all validate, and each file is named after its slug', async () => {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json')).sort();
  const projects = await loadContent();
  assert.equal(projects.length, files.length);
  assert.deepEqual(files.map((f) => f.replace(/\.json$/, '')), projects.map((p) => p.slug).sort());
});

test('every content file is in the schema’s canonical form', async () => {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json')).sort();
  for (const file of files) {
    const source = `content/projects/${file}`;
    const text = await readFile(path.join(CONTENT_DIR, file), 'utf8');
    const canonical = `${JSON.stringify(validateProject(JSON.parse(text), source), null, 2)}\n`;
    assert.equal(text.replace(/\r\n/g, '\n'), canonical, `${source} is off-contract — run \`npm run normalize\``);
  }
});

test('every project sits on the signal path', async () => {
  for (const project of await loadContent()) {
    assert.ok(STAGES.includes(project.stage), `${project.slug} needs a stage`);
  }
});

test('featured projects carry the full case-file keys, and there are six', async () => {
  const featured = (await loadContent()).filter((p) => p.featured);
  assert.equal(featured.length, 6, 'the home page promises six case files');
  for (const p of featured) {
    for (const key of ['kicker', 'challenge', 'decisions', 'evidence', 'ownership', 'specimen']) {
      assert.ok(p[key], `${p.slug} is featured but has no ${key}`);
    }
    assert.notEqual(p.specimen.kind, 'none', `${p.slug} is featured but has no drawn figure`);
  }
  assert.deepEqual(
    featured.map((p) => p.stage),
    ['sense', 'edge', 'gateway', 'gateway', 'services', 'screen'],
    'featured work is ordered along the signal path',
  );
});

test('every figure kind a featured project names is actually drawn', async () => {
  const source = await readFile(path.join(ROOT, 'src', 'components', 'Figures.tsx'), 'utf8');
  for (const p of (await loadContent()).filter((x) => x.featured)) {
    assert.match(source, new RegExp(`\\b${p.specimen.kind}:\\s*\\w+`), `no drawing registered for kind "${p.specimen.kind}"`);
  }
  assert.ok(SPECIMEN_KINDS.includes('none'));
});

test('the data module has no second copy of the projects', async () => {
  const source = await readFile(path.join(ROOT, 'src', 'data', 'projects.ts'), 'utf8');
  assert.match(source, /import\.meta\.glob.*content\/projects/);
  assert.ok(!/slug:\s*'/.test(source));
});

test('the schema accepts a minimal project', () => {
  const project = validateProject(valid, 'demo.json');
  assert.equal(project.slug, 'demo');
  assert.equal(project.stage, undefined);
});

test('unknown keys, bad slugs, statuses, stages and links are hard errors', () => {
  assert.throws(() => validateProject({ ...valid, tehc: [] }, 'demo.json'), ProjectSchemaError);
  assert.throws(() => validateProject({ ...valid, slug: 'Not A Slug' }, 'demo.json'), /must match/);
  assert.throws(() => validateProject({ ...valid, status: 'maybe' }, 'demo.json'), /shipped \| in-progress \| archived/);
  assert.throws(() => validateProject({ ...valid, stage: 'cloud' }, 'demo.json'), /sense \| edge/);
  assert.throws(() => validateProject({ ...valid, stack: [] }, 'demo.json'), /at least 1 entry/);
  assert.throws(() => validateProject({ ...valid, links: [{ label: 'G', href: 'ftp://x' }] }, 'demo.json'), /http\(s\) URL/);
  assert.throws(() => validateProject({ ...valid, year: 12 }, 'demo.json'), /year must be an integer/);
});

test('lists reject duplicate slugs and sort by order, then newest year, then title', () => {
  assert.throws(() => validateProjectList([valid, valid]), /duplicate slug/);
  const sorted = sortProjects([
    { title: 'B', year: 2025 },
    { title: 'A', year: 2026 },
    { title: 'C', order: 1, year: 2020 },
  ]);
  assert.deepEqual(sorted.map((p) => p.title), ['C', 'A', 'B']);
});
