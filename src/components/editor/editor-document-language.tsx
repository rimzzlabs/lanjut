"use client";

import { useTranslations } from "next-intl";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RESUME_LANGUAGES, type ResumeLanguage } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";

export function EditorDocumentLanguage() {
  const language = useResumeStore((state) => state.open?.language);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");
  const tl = useTranslations("language");

  if (!language) return null;

  const items = RESUME_LANGUAGES.map((lang) => ({
    value: lang,
    label: tl(lang),
  }));

  const onChange = (value: ResumeLanguage | null) => {
    if (!value) return;
    updateOpen((draft) => {
      draft.language = value;
    });
  };

  return (
    <Field className="px-4 pb-4">
      <FieldLabel className="sr-only" htmlFor="document-language">
        {t("documentLanguage")}
      </FieldLabel>
      <Select items={items} value={language} onValueChange={onChange}>
        <SelectTrigger id="document-language" className="max-w-max">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
