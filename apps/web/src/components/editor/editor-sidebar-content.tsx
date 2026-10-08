import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lanjut/ui/components/tabs";
import { useTranslations } from "use-intl";
import { type EditorTab, useEditorChromeStore } from "@/lib/store";
import { EditorDocumentPanel } from "./editor-document-panel";
import { EditorImportLeftovers } from "./editor-import-leftovers";
import { EditorLayoutTemplateList } from "./editor-layout/ed-layout-template-list";
import { EditorSectionList } from "./editor-sections/ed-section-list";
import { EditorSectionOrderReset } from "./editor-sections/ed-section-order-reset";
import { EditorUndoRedo } from "./editor-undo-redo";

const TABS = [
  { value: "editor", labelKey: "tabEditor" },
  { value: "layout", labelKey: "tabLayout" },
  { value: "document", labelKey: "tabDocument", id: "tour-document-tab" },
];

export function EditorSidebarContent() {
  const t = useTranslations("editor.chrome");
  const tab = useEditorChromeStore((state) => state.activeTab);
  const setActiveTab = useEditorChromeStore((state) => state.setActiveTab);

  const onTabChange = (next: string) => setActiveTab(next as EditorTab);

  return (
    // A grid, so each tab's ScrollArea takes its height from a track: the space
    // left under the tabs, whatever the window, the sheet, or the import notice
    // above leave it. A panel taller than the window gets scrolled into view by
    // the tour, which drags the tabs out of sight.
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] pt-6">
      <div>
        <EditorImportLeftovers />
      </div>

      <Tabs
        value={tab}
        onValueChange={onTabChange}
        className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]"
      >
        <div className="flex shrink-0 items-center gap-2 px-4">
          <TabsList>
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} id={item.id}>
                {t(item.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto">
            <EditorUndoRedo />
          </div>
        </div>

        <TabsContent value="editor">
          <ScrollArea id="tour-editor-sections" className="h-full">
            <div className="flex items-center justify-end px-4 pt-4">
              <h3 className="text-sm font-medium sr-only">
                {t("sectionsHeading")}
              </h3>
              <EditorSectionOrderReset />
            </div>
            <EditorSectionList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout">
          <ScrollArea id="tour-editor-layout" className="h-full">
            <EditorLayoutTemplateList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="document">
          <ScrollArea id="tour-editor-document" className="h-full">
            <EditorDocumentPanel />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
