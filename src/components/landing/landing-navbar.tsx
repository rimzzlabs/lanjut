import { FilePlus, Layout, LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlatformNavbarTheme } from "../platform/platform-navbar-theme";
import { LanguageSwitcher } from "../shared/language-switcher";
import { Button } from "../ui/button";
import { LandingNavbarSheet } from "./landing-navbar-sheet";

export function LandingNavbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 py-2 backdrop-blur">
      <div className="mx-auto flex w-11/12 max-w-5xl items-center gap-1">
        <nav className="hidden items-center gap-1 md:inline-flex">
          <Button
            size="sm"
            className="px-1 text-foreground"
            variant="link"
            nativeButton={false}
            render={<Link href="/platform" />}
          >
            <Layout />
            {t("dashboard")}
          </Button>

          <Button
            size="sm"
            className="px-1 text-foreground"
            variant="link"
            nativeButton={false}
            render={<Link href="/platform/template" />}
          >
            <LayoutTemplate />
            {t("templates")}
          </Button>
        </nav>

        <nav className="ml-auto inline-flex items-center gap-2">
          <div className="inline-flex items-center gap-2 max-md:hidden">
            <LanguageSwitcher />
            <PlatformNavbarTheme />
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/platform?create=true" />}
            className="bg-linear-to-br from-primary to-sky-800 text-background dark:from-emerald-200 dark:to-cyan-400"
          >
            <FilePlus />
            {t("createResume")}
          </Button>
        </nav>
        <LandingNavbarSheet />
      </div>
    </header>
  );
}
