# Compare the current keycap with a KeyV2 OEM reference

Date: 2026-09-19. Status: proposed plan; implementation has not started.

## Objective and decision

Compare the current K2 top-right 1u lighting-key geometry with a blank generated using KeyV2 `oem_row(5)`, then decide whether to adopt a physically validated static template. The target is the standard K2 with OEM-profile keycaps and an MX-compatible attachment, as confirmed by the user. A KeyV2 profile name alone does not establish dimensional equivalence to the original keycap.

The first deliverable is a reproducible comparison, not a replacement of the application geometry. Choosing the physical shape and choosing static versus procedural geometry are separate decisions. Keeping the current shape, including as a static template, remains a valid outcome.

This document records planned work only. It does not authorize deployment, claim physical validation, or replace the current calibration baseline. Implementation follows review of this plan.

## Scope and constraints

- Retain one fixed 1u lighting-key preset, centered SVG sizing, two colors, the existing preview, and Body/Legend 3MF export.
- Use KeyV2 and OpenSCAD only during development/template preparation. Manifold remains the runtime engine for inlay boolean operations.
- Preserve the current geometry and socket dimensions as the control. Do not tune them to match the candidate.
- Keep the SVG parser, supported input subset, React UI, and 3MF serializer unchanged unless a concrete compatibility failure requires a separately reviewed change.
- Do not add a public template selector, mesh upload, mechanical controls, additional profiles, or a general template framework.
- Keep personal artwork, printing profiles, sliced projects, and reference photos private. Record only non-identifying calibration observations publicly.

## Existing implementation and required boundary

`src/geometry/generate.ts` constructs an exterior solid, subtracts a cavity, and calls `src/geometry/stem.ts` to produce the complete blank. `src/geometry/config.ts` defines the mechanical values and analytic top surface. The generator then computes:

```text
surface band = exterior - translate(exterior, [0, 0, -0.5 mm])
Legend = extruded SVG intersect surface band
Body = complete blank - Legend
```

The exterior is a solid envelope, not the hollow blank. Substituting a hollow STL directly into the band calculation could include internal features or walls. The proposed minimum template input therefore contains a complete blank and a matching solid exterior envelope, plus fixed coordinate/legend-center metadata. Both surfaces must agree within an explicitly recorded numerical tolerance.

The same `KeycapModel` output continues to serve the preview and 3MF export. Keep inlay depth vertical, as today; do not introduce a surface-normal offset. Validate that the full SVG footprint lies within the usable roof and that the inlay leaves structural material underneath. Volume conservation alone does not establish roof-only placement or sufficient remaining thickness.

## Phase 1 — capture the current control

- Record the source revision (reviewed baseline: `3ff9440`), Manifold version, mechanical config, and artifact hashes.
- Make only the extraction needed to access the current complete blank and exterior before applying artwork. Preserve operation order and ownership of Manifold objects.
- Export `current_template.stl` and its auxiliary exterior mesh. Keep unindexed STL files for inspection; retain or prepare indexed meshes for reliable solid import.
- Confirm that extraction preserves the three existing Body/Legend mesh fingerprints at sizes 3, 8, and 11 mm. Retain the socket and four exterior-plane regression tests.
- Check STL import against the source solid using bounds, volume, critical socket sections, and geometric difference within recorded tolerances. Triangle ordering is not an equivalence requirement after serialization. Do not silently repair, smooth, rescale, or simplify the reference.

Exit evidence: unchanged procedural output and a traceable blank that faithfully represents the working baseline.

## Phase 2 — generate and inspect the KeyV2 candidate

- Pin a specific KeyV2 commit and OpenSCAD version/backend. Store a small generation recipe with explicit 1u size, row 5, column 0, no legend, and tessellation settings.
- Start with KeyV2's `cherry` stem and explicit default fit parameters. Record the actual resolved parameters instead of relying on implicit defaults. Do not silently substitute the current stem or `rounded_cherry`.
- Distinguish structural stem-to-roof supports from sacrificial printing aids. Record the structural support configuration and disable sacrificial stem aids for the reusable blank, verifying the resolved behavior against the pinned source.
- Export `keyv2_oem_row5_reference.stl` and a matching exterior envelope from the same configuration. Verify that the inlay-relevant exterior surface matches the blank despite any differences in triangulation.
- Use millimeters, Z up, +Y rear, base Z=0, and the stem axis at X=Y=0. Record coordinate transforms; do not rescale either reference to force agreement.
- Report bounds, front/rear and central sections, dish shape, cavity/roof thickness, socket sections/depth, stem recess, and broad-side planarity for both blanks. Treat nominal OpenSCAD parameters separately from measured mesh dimensions.
- Keep the source recipe, provenance, license information, and hashes. Review generated reference artifacts before adding anything to version control.

Key differences to inspect include the candidate's rearward top offset, narrower nominal top, cylindrical dish, different stem opening, and possible nonplanar side contact. The current planar-side correction and sample-level fit are evidence to preserve, not assumptions transferable to KeyV2.

Exit evidence: two valid, aligned, measured blanks and reproducible candidate generation. No physical-fit claim yet.

## Gate A — blank comparison against the original

Print the KeyV2 blank and compare it with the original cap and the current control. Use a fresh control when the existing print does not provide a comparable trial. Check seating without excessive force, installed height/profile, retention, safe removal, full travel/return, and clearance from adjacent caps and the case.

For side printing, apply the slicer's lay-on-face operation separately to each mesh and inspect actual contact/support coverage. Keep process settings comparable and record any necessary differences privately; the same numeric rotation need not give equivalent bed contact.

Record artifact hashes and non-identifying results in `CALIBRATION.md`. If the candidate fails, retain the current default and review the specific failure before adjusting candidate dimensions. A candidate adjustment gets a new artifact hash and repeats affected checks. Do not combine a shell change and an unrecorded stem-fit adjustment.

Stop adoption work here until user print feedback is available. Independent comparison tooling may proceed, clearly marked experimental.

## Phase 3 — compare the same SVG on both bases

- Extract only the existing inlay operation into a directly testable function accepting the blank and exterior. Keep the current generation path as the default and preserve its regression evidence.
- Add a development-only comparison runner, using the existing SVG parser and 3MF exporter. Resolve browser DOM requirements in that runner using the existing development environment; do not rewrite parsing or add browser runtime dependencies for the experiment.
- Parse one SVG once and use the same normalized contours, legend size in millimeters, colors, and 0.5 mm vertical inlay depth for both outputs.
- Record a fixed legend center for each template. The current center is over the stem; the KeyV2 top is shifted rearward. Confirm visual centering against the measured roof, and record the chosen offset rather than silently translating the whole keycap or adding a user positioning control.
- Generate `current_same_svg.3mf` and `keyv2_oem_row5_same_svg.3mf`, retaining the internal assembly name `Custom Keycap` and part names `Body` and `Legend`.
- Use public synthetic fixtures for automated checks: a filled region, a hole, and disconnected islands at representative/minimum/maximum sizes. Keep any user artwork and its exports local and ignored.

Exit evidence: matched-input exports with unchanged SVG interpretation and packaging. A narrower roof must not silently clip or shrink an 11 mm icon; report any inability to preserve the supported range as a candidate limitation.

## Gate B — solid, slicer, and printed inlay acceptance

Automated checks must establish valid closed positive-volume meshes, a connected Body, no overlapping material volume, conservation of the blank, and an inlay confined to the roof. Verify that Body plus Legend reconstructs the blank geometrically, that the legend shares the actual template top surface, and that its lower surface follows the specified vertical depth with adequate roof material remaining. Preserve separate disconnected legend islands without bridges.

Open both exports in a compatible slicer, such as OrcaSlicer, and confirm assembled placement, independent material assignment, and usable roof/socket/support toolpaths. Compare the corresponding prints for flushness, intact artwork, fit, and repeatability. The current raised-legend investigation remains separate: changing the template is not evidence that the slicing-related issue has been fixed.

Adoption requires user feedback on the printed candidate with an inlay, in addition to blank-fit feedback. A preview or passing tests cannot satisfy this gate.

## Phase 4 — optional runtime adoption and rollback

After reviewing both gates, decide explicitly whether to keep the current base, adopt KeyV2, or investigate one documented candidate adjustment. No automatic promotion follows successful export.

If a static template is selected:

- Bundle only the chosen indexed blank/envelope meshes and required fixed metadata. Keep STL comparison artifacts and generation tooling outside the browser bundle.
- Load and validate the meshes in the existing worker. Preserve cancellation, timeout/error handling, `KeycapModel`, preview, SVG processing, and 3MF contracts.
- Retain the procedural baseline and its tests during adoption. Keep selection internal and defaulted to the approved template; rollback restores the procedural source without a UI or export-format change.
- Update `CALIBRATION.md`, `STATUS.md`, architecture documentation, and an ADR with the actual decision and evidence. Update README usage/commands only after they exist. Record the implications for the deferred switch-fit control without implementing it.
- Verify worker/assets under both root and repository-subpath builds. Publishing remains a separate action.

## Verification and milestones

Each implementation milestone should be independently reviewable: (1) baseline extraction with unchanged output, (2) candidate recipe and blank comparison evidence, (3) shared inlay comparison runner, and optionally (4) runtime adoption after physical acceptance. Inspect staged content for private data and unintended generated artifacts before committing.

For source changes, run `npm run check` and `npm run format:check`. For runtime adoption, also run `npm run test:e2e` after the production build and verify static-asset loading under a repository subpath. Report actual results; historical passing checks are not verification of new code.

## Decisions still pending

- Review/acceptance of this implementation plan.
- The pinned KeyV2/OpenSCAD versions, explicit structural support settings, and mesh-resolution/tolerance choices used for the candidate.
- Measured usable roof bounds, fixed legend center, and sufficient remaining roof thickness for the full 3–11 mm range.
- User physical feedback at Gates A and B and the resulting adoption decision.

## Source references reviewed

The following upstream links are moving references; pin them to the selected commit in the implementation recipe:

- [KeyV2 OEM profile](https://github.com/rsheldiii/KeyV2/blob/master/src/key_profiles/oem.scad)
- [Default settings](https://github.com/rsheldiii/KeyV2/blob/master/src/settings.scad)
- [Blank and exterior construction](https://github.com/rsheldiii/KeyV2/blob/master/src/key.scad)
- [Cherry stem](https://github.com/rsheldiii/KeyV2/blob/master/src/stems/cherry.scad)
- [Side-planarity handling](https://github.com/rsheldiii/KeyV2/blob/master/src/shapes/square.scad)
- [License](https://github.com/rsheldiii/KeyV2/blob/master/LICENSE.md)
