import {
  type CustomVariant,
  canonicalSectionIndex,
  cloneResumeAsNew,
  convertCustomSection,
  createCustomSection,
  isReorderableSection,
  type Resume,
  type ResumeIndexEntry,
  updateSectionById,
  updateSections,
} from "@lanjut/resume";
import {
  deleteResume as dbDeleteResume,
  getActiveProfileId,
  getResume,
  listResumeIndex,
  putLeftovers,
  putResume,
  setLastOpenedResumeId,
} from "@lanjut/resume/db";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { create } from "zustand";
import { buildNewResume, type CreateResumeOptions } from "./new-resume";
import {
  flushOpenResumePersist,
  scheduleOpenResumePersist,
  setOpenResumeGetter,
} from "./persistence";
import { useSaveStatusStore } from "./save-status-store";

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
  /** Bumped whenever a document's import leftovers change, so views re-read them. */
  leftoversVersion: number;
  /**
   * Bumped on every undo and redo. The section forms own their values (RHF
   * writes into the store, never the reverse), so a rewind only reaches a
   * mounted form by remounting it: the accordion keys on this counter the same
   * way it already keys on the open document's id.
   */
  undoEpoch: number;
  canUndo: boolean;
  canRedo: boolean;

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
  /**
   * Write imported documents as they are (ids and edit times included) and
   * add them to the index. A pending save of the open document lands first,
   * and an open document the import replaces reloads, so neither overwrites
   * the other.
   */
  importResumes: (resumes: ReadonlyArray<Resume>) => Promise<void>;
  /**
   * Move résumés to another profile. Organization only: the edit time stays,
   * so the library order does not change.
   */
  moveToProfile: (
    ids: ReadonlyArray<string>,
    profileId: string,
  ) => Promise<void>;
  openResume: (id: string) => Promise<void>;
  /** Apply an edit to the open document; schedules a debounced persist. */
  updateOpen: (update: (resume: Resume) => Resume) => void;
  /** Rewind the open document one undo step; no-op when the history is empty. */
  undo: () => void;
  /** Reapply the last undone step; no-op when nothing was undone. */
  redo: () => void;
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
   * Toggle a section's presentation-only visibility. Hidden sections keep
   * their content and slot in the list; they are only omitted from the
   * preview and exports.
   */
  toggleSectionVisibility: (id: string) => void;
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

const UNDO_LIMIT = 100;
/**
 * Edits landing within this window join the previous undo step. Form writes
 * arrive once per keystroke and slider drags once per tick, so without
 * coalescing a single word would cost a dozen undo presses.
 */
const UNDO_GROUP_MS = 600;

// The stacks hold previous `open` snapshots by reference. Updates are pure and
// return a new document, so a snapshot never changes after it is taken. Kept at
// module level so a new step does not re-render subscribers; `canUndo` and
// `canRedo` mirror the stack heads into reactive state.
let undoPast: ReadonlyArray<Resume> = [];
let undoFuture: ReadonlyArray<Resume> = [];
let undoGroupUntil = 0;

function resetUndoHistory(): void {
  undoPast = [];
  undoFuture = [];
  undoGroupUntil = 0;
}

function toIndexEntry(resume: Resume): ResumeIndexEntry {
  return {
    id: resume.id,
    title: resume.title,
    updatedAt: resume.updatedAt,
    profileId: resume.profileId,
  };
}

/** Data-last: moves a résumé or an index entry listed in `ids` to the profile. */
function withProfileId<T extends { id: string; profileId?: string }>(
  ids: ReadonlyArray<string>,
  profileId: string,
): (item: T) => T {
  return (item) => {
    if (!A.includes(ids, item.id)) return item;
    return { ...item, profileId };
  };
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
  undoEpoch: 0,
  canUndo: false,
  canRedo: false,

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
    // A résumé made without a profile (the landing page) joins the active one.
    const profileId =
      options?.profile?.id ?? (await getActiveProfileId()) ?? undefined;
    const resume = {
      ...buildNewResume(S.trim(title), options),
      profileId,
    };
    await putResume(resume);
    if (options?.source === "import" && options.imported) {
      await putLeftovers(resume.id, options.imported.leftovers);
      set((state) => ({ leftoversVersion: state.leftoversVersion + 1 }));
    }
    await setLastOpenedResumeId(resume.id);
    resetUndoHistory();
    set((state) => ({
      index: syncIndexEntry(state.index, resume),
      open: resume,
      openStatus: "ready",
      canUndo: false,
      canRedo: false,
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
    if (current?.id === id) resetUndoHistory();
    set((state) => {
      const isOpen = state.open?.id === id;
      return {
        index: A.reject(state.index, (item) => item.id === id),
        open: isOpen ? null : state.open,
        openStatus: isOpen ? "idle" : state.openStatus,
        canUndo: isOpen ? false : state.canUndo,
        canRedo: isOpen ? false : state.canRedo,
      };
    });
    await dbDeleteResume(id);
    return removed;
  },

  async restoreResume(resume) {
    await putResume(resume);
    set((state) => ({ index: syncIndexEntry(state.index, resume) }));
  },

  async importResumes(resumes) {
    await flushOpenResumePersist();
    await Promise.all(A.map(resumes, putResume));
    const reopened = A.find(resumes, (resume) => resume.id === get().open?.id);
    if (O.isSome(reopened)) resetUndoHistory();
    set((state) => ({
      index: A.reduce(resumes, state.index, syncIndexEntry),
      ...(O.isSome(reopened) && {
        open: reopened,
        canUndo: false,
        canRedo: false,
      }),
    }));
  },

  async moveToProfile(ids, profileId) {
    const move = withProfileId<Resume>(ids, profileId);
    const open = get().open;
    await Promise.all(
      A.map(ids, async (id) => {
        const source = open?.id === id ? open : await getResume(id);
        if (source) await putResume(move(source));
      }),
    );
    // Undo snapshots of the open document follow it, so a rewind never
    // carries it back to the old profile.
    undoPast = A.map(undoPast, move);
    undoFuture = A.map(undoFuture, move);
    set((state) => ({
      index: A.map(state.index, withProfileId(ids, profileId)),
      open: state.open ? move(state.open) : state.open,
    }));
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
    resetUndoHistory();
    set({ open: resume, openStatus: "ready", canUndo: false, canRedo: false });
    useSaveStatusStore.getState().setStatus("saved");
  },

  updateOpen(update) {
    const current = get().open;
    if (!current) return;
    const updated = update(current);
    if (updated === current) return;
    const next = { ...updated, updatedAt: new Date().toISOString() };
    const now = Date.now();
    if (now > undoGroupUntil) {
      undoPast = A.sliceToEnd(A.append(undoPast, current), -UNDO_LIMIT);
    }
    undoGroupUntil = now + UNDO_GROUP_MS;
    undoFuture = [];
    set((state) => ({
      open: next,
      index: syncIndexEntry(state.index, next),
      canUndo: true,
      canRedo: false,
    }));
    scheduleOpenResumePersist();
  },

  undo() {
    const current = get().open;
    const previous = A.last(undoPast);
    if (!current || O.isNone(previous)) return;
    undoPast = A.initOrEmpty(undoPast);
    undoFuture = A.append(undoFuture, current);
    undoGroupUntil = 0;
    const restored = { ...previous, updatedAt: new Date().toISOString() };
    set((state) => ({
      open: restored,
      index: syncIndexEntry(state.index, restored),
      undoEpoch: state.undoEpoch + 1,
      canUndo: A.isNotEmpty(undoPast),
      canRedo: true,
    }));
    scheduleOpenResumePersist();
  },

  redo() {
    const current = get().open;
    const next = A.last(undoFuture);
    if (!current || O.isNone(next)) return;
    undoFuture = A.initOrEmpty(undoFuture);
    undoPast = A.append(undoPast, current);
    undoGroupUntil = 0;
    const restored = { ...next, updatedAt: new Date().toISOString() };
    set((state) => ({
      open: restored,
      index: syncIndexEntry(state.index, restored),
      undoEpoch: state.undoEpoch + 1,
      canUndo: true,
      canRedo: A.isNotEmpty(undoFuture),
    }));
    scheduleOpenResumePersist();
  },

  reorderSections(from, to) {
    get().updateOpen((resume) => {
      // Indices address the reorderable subset; map them onto absolute positions
      // in `sections` so pinned sections (Summary) keep their slots untouched.
      const sections = resume.sections;
      const slots = A.reduceWithIndex(
        sections,
        [] as ReadonlyArray<number>,
        (acc, section, index) =>
          isReorderableSection(section.type) ? A.append(acc, index) : acc,
      );
      if (
        from < 0 ||
        to < 0 ||
        from >= A.length(slots) ||
        to >= A.length(slots) ||
        from === to
      ) {
        return resume;
      }
      const moving = pipe(
        A.get(slots, from),
        O.flatMap((slot) => A.get(sections, slot)),
      );
      if (O.isNone(moving)) return resume;
      const reordered = pipe(
        slots,
        A.filterMap((slot) => A.get(sections, slot)),
        A.removeAt(from),
        A.insertAt(to, moving),
      );
      return updateSections(
        resume,
        A.mapWithIndex((index, section) =>
          pipe(
            A.getIndexBy(slots, (slot) => slot === index),
            O.flatMap((position) => A.get(reordered, position)),
            O.getWithDefault(section),
          ),
        ),
      );
    });
  },

  resetSectionOrder() {
    // Stable sort by canonical index; unknown types keep their relative order
    // at the end. Pinned sections already sort to their fixed slots.
    get().updateOpen((resume) =>
      updateSections(
        resume,
        A.sort(
          (a, b) =>
            canonicalSectionIndex(a.type) - canonicalSectionIndex(b.type),
        ),
      ),
    );
  },

  addCustomSection(title) {
    const section = createCustomSection("rich", title);
    get().updateOpen((resume) => updateSections(resume, A.append(section)));
    return section.id;
  },

  renameCustomSection(id, title) {
    get().updateOpen((resume) =>
      updateSections(
        resume,
        updateSectionById(id, (section) => {
          if (section.type !== "custom") return section;
          return { ...section, title };
        }),
      ),
    );
  },

  removeCustomSection(id) {
    get().updateOpen((resume) =>
      updateSections(
        resume,
        A.reject((section) => section.id === id && section.type === "custom"),
      ),
    );
  },

  setCustomVariant(id, variant) {
    get().updateOpen((resume) =>
      updateSections(
        resume,
        updateSectionById(id, (section) => {
          if (section.type !== "custom") return section;
          return convertCustomSection(section, variant);
        }),
      ),
    );
  },

  toggleSectionVisibility(id) {
    get().updateOpen((resume) =>
      updateSections(
        resume,
        updateSectionById(id, (section) => ({
          ...section,
          hidden: !section.hidden,
        })),
      ),
    );
  },

  replaceOpenWithImport(imported) {
    const current = get().open;
    if (!current) return;
    get().updateOpen((resume) => ({
      ...resume,
      header: imported.resume.header,
      sections: imported.resume.sections,
    }));
    void putLeftovers(current.id, imported.leftovers);
    set((state) => ({ leftoversVersion: state.leftoversVersion + 1 }));
  },

  flush() {
    return flushOpenResumePersist();
  },
}));

setOpenResumeGetter(() => useResumeStore.getState().open);
