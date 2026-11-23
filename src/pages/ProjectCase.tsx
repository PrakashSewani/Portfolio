import { useEffect } from 'react';
import { CaseFigure } from '../components/Figures';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '../components/Icons';
import { SIGNAL_PATH, profile } from '../data/profile';
import { bySlug, projects } from '../data/projects';

/** Keep the document head honest on client-side navigation (the prerender does it for first loads). */
function useHead(title: string, description: string, path: string) {
  useEffect(() => {
    const prev = document.title;
    const set = (sel: string, attr: string, value: string) => document.querySelector(sel)?.setAttribute(attr, value);
    document.title = title;
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', description);
    set('meta[property="og:url"]', 'content', `https://prakashsewani.com${path}`);
    set('link[rel="canonical"]', 'href', `https://prakashsewani.com${path}`);
    return () => {
      document.title = prev;
    };
  }, [title, description, path]);
}

export default function ProjectCase({ slug }: { slug: string }) {
  const project = bySlug.get(slug);
  useHead(
    project ? `${project.title} — case study | ${profile.name}` : `Not found | ${profile.name}`,
    project ? project.summary : 'No such project.',
    `/projects/${slug}`,
  );

  if (!project) {
    return (
      <section className="section wrap case-page">
        <p className="sec-no">404 / No such project</p>
        <h1 className="case-title">There is no project called “{slug}”.</h1>
        <p className="lede">
          <a href="/#archive" data-link>
            Browse the archive
          </a>
          .
        </p>
      </section>
    );
  }

  const index = projects.findIndex((p) => p.slug === slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const stage = SIGNAL_PATH.find((s) => s.id === project.stage);

  return (
    <article className="section case-page">
      <div className="wrap">
        <a className="back" href="/#work" data-link>
          <ArrowLeft size={14} /> All work
        </a>

        <header className="case-head">
          <p className="case-meta">
            {stage && <span>Stage {stage.n} · {stage.label}</span>}
            <span className="case-status" data-status={project.status}>
              {project.status.replace('-', ' ')}
            </span>
            {project.year && <span>{project.year}</span>}
          </p>
          <h1 className="case-title">{project.title}</h1>
          {project.kicker && <p className="case-kicker">{project.kicker}</p>}
          <p className="lede">{project.summary}</p>
          <div className="case-links">
            {project.links.map((l, i) => (
              <a key={l.href} className={`btn ${i === 0 ? 'btn-primary' : ''}`} href={l.href} target="_blank" rel="noreferrer">
                {l.label} <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </header>

        <div className="case-body">
          <div className="case-main">
            {project.challenge && (
              <section className="case-section">
                <span className="label">The problem</span>
                <p className="case-large">{project.challenge}</p>
              </section>
            )}
            {project.decisions && (
              <section className="case-section">
                <span className="label">Decisions</span>
                <ol className="decisions">
                  {project.decisions.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ol>
              </section>
            )}
            {project.ownership && (
              <section className="case-section">
                <span className="label">My part</span>
                <p>{project.ownership}</p>
              </section>
            )}
          </div>

          <aside className="case-aside">
            <CaseFigure project={project} />
            {project.specimen?.callouts && (
              <ol className="callouts">
                {project.specimen.callouts.map((c) => (
                  <li key={c.n}>{c.text}</li>
                ))}
              </ol>
            )}
            {project.evidence && (
              <dl className="evidence">
                {project.evidence.map((e) => (
                  <div key={e.label}>
                    <dt>{e.label}</dt>
                    <dd>{e.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <ul className="chips" aria-label="Stack">
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </aside>
        </div>

        <nav className="case-nav" aria-label="More projects">
          <a href={`/projects/${prev.slug}`} data-link>
            <span className="label">Previous</span>
            <strong>{prev.title}</strong>
          </a>
          <a href={`/projects/${next.slug}`} data-link>
            <span className="label">Next</span>
            <strong>
              {next.title} <ArrowRight size={14} />
            </strong>
          </a>
        </nav>
      </div>
    </article>
  );
}
