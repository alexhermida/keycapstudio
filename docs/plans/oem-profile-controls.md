# OEM profile selection and bounded controls

Date: 2026-09-19. Status: proposed implementation plan; controls below are not implemented. The OEM row 5 reference is already the only runtime blank. This plan responds to the user's request for a profile choice followed by controls that respect the selected profile's fixed values and allowed ranges. It does not change the printed reference or claim that a numeric upstream setting is physically safe.

## Product behavior

1. Show a **Profile** control before the artwork controls. Initially it has one real choice, **OEM · K2 lighting key · row 5 · 1u**. Selecting it displays its available controls and a short explanation of what is fixed. Do not show unavailable profiles as selectable options or imply that other OEM rows fit this key.
2. Preserve the printed OEM reference as the Reset/default state. Existing editable fields remain: SVG, visible legend size 3–11 mm (default 8), Body color, and Legend color. The legend stays centered over the OEM roof at the recorded `(0, 1.75)` mm offset. The two-color 3MF and preview continue to use the same generated mesh.
3. Show fixed profile facts as read-only text: OEM row 5, 1u, the pinned exterior/dish/tilt and height, MX-compatible stem, structural flared supports, and 0.5 mm vertical inlay. The KeyV2 profile's own fixed parameters are not general sliders. The UI must not suggest that upstream OpenSCAD settings are verified fit ranges.
4. A switch-fit adjustment is a separate, **advanced and physically gated** follow-up. Do not expose it with an invented range while the current controlled print is still being evaluated. Its default must reproduce the printed OEM reference exactly. If chosen, describe tighter/looser in user terms, show the exact value, offer Reset, and mark unprinted settings as experimental until physically checked.

## Source and current boundary

The pinned KeyV2 `oem_row(5, 0)` profile fixes bottom width/height at 18.05 mm, width/height differences at 5.8/4 mm, cylindrical dish depth at 1 mm, rearward top skew at 1.75 mm, stem inset at 1.2 mm, nominal total depth at 11.2 mm, and top tilt at -3 degrees. The recipe fixes the Cherry stem's outer slop at 0.35 mm, inner slop at 0.2 mm, throw at 4 mm, flared structural support, and disabled sacrificial stem aids. These are source parameters, not measured STL extents and not approved ranges. The actual exported blank measures about 17.45 × 17.61 × 10.336 mm after base normalization; see the comparison report.

The browser currently fetches one indexed complete blank and one matching solid exterior. `generateFromBlank` cuts the SVG inlay into those solids. It cannot vary the KeyV2 body, dish, wall, supports, or stem by changing a number in React: KeyV2/OpenSCAD run only during asset preparation, not in the browser. A UI slider without a corresponding new solid would be misleading.

## Control model and implementation steps

**Step 1 — profile boundary and visible selection.** Introduce a small typed profile descriptor with a stable ID, display name, asset pair, legend center, and explicit editable/fixed capabilities. Keep it independent of React. Set `oem-row5-k2` as the sole option and default. Pass the selected profile ID through the editor, `useKeycap`, worker request, and geometry loader; use the descriptor's assets and legend center to generate the model. The control must remain honest with one option, keyboard-accessible, and not add a general settings framework. Changing profile or an editable geometric value must invalidate the prior preview/export until the matching new model is ready. Colors need not regenerate geometry.

**Step 2 — preserve and verify the OEM reference.** The default output must match the current OEM mesh and 3MF behavior. Keep Body and Legend watertight, separate, nonoverlapping, and assembled. Test descriptor validation, unknown profile rejection, default mesh equivalence, bounds and legend placement at 3/8/11 mm, generated 3MF structure, and the browser workflow. Check root and Pages-subpath loading. The existing procedural baseline stays available for rollback but is not a public profile choice.

**Step 3 — decide any new OEM control one at a time.** For each proposed control, document what it changes, which KeyV2 parameter(s) it maps to, its default, candidate min/max/step, interactions with the other solids, and an acceptance print. A KeyV2 customizer interval (for example, stem slop 0–1 mm) is not automatically a safe interval for this K2. Mechanical geometry changes require a new pair of aligned solids or a specifically tested local Boolean operation; the static asset cannot be continuously parameterized by itself. Prefer a small set of offline-generated, hashed, versioned mesh variants for a narrow fit adjustment if a physical trial supports them. Keep the exterior shared only after confirming surface equivalence. Arbitrary continuous changes to outer dimensions or dish would require a new browser-capable geometry implementation and a much larger validation effort.

## Physical gate and pending decisions

- The current OEM print confirms one sample's seating, retention, removal, travel, and clearance; its legend has tactile relief. A controlled adaptive-width print is in progress. Record its result before changing inlay depth or claiming a print-quality fix. This trial does not by itself establish safe mechanical adjustment bounds.
- Before exposing any fit value other than the reference default, compare at least the intended extremes with the reference for insertion force, retention, removal, full travel, and surrounding clearance. Record exact generated artifact hashes and non-identifying print results in `CALIBRATION.md`. Do not silently change the printed default.
- Confirm which additional OEM characteristics the user wants first: only appearance controls, fit adjustment, or outer dimensions. Keep range and step decisions open until a corresponding geometry method and calibration evidence exist.
- Additional profiles and keyboards remain out of scope until requested and independently validated. A single-option profile selector is groundwork for future choices, not a compatibility claim.

## Delivery checks

Implement in small commits: descriptor/selector and regression coverage first; any mechanically adjustable variant only after the physical gate. Update `docs/MVP.md`, `STATUS.md`, `CALIBRATION.md` and an ADR when the actual adjustment semantics are accepted. Run types, lint, formatting, unit tests, production build, Chromium/Firefox workflow tests, and a Pages-subpath smoke test. Publication remains a separate action.
