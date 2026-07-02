import type { SkillItemView } from "./resume-preview";
import { ResumeSkillItem } from "./resume-skill-item";

interface ResumeSkillsListProps {
  items: SkillItemView[];
}

export function ResumeSkillsList(props: ResumeSkillsListProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
      {props.items.map((item) => (
        <ResumeSkillItem key={item.id} {...item} />
      ))}
    </ul>
  );
}
