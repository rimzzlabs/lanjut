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
        <FieldLegend className="sr-only">Education</FieldLegend>
        <FieldDescription className="sr-only">
          Where you studied
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptyEducation())}
          variant="outline"
          className="w-full"
        >
          <Plus /> Add Education
        </Button>

        <FieldGroup className="gap-4">
          {fields.map((field, index) => (
            <EditorSectionEducationFormItem
              key={field.id}
              control={form.control}
              deletable={fields.length > 1}
              index={index}
              onRemoveField={remove}
            />
          ))}
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
