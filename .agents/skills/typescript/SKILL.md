---
name: typescript
description: >-
  TypeScript/JavaScript conventions. Apply automatically whenever
  writing or editing JavaScript, TypeScript, JSX, or TSX code (.js/.jsx/.ts/.tsx)
  — functions, types, type safety, immutability, error handling, comments,
  file size, exports, naming, and library conventions for dates and data
  handling (ts-belt, ts-pattern). Use for any new code or refactor in these
  languages. For React-specific rules (components, hooks, JSX, TanStack Query,
  Zustand, React Hook Form), also apply the react skill.
---

# typescript — TypeScript/JavaScript conventions

Apply these rules to all JavaScript, TypeScript, JSX, and TSX code. They keep
code declarative, low in cognitive load, and easy to maintain. Follow them for
new code and when you refactor existing code.

React code follows these rules too. The `react` skill adds rules for
components, hooks, JSX, and the React ecosystem on top of this file.

## 1. Use the `function` keyword; keep arrow functions inline

Declare every top-level (module-scope) function with the `function` keyword.
Use arrow functions only inline — inside a block, a callback, or a returned
expression. (React components and hooks follow the same rule — see the `react`
skill.)

```ts
// ✓ top-level declaration
export function getUser(id: string) {
  return db.users.find((user) => user.id === id)
}

// ✗ top-level arrow
export const getUser = (id: string) => { /* ... */ }

// ✓ inline arrow in a callback
const ids = users.map((user) => user.id)
```

## 2. At most 2 parameters; use an object beyond that

A function takes 2 parameters at most. When you have more than 2 logical
arguments, collapse **all** of them into a single object — do not keep one
positional argument and push the rest into an options object.

```ts
// ✓ one object holds everything
function createUser(params: CreateUserParams) { /* ... */ }

// ✗ three positional params
function createUser(name: string, age: number, email: string) { /* ... */ }

// ✗ dodging the cap by splitting into primary + rest
function createUser(name: string, rest: { age: number; email: string }) { /* ... */ }
```

A true 2-argument function is fine (for example `slice(list, count)`); the rule
only forces a single object once the count would exceed 2.

## 3. Minimize side effects

Keep functions pure. Allow side effects only when the task is inherently an
effect — for example, opening a connection to an external service (WebSocket,
database, message queue). Isolate those effects; do not mix them into pure
logic.

## 4. Prefer declarative code; use imperative only for performance

Prefer declarative constructs (`map`, `filter`, `reduce`, composition). Use
imperative loops only for performance — for example, iterating over very large
data, where a plain loop is measurably faster. Say why in a comment when you do.

```ts
// ✓ declarative
const names = users.map((user) => user.name)

// ✓ imperative — justified by scale
// hot path: avoids allocating an intermediate array over ~1e6 rows
for (let i = 0; i < rows.length; i += 1) {
  total += rows[i].amount
}
```

## 5. No bare `.filter(Boolean)` or `.sort()` — write the callback

Always pass an explicit predicate or comparator. It states intent and avoids
surprises (coercion, default string sort). Do not sort in place — use the
non-mutating `toSorted` so the source array is untouched.

```ts
// ✗
const clean = list.filter(Boolean)
const ordered = nums.sort()            // bare + mutates the source
const ordered2 = nums.sort((a, b) => a - b) // still mutates the source

// ✓
const clean = list.filter((item) => item !== null)
const ordered = nums.toSorted((a, b) => a - b)
```

Escape hatch (rule 4): for a very large array in a hot path, an in-place
`sort((a, b) => ...)` avoids the copy `toSorted` makes — use it there, with an
explicit comparator, on an array you own.

## 6. Comment only complex or expensive work

Let simple code describe itself. Add a comment only when a function, class, or
expression does expensive or complex work — explain the "why", not the "what".

```ts
// ✓ no comment needed
function fullName(user: User) {
  return `${user.firstName} ${user.lastName}`
}

// ✓ comment earns its place
// Debounced to one call per frame; resize fires ~60x/second on drag.
function onResize() { /* ... */ }
```

## 7. Errors: value in the frontend, thrown in the backend

- **Frontend files:** do not throw. Return the error as a value, so the UI can
  render it. The failure must reach the interface, not crash it.
- **Backend files:** throw errors. At a protocol boundary (REST and similar),
  map the thrown error to a known error with the correct status code, and return
  that.
- **Library boundaries that expect a throw:** some libraries use a thrown error
  as their error channel and turn it into error state for you. There you must
  throw; a returned `Result` breaks their error handling. Keep your own pure
  functions returning `Result`, and throw only at that boundary. (TanStack Query
  and React error boundaries are the common cases — see the `react` skill.)

Return errors with a `Result` union:

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

```ts
// ✓ frontend — error as value
async function loadUser(id: string): Promise<Result<User>> {
  const res = await api.get(`/users/${id}`)
  if (!res.ok) return { ok: false, error: new Error("User not found") }
  return { ok: true, value: await res.json() }
}

// ✓ consume it — the failure reaches the UI, never crashes it
const result = await loadUser(id)
if (!result.ok) return renderError(result.error)
renderUser(result.value)

// ✓ backend — throw, then map at the boundary
function getUser(id: string) {
  const user = db.users.find((row) => row.id === id)
  if (!user) throw new NotFoundError("user", id)
  return user
}
```

## 8. Cap files at 600–800 lines

Keep a file under ~600–800 lines. When a file is about to cross that, move a
function or expression into another file. Smaller files are easier to read,
review, and maintain.

## 9. Prefer `interface` over `type`

Declare object shapes with `interface`. Use `type` only when required — for
example, discriminated unions, primitive aliases, or mapped/conditional types.

```ts
// ✓
interface User {
  id: string
  name: string
}

// ✓ type is required here
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
```

## 10. Do not destructure object parameters inline

Destructure inside the function body, not in the parameter list. If the object
has more than 5 keys, do not destructure at all — access via the parameter.

```ts
// ✗ inline destructure
function createUser({ name, age }: CreateUserParams) { /* ... */ }

// ✓ destructure in the body
function createUser(params: CreateUserParams) {
  const { name, age } = params
  // ...
}

// ✓ more than 5 keys — no destructure
function buildQuery(options: QueryOptions) {
  return `${options.table} ${options.where} ${options.orderBy} ${options.limit}`
}
```

## 11. Keep cognitive load low

Write code a reader can hold in their head. Short functions, clear names, few
branches. This reinforces rule 8 — long files and long functions raise
cognitive load. Split before that happens.

## 12. Prefer named exports over default exports

Export with named exports. Named exports keep import names consistent and make
refactors and find-references reliable. Use a default export only where a
framework requires it (for example a Next.js route file — see the `react`
skill).

```ts
// ✓ named
export function formatDate(date: Date) { /* ... */ }

// ✗ default for a util
export default function formatDate(date: Date) { /* ... */ }
```

## 13. Name files and directories in kebab-case

Name directories and files in kebab-case. One name style across the repo keeps
imports predictable and avoids case-sensitivity bugs between file systems.

```
lib/
  date-format.ts
  query-builder.ts
services/
  user-service.ts
```

For how to group React component files, see the `react` skill.

## 14. Avoid barrel files

Do not create `index.ts` files whose only job is to re-export other modules.
Barrel files invite circular-dependency traps, defeat tree-shaking (the bundler
pulls the whole barrel to reach one symbol), and slow builds and editor tooling.
Import from the module that actually defines the symbol.

Escape hatch: a published package's single public entry point (its `exports` /
`main`) is a legitimate barrel — a deliberate boundary, not an internal hub.

```ts
// ✗ src/components/index.ts — a re-export hub
export * from "./user-card"
export * from "./user-table"

// ✗ importing through the barrel
import { UserCard } from "@/components"

// ✓ import from the defining module
import { UserCard } from "@/components/user-card"
```

## 15. Do not over-extract

Prefer one linear, readable function over a scatter of tiny single-use helpers.
Fragmenting a single flow into micro-functions spreads it across the file and
raises cognitive load (rule 11) — the opposite of what the split promised.

Extract a function when the piece is **reused**, is **worth testing on its own**,
or has a name that genuinely clarifies intent. Do not extract only to shrink a
line count. This balances rule 8: split a *file* when it grows, but do not
shatter a *function* to get there.

```ts
// ✗ over-extracted — one flow smeared across single-use helpers
function getTax(order: Order) { return order.total * 0.1 }
function getShipping(order: Order) { return order.total > 100 ? 0 : 5 }
function getGrandTotal(order: Order) {
  return order.total + getTax(order) + getShipping(order)
}

// ✓ linear and readable; extract a piece later if it gets reused
function getGrandTotal(order: Order) {
  const tax = order.total * 0.1
  const shipping = order.total > 100 ? 0 : 5
  return order.total + tax + shipping
}
```

## 16. Duplicate until the abstraction is obvious

Do not abstract on the first sight of similarity. Code that merely *looks* alike
today — but changes for different reasons — turns a shared helper into a coupling
trap that grows flags and special cases. Wait for the third occurrence, or for a
real shared reason to change, before you extract. Duplication is cheaper than the
wrong abstraction.

Escape hatch: obvious, stable, single-reason logic (a currency formatter, a date
parser) can be shared straight away — the rule targets *speculative* abstraction,
not clearly-shared utilities.

```ts
// invoice rounding follows tax law; cart rounding follows display preference.
// ✗ merging them now couples tax rules to UI rules
function roundMoney(value: number) { return Math.round(value * 100) / 100 }

// ✓ let the two live apart until a genuine third, shared case appears
```

## 17. Prefer `if` over ternaries; never nest a ternary

Prefer an `if` statement or an early return over a ternary. A ternary hides a
branch inside an expression, and the reader must unpack it. Use a ternary only
for a short, single-level choice between two plain values. Never nest a ternary
inside another ternary. When a value depends on more than two cases, use `if`
blocks, a lookup object, or `ts-pattern` (see [LIBRARIES.md](./LIBRARIES.md)).

```ts
// ✗ nested ternary — three branches packed into one expression
const label = count === 0 ? "none" : count === 1 ? "one" : "many"

// ✓ early returns — each branch is visible
function getLabel(count: number) {
  if (count === 0) return "none"
  if (count === 1) return "one"
  return "many"
}

// ✓ lookup object for a fixed set of cases
const labelByStatus: Record<Status, string> = {
  idle: "Idle",
  loading: "Loading…",
  error: "Failed",
}
const label = labelByStatus[status]

// ✓ acceptable — one level, two plain values, fits on one line
const shipping = order.total > 100 ? 0 : 5
```

## 18. No `as` casts and no `!` assertions

Do not use `as` to silence the compiler, and do not use the `!` non-null
assertion. Both tell TypeScript to trust you and remove the check that would
catch the bug. Narrow the type instead: an early return, a type guard, or
`instanceof`. The only allowed cast is `as const`.

```ts
// ✗ cast and assertion hide the missing check
const user = data as User
const name = users.find((row) => row.id === id)!.name

// ✓ narrow, then use
const match = users.find((row) => row.id === id)
if (!match) return { ok: false, error: new Error("User not found") }
const name = match.name

// ✓ the one allowed cast
const STATUSES = ["idle", "loading", "error"] as const
```

## 19. No `any`; validate `unknown` at the boundary

Do not use `any`. Data that enters from outside — a network response,
`JSON.parse`, `localStorage`, an env var, a `catch` clause — is `unknown`.
Validate it once at that boundary with a schema (zod, valibot, or the project's
choice) and trust the type after that. Do not read `e.message` from a `catch`
without a check.

```ts
// ✗ trusts the wire
const user: User = await res.json()

// ✓ validate once at the boundary
const parsed = userSchema.safeParse(await res.json())
if (!parsed.success) return { ok: false, error: new Error("Bad user payload") }
const user = parsed.data

// ✗ assumes the thrown value is an Error
catch (e) { log(e.message) }

// ✓ check first
catch (e) {
  const message = e instanceof Error ? e.message : String(e)
  log(message)
}
```

## 20. Exhaust every discriminated union

When you branch on a union's discriminant, make the compiler fail when a case is
missing. End a `switch` with a `never` check, or use `ts-pattern` with
`.exhaustive()` (see [LIBRARIES.md](./LIBRARIES.md)). Do not add a silent
`default` that returns a fallback — that hides the new case.

```ts
// ✗ a new Shape kind compiles and returns 0 at runtime
function area(shape: Shape) {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2
    case "square": return shape.size ** 2
    default: return 0
  }
}

// ✓ the compiler reports the missing case
function area(shape: Shape) {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2
    case "square": return shape.size ** 2
    default: {
      const unhandled: never = shape
      throw new Error(`Unhandled shape: ${JSON.stringify(unhandled)}`)
    }
  }
}
```

## 21. Model state as a union, not as boolean flags

Do not represent one state with several booleans (`isLoading`, `isError`,
`data`). Flags let impossible combinations compile, such as loading and error at
the same time. Use one discriminated union with a `status` field. Each variant
carries only the data that exists in that state.

```ts
// ✗ four fields, many impossible combinations
interface ViewState {
  isLoading: boolean
  isError: boolean
  error?: Error
  data?: User
}

// ✓ one union, each state is complete and exclusive
type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: User }
```

## 22. Do not mutate inputs

Treat every parameter as read-only. Do not `push` onto a parameter array, do not
`delete` a key, and do not `Object.assign` onto props or state. Return a new
value. Mark parameter types `readonly` or `Readonly<T>` so the compiler enforces
it. This extends rule 5 (`toSorted` over `sort`).

```ts
// ✗ the caller's array changes under them
function addTag(tags: string[], tag: string) {
  tags.push(tag)
  return tags
}

// ✓ a new array; the input is untouched
function addTag(tags: readonly string[], tag: string) {
  return [...tags, tag]
}
```

## 23. `const` by default

Declare with `const`. Use `let` only when the binding must change, and keep
that scope small. If you reach for `let` to fill a value from branches, use a
function with early returns (rule 17) or a lookup instead.

```ts
// ✗ let used as a slot for branch results
let label
if (count === 0) label = "none"
else label = "some"

// ✓ const, value comes from one expression or a function
const label = getLabel(count)
```

## 24. No `async` without `await`; run independent awaits together

Do not mark a function `async` if it never awaits — it only wraps the return in
a Promise. When two or more awaits do not depend on each other, start them
together and wait with `Promise.all`. Sequential awaits on independent calls add
their latencies.

```ts
// ✗ async with nothing to await
async function getId(user: User) {
  return user.id
}

// ✗ sequential — the second request waits for the first
const user = await loadUser(id)
const posts = await loadPosts(id)

// ✓ independent calls run together
const [user, posts] = await Promise.all([loadUser(id), loadPosts(id)])
```

## 25. Do not use optional chaining to hide a required field

Use `?.` and `??` only where the value is truly optional in the type. Do not
chain `?.` through a field that must exist — it turns a bug into an `undefined`
that travels further. If a required field can be missing at runtime, the type is
wrong: fix the type, or validate at the boundary (rule 19).

```ts
// ✗ user is required here; ?. hides a broken state
const name = props.user?.profile?.name ?? ""

// ✓ the type says user exists, so read it directly
const name = props.user.profile.name

// ✓ optional in the type, so ?. is correct
const nickname = props.user.profile.nickname ?? props.user.profile.name
```

## Library conventions

Some libraries have their own conventions. When a project uses one of these,
follow [LIBRARIES.md](./LIBRARIES.md):

- **Dates** — ask before adding a date library; prefer `date-fns` for
  timezone-aware work.
- **Data handling** — ask before adding `@mobily/ts-belt` and `ts-pattern`; no
  nested ternaries, immutable data, compose with `pipe()`.

React libraries (TanStack Query, Zustand, React Hook Form) live in the `react`
skill's `LIBRARIES.md`.
