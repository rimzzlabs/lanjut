import { A, O } from "@mobily/ts-belt";
import { ListBulletsIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
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
} from "../resume-form-adapter-custom";
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

// Read the section once at mount (via getState, not a subscription): the form
// owns its state afterward and the store is synced through the watch below.
function initialValues(sectionId: string): CustomListFormValues {
  const section = A.find(
    useResumeStore.getState().open?.sections ?? [],
    (s) => s.id === sectionId,
  );
  if (O.isNone(section) || section.type !== "custom") return { entries: [] };
  return toCustomListValues(section);
}

interface EditorSectionCustomListFormProps {
  sectionId: string;
}

export function EditorSectionCustomListForm(
  props: EditorSectionCustomListFormProps,
) {
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.custom");

  const form = useForm<CustomListFormValues>({
    defaultValues: initialValues(props.sectionId),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen(applyCustomListValues(props.sectionId, form.getValues()));
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
          <PlusIcon /> {t("addEntry")}
        </Button>

        {fields.length === 0 && (
          <EmptyState
            icon={ListBulletsIcon}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        )}
        {fields.length > 0 && (
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
