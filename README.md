# J Tech Digital World

Official JT company website and the source monorepo for JT browser workspaces.

## Product names

Use these exact display names across the JT ecosystem:

- **JT Desktop Agent** — permission-controlled desktop and device automation. The current native WPF implementation targets Windows; macOS and Linux require a real platform port.
- **Jeff AI** — the AI assistant experience and provider interface.
- **JT AI Agent** — general-purpose workspace for research, coding, projects, documents and specialist tasks.
- **JT AI Core** — shared provider abstraction and app-specific permission model.
- **JT Code** — coding and development workspace.
- **JT Design** — visual design workspace.
- **JT Studio** — audio production workspace.
- **JT Motion** — video and motion-planning workspace.
- **JT Cloud** — project vault and file-metadata workspace.
- **JT Stream** — camera, scene and local recording workspace.
- **JT App Manager** — JT product catalogue, build status and product-update workspace.

## Source locations

The central repository contains the website and browser-workspace source for JT AI Agent, JT AI Core, JT Code, JT Design, JT Motion, JT Cloud, JT Stream, JT Studio, and JT App Manager under `jt-apps/`. The standalone native JT Desktop Agent source is in [agent-jeff](https://github.com/Tech-guy7-sys/agent-jeff). The dedicated [Jeff AI repository](https://github.com/Tech-guy7-sys/jeff-ai) and [JT Studio repository](https://github.com/Tech-guy7-sys/jt-studio) include desktop-shell and packaging work.

## Desktop builds: artifact-only

The [Build JT Workspace Artifacts workflow](.github/workflows/build-jt-workspace-artifacts.yml) packages the nine browser workspaces in this repository across the configured platform matrix:

- Windows: x64, ARM64, and an x86/ia32 build attempt. x86 is only supported if the Electron/toolchain build passes; do not advertise it before verification.
- macOS: Intel x64 and Apple Silicon ARM64; DMG and ZIP targets.
- Linux: x64 and ARM64; AppImage, DEB, RPM and ZIP targets.

The workflow uploads temporary GitHub Actions artifacts and explicitly disables automatic release publishing. A platform/architecture combination is available only after its own CI job succeeds and its output is verified. The workflow creates checksums for produced artifacts. These packages are unsigned unless separately signed.

The standalone [JT Desktop Agent workflow](https://github.com/Tech-guy7-sys/agent-jeff/actions) currently builds Windows x64 and x86 targets. Its existing WPF and Windows-specific desktop APIs are not cross-platform. Do not advertise macOS or Linux installers for JT Desktop Agent until native implementations and tests exist for those systems.

The [Jeff AI workflow](https://github.com/Tech-guy7-sys/jeff-ai/actions) and [JT Studio workflow](https://github.com/Tech-guy7-sys/jt-studio/actions) build product-specific desktop artifacts. CI artifacts are not permanent releases; use a product repository for any future published product downloads. This company repository is not intended to publish GitHub Releases.

## Product boundaries

- JT Studio is an early audio workbench, not yet a full multitrack DAW.
- JT Motion is a video/storyboard workspace, not yet a full nonlinear video editor.
- JT Cloud currently stores local project records and file metadata; remote file sync is not claimed.
- JT App Manager can catalogue products and inspect product repository build/release information; it does not silently install or update software.
- Jeff AI must be exposed through a provider abstraction. Do not claim an AI backend is connected until configuration and a real request have been verified.
- Desktop/device control belongs exclusively to JT Desktop Agent and must remain permission-controlled, auditable, and stoppable.

## Release policy

Do not publish GitHub Releases from this company repository. Use the artifact-only CI workflow for company-site workspace builds and keep product distribution in each product's own repository. Previously published historical release records are not automatically deleted by disabling the workflows; a repository administrator must delete those existing releases and associated tags separately.

## Development

The site uses Node.js tooling. Review the relevant package scripts before running builds. Inspect existing files before replacing them, and verify workflow results before advertising installers as available.
