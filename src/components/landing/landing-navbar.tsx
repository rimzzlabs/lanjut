import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlatformNavbarTheme } from "../platform/platform-navbar-theme";
import { LanguageSwitcher } from "../shared/language-switcher";
import { LandingNavbarSheet } from "./landing-navbar-sheet";

export function LandingNavbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-11/12 max-w-5xl items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <Image
            src="/favicon.svg"
            alt=""
            width={22}
            height={22}
            className="size-5.5 rounded-[5px]"
          />
          Lanjut
        </Link>

        <nav className="ml-auto hidden items-center gap-8 md:inline-flex">
          <Link
            href="/platform"
            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            {t("dashboard")}
          </Link>
          <Link
            href="/platform/template"
            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            {t("templates")}
          </Link>
        </nav>

        <div className="ml-6 hidden items-center gap-1 border-l border-foreground/15 pl-6 md:inline-flex">
          <LanguageSwitcher />
          <PlatformNavbarTheme />
        </div>

        <div className="ml-auto md:hidden">
          <LandingNavbarSheet />
        </div>
      </div>
    </header>
  );
}
