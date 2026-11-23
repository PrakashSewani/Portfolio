/**
 * The project content contract — one schema for every consumer: the site (bundled at build time),
 * the prerender script and the tests. Plain ESM JavaScript with its types in `projects.d.ts`, so a
 * bare `node` process can import it on any runtime. Unknown keys are a hard error: a typo should
 * fail the build rather than render half a case study.
 */

export const PROJECT_STATUSES = ['shipped', 'in-progress', 'archived'];

/**
 * The five layers of a system, bottom to top. A project names the layers it works in; the first one
 * is its primary layer. The site's mark lights exactly these.
 */
export const LAYERS = ['machine', 'infrastructure', 'software', 'intelligence', 'interface'];

/** The drawn figure a case study can carry. Anything without a drawing uses `none`. */
export const SPECIMEN_KINDS = [
  'inspector',
  'roulette',
  'habit',
  'knowledge',
  'workspace',
  'review',
  'gateway',
  'repos',
  'monitor',
  'magnet',
  'redact',
  'audit',
  'none',
];

const REQUIRED_KEYS = ['slug', 'title', 'summary', 'status', 'stack', 'links', 'layers'];
const OPTIONAL_KEYS = [
  'kicker',
  'year',
  'invariant',
  'challenge',
  'decisions',
  'evidence',
  'ownership',
  'specimen',
  'featured',
  'order',
];
const ALL_KEYS = new Set([...REQUIRED_KEYS, ...OPTIONAL_KEYS]);

export const SLUG_RE = /^[a-z0-9-]+$/;

/** Thrown for anything that would render a half-built case study. */
export class ProjectSchemaError extends Error {
  constructor(source, message) {
    super(`${source}: ${message}`);
    this.name = 'ProjectSchemaError';
    this.source = source;
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(source, where, value, { nonEmpty = true } = {}) {
  if (typeof value !== 'string') throw new ProjectSchemaError(source, `${where} must be a string`);
  if (nonEmpty && value.trim() === '') throw new ProjectSchemaError(source, `${where} must not be empty`);
  return value;
}

function requireStringArray(source, where, value, { min = 1 } = {}) {
  if (!Array.isArray(value)) throw new ProjectSchemaError(source, `${where} must be an array of strings`);
  if (value.length < min) throw new ProjectSchemaError(source, `${where} must have at least ${min} entry`);
  return value.map((entry, i) => requireString(source, `${where}[${i}]`, entry));
}

function optionalString(source, where, value) {
  if (value === undefined) return undefined;
  return requireString(source, where, value);
}

/**
 * Validate one raw project object. Returns the normalised project (keys in canonical order), or
 * throws `ProjectSchemaError` naming the offending field.
 */
export function validateProject(raw, source = 'project') {
  if (!isPlainObject(raw)) throw new ProjectSchemaError(source, 'must be a JSON object');

  const unknown = Object.keys(raw).filter((key) => !ALL_KEYS.has(key));
  if (unknown.length) {
    throw new ProjectSchemaError(
      source,
      `unknown key${unknown.length === 1 ? '' : 's'} ${unknown.map((k) => `"${k}"`).join(', ')} — allowed: ${[...ALL_KEYS].sort().join(', ')}`,
    );
  }

  const missing = REQUIRED_KEYS.filter((key) => raw[key] === undefined);
  if (missing.length) throw new ProjectSchemaError(source, `missing required key${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`);

  const slug = requireString(source, 'slug', raw.slug);
  if (!SLUG_RE.test(slug)) throw new ProjectSchemaError(source, `slug "${slug}" must match ${SLUG_RE}`);

  const status = requireString(source, 'status', raw.status);
  if (!PROJECT_STATUSES.includes(status)) {
    throw new ProjectSchemaError(source, `status "${status}" must be one of ${PROJECT_STATUSES.join(' | ')}`);
  }

  const layers = requireStringArray(source, 'layers', raw.layers);
  for (const layer of layers) {
    if (!LAYERS.includes(layer)) {
      throw new ProjectSchemaError(source, `layer "${layer}" must be one of ${LAYERS.join(' | ')}`);
    }
  }
  if (new Set(layers).size !== layers.length) throw new ProjectSchemaError(source, 'layers must not repeat');

  if (!Array.isArray(raw.links) || raw.links.length < 1) {
    throw new ProjectSchemaError(source, 'links must be an array with at least one { label, href }');
  }
  const links = raw.links.map((entry, i) => {
    if (!isPlainObject(entry)) throw new ProjectSchemaError(source, `links[${i}] must be an object`);
    const extra = Object.keys(entry).filter((k) => k !== 'label' && k !== 'href');
    if (extra.length) throw new ProjectSchemaError(source, `links[${i}] has unknown key(s): ${extra.join(', ')}`);
    const href = requireString(source, `links[${i}].href`, entry.href);
    if (!/^https?:\/\/\S+$/.test(href)) throw new ProjectSchemaError(source, `links[${i}].href must be an http(s) URL`);
    return { label: requireString(source, `links[${i}].label`, entry.label), href };
  });

  let evidence;
  if (raw.evidence !== undefined) {
    if (!Array.isArray(raw.evidence) || raw.evidence.length < 1) {
      throw new ProjectSchemaError(source, 'evidence must be a non-empty array of { label, value }');
    }
    evidence = raw.evidence.map((entry, i) => {
      if (!isPlainObject(entry)) throw new ProjectSchemaError(source, `evidence[${i}] must be an object`);
      const extra = Object.keys(entry).filter((k) => k !== 'label' && k !== 'value');
      if (extra.length) throw new ProjectSchemaError(source, `evidence[${i}] has unknown key(s): ${extra.join(', ')}`);
      return {
        label: requireString(source, `evidence[${i}].label`, entry.label),
        value: requireString(source, `evidence[${i}].value`, entry.value),
      };
    });
  }

  let specimen;
  if (raw.specimen !== undefined) {
    if (!isPlainObject(raw.specimen)) throw new ProjectSchemaError(source, 'specimen must be an object');
    const extra = Object.keys(raw.specimen).filter((k) => k !== 'kind' && k !== 'caption' && k !== 'callouts');
    if (extra.length) throw new ProjectSchemaError(source, `specimen has unknown key(s): ${extra.join(', ')}`);
    const kind = requireString(source, 'specimen.kind', raw.specimen.kind);
    if (!SPECIMEN_KINDS.includes(kind)) {
      throw new ProjectSchemaError(source, `specimen.kind "${kind}" must be one of ${SPECIMEN_KINDS.join(' | ')}`);
    }
    let callouts;
    if (raw.specimen.callouts !== undefined) {
      if (!Array.isArray(raw.specimen.callouts)) throw new ProjectSchemaError(source, 'specimen.callouts must be an array');
      callouts = raw.specimen.callouts.map((entry, i) => {
        if (!isPlainObject(entry)) throw new ProjectSchemaError(source, `specimen.callouts[${i}] must be an object`);
        const calloutExtra = Object.keys(entry).filter((k) => k !== 'n' && k !== 'text');
        if (calloutExtra.length) throw new ProjectSchemaError(source, `specimen.callouts[${i}] has unknown key(s): ${calloutExtra.join(', ')}`);
        const n = entry.n;
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
          throw new ProjectSchemaError(source, `specimen.callouts[${i}].n must be a positive integer`);
        }
        return { n, text: requireString(source, `specimen.callouts[${i}].text`, entry.text) };
      });
    }
    specimen = { kind, caption: requireString(source, 'specimen.caption', raw.specimen.caption), callouts };
  }

  let year;
  if (raw.year !== undefined) {
    if (typeof raw.year !== 'number' || !Number.isInteger(raw.year) || raw.year < 1990 || raw.year > 2100) {
      throw new ProjectSchemaError(source, 'year must be an integer between 1990 and 2100');
    }
    year = raw.year;
  }

  let order;
  if (raw.order !== undefined) {
    if (typeof raw.order !== 'number' || !Number.isInteger(raw.order)) {
      throw new ProjectSchemaError(source, 'order must be an integer');
    }
    order = raw.order;
  }

  if (raw.featured !== undefined && typeof raw.featured !== 'boolean') {
    throw new ProjectSchemaError(source, 'featured must be a boolean');
  }

  let decisions;
  if (raw.decisions !== undefined) decisions = requireStringArray(source, 'decisions', raw.decisions);

  return {
    slug,
    title: requireString(source, 'title', raw.title),
    summary: requireString(source, 'summary', raw.summary),
    status,
    stack: requireStringArray(source, 'stack', raw.stack),
    links,
    layers,
    kicker: optionalString(source, 'kicker', raw.kicker),
    year,
    invariant: optionalString(source, 'invariant', raw.invariant),
    challenge: optionalString(source, 'challenge', raw.challenge),
    decisions,
    evidence,
    ownership: optionalString(source, 'ownership', raw.ownership),
    specimen,
    featured: raw.featured,
    order,
  };
}

/** The one ordering: explicit `order`, then newest year, then title. */
export function compareByOrder(a, b) {
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  const yearA = a.year ?? 0;
  const yearB = b.year ?? 0;
  if (yearA !== yearB) return yearB - yearA;
  return a.title.localeCompare(b.title);
}

export function sortProjects(list) {
  return [...list].sort(compareByOrder);
}

/** Validate an array of raw projects and return them sorted. Duplicate slugs are an error. */
export function validateProjectList(raw, source = 'projects') {
  if (!Array.isArray(raw)) throw new ProjectSchemaError(source, 'must be a JSON array');
  const projects = raw.map((entry, i) => validateProject(entry, `${source}[${i}]`));
  const seen = new Set();
  for (const project of projects) {
    if (seen.has(project.slug)) throw new ProjectSchemaError(source, `duplicate slug "${project.slug}"`);
    seen.add(project.slug);
  }
  return sortProjects(projects);
}
