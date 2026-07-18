"use client";

import { ArrowRight, Search } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const STATS = [
  { valueKey: "stat1Value", labelKey: "stat1Label" },
  { valueKey: "stat2Value", labelKey: "stat2Label" },
  { valueKey: "stat3Value", labelKey: "stat3Label" },
] as const;

export function LandingHero() {
  const t = useTranslations("hero");

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-[calc(100svh-3.5rem)] w-11/12 max-w-5xl flex-col justify-center py-20 md:py-28"
    >
      <motion.p
        variants={itemVariants}
        className="flex items-center gap-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
      >
        <span aria-hidden className="h-px w-8 bg-primary" />
        {t("badge")}
      </motion.p>

      <motion.h1
        variants={itemVariants}
        className="mt-6 max-w-4xl font-display text-[clamp(2.5rem,7vw,5.25rem)] leading-[1.02] font-semibold tracking-tight text-balance wrap-anywhere"
      >
        <span className="sr-only">{t("srHeading")}</span>
        {t("headingLine1")}
        <br />
        <span className="text-primary">{t("headingLine2")}</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mt-7 max-w-2xl text-base text-foreground/70 sm:text-lg"
      >
        {t("description")}
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="mt-9 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
      >
        <Button
          size="lg"
          className="gap-2"
          nativeButton={false}
          render={<Link href="/platform" />}
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
      </motion.div>

      <motion.dl
        variants={itemVariants}
        className="mt-14 grid max-w-2xl grid-cols-3 divide-x divide-foreground/15 border-y border-foreground/15"
      >
        {STATS.map((stat) => (
          <div key={stat.labelKey} className="px-4 py-4 first:pl-0">
            <dt className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t(stat.valueKey)}
            </dt>
            <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t(stat.labelKey)}
            </dd>
          </div>
        ))}
      </motion.dl>
    </motion.section>
  );
}
