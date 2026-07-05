"use client";

import { Contrast, Download, Laptop2, Menu, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useResumeStore } from "@/lib/store";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PlatformResumeDownloadDrawer } from "./platform-resume-download-drawer";

export function PlatformNavbarMobileMenu() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const resume = useResumeStore((state) => state.open);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const isEditor = pathname.includes("/editor/");
  const onChangeTheme = (next: string) => setTheme(next);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button size="icon" variant="outline" className="lg:hidden" />}
      >
        <Menu />
        <span className="sr-only">Menu</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Contrast />
              Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Choose Appearance</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={theme ?? ""}
                    onValueChange={onChangeTheme}
                  >
                    <DropdownMenuRadioItem value="system">
                      <Laptop2 /> System
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">
                      <Sun /> Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon /> Dark
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {isEditor && (
            <>
              <DropdownMenuSeparator className="md:hidden" />

              <DropdownMenuItem
                className="md:hidden"
                disabled={!resume}
                onClick={() => setDownloadOpen(true)}
              >
                <Download /> Download Résumé
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>

      <PlatformResumeDownloadDrawer
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
      />
    </DropdownMenu>
  );
}
