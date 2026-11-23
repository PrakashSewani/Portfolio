import { useMemo, useState } from 'react';
import { ArrowRight, Search } from '../components/Icons';
import LayerMark from '../components/LayerMark';
import { LAYERS } from '../data/layers';
import {
  KNOWN_LANGUAGES,
  PROJECT_STATUSES,
  STATUS_LABEL,
  caseNumber,
  languagesOf,
  projects,
  statusCounts,
  type LayerId,
  type Project,
  type ProjectStatus,
} from '../data/projects';
import { useDocumentMeta } from '../lib/meta';

type SortKey = 'order' | 'title' | 'year' | 'status';
const STATUS_RANK: Record<ProjectStatus, number> = { shipped: 0, 'in-progress': 1, archived: 2 };

function compare(key: SortKey, a: Project, b: Project): number {
  switch (key) {
    case 'title':
      return a.title.localeCompare(b.title);
    case 'year':
      return (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title);
    case 'status':
      return STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.title.localeCompare(b.title);
    default:
      return 0; // keep the content's order
  }
}

function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | 'all';
  options: Array<{ id: T | 'all'; text: string }>;
  onChange: (v: T | 'all') => void;
}) {
  return (
    <div className="ix-filter" role="group" aria-label={label}>
      <span className="label">{label}</span>
      <div className="chips">
        {options.map((o) => (
          <button key={o.id} type="button" className="chip" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const SORTS: Array<{ id: SortKey; text: string }> = [
  { id: 'order', text: 'Curated' },
  { id: 'year', text: 'Newest' },
  { id: 'title', text: 'A–Z' },
  { id: 'status', text: 'Status' },
];

/** /projects — every project, searchable, filterable by layer, language and status, sortable. */
export default function ProjectIndex() {
  const counts = statusCounts();
  useDocumentMeta({
    title: 'Every project — Prakash Sewani',
    description: `All ${projects.length} projects by Prakash Sewani: ${counts.shipped} shipped, ${counts['in-progress']} in progress, ${counts.archived} archived. Searchable by layer, language and status.`,
  });

  const [query, setQuery] = useState('');
  const [layer, setLayer] = useState<LayerId | 'all'>('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [lang, setLang] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('order');

  const langOptions = useMemo(() => (KNOWN_LANGUAGES as readonly string[]).filter((l) => projects.some((p) => languagesOf(p).includes(l))), []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => layer === 'all' || p.layers.includes(layer))
      .filter((p) => status === 'all' || p.status === status)
      .filter((p) => lang === 'all' || languagesOf(p).includes(lang))
      .filter((p) => !q || `${p.title} ${p.summary} ${p.stack.join(' ')} ${p.kicker ?? ''} ${p.invariant ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => compare(sort, a, b));
  }, [query, layer, status, lang, sort]);

  const reset = () => {
    setQuery('');
    setLayer('all');
    setStatus('all');
    setLang('all');
  };
  const dirty = Boolean(query) || layer !== 'all' || status !== 'all' || lang !== 'all';

  return (
    <div className="page ix">
      <div className="wrap">
        <header className="page-head">
          <p className="sec-index label">Index</p>
          <h1 className="sec-title">Every project.</h1>
          <p className="sec-lede">
            All {projects.length}: {counts.shipped} shipped, {counts['in-progress']} in progress, {counts.archived} archived.
            Search by name, stack or summary, or filter by layer, language and status.
          </p>
        </header>

        <div className="ix-controls">
          <label className="ix-search">
            <Search size={16} />
            <span className="visually-hidden">Search projects</span>
            <input type="search" placeholder="Search name, stack, summary…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <Chips label="Layer" value={layer} onChange={setLayer} options={[{ id: 'all', text: 'All' }, ...LAYERS.map((l) => ({ id: l.id, text: l.name }))]} />
          <Chips label="Language" value={lang} onChange={setLang} options={[{ id: 'all', text: 'All' }, ...langOptions.map((l) => ({ id: l, text: l }))]} />
          <Chips
            label="Status"
            value={status}
            onChange={setStatus}
            options={[{ id: 'all', text: 'All' }, ...PROJECT_STATUSES.map((s) => ({ id: s, text: STATUS_LABEL[s] }))]}
          />
          <div className="ix-filter" role="group" aria-label="Sort">
            <span className="label">Sort</span>
            <div className="chips">
              {SORTS.map((s) => (
                <button key={s.id} type="button" className="chip" aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ix-meta">
          <span aria-live="polite">
            {rows.length} of {projects.length} projects
          </span>
          {dirty && (
            <button type="button" className="link" onClick={reset}>
              Clear filters
            </button>
          )}
        </div>

        {rows.length ? (
          <ol className="ledger">
            {rows.map((p) => {
              const n = caseNumber(p);
              return (
                <li key={p.slug}>
                  <a className="ledger-row" href={`/projects/${p.slug}`} data-link>
                    <span className="ledger-mark">
                      <LayerMark lit={p.layers} size={30} />
                    </span>
                    <span className="ledger-main">
                      <span className="ledger-title" style={{ viewTransitionName: `title-${p.slug}` }}>
                        {p.title}
                        {n && <span className="ledger-case">Case {n}</span>}
                      </span>
                      <span className="ledger-summary">{p.summary}</span>
                    </span>
                    <span className="ledger-stack">{p.stack.slice(0, 3).join(' · ')}</span>
                    <span className={`status status-${p.status}`}>{STATUS_LABEL[p.status]}</span>
                    <span className="ledger-year">
                      {p.year ?? '—'}
                      <ArrowRight size={14} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="bench-empty">
            <p>Nothing matches those filters.</p>
            <button type="button" className="btn" onClick={reset}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
