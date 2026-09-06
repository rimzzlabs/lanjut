"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { DONATION_LINKS } from "@/lib/site";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function PlatformSidebarSupport() {
  const t = useTranslations("platform.sidebar");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("support")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <a href={DONATION_LINKS.saweria} target="_blank" rel="noreferrer">
                <Image
                  src="/brands/saweria.png"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
                Saweria
              </a>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <a
                href={DONATION_LINKS.sociabuzz}
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src="/brands/sociabuzz.png"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
                SociaBuzz
              </a>
            }
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
