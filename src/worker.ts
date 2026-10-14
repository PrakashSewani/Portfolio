/**
 * The Worker that serves the API and the per-project shell metadata.
 *
 * One Worker, one origin: `/api/*` and `/sitemap.xml` and `/projects/<slug>` are handled here,
 * everything else falls through to the static assets (`env.ASSETS`), which keeps the existing
 * single-page-application fallback working.
 *
 * ⚠️ The trap this file exists because of: with static assets, Cloudflare serves the assets *and
 * the SPA fallback* **before** the Worker script. Without `run_worker_first` in `wrangler.jsonc`
 * every one of these paths returns the app HTML and this code never runs — which is exactly the
 * live behaviour today. The config lists every path this file owns.
 *
 * KV layout (written by scripts/publish-projects.mjs):
 *   index            → { generatedAt, count, projects: LedgerRow[] }   (the ledger, one read)
 *   project:<slug>   → a full Project
 */
import { validateProject, toLedger, type LedgerRow, type Project } from './lib/projects.ts';

interface KVNamespaceLike {
  get(key: string, type?: 'text'): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface Env {
  PROJECTS?: KVNamespaceLike;
  /** Declared in wrangler.jsonc as `assets.binding` — without it the worker cannot read the shell. */
  ASSETS?: { fetch(request: Request): Promise<Response> };
}

/** An index payload with `projects` validated into ledger rows. */
interface IndexPayload {
  generatedAt?: string;
  count?: number;
  projects: LedgerRow[];
}

const CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=600';
const SITE = 'https://prakashsewani.com';
const SITE_NAME = 'Prakash Sewani';
const HTML_TYPE = 'text/html; charset=utf-8';
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

async function digest(text: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text)));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** 200 with an ETag + the shared cache policy, or 304 when the client already has it. */
async function cachedBody(request: Request, body: string, contentType: string, extra: Record<string, string> = {}): Promise<Response> {
  const etag = `"${await digest(body)}"`;
  const headers = new Headers({ 'content-type': contentType, 'cache-control': CACHE_CONTROL, etag, ...extra });
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers });
}

function isProjectRow(value: unknown): value is LedgerRow {
  return typeof value === 'object' && value !== null && typeof (value as LedgerRow).slug === 'string';
}

/** Read + shape the KV index. Returns null when KV is unbound or nothing has been published. */
async function readIndex(env: Env): Promise<IndexPayload | null> {
  const raw = await env.PROJECTS?.get('index', 'text');
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return null;
  const rows = (parsed as { projects?: unknown }).projects;
  if (!Array.isArray(rows)) return null;
  return {
    generatedAt: (parsed as IndexPayload).generatedAt,
    count: (parsed as IndexPayload).count,
    projects: rows.filter(isProjectRow),
  };
}

async function readProject(env: Env, slug: string): Promise<Project | null> {
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

function assetsUnavailable(): Response {
  return new Response(
    '<!doctype html><meta charset="utf-8"><title>Unavailable</title><p>The static assets binding is not configured for this deployment.',
    { status: 500, headers: { 'content-type': HTML_TYPE, 'cache-control': 'no-store' } },
  );
}

// ── GET /api/projects ────────────────────────────────────────────────────────
async function ledger(request: Request, env: Env): Promise<Response> {
  if (!env.PROJECTS) return unavailable();
  const index = await readIndex(env);
  if (!index) {
    return json(
      { error: 'projects_not_published', message: 'KV has no `index` key — run scripts/publish-projects.mjs' },
      { status: 404, headers: { 'cache-control': 'no-store' } },
    );
  }
  return cachedBody(request, JSON.stringify(index), JSON_TYPE);
}

// ── GET /api/projects/<slug> ─────────────────────────────────────────────────
async function oneProject(request: Request, env: Env, slug: string): Promise<Response> {
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

// ── GET /sitemap.xml ─────────────────────────────────────────────────────────
async function sitemap(request: Request, env: Env): Promise<Response> {
  const index = env.PROJECTS ? await readIndex(env).catch(() => null) : null;
  const lastmod = index?.generatedAt?.slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/projects`, priority: '0.9' },
    ...(index?.projects ?? []).map((project) => ({ loc: `${SITE}/projects/${project.slug}`, priority: '0.8' })),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(({ loc, priority }) =>
      [
        '  <url>',
        `    <loc>${loc}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        '    <changefreq>monthly</changefreq>',
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n');
  return cachedBody(request, xml, 'application/xml; charset=utf-8', { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' });
}

// ── GET /projects/<slug> — real title/OG for crawlers, no SSR framework ──────
function injectMeta(shell: string, project: Project): string {
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

async function shell(request: Request, env: Env, url: URL, slug: string): Promise<Response> {
  if (!env.ASSETS) return assetsUnavailable();
  const asset = await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin), { headers: request.headers }));
  const html = await asset.text();

  let project: Project | null = null;
  try {
    project = env.PROJECTS ? await readProject(env, slug) : null;
  } catch {
    project = null; // malformed KV content must not take the page down
  }

  if (!project) {
    // The client renders its own "no such project" state; the status is honest for crawlers.
    return new Response(html, { status: 404, headers: { 'content-type': HTML_TYPE, 'cache-control': 'no-store' } });
  }
  return new Response(request.method === 'HEAD' ? null : injectMeta(html, project), {
    status: 200,
    headers: { 'content-type': HTML_TYPE, 'cache-control': CACHE_CONTROL },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'method_not_allowed' }, { status: 405, headers: { allow: 'GET, HEAD', 'cache-control': 'no-store' } });
    }

    try {
      if (pathname === '/api/projects' || pathname === '/api/projects/') return await ledger(request, env);

      const single = pathname.match(/^\/api\/projects\/([^/]+)\/?$/);
      if (single) return await oneProject(request, env, decodeURIComponent(single[1]));

      if (pathname === '/sitemap.xml') return await sitemap(request, env);

      const caseRoute = pathname.match(/^\/projects\/([^/]+)\/?$/);
      if (caseRoute) return await shell(request, env, url, decodeURIComponent(caseRoute[1]));

      if (!env.ASSETS) return assetsUnavailable();
      return await env.ASSETS.fetch(request);
    } catch (err) {
      return json(
        { error: 'worker_error', message: err instanceof Error ? err.message : String(err) },
        { status: 500, headers: { 'cache-control': 'no-store' } },
      );
    }
  },
};
