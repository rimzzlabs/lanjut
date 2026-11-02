import { Button, buttonVariants } from "@lanjut/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@lanjut/ui/components/drawer";
import { TooltipProvider } from "@lanjut/ui/components/tooltip";
import { cn } from "@lanjut/ui/lib/utils";
import { ArrowRightIcon, ListIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { GithubMarkIcon } from "../shared/brand-icons";
import { IslandProviders } from "../shared/island-providers";
import { AppThemeProvider, type IslandProps } from "../shared/providers";
import { SiteSettingsMenu } from "../shared/site-settings-menu";
import { SiteThemeToggle } from "../shared/site-theme-toggle";

export interface MenuLink {
  href: string;
  label: string;
}

interface LandingMobileMenuProps extends IslandProps {
  links: ReadonlyArray<MenuLink>;
  build: MenuLink;
  repoUrl: string;
  /** The compact star count, absent when the build could not read it. */
  stars?: string;
  githubName: string;
}

/**
 * The mobile bar's controls: the theme toggle and the settings menu, then a
 * Menu button. The menu opens a drawer with the desktop navbar's links in the
 * same order: the pages, GitHub, then the primary action.
 */
export function LandingMobileMenu(props: LandingMobileMenuProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <AppThemeProvider>
        <TooltipProvider>
          <LandingMobileMenuDrawer {...props} />
        </TooltipProvider>
      </AppThemeProvider>
    </IslandProviders>
  );
}

function LandingMobileMenuDrawer(props: LandingMobileMenuProps) {
  const t = useTranslations("nav");

  return (
    <div className="flex items-center gap-1">
      <SiteThemeToggle />
      <SiteSettingsMenu side="top" />
      <Drawer showSwipeHandle>
        <DrawerTrigger render={<Button variant="ghost" size="icon" />}>
          <ListIcon />
          <span className="sr-only">{t("menu")}</span>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t("menu")}</DrawerTitle>
          </DrawerHeader>
          <nav aria-label={t("main")} className="flex flex-col px-4 pt-2">
            {props.links.map((link) => (
              <LandingMobileMenuLink key={link.href} link={link} />
            ))}
            <a
              href={props.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 border-b border-border py-4 text-lg font-medium"
            >
              <GithubMarkIcon className="size-5" />
              <span aria-hidden="true">GitHub</span>
              {props.stars && (
                <span aria-hidden="true" className="text-muted-foreground">
                  {props.stars}
                </span>
              )}
              <span className="sr-only">
                {props.githubName}, {t("newTab")}
              </span>
            </a>
          </nav>
          <DrawerFooter className="gap-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <a
              href={props.build.href}
              className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2")}
            >
              {props.build.label}
              <ArrowRightIcon />
            </a>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function LandingMobileMenuLink(props: { link: MenuLink }) {
  return (
    <a
      href={props.link.href}
      className="border-b border-border py-4 text-lg font-medium"
    >
      {props.link.label}
    </a>
  );
}
