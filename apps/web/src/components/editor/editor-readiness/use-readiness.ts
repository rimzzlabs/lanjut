import { measureReadiness, type Readiness } from "@lanjut/resume/readiness";
import { useMemo } from "react";
import { useResumeStore } from "@/lib/store";

/** How ready the open résumé is to send, recomputed as it changes. */
export function useReadiness(): Readiness | undefined {
  const open = useResumeStore((state) => state.open);
  return useMemo(() => (open ? measureReadiness(open) : undefined), [open]);
}
