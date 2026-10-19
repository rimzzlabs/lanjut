# Install Lanjut

The Lanjut app runs on macOS, Windows, and Linux. Each system and processor has its own file. Download your file from the **Assets** list of the [latest release](https://github.com/rimzzlabs/lanjut/releases/latest). Each file name holds the version number, shown here as `<version>`.

## macOS

Lanjut needs macOS 13 or later.

1. Open the Apple menu and select **About This Mac**.
2. If **Chip** shows Apple M1 or later, download `Lanjut_<version>_aarch64.dmg`.
3. If **Processor** shows Intel, download `Lanjut_<version>_x64.dmg`.
4. Open the `.dmg` file and drag Lanjut into the **Applications** folder.
5. Open Terminal and run this command:

   ```sh
   xattr -dr com.apple.quarantine /Applications/Lanjut.app
   ```

6. Open Lanjut from the **Applications** folder.

Apple has not signed Lanjut yet. Without step 5, macOS blocks the first open and reports that the app is damaged.

## Windows

Lanjut needs Windows 10 or later.

1. Open **Settings** > **System** > **About** and read **System type**.
2. If the system type is x64-based, download `Lanjut_<version>_x64-setup.exe`.
3. If the system type is ARM-based, download `Lanjut_<version>_arm64-setup.exe`.
4. Open the file.
5. If Windows shows "Windows protected your PC", select **More info**. Then select **Run anyway**.
6. Complete the steps in Setup.

Microsoft has not signed Lanjut yet, so Windows shows the warning in step 5. Setup installs Lanjut for your Windows account only.

## Linux

Lanjut needs glibc 2.35 or later. Ubuntu 22.04, Debian 12, Fedora 37, and later releases meet this requirement.

1. Open a terminal and run `uname -m`. The result is your processor: `x86_64` or `aarch64`.
2. Download the file for your distribution and processor:

   | Distribution                         | `x86_64`                          | `aarch64`                           |
   | ------------------------------------ | --------------------------------- | ----------------------------------- |
   | Ubuntu, Debian, Linux Mint, Pop!\_OS | `Lanjut_<version>_amd64.deb`      | `Lanjut_<version>_arm64.deb`        |
   | Fedora, openSUSE                     | `Lanjut-<version>-1.x86_64.rpm`   | `Lanjut-<version>-1.aarch64.rpm`    |
   | Other distributions                  | `Lanjut_<version>_amd64.AppImage` | `Lanjut_<version>_aarch64.AppImage` |

3. Go to the folder that holds the file. Then run the command for your file type. The commands show the `x86_64` names.

   On Ubuntu, Debian, Linux Mint, or Pop!\_OS:

   ```sh
   sudo apt install ./Lanjut_<version>_amd64.deb
   ```

   On Fedora:

   ```sh
   sudo dnf install ./Lanjut-<version>-1.x86_64.rpm
   ```

   On openSUSE:

   ```sh
   sudo zypper install ./Lanjut-<version>-1.x86_64.rpm
   ```

   For the AppImage, make the file executable and open it:

   ```sh
   chmod +x Lanjut_<version>_amd64.AppImage
   ./Lanjut_<version>_amd64.AppImage
   ```

4. If you installed a `.deb` or an `.rpm` file, open Lanjut from the app menu of your desktop.

If the AppImage does not open and reports that FUSE is missing, install FUSE 2. On Ubuntu 22.04 and Debian 12, run `sudo apt install libfuse2`. On Ubuntu 24.04 and later, run `sudo apt install libfuse2t64`.

## Updates

Lanjut looks for a new version at most once every three days. It installs an update only when you click.

- On Linux, an update of a `.deb` or an `.rpm` asks for your password.
- An AppImage replaces its own file. Keep the AppImage in a folder that you can write to.
