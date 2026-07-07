"use client";

import { GraduationCap, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { emptyRichTextValue } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import {
  applyEducationValues,
  type EducationFormValues,
  type EducationItemValues,
  toEducationValues,
} from "../resume-form-adapter";
import { EditorSectionEducationFormItem } from "./ed-section-education-form-item";

function emptyEducation(): EducationItemValues {
  return {
    institution: "",
    degree: "",
    location: "",
    startDate: "",
    endDate: "",
    details: emptyRichTextValue(),
  };
}

export function EditorSectionEducationForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.education");
  const tc = useTranslations("editor.common");

  const form = useForm<EducationFormValues>({
    defaultValues: open ? toEducationValues(open) : { educations: [] },
  });
  const { fields, prepend, remove } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyEducationValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

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
          onClick={() => prepend(emptyEducation())}
          variant="outline"
          className="w-full"
        >
          <Plus /> <span className="sr-only">{tc("add")} </span>
          {t("add")}
        </Button>

        {fields.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <FieldGroup className="gap-4">
            {fields.map((field, index) => (
              <EditorSectionEducationFormItem
                key={field.id}
                control={form.control}
                index={index}
                onRemoveField={remove}
              />
            ))}
          </FieldGroup>
        )}
      </FieldSet>
    </form>
  );
}
