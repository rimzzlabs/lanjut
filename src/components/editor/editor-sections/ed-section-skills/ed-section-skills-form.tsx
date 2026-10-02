import { A, O } from "@mobily/ts-belt";
import { Plus, Zap } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { SortableList } from "@/components/shared/sortable-list";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import type { Resume } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import {
  applySkillsValues,
  type SkillItemValues,
  type SkillsFormValues,
  toSkillsValues,
} from "../resume-form-adapter";
import { EditorSectionSkillsFormItem } from "./ed-section-skills-form-item";
import { SkillsColumnsToggle } from "./skills-columns-toggle";
import { SkillsProficiencyToggle } from "./skills-proficiency-toggle";

function emptySkill(): SkillItemValues {
  return { name: "", level: "" };
}

function initialValues(open: Resume | null): SkillsFormValues {
  if (!open) return { skills: [] };
  return toSkillsValues(open);
}

export function EditorSectionSkillsForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const showProficiency = O.mapWithDefault(
    A.find(open?.sections ?? [], (s) => s.type === "skills"),
    true,
    (section) => section.showProficiency ?? true,
  );
  const t = useTranslations("editor.skills");
  const tc = useTranslations("editor.common");

  const form = useForm<SkillsFormValues>({
    defaultValues: initialValues(open),
  });
  const { fields, prepend, remove, move } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((resume) => applySkillsValues(resume, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  function handleReorder(from: number, to: number) {
    move(from, to);
    updateOpen((resume) => applySkillsValues(resume, form.getValues()));
  }

  return (
    <form>
      <FieldSet className="gap-3">
        <FieldLegend className="sr-only">{t("legend")}</FieldLegend>
        <FieldDescription className="sr-only">
          {t("legendDesc")}
        </FieldDescription>
        <Button
          type="button"
          onClick={() => prepend(emptySkill())}
          variant="outline"
          className="w-full"
        >
          <Plus /> <span className="sr-only">{tc("add")} </span>
          {t("add")}
        </Button>

        {fields.length === 0 && (
          <EmptyState
            icon={Zap}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        )}
        {fields.length > 0 && (
          <>
            <SkillsColumnsToggle />
            <SkillsProficiencyToggle />
            <SortableList
              items={fields.map((field) => field.id)}
              onReorder={handleReorder}
            >
              <FieldGroup className="gap-2">
                {fields.map((field, index) => (
                  <EditorSectionSkillsFormItem
                    key={field.id}
                    id={field.id}
                    control={form.control}
                    index={index}
                    showProficiency={showProficiency}
                    onRemoveField={remove}
                  />
                ))}
              </FieldGroup>
            </SortableList>
          </>
        )}
      </FieldSet>
    </form>
  );
}
