import { LAYERS, PROJECT_STATUSES, sortProjects, validateProject, type LayerId, type Project, type ProjectStatus, type SpecimenKind } from '../lib/projects';

/**
 * Every project, inlined at build time from `content/projects/*.json` and validated by the same
 * schema the tests and the prerender script use. Adding a project means adding a file.
 *
 * Every number the site shows about the work (counts per layer, per status, per language) is
 * derived here from that content, never typed into copy.
 */
const RAW = import.meta.glob<unknown>('../../content/projects/*.json', { eager: true, import: 'default' });

export const projects: Project[] = sortProjects(
  Object.entries(RAW).map(([file, raw]) => validateProject(raw, file.replace(/^.*\//, ''))),
);

/** The case files on the home page. */
export const featured: Project[] = projects.filter((project) => project.featured);

/** Everything else: the bench. */
export const bench: Project[] = projects.filter((project) => !project.featured);

export const bySlug = new Map(projects.map((project) => [project.slug, project]));

export { LAYERS, PROJECT_STATUSES };
export type { LayerId, Project, ProjectStatus, SpecimenKind };

/** The languages worth filtering on; a project's `stack` mixes languages with frameworks and tools. */
export const KNOWN_LANGUAGES = ['Rust', 'Go', 'TypeScript', 'JavaScript', 'C#', 'Python', 'Swift', 'Java', 'Shell'] as const;

export function languagesOf(project: Project): string[] {
  return project.stack.filter((item) => (KNOWN_LANGUAGES as readonly string[]).includes(item));
}

/** Project counts per language, most-used first. */
export function languageCounts(list: readonly Project[] = projects): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const project of list) for (const lang of languagesOf(project)) counts.set(lang, (counts.get(lang) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function projectsInLayer(layer: LayerId, list: readonly Project[] = projects): Project[] {
  return list.filter((project) => project.layers.includes(layer));
}

export function statusCounts(list: readonly Project[] = projects): Record<ProjectStatus, number> {
  const counts = { shipped: 0, 'in-progress': 0, archived: 0 } as Record<ProjectStatus, number>;
  for (const project of list) counts[project.status] += 1;
  return counts;
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In progress',
  archived: 'Archived',
};

/** "Developer tooling / GitHub hygiene CLI" → "Developer tooling". */
export function categoryOf(project: Project): string | undefined {
  return project.kicker?.split('/')[0]?.trim() || undefined;
}

/** The case-file number of a featured project, "01"…; null for bench projects. */
export function caseNumber(project: Project): string | null {
  const index = featured.indexOf(project);
  return index === -1 ? null : String(index + 1).padStart(2, '0');
}
