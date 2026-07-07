"use client";

import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { SortableList } from "@/components/shared/sortable-list";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useResumeStore } from "@/lib/store";
import {
  applyLanguagesValues,
  type LanguageItemValues,
  type LanguagesFormValues,
  toLanguagesValues,
} from "../resume-form-adapter";
import { EditorSectionLanguagesFormItem } from "./ed-section-languages-form-item";

function emptyLanguage(): LanguageItemValues {
  return { name: "", level: "" };
}

export function EditorSectionLanguagesForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);

  const form = useForm<LanguagesFormValues>({
    defaultValues: open ? toLanguagesValues(open) : { languages: [] },
  });
  const { fields, prepend, remove, move } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyLanguagesValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  function handleReorder(from: number, to: number) {
    move(from, to);
    updateOpen((draft) => applyLanguagesValues(draft, form.getValues()));
  }

  if (!open) return null;

  return (
    <form>
      <FieldSet className="gap-3">
        <FieldLegend className="sr-only">Languages</FieldLegend>
        <FieldDescription className="sr-only">
          Languages you speak
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptyLanguage())}
          variant="outline"
          className="w-full"
        >
          <Plus /> Add Language
        </Button>

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
                onRemoveField={remove}
              />
            ))}
          </FieldGroup>
        </SortableList>
      </FieldSet>
    </form>
  );
}
