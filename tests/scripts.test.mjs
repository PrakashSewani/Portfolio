/**
 * Script tests — the publish path and the design-token gate.
 *
 * These run the real scripts as child processes and assert on exit codes, because the point of
 * both scripts is the exit code a CI run (or Prakash) reads.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { ROOT } from '../scripts/load-content.mjs';

const run = promisify(execFile);
const PUBLISH = path.join(ROOT, 'scripts', 'publish-projects.mjs');

/** A child env with no Cloudflare credentials, so the credential path is deterministic. */
function credentialFreeEnv() {
  const env = { ...process.env };
  delete env.CLOUDFLARE_API_TOKEN;
  delete env.CLOUDFLARE_ACCOUNT_ID;
  delete env.CLOUDFLARE_KV_NAMESPACE_ID;
  return env;
}

/** Run a script and resolve with { code, stdout, stderr } instead of throwing. */
async function runScript(file, args, env = process.env) {
  try {
    const { stdout, stderr } = await run(process.execPath, [file, ...args], { env, cwd: ROOT });
    return { code: 0, stdout, stderr };
  } catch (err) {
    return { code: err.code ?? 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

const GOOD = {
  slug: 'demo',
  title: 'Demo',
  summary: 'A demo project.',
  status: 'shipped',
  stack: ['TypeScript'],
  links: [{ label: 'GitHub', href: 'https://example.com/demo' }],
};

async function tempContent(files) {
  const dir = await mkdtemp(path.join(tmpdir(), 'portfolio-content-'));
  for (const [name, value] of Object.entries(files)) {
    await writeFile(path.join(dir, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  }
  return dir;
}

test('publish --dry-run validates and reports the keys it would write', async () => {
  const { code, stdout } = await runScript(PUBLISH, ['--dry-run'], credentialFreeEnv());
  assert.equal(code, 0, stdout);
  assert.match(stdout, /validated 4 project\(s\)/);
  assert.match(stdout, /index: 4 ledger row\(s\)/);
  assert.match(stdout, /project:class-spy/);
  assert.match(stdout, /--dry-run: nothing written/);
});

test('publish exits non-zero on malformed JSON', async () => {
  const dir = await tempContent({ 'demo.json': '{ "slug": "demo", ' });
  const { code, stderr } = await runScript(PUBLISH, ['--dir', dir, '--dry-run'], credentialFreeEnv());
  assert.equal(code, 1);
  assert.match(stderr, /is not valid JSON/);
});

test('publish exits non-zero when a slug does not match its filename', async () => {
  const dir = await tempContent({ 'wrong-name.json': GOOD });
  const { code, stderr } = await runScript(PUBLISH, ['--dir', dir, '--dry-run'], credentialFreeEnv());
  assert.equal(code, 1);
  assert.match(stderr, /must match the filename/);
});

test('publish exits non-zero on an unknown key', async () => {
  const dir = await tempContent({ 'demo.json': { ...GOOD, typo: true } });
  const { code, stderr } = await runScript(PUBLISH, ['--dir', dir, '--dry-run'], credentialFreeEnv());
  assert.equal(code, 1);
  assert.match(stderr, /unknown key/);
});

test('publish refuses to touch the network without credentials', async () => {
  const { code, stderr } = await runScript(PUBLISH, [], credentialFreeEnv());
  assert.equal(code, 3);
  assert.match(stderr, /missing credential\(s\)/);
  assert.match(stderr, /CLOUDFLARE_API_TOKEN/);
});

test('build-snapshot writes a complete, re-readable snapshot', async () => {
  const dir = await tempContent({ 'demo.json': GOOD });
  const out = path.join(dir, 'out', 'projects.json');
  const { code, stdout } = await runScript(path.join(ROOT, 'scripts', 'build-snapshot.mjs'), ['--dir', dir, '--out', out]);
  assert.equal(code, 0, stdout);
  const payload = JSON.parse(await readFile(out, 'utf8'));
  assert.equal(payload.count, 1);
  // full content, not just the ledger — the case study must be able to render offline
  assert.equal(payload.projects[0].title, 'Demo');
  assert.ok(payload.projects[0].links.length > 0);
});

test('the design-token gate passes on the current stylesheet', async () => {
  const { code, stdout } = await runScript(path.join(ROOT, 'scripts', 'check-design-tokens.mjs'), []);
  assert.equal(code, 0, stdout);
  assert.match(stdout, /meets WCAG AA/);
});
