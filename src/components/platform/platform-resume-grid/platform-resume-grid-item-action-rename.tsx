"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Save, TextInitial, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface PlatformResumeGridActionRenameProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeGridActionRename(
  props: PlatformResumeGridActionRenameProps,
) {
  const renameResume = useResumeStore((state) => state.renameResume);
  const form = useForm<ResumeTitleForm>({
    resolver: standardSchemaResolver(resumeTitleSchema),
    defaultValues: { title: props.resume.title },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.title !== props.resume.title) {
      await renameResume(props.resume.id, values.title);
    }
    props.onOpenChange(false);
  });

  const error = form.formState.errors.title;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Rename </DialogTitle>
          <DialogDescription>
            You can rename this resume label to whatever you want. If the value
            of the label is same as before, it won&apos;t be saved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
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
                  aria-invalid={error ? true : undefined}
                  {...form.register("title")}
                />
              </InputGroup>

              {error ? (
                <FieldError>{error.message}</FieldError>
              ) : (
                <FieldDescription>
                  At least 3 characters or up. Max 100 characters.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>
              <XIcon /> Cancel
            </DialogClose>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save /> Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
