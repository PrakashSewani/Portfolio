/**
 * Content contract tests — the schema every consumer agrees on.
 *
 * Run with:  npm test   (node --test, no test framework dependency)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  validateProject,
  validateProjectList,
  validateLedgerRow,
  validateLedgerList,
  toLedger,
  sortProjects,
  ProjectSchemaError,
} from '../src/lib/projects.ts';
import { CONTENT_DIR, ROOT, loadContent } from '../scripts/load-content.mjs';

const SNAPSHOT = path.join(ROOT, 'public', 'api', 'projects.json');

const valid = {
  slug: 'demo',
  title: 'Demo',
  summary: 'A summary.',
  status: 'shipped',
  stack: ['TypeScript'],
  links: [{ label: 'GitHub', href: 'https://example.com/demo' }],
};

test('content/projects/*.json all validate', async () => {
  const projects = await loadContent();
  assert.equal(projects.length, 4, 'expected the four shipped project files');
  for (const project of projects) {
    assert.match(project.slug, /^[a-z0-9-]+$/);
    assert.ok(project.summary.length > 0);
    assert.ok(project.stack.length > 0);
    assert.ok(project.links.length > 0);
  }
});

test('every project file is named after its slug', async () => {
  const projects = await loadContent();
  const { readdir } = await import('node:fs/promises');
  const files = (await readdir(CONTENT_DIR)).filter((file) => file.endsWith('.json')).sort();
  assert.deepEqual(files.map((file) => file.replace(/\.json$/, '')), projects.map((project) => project.slug).sort());
});

test('the baked snapshot matches content/projects (no drift)', async () => {
  const projects = await loadContent();
  const snapshot = JSON.parse(await readFile(SNAPSHOT, 'utf8'));
  assert.equal(snapshot.count, projects.length);
  // JSON drops `undefined` keys, so compare against the round-trip rather than the literals.
  assert.deepEqual(
    snapshot.projects.map((project) => project.slug),
    projects.map((project) => project.slug),
  );
  assert.deepEqual(snapshot.projects, JSON.parse(JSON.stringify(projects)), 'run `npm run snapshot` after editing content');
});

test('the schema accepts a minimal project and fills nothing in', () => {
  const project = validateProject(valid, 'demo.json');
  assert.equal(project.slug, 'demo');
  assert.equal(project.kicker, undefined);
  assert.equal(project.year, undefined);
});

test('unknown keys are a hard error', () => {
  assert.throws(() => validateProject({ ...valid, tehc: ['oops'] }, 'demo.json'), ProjectSchemaError);
  assert.throws(() => validateProject({ ...valid, evidence: [{ label: 'a', value: 'b', extra: 1 }] }, 'demo.json'), /unknown key/);
});

test('required keys, slug and status are enforced', () => {
  const { links, ...withoutLinks } = valid;
  assert.throws(() => validateProject(withoutLinks, 'demo.json'), /missing required key: links/);
  assert.throws(() => validateProject({ ...valid, slug: 'Not A Slug' }, 'demo.json'), /must match/);
  assert.throws(() => validateProject({ ...valid, status: 'maybe' }, 'demo.json'), /must be one of shipped \| in-progress \| archived/);
  assert.throws(() => validateProject({ ...valid, stack: [] }, 'demo.json'), /at least 1 entry/);
  assert.throws(() => validateProject({ ...valid, links: [{ label: 'G', href: 'ftp://x' }] }, 'demo.json'), /http\(s\) URL/);
  assert.throws(() => validateProject({ ...valid, year: 12 }, 'demo.json'), /year must be an integer/);
});

test('specimen kind is constrained to the drawn figures', () => {
  assert.throws(() => validateProject({ ...valid, specimen: { kind: 'hologram', caption: 'x' } }, 'demo.json'), /specimen.kind/);
  const withSpecimen = validateProject(
    { ...valid, specimen: { kind: 'inspector', caption: 'Cap', callouts: [{ n: 1, text: 'one' }] } },
    'demo.json',
  );
  assert.equal(withSpecimen.specimen.kind, 'inspector');
  assert.equal(withSpecimen.specimen.callouts[0].text, 'one');
});

test('duplicate slugs are rejected', () => {
  assert.throws(() => validateProjectList([valid, { ...valid, title: 'Twin' }], 'list'), /duplicate slug/);
});

test('a ledger row is a project projection and refuses case-study keys', () => {
  const row = validateLedgerRow(toLedger(validateProject(valid, 'demo.json')), 'row');
  assert.deepEqual(Object.keys(row).sort(), [
    'featured', 'kicker', 'order', 'ownership', 'slug', 'stack', 'status', 'summary', 'title', 'year',
  ]);
  assert.throws(() => validateLedgerRow({ ...row, challenge: 'sneaky' }, 'row'), /must not carry the case-study key "challenge"/);
  assert.throws(() => validateLedgerRow({ ...row, links: [] }, 'row'), /must not carry the case-study key "links"/);
});

test('the ledger list sorts by order and rejects duplicates', () => {
  const rows = validateLedgerList([
    toLedger(validateProject({ ...valid, slug: 'second', order: 2 }, 'b')),
    toLedger(validateProject({ ...valid, slug: 'first', order: 1 }, 'a')),
  ]);
  assert.deepEqual(rows.map((row) => row.slug), ['first', 'second']);
  assert.throws(() => validateLedgerList([rows[0], rows[0]]), /duplicate slug/);
  assert.throws(() => validateLedgerList('nope'), /must be a JSON array/);
});

test('sortProjects puts explicit order first, then newest year, then title', () => {
  const explicit = validateProject({ ...valid, slug: 'a', title: 'Alpha', order: 9 }, 'a');
  const noOrder = validateProject({ ...valid, slug: 'b', title: 'Beta' }, 'b');
  const withYear = validateProject({ ...valid, slug: 'c', title: 'Gamma', year: 2025 }, 'c');
  assert.deepEqual(sortProjects([noOrder, withYear, explicit]).map((project) => project.slug), ['a', 'c', 'b']);

  const byYear = [
    validateProject({ ...valid, slug: 'old', title: 'Old' }, 'old'),
    validateProject({ ...valid, slug: 'new', title: 'New', year: 2025 }, 'new'),
  ];
  assert.deepEqual(sortProjects(byYear).map((project) => project.slug), ['new', 'old']);
});
