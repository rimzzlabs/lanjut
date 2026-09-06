"use client";

import { RotateCw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLandingDraftStore } from "@/lib/store";
import { draftToResume } from "./landing-draft-resume";
import {
  type ParserPhase,
  type ParserProofReport,
  runParserProof,
} from "./landing-parser-run";

type ProofState =
  | { status: "idle" }
  | { status: "running"; phase: ParserPhase }
  | { status: "done"; report: ParserProofReport }
  | { status: "failed" };

/**
 * The "survive the parser" section, made literal: when the visitor scrolls
 * here, their draft (or the sample) is rendered to a real PDF and re-read by a
 * real text extractor, in their browser, and the checks report what actually
 * came back. Not an animation of a claim; the claim, executed.
 */
export function LandingParserProof() {
  const t = useTranslations("parserProof");
  const reduceMotion = useReducedMotion();
  const draft = useLandingDraftStore((state) => state.draft);
  const template = useLandingDraftStore((state) => state.template);
  const [state, setState] = useState<ProofState>({ status: "idle" });
  const [runId, setRunId] = useState(0);
  const startedRef = useRef(false);

  async function run() {
    setRunId((id) => id + 1);
    setState({ status: "running", phase: "render" });
    const startedAt = Date.now();
    try {
      const report = await runParserProof(
        draftToResume(draft),
        template,
        (phase) => setState({ status: "running", phase }),
      );
      // A cached rerun finishes in milliseconds, which reads as nothing having
      // happened. Hold the working lines long enough to be witnessed.
      const minimumMs = reduceMotion ? 0 : 900;
      const remaining = minimumMs - (Date.now() - startedAt);
      if (remaining > 0) {
        setState({ status: "running", phase: "extract" });
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setState({ status: "done", report });
    } catch {
      setState({ status: "failed" });
    }
  }

  function onEnterViewport() {
    if (startedRef.current) return;
    startedRef.current = true;
    void run();
  }

  const running = state.status === "running";
  const report = state.status === "done" ? state.report : null;
  const passCount = report
    ? [
        report.nameFound,
        report.titleFound,
        report.employerFound,
        report.emailFound,
        report.orderOk,
      ].filter(Boolean).length
    : 0;

  return (
    <motion.figure
      onViewportEnter={onEnterViewport}
      viewport={{ once: true, amount: 0.4 }}
    >
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>{t("caption")}</span>
        <span className="tabular-nums">.pdf · .docx · .txt</span>
      </figcaption>
      <div className="border border-stone-800 bg-stone-950 p-4 text-left font-mono text-xs leading-relaxed sm:p-5 sm:text-sm dark:border-stone-700">
        <p className="text-stone-500">$ lanjut verify --template {template}</p>

        {state.status === "idle" ? (
          <p className="mt-3 text-stone-400">{t("waiting")}</p>
        ) : null}

        {running || report ? (
          <p className="mt-3 text-stone-300">
            {t("rendering")}
            {report ? (
              <span className="text-stone-500">
                {" "}
                {t("renderedKb", { kb: report.pdfKb })}
              </span>
            ) : state.status === "running" && state.phase === "render" ? (
              <span className="text-stone-500"> …</span>
            ) : null}
          </p>
        ) : null}

        {(running && state.phase !== "render") || report ? (
          <p className="text-stone-300">
            {t("extracting")}
            {report ? (
              <span className="text-stone-500">
                {" "}
                {t("extractedChars", { chars: report.chars })}
              </span>
            ) : (
              <span className="text-stone-500"> …</span>
            )}
          </p>
        ) : null}

        {report ? (
          <motion.div
            key={runId}
            initial={reduceMotion ? undefined : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.16 } },
            }}
          >
            {report.excerpt.length > 0 ? (
              <motion.div
                variants={lineVariants}
                className="mt-3 border-l-2 border-stone-800 pl-3 text-stone-500"
              >
                {report.excerpt.map((line) => (
                  <p key={line} className="truncate">
                    {line}
                  </p>
                ))}
              </motion.div>
            ) : null}
            <div className="mt-3 space-y-0.5">
              <CheckLine ok={report.nameFound}>
                {t("checkName", { name: report.name })}
              </CheckLine>
              <CheckLine ok={report.titleFound}>{t("checkTitle")}</CheckLine>
              <CheckLine ok={report.employerFound}>
                {t("checkEmployer")}
              </CheckLine>
              <CheckLine ok={report.emailFound}>{t("checkEmail")}</CheckLine>
              <CheckLine ok={report.orderOk}>
                {t("checkOrder")} {report.order.join(" → ")}
              </CheckLine>
              <motion.p
                variants={lineVariants}
                className="mt-3 text-emerald-500"
              >
                {t("passed", { count: passCount })}
              </motion.p>
            </div>
          </motion.div>
        ) : null}

        {state.status === "failed" ? (
          <p className="mt-3 text-red-400">{t("failed")}</p>
        ) : null}
      </div>
      {report || state.status === "failed" ? (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="font-mono text-xs text-muted-foreground"
            onClick={() => void run()}
          >
            <RotateCw /> {t("rerun")}
          </Button>
        </div>
      ) : null}
    </motion.figure>
  );
}

const lineVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
};

function CheckLine(props: { ok: boolean; children: React.ReactNode }) {
  return (
    <motion.p
      variants={lineVariants}
      className={props.ok ? "text-emerald-400" : "text-red-400"}
    >
      {props.ok ? "✓" : "✗"} {props.children}
    </motion.p>
  );
}
