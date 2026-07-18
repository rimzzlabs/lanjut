import type { LanguageItemView } from "./resume-preview";

export function ResumeLanguageItem(props: LanguageItemView) {
  return (
    <li className="flex items-baseline justify-between gap-4 resume-body-xs">
      <span className="font-semibold">{props.name}</span>
      {props.proficiency && (
        <span className="text-muted-foreground">{props.proficiency}</span>
      )}
    </li>
  );
}
