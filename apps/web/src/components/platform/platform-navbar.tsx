import { buttonVariants } from "@lanjut/ui/components/button";
import { SidebarTrigger } from "@lanjut/ui/components/sidebar";
import { cn } from "@lanjut/ui/lib/utils";
import { GithubLogoIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { REPO_URL } from "@/lib/site";
import { EditorSaveStatus } from "../editor/editor-save-status";
import { ProfileMenu } from "../profile/profile-menu";
import { ExternalLink } from "../shared/external-link";
import { PlatformNavbarBreadcrumb } from "./platform-navbar-breadcrumb";

export function PlatformNavbar() {
  const view = useWorkspaceView();
  const t = useTranslations("platform.navbar");

  return (
    <header className="border-b bg-background">
      <div className="flex h-12 items-center gap-2 px-4 md:px-6">
        <SidebarTrigger id="tour-menu-button" />
        <div className="max-md:hidden">
          <PlatformNavbarBreadcrumb />
        </div>
        {view === "editor" && (
          <div className="ml-2 inline-flex">
            <EditorSaveStatus />
          </div>
        )}

        <div className="inline-flex items-center gap-2 ml-auto">
          <ExternalLink
            href={REPO_URL}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "gap-2 bg-neutral-800 hover:bg-neutral-700 dark:bg-background text-neutral-50 hover:text-neutral-50 dark:text-stone-50 max-md:w-9 max-md:px-0",
            )}
          >
            <GithubLogoIcon weight="fill" />
            <span className="max-md:sr-only">{t("starOnGithub")}</span>
          </ExternalLink>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
