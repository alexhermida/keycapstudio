# Project status

Last updated: 2026-09-20.

## Current phase

Parametric OEM R1–R4 editor, default R4 · 1u. Base width/depth, front/rear edge-center heights, and corner radius are editable in millimeters. The lower insertion region comes unchanged from the previously printed KeyV2 reference; the exterior and roof connection are new and not physically verified. Historical evidence below applies only to the artifacts named there. No deployment is included in this change.

## Current implementation — parametric profiles

- Accepted UI terminology uses OEM R1–R4; the K2 lighting position is R4. The previous `row5` identifier is internal to the historical KeyV2 template.
- Preset changes and Reset restore reference measurements; artwork and colors stay independent.
- Collapsible localized controls, direct numerical entry, and actual exported-mesh dimensions.
- Worker-generated shell, fixed reference insertion region, existing flush Body/Legend pipeline.
- Previous assets and procedural geometry remain available for regression and rollback; they are not presented as the new presets.
- Verification: TypeScript, ESLint, production build, and 49 domain tests pass. New regressions cover all four 18 mm presets, measured edge-center heights, reference insertion-volume equivalence, serialized solid validity, and all 32 combinations of dimension bounds. Chromium/Firefox pass 16 workflow/accessibility checks, including downloaded dimensions, deterministic Reset, every row, and localized mobile layout. New physical fit, removal, travel, clearance, and print-quality checks remain open.

## Historical implementation and evidence

## Implemented

- Standalone React/TypeScript repository with a light desktop editor.
- Local SVG upload, original examples, centered sizing, and two color controls.
- Interactive 3D preview with orbit, zoom, top, and underside views.
- Geometry worker with cancellation on input changes, timeout, progress, and recoverable errors.
- Deterministic approximate K2 lighting-key geometry, hollow shell, blind cross socket, and flush inlay.
- Isolated stem/socket assembly module with explicit geometry ownership and unchanged fixed dimensions. Advanced switch-fit control documented as future work, not implemented.
- Separate watertight Body and Legend meshes, including disconnected legend islands.
- Model-only 3MF with assembly/part names and independent material assignments.
- Strict SVG validation, fill rules, transforms, implicit closure, and bounded complexity.
- TypeScript, ESLint, Prettier, Vitest, Playwright, and automated accessibility checks.
- GitHub quality-check and manual Pages deployment workflows.
- Agent instructions, human documentation, calibration records, dependency rationale, and milestone commits.
- Private artwork, photos, test exports, and local settings excluded from Git.
- Current blank extraction for the OEM comparison: the complete procedural blank and matching solid exterior envelope are available for development inspection without changing runtime geometry.
- The browser worker now loads pinned OEM row 5 blank/exterior meshes locally and applies the existing SVG inlay/export pipeline. The previous procedural generator remains for comparison and rollback.
- A selectable OEM catalogue now offers rows 1–5 at 1u and row 5 at 1.25u, 1.5u, and 1.75u. The selected variant drives the worker, preview, and 3MF; SVG artwork, its millimeter size, and colors remain independent.
- Prominent header buttons link to the public GitHub repository and the creator's Buy Me a Coffee page.
- Header buttons use locally bundled GitHub and Buy Me a Coffee brand pictograms. The in-app print guide explains assembled 3MF import, model orientation, the successful side-placement observation, support and layer-preview checks, the partial Arachne improvement, and fit checks without prescribing unvalidated machine settings.
- The local editor now offers bounded corner-radius and row-relative height choices for every catalogue entry, in 0.25 mm steps. Nonzero height is labeled OEM derived; changed measurements are experimental. The original mesh pair remains the exact default and the worker loads only the chosen generated pair. The user explicitly chose not to require a separate physical print before offering each option.

## Verification evidence

- Preview rendering correction: the separately rendered Body and Legend meshes intentionally share a flush exterior surface. A GPU depth tie could flicker along the legend while orbiting. The Legend preview material now uses a depth offset, without changing the mesh arrays, geometry worker, or 3MF exporter. Automated geometry/export checks remain the evidence that printing geometry is unchanged.
- Mobile regression after localization: Chromium and Firefox at 390 × 844 render the localized header without horizontal overflow; Help remains reachable, and its dialog stays within the viewport with internal scrolling. This is browser-layout evidence only.
- The locally bundled header icons and expanded print guide pass formatting, type checking, linting, 41 unit tests, production build, and Chromium/Firefox accessibility checks. A local browser smoke check confirmed both icons and the expanded guide. No print-orientation change was made to the 3MF.
- The provisional Thangs link was replaced with the supplied Buy Me a Coffee profile URL and matching bundled icon. The URL returned HTTP 200; type checking, linting, 41 unit tests, production build, formatting, and Chromium/Firefox accessibility checks pass after the change.
- Type checking, linting, and production build pass.
- 38 unit/domain tests pass: three pre-extraction mesh fingerprints, three direct stem/socket tests, four exterior-plane regressions, preserved socket cross-sections, curved inlay checks, bounds, connected body, watertight edges, volume conservation, serialized-mesh overlap, holes, islands, determinism, SVG rejection, archive packaging, and the new variant catalogue.
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
- A second user-supplied slice uses adaptive-width walls: both sampled overlapping legend-lane pairs become single wider lanes, sampled outward bead envelopes remain within 0.02 mm, and total legend extrusion decreases by approximately 44.7% with unchanged layer coverage. Sampled socket-opening envelopes remain close to the prior slice. On 2026-09-20, the user reported somewhat less tactile legend relief, although a small amount remains, and confirmed that the printed piece works properly when asked about fit, removal, and travel. See CALIBRATION.md for limitations.
- The OEM comparison baseline was extracted from revision `3ff9440` with `manifold-3d@3.5.3`. Ignored development artifacts under `_tmp/oem-template-comparison/` contain the complete blank, exterior envelope, and a manifest with configuration, bounds, volumes, and SHA-256 hashes. Existing 3, 8, and 11 mm mesh fingerprints remain unchanged.
- The development STL writer was corrected after inspection found that all three vertices in each binary STL triangle record were being written to the same slot. The regenerated baseline files have matching byte lengths, finite coordinates, and zero degenerate triangles; STL import in a slicer should be retried with these files.
- The KeyV2 recipe was corrected to include definitions without the upstream example key, and to keep structural flared supports while disabling sacrificial print aids. OpenSCAD `2026.03.07` generated the final candidate blank and matching exterior. Both import as a single valid Manifold solid; the blank lies within its exterior. Measured differences and hashes are in [the comparison report](docs/plans/oem-template-comparison-results.md). One printed sample now passes the requested mechanical checks; the local web build uses the OEM preset.
- A development comparison runner applies the same public Spark SVG to both blanks using the existing parser, inlay operation, and 3MF exporter. The 8 mm OEM 3MF passes closed-solid, connected Body, no-overlap, reconstruction, and archive-structure checks; 3 and 11 mm Spark trials also preserve legend volume on the OEM roof. The matching current 8 mm 3MF is available locally. A current-baseline Spark trial at 11 mm yielded a disconnected Body and is recorded as a separate edge case. Physical legend finish remains open.
- User-supplied slicer preview of the OEM 8 mm 3MF in the upright, icon-up orientation shows strongly visible diagonal top-surface toolpaths around the legend. This is slicing evidence against recommending upright as the preferred finish, not a physical print result. Broad-side mesh fitting finds the candidate sides are not perfectly planar, so a side trial must use a fresh lay-on-face placement and inspect first-layer contact/support coverage.
- On 2026-09-19, the user reported that the OEM comparison print turned out well and confirmed seating without force, firmness, removal, full travel, and no rubbing against adjacent keys or case. Some legend relief is perceptible. These observations validate one sample's mechanical behavior, but not repeatability or flush printed finish.
- Local OEM runtime verification: 37 unit/domain tests, type checking, linting, and production build pass. Six Chromium/Firefox browser checks pass, including a downloaded 3MF with the OEM footprint. A separate `/keycaps/` production build loads and enables export in Chromium, exercising the worker and local mesh URLs under a repository subpath. The KeyV2 license accompanies the built assets.
- The seven additional OEM blank/exterior pairs were generated with the pinned KeyV2 source and OpenSCAD recipe. Their source and asset hashes are recorded in [the variant manifest](docs/plans/oem-variant-manifest.json); tests check the bundled assets against it. Geometry tests confirm each imported solid, blank containment, conserved inlay volume at 3/8/11 mm, one connected Body at 8 mm, and negligible Body/Legend overlap and reconstruction difference. All eight browser workflow checks pass, including a 1.5u download with its expected width. A `/keycaps/` build loaded and generated a 1.75u variant in Chromium. None of the seven variants has physical fit evidence.
- The bounded measurement catalogue contains 192 modified blank/exterior pairs generated from the pinned KeyV2 source. All asset hashes, solid imports, blank containment (within a 0.001 mm³ tessellation tolerance), and 8 mm Spark inlays pass; a direct check confirms ±0.5 mm height changes in the row 5/1u mesh. The unchanged defaults reuse their prior assets. Forty-one unit/domain tests, type checking, linting, formatting, and the production build pass; ten Chromium/Firefox browser checks cover altered and reset 3MF exports. A `/keycaps/` build loaded a modified model without browser errors. These are software results, not physical fit evidence.

## Remaining acceptance gates

- User physical print: good seating is reported for the latest sample. Retention, removal, full travel, surrounding clearance, repeatability, and flush legend quality remain to be established. Dimensions are retained as the working baseline, not a broadly validated fit specification.
- OEM physical print: one sample passes the requested mechanical checks; legend flushness and repeatability remain open.
- New OEM rows/widths: physical fit, clearance, stabilizer needs, and print quality are open for every variant beyond row 5/1u.
- Slicer: separate parts are confirmed; inspect actual layer/support coverage for the socket boss and cavity roof.
- Public Pages deployment: corrected geometry is verified live; the deployment workflow's browser checks passed. This does not substitute for physical print validation.

## Historical next-work notes (superseded where covered above)

- [Localization and contextual help](docs/plans/localization-and-help.md) is implemented locally: English/Galician/Spanish, browser-language detection with a session-only choice, localized measurements/labels, concise privacy wording, and an accessible native modal for privacy and printing. This change does not alter geometry or physical validation; deployment remains separate.
- On `feat/oem-shape-height`, the initial radius probes led to a generated bounded measurement catalogue for all eight row/width entries. The original browser assets are unchanged. Modified geometry is available locally but remains experimental; collect print feedback when available without treating it as a prerequisite for use.
- [OEM shape and height customization](docs/plans/oem-customization.md) is implemented locally with narrow software bounds. Future physical feedback may refine those bounds, but is not a precondition for the experimental controls.
- Inspect and print selected experimental OEM variants before claiming fit on any additional key. The catalogue and SVG-independent selection are implemented locally; physical validation remains variant-specific.
- Investigate the physically raised legend through a controlled slicing/print comparison. Preserve the flush digital part boundary and avoid an unvalidated depth change.
- Preserve the working geometry; confirm the remaining mechanical observations without requiring a dimension change. Keep private calibration settings out of the repository.
- Follow up on the improved but still raised adaptive-width print with a close-up and matching slice if pursuing a fully flush finish. Fit and travel were confirmed for this sample; the remaining physical cause of the slight relief is not confirmed.
- Future code changes still require a manual Pages deployment; pushing main alone does not publish them.
- Stem/socket isolation is complete with unchanged output. After the baseline and legend investigation, plan physical calibration for the documented Advanced switch-fit control before choosing its adjustment semantics, bounds, and step size. Keep today's dimensions as the default and retain Body + Legend export. UI implementation remains future work.
- Incorporate print feedback through CALIBRATION.md before changing validated dimensions or claiming compatibility.

## Current scope

OEM R1–R4 with bounded outer dimensions, filled SVGs, two colors, and single-session editing. The earlier KeyV2 row5/1u sample is historical physical evidence only. Text, fonts, other profiles, stabilized sizes, persistence, automatic stroke conversion, and socket-fit tuning remain deferred.
