# OEM blank comparison: preliminary software evidence

Date: 2026-09-19. The original plan is in [oem-template-comparison.md](oem-template-comparison.md). This report compares the former procedural blank with the KeyV2 OEM row 5 preset now used in the local browser build. One printed sample passed the requested mechanical checks; its legend has some tactile relief.

## Reproducible inputs

- Current blank: application baseline `3ff9440`, `manifold-3d@3.5.3`, exported as `_tmp/oem-template-comparison/current_template.stl` (SHA-256 `1d48897a43289e21a555b8f3edf82d9765c81ef53387e3c91d567999e2d88ea0`).
- OEM candidate: KeyV2 `19f0d2faadd4949634c93f38d1a66869d29e8f43`, OpenSCAD `2026.03.07`, [the pinned blank recipe](keyv2-oem-row5.scad), exported as `_tmp/oem-template-comparison/keyv2_oem_row5_reference.stl` (SHA-256 `678fd91b61a492947b7586aa6f9607332749f3563a52e83d052bc7c11eab4e13`).
- Candidate exterior: [matching recipe](keyv2-oem-row5-exterior.scad), SHA-256 `865b18bb304d0ddafe3a5cec2afdc7e6be590672a4cf8c9fd2b681273f91c3c2`.
- The first candidate STL was contaminated by the example model drawn at top level in KeyV2's `keys.scad`. It is retained only as an ignored diagnostic file named `keyv2_oem_row5_contaminated.stl`. Both final recipes use `includes.scad`, which draws no example.
- The final candidate keeps KeyV2's structural `flared` supports, `cherry(0.35)`, inner slop `0.2`, a 4 mm throw, and a 1.2 mm stem inset. Only sacrificial stem print aids are disabled.

## Mesh comparison

| Measurement                            |            Current blank |          KeyV2 OEM row 5 |
| -------------------------------------- | -----------------------: | -----------------------: |
| Mesh X span                            |                 18.00 mm |                 17.45 mm |
| Mesh Y span                            |                 18.00 mm |                 17.61 mm |
| Exported Z range                       |              0–11.725 mm |              0–10.336 mm |
| Height above mesh base                 |                11.725 mm |                10.336 mm |
| Volume                                 |              1350.26 mm³ |              1460.89 mm³ |
| STL triangles                          |                     8710 |                     3696 |
| Manifold import                        | `NoError`, one component | `NoError`, one component |
| Blank volume outside matching exterior |            <0.000001 mm³ |                    0 mm³ |

KeyV2's raw geometry started at Z=1.195 mm. Both candidate recipes apply the same rigid translation so the exported mesh base is Z=0. The candidate is 1.39 mm shorter than the current blank above the base. Its rearward top offset and asymmetry are not removed by centering its bounding box.

KeyV2's nominal profile parameters specify an 18.05 mm bottom width and 1 mm roof thickness; those are source settings, distinct from the measured STL bounds. The candidate cross is generated with nominal horizontal span `4.03 + 0.2 = 4.23 mm` and arm thickness `1.25 + 0.2/3 ≈ 1.317 mm`, with a bevel and a split vertical tine. The current fixed socket uses 4.04 mm span and 1.194 mm arm thickness. These source differences may affect retention; the mesh import alone cannot determine fit.

At STL section height Z=2 mm, the candidate's central boss resolves into two mirrored solids spanning X=-3.25 to -0.608 mm and X=0.608 to 3.25 mm, both within Y=±2.40 mm. The split between them is approximately 1.217 mm across X. The current boss is circular at ±2.8 mm and has a single central cross opening spanning ±2.02 mm. The candidate's support and socket arrangement is materially different, so the current sample's seating result cannot be transferred to it.

At the stem axis, the current top surface is approximately 10.401 mm above its base, while the candidate top is approximately 8.912 mm above its mesh base. The candidate exterior and blank have the same sampled top-surface height at the stem axis and at six additional roof columns. The structural flared supports occupy much of the underside, so these vertical ray measurements are not a standalone proof of remaining roof thickness under every possible legend. The current 0.5 mm inlay and full 3–11 mm icon range still need separate candidate checks before any runtime adoption.

## Physical gate

Print the 8 mm OEM Spark 3MF described below and compare it with the original cap and the current working print. Check seating without force, installed height, retention, removal, full travel/return, clearance from neighboring caps and case, and legend flushness. In a side orientation, use the slicer's lay-on-face operation on this model independently and inspect contact and support coverage. The blank STL remains available to isolate fit if the combined print fails; it is not a required separate print. The existing printed control is useful only if its process conditions make it a fair comparison.

Result: the user confirmed seating without force, firmness, removal, full travel, and no rubbing against neighbors or case for the printed comparison sample. The legend still has some relief at the fingertip. This supports adoption of this mechanical preset in the browser; it does not prove repeatability or flush printed finish.

## Matched SVG trial

The development-only runner `npx vitest run --config scripts/oem-vitest.config.ts` parses the public `Spark` SVG once and applies the same contours, 3/8/11 mm sizes, 0.5 mm vertical inlay depth, and colors (`#263447` Body, `#e2a544` Legend) to both blanks. The current legend center is `(0, 0)`; the OEM legend center is fixed at `(0, 1.75)` mm, matching KeyV2's top skew. The test exports 8 mm examples to ignored local files:

| 3MF file under `_tmp/oem-template-comparison/` | SHA-256                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `current_same_svg.3mf`                         | `b33836722e9ad646a6b5d2d536c3712c2c0bdeea5f3eee6f3819c99f66694b33` |
| `keyv2_oem_row5_same_svg.3mf`                  | `820ed3d6a6b86587fda518bda08424b6bfd61985d748cfe14a21ca0b15ac5f67` |

For the 8 mm OEM export, the reimported Body is one component; serialized Body and Legend overlap by less than `0.000001 mm³`, and their union differs from the blank by less than `0.00001 mm³`. The Legend volume is `6.81877 mm³`, matching the current blank's legend volume for the same contours. The OEM trial gives the same legend volumes as the current blank at 3 and 11 mm, with one connected Body at each tested size. These measurements support no clipping for this SVG; they do not establish the full supported SVG subset or minimum remaining roof thickness.

The current procedural blank produced a disconnected Body with this particular Spark SVG at 11 mm in the development runner. Its existing square regression remains intact. This is a separate edge case to investigate before claiming complete 3–11 mm coverage for arbitrary icons.

The 3MF archive contains one `Custom Keycap` assembly with separately named `Body` and `Legend` objects and no G-code. Slicer material assignment, actual toolpaths, flushness, and physical fit still require inspection and a print. Record non-identifying results in `CALIBRATION.md` before making an adoption decision.

### Orientation observation

The user's upright slicer preview shows conspicuous diagonal top-surface toolpaths around the 8 mm Spark legend. This is a reason to prefer a side-oriented print trial for surface finish, but it is not evidence of a printed defect. A simple plane fit over broad side mesh vertices shows deviations on the order of 0.1–0.2 mm, so no entire exterior side is assumed perfectly flat. Apply lay-on-face to the complete Body/Legend assembly and inspect first-layer contact and supports on the newly sliced model. The front side is a reasonable first side to inspect; use the side with the best actual contact if it differs. Do not reuse the current cap's saved rotation.
