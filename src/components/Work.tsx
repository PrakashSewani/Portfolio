import { SIGNAL_PATH } from '../data/profile';
import { featured } from '../data/projects';
import { CaseFigure } from './Figures';
import { ArrowRight, ArrowUpRight } from './Icons';

const stageLabel = (id?: string) => SIGNAL_PATH.find((s) => s.id === id)?.label ?? '';

export default function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <span className="sec-no">02 / Selected work</span>
          <h2 id="work-title">
            Case files, <em>not screenshots</em>.
          </h2>
          <p>
            Six projects, ordered along the signal path. Each one leads with the problem, the decisions I made and the evidence, and the figures are drawn from how the tool actually works.
          </p>
        </header>

        <div className="cases">
          {featured.map((project, i) => (
            <article key={project.slug} className="case reveal" data-flip={i % 2 === 1}>
              <div className="case-copy">
                <p className="case-meta">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{stageLabel(project.stage)}</span>
                  <span className="case-status" data-status={project.status}>
                    {project.status.replace('-', ' ')}
                  </span>
                </p>
                <h3>
                  <a href={`/projects/${project.slug}`} data-link>
                    {project.title}
                  </a>
                </h3>
                <p className="case-kicker">{project.kicker}</p>
                <p className="case-summary">{project.summary}</p>

                {project.challenge && (
                  <div className="case-block">
                    <span className="label">The problem</span>
                    <p>{project.challenge}</p>
                  </div>
                )}

                {project.decisions && (
                  <div className="case-block">
                    <span className="label">Decisions</span>
                    <ol>
                      {project.decisions.slice(0, 3).map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <ul className="chips" aria-label="Stack">
                  {project.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>

                <div className="case-links">
                  <a className="btn btn-sm btn-primary" href={`/projects/${project.slug}`} data-link>
                    Case study <ArrowRight size={14} />
                  </a>
                  {project.links.map((l) => (
                    <a key={l.href} className="btn btn-sm" href={l.href} target="_blank" rel="noreferrer">
                      {l.label} <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="case-visual">
                <CaseFigure project={project} />
                {project.evidence && (
                  <dl className="evidence">
                    {project.evidence.slice(0, 4).map((e) => (
                      <div key={e.label}>
                        <dt>{e.label}</dt>
                        <dd>{e.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
