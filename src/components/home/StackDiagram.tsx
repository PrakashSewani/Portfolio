import { useRef, useState, type ReactNode } from 'react';
import { LAYERS, type Layer } from '../../data/layers';
import { projectsInLayer } from '../../data/projects';
import type { LayerId } from '../../lib/projects';
import { useInView } from '../../lib/motion';
import { navigate } from '../../lib/router';

/**
 * The hero's cross-section: five planes in a flattened isometric view, Machine at the bottom,
 * Interface on top, a vertical bus through their centres. Each plane is drawn flat in a 220 × 220
 * space and placed with one matrix, so the glyphs sit on the plane rather than floating over it.
 *
 * The SVG is decorative. The five callout buttons beside it are the real control: they carry the
 * names, the tech and the project counts, and hovering or focusing one lifts its plane.
 */

const S = 220; // flat plane size
const KX = 0.95; // screen x per unit of u (and −v)
const KY = 0.3; // screen y per unit of u (and v)
const CX = 228;
const STEP = 86;
const TOP = 22;
const W = 460;
const SPREAD = 16; // extra gap per plane once the hero has scrolled away
const H = TOP + (LAYERS.length - 1) * STEP + 2 * S * KY + 18;

const planeTop = (i: number) => TOP + (LAYERS.length - 1 - i) * STEP;
/** Screen y of plane i's centre: where the bus pierces it and where its callout points. */
export const planeCentreY = (i: number) => planeTop(i) + S * KY;
const matrix = (i: number) => `matrix(${KX} ${KY} ${-KX} ${KY} ${CX} ${planeTop(i)})`;

/** One glyph per layer, drawn in flat plane coordinates (0…220). Abstract, not literal. */
const GLYPHS: Record<LayerId, ReactNode> = {
  machine: (
    <g>
      <rect className="g-line" x="78" y="78" width="74" height="74" />
      <rect className="g-hot" x="100" y="100" width="30" height="30" />
      {[0, 1, 2, 3].map((k) => (
        <g key={k}>
          <path className="g-line" d={`M${88 + k * 18} 78V62M${88 + k * 18} 152V168M78 ${88 + k * 18}H62M152 ${88 + k * 18}H168`} />
        </g>
      ))}
      {Array.from({ length: 8 }, (_, k) => (
        <rect key={k} className={k === 2 || k === 5 ? 'g-hot' : 'g-line'} x={34 + k * 20} y="188" width="14" height="14" />
      ))}
    </g>
  ),
  infrastructure: (
    <g>
      {[0, 1, 2].flatMap((c) =>
        [0, 1].map((r) => (
          <g key={`${c}-${r}`}>
            <rect className={c === 1 && r === 1 ? 'g-hot' : 'g-line'} x={44 + c * 56} y={112 + r * 44} width="44" height="32" />
            <path className="g-faint" d={`M${50 + c * 56} ${122 + r * 44}h20M${50 + c * 56} ${130 + r * 44}h14`} />
          </g>
        )),
      )}
      <path className="g-line" d="M40 96H200" />
    </g>
  ),
  software: (
    <g>
      <path className="g-line" d="M64 150L118 104L172 146L120 186L64 150M118 104L120 186M172 146L184 198M120 186L66 196" />
      {[
        [64, 150],
        [118, 104],
        [172, 146],
        [120, 186],
        [184, 198],
        [66, 196],
      ].map(([u, v], k) => (
        <circle key={k} className={k === 1 ? 'g-hot' : 'g-node'} cx={u} cy={v} r="7" />
      ))}
    </g>
  ),
  intelligence: (
    <g>
      {(() => {
        const cols = [
          [60, [96, 140, 184]],
          [120, [80, 120, 160, 200]],
          [180, [116, 164]],
        ] as const;
        const lines: ReactNode[] = [];
        for (let c = 0; c < cols.length - 1; c += 1) {
          const [u1, vs1] = cols[c];
          const [u2, vs2] = cols[c + 1];
          for (const v1 of vs1) for (const v2 of vs2) lines.push(<path key={`${c}-${v1}-${v2}`} className="g-faint" d={`M${u1} ${v1}L${u2} ${v2}`} />);
        }
        const nodes = cols.flatMap(([u, vs], c) =>
          vs.map((v, k) => <circle key={`n-${c}-${k}`} className={c === 1 && k === 2 ? 'g-hot' : 'g-node'} cx={u} cy={v} r="6" />),
        );
        return [...lines, ...nodes];
      })()}
    </g>
  ),
  interface: (
    <g>
      <rect className="g-line" x="42" y="62" width="136" height="104" />
      <path className="g-line" d="M42 80H178" />
      <path className="g-faint" d="M56 98h70M56 112h96M56 126h54" />
      <rect className="g-fill" x="92" y="118" width="116" height="88" />
      <rect className="g-line" x="92" y="118" width="116" height="88" />
      <path className="g-line" d="M92 134H208" />
      <rect className="g-hot" x="104" y="148" width="40" height="12" />
      <path className="g-faint" d="M104 172h84M104 186h60" />
    </g>
  ),
};

const PATTERN: Record<LayerId, string> = {
  machine: 'url(#pat-hatch)',
  infrastructure: 'url(#pat-grid)',
  software: 'url(#pat-dots)',
  intelligence: 'url(#pat-cross)',
  interface: 'url(#pat-lines)',
};

function Callout({ layer, index, count, active, onHover }: { layer: Layer; index: number; count: number; active: boolean; onHover: (id: LayerId | null) => void }) {
  return (
    <li className="stack-callout" style={{ top: `${(planeCentreY(index) / H) * 100}%`, ['--i' as string]: index }}>
      <button
        type="button"
        className={active ? 'sc-btn is-active' : 'sc-btn'}
        onMouseEnter={() => onHover(layer.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(layer.id)}
        onBlur={() => onHover(null)}
        onClick={() => {
          // On a touch screen there is no hover, so lift the plane first and let it be seen.
          const touch = window.matchMedia('(hover: none)').matches;
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!touch || reduced) return navigate(`#layer-${layer.id}`);
          onHover(layer.id);
          window.setTimeout(() => {
            navigate(`#layer-${layer.id}`);
            // Touch never sends a mouseleave; drop the lift so the stack is whole when you come back.
            onHover(null);
          }, 280);
        }}
        aria-describedby={`sc-meta-${layer.id}`}
      >
        <span className="sc-lead" aria-hidden="true" />
        <span className="sc-text">
          <span className="sc-head">
            <span className="sc-n">{layer.n}</span>
            <span className="sc-name">{layer.name}</span>
            <span className="sc-pip" aria-hidden="true" />
          </span>
          <span className="sc-meta" id={`sc-meta-${layer.id}`}>
            {count} project{count === 1 ? '' : 's'}
          </span>
        </span>
      </button>
    </li>
  );
}

export default function StackDiagram({ boot }: { boot: boolean }) {
  const [hover, setHover] = useState<LayerId | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const hoverIndex = hover ? LAYERS.findIndex((l) => l.id === hover) : -1;

  return (
    <div
      ref={ref}
      className={['stack', boot ? 'is-booting' : '', hover ? 'has-hover' : '', visible ? 'is-visible' : ''].filter(Boolean).join(' ')}
    >
      <svg className="stack-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <defs>
          <pattern id="pat-hatch" width="9" height="9" patternUnits="userSpaceOnUse">
            <path className="pat" d="M0 9L9 0" />
          </pattern>
          <pattern id="pat-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path className="pat" d="M22 0V22M0 22H22" />
          </pattern>
          <pattern id="pat-dots" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle className="pat-dot" cx="5.5" cy="5.5" r="0.9" />
          </pattern>
          <pattern id="pat-cross" width="20" height="20" patternUnits="userSpaceOnUse">
            <path className="pat" d="M10 7V13M7 10H13" />
          </pattern>
          <pattern id="pat-lines" width="10" height="10" patternUnits="userSpaceOnUse">
            <path className="pat" d="M0 10H10" />
          </pattern>
        </defs>

        {LAYERS.map((layer, i) => {
          const y = planeCentreY(i);
          const next = i < LAYERS.length - 1 ? planeCentreY(i + 1) : null;
          const lifted = hoverIndex === i;
          // As the hero scrolls away the planes drift apart from the middle one (see .plane-spread).
          const spread = { ['--spread' as string]: `${-(i - 2) * SPREAD}px` };
          return (
            <g key={layer.id}>
              <g className={lifted ? 'plane is-lifted' : 'plane'} style={{ ['--i' as string]: i }} data-layer={layer.id}>
                <g className="plane-spread" style={spread}>
                  <g className="plane-boot">
                    <g transform={matrix(i)}>
                      <rect className="plane-fill" width={S} height={S} />
                      <rect className="plane-pattern" width={S} height={S} fill={PATTERN[layer.id]} />
                      <g className="plane-glyph">{GLYPHS[layer.id]}</g>
                      <rect className="plane-edge" width={S} height={S} pathLength={1} />
                    </g>
                    <path className="plane-stub" d={`M${CX + S * KX} ${y}H${W}`} />
                    <ellipse className="plane-via" cx={CX} cy={y} rx={12} ry={4} />
                  </g>
                </g>
              </g>
              {next !== null && (
                <g className="bus-spread" style={{ ['--spread' as string]: `${-(i - 1.5) * SPREAD}px`, ['--stretch' as string]: (STEP + SPREAD) / STEP }}>
                  <path className="bus" style={{ ['--i' as string]: i }} d={`M${CX} ${y}V${next}`} />
                </g>
              )}
            </g>
          );
        })}
        <g className="pulse">
          <rect x={CX - 2} y={planeCentreY(0) - 7} width="4" height="14" rx="2" style={{ ['--travel' as string]: `${planeCentreY(LAYERS.length - 1) - planeCentreY(0)}px` }} />
        </g>
      </svg>

      <ol className="stack-callouts" aria-label="The five layers, top to bottom">
        {[...LAYERS.keys()].reverse().map((i) => (
          <Callout key={LAYERS[i].id} layer={LAYERS[i]} index={i} count={projectsInLayer(LAYERS[i].id).length} active={hover === LAYERS[i].id} onHover={setHover} />
        ))}
      </ol>
    </div>
  );
}
