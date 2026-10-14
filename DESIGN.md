# DESIGN.md — Precise Systems

The design system for prakashsewani.com. **Direction 1 (spec sheet) + drawn specimen plates**,
approved by Prakash on 2026-10-14. This file is the contract: the token map, the type and spacing
scales, the motion budget, and the contrast table are normative. Anything in `src/lib/index.css`
that contradicts this file is a bug.

The site is **artifact #0** — it has to demonstrate the claim it makes. That is why this is a token
swap rather than a component rewrite: one token map, two schemes, zero component branching.

---

## 1. Principles

1. **Typography carries hierarchy.** Space Grotesk (display, 500), Inter (400/500/600) for body,
   IBM Plex Mono (400/500) for metadata only. Fixed type scale — no fluid display sizing, no
   all-caps prose. All-caps is reserved for mono metadata labels of six words or fewer.
2. **One accent, interaction only.** `--accent` is for links, the active nav item, focus rings, and
   one call to action. It is never a fill behind body copy, and there is never a second accent.
3. **One loud element per viewport.** Exactly one focal point per screen; everything else steps down
   in scale, weight and contrast.
4. **Depth by value, not by border.** Surface steps (`--canvas` → `--plate` → `--soft`) plus 1px
   hairlines at low contrast. Borders thicker than 1px on content are banned.
5. **Evidence above the fold in every card.** A number, a decision or an artifact link comes before
   any adjective.
6. **Motion explains, never decorates.** 120–220 ms, opacity and transform only, and
   `prefers-reduced-motion: reduce` is honoured everywhere.
7. **Contrast is a test, not an opinion.** AA is enforced by `scripts/check-design-tokens.mjs`,
   which exits non-zero on a violation. See §5.
8. **Two reading paths, neither broken.** The 30-second recruiter skim (who → what → proof →
   contact) and the deep path (case studies, project index, Cmd+K) read the same content at
   different densities.

## 2. Token contract

One token map, one scheme in this pass. Dark exists **only** as the `--night-*` set used by case
specimen plates — there is no dark page scheme and no theme toggle.

| Token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#fbfaf9` | page background |
| `--plate` | `#ffffff` | raised surface: cards, plates, tables |
| `--ink` | `#16181c` | primary text, solid CTA fill |
| `--muted` | `#6b6f76` | secondary text, metadata |
| `--hairline` | `#ddd8d0` | 1px rules and separators |
| `--soft` | `#eceae4` | third surface step, inset areas |
| `--accent` | `#2e5bff` | links, active nav, focus ring, one CTA |
| `--accent-soft` | `#eef1ff` | accent tint for callout markers only |
| `--night` | `#16181c` | dark specimen plate background |
| `--night-line` | `rgba(255,255,255,.09)` | hairline on a dark plate |
| `--night-text` | `#f2f0ea` | text on a dark plate |
| `--night-muted` | `#9aa1ad` | metadata on a dark plate |

Dark plates reuse `--night` = the `--ink` value, so the distinct-hex count stays inside the budget
the token test enforces (≤ 14). rgba values are not hex and do not count.

### Banned

- hard offset shadows (`box-shadow: Npx Npx 0 …`)
- `-webkit-text-stroke` / `text-stroke`
- rotated cards (`transform: rotate()` on content surfaces)
- `writing-mode` labels
- borders thicker than 1px on content
- acid `#c7ff1a` as an identity colour (it is retired; nothing in the system uses it)
- raw hex outside this token map — components reference `var(--token)` only

## 3. Type & space scales

Families: `--display: "Space Grotesk"`, `--body: "Inter"`, `--mono: "IBM Plex Mono"`.
Fixed scale (no clamp on body copy; the hero display size is the single allowed clamp):

| Token | Size | Use |
| --- | --- | --- |
| `--t-label` | 12px | section index / route kicker |
| `--t-small` | 14px | fine print, table cells, rail values |
| `--t-body` | 16px | body copy |
| `--t-lead` | 20px | lead paragraphs, summaries |
| `--t-h3` | 26px | card and case titles |
| `--t-h2` | 36px | section headings |
| `--t-h1` | 52px | page title (hero h1 clamps between 34px and 52px) |

Mono metadata labels (`.section-index`, `.rail-row dt`, `.plate-footnote`, the ledger's metadata
columns, …) run at **11px** through two shared rules — one for light surfaces and one for dark
plates — so a label can never be restyled in isolation. `--t-label` (12px) is reserved for the
section index and the route kicker.

Measure: body copy is capped at 72ch (`--measure`). Spacing is an 8px scale
(`--s-1` 4px, `--s-2` 8px, `--s-3` 16px, `--s-4` 24px, `--s-5` 32px, `--s-6` 48px, `--s-7` 64px,
`--s-8` 96px).

## 4. Motion budget

`--motion: 160ms`, easing `cubic-bezier(.22,1,.36,1)`. Only `opacity` and `transform` animate.
Longer sequences (specimen plate reveal, case study sections) may reach 220 ms; nothing animates
longer. `@media (prefers-reduced-motion: reduce)` collapses every animation and transition to
0.01 ms and disables smooth scrolling — see the tail of `src/lib/index.css`.

## 5. Contrast table (WCAG 2.1, computed — not estimated)

Ratios are produced by `scripts/check-design-tokens.mjs` from the token map in
`src/lib/index.css`. AA requires 4.5:1 for body text and 3:1 for large text (≥ 24px, or ≥ 19px
bold). The script exits non-zero if any declared pair falls short, so this table cannot drift
from the CSS silently.

| Pair | Ratio | Requirement | Verdict |
| --- | --- | --- | --- |
| `--ink` on `--canvas` | 17.05 | 4.5 (body) | pass |
| `--ink` on `--plate` | 17.77 | 4.5 (body) | pass |
| `--ink` on `--soft` | 14.77 | 4.5 (body) | pass |
| `--ink` on `--accent-soft` | 15.79 | 4.5 (body) | pass |
| `--muted` on `--canvas` | 4.84 | 4.5 (body) | pass |
| `--muted` on `--plate` | 5.05 | 4.5 (body) | pass |
| `--accent` on `--canvas` | 4.97 | 4.5 (body) | pass |
| `--accent` on `--plate` | 5.18 | 4.5 (body) | pass |
| `--plate` on `--accent` | 5.18 | 4.5 (body) | pass |
| `--night-text` on `--night` | 15.60 | 4.5 (body) | pass |
| `--night-text` on `--ink` | 15.60 | 4.5 (body) | pass |
| `--night-muted` on `--night` | 6.83 | 4.5 (body) | pass |

**`--muted` on `--soft` is 4.20:1 and therefore not allowed.** Text on a `--soft` surface is
`--ink`; secondary emphasis there comes from size and weight, not from a lighter colour. That is
why `.impact-intro`, `.about-copy`, `.career-education`, `.answer-block` and `.project-context`
carry ink text rather than muted.

**`--muted` on any dark surface is 3.50:1 and therefore not allowed either.** Labels on `--night`
or `--ink` (the offscreen strip, the dark specimen figures, `.mockup-status`) use
`--night-muted` at 6.83:1 — that is the second shared metadata rule.

Accent never carries body copy: it is a link colour (always underlined), a focus ring, and a
marker fill. Where accent is a *background* (the numbered callout markers, the solid CTA hover),
the text on it is `--plate` at 5.18:1.

## 6. Specimen plates

An app image is not a pasted screenshot; it is part of the layout grammar. A plate is:

```
caption strip  →  FIG. <nn> / <caption>
figure slot    →  a drawn UI figure (crisp at any zoom, on-palette, zero image weight)
callouts       →  numbered annotations tied to the figure
footnote strip →  the strip of facts that closes the specimen
```

Drawn figures are keyed by `kind`: `inspector`, `roulette`, `habit`, `knowledge`, `none`.
All six legacy figure classes (`inspector-mockup`, `code-row`, `inspection-card`, `habit-mockup`,
`knowledge-mockup`, `roulette-mockup`) survive the rewrite and are restyled in the spec-sheet
idiom, so the drawn figures and the plate share one token map.

A callout's number is its `n` from the content file, rendered as `data-n` and used by the marker
(`content: attr(data-n)`) — the number is data, not DOM order, so a validated `n` can never be
silently ignored.

**Do / don't**

| Do | Don't |
| --- | --- |
| `border: 1px solid var(--hairline)` | a 2px border or an offset shadow |
| one accent, on interaction | accent as a background fill behind prose |
| `var(--ink)` for text | a raw hex inside a component |
| metadata in `--mono` at `--t-label` | all-caps paragraph text |
| three surface steps for depth | a border on every box |

## 7. Budget & the reset

The emitted stylesheet must stay **≤ 40 KB** as a single asset (`npm run build` prints it; the
baseline brutalist stylesheet was 37.4 KB). Meeting that budget is why:

- **`@import "tailwindcss"` is gone.** Tailwind v4 was wired into `vite.config.ts` but unused, and
  its preflight reset alone cost 8.4 KB of the emitted CSS. The reset this design actually depends
  on (box-sizing, zeroed margins/padding, `border: 0 solid`, inherit-font buttons, block media,
  unstyled lists, `[hidden]`) is now written out explicitly at the top of `src/lib/index.css`, so
  nothing load-bearing is hidden inside a dependency. The Vite plugin stays wired for a real
  Tailwind adoption later; that migration is still a separate work item.
- Metadata label styling is grouped into two shared rules instead of being repeated per component.

## 8. Out of scope for this pass

Content rewrites, icon/OG regeneration (the favicons still bake acid-green-on-black and will look
off next to this palette — separate ticket), a full dark page scheme, self-hosted fonts, filter UI
beyond stack + status, an offline search index, Tailwind utility migration, analytics, and any DNS
or deploy-config change.

## 9. Route & content architecture (one page of context)

- `content/projects/<slug>.json` is the single source of truth; the filename must equal the slug.
- `npm run snapshot` (also a `prebuild` step) bakes them into `public/api/projects.json`, which the
  client falls back to when the API is unavailable — the snapshot carries **full** projects, so a
  case study still renders with KV down.
- `node scripts/publish-projects.mjs` validates and writes KV: an `index` key (the ledger, one
  read) plus one `project:<slug>` key. `--dry-run` and `--emit` work without credentials.
- **The host is a Cloudflare Pages project** (`portfolio`, Git-integrated — merging to `main`
  deploys it), so the server side is Pages Functions, not a Worker:
  - `functions/api/[[route]].ts` → the ledger and one project (`src/lib/pages-api.ts` holds the
    logic, so it is unit-testable without a runtime)
  - `functions/sitemap.xml.ts` → the KV-generated sitemap
  - `functions/projects/[slug].ts` → serves the app shell with real title/OG/canonical
  - `wrangler.toml` (`pages_build_output_dir = "dist"`, the `PROJECTS` KV binding) — **not** a
    Worker-style `wrangler.jsonc` with `assets`/`run_worker_first`; in the Pages layout a Function
    runs for any path with no matching static asset, so that trap does not exist here.
  - `_routes.json` keeps `/api/projects.json` out of the Function: the snapshot must be served as a
    static asset, or the client's fallback fetch would receive a 404 instead of the baked JSON.
