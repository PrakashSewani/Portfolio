/**
 * The rules I try to work by. Each one links to a project where it shows (`slug`), or to a figure
 * derived from all the projects (`derived`). Any project a rule names must exist; the tests check.
 */
export interface Principle {
  n: string;
  rule: string;
  gloss: string;
  /** The project the gloss refers to. */
  slug?: string;
  derived?: 'languages' | 'status';
}

export const PRINCIPLES: Principle[] = [
  {
    n: '01',
    rule: 'Start from the real problem.',
    gloss:
      'Before writing code I try to pin down who has the problem and where it happens. With Class-Spy, the answer had to appear in the editor’s hover card, where the developer is already looking.',
    slug: 'class-spy',
  },
  {
    n: '02',
    rule: 'Treat speed as a requirement.',
    gloss: 'If something needs to be fast, I plan for it from the start. Veil has to hide secrets on a live stream without adding any delay.',
    slug: 'veil',
  },
  {
    n: '03',
    rule: 'Keep it as simple as the problem allows.',
    gloss:
      'Every extra service is one more thing to deploy, secure and debug. Jury Forge is a single Cloudflare Worker that serves the dashboard, receives the GitHub webhooks and runs the reviews.',
    slug: 'jury-forge',
  },
  {
    n: '04',
    rule: 'Understand a system before changing it.',
    gloss: 'I read and measure before I touch anything. Dormant classifies every file before it deletes a single one.',
    slug: 'dormant',
  },
  {
    n: '05',
    rule: 'Decide in advance how things fail.',
    gloss:
      'When a dependency goes down, I would rather the system stop than carry on with bad data. NexusRelay stops sending requests it cannot record.',
    slug: 'nexusrelay',
  },
  {
    n: '06',
    rule: 'Use the right tool for the job.',
    gloss: 'I don’t have a favourite language, so I choose per project. Here is what my side projects ended up using:',
    derived: 'languages',
  },
  {
    n: '07',
    rule: 'Finish things, and be honest about them.',
    gloss:
      'Some projects ship, some are still in progress, and a few don’t work out. I archived TrueContact because it shipped but didn’t meet the bar I had set for it.',
    slug: 'truecontact',
    derived: 'status',
  },
];
