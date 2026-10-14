#!/usr/bin/env node
/**
 * publish-projects.mjs — validate `content/projects/*.json` and write them into Cloudflare KV.
 *
 * No wrangler install, no node_modules: validation is the same schema the site uses, and the
 * write is a plain `fetch` against the Cloudflare REST API. Adding a project becomes:
 *
 *   1. drop content/projects/<slug>.json in the repo
 *   2. node scripts/publish-projects.mjs
 *   3. live in ~60s (no rebuild, no redeploy)
 *
 * KV layout matches src/lib/pages-api.ts:
 *   index          → { generatedAt, count, projects: LedgerRow[] }   (the ledger, one read)
 *   project:<slug> → the full project object
 *
 * Publishing is a *sync*, not an append: after writing this run's keys it deletes any `project:`
 * key whose slug is no longer in `content/projects/`, so removing a file removes it from the live
 * site (and from the sitemap) instead of leaving it crawlable forever.
 *
 * Credentials (never in the repo, never in chat) — read from the environment, and from
 * $CLOUDFLARE_ENV_FILE when it exists:
 *   CLOUDFLARE_API_TOKEN          a token scoped to "Workers KV Storage: Edit"
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_KV_NAMESPACE_ID    or the id in wrangler.toml's PROJECTS binding
 *
 * Exit codes: 0 ok · 1 content invalid · 2 usage/config error · 3 credentials missing · 4 API error
 *
 *   node scripts/publish-projects.mjs [--dir content/projects] [--dry-run]
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_DIR, ROOT, loadContent, option } from './load-content.mjs';
import { toLedger } from '../src/lib/projects.js';

const SECRETS_FILE = process.env.CLOUDFLARE_ENV_FILE || '/root/.hermes/secrets/cloudflare.env';

/**
 * KEY=VALUE lines from a secrets file; real environment variables win.
 *
 * Only ENOENT is silent (no file configured). Anything else — EACCES from a bad chmod, a typo'd
 * `CLOUDFLARE_ENV_FILE` pointing at a directory, an explicit path that does not exist — is
 * reported with the path and the error, so a broken file is not mistaken for a missing token.
 */
async function readSecrets(file = SECRETS_FILE) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (err) {
    const explicit = Boolean(process.env.CLOUDFLARE_ENV_FILE);
    if (err.code !== 'ENOENT' || explicit) {
      console.warn(`publish-projects: could not read the secrets file ${file} (${err.code ?? 'error'}: ${err.message})`);
    }
    return {};
  }
  const out = {};
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

/** The KV namespace id, from the environment or the Pages config. */
async function namespaceId(secrets) {
  const fromEnv = process.env.CLOUDFLARE_KV_NAMESPACE_ID || secrets.CLOUDFLARE_KV_NAMESPACE_ID;
  if (fromEnv) return fromEnv;
  try {
    const config = await readFile(path.join(ROOT, 'wrangler.toml'), 'utf8');
    const id = config.match(/binding\s*=\s*"PROJECTS"[\s\S]*?id\s*=\s*"([^"]+)"/)?.[1];
    if (id && !id.startsWith('REPLACE_WITH')) return id;
  } catch {
    /* fall through */
  }
  return '';
}

function pairsFor(projects) {
  const index = {
    generatedAt: new Date().toISOString(),
    count: projects.length,
    projects: projects.map(toLedger),
  };
  return {
    index,
    pairs: [
      { key: 'index', value: JSON.stringify(index) },
      ...projects.map((project) => ({ key: `project:${project.slug}`, value: JSON.stringify(project) })),
    ],
  };
}

/** Every `project:` key currently in the namespace, following the API's cursor. */
async function listProjectKeys(endpoint, token) {
  const names = [];
  let cursor = '';
  do {
    const url = new URL(`${endpoint}/keys`);
    url.searchParams.set('prefix', 'project:');
    if (cursor) url.searchParams.set('cursor', cursor);
    const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success !== true) {
      throw new Error(`listing KV keys failed (HTTP ${response.status}): ${JSON.stringify(body.errors ?? body)}`);
    }
    for (const entry of body.result ?? []) names.push(entry.name);
    cursor = body.result_info?.cursor ?? '';
  } while (cursor);
  return names;
}

/** Delete keys that are no longer published. `DELETE .../bulk` takes an array of key names. */
async function deleteKeys(endpoint, token, keys) {
  const response = await fetch(`${endpoint}/bulk`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(keys),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success !== true) {
    throw new Error(`KV bulk delete failed (HTTP ${response.status}): ${JSON.stringify(body.errors ?? body)}`);
  }
}

async function main() {
  const dir = option(process.argv, 'dir', CONTENT_DIR);
  const dryRun = process.argv.includes('--dry-run');
  const emit = option(process.argv, 'emit', '');

  let projects;
  try {
    projects = await loadContent(dir);
  } catch (err) {
    console.error(`✗ content invalid: ${err.message}`);
    process.exit(1);
  }

  const { index, pairs } = pairsFor(projects);
  const bytes = pairs.reduce((total, pair) => total + pair.value.length, 0);
  console.log(`validated ${projects.length} project(s) from ${path.relative(ROOT, dir)}`);
  console.log(`  index: ${index.count} ledger row(s), ${index.projects.map((row) => row.slug).join(', ')}`);
  for (const pair of pairs.slice(1)) console.log(`  ${pair.key} (${pair.value.length} bytes)`);
  console.log(`  total payload: ${bytes} bytes across ${pairs.length} key(s)`);

  if (emit) {
    // Write the exact KV pairs to a file instead of talking to the API. Used by the runbook to
    // seed a local `wrangler dev` (or a `wrangler kv bulk put` run) without a token.
    await writeFile(emit, `${JSON.stringify(pairs, null, 2)}\n`);
    console.log(`--emit: wrote ${pairs.length} KV pair(s) to ${emit} (no API call)`);
    return;
  }

  if (dryRun) {
    console.log('--dry-run: nothing written');
    return;
  }

  const secrets = await readSecrets();
  const account = process.env.CLOUDFLARE_ACCOUNT_ID || secrets.CLOUDFLARE_ACCOUNT_ID || '';
  const token = process.env.CLOUDFLARE_API_TOKEN || secrets.CLOUDFLARE_API_TOKEN || '';
  const namespace = await namespaceId(secrets);

  const missing = [
    !token && 'CLOUDFLARE_API_TOKEN',
    !account && 'CLOUDFLARE_ACCOUNT_ID',
    !namespace && 'CLOUDFLARE_KV_NAMESPACE_ID (or a real PROJECTS id in wrangler.toml)',
  ].filter(Boolean);
  if (missing.length) {
    console.error(`✗ missing credential(s): ${missing.join(', ')}`);
    console.error(`  expected in the environment or in $CLOUDFLARE_ENV_FILE (default: ${SECRETS_FILE}):`);
    console.error('    CLOUDFLARE_API_TOKEN=…   # token scoped to "Workers KV Storage: Edit"');
    console.error('    CLOUDFLARE_ACCOUNT_ID=…');
    console.error('    CLOUDFLARE_KV_NAMESPACE_ID=…  (or the id in wrangler.toml)');
    process.exit(3);
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account}/storage/kv/namespaces/${namespace}`;
  const write = await fetch(`${endpoint}/bulk`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(pairs),
  });
  const writeBody = await write.json().catch(() => ({}));
  if (!write.ok || writeBody.success !== true) {
    console.error(`✗ KV bulk write failed (HTTP ${write.status}): ${JSON.stringify(writeBody.errors ?? writeBody)}`);
    process.exit(4);
  }
  console.log(`wrote ${pairs.length} key(s) to namespace ${namespace}`);

  // Read the index back — a 200 on the write is not proof the value landed.
  const readBack = await fetch(`${endpoint}/values/index`, { headers: { authorization: `Bearer ${token}` } });
  if (!readBack.ok) {
    console.error(`✗ wrote, but could not read the index back (HTTP ${readBack.status})`);
    process.exit(4);
  }
  const stored = JSON.parse(await readBack.text());
  if (stored.count !== index.count) {
    console.error(`✗ read back ${stored.count} row(s), expected ${index.count}`);
    process.exit(4);
  }
  console.log(`✓ verified: index reads back with ${stored.count} project(s) — live in ~60s`);

  // Remove keys for projects that no longer exist in the repo — publishing is a sync, not an
  // append, so a deleted content file must stop being live (and crawlable).
  const current = new Set(projects.map((project) => `project:${project.slug}`));
  let stale;
  try {
    stale = (await listProjectKeys(endpoint, token)).filter((key) => !current.has(key));
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exit(4);
  }
  if (stale.length === 0) {
    console.log('✓ no stale project keys to remove');
    return;
  }
  try {
    await deleteKeys(endpoint, token, stale);
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exit(4);
  }
  console.log(`✓ removed ${stale.length} stale key(s): ${stale.join(', ')}`);
}

main().catch((err) => {
  console.error(`✗ publish-projects: ${err.message}`);
  process.exit(2);
});
