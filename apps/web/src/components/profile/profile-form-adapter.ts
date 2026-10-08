import type { Profile } from "@lanjut/resume";
import { S } from "@mobily/ts-belt";
import {
  plain,
  plainValue,
} from "@/components/editor/editor-sections/resume-form-adapter-shared";
import type { ProfileForm } from "@/lib/forms/profile";

export function toProfileFormValues(profile: Profile): ProfileForm {
  const fields = profile.header.fields;
  return {
    name: profile.name,
    photo: profile.header.photo ?? "",
    firstName: plainValue(fields.firstName),
    lastName: plainValue(fields.lastName),
    jobTitle: plainValue(fields.jobTitle),
    email: plainValue(fields.email),
    phone: plainValue(fields.phone),
    website: plainValue(fields.website),
    linkedin: plainValue(fields.linkedin),
    link: plainValue(fields.link),
    city: plainValue(fields.city),
    province: plainValue(fields.province),
    country: plainValue(fields.country),
    summary: profile.summary,
  };
}

export function applyProfileFormValues(
  profile: Profile,
  values: ProfileForm,
): Profile {
  return {
    ...profile,
    name: values.name,
    header: {
      ...profile.header,
      photo: S.isEmpty(values.photo) ? undefined : values.photo,
      fields: {
        ...profile.header.fields,
        firstName: plain(values.firstName),
        lastName: plain(values.lastName),
        jobTitle: plain(values.jobTitle),
        email: plain(values.email),
        phone: plain(values.phone),
        website: plain(values.website),
        linkedin: plain(values.linkedin),
        link: plain(values.link),
        city: plain(values.city),
        province: plain(values.province),
        country: plain(values.country),
      },
    },
    summary: values.summary,
  };
}
