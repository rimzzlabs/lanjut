import { A, pipe, S } from "@mobily/ts-belt";
import { nanoid } from "nanoid";
import { create } from "zustand";
import {
  deleteResume as dbDeleteResume,
  getResume,
  listResumeIndex,
  putLeftovers,
  putResume,
  setLastOpenedResumeId,
} from "@/lib/db";
import {
  type CustomVariant,
  canonicalSectionIndex,
  cloneResumeAsNew,
  convertCustomSection,
  createCustomSection,
  createEmptyResume,
  isReorderableSection,
  type Resume,
  type ResumeIndexEntry,
  type ResumeLanguage,
  SEED_RESUME,
} from "@/lib/resume";
import {
  flushOpenResumePersist,
  scheduleOpenResumePersist,
  setOpenResumeGetter,
} from "./persistence";

type IndexStatus = "idle" | "loading" | "ready" | "error";
type OpenStatus = "idle" | "loading" | "ready" | "missing";

interface CreateResumeOptions {
  templateId?: string;
  /**
   * Where the starting content comes from: the sample fixture (default), a blank
   * document, or a parsed PDF import. When `import`, `imported` carries the
   * already-parsed document and its leftovers.
   */
  source?: "sample" | "empty" | "import";
  imported?: { resume: Resume; leftovers: string[] };
  /** Document label language; defaults to English when omitted. */
  language?: ResumeLanguage;
}

interface ResumeStoreState {
  /** The lightweight Library list, newest first. Not the full document bodies. */
  index: readonly ResumeIndexEntry[];
  indexStatus: IndexStatus;
  /** Documents that failed migration (see ResumeIndexResult). Still on disk. */
  unreadableCount: number;
  /** The single fully-hydrated open document, or null when none is open. */
  open: Resume | null;
  openStatus: OpenStatus;
  /** Bumped whenever a document's import leftovers change, so views re-read them. */
  leftoversVersion: number;

  hydrateIndex: () => Promise<void>;
  createResume: (
    title: string,
    options?: CreateResumeOptions,
  ) => Promise<Resume>;
  renameResume: (id: string, title: string) => Promise<void>;
  duplicateResume: (id: string, title: string) => Promise<Resume | undefined>;
  /** Delete a résumé from disk and index; returns the removed document for undo. */
  removeResume: (id: string) => Promise<Resume | undefined>;
  /** Re-insert a removed document (undo), writing it back to disk. */
  restoreResume: (resume: Resume) => Promise<void>;
  openResume: (id: string) => Promise<void>;
  /** Apply an edit to the open document; schedules a debounced persist. */
  updateOpen: (recipe: (draft: Resume) => void) => void;
  /**
   * Move a reorderable section from one position to another. Indices are into the
   * reorderable subset (Summary and the Header are pinned and excluded); pinned
   * sections keep their slots.
   */
  reorderSections: (from: number, to: number) => void;
  /** Restore sections to the canonical reading order (the default). */
  resetSectionOrder: () => void;
  /** Append a new custom section (rich variant) with the given title; returns its id. */
  addCustomSection: (title: string) => string;
  /** Rename a custom section by id; no-op for a core or missing section. */
  renameCustomSection: (id: string, title: string) => void;
  /** Remove a custom section by id; no-op for a core or missing section. */
  removeCustomSection: (id: string) => void;
  /** Switch a custom section's variant, converting its content across. */
  setCustomVariant: (id: string, variant: CustomVariant) => void;
  /**
   * Overwrite the open document's content (header + sections) with a parsed PDF
   * import, keeping its id, title, template, and language, and store the import's
   * leftovers against it. For importing into an existing document in place.
   */
  replaceOpenWithImport: (imported: {
    resume: Resume;
    leftovers: string[];
  }) => void;
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
  leftoversVersion: 0,

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

  async createResume(title, options) {
    const trimmed = S.trim(title);
    let resume: Resume;
    if (options?.source === "import" && options.imported) {
      // The imported document is already parsed; adopt it, retitle it, and give
      // it a fresh id so it never collides with the fixture's placeholder ids.
      resume = { ...options.imported.resume, id: nanoid(), title: trimmed };
    } else if (options?.source === "empty") {
      resume = createEmptyResume(trimmed);
    } else {
      resume = cloneResumeAsNew(SEED_RESUME, trimmed);
    }
    if (options?.templateId) resume.templateId = options.templateId;
    if (options?.language) resume.language = options.language;
    await putResume(resume);
    if (options?.source === "import" && options.imported) {
      await putLeftovers(resume.id, options.imported.leftovers);
      set((state) => ({ leftoversVersion: state.leftoversVersion + 1 }));
    }
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

  async duplicateResume(id, title) {
    const current = get().open;
    const source = current?.id === id ? current : await getResume(id);
    if (!source) return undefined;
    const copy = cloneResumeAsNew(source, title);
    await putResume(copy);
    set((state) => ({ index: syncIndexEntry(state.index, copy) }));
    return copy;
  },

  async removeResume(id) {
    const current = get().open;
    const removed = current?.id === id ? current : await getResume(id);
    set((state) => {
      const isOpen = state.open?.id === id;
      return {
        index: A.reject(state.index, (item) => item.id === id),
        open: isOpen ? null : state.open,
        openStatus: isOpen ? "idle" : state.openStatus,
      };
    });
    await dbDeleteResume(id);
    return removed;
  },

  async restoreResume(resume) {
    await putResume(resume);
    set((state) => ({ index: syncIndexEntry(state.index, resume) }));
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

  reorderSections(from, to) {
    get().updateOpen((draft) => {
      // Indices address the reorderable subset; map them onto absolute positions
      // in `sections` so pinned sections (Summary) keep their slots untouched.
      const slots = draft.sections.reduce<number[]>((acc, section, index) => {
        if (isReorderableSection(section.type)) acc.push(index);
        return acc;
      }, []);
      if (
        from < 0 ||
        to < 0 ||
        from >= slots.length ||
        to >= slots.length ||
        from === to
      ) {
        return;
      }
      const moving = draft.sections[slots[from]];
      const reordered = slots.map((slot) => draft.sections[slot]);
      reordered.splice(from, 1);
      reordered.splice(to, 0, moving);
      slots.forEach((slot, index) => {
        draft.sections[slot] = reordered[index];
      });
    });
  },

  resetSectionOrder() {
    get().updateOpen((draft) => {
      // Stable sort by canonical index; unknown types keep their relative order
      // at the end. Pinned sections already sort to their fixed slots.
      draft.sections.sort(
        (a, b) => canonicalSectionIndex(a.type) - canonicalSectionIndex(b.type),
      );
    });
  },

  addCustomSection(title) {
    const section = createCustomSection("rich", title);
    get().updateOpen((draft) => {
      draft.sections.push(section);
    });
    return section.id;
  },

  renameCustomSection(id, title) {
    get().updateOpen((draft) => {
      const section = draft.sections.find(
        (s) => s.id === id && s.type === "custom",
      );
      if (section) section.title = title;
    });
  },

  removeCustomSection(id) {
    get().updateOpen((draft) => {
      const index = draft.sections.findIndex(
        (section) => section.id === id && section.type === "custom",
      );
      if (index !== -1) draft.sections.splice(index, 1);
    });
  },

  setCustomVariant(id, variant) {
    get().updateOpen((draft) => {
      const index = draft.sections.findIndex(
        (section) => section.id === id && section.type === "custom",
      );
      if (index === -1) return;
      draft.sections[index] = convertCustomSection(
        draft.sections[index],
        variant,
      );
    });
  },

  replaceOpenWithImport(imported) {
    const current = get().open;
    if (!current) return;
    get().updateOpen((draft) => {
      draft.header = structuredClone(imported.resume.header);
      draft.sections = structuredClone(imported.resume.sections);
    });
    void putLeftovers(current.id, imported.leftovers);
    set((state) => ({ leftoversVersion: state.leftoversVersion + 1 }));
  },

  flush() {
    return flushOpenResumePersist();
  },
}));

setOpenResumeGetter(() => useResumeStore.getState().open);
