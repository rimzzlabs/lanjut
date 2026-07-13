"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren, useEffect } from "react";
import { registerResumeFlushListeners } from "@/lib/store";
import { Toaster } from "../ui/sonner";
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
        <ProgressProvider
          height="2px"
          color="var(--primary)"
          options={{ showSpinner: false }}
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ProgressProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
