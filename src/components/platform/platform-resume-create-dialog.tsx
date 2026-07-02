"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Save, TextInitial, XIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  RESUME_TITLE_MAX_LENGTH,
  type ResumeTitleForm,
  resumeTitleSchema,
} from "@/lib/forms/resume";
import { useResumeStore } from "@/lib/store";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

interface PlatformResumeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the label field. Remount (via `key`) to re-seed a new value. */
  initialTitle?: string;
}

export function PlatformResumeCreateDialog(
  props: PlatformResumeCreateDialogProps,
) {
  const createResume = useResumeStore((state) => state.createResume);
  const form = useForm<ResumeTitleForm>({
    resolver: standardSchemaResolver(resumeTitleSchema),
    defaultValues: { title: props.initialTitle ?? "" },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createResume(values.title);
    form.reset({ title: "" });
    props.onOpenChange(false);
  });

  const error = form.formState.errors.title;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new resume</DialogTitle>
          <DialogDescription className="text-balance">
            You can create a new resume. But let&apos;s name your résumé first.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="create-resume-title">
                Résumé label
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <TextInitial />
                </InputGroupAddon>

                <Controller
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <InputGroupInput
                      id="create-resume-title"
                      maxLength={RESUME_TITLE_MAX_LENGTH}
                      placeholder="Software Engineer"
                      aria-invalid={error ? true : undefined}
                      {...field}
                    />
                  )}
                />
              </InputGroup>

              {error ? (
                <FieldError>{error.message}</FieldError>
              ) : (
                <FieldDescription>
                  At least 3 characters or more, maximum 100 chars at most.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>
              <XIcon /> Cancel
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
