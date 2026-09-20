# Catalogue generated OEM row/width meshes instead of scaling one blank

Runtime selection and controls superseded by [ADR 0006](0006-parametric-oem-profiles.md). Retained as the decision record for the historical generated assets.

Status: accepted for the first OEM key-selection workflow, 2026-09-20.

The user wants to choose an OEM row and key width in `u` before uploading SVG artwork. The browser currently applies an inlaid legend to a pinned KeyV2 blank and matching exterior; it does not run OpenSCAD. Scaling the printed row 5/1u blank would change the stem, supports, dish, and wall geometry as well as its width, so it would not represent the requested KeyV2 row/size.

Generate each offered combination offline from the same pinned KeyV2 source and keep a separate indexed blank/exterior pair for it. A small typed manifest lists only generated combinations. The editor selects a manifest entry; the worker loads that pair and applies the existing SVG inlay. The previous row 5/1u assets remain byte-for-byte unchanged as the default. New variants are marked experimental until print feedback is recorded for each one. The SVG, legend-size and color controls remain independent of the selected key.

This increases static asset count and requires a build-time recipe plus validation per variant. It keeps browser geometry deterministic and avoids shipping OpenSCAD or a partial reimplementation of KeyV2. The initial catalogue is deliberately sparse: rows 1–5 at 1u, with 1.25u, 1.5u and 1.75u added only for row 5. Other cross-product combinations, wider/stabilized keys, and mechanical sliders require separate work and physical evidence.
