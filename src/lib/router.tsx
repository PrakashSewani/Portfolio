/**
 * A ~1 KB history router. No react-router dependency; the host already answers every
 * unknown path with the app shell, so real path routes work without a hash fallback.
 *
 *   useRoute()             → the current pathname ('/', '/projects', '/projects/class-spy')
 *   navigate(to)           → pushState + re-render + scroll to top
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

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const target = to.startsWith('/') ? to : `/${to}`;
  if (target === window.location.pathname) return;
  if (options.replace) window.history.replaceState(null, '', target);
  else window.history.pushState(null, '', target);
  emit();
  window.scrollTo({ top: 0, behavior: 'auto' });
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
 * The slug for `/projects/<slug>`, else null. Decoding is guarded: a malformed percent-escape in
 * the pathname must not throw a URIError during render (the component would take the page down and
 * App has no error boundary). The raw segment is returned so the case page renders its honest
 * "no such project" state instead.
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

export function isProjectsPath(path: string): boolean {
  return path === '/projects' || path.startsWith('/projects/');
}
