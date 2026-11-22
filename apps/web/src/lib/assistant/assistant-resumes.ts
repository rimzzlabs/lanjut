import type { Resume, ResumeLanguage } from "@lanjut/resume";
import { getResume } from "@lanjut/resume/db";
import { A, R } from "@mobily/ts-belt";
import type { z } from "zod";
import { askToDelete } from "@/lib/store/assistant-request-store";
import { flushOpenResumePersist } from "@/lib/store/persistence";
import {
  selectActiveProfile,
  useProfileStore,
} from "@/lib/store/profile-store";
import { useResumeStore } from "@/lib/store/resume-store";
import type {
  createResumeArgs,
  duplicateResumeArgs,
  exportResumeArgs,
  resumeIdArgs,
} from "./assistant-args";
import { findResume } from "./assistant-library";
import { settingsOptions } from "./assistant-settings";
import {
  type AssistantWindow,
  showResume,
  UNREADABLE_RESUME,
} from "./assistant-window";

type ToolResult = R.Result<unknown, string>;

function pageLanguage(): ResumeLanguage {
  const lang = document.documentElement.lang;
  return lang === "id" || lang === "fr" ? lang : "en";
}

/** The new résumé opens in the editor, so the person sees it. */
async function opened(
  resume: Resume,
  win: AssistantWindow,
): Promise<ToolResult> {
  const shown = await showResume(resume.id, win);
  return R.map(shown, (open) => ({
    id: open.id,
    title: open.title,
    revision: useResumeStore.getState().openRevision,
  }));
}

export async function createResume(
  args: z.infer<typeof createResumeArgs>,
  win: AssistantWindow,
): Promise<ToolResult> {
  const { templates } = settingsOptions();
  if (args.template !== undefined && !A.includes(templates, args.template)) {
    return R.makeError(
      `Lanjut has no template "${args.template}". Use one of: ${A.join(templates, ", ")}.`,
    );
  }
  const resume = await useResumeStore.getState().createResume(args.title, {
    source: args.start === "sample" ? "sample" : "empty",
    templateId: args.template,
    language: pageLanguage(),
    profile: selectActiveProfile(useProfileStore.getState()),
  });
  return opened(resume, win);
}

export async function duplicateResume(
  args: z.infer<typeof duplicateResumeArgs>,
  win: AssistantWindow,
): Promise<ToolResult> {
  const found = await findResume(args.id);
  if (R.isError(found)) return found;
  const entry = R.getExn(found);
  await flushOpenResumePersist();
  const copy = await useResumeStore
    .getState()
    .duplicateResume(args.id, args.title ?? `${entry.title} (copy)`);
  if (!copy) return R.makeError(UNREADABLE_RESUME);
  return opened(copy, win);
}

export async function deleteResume(
  args: z.infer<typeof resumeIdArgs>,
): Promise<ToolResult> {
  const found = await findResume(args.id);
  if (R.isError(found)) return found;
  const entry = R.getExn(found);
  const deleted = await askToDelete({ id: entry.id, title: entry.title });
  if (!deleted) {
    return R.makeError(
      "The person kept the résumé. Lanjut did not delete it. Do not ask again unless the person says so.",
    );
  }
  return R.makeOk({ id: entry.id, title: entry.title, deleted: true });
}

const NOT_SAVED =
  "Lanjut saved no file. Either the person closed the save dialog, or Lanjut could not make the file. Ask the person which one before you try again.";

export async function exportResume(
  args: z.infer<typeof exportResumeArgs>,
): Promise<ToolResult> {
  const found = await findResume(args.id);
  if (R.isError(found)) return found;
  await flushOpenResumePersist();
  const open = useResumeStore.getState().open;
  const resume =
    open?.id === args.id
      ? open
      : await getResume(args.id).catch(() => undefined);
  if (!resume) return R.makeError(UNREADABLE_RESUME);
  const { downloadResume } = await import(
    "@/components/editor/download-resume"
  );
  const saved = await downloadResume({
    resume,
    format: args.format,
    fileName: args.file_name ?? resume.title,
  });
  if (!saved) return R.makeError(NOT_SAVED);
  return R.makeOk({ id: resume.id, format: args.format, saved: true });
}
