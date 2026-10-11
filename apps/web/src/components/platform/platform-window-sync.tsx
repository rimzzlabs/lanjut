import { useEffect } from "react";
import { handOverEditLock } from "@/lib/edit-lock";
import { syncProfilesFromDisk } from "@/lib/store/profile-store";
import {
  forgetDeletedResume,
  syncResumeFromDisk,
} from "@/lib/store/resume-store-windows";
import { onWindowMessage, type WindowMessage } from "@/lib/window-channel";

function handleMessage(message: WindowMessage): void {
  if (message.type === "handover") {
    void handOverEditLock(message.kind, message.id);
    return;
  }
  if (message.kind === "profile") {
    void syncProfilesFromDisk();
    return;
  }
  if (message.type === "deleted") forgetDeletedResume(message.id);
  if (message.type === "saved") void syncResumeFromDisk(message.id);
}

/**
 * Keeps this window in step with the others of this browser: its lists follow
 * their saves and deletes, and it gives up an item when one of them asks to
 * edit it. Listening to the other windows is an external-system effect.
 */
export function PlatformWindowSync() {
  useEffect(() => onWindowMessage(handleMessage), []);

  return null;
}
