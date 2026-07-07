import { EditorPanels } from "@/components/editor/editor-panels";

export default function EditorLayoutPage(
  props: LayoutProps<"/[locale]/platform/editor/[id]">,
) {
  return <EditorPanels>{props.children}</EditorPanels>;
}
