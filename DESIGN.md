# DESIGN.md — Cold Start

The design contract for prakashsewani.com. `src/styles/tokens.css` is normative for colour;
`scripts/check-tokens.mjs` enforces it. Anything in the stylesheets that contradicts this file is a bug.

## Idea

**The site boots like a system.** The hero is a cross-section of five layers, bottom to top:
Machine, Infrastructure, Software, Intelligence, Interface. On load, power comes up from the bottom:
each plane draws in, its callout appears, and a pulse climbs the bus through their centres. The name
settles from condensed-thin to expanded-bold as the stack comes online. Under it, the **cold-start
readout** shows how long this page actually took to come up, measured in the visitor's browser.

**The narrative spine is invariants.** Every good system is built around one rule it must never
break. The Rules section states mine; every case file leads with the project's own invariant, quoted
from its content file. That is the thing to remember about this engineer: he decides what must never
happen, then builds so it cannot.

**The mark** is five stacked planes; lit planes are the layers a project works in. It is the logo,
the depth gauge in the Layers section, the tag on every project and the social card. The favicon is
the same idea redrawn for small sizes (`scripts/brand-assets.mjs`): a solid top plane over the front
edges of the planes beneath, three layers at tab sizes and all five at app-icon sizes, because five
outlines blur into one block at 16 px.

**The header** carries the name and the six sections, nothing else. The palette (Ctrl/⌘ K or `/`)
and the project index are there for whoever finds them; neither is advertised in the bar.

Look and feel: an engineering lab at night. Carbon black, bone-white type, graphite hairlines, one
signal colour. Wide, industrial display type; mono for anything a machine would print.

## Principles

1. **Colour means state (ISA-101).** The interface is greyscale. `--signal` means energised, active
   or focused; `--alarm` means abnormal and appears only inside drawings of abnormal states. Neither
   is decoration, and nothing depends on colour alone (status also has a shape and a word).
2. **Nothing fake.** No simulated data, no invented numbers. The cold-start readout is the browser's
   own Navigation and Paint Timing; every count (projects per layer, per status, per language) is
   derived from `content/projects`; principle quotes are checked verbatim against their content
   file by a test; the footer's script weight is measured at build. Figures say they are illustrations.
3. **Evidence before adjectives.** A case file runs problem → invariant → approach → facts.
4. **Two reading paths.** The 30-second skim (hero, rules, case titles, contact) and the deep path
   (case pages, the index, the palette) read the same content at different densities.
5. **Motion explains.** Transform and opacity, plus three one-time effects: the plane outlines
   drawing, the bus growing, and the name's width/weight settling. The idle pulse pauses off-screen.
   Reveals follow the scroll where the browser supports scroll-driven animation (they rise as they
   come up the screen and go back if you scroll back) and fade in once elsewhere.
   `prefers-reduced-motion` gets the finished frame, no pulse, no smooth scroll, no view transitions.
6. **Sharp, not soft.** Radius 0–2 px. Shared hairline grids (spec sheets, ledgers) instead of
   floating cards. No glassmorphism, no decorative gradients, no glow.

## Tokens (dark only)

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#0b0c0d` | page |
| `--raised` | `#121415` | palette, hovered rows and tiles |
| `--inset` | `#080909` | figures |
| `--plane` | `#0e1011` | stack planes, figure boxes |
| `--line` / `--line-strong` | `#222527` / `#383c3f` | hairlines |
| `--ink` | `#ecebe6` | text |
| `--muted` | `#a7a6a0` | secondary text |
| `--faint` | `#8e8d87` | mono metadata (≥ 4.5:1 everywhere) |
| `--signal` / `--on-signal` | `#c8f25c` / `#0b0c0d` | energised, active, focus; text on a signal fill |
| `--alarm` | `#ff8466` | abnormal state inside figures only |

`npm run check:tokens` prints every pair and fails below AA.

## Type

- **Archivo Variable** (weight 100–900, width 62–125 %): everything that is not mono. Display at
  `font-stretch: 118–125%`, uppercase for the name, layer names and the stack callouts; prose at 100 %.
- **IBM Plex Mono** 400/500: labels, metadata, readouts, the palette. Ligatures off.

Labels are 11–12 px mono, uppercase, letter-spaced. Body is 17 px at 1.6; prose caps near 60–65 ch.

## Signature elements

- **Stack diagram** (`home/StackDiagram.tsx`): five planes drawn flat in a 220-unit space and placed
  with one matrix each, so patterns and glyphs lie on the plane. The SVG is decorative; the five
  callout buttons beside it are the real control (hover/focus lifts a plane, click jumps to the layer;
  on touch the plane lifts for a beat before the jump). As the hero scrolls away the planes drift
  apart (a CSS scroll-driven animation on `.plane-spread`; static where unsupported or with reduced
  motion). The hero clips with `overflow: clip`, not `hidden`, or the timeline would freeze.
- **Cold-start readout** (`home/BootReadout.tsx`, `lib/boot.ts`): server response, first paint, DOM
  ready, interactive. Unknown values stay an em dash. `tests/boot.test.mjs` pins the mapping.
- **Rules** (`home/Principles.tsx`, `data/principles.ts`): each rule links to a verbatim quote or a
  derived figure.
- **Layers** (`home/Layers.tsx`): read from the surface down, with a sticky depth gauge (the mark).
  On phones the gauge becomes a bar pinned under the header (`.tracker`).
- **Case files** (`home/CaseFiles.tsx`, `Figures.tsx`, `useScenes` in `lib/motion.ts`): one project
  per screen, like a product page. The screens are sticky siblings, so each rises into place, holds
  while you read it, and settles back (scales down, dims) as the next slides over it. While a screen
  rises, its figure, title, rule and links arrive in turn from different depths; while it holds, the
  rule lights up word by word. All of it follows the scroll position exactly (`--in`, `--out`,
  `--lit`), nothing runs on a timer, and the CSS defaults are the finished frame. `#case-<slug>`
  targets are in-flow anchors before each screen. Desktop shows the problem beside the figure when
  there is room; smaller screens show the rule and the figure, and the rest is on the case page.
- **Bench** (`home/Bench.tsx`): a ruled spec-sheet grid, filterable by layer and status. Filtering
  moves the tiles to their new places (a same-page view transition; tiles are named only while it runs).
- **Experience** (`home/Record.tsx`): a ruler of the years with each role as a span and a needle at
  today's date, measured in the visitor's browser.

## Scroll choreography

The page is read like a product page: things arrive as you scroll to them and react to where you
are, never on a timer, so they move exactly as fast as the reader and run backwards on the way up.
CSS scroll-driven animation does what it can see (the block at the end of `home.css`); `useScenes`
and `useLit` in `lib/motion.ts` do what needs measured positions. Unsupported browsers and reduced
motion get the finished frame.

- **Header:** a signal hairline along the bottom of the bar shows how far down the page you are.
- **Hero:** leaving it condenses the name again, the boot sequence played backwards.
- **About:** the intro lights up word by word; the rule nearest the middle of the screen is in focus
  (full ink, signal number) and the others wait at lower opacity.
- **Work:** the stacked scenes (above), with each rule lit word by word.
- **Experience:** the ruler draws left to right, so today lands last; the role you are reading gets a
  signal line across its top that fades as you move on.
- **Contact:** the mark powers up plane by plane, Machine to Interface, as you reach the end: the
  stack that booted at the top is fully online at the bottom.

## Phones

A phone is not a narrow desktop. Below 640 px the hero dissolves its copy column so the name, the
stack (bleeding off the left edge, labels beside the planes) and the buttons share the first screen.
Every hover effect needs a touch equivalent: `@media (hover: none)` gives controls a press state.
Nothing moves sideways: content comes up from below and eases into place as you scroll.
- **Index** (`pages/ProjectIndex.tsx`) and **case pages** (`pages/ProjectCase.tsx`). Missing content
  fields render nothing in production and a dashed "content slot" in dev.
- **Palette** (Ctrl/⌘ K or `/`, deliberately unadvertised): search plus a few typed commands; lazy-loaded.
- **View transitions** between pages; the project title morphs.

## Banned

- A second accent colour; colour as decoration; gradients other than masks; glow.
- Hard offset shadows (the token script fails on them).
- Fake terminals, simulated metrics, progress bars for skills, logo walls.
- Text that depends on colour alone; `--faint` or `--muted` below AA.
- Invented numbers, outcomes, clients or testimonials.

## Quality bars

- Lighthouse (mobile, simulated throttling): performance ≥ 95; accessibility, best practices, SEO 100.
- Keyboard complete; visible focus; skip link; every figure has an accessible name.
- One runtime dependency (React) plus self-hosted fonts. `vite build` warns above 300 kB for a chunk.
