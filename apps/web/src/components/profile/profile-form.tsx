import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Profile } from "@lanjut/resume";
import { PROSE_FEATURES } from "@lanjut/resume/schema-registry";
import { Button } from "@lanjut/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@lanjut/ui/components/field";
import { Spinner } from "@lanjut/ui/components/spinner";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { RichTextField } from "@/components/editor/rich-text/rich-text-field";
import { useValidationTranslator } from "@/hooks/use-validation-translator";
import {
  createProfileSchema,
  type ProfileForm as ProfileFormValues,
} from "@/lib/forms/profile";
import {
  applyProfileFormValues,
  toProfileFormValues,
} from "./profile-form-adapter";
import { ProfileFormContact } from "./profile-form-contact";
import { ProfileFormPhoto } from "./profile-form-photo";
import { ProfileFormText } from "./profile-form-text";

interface ProfileFormProps {
  profile: Profile;
  submitLabel: string;
  onSubmit: (profile: Profile) => Promise<void>;
  /** Shows Cancel beside the submit button. */
  onCancel?: () => void;
}

/**
 * A profile's name, then the personal information and the summary it fills
 * new résumés with. Remount it (via `key`) to load another profile.
 */
export function ProfileForm(props: ProfileFormProps) {
  const t = useTranslations();
  const tv = useValidationTranslator();
  const schema = useMemo(() => createProfileSchema(tv), [tv]);
  const form = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: toProfileFormValues(props.profile),
  });
  const { isDirty, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    await props.onSubmit(applyProfileFormValues(props.profile, values));
    form.reset(values);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <ProfileFormText
        control={form.control}
        name="name"
        label={t("profile.name")}
        placeholder={t("profile.namePlaceholder")}
        required
        description={
          <FieldDescription>{t("profile.nameHint")}</FieldDescription>
        }
      />

      <FieldSet>
        <FieldLegend>{t("editor.personal.personalInfo")}</FieldLegend>
        <FieldGroup>
          <Controller
            control={form.control}
            name="photo"
            render={(controller) => (
              <ProfileFormPhoto
                value={controller.field.value}
                onChange={controller.field.onChange}
              />
            )}
          />
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-3">
            <ProfileFormText
              control={form.control}
              name="firstName"
              label={t("editor.personal.firstName")}
              placeholder={t("editor.personal.firstNamePlaceholder")}
            />
            <ProfileFormText
              control={form.control}
              name="lastName"
              label={t("editor.personal.lastName")}
              placeholder={t("editor.personal.lastNamePlaceholder")}
            />
          </div>
          <ProfileFormText
            control={form.control}
            name="jobTitle"
            label={t("editor.personal.jobTitle")}
            placeholder={t("editor.personal.jobTitlePlaceholder")}
          />
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-3">
            <ProfileFormText
              control={form.control}
              name="email"
              label={t("editor.personal.email")}
              placeholder={t("editor.personal.emailPlaceholder")}
            />
            <ProfileFormContact control={form.control} name="phone" />
          </div>
          <ProfileFormContact control={form.control} name="website" />
          <ProfileFormContact control={form.control} name="linkedin" />
          <ProfileFormContact control={form.control} name="link" />
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-3">
            <ProfileFormText
              control={form.control}
              name="city"
              label={t("editor.personal.city")}
              placeholder={t("editor.personal.cityPlaceholder")}
            />
            <ProfileFormText
              control={form.control}
              name="province"
              label={t("editor.personal.province")}
              placeholder={t("editor.personal.provincePlaceholder")}
            />
            <ProfileFormText
              control={form.control}
              name="country"
              label={t("editor.personal.country")}
              placeholder={t("editor.personal.countryPlaceholder")}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <Controller
        control={form.control}
        name="summary"
        render={(controller) => {
          const { field, fieldState } = controller;
          return (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t("editor.summary.label")}
              </FieldLabel>
              <RichTextField
                id={field.name}
                value={field.value}
                features={PROSE_FEATURES}
                placeholder={t("editor.summary.placeholder")}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />

      <div className="flex justify-end gap-2">
        {props.onCancel && (
          <Button type="button" variant="outline" onClick={props.onCancel}>
            {t("forms.common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {props.submitLabel}
        </Button>
      </div>
    </form>
  );
}
