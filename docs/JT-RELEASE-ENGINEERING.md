# JT Digital World release engineering

## Source of truth

A product is downloadable only when its GitHub repository has a published release with an attached installer for the requested operating system. A CI artifact, source archive, or successful compile is not an installer release.

The JT website release centre reads the public GitHub Releases API and shows only real assets. It reports platform, architecture, file format, size, download count, release date, checksums, release notes, source, and build history.

## Product repositories and current release position

| Product | Repository | Release position |
|---|---|---|
| JT Digital World Desktop | [JT-Digital-World-001](https://github.com/Tech-guy7-sys/JT-Digital-World-001) | v0.1.0 contains Windows x64, macOS ARM64 and Linux x64 packages |
| JT Desktop Agent | [JT-Desktop-Agent](https://github.com/Tech-guy7-sys/JT-Desktop-Agent) | Windows stable packages; separate macOS/Linux limited preview workflow |
| Jeff AI | [Jeff-AI](https://github.com/Tech-guy7-sys/Jeff-AI) | Cross-platform release workflow; no published product release yet |
| JT Studio | [JT-Studio](https://github.com/Tech-guy7-sys/JT-Studio) | Existing v0.1.0 release is source-only; cross-platform package workflow exists |
| JT Motion | [JT-Motion](https://github.com/Tech-guy7-sys/JT-Motion) | Cross-platform release workflow; no published product release yet |
| JT Cloud | [JT-Cloud](https://github.com/Tech-guy7-sys/JT-Cloud) | Cross-platform release workflow; no published product release yet |
| JT App Manager | [JT-App-Manager](https://github.com/Tech-guy7-sys/JT-App-Manager) | Cross-platform release workflow; no published product release yet |
| JT AI Agent, JT AI Core, JT Code, JT Design, JT Stream | [J-Tech-Digital-World](https://github.com/Tech-guy7-sys/J-Tech-Digital-World) | Central JT Workspace Apps release workflow; no published workspace release yet |

This table is an engineering snapshot. The live release centre must always use current GitHub release data instead of treating this document as live status.

## Supported build targets

The cross-platform Electron release workflows target:

- Windows: x64, x86/ia32 and ARM64
- macOS: Intel x64 and Apple Silicon ARM64
- Linux: x64 and ARM64

A target is considered available only when the corresponding job succeeds and the resulting installer/archive is attached to a published release. Some products may intentionally support fewer architectures until they have been built and tested.

## Release tag conventions

- Standalone Electron apps: `vMAJOR.MINOR.PATCH`
- Central JT Workspace Apps: `jt-workspaces-vVERSION`
- JT Desktop Agent macOS/Linux preview: `cross-platform-preview-vVERSION`

Use semantic versions. Preview builds must remain marked as prereleases. Do not label experimental shells as stable feature-equivalent desktop apps.

## Release quality gates

Before publishing:

1. Run source validation and the product's automated tests.
2. Build each supported OS/architecture target in its native runner.
3. Fail if a platform build produces no package.
4. Attach installers and source archives as separate assets.
5. Generate SHA-256 checksums and verify the manifest is non-empty.
6. State signing/notarization status and known platform limitations in release notes.
7. Verify the published release page and asset links.
8. Confirm the website release centre reports the new version and only the assets actually attached.

## Signing and trust

Current packages must not be described as code-signed or notarized unless the release workflow explicitly signs/notarizes them and the resulting artifacts are verified. A checksum confirms file integrity relative to the published checksum; it is not a malware scan or a guarantee of safety.

## Release links

- [JT website downloads](https://jt-digital-world-new.pages.dev/download.html)
- [Central JT Workspace Apps workflow](https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/publish-jt-workspace-apps.yml)
- [JT Desktop Agent release workflow](https://github.com/Tech-guy7-sys/JT-Desktop-Agent/actions/workflows/publish-release.yml)
- [JT Desktop Agent macOS/Linux preview workflow](https://github.com/Tech-guy7-sys/JT-Desktop-Agent/actions/workflows/publish-cross-platform-preview.yml)
