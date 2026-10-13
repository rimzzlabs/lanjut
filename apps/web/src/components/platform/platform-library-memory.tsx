import { useEffect } from "react";
import { useProfileResumeCount } from "@/hooks/use-profile-resumes";
import { recentRows, saveRecentRows } from "@/lib/recent-rows";

/**
 * Remembers how many résumés the active profile holds, so the next page load
 * opens on loading states of the right shape. It is in the shell, not in the
 * sidebar, because a phone mounts the sidebar only while its sheet is open.
 * Writing to storage is an external-system effect.
 */
export function PlatformLibraryMemory() {
  const count = useProfileResumeCount();

  useEffect(() => {
    if (count !== null) saveRecentRows(recentRows(count));
  }, [count]);

  return null;
}
