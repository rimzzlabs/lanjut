import { joinPresent } from "@lanjut/resume/text";
import { A, G, O, pipe, S } from "@mobily/ts-belt";
import { format, getYear } from "date-fns";

/** Sentinel end-date value marking an ongoing role or study ("current"). */
export const PRESENT_DATE = "Present";

export interface Option {
  label: string;
  value: string;
}

/**
 * The twelve months. `label` is the full name shown in the menu; `value` is the
 * short token persisted into the field (e.g. "Jan 2020"), matching the existing
 * date placeholder format.
 */
export const MONTHS: Option[] = Array.from({ length: 12 }, (_, index) => ({
  label: format(new Date(2000, index, 1), "MMMM"),
  value: format(new Date(2000, index, 1), "MMM"),
}));

const FIRST_YEAR = 1970;

/** Year options from the current year down to 1970, newest first. */
export const YEARS: Option[] = (() => {
  const currentYear = getYear(new Date());
  const count = currentYear - FIRST_YEAR + 1;
  return Array.from({ length: count }, (_, index) => {
    const year = String(currentYear - index);
    return { label: year, value: year };
  });
})();

export interface MonthYear {
  month: string | undefined;
  year: string | undefined;
}

/**
 * Splits a stored value into its month and year parts, order-independent: a
 * 4-digit token is the year, any other token the month. Both parts are optional
 * so the picker can be filled one column at a time (e.g. "2020" or "Jan 2020").
 */
export function parseMonthYear(value: string | undefined): MonthYear {
  if (!value) return { month: undefined, year: undefined };
  const tokens = pipe(
    value,
    S.trim,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
  );
  const isYear = (token: string) => /^\d{4}$/.test(token);
  // The last token of each kind wins.
  return {
    month: pipe(tokens, A.reject(isYear), A.last, O.toUndefined),
    year: pipe(tokens, A.filter(isYear), A.last, O.toUndefined),
  };
}

/** Joins the parts back into "MMM YYYY", dropping whichever part is missing. */
export function formatMonthYear(
  month: string | undefined,
  year: string | undefined,
): string {
  return joinPresent([month, year], " ");
}

const MONTH_INDEX = new Map(
  A.mapWithIndex(MONTHS, (index, month) => [month.value, index] as const),
);

interface LocalizeDateValueParams {
  value: string;
  months: string[];
  present: string;
}

/**
 * Renders a stored date value into a document language: the English month token
 * is swapped for its `months` equivalent and `PRESENT_DATE` for `present`. Meant
 * for display only; the stored value stays the canonical English token.
 */
export function localizeDateValue(params: LocalizeDateValueParams): string {
  const { value, months, present } = params;
  const trimmed = S.trim(value);
  if (!trimmed) return "";
  if (trimmed === PRESENT_DATE) return present;
  const { month, year } = parseMonthYear(trimmed);
  const index = month ? MONTH_INDEX.get(month) : undefined;
  const localizedMonth =
    index !== undefined ? O.toUndefined(A.get(months, index)) : month;
  return joinPresent([localizedMonth, year], " ");
}

/**
 * A comparable ordinal for a stored "MMM YYYY" / "YYYY" value, used to sort
 * entries newest-first. `PRESENT_DATE`, empty, and unparseable values rank as the
 * most recent, so a freshly added (undated) row is treated as the latest.
 */
export function dateSortValue(value: string | undefined): number {
  const trimmed = S.trim(value ?? "");
  if (!trimmed || trimmed === PRESENT_DATE) return Number.POSITIVE_INFINITY;
  const { month, year } = parseMonthYear(trimmed);
  if (!year) return Number.POSITIVE_INFINITY;
  return Number(year) * 12 + (month ? (MONTH_INDEX.get(month) ?? 0) : 0);
}
