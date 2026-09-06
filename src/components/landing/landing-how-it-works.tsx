"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LandingLiveResume } from "./landing-live-resume";
import { LandingParserProof } from "./landing-parser-proof";
import { LandingTemplateFan } from "./landing-template-fan";

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
          <LandingTemplateFan />
        </HowItWorksRow>

        <HowItWorksRow
          kicker={t("step2Kicker")}
          title={t("step2Title")}
          description={t("step2Description")}
          flip
          reduceMotion={reduceMotion}
        >
          <div>
            <LandingLiveResume template="tebal" cropHeight={420} />
            <p className="mt-2 px-1 font-mono text-xs text-muted-foreground">
              {t("liveCaption")}
            </p>
          </div>
        </HowItWorksRow>

        <HowItWorksRow
          kicker={t("step3Kicker")}
          title={t("step3Title")}
          description={t("step3Description")}
          alignStart
          reduceMotion={reduceMotion}
        >
          <LandingParserProof />
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
  /** Top-align the columns; for rows whose visual grows taller than the copy. */
  alignStart?: boolean;
  reduceMotion: boolean | null;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={props.reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "grid gap-6 border-t border-foreground/15 py-12 md:grid-cols-12 md:gap-12 md:py-16",
        props.alignStart ? "items-start" : "items-center",
      )}
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
