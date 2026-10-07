# Design — Lanjut

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page; extend or amend this file when the
system needs to grow.

The canonical token source is [`src/styles/globals.css`](src/styles/globals.css) (shadcn
base-ui variables under `:root` / `.dark`). This file documents the intent behind
those values and the structural rules that CSS cannot encode. Where a value and this
file disagree, fix one to match the other; they must not drift.

## Genre

editorial

## Macrostructure family

- Marketing pages (`/`): **Two Readers**. One résumé is read twice: by a person, and
  by the parser that pulls text out of its PDF. The page has its own world, documented
  in "Landing world: Two Readers" below. Masthead nav (hides on scroll down and returns
  as a floating pill on scroll up; a bottom bar on mobile). The hero sets the headline
  and deck over the draft row and the reader sheet. Then Looks, Kept, Import, Exports,
  Local, Download, FAQ, a statement close, and a footer of titled link groups (Product,
  Project, Support). No kickers, eyebrows, section numbers, or stat rows.
- App pages (`/platform`, `/platform/template`): **Workbench-minimal**. A page header
  (title + hairline rule) over a toolbar over a grid. Function carries the page; no
  enrichment, no display serif.
- The editor page is `/platform/editor?id=...` on web and desktop. It renders the
  **Workbench-minimal** editor surface inside the platform shell.
- Utility pages (`/feedback`): **Workbench-minimal**, single column, capped at
  `max-w-xl`. A kind switch over a heading over the form. Reached from the
  sidebar dialogs' own surface or opened directly by the desktop app, which
  passes `kind`, `area`, and `client` as search params.
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

- Display: **Fraunces** (variable roman serif), weight ~600, style normal, via the
  `font-display` utility. The 404 page uses it. The landing page does not; its faces
  are in "Landing world: Two Readers". Never italic on headings.
- Brand wordmark: **Plus Jakarta Sans** bold, scoped via the `font-brand` utility.
- Body / app UI: **Inter** (`--font-sans`).
- Mono: **Geist Mono** (`--font-mono`) for measured values, captions, and the parser
  specimen. Never for labels above headings.
- The résumé document keeps its own independent font system; do not couple it to these.

## Spacing

4-point Tailwind scale. Use named utilities, never raw pixel values. Marketing content
column is `w-11/12 max-w-5xl` centered.

## Motion

- Easing `[0.16, 1, 0.3, 1]` (ease-out) on entrances.
- The landing entrance is CSS, so the static sections ship no JavaScript.
  `.landing-rise` plays once on load on the hero headline, deck, and reader, staggered
  120ms with `--rise`. Reduced motion swaps it for `landing-fade`. Both live in
  `src/styles/globals.css`. The static sections below the hero have no scroll motion.
- The reader sheet's intro sweep is the landing page's one authored motion. It is
  described under "Landing world: Two Readers".
- Inside React islands and the app, `motion/react` carries the motion.
- The animation setting (System, On, Off) lives in the navbar settings menu, on the
  landing page and in the app (`SiteSettingsMenu`). The head
  script and `useMotionStore` write it to `data-motion` on `<html>`. System follows
  `prefers-reduced-motion`.
- Reduced motion collapses spatial motion to opacity only. CSS reads `data-motion`
  (the `motion-safe` and `motion-reduce` variants follow it), and `motion/react`
  reads `useReducedMotionPreference`.

## Microinteractions stance

- Silent success over celebratory toasts.
- The editor navbar carries the save state of the open résumé: "Saved on this device",
  "Saving…", or a destructive "Not saved" button whose popover names the recovery.
  No toast, no animation beyond a 150ms fade.
- Focus is a first-class state: visible ring, shown instantly, never animated.
- Hover tooltips delay ~800ms; focus tooltips 0ms.

## CTA voice

- Primary CTA: filled evergreen (`Button` default), trailing `ArrowRightIcon`.
- Filled hover states mix the fill 12% toward `--foreground` (`color-mix` in oklch), as the
  secondary variant does. Do not fade a fill with an alpha such as `bg-primary/80`: it lightens
  the evergreen under white text to 3.6:1.
- Secondary CTA: `Button variant="outline"`, leading `MagnifyingGlassIcon`.
- Copy is verb-led and drawn from `messages/*.json` (i18n); never hard-code English.

## Per-page allowances

- Marketing pages MAY use the Two Readers world: its own tokens, faces, the dark
  `--ink` panels, and live résumé renders on a white sheet with a 1px ring. No
  dotted-glow cards, no gradient clip-text, no pulsing badges.
- App pages MUST NOT use the display serif or enrichment. Restraint carries them.

## What pages MUST share

- The wordmark (the Reading Line mark + "Lanjut" set in Plus Jakarta Sans bold, everywhere via `font-brand`).
- The evergreen accent and its ≤5% placement. The landing world uses its own logo
  green under the same budget.
- The Inter body / Geist Mono pairing, on every page except the landing page.
- The CTA voice (button shape, radius `--radius` 1rem with `rounded-md` controls, icon placement).
- Hairline rules (`border-foreground/15`) as the divider language, not card borders.

## What pages MAY differ on

- Section composition within the page-type family.
- Hero archetype on marketing.

## Landing world: Two Readers

The landing page (`/`, `src/pages/[...lang]/index.astro`) wraps its content in
`<body data-world="readers">` (the `world` prop of `RootLayout`). That attribute
re-points the shadcn tokens on that page only. Every primitive on the page inherits the world, and the app keeps the
evergreen broadsheet. The page has one subject: the same résumé, read by a person and
by a machine.

### Palette

Tokens live under `[data-world="readers"]` and `.dark [data-world="readers"]` in
`src/styles/globals.css`. The neutrals lean cool green (hue 165 to 168), not warm
cream.

Light:

- `--background` oklch(0.975 0.004 165): pale green-grey paper
- `--foreground` oklch(0.2 0.02 168)
- `--card` oklch(1 0 0), `--popover` oklch(0.99 0.003 165)
- `--primary` / `--ring` oklch(0.55 0.12 164): the logo green (`#0e8a66`)
- `--primary-foreground` oklch(0.99 0.005 160)
- `--secondary` / `--accent` oklch(0.93 0.008 165), `--muted` oklch(0.94 0.006 165)
- `--muted-foreground` oklch(0.45 0.02 168)
- `--border` oklch(0.88 0.01 168), `--input` oklch(0.86 0.012 168)

Dark:

- `--background` oklch(0.155 0.018 168), `--foreground` oklch(0.965 0.008 160)
- `--card` oklch(0.19 0.02 168), `--popover` oklch(0.2 0.02 168)
- `--primary` / `--ring` oklch(0.76 0.15 160), with ink foreground oklch(0.17 0.03 165)
- `--secondary` oklch(0.23 0.02 168), `--muted` oklch(0.22 0.02 168),
  `--accent` oklch(0.24 0.022 168)
- `--muted-foreground` oklch(0.74 0.02 165)
- `--border` oklch(0.3 0.022 168), `--input` oklch(0.33 0.024 168)

Machine tokens. These name the parser's side of the page:

- `--ink` oklch(0.17 0.02 168) light, oklch(0.12 0.016 168) dark: the panel a
  parser's output sits on. It stays dark in both themes.
- `--ink-line` oklch(0.3 0.025 168) light, oklch(0.28 0.022 168) dark: rules on ink.
- `--machine` oklch(0.86 0.1 158): machine text and headings on ink.
- `--machine-muted` oklch(0.66 0.05 162): body machine text on ink.
- `--scanner` oklch(0.74 0.16 160): the scanner line and handle only.

`--machine`, `--machine-muted`, and `--scanner` are set once, in the light block. Dark
inherits them, because they only ever sit on `--ink`.

### Faces

Both faces are declared in `astro.config.ts` and loaded only by the landing page,
through `<Font>` in `src/pages/[...lang]/index.astro`.

- **Schibsted Grotesk** (`--font-landing`, weights 400 to 900, preloaded). The world
  sets it as the wrapper's `font-family`, ahead of `--font-sans`. Headings use it at
  `font-extrabold` with negative tracking: the hero and the close at
  `text-[clamp(2.75rem,7.4vw,6rem)]` (close `8vw`), leading 0.95, tracking -0.035em.
  Section headings at `text-[clamp(2rem,4vw,3rem)]`, leading 1.02, tracking -0.03em.
- **Martian Mono** (`--font-machine`, the `font-machine` utility). It is for text a
  machine reads or writes, and nothing else: the parser's extracted lines, the
  machine label, the read checks, file extensions (`.pdf`, `.docx`), import file types,
  IndexedDB store names, build metadata. Never for human labels or headings.
- The wordmark keeps Plus Jakarta Sans bold (`font-brand`).

### Signature: the reader sheet

`src/components/landing/landing-reader-sheet.tsx` is the page's one signature
component. It sits in the hero, under the draft row.

- One white sheet (`bg-white` in both themes, `rounded-xl`, `ring-1 ring-black/10`, a
  soft drop shadow, a bottom fade mask). Aspect 3/4 on mobile, 16/10 from `sm`.
- Left of the scanner: the live résumé render (`ResumeThumbnail`) in the chosen
  template. Right of it: an `--ink` panel in `font-machine` with the text a parser
  pulled out of that page's PDF. Lines in all caps read as headings in `--machine`;
  the rest use `--machine-muted`.
- The read is real. `src/hooks/use-landing-read.ts` renders the draft to a PDF and
  reads it back through `runParserProof`. It starts when the sheet comes within 120px
  of the viewport, and runs again 900ms after typing pauses. A newer run supersedes an
  older one. Until a read lands, the panel shows the plain text export of the draft.
- The scanner is a 2px `--scanner` line with a glow, and a 44px round handle with
  `role="slider"`. Arrow keys move it 4%, Page Up and Page Down 12%, Home and End to
  the edges. A mouse can drag anywhere on the sheet. Touch drags only from the handle,
  so the page still scrolls.
- The intro sweep waits 700ms, moves the scanner from 58% to 34%, then back to 58%,
  with the ease-out curve. Any key or drag stops it. Under reduced motion it never
  plays, and the scanner rests at 58%.
- Status ("reading", the character count, or the fallback) and the read checks sit in
  `font-machine` with Phosphor check and x icons. Labels on the sheet fade out when
  the scanner covers them, and hide below `sm`, where a plain caption row replaces
  them.

### Composition

Every section is a `<section>` on `mx-auto w-11/12 max-w-6xl`, with bottom padding
`pb-24 md:pb-36` (the close uses `pb-28 md:pb-40`). Sections build on a 12-column grid
from `md`. No section carries a kicker, eyebrow, or number above its heading.

- Hero (`landing-hero.astro`): headline over 8 columns, deck over 4, bottom-aligned.
  One headline word takes `text-primary`. Then the draft row (first name, last name,
  role, look, primary action) and the reader sheet (`landing-readers.tsx`).
- Looks (`landing-looks.astro`, `landing-looks.tsx`): a sticky heading column of 4
  over template thumbnails in a grid of 3. On mobile it becomes a snap-scroll row.
  The heading column also holds an `--ink` plate with the section order the parser
  read (`landing-order-plate.tsx`). Picking a look re-reads the hero sheet; the plate
  shows the same order again. The picked look takes `ring-2 ring-primary` with a 4px
  `ring-offset-background` gap, and a green check beside its name.
- Kept (`landing-kept.astro`): allowed section types as `bg-secondary` chips, the
  custom section as a dashed neutral chip. The kept-out list is a hairline `dl` with
  a muted x before each plain name.
- Import (`landing-import.astro`): heading over 7 columns beside the deck and an
  outline link to the builder's import, then a full-width diagram below. Raw extracted
  lines sit on an `--ink` plate, then an arrow, then a hairline `dl` of the sections
  `parseResumeText` sorts them into. The one line it cannot place stays in Martian
  Mono under the leftovers label.
- Exports (`landing-exports.astro`): hairline rows, extension in Martian Mono beside
  its use. The `.pdf` row also shows the first lines of the hero's real read on an
  `--ink` plate (`landing-read-snippet.tsx`).
- Local (`landing-local.astro`): copy beside an `--ink` panel that draws the IndexedDB
  stores, with `--ink-line` rules.
- Download (`landing-download.astro`): one hairline-ruled macOS row with the action
  and the unsigned-build note, then a single muted line for Windows and Linux.
- FAQ (`landing-faq.astro`, `landing-faq.tsx`): a sticky heading column of 4 with a
  GitHub issues link, beside the `Accordion` primitive at `rounded-xl`. Each answer
  says only what ships. Panels use `hiddenUntilFound`, so closed answers stay in the
  HTML for search and find-in-page.
- Close (`landing-closure.astro`): a hero-size statement that Lanjut is free and open
  source, a deck that names the license, and the two actions.
- Footer (`landing-footer.astro`): wordmark and tagline, then titled link groups, over
  a top hairline.

Surfaces are three: `bg-secondary` fills, 1px `border-border` outlines, and `--ink`
panels. `--ink` marks machine content only. Never put human copy on it.

### Controls

- Hero controls are 44px tall (`h-11`): the four draft fields, the look select, and
  the primary action. The scanner handle is 44px (`size-11`).
- Every landing action button is `size="lg"` at `h-11 px-5`: the hero action, the
  close actions, and the macOS download.
- The desktop nav is 56px tall (`h-14`). Its buttons are 40px (`h-10`, `size-10`).
  The logo takes no hover fill while the nav floats as a pill.
- The primary action is the filled `Button` with a trailing `ArrowRightIcon`. The
  secondary is `variant="outline"` with a leading `MagnifyingGlassIcon`.

### Corners

- The landing page uses the app's `--radius: 1rem` and the Vega primitives, so its
  controls take `rounded-md` (12.8px), as on rimzzlabs.com.
- The nav bars use `rounded-[calc(var(--radius-md)+0.5rem)]`. Their buttons sit 8px
  inside the edge, so the two curves stay concentric: the desktop pill is `h-14`
  around 40px buttons, and the mobile bar is `h-12.5` around 36px buttons.
- Ink plates, the reader sheet, and the FAQ use `rounded-xl`. Chips and template
  thumbnails use `rounded-md`, and the sheet labels `rounded-sm`. The scanner handle
  stays a circle.
- `data-world` sits on `<body>` (the `world` prop of `RootLayout`), so popups that
  portal out of the page (select, dropdown, tooltip) share the same tokens.

### Accent budget

- The logo green (`--primary`) fills the primary actions, takes the one accent word
  in the hero headline, marks the focus ring, and rings the picked look with its
  check. Link hover may use it.
- Everything else stays neutral: the nav "Open app" is an outline button, and the
  hero's parser check icons are `--foreground`.
- `--scanner` is the brighter green. It belongs to the scanner line and handle only.
- No section is carpeted in green. The large color fields on the page are `--ink`,
  not green.

## Constraints inherited from AGENTS.md

These override any generic design guidance:

- Never restructure the résumé schema, IndexedDB layer, or export pipeline for looks.
- Compose `src/components/ui/*` primitives; do not hand-roll their equivalents.
- Named exports and named function declarations only. Props destructuring capped at 3.
- No em-dashes in authored copy. Lean comments. Format with Biome.

## Exports

### shadcn/ui CSS variables (light)

The live values are in [`src/styles/globals.css`](src/styles/globals.css). Mirror:

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
  --radius: 1rem;
}
```

### Fonts

```css
--font-display: "Fraunces", ui-serif, Georgia, serif; /* marketing headings */
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono", ui-monospace, monospace;
```
