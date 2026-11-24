import { useEffect, useState } from 'react';
import { bootSteps, formatMs, getInteractiveAt, type BootStep, type NavTiming, type PaintTiming } from '../../lib/boot';

/**
 * The cold-start strip under the hero: this page's own load, measured by the visitor's browser.
 * Values arrive as the browser reports them (paint timing can land after first render); anything
 * the browser does not report stays an em dash.
 */
export default function BootReadout() {
  const [steps, setSteps] = useState<BootStep[]>(() => bootSteps(undefined, [], null));

  useEffect(() => {
    if (typeof performance === 'undefined') return;
    const nav = performance.getEntriesByType?.('navigation')[0] as (PerformanceEntry & NavTiming) | undefined;
    let paints: PaintTiming[] = (performance.getEntriesByType?.('paint') ?? []).map((p) => ({ name: p.name, startTime: p.startTime }));
    const update = () => setSteps(bootSteps(nav, paints, getInteractiveAt()));
    update();

    let observer: PerformanceObserver | undefined;
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        observer = new PerformanceObserver((list) => {
          paints = [...paints, ...list.getEntries().map((p) => ({ name: p.name, startTime: p.startTime }))];
          update();
        });
        observer.observe({ type: 'paint', buffered: true });
      } catch {
        observer = undefined;
      }
    }
    // DOMContentLoaded can finish after the first effect on a slow device; read once more after load.
    const onLoad = () => window.setTimeout(update, 0);
    if (document.readyState !== 'complete') window.addEventListener('load', onLoad, { once: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <section className="boot" aria-labelledby="boot-title">
      <div className="boot-head">
        <h2 id="boot-title" className="label">
          Page load
        </h2>
        <p className="boot-note">How long this page took to load for you, measured by your browser.</p>
      </div>
      <dl className="boot-steps">
        {steps.map((step, i) => (
          <div key={step.id} className={step.ms === null ? 'boot-step' : 'boot-step is-known'} style={{ ['--i' as string]: i }}>
            <dt>{step.label}</dt>
            <dd>{formatMs(step.ms)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
