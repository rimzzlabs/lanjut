import { ResumeLanguageItem } from "./resume-language-item";
import type { LanguageItemView } from "./resume-preview";

interface ResumeLanguagesListProps {
  items: LanguageItemView[];
}

export function ResumeLanguagesList(props: ResumeLanguagesListProps) {
  return (
    <ul className="flex flex-wrap gap-x-12 gap-y-2">
      {props.items.map((item) => (
        <ResumeLanguageItem key={item.id} {...item} />
      ))}
    </ul>
  );
}
