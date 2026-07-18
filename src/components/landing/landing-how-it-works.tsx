"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const terminalVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const terminalLineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

export function LandingHowItWorks() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("howItWorks");

  return (
    <section
      id="how-it-works"
      className="mx-auto w-11/12 max-w-5xl pb-24 md:pb-32"
    >
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
          {t("subheading")}
        </p>
      </motion.div>

      <div className="mt-14 md:mt-20">
        <HowItWorksRow
          kicker={t("step1Kicker")}
          title={t("step1Title")}
          description={t("step1Description")}
          reduceMotion={reduceMotion}
        >
          <HowItWorksScreenshot
            src="/lanjut-templates.png"
            alt={t("screenshotTemplatesAlt")}
            width={2880}
            height={1800}
          />
        </HowItWorksRow>

        <HowItWorksRow
          kicker={t("step2Kicker")}
          title={t("step2Title")}
          description={t("step2Description")}
          flip
          reduceMotion={reduceMotion}
        >
          <HowItWorksScreenshot
            src="/lanjut-editor.png"
            alt={t("screenshotEditorAlt")}
            width={1437}
            height={871}
          />
        </HowItWorksRow>

        <HowItWorksRow
          kicker={t("step3Kicker")}
          title={t("step3Title")}
          description={t("step3Description")}
          reduceMotion={reduceMotion}
        >
          <ArtifactParserOutput />
        </HowItWorksRow>
      </div>
    </section>
  );
}

function HowItWorksRow(props: {
  kicker: string;
  title: string;
  description: string;
  flip?: boolean;
  reduceMotion: boolean | null;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={props.reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="grid items-center gap-6 border-t border-foreground/15 py-12 md:grid-cols-12 md:gap-12 md:py-16"
    >
      <div
        className={props.flip ? "md:order-2 md:col-span-5" : "md:col-span-5"}
      >
        <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
          {props.kicker}
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {props.title}
        </h3>
        <p className="mt-3 text-sm text-foreground/70 sm:text-base">
          {props.description}
        </p>
      </div>
      <div
        className={props.flip ? "md:order-1 md:col-span-7" : "md:col-span-7"}
      >
        {props.children}
      </div>
    </motion.div>
  );
}

function HowItWorksScreenshot(props: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="border border-foreground/15 bg-card p-2">
      <Image
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
        sizes="(max-width: 768px) 100vw, 600px"
        className="w-full border border-foreground/10 object-cover object-top"
      />
      <figcaption className="sr-only">{props.alt}</figcaption>
    </figure>
  );
}

function ArtifactParserOutput() {
  const t = useTranslations("howItWorks");

  return (
    <figure>
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>{t("terminalCaption")}</span>
        <span className="tabular-nums">.pdf · .docx · .txt</span>
      </figcaption>
      <motion.div
        variants={terminalVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="border border-stone-800 bg-stone-950 p-4 text-left font-mono text-xs leading-relaxed sm:p-5 sm:text-sm dark:border-stone-700"
      >
        <motion.p variants={terminalLineVariants} className="text-stone-500">
          $ pdftotext resume.pdf -
        </motion.p>
        <motion.p
          variants={terminalLineVariants}
          className="mt-3 text-emerald-400"
        >
          EXPERIENCE
        </motion.p>
        <motion.p variants={terminalLineVariants} className="text-stone-200">
          Senior Frontend Engineer, Acme Corp
        </motion.p>
        <motion.p variants={terminalLineVariants} className="text-stone-400">
          Mar 2022 – Present
        </motion.p>
        <motion.p variants={terminalLineVariants} className="text-stone-200">
          - Led migration of a 200k-line codebase to a typed component library,
          cutting UI defects by 40%
        </motion.p>
        <motion.p
          variants={terminalLineVariants}
          className="mt-3 text-emerald-500"
        >
          {t("terminalReadingOrder")}
        </motion.p>
      </motion.div>
    </figure>
  );
}
