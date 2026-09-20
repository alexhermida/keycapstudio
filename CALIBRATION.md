# Physical calibration

## Validation status

The procedural cap improved after the planar-side correction and one sample seated well on 2026-09-16; that geometry remains a historical control. The current OEM row 5/1u reference passed the requested seating, retention, removal, travel, and clearance checks for one sample on 2026-09-19. Seven additional OEM row/width variants are software candidates only. Physical legend relief and repeatability remain unresolved. The following working measurements describe the original Keychron K2 lighting keycap, incorporating user clarification of the reference photos; they are not universal dimensions for every OEM row/width.

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

The user approved a planar-side correction; its implementation and verification are recorded below. Subsequent physical feedback is recorded in Trial 3.

### Trial 3 — improved print and good fit; legend quality unresolved

Following the planar-side correction (`9c85b06`), the user reported that the new print was better, with remaining concerns about appearance and a raised legend compared with the external reference. On 2026-09-16 the user confirmed that the latest cap fits well. This is feedback on the reported corrected-model trial; its exact printed artifact and sliced toolpaths have not been inspected. Do not infer individually confirmed full travel, retention, removal, surrounding clearance, or repeatability from the general fit report.

Keep the current preset unchanged as an experimental MVP baseline. In particular, retain the socket span/arm of 4.04/1.194 mm and insertion depth of 3.6 mm. No parameter changed in recording this result. The improved print report supports keeping the planar-side correction, but there is no new close-up or toolpath inspection quantifying the former missing patch.

The physical legend is still reported raised. Earlier export checks found a flush inlay; lowering the legend without identifying the cause would be an unverified compensation. The next diagnostic evidence should be the latest sliced export containing actual toolpaths and a close-up of its printed legend. Keep those artifacts and all personal process settings private.

### Toolpath follow-up — slicing lead; physical cause unconfirmed

On 2026-09-16 a subsequent G-code export was inspected in place, without copying it into the repository. The user identifies its orientation as one that previously printed successfully; retain that orientation. The file is a newly supplied slice, not independently confirmed as the exact toolpaths used for the earlier printed sample.

Read-only replay separated model extrusion from supports, purge operations, retractions, and travel. Model extrusion occurs at the declared layer heights, with no distinct legend-only layer-height offset. The legend's model paths are outer walls in this orientation, rather than horizontal top-surface fill. Neither observation proves flushness normal to the tilted surface or excludes physical toolhead alignment effects.

Two sampled narrow legend sections contain opposing perimeter lanes whose centerline separation is substantially smaller than their nominal extrusion widths. Their commanded extrusion density is consistent with the nominal individual lanes rather than a proportional correction for their strong overlap. A local bead-envelope estimate indicates possible overpacking; it is not a measurement of deposited material or an exact comparison with the current source mesh. This makes thin-region wall generation a concrete candidate for the relief, not a confirmed root cause.

The next comparison should change only the wall-generation strategy to adaptive-width generation, then inspect the resulting toolpaths before another physical trial. Compare the body/socket paths as well because this slicing change can affect them. Keep the successful geometry, orientation, and other settings unchanged. A close-up of the corresponding print and the matching saved project remain useful to distinguish path planning from physical alignment or extrusion effects. No application geometry or calibrated dimensions changed; private setup details and artifacts remain excluded.

### Adaptive-width comparison — toolpaths and reported finish improved

A second export supplied on 2026-09-16 uses adaptive-width wall generation. Replaying both files reproduces the opposing-lane pattern in the first slice and confirms its replacement by a single wider lane in both sampled legend sections. The sampled nominal outward bead envelopes remain within 0.02 mm of the prior slice, while the legend's total commanded extrusion decreases by approximately 44.7%, excluding supports and purge operations. Legend-bearing layer coverage is unchanged. These checks support the overpacking hypothesis, but do not prove that the physical relief is resolved or that every fine feature is preserved.

Body paths also change. Three sampled socket-opening sections, estimated from path centerlines and nominal bead widths, retain the narrow opening at approximately 1.194 mm; the sampled wider opening changes from approximately 4.040 to 4.033 mm. These are local path-envelope estimates, not measurements of printed clearance or validation of the complete socket. The application's mechanical dimensions are unchanged. Compare fit again after printing.

The recorded settings differ in wall generation and auxiliary purge-structure placement, plus derived settings metadata. Consequently this is not a perfectly isolated physical A/B comparison, although it directly demonstrates the targeted change in legend path planning. All personal settings and source exports remain private. Preserve the successful orientation and avoid further simultaneous adjustments for the next trial. Physical legend flushness, intact detail, and continued fit are the remaining checks; no application fix is justified yet.

On 2026-09-20, after slicing with adaptive-width walls, the user reported that the printed legend was **somewhat better but still had a small tactile relief**. Asked whether this print still fits, can be removed, and completes its travel, the user confirmed that the piece works perfectly. This is qualitative physical evidence for this sample, not a measured relief height, proof that wall generation alone caused the improvement, or validation of other OEM variants. Keep the 0.5 mm digital inlay unchanged; a further controlled comparison would need the exact matching slice and a close-up of the printed legend.

### OEM comparison print — fit confirmed for one sample; legend relief remains

On 2026-09-19, the user reported that the 8 mm Spark OEM comparison print turned out well. Installed on the K2, it seats without force, remains firm, can be removed, completes its travel, and does not rub neighboring keys or the case. These are physical observations for this one sample, not a repeatability or general compatibility claim. The user also feels some relief at the legend. The matched digital 3MF has a flush shared surface and negligible inter-part overlap; the physical relief therefore remains a print/slicing issue to investigate. Exact orientation and print settings were not recorded. Geometry provenance and artifact hash are in `docs/plans/oem-template-comparison-results.md`. The OEM profile and socket replace the runtime preset after this fit gate; the 0.5 mm inlay depth is unchanged.

### Additional OEM rows and widths — software candidates only

On 2026-09-20, seven separate blanks and matching exteriors were generated from the pinned KeyV2 source: rows 1–4 at 1u and row 5 at 1.25u, 1.5u, and 1.75u. The existing row 5/1u assets and all printed-default dimensions remain unchanged. The new variants use the same Cherry stem settings, structural support, and 0.5 mm vertical legend inlay. Their source and asset hashes are in `docs/plans/oem-variant-manifest.json`.

Automated solid checks and browser exports establish only software validity. No new row/width has been printed, fitted, or tested for neighboring-key clearance. These variants are explicitly experimental in the editor. Before treating any one as compatible, record the exact artifact and obtain feedback on insertion force, retention, safe removal, travel, surrounding clearance, and surface/legend quality. Wider keys may have different stabilization requirements; do not infer them from the 1u trial. The adaptive-width print investigating the existing legend relief remains a separate physical gate.

## Implemented provisional preset

The current TypeScript preset uses the following values in `src/geometry/config.ts`, including the planar-side correction below. These are experimental choices retained as a working baseline after the latest sample's reported good fit. Repeatable fit and full travel remain unvalidated; the result does not independently validate each dimension.

| Parameter                          | Selected value        | Rationale                                                                                    |
| ---------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| Base width and depth               | 18.0 mm               | Initial base measurement; a square 1u footprint is the first approximation                   |
| Nominal taper width and depth      | 13.8 mm               | Midpoint of the uncertain 13.5/14.1 mm readings; now measured at the taper reference plane   |
| Taper reference height             | 11.3 mm               | Existing analytic top height at the middle of a left/right top edge; fixes planar side slope |
| Bottom corner radius               | 1.0 mm                | Rounded-shell approximation                                                                  |
| Front/rear top edge center heights | 10.0 / 10.8 mm        | Latest user observations                                                                     |
| Front/rear dish depth              | 0.8 / 1.0 mm          | Latest corner-to-midpoint differences; smoothly interpolated parabolic top                   |
| Nominal horizontal wall inset      | 1.3 mm                | Provisional structural thickness                                                             |
| Vertical roof thickness            | 1.6 mm                | Leaves about 1.1 mm below the inlay                                                          |
| Socket boss outside diameter       | 5.6 mm                | Structural starting point near the observed boss size                                        |
| Socket boss bottom above base      | 1.0 mm                | Provisional recess; installed height and travel need testing                                 |
| Socket cross span / arm width      | 4.04 / 1.194 mm       | Rounded candidate model opening measurements, not adopted as validated fit                   |
| Socket insertion depth             | 3.6 mm                | Provisional blind-socket depth; not measured from the original cap                           |
| Legend depth                       | 0.5 mm vertically     | Inlaid region shares the actual faceted outer surface                                        |
| Surface refinement length          | 0.7 mm                | Bounds facet size before applying curvature                                                  |
| Legend longest dimension           | 3–11 mm, default 8 mm | Keeps the centered artwork within the roof; fine detail still requires slicer review         |

The shape is authored here from primitives and observations. Rounded corners and taper mean corner extrema need not equal the ideal unrounded surface formula. The SVG is scaled by its visible artwork bounds, preserving aspect ratio and the relative positions of separate paths. The inlay depth is measured vertically, rather than along each local surface normal.

Physical acceptance: the socket seats without excessive force, holds without unwanted wobble, can be removed safely, and permits full key travel and return without rubbing the case or neighboring caps. The cooled print must also have an intact roof, legible flush legend, and no unintended gaps. Report these observations before changing validation status.

## Geometry revision — planar exterior sides, 2026-09-13

The previous construction applied the curved top-height warp to an already tapered solid. That bent the exterior sidewalls and prevented full planar bed contact in a side orientation. The corrected construction intersects a straight, rounded-square frustum with an independently curved roof volume. The broad exterior sides are planar; the rounded corners remain rounded. The cavity construction is unchanged.

The base remains 18.0 mm square. The 13.8 mm nominal taper width is now anchored at Z=11.3 mm, the previous analytic mid-side top height. Each straight side obeys `abs(x or y) + (2.1 / 11.3) * z = 9`. Unlike the former constant-width top outline, the new dish perimeter follows the intersection of those planes and the curved roof. The top-height function is unchanged, but its triangulation and perimeter change slightly. Comparison with the preceding geometry found approximately 0.24 mm maximum displacement normal to the new planes at sampled non-corner side vertices, and maximum height changed from approximately 11.7511 to 11.7248 mm. These are geometric measurements, not physical validation.

No socket dimensions changed: boss diameter 5.6 mm, boss bottom Z=1.0 mm, cross span/arm 4.04/1.194 mm, and blind depth 3.6 mm. The legend remains a separate flush region with 0.5 mm vertical inlay. Physical legend relief is a separate unresolved printing issue; this revision does not claim to fix it.

Verification: all four side-planarity regression cases failed on the former geometry and pass on the correction. Tests check the full mesh stays behind each supporting plane, the central socket cross-sections at critical heights match the previous dimensions, the dish/inlay remain intact, and solids/export remain valid. All 28 domain tests and six Chromium/Firefox workflow/accessibility checks pass, along with types, lint, and build. An actual local-browser export was inspected and confirmed to contain the corrected geometry; the representative-artwork side-plane deviations were below 0.000001 mm.

Repeat-trial guidance: export a fresh model, re-import it, and use the slicer's lay-on-face action on a broad flat side. Do not reuse the old model's rotation: the side angle changed. Inspect the first layers for continuous coverage of that face and provide supports where still needed for the cavity/socket and other overhangs. Trial 3 reports improved printing and good fit; removal, full travel, and surrounding clearance still need explicit confirmation. The socket is still recessed above the base in upright orientation; this is not a support-free keycap.

## Implementation revision — stem module extraction, 2026-09-16

Stem/socket assembly moved from `generate.ts` into `stem.ts` without changing any mechanical value, operation order, or exported part. The boss is still joined to the shell, clipped to the exterior, and then cut by the blind socket. The module owns its temporary geometry; its caller owns inputs and the returned body solid.

Before extraction, mesh fingerprints were captured from the existing generator using an original square legend at sizes 3, 8, and 11 mm. They match byte-for-byte after extraction for both Body and Legend positions and indices. Direct module tests also verify attachment, clipping, socket sections, and ownership; the existing full-model socket/roof checks remain. This is software equivalence evidence, not additional physical validation. The adaptive-width print trial and remaining mechanical observations are still pending. Any future socket-fit control must retain these defaults and document changes and physical verification here.

## OEM shape/height probes, 2026-09-20

The original row 5/1u printed geometry and its runtime assets remain unchanged. A separate KeyV2 development recipe generated isolated corner-radius probes (0.5 and 1.5 mm around 1 mm) and depth-offset probes (−0.5 and +0.5 mm around zero). OpenSCAD reports manifold blanks; initial bounds and volume measurements are in [the customization plan](docs/plans/oem-customization.md). These are exploratory source parameters, not approved or physically validated ranges. Radius slightly changes maximum height; depth offset slightly changes the outer footprint. Central low-level vertices matched the reference in one bounded comparison, but complete socket, roof, legend, matching exterior, and 3MF invariants remain unchecked. No physical fit or printability claim follows from these probes.

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
