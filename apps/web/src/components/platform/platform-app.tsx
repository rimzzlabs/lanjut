import { lazy, type ReactNode, Suspense, useEffect } from "react";
import { useTranslations } from "use-intl";
import { Redirect, Route, Switch } from "wouter";
import { ChangelogPage } from "@/components/changelog/changelog-page";
import { EditorWorkspaceSkeleton } from "@/components/editor/editor-workspace-skeleton";
import { PlatformAppRouter } from "@/components/platform/platform-app-router";
import { PlatformDashboardSkeleton } from "@/components/platform/platform-dashboard-skeleton";
import { PlatformProfilesSkeleton } from "@/components/platform/platform-profiles-skeleton";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformTemplatesSkeleton } from "@/components/platform/platform-templates-skeleton";
import { AppProviders, type IslandProps } from "@/components/shared/providers";
import { useEditorId } from "@/hooks/use-editor-id";
import type { WorkspaceView } from "@/hooks/use-workspace-view";
import {
  CHANGELOG_PATHNAME,
  EDITOR_DOCUMENT_ROUTE,
  EDITOR_PATHNAME,
  PROFILE_PATHNAME,
  TEMPLATE_PATHNAME,
} from "@/lib/routes";
import { SITE } from "@/lib/site";

const PlatformDashboard = lazy(() =>
  import("@/components/platform/platform-dashboard").then((module) => ({
    default: module.PlatformDashboard,
  })),
);
const PlatformTemplates = lazy(() =>
  import("@/components/platform/platform-templates").then((module) => ({
    default: module.PlatformTemplates,
  })),
);
const PlatformProfiles = lazy(() =>
  import("@/components/platform/platform-profiles").then((module) => ({
    default: module.PlatformProfiles,
  })),
);
const EditorWorkspace = lazy(() =>
  import("@/components/editor/editor-workspace").then((module) => ({
    default: module.EditorWorkspace,
  })),
);

type LazyPage = WorkspaceView | "templates" | "profiles";
type AppPage = LazyPage | "changelog";

// The library and the templates keep the titles their pages are indexed
// under: search engines read the title after this effect runs.
const PAGE_TITLE_KEYS: Record<AppPage, string> = {
  library: "meta.editorTitle",
  editor: "editor.chrome.editorTitle",
  templates: "meta.templateTitle",
  profiles: "profile.profiles",
  changelog: "meta.changelogTitle",
};

// What each page shows inside the shell while its code loads: a skeleton of
// the page itself, not a spinner.
const PAGE_SKELETONS: Record<LazyPage, ReactNode> = {
  library: <PlatformDashboardSkeleton />,
  editor: <EditorWorkspaceSkeleton />,
  templates: <PlatformTemplatesSkeleton />,
  profiles: <PlatformProfilesSkeleton />,
};

/**
 * The app: the shell around the library, the editor, the templates, the
 * profiles, and the changelog. One root serves `/editor`, `/template`,
 * `/profile`, and `/changelog`, so moving between them keeps the shell and
 * loads only the content, with a skeleton of that page inside the shell.
 */
export function PlatformApp(props: IslandProps) {
  return (
    <AppProviders locale={props.locale} pathname={props.pathname}>
      <PlatformAppRouter>
        <PlatformShell>
          <Switch>
            <Route path={TEMPLATE_PATHNAME}>
              <PlatformAppPage page="templates" />
            </Route>
            <Route path={PROFILE_PATHNAME}>
              <PlatformAppPage page="profiles" />
            </Route>
            <Route path={CHANGELOG_PATHNAME}>
              <PlatformAppPage page="changelog" />
            </Route>
            <Route path={EDITOR_DOCUMENT_ROUTE}>
              <PlatformAppPage page="editor" />
            </Route>
            <Route path={EDITOR_PATHNAME}>
              <PlatformAppPage page="library" />
            </Route>
            <Route>
              <Redirect to={EDITOR_PATHNAME} replace />
            </Route>
          </Switch>
        </PlatformShell>
      </PlatformAppRouter>
    </AppProviders>
  );
}

function PlatformAppPage(props: { page: AppPage }) {
  const t = useTranslations();
  const title = t(PAGE_TITLE_KEYS[props.page]);

  useEffect(() => {
    document.title = `${title} · ${SITE.name}`;
  }, [title]);

  // The changelog ships with the app, so it needs no boundary. React outlines
  // a large boundary into a hidden block that a script reveals, and a crawler
  // that runs no script would read the build's changelog as hidden.
  if (props.page === "changelog") return <ChangelogPage />;

  return (
    <Suspense fallback={PAGE_SKELETONS[props.page]}>
      <PlatformAppPageView page={props.page} />
    </Suspense>
  );
}

function PlatformAppPageView(props: { page: LazyPage }) {
  const id = useEditorId();

  if (props.page === "templates") return <PlatformTemplates />;
  if (props.page === "profiles") return <PlatformProfiles />;
  if (props.page === "library") return <PlatformDashboard />;
  return <EditorWorkspace key={id} />;
}
