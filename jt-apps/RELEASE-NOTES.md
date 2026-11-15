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
