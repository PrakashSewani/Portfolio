import { Check } from 'lucide-react';
import type { ProjectCallout, SpecimenKind } from '../lib/projects';

/**
 * A specimen plate — the app-image system from DESIGN.md §6.
 *
 *   caption strip  →  FIG. <nn> / <caption>
 *   figure slot    →  a drawn UI figure (crisp at any zoom, on-palette, zero image weight)
 *   callouts       →  numbered annotations tied to the figure
 *   footnote strip →  the facts that close the specimen
 *
 * The figures reuse the stylesheet's existing figure classes (`inspector-mockup`, `code-row`,
 * `habit-mockup`, `knowledge-mockup`, `roulette-mockup`, …) so there is one token map for the
 * plate and the drawing inside it.
 *
 * Callout numbers come from the data (`callout.n` → `data-n` → `content: attr(data-n)`), not from
 * DOM order, so a validated `n` cannot be silently ignored.
 */

interface SpecimenPlateProps {
  kind: SpecimenKind;
  /** Caption strip label; falls back to the kind. */
  caption?: string;
  /** Figure number shown in the caption strip. */
  index?: number;
  callouts?: ProjectCallout[];
  /** Short facts rendered in the footnote strip. */
  footnote?: string[];
}

function InspectorFigure() {
  return (
    <div className="mockup inspector-mockup" aria-hidden="true">
      <div className="mockup-bar"><span>class-spy.tsx</span><span>×</span></div>
      <div className="code-row"><b>14</b><code>&lt;div className=<mark>&quot;flex items-center gap-4&quot;</mark>&gt;</code></div>
      <div className="code-row muted"><b>15</b><code>&nbsp;&nbsp;&lt;Tool /&gt;</code></div>
      <div className="inspection-card">
        <small>CLASS-SPY / RESOLVED</small>
        <strong>.flex</strong><span>display: flex;</span>
        <strong>.items-center</strong><span>align-items: center;</span>
        <strong>.gap-4</strong><span>gap: 1rem;</span>
      </div>
      <div className="mockup-status"><span>6 frameworks</span><span>TypeScript</span><span>Ready</span></div>
    </div>
  );
}

function RouletteFigure() {
  return (
    <div className="mockup roulette-mockup" aria-hidden="true">
      <div className="mockup-bar"><span>netflix.com/title/80018294</span><span>×</span></div>
      <div className="roulette-stage">
        <div className="roulette-series">
          <small>SERIES / THE OFFICE</small>
          <strong>RANDOM EPISODE</strong>
          <span>S5 · E14 · “Stress Relief”</span>
        </div>
        <div className="roulette-actions">
          <span className="roulette-play">▶ Play</span>
          <span className="roulette-dice">🎲 Random Episode</span>
        </div>
        <div className="roulette-discover">
          <small>DISCOVERY</small>
          <div className="roulette-discover-row"><span>Season 1</span><b>6 ep</b></div>
          <div className="roulette-discover-row"><span>Season 2</span><b>22 ep</b></div>
          <div className="roulette-discover-row"><span>Season 3</span><b>23 ep</b></div>
          <div className="roulette-discover-row"><span>Season 4</span><b>19 ep</b></div>
          <div className="roulette-discover-row"><span>Season 5</span><b>28 ep</b></div>
          <div className="roulette-discover-row"><span>Season 6</span><b>26 ep</b></div>
        </div>
      </div>
      <div className="mockup-status"><span>Netflix + Prime Video</span><span>Manifest V3</span><span>1 / 124 picked</span></div>
    </div>
  );
}

function HabitFigure() {
  return (
    <div className="mockup habit-mockup" aria-hidden="true">
      <div className="habit-head"><div><small>GOOD MORNING</small><strong>Build momentum.</strong></div><b>87%</b></div>
      <div className="week-row">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <span className={index < 5 ? 'done' : ''} key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="habit-list">
        {['Deep work', 'Read 20 pages', 'Exercise'].map((habit, index) => (
          <div key={habit}>
            <i className={index < 2 ? 'checked' : ''}>{index < 2 && <Check size={14} />}</i>
            <span>{habit}</span>
            <b>{index === 0 ? '14d' : index === 1 ? '8d' : '3d'}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeFigure() {
  return (
    <div className="mockup knowledge-mockup" aria-hidden="true">
      <div className="knowledge-sidebar"><strong>SEB</strong><span>01</span><span>02</span><span>03</span></div>
      <div className="knowledge-body">
        <small>DOCUMENT / NLP_CHAPTER.PDF</small>
        <h4>What are transformers?</h4>
        <div className="answer-block">
          <b>CONTEXTUAL ANSWER</b>
          <p>Transformers are attention-based neural networks that process relationships across input data in parallel.</p>
        </div>
        <div className="confidence"><span>Model confidence</span><strong>94%</strong><i /></div>
      </div>
    </div>
  );
}

function NoneFigure({ caption }: { caption: string }) {
  return (
    <div className="mockup" aria-hidden="true">
      <div className="mockup-bar"><span>{caption}</span><span>no figure</span></div>
    </div>
  );
}

export default function SpecimenPlate({ kind, caption, index = 1, callouts, footnote }: SpecimenPlateProps) {
  const label = caption ?? kind;
  return (
    <figure className={`plate plate-${kind}`}>
      <figcaption className="plate-caption">
        <b>FIG. {String(index).padStart(2, '0')}</b>
        <span>{label}</span>
      </figcaption>
      <div className="plate-figure">
        {kind === 'inspector' && <InspectorFigure />}
        {kind === 'roulette' && <RouletteFigure />}
        {kind === 'habit' && <HabitFigure />}
        {kind === 'knowledge' && <KnowledgeFigure />}
        {kind === 'none' && <NoneFigure caption={label} />}
      </div>
      {callouts && callouts.length > 0 && (
        <ol className="plate-callouts">
          {callouts.map((callout) => (
            <li key={callout.n} data-n={callout.n}>{callout.text}</li>
          ))}
        </ol>
      )}
      {footnote && footnote.length > 0 && (
        <div className="plate-footnote">
          {footnote.map((fact) => <span key={fact}>{fact}</span>)}
        </div>
      )}
    </figure>
  );
}
