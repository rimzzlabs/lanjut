import { type Locale, localizePath } from "@lanjut/i18n/routing";
import type { ComponentProps, MouseEvent } from "react";
import { createContext, useContext } from "react";
import { useLocale } from "use-intl";
import { flushOpenResumePersist } from "@/lib/store/persistence";

/**
 * The page path, without its locale prefix. Astro hands it to every island, so
 * the server render and the first client render agree. The app's router
 * overrides it with the live path as the app moves between its pages.
 */
export const PathnameContext = createContext("/");

export function usePathname() {
  return useContext(PathnameContext);
}

interface NavigateOptions {
  locale?: Locale;
  scroll?: boolean;
}

/** Moves between the app pages without a document load. */
export interface AppRouter {
  /** Whether the app can show `href` in place. */
  owns(href: string): boolean;
  go(href: string, replace: boolean): void;
}

/**
 * Set by the app's island root. Context does not cross islands, so a link on
 * any other page (the landing page) never sees it.
 */
export const AppRouterContext = createContext<AppRouter | null>(null);

/**
 * Inside the app, a move to another app page swaps the content and keeps the
 * shell. Every other page change is a full document load. A pending résumé
 * write is flushed first either way, so the next view reads what this one
 * wrote.
 */
async function navigate(
  href: string,
  replace: boolean,
  router: AppRouter | null,
) {
  await flushOpenResumePersist();
  if (router?.owns(href)) {
    router.go(href, replace);
    return;
  }
  if (replace) window.location.replace(href);
  else window.location.assign(href);
}

export function useRouter() {
  const locale = useLocale() as Locale;
  const router = useContext(AppRouterContext);

  return {
    push(href: string, options?: NavigateOptions) {
      const target = localizePath(href, options?.locale ?? locale);
      return navigate(target, false, router);
    },
    replace(href: string, options?: NavigateOptions) {
      const target = localizePath(href, options?.locale ?? locale);
      return navigate(target, true, router);
    },
  };
}

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.currentTarget.target
  );
}

export function Link(
  props: ComponentProps<"a"> & { href: string; locale?: Locale },
) {
  const current = useLocale() as Locale;
  const router = useContext(AppRouterContext);
  const { locale, onClick, ...rest } = props;
  const href = localizePath(props.href, locale ?? current);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !isPlainClick(event)) return;
    event.preventDefault();
    void navigate(href, false, router);
  }

  return <a {...rest} href={href} onClick={handleClick} />;
}
