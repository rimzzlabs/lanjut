import { A, O, pipe, S } from "@mobily/ts-belt";

interface Rule {
  pattern: RegExp;
  name: (match: ReadonlyArray<O.Option<string>>) => string;
}

// Order matters: Edge and Opera also say "Chrome", and Chrome also says
// "Safari", so the more specific names come first.
const BROWSERS: ReadonlyArray<Rule> = [
  { pattern: /Edg(?:e|A|iOS)?\/(\d+)/, name: (m) => `Edge ${m[1]}` },
  { pattern: /OPR\/(\d+)/, name: (m) => `Opera ${m[1]}` },
  { pattern: /SamsungBrowser\/(\d+)/, name: (m) => `Samsung Internet ${m[1]}` },
  { pattern: /(?:Firefox|FxiOS)\/(\d+)/, name: (m) => `Firefox ${m[1]}` },
  { pattern: /(?:Chrome|CriOS)\/(\d+)/, name: (m) => `Chrome ${m[1]}` },
  {
    pattern: /Version\/(\d+(?:\.\d+)?).*Safari/,
    name: (m) => `Safari ${m[1]}`,
  },
];

// Browsers freeze the Windows and macOS versions in the user agent, so only
// the system name is reliable there.
const SYSTEMS: ReadonlyArray<Rule> = [
  {
    pattern: /(?:iPhone|iPad|iPod).*? OS (\d+)_(\d+)/,
    name: (m) => `iOS ${m[1]}.${m[2]}`,
  },
  { pattern: /Android (\d+(?:\.\d+)?)/, name: (m) => `Android ${m[1]}` },
  { pattern: /CrOS/, name: () => "ChromeOS" },
  { pattern: /Windows NT/, name: () => "Windows" },
  { pattern: /Mac OS X|Macintosh/, name: () => "macOS" },
  { pattern: /Linux/, name: () => "Linux" },
];

function firstMatch(userAgent: string, rules: ReadonlyArray<Rule>): string {
  return pipe(
    rules,
    A.find((rule) => rule.pattern.test(userAgent)),
    O.flatMap((rule) =>
      pipe(
        S.match(userAgent, rule.pattern),
        O.map((match) => rule.name(match)),
      ),
    ),
    O.getWithDefault("Unknown"),
  );
}

/** "Chrome 154" and "Windows" from a raw user agent, for a person to read. */
export function describeUserAgent(userAgent: string): {
  browser: string;
  os: string;
} {
  return {
    browser: firstMatch(userAgent, BROWSERS),
    os: firstMatch(userAgent, SYSTEMS),
  };
}
