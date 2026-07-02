"use client";

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
            Personal Informaton
          </FieldLegend>
          <FieldDescription className="sr-only">
            So HR can identify you
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                    <Input placeholder="John" {...field} id={field.name} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                    <Input placeholder="Doe" {...field} id={field.name} />
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
                  <FieldLabel htmlFor={field.name}>Job Title</FieldLabel>
                  <Input placeholder="UX Engineer" {...field} id={field.name} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label" className="sr-only">
            Contact Information
          </FieldLegend>
          <FieldDescription className="sr-only">
            So HR can reach you easily
          </FieldDescription>
          <FieldGroup>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                  <Input
                    placeholder="john@acme.inc"
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
                  <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                  <PhoneNumberInput
                    id={field.name}
                    value={field.value}
                    placeholder="+62812345678"
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="website"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Website</FieldLabel>
                  <UrlInput
                    id={field.name}
                    value={field.value}
                    placeholder="rimzzlabs.com"
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
            Location
          </FieldLegend>
          <FieldDescription className="sr-only">
            Where are you from?
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>City</FieldLabel>
                    <Input
                      placeholder="Pandeglang"
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
                    <FieldLabel htmlFor={field.name}>Province</FieldLabel>
                    <Input placeholder="Banten" {...field} id={field.name} />
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
                  <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                  <Input placeholder="Indonesia" {...field} id={field.name} />
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
