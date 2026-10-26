# JT Product Repositories and Distribution Contract

## Naming is part of the product

Use these exact display names everywhere user-facing: **JT Desktop Agent**, **Jeff AI**, **JT Studio**, **JT Motion**, **JT Cloud**, and **JT App Manager**. Do not replace the JT monogram with a single-letter mark. The central **J Tech Digital World** repository is the company website and catalog, not a product release repository.

## Repository responsibilities

- **J Tech Digital World** (jt-digital-world): company website, product catalog, documentation, and links to verified product artifacts. CI may build and retain temporary workflow artifacts. It must not create GitHub Releases.
- **JT Desktop Agent** (currently hosted at agent-jeff): desktop control/automation application and its own source/build pipeline.
- **Jeff AI** (jeff-ai): AI workspace, provider abstraction, chat UI, and its own cross-platform build pipeline.
- **JT Studio** (jt-studio): audio production workspace and its own source/build pipeline.
- **JT Motion**, **JT Cloud**, and **JT App Manager**: each should have a dedicated, non-empty product repository before its installers or source archives are advertised as available.

## Standard product deliverables

| Platform | Architectures | Expected package types |
|---|---|---|
| Windows | x64, x86/ia32 where supported; ARM64 where supported | installer and portable ZIP |
| macOS | Intel x64 and Apple Silicon arm64 | DMG and/or ZIP |
| Linux | x64 and arm64 where dependencies support them | AppImage and/or DEB |
| Source | platform independent | source archive plus build instructions |
| Integrity | all published artifacts | SHA-256 checksums and a manifest |

32-bit support must only be advertised where the framework and dependencies actually support it. macOS means Intel x64 and Apple Silicon arm64, not obsolete 32-bit macOS. A workflow artifact is a temporary CI download, not a published release. Signing/notarization and native-platform smoke tests are required before calling installers production-ready.

## Release policy

1. No GitHub Releases are to be created in jt-digital-world.
2. Product releases, when ready, belong to their dedicated product repositories.
3. The central website should link only to product repositories or verified product artifacts; it must not pretend a source ZIP is an installer.
4. Never advertise an architecture as available until a successful build artifact exists for it.
5. Disabling workflows stops new central releases but does not delete existing releases or their tags. Existing releases must be removed from GitHub's Releases page separately by a repository administrator.

## Current reality check

This document describes the required architecture, not a claim that every platform package already exists. At the time this plan was added, JT Desktop Agent had a Windows x64 release, Jeff AI had no meaningful source tree, and JT Studio was a browser workbench. Jeff AI's source scaffold is being built out separately; cross-platform output must still be verified by CI.