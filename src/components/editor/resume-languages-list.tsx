import type { SectionColumns } from "@/lib/resume/types";
import { cn } from "@/lib/utils";
import { ResumeLanguageItem } from "./resume-language-item";
import type { LanguageItemView } from "./resume-preview";

interface ResumeLanguagesListProps {
  items: LanguageItemView[];
  columns: SectionColumns;
}

export function ResumeLanguagesList(props: ResumeLanguagesListProps) {
  return (
    <ul
      className={cn(
        "grid gap-x-8 gap-y-1",
        props.columns === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {props.items.map((item) => (
        <ResumeLanguageItem key={item.id} {...item} />
      ))}
    </ul>
  );
}
