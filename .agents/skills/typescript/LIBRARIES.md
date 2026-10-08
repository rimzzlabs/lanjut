# typescript — library conventions

Conventions for specific libraries. Apply a section only when the project uses
that library. These sections extend the core rules in [SKILL.md](./SKILL.md).
The core rules still apply (function style, `Result` errors, and so on).

Some sections tell you to **ask the user** first. Ask one time, when you first
add the library to the project. Then apply the answer everywhere, and do not ask
again.

React libraries (TanStack Query, Zustand, React Hook Form) are in the `react`
skill's `LIBRARIES.md`. That file builds on this one.

## Dates

When a project needs date handling for the first time, **ask the user** if they
want to add a date library (`date-fns`) or use the built-in `Date`.

If the application must support time zones, recommend `date-fns`. Do not write
time-zone math with `Date` by hand. Manual time-zone code often causes
off-by-one and daylight-saving (DST) bugs. For time zones:

- **date-fns v4:** use `@date-fns/tz`.
- **date-fns v3:** use `date-fns-tz`.

Put parsing and formatting in one module. Do not scatter them across
components.

```ts
// lib/date.ts — the only place that parses or formats dates
import { format, parseISO } from "date-fns";

export function formatDisplayDate(iso: string) {
  return format(parseISO(iso), "d MMM yyyy");
}
```

Store and send dates as UTC ISO strings (`2026-09-19T08:30:00Z`). Convert to the
local time zone only when you display the date.

Follow-up question: when the app shows times, **ask the user** which time zone
to use — the time zone of the browser, or a time zone that each user saves in
their profile.

## Data handling: ts-belt and ts-pattern

The typescript skill prefers two libraries for data handling:

- **`@mobily/ts-belt`** — immutable, typed functions for arrays (`A`), objects
  (`D`), optional values (`O`), results (`R`), and composition (`pipe`).
- **`ts-pattern`** — pattern matching (`match`) for code that branches on many
  cases. An example is mapping a domain error to an HTTP response. (For
  rendering from TanStack Query state, see the `react` skill.)

These rules apply to frontend code and to backend code.

### Ask first

When the project first needs data transformation or branching logic, **ask the
user** if they want to install ts-belt and ts-pattern.

Pin the exact ts-belt version. Version 4 is a release candidate, so the API can
change between releases:

```bash
pnpm add @mobily/ts-belt@4.0.0-rc.5 ts-pattern
```

Because the version is a release candidate, the function names in this file can
be different from the installed version. Before you use a function, check the
type definitions in `node_modules/@mobily/ts-belt`.

**If the user says yes:**

- Use ts-belt for data transformation (arrays, objects, optional values,
  results).
- Use ts-pattern for branching on more than two cases.
- Do not add a second utility library (lodash, ramda, remeda) for the same work.

Then ask these follow-up questions:

1. **Existing code:** migrate the existing code, or apply the rules only to new
   code and to code that you change? The default is new code and changed code.
   Do not rewrite files that the task does not touch.
2. **Result type:** use the `R` (Result) module of ts-belt, or keep the
   hand-written `Result` union from SKILL.md rule 7? Use one of them everywhere.
   Do not mix the two.

**If the user says no:** the rule about ternaries (below) still applies. Use
early returns, a lookup object, or a `switch` statement that has an exhaustive
`never` check.

### Do not nest ternaries

Nested ternaries are hard to read. Never nest them. A single, flat ternary that
selects between two simple values is acceptable (see SKILL.md rule 17).

- For a value that can be missing, use the `O` (Option) module of ts-belt.
- For more than two cases, use `match` from ts-pattern.

```ts
// ✗ nested ternary
const city = user ? (user.address ? user.address.city : "Unknown") : "Unknown";

// ✓ ts-belt Option
const city = pipe(
  O.fromNullable(user),
  O.flatMap((value) => O.fromNullable(value.address)),
  O.map((address) => address.city),
  O.getWithDefault("Unknown"),
);
```

```ts
// ✗ nested ternary on a union
const color =
  status === "active" ? "green" : status === "pending" ? "yellow" : "red";

// ✓ ts-pattern — .exhaustive() fails to compile if you miss a case
const color = match(status)
  .with("active", () => "green" as const)
  .with("pending", () => "yellow" as const)
  .with("banned", () => "red" as const)
  .exhaustive();
// color: "green" | "yellow" | "red"
```

### Keep literal types with `as const`

ts-pattern and ts-belt infer return types from the callbacks. TypeScript widens
a literal that a callback returns: `() => "green"` returns `string`, not
`"green"`. Then the result of `match` is `string`, and the union is lost.

When the literal type is important, add `as const` to the returned value. The
same applies to ts-belt callbacks and default values, for example in `O.map`,
`O.getWithDefault`, and `A.map`.

```ts
// ✗ color: string
const color = match(status)
  .with("active", () => "green")
  .with("pending", () => "yellow")
  .exhaustive();

// ✓ color: "green" | "yellow"
const color = match(status)
  .with("active", () => "green" as const)
  .with("pending", () => "yellow" as const)
  .exhaustive();
```

In ts-pattern, `.returnType<Color>()` is an alternative. It sets the return type
one time, before the first `.with()`. A type annotation on the variable does not
help: the chain still returns `string`, and the assignment fails to compile.

### Match at the protocol boundary

Use `match` to map a domain error to an HTTP response at the protocol boundary
(SKILL.md rule 7). Each branch gets the narrowed type, and `.exhaustive()`
fails to compile when a new error kind appears.

```ts
function toHttpError(error: AppError) {
  return match(error)
    .with({ kind: "not-found" }, () => ({ status: 404, message: "Not found" }))
    .with({ kind: "unauthorized" }, () => ({ status: 401, message: "Sign in" }))
    .with({ kind: "validation" }, (e) => ({ status: 422, message: e.message }))
    .exhaustive();
}
```

### Keep data immutable

ts-belt functions do not change their input. They return a new value. Apply the
same rule to the code of the project:

- Do not change function arguments. Do not use `push`, `splice`, or an in-place
  `sort` on data that you received.
- Mark array and object types as `readonly` where you can.
- Use `as const` for fixed data.

```ts
// ✗ changes the input
function addTag(post: Post, tag: string) {
  post.tags.push(tag);
  return post;
}

// ✓ returns a new value
function addTag(post: Post, tag: string) {
  return D.set(post, "tags", A.append(post.tags, tag));
}
```

Two exceptions:

- **immer drafts.** A draft mutation (for example in a Zustand store — see the
  `react` skill) is acceptable, because immer creates a new immutable state
  from it.
- **Hot paths.** For very large data, SKILL.md rule 4 permits in-place work on
  data that you own. Write a comment that tells why.

### Compose with `pipe`

When you apply more than one ts-belt function to a value, put all the steps in
one `pipe()`. Do not store each step in a separate variable. Inside `pipe`, use
the data-last form: give only the callback, not the data.

```ts
// ✗ one variable for each step
const active = A.filter(users, (user) => user.active);
const sorted = A.sortBy(active, (user) => user.name);
const names = A.map(sorted, (user) => user.name);

// ✓ one pipe, read from top to bottom
const names = pipe(
  users,
  A.filter((user) => user.active),
  A.sortBy((user) => user.name),
  A.map((user) => user.name),
);
```

For a single call, `pipe` is not necessary: `A.map(users, (user) => user.id)` is
correct.
