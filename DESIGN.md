# DESIGN.md — Sensor to Screen

The design contract for prakashsewani.com. `src/styles/tokens.css` is normative for colour;
`scripts/check-tokens.mjs` enforces it. Anything in the stylesheets that contradicts this file is a bug.

## Idea

The page **is** a signal path. A reading is only useful if it survives the trip from the sensor to
the screen, so the site is organised in those hops (Sense → Edge → Gateway → Services → Screen), and
the first thing a visitor sees is the claim being demonstrated rather than described: live telemetry
whose link drops, buffers at the sensor, and back-fills with nothing lost.

Look and feel: an instrument panel, not a poster. Restrained graphite (or warm paper), hairlines,
mono metadata, one serif for personality, one amber accent. Calm over loud.

## Principles

1. **Demonstrate, don't assert.** The hero is a working model with a test behind it. Figures are drawn
   from how each tool actually works and say they are illustrations.
2. **One accent.** Phosphor amber, for interaction, emphasis and the trace. `--ok` and `--bad` exist
   only to mean "link healthy" and "link down"; they are never decoration.
3. **Evidence before adjectives.** A case file leads with the problem, the decisions and the evidence.
   No invented metrics: every number comes from a repo or a content file.
4. **Two reading paths.** The 30-second skim (who, what, proof, contact) and the deep path (case
   pages, the archive, the command palette) read the same content at different densities.
5. **Motion explains.** Transform and opacity only, 140–600 ms, and `prefers-reduced-motion` is
   honoured everywhere (the hero renders one static frame mid-outage).
6. **Contrast is a test.** AA is checked by script in both themes, not eyeballed.

## Tokens

Defined in `src/styles/tokens.css`, two schemes (dark default, light "paper"), switched by
`data-theme` on `<html>` before first paint.

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--bg` | `#0c0d0f` | `#f4f1ea` | page |
| `--raised` | `#131519` | `#fbf9f4` | cards, palette |
| `--inset` | `#090a0b` | `#ebe7de` | figures, telemetry panel |
| `--ink` | `#ece8df` | `#16140f` | text |
| `--muted` | `#a09d95` | `#5b574e` | secondary text |
| `--faint` | `#8a877f` | `#6a6559` | mono metadata (still ≥ 4.5:1) |
| `--accent` | `#f5a524` | `#9a5700` | links, numbers, emphasis (text) |
| `--accent-fill` / `--on-accent` | `#f5a524` / `#17120a` | same | buttons, active chips |
| `--trace` | `#f5a524` | `#b86a00` | signal line, progress bar, packet (graphical, ≥ 3:1) |
| `--ok` / `--bad` | `#5ec27f` / `#ff7a6b` | `#1a6b38` / `#b3261e` | link up / link down only |

Run `npm run check:tokens` for the full pair table.

## Type

- **Instrument Serif** (display, italic for emphasis words): headings.
- **Geist** (variable): body.
- **JetBrains Mono** (variable): telemetry, metadata, labels, the palette. Ligatures off, so `--` stays `--`.

Labels are 11–12 px mono, uppercase, letter-spaced, and short. Body is 16 px at 1.6; prose is capped
near 60–65 characters.

## Signature elements

- **Telemetry panel** (`TelemetryPanel.tsx` + `lib/telemetry.ts`): four channels, 60 Hz, 7 s window.
  Cycle: 8 s live, 3 s outage (hatched gap, sensor buffering), 1.4 s back-fill (green). The HUD counts
  are computed from the same delivery function the canvas uses.
- **Signal path** (`SignalPath.tsx`): five stages as an ARIA tablist (arrow keys, Home/End); a packet
  slides between them. Each stage lists the projects built there.
- **Case files** (`Work.tsx`, `Figures.tsx`): problem → decisions → evidence → links beside a drawn SVG
  figure. A figure is keyed by `specimen.kind`; projects without one get a terminal card built from
  their own stack.
- **Archive** (`Archive.tsx`): a ledger filterable by stage, language and status, searchable, sortable.
- **Palette** (`Palette.tsx`): Ctrl/⌘ + K or `/`. Accepts commands (`whoami`, `contact`, `theme light`,
  `projects --lang rust --status shipped`, `goto work`) as well as plain search.

## Banned

- A second accent, gradients as decoration, glow beyond the signal packet.
- Hard offset shadows (the token script fails on them).
- Animation of anything but `opacity` and `transform` (plus the canvas).
- Text that depends on colour alone; `--faint` or `--muted` below AA.
- Invented numbers, logos or testimonials.

## Quality bars

- Lighthouse (mobile, simulated throttling): performance ≥ 95; accessibility, best practices and SEO 100.
- Keyboard complete; visible focus; skip link; every figure has an accessible name.
- One runtime dependency (React). `vite build` warns above 300 kB for a single chunk.
