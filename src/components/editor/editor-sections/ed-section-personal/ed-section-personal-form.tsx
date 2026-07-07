"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { PhoneNumberInput } from "@/components/shared/phone-number-input";
import { UrlInput } from "@/components/shared/url-input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useResumeStore } from "@/lib/store";
import {
  applyPersonalValues,
  type PersonalFormValues,
  toPersonalValues,
} from "../resume-form-adapter";

export function EditorSectionPersonalForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.personal");
  const form = useForm<PersonalFormValues>({
    defaultValues: open ? toPersonalValues(open) : undefined,
  });

  // Mirror every edit into the store as it happens (debounced persist is the
  // store's job); reading inside the subscription avoids stale form snapshots.
  useEffect(() => {
    const subscription = form.watch(() => {
      updateOpen((draft) => applyPersonalValues(draft, form.getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, updateOpen]);

  if (!open) return null;

  return (
    <form>
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label" className="sr-only">
            {t("personalInfo")}
          </FieldLegend>
          <FieldDescription className="sr-only">
            {t("personalInfoDesc")}
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t("firstName")}
                    </FieldLabel>
                    <Input
                      placeholder={t("firstNamePlaceholder")}
                      {...field}
                      id={field.name}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t("lastName")}
                    </FieldLabel>
                    <Input
                      placeholder={t("lastNamePlaceholder")}
                      {...field}
                      id={field.name}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="jobTitle"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("jobTitle")}</FieldLabel>
                  <Input
                    placeholder={t("jobTitlePlaceholder")}
                    {...field}
                    id={field.name}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label" className="sr-only">
            {t("contactInfo")}
          </FieldLegend>
          <FieldDescription className="sr-only">
            {t("contactInfoDesc")}
          </FieldDescription>
          <FieldGroup>
            <div className="grid gap-6 2xl:grid-cols-2 2xl:gap-3">
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                    <Input
                      placeholder={t("emailPlaceholder")}
                      {...field}
                      id={field.name}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{t("phone")}</FieldLabel>
                    <PhoneNumberInput
                      id={field.name}
                      value={field.value}
                      placeholder={t("phonePlaceholder")}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="website"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("website")}</FieldLabel>
                  <UrlInput
                    id={field.name}
                    value={field.value}
                    placeholder={t("websitePlaceholder")}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label" className="sr-only">
            {t("location")}
          </FieldLegend>
          <FieldDescription className="sr-only">
            {t("locationDesc")}
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{t("city")}</FieldLabel>
                    <Input
                      placeholder={t("cityPlaceholder")}
                      {...field}
                      id={field.name}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="province"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t("province")}
                    </FieldLabel>
                    <Input
                      placeholder={t("provincePlaceholder")}
                      {...field}
                      id={field.name}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("country")}</FieldLabel>
                  <Input
                    placeholder={t("countryPlaceholder")}
                    {...field}
                    id={field.name}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
