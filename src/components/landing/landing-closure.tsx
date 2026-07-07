"use client";

import { ArrowRight, Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function LandingClosure() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("closure");

  return (
    <section className="mx-auto w-11/12 max-w-5xl pb-24 md:pb-32">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl border bg-muted/40 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem] px-6 py-14 text-center shadow-xl shadow-primary/10 md:py-20"
      >
        <p className="font-mono text-xs tracking-widest text-primary uppercase">
          {t("kicker")}
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground text-balance sm:text-base">
          {t("description")}
        </p>
        <div className="mx-auto mt-8 flex w-full max-w-xs flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
          <Button
            size="lg"
            className="gap-2"
            nativeButton={false}
            render={<Link href="/platform?create=true" />}
          >
            {t("ctaPrimary")}
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/platform/template" />}
          >
            <Search />
            {t("ctaSecondary")}
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
