import { useMemo, useState } from 'react';
import { SIGNAL_PATH } from '../data/profile';
import { KNOWN_LANGUAGES, languagesOf, projects, type Project } from '../data/projects';
import { PROJECT_STATUSES } from '../lib/projects';
import { ArrowUpRight, Search } from './Icons';

type SortKey = 'order' | 'title' | 'year' | 'status';
const STATUS_RANK: Record<string, number> = { shipped: 0, 'in-progress': 1, archived: 2 };

function compare(key: SortKey, a: Project, b: Project): number {
  switch (key) {
    case 'title':
      return a.title.localeCompare(b.title);
    case 'year':
      return (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title);
    case 'status':
      return STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.title.localeCompare(b.title);
    default:
      return 0; // keep the schema's order
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
    <div className="filter" role="group" aria-label={label}>
      <span className="label">{label}</span>
      <div className="filter-chips">
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Archive() {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [lang, setLang] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('order');

  const langOptions = useMemo(
    () => (KNOWN_LANGUAGES as readonly string[]).filter((l) => projects.some((p) => languagesOf(p).includes(l))),
    [],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => stage === 'all' || p.stage === stage)
      .filter((p) => status === 'all' || p.status === status)
      .filter((p) => lang === 'all' || languagesOf(p).includes(lang))
      .filter((p) => !q || `${p.title} ${p.summary} ${p.stack.join(' ')} ${p.kicker ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => compare(sort, a, b));
  }, [query, stage, status, lang, sort]);

  const reset = () => {
    setQuery('');
    setStage('all');
    setStatus('all');
    setLang('all');
  };
  const dirty = query || stage !== 'all' || status !== 'all' || lang !== 'all';

  const sortBtn = (key: SortKey, text: string) => (
    <button type="button" className="th-sort" data-active={sort === key} onClick={() => setSort(key)} aria-label={`Sort by ${text}`}>
      {text}
    </button>
  );

  return (
    <section id="archive" className="section" aria-labelledby="archive-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <span className="sec-no">04 / Archive</span>
          <h2 id="archive-title">
            Everything else, <em>queryable</em>.
          </h2>
          <p>All {projects.length} projects, including the small tools and the experiments that did not make the cut above. Filter by stage, language or status.</p>
        </header>

        <div className="archive-controls reveal">
          <label className="search">
            <Search size={16} />
            <span className="sr-only">Search projects</span>
            <input type="search" placeholder="Search name, stack, summary…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <Chips
            label="Stage"
            value={stage}
            onChange={setStage}
            options={[{ id: 'all', text: 'All' }, ...SIGNAL_PATH.map((s) => ({ id: s.id as string, text: s.label }))]}
          />
          <Chips
            label="Language"
            value={lang}
            onChange={setLang}
            options={[{ id: 'all', text: 'All' }, ...langOptions.map((l) => ({ id: l, text: l }))]}
          />
          <Chips
            label="Status"
            value={status}
            onChange={setStatus}
            options={[{ id: 'all', text: 'All' }, ...PROJECT_STATUSES.map((s) => ({ id: s as string, text: s.replace('-', ' ') }))]}
          />
        </div>

        <div className="archive-meta" aria-live="polite">
          <span>
            {rows.length} of {projects.length} projects
          </span>
          {dirty && (
            <button type="button" className="link-btn" onClick={reset}>
              Clear filters
            </button>
          )}
        </div>

        <div className="ledger reveal" role="table" aria-label="Project archive">
          <div className="ledger-head" role="row">
            <span role="columnheader">{sortBtn('title', 'Project')}</span>
            <span role="columnheader">Stage</span>
            <span role="columnheader">Stack</span>
            <span role="columnheader">{sortBtn('status', 'Status')}</span>
            <span role="columnheader">{sortBtn('year', 'Year')}</span>
          </div>
          {rows.map((p) => (
            <div key={p.slug} className="ledger-row" role="row">
              <span className="ledger-title" role="cell">
                <a className="ledger-link" href={`/projects/${p.slug}`} data-link>
                  {p.title}
                </a>
                <small>{p.summary}</small>
              </span>
              <span className="ledger-stage" role="cell">
                {SIGNAL_PATH.find((s) => s.id === p.stage)?.label}
              </span>
              <span className="ledger-stack" role="cell">
                {p.stack.slice(0, 3).join(' · ')}
              </span>
              <span className="ledger-status" role="cell" data-status={p.status}>
                {p.status.replace('-', ' ')}
              </span>
              <span className="ledger-year" role="cell">
                {p.year ?? '—'}
                <ArrowUpRight size={14} />
              </span>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="ledger-empty">
              Nothing matches. <button type="button" className="link-btn" onClick={reset}>Clear filters</button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
