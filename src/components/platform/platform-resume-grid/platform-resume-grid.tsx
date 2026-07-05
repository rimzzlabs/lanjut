"use client";

import { useHydrateResumeLibrary } from "@/hooks/use-hydrate-resume-library";
import { useResumeSearchQuery } from "@/hooks/use-resume-search";
import { filterResumeIndex } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { PlatformResumeGridEmptySearch } from "./platform-resume-grid-empty-search";
import { PlatformResumeGridError } from "./platform-resume-grid-error";
import { PlatformResumeGridItem } from "./platform-resume-grid-item";
import { PlatformResumeGridItemNew } from "./platform-resume-grid-item-new";
import { PlatformResumeGridSkeleton } from "./platform-resume-grid-skeleton";

export function PlatformResumeGrid() {
  useHydrateResumeLibrary();
  const index = useResumeStore((state) => state.index);
  const indexStatus = useResumeStore((state) => state.indexStatus);
  const [query] = useResumeSearchQuery();

  if (indexStatus === "error") return <PlatformResumeGridError />;
  if (indexStatus !== "ready") return <PlatformResumeGridSkeleton />;
  if (index.length === 0) return null;

  const results = filterResumeIndex(index, query);

  if (results.length === 0) {
    return <PlatformResumeGridEmptySearch query={query.trim()} />;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,21rem),1fr))] gap-4">
      {results.map((resume) => (
        <PlatformResumeGridItem key={resume.id} resume={resume} />
      ))}
      <PlatformResumeGridItemNew />
    </div>
  );
}
