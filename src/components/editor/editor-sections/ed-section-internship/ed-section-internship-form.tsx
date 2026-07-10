"use client";

import { Backpack, Plus } from "lucide-react";
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
  applyInternshipValues,
  type InternshipFormValues,
  type InternshipItemValues,
  toInternshipValues,
} from "../resume-form-adapter";
import { EditorSectionInternshipFormItem } from "./ed-section-internship-form-item";

function emptyInternship(): InternshipItemValues {
  return {
    title: "",
    company: "",
    website: "",
    startDate: "",
    endDate: "",
    description: emptyRichTextValue(),
  };
}

export function EditorSectionInternshipForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.internship");
  const tc = useTranslations("editor.common");

  const form = useForm<InternshipFormValues>({
    defaultValues: open ? toInternshipValues(open) : { internships: [] },
  });
  const { fields, prepend, remove } = useFieldArray({
    control: form.control,
    name: "internships",
  });

  // The field array owns the list; every form change (including add/remove)
  // rebuilds the store entries. Subscribing to the form and writing to the
  // store is a valid external-system sync; the store debounces the IndexedDB
  // write. Reading getValues() inside the callback avoids stale-value timing.
  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyInternshipValues(draft, form.getValues()));
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
          onClick={() => prepend(emptyInternship())}
          variant="outline"
          className="w-full"
        >
          <Plus /> <span className="sr-only">{tc("add")} </span>
          {t("add")}
        </Button>

        {fields.length === 0 ? (
          <EmptyState
            icon={Backpack}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <FieldGroup className="gap-4">
            {fields.map((field, index) => (
              <EditorSectionInternshipFormItem
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
