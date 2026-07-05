import Image from "next/image";
import Link from "next/link";

const YEAR = new Date().getFullYear();

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-11/12 max-w-5xl flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.svg"
              alt=""
              width={20}
              height={20}
              className="size-5 rounded-[4px]"
            />
            <span className="font-heading text-sm font-semibold">Lanjut</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Local-first: your résumé never leaves your browser.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <Link
            href="/platform"
            className="transition-colors hover:text-foreground"
          >
            Start building
          </Link>
          <Link
            href="/platform/template"
            className="transition-colors hover:text-foreground"
          >
            Templates
          </Link>
          <a
            href="https://github.com/rimzzlabs/lanjut"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>

        <p className="text-center text-xs text-muted-foreground md:text-right">
          © {YEAR} Lanjut. Open source, AGPL-3.0 licensed.
        </p>
      </div>
    </footer>
  );
}
