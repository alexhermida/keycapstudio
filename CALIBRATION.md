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

The latest correction reflects distinct measurement locations on curved edges. At the time of that correction no geometry or tests had been implemented, and no previously print-validated parameter was changed. The implemented provisional preset below approximates these observations; fit still requires a physical print.

## Change and validation procedure

Keep mechanical parameters centralized in the implementation's config.ts module. Record changes here with the old and new values, reason, and affected validation; update tests where appropriate.

For each physical trial, record the model revision, relevant geometry parameters, and non-identifying observations of fit and print quality. Keep the user's printer, slicer choice, and private print settings out of this public repository. If omitted setup details limit reproducibility, state that limitation without disclosing them. Only mark a dimension validated after explicit user feedback from a physical print. Never continue through a physical calibration gate without that feedback.

## Physical trials

### Trial 1 — failed; fit not evaluated

User feedback on 2026-09-12: the first print did not produce a usable stem socket and the top finish was poor. Local photos show loose extruded strands inside the cavity, no recognizable socket boss, and pronounced surface ridges with uneven legend regions. A previous externally generated print has an intact socket and a cleaner top. Both were confirmed printed icon-up. Photos and private printing setup remain excluded. The exact sliced project and settings have not been inspected, so this comparison does not isolate every printing variable.

Read-only cross-section checks of the current generator reproduce a printability hazard in its exported upright orientation: at Z=0.99 mm only the shell exists; at Z=1.01 mm a separate socket-boss region of approximately 16.37 mm² appears. The boss starts at `stemBottom = 1.0 mm`, without material beneath it. It joins the roof higher up, but whole-solid connectivity does not make those initial layers supported. The previously supplied candidate model's stem starts at Z=0; that file is still not confirmed as the exact successful print artifact.

The unsupported boss is the leading explanation for the missing socket in the reported upright, unsupported trial. The cavity roof also requires a support/bridging assessment. Mesh inspection of the candidate reference confirms a horizontal top with approximately 182.39 mm² of body/legend faces at its maximum height; the current model instead has a curved, sloping top. Layer stepping is therefore another relevant difference even with matching orientation. The top's ridges and blobs cannot be assigned uniquely to support failure, layer stepping, or extrusion behavior from photos alone. The 22 existing domain tests still pass: they validate mesh structure, not a support-free printing process.

A supported follow-up was subsequently reported below. No mechanical parameter was changed or validated from this failed trial. Keep future comparisons to one changed variable where practical.

### Trial 2 — improved supported results; incomplete acceptance

User feedback on 2026-09-13: supported copies were printed in two orientations. The copy resting on a side face had a substantially better top finish, but a small region was missing. The user also reported slight relief in the legend. Two slicer screenshots and a saved project were inspected locally; these artifacts and all private process settings remain excluded from Git. Switch seating, retention, removal, and full travel have not yet been confirmed.

Subsequent fit feedback: the side-printed copy seated on the switch after initially feeling tight. The upright copy did not fit. The reference cap also failed to fit in this run, although the user reports that the same reference 3MF produced a fitting print previously. This is evidence that repeatability depends on the printing process as well as geometry; it does not identify a specific cause. Personal material/profile details remain excluded. Seating is provisionally observed for one side-printed sample; retention, safe removal, full travel, surrounding clearance, and repeatable fit remain unconfirmed. Do not enlarge the socket based only on this mixed result.

The saved project contains the reference cap and two copies of this project's model. Part transforms preserve the Body/Legend assembly; one copy is rotated as a whole. Numerical checks reconstructed the transformed legend meshes from both saved copies and compared upper-face vertices and centroids against the intended faceted top. Each copy passed 2,656 surface samples with an absolute height deviation below 0.000002 mm and zero measured legend volume outside the intended outer solid. Fresh generation checks at two legend sizes also passed within numerical tolerance. This does not reproduce a raised legend in the stored geometry; it does not rule out slicing or printing effects.

The saved archive contains model/process data and preview images but no G-code, so the actual extrusion toolpaths have not been analyzed. The missing region needs a close-up and support-coverage review before its cause is established. The reported physical relief needs comparison with the corresponding sliced toolpaths and a close-up of the print. Do not lower the legend or change socket dimensions to compensate for an unconfirmed cause. No mechanical parameters changed; no fit or print-quality gate has passed.

Further bed-contact inspection: the user reports that the missing side-face region remains the main problem even with support. Applying the saved assembly and build transforms to the body places its lowest point at the bed plane, but the near-horizontal, downward-facing side surface spans approximately 0–0.1754 mm above that plane. The side is not a single planar bed-contact face. Cross-sections at Z=0.01 mm have two regions, whereas sections at Z=0.05 mm and above join into one region. These are mesh sections, not verified extrusion paths. The shell-generation warp applies the top-height function throughout the tapered shell, rather than preserving planar front/rear walls.

The subsequent close-up shows a crescent-shaped missing/underfilled patch near the middle of the bed-facing side's top edge. The user confirms that both material and support were absent there when printing finished, before any support removal. This rules out support-removal damage for that patch and is spatially consistent with the measured nonplanar face. The available evidence favors a bed-contact/slicing problem, although the exact extrusion paths remain unverified. The photo also shows a visibly proud, ridged legend; that remains a separate issue from side-face contact.

Recommended next implementation: preserve planar tapered exterior side faces away from rounded corners, retain the curved top and existing socket dimensions, and add a regression check for side-face planarity and flush legend geometry. This is a proposed outer-shell change, not an implemented or physically validated fix. Record actual geometric differences and rerun solid/export checks before requesting another physical trial.

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
