import type { ReactNode } from 'react';
import { CaseFigure, hasFigure } from '../components/Figures';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '../components/Icons';
import LayerMark, { layerNames } from '../components/LayerMark';
import { layerById } from '../data/layers';
import { profile } from '../data/profile';
import { STATUS_LABEL, bySlug, caseNumber, featured, projects, type Project } from '../data/projects';
import { useDocumentMeta } from '../lib/meta';
import NotFound from './NotFound';

/**
 * In dev builds only: a dashed box where a content field would render, naming the field to add.
 * Production never shows it, so a thin project page is simply shorter, never visibly unfinished.
 */
function Slot({ field, slug, what }: { field: string; slug: string; what: string }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="slot" role="note">
      <span className="label">Content slot · dev only</span>
      <p>
        Add <code>{field}</code> to <code>content/projects/{slug}.json</code> for {what}.
      </p>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="cp-section reveal">
      <h2 className="cp-label">
        <span>{n}</span>
        {title}
      </h2>
      <div className="cp-body">{children}</div>
    </section>
  );
}

/** Previous/next stay within the case files for a case, and walk the whole list otherwise. */
function neighbours(project: Project): [Project, Project] {
  const list = project.featured ? featured : projects;
  const i = list.indexOf(project);
  return [list[(i - 1 + list.length) % list.length], list[(i + 1) % list.length]];
}

export default function ProjectCase({ slug }: { slug: string }) {
  const project = bySlug.get(slug);
  useDocumentMeta({
    title: project ? `${project.title} — case study | ${profile.name}` : `No such project | ${profile.name}`,
    description: project?.summary,
    path: `/projects/${slug}`,
    noindex: !project,
  });

  if (!project) return <NotFound path={`/projects/${slug}`} what="project" />;

  const n = caseNumber(project);
  const [prev, next] = neighbours(project);
  const primary = layerById.get(project.layers[0]);
  let section = 0;
  const num = () => String(++section).padStart(2, '0');

  return (
    <article className="page cp">
      <div className="wrap">
        <nav className="cp-crumbs" aria-label="Breadcrumb">
          <a href={project.featured ? '/#work' : '/#bench'} data-link>
            <ArrowLeft size={14} /> {project.featured ? 'Selected work' : 'More work'}
          </a>
          <span aria-hidden="true">/</span>
          <a href="/projects" data-link>
            All projects
          </a>
        </nav>

        <header className="cp-head">
          <p className="cp-meta">
            {n ? <span className="case-n">Featured {n}</span> : <span className="case-n">{project.kicker?.split('/')[0]?.trim()}</span>}
            <span className={`status status-${project.status}`}>{STATUS_LABEL[project.status]}</span>
            {project.year && <span>{project.year}</span>}
          </p>
          <h1 className="cp-title" style={{ viewTransitionName: `title-${project.slug}` }}>
            {project.title}
          </h1>
          {project.kicker && <p className="case-kicker">{project.kicker}</p>}
          <p className="cp-summary">{project.summary}</p>

          <dl className="cp-strip">
            <div>
              <dt className="label">Layers</dt>
              <dd className="cp-layers">
                <LayerMark lit={project.layers} size={28} />
                {layerNames(project.layers)}
              </dd>
            </div>
            <div>
              <dt className="label">Stack</dt>
              <dd className="cp-stack">
                {project.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="label">Links</dt>
              <dd className="cp-links">
                {project.links.map((l) => (
                  <a key={l.href} className="link" href={l.href} target="_blank" rel="noreferrer">
                    {l.label} <ArrowUpRight />
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </header>

        <div className="cp-sections">
          {project.challenge ? (
            <Section n={num()} title="Problem">
              <p className="cp-lead">{project.challenge}</p>
            </Section>
          ) : (
            <Slot field="challenge" slug={project.slug} what="the problem this project solves" />
          )}

          {project.invariant ? (
            <Section n={num()} title="Invariant">
              <blockquote className="invariant invariant-lg">
                <p className="invariant-text">{project.invariant}</p>
              </blockquote>
            </Section>
          ) : (
            <Slot field="invariant" slug={project.slug} what="the one rule the system never breaks" />
          )}

          {project.decisions ? (
            <Section n={num()} title="Approach">
              <ol className="decisions decisions-lg">
                {project.decisions.map((d, i) => (
                  <li key={d}>
                    <span className="decision-n">{String(i + 1).padStart(2, '0')}</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </Section>
          ) : (
            <Slot field="decisions" slug={project.slug} what="the approach and the key technical decisions" />
          )}

          {hasFigure(project) && project.specimen ? (
            <Section n={num()} title="How it works">
              <figure className="cp-figure">
                <CaseFigure project={project} />
                <figcaption className="figure-caption">{project.specimen.caption}</figcaption>
              </figure>
              {project.specimen.callouts && (
                <ol className="callouts">
                  {project.specimen.callouts.map((c) => (
                    <li key={c.n}>
                      <span className="decision-n">{String(c.n).padStart(2, '0')}</span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          ) : (
            <Slot field="specimen (with a drawing in Figures.tsx)" slug={project.slug} what="a drawn figure of how it works" />
          )}

          {project.evidence ? (
            <Section n={num()} title="Details">
              <dl className="facts facts-lg">
                {project.evidence.map((e) => (
                  <div key={e.label}>
                    <dt>{e.label}</dt>
                    <dd>{e.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          ) : (
            <Slot field="evidence" slug={project.slug} what="verifiable facts (releases, licence, distribution, measured outcomes)" />
          )}

          {project.ownership && (
            <Section n={num()} title="My role">
              <p className="cp-lead">{project.ownership}</p>
            </Section>
          )}

          {primary && (
            <Section n={num()} title="Layer">
              <p className="prose muted">
                Mainly <strong className="cp-strong">{primary.name}</strong> ({primary.line.toLowerCase()}).{' '}
                <a className="inline-link" href={`/#layer-${primary.id}`} data-link>
                  More on this layer
                </a>
              </p>
            </Section>
          )}
        </div>

        <nav className="cp-pager" aria-label={project.featured ? 'Other featured projects' : 'Other projects'}>
          <a href={`/projects/${prev.slug}`} data-link className="cp-pager-prev">
            <span className="label">
              <ArrowLeft size={13} /> Previous
            </span>
            <span className="cp-pager-title">{prev.title}</span>
          </a>
          <a href={`/projects/${next.slug}`} data-link className="cp-pager-next">
            <span className="label">
              Next <ArrowRight size={13} />
            </span>
            <span className="cp-pager-title">{next.title}</span>
          </a>
        </nav>
      </div>
    </article>
  );
}
