# Experimental stem fit delta on the pinned reference socket

Status: accepted for implementation, 2026-09-29. Physical calibration is open.

The production shell preserves the central 7 × 7 mm region of a pinned KeyV2 reference mesh. A fit adjustment must therefore operate on that region rather than scale the stem or regenerate its mechanical baseline. `stemFitDeltaMm = 0.00` bypasses all fit booleans and keeps the existing mesh path exactly.

Positive deltas remove material to loosen the socket; negative deltas add material to tighten it. The magnitude is the **total** change in the thickness of each cross arm, split equally across opposing gripping faces. The two reference arm widths measured on the pinned asset in the straight gripping interval are approximately 1.216667 and 1.316667 mm. The adjustment uses those measured widths rather than the older procedural generator's nominal values.

Only the straight gripping interval at model Z=1.0–3.5 mm and the central spans of both arms are edited. The entrance bevel below, closed roof above, cross end walls, boss exterior, supporting structure, shell, and legend retain their reference geometry. Limits −0.10 to +0.15 mm in 0.05 mm steps are experimental choices, not calibrated fit presets. Both the controls and geometry boundary validate them.

The four-piece test file uses the same `createOemBlank` path, crops each adjusted socket, joins a small base, flips the opening upward, and raises a distinct A–D letter beside it. One 3MF contains A −0.05, B 0.00, C +0.05, and D +0.10 mm. The file carries no printer settings or G-code. Software solid, archive, and browser checks do not establish printed insertion, retention, removal, or repeatability.
