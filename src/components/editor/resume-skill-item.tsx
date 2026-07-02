import type { SkillItemView } from "./resume-preview";

export function ResumeSkillItem(props: SkillItemView) {
  return (
    <li className="flex items-baseline justify-between gap-4 text-xs">
      <span className="font-semibold">{props.name}</span>
      {props.proficiency && (
        <span className="text-muted-foreground">{props.proficiency}</span>
      )}
    </li>
  );
}
