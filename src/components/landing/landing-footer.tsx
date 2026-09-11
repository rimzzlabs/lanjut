import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DONATION_LINKS } from "@/lib/site";
import { ExternalLink } from "../shared/external-link";

const YEAR = new Date().getFullYear();

export function LandingFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-foreground/15">
      <div className="mx-auto grid w-11/12 max-w-5xl gap-8 py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-brand text-lg font-bold tracking-tight"
          >
            <Image
              src="/favicon.svg"
              alt=""
              width={22}
              height={22}
              className="size-5.5"
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
          <ExternalLink
            href="https://github.com/rimzzlabs/lanjut"
            className="transition-colors hover:text-foreground"
          >
            {t("github")}
          </ExternalLink>
        </nav>
      </div>

      <div className="border-t border-foreground/10">
        <div className="mx-auto flex w-11/12 max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
          <p className="font-mono text-xs text-muted-foreground">
            {t("rights", { year: YEAR })}
          </p>
          <nav
            aria-label={t("supportAriaLabel")}
            className="flex items-center gap-x-4 text-xs text-muted-foreground"
          >
            <span>{t("support")}</span>
            <ExternalLink
              href={DONATION_LINKS.saweria}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Image
                src="/brands/saweria.png"
                alt=""
                width={14}
                height={14}
                className="size-3.5"
              />
              Saweria
            </ExternalLink>
            <ExternalLink
              href={DONATION_LINKS.sociabuzz}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Image
                src="/brands/sociabuzz.png"
                alt=""
                width={14}
                height={14}
                className="size-3.5"
              />
              SociaBuzz
            </ExternalLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
