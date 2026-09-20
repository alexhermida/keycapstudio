# Offer bounded OEM measurements from generated KeyV2 meshes

Status: accepted for the local editor, 2026-09-20.

The user wants to vary outer shape and height after selecting an OEM row and width, without a physical print for each setting. KeyV2 fixes the nominal depth of each row and does not publish safe customization limits. The browser does not run OpenSCAD. A continuous slider over the existing fixed mesh would claim geometry that the exported 3MF does not contain.

Generate each offered quarter-millimeter combination with pinned KeyV2/OpenSCAD: corner radius 0.50–1.50 mm and depth offset −0.50–+0.50 mm. The limits are intentionally narrow software choices informed by initial mesh probes, not an OEM specification or a guarantee of fit. The eight existing row/width combinations each receive their own blank/exterior pairs. The untouched radius 1 mm, depth offset 0 pair reuses the original assets, including the printed row 5/1u reference. Load only the selected pair in the worker. Keep the socket tolerance, wall/roof construction, dish, tilt, SVG inlay depth, and colors fixed.

This adds static assets and build-time generation, while keeping preview/export browser-only and faithful to the selected KeyV2 geometry. Any nonzero depth offset is labeled **OEM derived**. Modified combinations are experimental; software validation permits selection and export without claiming physical validation. Broader or continuous controls would require a browser-compatible parametric implementation and a separate decision.
