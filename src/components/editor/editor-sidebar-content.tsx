"use client";

import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
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
  const [tab, setTab] = useQueryState(
    "editor-tab",
    parseAsString.withDefault(TABS[0].value),
  );

  const onTabChange = (next: string) => setTab(next);

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
          <EditorSectionOrderReset />
        </div>

        <TabsContent value="editor">
          <ScrollArea id="tour-editor-sections" className={PANEL_HEIGHT}>
            <EditorSectionList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout">
          <ScrollArea className={PANEL_HEIGHT}>
            <EditorLayoutTemplateList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="document">
          <ScrollArea className={PANEL_HEIGHT}>
            <EditorDocumentPanel />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
