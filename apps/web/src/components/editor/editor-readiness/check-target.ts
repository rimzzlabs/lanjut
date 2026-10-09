import type { ReadinessTarget } from "@lanjut/resume/readiness";
import { MEDIA_XL } from "@/hooks/use-media-query";
import { useEditorChromeStore } from "@/lib/store";
import { sectionAnchorId } from "../editor-sections/section-anchor";

const FOCUSABLE = "input, textarea, [contenteditable='true']";

/**
 * Opens the section a check points at, on the Content tab, and scrolls it
 * into view. Below xl the tab lives in the edit sheet, so the sheet opens
 * too and focuses the field itself (`takeJumpField`). The section's form
 * renders after this update, so the scroll waits a frame.
 */
export function openCheckTarget(target: ReadinessTarget) {
  const chrome = useEditorChromeStore.getState();
  chrome.setActiveTab("content");
  chrome.setOpenSections([target.section]);
  if (!window.matchMedia(MEDIA_XL).matches) {
    chrome.setJumpTarget(target);
    chrome.setSheetOpen(true);
  }
  requestAnimationFrame(() => {
    document
      .getElementById(sectionAnchorId(target.section))
      ?.scrollIntoView({ block: "start" });
  });
}

/** The field a check points at, or the section's first field. */
export function findCheckField(target: ReadinessTarget): HTMLElement | null {
  const item = document.getElementById(sectionAnchorId(target.section));
  if (!item) return null;
  const field = target.field
    ? item.querySelector<HTMLElement>(`#${target.field}`)
    : null;
  return field ?? item.querySelector<HTMLElement>(FOCUSABLE);
}

/**
 * The edit sheet's first focus: the field a check sent the person to, once,
 * or the sheet's default when they opened it with the Edit button.
 */
export function takeJumpField(): HTMLElement | true {
  const chrome = useEditorChromeStore.getState();
  const target = chrome.jumpTarget;
  if (target === null) return true;
  chrome.setJumpTarget(null);
  return findCheckField(target) ?? true;
}
