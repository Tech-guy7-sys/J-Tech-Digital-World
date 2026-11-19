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

The [Build JT Workspace Artifacts workflow](.github/workflows/build-jt-workspace-artifacts.yml) continues to build nine central browser workspaces across Windows x64/ARM64 and an x86 build attempt, macOS Intel/Apple Silicon, and Linux x64/ARM64. These are temporary CI artifacts for engineering verification.

The dedicated [Publish JT Workspace Apps workflow](.github/workflows/publish-jt-workspace-apps.yml) publishes permanent, versioned releases for the five central-only desktop workspaces: **JT AI Agent, JT AI Core, JT Code, JT Design and JT Stream**. Each app receives separate packages for Windows, macOS and Linux. The release tag begins with `jt-workspaces-v`; preview versions are marked prerelease. Each platform/architecture job must pass before the release is published, and the release includes a combined SHA-256 manifest.

Other products publish from their own repositories: [JT Desktop Agent](https://github.com/Tech-guy7-sys/JT-Desktop-Agent), [Jeff AI](https://github.com/Tech-guy7-sys/Jeff-AI), [JT Studio](https://github.com/Tech-guy7-sys/JT-Studio), [JT Motion](https://github.com/Tech-guy7-sys/JT-Motion), [JT Cloud](https://github.com/Tech-guy7-sys/JT-Cloud) and [JT App Manager](https://github.com/Tech-guy7-sys/JT-App-Manager). Their release assets remain separate and must be verified in each repository.

The central release-enforcement workflow permits only `jt-workspaces-v*` product bundles. It removes unrelated releases so the company website itself does not become a release repository. The download center reads public release assets and shows a platform installer only when a matching product/OS package exists. A configured matrix is not proof that a release has been published.

JT Desktop Agent's Windows WPF implementation remains the full-featured native product; its separate Avalonia macOS/Linux shell is limited preview functionality, not feature parity. All packages are unsigned unless a release explicitly documents verified signing/notarization. Source archives, temporary CI artifacts and installers are labelled separately.

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
