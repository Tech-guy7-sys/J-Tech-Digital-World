# JT Digital World

Official JT Digital World website and workspace application repository.

## JT workspace applications
The website repository includes the JT Digital World site and browser-based workspaces for JT Studio, JT Motion, JT Cloud, JT Stream and JT App Manager. Each workspace bundle has a published GitHub release with a SHA-256 checksum. See [all JT releases](https://github.com/Tech-guy7-sys/jt-digital-world/releases).

- [JT Studio — audio workbench](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-studio)
- [JT Motion — storyboard, timeline and local media bay](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-motion)
- [JT Cloud — local project vault and file metadata](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-cloud)
- [JT Stream — camera/screen studio and local recording](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-stream)
- [JT App Manager — catalogue and release monitor](https://github.com/Tech-guy7-sys/jt-digital-world/tree/main/jt-apps/jt-app-manager)

## Separate application repositories
- [Agent Jeff — standalone Windows desktop agent source, tests, installer and releases](https://github.com/Tech-guy7-sys/agent-jeff)
- [JT Studio — standalone browser audio workbench source and release](https://github.com/Tech-guy7-sys/jt-studio)

## Feature and release boundaries
JT Studio, JT Motion, and JT Cloud currently provide local-first browser tools; they are not full professional DAW, nonlinear video editor, or remote cloud-sync services yet. JT Stream supports a Stage 01 local studio workflow; direct live broadcasting is not yet claimed. JT App Manager reads public release metadata and stores a local checklist; it does not install, update, or verify software signatures. The separate Agent Jeff repository builds the Windows desktop application and publishes installer/portable releases; the current installer is not code-signed.

Cloudflare Pages deployment requires repository secrets for the Cloudflare API token and account ID. The deployment workflow validates the site and skips deployment cleanly when those secrets are not configured.
