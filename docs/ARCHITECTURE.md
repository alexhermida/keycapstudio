# Implementation guide

The application is a static React/TypeScript editor. It has no backend, accounts, telemetry, or persistence. Uploaded artwork stays in memory.

## Dependencies

- React and React DOM: editor state and accessible HTML controls.
- Vite and TypeScript: local development, static builds, strict type checking, and worker bundling.
- Three.js: interactive mesh preview and SVG path/transform interpretation. Import only the required modules.
- svg-pathdata: validate SVG path syntax before interpreting it; malformed paths must not silently produce partial artwork.
- Manifold: browser-compatible WebAssembly solid geometry, polygon fill rules, and robust subtraction/intersection for an inlaid legend.
- fflate: assemble the XML and mesh resources into a downloadable ZIP-based 3MF.
- Vitest, Testing Library, and jsdom: domain tests and accessible UI interaction checks.
- Playwright: browser-level upload, generation, download, and error-recovery tests.
- axe-core: automated WCAG A/AA checks in the browser test suite.
- ESLint and React Hooks rules: consistent correctness checks alongside TypeScript.
- Prettier: readable, consistent formatting with a reproducible check for contributors and agents.

No external generator code, keycap mesh, personal artwork, or printer profile is bundled. Public examples and fixtures are authored for this project.

## Boundaries

- SVG ingestion validates a deliberately limited subset before generating plain contour data.
- A dedicated worker owns Manifold and generates the body and legend solids. React receives mesh arrays and summary measurements.
- 3MF serialization takes those same mesh arrays; preview and export cannot use different geometry.
- The UI owns colors, file selection, legend size, progress/error states, and preview camera controls.

Keep mechanical values in `src/geometry/config.ts`. Record provisional choices in CALIBRATION.md. Automated solid validation does not establish physical fit.

## Stem module

`src/geometry/stem.ts` owns stem/socket assembly through `attachStem(kernel, shell, outside)`. It joins the boss to the supplied shell, clips the joined solid to the exterior, then cuts the blind cross-shaped socket. The order is intentional: the cut applies to the joined body, not just an isolated boss. The caller retains ownership of both inputs and owns the returned solid; the module frees its own temporary Manifold objects even on failure.

The module reads the existing centralized dimensions. It does not expose fit adjustments or a new exported part. `generate.ts` still returns only Body and Legend, preserving the preview/worker/export contracts. This isolates future socket work without a plugin system or additional dependencies.

Direct tests use a synthetic shell to verify roof attachment, clipping, critical socket sections, and input/result lifetime. Whole-generator tests retain geometric invariants and pre-extraction mesh fingerprints for a public square icon at minimum, default, and maximum sizes. Review deliberate geometry or kernel changes against CALIBRATION.md before updating those fingerprints; they are not substitutes for physical testing.
