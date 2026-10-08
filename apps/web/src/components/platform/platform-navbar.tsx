import { buttonVariants } from "@lanjut/ui/components/button";
import { SidebarTrigger } from "@lanjut/ui/components/sidebar";
import { cn } from "@lanjut/ui/lib/utils";
import { GithubLogoIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { REPO_URL } from "@/lib/site";
import { EditorSaveStatus } from "../editor/editor-save-status";
import { ExternalLink } from "../shared/external-link";
import { SiteSettingsMenu } from "../shared/site-settings-menu";
import { SiteThemeToggle } from "../shared/site-theme-toggle";
import { PlatformNavbarBreadcrumb } from "./platform-navbar-breadcrumb";

export function PlatformNavbar() {
  const view = useWorkspaceView();
  const t = useTranslations("platform.navbar");

  return (
    <header className="sticky top-0 inset-x-0 z-50 border-b bg-background motion-safe:bg-background/95 motion-safe:backdrop-blur-xl motion-safe:backdrop-saturate-150">
      <div className="h-12 flex items-center gap-2 px-6">
        <SidebarTrigger />
        <PlatformNavbarBreadcrumb />
        {view === "editor" && (
          <div className="ml-2 inline-flex">
            <EditorSaveStatus />
          </div>
        )}

        <div className="inline-flex items-center gap-2 ml-auto">
          <ExternalLink
            href={REPO_URL}
            className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
          >
            <GithubLogoIcon weight="fill" />
            <span className="max-md:sr-only">{t("starOnGithub")}</span>
          </ExternalLink>
          <SiteThemeToggle variant="outline" />
          <SiteSettingsMenu variant="outline" />
        </div>
      </div>
    </header>
  );
}
