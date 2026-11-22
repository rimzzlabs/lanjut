import { R } from "@mobily/ts-belt";
import type { z } from "zod";
import {
  createResumeArgs,
  duplicateResumeArgs,
  editResumeArgs,
  exportResumeArgs,
  getResumeArgs,
  parseArgs,
  profileIdArgs,
  replaceResumeArgs,
  resumeIdArgs,
  resumeSettingsArgs,
  saveProfileArgs,
  sectionOrderArgs,
  setPhotoArgs,
} from "./assistant-args";
import { findResume, listResumes } from "./assistant-library";
import {
  listProfiles,
  moveResumeToProfile,
  saveProfile,
  switchProfile,
} from "./assistant-profiles";
import { getResumeText } from "./assistant-read";
import {
  createResume,
  deleteResume,
  duplicateResume,
  exportResume,
} from "./assistant-resumes";
import {
  setPhoto,
  setSectionOrder,
  updateResumeSettings,
} from "./assistant-settings";
import { type AssistantWindow, showResume } from "./assistant-window";
import { editResume, replaceResume } from "./assistant-write";

type ToolResult = R.Result<unknown, string>;

async function openResume(
  id: string,
  win: AssistantWindow,
): Promise<ToolResult> {
  const found = await findResume(id);
  if (R.isError(found)) return found;
  return R.map(await showResume(id, win), (resume) => ({
    id: resume.id,
    title: resume.title,
  }));
}

/** The settings first, then the move: a résumé in another profile is out of reach. */
async function settingsThenMove(
  args: z.infer<typeof resumeSettingsArgs>,
  win: AssistantWindow,
): Promise<ToolResult> {
  const written = await updateResumeSettings(args, win);
  if (R.isError(written) || args.profile_id === undefined) return written;
  const moved = await moveResumeToProfile(args.id, args.profile_id);
  if (R.isError(moved)) return moved;
  return R.map(written, (result) => ({
    ...result,
    profileId: args.profile_id,
    note: "The résumé is in another profile now. Call lanjut_switch_profile to reach it again.",
  }));
}

function withArgs<S extends z.ZodType>(
  schema: S,
  args: unknown,
  run: (parsed: z.infer<S>) => Promise<ToolResult>,
): Promise<ToolResult> {
  return R.match(parseArgs(schema, args), run, (message) =>
    Promise.resolve(R.makeError<unknown, string>(message)),
  );
}

type Tool = (args: unknown, win: AssistantWindow) => Promise<ToolResult>;

const TOOLS: Readonly<Record<string, Tool>> = {
  lanjut_list_resumes: () => listResumes(),
  lanjut_get_resume: (args) =>
    withArgs(getResumeArgs, args, (parsed) => getResumeText(parsed)),
  lanjut_edit_resume: (args, win) =>
    withArgs(editResumeArgs, args, (parsed) =>
      editResume(
        {
          id: parsed.id,
          baseRevision: parsed.base_revision,
          edits: parsed.edits,
        },
        win,
      ),
    ),
  lanjut_replace_resume: (args, win) =>
    withArgs(replaceResumeArgs, args, (parsed) =>
      replaceResume(
        {
          id: parsed.id,
          baseRevision: parsed.base_revision,
          markdown: parsed.markdown,
        },
        win,
      ),
    ),
  lanjut_open_resume: (args, win) =>
    withArgs(resumeIdArgs, args, (parsed) => openResume(parsed.id, win)),
  lanjut_create_resume: (args, win) =>
    withArgs(createResumeArgs, args, (parsed) => createResume(parsed, win)),
  lanjut_duplicate_resume: (args, win) =>
    withArgs(duplicateResumeArgs, args, (parsed) =>
      duplicateResume(parsed, win),
    ),
  lanjut_delete_resume: (args) =>
    withArgs(resumeIdArgs, args, (parsed) => deleteResume(parsed)),
  lanjut_update_resume_settings: (args, win) =>
    withArgs(resumeSettingsArgs, args, (parsed) =>
      settingsThenMove(parsed, win),
    ),
  lanjut_set_section_order: (args, win) =>
    withArgs(sectionOrderArgs, args, (parsed) => setSectionOrder(parsed, win)),
  lanjut_set_photo: (args, win) =>
    withArgs(setPhotoArgs, args, (parsed) => setPhoto(parsed, win)),
  lanjut_export_resume: (args) =>
    withArgs(exportResumeArgs, args, (parsed) => exportResume(parsed)),
  lanjut_list_profiles: () => listProfiles(),
  lanjut_switch_profile: (args) =>
    withArgs(profileIdArgs, args, (parsed) => switchProfile(parsed)),
  lanjut_save_profile: (args, win) =>
    withArgs(saveProfileArgs, args, (parsed) => saveProfile(parsed, win)),
};

interface AssistantCall {
  tool: string;
  args: unknown;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Runs one tool call from the desktop MCP server. The error is for the model. */
export async function runAssistantTool(
  call: AssistantCall,
  win: AssistantWindow,
): Promise<ToolResult> {
  const tool = Object.hasOwn(TOOLS, call.tool) ? TOOLS[call.tool] : undefined;
  if (!tool) return R.makeError(`Lanjut does not know the tool ${call.tool}.`);
  try {
    return await tool(call.args, win);
  } catch (error) {
    return R.makeError(
      `Lanjut failed to run ${call.tool}: ${errorText(error)}`,
    );
  }
}
