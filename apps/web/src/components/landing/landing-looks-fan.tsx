import type { TemplateId } from "@lanjut/resume/templates";
import { cn } from "@lanjut/ui/lib/utils";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";

const FAN: ReadonlyArray<{ id: TemplateId; pose: string }> = [
  { id: "anggun", pose: "translate-x-[-38%] -rotate-6" },
  { id: "kode", pose: "z-10 -translate-y-2" },
  { id: "segar", pose: "translate-x-[38%] rotate-6" },
];

/** Three more templates fanned out, a hint of the rest of the catalog. */
export function LandingLooksFan(props: { preview: ResumePreview }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none"
    >
      {FAN.map((card) => (
        <div
          key={card.id}
          className={cn(
            "absolute inset-x-[22%] top-[10%] aspect-3/4 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/10",
            card.pose,
          )}
        >
          <ResumeThumbnail resume={props.preview} template={card.id} />
        </div>
      ))}
    </div>
  );
}
