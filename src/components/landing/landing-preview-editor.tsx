"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function LandingPreviewEditor() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("previewEditor");

  return (
    <section className="mx-auto w-11/12 max-w-5xl pb-24 text-center md:pb-32">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground text-balance sm:text-base">
          {t("description")}
        </p>
      </motion.div>

      <motion.figure
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 22,
          mass: 0.9,
          opacity: { duration: 0.4, ease: "easeOut" },
        }}
        className="mt-8 rounded-xl border bg-muted/40 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem] p-2 shadow-2xl shadow-primary/10 md:mt-12 md:rounded-2xl md:p-3"
      >
        <Image
          src="/lanjut-editor.png"
          alt={t("imageAlt")}
          title={t("imageAlt")}
          width={1437}
          height={871}
          className="w-full aspect-video rounded-lg border object-scale-down object-top"
        />
        <figcaption className="sr-only">{t("caption")}</figcaption>
      </motion.figure>
    </section>
  );
}
