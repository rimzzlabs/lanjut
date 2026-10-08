import { nearestResumeById } from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@lanjut/ui/components/empty";
import { FileDashedIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useEditorId } from "@/hooks/use-editor-id";
import { Link } from "@/i18n/navigation";
import { EDITOR_PATHNAME, editorHref, TEMPLATE_PATHNAME } from "@/lib/routes";
import { useResumeStore } from "@/lib/store";

/**
 * The editor's missing-résumé state, in place of the whole editor: with no
 * résumé there is nothing to edit, so the side panel stays out. When the id
 * in the URL doesn't resolve, the library index is searched for the closest
 * id within edit tolerance, a "did you mean" for mangled or truncated links.
 * Deleted résumés (no near id) fall back to the plain message.
 */
export function EditorResumeNotFound() {
  const id = useEditorId();
  const index = useResumeStore((state) => state.index);
  const suggestion = nearestResumeById(index, id ?? "");
  const t = useTranslations("editor.chrome");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileDashedIcon />
        </EmptyMedia>
        <EmptyTitle>{t("notFound")}</EmptyTitle>
        {suggestion && (
          <EmptyDescription>
            {t("didYouMean")}{" "}
            <Link href={editorHref(suggestion.id)}>{suggestion.title}</Link>?
          </EmptyDescription>
        )}
        {!suggestion && <EmptyDescription>{t("notExist")}</EmptyDescription>}
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button nativeButton={false} render={<Link href={EDITOR_PATHNAME} />}>
          {t("dashboard")}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={TEMPLATE_PATHNAME} />}
        >
          <SquaresFourIcon data-icon="inline-start" />
          {t("browseTemplates")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
