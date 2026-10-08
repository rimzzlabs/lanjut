import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lanjut/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lanjut/ui/components/input-group";
import { FloppyDiskIcon, TextTIcon, XIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createSectionTitleSchema,
  SECTION_TITLE_MAX_LENGTH,
  type SectionTitleForm,
} from "@/lib/forms/section";

interface EditorSectionCustomNameDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** Dialog heading and description text. */
  heading: string;
  description: string;
  /** Prefilled value: empty when adding, the current title when renaming. */
  initialValue: string;
  onSubmit: (title: string) => void;
}

export function EditorSectionCustomNameDialog(
  props: EditorSectionCustomNameDialogProps,
) {
  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{props.heading}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {props.description}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {/* The dialog unmounts its content when closed, so each opening mounts a
            fresh form with the current value: empty when adding, the section's
            title when renaming. */}
        <CustomNameForm
          key={props.initialValue}
          initialValue={props.initialValue}
          onSubmit={(title) => {
            props.onSubmit(title);
            props.onOpenChange(false);
          }}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

interface CustomNameFormProps {
  initialValue: string;
  onSubmit: (title: string) => void;
}

function CustomNameForm(props: CustomNameFormProps) {
  const t = useTranslations("editor.custom");
  const tc = useTranslations("forms.common");
  const tv = useValidationTranslator();
  const schema = useMemo(() => createSectionTitleSchema(tv), [tv]);
  const form = useForm<SectionTitleForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { title: props.initialValue },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((values) => props.onSubmit(values.title));

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="title"
          render={(controller) => {
            const { field, fieldState } = controller;
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="custom-section-name">
                  {t("nameLabel")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <TextTIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="custom-section-name"
                    maxLength={SECTION_TITLE_MAX_LENGTH}
                    placeholder={t("namePlaceholder")}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
        />
      </FieldGroup>

      <ResponsiveDialogFooter className="mt-6">
        <ResponsiveDialogClose type="button" variant="outline">
          <XIcon /> {tc("cancel")}
        </ResponsiveDialogClose>
        <Button type="submit" disabled={!form.formState.isValid}>
          <FloppyDiskIcon /> {tc("save")}
        </Button>
      </ResponsiveDialogFooter>
    </form>
  );
}
