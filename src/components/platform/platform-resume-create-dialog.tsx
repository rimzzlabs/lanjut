"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Save, TextInitial, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  RESUME_TITLE_MAX_LENGTH,
  type ResumeTitleForm,
  resumeTitleSchema,
} from "@/lib/forms/resume";
import { useResumeStore } from "@/lib/store";
import { DEFAULT_TEMPLATE_ID, resolveTemplateId } from "@/lib/templates";
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
import { PlatformTemplateRadioGroup } from "./platform-template-radio-group";

interface PlatformResumeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the label field. Remount (via `key`) to re-seed a new value. */
  initialTitle?: string;
  /** Presentation template for the new résumé; defaults to the starter (Awal). */
  templateId?: string;
}

export function PlatformResumeCreateDialog(
  props: PlatformResumeCreateDialogProps,
) {
  const router = useRouter();
  const createResume = useResumeStore((state) => state.createResume);
  const [templateId, setTemplateId] = useState(() =>
    resolveTemplateId(props.templateId ?? DEFAULT_TEMPLATE_ID),
  );
  const form = useForm<ResumeTitleForm>({
    resolver: standardSchemaResolver(resumeTitleSchema),
    defaultValues: { title: props.initialTitle ?? "" },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const resume = await createResume(values.title, templateId);
    form.reset({ title: "" });
    props.onOpenChange(false);
    router.push(`/platform/editor/${resume.id}`);
  });

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
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-resume-title">
                    Résumé label
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <TextInitial />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="create-resume-title"
                      maxLength={RESUME_TITLE_MAX_LENGTH}
                      placeholder="Software Engineer"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </InputGroup>

                  <FieldDescription>
                    At least 3 characters or more, maximum 100 chars at most.
                  </FieldDescription>

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field>
              <FieldLabel>Template</FieldLabel>
              <PlatformTemplateRadioGroup
                value={templateId}
                onValueChange={setTemplateId}
              />
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
