import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const YEAR = new Date().getFullYear();

export function LandingFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-foreground/15">
      <div className="mx-auto grid w-11/12 max-w-5xl gap-8 py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div>
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
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {t("tagline")}
          </p>
        </div>

        <nav
          aria-label={t("ariaLabel")}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
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
        </nav>
      </div>

      <div className="border-t border-foreground/10">
        <p className="mx-auto w-11/12 max-w-5xl py-5 font-mono text-xs text-muted-foreground">
          {t("rights", { year: YEAR })}
        </p>
      </div>
    </footer>
  );
}
