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
  availability: 'I’m open to senior engineering conversations',
  /** The hero statement. */
  statement:
    'I build software across the whole stack, from industrial device data and backend services to AI tooling and web interfaces. Most of my side projects are developer tools.',
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
      'Architecting microfrontend platforms and high-performance systems.',
      'Leading development on modular webshells, real-time observability and NLP-based automation.',
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
      'Built product features across the frontend and the backend.',
      'Worked with cross-functional teams to ship production software.',
    ],
  },
  {
    period: '2018 — 2022',
    from: 2018,
    to: 2022,
    title: 'B.E. Computer Science',
    place: 'University of Mumbai',
    kind: 'education',
    highlights: ['Coursework in software engineering, data structures, databases, cloud computing and systems architecture.'],
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
  { id: 'rules', label: 'About', nav: true },
  { id: 'layers', label: 'Layers', nav: true },
  { id: 'work', label: 'Work', nav: true },
  { id: 'bench', label: 'More work', nav: true },
  { id: 'record', label: 'Experience', nav: true },
  { id: 'contact', label: 'Contact', nav: true },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];
