"use client";

import { FolderGit2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { emptyRichTextValue } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import {
  AnimatedEntryList,
  type AnimatedEntryListHandle,
} from "../animated-entry-list";
import { repositionByRecency } from "../date-sort";
import {
  applyProjectsValues,
  type ProjectItemValues,
  type ProjectsFormValues,
  toProjectsValues,
} from "../resume-form-adapter";
import { EditorSectionProjectsFormItem } from "./ed-section-projects-form-item";

function emptyProject(): ProjectItemValues {
  return {
    title: "",
    company: "",
    website: "",
    startDate: "",
    endDate: "",
    description: emptyRichTextValue(),
  };
}

export function EditorSectionProjectsForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.projects");
  const tc = useTranslations("editor.common");

  const form = useForm<ProjectsFormValues>({
    defaultValues: open ? toProjectsValues(open) : { projects: [] },
  });
  const { fields, prepend, remove, move } = useFieldArray({
    control: form.control,
    name: "projects",
  });
  const listRef = useRef<AnimatedEntryListHandle>(null);

  // The field array owns the list; every form change (including add/remove)
  // rebuilds the store entries. Subscribing to the form and writing to the
  // store is a valid external-system sync; the store debounces the IndexedDB
  // write. Reading getValues() inside the callback avoids stale-value timing.
  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyProjectsValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  const handleDatesCommit = (index: number) => {
    requestAnimationFrame(() => {
      const to = repositionByRecency(index, form.getValues().projects, move);
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
          onClick={() => prepend(emptyProject())}
          variant="outline"
          className="w-full"
        >
          <Plus /> <span className="sr-only">{tc("add")} </span>
          {t("add")}
        </Button>

        {fields.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <AnimatedEntryList
            ref={listRef}
            ids={fields.map((field) => field.id)}
            renderItem={(_, index) => (
              <EditorSectionProjectsFormItem
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
