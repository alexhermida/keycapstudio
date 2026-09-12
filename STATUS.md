# Project status

Last updated: 2026-09-12.

## Current phase

Implementation authorized. Build the agreed MVP, verify software behavior, and commit meaningful milestones. Physical fit remains a user validation gate.

## Confirmed

- TypeScript and React replace the original Python implementation requirement.
- MVP: K2 top-right 1u lighting keycap, SVG upload, centered adjustable legend, 3D preview, and two-color 3MF export.
- Text, font selection, and support for other keycaps/keyboards are deferred.
- GitHub Pages hosting with all processing in the browser.
- Maintain agent guidance, a human README, progress tracking, domain documentation, calibration records, and architectural decisions alongside the code.
- Tests, linting, modular code, and frontend quality practices are required.
- The repository will be public; personal printing setup details must remain outside it.
- Approximate reproduction of the original outer shape is acceptable. Mechanical shape customization is a future direction, outside the fixed-geometry MVP.
- MVP accepts filled-path SVG artwork. Users may convert outlines to filled paths before upload; automatic stroke conversion is deferred and unsupported strokes must produce clear guidance.
- Single-session upload, adjust, and download is sufficient. Refresh starts a new design; editable project saving, restoration, and reopening are deferred.
- Desktop/laptop use is the primary MVP target. Keep the layout adaptable; full mobile interaction support and mobile-specific testing are deferred.
- Visual direction: light minimal workspace, compact left-hand controls, large softly lit 3D preview on the right, neutral interface colors, and a clear Download 3MF action.
- The app directory is a standalone Git repository and is the intended root of the future public remote. The parent Python project is outside this repository.

## Completed

- Inspected the app directory: no existing application implementation.
- Recorded domain terms and the MVP scope decision.
- Recorded the browser-only deployment decision.
- Added AGENTS.md, README.md, STATUS.md, CALIBRATION.md, and docs/MVP.md.
- Added privacy guidance and removed requirements to record personal printing setup details in calibration records.
- Recorded qualitative switch-fit evidence from an externally generated keycap.
- Inspected a candidate reference 3MF in place: separate Keycap, Legend, and Stem parts; recorded provisional mesh measurements without copying the file or its private metadata into the repository. Its identity as the successful print remains uncertain.
- Inspected eight original keycap photos and recorded qualitative shape observations plus tentative caliper readings. Added a local ignore rule for temporary reference files.
- Defined front/rear orientation and recorded the user's corrected corner/midpoint heights: front 10.8/10.0 mm, rear 11.8/10.8 mm. These supersede single-height interpretations; physical print validation remains pending.
- Inspected a private representative SVG: four disconnected filled paths, cubic curves, a nonzero viewBox origin, and no explicit closepath commands. Recorded parsing and grouping requirements without copying the artwork into public fixtures.
- Initialized the standalone app repository on branch main. Temporary references remain ignored; no commits, remote, or publication have been created.

## Next

- Define export acceptance checks without recording personal printing setup details.
- Establish the K2 variant and any existing physical calibration evidence.
- Choose and document a simple approximate geometry using the reference observations, keeping uncertain widths and socket dimensions provisional until physical validation.
- Resolve SVG acceptance details and the essential editing/preview workflow.
- Prepare GitHub workflows at this repository root; remote creation and publication remain pending.
- Select essential preview interactions and desktop browser checks during implementation.
- Scaffold the app and quality checks after the dependent design decisions are resolved.

## Verification

- Geometry, SVG validation, and 3MF export are implemented. The first 20 domain tests pass, including watertightness, serialized-mesh overlap, holes, disconnected islands, invalid input rejection, and archive structure. UI/browser verification is in progress.
- No physical fit or print-quality validation has been established in this project.
- A prior external print reportedly fit the target switch, but does not validate this project's geometry.
- Candidate 3MF XML and mesh bounds were inspected; all mesh edges have two incident triangles. Full solid validity and fit have not been verified.

## Gates and open decisions

- Physical calibration requires user print feedback; provisional dimensions must not be treated as validated.
- Front/rear orientation and approximate corner/midpoint heights are recorded. The top-width discrepancy remains documented uncertainty; an exact replica is not required, so it does not block the design interview.
- Export acceptance procedure remains open; public compatibility targets are specified in docs/MVP.md.
- Geometry library, remaining SVG subset details, and specific test tooling remain undecided. Visual direction is confirmed.
