/**
 * A ~1 KB history router. The host answers every unknown path with the app shell, so real path
 * routes work without a hash fallback; `#section` fragments are handled here too, because the
 * browser's own fragment scroll runs before the page has rendered.
 *
 *   useRoute()             → the current pathname ('/', '/projects/rstats')
 *   navigate(to)           → pushState + re-render + scroll to the fragment (or the top)
 *   useLinkInterception()  → turns <a href="/…" data-link> into a client-side navigation
 *   matchProjectRoute(p)   → the slug for /projects/<slug>, else null
 */
import { useEffect, useState } from 'react';

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
  if (full !== `${window.location.pathname}${window.location.hash}`) {
    if (options.replace) window.history.replaceState(null, '', full);
    else window.history.pushState(null, '', full);
    emit();
  }
  scrollToHash(hash);
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
    const onPopState = () => emit();
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);
}

/**
 * The slug for `/projects/<slug>`, else null. Decoding is guarded: a malformed percent-escape must
 * not throw during render; the raw segment is returned so the case page shows "no such project".
 */
export function matchProjectRoute(path: string): string | null {
  const match = path.match(/^\/projects\/([^/]+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
