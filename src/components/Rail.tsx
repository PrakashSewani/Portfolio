import type { ReactNode } from 'react';

/**
 * The rail — metadata rows plus numbered notes. DESIGN.md §6 calls it the second half of
 * the specimen: the plate shows the artifact, the rail states the facts beside it.
 * Used by the case-study page (foreground) and available to anything that needs a fact
 * column next to a plate.
 */

export interface RailRow {
  label: string;
  value: ReactNode;
}

interface RailProps {
  title?: string;
  rows: RailRow[];
  notes?: string[];
}

export default function Rail({ title = 'Specification', rows, notes }: RailProps) {
  return (
    <aside className="rail" aria-label={title}>
      <div className="rail-head">{title}</div>
      <dl className="rail-rows">
        {rows.map((row) => (
          <div className="rail-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {notes && notes.length > 0 && (
        <ol className="rail-notes">
          {notes.map((note) => <li key={note}>{note}</li>)}
        </ol>
      )}
    </aside>
  );
}
