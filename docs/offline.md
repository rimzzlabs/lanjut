# Offline web app

The web app keeps its own build files on the device with a service worker, so the site opens, edits, and exports with no network. Résumés already live in IndexedDB. The desktop app loads its files from disk and has no service worker.

RFC: [#229](https://github.com/rimzzlabs/lanjut/issues/229).

## Files

| Part                           | Path                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| Service worker                 | `apps/web/service-worker/sw.ts`                              |
| Offline page rules             | `apps/web/service-worker/offline-routes.ts`                  |
| Build step (Astro integration) | `apps/web/service-worker/build.ts`                           |
| Registration                   | `apps/web/src/lib/service-worker.ts`, `PlatformOfflineCache` |
| Header rule for `/sw.js`       | `apps/web/public/_headers`                                   |

The service worker source has its own `tsconfig.json` with the `WebWorker` library. `pnpm typecheck` checks it after `astro check`.

## What the cache holds

On `astro:build:done`, the build lists every file in `dist/`, gives each one a revision (a hash of its content), and bundles `sw.js` with that list. The build fails if a page that must open offline is missing from the list.

| Files                                                          | When                                    |
| -------------------------------------------------------------- | --------------------------------------- |
| Every HTML page in both languages, except `splashscreen.html`  | At install                              |
| `_astro/`: JS, CSS, UI fonts, and the PDF engine (WebAssembly) | At install                              |
| Icons, `brand/`, `brands/`, `site.webmanifest`                 | At install                              |
| `fonts/`: the PDF fonts                                        | The first time the app fetches each one |
| `og/`, `llms.txt`, `*.md`, `robots.txt`, sitemaps, `_headers`  | Never                                   |
| `/api/*`                                                       | Never                                   |

The install downloads about 11 MB (about 3.5 MB compressed). The PDF fonts add up to 10 MB, but a résumé draws with a few files. The download dialogs and the Document tab fetch a template's fonts before an export (`preloadPdfExport`), so the template a person uses online is ready offline.

## Rules

The service worker answers only `GET` requests to its own origin.

1. A page load goes to the network first, through navigation preload where the browser has it. If the network fails, or gives no answer in 5 seconds, the cached page answers.
2. On that fallback, an address from an older layout redirects through `legacyTarget`.
3. On that fallback, an unprefixed address redirects to the visitor's language, read from the `locale` cookie through the Cookie Store API. Where a browser has no Cookie Store API in a service worker, the address opens in English.
4. On that fallback, `/editor/<id>` gets the cached editor page (`appPageFor`), and a path with no page gets the cached 404 page with status 404.
5. A file in the list comes from the cache first. A PDF font is saved the first time it loads.
6. A hashed file under `/_astro/` that is not in the list comes from an earlier build's cache, for a window that still runs that build.
7. All other requests, `/api/*` included, go to the network untouched.

Online, a page load gets the newest build, the same as with no service worker. The Worker still sends an unprefixed address to the visitor's language. The install marks its downloads with `PRECACHE_HEADER`, and the Worker serves those at their own address, so each language's page lands in the cache.

## Updates

Each build writes a new `sw.js` when any file changes. The browser checks `sw.js` on each page load, and `_headers` sets `Cache-Control: no-cache` on it. A new service worker copies every file with an unchanged revision from the earlier cache and downloads only the rest. It then takes over at once (`skipWaiting`, `clients.claim`).

The service worker keeps the cache of the previous build and deletes all older ones. A window that still runs the previous build can then load its lazy chunks, which the server no longer has after a deploy.

The changelog pages differ on each build, because Astro gives each island a random id and the sidebar skeleton draws random widths. Those two pages download again after each deploy.

## Registration

`PlatformOfflineCache` registers `/sw.js` from the app shell after the `load` event. It does not register:

- in `astro dev`,
- in the desktop build (`IS_DESKTOP`),
- when the browser reports Save-Data.

A visitor who reads only the landing page downloads nothing extra. After the first registration, the service worker covers the whole origin, the landing page included.

## Export with no network

If an export fails with no network, the exporter shows "This export needs the internet once". The cause is a file that is not on the device yet, in most cases the PDF fonts of a template that this browser never used.

## Privacy

The service worker caches only static build files from Lanjut's own origin. It never caches `/api/*`, never opens IndexedDB, and contacts no other origin. Résumé content never goes over the network, so it never passes through the service worker.

## Kill switch

If a bad service worker ships, ship this file as `sw.js`. It deletes every Lanjut cache, unregisters itself, and reloads open windows.

```js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("lanjut-build-"))
          .map((name) => caches.delete(name)),
      );
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: "window" });
      await Promise.all(windows.map((client) => client.navigate(client.url)));
    })(),
  );
});
```

1. Remove `serviceWorker()` from the integrations in `apps/web/astro.config.ts`.
2. Save the file above as `apps/web/public/sw.js`.
3. Deploy. The browser fetches `sw.js` on the next page load, so the fix reaches each person who opens the site once.

## Test steps

Run `pnpm build`, then `wrangler dev` in `apps/web` to serve the build with the Worker.

1. Open `/editor` and wait until the service worker controls the page and its cache holds `/__lanjut-cache-list.json`.
2. Stop the server and set the browser offline. Load `/editor`, `/id/editor`, `/editor/<id>`, `/template`, `/profile`, `/changelog`, `/feedback`, and `/`.
3. Set the `locale` cookie to `id`, then open `/editor` offline. If the browser has the Cookie Store API, it opens `/id/editor`.
4. Export a résumé as PDF, DOCX, and TXT offline.
5. Export a PDF offline in a template that this browser never used. Read the message.
6. Build again with a change, reload online, and check that a new cache appears. After a third build, check that two caches remain.
