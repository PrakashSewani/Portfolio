/** Types for the content contract in `projects.js` (plain ESM so bare `node` can import it). */

export declare const PROJECT_STATUSES: readonly ['shipped', 'in-progress', 'archived'];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export declare const STAGES: readonly ['sense', 'edge', 'gateway', 'services', 'screen'];
export type StageId = (typeof STAGES)[number];

export declare const SPECIMEN_KINDS: readonly [
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
  stage?: StageId;
  challenge?: string;
  decisions?: string[];
  evidence?: ProjectEvidence[];
  ownership?: string;
  specimen?: ProjectSpecimen;
  featured?: boolean;
  order?: number;
}

export declare class ProjectSchemaError extends Error {
  source: string;
  constructor(source: string, message: string);
}

export declare function validateProject(raw: unknown, source?: string): Project;
export declare function validateProjectList(raw: unknown, source?: string): Project[];
export declare function compareByOrder(a: Project, b: Project): number;
export declare function sortProjects(list: readonly Project[]): Project[];
