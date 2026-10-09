import type { ResumeIndexEntry } from "@lanjut/resume";
import { PlatformResumeListItem } from "./platform-resume-list-item";

export function PlatformResumeList(props: {
  resumes: readonly ResumeIndexEntry[];
}) {
  return (
    <ul className="flex flex-col gap-1 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10">
      {props.resumes.map((resume) => (
        <PlatformResumeListItem key={resume.id} resume={resume} />
      ))}
    </ul>
  );
}
