/**
 * Shared content loader for the node-side scripts.
 *
 * One place that reads `content/projects/*.json`, validates every file against the schema in
 * `src/lib/projects.ts` (node strips the types — no build step, no duplication) and enforces
 * that the filename matches the slug. `publish-projects.mjs` and `build-snapshot.mjs` both use it,
 * so the site and the KV index can never disagree about what a valid project is.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProject, sortProjects } from '../src/lib/projects.ts';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT_DIR = path.join(ROOT, 'content', 'projects');

/** `--dir <path>` / `--out <path>` style option reader. */
export function option(argv, name, fallback) {
  const index = argv.indexOf(`--${name}`);
  return index === -1 || !argv[index + 1] ? fallback : argv[index + 1];
}

/** Read + validate every project file in `dir`. Throws on the first bad file. */
export async function loadContent(dir = CONTENT_DIR) {
  let files;
  try {
    files = (await readdir(dir)).filter((file) => file.endsWith('.json')).sort();
  } catch (err) {
    throw new Error(`cannot read ${dir}: ${err.message}`);
  }
  if (files.length === 0) throw new Error(`no *.json files in ${dir}`);

  const projects = [];
  for (const file of files) {
    let raw;
    try {
      raw = JSON.parse(await readFile(path.join(dir, file), 'utf8'));
    } catch (err) {
      throw new Error(`content/projects/${file} is not valid JSON: ${err.message}`);
    }
    const project = validateProject(raw, `content/projects/${file}`);
    const expected = file.replace(/\.json$/, '');
    if (project.slug !== expected) {
      throw new Error(`content/projects/${file}: slug "${project.slug}" must match the filename ("${expected}")`);
    }
    projects.push(project);
  }
  return sortProjects(projects);
}
