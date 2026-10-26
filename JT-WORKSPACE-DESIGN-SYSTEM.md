# JT Workspace Design System

This is the shared visual direction for J Tech Digital World desktop and browser workspaces. Apply it to each app's actual home/workspace screen; do not leave the home page as a generic blank dashboard.

## Visual identity
- Brand: JT. Product names use the JT prefix where appropriate.
- Dark-first studio UI: deep ink background, layered slate surfaces, violet primary action, restrained cyan/green status colors, high-contrast text.
- Typography: system sans-serif; clear title, section, body and helper-text hierarchy.
- Use subtle radial lighting, gradient accents and restrained borders; avoid excessive glow and decorative clutter.
- Responsive layout: sidebar/navigation, workspace canvas, compact toolbars and stacked mobile layout.

## Home page structure
1. Top bar: JT product mark, current project, save/sync status, undo/redo where supported, settings and help.
2. Welcome/hero area: app-specific value proposition and primary action.
3. Recent projects: resume, duplicate, rename, open or archive where those actions are implemented.
4. Category template gallery: visual cards with template name, purpose, dimensions/format and a clear “Use template” action.
5. Quick actions: app-specific actions, not generic dead-end buttons.
6. Learn / recent activity: shortcuts, project health or recent actions appropriate to the product.

## Workspace structure
- Left navigation for projects, assets, layers, tracks, scenes or files depending on product category.
- Central work surface: timeline for video/audio/streaming; canvas for design; editor/preview for code; project and file views for cloud; conversation/workflow for AI.
- Contextual right inspector for selected object/scene/track/file.
- Bottom status strip for save state, errors, selection and platform-appropriate status.
- Empty states explain the next step and provide a working create/import/template action.

## Interaction and accessibility
- Keyboard focus must remain visible; controls need labels and accessible names.
- Support keyboard operation for primary workflows.
- Use confirmations for destructive replacement/deletion and show clear undo/recovery options where feasible.
- Autosave status must reflect actual persistence; do not show “synced” unless a remote sync operation succeeded.
- Respect reduced-motion settings and keep animation subtle.
- Do not ship fake buttons, placeholder links, fake live status, or invented feature claims.

## Category template requirements
- Every category template should have a versioned data format, unique ID, name, description and defaults that the app can validate.
- Templates must be discoverable in the product UI and create editable starting projects.
- Preserve the user's current work; replacing an existing project requires explicit confirmation.
- Separate implemented templates from designs that are only documented. JSON template packs are not automatically integrated into an app until code loads and applies them.
