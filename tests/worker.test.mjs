/**
 * Worker tests — the API and the per-project shell, exercised directly against the module with a
 * fake KV namespace and a fake ASSETS fetcher. No wrangler, no network, no credentials needed.
 *
 * The wrangler config is asserted too, because the whole feature is dead on arrival without
 * `run_worker_first` (Cloudflare serves assets + the SPA fallback before the Worker script).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import worker from '../src/worker.ts';
import { toLedger } from '../src/lib/projects.ts';
import { ROOT, loadContent } from '../scripts/load-content.mjs';

const SHELL = [
  '<!doctype html>',
  '<html><head>',
  '<title>Prakash Sewani | Senior Software Engineer</title>',
  '<link rel="canonical" href="https://prakashsewani.com/" />',
  '<!--route-meta-->',
  '</head><body><div id="root"></div></body></html>',
].join('\n');

async function fakeEnv({ projects = null, assets = SHELL } = {}) {
  const list = projects ?? (await loadContent());
  const store = new Map();
  store.set('index', JSON.stringify({ generatedAt: '2026-10-14T00:00:00.000Z', count: list.length, projects: list.map(toLedger) }));
  for (const project of list) store.set(`project:${project.slug}`, JSON.stringify(project));
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
        async fetch() {
          return new Response(assets, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
        },
      },
    },
  };
}

const call = (env, url, init) => worker.fetch(new Request(url, init), env);

test('GET /api/projects returns the ledger with caching + ETag', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/api/projects');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /max-age=60/);
  assert.match(response.headers.get('cache-control'), /stale-while-revalidate=600/);
  assert.ok(response.headers.get('etag'));

  const payload = await response.json();
  assert.equal(payload.count, 4);
  assert.deepEqual(payload.projects.map((row) => row.slug), ['class-spy', 'episode-roulette', 'habitual', 'smart-education-bot']);
  // the ledger must stay lean — no case-study keys in the one-read payload
  for (const row of payload.projects) {
    for (const key of ['challenge', 'decisions', 'evidence', 'specimen', 'links']) {
      assert.equal(row[key], undefined, `ledger row leaked ${key}`);
    }
  }
});

test('the ledger honours If-None-Match with a 304', async () => {
  const { env } = await fakeEnv();
  const first = await call(env, 'https://prakashsewani.com/api/projects');
  const etag = first.headers.get('etag');
  const second = await call(env, 'https://prakashsewani.com/api/projects', { headers: { 'if-none-match': etag } });
  assert.equal(second.status, 304);
});

test('GET /api/projects/<slug> returns one full project', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/api/projects/class-spy');
  assert.equal(response.status, 200);
  const project = await response.json();
  assert.equal(project.slug, 'class-spy');
  assert.ok(project.challenge, 'a case study needs its engineering problem');
  assert.equal(project.specimen.kind, 'inspector');
});

test('an unknown slug is a 404 JSON, not the app shell', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/api/projects/nope');
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal((await response.json()).error, 'not_found');
});

test('misconfigured KV degrades to a 503 the client can fall back from', async () => {
  const { env } = await fakeEnv();
  delete env.PROJECTS;
  const response = await call(env, 'https://prakashsewani.com/api/projects');
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'content_service_unbound');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('a missing assets binding is reported clearly, not thrown', async () => {
  // The local runtime made this real: without `assets.binding` in wrangler.jsonc, env.ASSETS is
  // undefined and the pre-fix worker died with "Cannot read properties of undefined".
  const { env } = await fakeEnv();
  delete env.ASSETS;
  const shell = await call(env, 'https://prakashsewani.com/projects/class-spy');
  assert.equal(shell.status, 500);
  assert.match(await shell.text(), /static assets binding is not configured/);
  const fallthrough = await call(env, 'https://prakashsewani.com/assets/index-abc.js');
  assert.equal(fallthrough.status, 500);
});

test('an unseeded namespace reports 404 rather than an empty ledger', async () => {
  const { env, store } = await fakeEnv();
  store.clear();
  const response = await call(env, 'https://prakashsewani.com/api/projects');
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error, 'projects_not_published');
});

test('GET /sitemap.xml lists the home page, the index and every project', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/sitemap.xml');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/xml/);
  const xml = await response.text();
  assert.match(xml, /<loc>https:\/\/prakashsewani\.com\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/prakashsewani\.com\/projects<\/loc>/);
  for (const slug of ['class-spy', 'episode-roulette', 'habitual', 'smart-education-bot']) {
    assert.ok(xml.includes(`<loc>https://prakashsewani.com/projects/${slug}</loc>`), `sitemap is missing ${slug}`);
  }
});

test('GET /projects/<slug> injects real title + OG tags into the shell', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/projects/class-spy');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Class-Spy — Prakash Sewani<\/title>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/prakashsewani\.com\/projects\/class-spy" \/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/prakashsewani\.com\/projects\/class-spy" \/>/);
  assert.ok(!html.includes('<!--route-meta-->'), 'the route-meta placeholder should have been consumed');
  assert.ok(!html.includes('<link rel="canonical" href="https://prakashsewani.com/" />'), 'the site-wide canonical should be replaced');
});

test('GET /projects/<unknown> serves the shell with an honest 404', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/projects/nope');
  assert.equal(response.status, 404);
  assert.match(await response.text(), /id="root"/, 'the client still needs the app shell to render its not-found state');
});

test('anything else falls through to the static assets', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/assets/index-abc.js');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
});

test('non-GET methods are refused', async () => {
  const { env } = await fakeEnv();
  const response = await call(env, 'https://prakashsewani.com/api/projects', { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});

test('wrangler.jsonc runs the worker first for every path it owns', async () => {
  const config = await readFile(path.join(ROOT, 'wrangler.jsonc'), 'utf8');
  const runWorkerFirst = config.match(/"run_worker_first"\s*:\s*\[([^\]]*)\]/)?.[1] ?? '';
  for (const route of ['/api/*', '/projects/*', '/sitemap.xml']) {
    assert.ok(runWorkerFirst.includes(`"${route}"`), `run_worker_first must include ${route}`);
  }
  assert.match(config, /"not_found_handling"\s*:\s*"single-page-application"/);
  assert.match(config, /"binding"\s*:\s*"ASSETS"/, 'assets.binding must be declared or env.ASSETS is undefined at runtime');
  assert.match(config, /"binding"\s*:\s*"PROJECTS"/);
  assert.match(config, /"main"\s*:\s*"src\/worker\.ts"/);
});
