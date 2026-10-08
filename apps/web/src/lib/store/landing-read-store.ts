import { create } from "zustand";

export interface LandingReadReport {
  lines: ReadonlyArray<string>;
  chars: number;
  nameFound: boolean;
  titleFound: boolean;
  emailFound: boolean;
  orderOk: boolean;
}

export type LandingRead =
  | { status: "idle" }
  | { status: "reading"; key: string; last: LandingReadReport | null }
  | { status: "done"; key: string; report: LandingReadReport }
  | { status: "failed"; key: string };

interface LandingReadState {
  read: LandingRead;
  setRead: (update: (previous: LandingRead) => LandingRead) => void;
}

/** The landing page's latest PDF read-back, shared by every island that cites it. */
export const useLandingReadStore = create<LandingReadState>()((set) => ({
  read: { status: "idle" },
  setRead: (update) => set((state) => ({ read: update(state.read) })),
}));
