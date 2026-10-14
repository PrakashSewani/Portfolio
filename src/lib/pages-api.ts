/**
 * The `/projects` content API, as plain functions.
 *
 * Portable across both Cloudflare runtimes — Pages Functions (what this site actually is) and a
 * Worker — and callable directly from `node --test` with a fake KV, so the route behaviour is
 * tested without a deploy or a network.
 *
 * KV layout (written by scripts/publish-projects.mjs):
 *   index            → { generatedAt, count, projects: LedgerRow[] }   (the ledger, one read)
 *   project:<slug>   → a full Project
 *
 * The three Pages Functions in `functions/` are thin adapters over these exports.
 */
import { SLUG_RE, validateLedgerList, validateProject, type LedgerRow, type Project } from './projects.js';

export interface KVNamespaceLike {
  get(key: string, type?: 'text'): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface ApiEnv {
  PROJECTS?: KVNamespaceLike;
  /** Provided by Pages: reads a static asset (used to fetch the app shell). */
  ASSETS?: { fetch(request: Request): Promise<Response> };
}

interface IndexPayload {
  generatedAt?: string;
  count?: number;
  projects: LedgerRow[];
}

const CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=600';
const SITE = 'https://prakashsewani.com';
const SITE_NAME = 'Prakash Sewani';
export const HTML_TYPE = 'text/html; charset=utf-8';
const JSON_TYPE = 'application/json; charset=utf-8';

function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) headers.set('content-type', JSON_TYPE);
  return new Response(JSON.stringify(body), { ...init, headers });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** XML text escaping — same shape as `escapeHtml`, for the sitemap. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function digest(text: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text)));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * RFC 9110 `If-None-Match` for a GET: weak comparison, a comma-separated list, and `*`. A CDN or a
 * revalidating proxy sends the weak form and lists after a revalidate, so exact string equality
 * would deny those clients the 304 this route is supposed to give them.
 */
function matchesIfNoneMatch(request: Request, etag: string): boolean {
  const header = request.headers.get('if-none-match');
  if (!header) return false;
  const weak = (tag: string) => tag.trim().replace(/^W\//, '');
  const candidates = header.split(',').map(weak);
  if (candidates.includes('*')) return true;
  return candidates.includes(weak(etag));
}

/** 200 with an ETag + the shared cache policy, or 304 when the client already has it. */
async function cachedBody(
  request: Request,
  body: string,
  contentType: string,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const etag = `"${await digest(body)}"`;
  const headers = new Headers({ 'content-type': contentType, 'cache-control': CACHE_CONTROL, etag, ...extraHeaders });
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers });
}

function isProjectRow(value: unknown): value is LedgerRow {
  return typeof value === 'object' && value !== null && typeof (value as LedgerRow).slug === 'string';
}

/** Read + shape the KV index. Null when KV is unbound or nothing has been published yet. */
async function readIndex(env: ApiEnv): Promise<IndexPayload | null> {
  const raw = await env.PROJECTS?.get('index', 'text');
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return null;
  const rows = (parsed as { projects?: unknown }).projects;
  if (!Array.isArray(rows)) return null;
  const projects = validateLedgerList(rows, 'index');
  return {
    generatedAt: (parsed as IndexPayload).generatedAt,
    count: projects.length,
    projects,
  };
}

async function readProject(env: ApiEnv, slug: string): Promise<Project | null> {
  const raw = await env.PROJECTS?.get(`project:${slug}`, 'text');
  if (!raw) return null;
  return validateProject(JSON.parse(raw), `project:${slug}`);
}

function unavailable(): Response {
  return json(
    { error: 'content_service_unbound', message: 'the PROJECTS KV binding is not configured for this deployment' },
    { status: 503, headers: { 'cache-control': 'no-store' } },
  );
}

function methodNotAllowed(): Response {
  return json({ error: 'method_not_allowed' }, { status: 405, headers: { allow: 'GET, HEAD', 'cache-control': 'no-store' } });
}

// ── GET /api/projects and /api/projects/<slug> ───────────────────────────────
/**
 * `route` is the catch-all tail after `/api/`: '' or 'projects' → the ledger;
 * 'projects/<slug>' → one project.
 */
export async function apiResponse(request: Request, env: ApiEnv, route: string): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return methodNotAllowed();

  const tail = route.replace(/^\/+|\/+$/g, '');
  const segments = tail === '' ? [] : tail.split('/').filter(Boolean);

  try {
    // /api or /api/projects → the ledger
    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'projects')) {
      if (!env.PROJECTS) return unavailable();
      let index: IndexPayload | null;
      try {
        index = await readIndex(env);
      } catch (err) {
        return json(
          { error: 'invalid_index', message: err instanceof Error ? err.message : String(err) },
          { status: 500, headers: { 'cache-control': 'no-store' } },
        );
      }
      if (!index) {
        return json(
          { error: 'projects_not_published', message: 'KV has no `index` key — run scripts/publish-projects.mjs' },
          { status: 404, headers: { 'cache-control': 'no-store' } },
        );
      }
      return cachedBody(request, JSON.stringify(index), JSON_TYPE);
    }

    // /api/projects.json — the baked snapshot, which the client falls back to. A static asset at
    // this path normally wins the route (see public/_routes.json); if this Function is ever the
    // one that gets asked, serve the asset rather than 404, because the fallback depends on it.
    if (segments.length === 1 && segments[0] === 'projects.json') {
      if (!env.ASSETS) {
        return json(
          { error: 'snapshot_unbound', message: 'the baked snapshot is not reachable from this Function' },
          { status: 503, headers: { 'cache-control': 'no-store' } },
        );
      }
      const origin = new URL(request.url).origin;
      const asset = await env.ASSETS.fetch(new Request(new URL('/api/projects.json', origin), { headers: request.headers }));
      if (!asset.ok) return json({ error: 'snapshot_missing' }, { status: 404, headers: { 'cache-control': 'no-store' } });
      return cachedBody(request, await asset.text(), JSON_TYPE);
    }

    // /api/projects/<slug>
    if (segments.length === 2 && segments[0] === 'projects') {
      const slug = decodeURIComponent(segments[1]);
      if (!env.PROJECTS) return unavailable();
      let project: Project | null;
      try {
        project = await readProject(env, slug);
      } catch (err) {
        return json(
          { error: 'invalid_project', slug, message: err instanceof Error ? err.message : String(err) },
          { status: 500, headers: { 'cache-control': 'no-store' } },
        );
      }
      if (!project) return json({ error: 'not_found', slug }, { status: 404, headers: { 'cache-control': 'no-store' } });
      return cachedBody(request, JSON.stringify(project), JSON_TYPE);
    }

    // Anything else under /api/ is not an endpoint.
    return json({ error: 'not_found', route }, { status: 404, headers: { 'cache-control': 'no-store' } });
  } catch (err) {
    return json(
      { error: 'api_error', message: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: { 'cache-control': 'no-store' } },
    );
  }
}

// ── GET /sitemap.xml, generated from KV ──────────────────────────────────────
export async function sitemapResponse(request: Request, env: ApiEnv): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return methodNotAllowed();

  const index = env.PROJECTS ? await readIndex(env).catch(() => null) : null;
  const lastmod = index?.generatedAt?.slice(0, 10);
  const entries = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/projects`, priority: '0.9' },
    // Only SLUG_RE-valid slugs become XML — a hostile KV row must not inject markup into the sitemap.
    ...(index?.projects ?? [])
      .filter((project) => SLUG_RE.test(project.slug))
      .map((project) => ({ loc: `${SITE}/projects/${project.slug}`, priority: '0.8' })),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ loc, priority }) =>
      [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
        '    <changefreq>monthly</changefreq>',
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n');

  return cachedBody(request, xml, 'application/xml; charset=utf-8', {
    'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
  });
}

// ── /projects/<slug> — real title/OG for crawlers, no SSR framework ──────────
export function injectMeta(shell: string, project: Project): string {
  const title = `${project.title} — ${SITE_NAME}`;
  const canonical = `${SITE}/projects/${project.slug}`;
  const meta = [
    `<meta name="description" content="${escapeHtml(project.summary)}" />`,
    '<meta property="og:type" content="article" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(project.summary)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(project.summary)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
  ].join('\n    ');

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('<link rel="canonical" href="https://prakashsewani.com/" />', '')
    .replace('<!--route-meta-->', meta);
}

export async function shellResponse(
  request: Request,
  env: ApiEnv,
  url: URL | string,
  slug: string,
): Promise<Response> {
  if (!env.ASSETS) {
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Unavailable</title><p>The static assets binding is not available to this Function.',
      { status: 500, headers: { 'content-type': HTML_TYPE, 'cache-control': 'no-store' } },
    );
  }

  const origin = typeof url === 'string' ? new URL(url).origin : url.origin;
  const asset = await env.ASSETS.fetch(new Request(new URL('/index.html', origin), { headers: request.headers }));
  const html = await asset.text();

  let project: Project | null = null;
  try {
    project = env.PROJECTS ? await readProject(env, slug) : null;
  } catch {
    project = null; // malformed KV content must not take the page down
  }

  if (!project) {
    // The client renders its own "no such project" state; 404 is honest for crawlers.
    return new Response(html, { status: 404, headers: { 'content-type': HTML_TYPE, 'cache-control': 'no-store' } });
  }
  return new Response(request.method === 'HEAD' ? null : injectMeta(html, project), {
    status: 200,
    headers: { 'content-type': HTML_TYPE, 'cache-control': CACHE_CONTROL },
  });
}
