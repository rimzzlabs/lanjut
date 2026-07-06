"use client";

import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
  applyExperienceValues,
  type ExperienceFormValues,
  type ExperienceItemValues,
  toExperienceValues,
} from "../resume-form-adapter";
import { EditorSectionExperienceFormItem } from "./ed-section-experience-form-item";

function emptyExperience(): ExperienceItemValues {
  return {
    title: "",
    company: "",
    website: "",
    startDate: "",
    endDate: "",
    description: emptyRichTextValue(),
  };
}

export function EditorSectionExperienceForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);

  const form = useForm<ExperienceFormValues>({
    defaultValues: open ? toExperienceValues(open) : { experiences: [] },
  });
  const { fields, prepend, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  // The field array owns the list; every form change (including add/remove)
  // rebuilds the store entries. Subscribing to the form and writing to the
  // store is a valid external-system sync; the store debounces the IndexedDB
  // write. Reading getValues() inside the callback avoids stale-value timing.
  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyExperienceValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  if (!open) return null;

  return (
    <form>
      <FieldSet className="gap-3">
        <FieldLegend className="sr-only">Professional Experience</FieldLegend>
        <FieldDescription className="sr-only">
          Describe your past experience
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptyExperience())}
          variant="outline"
          className="w-full"
        >
          <Plus /> Add Professional Experience
        </Button>

        <FieldGroup className="gap-4">
          {fields.map((field, index) => (
            <EditorSectionExperienceFormItem
              key={field.id}
              control={form.control}
              index={index}
              onRemoveField={remove}
            />
          ))}
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
