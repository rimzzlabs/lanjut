import type { ResumeIndexEntry } from "@lanjut/resume";
import { PlatformResumeGridItem } from "./platform-resume-grid-item";

export function PlatformResumeGrid(props: {
  resumes: readonly ResumeIndexEntry[];
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
      {props.resumes.map((resume) => (
        <PlatformResumeGridItem key={resume.id} resume={resume} />
      ))}
    </div>
  );
}
