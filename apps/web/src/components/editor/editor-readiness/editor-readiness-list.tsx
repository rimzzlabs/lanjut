import type { ReadinessCheck, ReadinessTarget } from "@lanjut/resume/readiness";
import { EditorReadinessItem } from "./editor-readiness-item";

interface EditorReadinessListProps {
  checks: ReadonlyArray<ReadinessCheck>;
  onJump: (target: ReadinessTarget) => void;
}

export function EditorReadinessList(props: EditorReadinessListProps) {
  return (
    <ul className="-mx-2 flex flex-col">
      {props.checks.map((check) => (
        <li key={check.id}>
          <EditorReadinessItem check={check} onJump={props.onJump} />
        </li>
      ))}
    </ul>
  );
}
