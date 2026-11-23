#!/usr/bin/env node
/**
 * prerender.mjs — post-build step. The site is a static SPA, but a link to /projects/<slug> should
 * unfurl with that project's real title and description, and a crawler should see real content
 * without running JavaScript. So:
 *
 *   - dist/projects/<slug>/index.html for every project, and dist/projects/index.html for the
 *     index: the built app shell with its head tags and <noscript> fallback swapped for that page's.
 *   - dist/sitemap.xml from the same content, so it can never list a project that is gone.
 *   - <meta name="build-weight"> in every page: the gzipped size of the JavaScript the page loads,
 *     measured here, after bundling. The footer prints it; it is a measurement, not a claim.
 *
 * Cloudflare Pages serves each file at its path; every other path still falls back to /index.html.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { loadContent, ROOT } from './load-content.mjs';

const ORIGIN = 'https://prakashsewani.com';
const DIST = path.join(ROOT, 'dist');
const NAME = 'Prakash Sewani';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: template is missing ${pattern}`);
  return html.replace(pattern, replacement);
}

/** Swap the head tags and the noscript body of the shell for one page's. */
function page(template, { title, description, urlPath, body }) {
  const url = `${ORIGIN}${urlPath}`;
  let html = template;
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`);
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  const shell = `<main style="max-width:680px;margin:0 auto;padding:96px 24px;font-family:system-ui,sans-serif;color:#ecebe6;line-height:1.6">${body}<p><a style="color:#c8f25c" href="/">prakashsewani.com</a></p></main>`;
  return setTag(html, /<noscript>[\s\S]*?<\/noscript>/, `<noscript>${shell}</noscript>`);
}

function projectPage(template, project) {
  const links = project.links.map((l) => `<a style="color:#c8f25c" href="${esc(l.href)}">${esc(l.label)}</a>`).join(' · ');
  const decisions = project.decisions ? `<ul>${project.decisions.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '';
  return page(template, {
    title: `${project.title} — case study | ${NAME}`,
    description: project.summary,
    urlPath: `/projects/${project.slug}`,
    body: [
      `<h1>${esc(project.title)}</h1>`,
      `<p>${esc(project.summary)}</p>`,
      project.challenge ? `<h2>Problem</h2><p>${esc(project.challenge)}</p>` : '',
      project.invariant ? `<h2>Invariant</h2><p>${esc(project.invariant)}</p>` : '',
      decisions ? `<h2>Approach</h2>${decisions}` : '',
      `<p>${links}</p>`,
      `<p><a style="color:#c8f25c" href="/projects">Every project</a></p>`,
    ].join(''),
  });
}

function indexPage(template, projects) {
  const counts = { shipped: 0, 'in-progress': 0, archived: 0 };
  for (const p of projects) counts[p.status] += 1;
  const list = projects.map((p) => `<li><a style="color:#c8f25c" href="/projects/${p.slug}">${esc(p.title)}</a> — ${esc(p.summary)}</li>`).join('');
  return page(template, {
    title: `Every project — ${NAME}`,
    description: `All ${projects.length} projects by ${NAME}: ${counts.shipped} shipped, ${counts['in-progress']} in progress, ${counts.archived} archived. Searchable by layer, language and status.`,
    urlPath: '/projects',
    body: `<h1>Every project</h1><ul>${list}</ul>`,
  });
}

/** Gzipped bytes of every script the shell loads (the entry and anything it preloads). */
async function scriptWeight(template) {
  const srcs = [...template.matchAll(/<(?:script[^>]*\ssrc|link[^>]*rel="modulepreload"[^>]*\shref)="\/([^"]+\.js)"/g)].map((m) => m[1]);
  let bytes = 0;
  for (const src of new Set(srcs)) bytes += gzipSync(await readFile(path.join(DIST, src)), { level: 9 }).length;
  return bytes;
}

const withWeight = (html, label) =>
  html.includes('name="build-weight"') ? html : html.replace('</title>', `</title>\n    <meta name="build-weight" content="${label}" />`);

async function main() {
  let template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const projects = await loadContent();

  const bytes = await scriptWeight(template);
  if (!bytes) throw new Error('prerender: found no script in dist/index.html to measure');
  const label = `${(bytes / 1024).toFixed(1)} kB`;
  template = withWeight(template, label);
  await writeFile(path.join(DIST, 'index.html'), template);

  for (const project of projects) {
    const dir = path.join(DIST, 'projects', project.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), projectPage(template, project));
  }
  await writeFile(path.join(DIST, 'projects', 'index.html'), indexPage(template, projects));

  const today = new Date().toISOString().slice(0, 10);
  const urls = [`${ORIGIN}/`, `${ORIGIN}/projects`, ...projects.map((p) => `${ORIGIN}/projects/${p.slug}`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);

  const assets = (await readdir(path.join(DIST, 'assets'))).length;
  console.log(`prerendered ${projects.length} case page(s), the index and sitemap.xml (${urls.length} urls); script ${label} gzipped; ${assets} asset file(s)`);
}

main().catch((err) => {
  console.error(`✗ prerender: ${err.message}`);
  process.exit(1);
});
