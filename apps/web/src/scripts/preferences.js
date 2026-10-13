// Runs inline in <head>, before the first paint, so the static HTML shows the
// saved preferences instead of the defaults. Keep it small and dependency free.
// The storage keys match next-themes, the sidebar and motion stores, and the
// Recent list of the sidebar.
(() => {
  const root = document.documentElement;

  const read = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  // Theme: a stored choice wins, otherwise follow the system.
  const theme = read("theme") ?? "system";
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && systemDark);
  root.classList.remove("light", "dark");
  root.classList.add(dark ? "dark" : "light");
  root.style.colorScheme = dark ? "dark" : "light";

  // Sidebar: the store starts from this attribute, and globals.css takes the
  // widths of the icon rail from it.
  const collapsed = read("lanjut:sidebar-state") === "collapsed";
  root.dataset.sidebar = collapsed ? "collapsed" : "expanded";

  // A static shell holds the sidebar expanded. The icon rail is CSS on two
  // attributes of the sidebar, so a saved collapsed state sets them as the
  // parser adds the sidebar, before the first paint.
  if (collapsed) {
    const expanded =
      '[data-static-shell] [data-slot="sidebar"][data-state="expanded"]';
    const observer = new MutationObserver(() => {
      for (const sidebar of document.querySelectorAll(expanded)) {
        sidebar.dataset.state = "collapsed";
        sidebar.dataset.collapsible = "icon";
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", () => observer.disconnect());
  }

  // Recent list: globals.css gives its loading rows the number it had last.
  const recent = read("lanjut:recent-rows") ?? "";
  if (/^[0-6]$/.test(recent)) root.dataset.recent = recent;

  // One file answers /editor and /editor/<id> and holds a static shell for
  // each. globals.css shows the one for this address.
  const inEditor = /\/editor\/[^/]+\/?$/.test(window.location.pathname);
  root.dataset.workspace = inEditor ? "editor" : "library";

  // Motion: "system" follows prefers-reduced-motion.
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionSetting = () => {
    try {
      return JSON.parse(read("lanjut:motion")).state.setting;
    } catch {
      return "system";
    }
  };
  const applyMotion = () => {
    const setting = motionSetting();
    const reduce =
      setting === "off" || (setting !== "on" && motionQuery.matches);
    root.dataset.motion = reduce ? "reduce" : "full";
  };
  applyMotion();
  motionQuery.addEventListener("change", applyMotion);
})();
