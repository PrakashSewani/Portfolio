/**
 * The cold-start readout: how long this page actually took to come up in the visitor's browser,
 * read from the Navigation Timing and Paint Timing APIs. Nothing here is simulated; when the browser
 * does not report a value, the readout says so instead of inventing one.
 *
 * Pure functions, so the maths is unit-tested without a browser (tests/boot.test.mjs).
 */

/** The fields of a PerformanceNavigationTiming entry this readout uses (all ms from time origin). */
export interface NavTiming {
  responseStart?: number;
  domContentLoadedEventEnd?: number;
  loadEventEnd?: number;
}

export interface PaintTiming {
  name: string;
  startTime: number;
}

export interface BootStep {
  id: 'response' | 'paint' | 'dom' | 'interactive';
  label: string;
  /** Milliseconds from navigation start, or null when the browser has not reported it. */
  ms: number | null;
}

const positive = (value: number | undefined | null): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

/** The four steps, in the order a page comes up. */
export function bootSteps(nav: NavTiming | undefined, paints: readonly PaintTiming[], interactiveAt: number | null): BootStep[] {
  const fcp = paints.find((p) => p.name === 'first-contentful-paint') ?? paints.find((p) => p.name === 'first-paint');
  return [
    { id: 'response', label: 'Server response', ms: positive(nav?.responseStart) },
    { id: 'paint', label: 'First paint', ms: positive(fcp?.startTime) },
    { id: 'dom', label: 'DOM ready', ms: positive(nav?.domContentLoadedEventEnd) },
    { id: 'interactive', label: 'Interactive', ms: positive(interactiveAt) },
  ];
}

/** "84 ms", "1.24 s", or "—" when there is nothing honest to show. */
export function formatMs(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
}

/** The time the app became interactive, recorded once by the first effect that runs. */
let interactiveAt: number | null = null;
export function markInteractive(now: number) {
  if (interactiveAt === null) interactiveAt = now;
}
export function getInteractiveAt(): number | null {
  return interactiveAt;
}
