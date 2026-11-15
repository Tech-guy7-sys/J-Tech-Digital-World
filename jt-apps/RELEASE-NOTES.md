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
