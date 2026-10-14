/**
 * Type declarations for the content contract in `projects.js`. The implementation is plain ESM so
 * `node` can import it during `prebuild` on any runtime (see the module comment in `projects.js`);
 * these are the types the TypeScript app and the Functions consume.
 */

export declare const PROJECT_STATUSES: readonly ['shipped', 'in-progress', 'archived'];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export declare const SPECIMEN_KINDS: readonly ['inspector', 'roulette', 'habit', 'knowledge', 'none'];
export type SpecimenKind = (typeof SPECIMEN_KINDS)[number];

export declare const SLUG_RE: RegExp;

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

/** Thrown for anything that would render a half-built case study. */
export declare class ProjectSchemaError extends Error {
  name: 'ProjectSchemaError';
  source: string;
  constructor(source: string, message: string);
}

/** Thrown when a slug simply does not exist — branch on the type, never on the message. */
export declare class ProjectNotFoundError extends ProjectSchemaError {
  name: 'ProjectNotFoundError';
  constructor(source: string, message?: string);
}

export declare function validateProject(raw: unknown, source?: string): Project;

export declare function compareByOrder(
  a: { order?: number; year?: number; title: string },
  b: { order?: number; year?: number; title: string },
): number;

export declare function sortProjects(list: Project[]): Project[];

export declare function toLedger(project: Project): LedgerRow;

export declare function validateProjectList(raw: unknown, source?: string): Project[];

export declare function validateLedgerRow(raw: unknown, source?: string): LedgerRow;

export declare function validateLedgerList(raw: unknown, source?: string): LedgerRow[];

export declare const PROJECTS_API = '/api/projects';
export declare const PROJECTS_SNAPSHOT = '/api/projects.json';

export type ProjectsSource = 'live' | 'snapshot';

export interface LedgerLoadResult {
  /** The ledger: what `/projects` and the Cmd+K palette render. */
  rows: LedgerRow[];
  source: ProjectsSource;
  /** Set when the live API failed and the baked snapshot answered instead. */
  reason?: string;
}

export declare function loadSnapshotProjects(force?: boolean): Promise<Project[]>;

export declare function loadProjects(force?: boolean): Promise<LedgerLoadResult>;

export declare function loadProject(slug: string): Promise<{ project: Project; source: ProjectsSource }>;
