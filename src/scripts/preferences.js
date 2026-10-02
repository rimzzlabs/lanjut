// Runs inline in <head>, before the first paint, so the static HTML shows the
// saved preferences instead of the defaults. Keep it small and dependency free.
// The storage keys match next-themes and src/lib/store/sidebar-store.ts.
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

  // Sidebar: globals.css collapses it from this attribute until React hydrates.
  const sidebar = read("lanjut:sidebar-state");
  root.dataset.sidebar = sidebar === "collapsed" ? "collapsed" : "expanded";
})();
