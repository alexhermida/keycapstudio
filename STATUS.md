# Project status

Last updated: 2026-09-16.

## Current phase

Experimental MVP baseline: the user reports improved printing after the planar-side correction and confirms that the latest cap fits well. Preserve the current geometry and socket dimensions. Full travel, clearance, retention, removal, and repeatability have not been individually confirmed; physical legend relief remains unresolved. The corrected geometry is now publicly deployed. See CALIBRATION.md.

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
- 28 unit/domain tests pass: four exterior-plane regressions, preserved socket cross-sections, curved inlay checks, bounds, connected body, watertight edges, volume conservation, serialized-mesh overlap, holes, islands, determinism, SVG rejection, and archive packaging.
- Six Chromium/Firefox checks pass: actual worker generation, upload/edit/download, error recovery, session reset, and automated WCAG A/AA checks.
- Production-build smoke test passes under a repository subpath, including lazy chunks, worker, WebAssembly, and model generation. GitHub-hosted quality checks passed after the initial push to main.
- Formatting and staged-content privacy checks pass; private references and generated artifacts remain ignored.
- A private representative SVG passed a local browser smoke check without being added to public fixtures.
- Local browser inspection verified the desktop workspace and curved model preview.
- Slicer CLI inspection read the sample as a manifold model with the intended 18 mm square footprint. Import diagnostics recognized one assembly and two component volumes. Interactive part selection/material reassignment remains unverified: native UI automation was unavailable, and CLI project re-export did not yield a usable verification artifact.
- The user subsequently confirmed separate Body and Legend parts in the slicer GUI.
- Read-only cross-section diagnostics confirm that the upright model starts its socket boss 1 mm above the base as an unsupported layer island. Domain tests do not establish printability without supports. Photos establish the first failed result, but that trial's exact sliced project has not been inspected.
- The supported follow-up's saved project and two slicer screenshots were inspected privately. Both stored legend meshes match the intended surface within 0.000002 mm after component transforms, with zero measured protruding volume. The archive contains no G-code; actual toolpath behavior and the cause of the physical relief remain unverified.
- User feedback confirms seating for one side-printed sample, initially tight. The same trial's upright sample and external reference did not fit; no dimensional change is justified from this comparison alone.
- Pre-fix mesh diagnostics identified a nonplanar bed-contact side spanning approximately 0–0.1754 mm above the bed in the saved orientation. A close-up showed a consistent crescent-shaped patch absent before support removal. The approved correction now separates the straight taper from the curved roof; all four exterior plane regressions pass. The representative local SVG also generated and downloaded corrected geometry with no browser errors.
- Follow-up feedback reports improved printing and, on 2026-09-16, good fit for the latest sample. This is sample-level seating evidence, not validation of every mechanical dimension or printing setup. The legend still appears raised; no geometry changed in response.
- Read-only deployment checks on 2026-09-16: the configured custom-domain app returns HTTP 200. The latest successful Pages workflow is run 34706535559 at revision `9cbb065` (2026-09-12), while remote main is `9c85b06`, containing the planar-side correction. The public deployment is behind the corrected baseline.
- Subsequent deployment verification supersedes that gap: user-triggered Pages run 35145291350 successfully published `9c85b06`, including all workflow checks. The public geometry-worker asset matches the corrected local build byte-for-byte. The documentation baseline commit was also pushed by the user.
- A subsequent private G-code export was inspected read-only. Model extrusion moves share nominal layer heights; the legend is sliced as outer walls in the successful side orientation. Sampled narrow legend sections contain strongly overlapping opposing extrusion lanes without a corresponding reduction in extrusion density. This is a testable slicing lead, not a reproduced physical defect or a confirmed cause. No model or printing settings were changed.
- A second user-supplied slice uses adaptive-width walls: both sampled overlapping legend-lane pairs become single wider lanes, sampled outward bead envelopes remain within 0.02 mm, and total legend extrusion decreases by approximately 44.7% with unchanged layer coverage. Sampled socket-opening envelopes remain close to the prior slice. These private diagnostic checks do not establish physical quality or fit; a print comparison is pending. See CALIBRATION.md for limitations.

## Remaining acceptance gates

- User physical print: good seating is reported for the latest sample. Retention, removal, full travel, surrounding clearance, repeatability, and flush legend quality remain to be established. Dimensions are retained as the working baseline, not a broadly validated fit specification.
- Slicer: separate parts are confirmed; inspect actual layer/support coverage for the socket boss and cavity roof.
- Public Pages deployment: corrected geometry is verified live; the deployment workflow's browser checks passed. This does not substitute for physical print validation.

## Next work

- Preserve the working geometry; confirm the remaining mechanical observations without requiring a dimension change. Keep private calibration settings out of the repository.
- Physically compare the adaptive-width slice against the existing sample, retaining the successful orientation and avoiding further simultaneous adjustments. Check legend relief, preserved icon detail, and socket fit; provide a close-up. The toolpath comparison supports a slicing-related overpacking hypothesis, but the physical cause is not confirmed. A matching saved project remains necessary for exact mesh-to-toolpath comparison.
- Future code changes still require a manual Pages deployment; pushing main alone does not publish them.
- After the baseline and legend investigation, consider a bounded socket-fit adjustment with today's dimensions as the default. Isolate stem/socket generation internally while retaining Body + Legend export; a separately exported Stem is not needed for this control. UI implementation and the physically tested adjustment range remain future work.
- Incorporate print feedback through CALIBRATION.md before changing validated dimensions or claiming compatibility.

## Scope retained

One fixed 1u K2 lighting-key preset, filled SVGs, two colors, and single-session editing. Approximate outer shape is acceptable. Text, fonts, other keycaps/keyboards, editable project persistence, automatic stroke conversion, and mechanical customization remain deferred.
