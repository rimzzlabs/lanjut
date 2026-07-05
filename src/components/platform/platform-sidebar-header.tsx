import Image from "next/image";
import Link from "next/link";
import { SidebarHeader } from "../ui/sidebar";

export function PlatformSidebarHeader() {
  return (
    <SidebarHeader>
      <Link
        href="/"
        aria-label="Lanjut - Home Page"
        className="flex items-center gap-2 px-2"
      >
        <Image
          src="/favicon-512x512.png"
          alt="Lanjut Logo"
          width={280}
          height={68}
          className="size-9"
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Lanjut</span>
          <span className="text-xs text-muted-foreground">
            <span className="sr-only">Local-First</span> ATS Resume Builder
          </span>
        </div>
      </Link>
    </SidebarHeader>
  );
}
