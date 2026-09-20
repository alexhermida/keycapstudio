# Generate bounded OEM R1–R4 shells in the browser

Status: accepted by the user, 2026-09-20. Supersedes the runtime catalogue and measurement controls in ADRs 0003/0004; historical assets remain unchanged.

The user wants reference OEM R1–R4 presets followed by millimeter adjustments to approximate a physical keycap. Vendor names belong in provenance documentation, not the editing controls. A catalogue of radius/relative-height meshes cannot support these measurements without a combinatorial asset increase. Use the existing Manifold worker to build the shell parametrically, with no additional dependency.

## Reference and assumptions

- [Max Keyboard](https://blog.maxkeyboard.com/dwkb/keycap-profile-size-information/) supplies the reference base and side-profile heights. A [readable copy of the manufacturer diagram](https://www.keebtalk.com/uploads/db8059/original/3X/2/4/24fda82201884939863022cfb46d0fcc43ded01e.png) was inspected. These are nominal manufacturer dimensions, not universal OEM tolerances.
- [Keychron K2 layout](https://www.keychron.com/pages/keychron-k2-keyboard-keycaps-layout-and-keycap-size-hd-picture) identifies the lighting key as 1u/R4. Its physical rows from top to bottom use R4, R4, R3, R2, R1, R1. It does not specify millimeter heights.
- The side-profile diagram is interpreted with rear/screen to the left and front/typist to the right. Reference front/rear rim heights are R1 10.1/7.9, R2 9.3/8.0, R3 9.3/9.0, R4 10.8/11.4 mm.
- The diagram is not a complete solid model. A 0.8 mm parabolic dish, straight taper of 0.18 mm inward per vertical millimeter, default 1 mm base radius, 1.3 mm nominal horizontal wall inset, and 1.6 mm vertical roof thickness are modeling choices, not measured manufacturer features.
- Controls use **front/rear edge midpoints**, so presets subtract the assumed 0.8 mm dish from reference rim heights: R1 9.3/7.1, R2 8.5/7.2, R3 8.5/8.2, R4 10.0/10.6 mm. +Y is rear. The roof plane solves those midpoint heights at the tapered front/rear walls. Rounded corners and tessellation can slightly alter rim extrema; actual overall mesh bounds are displayed separately.
- All 1u bases are 18 × 18 mm. Existing wider selections remain under R4, using diagram widths 22.8, 27.5, 32.3 mm for 1.25u, 1.5u, 1.75u.

## Bounded customization

Base width is ±0.5 mm around the selected size; depth 17.5–18.5 mm, edge-center heights 6.8–12.5 mm, base radius 0.5–1.5 mm. Sliders use 0.1 mm steps; numeric entry accepts intermediate measurements. The domain validates finite coordinates and bounds. These engineering limits retain room for the cavity, insertion region, and roof; they do not establish keyboard clearance. Inlays extending beyond the roof are rejected and export is disabled.

Row/width changes load new defaults and Reset restores the selected preset. Artwork, legend size, colors, and language stay independent. Mechanical values remain in `config.ts`; geometry does not depend on React. Preview and export share the generated mesh.

## Preserve insertion geometry

Keep the old KeyV2 blank byte-for-byte. Intersect its central 7 × 7 mm region through Z=4.5 mm to retain the opening, bevel, blind depth, and Z position. Extend its closed section just below Z=4.5 upward to meet the roof, then intersect with the exterior. Do not scale or warp the stem. Tests compare added/removed volume against the reference insertion region and check connectedness and inlay validity at all dimension-bound combinations.

The new shell and roof connection require physical fit, travel, clearance, strength, and print-quality checks. Previous sample feedback does not validate them. The user authorized experimental adjustments without printing every combination first.

Legacy assets, loaders, recipes, tests, and the procedural generator remain for controlled comparisons. The production worker imports only the single reference blank, avoiding the old customization catalogue in the deployed bundle. GPL provenance remains in the shipped license.
