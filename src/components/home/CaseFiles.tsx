import { featured, STATUS_LABEL, type Project } from '../../data/projects';
import { CaseFigure } from '../Figures';
import { ArrowRight, ArrowUpRight } from '../Icons';
import LayerMark, { layerNames } from '../LayerMark';

function CaseFile({ project, n }: { project: Project; n: string }) {
  return (
    <article className="case" id={`case-${project.slug}`} aria-labelledby={`case-${project.slug}-title`}>
      <header className="case-head reveal">
        <div className="case-meta">
          <span className="case-n">
            Featured {n}
            <span className="case-of"> / {String(featured.length).padStart(2, '0')}</span>
          </span>
          <span className={`status status-${project.status}`}>{STATUS_LABEL[project.status]}</span>
          {project.year && <span className="case-year">{project.year}</span>}
        </div>
        <h3 id={`case-${project.slug}-title`} className="case-title" style={{ viewTransitionName: `title-${project.slug}` }}>
          {project.title}
        </h3>
        <p className="case-kicker">{project.kicker}</p>
        <p className="case-layers">
          <LayerMark lit={project.layers} size={22} />
          {layerNames(project.layers)}
        </p>
      </header>

      {project.invariant && (
        <blockquote className="invariant reveal">
          <p className="label">Invariant</p>
          <p className="invariant-text">{project.invariant}</p>
        </blockquote>
      )}

      <figure className="case-figure reveal">
        <div className="case-figure-sticky">
          <CaseFigure project={project} />
          {project.specimen && <figcaption className="figure-caption">{project.specimen.caption}</figcaption>}
        </div>
      </figure>

      {project.challenge && (
        <div className="case-block reveal">
          <h4 className="label">Problem</h4>
          <p className="prose">{project.challenge}</p>
        </div>
      )}

      {project.decisions && (
        <div className="case-block reveal">
          <h4 className="label">Approach</h4>
          <ol className="decisions">
            {project.decisions.map((d, i) => (
              <li key={d}>
                <span className="decision-n">{String(i + 1).padStart(2, '0')}</span>
                <span>{d}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {project.evidence && (
        <div className="case-block reveal">
          <h4 className="label">Details</h4>
          <dl className="facts">
            {project.evidence.map((e) => (
              <div key={e.label}>
                <dt>{e.label}</dt>
                <dd>{e.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="case-links reveal">
        <a className="link" href={`/projects/${project.slug}`} data-link>
          Read more <ArrowRight />
        </a>
        {project.links.map((l) => (
          <a key={l.href} className="link" href={l.href} target="_blank" rel="noreferrer">
            {l.label} <ArrowUpRight />
          </a>
        ))}
      </div>
    </article>
  );
}

/** The six featured projects, each led by the rule its design is built around. */
export default function CaseFiles() {
  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <p className="sec-index label">03 — Work</p>
          <h2 id="work-title" className="sec-title">
            Selected work
          </h2>
          <p className="sec-lede">
            Six projects in more detail. Each starts with the one rule its design is built around, followed by the problem,
            the main decisions and where it stands today.
          </p>
        </header>
        <div className="cases">
          {featured.map((project, i) => (
            <CaseFile key={project.slug} project={project} n={String(i + 1).padStart(2, '0')} />
          ))}
        </div>
      </div>
    </section>
  );
}
