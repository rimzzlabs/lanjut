import { S } from "@mobily/ts-belt";

const SAFE_SCHEME_RE = /^(?:https?:\/\/|mailto:|tel:)/i;
const ANY_SCHEME_RE = /^[a-z][a-z\d+.-]*:/i;

/**
 * A link target that is safe to render and export. http, https, mailto, and
 * tel pass as they are, a bare address such as github.com/name gets https,
 * and any other scheme, such as javascript:, gives nothing.
 */
export function safeHref(raw: string): string | undefined {
  const href = S.trim(raw);
  if (S.isEmpty(href)) return undefined;
  if (SAFE_SCHEME_RE.test(href)) return href;
  if (ANY_SCHEME_RE.test(href)) return undefined;
  return `https://${href}`;
}
