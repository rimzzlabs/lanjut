"use client";

import { parseAsString, useQueryState } from "nuqs";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EditorLayoutTemplateList } from "./editor-layout/ed-layout-template-list";
import { EditorSectionList } from "./editor-sections/ed-section-list";

const TABS = [
  { value: "editor", label: "Editor" },
  { value: "layout", label: "Layout" },
  // { value: "latex", label: "LaTex", disabled: true },
];

export function EditorSidebarContent() {
  const [tab, setTab] = useQueryState(
    "editor-tab",
    parseAsString.withDefault(TABS[0].value),
  );

  const onTabChange = (next: string) => setTab(next);

  return (
    <div className="flex flex-col py-6">
      <Tabs value={tab} onValueChange={onTabChange}>
        <div className="shrink-0 px-4">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="editor">
          <ScrollArea
            id="tour-editor-sections"
            className="h-[calc(100vh-4.126rem)] xl:h-[calc(100vh-7rem)]"
          >
            <EditorSectionList />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout">
          <ScrollArea
            id="tour-editor-sections"
            className="h-[calc(100vh-4.126rem)] xl:h-[calc(100vh-7rem)]"
          >
            <EditorLayoutTemplateList />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
