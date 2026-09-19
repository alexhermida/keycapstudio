# MVP requirements

## Agreed scope

Generate a printable replacement for the user's Keychron K2 top-right 1u lighting keycap. Use React and TypeScript; host on GitHub Pages with all processing in the browser. Keep uploaded SVG data local.

The workflow includes SVG upload, a centered legend with adjustable size, a 3D preview, one body color, one legend color, and a downloadable 3MF.

## Editing session

The MVP workflow is upload, adjust, and download. Editable designs exist only for the current page session; refreshing the page starts a new design. Saving or reopening editable projects, automatic design restoration, and importing an exported 3MF back into the editor are deferred. A downloaded 3MF remains usable in the slicer independently of the app session.

## Device target

Desktop and laptop browsers are the primary MVP target, with mouse and keyboard interaction and room for controls beside a large 3D preview. Keep the layout adaptable to narrower screens; full phone/tablet interaction support and mobile-specific testing are deferred. Desktop accessibility remains part of implementation quality.

## Visual direction

Use a light, minimal workspace with compact controls on the left, a large softly lit 3D preview on the right, neutral interface colors, and one clear Download 3MF action. Let the keycap and chosen material colors be the visual focus.

## Mechanical and export requirements

- Cherry MX compatible stem; provisional dimensions and physical evidence live in CALIBRATION.md.
- The outer shape may approximate the original cap's taper, rounded corners, and concave top; exact reproduction is not required. Prioritize switch fit, clearance during key travel, and a usable printable legend. Document provisional geometry choices and validate them with a physical print.
- Separate watertight Body and Legend meshes, without overlapping volume.
- Legend flush with the outer keycap surface and approximately 0.5 mm deep.
- One `Custom Keycap` assembly with `Body` and `Legend` parts that can be assigned to different materials/extruders in the slicer.
- No sliced G-code. OrcaSlicer / Snapmaker Orca compatibility is a public product requirement, independent of any contributor's personal setup.

## SVG requirements

Support simple icon SVGs: filled paths, multiple paths, holes, viewBox, and common SVG transforms. Clearly reject unsupported inputs.

The user accepts converting outline artwork to filled paths before upload. Automatic stroke conversion is deferred. If visible strokes contribute to the artwork, including artwork mixing fills and strokes, reject it with an actionable instruction to convert strokes to filled paths in an SVG editor and export again. Do not silently omit strokes or treat stroke-only geometry as filled artwork. A declared but non-rendering stroke, such as `stroke="none"`, is not itself unsupported artwork.

The implemented subset rejects clipping, masks, gradients, transparency, embedded raster images, text, stylesheets, and external resources. Convert basic shapes to filled paths before upload. Limits are 150 KB, 256 elements, 2,000 path commands, and 20,000 sampled contour points.

### Representative input observations

A user-supplied local SVG contains four separate filled paths, one solid fill color, straight segments, cubic Bezier curves, and a viewBox with a nonzero origin. It contains no strokes, text, raster images, masks, clipping, or transforms. Keep this private reference in the ignored temporary directory; use original synthetic fixtures with equivalent structural features for public automated tests.

- Preserve relative placement and aspect ratio across all paths when centering and scaling the complete legend.
- Interpret filled subpaths using SVG fill semantics, including implicit closure when an explicit closepath command is absent. See the [SVG fill specification](https://www.w3.org/TR/SVG2/painting.html#FillProperties).
- Allow multiple disconnected watertight solids within the single Legend part, all assigned to one material. Do not add bridges between disconnected icon shapes.
- The reference informed the implemented parser and passed a local upload smoke check. Original public fixtures cover holes and transforms separately. Printability still requires physical validation.

## Deferred

Typed text, font selection, automatic SVG stroke conversion, PNG input, other keyboards or K2 rows, arbitrary key sizes, more than two colors, arbitrary legend positioning, legend rotation, and layout editing. General-purpose mechanical geometry editing remains deferred.

Personalizing the keycap's mechanical shape is an explicit future direction. The implemented OEM reference is fixed; the user now wants profile-specific controls within justified bounds, beginning with a profile selector. Keeping mechanical parameters centralized supports this without promising a general geometry editor.

The user has since requested a profile-first editor with OEM as the initial choice and only controls permitted by that profile. The current single OEM row 5 reference remains the default; see [the proposed controls plan](plans/oem-profile-controls.md). This supersedes the fixed-preset UI direction for future implementation, but does not authorize uncalibrated mechanical ranges or other keyboards. The existing controls for SVG, legend size, and colors remain available. The adaptive-width print and any new fit or outer-dimension trial are separate physical gates.

### Planned follow-up: Switch fit

The next narrowly scoped mechanical control is planned under an **Advanced** section, after the current print-quality and fit checks. Its purpose is to adjust only the cross-shaped socket opening, leaving the outer keycap, boss diameter, socket depth, and legend unchanged. Keep the current opening dimensions as the default, provide Reset, and clearly distinguish tighter from looser adjustment. Continue exporting Body + Legend with the stem joined into Body.

The stem/socket module is now isolated and tested without changing its output. The UI, request parameters, and adjustment logic are not implemented. Exact adjustment semantics, minimum/maximum values, and step size remain open until a physical calibration plan establishes a suitable range; do not invent validated tight/loose presets. This does not authorize a general geometry editor or additional keyboard support.

## Engineering requirements

Maintain modular code following frontend and React practices, meaningful tests, linting, TypeScript checks, a production build, and GitHub Actions verification. Keep domain processing independently testable from the UI. Maintain agent guidance, human documentation, progress, and calibration evidence in the repository.

## Acceptance and validation

- Automated tests verify mesh closure, positive volumes, connected body, volume partition, serialized output, and bounded input rejection.
- Browser tests verify upload, sizing, colors, camera controls, download, error recovery, accessibility, and session reset.
- Legend size is the longest visible artwork dimension, from 3 to 11 mm; initial size is 8 mm.
- Preview controls include orbit, zoom, top, and underside views. Invalid or still-generating input disables export. Camera motion does not change exported geometry.
- GUI slicer verification must confirm assembled placement and independent Body/Legend material assignment.
- Physical acceptance criteria and the remaining print gate are in CALIBRATION.md. No broader keyboard-variant compatibility is claimed.
