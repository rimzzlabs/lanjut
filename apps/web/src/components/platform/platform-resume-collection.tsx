import {
  filterResumeIndex,
  RESUME_SORTS,
  type ResumeIndexEntry,
  type ResumeSort,
  sortResumeIndex,
} from "@lanjut/resume";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lanjut/ui/components/select";
import { A, S } from "@mobily/ts-belt";
import { useId } from "react";
import { useTranslations } from "use-intl";
import { useResumeSort } from "@/hooks/use-resume-sort";
import { type LibraryView, useLibraryViewStore } from "@/lib/store";
import { SegmentedControl } from "../shared/segmented-control";
import { PlatformResumeGrid } from "./platform-resume-grid/platform-resume-grid";
import { PlatformResumeGridEmptySearch } from "./platform-resume-grid/platform-resume-grid-empty-search";
import { PlatformResumeList } from "./platform-resume-list/platform-resume-list";
import { PlatformSectionHeading } from "./platform-section-heading";

const SORT_LABEL_KEYS: Record<ResumeSort, string> = {
  edited: "library.sortEdited",
  name: "toolbar.sortNameAsc",
};

interface PlatformResumeCollectionProps {
  index: readonly ResumeIndexEntry[];
  query: string;
}

/** Every saved résumé, searched and sorted, as a grid or a list. */
export function PlatformResumeCollection(props: PlatformResumeCollectionProps) {
  const t = useTranslations("platform");
  const headingId = useId();
  const [sort, setSort] = useResumeSort();
  const view = useLibraryViewStore((state) => state.view);
  const setView = useLibraryViewStore((state) => state.setView);
  const results = sortResumeIndex(
    filterResumeIndex(props.index, props.query),
    sort,
  );

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <PlatformSectionHeading id={headingId}>
          {t("library.all")}
          <span className="font-normal tabular-nums text-muted-foreground">
            {A.length(results)}
          </span>
        </PlatformSectionHeading>

        <div className="ml-auto flex items-center gap-2">
          <PlatformResumeSortSelect value={sort} onValueChange={setSort} />
          <SegmentedControl
            aria-label={t("library.view")}
            value={view}
            onValueChange={(value) => setView(value as LibraryView)}
            items={[
              { value: "grid", label: t("library.viewGrid") },
              { value: "list", label: t("library.viewList") },
            ]}
          />
        </div>
      </div>

      <PlatformResumeResults
        resumes={results}
        query={props.query}
        view={view}
      />
    </section>
  );
}

function PlatformResumeResults(props: {
  resumes: readonly ResumeIndexEntry[];
  query: string;
  view: LibraryView;
}) {
  if (A.isEmpty(props.resumes)) {
    return <PlatformResumeGridEmptySearch query={S.trim(props.query)} />;
  }
  if (props.view === "list")
    return <PlatformResumeList resumes={props.resumes} />;
  return <PlatformResumeGrid resumes={props.resumes} />;
}

function PlatformResumeSortSelect(props: {
  value: ResumeSort;
  onValueChange: (value: ResumeSort) => void;
}) {
  const t = useTranslations("platform");
  const options = A.map(RESUME_SORTS, (value) => ({
    value,
    label: t(SORT_LABEL_KEYS[value]),
  }));

  return (
    <Select
      items={options}
      value={props.value}
      onValueChange={(value) => props.onValueChange(value as ResumeSort)}
    >
      <SelectTrigger size="sm" className="w-36" aria-label={t("library.sort")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
