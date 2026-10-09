import {
  createGuestProfile,
  GUEST_PROFILE_ID,
  type Profile,
  resolveResumeProfileId,
} from "@lanjut/resume";
import {
  deleteProfile,
  getActiveProfileId,
  listProfiles,
  putProfile,
  setActiveProfileId,
} from "@lanjut/resume/db";
import { A, O, pipe } from "@mobily/ts-belt";
import { create } from "zustand";
import { useResumeStore } from "./resume-store";

type ProfileStatus = "idle" | "loading" | "ready" | "error";

interface ProfileStoreState {
  /** Saved profiles, oldest first. Holds the unsaved guest when none is saved. */
  profiles: ReadonlyArray<Profile>;
  activeId: string;
  status: ProfileStatus;
  hydrate: () => Promise<void>;
  /**
   * Save a new profile and make it the active one. The guest is saved with
   * it, so the résumés it holds keep a profile of their own.
   */
  addProfile: (profile: Profile) => Promise<void>;
  /** Save changes to a profile, the unsaved guest included. */
  saveProfile: (profile: Profile) => Promise<void>;
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
    await Promise.all(A.map(guest, putProfile));
    await putProfile(profile);
    await setActiveProfileId(profile.id);
    set((state) => ({
      profiles: upsert(state.profiles, profile),
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
    await Promise.all(A.map(guest, putProfile));
    if (!keepLocal) await putProfile(profile);
    await setActiveProfileId(profile.id);
    set((state) => ({
      profiles: keepLocal ? state.profiles : upsert(state.profiles, profile),
      activeId: profile.id,
    }));
  },

  async saveProfile(profile) {
    const next = { ...profile, updatedAt: new Date().toISOString() };
    await putProfile(next);
    set((state) => ({ profiles: upsert(state.profiles, next) }));
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
