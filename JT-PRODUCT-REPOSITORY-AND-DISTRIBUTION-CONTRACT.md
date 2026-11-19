# JT Product Repositories and Distribution Contract

## Product naming

Use the exact JT product names in the website, launchers, installers, release titles and documentation:

- JT Desktop Agent
- Jeff AI
- JT AI Agent
- JT AI Core
- JT Code
- JT Design
- JT Studio
- JT Motion
- JT Cloud
- JT Stream
- JT App Manager

Use the JT monogram. Do not replace the JT brand with a single-letter mark.

## Repository responsibilities

- **J Tech Digital World**: company website, product catalogue, documentation, and the central source for JT AI Agent, JT AI Core, JT Code, JT Design and JT Stream. It may publish only the versioned **JT Workspace Apps** release bundle for those five applications, using tags prefixed `jt-workspaces-v`. It must not publish website-only or unrelated releases.
- **JT Desktop Agent**: native Windows WPF application and the limited Avalonia macOS/Linux preview shell.
- **Jeff AI**: AI workspace, provider abstraction, chat UI and its own desktop packaging pipeline.
- **JT Studio**: audio production workspace and its own desktop packaging pipeline.
- **JT Motion**: video planning/storyboard workspace and its own desktop packaging pipeline.
- **JT Cloud**: local-first project/file workspace and its own desktop packaging pipeline.
- **JT App Manager**: product catalogue/update workspace and its own desktop packaging pipeline.

## Standard platform targets

| Platform | Architectures | Package formats |
|---|---|---|
| Windows | x64, ARM64, x86/ia32 only where supported | EXE installer and/or portable ZIP |
| macOS | Intel x64 and Apple Silicon ARM64 | DMG and/or ZIP |
| Linux | x64 and ARM64 where dependencies support them | AppImage, DEB and/or RPM |
| Integrity | every release | SHA-256 manifest and per-asset digests where available |

A configured matrix is not proof of a successful build. A CI artifact is temporary and is not a published release. Never advertise an architecture until its own build succeeds and its asset is attached to a published release. macOS means Intel x64 and Apple Silicon ARM64, not obsolete 32-bit macOS.

## Release policy

1. The central repository may publish only **JT Workspace Apps** product bundles tagged `jt-workspaces-vMAJOR.MINOR.PATCH` or a prerelease variant.
2. Each central bundle contains separate packages for JT AI Agent, JT AI Core, JT Code, JT Design and JT Stream. The package filename identifies the product, version, OS and architecture.
3. The company website itself does not receive a product release. The enforcement workflow removes every central release whose tag does not begin with `jt-workspaces-v`.
4. Other products publish releases in their own product repositories.
5. The public download center reads official release assets and only displays a platform download when the matching product/OS asset exists. Source archives and temporary CI artifacts are never labelled as installers.
6. Unsigned builds must be labelled unsigned. Do not claim macOS signing/notarization or Windows signing unless verified.
7. Preview packages must remain marked as prereleases and clearly state feature limitations.

## Current product boundaries

- JT Desktop Agent's full-featured native WPF application is Windows-specific. The Avalonia macOS/Linux shell is a limited preview, not feature parity.
- Jeff AI's provider setup and model availability depend on each user's own provider configuration.
- JT Studio is an early audio workbench, not yet a full multitrack DAW.
- JT Motion is a storyboard/planning tool, not yet a full nonlinear video editor.
- JT Cloud is local-first and is not remote cloud storage/sync until that service is implemented and verified.
- JT App Manager is a catalogue/review tool; it does not silently install or update software.

This contract describes release architecture and acceptance rules. It does not claim that all packages or product capabilities are already published.
