# Project status

Last updated: 2026-09-13.

## Current phase

Software MVP implemented and locally verified. One supported side-printed sample seated after initial tightness; the upright sample and a previously successful reference model did not fit in the same trial. Full travel and repeatable fit remain unvalidated. A small missing region and slight legend relief remain under review; saved-project inspection found no geometric legend protrusion. See CALIBRATION.md.

## Implemented

- Standalone React/TypeScript repository with a light desktop editor.
- Local SVG upload, original examples, centered sizing, and two color controls.
- Interactive 3D preview with orbit, zoom, top, and underside views.
- Geometry worker with cancellation on input changes, timeout, progress, and recoverable errors.
- Deterministic approximate K2 lighting-key geometry, hollow shell, blind cross socket, and flush inlay.
- Separate watertight Body and Legend meshes, including disconnected legend islands.
- Model-only 3MF with assembly/part names and independent material assignments.
- Strict SVG validation, fill rules, transforms, implicit closure, and bounded complexity.
- TypeScript, ESLint, Prettier, Vitest, Playwright, and automated accessibility checks.
- GitHub quality-check and manual Pages deployment workflows.
- Agent instructions, human documentation, calibration records, dependency rationale, and milestone commits.
- Private artwork, photos, test exports, and local settings excluded from Git.

## Verification evidence

- Type checking, linting, and production build pass.
- 22 unit/domain tests pass: bounds, connected body, watertight edges, volume conservation, serialized-mesh overlap, holes, islands, determinism, SVG rejection, and archive packaging.
- Six Chromium/Firefox checks pass: actual worker generation, upload/edit/download, error recovery, session reset, and automated WCAG A/AA checks.
- Production-build smoke test passes under a repository subpath, including lazy chunks, worker, WebAssembly, and model generation. GitHub-hosted quality checks passed after the initial push to main.
- Formatting and staged-content privacy checks pass; private references and generated artifacts remain ignored.
- A private representative SVG passed a local browser smoke check without being added to public fixtures.
- Local browser inspection verified the desktop workspace and curved model preview.
- Slicer CLI inspection read the sample as a manifold model with the intended 18 mm square footprint. Import diagnostics recognized one assembly and two component volumes. Interactive part selection/material reassignment remains unverified: native UI automation was unavailable, and CLI project re-export did not yield a usable verification artifact.
- The user subsequently confirmed separate Body and Legend parts in the slicer GUI.
- Read-only cross-section diagnostics confirm that the current upright model starts its socket boss 1 mm above the base as an unsupported layer island. All 22 domain tests still pass; these do not establish printability without supports. Photos establish the failed result, but the exact sliced project has not been inspected.
- The supported follow-up's saved project and two slicer screenshots were inspected privately. Both stored legend meshes match the intended surface within 0.000002 mm after component transforms, with zero measured protruding volume. The archive contains no G-code; actual toolpath behavior and the cause of the physical relief remain unverified.
- User feedback confirms seating for one side-printed sample, initially tight. The same trial's upright sample and external reference did not fit; no dimensional change is justified from this comparison alone.
- Further mesh diagnostics identify a nonplanar bed-contact side in the saved orientation, spanning approximately 0–0.1754 mm above the bed. This may contribute to the missing patch; its location and timing relative to support removal still need confirmation. No geometry changed.

## Remaining acceptance gates

- User physical print: seating, retention, removal, full travel, surrounding clearance, roof integrity, and legend quality. All mechanical values remain provisional.
- Slicer: separate parts are confirmed; inspect actual layer/support coverage for the socket boss and cavity roof.
- Public remote and Pages deployment: main was pushed and the user enabled Actions-based Pages with HTTPS. Deployment execution has not been verified.

## Next work

- Confirm full travel and clearance on the seated sample. Establish repeatable reference fit with a controlled printing baseline before selecting a socket dimension change; keep private calibration settings out of the repository.
- Inspect the missing region and legend relief in physical close-ups and the corresponding sliced toolpaths before selecting a geometry change.
- Run and verify the manual Pages deployment when requested.
- Incorporate print feedback through CALIBRATION.md before changing validated dimensions or claiming compatibility.

## Scope retained

One fixed 1u K2 lighting-key preset, filled SVGs, two colors, and single-session editing. Approximate outer shape is acceptable. Text, fonts, other keycaps/keyboards, editable project persistence, automatic stroke conversion, and mechanical customization remain deferred.
