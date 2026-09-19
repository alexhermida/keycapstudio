# Select an OEM row and key width before adding artwork

Date: 2026-09-19. Status: first catalogue and browser workflow implemented on the OEM branch; physical validation remains open for new variants. The user clarified the desired flow: choose the **OEM row** and the **key width in u**, then upload an SVG independently. This supersedes the earlier interpretation that the main new control should adjust stem fit. The only physically checked key is row 5, 1u.

## Editor flow

1. **Profile:** OEM is the only available profile. Display it as the active choice; do not invent selectable alternatives.
2. **OEM row:** choose among rows for which this app has a generated, checked blank. Keep row 5 as the initial value. KeyV2 defines row 0/5 with the same profile branch and rows 1–4 separately; the UI should use clear, documented row labels rather than treating these numbers as K2 positions.
3. **Key width:** choose the width in `u` from a discrete supported list for that row. Keep 1u as the initial value. This is distinct from the SVG legend size in millimeters. Height remains 1u until a taller key is explicitly requested and validated. Do not show a row × width combination without a valid blank, matching exterior, and clearly stated validation status.
4. **Artwork:** upload a filled SVG or choose an example, then set its visible size and Body/Legend colors. Artwork selection is independent of row/width. Changing the key keeps artwork where possible but revalidates the new roof's allowed legend size and placement; never silently clip an oversized icon.
5. **Preview/export:** display the chosen key's actual geometry and disable download while it changes or if a combination is invalid. Preserve one `Custom Keycap` assembly with separate, nonoverlapping Body and Legend parts.

The OEM profile's row-dependent shape rules, dish, and construction values are fixed by that profile, not user sliders. Cherry MX attachment and the printed row 5/1u reference remain the default. A future fit adjustment is separate from this requested key-size control.

## Source capabilities versus supported product options

The pinned KeyV2 source defines `oem_row(row, column)` for row 0/5 and rows 1–4. Its `u(value)` helper changes key length, with named widths 1u, 1.25u, 1.5u, 1.75u, 2u, 2.25u, 2.5u, 2.75u, and 6.25u. These are construction options, not verified compatible sizes for this app. Wider keys may need stabilizers and distinct stem placement; inspect each generated variant rather than assuming the 1u attachment applies. Do not derive a continuous safe interval from the KeyV2 customizer settings.

The browser currently loads one indexed complete blank and matching solid exterior generated offline. Scaling the row 5/1u mesh would distort the dish, wall, stem, and supports. Each supported row/width variant therefore needs a separate blank and matching exterior generated from the pinned KeyV2 source. The printed reference, its `(0, 1.75)` mm legend center, and the 0.5 mm vertical inlay stay unchanged. Other variants need their own recorded roof center and usable legend bounds.

## Implementation sequence

1. **Choose the first catalogue.** Start from row 5/1u. A practical first candidate batch is rows 1–4 at 1u, followed by row 5 at 1.25u, 1.5u, and 1.75u; this exercises row and width selection without promising every cross-product combination. Treat this as a proposed preparation order, not as proven compatibility. The user chose row + width selection, not a K2 position map. A source-supported combination should not appear in the UI until its geometry exists and its limitations are documented.
2. **Generate variants offline.** Extend the pinned OpenSCAD recipe to accept an explicit row and width without changing the reference defaults. Export a complete blank and matching solid exterior for each catalogue entry. Record source values, units, origin, bounds, usable roof area, stem/stabilizer arrangement, SHA-256 hashes, and license provenance. Reject invalid, degenerate, or disconnected imports.
3. **Add a small variant manifest outside React.** Each entry has a stable ID, row, width in `u`, local asset URLs, legend center, permitted legend-size interval, and validation status. The UI derives choices only from this manifest. Pass the selected ID through editor state, `useKeycap`, worker request, and mesh loading. Colors do not regenerate geometry. Preserve the current procedural generator for rollback, not as a public profile choice.
4. **Build the editor controls.** Put Profile, OEM row, and Key width before the SVG section. Clearly label key width (`u`) separately from legend size (`mm`). Keep keyboard accessibility, reset/default behavior, local-only SVG processing, and the existing preview/export contract.
5. **Verify each variant.** Check blank/exterior alignment, roof-only inlay, connected Body, watertight Body/Legend, no overlap, volume reconstruction, icon-size limits, and 3MF structure. Run actual browser upload/change/download tests, root and Pages-subpath asset loading, and slicer inspection. Obtain physical feedback on seating, retention, removal, full travel, clearance, and artwork quality before calling a variant fit-validated.

## Physical gate and unresolved scope

- The current OEM row 5/1u print passed the requested mechanical checks for one sample; its legend still has tactile relief. An adaptive-width print is underway. Record its result before claiming a print-quality fix or changing the 0.5 mm inlay. This trial does not validate new rows or widths.
- New row/width combinations are experimental until tested. Preserve the reference as the default and identify unprinted variants honestly. Especially for widths requiring stabilizers, physical fit and key travel must be checked on the intended layout.
- The first additional widths/rows and whether to support very wide keys are still to be chosen. Do not promise the full KeyV2 width list or every OEM row in the first release. Stem-fit controls, arbitrary body dimensions, new keyboards, and changing inlay depth are outside this selector/size workflow.

## Delivery

Implement in reviewable increments: first variant preparation/catalogue, then manifest/worker selection, then UI. Update `docs/MVP.md`, `STATUS.md`, `CALIBRATION.md`, and an ADR when the catalogue is selected. Run type checking, lint, formatting, unit/domain tests, production build, Chromium/Firefox browser tests, and a Pages-subpath smoke test. Publication remains separate.
