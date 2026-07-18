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
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="border-y-2 border-foreground py-16 md:py-24"
      >
        <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
          {t("kicker")}
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.04] font-semibold tracking-tight text-balance">
          {t("heading")}
        </h2>
        <p className="mt-5 max-w-2xl text-base text-foreground/70 sm:text-lg">
          {t("description")}
        </p>
        <div className="mt-9 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
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
