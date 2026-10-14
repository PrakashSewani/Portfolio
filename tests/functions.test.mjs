/**
 * Pages Functions tests — the API, the sitemap and the per-project shell, exercised directly
 * against src/lib/pages-api.ts with a fake KV and a fake ASSETS fetcher. No wrangler, no network,
 * no credentials.
 *
 * The deployment shape is asserted too: the site is a **Pages** project, so the config is
 * wrangler.toml with `pages_build_output_dir` (a Worker-style `wrangler.jsonc` must not come
 * back), the snapshot must stay excluded from the Function (or the client's fallback fetch would
 * get a 404 instead of the baked JSON), and the Function files must exist at the paths Pages
 * routes from.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { apiResponse, injectMeta, sitemapResponse, shellResponse } from '../src/lib/pages-api.ts';
import { sortProjects, toLedger, validateLedgerList, validateProject } from '../src/lib/projects.js';
import { ROOT, loadContent } from '../scripts/load-content.mjs';

const SHELL = [
  '<!doctype html>',
  '<html><head>',
  '<title>Prakash Sewani | Senior Software Engineer</title>',
  '<link rel="canonical" href="https://prakashsewani.com/" />',
  '<!--route-meta-->',
  '</head><body><div id="root"></div></body></html>',
].join('\n');

async function fakeEnv({ assets = SHELL } = {}) {
  const list = await loadContent();
  const store = new Map();
  store.set('index', JSON.stringify({ generatedAt: '2026-10-14T00:00:00.000Z', count: list.length, projects: list.map(toLedger) }));
  for (const project of list) store.set(`project:${project.slug}`, JSON.stringify(project));
  const snapshot = await readFile(path.join(ROOT, 'public', 'api', 'projects.json'), 'utf8');
  return {
    store,
    env: {
      PROJECTS: {
        async get(key) {
          return store.has(key) ? store.get(key) : null;
        },
        async put(key, value) {
          store.set(key, value);
        },
      },
      ASSETS: {
        async fetch(input) {
          const url = typeof input === 'string' ? input : input.url;
          const body = url.endsWith('/api/projects.json') ? snapshot : assets;
          return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } });
        },
      },
    },
  };
}

const request = (url, init) => new Request(url, init);

const PROJECT_STUBS = {
  summary: 'A summary.',
  status: 'shipped',
  stack: ['TypeScript'],
};

test('the ledger route returns rows with caching + ETag and no case-study keys', async () => {
  const { env } = await fakeEnv();
  const response = await apiResponse(request('https://prakashsewani.com/api/projects'), env, 'projects');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /max-age=60/);
  assert.match(response.headers.get('cache-control'), /stale-while-revalidate=600/);
  assert.ok(response.headers.get('etag'));

  const payload = await response.json();
  assert.equal(payload.count, 4);
  assert.deepEqual(payload.projects.map((row) => row.slug), [
    'class-spy',
    'episode-roulette',
    'habitual',
    'smart-education-bot',
  ]);
  for (const row of payload.projects) {
    for (const key of ['challenge', 'decisions', 'evidence', 'specimen', 'links']) {
      assert.equal(row[key], undefined, `ledger row leaked ${key}`);
    }
  }
});

test('/api on its own also returns the ledger', async () => {
  const { env } = await fakeEnv();
  const response = await apiResponse(request('https://prakashsewani.com/api'), env, '');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 4);
});

test('the ledger honours If-None-Match with a 304', async () => {
  const { env } = await fakeEnv();
  const first = await apiResponse(request('https://prakashsewani.com/api/projects'), env, 'projects');
  const etag = first.headers.get('etag');
  const second = await apiResponse(
    request('https://prakashsewani.com/api/projects', { headers: { 'if-none-match': etag } }),
    env,
    'projects',
  );
  assert.equal(second.status, 304);
});

test('one project returns the full case study', async () => {
  const { env } = await fakeEnv();
  const response = await apiResponse(request('https://prakashsewani.com/api/projects/class-spy'), env, 'projects/class-spy');
  assert.equal(response.status, 200);
  const project = await response.json();
  assert.equal(project.slug, 'class-spy');
  assert.ok(project.challenge, 'a case study needs its engineering problem');
  assert.equal(project.specimen.kind, 'inspector');
});

test('an unknown slug is a 404 JSON, not the app shell', async () => {
  const { env } = await fakeEnv();
  const response = await apiResponse(request('https://prakashsewani.com/api/projects/nope'), env, 'projects/nope');
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal((await response.json()).error, 'not_found');
});

test('a malformed percent-escape in a slug is a 404, not a 500', async () => {
  const { env } = await fakeEnv();
  // Any scanner reaches /api/projects/%, and a truncated escape in a shared link does too.
  for (const segment of ['%', '%ZZ', '%E0%A4%A']) {
    const response = await apiResponse(
      request(`https://prakashsewani.com/api/projects/${segment}`),
      env,
      `projects/${segment}`,
    );
    assert.equal(response.status, 404, `expected 404 for ${segment}`);
    assert.equal((await response.json()).error, 'not_found');
  }
});

test('an unknown /api tail is a 404 JSON', async () => {
  const { env } = await fakeEnv();
  const response = await apiResponse(request('https://prakashsewani.com/api/nonsense'), env, 'nonsense');
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error, 'not_found');
});

test('the snapshot URL still serves the baked JSON if the Function is asked for it', async () => {
  // Found in the browser/runtime, not in review: if /api/projects.json is routed to the Function
  // instead of the asset server, a 404 here would break the client's whole fallback path.
  const { env } = await fakeEnv();
  const response = await apiResponse(request('https://prakashsewani.com/api/projects.json'), env, 'projects.json');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const payload = await response.json();
  assert.equal(payload.count, 4);
  assert.deepEqual(payload.projects.map((project) => project.slug), [
    'class-spy',
    'episode-roulette',
    'habitual',
    'smart-education-bot',
  ]);
  assert.ok(payload.projects[0].challenge, 'the snapshot must hold full projects, not just ledger rows');
});

test('a misconfigured KV binding degrades to a 503 the client can fall back from', async () => {
  const { env } = await fakeEnv();
  delete env.PROJECTS;
  const response = await apiResponse(request('https://prakashsewani.com/api/projects'), env, 'projects');
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'content_service_unbound');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('an unseeded namespace reports 404 rather than an empty ledger', async () => {
  const { env, store } = await fakeEnv();
  store.clear();
  const response = await apiResponse(request('https://prakashsewani.com/api/projects'), env, 'projects');
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error, 'projects_not_published');
});

test('a poisoned index row fails loudly instead of shipping to every client', async () => {
  const { env, store } = await fakeEnv();
  for (const poison of [{ ...JSON.parse(store.get('index')).projects[0], challenge: 'leaked case-study key' }, 'not an object']) {
    const index = JSON.parse(store.get('index'));
    index.projects[0] = poison;
    store.set('index', JSON.stringify(index));
    const response = await apiResponse(request('https://prakashsewani.com/api/projects'), env, 'projects');
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error, 'invalid_index');
  }
});

test('the ledger order matches the project order for the same data', () => {
  // The live path (validateLedgerList) and the snapshot path (sortProjects) must agree: two rows
  // sharing an `order` used to come back in opposite sequences.
  const rows = validateLedgerList([
    { ...PROJECT_STUBS, slug: 'alpha', title: 'Alpha', order: 1, year: 2020 },
    { ...PROJECT_STUBS, slug: 'beta', title: 'Beta', order: 1, year: 2025 },
  ]);
  const projects = sortProjects([
    validateProject({ ...PROJECT_STUBS, links: [{ label: 'GitHub', href: 'https://example.com/a' }], slug: 'alpha', title: 'Alpha', order: 1, year: 2020 }, 'alpha'),
    validateProject({ ...PROJECT_STUBS, links: [{ label: 'GitHub', href: 'https://example.com/b' }], slug: 'beta', title: 'Beta', order: 1, year: 2025 }, 'beta'),
  ]);
  assert.deepEqual(rows.map((row) => row.slug), ['beta', 'alpha']);
  assert.deepEqual(rows.map((row) => row.slug), projects.map((project) => project.slug));
});

test('non-GET methods are refused', async () => {
  const { env } = await fakeEnv();
  const response = await apiResponse(request('https://prakashsewani.com/api/projects', { method: 'POST' }), env, 'projects');
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});

test('/sitemap.xml lists the home page, the index and every project', async () => {
  const { env } = await fakeEnv();
  const response = await sitemapResponse(request('https://prakashsewani.com/sitemap.xml'), env);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/xml/);
  const xml = await response.text();
  assert.match(xml, /<loc>https:\/\/prakashsewani\.com\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/prakashsewani\.com\/projects<\/loc>/);
  for (const slug of ['class-spy', 'episode-roulette', 'habitual', 'smart-education-bot']) {
    assert.ok(xml.includes(`<loc>https://prakashsewani.com/projects/${slug}</loc>`), `sitemap is missing ${slug}`);
  }
});

test('the sitemap never emits a slug that is not SLUG_RE and escapes its XML', async () => {
  const { env, store } = await fakeEnv();
  const index = JSON.parse(store.get('index'));
  index.projects.push({ ...index.projects[0], slug: '</loc><script>alert(1)</script><loc>' });
  store.set('index', JSON.stringify(index));
  const xml = await (await sitemapResponse(request('https://prakashsewani.com/sitemap.xml'), env)).text();
  assert.ok(!xml.includes('<script>'), 'hostile KV markup must not reach the sitemap');
  assert.ok(!xml.includes('</loc><script>alert(1)</script><loc></loc>'));
});

test('the sitemap still renders the base URLs with KV unavailable', async () => {
  const { env } = await fakeEnv();
  delete env.PROJECTS;
  const xml = await (await sitemapResponse(request('https://prakashsewani.com/sitemap.xml'), env)).text();
  assert.match(xml, /<loc>https:\/\/prakashsewani\.com\/<\/loc>/);
  assert.ok(!xml.includes('/projects/class-spy'));
});

test('/projects/<slug> injects real title + OG tags into the shell', async () => {
  const { env } = await fakeEnv();
  const response = await shellResponse(
    request('https://prakashsewani.com/projects/class-spy'),
    env,
    'https://prakashsewani.com/projects/class-spy',
    'class-spy',
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /stale-while-revalidate/);
  const html = await response.text();
  assert.match(html, /<title>Class-Spy — Prakash Sewani<\/title>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/prakashsewani\.com\/projects\/class-spy" \/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/prakashsewani\.com\/projects\/class-spy" \/>/);
  assert.ok(!html.includes('<!--route-meta-->'), 'the route-meta placeholder should have been consumed');
  assert.ok(!html.includes('<link rel="canonical" href="https://prakashsewani.com/" />'), 'the site-wide canonical should be replaced');
});

test('/projects/<unknown> serves the shell with an honest 404', async () => {
  const { env } = await fakeEnv();
  const response = await shellResponse(
    request('https://prakashsewani.com/projects/nope'),
    env,
    'https://prakashsewani.com/projects/nope',
    'nope',
  );
  assert.equal(response.status, 404);
  assert.match(await response.text(), /id="root"/, 'the client still needs the app shell to render its not-found state');
});

test('malformed KV content does not take the case page down', async () => {
  const { env, store } = await fakeEnv();
  store.set('project:habitual', '{ not json');
  const response = await shellResponse(
    request('https://prakashsewani.com/projects/habitual'),
    env,
    'https://prakashsewani.com/projects/habitual',
    'habitual',
  );
  assert.equal(response.status, 404);
  assert.match(await response.text(), /id="root"/);
});

test('a missing assets binding is reported clearly, not thrown', async () => {
  const { env } = await fakeEnv();
  delete env.ASSETS;
  const response = await shellResponse(
    request('https://prakashsewani.com/projects/class-spy'),
    env,
    'https://prakashsewani.com/projects/class-spy',
    'class-spy',
  );
  assert.equal(response.status, 500);
  assert.match(await response.text(), /static assets binding is not available/);
});

test('the Pages config is a Pages config, not a Worker config', async () => {
  const raw = await readFile(path.join(ROOT, 'wrangler.toml'), 'utf8');
  // Ignore comments: the header explains why there is no run_worker_first / assets table here.
  const config = raw
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('#'))
    .join('\n');

  assert.match(config, /^name\s*=\s*"portfolio"/m);
  assert.match(config, /^pages_build_output_dir\s*=\s*"dist"/m);
  assert.match(config, /binding\s*=\s*"PROJECTS"/);
  assert.match(config, /id\s*=\s*"[0-9a-f]{32}"/, 'the PROJECTS binding needs the real namespace id');
  assert.ok(!config.includes('run_worker_first'), 'run_worker_first belongs to the Worker layout this project does not use');
  assert.ok(!/^\s*\[assets\]/m.test(config), 'an [assets] table belongs to the Worker layout this project does not use');
  assert.ok(!/^\s*main\s*=/m.test(config), 'a Pages project has no Worker entry point');
  await assert.rejects(access(path.join(ROOT, 'wrangler.jsonc')), 'a Worker-style wrangler.jsonc must not come back');
});

test('the Functions sit where Pages routes from', async () => {
  for (const file of ['functions/api/[[route]].ts', 'functions/sitemap.xml.ts', 'functions/projects/[slug].ts']) {
    await access(path.join(ROOT, file));
  }
  // public/sitemap.xml would shadow the Function that generates it
  await assert.rejects(access(path.join(ROOT, 'public/sitemap.xml')), 'a static sitemap.xml would win over the Function');
});

test('_routes.json keeps the baked snapshot out of the Function', async () => {
  // It lives in public/ so the build copies it to dist/_routes.json — Pages only reads it from the
  // build output, which is why a copy at the repo root did nothing.
  const routes = JSON.parse(await readFile(path.join(ROOT, 'public', '_routes.json'), 'utf8'));
  assert.equal(routes.version, 1);
  assert.ok(routes.include.includes('/api/*'));
  assert.ok(routes.include.includes('/projects/*'), 'the case-sheet Function needs /projects/* routed to it');
  assert.ok(routes.include.includes('/sitemap.xml'));
  assert.ok(
    routes.exclude.includes('/api/projects.json'),
    'the client fallback should be served as a static asset, not by the API Function',
  );
  await assert.rejects(access(path.join(ROOT, '_routes.json')), 'a _routes.json at the repo root is not read by Pages');
});
