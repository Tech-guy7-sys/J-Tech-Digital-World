# JT Digital World — project progress snapshot

**Snapshot date:** 2026-10-18  
**Source of truth:** GitHub repository and workflow results inspected on this date.  
**Important:** This document distinguishes committed source/configuration from verified deployment, published releases, and features that are only planned.

## Website and Cloudflare Pages
- Main website repository: https://github.com/Tech-guy7-sys/jt-digital-world
- Default branch: main.
- Website build command: `npm run build:website`.
- Build output: `dist`.
- Build script: `scripts/build-site.mjs`.
- Wrangler Pages output points to `./dist`.
- GitHub Actions website CI had successful runs on 2026-10-17 (runs 39052255044 and 39052251267); an earlier run in the same push sequence failed (39052242372). The latest observed runs succeeded, but local build reproducibility and live Cloudflare deployment still need their own verification.
- Cloudflare account connection/project: not verified as connected.
- Custom domain: not purchased or verified. `jtdigitalworld.com` remains a candidate only.
- Static build only: no root `functions/` directory was present in the inspected tree. Sign-in persistence, API routes, update manifests, billing, and cloud APIs must not be advertised as operational until implemented and tested.

## GitHub repositories and releases
- Repositories visible in the connected GitHub account: `jt-digital-world`, `agent-jeff`, `jeff-ai`, and `jt-studio`.
- No published GitHub Releases were returned for these four repositories at the time of inspection.
- The main repository includes a `JT App Releases` workflow, but the existence of a workflow does not mean a release or installer has been published.
- Existing release notes in the repository include versions through 62.0.0, but these files are source documentation, not proof of a published GitHub Release or verified installer.
- Existing Windows installer guidance requires actual build outputs, install/upgrade/uninstall testing, and checks before public release. Do not fabricate setup EXEs or claim unsigned builds are signed.
- The website CI latest successful run: https://github.com/Tech-guy7-sys/jt-digital-world/actions/runs/39052255044
- The most recent observed JT Command Agent daily health scan succeeded: https://github.com/Tech-guy7-sys/jt-digital-world/actions/runs/39115236222
- Agent Jeff Windows desktop workflow history has mixed successes and failures; inspect the latest relevant run and its logs before declaring the installer pipeline healthy.

## JT Stream — new requirement
- JT Stream should have a creator-studio capability set comparable to Camo Studio, including camera inputs and image controls, scenes/layers/overlays, effects, multi-source audio mixing, recording, RTMP/RTMPS streaming, session profiles, transitions, web/chat layers, hotkeys/control-surface integration, and diagnostics.
- JT Stream must retain original JT branding and UI rather than copy Camo's assets or interface.
- A detailed specification is recorded in `JT-STREAM-CAPABILITY-SPEC.md`.
- The current website page is a product preview/roadmap, not proof those production capabilities are implemented. All features must be marked planned until they pass their acceptance tests.

## Recent confirmed configuration commits (main website repo)
- `333954c` — added allowlisted static website build script.
- `2a426e5` — added website CI workflow.
- `ca150f3` — added Cloudflare/GitHub setup documentation.
- `45b386b` — added build output and secret exclusions to .gitignore.
- `3068797` — added the website build command to package.json.
- `4788fc4` — pointed Wrangler Pages at `./dist`.

## Next steps
1. Run `npm run build:website` locally and verify the expected files in `dist`.
2. Connect the repository to Cloudflare Pages, deploy, and test the `pages.dev` preview.
3. Buy/connect a custom domain only after checking spelling and renewal cost.
4. Fix/verify the Windows installer workflow against actual build logs; publish releases only after real artifacts and installation tests pass.
5. Create a dedicated `jt-stream` repository when the user is ready, then implement the specification in stages with real camera/audio/recording/streaming tests.
6. Keep each app's GitHub Releases page honest: version tag, release notes, source archive, and only those platform installers that were actually built and tested.


## Additional progress — 2026-10-18
- Added `JT-STREAM-CAPABILITY-SPEC.md` (commit `fd5f5d3`) covering camera input and controls, scene/layer composition, overlays/effects, multi-source audio, recording, RTMP/RTMPS streaming, profiles, hotkeys, creator integrations, Jeff AI assistance, safety, and acceptance tests.
- Updated `jt-apps/jt-stream/index.html` (commit `061357e`) to show the expanded creator-studio roadmap and clearly label production features as planned rather than already working.
- Updated `.github/workflows/jt-app-releases.yml` (commit `2f7b290`) to build the actual site with Node 22 and `npm run build:website`, verify key output files, and package the contents of `dist` as a website ZIP. This fixes the previous workflow's mismatch with the repository's root-based site layout.
- Added this progress snapshot (commit `f5b0c2e`).
- Website CI for the Stream page commit completed successfully: https://github.com/Tech-guy7-sys/jt-digital-world/actions/runs/39128815646. The static build and required-output checks passed. This validates the static build, not a live Cloudflare deployment.
- GitHub Releases API returned an empty list for the main website repository and the three app repositories checked. Release workflow improvements are committed, but no new release has been published and no Windows installer is claimed.
