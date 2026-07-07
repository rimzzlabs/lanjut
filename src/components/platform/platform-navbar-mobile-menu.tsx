"use client";

import {
  Contrast,
  Download,
  Languages,
  Laptop2,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { routing } from "@/i18n/routing";
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
  const t = useTranslations("platform");
  const tl = useTranslations("language");
  const { theme, setTheme } = useTheme();
  const { locale, switchLocale } = useLocaleSwitch();
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
        <span className="sr-only">{t("menu.label")}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("menu.label")}</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Contrast />
              {t("theme.appearance")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {t("theme.chooseAppearance")}
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={theme ?? ""}
                    onValueChange={onChangeTheme}
                  >
                    <DropdownMenuRadioItem value="system">
                      <Laptop2 /> {t("theme.system")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">
                      <Sun /> {t("theme.light")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon /> {t("theme.dark")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages />
              {tl("label")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{tl("label")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={switchLocale}
                  >
                    {routing.locales.map((loc) => (
                      <DropdownMenuRadioItem key={loc} value={loc}>
                        {tl(loc)}
                      </DropdownMenuRadioItem>
                    ))}
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
                <Download /> {t("menu.downloadResume")}
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
