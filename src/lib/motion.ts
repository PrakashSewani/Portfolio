import { useEffect, useState, type RefObject } from 'react';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Full-screen scenes that stack as you scroll. Each `.case` is sticky; a `.scene-anchor` sits in the
 * flow just before it, so its position says how far the scene has travelled even once it is stuck.
 *
 * Per scene, from the scroll position alone (nothing is time-based, so it is as smooth as the scroll):
 * `--in`  0 → 1 as the scene rises from the bottom of the screen into place,
 * `--out` 0 → 1 as the next scene slides over it,
 * `--lit` 0 → 1 as its rule lights up, word by word, while it holds.
 * Without JS the stylesheet defaults are the finished frame.
 */
export function useScenes(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const scenes = [...root.querySelectorAll<HTMLElement>('.case')];
    const anchors = [...root.querySelectorAll<HTMLElement>('.scene-anchor')];
    const last = scenes.length - 1;
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 56;
      const span = Math.max(1, vh - bar);
      scenes.forEach((scene, i) => {
        const top = anchors[i]?.getBoundingClientRect().top ?? vh;
        if (top > vh + 50 || top < bar - span * 2) return; // far away: leave it as it was
        const t = (vh - top) / span; // 0 entering, 1 in place, 2 fully covered
        scene.style.setProperty('--in', clamp(t, 0, 1).toFixed(3));
        // Nothing slides over the last scene; it simply scrolls away with the section.
        scene.style.setProperty('--out', i < last ? clamp(t - 1, 0, 1).toFixed(3) : '0');
        scene.style.setProperty('--lit', clamp((t - 0.55) / 0.6, 0, 1).toFixed(3));
      });
    };
    // A first pass for everything, so scenes far away start from the right state.
    const prime = () => {
      const vh = window.innerHeight;
      scenes.forEach((scene, i) => {
        const top = anchors[i]?.getBoundingClientRect().top ?? vh;
        const past = top < vh / 2;
        scene.style.setProperty('--in', past ? '1' : '0');
        scene.style.setProperty('--out', past && i < last ? '1' : '0');
        scene.style.setProperty('--lit', past ? '1' : '0');
      });
      update();
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    prime();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);
}

/**
 * `--lit` on an element, 0 → 1 as its top climbs from `from` to `to` (fractions of the viewport
 * height), for LitText inside it. Once it is past, it stays lit.
 */
export function useLit(ref: RefObject<HTMLElement | null>, from = 0.9, to = 0.42) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const lit = clamp((from * vh - el.getBoundingClientRect().top) / ((from - to) * vh), 0, 1);
      el.style.setProperty('--lit', lit.toFixed(3));
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
  }, [ref, from, to]);
}

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
