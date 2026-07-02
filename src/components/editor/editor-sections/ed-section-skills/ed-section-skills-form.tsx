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
import { useResumeStore } from "@/lib/store";
import {
  applySkillsValues,
  type SkillItemValues,
  type SkillsFormValues,
  toSkillsValues,
} from "../resume-form-adapter";
import { EditorSectionSkillsFormItem } from "./ed-section-skills-form-item";

function emptySkill(): SkillItemValues {
  return { name: "", level: "" };
}

export function EditorSectionSkillsForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);

  const form = useForm<SkillsFormValues>({
    defaultValues: open ? toSkillsValues(open) : { skills: [] },
  });
  const { fields, prepend, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applySkillsValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  return (
    <form>
      <FieldSet className="gap-3">
        <FieldLegend className="sr-only">Skills</FieldLegend>
        <FieldDescription className="sr-only">
          List your skills
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptySkill())}
          variant="outline"
          className="w-full"
        >
          <Plus /> Add Skill
        </Button>

        <FieldGroup className="gap-2">
          {fields.map((field, index) => (
            <EditorSectionSkillsFormItem
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
