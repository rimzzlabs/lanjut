; Tauri includes this file before the installer pages, so these defines replace
; the generic NSIS text on the Welcome and Finish pages.

!define MUI_WELCOMEPAGE_TITLE "Welcome to Lanjut"
!define MUI_WELCOMEPAGE_TEXT "Lanjut is a free resume builder that runs on this computer. Your resumes stay on this computer, and you need no account.$\r$\n$\r$\nSetup installs Lanjut for your Windows account only.$\r$\n$\r$\nClick Next to continue."

!define MUI_FINISHPAGE_TITLE "Lanjut is ready"
!define MUI_FINISHPAGE_TEXT "Lanjut is installed. To open it later, find Lanjut in the Start menu.$\r$\n$\r$\nLanjut checks for a new version every few days. It installs an update only when you click.$\r$\n$\r$\nClick Finish to close Setup."
