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
 *
 * Twelve kinds are drawn: the four originals (`inspector`, `roulette`, `habit`, `knowledge`) plus
 * `workspace`, `review`, `gateway`, `repos`, `monitor`, `magnet`, `redact` and `audit`. Every
 * figure is markup and tokens — no images, no raw hex, no motion.
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

/** Dormant — the workspace rail and the clean / archive / restore row. */
const WORKSPACES = [
  { name: 'dormant-macos', size: '1.4 GB' },
  { name: 'portfolio', size: '612 MB' },
  { name: 'rstats-cli', size: '188 MB' },
  { name: 'legacy-api', size: '2.1 GB' },
];

function WorkspaceFigure() {
  return (
    <div className="mockup win-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span className="lights"><i /><i /><i /></span>
        <span>Dormant — local workspaces</span>
        <span>~/Projects</span>
      </div>
      <div className="fig-body">
        {WORKSPACES.map((workspace) => (
          <div className="fig-row" key={workspace.name}>
            <b>{workspace.name}</b>
            <span>{workspace.size}</span>
          </div>
        ))}
        <div className="fig-row">
          <b>Reclaimed by the last archive</b>
          <span>4.3 GB</span>
          <div className="bar"><i style={{ width: '68%' }} /></div>
        </div>
      </div>
      <div className="plate-footnote">
        <span className="chip">Clean</span>
        <span className="chip">Archive</span>
        <span className="chip">Restore</span>
      </div>
    </div>
  );
}

/** Jury Forge — one pull request, three reviewers, the consolidated comment list. */
const JURY = [
  { role: 'Correctness', verdict: 'Pass', state: 'ok' },
  { role: 'Security', verdict: '1 note', state: '' },
  { role: 'Performance', verdict: 'Pass', state: 'ok' },
];

function ReviewFigure() {
  return (
    <div className="mockup win-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span className="lights"><i /><i /><i /></span>
        <span>Jury Forge — review run</span>
        <span>PR #41</span>
      </div>
      <div className="fig-body">
        <div className="fig-row on">
          <b>#41 route fallback for streamed output</b>
          <span>12 files · +148 −62</span>
        </div>
        <div className="fig-grid">
          {JURY.map((card) => (
            <div className="fig-row fig-card" key={card.role}>
              <small>{card.role}</small>
              <span className={`chip ${card.state}`}>{card.verdict}</span>
            </div>
          ))}
        </div>
        <div className="fig-row warn">
          <b>app/router.go:88</b>
          <span>Fallback never fires once a target has streamed output.</span>
        </div>
        <div className="fig-row warn">
          <b>app/budget.go:23</b>
          <span>Reservation is not released when a provider times out.</span>
        </div>
      </div>
      <div className="plate-footnote"><span>webhook ← github.com</span><span>1 consolidated review</span></div>
    </div>
  );
}

/** NexusRelay — one request, the routing box, the providers and the accounting. */
function GatewayFigure() {
  return (
    <div className="mockup night-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span>POST /v1/chat/completions</span>
        <span className="chip">tenant · acme</span>
      </div>
      <div className="fig-body">
        <span className="fig-row node"><b>App / coding agent</b><small>one stable API key</small></span>
        <span className="arrow">↓</span>
        <span className="fig-row node core"><b>NexusRelay gateway</b><small>auth · policy · route · account</small></span>
        <span className="arrow">↓</span>
        <div className="fig-grid">
          <span className="fig-row node on">OpenAI</span>
          <span className="fig-row node on">Anthropic</span>
          <span className="fig-row node">Ollama · local</span>
        </div>
        <div className="fig-row">
          <b>chat-fast</b>
          <span>→ openai/gpt-4o</span>
        </div>
      </div>
      <div className="plate-footnote"><span>1 784 tokens</span><span>cost $0.0042</span><span>attempt 1</span></div>
    </div>
  );
}

/** git-vacuum — repository rows with ahead/behind, dirty flags and size bars. */
const REPOS = [
  { name: 'Portfolio', counters: '↑2 ↓0', dirty: false, size: 62 },
  { name: 'veil', counters: '↑0 ↓3', dirty: true, size: 24 },
  { name: 'code-atlas', counters: '↑1 ↓1', dirty: true, size: 88 },
];

function ReposFigure() {
  return (
    <div className="mockup night-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span>git-vacuum — repos</span>
        <span className="chip">token · OS keyring</span>
      </div>
      <div className="fig-body">
        {REPOS.map((repo) => (
          <div className="fig-row" key={repo.name}>
            <b>{repo.name}</b>
            <span>{repo.counters}</span>
            {repo.dirty && <span className="chip">dirty</span>}
            <div className="bar"><i style={{ width: `${repo.size}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="plate-footnote"><span>8 workers</span><span>sync complete</span><span>no server · no telemetry</span></div>
    </div>
  );
}

/** rstats — CPU and memory history, the process table, and a sustained-threshold alert. */
const CPU_TRACE = [18, 24, 16, 30, 42, 28, 22, 34, 52, 44, 30, 26, 38, 24, 20, 32];
const MEM_TRACE = [58, 59, 60, 61, 61, 60, 62, 63, 61, 60, 61, 62, 61, 61, 60, 61];

function Spark({ values }: { values: number[] }) {
  return (
    <div className="spark">
      {values.map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}
    </div>
  );
}

function MonitorFigure() {
  return (
    <div className="mockup night-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span>rstats — monitor</span>
        <span className="chip">space · pause</span>
      </div>
      <div className="fig-body">
        <div className="fig-grid">
          <div className="fig-row fig-card"><small>CPU</small><b>12.3%</b><Spark values={CPU_TRACE} /></div>
          <div className="fig-row fig-card"><small>Memory</small><b>61.2%</b><Spark values={MEM_TRACE} /></div>
        </div>
        <div className="fig-row"><b>rstats</b><span>8.4%</span><span>312 MB</span></div>
        <div className="fig-row"><b>veil listen</b><span>2.1%</span><span>184 MB</span></div>
        <div className="fig-row warn"><b>warning</b><span>cpu.total &gt; 90% for 30s</span></div>
      </div>
      <div className="plate-footnote"><span>14:32:05</span><span>load 2.14</span><span>disk 62.1%</span></div>
    </div>
  );
}

/** Magnetline — search results with the magnet and .torrent controls already in the row. */
const MAGNET_RESULTS = [
  { title: 'Ubuntu 24.04 Desktop amd64', size: '6.1 GB', resolved: true },
  { title: 'Debian 13 netinst amd64', size: '640 MB', resolved: false },
  { title: 'Arch Linux 2026.10.01 x86_64', size: '1.3 GB', resolved: false },
];

function MagnetFigure() {
  return (
    <div className="mockup win-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span className="lights"><i /><i /><i /></span>
        <span>1337x.to/search/ubuntu/1/</span>
        <span>unpacked · MV3</span>
      </div>
      <div className="fig-body">
        {MAGNET_RESULTS.map((result) => (
          <div className={`fig-row${result.resolved ? ' on' : ''}`} key={result.title}>
            <b>{result.title}</b>
            <small>{result.size}</small>
            <span className="chip ok">🧲 Magnet</span>
            <span className="chip">.torrent</span>
          </div>
        ))}
      </div>
      <div className="plate-footnote"><span>3 rows resolved in the background</span><span>no server · no account</span></div>
    </div>
  );
}

/** Veil — the same line before and after the redaction, plus a masked seed phrase. */
const SEED_WORDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function RedactFigure() {
  return (
    <div className="mockup night-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span>Veil — editor capture</span>
        <span className="chip ok">3 secrets masked</span>
      </div>
      <div className="fig-body">
        <div className="code-row tight"><b>12</b><code>GITHUB_TOKEN=<mark>ghp_…</mark></code></div>
        <div className="code-row tight"><b>13</b><code>AWS_SECRET_ACCESS_KEY=</code><span className="redact"><i /></span></div>
        <div className="code-row tight"><b>14</b><code>OPENAI_API_KEY=</code><span className="redact"><i /></span></div>
        <div className="code-row tight">
          <b>15</b><code>SEED_PHRASE=</code>
          <span className="redact">{SEED_WORDS.map((word) => <i key={word} />)}</span>
        </div>
      </div>
      <div className="plate-footnote"><span>blur rects over the stream</span><span>coordinates, never the text</span></div>
    </div>
  );
}

/** CodeAtlas AI — the file tree, the findings, the module graph and the elapsed clock. */
const TREE = ['app/', '  main.py', '  routers/', '    audit.py', '  graph/', '    builder.py'];
const FINDINGS = [
  { kind: 'Security · high', text: 'Hardcoded credential in config.py' },
  { kind: 'Architecture · medium', text: 'Router reaches past the service layer' },
];

function AuditFigure() {
  return (
    <div className="mockup win-frame" aria-hidden="true">
      <div className="mockup-bar">
        <span className="lights"><i /><i /><i /></span>
        <span>CodeAtlas AI — repo audit</span>
        <span className="chip ok">00:08.4</span>
      </div>
      <div className="fig-grid">
        <div className="fig-row tree">
          {TREE.map((line) => <span key={line}>{line}</span>)}
        </div>
        <div className="fig-body">
          {FINDINGS.map((finding) => (
            <div className="fig-row warn" key={finding.text}>
              <b>{finding.kind}</b>
              <span>{finding.text}</span>
            </div>
          ))}
          <div className="fig-row fig-card">
            <small>Module links</small>
            <svg className="graph" viewBox="0 0 120 56" width="100%" aria-hidden="true">
              <path d="M16 12 L56 28 M56 28 L104 10 M56 28 L104 46 M16 44 L56 28 M16 12 L16 44" />
              <circle cx="16" cy="12" r="3" /><circle cx="16" cy="44" r="3" />
              <circle cx="56" cy="28" r="4" /><circle cx="104" cy="10" r="3" /><circle cx="104" cy="46" r="3" />
            </svg>
          </div>
          <span className="fig-row node"><b>Knowledge graph</b><small>shared by every agent</small></span>
        </div>
      </div>
      <div className="plate-footnote"><span>6 specialists</span><span>Gemma 4 31B · Cerebras</span></div>
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
        {kind === 'workspace' && <WorkspaceFigure />}
        {kind === 'review' && <ReviewFigure />}
        {kind === 'gateway' && <GatewayFigure />}
        {kind === 'repos' && <ReposFigure />}
        {kind === 'monitor' && <MonitorFigure />}
        {kind === 'magnet' && <MagnetFigure />}
        {kind === 'redact' && <RedactFigure />}
        {kind === 'audit' && <AuditFigure />}
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
