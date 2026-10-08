import type { Resume } from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@lanjut/ui/components/field";
import { A, O } from "@mobily/ts-belt";
import { PlusIcon, TranslateIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { SortableList } from "@/components/shared/sortable-list";
import { useResumeStore } from "@/lib/store";
import {
  applyLanguagesValues,
  type LanguageItemValues,
  type LanguagesFormValues,
  toLanguagesValues,
} from "../resume-form-adapter-lists";
import { EditorSectionLanguagesFormItem } from "./ed-section-languages-form-item";
import { LanguagesColumnsToggle } from "./languages-columns-toggle";
import { LanguagesProficiencyToggle } from "./languages-proficiency-toggle";

function emptyLanguage(): LanguageItemValues {
  return { name: "", level: "" };
}

function initialValues(open: Resume | null): LanguagesFormValues {
  if (!open) return { languages: [] };
  return toLanguagesValues(open);
}

export function EditorSectionLanguagesForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const showProficiency = O.mapWithDefault(
    A.find(open?.sections ?? [], (s) => s.type === "languages"),
    true,
    (section) => section.showProficiency ?? true,
  );
  const t = useTranslations("editor.languages");
  const tc = useTranslations("editor.common");

  const form = useForm<LanguagesFormValues>({
    defaultValues: initialValues(open),
  });
  const { fields, prepend, remove, move } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((resume) => applyLanguagesValues(resume, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  function handleReorder(from: number, to: number) {
    move(from, to);
    updateOpen((resume) => applyLanguagesValues(resume, form.getValues()));
  }

  if (!open) return null;

  return (
    <form>
      <FieldSet className="gap-3">
        <FieldLegend className="sr-only">{t("legend")}</FieldLegend>
        <FieldDescription className="sr-only">
          {t("legendDesc")}
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptyLanguage())}
          variant="outline"
          className="w-full"
        >
          <PlusIcon /> <span className="sr-only">{tc("add")} </span>
          {t("add")}
        </Button>

        {fields.length === 0 && (
          <EmptyState
            icon={TranslateIcon}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        )}
        {fields.length > 0 && (
          <>
            <LanguagesColumnsToggle />
            <LanguagesProficiencyToggle />
            <SortableList
              items={fields.map((field) => field.id)}
              onReorder={handleReorder}
            >
              <FieldGroup className="gap-2">
                {fields.map((field, index) => (
                  <EditorSectionLanguagesFormItem
                    key={field.id}
                    id={field.id}
                    control={form.control}
                    index={index}
                    showProficiency={showProficiency}
                    onRemoveField={remove}
                  />
                ))}
              </FieldGroup>
            </SortableList>
          </>
        )}
      </FieldSet>
    </form>
  );
}
