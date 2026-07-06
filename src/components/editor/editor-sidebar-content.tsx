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
    <div className="flex h-full flex-col py-6">
      <Tabs className="min-h-0 flex-1" value={tab} onValueChange={onTabChange}>
        <div className="shrink-0 px-4">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea id="tour-editor-sections" className="min-h-0 flex-1">
          <TabsContent value="editor">
            <EditorSectionList />
          </TabsContent>

          <TabsContent value="layout" className="py-4">
            <EditorLayoutTemplateList />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
