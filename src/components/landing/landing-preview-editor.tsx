"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function LandingPreviewEditor() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("previewEditor");

  return (
    <section className="mx-auto w-11/12 max-w-5xl pb-24 md:pb-32">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl"
      >
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-base text-foreground/70 sm:text-lg">
          {t("description")}
        </p>
      </motion.div>

      <motion.figure
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 border border-foreground/15 bg-card p-2 md:mt-12 md:p-3"
      >
        <Image
          src="/lanjut-editor.png"
          alt={t("imageAlt")}
          title={t("imageAlt")}
          width={1437}
          height={871}
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="aspect-video w-full border border-foreground/10 object-cover"
        />
        <figcaption className="mt-2 px-1 font-mono text-xs text-muted-foreground">
          {t("caption")}
        </figcaption>
      </motion.figure>
    </section>
  );
}
