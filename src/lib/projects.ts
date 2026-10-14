/**
 * The project content contract — one schema, shared by three consumers:
 *
 *   1. the browser loader (`loadProjects` / `loadProject`),
 *   2. the Worker (`src/worker.ts`) when it reads a project out of KV,
 *   3. the publish/snapshot scripts (`scripts/*.mjs`) before anything is written.
 *
 * It is deliberately dependency-free and DOM-free at module scope, so a plain
 * `node` process and a Cloudflare Worker can both import it. Unknown keys are a hard
 * error: the loader fails loudly rather than rendering half a case study.
 *
 * Type-only TypeScript (no enums, no namespaces) so node can strip types from it.
 */

export const PROJECT_STATUSES = ['shipped', 'in-progress', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const SPECIMEN_KINDS = ['inspector', 'roulette', 'habit', 'knowledge', 'none'] as const;
export type SpecimenKind = (typeof SPECIMEN_KINDS)[number];

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectEvidence {
  label: string;
  value: string;
}

export interface ProjectCallout {
  n: number;
  text: string;
}

export interface ProjectSpecimen {
  kind: SpecimenKind;
  caption: string;
  callouts?: ProjectCallout[];
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  stack: string[];
  links: ProjectLink[];
  kicker?: string;
  year?: number;
  challenge?: string;
  decisions?: string[];
  evidence?: ProjectEvidence[];
  ownership?: string;
  specimen?: ProjectSpecimen;
  featured?: boolean;
  order?: number;
}

/** The ledger row: what `/api/projects` returns per project and what the table renders. */
export type LedgerRow = Pick<
  Project,
  'slug' | 'title' | 'kicker' | 'status' | 'year' | 'summary' | 'stack' | 'ownership' | 'featured' | 'order'
>;

const REQUIRED_KEYS = ['slug', 'title', 'summary', 'status', 'stack', 'links'] as const;
const OPTIONAL_KEYS = [
  'kicker',
  'year',
  'challenge',
  'decisions',
  'evidence',
  'ownership',
  'specimen',
  'featured',
  'order',
] as const;
const ALL_KEYS = new Set<string>([...REQUIRED_KEYS, ...OPTIONAL_KEYS]);

const CASE_STUDY_KEYS = ['challenge', 'decisions', 'evidence', 'specimen', 'links'] as const;

const SLUG_RE = /^[a-z0-9-]+$/;

/** Thrown for anything that would render a half-built case study. */
export class ProjectSchemaError extends Error {
  source: string;

  constructor(source: string, message: string) {
    super(`${source}: ${message}`);
    this.name = 'ProjectSchemaError';
    this.source = source;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(source: string, where: string, value: unknown, { nonEmpty = true } = {}): string {
  if (typeof value !== 'string') throw new ProjectSchemaError(source, `${where} must be a string`);
  if (nonEmpty && value.trim() === '') throw new ProjectSchemaError(source, `${where} must not be empty`);
  return value;
}

function requireStringArray(source: string, where: string, value: unknown, { min = 1 } = {}): string[] {
  if (!Array.isArray(value)) throw new ProjectSchemaError(source, `${where} must be an array of strings`);
  if (value.length < min) throw new ProjectSchemaError(source, `${where} must have at least ${min} entry`);
  return value.map((entry, i) => requireString(source, `${where}[${i}]`, entry));
}

function optionalString(source: string, where: string, value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return requireString(source, where, value);
}

/**
 * Validate one raw project object. Returns the normalised project, or throws
 * `ProjectSchemaError` naming the offending field.
 */
export function validateProject(raw: unknown, source = 'project'): Project {
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
  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) {
    throw new ProjectSchemaError(source, `status "${status}" must be one of ${PROJECT_STATUSES.join(' | ')}`);
  }

  if (!Array.isArray(raw.links) || raw.links.length < 1) {
    throw new ProjectSchemaError(source, 'links must be an array with at least one { label, href }');
  }
  const links: ProjectLink[] = raw.links.map((entry, i) => {
    if (!isPlainObject(entry)) throw new ProjectSchemaError(source, `links[${i}] must be an object`);
    const extra = Object.keys(entry).filter((k) => k !== 'label' && k !== 'href');
    if (extra.length) throw new ProjectSchemaError(source, `links[${i}] has unknown key(s): ${extra.join(', ')}`);
    const href = requireString(source, `links[${i}].href`, entry.href);
    if (!/^https?:\/\/\S+$/.test(href)) throw new ProjectSchemaError(source, `links[${i}].href must be an http(s) URL`);
    return { label: requireString(source, `links[${i}].label`, entry.label), href };
  });

  let evidence: ProjectEvidence[] | undefined;
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

  let specimen: ProjectSpecimen | undefined;
  if (raw.specimen !== undefined) {
    if (!isPlainObject(raw.specimen)) throw new ProjectSchemaError(source, 'specimen must be an object');
    const extra = Object.keys(raw.specimen).filter((k) => k !== 'kind' && k !== 'caption' && k !== 'callouts');
    if (extra.length) throw new ProjectSchemaError(source, `specimen has unknown key(s): ${extra.join(', ')}`);
    const kind = requireString(source, 'specimen.kind', raw.specimen.kind);
    if (!(SPECIMEN_KINDS as readonly string[]).includes(kind)) {
      throw new ProjectSchemaError(source, `specimen.kind "${kind}" must be one of ${SPECIMEN_KINDS.join(' | ')}`);
    }
    let callouts: ProjectCallout[] | undefined;
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
    specimen = { kind: kind as SpecimenKind, caption: requireString(source, 'specimen.caption', raw.specimen.caption), callouts };
  }

  let year: number | undefined;
  if (raw.year !== undefined) {
    if (typeof raw.year !== 'number' || !Number.isInteger(raw.year) || raw.year < 1990 || raw.year > 2100) {
      throw new ProjectSchemaError(source, 'year must be an integer between 1990 and 2100');
    }
    year = raw.year;
  }

  let order: number | undefined;
  if (raw.order !== undefined) {
    if (typeof raw.order !== 'number' || !Number.isInteger(raw.order)) {
      throw new ProjectSchemaError(source, 'order must be an integer');
    }
    order = raw.order;
  }

  if (raw.featured !== undefined && typeof raw.featured !== 'boolean') {
    throw new ProjectSchemaError(source, 'featured must be a boolean');
  }

  let decisions: string[] | undefined;
  if (raw.decisions !== undefined) decisions = requireStringArray(source, 'decisions', raw.decisions);

  return {
    slug,
    title: requireString(source, 'title', raw.title),
    summary: requireString(source, 'summary', raw.summary),
    status: status as ProjectStatus,
    stack: requireStringArray(source, 'stack', raw.stack),
    links,
    kicker: optionalString(source, 'kicker', raw.kicker),
    year,
    challenge: optionalString(source, 'challenge', raw.challenge),
    decisions,
    evidence,
    ownership: optionalString(source, 'ownership', raw.ownership),
    specimen,
    featured: raw.featured as boolean | undefined,
    order,
  };
}

/** Stable ordering: explicit `order`, then newest year, then title. */
export function sortProjects(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    const yearA = a.year ?? 0;
    const yearB = b.year ?? 0;
    if (yearA !== yearB) return yearB - yearA;
    return a.title.localeCompare(b.title);
  });
}

/** Project → the ledger row the index key stores and `/projects` renders. */
export function toLedger(project: Project): LedgerRow {
  return {
    slug: project.slug,
    title: project.title,
    kicker: project.kicker,
    status: project.status,
    year: project.year,
    summary: project.summary,
    stack: project.stack,
    ownership: project.ownership,
    featured: project.featured,
    order: project.order,
  };
}

/**
 * Validate an array of raw projects and return them sorted. Duplicate slugs are an
 * error — the ledger cannot show the same URL twice.
 */
export function validateProjectList(raw: unknown, source = 'projects'): Project[] {
  if (!Array.isArray(raw)) throw new ProjectSchemaError(source, 'must be a JSON array');
  const projects = raw.map((entry, i) => validateProject(entry, `${source}[${i}]`));
  const seen = new Set<string>();
  for (const project of projects) {
    if (seen.has(project.slug)) throw new ProjectSchemaError(source, `duplicate slug "${project.slug}"`);
    seen.add(project.slug);
  }
  return sortProjects(projects);
}

/**
 * Validate a ledger row — the projection `/api/projects` carries. It is the same validator as a
 * full project with the case-study keys removed, so the lean index can never drift from the
 * schema; a row that tries to smuggle in `challenge`/`decisions`/`evidence`/`specimen`/`links`
 * is rejected rather than silently shipped to every client.
 */
export function validateLedgerRow(raw: unknown, source = 'ledger'): LedgerRow {
  if (!isPlainObject(raw)) throw new ProjectSchemaError(source, 'must be a JSON object');
  for (const key of CASE_STUDY_KEYS) {
    if (raw[key] !== undefined) {
      throw new ProjectSchemaError(source, `a ledger row must not carry the case-study key "${key}"`);
    }
  }
  return toLedger(
    validateProject(
      { ...raw, links: [{ label: 'ledger placeholder', href: 'https://example.invalid/ledger' }] },
      source,
    ),
  );
}

/** Validate + sort an array of ledger rows (the `/api/projects` payload). */
export function validateLedgerList(raw: unknown, source = 'ledger'): LedgerRow[] {
  if (!Array.isArray(raw)) throw new ProjectSchemaError(source, 'must be a JSON array');
  const rows = raw.map((entry, i) => validateLedgerRow(entry, `${source}[${i}]`));
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.slug)) throw new ProjectSchemaError(source, `duplicate slug "${row.slug}"`);
    seen.add(row.slug);
  }
  return rows.sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title));
}

// ── browser loader ───────────────────────────────────────────────────────────

export const PROJECTS_API = '/api/projects';
export const PROJECTS_SNAPSHOT = '/api/projects.json';
export type ProjectsSource = 'live' | 'snapshot';

export interface LedgerLoadResult {
  /** The ledger: what `/projects` and the Cmd+K palette render. */
  rows: LedgerRow[];
  source: ProjectsSource;
  /** Set when the live API failed and the baked snapshot answered instead. */
  reason?: string;
}

/** Fetch JSON and fail loudly on a non-2xx. Keeps the module importable outside a browser. */
async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function unwrap(payload: unknown, key: string): unknown {
  return isPlainObject(payload) && payload[key] !== undefined ? payload[key] : payload;
}

/**
 * The full projects from the build-time snapshot. The snapshot is complete content (not just the
 * ledger), which is what lets a case study still render with the API down.
 */
let snapshotCache: Promise<Project[]> | null = null;

export function loadSnapshotProjects(force = false): Promise<Project[]> {
  if (force || !snapshotCache) {
    snapshotCache = fetchJson(PROJECTS_SNAPSHOT)
      .then((payload) => validateProjectList(unwrap(payload, 'projects'), PROJECTS_SNAPSHOT))
      .catch((err) => {
        snapshotCache = null;
        throw err;
      });
  }
  return snapshotCache;
}

/**
 * Ledger loader. Prefers the live Worker/KV payload and silently falls back to the build-time
 * snapshot, so a KV outage degrades to "slightly stale" instead of a blank page.
 */
let ledgerCache: Promise<LedgerLoadResult> | null = null;

export function loadProjects(force = false): Promise<LedgerLoadResult> {
  if (force || !ledgerCache) {
    ledgerCache = (async (): Promise<LedgerLoadResult> => {
      let reason = '';
      try {
        const payload = await fetchJson(PROJECTS_API);
        return { rows: validateLedgerList(unwrap(payload, 'projects'), PROJECTS_API), source: 'live' };
      } catch (err) {
        reason = err instanceof Error ? err.message : String(err);
      }
      const projects = await loadSnapshotProjects();
      return { rows: projects.map(toLedger), source: 'snapshot', reason };
    })().catch((err) => {
      ledgerCache = null; // let a later attempt retry
      throw err;
    });
  }
  return ledgerCache;
}

/** One case study: `/api/projects/<slug>`, falling back to the snapshot's full content. */
export async function loadProject(slug: string): Promise<{ project: Project; source: ProjectsSource }> {
  try {
    const payload = await fetchJson(`${PROJECTS_API}/${encodeURIComponent(slug)}`);
    return { project: validateProject(unwrap(payload, 'project'), `${PROJECTS_API}/${slug}`), source: 'live' };
  } catch {
    const projects = await loadSnapshotProjects();
    const found = projects.find((project) => project.slug === slug);
    if (!found) throw new ProjectSchemaError(slug, 'no project with that slug in the live API or the snapshot');
    return { project: found, source: 'snapshot' };
  }
}
