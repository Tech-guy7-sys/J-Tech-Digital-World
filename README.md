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

- **JT Desktop Agent:** [JT-Desktop-Agent repository](https://github.com/Tech-guy7-sys/JT-Desktop-Agent). The WPF app is the full Windows implementation; the separate Avalonia macOS/Linux shell is a limited preview and does not yet have Windows feature parity.
- **Jeff AI:** [Jeff-AI repository](https://github.com/Tech-guy7-sys/Jeff-AI).
- **JT Studio:** [JT-Studio repository](https://github.com/Tech-guy7-sys/JT-Studio).
- **JT Motion:** [JT-Motion repository](https://github.com/Tech-guy7-sys/JT-Motion).
- **JT Cloud:** [JT-Cloud repository](https://github.com/Tech-guy7-sys/JT-Cloud).
- **JT App Manager:** [JT-App-Manager repository](https://github.com/Tech-guy7-sys/JT-App-Manager).
- **JT AI Agent, JT AI Core, JT Code, JT Design and JT Stream:** maintained in this central repository under `jt-ai-agent/` and `jt-apps/`.

## Desktop builds and releases

The [Build JT Workspace Artifacts workflow](.github/workflows/build-jt-workspace-artifacts.yml) packages nine central browser workspaces for Windows x64/ARM64 and an x86 build attempt, macOS Intel/Apple Silicon, and Linux x64/ARM64. Each platform/architecture is an independent CI target. A successful package job is required before describing that target as built.

These central workspace packages are temporary GitHub Actions artifacts, not permanent product releases. The company repository does not publish GitHub Releases. Permanent product releases belong in each dedicated product repository. The website's download center reads those public release records and displays a platform installer only when the matching asset is actually attached to a published release.

The dedicated Jeff AI, JT Studio, JT Motion, JT Cloud and JT App Manager repositories have Windows/macOS/Linux packaging workflows. A configured matrix is not proof that a release has been published or that every target has passed. JT Desktop Agent's Windows WPF implementation remains the full-featured native product; the separate Avalonia shell for macOS/Linux is limited preview functionality. Do not describe it as feature parity or production-ready until platform adapters, tests and native smoke tests pass.

All packages are unsigned unless a release explicitly documents verified signing/notarization. Source archives, CI artifacts and installers must be labelled separately.

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
