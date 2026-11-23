import { PRINCIPLES, type Principle } from '../../data/principles';
import { profile } from '../../data/profile';
import { STATUS_LABEL, bySlug, languageCounts, projects, statusCounts } from '../../data/projects';
import { ArrowRight } from '../Icons';

function Evidence({ principle }: { principle: Principle }) {
  const project = principle.evidence ? bySlug.get(principle.evidence.slug) : undefined;
  const derived =
    principle.derived === 'languages'
      ? `${projects.length} projects across ${languageCounts()
          .map(([lang, n]) => `${lang} ${n}`)
          .join(' · ')}`
      : principle.derived === 'status'
        ? Object.entries(statusCounts())
            .map(([status, n]) => `${n} ${STATUS_LABEL[status as keyof typeof STATUS_LABEL].toLowerCase()}`)
            .join(' · ')
        : null;

  return (
    <div className="rule-evidence">
      {derived && <p className="rule-derived">{derived}</p>}
      {project && principle.evidence && (
        <a className="rule-quote" href={`/projects/${project.slug}`} data-link>
          <q>{principle.evidence.quote}</q>
          <span className="rule-src">
            {project.title} <ArrowRight size={13} />
          </span>
        </a>
      )}
    </div>
  );
}

/** How I think, as rules, each one pointing at the work that shows it. */
export default function Principles() {
  return (
    <section id="rules" className="section rules" aria-labelledby="rules-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <p className="sec-index label">01 — Rules</p>
          <h2 id="rules-title" className="sec-title">
            Every system starts with a rule it must never break.
          </h2>
        </header>

        <div className="rules-grid">
          <div className="rules-intro reveal">
            <p>
              I’m Prakash, a software engineer in {profile.city}, just outside Mumbai. At {profile.company} I work on
              microfrontend platforms, real-time observability over industrial telemetry and NLP-driven automation.
            </p>
            <p>
              Outside work I build the tools I want to exist: {projects.length} so far, all of them on GitHub. I care
              more about the problem, the architecture and whether it actually ships than about which language it is
              written in.
            </p>
            <p className="rules-hint label">These are mine. Each links to where it shows.</p>
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
