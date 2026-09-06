"use client";

import { FileCheck2, HardDrive, ScanSearch } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

const VALUES = [
  { icon: HardDrive, titleKey: "localTitle", bodyKey: "localBody" },
  { icon: ScanSearch, titleKey: "parseTitle", bodyKey: "parseBody" },
  { icon: FileCheck2, titleKey: "freeTitle", bodyKey: "freeBody" },
] as const;

/** The three promises the product is built on, stated plainly. */
export function LandingValues() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("values");

  return (
    <section className="mx-auto w-11/12 max-w-5xl pb-24 md:pb-32">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="grid gap-6 border-t border-foreground/15 pt-12 md:grid-cols-3 md:gap-10 md:pt-16"
      >
        {VALUES.map((value) => (
          <div key={value.titleKey}>
            <value.icon className="size-5 text-primary" aria-hidden />
            <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
              {t(value.titleKey)}
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              {t(value.bodyKey)}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
