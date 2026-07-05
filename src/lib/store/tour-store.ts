import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourStoreState {
  seen: Record<string, boolean>;
  markSeen: (tour: string) => void;
  hasSeen: (tour: string) => boolean;
}

export const useTourStore = create<TourStoreState>()(
  persist(
    (set, get) => ({
      seen: {},
      markSeen: (tour) =>
        set((state) => ({ seen: { ...state.seen, [tour]: true } })),
      hasSeen: (tour) => get().seen[tour] === true,
    }),
    { name: "lanjut:tour-seen" },
  ),
);
