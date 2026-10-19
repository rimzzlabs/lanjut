import { MESSAGES } from "@lanjut/i18n/messages";
import { Toaster } from "@lanjut/ui/components/sonner";
import { TooltipProvider } from "@lanjut/ui/components/tooltip";
import { NuqsAdapter } from "nuqs/adapters/react";
import { type PropsWithChildren, useEffect } from "react";
import { Router } from "wouter";
import { IS_DESKTOP } from "@/lib/build-target";
import { publicPath } from "@/lib/seo";
import { registerResumeFlushListeners } from "@/lib/store";
import { DesktopLocaleMemory } from "./desktop-locale-memory";
import { DesktopUpdater } from "./desktop-updater";
import { AppThemeProvider, CopyProviders, type IslandProps } from "./providers";

/** Context for an application page: the platform, the editor, feedback. */
export function AppProviders(props: PropsWithChildren<IslandProps>) {
  useEffect(() => registerResumeFlushListeners(), []);

  return (
    <CopyProviders
      locale={props.locale}
      pathname={props.pathname}
      messages={MESSAGES[props.locale]}
    >
      {/* wouter reads `location` while rendering unless a router supplies the
          path and search, and /feedback and /changelog render on the server.
          The build names /changelog.html, so the routes get the public path. */}
      <Router ssrPath={publicPath(props.pathname)} ssrSearch="">
        <NuqsAdapter>
          {IS_DESKTOP && <DesktopLocaleMemory />}
          {IS_DESKTOP && <DesktopUpdater />}
          <AppThemeProvider>
            <TooltipProvider>{props.children}</TooltipProvider>
            <Toaster />
          </AppThemeProvider>
        </NuqsAdapter>
      </Router>
    </CopyProviders>
  );
}
