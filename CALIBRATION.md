# Physical calibration

## Validation status

No generated dimensions have been validated by a physical print in this project. The following working measurements describe the original Keychron K2 lighting keycap, incorporating user clarification of the reference photos.

| Parameter                  | Working measurement  | Status                                                       |
| -------------------------- | -------------------- | ------------------------------------------------------------ |
| Bottom width               | 18.0 mm              | Provisional                                                  |
| Top width                  | 14.1 mm              | Initial value; 13.5 mm photo reading awaits clarification    |
| Front corner height        | 10.8 mm              | Approximate user measurement; generated geometry unvalidated |
| Front edge midpoint height | 10.0 mm              | Approximate user measurement; generated geometry unvalidated |
| Rear corner height         | 11.8 mm              | Approximate user measurement; generated geometry unvalidated |
| Rear edge midpoint height  | 10.8 mm              | Approximate user measurement; generated geometry unvalidated |
| Legend inlay depth         | Approximately 0.5 mm | Design target; unvalidated                                   |

These values are not a complete mechanical specification. Stem fit, clearances, wall thickness, surface shape, and the exact keyboard variant require evidence before compatibility can be claimed.

## Original keycap photo observations

Eight local reference photos were inspected. The images remain excluded from version control; only non-identifying observations are recorded here.

The cap has a tapered shell, rounded corners, a shallow concave top, and a roughly centered cross-shaped socket with internal reinforcing ribs. Its side profile is asymmetric. Photos do not establish an exact curvature radius, wall thickness, or insertion depth. The user clarified that the front faces the typist and the rear faces the monitor when installed.

Visible caliper displays read approximately 18.0, 13.5, 11.5, 10.5, and 5.5 mm. The first two appear to measure the wide base and narrow top respectively; the last appears to measure the outside of the socket boss, not the cross opening. The user subsequently corrected the interpretation of the height readings: both top edges curve downward toward their midpoints, so a single front or rear height is insufficient. The working table above records the latest corner and midpoint measurements.

The 13.5 mm photo reading remains unreconciled with the initial 14.1 mm top width. It is a source of measurement uncertainty, not a requirement to reproduce the original exactly. The user accepts an approximate outer shape and notes that the cap is difficult to measure with calipers. No dimension is physically print-validated by these photos.

## Measurement corrections

On 2026-09-12, an initial user interpretation of the photos replaced the original front/rear heights of 5.1/10.4 mm with 10.5/11.5 mm. A subsequent explicit correction superseded that single-height interpretation with front corners/midpoint of 10.8/10.0 mm and rear corners/midpoint of 11.8/10.8 mm. These imply approximate edge depressions of 0.8 mm at the front and 1.0 mm at the rear, but do not define the full top surface or a precise curvature radius.

The latest correction reflects distinct measurement locations on curved edges. No implemented geometry or tests exist to update, and no previously print-validated parameter was changed. Future geometry may approximate these observations; record chosen parameters and their rationale before implementation, and validate fit with a physical print.

## Change and validation procedure

Keep mechanical parameters centralized in the implementation's config.ts module. Record changes here with the old and new values, reason, and affected validation; update tests where appropriate.

For each physical trial, record the model revision, relevant geometry parameters, and non-identifying observations of fit and print quality. Keep the user's printer, slicer choice, and private print settings out of this public repository. If omitted setup details limit reproducibility, state that limitation without disclosing them. Only mark a dimension validated after explicit user feedback from a physical print. Never continue through a physical calibration gate without that feedback.

## Physical trials

No trials of this project's geometry recorded.

## Implemented provisional preset

The first TypeScript preset uses the following values in `src/geometry/config.ts`. These are explicitly experimental choices, not validated fit dimensions. No gate has been passed and no physical result is claimed.

| Parameter                          | Selected value        | Rationale                                                                            |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| Base width and depth               | 18.0 mm               | Initial base measurement; a square 1u footprint is the first approximation           |
| Top width and depth                | 13.8 mm               | Midpoint of the uncertain 13.5/14.1 mm readings; exact reproduction was waived       |
| Bottom corner radius               | 1.0 mm                | Rounded-shell approximation                                                          |
| Front/rear top edge center heights | 10.0 / 10.8 mm        | Latest user observations                                                             |
| Front/rear dish depth              | 0.8 / 1.0 mm          | Latest corner-to-midpoint differences; smoothly interpolated parabolic top           |
| Nominal horizontal wall inset      | 1.3 mm                | Provisional structural thickness                                                     |
| Vertical roof thickness            | 1.6 mm                | Leaves about 1.1 mm below the inlay                                                  |
| Socket boss outside diameter       | 5.6 mm                | Structural starting point near the observed boss size                                |
| Socket boss bottom above base      | 1.0 mm                | Provisional recess; installed height and travel need testing                         |
| Socket cross span / arm width      | 4.04 / 1.194 mm       | Rounded candidate model opening measurements, not adopted as validated fit           |
| Socket insertion depth             | 3.6 mm                | Provisional blind-socket depth; not measured from the original cap                   |
| Legend depth                       | 0.5 mm vertically     | Inlaid region shares the actual faceted outer surface                                |
| Surface refinement length          | 0.7 mm                | Bounds facet size before applying curvature                                          |
| Legend longest dimension           | 3–11 mm, default 8 mm | Keeps the centered artwork within the roof; fine detail still requires slicer review |

The shape is authored here from primitives and observations. Rounded corners and taper mean corner extrema need not equal the ideal unrounded surface formula. The SVG is scaled by its visible artwork bounds, preserving aspect ratio and the relative positions of separate paths. The inlay depth is measured vertically, rather than along each local surface normal.

Physical acceptance: the socket seats without excessive force, holds without unwanted wobble, can be removed safely, and permits full key travel and return without rubbing the case or neighboring caps. The cooled print must also have an intact roof, legible flush legend, and no unintended gaps. Report these observations before changing validation status.

## External fit reference

A previously printed keycap from the [Vostok Labs SVG keycap generator](https://vostoklabs.github.io/SVG-keycap-generator/) was reported to fit the target switch well, but its outer shape differed from the original keycap. This is qualitative evidence for a working switch attachment, not validation of this project's dimensions or the replacement cap's outer shape.

The user supplied a candidate 3MF, but has not confirmed that it is the exact file used for the successful print. It was inspected in place; neither the file nor its private path or printer settings are stored in this repository. Generator version and exact generation settings remain unknown. Do not infer validated stem dimensions from the generator's current defaults. No external code or geometry has been copied into this project.

### Candidate file measurements

The file declares millimeter units and contains Keycap, Legend, and Stem mesh parts referenced by one assembly, without component or build transforms. Read-only mesh inspection yielded:

| Feature                                     | Approximate measurement | Status                                   |
| ------------------------------------------- | ----------------------- | ---------------------------------------- |
| Overall X/Y extent                          | 18.1355 × 18.1355 mm    | Candidate mesh only                      |
| Overall height                              | 11.8323 mm              | Candidate mesh only                      |
| Legend thickness                            | 0.5 mm                  | Candidate mesh only                      |
| Cross-shaped socket opening span, each axis | 4.0386 mm               | Inferred from stem bottom-plane vertices |
| Socket opening arm width, each axis         | 1.1938 mm               | Inferred from stem bottom-plane vertices |

Socket opening measurements do not establish insertion depth, internal taper, or fit for newly generated geometry. They are reference observations, not adopted or physically validated project parameters. Each mesh edge has two incident triangles; self-intersections, inter-part overlap, and full solid validity have not been checked.
