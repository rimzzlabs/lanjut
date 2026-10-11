import {
  createGuestProfile,
  createProfile,
  GUEST_PROFILE_ID,
  type Profile,
  resolveResumeProfileId,
} from "@lanjut/resume";
import {
  deleteProfile,
  getActiveProfileId,
  listProfiles,
  putProfile,
  type RevisionError,
  revisionOf,
  setActiveProfileId,
} from "@lanjut/resume/db";
import { A, O, pipe, R } from "@mobily/ts-belt";
import { create } from "zustand";
import { useResumeStore } from "./resume-store";

type ProfileStatus = "idle" | "loading" | "ready" | "error";

/** A save that another window got to first, with this window's version. */
export interface ProfileConflict {
  kind: RevisionError;
  profile: Profile;
}

interface ProfileStoreState {
  /** Saved profiles, oldest first. Holds the unsaved guest when none is saved. */
  profiles: ReadonlyArray<Profile>;
  activeId: string;
  status: ProfileStatus;
  /** Set when a save is refused, until the person picks a version. */
  conflict: ProfileConflict | null;
  hydrate: () => Promise<void>;
  /**
   * Save a new profile and make it the active one. The guest is saved with
   * it, so the résumés it holds keep a profile of their own.
   */
  addProfile: (profile: Profile) => Promise<void>;
  /**
   * Save changes to a profile, the unsaved guest included. Resolves false when
   * another window changed or deleted it first, and sets `conflict`.
   */
  saveProfile: (profile: Profile) => Promise<boolean>;
  /** Drop this window's version and load the stored profiles. */
  keepStoredProfile: () => Promise<void>;
  /** Save this window's version as a new profile named `name`. */
  saveProfileAsCopy: (name: string) => Promise<void>;
  /** Write this window's version back after another window deleted it. */
  restoreProfile: () => Promise<void>;
  /** Drop this window's version of a profile another window deleted. */
  closeDeletedProfile: () => Promise<void>;
  /**
   * Save a profile from a backup file as it is, edit time included, unless
   * this device's copy is kept, then make it the active one. The guest is
   * saved first, as when adding a profile.
   */
  importProfile: (profile: Profile, keepLocal: boolean) => Promise<void>;
  /** Delete a profile after its résumés move to `targetId`. */
  removeProfile: (id: string, targetId: string) => Promise<void>;
  setActive: (id: string) => Promise<void>;
}

const GUEST = createGuestProfile();
const GUEST_ONLY: ReadonlyArray<Profile> = [GUEST];

/** The list never runs empty: with nothing saved, the guest stands in. */
function withGuest(profiles: ReadonlyArray<Profile>): ReadonlyArray<Profile> {
  return A.isEmpty(profiles) ? GUEST_ONLY : profiles;
}

function upsert(
  profiles: ReadonlyArray<Profile>,
  profile: Profile,
): ReadonlyArray<Profile> {
  const exists = A.some(profiles, (item) => item.id === profile.id);
  if (!exists) return A.append(profiles, profile);
  return A.map(profiles, (item) => (item.id === profile.id ? profile : item));
}

function firstId(profiles: ReadonlyArray<Profile>): string {
  return pipe(
    profiles,
    A.head,
    O.mapWithDefault(GUEST_PROFILE_ID, (profile) => profile.id),
  );
}

export const useProfileStore = create<ProfileStoreState>()((set, get) => ({
  profiles: GUEST_ONLY,
  activeId: GUEST_PROFILE_ID,
  status: "idle",
  conflict: null,

  async hydrate() {
    set({ status: "loading" });
    try {
      const [saved, storedActiveId] = await Promise.all([
        listProfiles(),
        getActiveProfileId(),
      ]);
      const profiles = withGuest(saved);
      const known = A.some(profiles, (item) => item.id === storedActiveId);
      set({
        profiles,
        activeId: known && storedActiveId ? storedActiveId : firstId(profiles),
        status: "ready",
      });
    } catch {
      set({ status: "error" });
    }
  },

  async addProfile(profile) {
    const guest = A.filter(
      get().profiles,
      (item) => item.id === GUEST_PROFILE_ID,
    );
    await Promise.all(A.map(guest, (item) => putProfile(item, "replace")));
    const saved = await putProfile(profile, "new");
    const written = R.getWithDefault(saved, profile);
    await setActiveProfileId(profile.id);
    set((state) => ({
      profiles: upsert(state.profiles, written),
      activeId: profile.id,
    }));
  },

  async importProfile(profile, keepLocal) {
    // A résumé with no known profile belongs to the oldest one. An imported
    // profile can be older, so pin those résumés where they show now first.
    const resumes = useResumeStore.getState();
    if (resumes.indexStatus !== "ready") await resumes.hydrateIndex();
    const known = (id: string | undefined) =>
      A.some(get().profiles, (item) => item.id === id);
    const unowned = pipe(
      useResumeStore.getState().index,
      A.reject((entry) => known(entry.profileId)),
      A.map((entry) => entry.id),
    );
    if (!A.isEmpty(unowned)) {
      await useResumeStore
        .getState()
        .moveToProfile(unowned, firstId(get().profiles));
    }
    const guest = A.filter(
      get().profiles,
      (item) => item.id === GUEST_PROFILE_ID && item.id !== profile.id,
    );
    await Promise.all(A.map(guest, (item) => putProfile(item, "replace")));
    if (!keepLocal) {
      const saved = await putProfile(profile, "replace");
      const written = R.getWithDefault(saved, profile);
      set((state) => ({ profiles: upsert(state.profiles, written) }));
    }
    await setActiveProfileId(profile.id);
    set({ activeId: profile.id });
  },

  async saveProfile(profile) {
    const next = { ...profile, updatedAt: new Date().toISOString() };
    // The guest has one fixed id and nothing to conflict with until saved.
    const expected =
      profile.id === GUEST_PROFILE_ID ? "replace" : revisionOf(profile);
    const saved = await putProfile(next, expected);
    return R.match(
      saved,
      (written) => {
        set((state) => ({ profiles: upsert(state.profiles, written) }));
        return true;
      },
      (kind) => {
        set({ conflict: { kind, profile: next } });
        return false;
      },
    );
  },

  async keepStoredProfile() {
    await reloadProfiles();
  },

  async saveProfileAsCopy(name) {
    const conflict = get().conflict;
    if (!conflict) return;
    const copy: Profile = {
      ...createProfile(name),
      header: conflict.profile.header,
      summary: conflict.profile.summary,
    };
    await putProfile(copy, "new");
    await reloadProfiles();
  },

  async restoreProfile() {
    const conflict = get().conflict;
    if (!conflict) return;
    const saved = await putProfile(conflict.profile, "new");
    R.match(
      saved,
      (written) =>
        set((state) => ({
          profiles: upsert(state.profiles, written),
          conflict: null,
        })),
      (kind) => set({ conflict: { ...conflict, kind } }),
    );
  },

  async closeDeletedProfile() {
    await reloadProfiles();
  },

  async removeProfile(id, targetId) {
    if (!selectCanDeleteProfile(get()) || id === targetId) return;
    const resumes = useResumeStore.getState();
    if (resumes.indexStatus !== "ready") await resumes.hydrateIndex();
    const owned = pipe(
      useResumeStore.getState().index,
      A.filter(
        (entry) =>
          resolveResumeProfileId(entry.profileId, get().profiles) === id,
      ),
      A.map((entry) => entry.id),
    );
    await useResumeStore.getState().moveToProfile(owned, targetId);
    await deleteProfile(id);
    const profiles = withGuest(
      A.reject(get().profiles, (item) => item.id === id),
    );
    const activeId = get().activeId === id ? firstId(profiles) : get().activeId;
    await setActiveProfileId(activeId);
    set({ profiles, activeId });
  },

  async setActive(id) {
    set({ activeId: id });
    await setActiveProfileId(id);
  },
}));

/**
 * Reads the stored profiles again after a conflict, quietly: the list keeps
 * showing while it loads, and the active profile stays when it still exists.
 */
async function reloadProfiles(): Promise<void> {
  const profiles = withGuest(await listProfiles());
  const activeId = useProfileStore.getState().activeId;
  const known = A.some(profiles, (item) => item.id === activeId);
  useProfileStore.setState({
    profiles,
    activeId: known ? activeId : firstId(profiles),
    conflict: null,
  });
}

/** The active profile. Falls back to the first, so it is always defined. */
export function selectActiveProfile(state: ProfileStoreState): Profile {
  const active = A.find(
    state.profiles,
    (profile) => profile.id === state.activeId,
  );
  if (O.isSome(active)) return active;
  return pipe(state.profiles, A.head, O.getWithDefault(GUEST));
}

/** The profile with this id, or the active one when the id is unknown. */
export function selectProfile(id: string) {
  return (state: ProfileStoreState): Profile => {
    const found = A.find(state.profiles, (profile) => profile.id === id);
    if (O.isSome(found)) return found;
    return selectActiveProfile(state);
  };
}

/** A lone profile stays: the list must always hold one to fill new résumés. */
export function selectCanDeleteProfile(state: ProfileStoreState): boolean {
  return A.length(state.profiles) > 1;
}
