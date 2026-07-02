"use client";

import { ArrowRight, FileText } from "lucide-react";
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[500px] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
          <FileText className="size-4" />
          Free &amp; open source
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="mb-6 text-5xl font-bold tracking-tight md:text-7xl bg-linear-to-r from-primary to-violet-800 bg-clip-text text-transparent"
      >
        Land The Interview,
        <br />
        Not The Reject Pile.
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-8 max-w-2xl text-lg text-foreground/70"
      >
        Lanjut is a local-first résumé builder that stays entirely in your
        browser — no account, nothing uploaded. Style it freely, and every
        export is structured to sail through applicant tracking systems.
      </motion.p>

      <motion.div variants={itemVariants} className="flex gap-4">
        <Button
          size="lg"
          className="gap-2"
          nativeButton={false}
          render={<Link href="/platform" />}
        >
          Start building
          <ArrowRight className="size-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/samples" />}
        >
          See a sample
        </Button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-12 flex items-center gap-8 text-sm text-foreground/60"
      >
        <div>
          <div className="text-2xl font-bold text-foreground">100%</div>
          <div>Local-first</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-2xl font-bold text-foreground">0</div>
          <div>Accounts</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-2xl font-bold text-foreground">3</div>
          <div>Export formats</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
