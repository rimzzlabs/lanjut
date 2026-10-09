import {
  type Locale,
  localeFromPath,
  routing,
  stripLocale,
} from "@lanjut/i18n/routing";
import { S } from "@mobily/ts-belt";
import { type PropsWithChildren, useMemo } from "react";
import { useLocale } from "use-intl";
import { Router, useLocation } from "wouter";
import {
  type AppRouter,
  AppRouterContext,
  PathnameContext,
} from "@/i18n/navigation";
import { scrollPageToTop } from "@/lib/page-scroll";
import {
  EDITOR_PATHNAME,
  PROFILE_PATHNAME,
  TEMPLATE_PATHNAME,
} from "@/lib/routes";

/** Fired after the app moves to another of its pages. */
export const APP_NAVIGATE_EVENT = "lanjut:navigate";

function isAppPathname(pathname: string) {
  return (
    pathname === EDITOR_PATHNAME ||
    pathname === TEMPLATE_PATHNAME ||
    pathname === PROFILE_PATHNAME ||
    S.startsWith(pathname, `${EDITOR_PATHNAME}/`)
  );
}

type Navigate = ReturnType<typeof useLocation>[1];

function createAppRouter(locale: Locale, navigate: Navigate): AppRouter {
  return {
    owns(href) {
      const url = new URL(href, window.location.href);
      return (
        url.origin === window.location.origin &&
        localeFromPath(url.pathname) === locale &&
        isAppPathname(stripLocale(url.pathname))
      );
    },
    go(href, replace) {
      const url = new URL(href, window.location.href);
      navigate(`${stripLocale(url.pathname)}${url.search}`, { replace });
      if (!replace) scrollPageToTop();
      window.dispatchEvent(new Event(APP_NAVIGATE_EVENT));
    },
  };
}

/**
 * Moves between the app pages with wouter, so the shell stays mounted. The
 * locale prefix is the router's base. A link to the same page in another
 * language still reloads, because the copy is fixed per page load.
 */
export function PlatformAppRouter(props: PropsWithChildren) {
  const locale = useLocale() as Locale;
  const base = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (
    <Router base={base}>
      <PlatformAppNavigation locale={locale}>
        {props.children}
      </PlatformAppNavigation>
    </Router>
  );
}

function PlatformAppNavigation(props: PropsWithChildren<{ locale: Locale }>) {
  const [location, navigate] = useLocation();
  const router = useMemo(
    () => createAppRouter(props.locale, navigate),
    [props.locale, navigate],
  );

  return (
    <AppRouterContext.Provider value={router}>
      <PathnameContext.Provider value={stripLocale(location)}>
        {props.children}
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );
}
