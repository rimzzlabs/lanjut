import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";

// The default sections, top to bottom, sized to their English titles. Personal
// Information is pinned and has no visibility toggle.
const ROWS = [
  { id: "header", label: "w-36", toggle: false },
  { id: "summary", label: "w-38", toggle: true },
  { id: "experience", label: "w-40", toggle: true },
  { id: "internship", label: "w-17", toggle: true },
  { id: "projects", label: "w-14", toggle: true },
  { id: "organizations", label: "w-21", toggle: true },
  { id: "education", label: "w-17", toggle: true },
  { id: "certifications", label: "w-23", toggle: true },
  { id: "skills", label: "w-9", toggle: true },
  { id: "languages", label: "w-18", toggle: true },
];

/** The section rows and the Custom Section button, as `EditorSectionList` lays them out, while the résumé loads. */
export function EditorSectionListSkeleton() {
  return (
    <div>
      {ROWS.map((row) => (
        <EditorSectionRowSkeleton
          key={row.id}
          label={row.label}
          toggle={row.toggle}
        />
      ))}
      <div className="px-4 pt-4">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

function EditorSectionRowSkeleton(props: { label: string; toggle: boolean }) {
  return (
    <div className="flex h-13.75 items-center gap-3 border-b pr-4 pl-10.25">
      <Skeleton className="size-4" />
      <Skeleton className={cn("h-4", props.label)} />
      <div className="ml-auto flex items-center gap-4">
        {props.toggle && <Skeleton className="size-4" />}
        <Skeleton className="size-4" />
      </div>
    </div>
  );
}
