"use client";

import { ArrowUpRight, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { ExternalLink } from "@/components/shared/external-link";
import { Button } from "@/components/ui/button";
import { DESKTOP_RELEASE_URL } from "@/lib/site";

/**
 * Desktop download. The build is unsigned, so macOS blocks it on first open and
 * calls it damaged. That warning sits next to the button on purpose: a user who
 * meets it with no explanation concludes the app is broken.
 */
export function LandingDesktop() {
  const t = useTranslations("desktop");

  return (
    <section className="mx-auto w-11/12 max-w-5xl pb-24 md:pb-32">
      <div className="flex flex-col gap-6 rounded-2xl border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-10">
        <div className="max-w-xl">
          <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
            {t("kicker")}
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("heading")}
          </h2>
          <p className="mt-3 text-foreground/70 text-sm sm:text-base">
            {t("description")}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <Button
            size="lg"
            className="gap-2"
            nativeButton={false}
            render={<ExternalLink href={DESKTOP_RELEASE_URL} />}
          >
            <Download />
            {t("cta")}
            <ArrowUpRight />
          </Button>
          <p className="max-w-72 text-pretty text-muted-foreground text-xs md:text-right">
            {t("gatekeeper")}
          </p>
        </div>
      </div>
    </section>
  );
}
