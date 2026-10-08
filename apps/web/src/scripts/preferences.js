// Runs inline in <head>, before the first paint, so the static HTML shows the
// saved preferences instead of the defaults. Keep it small and dependency free.
// The storage keys match next-themes and the sidebar and motion stores.
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
