import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
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
  const Icon = hidden ? EyeClosedIcon : EyeIcon;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      type="button"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? t("showSection") : t("hideSection")}
    >
      <Icon className="size-4 text-muted-foreground" />
    </Button>
  );
}
