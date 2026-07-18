# Design — Lanjut

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page; extend or amend this file when the
system needs to grow.

The canonical token source is [`src/app/globals.css`](src/app/globals.css) (shadcn
base-ui variables under `:root` / `.dark`). This file documents the intent behind
those values and the structural rules that CSS cannot encode. Where a value and this
file disagree, fix one to match the other; they must not drift.

## Genre

editorial

## Macrostructure family

- Marketing pages (`/`): **Long Document**. Masthead nav, left-biased serif hero,
  hairline-ruled sections, numbered document rhythm, statement close. Varies only in
  section content, not shape.
- App pages (`/platform`, `/platform/template`): **Workbench-minimal**. A page header
  (title + hairline rule) over a toolbar over a grid. Function carries the page; no
  enrichment, no display serif.
- Content pages: none currently.

## Theme — "evergreen broadsheet"

Warm-cream paper, deep evergreen accent, warm-green-tinted neutrals and hairlines.
Mapped onto the existing shadcn variable names so every primitive inherits it.

Light:

- `--background` oklch(0.988 0.006 92) — warm cream (never pure #fff)
- `--foreground` oklch(0.2 0.014 155) — deep evergreen-tinted ink
- `--primary` oklch(0.505 0.13 160) — evergreen accent
- `--muted-foreground` oklch(0.505 0.022 140)
- `--border` / `--input` oklch(0.905 0.008 100) — warm hairline
- `--ring` oklch(0.505 0.13 160) — focus reads as the accent

Dark:

- `--background` oklch(0.17 0.014 155) — warm-green charcoal
- `--foreground` oklch(0.965 0.006 95)
- `--primary` oklch(0.72 0.13 162) with dark ink foreground oklch(0.19 0.02 160)

Accent footprint stays under ~5% per viewport: one wordmark link, CTA fills, active
state, focus ring, a single highlighted headline word. Never carpet a section in it.

## Typography

- Display: **Fraunces** (variable roman serif), weight ~600, style normal. Scoped to
  marketing headings via the `font-display` utility. Never italic on headings.
- Body / app UI: **Inter** (`--font-sans`).
- Mono: **Geist Mono** (`--font-mono`) — kickers, captions, the parser specimen.
- The résumé document keeps its own independent font system; do not couple it to these.

## Spacing

4-point Tailwind scale. Use named utilities, never raw pixel values. Marketing content
column is `w-11/12 max-w-5xl` centered.

## Motion

- `motion/react`. Easing `[0.16, 1, 0.3, 1]` (ease-out) on entrances.
- Reveal pattern: one orchestrated hero entrance (stagger ~0.12s); quiet fade-up on
  scroll for later sections, `once: true`.
- `useReducedMotion` collapses spatial motion to opacity only.

## Microinteractions stance

- Silent success over celebratory toasts.
- Focus is a first-class state: visible ring, shown instantly, never animated.
- Hover tooltips delay ~800ms; focus tooltips 0ms.

## CTA voice

- Primary CTA: filled evergreen (`Button` default), trailing `ArrowRight`.
- Secondary CTA: `Button variant="outline"`, leading `Search`.
- Copy is verb-led and drawn from `messages/*.json` (i18n); never hard-code English.

## Per-page allowances

- Marketing pages MAY use the display serif and real product screenshots framed with a
  hairline border. No dotted-glow cards, no gradient clip-text, no pulsing badges.
- App pages MUST NOT use the display serif or enrichment. Restraint carries them.

## What pages MUST share

- The wordmark (favicon mark + "Lanjut" set in the display serif on marketing, sans in app).
- The evergreen accent and its ≤5% placement.
- The Inter body / Geist Mono pairing.
- The CTA voice (button shape, radius `--radius` 0.4rem, icon placement).
- Hairline rules (`border-foreground/15`) as the divider language, not card borders.

## What pages MAY differ on

- Section composition within the page-type family.
- Hero archetype on marketing.

## Constraints inherited from AGENTS.md

These override any generic design guidance:

- Never restructure the résumé schema, IndexedDB layer, or export pipeline for looks.
- Compose `src/components/ui/*` primitives; do not hand-roll their equivalents.
- Named exports and named function declarations only. Props destructuring capped at 3.
- No em-dashes in authored copy. Lean comments. Format with Biome.

## Exports

### shadcn/ui CSS variables (light)

The live values are in [`src/app/globals.css`](src/app/globals.css). Mirror:

```css
:root {
  --background: oklch(0.988 0.006 92);
  --foreground: oklch(0.2 0.014 155);
  --primary: oklch(0.505 0.13 160);
  --primary-foreground: oklch(0.985 0.012 150);
  --muted: oklch(0.955 0.008 95);
  --muted-foreground: oklch(0.505 0.022 140);
  --border: oklch(0.905 0.008 100);
  --ring: oklch(0.505 0.13 160);
  --radius: 0.4rem;
}
```

### Fonts

```css
--font-display: "Fraunces", ui-serif, Georgia, serif; /* marketing headings */
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono", ui-monospace, monospace;
```
