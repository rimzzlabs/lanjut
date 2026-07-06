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
  applyOrganizationsValues,
  type OrganizationItemValues,
  type OrganizationsFormValues,
  toOrganizationsValues,
} from "../resume-form-adapter";
import { EditorSectionOrganizationsFormItem } from "./ed-section-organizations-form-item";

function emptyOrganization(): OrganizationItemValues {
  return {
    role: "",
    organization: "",
    startDate: "",
    endDate: "",
    description: emptyRichTextValue(),
  };
}

export function EditorSectionOrganizationsForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);

  const form = useForm<OrganizationsFormValues>({
    defaultValues: open ? toOrganizationsValues(open) : { organizations: [] },
  });
  const { fields, prepend, remove } = useFieldArray({
    control: form.control,
    name: "organizations",
  });

  // The field array owns the list; every form change (including add/remove)
  // rebuilds the store entries. Subscribing to the form and writing to the
  // store is a valid external-system sync; the store debounces the IndexedDB
  // write. Reading getValues() inside the callback avoids stale-value timing.
  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyOrganizationsValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  if (!open) return null;

  return (
    <form>
      <FieldSet className="gap-3">
        <FieldLegend className="sr-only">Organization Experience</FieldLegend>
        <FieldDescription className="sr-only">
          Describe your volunteer, student, and community roles
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptyOrganization())}
          variant="outline"
          className="w-full"
        >
          <Plus /> Add Organization Experience
        </Button>

        <FieldGroup className="gap-4">
          {fields.map((field, index) => (
            <EditorSectionOrganizationsFormItem
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
