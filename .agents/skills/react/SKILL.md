---
name: react
description: >-
  React conventions. Apply automatically whenever writing or editing React
  code — JSX/TSX files, components, hooks, props, effects, accessibility
  (WAI-ARIA), file grouping, React 19 APIs, React Compiler, URL state, and
  the React ecosystem (TanStack Query, Zustand, React Hook Form, nuqs, Next.js,
  money and crypto inputs). Builds on the typescript skill, which still
  applies. Use for any new React code or refactor.
---

# react — React conventions

Apply these rules to all React code: JSX, TSX, components, and hooks. They build
on the `typescript` skill. Apply that skill first — function style, `Result`
errors, type safety, immutability, and the rest all still hold here. This file
adds only what is specific to React and its ecosystem.

## 1. Declare components and hooks with the `function` keyword

Every top-level component and hook is a `function` declaration (typescript
rule 1). Arrow functions stay inline — event handlers, callbacks, render props.

```tsx
// ✓
export function UserCard(props: UserCardProps) {
  return <div>{props.name}</div>
}

function useUser(id: string) {
  // ...
}

// ✗ top-level arrow component
export const UserCard = (props: UserCardProps) => <div>{props.name}</div>
```

## 2. Export components by name

Export every component with a named export (typescript rule 12). Named exports
keep import names consistent and make find-references reliable. Use a default
export only where the framework requires it: a Next.js `page.tsx`,
`layout.tsx`, `loading.tsx`, `error.tsx`, or route handler.

```tsx
// ✓ named
export function UserCard(props: UserCardProps) { /* ... */ }

// ✗ default for a component
export default function UserCard(props: UserCardProps) { /* ... */ }

// ✓ framework requires default — Next.js page
export default function Page() { /* ... */ }
```

## 3. Take `props` as one object; destructure in the body

A component takes a single `props` parameter. Do not destructure in the
parameter list (typescript rule 10). If the props object has more than 5 keys,
do not destructure at all — read `props.x`.

```tsx
// ✗ inline destructure
export function UserCard({ name, email }: UserCardProps) { /* ... */ }

// ✓ destructure in the body
export function UserCard(props: UserCardProps) {
  const { name, email } = props
  // ...
}

// ✓ more than 5 keys — read from props
export function Widget(props: WidgetProps) {
  return <div title={props.title}>{props.label}</div>
}
```

## 4. Group component files by what they render

Put a feature's components in a directory named for the feature. Name each file
in kebab-case for the part it renders. Grouping by render target keeps a
feature's pieces together and readable.

```
user-table/
  user-table.tsx               # the top-level table
  user-table-list.tsx          # the list / body
  user-table-list-row.tsx      # a single row
  user-table-list-toolbar.tsx  # search, filter, and other controls
  user-table-pagination.tsx    # pager controls
```

Do not add an `index.ts` barrel to the directory (typescript rule 14). Import
each component from its own file.

## 5. Prefer composition over configuration

Build UI by composing small components. Do not grow one component with many
props or boolean flags to change what it renders. Composition keeps each piece
simple and reusable; a wall of configuration props does the opposite.

Export each part as its own named component, the way shadcn/ui does. Do not
attach subcomponents as properties — no `Card.Header` dot notation. Callers
import and compose the raw components by name.

```tsx
// ✗ configuration — flags crammed into one prop list
<Card title="User" bordered hasFooter footerText="Save" onFooterClick={save} />

// ✓ composition — flat, separately exported components (shadcn style)
<Card>
  <CardHeader>User</CardHeader>
  <CardBody>{/* ... */}</CardBody>
  <CardFooter>
    <Button onClick={save}>Save</Button>
  </CardFooter>
</Card>
```

When an interactive component needs to share local state across its parts,
**ask the user** how to share it: React Context, or a state library such as
Zustand. Pick Context for small, self-contained widget state; reach for Zustand
when the state is larger, shared more widely, or needs middleware (see the
Zustand section in [LIBRARIES.md](./LIBRARIES.md)).

## 6. Meet WAI-ARIA for interactive UI

Every interactive UI must comply with WAI-ARIA. Reach for the correct native
element first (`button`, `a`, `label`, `input`) — it brings roles, focus, and
keyboard behavior for free. Add ARIA only to fill real gaps: an accessible name
(`aria-label` / `aria-labelledby`), state (`aria-expanded`, `aria-selected`,
`aria-disabled`), and keyboard handling for custom widgets.

```tsx
// ✗ a div pretending to be a button — no role, no keyboard, no name
<div className="btn" onClick={close}>×</div>

// ✓ native element with an accessible name
<button type="button" aria-label="Close dialog" onClick={close}>×</button>
```

## 7. Do not reach for `useEffect` by default

Most effects are avoidable, and avoidable effects cause bugs (extra renders,
stale state, race conditions). Before you write `useEffect`, apply the guidance
in React's "You Might Not Need an Effect":

- **Deriving data from props or state?** Compute it during render — no state, no
  effect.
- **Responding to a user action?** Do the work in the event handler.
- **Resetting state when a prop changes?** Use a `key`, not an effect.
- **Caching an expensive result?** Use `useMemo` — unless React Compiler is on
  (rule 11), then write plain code.
- **Fetching server data?** Use TanStack Query (see
  [LIBRARIES.md](./LIBRARIES.md)), not `useEffect` + `useState`.
- **Subscribing to an external source that has a current value?** Use
  `useSyncExternalStore`, not `useEffect` + `useState` (see below).

Use `useEffect` only to synchronize with an external system — a non-React
widget, an analytics ping, an imperative API call — where nothing else fits.

**Subscriptions that return a value** (`window.matchMedia`, `navigator.onLine`,
a browser store, a third-party client with `subscribe` + `getSnapshot`) belong
in `useSyncExternalStore`. It reads the current value synchronously, so there is
no first render with a stale default, and it is safe under concurrent rendering.

```tsx
// ✗ effect + state: first render is wrong, then flashes to the real value
const [online, setOnline] = useState(true)
useEffect(() => {
  const update = () => setOnline(navigator.onLine)
  window.addEventListener("online", update)
  window.addEventListener("offline", update)
  return () => {
    window.removeEventListener("online", update)
    window.removeEventListener("offline", update)
  }
}, [])

// ✓ useSyncExternalStore: correct on first render, no effect
function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange)
  window.addEventListener("offline", onChange)
  return () => {
    window.removeEventListener("online", onChange)
    window.removeEventListener("offline", onChange)
  }
}

function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // server snapshot
  )
}
```

Setting React state from an event handler is not the kind of side effect that
typescript rule 3 restricts. It is how React works.

```tsx
// ✗ effect to derive state from other state
const [fullName, setFullName] = useState("")
useEffect(() => {
  setFullName(`${first} ${last}`)
}, [first, last])

// ✓ derive during render
const fullName = `${first} ${last}`
```

Reference: https://react.dev/learn/you-might-not-need-an-effect

## 8. Errors: return values in your code, throw only at React's boundaries

Frontend code returns errors as a `Result` value (typescript rule 7), so the UI
can render them. Two React boundaries are the exception — they use a thrown
error as their error channel and turn it into state for you:

- **TanStack Query** `queryFn` and `mutationFn` — a throw becomes
  `query.error` / `isError`. A returned `Result` breaks that.
- **Error boundaries** — a throw during render reaches the nearest boundary.

Keep your own functions returning `Result`, and throw only inside those
boundaries.

```tsx
// ✓ queryFn is a throw boundary
//   (key comes from a factory; signal flows from ctx — see LIBRARIES.md)
function userQuery(id: string) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: async (ctx) => {
      const res = await api.get(`/users/${id}`, { signal: ctx.signal })
      if (!res.ok) throw new Error("User not found") // becomes query.error
      return res.json() as Promise<User>
    },
  })
}
```

## 9. Render each query state explicitly

Do not stack `isLoading` / `isError` checks with early returns and fallthrough.
Branch on `status` so every state is visible and the compiler checks coverage.
With `ts-pattern` (typescript skill, data handling), `match` narrows `data` to
the `success` branch only.

```tsx
import { match } from "ts-pattern"

export function UserProfile(props: UserProfileProps) {
  const query = useQuery(userQuery(props.id))

  return match(query)
    .with({ status: "pending" }, () => <UserProfileSkeleton />)
    .with({ status: "error" }, (result) => <ErrorMessage error={result.error} />)
    .with({ status: "success" }, (result) => <UserCard user={result.data} />)
    .exhaustive()
}
```

Without `ts-pattern`, use a `switch` on `query.status` with a `never` check in
`default` (typescript rule 20).

## 10. On React 19, use the modern hooks; skip `use()` and actions

When the project is on React 19 or newer, prefer the current APIs over the
workarounds they replace:

- **`useEffectEvent`** — to read the latest props or state inside an effect
  without adding them to the dependency array. Do not reach for a `useRef`
  mirror.
- **`useDeferredValue`** — to keep typing responsive while an expensive list or
  chart re-renders. Do not hand-write a debounce for render work.
- **`useTransition`** — to mark a non-urgent state update.
- **`ref` as a prop** — do not wrap components in `forwardRef`.

Do **not** use these React 19 features:

- **`use()`** — the promise/context reader. Fetch with TanStack Query (rule 8,
  [LIBRARIES.md](./LIBRARIES.md)) and read context with `useContext`.
- **Form actions** — `<form action={fn}>`, `useActionState`, `useFormStatus`.
  Forms go through React Hook Form ([LIBRARIES.md](./LIBRARIES.md)).
- **Server actions** — `"use server"` functions called from the client.
  Mutations go through TanStack Query `useMutation` against an API route.

```tsx
// ✗ ref mirror to escape the dependency array
const onTickRef = useRef(onTick)
useEffect(() => { onTickRef.current = onTick })
useEffect(() => {
  const id = setInterval(() => onTickRef.current(), delay)
  return () => clearInterval(id)
}, [delay])

// ✓ useEffectEvent
const handleTick = useEffectEvent(onTick)
useEffect(() => {
  const id = setInterval(() => handleTick(), delay)
  return () => clearInterval(id)
}, [delay])
```

## 11. Use React Compiler on a modern codebase; do not memoize by hand

On a codebase that runs React 19 with a current build setup (Vite, Next.js 15+),
enable React Compiler (`babel-plugin-react-compiler`). When you start a new
project, **ask the user** once, then set it up.

When the compiler is on, do **not** write manual memoization:

- No `useMemo`, `useCallback`, or `React.memo` for performance. The compiler
  inserts them. Hand-written ones add noise and can block the compiler's own
  analysis.
- Write components and hooks as plain functions that follow the Rules of React
  (pure render, no mutation of props or state). The compiler skips any
  function that breaks them, and `eslint-plugin-react-compiler` reports why.

When the compiler is off (legacy codebase), memoize only after you measure a
real re-render cost, and say why in a comment (typescript rule 6).

```tsx
// ✗ with React Compiler on — redundant
const total = useMemo(() => sum(items), [items])
const onSelect = useCallback((id: string) => select(id), [select])

// ✓ plain code — the compiler memoizes
const total = sum(items)
function onSelect(id: string) {
  select(id)
}
```

## 12. Put shareable state in the URL

If a user would want to share, bookmark, or reload a view and see the same
thing — a filter, a sort, a page number, a selected tab, a search term — store
that state in the URL search params, not in `useState` or a store. Use `nuqs`
to read and write it (see [LIBRARIES.md](./LIBRARIES.md)).

Keep state out of the URL when it is transient or private: open menus, hover,
draft input, scroll position, auth tokens.

```tsx
// ✗ a filter in local state — lost on reload, cannot be shared
const [status, setStatus] = useState<Status>("all")

// ✓ a filter in the URL — ?status=active
const [status, setStatus] = useQueryState(
  "status",
  parseAsStringLiteral(STATUSES).withDefault("all"),
)
```

## Library conventions

When a project uses one of these libraries, follow
[LIBRARIES.md](./LIBRARIES.md):

- **TanStack Query** — query-key management, key/`signal` flow through
  `queryFn`, `queryOptions()`, invalidation through the key factory.
- **Zustand** — `immer` and `persist` middleware (`partialize`, `version`),
  optional auto-selectors.
- **React Hook Form** — bind fields through the UI library's field component, not
  `register()`; validate with a schema.
- **nuqs** — typed URL search-param state; parsers, defaults, and `shallow`
  updates.
- **Money and crypto amounts** — never `number`; a big-number library for
  math, `react-currency-input-field` for input, and the `""` default that makes
  it show its placeholder.

Dates and data handling (ts-belt, ts-pattern) are in the `typescript` skill's
`LIBRARIES.md`.
