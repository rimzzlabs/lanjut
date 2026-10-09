import { create } from "zustand";

export type ProfileSettingsSection = "profile" | "preferences" | "new";

interface ProfileSettingsStoreState {
  open: boolean;
  section: ProfileSettingsSection;
  /** Open the settings surface on one section. */
  openAt: (section: ProfileSettingsSection) => void;
  setOpen: (open: boolean) => void;
}

/** Which part of the profile settings shows, so any menu can open it. */
export const useProfileSettingsStore = create<ProfileSettingsStoreState>()(
  (set) => ({
    open: false,
    section: "profile",
    openAt: (section) => set({ open: true, section }),
    setOpen: (open) => set({ open }),
  }),
);
