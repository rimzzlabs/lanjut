import { Eye, EyeClosed } from "lucide-react";
import { useTranslations } from "use-intl";
import { Button } from "../ui/button";

interface EditorSectionVisibilityToggleProps {
  hidden: boolean;
  onToggle: () => void;
}

export function EditorSectionVisibilityToggle(
  props: EditorSectionVisibilityToggleProps,
) {
  const { hidden, onToggle } = props;
  const t = useTranslations("editor.chrome");
  const Icon = hidden ? EyeClosed : Eye;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      type="button"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? t("showSection") : t("hideSection")}
    >
      <Icon className="size-4 stroke-muted-foreground" />
    </Button>
  );
}
