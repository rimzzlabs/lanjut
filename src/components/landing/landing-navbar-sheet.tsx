import { Layout, LayoutTemplate, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlatformNavbarTheme } from "../platform/platform-navbar-theme";
import { LanguageSwitcher } from "../shared/language-switcher";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export function LandingNavbarSheet() {
  const t = useTranslations("nav");
  const tLang = useTranslations("language");

  return (
    <Sheet>
      <SheetTrigger
        render={<Button className="md:hidden" size="icon" variant="outline" />}
      >
        <span className="sr-only">{t("openMenu")}</span>
        <Menu />
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t("menuTitle")}</SheetTitle>
          <SheetDescription>{t("menuDescription")}</SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col px-5">
          <Button
            size="lg"
            variant="ghost"
            nativeButton={false}
            className="h-12 justify-normal rounded-none border-x-0 border-t border-b-0 border-border px-0"
            render={<Link href="/platform" />}
          >
            <Layout />
            {t("dashboard")}
          </Button>

          <Button
            size="lg"
            variant="ghost"
            nativeButton={false}
            className="h-12 justify-normal rounded-none border-x-0 border-y border-border px-0"
            render={<Link href="/platform/template" />}
          >
            <LayoutTemplate />
            {t("templates")}
          </Button>
        </nav>

        <div className="flex items-center justify-between px-5 pt-5">
          <p className="text-sm font-medium text-muted-foreground">
            {t("display")}
          </p>
          <PlatformNavbarTheme />
        </div>

        <div className="flex items-center justify-between px-5 pt-5">
          <p className="text-sm font-medium text-muted-foreground">
            {tLang("label")}
          </p>
          <LanguageSwitcher />
        </div>

        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>
            {t("close")}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
