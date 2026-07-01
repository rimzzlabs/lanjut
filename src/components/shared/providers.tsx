"use client";

import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren, useEffect } from "react";
import { registerResumeFlushListeners } from "@/lib/store";
import { TooltipProvider } from "../ui/tooltip";

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => registerResumeFlushListeners(), []);

  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        enableColorScheme
        disableTransitionOnChange
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
