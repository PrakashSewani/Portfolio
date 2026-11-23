import { useEffect, useRef } from 'react';
import {
  CHANNELS,
  DOWN_S,
  SAMPLE_RATE,
  SYNC_S,
  CYCLE_S,
  deliveredAt,
  inOutage,
  isDelivered,
  linkAt,
  sample,
  statsAt,
  type LinkState,
} from '../lib/telemetry';
import { onThemeChange } from '../lib/theme';

/** Seconds of signal on screen. */
const WINDOW_S = 7;
/** Start one cycle in, so the first frame is a full window of healthy, already-recovered signal. */
const T0 = CYCLE_S + 2;
/** The frame shown under prefers-reduced-motion: mid-outage, so the story is visible without motion. */
const STATIC_T = 10.2;
/** How long a back-filled sample stays highlighted after it lands. */
const FRESH_S = 2.2;

interface Colors {
  trace: string;
  fresh: string;
  bad: string;
  grid: string;
  muted: string;
}

function readColors(el: HTMLElement): Colors {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    trace: get('--trace', '#f5a524'),
    fresh: get('--ok', '#5ec27f'),
    bad: get('--bad', '#ff7a6b'),
    grid: get('--grid', 'rgba(255,255,255,.07)'),
    muted: get('--muted', '#a09d95'),
  };
}

function hatchPattern(ctx: CanvasRenderingContext2D, color: string): CanvasPattern | null {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 8;
  const t = tile.getContext('2d');
  if (!t) return null;
  t.strokeStyle = color;
  t.globalAlpha = 0.35;
  t.lineWidth = 1;
  t.beginPath();
  t.moveTo(0, 8);
  t.lineTo(8, 0);
  t.moveTo(-2, 2);
  t.lineTo(2, -2);
  t.moveTo(6, 10);
  t.lineTo(10, 6);
  t.stroke();
  return ctx.createPattern(tile, 'repeat');
}

const STATE_COPY: Record<LinkState, { chip: string; detail: (buffered: number) => string }> = {
  live: { chip: 'LINK LIVE', detail: () => `streaming at ${SAMPLE_RATE} Hz` },
  down: { chip: 'LINK LOST', detail: (n) => `sensor buffering · ${n.toLocaleString()} samples held` },
  sync: { chip: 'RECONNECTED', detail: (n) => `back-filling from the sensor · ${n.toLocaleString()} left` },
};

export default function TelemetryPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const detailRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const takenRef = useRef<HTMLElement>(null);
  const bufferedRef = useRef<HTMLElement>(null);
  const lostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    if (!canvas || !panel) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let colors = readColors(canvas);
    let hatch = hatchPattern(ctx, colors.bad);
    let raf = 0;
    let visible = true;
    let elapsed = 0;
    let last = 0;
    let hudAt = -1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t0 = now - WINDOW_S;
      const rows = CHANNELS.length;
      const rowH = h / rows;
      const xOf = (t: number) => ((t - t0) / WINDOW_S) * w;

      // Grid: one tick per second, a dashed centreline and a rule between channels.
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      for (let s = Math.ceil(t0); s <= now; s += 1) {
        const x = Math.round(xOf(s)) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let r = 1; r < rows; r += 1) {
        const y = Math.round(r * rowH) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Sample bookkeeping shared by every channel, so the gap is drawn once and traces agree.
      const i0 = Math.max(0, Math.floor(t0 * SAMPLE_RATE));
      const i1 = Math.floor(now * SAMPLE_RATE);
      const count = i1 - i0 + 1;
      const xs = new Float32Array(count);
      const ok = new Uint8Array(count); // 0 = missing, 1 = normal, 2 = freshly back-filled
      let gapStart = -1;
      const gaps: Array<[number, number]> = [];
      for (let k = 0; k < count; k += 1) {
        const ts = (i0 + k) / SAMPLE_RATE;
        xs[k] = xOf(ts);
        if (isDelivered(ts, now)) {
          ok[k] = inOutage(ts) && now - deliveredAt(ts) < FRESH_S ? 2 : 1;
          if (gapStart >= 0) {
            gaps.push([gapStart, xs[k]]);
            gapStart = -1;
          }
        } else if (inOutage(ts)) {
          if (gapStart < 0) gapStart = xs[k];
        }
      }
      if (gapStart >= 0) gaps.push([gapStart, w]);

      for (const [a, b] of gaps) {
        ctx.fillStyle = hatch ?? colors.bad;
        ctx.fillRect(a, 0, b - a, h);
        ctx.strokeStyle = colors.bad;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(a + 0.5, 0);
        ctx.lineTo(a + 0.5, h);
        ctx.stroke();
        ctx.setLineDash([]);
        if (b - a > 150) {
          ctx.fillStyle = colors.bad;
          ctx.font = '500 10px "JetBrains Mono Variable", ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('NO SIGNAL · SENSOR IS BUFFERING', (a + b) / 2, h / 2 + 3);
        }
      }

      // Traces.
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < rows; r += 1) {
        const id = CHANNELS[r].id;
        const mid = r * rowH + rowH / 2;
        const amp = rowH / 2 - 12;
        const normal = new Path2D();
        const fresh = new Path2D();
        let prevTarget: Path2D | null = null;
        let px = 0;
        let py = 0;
        let lx = 0;
        let ly = 0;
        for (let k = 0; k < count; k += 1) {
          if (!ok[k]) {
            prevTarget = null;
            continue;
          }
          const x = xs[k];
          const y = mid - sample(id, i0 + k) * amp;
          const target = ok[k] === 2 ? fresh : normal;
          if (prevTarget === target) {
            target.lineTo(x, y);
          } else {
            if (prevTarget) target.moveTo(px, py);
            else target.moveTo(x, y);
            if (prevTarget) target.lineTo(x, y);
          }
          prevTarget = target;
          px = x;
          py = y;
          lx = x;
          ly = y;
        }
        ctx.strokeStyle = colors.trace;
        ctx.stroke(normal);
        ctx.strokeStyle = colors.fresh;
        ctx.stroke(fresh);
        if (prevTarget) {
          ctx.fillStyle = prevTarget === fresh ? colors.fresh : colors.trace;
          ctx.beginPath();
          ctx.arc(lx, ly, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = colors.muted;
        ctx.font = '500 10px "JetBrains Mono Variable", ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${CHANNELS[r].label} ${CHANNELS[r].unit}`, 12, r * rowH + 15);
      }
    };

    const updateHud = (now: number) => {
      const phase = linkAt(now);
      const stats = statsAt(now);
      const copy = STATE_COPY[phase.state];
      if (panel.dataset.state !== phase.state) panel.dataset.state = phase.state;
      if (chipRef.current) chipRef.current.textContent = copy.chip;
      if (detailRef.current) detailRef.current.textContent = copy.detail(stats.buffered);
      if (takenRef.current) takenRef.current.textContent = stats.delivered.toLocaleString();
      if (bufferedRef.current) bufferedRef.current.textContent = stats.buffered.toLocaleString();
      if (lostRef.current) lostRef.current.textContent = stats.lost.toLocaleString();
    };

    const frame = (time: number) => {
      raf = 0;
      if (!visible) return;
      const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;
      elapsed += dt;
      const now = T0 + elapsed;
      draw(now);
      if (now - hudAt > 0.1) {
        hudAt = now;
        updateHud(now);
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduced || raf || !visible) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduced) {
      draw(STATIC_T);
      updateHud(STATIC_T);
    } else {
      start();
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(STATIC_T);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible) start();
    });
    io.observe(panel);

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const offTheme = onThemeChange(() => {
      requestAnimationFrame(() => {
        colors = readColors(canvas);
        hatch = hatchPattern(ctx, colors.bad);
        if (reduced) draw(STATIC_T);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      offTheme();
    };
  }, []);

  return (
    <div className="telemetry" ref={panelRef} data-state="live">
      <div className="telemetry-head">
        <span className="chip" role="status">
          <i className="dot" aria-hidden="true" />
          <span ref={chipRef}>LINK LIVE</span>
        </span>
        <span className="telemetry-detail" ref={detailRef}>
          streaming at {SAMPLE_RATE} Hz
        </span>
        <span className="telemetry-tag">simulated feed · replay-safe</span>
      </div>
      <canvas
        ref={canvasRef}
        className="telemetry-canvas"
        role="img"
        aria-label="Simulated live telemetry on four channels. The link drops every few seconds, the sensor keeps buffering, and when the link returns the gap is back-filled with no samples lost."
      />
      <dl className="telemetry-stats" aria-hidden="true">
        <div>
          <dt>On screen</dt>
          <dd>
            <b ref={takenRef}>0</b> samples/ch
          </dd>
        </div>
        <div>
          <dt>Held at sensor</dt>
          <dd>
            <b ref={bufferedRef}>0</b>
          </dd>
        </div>
        <div>
          <dt>Lost</dt>
          <dd>
            <b ref={lostRef}>0</b>
          </dd>
        </div>
        <div>
          <dt>Outage / back-fill</dt>
          <dd>
            <b>
              {DOWN_S}s / {SYNC_S}s
            </b>
          </dd>
        </div>
      </dl>
    </div>
  );
}
