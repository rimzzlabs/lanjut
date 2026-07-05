"use client";

import { EditorSectionList } from "./editor-sections/ed-section-list";

export function EditorSidebarContent() {
  return (
    <div className="flex flex-col py-6">
      <h2 className="pb-1 text-2xl font-bold tracking-tight px-4">Editor</h2>
      <h3 className="pb-2 text-lg font-semibold tracking-tight px-4">
        The Essentials
      </h3>
      <EditorSectionList />
    </div>
  );
}
