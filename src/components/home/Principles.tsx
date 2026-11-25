import { useRef } from 'react';
import { PRINCIPLES, type Principle } from '../../data/principles';
import { career, profile } from '../../data/profile';
import { STATUS_LABEL, bySlug, languageCounts, projects, statusCounts } from '../../data/projects';
import { useLit } from '../../lib/motion';
import { ArrowRight } from '../Icons';
import LitText from '../LitText';

function Evidence({ principle }: { principle: Principle }) {
  const project = principle.slug ? bySlug.get(principle.slug) : undefined;
  const derived =
    principle.derived === 'languages'
      ? languageCounts()
          .map(([lang, n]) => `${lang} ${n}`)
          .join(' · ')
      : principle.derived === 'status'
        ? Object.entries(statusCounts())
            .map(([status, n]) => `${n} ${STATUS_LABEL[status as keyof typeof STATUS_LABEL].toLowerCase()}`)
            .join(' · ')
        : null;

  if (!derived && !project) return null;
  return (
    <div className="rule-evidence">
      {derived && <p className="rule-derived">{derived}</p>}
      {project && (
        <a className="rule-src" href={`/projects/${project.slug}`} data-link>
          {project.title} <ArrowRight size={13} />
        </a>
      )}
    </div>
  );
}

const started = Math.min(...career.filter((c) => c.kind === 'work').map((c) => c.from));

/** Who I am, briefly, and the rules I try to work by. */
export default function Principles() {
  const intro = useRef<HTMLDivElement>(null);
  useLit(intro);
  return (
    <section id="rules" className="section rules" aria-labelledby="rules-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <p className="sec-index label">01 — About</p>
          <h2 id="rules-title" className="sec-title">
            A few rules I try to follow
          </h2>
        </header>

        <div className="rules-grid">
          <div ref={intro} className="rules-intro reveal">
            <LitText
              text={`I’m Prakash. I live in ${profile.city}, near Mumbai, and I’ve worked at ${profile.company} since ${started}. Day to day I work on microfrontend platforms, real-time monitoring of industrial telemetry and NLP-based automation.`}
            />
            <p>I also build my own tools: {projects.length} so far, all of them on GitHub.</p>
            <p className="rules-hint label">Each rule links to a project where I applied it.</p>
          </div>

          <ol className="rules-list">
            {PRINCIPLES.map((principle) => (
              <li key={principle.n} className="rule reveal">
                <span className="rule-n" aria-hidden="true">
                  {principle.n}
                </span>
                <div className="rule-body">
                  <h3 className="rule-title">{principle.rule}</h3>
                  <p className="rule-gloss">{principle.gloss}</p>
                  <Evidence principle={principle} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
