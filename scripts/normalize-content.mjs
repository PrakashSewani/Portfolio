#!/usr/bin/env node
/**
 * normalize-content.mjs — write every `content/projects/*.json` in the schema's canonical form.
 *
 * The contract is `validateProject` in `src/lib/projects.js`: it defines the key order, and
 * `scripts/build-snapshot.mjs` serialises its output with `JSON.stringify(project, null, 2)`. This
 * script writes the content files exactly the way the snapshot writer would, so a content file and
 * its entry in `public/api/projects.json` are byte-identical — one format for the whole set, no
 * hand-maintained key order, and no `\u2014` escapes that only the generated artifact gets.
 *
 *   node scripts/normalize-content.mjs [--check]
 *
 * `--check` reports the files that are off-contract and exits non-zero without writing (what
 * `tests/content.test.mjs` asserts).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_DIR } from './load-content.mjs';
import { validateProject } from '../src/lib/projects.js';

/** Sort keys so two objects can be compared without their source order mattering. */
function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
  }
  return value;
}

/** The canonical bytes for one content file. */
export function canonicalContent(raw, source) {
  return `${JSON.stringify(validateProject(raw, source), null, 2)}\n`;
}

async function main() {
  const check = process.argv.includes('--check');
  const files = (await readdir(CONTENT_DIR)).filter((file) => file.endsWith('.json')).sort();
  if (files.length === 0) throw new Error(`no *.json files in ${CONTENT_DIR}`);

  const drift = [];
  for (const file of files) {
    const source = `content/projects/${file}`;
    const target = path.join(CONTENT_DIR, file);
    const text = await readFile(target, 'utf8');
    const raw = JSON.parse(text);
    if (JSON.stringify(sortDeep(raw)) !== JSON.stringify(sortDeep(JSON.parse(JSON.stringify(validateProject(raw, source)))))) {
      throw new Error(`${source}: rewriting would change the content, not just the format`);
    }
    const canonical = canonicalContent(raw, source);
    if (canonical === text) continue;
    drift.push(source);
    if (!check) await writeFile(target, canonical);
  }

  if (check && drift.length) {
    console.error(`✗ ${drift.length} content file(s) are off-contract:\n  ${drift.join('\n  ')}`);
    process.exit(1);
  }
  console.log(check
    ? `canonical: ${files.length} content file(s) in the schema's format`
    : `normalized: ${drift.length} of ${files.length} content file(s) rewritten, ${files.length - drift.length} already canonical`);
}

main().catch((err) => {
  console.error(`✗ normalize-content: ${err.message}`);
  process.exit(1);
});
