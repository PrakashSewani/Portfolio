import { useEffect } from 'react';

export const ORIGIN = 'https://prakashsewani.com';
export const SITE_TITLE = 'Prakash Sewani — Software engineer, every layer of the system';

/**
 * Keep the document head in step with client-side routes: title, description, canonical, Open
 * Graph and robots. The prerendered HTML already carries the right tags for a cold load; this covers
 * navigation inside the app.
 */
export function useDocumentMeta({
  title,
  description,
  path = window.location.pathname,
  noindex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}) {
  useEffect(() => {
    const set = (selector: string, attr: string, value: string) => document.querySelector(selector)?.setAttribute(attr, value);
    const url = `${ORIGIN}${path === '/' ? '/' : path}`;
    document.title = title;
    set('meta[property="og:title"]', 'content', title);
    set('meta[name="twitter:title"]', 'content', title);
    if (description) {
      set('meta[name="description"]', 'content', description);
      set('meta[property="og:description"]', 'content', description);
      set('meta[name="twitter:description"]', 'content', description);
    }
    set('meta[property="og:url"]', 'content', url);
    set('link[rel="canonical"]', 'href', url);

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex';
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, path, noindex]);
}
