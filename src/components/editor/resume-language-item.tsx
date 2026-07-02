import type { LanguageItemView } from "./resume-preview";

export function ResumeLanguageItem(props: LanguageItemView) {
  return (
    <li className="flex items-baseline gap-3">
      <span className="text-xs font-semibold">{props.name}</span>
      <span className="text-xs text-muted-foreground">{props.proficiency}</span>
    </li>
  );
}
