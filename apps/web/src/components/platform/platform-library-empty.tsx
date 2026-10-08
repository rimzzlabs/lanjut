import { A } from "@mobily/ts-belt";
import { useResumeStore } from "@/lib/store";
import { PlatformEmptyState } from "./platform-empty-state";
import { PlatformLibraryStart } from "./platform-library-start/platform-library-start";

/**
 * The active profile holds no résumé. With nothing saved at all, the device's
 * empty state; with other profiles holding résumés, the profile's. Shared by
 * the library and its loading state, so the two never disagree.
 */
export function PlatformLibraryEmpty() {
  const total = useResumeStore((state) => A.length(state.index));
  const unreadableCount = useResumeStore((state) => state.unreadableCount);

  // With unreadable documents present, "No résumés yet" would be a lie.
  if (total === 0 && unreadableCount > 0) return <PlatformLibraryStart />;
  return <PlatformEmptyState scope={total === 0 ? "device" : "profile"} />;
}
