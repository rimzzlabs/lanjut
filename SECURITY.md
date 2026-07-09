# Security Policy

Lanjut is local-first: résumé content is stored only in the user's browser
(IndexedDB) and is never sent to a server. That narrows the attack surface but
does not eliminate it. Vulnerabilities we care about include, for example:

- Script injection through résumé content (the editor renders rich text and
  imported data into the preview and exports)
- Any code path that would exfiltrate résumé data off the device, including
  through the export pipeline or third-party requests
- Supply-chain issues in dependencies that ship to the client

## Reporting a vulnerability

Please report vulnerabilities privately. Do not open a public issue or pull
request for a security problem.

Preferred channel: GitHub private vulnerability reporting, at
<https://github.com/rimzzlabs/lanjut/security/advisories/new>.

Alternatively, email rimzzlabs@proton.me with a subject line starting with
`[SECURITY]`.

In your report, include:

- A description of the issue and the affected code path or component
- Steps to reproduce, or a proof of concept
- Your assessment of the impact (what data or users are at risk)

## What to expect

- Acknowledgment of your report within 72 hours
- An assessment and, if confirmed, a remediation plan within 14 days
- Credit in the release notes for the fix, unless you prefer to stay anonymous

Please give us a reasonable window to ship a fix before any public disclosure.

## Supported versions

Lanjut is a continuously deployed web application; only the latest deployed
version (the tip of `main`) is supported. If you self-host a fork, please
verify the issue reproduces on the current release before reporting.
