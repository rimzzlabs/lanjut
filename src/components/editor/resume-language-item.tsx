import type { LanguageItemView } from "./resume-preview";

export function ResumeLanguageItem(props: LanguageItemView) {
  return (
    <li className="flex items-baseline gap-3">
      <span className="text-sm font-semibold">{props.name}</span>
      <span className="text-sm text-muted-foreground">{props.proficiency}</span>
    </li>
  );
}
