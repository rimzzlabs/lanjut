import { Briefcase, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import type { Resume } from "@/lib/resume";
import { emptyRichTextValue } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import {
  AnimatedEntryList,
  type AnimatedEntryListHandle,
} from "../animated-entry-list";
import { repositionByRecency } from "../date-sort";
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
    location: "",
    companyContext: "",
    website: "",
    startDate: "",
    endDate: "",
    description: emptyRichTextValue(),
  };
}

function initialValues(open: Resume | null): ExperienceFormValues {
  if (!open) return { experiences: [] };
  return toExperienceValues(open);
}

export function EditorSectionExperienceForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.experience");
  const tc = useTranslations("editor.common");

  const form = useForm<ExperienceFormValues>({
    defaultValues: initialValues(open),
  });
  const { fields, prepend, remove, move } = useFieldArray({
    control: form.control,
    name: "experiences",
  });
  const listRef = useRef<AnimatedEntryListHandle>(null);

  // The field array owns the list; every form change (including add/remove)
  // rebuilds the store entries. Subscribing to the form and writing to the
  // store is a valid external-system sync; the store debounces the IndexedDB
  // write. Reading getValues() inside the callback avoids stale-value timing.
  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((resume) => applyExperienceValues(resume, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  const handleDatesCommit = (index: number) => {
    requestAnimationFrame(() => {
      const to = repositionByRecency({
        from: index,
        items: form.getValues().experiences,
        move,
      });
      if (to !== null) listRef.current?.scrollToIndex(to);
    });
  };

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
          onClick={() => prepend(emptyExperience())}
          variant="outline"
          className="w-full"
        >
          <Plus /> <span className="sr-only">{tc("add")} </span>
          {t("add")}
        </Button>

        {fields.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        )}
        {fields.length > 0 && (
          <AnimatedEntryList
            ref={listRef}
            ids={fields.map((field) => field.id)}
            renderItem={(_, index) => (
              <EditorSectionExperienceFormItem
                control={form.control}
                index={index}
                onRemoveField={remove}
                onDatesCommit={() => handleDatesCommit(index)}
              />
            )}
          />
        )}
      </FieldSet>
    </form>
  );
}
