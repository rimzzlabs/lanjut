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
  as a floating pill on scroll up). On mobile a floating bottom bar holds the logo on the left, and the theme toggle, the
  settings menu, and a Menu button on the right. Menu opens a drawer with the desktop
  links in the same order, then GitHub and the "Build your CV" action
  (`landing-mobile-menu.tsx`). The hero sets the headline,
  the deck, and the actions over a picture of the editor. Then the three pillars (free,
  open source, local-first), Looks, the read-back demo with the reader sheet, Features,
  Local, FAQ, a statement close, and a footer of titled link groups (Product, Project, Support). No
  kickers, eyebrows, section numbers, or stat rows.
- The download page (`/download`): the same frame as the privacy page, at full width,
  with the `/guide` header: the headline with one accent word and the lead beside it.
  A head script marks the visitor's system on `<html>` (`data-os`), and CSS shows one
  card with the installer for that system, or a card that sends phones and tablets to
  the editor. Every installer follows in a list by system, then the first-launch steps.
  Each link points at a stable file name on the latest release (`desktop-files.json`).
  A plain click on any installer link (`data-download`) also opens a thank-you dialog
  (`download-thanks.tsx`): a confetti burst unless motion is reduced, the file name, a
  Try again link to the same file, and a link to the first-launch steps. The link
  itself starts the download, so the dialog only listens, and a click that opens a
  new tab or window opens no dialog.
- The privacy page (`/privacy`) and the guides (`/guide`, `/guide/<slug>`): the same
  world, navbar, and footer as `/`, with one prose column under them
  (`landing-prose-page.astro`). A guide opens with a link back to all guides, the
  heading, a byline with its date, and a lead, and closes with a card that links to
  the editor and the templates. The examples guide draws the sample in every template.
  From `xl`, a guide's table of contents sits in a sticky rail on the right, and the
  column and the rail share the navbar's container. The `/guide` index uses the
  landing grids: the hero's headline with one accent phrase and the lead beside it,
  then a section with a sticky heading on the left and a row per guide on the right
  (reading time and date in the machine font, the title in the accent on hover).
- App pages (`/editor`, `/template`, `/profile`, `/changelog`): **Workbench-minimal**. They load
  client-only, and their first paint is the app's shell as static HTML, around the
  skeleton of the page, so the page reads the same before and after the script runs.
  The changelog's static shell holds the full release history. `/editor` and
  `/editor/<id>` are one file with a static shell for each, and the head script shows
  the one for the address. A saved collapsed sidebar is the icon rail from the first
  paint. The sidebar's "Recent" list loads as the number of rows it had on the last
  visit, so the groups under it stay in place, and it stays out on a first visit.
  The library loads on the block it had on the last visit, the continue card or the
  empty state, and the empty state shows its message only after the app reads the
  résumés. The Changelog dot shows only after the app mounts.
  Only the desktop app's root file still opens on the full-page
  loader (see Motion). Moving
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
  "View all" when there are more, then Other (Guide, Changelog, and Send feedback)
  and Support. With no résumé saved, "Recent" is left out, not shown empty.
  Changelog shows a dot until the person opens it after a release. A résumé's menu
  offers Delete even while it is open; deleting the open résumé returns to the
  library first.
- Guide starts the tour of the page on screen: the library, the templates, the
  profiles, or the editor. The changelog has no tour, so Guide is disabled there. Each tour also starts by itself the first time its page
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
  switch. Theme, language, animation, and Developer mode live in Preferences, not
  in the navbar. Developer mode is a `Switch`, off by default.
  The theme is three cards, each a small mockup of the app drawn with the real
  tokens of its theme (`.light` or `.dark` on the mockup); System splits the
  mockup diagonally.
- The Profiles page (`/profile`) lists every profile (avatar, name, person, job
  title, résumé count, an "Active" badge). From `lg` the list stays in view beside
  the chosen profile's card: who it is, Use this profile or Active, the form, and
  Delete. The card stops at `56rem`, so the fields keep a usable width on a wide
  screen. Below `lg` a row opens the same card in a drawer. Add new profile sits in
  the page header; while its form shows, a dashed "New profile, not saved yet" row
  is the current row in the list, and the form has Cancel. Delete shows only when
  more than one profile exists, and its confirmation picks where the résumés move.
- Under a profile's header, above its form, a Backup box (muted, no ring) says
  what the file holds and offers Download backup, plus Share where the system can
  share files (not in the desktop app). It sits high so a person finds it without
  scrolling past the form, and so the tour can point at it with room for its card.
  If a browser refuses the share, the backup downloads instead, with a toast that
  says so. The page header holds Import profile (outline) beside Add new profile.
  Import opens an alert dialog before anything changes: a line on the profile (new
  here, the same details, replaced by the newer file, or kept), three counts (new
  résumés, newer than the copy here, already up to date), and the note that nothing
  is deleted and Lanjut switches to the profile.
- The library (`/editor`) and the template page (`/template`) share one frame: a page
  header (title on the left, search and actions on the right, a hairline rule under
  them) over sections in a column that fills the page panel, so a wide screen
  gets more résumé columns, not wider margins. Each section has a small semibold
  heading over its content.
- The changelog (`/changelog`) is one release history in the same column: the
  title and a subtitle over a hairline rule, then one row per release. On the left
  of a row: the version in mono, which links to its GitHub release, the date, and
  Latest on the newest. On the right: each highlight as a
  title over its description. From `lg` the version column stays in view while its
  release scrolls past. From `xl` a Versions list stays in view on the right, marks
  the release being read, and scrolls on its own, keeping that release in view. Below `md` the version sits over the
  highlights. The same history is Markdown at `/changelog.md`.
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
  opens the same preview in a bottom drawer that rises to near the top of the screen.
  On a phone, the bar puts the name and the close button on one row, and the
  content switch and Use below it in two columns. With the sample,
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
- With Developer mode on, the editor has a code mode. A Form/Code `SegmentedControl`
  is the first item of the bar at the top left of the editor: the preview bar in the
  forms, and the code toolbar in the code mode. It is never in the navbar, and
  nothing that changes width comes before it, so it does not move. The code toolbar
  spans the editor. After the Form/Code switch it holds the view switch, three icon
  segments with a tooltip each (code, split, preview), and at its right edge the
  format `Select` (Markdown, YAML, JSON). In a split the code is the main panel on
  the left and the page is on the right, each from 30% of the width. Below `xl` a
  split has no room, so the views are code and preview. The code is a
  `CodeTextarea` that fills its panel, with no border and no ring: the caret shows
  focus, and the line under the code shows an error. The code, the toolbar, and
  that line share one left edge. Tab and Shift+Tab change the indent, and Escape,
  then Tab, leaves the code: from `lg` the right end of the line says so in `Kbd`
  keys. One
  line of fixed height under it says "Applied", or "Not applied" with the first
  error, so the code does not move as the person types. The page follows a valid
  text at once and keeps the last valid version while the text has an error. A
  format change or the switch back to Form asks first when it drops a text with an
  error. Layout, Styling, and Document stay in Form.
- The Styling and Document tabs group their controls by intent. Each group is an
  `EditorPanelSection`: an icon in a muted square, a title, one line on what the
  group is for, an optional action beside the title, then the controls.
  - Styling: General (résumé language, contact icons) first, then Typography
    (font, name, heading, and body size), Spacing (a Density choice of Compact,
    Balanced, or Airy, then between sections, lines, and letters), Contact labels
    (a short text in place of each filled email or link address), and Colors
    (name, section headings, lines, and links) last. Density sets the
    space between sections and the line height, as an offset from the
    template's own line height. Letter spacing is not density, so it stays. No
    segment shows as chosen once a slider moves off every preset. Typography, Spacing, Colors, and Contact labels each have their own reset, turned off while
    the group has its defaults. A color row offers the template's color, eight
    swatches, and a hex field with the contrast ratio and WCAG level beside the
    label. A color below AA on white (4.5:1 for text, 3:1 for lines) stays in the
    field with an error and never reaches the résumé. While a label is set, an
    `Alert` says that most applicant tracking systems read only the visible text. Language is content, so no reset touches it.
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
  redo, a rule, and the Section order menu (Experience first, Skills first). The
  menu marks the order the sections follow, and none after a manual drag. They
  live only there; in the edit sheet
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
  120ms with `--rise`. It rises 16px and does not fade, because a fade from opacity 0
  holds back the largest contentful paint until it ends. Reduced motion turns it off.
  It lives in `apps/web/src/styles/globals.css`. The static sections below the hero have
  no scroll motion.
- The reader sheet's intro sweep is the landing page's one authored motion. It is
  described under "Landing world: Two Readers".
- Inside React islands and the app, `motion/react` carries the motion.
- The desktop app's full-page loader (`platform-loading.astro`), which its root file
  shows, is SVG and CSS, so it plays before any JavaScript. A sheet writes its lines, a scan beam reads them and turns
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

- Marketing pages MAY use the Two Readers world: its own faces, the dark `--ink`
  panels, and live résumé renders on a white sheet with a 1px ring. No
  dotted-glow cards, no gradient clip-text, no pulsing badges.
- App pages MUST NOT use the display serif or enrichment. Restraint carries them.

## What pages MUST share

- The wordmark (the Reading Line mark + "Lanjut" set in Plus Jakarta Sans bold, everywhere via `font-brand`).
- The palette: the warm cream neutrals and the evergreen accent at ≤5% placement.
  The landing world takes them from the app.
- The Inter body / Geist Mono pairing, on every page except the landing page.
- The CTA voice (button shape, radius `--radius` 1rem with `rounded-md` controls, icon placement).
- Hairline rules (`border-foreground/15`) as the divider language, not card borders.

## What pages MAY differ on

- Section composition within the page-type family.
- Hero archetype on marketing.

## Landing world: Two Readers

The landing page (`/`, `apps/web/src/pages/[...lang]/index.astro`) wraps its content in
`<body data-world="readers">` (the `world` prop of `RootLayout`). That attribute
adds the machine tokens and the landing fonts on that page only. The colors are the
app's. The page has one subject: the same résumé, read by a person and
by a machine.

### Palette

The landing pages use the app's palette (`:root` and `.dark` above), so the site,
the editor screenshot in the hero, and the app share one warm cream background
and one evergreen accent. `[data-world="readers"]` in
`apps/web/src/styles/globals.css` adds only the machine tokens below, and the
landing fonts.

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
component. It sits in the read-back section, under the draft row.

- One white sheet (`bg-white` in both themes, `rounded-xl`, `ring-1 ring-black/10`, a
  soft drop shadow, a bottom fade mask). Aspect 3/4 on mobile, 16/10 from `sm`.
- Left of the scanner: the live résumé render (`ResumeThumbnail`) in the chosen
  template. It is in the static HTML, so the page shows at the first paint. Right of it: an `--ink` panel in `font-machine` with the text a parser
  pulled out of that page's PDF. Lines in all caps read as headings in `--machine`;
  the rest use `--machine-muted`.
- The read is real. `apps/web/src/hooks/use-landing-read.ts` renders the draft to a PDF and
  reads it back through `runParserProof`, in the PDF worker, so the page never waits for it. It starts when the sheet comes within 120px
  of the viewport, and runs again 900ms after typing pauses. A newer run supersedes an
  older one. Until a read lands, the panel shows the plain text export of the draft.
- The scanner is a 2px `--scanner` line with a glow, and a 44px round handle with
  `role="slider"`. Arrow keys move it 4%, Page Up and Page Down 12%, Home and End to
  the edges. A mouse can drag anywhere on the sheet. Touch drags from the handle, or
  from anywhere on the sheet once the finger moves sideways. An up or down swipe still
  scrolls the page.
- The intro sweep waits 700ms, moves the scanner from 40% to 34%, then back to 40%,
  with the ease-out curve. Any key or drag stops it. Under reduced motion it never
  plays, and the scanner rests at 40%.
- Status ("reading", the character count, or the fallback) and the read checks sit in
  `font-machine` with Phosphor check and x icons. Labels on the sheet fade out when
  the scanner covers them, and hide below `sm`, where a plain caption row replaces
  them.

### Composition

Every section is a `<section>` on `mx-auto w-11/12 max-w-6xl`, with bottom padding
`pb-24 md:pb-36` (the close uses `pb-28 md:pb-40`). Sections build on a 12-column grid
from `md`. No section carries a kicker, eyebrow, or number above its heading.

- Pillars (`landing-pillars.astro`): three columns between hairlines, right under
  the hero: free, open source, and local-first. Each has a duotone icon on a
  `bg-primary/10` tile, a short heading, and one sentence.
- Hero (`landing-hero.astro`): centered. The headline, with its last phrase in
  `text-primary` and each hyphenated word kept on one line (`headline-words.astro`),
  then the deck at `58ch`, then the actions in one row (`landing-hero-actions.tsx`):
  one labeled primary action, "Build your CV", and two 44px outline icon buttons for
  the templates and the download. Each icon button carries its name as visually
  hidden text and in a tooltip. The download name says the visitor's system
  (`data-os-only`, with the labels in `landing-download-labels.ts`). Then a
  screenshot of the editor (`landing-editor-shot.astro`, from
  `apps/web/src/assets/landing/editor.png`) in a `rounded-2xl` frame that fades
  into the page from 55% of its height (`mask-b-from-55%`). Astro's
  `Picture` writes it as AVIF and WebP at five widths, and it loads eagerly with high
  fetch priority, because it is the hero's largest element. The screenshot is of the
  light theme, so dark mode dims it to 85% brightness (`dark:brightness-85`). As it scrolls into view
  it settles from a 22° backward lean to flat (`landing-tilt` in `globals.css`, a
  scroll-driven CSS animation with no script). Browsers without view timelines and
  reduced motion show it flat. Retake the screenshot when the editor's layout changes.
- Looks (`landing-looks.astro`, `landing-looks.tsx`): from `lg` the section pins
  for one screen while the page scrolls through a track of about 340svh. The left 5
  columns hold the heading, the deck, and a list of five templates
  (`LANDING_SHOWCASE`, the most different looks) plus a closing "see more" row. The
  scroll opens one row at a time: a 2px `border-primary` marks it, and its body shows
  the description and an outline button that restyles the reader sheet below. The right 7
  columns hold one résumé page that fades to the open row, or three fanned pages for
  the closing row, which links to `/template`. A click on a row scrolls to its
  place in the track. Below `lg` nothing pins: the rows work as an accordion, and
  each open row draws its own page.
- Read-back (`landing-read-back.astro`): heading over 6 columns beside the deck, then
  the draft row (first name, last name, role, look, primary action) and the reader
  sheet (`landing-readers.tsx`).
- Features (`landing-features.astro`, `landing-feature-card.astro`): heading beside
  the deck, then a bento grid of nine cards on three columns from `lg` (two from
  `sm`). Each card has a duotone Phosphor icon on a `bg-primary/10` tile, a heading
  written as the phrase people search for, and one or two sentences. Profiles spans
  two columns with three example profile chips. Offline spans the full row with the
  download action for the visitor's system and the three system logos.
- Local (`landing-local.astro`): the one inverted band on the page,
  `bg-foreground text-background` at `rounded-2xl`, so it is dark on the light theme
  and light on the dark theme. The heading sits beside the deck, then three facts
  under a hairline (no account, no upload, your own backup), each with a duotone icon
  on a `bg-background/10` tile, then a link to `/privacy`. It is static HTML, with no
  island.
- FAQ (`landing-faq.astro`, `landing-faq.tsx`): the heading beside a GitHub issues
  link, then the questions in two columns from `lg`, each its own `Accordion` at
  `rounded-xl`: the first half, then the rest. Each answer says only what ships.
  Panels use `hiddenUntilFound`, so closed answers stay in the HTML for search and
  find-in-page.
- Close (`landing-closure.astro`): a centered call to action, then the hero's actions
  (`landing-closure-actions.tsx`, sharing `landing-secondary-actions.tsx` with the
  hero). Its primary action carries any draft typed in the read-back demo into the
  editor. Under it, a "Built in the open" card with the contributors row
  (`landing-contributors.tsx`): the contributors' faces (from the build, then
  refreshed from the Worker's daily list), an invitation to translate, fix a bug, or
  build a feature, and a plain "Contribute on GitHub" link.
- Footer (`landing-footer.astro`): over a top hairline, a brand column of 4 (wordmark,
  tagline, the three pillars as outline chips, a GitHub button with the star count
  from the build, and the byline), beside four link groups: Product (editor,
  templates, download, changelog), Resources (all guides, each guide by its heading,
  privacy), Open source (GitHub, contributing, bug report, feature request), and
  Support Lanjut (a one-line note over the donation links). A bottom row under a second hairline holds the copyright and plain
  links to the home page in English and Bahasa Indonesia, the current one marked.

Surfaces are four: `bg-secondary` fills, 1px `border-border` outlines, `--ink` panels,
and the one inverted band of the Local section. `--ink` marks machine content only.
Never put human copy on it.

### Controls

- Read-back controls are 44px tall (`h-11`): the draft fields, the look select, and
  the primary action. The scanner handle is 44px (`size-11`).
- Every landing action button is `size="lg"` at `h-11 px-5`: the hero actions, the
  import link, the download action, the close actions, the guide card, and the
  download page.
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
  in the hero headline, the file icons of the export card, marks the focus ring, and rings the picked look with its
  check. Link hover may use it.
- Everything else stays neutral: the desktop nav is all ghost buttons, in this
  order: Guides, Templates, Download, "Build your CV", the GitHub link
  with the star count, a hairline, then the theme toggle and the settings menu. The
  parser check icons are `--foreground`.
- GitHub and Linux use their usual marks from Simple Icons
  (`apps/web/src/components/shared/brand-icons.tsx`), not Phosphor's versions.
  Apple and Windows keep Phosphor's filled logos.
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
