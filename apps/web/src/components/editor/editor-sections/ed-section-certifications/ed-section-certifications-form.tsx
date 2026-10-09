import type { Resume } from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@lanjut/ui/components/field";
import { CertificateIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { SortableList } from "@/components/shared/sortable-list";
import { useResumeStore } from "@/lib/store";
import {
  applyCertificationsValues,
  type CertificationItemValues,
  type CertificationsFormValues,
  toCertificationsValues,
} from "../resume-form-adapter-lists";
import { EditorSectionCertificationsFormItem } from "./ed-section-certifications-form-item";

function emptyCertification(): CertificationItemValues {
  return { name: "", issuer: "", url: "" };
}

function initialValues(open: Resume | null): CertificationsFormValues {
  if (!open) return { certifications: [] };
  return toCertificationsValues(open);
}

export function EditorSectionCertificationsForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.certifications");
  const tc = useTranslations("editor.common");

  const form = useForm<CertificationsFormValues>({
    defaultValues: initialValues(open),
  });
  const { fields, prepend, remove, move } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((resume) =>
        applyCertificationsValues(resume, form.getValues()),
      );
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  function handleReorder(from: number, to: number) {
    move(from, to);
    updateOpen((resume) => applyCertificationsValues(resume, form.getValues()));
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
          onClick={() => prepend(emptyCertification())}
          variant="outline"
          className="w-full"
        >
          <PlusIcon /> <span className="sr-only">{tc("add")} </span>
          {t("add")}
        </Button>

        {fields.length === 0 && (
          <EmptyState
            icon={CertificateIcon}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        )}
        {fields.length > 0 && (
          <SortableList
            items={fields.map((field) => field.id)}
            onReorder={handleReorder}
          >
            <FieldGroup className="gap-4">
              {fields.map((field, index) => (
                <EditorSectionCertificationsFormItem
                  key={field.id}
                  id={field.id}
                  control={form.control}
                  index={index}
                  isLast={index === fields.length - 1}
                  onRemoveField={remove}
                />
              ))}
            </FieldGroup>
          </SortableList>
        )}
      </FieldSet>
    </form>
  );
}
