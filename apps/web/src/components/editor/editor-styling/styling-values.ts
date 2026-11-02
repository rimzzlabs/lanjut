import type { Resume } from "@lanjut/resume";
import type { ColorPart } from "@lanjut/resume/colors";
import type { ContactLabelKind } from "@lanjut/resume/contact-labels";
import { D, S } from "@mobily/ts-belt";

function withRecord(
  resume: Resume,
  key: "colors" | "contactLabels",
  next: object,
): Resume {
  if (D.isEmpty(next)) return D.deleteKey(resume, key);
  return { ...resume, [key]: next };
}

/** Sets one part's color, or gives it back to the template with `undefined`. */
export function withColor(
  resume: Resume,
  part: ColorPart,
  hex: string | undefined,
): Resume {
  const colors = resume.colors ?? {};
  if (hex === undefined) {
    return withRecord(resume, "colors", D.deleteKey(colors, part));
  }
  return withRecord(resume, "colors", D.set(colors, part, hex));
}

/** Sets one contact's label. An empty label shows the address again. */
export function withContactLabel(
  resume: Resume,
  kind: ContactLabelKind,
  label: string,
): Resume {
  const labels = resume.contactLabels ?? {};
  if (S.isEmpty(S.trim(label))) {
    return withRecord(resume, "contactLabels", D.deleteKey(labels, kind));
  }
  return withRecord(resume, "contactLabels", D.set(labels, kind, label));
}
