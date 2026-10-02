import { A, D, F, G, O, pipe, S } from "@mobily/ts-belt";
import type { Field, FieldKey, Resume } from "@/lib/resume";
import { plain } from "./parse-rich-lines";

// --- header ----------------------------------------------------------------

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%-]+/i;
export const URL_RE = /(?:https?:\/\/|www\.)[^\s|]+/i;
const URL_G_RE = /(?:https?:\/\/|www\.)[^\s|]+/gi;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/;

export function isContactLine(line: string): boolean {
  return (
    EMAIL_RE.test(line) ||
    LINKEDIN_RE.test(line) ||
    URL_RE.test(line) ||
    PHONE_RE.test(line)
  );
}

function looksLikeLocation(line: string): boolean {
  return (
    S.includes(line, ",") &&
    !/\d/.test(line) &&
    /^[A-Z]/.test(line) &&
    pipe(line, S.splitByRe(/\s+/), A.length) <= 6 &&
    !isContactLine(line)
  );
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = pipe(
    fullName,
    S.trim,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
  );
  const [first = "", ...rest] = parts;
  return { first, last: A.join(rest, " ") };
}

export type Fields = Record<FieldKey, Field>;

function setPlain(key: FieldKey, value: O.Option<string>) {
  return (fields: Fields): Fields =>
    O.mapWithDefault(value, fields, (text) => D.set(fields, key, plain(text)));
}

function nameFields(nameLine: O.Option<string>): Fields {
  if (O.isNone(nameLine)) return {};
  const { first, last } = splitName(nameLine);
  return { firstName: plain(first), lastName: plain(last) };
}

function locationFields(locationLine: O.Option<string>): Fields {
  if (O.isNone(locationLine)) return {};
  const [city = "", province = "", ...rest] = pipe(
    locationLine,
    S.split(","),
    A.map(S.trim),
  );
  return {
    city: plain(city),
    province: plain(province),
    country: plain(A.join(rest, ", ")),
  };
}

interface HeaderFill {
  resume: Resume;
  leftovers: ReadonlyArray<string>;
}

interface FillHeaderParams {
  resume: Resume;
  preamble: ReadonlyArray<string>;
  allText: string;
}

/**
 * Fill the header from the preamble (lines before the first heading) and
 * contacts found anywhere. Returns the filled résumé and the preamble lines
 * that were not used, to be added to the leftovers. Deliberately conservative:
 * only the first plausible name and headline are taken; nothing is guessed
 * beyond that.
 */
export function fillHeader(params: FillHeaderParams): HeaderFill {
  const { resume, preamble, allText } = params;
  const email = pipe(S.match(allText, EMAIL_RE), O.mapNullable(A.head));
  const linkedin = pipe(S.match(allText, LINKEDIN_RE), O.mapNullable(A.head));
  const phone = pipe(S.match(allText, PHONE_RE), O.mapNullable(A.head));
  const website = pipe(
    O.getWithDefault(S.match(allText, URL_G_RE), []),
    A.filter(G.isString),
    A.find((url) => !/linkedin\.com/i.test(url)),
  );
  // The extra link only comes from the preamble: anywhere else, a second URL
  // is far more likely a company or project site from an entry.
  const link = pipe(
    O.getWithDefault(S.match(A.join(preamble, " "), URL_G_RE), []),
    A.filter(G.isString),
    A.find(
      (url) =>
        !/linkedin\.com/i.test(url) &&
        !O.contains(website, url) &&
        !S.includes(url, "@"),
    ),
  );

  const named = pipe(
    preamble,
    A.map(S.trim),
    A.reject((line) => S.isEmpty(line) || isContactLine(line)),
  );
  const nameLine = A.head(named);
  // Detect the location first so a "City, Region" line is not mistaken for the
  // headline, which is the next short non-location line (some résumés have none).
  const locationLine = A.find(
    named,
    (line) => !O.contains(nameLine, line) && looksLikeLocation(line),
  );
  const headlineLine = A.find(
    named,
    (line) =>
      !O.contains(nameLine, line) &&
      !O.contains(locationLine, line) &&
      pipe(line, S.splitByRe(/\s+/), A.length) <= 8,
  );
  const fields = pipe(
    resume.header.fields,
    setPlain("email", email),
    setPlain("phone", phone),
    setPlain("linkedin", linkedin),
    setPlain("website", website),
    setPlain("link", link),
    D.merge(nameFields(nameLine)),
    setPlain("jobTitle", headlineLine),
    D.merge(locationFields(locationLine)),
  );

  const used = new Set(
    pipe([nameLine, headlineLine, locationLine], A.filterMap(F.identity)),
  );
  const leftovers = pipe(
    preamble,
    A.map(S.trim),
    A.reject(
      (line) => S.isEmpty(line) || used.has(line) || isContactLine(line),
    ),
  );
  return {
    resume: { ...resume, header: { ...resume.header, fields } },
    leftovers,
  };
}
