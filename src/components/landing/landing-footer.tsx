import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "../shared/language-switcher";

const YEAR = new Date().getFullYear();

export function LandingFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-11/12 max-w-5xl flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.svg"
              alt=""
              width={20}
              height={20}
              className="size-5 rounded-[4px]"
            />
            <span className="font-heading text-sm font-semibold">Lanjut</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("tagline")}</p>
        </div>

        <nav
          aria-label={t("ariaLabel")}
          className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <Link
            href="/platform"
            className="transition-colors hover:text-foreground"
          >
            {t("startBuilding")}
          </Link>
          <Link
            href="/platform/template"
            className="transition-colors hover:text-foreground"
          >
            {t("templates")}
          </Link>
          <a
            href="https://github.com/rimzzlabs/lanjut"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {t("github")}
          </a>
          <LanguageSwitcher />
        </nav>

        <p className="text-center text-xs text-muted-foreground md:text-right">
          {t("rights", { year: YEAR })}
        </p>
      </div>
    </footer>
  );
}
