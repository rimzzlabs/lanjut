import { EditorPageContent } from "@/components/editor/editor-page";
import { EditorPanels } from "@/components/editor/editor-panels";
import { PlatformShell } from "@/components/platform/platform-shell";
import { AppProviders, type IslandProps } from "@/components/shared/providers";

export function EditorRoute(props: IslandProps) {
  return (
    <AppProviders locale={props.locale} pathname={props.pathname}>
      <PlatformShell>
        <EditorPanels>
          <EditorPageContent />
        </EditorPanels>
      </PlatformShell>
    </AppProviders>
  );
}
