import { R } from "@mobily/ts-belt";
import { type RefObject, useEffect, useRef, useState } from "react";
import {
  draftKey,
  draftToResume,
} from "@/components/landing/landing-draft-resume";
import {
  type ParserProofReport,
  runParserProof,
} from "@/components/landing/landing-parser-run";
import {
  type LandingDraft,
  type LandingRead,
  type LandingReadReport,
  useLandingReadStore,
} from "@/lib/store";
import type { TemplateId } from "@/lib/templates";

const REREAD_DELAY_MS = 900;

function toReport(report: ParserProofReport): LandingReadReport {
  return {
    lines: report.lines,
    chars: report.chars,
    nameFound: report.nameFound,
    titleFound: report.titleFound,
    emailFound: report.emailFound,
    orderOk: report.orderOk,
  };
}

function lastReport(read: LandingRead) {
  if (read.status === "done") return read.report;
  if (read.status === "reading") return read.last;
  return null;
}

/**
 * Renders the landing draft to a real PDF and reads it back, first when the
 * sheet scrolls into view and again after each pause in typing. A newer run
 * supersedes an older one, so a slow read never overwrites a fresh draft.
 */
export function useLandingRead(
  target: RefObject<HTMLElement | null>,
  draft: LandingDraft,
  template: TemplateId,
): LandingRead {
  const read = useLandingReadStore((state) => state.read);
  const setRead = useLandingReadStore((state) => state.setRead);
  const [visible, setVisible] = useState(false);
  const runRef = useRef(0);
  const key = draftKey(draft, template);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for the draft and template; the run reads them through it.
  useEffect(() => {
    if (!visible) return;
    const run = runRef.current + 1;
    runRef.current = run;
    const timer = window.setTimeout(
      () => {
        setRead((previous) => ({
          status: "reading",
          key,
          last: lastReport(previous),
        }));
        void runParserProof({
          resume: draftToResume(draft),
          template,
          onPhase: () => {},
        })
          .then((result) => {
            if (runRef.current !== run) return;
            setRead(() =>
              R.match<ParserProofReport, string, LandingRead>(
                result,
                (report) => ({ status: "done", key, report: toReport(report) }),
                () => ({ status: "failed", key }),
              ),
            );
          })
          .catch(() => {
            if (runRef.current === run)
              setRead(() => ({ status: "failed", key }));
          });
      },
      run === 1 ? 0 : REREAD_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [visible, key, setRead]);

  return read;
}
