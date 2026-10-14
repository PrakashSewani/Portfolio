# Prakash Sewani — Portfolio

[prakashsewani.com](https://prakashsewani.com)

Personal portfolio of Prakash Sewani, Senior Software Engineer. A single-page application built to
the "spec sheet" design system in [`DESIGN.md`](./DESIGN.md): one token map, a drawn specimen plate
per project, and content that renders at two densities (home summary and full case sheet) from the
same files.

## Tech stack

- **React 19** + **TypeScript**
- **Vite 6** build tooling
- **Motion** (Framer Motion) for animations
- **Lucide Icons**
- Custom CSS with a token map (`src/lib/index.css`), no UI framework
- **Cloudflare Pages** host: Pages Functions + Workers KV for the `/api/*` content API, the
  KV-generated `/sitemap.xml`, and per-project head-tag injection

## Prerequisites

**Node.js ≥ 22.18.** The site itself builds on older Node, but `npm test` runs the Functions
straight from their TypeScript sources (`node --test`), and Node only strips TypeScript types from a
`.ts` import unflagged from 22.18 — so that is the floor. `.nvmrc` and `engines` pin it for the
build image.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Bakes the content snapshot (`prebuild`), then `vite build` into `dist/` |
| `npm run preview` | Serves the built output |
| `npm run lint` | `tsc --noEmit` — the type gate |
| `npm test` | `node --test tests/*.test.mjs` — content contract, Functions routes, script exit codes |
| `npm run check:tokens` | `scripts/check-design-tokens.mjs` — the WCAG AA / token-map gate |
| `npm run snapshot` | Rebakes `public/api/projects.json` (deterministic; a rebuild leaves the tree clean) |
| `node scripts/publish-projects.mjs` | Validates content and syncs it into KV (`--dry-run` and `--emit` need no credentials) |

## Project structure

```
content/
└── projects/                  # the single source of truth: one <slug>.json per project
functions/                     # Cloudflare Pages Functions (thin adapters)
├── api/[[route]].ts           #   /api/projects, /api/projects/<slug>, /api/projects.json
├── projects/[slug].ts         #   /projects/<slug> — app shell + real title/OG/canonical
└── sitemap.xml.ts             #   /sitemap.xml, generated from KV
public/
├── _routes.json               # functions include/exclude list (keeps the snapshot a static asset)
└── api/projects.json          # the baked fallback snapshot (generated; committed byte-stable)
scripts/
├── load-content.mjs           # read + validate content/projects against the schema
├── build-snapshot.mjs         # prebuild: content → public/api/projects.json
├── publish-projects.mjs       # validate + sync KV (index + one key per project, deletes stale keys)
└── check-design-tokens.mjs    # the contrast / banned-device gate
src/
├── App.tsx                    # layout, routing, scroll progress, command palette
├── main.tsx                   # entry point
├── vite-env.d.ts              # Vite client types (import.meta.glob)
├── components/                # Navbar, HeroDashboard, Projects, SpecimenPlate, …
├── pages/
│   ├── Projects.tsx           # /projects — the ledger
│   └── ProjectCase.tsx        # /projects/<slug> — one case study
├── data/
│   ├── navigation.ts          # the shared section-navigation contract
│   └── portfolio.ts           # profile + the home cases, read from content/projects/*.json
└── lib/
    ├── index.css              # all styles (the token map DESIGN.md §2 defines)
    ├── projects.js            # the content schema + browser loader (plain ESM)
    ├── projects.d.ts          # its type declarations
    ├── pages-api.ts           # the /api + sitemap + shell logic (unit-testable, no runtime)
    └── router.tsx             # ~1 KB history router
tests/                         # node --test suites
wrangler.toml                  # the Pages project config + the PROJECTS KV binding
DESIGN.md                      # the normative design contract (tokens, contrast, motion)
```

## Content model

`content/projects/<slug>.json` is the only description of a project. The filename must equal the
slug. Everything else reads it:

- the home page's selected work (`src/data/portfolio.ts` inlines the same files at build time),
- the `/projects` ledger and `/projects/<slug>` case sheets (via KV, written by
  `scripts/publish-projects.mjs`),
- the baked fallback snapshot and the sitemap.

**The home page shows only the projects marked `"featured": true`; `/projects` lists all of them.**
Flag a project only when it carries the case-study keys (`challenge`, `decisions`, `specimen`) — the
home page renders a flagged project as a full case block, so a thin file there renders an empty
figure plate. If nothing is flagged, the home page falls back to the six newest by `order`.

Every file is written in the schema's own key order and format
(`node scripts/normalize-content.mjs`, `--check` reports drift) — a content file and its entry in the
baked snapshot are byte-identical, and `tests/content.test.mjs` fails if one drifts off.

Adding a project is one file plus `node scripts/publish-projects.mjs`.

## Icons

Favicons, PWA icons and the social preview image live in `public/`.

- `favicon.ico` — multi-resolution ICO (16/32/48/256)
- `favicon-16x16.png` / `favicon-32x32.png` — PNG favicons
- `apple-touch-icon.png` — 180x180 for iOS home screen
- `android-chrome-192x192.png` / `android-chrome-512x512.png` — PWA icons
- `og-image.png` — 1200x630 social preview card

These still bake the pre-spec-sheet palette; regenerating them for the current token map is
explicitly out of scope for this pass (DESIGN.md §8).

## License

Personal project. All rights reserved.
