import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { SortableItem } from "@/components/shared/sortable-list";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SkillsFormValues } from "../resume-form-adapter";

const PROFICIENCY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

interface EditorSectionSkillsFormItemProps {
  id: string;
  index: number;
  control: Control<SkillsFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionSkillsFormItem(
  props: EditorSectionSkillsFormItemProps,
) {
  const t = useTranslations("editor.skills");

  return (
    <SortableItem id={props.id} handleLabel={t("reorder")}>
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <div className="flex items-center gap-2">
          <Controller
            control={props.control}
            name={`skills.${props.index}.name`}
            render={({ field, fieldState }) => (
              <Field className="flex-1">
                <Input
                  placeholder={t("namePlaceholder")}
                  {...field}
                  id={field.name}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            onClick={() => props.onRemoveField(props.index)}
          >
            <Trash className="size-3.5 stroke-destructive" />
            <span className="sr-only">{t("remove")}</span>
          </Button>
        </div>

        <Controller
          control={props.control}
          name={`skills.${props.index}.level`}
          render={({ field }) => (
            <Select
              value={field.value || null}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger className="w-[87.888%] md:w-36">
                <SelectValue placeholder={t("proficiency")} />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="max-md:hidden"
          onClick={() => props.onRemoveField(props.index)}
        >
          <Trash className="size-3.5 stroke-destructive" />
          <span className="sr-only">{t("remove")}</span>
        </Button>
      </div>
    </SortableItem>
  );
}
