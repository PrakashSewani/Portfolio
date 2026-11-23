import { STAGES, sortProjects, validateProject, type Project, type SpecimenKind, type StageId } from '../lib/projects';

/**
 * Every project, inlined at build time from `content/projects/*.json` and validated by the same
 * schema the tests and the prerender script use. Adding a project means adding a file.
 */
const RAW = import.meta.glob<unknown>('../../content/projects/*.json', { eager: true, import: 'default' });

export const projects: Project[] = sortProjects(
  Object.entries(RAW).map(([file, raw]) => validateProject(raw, file.replace(/^.*\//, ''))),
);

export const featured: Project[] = projects.filter((project) => project.featured);

export const bySlug = new Map(projects.map((project) => [project.slug, project]));

export { STAGES };
export type { Project, SpecimenKind, StageId };

/** The languages worth filtering on; a project's `stack` mixes languages with frameworks and tools. */
export const KNOWN_LANGUAGES = ['Rust', 'Go', 'TypeScript', 'JavaScript', 'C#', 'Python', 'Swift', 'Java', 'Shell'] as const;

export function languagesOf(project: Project): string[] {
  return project.stack.filter((item) => (KNOWN_LANGUAGES as readonly string[]).includes(item));
}

/** Project counts per language, most-used first — the hero's evidence line is derived, not typed. */
export function languageCounts(): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const project of projects) for (const lang of languagesOf(project)) counts.set(lang, (counts.get(lang) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function projectsInStage(stage: StageId): Project[] {
  return projects.filter((project) => project.stage === stage);
}
