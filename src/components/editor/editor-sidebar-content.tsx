"use client";

import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EditorDocumentLanguage } from "./editor-document-language";
import { EditorLayoutTemplateList } from "./editor-layout/ed-layout-template-list";
import { EditorSectionList } from "./editor-sections/ed-section-list";
import { EditorSectionOrderReset } from "./editor-sections/ed-section-order-reset";

const TABS = [
  { value: "editor", labelKey: "tabEditor" },
  { value: "layout", labelKey: "tabLayout" },
  // { value: "latex", labelKey: "tabLatex", disabled: true },
];

export function EditorSidebarContent() {
  const t = useTranslations("editor.chrome");
  const [tab, setTab] = useQueryState(
    "editor-tab",
    parseAsString.withDefault(TABS[0].value),
  );

  const onTabChange = (next: string) => setTab(next);

  return (
    <div className="flex flex-col py-6">
      <EditorDocumentLanguage />

      <Tabs value={tab} onValueChange={onTabChange}>
        <div className="flex shrink-0 items-center gap-2 px-4">
          <TabsList>
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {t(item.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
          <EditorSectionOrderReset />
        </div>

        <TabsContent value="editor">
          <ScrollArea
            id="tour-editor-sections"
            className="h-[calc(100vh-7rem)] xl:h-[calc(100vh-10.25rem)]"
          >
            <EditorSectionList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout">
          <ScrollArea
            id="tour-editor-sections"
            className="h-[calc(100vh-7rem)] xl:h-[calc(100vh-10.25rem)]"
          >
            <EditorLayoutTemplateList />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
