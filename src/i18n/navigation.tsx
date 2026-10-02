import type { ComponentProps, MouseEvent } from "react";
import { createContext, useContext } from "react";
import { useLocale } from "use-intl";
import { flushOpenResumePersist } from "@/lib/store/persistence";
import { type Locale, localizePath } from "./routing";

/**
 * The page path, without its locale prefix. Astro hands it to every island,
 * so the server render and the first client render agree.
 */
export const PathnameContext = createContext("/");

export function usePathname() {
  return useContext(PathnameContext);
}

interface NavigateOptions {
  locale?: Locale;
  scroll?: boolean;
}

/**
 * Every page change is a full document load. A pending résumé write is
 * flushed first, so the next page reads what this one wrote.
 */
async function navigate(href: string, replace: boolean) {
  await flushOpenResumePersist();
  if (replace) window.location.replace(href);
  else window.location.assign(href);
}

export function useRouter() {
  const locale = useLocale() as Locale;

  return {
    push(href: string, options?: NavigateOptions) {
      return navigate(localizePath(href, options?.locale ?? locale), false);
    },
    replace(href: string, options?: NavigateOptions) {
      return navigate(localizePath(href, options?.locale ?? locale), true);
    },
  };
}

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.currentTarget.target
  );
}

export function Link(
  props: ComponentProps<"a"> & { href: string; locale?: Locale },
) {
  const current = useLocale() as Locale;
  const { locale, onClick, ...rest } = props;
  const href = localizePath(props.href, locale ?? current);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !isPlainClick(event)) return;
    event.preventDefault();
    void navigate(href, false);
  }

  return <a {...rest} href={href} onClick={handleClick} />;
}
