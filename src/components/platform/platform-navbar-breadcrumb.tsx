import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export function PlatformNavbarBreadcrumb() {
  const pathname = usePathname();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {pathname.endsWith("/platform") ? (
            <BreadcrumbPage>Platform</BreadcrumbPage>
          ) : (
            <BreadcrumbLink render={<Link href="/platform" />}>
              Platform
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {pathname.includes("/editor") && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Editor</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {pathname.includes("/template") && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Browse Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
