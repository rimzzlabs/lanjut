"use client";

import { useTranslations } from "next-intl";
import { type EditorTab, useEditorChromeStore } from "@/lib/store";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EditorDocumentPanel } from "./editor-document-panel";
import { EditorImportLeftovers } from "./editor-import-leftovers";
import { EditorLayoutTemplateList } from "./editor-layout/ed-layout-template-list";
import { EditorSectionList } from "./editor-sections/ed-section-list";
import { EditorSectionOrderReset } from "./editor-sections/ed-section-order-reset";

const TABS = [
  { value: "editor", labelKey: "tabEditor" },
  { value: "layout", labelKey: "tabLayout" },
  { value: "document", labelKey: "tabDocument", id: "tour-document-tab" },
];

const PANEL_HEIGHT = "h-[calc(100vh-7rem)] xl:h-[calc(100vh-7rem)]";

export function EditorSidebarContent() {
  const t = useTranslations("editor.chrome");
  const tab = useEditorChromeStore((state) => state.activeTab);
  const setActiveTab = useEditorChromeStore((state) => state.setActiveTab);

  const onTabChange = (next: string) => setActiveTab(next as EditorTab);

  return (
    <div className="flex flex-col py-6">
      <EditorImportLeftovers />

      <Tabs value={tab} onValueChange={onTabChange}>
        <div className="flex shrink-0 items-center gap-2 px-4">
          <TabsList>
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} id={item.id}>
                {t(item.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="editor">
          <ScrollArea id="tour-editor-sections" className={PANEL_HEIGHT}>
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
          <ScrollArea id="tour-editor-layout" className={PANEL_HEIGHT}>
            <EditorLayoutTemplateList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="document">
          <ScrollArea id="tour-editor-document" className={PANEL_HEIGHT}>
            <EditorDocumentPanel />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
