import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/react";
import { type PropsWithChildren, useEffect } from "react";
import { IntlProvider } from "use-intl";
import { MESSAGES } from "@/i18n/messages";
import { PathnameContext } from "@/i18n/navigation";
import { type Locale, stripLocale } from "@/i18n/routing";
import { IS_DESKTOP } from "@/lib/build-target";
import { registerResumeFlushListeners } from "@/lib/store";
import { Toaster } from "../ui/sonner";
import { TooltipProvider } from "../ui/tooltip";
import { DesktopLocaleMemory } from "./desktop-locale-memory";
import { DesktopUpdater } from "./desktop-updater";

/** The props Astro passes to every island. */
export interface IslandProps {
  locale: Locale;
  pathname: string;
}

/**
 * Pages are rendered at build time, where no visitor time zone exists. Nothing
 * in the static HTML formats a date, so the browser's own zone is safe here.
 */
function resolveTimeZone() {
  if (typeof window === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const TIME_ZONE = resolveTimeZone();

/**
 * Context for an island that only reads copy and the current path. Each island
 * is its own React root, so each one carries its own providers.
 */
export function IslandProviders(props: PropsWithChildren<IslandProps>) {
  return (
    <IntlProvider
      locale={props.locale}
      messages={MESSAGES[props.locale]}
      timeZone={TIME_ZONE}
    >
      <PathnameContext value={stripLocale(props.pathname)}>
        {props.children}
      </PathnameContext>
    </IntlProvider>
  );
}

/** next-themes, set up once for every island that reads or changes the theme. */
export function AppThemeProvider(props: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      {props.children}
    </ThemeProvider>
  );
}

/** Context for an application page: the platform, the editor, feedback. */
export function AppProviders(props: PropsWithChildren<IslandProps>) {
  useEffect(() => registerResumeFlushListeners(), []);

  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <NuqsAdapter>
        {IS_DESKTOP && <DesktopLocaleMemory />}
        {IS_DESKTOP && <DesktopUpdater />}
        <AppThemeProvider>
          <TooltipProvider>{props.children}</TooltipProvider>
          <Toaster />
        </AppThemeProvider>
      </NuqsAdapter>
    </IslandProviders>
  );
}
