# JT Ecosystem Release Readiness Checklist

This checklist is an operational gate, not a claim that any item has already passed. Update it for each version and keep product releases in their own repositories.

## Before a release

- [ ] Confirm the repository is the correct product repository and the product name uses JT branding.
- [ ] Review the diff and confirm no secrets, credentials, personal data, or local machine paths are committed.
- [ ] Run the product's documented syntax checks and tests; record commands and results.
- [ ] Build every advertised operating-system/architecture target in CI.
- [ ] Inspect each job's logs. A successful syntax check is not the same as a successful package build.
- [ ] Confirm generated artifacts are present and downloadable; install or launch-test them on native target systems where possible.
- [ ] Verify the installer, app ID, version, icons, permissions, data paths, and uninstall behavior.
- [ ] Check that first-run instructions, offline behavior, error messages, and recovery steps are documented.
- [ ] Review privacy/security boundaries, especially local files, credentials, AI provider requests, and any desktop/device-control features.
- [ ] Generate SHA-256 checksums and a manifest for release artifacts; publish them alongside the packages.
- [ ] Add concise release notes describing changes, known limitations, and supported platforms.
- [ ] Use a version tag only after the release gate is satisfied.

## Cross-platform packaging rules

- Treat Windows x64, Windows x86/ia32, Windows ARM64, macOS Intel, macOS Apple Silicon, Linux x64, and Linux ARM64 as separate targets. Do not claim a target succeeded because another target succeeded.
- If a target fails, either fix it or explicitly remove that target from the release matrix and supported-platform claims.
- macOS signing/notarization and native-platform smoke tests are separate from producing a DMG/ZIP.
- Linux package formats may have different metadata requirements. Do not add guessed maintainer contact information to satisfy packaging tools; use valid project metadata or omit the affected format.
- CI artifacts are temporary build outputs. They are not a published GitHub Release and are not proof of installation or runtime correctness.

## Repository and distribution policy

- The central J-Tech-Digital-World repository is the company website/catalog and must not publish GitHub Releases.
- Product releases belong in their dedicated product repositories.
- Link to installers only after verifying the exact artifact exists and matches the displayed platform/version.
- Keep source code, build instructions, and platform support claims aligned with what the repository actually contains.
- Compare duplicate repositories and preserve any unique content before proposing deletion or consolidation.
- Do not represent a roadmap, mockup, starter template, or capability specification as an implemented feature.

## Post-release verification

- [ ] Confirm the product release page and all expected files are visible.
- [ ] Download at least one artifact from the release page and verify its checksum.
- [ ] Test the published download links from the company website.
- [ ] Record any failed targets, known issues, and follow-up tasks.
- [ ] Keep the previous stable version available until the new version is verified.

## Current known follow-ups

- Verify the latest JT Cloud CI run after the Linux packaging configuration change.
- Verify the active JT App Manager build and inspect any failed jobs.
- Implement and test genuine macOS/Linux support for JT Desktop Agent; do not describe the Windows WPF implementation as cross-platform.
- Compare JT-Digital-World-001 with J-Tech-Digital-World before any duplicate cleanup.
- Verify product release workflows and actual downloadable artifacts before announcing releases.
