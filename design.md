# Design — Lanjut

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page; extend or amend this file when the
system needs to grow.

The canonical token source is [`apps/web/src/styles/globals.css`](apps/web/src/styles/globals.css) (shadcn
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
- App pages (`/editor`, `/template`, `/profile`): **Workbench-minimal**. They load client-only, so
  the first paint is a full-page loader on the page background (see Motion). Moving
  between them keeps the shell. While a page's code loads, the content area shows a
  skeleton of that page: the library, the template list beside a blank sheet, the
  profiles, or the editor's blank sheet and side panel. Each skeleton is the loading
  state that the page itself shows next, so the two hand over without a jump. A
  skeleton keeps real whatever needs no data (headings, start tiles, toolbars,
  template names), follows the shape the data will take when it is already known,
  and draws a loading résumé page as white paper with faint lines, never a grey
  block. The avatar is a grey circle until the profiles load. Creating a résumé
  opens a wide Sheet in three steps (Start, Template, Review). From `lg` a preview
  beside the steps shows every page of the résumé being created, including an
  imported file; below `lg` the Template step is a carousel of page-wide previews,
  and a tap on a slide opens every page of that template in a drawer. Function
  carries the page; no enrichment, no display serif.
- The app shell: from `md` the sidebar and the navbar sit on
  `--sidebar`, the navbar beside the sidebar and as tall as its wordmark row. The
  page is one panel under the navbar: a border on its top and left, a `rounded-xl`
  top-left corner, and no gap to the window's right and bottom edges. Below `md`
  the navbar has a bottom border and the page fills the screen. The page scrolls
  inside the panel (`PlatformPageScroll`), not the window. Collapsed on
  desktop, the sidebar folds to a rail of icons with tooltips. The résumé list hides
  there, and a create button takes its place.
- The sidebar reads top to bottom with no gaps: the wordmark, then Dashboard,
  Templates, and Profiles, then "Recent" with the five résumés edited last and
  "View all" when there are more, then Other (Guide and Send feedback) and
  Support. With no résumé saved, "Recent" is left out, not shown empty. The version
  sits in the footer. A résumé's menu offers Delete even while it is open; deleting
  the open résumé returns to the library first.
- Guide starts the tour of the page on screen: the library, the templates, the
  profiles, or the editor. Each tour also starts by itself the first time its page
  opens. A tour only points. The spotlight blocks clicks on its target, and the page
  under the card is inert, sheets included, so no step can open a sheet or a menu.
  Focus moves to the card's primary button on each step. The editor tour walks the
  preview, the readiness bar, then the four tabs; below `xl` it shows the Edit
  button before the tabs. Below `md`, where the
  sidebar is a sheet, the library tour's two sidebar steps point at the menu
  button in the navbar and leave the sheet closed. The profiles tour walks the
  list, Add new profile, Import profile, the Backup box, and the avatar menu.
  Below `lg`, where a profile's details sit in a drawer, its Backup step points at
  the list and says where Backup is (a step's `narrow` form, beside its `phone`
  form below `md`). Below `sm` the two header buttons split the row, so every
  card stays on screen.
- The navbar holds the sidebar trigger, the breadcrumb, and the save state on the
  left; below `md` the breadcrumb hides. On the right it holds two 36px controls only: the GitHub link (icon only
  below `md`) and the profile menu. The profile menu is the active profile's avatar
  alone (photo or initials); its name, "Guest" until the person saves a profile,
  is for screen readers. It opens a card with the avatar, name, person, and email,
  the switch between profiles (each with its résumé count), and Settings,
  Preferences, and Add new profile. A profile is a workspace: switching it changes
  the library, Recent, and the template preview to that profile's résumés, and a
  new résumé joins it. Those three open one surface: a wide Sheet from `lg` with the
  sections in a side column, a Drawer below `lg` with the sections in a segmented
  switch. Theme, language, and animation live in Preferences, not in the navbar.
  The theme is three cards, each a small mockup of the app drawn with the real
  tokens of its theme (`.light` or `.dark` on the mockup); System splits the
  mockup diagonally.
- The Profiles page (`/profile`) lists every profile (avatar, name, person, job
  title, résumé count, an "Active" badge). From `lg` the list stays in view beside
  the chosen profile's card: who it is, Use this profile or Active, the form, and
  Delete. Below `lg` a row opens the same card in a drawer. Add new profile sits in
  the page header; while its form shows, a dashed "New profile, not saved yet" row
  is the current row in the list, and the form has Cancel. Delete shows only when
  more than one profile exists, and its confirmation picks where the résumés move.
- Under a profile's header, above its form, a Backup box (muted, no ring) says
  what the file holds and offers Download backup, plus Share where the system can
  share files (not in the Mac app). It sits high so a person finds it without
  scrolling past the form, and so the tour can point at it with room for its card.
  If a browser refuses the share, the backup downloads instead, with a toast that
  says so. The page header holds Import profile (outline) beside Add new profile.
  Import opens an alert dialog before anything changes: a line on the profile (new
  here, the same details, replaced by the newer file, or kept), three counts (new
  résumés, newer than the copy here, already up to date), and the note that nothing
  is deleted and Lanjut switches to the profile.
- The library (`/editor`) and the template page (`/template`) share one frame: a page
  header (title on the left, search and actions on the right, a hairline rule under
  them) over sections in a `max-w-7xl` column. Each section has a small semibold
  heading over its content.
- A résumé card is one link: its title stretches over the whole card
  (`CARD_LINK`), so there is no button inside it to compete. Its actions sit in a
  "…" menu that lifts above the link. Hover and focus ring the whole card.
- The library leads with the résumé edited last: a wide card with its sheet, title,
  template, edit time, a quiet "Open editor →" label, its readiness as a ring
  (`ProgressRing`) with the percent inside and "Readiness" under it (below `sm`,
  a 16px ring and "60% ready" under the edit time, so the title keeps its width),
  and the "…" menu (Rename, Duplicate, Download,
  Delete) in its corner. Below `md` a tap opens a drawer with
  every page and all the actions. Then the start row: four
  tiles (Blank, Sample, Import a file, Browse templates). The first three open the
  create Sheet with that source chosen, and Blank and Sample open on the Template
  step. Then all résumés, sorted by last edit or name, as a grid of cards or a list of
  rows. Between the start row and all résumés, a thank-you band shows the
  contributors' avatars (from GitHub, refreshed daily at 00:00 UTC) beside an
  invitation and a "Contribute on GitHub" link; without the list, the invitation
  stands alone. A search shows only the matches. An empty library shows the empty
  message over the start row.
- From `lg` the template page is a list beside a preview. The list is a radio group
  of template rows (sheet, name, description) that stays in view. The preview card
  shows the chosen template at full size, every page, on the sample or on one saved
  résumé ("Preview with"). Its bar (name, "Preview with", actions) stays at the top
  while the pages scroll. Below `lg` the page shows template cards only, and a card
  opens the same preview in a dialog that nearly fills the screen. With the sample,
  the action is Use, which opens the create Sheet. With a saved résumé, the action is
  Apply to that résumé: it opens the résumé and changes its template as one edit, so
  Undo in the editor brings the old template back.
- Corners in the app follow the Vega radii, and a nested corner is always
  concentric: its radius is the outer radius less the gap between the two edges.
  Cards are `rounded-xl` (22.4px). A tray 6px in (`p-1.5`) takes `rounded-lg`
  (16px). A thumbnail or icon box 12px to 13px in (`p-3`, plus a 1px border) takes
  `rounded-sm` (9.6px). Controls are `rounded-md`. Résumé paper that floats in a
  tray, away from its edges, keeps a small radius (`rounded-xs` to `rounded`),
  because it stands for a sheet of paper. A picture card whose width changes a
  lot (the theme picker) sets its radii in container units of its own width, so a
  narrow card is less round than a wide one and the nested corners stay concentric.
- The editor is `/editor/<id>` on web and desktop, served by the same page as the
  library. It shows the **Workbench-minimal** editor surface inside the platform
  shell. When the résumé does not exist, the not-found message takes the whole
  panel, with no side panel, edit sheet, or undo keys. From `xl`, the side panel
  holds a width in rem, so a wide screen gives its extra room to the page preview.
  It opens at 29% of the window, from 22rem to 28rem, and drags from 22rem to 40rem.
  It keeps its width when the window resizes. The tabs are Content, Layout,
  Styling, and Document, and fill the panel's width.
- The Styling and Document tabs group their controls by intent. Each group is an
  `EditorPanelSection`: an icon in a muted square, a title, one line on what the
  group is for, an optional action beside the title, then the controls.
  - Styling: Typography (font, name, heading, and body size), Spacing (a Density
    choice of Compact, Balanced, or Airy, then between sections, lines, and
    letters), and General (résumé language, contact icons). Density sets the
    space between sections and the line height, as an offset from the
    template's own line height. Letter spacing is not density, so it stays. No
    segment shows as chosen once a slider moves off every preset. Typography and Spacing each have their own reset, turned off while
    the group has its defaults. Language is content, so no reset touches it.
    Each slider row shows its value beside its label: a percent for sizes, a
    signed px offset or "Default" for spacing, and the line height to two
    decimals.
  - Document: Download (PDF, DOCX, or TXT, with a line on when to use the chosen
    format and a "Download PDF" button), Backup (a JSON or YAML switch, then Copy
    and Download), and Import (the file drop area, an "or" rule, the paste
    button, and the import disclaimer). The library's download dialog shows the
    same format hints for all five formats.
- The Content tab's forms follow the panel's width, not the window's. When a
  form is 28rem wide or more (the panel at about 30rem), paired fields sit side
  by side: company and location, context and website, email and phone, website
  and LinkedIn, issuer and certificate URL, and city, province, and country in
  one row. A title with its remove button, dates, and rich text stay full width.
- The paste dialog (`EditorDocumentPaste`) shows the pasted JSON or YAML in color
  in a `CodeTextarea` and checks it as the person types. It shows "Ready to
  import", the parser's syntax error, or the first three fields that do not match.
  On a blank résumé it offers Import. Otherwise it offers Replace this resume and
  Create a new resume, as a file import does.
- A bar above the page preview holds the readiness meter: a label ("60%
  ready", then "Ready to send"; "60%" alone on a phone) beside a thin `Progress`
  bar that fills the preview's width. At its right edge, on every screen, sit undo,
  redo, a rule, and Reset section order. They live only there; in the edit sheet
  below `xl`, the tabs start under the close button, with a gap. The bar stays in
  place, and only the page scrolls under it.
  The label opens a popover with ten checks. Each check opens its section on the
  Content tab and focuses its field. Below `xl`, it opens the edit sheet first. Personal
  Information, Summary, Experience, Education, and Skills carry a mark beside
  their title: a filled check when their checks pass, a dashed circle when not.
- Feedback is one guided flow in three steps (Kind, Details, Send), on two
  surfaces: in the app, a sheet from `lg` and a drawer below it, opened from
  "Send feedback" in the sidebar; and the `/feedback` page (**Workbench-minimal**,
  single column, capped at `max-w-2xl`), which the desktop app opens in a window
  with `kind`, `area`, `app`, `os`, `template`, `font`, and `doclang` as search
  params (older builds still send `client`, and the page reads it).
  - Kind: three radio cards, each with an icon and an example: something is
    broken, an idea, a wrong word or translation. Under them, "Do you have a
    GitHub account?" decides the delivery. "No, send it for me": Lanjut posts it
    through the Worker. "Yes, I'll post it myself": the flow opens the issue
    prefilled on GitHub, where GitHub tells them about replies. With direct
    sending off, the question hides and every report takes the GitHub path.
  - Details: required fields carry the red asterisk from the start, and an error
    clears as soon as the field is fixed. Long answers use the minimal rich-text
    editor (lists, bold, italic, underline, links) and reach GitHub as Markdown.
    A bug asks for a short title, the area, what was done, what was
    expected, what happened instead, and how often. An idea asks for the
    situation first, then what would help, how it is handled today, and how much
    it matters, under a scope note. A wording fix asks for the language, the text
    as it is, and the better wording. Under a title, similar GitHub issues appear
    as the reporter types, so they can add to one instead of filing it twice.
  - Send: the report as it goes to GitHub and the technical details listed in
    full behind a switch that leaves them out. When Lanjut posts it, an optional
    public name and the bot check join them, and the primary action is Send; on
    the GitHub path it is Open on GitHub, with no name and no bot check.
  - After sending, a confirmation links to the issue, where the reporter can add a
    screenshot.
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
  `apps/web/src/styles/globals.css`. The static sections below the hero have no scroll motion.
- The reader sheet's intro sweep is the landing page's one authored motion. It is
  described under "Landing world: Two Readers".
- Inside React islands and the app, `motion/react` carries the motion.
- The app's full-page loader (`platform-loading.astro`) is SVG and CSS, so it plays
  before any JavaScript. A sheet writes its lines, a scan beam reads them and turns
  them green, and the Lanjut mark stamps the corner. The loop is 3.2s. Every element
  rests on the finished sheet, so reduced motion shows that sheet and only fades
  the lines.
- The animation setting (System, On, Off) lives in the navbar settings menu on the
  landing page (`SiteSettingsMenu`) and in Preferences in the app. The head
  script and `useMotionStore` write it to `data-motion` on `<html>`. System follows
  `prefers-reduced-motion`.
- Reduced motion collapses spatial motion to opacity only. CSS reads `data-motion`
  (the `motion-safe` and `motion-reduce` variants follow it), and `motion/react`
  reads `useReducedMotionPreference`.

## Microinteractions stance

- Silent success over celebratory toasts. A toast is for something the person must
  act on: Undo after a delete, closing another tab so a database upgrade can run,
  or refreshing a tab that a newer build took over.
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
- Copy is verb-led and drawn from `packages/i18n/messages/*.json` (i18n); never hard-code English.

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

The landing page (`/`, `apps/web/src/pages/[...lang]/index.astro`) wraps its content in
`<body data-world="readers">` (the `world` prop of `RootLayout`). That attribute
re-points the shadcn tokens on that page only. Every primitive on the page inherits the world, and the app keeps the
evergreen broadsheet. The page has one subject: the same résumé, read by a person and
by a machine.

### Palette

Tokens live under `[data-world="readers"]` and `.dark [data-world="readers"]` in
`apps/web/src/styles/globals.css`. The neutrals lean cool green (hue 165 to 168), not warm
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
through `<Font>` in `apps/web/src/pages/[...lang]/index.astro`.

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

`apps/web/src/components/landing/landing-reader-sheet.tsx` is the page's one signature
component. It sits in the hero, under the draft row.

- One white sheet (`bg-white` in both themes, `rounded-xl`, `ring-1 ring-black/10`, a
  soft drop shadow, a bottom fade mask). Aspect 3/4 on mobile, 16/10 from `sm`.
- Left of the scanner: the live résumé render (`ResumeThumbnail`) in the chosen
  template. Right of it: an `--ink` panel in `font-machine` with the text a parser
  pulled out of that page's PDF. Lines in all caps read as headings in `--machine`;
  the rest use `--machine-muted`.
- The read is real. `apps/web/src/hooks/use-landing-read.ts` renders the draft to a PDF and
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
  outline link to the editor's import, then a full-width diagram below. Raw extracted
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
  source, a deck that names the license, and the two actions. Under a hairline rule
  below them, the contributors row (`landing-contributors.tsx`): the contributors'
  faces (from the build, then refreshed from the Worker's daily list), an invitation
  to translate, fix a bug, or build a feature, and a plain "Contribute on GitHub"
  link. It shows the open-source claim where the page makes it, and it adds no heading to compete with the statement.
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
- Everything else stays neutral: the nav "Build now" is an outline button, and the
  hero's parser check icons are `--foreground`.
- `--scanner` is the brighter green. It belongs to the scanner line and handle only.
- No section is carpeted in green. The large color fields on the page are `--ink`,
  not green.

## Constraints inherited from AGENTS.md

These override any generic design guidance:

- Never restructure the résumé schema, IndexedDB layer, or export pipeline for looks.
- Compose `packages/ui/src/components/*` primitives; do not hand-roll their equivalents.
- Named exports and named function declarations only. Props destructuring capped at 3.
- No em-dashes in authored copy. Lean comments. Format with Biome.

## Exports

### shadcn/ui CSS variables (light)

The live values are in [`apps/web/src/styles/globals.css`](apps/web/src/styles/globals.css). Mirror:

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
