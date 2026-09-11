import { Suspense } from "react";
import { EditorPanels } from "@/components/editor/editor-panels";

export default function EditorLayoutPage(
  props: LayoutProps<"/[locale]/platform/editor">,
) {
  return (
    <Suspense>
      <EditorPanels>{props.children}</EditorPanels>
    </Suspense>
  );
}
