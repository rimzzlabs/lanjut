import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lanjut/ui/components/tabs";
import { cn } from "@lanjut/ui/lib/utils";
import { useTranslations } from "use-intl";
import {
  type EditorTab,
  useEditorChromeStore,
  useResumeStore,
} from "@/lib/store";
import { EditorDocumentPanel } from "./editor-document-panel";
import { EditorImportLeftovers } from "./editor-import-leftovers";
import { EditorLayoutTemplateList } from "./editor-layout/ed-layout-template-list";
import { EditorSectionList } from "./editor-sections/ed-section-list";
import { EditorStylingPanel } from "./editor-styling/editor-styling-panel";
import { preloadPdfExport } from "./preload-pdf-export";

const TABS = [
  { value: "content", labelKey: "tabContent" },
  { value: "layout", labelKey: "tabLayout" },
  { value: "styling", labelKey: "tabStyling" },
  { value: "document", labelKey: "tabDocument", id: "tour-document-tab" },
];

export function EditorSidebarContent(props: { className?: string }) {
  const t = useTranslations("editor.chrome");
  const tab = useEditorChromeStore((state) => state.activeTab);
  const setActiveTab = useEditorChromeStore((state) => state.setActiveTab);

  const onTabChange = (next: string) => {
    const open = useResumeStore.getState().open;
    if (next === "document" && open) preloadPdfExport(open);
    setActiveTab(next as EditorTab);
  };

  return (
    // A grid, so each tab's ScrollArea takes its height from a track: the space
    // left under the tabs, whatever the window, the sheet, or the import notice
    // above leave it. A panel taller than the window gets scrolled into view by
    // the tour, which drags the tabs out of sight.
    <div
      className={cn(
        "grid h-full grid-rows-[auto_minmax(0,1fr)] pt-6",
        props.className,
      )}
    >
      <div>
        <EditorImportLeftovers />
      </div>

      <Tabs
        value={tab}
        onValueChange={onTabChange}
        className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]"
      >
        <div className="shrink-0 px-4">
          <TabsList id="tour-editor-tabs" className="w-full">
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} id={item.id}>
                {t(item.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="content">
          <ScrollArea id="tour-editor-sections" className="h-full">
            <h3 className="sr-only">{t("sectionsHeading")}</h3>
            <div className="pt-2">
              <EditorSectionList />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout">
          <ScrollArea id="tour-editor-layout" className="h-full">
            <EditorLayoutTemplateList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="styling">
          <ScrollArea id="tour-editor-styling" className="h-full">
            <EditorStylingPanel />
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
