import { useMemo, useState } from 'react';
import { LAYERS } from '../../data/layers';
import { PROJECT_STATUSES, STATUS_LABEL, bench, categoryOf, projectsInLayer, type LayerId, type ProjectStatus } from '../../data/projects';
import { ArrowRight } from '../Icons';
import LayerMark from '../LayerMark';

/** Everything that is not a case file: tools, experiments, and the ones I archived. Filterable. */
export default function Bench() {
  const [layer, setLayer] = useState<LayerId | 'all'>('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');

  const rows = useMemo(
    () => bench.filter((p) => (layer === 'all' || p.layers.includes(layer)) && (status === 'all' || p.status === status)),
    [layer, status],
  );

  return (
    <section id="bench" className="section bench" aria-labelledby="bench-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <p className="sec-index label">04 — Bench</p>
          <h2 id="bench-title" className="sec-title">
            Everything else on the bench.
          </h2>
          <p className="sec-lede">
            Tools I wanted to exist, experiments to see whether something could be done, and a few I archived when they fell
            short. Each one says plainly whether it shipped.
          </p>
        </header>

        <div className="bench-filters reveal">
          <div className="chips" role="group" aria-label="Filter by layer">
            <button type="button" className="chip" aria-pressed={layer === 'all'} onClick={() => setLayer('all')}>
              All layers <span className="count">{bench.length}</span>
            </button>
            {LAYERS.map((l) => (
              <button key={l.id} type="button" className="chip" aria-pressed={layer === l.id} onClick={() => setLayer(l.id)}>
                {l.name} <span className="count">{projectsInLayer(l.id, bench).length}</span>
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Filter by status">
            <button type="button" className="chip" aria-pressed={status === 'all'} onClick={() => setStatus('all')}>
              Any status
            </button>
            {PROJECT_STATUSES.map((s) => (
              <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <p className="visually-hidden" aria-live="polite">
          {rows.length} project{rows.length === 1 ? '' : 's'} shown
        </p>

        {rows.length ? (
          <ul className="bench-grid">
            {rows.map((p) => (
              <li key={p.slug}>
                <a className="tile" href={`/projects/${p.slug}`} data-link>
                  <div className="tile-top">
                    <LayerMark lit={p.layers} size={26} />
                    <span className={`status status-${p.status}`}>{STATUS_LABEL[p.status]}</span>
                  </div>
                  <h3 className="tile-title" style={{ viewTransitionName: `title-${p.slug}` }}>
                    {p.title}
                  </h3>
                  <p className="tile-cat">
                    {categoryOf(p)}
                    {p.year ? ` · ${p.year}` : ''}
                  </p>
                  <p className="tile-summary">{p.summary}</p>
                  {p.invariant && <p className="tile-invariant">{p.invariant}</p>}
                  <p className="tile-stack">
                    {p.stack.slice(0, 4).join(' · ')}
                    <ArrowRight size={14} />
                  </p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bench-empty">
            <p>Nothing on the bench matches that layer and status.</p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setLayer('all');
                setStatus('all');
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <p className="bench-more reveal">
          <a className="link" href="/projects" data-link>
            Every project, searchable <ArrowRight />
          </a>
        </p>
      </div>
    </section>
  );
}
