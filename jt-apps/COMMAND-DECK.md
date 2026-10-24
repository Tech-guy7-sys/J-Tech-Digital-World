# JT Command Deck

The shared JT workspace shell loads `/jt-apps/command-deck.js` on app pages. JT Stream Studio also includes the launcher directly.

## Controls
- Press **Ctrl+K** on Windows/Linux or **⌘K** on macOS to open the searchable command deck.
- Search for JT apps, downloads, account settings, or workspace actions.
- Use **↑/↓** to move through results, **Enter** to run the selected command, and **Esc** to close.
- Select **Focus the workspace** to jump to the interactive tools on the current page.
- Use **Export JT local workspace backup** to download matching JT browser-local storage records as JSON.
- Use **Import JT local workspace backup** to restore a JSON backup. The importer accepts the supported format, caps files at 5 MB, filters keys to JT workspace namespaces, and asks before replacing matching local keys.

## Important boundaries
The Command Deck is a front-end navigation and local backup tool. It does not grant desktop permissions, execute shell commands, install applications, connect an AI provider, or upload local data. Backups remain on the user's device until the user chooses to move them. The import action overwrites matching local-storage keys, so export a backup before restoring if current data matters.

## Source
- `jt-apps/command-deck.js` — launcher UI and actions.
- `jt-apps/app.js` — loads the launcher for app workspaces.
- `jt-apps/jt-stream/studio.html` — direct launcher include for the dedicated studio page.
- `.github/workflows/website-ci.yml` — syntax and packaging checks.
