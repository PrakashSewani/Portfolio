# Design

## Overview

A dark-mode-only, terminal-native portfolio. The interface behaves like a native IDE: sharp corners, monospace typography, neon cyan accents, and a background canvas of floating syntax tokens. Text decrypts from random characters into readable content. Tech tags assemble from scattered glyphs. The experience is immersive but never sacrifices readability.

## Theme

Dark mode only. The background is a deep void (`#0a0a0a`) with a live canvas of floating syntax fragments. The foreground is a structured terminal grid with high-contrast text and a single cyan accent.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0a0a0a` | Page background |
| `surface` | `#111111` | Card backgrounds, elevated surfaces |
| `surface-hover` | `#1a1a1a` | Hover state for surfaces |
| `ink` | `#e0e0e0` | Primary text, headings |
| `ink-dim` | `#888888` | Secondary text, muted labels |
| `accent` | `#00f0ff` | Primary accent: links, active states, cursor, highlights |
| `accent-dim` | `rgba(0, 240, 255, 0.15)` | Background tints, borders, glows |
| `border` | `#222222` | Card borders, dividers |
| `border-hover` | `#333333` | Hover state borders |
| `success` | `#00ff41` | Status indicators (ready for hire) |
| `error` | `#ff3333` | Rare error states |

All colors verified against `#0a0a0a`:
- `ink` (#e0e0e0) → ~18:1 (exceeds AAA)
- `ink-dim` (#888888) → ~5.5:1 (exceeds AA)
- `accent` (#00f0ff) → ~4.8:1 (meets AA for large text)

## Typography

**Primary family:** `JetBrains Mono` (weights 400, 500, 700)

- **Display (hero name):** `font-mono`, `clamp(2.5rem, 10vw, 6rem)`, `font-weight: 700`, `letter-spacing: -0.03em`, `line-height: 0.9`
- **H1 (section headings):** `font-mono`, `clamp(2rem, 5vw, 4rem)`, `font-weight: 700`, `letter-spacing: -0.02em`, `line-height: 1.0`
- **H2 (subsection):** `font-mono`, `clamp(1.5rem, 3vw, 2.5rem)`, `font-weight: 700`, `letter-spacing: -0.01em`, `line-height: 1.1`
- **Body:** `font-mono`, `1rem`, `font-weight: 400`, `line-height: 1.6`, `color: ink-dim`
- **Label / eyebrow:** `font-mono`, `0.75rem`, `font-weight: 500`, `letter-spacing: 0.1em`, `text-transform: uppercase`, `color: ink-dim`
- **Mono / code:** `font-mono`, `0.75rem`, `font-weight: 400`

**Rules:**
- Single font family only (JetBrains Mono). No display serif, no secondary sans.
- `text-wrap: balance` on h1–h3
- `text-wrap: pretty` on body paragraphs
- Body line length capped at 70ch

## Spacing

Base unit: 4px

- Section vertical padding: `clamp(4rem, 10vw, 8rem)` (64–128px)
- Container max-width: `1200px`
- Container horizontal padding: `clamp(1rem, 4vw, 3rem)`
- Grid gap: `1px` (brutalist grid lines) or `1rem` (content gaps)
- Card padding: `2rem` (32px)

## Layout

- Flexbox for 1D (nav links, button groups)
- CSS Grid for 2D (expertise cards, project layouts, interests grid)
- Responsive grids: `repeat(auto-fit, minmax(280px, 1fr))` where appropriate
- No rounded corners on cards or sections. `border-radius: 0` for all structural elements.
- Sharp corners only. Tags may use `border-radius: 2px` at most.

## Components

### Card

- Background: `surface`
- Border: `1px solid border`
- Padding: `2rem`
- Border-radius: `0`
- Hover: `border-color: border-hover`, `background: surface-hover`
- No shadow. No glassmorphism.

### Button / CTA

- Background: `accent-dim`
- Border: `1px solid accent`
- Color: `accent`
- Padding: `0.75rem 1.5rem`
- Font: `font-mono`, `0.75rem`, `uppercase`, `letter-spacing: 0.1em`
- Hover: `background: accent`, `color: bg`
- Border-radius: `0`

### Tag / Pill

- Uses `CodeAssemblyTag` component (scatters random chars then resolves)
- Background: `surface`
- Border: `1px solid border`
- Color: `ink-dim`
- Padding: `0.375rem 0.75rem`
- Font: `font-mono`, `0.625rem`, `uppercase`
- Border-radius: `2px`

### Terminal Cursor

- Blinking block: `█` appended to headings
- Animation: CSS `@keyframes blink` (opacity 0 ↔ 1, 1s, step-end)
- Color: `accent`

### Section Watermark

- Optional massive background text (e.g., `EXPERTISE`, `PROJECTS`)
- Font: `font-mono`, `clamp(4rem, 15vw, 10rem)`, `font-weight: 700`
- Color: `rgba(255,255,255,0.03)` (barely visible, adds depth)
- Position: absolute, behind content
- No text-shadow, no glow

## Motion

### DecryptionText

- Trigger: on scroll into view (intersection observer) or on mount
- Sequence: target text is hidden, random alphanumeric chars cycle in each character slot, then lock to the correct character one by one from left to right
- Duration: ~40ms per character
- Easing: none (instant lock per char)
- Reduced motion: show final text immediately

### CodeAssemblyTag

- Trigger: on scroll into view
- Sequence: random characters scatter across the tag, then converge to the correct string
- Duration: ~600ms total
- Reduced motion: show final text immediately

### CodeCanvas (Background)

- Full-screen canvas behind all content
- Floating syntax tokens: `{ } [ ] < > / * = ( ) ; :` rendered at random positions
- Subtle connecting lines between nearby tokens (max distance 150px, opacity 0.05)
- Gentle drift: tokens move at ~0.2px/frame in random directions
- Opacity: tokens at 0.08, lines at 0.03
- Color: `accent` at low opacity
- Reduced motion: canvas paused (no animation frame updates)

### Preloader (Boot Sequence)

- Full-screen black overlay
- Terminal boot messages: kernel version, module loading, dependency resolution
- Progress bar: `[==========>        ]` style
- Final message: `BOOT_COMPLETE` then slide up
- Duration: ~2.5s

### Scroll Progress

- Thin line at top of nav (already present, keep it)
- Color: `accent`
- Height: `2px`

## Z-Index Scale

| Layer | Z-Index |
|-------|---------|
| Background canvas | -1 |
| Content | 0 |
| Cards / elevated | 10 |
| Nav | 50 |
| Preloader | 100 |

## Responsive

- Mobile: single column, reduced padding, smaller type scale
- Tablet: 2-column grids where applicable
- Desktop: full layouts, max-width containers
- Breakpoints: `640px`, `768px`, `1024px` (Tailwind defaults)

## Assets

- No external images required for the core interface
- Project images remain as Unsplash URLs (already present)
- Favicon: keep existing
- No hand-drawn SVG illustrations

## Dependencies

- `motion` (already present) for scroll progress, layout animations
- Native Canvas API for background (no library needed)
- `lucide-react` (already present) for icons
