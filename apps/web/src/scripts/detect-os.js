// Runs inline in <head> on the download page, before the first paint. It marks
// the visitor's system on <html> (data-os), and CSS shows the matching card.
(() => {
  const agent = navigator.userAgent;
  const platform =
    navigator.userAgentData?.platform ?? navigator.platform ?? "";
  // Chromium reports "macOS" and Safari reports "MacIntel", so match any case.
  const isMac = /mac/i.test(platform);
  const touchMac = isMac && navigator.maxTouchPoints > 1;

  const os = (() => {
    if (/Android|iPhone|iPad|iPod/.test(agent) || touchMac) return "web";
    if (isMac) return "mac";
    if (/win/i.test(platform)) return "windows";
    if (/CrOS/.test(agent)) return "web";
    if (/linux/i.test(platform) || /X11/.test(agent)) return "linux";
    return "web";
  })();

  document.documentElement.dataset.os = os;
})();
