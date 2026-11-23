/**
 * A ~1 KB history router. The host answers every unknown path with the app shell, so real path
 * routes work without a hash fallback; `#section` fragments are handled here too, because the
 * browser's own fragment scroll runs before the page has rendered.
 *
 *   useRoute()             → the current pathname ('/', '/projects/rstats')
 *   navigate(to)           → pushState + re-render + scroll, inside a view transition when supported
 *   useLinkInterception()  → turns <a href="/…" data-link> into a client-side navigation
 *   matchRoute(p)          → { kind: 'home' | 'index' | 'case' | 'missing', slug? }
 */
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const listeners = new Set<() => void>();

function readPath(): string {
  const raw = window.location.pathname.replace(/\/+$/, '');
  return raw === '' ? '/' : raw;
}

function emit() {
  for (const listener of listeners) listener();
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/** Run a DOM-changing update inside a view transition when the browser has them and motion is welcome. */
function withTransition(update: () => void): Promise<void> {
  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return Promise.resolve();
  }
  return doc.startViewTransition(update).finished.catch(() => undefined);
}

/** Scroll to `#id` (or the top) once React has committed the route. */
export function scrollToHash(hash: string, smooth = true) {
  const run = () => {
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  window.requestAnimationFrame(() => window.requestAnimationFrame(run));
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const hashAt = to.indexOf('#');
  const hash = hashAt === -1 ? '' : to.slice(hashAt + 1);
  const pathPart = hashAt === -1 ? to : to.slice(0, hashAt);
  const target = pathPart === '' ? window.location.pathname : pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  const full = hash ? `${target}#${hash}` : target;
  const samePage = target.replace(/\/+$/, '') === window.location.pathname.replace(/\/+$/, '');

  if (samePage) {
    // An in-page jump: no re-render, no transition, just history and scroll.
    if (full !== `${window.location.pathname}${window.location.hash}`) {
      if (options.replace) window.history.replaceState(null, '', full);
      else window.history.pushState(null, '', full);
    }
    scrollToHash(hash);
    return;
  }

  void withTransition(() => {
    if (options.replace) window.history.replaceState(null, '', full);
    else window.history.pushState(null, '', full);
    flushSync(emit);
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }).then(() => {
    if (hash) scrollToHash(hash);
  });
}

export function useRoute(): string {
  const [path, setPath] = useState(readPath);
  useEffect(() => {
    const listener = () => setPath(readPath());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return path;
}

/** Client-side navigation for internal links; modified clicks and external links pass through. */
export function useLinkInterception() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[data-link]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      if (!href.startsWith('/') || anchor.target === '_blank') return;
      event.preventDefault();
      navigate(href);
    };
    // Render synchronously so the browser's own scroll restoration lands on the new content.
    const onPopState = () => flushSync(emit);
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);
}

export type Route = { kind: 'home' } | { kind: 'index' } | { kind: 'case'; slug: string } | { kind: 'missing' };

/**
 * Decoding is guarded: a malformed percent-escape must not throw during render; the raw segment is
 * returned so the case page shows "no such project".
 */
export function matchRoute(path: string): Route {
  if (path === '/') return { kind: 'home' };
  if (path === '/projects') return { kind: 'index' };
  const match = path.match(/^\/projects\/([^/]+)$/);
  if (!match) return { kind: 'missing' };
  try {
    return { kind: 'case', slug: decodeURIComponent(match[1]) };
  } catch {
    return { kind: 'case', slug: match[1] };
  }
}
