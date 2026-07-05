"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Save, TextInitial, XIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  RESUME_TITLE_MAX_LENGTH,
  type ResumeTitleForm,
  resumeTitleSchema,
} from "@/lib/forms/resume";
import { useResumeStore } from "@/lib/store";

interface PlatformResumeActionRenameProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeActionRename(
  props: PlatformResumeActionRenameProps,
) {
  const renameResume = useResumeStore((state) => state.renameResume);
  const form = useForm<ResumeTitleForm>({
    resolver: standardSchemaResolver(resumeTitleSchema),
    defaultValues: { title: props.resume.title },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.title !== props.resume.title) {
      await renameResume(props.resume.id, values.title);
    }
    props.onOpenChange(false);
  });

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Rename </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            You can rename this resume label to whatever you want. If the value
            of the label is same as before, it won&apos;t be saved.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="rename-resume-title">
                    Resume label
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <TextInitial />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="rename-resume-title"
                      maxLength={RESUME_TITLE_MAX_LENGTH}
                      placeholder="e.g: Software Engineer"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </InputGroup>

                  <FieldDescription>
                    At least 3 characters or up. Max 100 characters.
                  </FieldDescription>

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          <ResponsiveDialogFooter className="mt-6">
            <ResponsiveDialogClose type="button" variant="outline">
              <XIcon /> Cancel
            </ResponsiveDialogClose>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save /> Save
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
