# Prakash Sewani — Portfolio

[prakashsewani.com](https://prakashsewani.com) · **Software engineer, every layer of the system.**

A static React 19 + Vite site that boots like a system. The hero is a cross-section of five layers
(Machine → Infrastructure → Software → Intelligence → Interface) that powers up from the bottom,
with a cold-start readout of how long the page really took to load in your browser. The work is six
case files, each led by the one rule its system never breaks, plus a bench of everything else and a
searchable index. The design contract is [`DESIGN.md`](./DESIGN.md).

## Stack

- **React 19** + **TypeScript**, **Vite 6**. No UI framework, no animation library, no icon package,
  so the only runtime dependency is React.
- Plain CSS on a single dark token map (`src/styles/tokens.css`).
- Fonts are self-hosted through `@fontsource` (Archivo Variable with its width axis, IBM Plex Mono).
- Hosted on **Cloudflare Pages** as a plain static site (`npm run build` → `dist/`).

## Run it

Node **≥ 22.18** (`.nvmrc` pins it; the tests import TypeScript sources directly).

```bash
npm install
npm run dev      # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | `vite build`, then `scripts/prerender.mjs` |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | `node --test tests/*.test.mjs` (content contract, cold-start readout) |
| `npm run check:tokens` | WCAG AA contrast gate |
| `npm run check` | lint + tokens + tests |
| `npm run normalize` | Rewrite `content/projects/*.json` in canonical form |
| `node scripts/brand-assets.mjs` | Regenerate favicons and the social card (needs Edge or Chrome) |

## Structure

```
content/projects/*.json     the single source of truth for every project
src/
  App.tsx, main.tsx         routes: /, /projects, /projects/<slug>, anything else → not found
  components/
    LayerMark.tsx           the mark: five planes, lit by layer
    Figures.tsx             drawn case figures (inline SVG)
    Palette.tsx, Icons.tsx
    site/                   Header, MobileNav, Footer
    home/                   ColdStart, StackDiagram, BootReadout, Principles, Layers,
                            CaseFiles, Bench, Record, Contact
  pages/                    Home, ProjectIndex, ProjectCase, NotFound
  data/                     projects.ts (validated content + derived counts), layers.ts,
                            principles.ts, profile.ts
  lib/                      projects.js (+ .d.ts, the schema), router.tsx, boot.ts, motion.ts (reveal, active section, useScenes, useLit), meta.ts
  styles/                   tokens, base, shell, home, figures, case, index
scripts/
  prerender.mjs             post-build: per-project HTML, /projects, sitemap.xml, measured script weight
  check-tokens.mjs, load-content.mjs, normalize-content.mjs, brand-assets.mjs
tests/                      content.test.mjs, boot.test.mjs
```

## Content model

`content/projects/<slug>.json` is the only description of a project; the filename must equal the
slug. The schema (`src/lib/projects.js`) rejects unknown keys, so a typo fails the build.

Required: `slug`, `title`, `summary`, `status` (`shipped | in-progress | archived`), `stack`, `links`,
and `layers`: one or more of `machine | infrastructure | software | intelligence | interface`, primary
first. The layers decide where a project shows up in the hero counts, the Layers section, the mark
and the filters.

Optional fields, and what each one adds to the case page:

| Field | Adds |
| --- | --- |
| `kicker` | `"Category / subcategory"` line; the category also labels the bench tile |
| `year` | the year everywhere the project is listed |
| `challenge` | **Problem** |
| `invariant` | **Invariant**: the one rule the system never breaks, in the project's own terms |
| `decisions` | **Approach** |
| `specimen` | **How it works**: a drawn figure, if `Figures.tsx` has a drawing for its `kind` |
| `evidence` | **Facts** (label/value pairs: releases, licence, distribution, measured outcomes) |
| `ownership` | **My part** |
| `featured`, `order` | case-file selection and ordering |

In `npm run dev`, every missing field on a case page shows a dashed "content slot" naming the field
to add. Production builds never show it.

`featured: true` puts a project in the six case files on the home page. Exactly six are expected, they
come first in `order`, each needs `kicker`, `invariant`, `challenge`, `decisions`, `evidence`,
`ownership` and a drawn `specimen`, and between them they cover all five layers (the tests check all
of this).

Adding a project is one file. The home page, bench, index, palette, case pages, prerendered HTML and
sitemap all read it.

## Honest numbers

Nothing on the site is simulated. The cold-start readout reads the browser's Navigation and Paint
Timing (`src/lib/boot.ts`, tested in `tests/boot.test.mjs`) and shows a dash for anything the
browser does not report. Every count is derived from the content files. Each quote in the Rules
section is checked verbatim against its project's content file. The footer's script weight is
measured by the prerender step after bundling.

## Deploy

Cloudflare Pages, Git-integrated: build command `npm run build`, output directory `dist`, Node 22.18+.
Unknown paths fall back to `index.html` (there is deliberately no `404.html`, which would disable that
fallback); `/projects` and `/projects/<slug>` are served from their prerendered files. The footer
links the build's commit when `CF_PAGES_COMMIT_SHA` is set.

## License

Personal project. All rights reserved.
