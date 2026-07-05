import { useEffect, useState } from "react";

export function useIsClient() {
  const [mounted, setMountd] = useState(false);

  useEffect(() => {
    setMountd(true);
  }, []);

  return mounted;
}
