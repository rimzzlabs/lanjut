import { TooltipProvider } from "@lanjut/ui/components/tooltip";
import {
  AppThemeProvider,
  type IslandProps,
  IslandProviders,
} from "../shared/providers";
import { SiteSettingsMenu } from "../shared/site-settings-menu";
import { SiteThemeToggle } from "../shared/site-theme-toggle";

export function LandingNavbarSettings(
  props: IslandProps & { side?: "top" | "bottom"; buttonClassName?: string },
) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <AppThemeProvider>
        <TooltipProvider>
          <SiteThemeToggle className={props.buttonClassName} />
          <SiteSettingsMenu
            side={props.side}
            className={props.buttonClassName}
          />
        </TooltipProvider>
      </AppThemeProvider>
    </IslandProviders>
  );
}
