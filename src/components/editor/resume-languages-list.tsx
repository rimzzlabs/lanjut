import { ResumeLanguageItem } from "./resume-language-item";
import type { LanguageItemView } from "./resume-preview";

interface ResumeLanguagesListProps {
  items: LanguageItemView[];
}

export function ResumeLanguagesList(props: ResumeLanguagesListProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
      {props.items.map((item) => (
        <ResumeLanguageItem key={item.id} {...item} />
      ))}
    </ul>
  );
}
