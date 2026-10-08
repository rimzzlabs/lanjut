import { type Profile, profilePersonName } from "@lanjut/resume";
import { A, pipe, S } from "@mobily/ts-belt";

/** The person and the job title on a profile, as one line. */
export function profileDetailText(profile: Profile): string {
  const jobTitle = profile.header.fields.jobTitle;
  const title = jobTitle?.kind === "plain" ? S.trim(jobTitle.value) : "";
  return pipe(
    [profilePersonName(profile), title],
    A.filter(S.isNotEmpty),
    A.join(" · "),
  );
}
