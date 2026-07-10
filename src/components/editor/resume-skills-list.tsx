import type { SectionColumns } from "@/lib/resume/types";
import { cn } from "@/lib/utils";
import type { SkillItemView } from "./resume-preview";
import { ResumeSkillItem } from "./resume-skill-item";

interface ResumeSkillsListProps {
  items: SkillItemView[];
  columns: SectionColumns;
}

export function ResumeSkillsList(props: ResumeSkillsListProps) {
  return (
    <ul
      className={cn(
        "grid gap-x-8 gap-y-1",
        props.columns === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {props.items.map((item) => (
        <ResumeSkillItem key={item.id} {...item} />
      ))}
    </ul>
  );
}
