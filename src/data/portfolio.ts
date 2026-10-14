import { sortProjects, validateProject, type Project } from '../lib/projects';

/**
 * The home page's selected work is **not** a second copy of the projects — it is the same
 * `content/projects/*.json` the case sheets render, inlined at build time by Vite and validated
 * with the same schema. Before this, `src/data/portfolio.ts` carried a hand-maintained array that
 * had already drifted from the content files on `challenge`, `ownership`, `decisions` and one
 * `summary`; the "same content model at different densities" claim held only until the next edit.
 *
 * Adding a project means adding a content file — nothing else.
 */
const CONTENT = import.meta.glob<unknown>('../../content/projects/*.json', { eager: true, import: 'default' });

export const caseStudies: Project[] = sortProjects(
  Object.entries(CONTENT).map(([file, raw]) => validateProject(raw, `content/projects/${file.replace(/^.*\//, '')}`)),
);

export const profile = {
  name: 'Prakash Sewani',
  role: 'Senior Software Engineer',
  location: 'Kalyan, Maharashtra, India',
  timezone: 'IST / UTC+5:30',
  email: 'contact@prakashsewani.com',
  phone: '+91 88502 60072',
  company: 'Wonderbiz Technologies',
  resume: 'https://prakashsewaniresume.tiiny.site',
  github: 'https://github.com/PrakashSewani',
  linkedin: 'https://www.linkedin.com/in/prakash-s-2a389721a/',
  summary:
    'I architect modular frontend platforms, dependable APIs, and real-time systems that stay maintainable as products and teams grow.',
  availability: 'Open to conversations about senior engineering opportunities',
  focus: ['Frontend platforms', 'Backend & APIs', 'Real-time systems'],
  experience: '4+ years in production software',
};

export const capabilities = [
  {
    number: 'A',
    title: 'Frontend platforms',
    body: 'Designing modular webshells and microfrontend boundaries that let teams ship independently without fragmenting the product.',
    tools: ['Single-Spa', 'React', 'Angular', 'TypeScript'],
  },
  {
    number: 'B',
    title: 'Backend & APIs',
    body: 'Building dependable application services and integration layers around clear contracts, maintainability, and operational needs.',
    tools: ['Node.js', '.NET Core', 'Python', 'GraphQL', 'REST'],
  },
  {
    number: 'C',
    title: 'Real-time systems',
    body: 'Working with event-driven interfaces, WebSockets, device data, and observability flows where feedback must remain current.',
    tools: ['WebSockets', 'GraphQL', 'Modbus', 'Observability'],
  },
  {
    number: 'D',
    title: 'Enterprise integration',
    body: 'Connecting authentication, identity, and platform concerns so product teams can work inside safe and predictable boundaries.',
    tools: ['SSO', 'IAM', 'OAuth', 'API integration'],
  },
] as const;

export const impactStories = [
  {
    label: 'Platform architecture',
    title: 'Modular frontend ecosystems',
    body: 'Architecting webshell and microfrontend foundations that separate deployment lifecycles while preserving a coherent application experience.',
  },
  {
    label: 'Operational visibility',
    title: 'Real-time observability',
    body: 'Developing interfaces and services that turn live system and device signals into information engineering teams can act on.',
  },
  {
    label: 'Applied automation',
    title: 'NLP-assisted workflows',
    body: 'Exploring pragmatic ways to use language models, document processing, and automation to reduce repetitive operational work.',
  },
] as const;

export const career = [
  {
    period: '2025 — PRESENT',
    title: 'Senior Software Engineer',
    place: 'Wonderbiz Technologies',
    kind: 'Professional experience',
    highlights: [
      'Architecting scalable microfrontend ecosystems and high-performance systems.',
      'Leading development across modular webshells, real-time observability, and NLP-driven automation.',
    ],
  },
  {
    period: '2022 — 2025',
    title: 'Software Engineer',
    place: 'Wonderbiz Technologies',
    kind: 'Professional experience',
    highlights: [
      'Built enterprise product features across frontend and backend systems.',
      'Worked closely with cross-functional teams and developed a strong foundation in production software delivery.',
    ],
  },
  {
    period: '2018 — 2022',
    title: 'B.E. Computer Science',
    place: 'University of Mumbai',
    kind: 'Education',
    highlights: ['Studied software engineering, data structures, databases, cloud computing, and systems architecture.'],
  },
] as const;

export const certifications = [
  {
    title: 'Azure Kubernetes Service with Azure DevOps and Terraform',
    date: '2026',
    href: 'https://ude.my/UC-9257a19e-e08f-4630-9646-289d15e7580d',
  },
  {
    title: '.NET 8 Web API — Clean Architecture',
    date: '2024',
    href: 'https://ude.my/UC-3a89ea1f-7703-4a75-bd67-dd982a91586e',
  },
] as const;
