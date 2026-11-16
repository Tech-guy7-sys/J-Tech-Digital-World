# JT Digital World — Product Rebuild V2

## Product direction
Rebuild the suite as a coherent family of professional desktop-grade workspaces. Use the interaction quality of current leading products as inspiration, not their branding or copied interfaces.

## Shared design language
- Neutral, high-contrast surfaces; restrained accent colour; clear typography and spacing.
- Persistent app navigation, workspace switcher, breadcrumb, command search, account access.
- Consistent controls, dialogs, empty states, status indicators, responsive behaviour, keyboard navigation and accessibility.
- No decorative gradients, oversized hero art, fake status indicators, or controls that imply unavailable functionality.
- Preserve current working features and data formats while replacing the presentation layer.

## App product direction
- **JT AI Agent:** conversation workspace with projects, searchable history, artifacts, prompt library, attachments, and explicit tool/context approvals. Inspiration: ChatGPT, Claude and Gemini workflows.
- **Agent Jeff:** desktop command centre with task plans, approval queue, device/desktop status, audit trail, automation recipes and emergency stop. This is the only app allowed to control the desktop/device.
- **JT AI Core:** provider/model registry, routing policies, app-scoped tool permissions, usage/health telemetry and integration diagnostics.
- **JT Code:** editor-first workspace with file explorer, tabs, terminal integration only where actually available, git/change review, previews, debugging and AI coding support. Inspiration: VS Code and modern AI IDEs.
- **JT Design:** canvas-first visual editor with artboards, layers, reusable design tokens, asset library, components, export and AI image/design workflows. Inspiration: Figma and Canva.
- **JT Cloud:** file manager with locations, folders, previews, versions, sharing permissions, storage usage, search and sync state. Keep local and remote storage clearly distinct until remote infrastructure is configured.
- **JT Motion:** timeline-first video editor with media bin, preview monitor, tracks, scene/storyboard mode, titles, transitions, export queue. Do not label planning tools as a full editor.
- **JT Studio:** audio workstation with track lanes, transport, recording, waveform/take management, mixer and session export. Clearly identify browser-only capabilities.
- **JT Stream:** live production control room with sources, scenes, audio mixer, overlays, stream health and recording/broadcast controls. Only expose real connected outputs.
- **JT App Manager:** installed app inventory, version/update status, verified installers, release channels, app settings and diagnostics. Do not claim to install/update until native package actions exist.

## Delivery rules
1. Audit each app's existing code, data and capabilities before replacing its UI.
2. Keep working features and backwards-compatible storage migrations.
3. Implement app-by-app functional upgrades; no fake controls or simulated backend success.
4. Add tests for shared navigation, keyboard flows, app routes, persistence and existing regressions.
5. Mark every capability as working, local-only, requires setup, or planned.
