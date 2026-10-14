import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import SpecimenPlate from '../components/SpecimenPlate';
import Rail from '../components/Rail';
import { loadProject, ProjectNotFoundError, type Project, type ProjectStatus } from '../lib/projects';

/**
 * `/projects/<slug>` — one case study: specimen plate + rail, challenge → decisions →
 * evidence. Content comes from the Pages Function (`/api/projects/<slug>`), falling back to the
 * build-time snapshot, so the page renders even with the API down.
 */

const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In progress',
  archived: 'Archived',
};

type State =
  | { status: 'loading' }
  | { status: 'ready'; project: Project; source: 'live' | 'snapshot' }
  | { status: 'missing'; slug: string }
  | { status: 'error'; message: string };

export default function ProjectCase({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    loadProject(slug)
      .then(({ project, source }) => {
        if (alive) setState({ status: 'ready', project, source });
      })
      .catch((err: unknown) => {
        if (!alive) return;
        // Branch on the error *type*, not on a substring of its message.
        if (err instanceof ProjectNotFoundError) {
          setState({ status: 'missing', slug });
          return;
        }
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <div className="route-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/" data-link>Index / home</a>
        <span aria-hidden="true">→</span>
        <a href="/projects" data-link>Projects</a>
        <span aria-hidden="true">→</span>
        <span>{slug}</span>
      </nav>

      {state.status === 'loading' && <p className="ledger-empty">Loading the case study…</p>}

      {state.status === 'missing' && (
        <div className="case-empty">
          <h2>No project called “{slug}”.</h2>
          <p>
            The index in the content service does not have that slug.{' '}
            <a href="/projects" data-link>See every project →</a>
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="case-empty">
          <h2>This case study could not be loaded.</h2>
          <p>{state.message} — try again shortly, or <a href="/projects" data-link>open the index</a>.</p>
        </div>
      )}

      {state.status === 'ready' && (() => {
        const { project, source } = state;
        const specimen = project.specimen;

        return (
          <>
            <header className="route-head">
              <div>
                <span className="route-kicker">{project.kicker ?? 'Project case study'}</span>
                <h1>{project.title}</h1>
              </div>
              <p className="case-goal">{project.summary}</p>
            </header>

            <div className="case-grid">
              <div className="case-main">
                {project.challenge && (
                  <section className="case-block">
                    <h2>The engineering problem</h2>
                    <p>{project.challenge}</p>
                  </section>
                )}

                {project.decisions && project.decisions.length > 0 && (
                  <section className="case-block">
                    <h2>Key decisions</h2>
                    <ol className="case-steps">
                      {project.decisions.map((decision) => <li key={decision}>{decision}</li>)}
                    </ol>
                  </section>
                )}

                {project.evidence && project.evidence.length > 0 && (
                  <section className="case-block">
                    <h2>Evidence</h2>
                    <ul className="case-evidence">
                      {project.evidence.map((item) => (
                        <li key={item.label}>
                          <b>{item.value}</b>
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {project.ownership && (
                  <section className="case-block">
                    <h2>What I owned</h2>
                    <p>{project.ownership}</p>
                  </section>
                )}
              </div>

              <aside className="fig-stack">
                {/* FIG. numbering follows `order`, so a case's figure number matches its ledger
                    index — the plate is FIG. 05 for the project that sits at position 5. */}
                <SpecimenPlate
                  kind={specimen?.kind ?? 'none'}
                  caption={specimen?.caption ?? project.title}
                  index={project.order ?? 1}
                  callouts={specimen?.callouts}
                  footnote={project.stack.slice(0, 4)}
                />
                <Rail
                  title="Specification"
                  rows={[
                    { label: 'Status', value: <span className={`status-pill status-${project.status}`}>{STATUS_LABEL[project.status]}</span> },
                    { label: 'Year', value: project.year ?? '—' },
                    { label: 'Context', value: project.kicker ?? '—' },
                    { label: 'Stack', value: project.stack.join(' · ') },
                    {
                      label: 'Links',
                      value: project.links.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                          {link.label} <ArrowUpRight size={12} aria-hidden="true" />
                        </a>
                      )),
                    },
                  ]}
                />
                <p className="section-link">
                  <a href="/projects" data-link>← All projects</a>
                  {source === 'snapshot' && <span> · live API unavailable, showing the snapshot</span>}
                </p>
              </aside>
            </div>
          </>
        );
      })()}
    </div>
  );
}
