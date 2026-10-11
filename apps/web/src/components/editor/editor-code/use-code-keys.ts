import { A, S } from "@mobily/ts-belt";
import { type KeyboardEvent, useRef } from "react";
import { editCode } from "./edit-code";
import { indentEdit, outdentEdit, type TextEdit } from "./indent";

const MODIFIER_KEYS = ["Shift", "Control", "Alt", "Meta"];

function runCommand(insert: string): boolean {
  if (S.isEmpty(insert)) return document.execCommand("delete");
  return document.execCommand("insertText", false, insert);
}

/**
 * Writes an edit with the browser's own editing command. No other call
 * changes a text field and keeps its undo history, so Cmd+Z still goes back
 * through an indent. The command sends the input event too, so the change
 * handler runs as it does for typing. `setRangeText` is the way without it.
 */
function applyEdit(field: HTMLTextAreaElement, edit: TextEdit) {
  field.setSelectionRange(edit.from, edit.to);
  if (!runCommand(edit.insert)) {
    field.setRangeText(edit.insert, edit.from, edit.to, "end");
    editCode(field.value);
  }
  field.setSelectionRange(edit.select[0], edit.select[1]);
}

function changeIndent(field: HTMLTextAreaElement, outdent: boolean) {
  const selection = {
    value: field.value,
    start: field.selectionStart,
    end: field.selectionEnd,
  };
  const edit = outdent ? outdentEdit(selection) : indentEdit(selection);
  if (edit) applyEdit(field, edit);
}

/**
 * Tab and Shift+Tab change the indent in the code. Escape gives the next Tab
 * back to the browser, so the keyboard can always leave the field.
 */
export function useCodeKeys() {
  const leaving = useRef(false);

  return (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (A.includes(MODIFIER_KEYS, event.key)) return;
    const leave = leaving.current;
    leaving.current = event.key === "Escape";
    if (event.key !== "Tab" || leave) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    changeIndent(event.currentTarget, event.shiftKey);
  };
}
