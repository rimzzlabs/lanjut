import { useReducedMotion } from "motion/react";
import { useMotionStore } from "@/lib/store";

/** The site animation setting, with "system" following the OS. */
export function useReducedMotionPreference() {
  const setting = useMotionStore((state) => state.setting);
  const systemReduce = useReducedMotion();

  if (setting === "system") return systemReduce === true;
  return setting === "off";
}
