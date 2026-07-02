import { Trash } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
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
  index: number;
  deletable: boolean;
  control: Control<SkillsFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionSkillsFormItem(
  props: EditorSectionSkillsFormItemProps,
) {
  return (
    <div className="flex items-start gap-2">
      <Controller
        control={props.control}
        name={`skills.${props.index}.name`}
        render={({ field, fieldState }) => (
          <Field className="flex-1">
            <Input placeholder="TypeScript" {...field} id={field.name} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={props.control}
        name={`skills.${props.index}.level`}
        render={({ field }) => (
          <Select
            value={field.value || null}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Proficiency" />
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

      {props.deletable && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => props.onRemoveField(props.index)}
        >
          <Trash className="size-3.5 stroke-destructive" />
          <span className="sr-only">Remove skill</span>
        </Button>
      )}
    </div>
  );
}
