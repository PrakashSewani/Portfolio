export const profile = {
  name: 'Prakash Sewani',
  role: 'Senior Software Engineer',
  company: 'Wonderbiz Technologies',
  location: 'Kalyan, Maharashtra, India',
  timeZone: 'Asia/Kolkata',
  email: 'contact@prakashsewani.com',
  resume: 'https://prakashsewaniresume.tiiny.site',
  github: 'https://github.com/PrakashSewani',
  linkedin: 'https://www.linkedin.com/in/prakash-s-2a389721a/',
  repo: 'https://github.com/PrakashSewani/Portfolio',
  availability: 'Open to senior engineering conversations',
  summary:
    'I build the whole signal path: device data and edge services, through the gateways and APIs in the middle, to the interface a person actually reads. Mostly Rust, Go, TypeScript and .NET, and always for the moment the link drops.',
} as const;

export interface SignalStageCopy {
  /** Matches a `stage` in the content schema. */
  id: 'sense' | 'edge' | 'gateway' | 'services' | 'screen';
  n: string;
  label: string;
  title: string;
  /** What this stage means in the work, in a sentence. */
  blurb: string;
  /** From professional work (Wonderbiz), when there is something specific to say. */
  atWork?: string;
  tech: string[];
}

/** The five stages the page is organised around, sensor → screen. */
export const SIGNAL_PATH: SignalStageCopy[] = [
  {
    id: 'sense',
    n: '01',
    label: 'Sense',
    title: 'Signals and devices',
    blurb: 'Where the truth enters the system: device registers, system counters, build events. Sampling that stays honest when the transport does not.',
    atWork: 'Real-time device and telemetry data over Modbus, turned into observability flows where a stale reading has to look stale.',
    tech: ['Modbus', 'Telemetry', 'Observability', 'Rust'],
  },
  {
    id: 'edge',
    n: '02',
    label: 'Edge',
    title: 'Native, local-first tools',
    blurb: 'Software that lives next to the machine and has to behave when the network does not: clean state, verified restores, nothing phoning home.',
    tech: ['Rust', 'Go', 'Swift', 'SQLite', 'Docker'],
  },
  {
    id: 'gateway',
    n: '03',
    label: 'Gateway',
    title: 'Gateways and pipelines',
    blurb: 'The layer in the middle that routes, meters and filters: one stable API in front of many providers, redaction in the encode path.',
    atWork: 'Event-driven interfaces and WebSockets that keep feedback current between devices and the screens watching them.',
    tech: ['Go', 'PostgreSQL', 'Redis', 'WebSockets', 'GraphQL'],
  },
  {
    id: 'services',
    n: '04',
    label: 'Services',
    title: 'Services and APIs',
    blurb: 'Dependable application services around clear contracts, with identity and integration handled as platform concerns instead of per-team folklore.',
    atWork: 'Backend and integration layers in .NET Core, Node.js and Python, with SSO, IAM and OAuth wired into the platform.',
    tech: ['.NET Core', 'Node.js', 'Python', 'GraphQL', 'REST', 'OAuth'],
  },
  {
    id: 'screen',
    n: '05',
    label: 'Screen',
    title: 'Interfaces people read',
    blurb: 'The last metre: interfaces that make the state of a system obvious at a glance, built so many teams can ship into one product.',
    atWork: 'Modular webshell and microfrontend architecture, so teams deploy independently without fragmenting the experience.',
    tech: ['React', 'Angular', 'TypeScript', 'Single-SPA', 'Microfrontends'],
  },
];

export const career = [
  {
    period: '2025 — now',
    title: 'Senior Software Engineer',
    place: 'Wonderbiz Technologies',
    kind: 'work',
    highlights: [
      'Architecting scalable microfrontend ecosystems and high-performance systems.',
      'Leading development across modular webshells, real-time observability and NLP-driven automation.',
    ],
  },
  {
    period: '2022 — 2025',
    title: 'Software Engineer',
    place: 'Wonderbiz Technologies',
    kind: 'work',
    highlights: [
      'Built enterprise product features across frontend and backend systems.',
      'Worked closely with cross-functional teams on production software delivery.',
    ],
  },
  {
    period: '2018 — 2022',
    title: 'B.E. Computer Science',
    place: 'University of Mumbai',
    kind: 'education',
    highlights: ['Software engineering, data structures, databases, cloud computing and systems architecture.'],
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

export const principles = [
  ['Make boundaries explicit', 'Good architecture makes ownership and change easier to reason about.'],
  ['Optimise for the next engineer', 'Maintainability is a product feature for the people extending the system.'],
  ['Earn complexity', 'Sophisticated tools are worth it only when the problem genuinely needs them.'],
] as const;

/** Section ids in page order — the nav, the status bar and the palette all read this. */
export const SECTIONS = [
  { id: 'top', label: 'Top' },
  { id: 'path', label: 'Signal path' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'archive', label: 'Archive' },
  { id: 'contact', label: 'Contact' },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];
