"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { type ReactNode, useId } from "react";

type Step = {
  kicker: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    kicker: "01 · Template",
    title: "Pick a template",
    description:
      "Start from a template you like. Each one only changes typography, spacing, and accents — the structure underneath stays ATS-safe.",
  },
  {
    kicker: "02 · Content",
    title: "Type it once",
    description:
      "Fill structured sections — experience, education, skills. Every change lands in your browser's storage and nowhere else.",
  },
  {
    kicker: "03 · Export",
    title: "Survive the parser",
    description:
      "Download PDF, DOCX, or plain text, and any extractor reads it back in the order you wrote it. That's the whole trick.",
  },
];

const terminalVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};

const terminalLineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

export function LandingHowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="mx-auto w-11/12 max-w-5xl pb-24 md:pb-32"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground text-balance sm:text-base">
          The same résumé at every stage: what you type, what recruiters see,
          and what the parser reads back.
        </p>
      </motion.div>

      <div className="mt-10 space-y-10 md:mt-16 md:space-y-0">
        <HowItWorksRow step={STEPS[0]} reduceMotion={reduceMotion}>
          <HowItWorksScreenshot
            src="/lanjut-templates.png"
            alt="The Lanjut template gallery showing the same résumé in different typographic styles"
            width={2880}
            height={1800}
          />
        </HowItWorksRow>

        <HowItWorksArrow flip={false} />

        <HowItWorksRow step={STEPS[1]} flip reduceMotion={reduceMotion}>
          <HowItWorksScreenshot
            src="/lanjut-editor.png"
            alt="The Lanjut editor with a résumé preview beside structured sections"
            width={1437}
            height={871}
          />
        </HowItWorksRow>

        <HowItWorksArrow flip />

        <HowItWorksRow step={STEPS[2]} reduceMotion={reduceMotion}>
          <ArtifactParserOutput />
        </HowItWorksRow>
      </div>
    </section>
  );
}

function HowItWorksRow(props: {
  step: Step;
  flip?: boolean;
  reduceMotion: boolean | null;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={props.reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="grid items-center gap-5 md:grid-cols-12 md:gap-10"
    >
      <div
        className={props.flip ? "md:order-2 md:col-span-5" : "md:col-span-5"}
      >
        <p className="font-mono text-xs tracking-widest text-primary uppercase">
          {props.step.kicker}
        </p>
        <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
          {props.step.title}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {props.step.description}
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
    <figure className="rounded-xl border bg-muted/40 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem] p-2 shadow-xl shadow-primary/10">
      <Image
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
        className="w-full rounded-lg border object-cover object-top"
      />
      <figcaption className="sr-only">{props.alt}</figcaption>
    </figure>
  );
}

function HowItWorksArrow(props: { flip: boolean }) {
  const markerId = useId();

  return (
    <div
      aria-hidden
      className="my-4 hidden justify-center text-muted-foreground/50 md:flex"
    >
      <svg
        aria-hidden="true"
        width="240"
        height="88"
        viewBox="0 0 240 88"
        fill="none"
        className={props.flip ? "-scale-x-100" : undefined}
      >
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="M1 1 L9 5 L1 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        <path
          d="M228 6 C 176 66, 74 14, 14 76"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 6"
          strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
        />
      </svg>
    </div>
  );
}

function ArtifactParserOutput() {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-800 bg-stone-950 text-left shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 px-4 py-2">
        <span className="font-mono text-[11px] text-stone-500">
          what the ATS reads
        </span>
        <div className="flex gap-1.5 font-mono text-[10px] text-stone-400">
          <span className="rounded border border-stone-700 px-1.5 py-0.5">
            .pdf
          </span>
          <span className="rounded border border-stone-700 px-1.5 py-0.5">
            .docx
          </span>
          <span className="rounded border border-stone-700 px-1.5 py-0.5">
            .txt
          </span>
        </div>
      </div>
      <motion.div
        variants={terminalVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="p-4 font-mono text-xs leading-relaxed sm:p-5 sm:text-sm"
      >
        <motion.p variants={terminalLineVariants} className="text-stone-500">
          $ pdftotext resume.pdf -
        </motion.p>
        <motion.p
          variants={terminalLineVariants}
          className="mt-3 text-teal-400"
        >
          EXPERIENCE
        </motion.p>
        <motion.p variants={terminalLineVariants} className="text-stone-200">
          Senior Frontend Engineer — Acme Corp
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
          className="mt-3 text-teal-500"
        >
          ✓ reading order intact
        </motion.p>
      </motion.div>
    </div>
  );
}
