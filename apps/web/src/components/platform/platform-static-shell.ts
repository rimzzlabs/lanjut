import { createContext, useContext } from "react";

export const StaticShellContext = createContext(false);

/**
 * True in the static shell that a page shows until the app mounts. The build
 * reads no storage, so a part that shows saved state must wait for the app.
 */
export function useIsStaticShell(): boolean {
  return useContext(StaticShellContext);
}
