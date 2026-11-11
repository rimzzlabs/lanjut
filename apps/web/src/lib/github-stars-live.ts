import { O, R } from "@mobily/ts-belt";
import { IS_DESKTOP } from "./build-target";
import { parseStars, STARS_PATH } from "./github-stars";

// One request per page load, shared by the page script and the mobile menu.
let request: Promise<O.Option<number>> | undefined;

/**
 * The star count from the Worker's hourly copy. A failed request gives none,
 * and the page keeps the count of its build. The desktop app makes no request.
 */
export function loadStars(): Promise<O.Option<number>> {
  if (IS_DESKTOP) return Promise.resolve(O.None);
  request ??= fetch(STARS_PATH)
    .then((response) => (response.ok ? response.json() : undefined))
    .then(
      (raw) => R.toOption(parseStars(raw)),
      () => O.None,
    );
  return request;
}
