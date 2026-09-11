"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { DONATION_LINKS } from "@/lib/site";
import { ExternalLink } from "../shared/external-link";
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
              <ExternalLink href={DONATION_LINKS.saweria}>
                <Image
                  src="/brands/saweria.png"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
                Saweria
              </ExternalLink>
            }
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <ExternalLink href={DONATION_LINKS.sociabuzz}>
                <Image
                  src="/brands/sociabuzz.png"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
                SociaBuzz
              </ExternalLink>
            }
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
