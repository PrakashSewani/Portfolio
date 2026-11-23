import { LAYERS } from '../data/layers';
import type { LayerId } from '../lib/projects';

/**
 * The mark: five planes stacked in a flattened isometric view, Machine at the bottom, Interface on
 * top. Lit planes are the layers a project works in. It is the logo, the favicon, the depth gauge
 * and the tag on every project, so it has to read at 16 px.
 */
interface Props {
  /** Which planes are lit. 'all' lights every plane; an empty array lights none. */
  lit?: readonly LayerId[] | 'all';
  size?: number;
  /** Accessible name. Without one the mark is decorative. */
  label?: string;
  className?: string;
}

// 40 × 40 box; each plane is a rhombus with half-width HW and half-height HH, stepped STEP apart.
const CX = 20;
const HW = 17;
const HH = 6.2;
const STEP = 5.6;
const TOP = 3.2;

/** The rhombus for plane i, where i = 0 is the bottom (Machine). */
export function planePath(i: number): string {
  const y = TOP + (LAYERS.length - 1 - i) * STEP;
  const r = (n: number) => Math.round(n * 100) / 100;
  return `M${CX} ${r(y)}L${CX + HW} ${r(y + HH)}L${CX} ${r(y + 2 * HH)}L${CX - HW} ${r(y + HH)}Z`;
}

export default function LayerMark({ lit = 'all', size = 24, label, className }: Props) {
  const isLit = (id: LayerId) => lit === 'all' || lit.includes(id);
  return (
    <svg
      className={['mark', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {LAYERS.map((layer, i) => (
        <path key={layer.id} d={planePath(i)} className={isLit(layer.id) ? 'mark-plane is-lit' : 'mark-plane'} data-layer={layer.id} />
      ))}
    </svg>
  );
}

/** "Machine · Software" for a project's layers, primary first. */
export function layerNames(ids: readonly LayerId[]): string {
  return ids.map((id) => LAYERS.find((l) => l.id === id)?.name ?? id).join(' · ');
}
