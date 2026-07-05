import { A, pipe, S } from "@mobily/ts-belt";
import { create } from "zustand";
import {
  deleteResume as dbDeleteResume,
  getResume,
  listResumeIndex,
  putResume,
  setLastOpenedResumeId,
} from "@/lib/db";
import {
  cloneResumeAsNew,
  type Resume,
  type ResumeIndexEntry,
  SEED_RESUME,
} from "@/lib/resume";
import {
  flushOpenResumePersist,
  scheduleOpenResumePersist,
  setOpenResumeGetter,
} from "./persistence";

type IndexStatus = "idle" | "loading" | "ready" | "error";
type OpenStatus = "idle" | "loading" | "ready" | "missing";

interface ResumeStoreState {
  /** The lightweight Library list, newest first. Not the full document bodies. */
  index: readonly ResumeIndexEntry[];
  indexStatus: IndexStatus;
  /** Documents that failed migration (see ResumeIndexResult). Still on disk. */
  unreadableCount: number;
  /** The single fully-hydrated open document, or null when none is open. */
  open: Resume | null;
  openStatus: OpenStatus;

  hydrateIndex: () => Promise<void>;
  createResume: (title: string, templateId?: string) => Promise<Resume>;
  renameResume: (id: string, title: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<Resume | undefined>;
  removeResume: (id: string) => Promise<void>;
  openResume: (id: string) => Promise<void>;
  /** Apply an edit to the open document; schedules a debounced persist. */
  updateOpen: (recipe: (draft: Resume) => void) => void;
  /** Force any pending write to commit now (e.g. before navigating away). */
  flush: () => Promise<void>;
}

function toIndexEntry(resume: Resume): ResumeIndexEntry {
  return { id: resume.id, title: resume.title, updatedAt: resume.updatedAt };
}

/** Upsert the given Resume's projection into the index, keeping newest-first order. */
function syncIndexEntry(
  index: readonly ResumeIndexEntry[],
  resume: Resume,
): readonly ResumeIndexEntry[] {
  return pipe(
    index,
    A.reject((item) => item.id === resume.id),
    A.prepend(toIndexEntry(resume)),
    A.sortBy((entry) => entry.updatedAt),
    A.reverse,
  );
}

export const useResumeStore = create<ResumeStoreState>()((set, get) => ({
  index: [],
  indexStatus: "idle",
  unreadableCount: 0,
  open: null,
  openStatus: "idle",

  async hydrateIndex() {
    set({ indexStatus: "loading" });
    try {
      const result = await listResumeIndex();
      set({
        index: result.entries,
        unreadableCount: result.unreadableCount,
        indexStatus: "ready",
      });
    } catch {
      set({ indexStatus: "error" });
    }
  },

  async createResume(title, templateId) {
    const resume = cloneResumeAsNew(SEED_RESUME, S.trim(title));
    if (templateId) resume.templateId = templateId;
    await putResume(resume);
    await setLastOpenedResumeId(resume.id);
    set((state) => ({
      index: syncIndexEntry(state.index, resume),
      open: resume,
      openStatus: "ready",
    }));
    return resume;
  },

  async renameResume(id, title) {
    const current = get().open;
    const source = current?.id === id ? current : await getResume(id);
    if (!source) return;
    const next: Resume = {
      ...source,
      title: S.trim(title),
      updatedAt: new Date().toISOString(),
    };
    await putResume(next);
    set((state) => ({
      index: syncIndexEntry(state.index, next),
      open: state.open?.id === id ? next : state.open,
    }));
  },

  async duplicateResume(id) {
    const current = get().open;
    const source = current?.id === id ? current : await getResume(id);
    if (!source) return undefined;
    const copy = cloneResumeAsNew(source, `${source.title} (copy)`);
    await putResume(copy);
    set((state) => ({ index: syncIndexEntry(state.index, copy) }));
    return copy;
  },

  async removeResume(id) {
    await dbDeleteResume(id);
    set((state) => {
      const isOpen = state.open?.id === id;
      return {
        index: A.reject(state.index, (item) => item.id === id),
        open: isOpen ? null : state.open,
        openStatus: isOpen ? "idle" : state.openStatus,
      };
    });
  },

  async openResume(id) {
    if (get().open?.id === id) return;
    await flushOpenResumePersist();
    set({ openStatus: "loading" });
    // A document that fails migration reads as missing rather than leaving the
    // editor stuck on "loading"; the raw document stays untouched on disk.
    const resume = await getResume(id).catch(() => undefined);
    if (!resume) {
      set({ open: null, openStatus: "missing" });
      return;
    }
    await setLastOpenedResumeId(id);
    set({ open: resume, openStatus: "ready" });
  },

  updateOpen(recipe) {
    const current = get().open;
    if (!current) return;
    const draft = structuredClone(current);
    recipe(draft);
    draft.updatedAt = new Date().toISOString();
    set((state) => ({
      open: draft,
      index: syncIndexEntry(state.index, draft),
    }));
    scheduleOpenResumePersist();
  },

  flush() {
    return flushOpenResumePersist();
  },
}));

setOpenResumeGetter(() => useResumeStore.getState().open);
