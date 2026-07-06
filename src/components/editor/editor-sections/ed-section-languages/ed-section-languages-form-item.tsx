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
import type { LanguagesFormValues } from "../resume-form-adapter";

const LANGUAGE_LEVELS = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
] as const;

interface EditorSectionLanguagesFormItemProps {
  index: number;
  control: Control<LanguagesFormValues>;
  onRemoveField: (index: number) => void;
}

export function EditorSectionLanguagesFormItem(
  props: EditorSectionLanguagesFormItemProps,
) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      <div className="flex items-center gap-2">
        <Controller
          control={props.control}
          name={`languages.${props.index}.name`}
          render={({ field, fieldState }) => (
            <Field className="flex-1">
              <Input placeholder="English" {...field} id={field.name} />
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
          <span className="sr-only">Remove language</span>
        </Button>
      </div>

      <Controller
        control={props.control}
        name={`languages.${props.index}.level`}
        render={({ field }) => (
          <Select
            value={field.value || null}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-[87.888%] md:w-40">
              <SelectValue placeholder="Proficiency" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_LEVELS.map((level) => (
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
        <span className="sr-only">Remove language</span>
      </Button>
    </div>
  );
}
