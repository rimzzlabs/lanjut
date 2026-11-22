import { R } from "@mobily/ts-belt";
import type { z } from "zod";
import {
  editResumeArgs,
  getResumeArgs,
  parseArgs,
  replaceResumeArgs,
  resumeIdArgs,
} from "./assistant-args";
import { findResume, listResumes } from "./assistant-library";
import { getResumeText } from "./assistant-read";
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
