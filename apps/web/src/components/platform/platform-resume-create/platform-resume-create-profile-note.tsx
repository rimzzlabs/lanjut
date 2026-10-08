import { isProfileEmpty } from "@lanjut/resume";
import { Alert, AlertDescription } from "@lanjut/ui/components/alert";
import { UserCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { useProfileLabel } from "@/hooks/use-profile-label";
import type { ResumeSource } from "@/lib/forms/resume";
import { selectActiveProfile, useProfileStore } from "@/lib/store";

function bold(chunks: ReactNode) {
  return <strong className="font-medium text-foreground">{chunks}</strong>;
}

/**
 * Names the profile the new résumé goes into, and says when that profile
 * fills its personal information and summary. An import keeps the file's
 * own, and an empty profile fills nothing.
 */
export function PlatformResumeCreateProfileNote(props: {
  source: ResumeSource;
}) {
  const t = useTranslations("profile");
  const profile = useProfileStore(selectActiveProfile);
  const label = useProfileLabel(profile);
  const fills = props.source !== "import" && !isProfileEmpty(profile);

  return (
    <Alert>
      <UserCircleIcon />
      <AlertDescription>
        {t.rich(fills ? "prefillNote" : "joinNote", { name: label, b: bold })}
      </AlertDescription>
    </Alert>
  );
}
