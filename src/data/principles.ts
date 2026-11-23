/**
 * The rules I build by. Each one points at evidence: either a line quoted verbatim from a project's
 * content file (the tests check that the quote really is in that file), or a figure derived from
 * the whole body of work.
 */
export interface Principle {
  n: string;
  rule: string;
  gloss: string;
  evidence?: { slug: string; quote: string };
  derived?: 'languages' | 'status';
}

export const PRINCIPLES: Principle[] = [
  {
    n: '01',
    rule: 'Solve the actual problem.',
    gloss: 'Not the imaginary one, and not the one that demos well. Find where the question is really asked, and answer it there.',
    evidence: { slug: 'class-spy', quote: 'Low-latency editor feedback — the hover card is the product' },
  },
  {
    n: '02',
    rule: 'Milliseconds are a feature.',
    gloss: 'When speed is the point, every millisecond is a design decision, so it gets made early and on purpose.',
    evidence: { slug: 'veil', quote: 'without adding stream delay' },
  },
  {
    n: '03',
    rule: 'Complexity has to earn its place.',
    gloss: 'Every moving part has to be deployed, secured and understood by the next person. Architecture serves the product; it does not become it.',
    evidence: { slug: 'jury-forge', quote: 'One deployable: the Worker serves the dashboard, takes the GitHub webhooks and runs the reviews' },
  },
  {
    n: '04',
    rule: 'Understand the system before you change it.',
    gloss: 'Read it, measure it, classify it. Then touch it.',
    evidence: { slug: 'dormant', quote: 'Classify before deleting: nothing goes unless it is confidently regenerable' },
  },
  {
    n: '05',
    rule: 'Fail safe, never silent.',
    gloss: 'Decide what stops when a dependency dies, before it dies. An honest stop beats a quiet wrong answer.',
    evidence: { slug: 'nexusrelay', quote: 'Fail closed: losing Redis stops finite limits, losing PostgreSQL stops untracked dispatch' },
  },
  {
    n: '06',
    rule: 'Right tool, not favourite tool.',
    gloss: 'I am not attached to a language or a framework. The problem picks; I learn whatever it picked.',
    derived: 'languages',
  },
  {
    n: '07',
    rule: 'Build it, ship it, hold it to a bar.',
    gloss: 'Experiment to find out, ship to learn, and archive what falls short. Knowing when to stop is part of the job.',
    derived: 'status',
    evidence: { slug: 'truecontact', quote: 'it shipped, but the product did not meet the bar I set for it' },
  },
];
