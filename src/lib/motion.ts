import { useEffect, useState, type RefObject } from 'react';

/** Live `prefers-reduced-motion`. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Fade `.reveal` elements in as they scroll into view. Without JS the CSS never hides them. */
export function useReveal(key: string) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [key]);
}

/** The id of the element whose top has most recently crossed `line` (a fraction of the viewport). */
export function useActiveId(ids: readonly string[], enabled = true, line = 0.4): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');
  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.innerHeight * line;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= y) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
    // `key` stands in for `ids`, which callers rebuild on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, line]);
  return active;
}

/** Whether an element is on screen; used to pause idle animation when nobody can see it. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** Wall-clock time in a time zone, refreshed on the minute. */
export function useZonedClock(timeZone: string): string {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  const [now, setNow] = useState(format);
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setNow(format());
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);
  return now;
}
