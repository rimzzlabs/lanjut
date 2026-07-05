"use client";

import { ArrowRight, FileText, Search } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function LandingHero() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-11/12 mx-auto max-w-5xl flex min-h-svh flex-col items-center justify-center py-20 text-center md:py-24"
    >
      <motion.div variants={itemVariants} className="relative mb-4 md:mb-5">
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full bg-primary/25 blur-md animate-pulse motion-reduce:animate-none"
        />
        <span className="relative inline-flex items-center gap-2 rounded-full border border-primary/40 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:px-4 sm:py-1.5 sm:text-sm">
          <FileText className="size-3.5 sm:size-4" />
          Free &amp; open source
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="mb-4 text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl bg-linear-to-r from-primary to-violet-800 bg-clip-text text-transparent"
      >
        <span className="sr-only">Lanjut, ATS Resume builder:</span> Land The
        Interview,
        <br />
        Not The Reject Pile.
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-8 max-w-2xl text-base text-foreground/70 text-balance sm:text-lg md:mb-10"
      >
        Lanjut is a local-first résumé builder that stays entirely in your
        browser. No account, nothing uploaded. Style it freely, and every export
        is structured to sail through applicant tracking systems.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4"
      >
        <Button
          size="lg"
          className="gap-2"
          nativeButton={false}
          render={<Link href="/platform" />}
        >
          Start building free
          <ArrowRight />
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/platform/template" />}
        >
          <Search />
          Browse Templates
        </Button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-10 flex items-center gap-5 text-xs text-foreground/60 sm:gap-8 sm:text-sm md:mt-14"
      >
        <div>
          <div className="text-xl font-bold text-foreground sm:text-2xl">
            100%
          </div>
          <div>Local-first</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-xl font-bold text-foreground sm:text-2xl">
            No
          </div>
          <div>Accounts</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-xl font-bold text-foreground sm:text-2xl">3</div>
          <div>Export formats</div>
        </div>
      </motion.div>
    </motion.section>
  );
}
