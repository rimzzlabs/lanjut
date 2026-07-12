"use client";

import { List, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { emptyRichTextValue } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { AnimatedEntryList } from "../animated-entry-list";
import {
  applyCustomListValues,
  type CustomListFormValues,
  type CustomListItemValues,
  toCustomListValues,
} from "../resume-form-adapter";
import { EditorSectionCustomListItem } from "./ed-section-custom-list-item";

function emptyEntry(): CustomListItemValues {
  return {
    title: "",
    subtitle: "",
    startDate: "",
    endDate: "",
    description: emptyRichTextValue(),
  };
}

interface EditorSectionCustomListFormProps {
  sectionId: string;
}

export function EditorSectionCustomListForm(
  props: EditorSectionCustomListFormProps,
) {
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.custom");

  // Read the section once at mount (via getState, not a subscription): the form
  // owns its state afterward and the store is synced through the watch below.
  const initial = useResumeStore
    .getState()
    .open?.sections.find((s) => s.id === props.sectionId);
  const form = useForm<CustomListFormValues>({
    defaultValues:
      initial?.type === "custom"
        ? toCustomListValues(initial)
        : { entries: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) =>
        applyCustomListValues(draft, props.sectionId, form.getValues()),
      );
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen, props.sectionId]);

  return (
    <form>
      <FieldGroup className="gap-3">
        <Button
          type="button"
          onClick={() => append(emptyEntry())}
          variant="outline"
          className="w-full"
        >
          <Plus /> {t("addEntry")}
        </Button>

        {fields.length === 0 ? (
          <EmptyState
            icon={List}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <AnimatedEntryList
            ids={fields.map((field) => field.id)}
            renderItem={(_, index) => (
              <EditorSectionCustomListItem
                control={form.control}
                index={index}
                onRemoveField={remove}
              />
            )}
          />
        )}
      </FieldGroup>
    </form>
  );
}
