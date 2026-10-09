import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@lanjut/ui/components/avatar";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";
import { A, S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import type { ContributorsState } from "@/hooks/use-contributors";
import type { Contributor } from "@/lib/contributors";
import { ExternalLink } from "./external-link";

const SHOWN = 12;
const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

// The ring that separates overlapping faces takes the colour of the surface
// under them. Whole class names, so Tailwind finds them.
const RINGS = {
  card: { group: "*:data-[slot=avatar]:ring-card", item: "ring-card" },
  page: {
    group: "*:data-[slot=avatar]:ring-background",
    item: "ring-background",
  },
} as const;

interface ContributorFacesProps {
  state: ContributorsState;
  /** What the faces sit on: a card, or the page itself. */
  surface: keyof typeof RINGS;
}

/**
 * The contributors as overlapping avatars, each a link to their GitHub
 * profile, the twelve with most contributions first and a count of the rest.
 * Grey circles while the list loads; nothing when it is unavailable.
 */
export function ContributorFaces(props: ContributorFacesProps) {
  const t = useTranslations("platform.contributors");
  const ring = RINGS[props.surface];

  if (props.state.status === "loading") {
    return (
      <div aria-hidden className="flex -space-x-2">
        {SKELETON_KEYS.map((key) => (
          <Skeleton
            key={key}
            className={cn("size-8 rounded-full ring-2", ring.item)}
          />
        ))}
      </div>
    );
  }
  if (props.state.status !== "ready" || A.isEmpty(props.state.contributors)) {
    return null;
  }

  const shown = A.take(props.state.contributors, SHOWN);
  const more = A.length(props.state.contributors) - A.length(shown);

  return (
    <AvatarGroup
      aria-label={t("listLabel")}
      className={cn("flex-wrap gap-y-2", ring.group)}
    >
      {shown.map((contributor) => (
        <ContributorFace key={contributor.login} contributor={contributor} />
      ))}
      {more > 0 && (
        <AvatarGroupCount className={cn("text-xs", ring.item)}>
          +{more}
          <span className="sr-only">{t("more", { count: more })}</span>
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}

function ContributorFace(props: { contributor: Contributor }) {
  const t = useTranslations("platform.contributors");
  const label = t("profile", { login: props.contributor.login });

  return (
    <Avatar
      title={props.contributor.login}
      className="transition-transform hover:z-10 hover:-translate-y-0.5"
      render={
        <ExternalLink href={props.contributor.profileUrl} aria-label={label} />
      }
    >
      <AvatarImage src={props.contributor.avatarUrl} alt="" />
      <AvatarFallback className="text-xs">
        {S.toUpperCase(S.slice(props.contributor.login, 0, 1))}
      </AvatarFallback>
    </Avatar>
  );
}
