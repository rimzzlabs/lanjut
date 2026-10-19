import { type Locale, stripLocale } from "@lanjut/i18n/routing";
import { ThemeProvider } from "next-themes";
import type { ComponentProps, PropsWithChildren } from "react";
import { IntlProvider } from "use-intl";
import { PathnameContext } from "@/i18n/navigation";

/** The props Astro passes to every island. */
export interface IslandProps {
  locale: Locale;
  pathname: string;
}

/**
 * Pages are rendered at build time, where no visitor time zone exists. The one
 * date in the static HTML, a changelog release day, names its own zone, so the
 * browser's own zone is safe here.
 */
function resolveTimeZone() {
  if (typeof window === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const TIME_ZONE = resolveTimeZone();

interface CopyProvidersProps extends PropsWithChildren<IslandProps> {
  messages: ComponentProps<typeof IntlProvider>["messages"];
}

/**
 * Copy and the current path for one island root. Each island is its own React
 * root, so each one carries its own providers. The caller picks the copy, so
 * this module imports none and a page loads only the copy it reads.
 */
export function CopyProviders(props: CopyProvidersProps) {
  return (
    <IntlProvider
      locale={props.locale}
      messages={props.messages}
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
