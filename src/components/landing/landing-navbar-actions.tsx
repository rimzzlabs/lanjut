import { PlatformNavbarTheme } from "../platform/platform-navbar-theme";
import { LanguageSwitcher } from "../shared/language-switcher";
import {
  AppThemeProvider,
  type IslandProps,
  IslandProviders,
} from "../shared/providers";
import { TooltipProvider } from "../ui/tooltip";
import { LandingNavbarSheet } from "./landing-navbar-sheet";

/** The navbar's interactive end: language, theme, and the mobile menu. */
export function LandingNavbarActions(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <AppThemeProvider>
        <TooltipProvider>
          <div className="ml-6 hidden items-center gap-1 border-l border-foreground/15 pl-6 md:inline-flex">
            <LanguageSwitcher />
            <PlatformNavbarTheme />
          </div>
          <div className="ml-auto md:hidden">
            <LandingNavbarSheet />
          </div>
        </TooltipProvider>
      </AppThemeProvider>
    </IslandProviders>
  );
}
