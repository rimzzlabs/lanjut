/**
 * The only server code Lanjut runs. Every page is a static file; this Worker
 * sits in front of a few paths to relay feedback, pick the visitor's language,
 * forward addresses from older layouts, and serve the editor page for
 * /editor/<id>. Résumé content never reaches it.
 */
import { S } from "@mobily/ts-belt";
import { appPageFor, legacyTarget } from "../src/lib/route-rules";
import { FeedbackError, fileFeedback } from "./feedback";
import { localeRedirect } from "./locale";

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  GITHUB_ISSUE_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
}

// English used to answer under /en as well. Desktop builds up to 0.18 still
// open /en/feedback, so the prefix forwards instead of reading a 404.
const LEGACY_DEFAULT_PREFIX = /^\/en(?=\/|$)/;

async function relayFeedback(request: Request, env: Env) {
  try {
    const url = await fileFeedback(request, env);
    return Response.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof FeedbackError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/feedback") {
      if (request.method !== "POST") {
        return new Response(null, { status: 405, headers: { Allow: "POST" } });
      }
      return relayFeedback(request, env);
    }

    if (LEGACY_DEFAULT_PREFIX.test(url.pathname)) {
      const target = new URL(url);
      target.pathname =
        S.replaceByRe(url.pathname, LEGACY_DEFAULT_PREFIX, "") || "/";
      return Response.redirect(target.href, 308);
    }

    const legacy = legacyTarget(url);
    if (legacy) return Response.redirect(legacy.href, 301);

    const page = appPageFor(url.pathname);
    const asset = page ? new Request(new URL(page, url), request) : request;
    return localeRedirect(request, url) ?? env.ASSETS.fetch(asset);
  },
};
