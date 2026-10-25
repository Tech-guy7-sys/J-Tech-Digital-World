# JT Digital World

Official JT Digital World website and workspace application repository.

## JT workspace applications
The website repository includes the JT Digital World site and browser-based workspaces for JT AI Agent, JT AI Core, JT Studio, JT Motion, JT Cloud, JT Stream and JT App Manager. Each workspace bundle has a published GitHub release with a SHA-256 checksum. See [all JT releases](https://github.com/Tech-guy7-sys/jt-digital-world/releases).

- [JT Studio — audio workbench](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-studio)
- [JT Motion — storyboard, timeline and local media bay](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-motion)
- [JT Cloud — local project vault and file metadata](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-cloud)
- [JT Stream — camera/screen studio and local recording](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-stream)
- [JT App Manager — catalogue and release monitor](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-app-manager)

## Separate application repositories
- [Agent Jeff — standalone Windows desktop agent source, tests, installer and releases](https://github.com/Tech-guy7-sys/agent-jeff)
- [JT Studio — standalone browser audio workbench source and release](https://github.com/Tech-guy7-sys/jt-studio)

## Cross-platform desktop installers

A dedicated [Build JT Desktop Installers workflow](.github/workflows/publish-jt-desktop-installers.yml) now packages the nine browser workspaces into desktop wrappers. It targets Windows Setup EXE + portable ZIP (x64/AMD64, ARM64 and legacy x86/ia32 with Electron 43), macOS DMG + ZIP (Intel x64 and Apple Silicon ARM64), and Linux AppImage + DEB + RPM + ZIP (x64 and ARM64). The workflow also generates SHA-256 manifests and uploads build artifacts. Native builds must complete successfully before a desktop GitHub Release is published. Relevant pushes to `main` publish a versioned CI pre-release after all platform builds pass; run the workflow manually with `publish_release=true` to publish a specifically versioned pre-release.

- [Download center with live desktop release listings](https://jtdigitalworld.com/download.html)
- [Installer, repair and uninstall guide](DESKTOP-INSTALLERS-REPAIR-UNINSTALL-GUIDE.md)
- [Windows repair helper](scripts/Repair-JTWorkspace.ps1)
- [Windows uninstall helper](scripts/Uninstall-JTWorkspace.ps1)

**Important:** existing per-app releases currently contain browser-workspace ZIP bundles; those are not native installers. Native desktop packages will appear in the download center only after the new packaging workflow finishes and a release is published. No cracked binaries or license bypasses are produced. 32-bit x86 is not advertised for the current Electron toolchain. The separate [Agent Jeff desktop repository](https://github.com/Tech-guy7-sys/agent-jeff) remains separate and retains its own installer/releases.

## Feature and release boundaries
JT Studio, JT Motion, and JT Cloud currently provide local-first browser tools; they are not full professional DAW, nonlinear video editor, or remote cloud-sync services yet. JT Stream supports a Stage 01 local studio workflow; direct live broadcasting is not yet claimed. JT App Manager reads public release metadata and stores a local checklist; it does not install, update, or verify software signatures. The separate Agent Jeff repository builds the Windows desktop application and publishes installer/portable releases; the current installer is not code-signed.

Cloudflare Pages deployment requires repository secrets for the Cloudflare API token and account ID. The deployment workflow validates the site and skips deployment cleanly when those secrets are not configured.
