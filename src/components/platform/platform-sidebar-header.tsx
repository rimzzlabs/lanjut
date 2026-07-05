import Image from "next/image";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { SidebarHeader, SidebarTrigger } from "../ui/sidebar";

export function PlatformSidebarHeader() {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="lg:hidden" />

        <Separator orientation="vertical" className="lg:hidden" />

        <Link
          href="/"
          aria-label="Lanjut - Home Page"
          className="flex items-center gap-2"
        >
          <Image
            src="/favicon-512x512.png"
            alt="Lanjut Logo"
            width={280}
            height={68}
            className="size-7"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Lanjut</span>
            <span className="text-xs text-muted-foreground">
              <span className="sr-only">Local-First</span> ATS Resume Builder
            </span>
          </div>
        </Link>
      </div>
    </SidebarHeader>
  );
}
