"use client";

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
import { PROSE_FEATURES } from "@/lib/resume/schema-registry";
import { useResumeStore } from "@/lib/store";
import { RichTextEditor } from "../../rich-text/rich-text-editor";
import {
  applyPersonalValues,
  type PersonalFormValues,
  toPersonalValues,
} from "../resume-form-adapter";

export function EditorSectionPersonalForm() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const flush = useResumeStore((state) => state.flush);
  const form = useForm<PersonalFormValues>({
    values: open ? toPersonalValues(open) : undefined,
  });

  // Fields persist on blur; `flush` commits the pending IndexedDB write.
  const onAutosave = form.handleSubmit((data) => {
    updateOpen((draft) => applyPersonalValues(draft, data));
    return flush();
  });

  if (!open) return null;

  return (
    <form onBlur={() => void onAutosave()}>
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
                    <FieldLabel aria-required htmlFor={field.name}>
                      First name
                    </FieldLabel>
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
                    <FieldLabel aria-required htmlFor={field.name}>
                      Last name
                    </FieldLabel>
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
                  <FieldLabel aria-required htmlFor={field.name}>
                    Job Title
                  </FieldLabel>
                  <Input placeholder="UX Engineer" {...field} id={field.name} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="summary"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel aria-required htmlFor={field.name}>
                    Summary
                  </FieldLabel>
                  <RichTextEditor
                    id={field.name}
                    value={field.value}
                    features={PROSE_FEATURES}
                    placeholder="I'm a passionate UX engineer. Creating visually engaging..."
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
          <FieldLegend variant="label">Contact Information</FieldLegend>
          <FieldDescription className="text-xs">
            So HR can reach you easily
          </FieldDescription>
          <FieldGroup>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel aria-required htmlFor={field.name}>
                    Email address
                  </FieldLabel>
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
                  <FieldLabel aria-required htmlFor={field.name}>
                    Phone Number
                  </FieldLabel>
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
                  <FieldLabel aria-required htmlFor={field.name}>
                    Website
                  </FieldLabel>
                  <UrlInput
                    id={field.name}
                    value={field.value}
                    placeholder="rimzzlabs.com"
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <FieldDescription>
                    Assuming your site will always support <code>https</code>.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Location</FieldLegend>
          <FieldDescription className="text-xs">
            Where are you from?
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel aria-required htmlFor={field.name}>
                      City
                    </FieldLabel>
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
                    <FieldLabel aria-required htmlFor={field.name}>
                      Province
                    </FieldLabel>
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
