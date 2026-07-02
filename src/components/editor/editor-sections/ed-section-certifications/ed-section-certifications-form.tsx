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
  applyCertificationsValues,
  type CertificationItemValues,
  type CertificationsFormValues,
  toCertificationsValues,
} from "../resume-form-adapter";
import { EditorSectionCertificationsFormItem } from "./ed-section-certifications-form-item";

function emptyCertification(): CertificationItemValues {
  return { name: "", issuer: "", url: "" };
}

export function EditorSectionCertificationsForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);

  const form = useForm<CertificationsFormValues>({
    defaultValues: open ? toCertificationsValues(open) : { certifications: [] },
  });
  const { fields, prepend, remove } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyCertificationsValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  if (!open) return null;

  return (
    <form>
      <FieldSet className="gap-3">
        <FieldLegend className="sr-only">Certifications</FieldLegend>
        <FieldDescription className="sr-only">
          Licenses and certifications
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptyCertification())}
          variant="outline"
          className="w-full"
        >
          <Plus /> Add Certification
        </Button>

        <FieldGroup className="gap-4">
          {fields.map((field, index) => (
            <EditorSectionCertificationsFormItem
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
