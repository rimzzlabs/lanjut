# react — library conventions

Conventions for React ecosystem libraries. Apply a section only when the project
uses that library. These sections extend [SKILL.md](./SKILL.md) in this skill
and the `typescript` skill (function style, `Result` errors, immutability, and
so on). Dates and data handling (ts-belt, ts-pattern) are in the `typescript`
skill's `LIBRARIES.md`.

Some sections tell you to **ask the user** first. Ask one time, when you first
add the library to the project. Then apply the answer everywhere, and do not ask
again.

## TanStack Query

### Manage query keys centrally

Do not scatter raw array keys (`["user", id]`) across the codebase. Raw keys
drift, and then cache reads stop matching cache writes.

When you first add TanStack Query to a project, **ask the user** how they want
to manage keys. Offer two options:

1. Install a key-management library (for example `@lukemorales/query-key-factory`).
2. Write a small typed key factory in the repo.

Then use the chosen factory everywhere.

```ts
// hand-written factory (or the equivalent from a library)
const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};
```

### Let the key and signal flow through `queryFn`

Do not close over a hoisted key variable inside `queryFn`. Read the key from the
context argument that TanStack Query gives to `queryFn`. Then the value that
drives the cache is the same value that the fetch uses. There is only one source
of truth.

Always forward `ctx.signal` to the network request. Then TanStack Query can
cancel in-flight requests (on unmount, refetch, or key change).

Wrap the options in `queryOptions()`. It types `ctx.queryKey` from the key
factory, and `useQuery`, `prefetchQuery`, and `getQueryData` all accept the
result.

```ts
import { queryOptions } from "@tanstack/react-query";

function userQuery(id: string) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: async (ctx) => {
      // the key comes from the context, not from a hoisted variable
      const [, , userId] = ctx.queryKey;
      const res = await fetch(`/users/${userId}`, { signal: ctx.signal });
      // queryFn is a throw boundary — see SKILL.md rule 8
      if (!res.ok) throw new Error("User not found");
      return res.json() as Promise<User>;
    },
  });
}

// the same options object serves every call site
const query = useQuery(userQuery(id));
await queryClient.prefetchQuery(userQuery(id));
```

### Invalidate through the key factory

After a mutation, invalidate with keys from the factory. Do not type the key by
hand. A broad key (`userKeys.all`) invalidates every query below it.

```ts
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
```

To render the query states (`pending`, `error`, `success`), see SKILL.md
rule 9.

## Zustand

### Always use the `immer` middleware

Write updates as draft mutations through `immer`. This keeps the update
functions readable, and you do not have to write nested spreads by hand.
Prerequisite: install `immer`.

### Use the `persist` middleware for persistence

When state must survive a page reload, use the built-in `persist` middleware. Do
not write your own persistence code.

```ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

interface BearState {
  bears: number;
  addBear: () => void;
}

const useBearStore = create<BearState>()(
  persist(
    immer((set) => ({
      bears: 0,
      addBear: () =>
        set((state) => {
          state.bears += 1; // immer draft mutation
        }),
    })),
    { name: "bear-store" },
  ),
);
```

Before you add `persist`, **ask the user**:

- **Which keys must persist?** Persist only those keys. Use `partialize` to
  select them. Do not persist functions or temporary UI state (open menus,
  loading flags).
- **Which storage?** The default is `localStorage`. Use `sessionStorage` when
  the state must end with the browser tab.

When the shape of persisted state changes, increase `version` and add a
`migrate` function. Otherwise, users with old saved state get broken data.

```ts
{
  name: "bear-store",
  version: 2,
  partialize: (state) => ({ bears: state.bears }),
  migrate: (persisted, version) =>
    version < 2 ? { bears: 0 } : (persisted as BearState),
}
```

For server-side rendering (for example Next.js), the saved state is not
available on the server. Use `skipHydration: true`, and call
`useBearStore.persist.rehydrate()` on the client. This prevents a hydration
mismatch.

### Auto-selectors — ask first

When you set up Zustand in a project for the first time, **ask the user** if
they want auto-generated selectors. If yes, generate a `.use` accessor. Then the
code reads the store as `useBearStore.use.useSortedBears()`.

Keep the `use` prefix on every selector name. Each selector is a hook, and React
19 requires hook-style names. So you read a `bears` value with
`useBearStore.use.useBears()`, and a derived `sortedBears` value with
`useBearStore.use.useSortedBears()`.

```ts
// createSelectors, adapted to keep the `use` prefix on each selector
function createSelectors<S extends { getState: () => object }>(store: S) {
  const withUse = store as S & { use: Record<string, unknown> };
  withUse.use = {};
  for (const key of Object.keys(store.getState())) {
    const name = `use${key[0].toUpperCase()}${key.slice(1)}`;
    withUse.use[name] = () =>
      store((state: Record<string, unknown>) => state[key]);
  }
  return withUse;
}
```

The Zustand "Auto Generating Selectors" guide shows the base pattern that this
code adapts: https://zustand.docs.pmnd.rs/guides/auto-generating-selectors

## React Hook Form

Use the React Hook Form (RHF) API. Do not manage form state by hand.

### Bind fields through the UI library

When the form uses a UI library (shadcn/ui, Base UI, or similar), bind each
field through the field component of that library, together with the `control`
object from RHF. Do not spread `...register()` onto the styled inputs of the
library. The field component connects the value, `onChange`, the error state,
and accessibility for you. `register()` bypasses that connection and does not
follow the contract of the library.

Component names are different in each library (`<Field />`, `<FormField />`).
Check the form documentation of the library for the correct API.

```tsx
// ✗ spreading register onto a UI-library input
<Input {...register("email")} />

// ✓ bind through the library's field component + RHF control
<Field
  control={form.control}
  name="email"
  render={({ field }) => <Input {...field} />}
/>
```

The shadcn/ui form docs show a full integration:
https://ui.shadcn.com/docs/components/form

### Validate with a schema — ask first

When you add the first form, **ask the user** which schema library to use. Zod
is the common choice, and it connects to RHF through `@hookform/resolvers`.
Define the schema one time, and get the form type from it. Do not write the type
a second time by hand.

Always set `defaultValues`. Without them, inputs start as uncontrolled and React
shows a warning when they become controlled.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

type SignUpValues = z.infer<typeof signUpSchema>;

function SignUpForm() {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });
  // ...
}
```

In a full-stack project, use the same schema on the server to validate the
request body.

## nuqs

Use `nuqs` for every piece of state that lives in the URL (SKILL.md rule 12).
Do not read `window.location` or the router's `searchParams` by hand, and do not
build query strings with string concatenation.

### Set up the adapter once

Wrap the app in the adapter for the framework (`NuqsAdapter` from
`nuqs/adapters/next/app`, `nuqs/adapters/react-router`, or `nuqs/adapters/react`).
Do it once, at the root.

### Always pass a parser and a default

Use a typed parser for every key, and give it a default. Then the value is never
`null` in the component, and a bad URL falls back to a known state.

```tsx
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs"

const STATUSES = ["all", "active", "banned"] as const

const [status, setStatus] = useQueryState(
  "status",
  parseAsStringLiteral(STATUSES).withDefault("all"),
)
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
```

### Group related keys with `useQueryStates`

When several keys change together (filters + page), use one `useQueryStates`
call. Then one update writes one history entry. Reset dependent keys in the same
call: a new filter sets `page` back to `1`.

```tsx
const [filters, setFilters] = useQueryStates({
  status: parseAsStringLiteral(STATUSES).withDefault("all"),
  page: parseAsInteger.withDefault(1),
})

function onStatusChange(next: Status) {
  setFilters({ status: next, page: 1 })
}
```

### Clear a key by setting it to `null`

Setting a value to `null` removes the key from the URL. Use `clearOnDefault:
true` so a value equal to the default also disappears, and URLs stay short.

### Keep the URL in sync with the query key

When a TanStack Query key depends on URL state, build the key from the parsed
nuqs values, not from the raw string. Then the cache key and the URL agree.

## Money and crypto amounts

### Never use `number` for an amount

A JavaScript `number` is a 64-bit float. It cannot hold a 256-bit token balance
or represent `0.1 + 0.2` exactly. Keep every amount, balance, price, and fee out
of `number` from the wire to the screen.

When the project first handles an amount, **ask the user** which representation
to use:

1. **Native `bigint` in base units** (wei, satoshi, cents) with a `decimals`
   value next to it. This is what `viem` and most chain SDKs use. Format for
   display with the SDK's helpers (`formatUnits`, `parseUnits`).
2. **A big-number library** (`bignumber.js`, `decimal.js`, or `big.js`) when
   the code must do decimal math (prices, percentages, conversions) in the UI.

Pick one and use it everywhere. Do not mix them in the same layer. Transport
amounts as strings in JSON — `JSON.stringify` cannot serialize a `bigint`, and
a `number` loses precision.

```ts
// ✗ precision lost before the math starts
const total = Number(balance) * price

// ✓ bigint in base units, formatted only for display
const total = (balance * priceInBaseUnits) / 10n ** BigInt(decimals)
const label = formatUnits(total, decimals)
```

### Use `react-currency-input-field` for amount inputs

Do not use `<input type="number">` for money or token amounts. It accepts `e`,
drops leading zeros, and gives you a float. Use `react-currency-input-field`
(`CurrencyInput`). It handles grouping separators, a decimal limit, a prefix or
suffix, and returns the raw string through `onValueChange`.

Set `decimalsLimit` to the asset's decimals, and `allowNegativeValue={false}`
unless a negative amount is valid. Parse the string into the chosen
representation (above) only on submit.

### With React Hook Form, default the field to `""`

`CurrencyInput` shows its placeholder only when the value is an empty string.
With `0` or `undefined`, the input shows `0`, and the user cannot tell an empty
field from an amount of zero. So the `defaultValues` entry for the field must
be `""`.

The form's field type comes from the schema and is not `""`. Cast the default:
`"" as unknown as <the field's type>`. This is a permitted exception to
typescript rule 18 (no `as`) — the cast is confined to `defaultValues`, and the
schema still validates the real value on submit.

```tsx
const sendSchema = z.object({
  amount: z.string().min(1, "Enter an amount"),
  to: z.string().min(1),
})

type SendValues = z.infer<typeof sendSchema>

function SendForm() {
  const form = useForm<SendValues>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      amount: "" as unknown as string, // shows the placeholder, not "0"
      to: "",
    },
  })

  return (
    <Field
      control={form.control}
      name="amount"
      render={({ field }) => (
        <CurrencyInput
          id={field.name}
          name={field.name}
          value={field.value}
          placeholder="0.00"
          decimalsLimit={decimals}
          allowNegativeValue={false}
          onValueChange={(value) => field.onChange(value ?? "")}
          onBlur={field.onBlur}
        />
      )}
    />
  )
}
```

Bind through the UI library's field component, as the React Hook Form section
above describes. Do not spread `register("amount")` onto `CurrencyInput`.
