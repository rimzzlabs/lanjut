import { Button } from "@lanjut/ui/components/button";
import { CopyIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

interface ProfileAssistantCopyBlockProps {
  /** The label of the copy button. */
  label: string;
  text: string;
}

/** A command or an entry to paste elsewhere, shown in full, with a copy button. */
export function ProfileAssistantCopyBlock(
  props: ProfileAssistantCopyBlockProps,
) {
  const t = useTranslations("profile.assistant");

  async function copy() {
    try {
      await navigator.clipboard.writeText(props.text);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <pre className="overflow-x-auto rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs whitespace-pre select-all">
        {props.text}
      </pre>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => void copy()}
      >
        <CopyIcon data-icon="inline-start" />
        {props.label}
      </Button>
    </div>
  );
}
