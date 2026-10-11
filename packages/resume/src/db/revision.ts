import { O, R } from "@mobily/ts-belt";

/**
 * The revision a write expects to find stored. A number is the revision the
 * window read or last wrote. `"new"` expects no stored copy. `"replace"`
 * writes over whatever is stored, for an import the person chose.
 */
export type ExpectedRevision = number | "new" | "replace";

/** Since this window read it, another window wrote the stored copy or deleted it. */
export type RevisionError = "changed" | "deleted";

interface Revised {
  id: string;
  revision?: number;
}

/** The revision of a stored copy. A copy written before revisions reads as 0. */
export function revisionOf(item: Revised | undefined): number {
  return item?.revision ?? 0;
}

/** The revision to write, or why the write must not happen. */
function nextRevision(
  stored: Revised | undefined,
  expected: ExpectedRevision,
): R.Result<number, RevisionError> {
  if (expected === "replace") return R.makeOk(revisionOf(stored) + 1);
  if (expected === "new") {
    return stored === undefined ? R.makeOk(1) : R.makeError("changed");
  }
  if (stored === undefined) return R.makeError("deleted");
  if (revisionOf(stored) !== expected) return R.makeError("changed");
  return R.makeOk(expected + 1);
}

/** The part of an idb readwrite store that a revised write uses. */
interface RevisedStore<T extends Revised> {
  get(key: string): Promise<T | undefined>;
  put(value: T): Promise<unknown>;
}

interface WriteRevisedParams<T extends Revised, E> {
  store: RevisedStore<T>;
  /** The transaction's `done`. */
  done: Promise<void>;
  value: T;
  expected: ExpectedRevision;
  /** A refusal of the caller's own, checked first against the stored copy. */
  refuse?: (stored: T | undefined) => O.Option<E>;
}

/**
 * Writes `value` with the next revision, in the same readwrite transaction as
 * the read of the stored copy, so no other window can write between the check
 * and the write. `putResume` and `putProfile` both go through it. Resolves to
 * the written value, or to why it was not written.
 */
export async function writeRevised<T extends Revised, E = never>(
  params: WriteRevisedParams<T, E>,
): Promise<R.Result<T, RevisionError | E>> {
  const stored = await params.store.get(params.value.id);
  const refused = params.refuse ? params.refuse(stored) : O.None;
  if (O.isSome(refused)) {
    await params.done;
    return R.makeError<T, RevisionError | E>(refused);
  }

  return R.match(
    nextRevision(stored, params.expected),
    async (revision) => {
      const written = { ...params.value, revision };
      await Promise.all([params.store.put(written), params.done]);
      return R.makeOk<T, RevisionError | E>(written);
    },
    async (error) => {
      await params.done;
      return R.makeError<T, RevisionError | E>(error);
    },
  );
}
