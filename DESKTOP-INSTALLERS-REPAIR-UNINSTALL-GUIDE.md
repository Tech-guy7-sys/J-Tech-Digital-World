# JT Digital World desktop installers, repair, and uninstall

## What's being packaged

The desktop release workflow builds desktop wrappers for these browser-based workspaces in this repository:

- JT AI Agent
- JT AI Core
- JT App Manager
- JT Cloud
- JT Code
- JT Design
- JT Motion
- JT Studio
- JT Stream

The separate Agent Jeff desktop agent remains in its own repository: https://github.com/Tech-guy7-sys/agent-jeff. It is not merged into this installer bundle.

The Video & Photo editing experience is represented by the JT Motion workspace in this repository; it is not falsely advertised as a second independent source tree. The separate Agent Jeff desktop agent remains outside this bundle.

These desktop packages wrap the current web workspace and its local static assets. They do not magically add native audio/video engines, cloud storage, AI-provider credentials, account sync, or native Agent Jeff desktop-control powers. Those services need separate implementation and configuration.

## Release formats and CPU architectures

| Platform | Packages | Architecture targets |
|---|---|---|
| Windows | Interactive Setup EXE; portable ZIP | x64; ARM64 build where supported by the Electron toolchain |
| macOS | DMG; ZIP | Intel x64; Apple Silicon ARM64 |
| Linux | AppImage; DEB; RPM; ZIP | x64; ARM64 |

**32-bit x86/ia32:** the current Electron version and supported platform toolchain do not provide a reliable 32-bit Windows release target for this project. The workflow must not publish a falsely labelled x86 installer. Use x64 on 64-bit Intel/AMD Windows or ARM64 on a compatible ARM device. AMD64 is the standard x64 target; it is not a separate installer architecture from x64.

Builds are unsigned unless the release owner configures and protects platform signing certificates. macOS Gatekeeper, Windows SmartScreen, and Linux package trust prompts may warn about unsigned packages. Do not bypass OS security warnings or describe unsigned packages as verified publishers.

## Official build and release

Open GitHub Actions → **Build JT Desktop Installers** and run the workflow with a version such as `1.0.0`. CI builds a platform/architecture matrix, runs source/build checks, packages each workspace, calculates SHA-256 checksums, and uploads artifacts. Publishing a GitHub Release is a separate explicit workflow input and only happens after the matrix succeeds.

Relevant pushes to `main` publish a clearly versioned CI pre-release only after all platform/architecture jobs pass. A manual workflow run can publish a specifically versioned pre-release after all builds pass. The workflow does not fabricate assets; each published binary comes from a successful packaging job.

## Windows repair and uninstall

- Setup: run the official `JT Studio-1.0.0-win-x64.exe` or the corresponding app's Setup EXE.
- Repair/update: run `scripts/Repair-JTWorkspace.ps1 -InstallerPath "C:\path\to\official-setup.exe"` in PowerShell. It asks for confirmation and reruns the selected installer. If silent repair fails, launch the Setup EXE manually for visible diagnostics.
- Uninstall: use Windows Settings → Apps → Installed apps, or run `scripts/Uninstall-JTWorkspace.ps1`. The helper lists registered JT workspace installs and asks you to confirm before launching the registered uninstaller.
- Portable ZIP: extract to a normal folder and run the app executable. Uninstall by closing the app and deleting that extracted folder. Do not delete folders that contain user-created files without backing them up.

Cross-platform helper scripts:
- [macOS/Linux repair and reinstall](scripts/Repair-JTWorkspace.sh)
- [macOS/Linux uninstall](scripts/Uninstall-JTWorkspace.sh)

Run these shell scripts from Terminal after downloading the official package. They ask for confirmation and do not intentionally remove user-created project data.

## macOS repair and uninstall

Repair/update by replacing the app with the latest official DMG/ZIP build. To uninstall, quit the app and remove it from Applications or delete the extracted portable app. Back up any user-created files first. Signing and notarization must be configured before distributing a seamless production-grade macOS installer.

## Linux repair and uninstall

- AppImage: replace the old AppImage with the new official file. To uninstall, delete the AppImage and any shortcut you created.
- DEB: reinstall/upgrade with the package manager; uninstall with your distribution's package manager.
- RPM: reinstall/upgrade with the package manager; uninstall with your distribution's package manager.
- ZIP: extract to a folder and delete that folder to uninstall, after backing up user-created files.

## Crack files

JT Digital World will publish legitimate installers, portable packages, repair tools, uninstall tools, and checksums—not cracked executables, license bypasses, or security-disabling patches. If a JT product is free/open-source, a crack is unnecessary. If a paid product is later introduced, use a valid license or account entitlement.

## Integrity and support

Each platform/architecture artifact has a SHA-256 manifest. A matching checksum detects accidental or in-transit changes but is not a substitute for a signed release. Never publish a release asset until its corresponding build completed successfully. Report build failures with the GitHub Actions run link and the first failing error, not only npm deprecation warnings.
