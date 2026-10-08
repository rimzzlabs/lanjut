import { A, O, S } from "@mobily/ts-belt";
import { useHydrateProfiles } from "@/hooks/use-hydrate-profiles";
import { useHydrateResumeLibrary } from "@/hooks/use-hydrate-resume-library";
import {
  useProfileLibraryReady,
  useProfileResumes,
} from "@/hooks/use-profile-resumes";
import { useResumeSearchQuery } from "@/hooks/use-resume-search";
import { useResumeStore } from "@/lib/store";
import { PlatformLibraryContinue } from "./platform-library-continue";
import { PlatformLibraryContributors } from "./platform-library-contributors";
import { PlatformLibraryEmpty } from "./platform-library-empty";
import { PlatformLibrarySkeleton } from "./platform-library-skeleton";
import { PlatformLibraryStart } from "./platform-library-start/platform-library-start";
import { PlatformResumeCollection } from "./platform-resume-collection";
import { PlatformResumeGridError } from "./platform-resume-grid/platform-resume-grid-error";

/**
 * The library body for the active profile. A search shows only the matches.
 * Otherwise the résumé edited last leads, then the ways to start, then the
 * people who build Lanjut, then every résumé of the profile when there is
 * more than one.
 */
export function PlatformLibrary() {
  useHydrateResumeLibrary();
  useHydrateProfiles();
  const ready = useProfileLibraryReady();
  const indexStatus = useResumeStore((state) => state.indexStatus);
  const resumes = useProfileResumes();
  const [query] = useResumeSearchQuery();
  const latest = A.head(resumes);

  if (indexStatus === "error") return <PlatformResumeGridError />;
  if (!ready) return <PlatformLibrarySkeleton />;

  if (O.isNone(latest)) {
    return (
      <>
        <PlatformLibraryEmpty />
        <PlatformLibraryContributors />
      </>
    );
  }

  if (S.isNotEmpty(S.trim(query))) {
    return <PlatformResumeCollection index={resumes} query={query} />;
  }

  return (
    <>
      <PlatformLibraryContinue resume={latest} />
      <PlatformLibraryStart />
      <PlatformLibraryContributors />
      {A.length(resumes) > 1 && (
        <PlatformResumeCollection index={resumes} query={query} />
      )}
    </>
  );
}
