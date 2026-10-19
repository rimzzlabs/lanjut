import { ISLAND_MESSAGES } from "virtual:lanjut/island-messages";
import type { PropsWithChildren } from "react";
import { CopyProviders, type IslandProps } from "./providers";

/** Context for a landing island: the landing copy and the current path. */
export function IslandProviders(props: PropsWithChildren<IslandProps>) {
  return (
    <CopyProviders
      locale={props.locale}
      pathname={props.pathname}
      messages={ISLAND_MESSAGES[props.locale]}
    >
      {props.children}
    </CopyProviders>
  );
}
