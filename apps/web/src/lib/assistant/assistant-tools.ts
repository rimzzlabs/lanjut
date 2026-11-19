import { resolveResumeProfileId } from "@lanjut/resume";
import { A, pipe, R } from "@mobily/ts-belt";
import {
  selectActiveProfile,
  useProfileStore,
  useResumeStore,
} from "@/lib/store";

/** What `lanjut_list_resumes` gives the assistant. No résumé text. */
interface ResumeList {
  profile: { id: string; name: string };
  resumes: ReadonlyArray<{ id: string; title: string; updatedAt: string }>;
}

const UNREADABLE = "Lanjut could not read its storage. Restart Lanjut.";

/** The window can be on any page, so the library may not be loaded yet. */
async function readyLibrary(): Promise<boolean> {
  const profiles = useProfileStore.getState();
  const resumes = useResumeStore.getState();
  await Promise.all([
    profiles.status === "ready" ? undefined : profiles.hydrate(),
    resumes.indexStatus === "ready" ? undefined : resumes.hydrateIndex(),
  ]);
  return useResumeStore.getState().indexStatus === "ready";
}

async function listResumes(): Promise<R.Result<ResumeList, string>> {
  if (!(await readyLibrary())) return R.makeError(UNREADABLE);
  const profileState = useProfileStore.getState();
  const active = selectActiveProfile(profileState);
  return R.makeOk({
    profile: { id: active.id, name: active.name },
    resumes: pipe(
      useResumeStore.getState().index,
      A.filter(
        (entry) =>
          resolveResumeProfileId(entry.profileId, profileState.profiles) ===
          active.id,
      ),
      A.map((entry) => ({
        id: entry.id,
        title: entry.title,
        updatedAt: entry.updatedAt,
      })),
    ),
  });
}

/** Runs one tool call from the desktop MCP server. The error is for the model. */
export async function runAssistantTool(
  tool: string,
): Promise<R.Result<unknown, string>> {
  if (tool === "lanjut_list_resumes") return listResumes();
  return R.makeError(`Lanjut does not know the tool ${tool}.`);
}
