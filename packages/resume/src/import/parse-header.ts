import { A, D, F, G, O, pipe, S } from "@mobily/ts-belt";
import type { Field, FieldKey, Resume } from "..";
import { cleanUrl, findUrls, isUrlToken, type PdfLink, urlKey } from "./links";
import { isLinkLine, type LinkLineRules, plain } from "./parse-rich-lines";

// --- header ----------------------------------------------------------------

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%-]+/i;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/;

export function isContactLine(line: string): boolean {
  return (
    EMAIL_RE.test(line) ||
    LINKEDIN_RE.test(line) ||
    PHONE_RE.test(line) ||
    A.isNotEmpty(findUrls(line))
  );
}

/** A contact segment with its addresses, email, and phone taken out. */
function withoutContacts(segment: string): string {
  return pipe(
    A.reduce(findUrls(segment), segment, (text, url) =>
      S.replaceAll(text, url, " "),
    ),
    S.replaceByRe(new RegExp(EMAIL_RE.source, "g"), " "),
    S.replaceByRe(new RegExp(PHONE_RE.source, "g"), " "),
    S.replaceByRe(/\s+/g, " "),
    S.trim,
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
  /** Keys (`urlKey`) of every address the header holds, so no section repeats one. */
  urls: ReadonlySet<string>;
}

interface FillHeaderParams {
  resume: Resume;
  preamble: ReadonlyArray<string>;
  allText: string;
  links: ReadonlyArray<PdfLink>;
}

function either(
  first: O.Option<string>,
  second: () => O.Option<string>,
): O.Option<string> {
  return O.isSome(first) ? first : second();
}

function linkTarget(
  links: ReadonlyArray<PdfLink>,
  scheme: RegExp,
): O.Option<string> {
  return pipe(
    links,
    A.find((link) => scheme.test(link.url)),
    O.map((link) =>
      pipe(link.url, S.replaceByRe(scheme, ""), S.replaceByRe(/\?.*$/, "")),
    ),
    O.filter(S.isNotEmpty),
  );
}

function lineAddresses(line: string): ReadonlyArray<string> {
  return pipe(
    line,
    S.splitByRe(/[\s|•·,;]+/),
    A.filter(G.isString),
    A.filter((token) => isUrlToken(token, true)),
    A.map(cleanUrl),
  );
}

function isWebsite(url: string): boolean {
  return (
    !/linkedin\.com/i.test(url) &&
    !S.includes(url, "@") &&
    !/^(?:mailto|tel):/i.test(url)
  );
}

/**
 * The header's addresses in reading order: the ones written in the top lines,
 * then the ones behind a label there ("Portfolio"). An address further down
 * belongs to an entry, so it never becomes the header's website.
 */
function headerAddresses(
  preamble: ReadonlyArray<string>,
  headerLinks: ReadonlyArray<PdfLink>,
): ReadonlyArray<string> {
  const written = A.flatMap(preamble, lineAddresses);
  const behindLabels = A.map(headerLinks, (link) => link.url);
  return pipe(
    A.concat(written, behindLabels),
    A.filter(isWebsite),
    A.uniqBy(urlKey),
  );
}

/**
 * Fill the header from the preamble (lines before the first heading) and
 * contacts found anywhere. Returns the filled résumé and the preamble lines
 * that were not used, to be added to the leftovers. Deliberately conservative:
 * only the first plausible name and headline are taken; nothing is guessed
 * beyond that.
 */
export function fillHeader(params: FillHeaderParams): HeaderFill {
  const { resume, preamble, allText, links } = params;
  const headerLinks = A.filter(links, (link) =>
    A.some(
      preamble,
      (line) => S.isNotEmpty(link.label) && S.includes(line, link.label),
    ),
  );
  const rules: LinkLineRules = {
    labels: new Set(A.map(headerLinks, (link) => S.trim(link.label))),
    bareDomains: true,
  };
  const isHeaderContact = (line: string) =>
    isContactLine(line) || isLinkLine(line, rules);

  const email = either(
    pipe(S.match(allText, EMAIL_RE), O.mapNullable(A.head)),
    () => linkTarget(links, /^mailto:/i),
  );
  const phone = either(
    pipe(S.match(allText, PHONE_RE), O.mapNullable(A.head)),
    () => linkTarget(links, /^tel:/i),
  );
  const linkedin = either(
    pipe(S.match(allText, LINKEDIN_RE), O.mapNullable(A.head)),
    () =>
      pipe(
        links,
        A.find((link) => LINKEDIN_RE.test(link.url)),
        O.map((link) => link.url),
      ),
  );
  const addresses = headerAddresses(preamble, headerLinks);
  const website = A.get(addresses, 0);
  const link = A.get(addresses, 1);

  const named = pipe(
    preamble,
    A.map(S.trim),
    A.reject((line) => S.isEmpty(line) || isHeaderContact(line)),
  );
  const nameLine = A.head(named);
  // Detect the location first so a "City, Region" line is not mistaken for the
  // headline, which is the next short non-location line (some résumés have none).
  // A template can also set it beside the contacts, "github.com/x · City, Region".
  const contactSegments = pipe(
    preamble,
    A.filter(isHeaderContact),
    A.flatMap((line) => S.splitByRe(line, /\s*[|•·]\s*/)),
    A.filter(G.isString),
    A.map(withoutContacts),
  );
  const locationLine = either(
    A.find(
      named,
      (line) => !O.contains(nameLine, line) && looksLikeLocation(line),
    ),
    () => A.find(contactSegments, looksLikeLocation),
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
  // The header holds two addresses. Any more are listed, not dropped.
  const leftovers = pipe(
    preamble,
    A.map(S.trim),
    A.reject(
      (line) => S.isEmpty(line) || used.has(line) || isHeaderContact(line),
    ),
    A.concat(A.drop(addresses, 2)),
  );
  const urls = pipe(
    A.concat(addresses, pipe([linkedin], A.filterMap(F.identity))),
    A.map(urlKey),
  );
  return {
    resume: { ...resume, header: { ...resume.header, fields } },
    leftovers,
    urls: new Set(urls),
  };
}
