export const profile = {
  name: 'Prakash Sewani',
  role: 'Senior Software Engineer',
  company: 'Wonderbiz Technologies',
  location: 'Kalyan, Maharashtra, India',
  city: 'Kalyan',
  timeZone: 'Asia/Kolkata',
  email: 'contact@prakashsewani.com',
  resume: 'https://prakashsewaniresume.tiiny.site',
  github: 'https://github.com/PrakashSewani',
  linkedin: 'https://www.linkedin.com/in/prakash-s-2a389721a/',
  repo: 'https://github.com/PrakashSewani/Portfolio',
  availability: 'Open to senior engineering conversations',
  /** The hero statement. */
  statement:
    'I build systems through every layer: the machines and infrastructure underneath, the services and AI in the middle, and the interfaces people actually touch.',
} as const;

export const career = [
  {
    period: '2025 — now',
    from: 2025,
    to: null,
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
    from: 2022,
    to: 2025,
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
    from: 2018,
    to: 2022,
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

/** Home-page sections in order. The header, the mobile menu and the palette all read this. */
export const SECTIONS = [
  { id: 'top', label: 'Start', nav: false },
  { id: 'rules', label: 'Rules', nav: true },
  { id: 'layers', label: 'Layers', nav: true },
  { id: 'work', label: 'Work', nav: true },
  { id: 'bench', label: 'Bench', nav: true },
  { id: 'record', label: 'Record', nav: true },
  { id: 'contact', label: 'Contact', nav: true },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];
