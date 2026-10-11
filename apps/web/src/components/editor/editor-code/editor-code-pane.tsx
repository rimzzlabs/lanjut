import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";
import { lazy, Suspense } from "react";
import { EditorCodeFooter } from "./editor-code-footer";

// The parsers and the syntax colors load with the code, never with the editor.
const LazyCodeInput = lazy(() =>
  import("./editor-code-input").then((module) => ({
    default: module.EditorCodeInput,
  })),
);

const SKELETON_LINES = ["w-40", "w-56", "w-32", "w-64", "w-48", "w-72", "w-36"];

export function EditorCodePane() {
  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] bg-background">
      <Suspense fallback={<EditorCodeSkeleton />}>
        <LazyCodeInput />
      </Suspense>
      <EditorCodeFooter />
    </div>
  );
}

function EditorCodeSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 md:px-6">
      {SKELETON_LINES.map((width) => (
        <Skeleton key={width} className={cn("h-4", width)} />
      ))}
    </div>
  );
}
