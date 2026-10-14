import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { loadProjects, type LedgerRow, type ProjectStatus } from '../lib/projects';

/**
 * `/projects` — the ledger (DESIGN.md §6 grammar, applied as a spec-sheet table).
 * Columns: index, title, context, year, stack, status. Filterable by stack + status; the
 * Cmd+K palette gets the same rows from App, so search and the table never disagree.
 */

const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In progress',
  archived: 'Archived',
};

const ALL = 'all' as const;

interface LedgerState {
  status: 'loading' | 'ready' | 'error';
  rows: LedgerRow[];
  source: 'live' | 'snapshot' | '';
  error: string;
}

export default function Projects() {
  const [ledger, setLedger] = useState<LedgerState>({ status: 'loading', rows: [], source: '', error: '' });
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | typeof ALL>(ALL);
  const [stackFilter, setStackFilter] = useState<string | typeof ALL>(ALL);

  useEffect(() => {
    let alive = true;
    loadProjects()
      .then((result) => {
        if (alive) setLedger({ status: 'ready', rows: result.rows, source: result.source, reason: result.reason ?? '', error: '' });
      })
      .catch((err: unknown) => {
        if (alive) {
          setLedger({ status: 'error', rows: [], source: '', reason: '', error: err instanceof Error ? err.message : String(err) });
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const stacks: string[] = [...new Set<string>(ledger.rows.flatMap((row: LedgerRow) => row.stack))].sort(
    (a: string, b: string) => a.localeCompare(b),
  );

  const visible: LedgerRow[] = ledger.rows.filter(
    (row: LedgerRow) =>
      (statusFilter === ALL || row.status === statusFilter) && (stackFilter === ALL || row.stack.includes(stackFilter)),
  );

  return (
    <div className="route-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/" data-link>Index / home</a>
        <span aria-hidden="true">→</span>
        <span>Projects</span>
      </nav>

      <header className="route-head">
        <div>
          <span className="route-kicker">Selected work / full index</span>
          <h1>Every project, one sheet.</h1>
        </div>
        <p>
          The same content model as the case studies on the home page, in table form: what it is,
          what it was built with, and where it stands. Filter by stack or status; Cmd/Ctrl+K
          searches it.
        </p>
      </header>

      <div className="ledger-toolbar">
        <div className="ledger-filters" role="group" aria-label="Filter by status">
          <span>Status</span>
          <button type="button" className="filter-chip" aria-pressed={statusFilter === ALL} onClick={() => setStatusFilter(ALL)}>
            All
          </button>
          {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              className="filter-chip"
              aria-pressed={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {STATUS_LABEL[status]}
            </button>
          ))}
        </div>

        <div className="ledger-filters" role="group" aria-label="Filter by stack">
          <span>Stack</span>
          <button type="button" className="filter-chip" aria-pressed={stackFilter === ALL} onClick={() => setStackFilter(ALL)}>
            All
          </button>
          {stacks.map((stack) => (
            <button
              key={stack}
              type="button"
              className="filter-chip"
              aria-pressed={stackFilter === stack}
              onClick={() => setStackFilter(stack)}
            >
              {stack}
            </button>
          ))}
        </div>

        <p className="ledger-count" aria-live="polite">
          {ledger.status === 'ready' ? `Showing ${visible.length} of ${ledger.rows.length}` : 'Loading index'}
          {ledger.source === 'snapshot' ? ` · snapshot${ledger.reason ? ` (live API unavailable: ${ledger.reason})` : ''}` : ''}
        </p>
      </div>

      {ledger.status === 'loading' && <p className="ledger-empty">Loading the project index…</p>}

      {ledger.status === 'error' && (
        <p className="case-empty">
          The project index could not be loaded ({ledger.error}). The content service may be down —
          try again shortly.
        </p>
      )}

      {ledger.status === 'ready' && (
        <div className="ledger">
          {visible.map((row, index) => (
            <a className="ledger-row" key={row.slug} href={`/projects/${row.slug}`} data-link>
              <span className="ledger-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="ledger-title">{row.title}</span>
              <span className="ledger-context">{row.kicker ?? '—'}</span>
              <span className="ledger-year">{row.year ?? '—'}</span>
              <span className="ledger-stack">
                {row.stack.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}
              </span>
              <span className={`status-pill status-${row.status}`}>{STATUS_LABEL[row.status]}</span>
            </a>
          ))}
          {visible.length === 0 && (
            <p className="ledger-empty">
              No project matches that filter.{' '}
              <button
                type="button"
                className="filter-chip"
                onClick={() => {
                  setStatusFilter(ALL);
                  setStackFilter(ALL);
                }}
              >
                Clear filters <ArrowUpRight size={12} aria-hidden="true" />
              </button>
            </p>
          )}
        </div>
      )}

      <p className="section-link">
        <a href="/" data-link>← Back to the home page</a>
      </p>
    </div>
  );
}
