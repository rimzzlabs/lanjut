import type { Locale } from "@lanjut/i18n/routing";
import { localeStaticPaths } from "@lanjut/i18n/routing";
import type { APIContext } from "astro";
import { changelogMarkdown } from "@/lib/changelog-markdown";

export function getStaticPaths() {
  return localeStaticPaths();
}

export function GET(context: APIContext) {
  const locale = context.props.locale as Locale;
  return new Response(changelogMarkdown(locale), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
