## Unreleased — JT app power tools expansion

### Added
- Added app-specific Power Tools across JT AI Agent, JT AI Core, Agent Jeff, JT App Manager, JT Cloud, JT Code, JT Design, JT Motion, JT Studio and JT Stream.
- JT AI Agent: structured prompt builder that inserts a reviewed brief into the chat composer without sending it automatically.
- JT AI Core: reusable prompt recipes for model evaluation, provider comparison and least-privilege tool policy design.
- Agent Jeff: desktop-task preflight checklist and exportable handoff report; no browser-based desktop actions are executed.
- JT App Manager: persistent release-readiness checklist and release-notes generator.
- JT Cloud: file-size preflight and JSON manifest export; selection reads metadata only and does not upload files.
- JT Code: local snippet vault with copy, delete and JSON export.
- JT Design: five-colour brand palette generator with CSS-variable copy and download.
- JT Motion: shot sequence planner with reorder controls, runtime total and CSV export.
- JT Studio: adjustable low-volume metronome and bar-duration calculator.
- JT Stream: show rundown builder, segment timer, pause/next/reset controls and JSON export.
- Added responsive JT visual styling and local-only state storage for these tools.

### Boundaries
- These additions are browser-local utilities. They do not claim remote sync, provider authentication, desktop execution, video rendering, audio multitrack mixing or live broadcasting.

## Unreleased — January 28 annual promotion

### Changed
- Restored regular Student, Pro and Enterprise monthly and annual proposal prices outside the promotion date.
- Added a recurring 25% discount on both monthly and annual prices on January 28 each year, evaluated using Africa/Lagos (WAT) calendar time.
- Updated the public pricing page and shared JT workspace plan cards to show regular rates outside the promotion and discounted rates only on January 28.
- Kept all prices clearly marked as proposals; checkout and subscription activation remain unavailable.

## Unreleased — JT membership 25% discount revision

### Changed
- Reduced the proposed monthly Student, Pro and Enterprise prices by 25% to ₦1,875, ₦4,875 and ₦90,000 respectively.
- Reduced the proposed annual prices by 25% to ₦18,750, ₦48,750 and ₦900,000 respectively.
- Updated the public pricing page and shared JT workspace plan cards to show discounted prices, previous draft rates and annual savings consistently.
- Clearly labels the discount and all prices as proposals; billing and checkout remain unavailable.

## Unreleased — JT membership plan presentation

### Added
- Replaced the previous generic feature-highlights panel with three clearly named JT membership offers: Student, Pro and Enterprise.
- Added the proposed Nigeria pricing from the internal pricing draft: Student ₦2,500/month (₦25,000/year), Pro ₦6,500/month (₦65,000/year), and Enterprise ₦120,000/month (₦1,200,000/year).
- Updated the public pricing page with plan descriptions, a comparison table, proposed annual prices and clear support links.
- Marked all amounts as proposals, not active checkout prices. The plan panel appears in the shared JT app workspaces.

### Commercial readiness boundaries
- Billing, account entitlements, student verification, renewals, cancellation, refunds, tax handling, usage metering and enterprise team administration are not implemented.
- Enterprise team capacity and service levels are not promised or sold.
- The plans must not be treated as purchasable until the commercial and technical release gates are complete.

## Unreleased — JT Code and JT Design workspace upgrades

### JT Code
- Added import of individual HTML, CSS and JavaScript files into the browser editor, with a 1 MB per-file limit.
- Added download of the currently selected source file alongside the existing standalone HTML export.
- Added Ctrl/Cmd+Enter to refresh the sandbox preview and Ctrl/Cmd+S to save the local draft.
- Kept preview execution inside the existing sandboxed iframe; no host filesystem or terminal access is implied.

### JT Design
- Added triangle and star shape options alongside rounded rectangle and circle.
- Added shape opacity, title colour, caption colour and title-size controls.
- Preserved local save and SVG/PNG export workflows.
- Design content remains local until explicitly exported.

## Unreleased — Private JT Cloud remote storage foundation

### Added
- Added authenticated Pages Functions endpoints for private per-user file listing, upload, download, deletion, and storage usage.
- Added D1 schema for remote file metadata and per-user storage quota accounting.
- Added server-generated R2 object keys, ownership-scoped database lookups, strict same-origin mutation checks, upload validation, 25 MiB initial upload limit, pagination, and private attachment downloads.
- Added a separate remote-storage panel in JT Cloud with remote upload, search, download, delete, and usage display. The existing browser-local vault remains available and separate.
- Added an explicit setup guide for the required private R2 bucket binding and D1 migration.

### Boundaries and prerequisites
- Remote APIs return a clear unavailable response until the Cloudflare R2 binding and D1 schema are configured in the relevant environment.
- Remote folders and automatic local-to-cloud migration are not included in this increment.
- Local IndexedDB files are never uploaded or deleted automatically.
- No bucket was created, no public access was enabled, and no production settings were changed.

## Unreleased — Jeff AI workspace improvements
- Added conversation renaming from the chat header, with an 80-character title limit and local persistence.
- Added a confirmation step and accessible label before deleting a saved conversation.
- Added a Stop control while a provider request is running; cancelling aborts the in-flight browser request and keeps the prompt in the conversation.

### Added
- Passed the user's saved project context and selected text/code attachments through the server-side Jeff AI gateway, with strict size caps and explicit untrusted-reference framing.
- Added Groq as a selectable free-tier provider in the Jeff AI workspace.
- Added full-text conversation search across titles and message content.
- Added export of all local conversations as a JSON backup.
- Added a live provider readiness check in the workspace status area.

### Boundaries
- Conversation history and project context remain browser-local.
- AI provider credentials remain server-side; the provider readiness endpoint exposes status only.
- Provider tests mock upstream requests and do not claim live provider availability.

# JT Apps — Release Notes

## Unreleased — Workspace experience expansion

### Added
- Added a consistent app-specific workspace home to JT AI Core, JT App Manager, JT Cloud, JT Code, JT Design, JT Motion, JT Studio, JT Stream, and Agent Jeff.
- Added local project board with create, edit notes, set active, search, delete confirmation, JSON export and validated JSON import.
- Added app-specific quick-launch labels that jump to the existing tool area.
- Added responsive layouts, accessible labels and visible local-save status.

### Important boundaries
- Project board data is stored in the current browser only. It is not cloud-synced and does not claim to modify native project files.
- Existing app tools retain their own persistence and permissions. Quick launch scrolls to the available tool area; it does not fabricate unavailable integrations.
- Agent Jeff desktop/device actions remain in the dedicated native application with its permission and audit controls.
- Cloud, provider, account and external service status must only be shown when the real integration confirms it.

## Unreleased — Workspace overview and project continuity

### Added
- Added a compact project overview to each JT workspace with total project count, active project, and latest update.
- Persisted the active project selection across page reloads in the same browser.
- Added active-project visual state and retained it when switching between workspace visits.

### Improved
- Hardened project backup import by validating names and identifiers, avoiding duplicate IDs, and reporting the actual number of new records imported.
- Kept the local-only storage disclosure visible; these changes do not introduce cloud synchronization.
- Verified the active-project selection survives reload and that deleting a temporary test entry returns the board to its original state.

## Unreleased — JT Cloud local file workspace

### Added
- Added a dedicated JT Cloud file workspace with nested folder navigation, breadcrumbs, folder creation/rename/deletion (empty folders only), and file listing.
- Added multi-file import into browser-managed IndexedDB, file search across the local vault, folder moves, file deletion, and downloads of the stored original file contents.
- Added file count, folder count, local file-byte totals, browser-origin storage usage/quota estimates, and the browser storage persistence state when supported.
- Added regression tests and a dedicated GitHub Actions workflow for the JT Cloud workspace and static Pages build.

### Storage and service boundaries
- Files and folders are stored in IndexedDB for the current browser origin and device; they are not uploaded to JT servers and do not sync across devices.
- Browser storage is managed by the browser and may be cleared or evicted. The storage estimate describes the whole website origin, not a dedicated JT Cloud quota.
- A real multi-device cloud service still requires authenticated backend APIs, object storage (for example, Cloudflare R2), per-user access controls, server-side quota accounting, and a tested upload/download authorization flow.
- Existing local project boards remain browser-local and separate from the file-content vault.

### Usability refinement
- Replaced native browser prompt-based folder creation and rename with an accessible in-page dialog, after browser smoke testing showed native prompts were not reliably actionable in the workspace.
- Added duplicate folder-name checks within the same parent folder.

- Replaced native browser confirmation prompts for folder and file deletion with accessible in-page confirmation dialogs after smoke testing showed native prompts were not reliably actionable in browser automation.

## Unreleased — JT Cloud file discovery

### Added
- Added Starred and Recent (last seven days) file views.
- Added file sorting by newest, oldest, name, and largest size.
- Added per-file Star/Unstar actions stored with the local file record in IndexedDB.
- Kept these discovery features local to the current browser vault; they do not introduce cloud sync or server-side file storage.

## Unreleased — JT Cloud file intake improvements

### Added
- Added drag-and-drop file import to the current folder, with a visible drop target state.
- Added duplicate filename detection within the destination folder; existing files are retained and duplicate incoming names are skipped with a clear status message.
- Kept duplicate handling folder-scoped, so the same filename can still be used in different folders.

### Storage boundary
- Drag-and-drop and duplicate detection operate entirely in the browser's IndexedDB vault. They do not upload content to JT servers or enable cross-device synchronization.

## Unreleased — Shared projects and reviewed app handoffs

### Added
- Added a shared project shelf available across JT app workspaces in the same browser and website origin.
- Added app-to-app handoff requests with explicit source app, destination app, optional shared project reference, and bounded task text.
- Added target-app-only approval/decline controls and a completion transition, with a local audit trail.
- Added cross-tab refresh so changes made in one JT workspace appear in other open JT workspace tabs.

### Permission and storage boundaries
- Shared projects and handoffs are stored in browser localStorage; they do not sync to the server or across devices.
- Only project name, project summary, and the specific task text are included. Files, credentials, and desktop permissions are never attached.
- A handoff is a reviewed task brief, not remote tool execution. Approval does not run actions in another app.
- Agent Jeff desktop/device control remains isolated to the dedicated Agent Jeff application and its own permission and audit controls.
