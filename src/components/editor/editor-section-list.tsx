"use client";

import { useState } from "react";
import { EditorSectionListItem } from "./editor-section-list-item";
import { EDITOR_SECTIONS, type EditorSectionId } from "./editor-sections";

export function EditorSectionList() {
  const [activeId, setActiveId] = useState<EditorSectionId>("personal-details");
  const [hidden, setHidden] = useState<ReadonlySet<EditorSectionId>>(
    () => new Set(),
  );

  const toggleHidden = (id: EditorSectionId) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul className="divide-y">
      {EDITOR_SECTIONS.map((section) => (
        <EditorSectionListItem
          key={section.id}
          section={section}
          active={section.id === activeId}
          hidden={hidden.has(section.id)}
          onSelect={setActiveId}
          onToggleHidden={toggleHidden}
        />
      ))}
    </ul>
  );
}
