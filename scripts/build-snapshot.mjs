#!/usr/bin/env node
/**
 * build-snapshot.mjs — bake `content/projects/*.json` into `public/api/projects.json`.
 *
 * This is the site's fallback content: the client prefers the live Worker/KV payload and falls
 * back to this file, so a KV outage degrades to "slightly stale" instead of a blank page.
 * The snapshot carries the COMPLETE project objects (not just the ledger rows), which is what
 * lets a case study still render with the API down. Runs automatically via `prebuild`.
 *
 *   node scripts/build-snapshot.mjs [--dir content/projects] [--out public/api/projects.json]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_DIR, ROOT, loadContent, option } from './load-content.mjs';

async function main() {
  const dir = option(process.argv, 'dir', CONTENT_DIR);
  const out = path.resolve(option(process.argv, 'out', path.join(ROOT, 'public', 'api', 'projects.json')));

  const projects = await loadContent(dir);
  const payload = {
    generatedAt: new Date().toISOString(),
    count: projects.length,
    projects,
  };

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`snapshot: ${projects.length} project(s) → ${path.relative(ROOT, out)}`);
}

main().catch((err) => {
  console.error(`✗ build-snapshot: ${err.message}`);
  process.exit(1);
});
