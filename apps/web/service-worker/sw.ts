/**
 * Keeps Lanjut's own build files on the device, so the site opens, edits, and
 * exports with no network. Pages load from the network first and fall back to
 * the cache. Hashed files come from the cache first. It never touches /api/
 * and never opens IndexedDB, so no résumé content passes through it.
 */
import { isLocale, LOCALE_COOKIE, type Locale } from "@lanjut/i18n/routing";
import { A, D, F, G, O, pipe, S } from "@mobily/ts-belt";
import { legacyTarget, PRECACHE_HEADER } from "../src/lib/route-rules";
import {
  notFoundKey,
  offlineLocaleTarget,
  offlinePageKey,
} from "./offline-routes";
import type { PrecacheEntry } from "./precache";

declare const self: ServiceWorkerGlobalScope;
declare const __PRECACHE__: ReadonlyArray<PrecacheEntry>;
declare const __BUILD_ID__: string;

const CACHE_PREFIX = "lanjut-build-";
const CACHE_NAME = `${CACHE_PREFIX}${__BUILD_ID__}`;
// Each cache keeps the list it was built from, so the next build reuses every
// file whose revision did not change.
const LIST_KEY = "/__lanjut-cache-list.json";
const PAGE_TIMEOUT_MS = 5000;

// The build pastes the list in at each use of `__PRECACHE__`, so it is read once.
const PRECACHE: ReadonlyArray<PrecacheEntry> = __PRECACHE__;

const ENTRIES = pipe(
  PRECACHE,
  A.map((entry) => [entry.url, entry] as const),
  D.fromPairs,
);

interface CacheList {
  createdAt: number;
  revisions: Record<string, string>;
}

interface BuildCache {
  name: string;
  cache: Cache;
  list: CacheList;
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activate());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (S.startsWith(url.pathname, "/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(pageResponse(event, url));
    return;
  }
  // Old windows still ask for the hashed files of the build they started on.
  const known = O.isSome(D.get(ENTRIES, url.pathname));
  if (known || S.startsWith(url.pathname, "/_astro/")) {
    event.respondWith(fileResponse(request, url));
  }
});

async function precache(): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const previous = await otherBuilds();
  await Promise.all(
    A.map(PRECACHE, (entry) => keepEntry(cache, previous, entry)),
  );
  const list: CacheList = {
    createdAt: Date.now(),
    revisions: pipe(
      PRECACHE,
      A.map((entry) => [entry.url, entry.revision] as const),
      D.fromPairs,
    ),
  };
  await cache.put(LIST_KEY, Response.json(list));
}

async function keepEntry(
  cache: Cache,
  previous: ReadonlyArray<BuildCache>,
  entry: PrecacheEntry,
): Promise<void> {
  const reused = await reusable(previous, entry);
  if (reused) return cache.put(entry.url, reused);
  if (entry.lazy) return;

  const response = await fetch(entry.url, {
    cache: "no-cache",
    headers: { [PRECACHE_HEADER]: "1" },
  });
  if (!response.ok || response.redirected) {
    throw new Error(`Cannot keep ${entry.url}: ${response.status}`);
  }
  await cache.put(entry.url, response);
}

/** The same file, at the same revision, from an earlier build's cache. */
async function reusable(
  previous: ReadonlyArray<BuildCache>,
  entry: PrecacheEntry,
): Promise<Response | undefined> {
  const sameRevision = A.filter(previous, (build) =>
    pipe(
      D.get(build.list.revisions, entry.url),
      O.mapWithDefault(false, (revision) => revision === entry.revision),
    ),
  );
  const responses = await Promise.all(
    A.map(sameRevision, (build) => build.cache.match(entry.url)),
  );
  return O.toUndefined(A.find(responses, G.isNotNullable));
}

async function activate(): Promise<void> {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
  await removeOldBuilds();
  await self.clients.claim();
}

/**
 * Keeps this build and the one before it. A window that still runs the
 * previous build can then load its lazy chunks, which the server no longer
 * has after a deploy.
 */
async function removeOldBuilds(): Promise<void> {
  const names = await otherBuildNames();
  const builds = await otherBuilds();
  const keep = pipe(
    builds,
    A.sortBy((build) => build.list.createdAt),
    A.last,
    O.mapWithDefault("", (build) => build.name),
  );
  await Promise.all(
    pipe(
      names,
      A.reject((name) => name === keep),
      A.map((name) => caches.delete(name)),
    ),
  );
}

async function otherBuildNames(): Promise<ReadonlyArray<string>> {
  return A.filter(
    await caches.keys(),
    (name) => S.startsWith(name, CACHE_PREFIX) && name !== CACHE_NAME,
  );
}

/** The earlier builds that finished their install. */
async function otherBuilds(): Promise<ReadonlyArray<BuildCache>> {
  const builds = await Promise.all(A.map(await otherBuildNames(), readBuild));
  return A.filterMap(builds, F.identity);
}

async function readBuild(name: string): Promise<O.Option<BuildCache>> {
  const cache = await caches.open(name);
  const response = await cache.match(LIST_KEY);
  if (!response) return O.None;
  const list = (await response.json()) as CacheList;
  return O.Some({ name, cache, list });
}

async function pageResponse(event: FetchEvent, url: URL): Promise<Response> {
  const answer = await Promise.race([networkPage(event), pageTimeout()]);
  return answer ?? offlinePage(url);
}

async function networkPage(event: FetchEvent): Promise<Response | undefined> {
  try {
    const preloaded: Response | undefined = await event.preloadResponse;
    return preloaded ?? (await fetch(event.request));
  } catch {
    return undefined;
  }
}

function pageTimeout(): Promise<undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), PAGE_TIMEOUT_MS);
  });
}

async function offlinePage(url: URL): Promise<Response> {
  const legacy = legacyTarget(url);
  if (legacy) return Response.redirect(legacy.href, 301);

  const localized = offlineLocaleTarget(url, await chosenLocale());
  if (localized) return Response.redirect(localized.href, 307);

  const page = await cachedFile(offlinePageKey(url.pathname));
  if (page) return page;

  const missing = await cachedFile(notFoundKey(url.pathname));
  if (!missing) return Response.error();
  return new Response(missing.body, { status: 404, headers: missing.headers });
}

/** The language the visitor chose, where the browser lets a service worker read the cookie. */
async function chosenLocale(): Promise<Locale | null> {
  if (!("cookieStore" in self)) return null;
  const cookie = await self.cookieStore.get(LOCALE_COOKIE).catch(() => null);
  const value = cookie?.value;
  return isLocale(value) ? value : null;
}

async function fileResponse(request: Request, url: URL): Promise<Response> {
  const entry = D.get(ENTRIES, url.pathname);
  const cache = await caches.open(CACHE_NAME);
  const own = await cache.match(url.pathname);
  if (own) return own;

  if (O.isNone(entry)) {
    const earlier = await caches.match(url.pathname);
    if (earlier) return earlier;
  }

  const response = await fetch(request);
  const lazy = O.mapWithDefault(entry, false, (found) => found.lazy === true);
  if (lazy && response.ok) await cache.put(url.pathname, response.clone());
  return response;
}

/** A page from this build's cache, or from an earlier build's. */
async function cachedFile(key: string): Promise<Response | undefined> {
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match(key)) ?? caches.match(key);
}
