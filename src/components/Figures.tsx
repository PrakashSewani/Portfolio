import type { ReactNode } from 'react';
import type { Project, SpecimenKind } from '../data/projects';

/**
 * Drawn case-study figures: inline SVG, themed through CSS variables, zero image weight and crisp at
 * any zoom. They are illustrations of how each tool works (every one says so), not screenshots.
 */

function Frame({ title, label, children }: { title: string; label: string; children: ReactNode }) {
  return (
    <svg className="figure" viewBox="0 0 520 320" role="img" aria-label={label}>
      <rect className="fg-win" x="0.5" y="0.5" width="519" height="319" rx="10" />
      <line className="fg-line" x1="0" x2="520" y1="30.5" y2="30.5" />
      <text className="t fg-mute" x="16" y="20">
        {title}
      </text>
      <text className="t fg-faint" x="504" y="20" textAnchor="end">
        ILLUSTRATION
      </text>
      {children}
    </svg>
  );
}

/** A deterministic wiggly line for sparklines. */
function spark(seed: number, x: number, y: number, w: number, h: number, n = 40): string {
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const v = 0.5 + 0.28 * Math.sin(i * 0.5 + seed) + 0.16 * Math.sin(i * 1.7 + seed * 2.3) + 0.06 * Math.sin(i * 4.1 + seed);
    d += `${i === 0 ? 'M' : 'L'}${(x + (i / (n - 1)) * w).toFixed(1)} ${(y + h - v * h).toFixed(1)}`;
  }
  return d;
}

function Monitor() {
  const rows = [
    ['rstats', '2.1', '0.4'],
    ['node', '31.8', '6.2'],
    ['postgres', '9.4', '11.0'],
    ['chrome', '24.0', '18.3'],
  ];
  return (
    <Frame title="rstats — live monitor" label="Terminal dashboard with CPU and memory sparklines, a process table, a sustained alert and the headless JSON line.">
      <g>
        {[0, 1].map((r) => (
          <g key={r}>
            <rect className="fg-box" x="16" y={44 + r * 66} width="316" height="58" rx="6" />
            <text className="t fg-mute" x="28" y={62 + r * 66}>
              {r === 0 ? 'CPU' : 'MEM'}
            </text>
            <text className="t fg-ink" x="320" y={62 + r * 66} textAnchor="end">
              {r === 0 ? '37%' : '61%'}
            </text>
            <path className="fg-acc-s" d={spark(r * 2 + 1, 28, 68 + r * 66, 292, 28)} strokeWidth="1.5" />
          </g>
        ))}
        <rect className="fg-box" x="344" y="44" width="160" height="124" rx="6" />
        <text className="t fg-faint" x="356" y="62">PROC</text>
        <text className="t fg-faint" x="448" y="62" textAnchor="end">CPU</text>
        <text className="t fg-faint" x="492" y="62" textAnchor="end">MEM</text>
        {rows.map(([name, cpu, mem], i) => (
          <g key={name}>
            <text className={i === 1 ? 't fg-acc' : 't fg-ink'} x="356" y={86 + i * 24}>{name}</text>
            <text className="t fg-mute" x="448" y={86 + i * 24} textAnchor="end">{cpu}</text>
            <text className="t fg-mute" x="492" y={86 + i * 24} textAnchor="end">{mem}</text>
          </g>
        ))}
      </g>
      <rect className="fg-box fg-box-acc" x="16" y="182" width="488" height="40" rx="6" />
      <text className="t fg-acc" x="30" y="206">▲ ALERT</text>
      <text className="t fg-ink" x="96" y="206">cpu ≥ 85% held for 30s · severity high</text>
      <text className="t fg-mute" x="492" y="206" textAnchor="end">recovers &lt; 70%</text>
      <text className="t fg-mute" x="16" y="250">$ rstats --watch --json</text>
      <text className="t fg-ink" x="16" y="272">{'{"cpu":37.2,"mem":61.0,"load":1.4,"alerts":0}'}</text>
      <text className="t fg-faint" x="16" y="294">history is bounded per metric · recordings are JSONL</text>
    </Frame>
  );
}

function Repos() {
  const rows: Array<[string, string, string, number?]> = [
    ['Class-Spy', 'synced', 'ok'],
    ['NexusRelay', '↓ 2 behind', 'acc'],
    ['jury-forge', 'cloning', 'acc', 64],
    ['dev-rig', 'dirty', 'bad'],
    ['veil', 'synced', 'ok'],
    ['rstats-cli', 'fetching', 'acc', 28],
  ];
  return (
    <Frame title="git-vacuum — mirror every repo you own" label="Terminal UI listing repositories with synced, behind, dirty and in-progress states while eight workers clone and fetch.">
      <text className="t fg-faint" x="16" y="52">REPOSITORY</text>
      <text className="t fg-faint" x="504" y="52" textAnchor="end">STATE</text>
      {rows.map(([name, state, tone, pct], i) => {
        const y = 62 + i * 30;
        return (
          <g key={name}>
            {i === 1 && <rect className="fg-sel" x="8" y={y - 4} width="504" height="26" rx="4" />}
            <text className="t fg-ink" x="16" y={y + 14}>{name}</text>
            {pct !== undefined && (
              <g>
                <rect className="fg-track" x="250" y={y + 6} width="120" height="6" rx="3" />
                <rect className="fg-acc" x="250" y={y + 6} width={(120 * pct) / 100} height="6" rx="3" />
              </g>
            )}
            <text className={`t fg-${tone}`} x="504" y={y + 14} textAnchor="end">{state}</text>
          </g>
        );
      })}
      <line className="fg-line" x1="0" x2="520" y1="250.5" y2="250.5" />
      <text className="t fg-mute" x="16" y="274">8 workers · SQLite (WAL) · token in the OS keyring</text>
      <text className="t fg-faint" x="16" y="298">j/k move   s sync   / filter   q quit</text>
    </Frame>
  );
}

function Gateway() {
  const providers = ['OpenAI', 'Anthropic', 'Ollama'];
  return (
    <Frame title="NexusRelay — one API in front of many providers" label="Request flow from a client through the gateway's auth, policy, routing and metering to OpenAI, Anthropic and Ollama, with PostgreSQL as durable truth and Redis as disposable state.">
      <rect className="fg-box" x="16" y="98" width="110" height="68" rx="6" />
      <text className="t fg-ink" x="71" y="124" textAnchor="middle">client</text>
      <text className="t fg-mute" x="71" y="144" textAnchor="middle">nx_key + alias</text>

      <rect className="fg-box fg-box-acc" x="176" y="70" width="170" height="124" rx="6" />
      <text className="t fg-acc" x="261" y="92" textAnchor="middle">NexusRelay</text>
      {['authenticate', 'apply policy', 'pick a route', 'meter in nanos'].map((s, i) => (
        <text key={s} className="t fg-ink" x="261" y={118 + i * 20} textAnchor="middle">{s}</text>
      ))}

      {providers.map((p, i) => (
        <g key={p}>
          <rect className="fg-box" x="396" y={54 + i * 54} width="108" height="40" rx="6" />
          <text className="t fg-ink" x="450" y={79 + i * 54} textAnchor="middle">{p}</text>
          <path className="fg-line" d={`M346 132 C 372 132, 372 ${74 + i * 54}, 396 ${74 + i * 54}`} />
        </g>
      ))}
      <path className="fg-acc-s" d="M126 132 H176" strokeWidth="1.5" />
      <path className="fg-acc-s" d="M346 132 C 372 132, 372 128, 396 128" strokeWidth="1.5" />

      <rect className="fg-box" x="176" y="232" width="170" height="56" rx="6" />
      <text className="t fg-ink" x="261" y="254" textAnchor="middle">PostgreSQL</text>
      <text className="t fg-mute" x="261" y="274" textAnchor="middle">durable truth</text>
      <rect className="fg-box fg-dash" x="396" y="232" width="108" height="56" rx="6" />
      <text className="t fg-ink" x="450" y="254" textAnchor="middle">Redis</text>
      <text className="t fg-mute" x="450" y="274" textAnchor="middle">disposable</text>
      <path className="fg-line" d="M261 194 V232" />
      <text className="t fg-faint" x="16" y="278">fail closed</text>
    </Frame>
  );
}

function Redact() {
  return (
    <Frame title="veil — the secret stays local" label="Two views of the same editor line: the local view shows an API key, the stream view shows a solid block; the socket carries only coordinates and a rule id.">
      <text className="t fg-faint" x="16" y="52">LOCAL VIEW</text>
      <rect className="fg-box" x="16" y="60" width="236" height="104" rx="6" />
      <text className="t fg-mute" x="28" y="84">const config = {'{'}</text>
      <text className="t fg-ink" x="40" y="106">apiKey: &quot;sk-live-9fK2…xQ&quot;,</text>
      <text className="t fg-mute" x="40" y="128">region: &quot;eu&quot;,</text>
      <text className="t fg-mute" x="28" y="150">{'}'}</text>

      <text className="t fg-faint" x="268" y="52">STREAM VIEW</text>
      <rect className="fg-box" x="268" y="60" width="236" height="104" rx="6" />
      <text className="t fg-mute" x="280" y="84">const config = {'{'}</text>
      <text className="t fg-ink" x="292" y="106">apiKey: </text>
      <rect className="fg-bar" x="348" y="94" width="144" height="16" rx="2" />
      <text className="t fg-mute" x="292" y="128">region: &quot;eu&quot;,</text>
      <text className="t fg-mute" x="280" y="150">{'}'}</text>

      <path className="fg-acc-s fg-dash" d="M252 102 H268" strokeWidth="1.5" />
      <rect className="fg-box fg-box-acc" x="16" y="184" width="488" height="52" rx="6" />
      <text className="t fg-acc" x="30" y="206">socket</text>
      <text className="t fg-ink" x="30" y="226">{'{ "rule": "api-key", "x": 348, "y": 94, "w": 144, "h": 16 }'}</text>
      <text className="t fg-mute" x="16" y="264">coordinates and rule ids only · never the secret text</text>
      <text className="t fg-faint" x="16" y="286">detect in the editor · OCR only where there is no detector</text>
    </Frame>
  );
}

function Review() {
  const reviewers = [
    ['security', 'model A'],
    ['correctness', 'model B'],
    ['style', 'model C'],
  ];
  return (
    <Frame title="jury-forge — a review team per pull request" label="A GitHub webhook starts a Durable Object that fans a pull request out to several reviewers, each with its own instructions and model, and merges their findings into one review with inline comments.">
      <rect className="fg-box" x="16" y="48" width="132" height="90" rx="6" />
      <text className="t fg-ink" x="28" y="70">PR #128</text>
      <text className="t fg-mute" x="28" y="92">14 files changed</text>
      <text className="t fg-faint" x="28" y="114">webhook →</text>

      <rect className="fg-box fg-box-acc" x="16" y="160" width="132" height="60" rx="6" />
      <text className="t fg-acc" x="28" y="184">Durable Object</text>
      <text className="t fg-mute" x="28" y="204">one run, coordinated</text>

      {reviewers.map(([name, model], i) => (
        <g key={name}>
          <rect className="fg-box" x="212" y={48 + i * 62} width="130" height="50" rx="6" />
          <text className="t fg-ink" x="224" y={70 + i * 62}>{name}</text>
          <text className="t fg-mute" x="224" y={88 + i * 62}>{model}</text>
          <path className="fg-line" d={`M148 93 C 180 93, 180 ${73 + i * 62}, 212 ${73 + i * 62}`} />
          <path className="fg-line" d={`M342 ${73 + i * 62} C 366 ${73 + i * 62}, 366 134, 390 134`} />
        </g>
      ))}

      <rect className="fg-box fg-box-acc" x="390" y="58" width="114" height="150" rx="6" />
      <text className="t fg-acc" x="402" y="80">1 review</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle className="fg-acc" cx="408" cy={106 + i * 30} r="4" />
          <rect className="fg-track" x="420" y={101 + i * 30} width={70 - i * 12} height="8" rx="2" />
        </g>
      ))}
      <text className="t fg-mute" x="16" y="256">keys AES-256-GCM encrypted · master key is a Worker secret</text>
      <text className="t fg-faint" x="16" y="278">your Cloudflare account · no code leaves it</text>
    </Frame>
  );
}

function Inspector() {
  return (
    <Frame title="class-spy — hover to resolve" label="A code editor line with Tailwind utility classes and a hover card that resolves each utility to the CSS declaration it produces.">
      <text className="t fg-faint" x="16" y="54">12</text>
      <text className="t fg-mute" x="40" y="54">{'<div className="'}</text>
      <rect className="fg-sel" x="150" y="40" width="190" height="20" rx="3" />
      <text className="t fg-ink" x="156" y="54">flex items-center gap-2 p-4</text>
      <text className="t fg-mute" x="344" y="54">{'">'}</text>

      <rect className="fg-box fg-box-acc" x="120" y="74" width="300" height="152" rx="8" />
      <text className="t fg-acc" x="136" y="98">resolved · 4 utilities</text>
      {[
        ['flex', 'display: flex'],
        ['items-center', 'align-items: center'],
        ['gap-2', 'gap: 0.5rem'],
        ['p-4', 'padding: 1rem'],
      ].map(([cls, css], i) => (
        <g key={cls}>
          <text className="t fg-ink" x="136" y={124 + i * 24}>{cls}</text>
          <text className="t fg-mute" x="404" y={124 + i * 24} textAnchor="end">{css}</text>
        </g>
      ))}
      <line className="fg-line" x1="0" x2="520" y1="250.5" y2="250.5" />
      <text className="t fg-mute" x="16" y="276">HTML · React · Vue · Svelte · Astro · Angular</text>
      <text className="t fg-faint" x="16" y="298">AST-assisted · maps a utility back to its source</text>
    </Frame>
  );
}

const DRAWN: Partial<Record<SpecimenKind, () => ReactNode>> = {
  monitor: Monitor,
  repos: Repos,
  gateway: Gateway,
  redact: Redact,
  review: Review,
  inspector: Inspector,
};

export function hasFigure(project: Project): boolean {
  return Boolean(project.specimen && DRAWN[project.specimen.kind]);
}

/** A terminal card for projects without a drawn figure: honest, and built from the content itself. */
function StackCard({ project }: { project: Project }) {
  return (
    <div className="figure figure-term" role="img" aria-label={`${project.title}: ${project.stack.join(', ')}`}>
      <div className="figure-term-bar">
        <span>{project.slug}</span>
        <span>{project.status}</span>
      </div>
      <pre>
        <span className="fg-mute">$ </span>
        {'stack --list\n'}
        {project.stack.map((s) => `  ${s}\n`).join('')}
        <span className="fg-mute">$ </span>
        {`status\n  ${project.status}${project.year ? ` · ${project.year}` : ''}\n`}
        <span className="fg-mute">$ </span>
        <span className="caret">▌</span>
      </pre>
    </div>
  );
}

export function CaseFigure({ project }: { project: Project }) {
  const Drawn = project.specimen ? DRAWN[project.specimen.kind] : undefined;
  return Drawn ? <Drawn /> : <StackCard project={project} />;
}
