#!/usr/bin/env node
/**
 * prerender.mjs — post-build step. The site is a static SPA, but a link to /projects/<slug> should
 * unfurl with that project's real title and description, and a crawler should see real content
 * without running JavaScript. So for every project we write dist/projects/<slug>/index.html: the
 * built app shell with its head tags (and the <noscript> fallback) swapped for that project's.
 * Cloudflare Pages serves it at /projects/<slug>; every other path still falls back to /index.html.
 * Also writes dist/sitemap.xml from the same content, so it can never list a project that is gone.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadContent, ROOT } from './load-content.mjs';

const ORIGIN = 'https://prakashsewani.com';
const DIST = path.join(ROOT, 'dist');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: template is missing ${pattern}`);
  return html.replace(pattern, replacement);
}

function render(template, project) {
  const title = `${project.title} — case study | Prakash Sewani`;
  const description = project.summary;
  const url = `${ORIGIN}/projects/${project.slug}`;
  let html = template;
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`);
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  const links = project.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(' · ');
  const body = `<noscript><main style="max-width:640px;margin:0 auto;padding:96px 24px;font-family:system-ui,sans-serif;color:#ece8df;line-height:1.6"><h1>${esc(project.title)}</h1><p>${esc(project.summary)}</p>${project.challenge ? `<p>${esc(project.challenge)}</p>` : ''}<p>${links}</p><p><a href="/">prakashsewani.com</a></p></main></noscript>`;
  return setTag(html, /<noscript>[\s\S]*?<\/noscript>/, body);
}

async function main() {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const projects = await loadContent();

  for (const project of projects) {
    const dir = path.join(DIST, 'projects', project.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), render(template, project));
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = [`${ORIGIN}/`, ...projects.map((p) => `${ORIGIN}/projects/${p.slug}`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);

  console.log(`prerendered ${projects.length} project page(s) and sitemap.xml (${urls.length} urls)`);
}

main().catch((err) => {
  console.error(`✗ prerender: ${err.message}`);
  process.exit(1);
});
