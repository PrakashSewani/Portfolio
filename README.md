# Prakash Sewani — Portfolio

[prakashsewani.com](https://prakashsewani.com) · **Software from the sensor to the screen.**

A static React 19 + Vite site organised as a signal path: Sense → Edge → Gateway → Services → Screen.
The hero is a live, deterministic telemetry simulation whose link drops and recovers with zero
samples lost; the work section is six case files with drawn figures; the archive is every project,
filterable. The design contract is [`DESIGN.md`](./DESIGN.md).

## Stack

- **React 19** + **TypeScript**, **Vite 6**. No UI framework, no animation library, no icon package
  (the icons are inline SVG), so the only runtime dependency is React.
- Plain CSS with a two-theme token map (`src/styles/tokens.css`).
- Fonts are self-hosted through `@fontsource` (Instrument Serif, Geist, JetBrains Mono), with no CDN.
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
| `npm test` | `node --test tests/*.test.mjs` (content contract, telemetry invariants) |
| `npm run check:tokens` | WCAG AA contrast gate for both themes |
| `npm run check` | lint + tokens + tests |
| `npm run normalize` | Rewrite `content/projects/*.json` in canonical form |
| `node scripts/brand-assets.mjs` | Regenerate favicons and the social card (needs Edge or Chrome) |

## Structure

```
content/projects/*.json     the single source of truth for every project
src/
  App.tsx, main.tsx
  components/               StatusBar, Hero, TelemetryPanel, SignalPath, Work, Figures,
                            Experience, Archive, Contact, Palette, Icons
  pages/ProjectCase.tsx     /projects/<slug>
  data/                     projects.ts (validated content), profile.ts (copy, signal-path stages)
  lib/                      projects.js (+ .d.ts, the schema), telemetry.ts, theme.ts, router.tsx
  styles/                   tokens.css, base.css, sections.css
scripts/
  prerender.mjs             post-build: per-project HTML (real title/OG/canonical) + sitemap.xml
  check-tokens.mjs          contrast gate
  load-content.mjs, normalize-content.mjs, brand-assets.mjs
tests/                      content.test.mjs, telemetry.test.mjs
```

## Content model

`content/projects/<slug>.json` is the only description of a project; the filename must equal the slug.
The schema (`src/lib/projects.js`) rejects unknown keys, so a typo fails the build.

- `stage`: where it sits on the signal path (`sense | edge | gateway | services | screen`). Required by the tests.
- `featured: true`: shown as a case file on the home page. Exactly six are expected, each with
  `kicker`, `challenge`, `decisions`, `evidence`, `ownership` and a `specimen.kind` that has a drawing
  in `src/components/Figures.tsx`. Everything else lives in the archive and gets a lighter case page.
- `order`: explicit ordering; then newest `year`, then title.

Adding a project is one file. The home page, archive, command palette, case pages, prerendered HTML and
sitemap all read it.

## The hero's guarantee

`src/lib/telemetry.ts` is a pure simulation: every reading is a function of its sample index, an
outage hides exactly the samples taken during it, and each one is back-filled in order when the link
returns. `tests/telemetry.test.mjs` pins that nothing is ever lost, so the "0 lost" readout is a
property of the model, not decoration. The feed is labelled as simulated on the page.

## Deploy

Cloudflare Pages, Git-integrated: build command `npm run build`, output directory `dist`, Node 22.18+.
Unknown paths fall back to `index.html`; `/projects/<slug>` is served from its prerendered file.
There is no server code and no KV binding; if an old `PROJECTS` KV namespace still exists in the
Cloudflare dashboard it is unused and can be deleted.

## License

Personal project. All rights reserved.
