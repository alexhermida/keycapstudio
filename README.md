# Keycap Studio

A browser app that turns a filled SVG icon into a two-color OEM-profile keycap. Select **R1–R4**, then customize its measurements. **R4 · 1u** is the starting point for the Keychron K2 lighting key.

Choose an OEM row and key width, adjust base width/depth, front/rear edge heights and corner radius, upload an icon, adjust its legend size, choose two colors, inspect the 3D model, and download a 3MF. Processing happens locally: no backend, account, telemetry, or saved-project storage.

The editor is available in English, Galician, and Spanish. It follows the browser language when supported, and a manual selection applies only to the current session. The in-app Help button explains privacy and printing guidance. SVG artwork and keycap settings stay in memory for the current session and are not sent to an application server or stored as projects; reloading starts a new design. Browser caching of site resources and the downloaded 3MF are separate from project storage.

**Experimental MVP:** the earlier KeyV2 template had reported sample-level fit. The new adjustable profiles preserve its insertion geometry but require new physical fit and travel checks. They are not exact replicas of the K2. See [CALIBRATION.md](CALIBRATION.md).

## Run locally

Use Node.js 22.12 or newer; Node 22 is the CI target.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The app starts at OEM R4, 1u with an original example icon. Choose another offered row/width, upload your own SVG or try Spark/Orbit. Key width is measured in `u`; legend size is independently measured in millimeters. Refreshing starts a new design.

The header links to the [GitHub repository](https://github.com/alexhermida/keycapstudio) and the creator's [Buy Me a Coffee page](https://buymeacoffee.com/dvd16).

All four profiles offer 1u. R4 also retains the earlier 1.25u, 1.5u and 1.75u choices. Open **Customize measurements** to adjust base width (±0.5 mm around the selected size), depth (17.5–18.5 mm), front/rear edge heights (6.8–12.5 mm), and base corner radius (0.5–1.5 mm). Sliders step by 0.1 mm; numeric fields permit direct entry. Heights refer to the **center of each top edge**, measured from the base; front faces the typist and rear faces the screen. The concave top has higher corners. Overall mesh dimensions appear below the preview.

Changing row or key width loads that preset's initial measurements and preserves artwork, legend size, and colors. **Reset** restores the selected preset. These are experimental generator limits, not OEM tolerances or guaranteed keyboard clearance. The switch socket is fixed; wider/stabilized keys remain outside the available sizes.

## Development checks

```sh
npm run check           # Types, ESLint, unit/domain tests, production build
npm run format:check    # Formatting
npx playwright install chromium firefox
npm run test:e2e        # Browser workflow and accessibility tests
```

Run `npm run build` before browser tests when source changes. `npm run test:watch` watches unit tests; `npm run format` formats source and docs. Browser tests launch a local production preview. On Linux, install browser system dependencies with `npx playwright install --with-deps chromium firefox`.

## SVG support

- Filled paths, disconnected regions, holes with nonzero/evenodd fill rules, and line, Bezier, and arc path commands.
- Optional viewBox, including a nonzero origin; artwork must remain inside it when provided.
- Groups and translate, scale, rotate, matrix, skewX, and skewY transforms.
- Simple opaque colors and a limited set of inline fill styles.
- Limits: 150 KB, 256 elements, 2,000 path commands, and 20,000 sampled contour points.

Visible artwork bounds determine centering and size; proportions are preserved. All regions use one legend material. A single source fill color initializes the legend color picker.

Convert strokes and basic shapes to filled paths first. Text, clipping, masks, gradients, transparency, embedded images, stylesheets, external references, and scripts are rejected with guidance. Very fine details can disappear during slicing; inspect the layer preview.

## Printing

The 3MF contains one **Custom Keycap** assembly with separately named **Body** and **Legend** parts. The legend follows the curved surface and extends 0.5 mm vertically into the roof. It may contain multiple disconnected closed solids. The parts partition the solid without intentional overlapping volume.

Open the file as a model in OrcaSlicer or Snapmaker Orca, keep both parts assembled, and assign a filament to each. No printer profile or G-code is included. The 3MF is exported in the keycap's upright modeling orientation; it is not a pre-rotated print setup. Choose placement and supports in the slicer so each row, width, and adjusted shape can be inspected before slicing.

For side-oriented prints, use the slicer's lay-on-face action on a broad side of the newly exported assembly, keeping Body and Legend together. A side-oriented trial of the earlier procedural cap improved the top finish; the exact orientation of the successful OEM row 5/1u sample was not recorded. Reapply placement after geometry revisions instead of reusing an old saved rotation. Inspect first-layer coverage; the OEM sides are not perfectly planar, and the cavity, roof, and socket can still need supports. The earlier unsupported icon-up trial produced a poor top and unusable socket; this does not prove that side placement is universally best for every variant.

Inspect the sliced legend and socket before printing. Adaptive-width/Arachne walls replaced overlapping narrow legend paths in a comparison and produced somewhat less tactile relief on a later print, but did not eliminate it. Check thin strokes and seams in layer preview; a color preview alone cannot establish print quality. No specific temperature, speed, or layer-height preset has been validated for this app.

Print one cap first. After cooling, check seating, retention, removal, full key travel, and clearance from surrounding keys and the case. Do not force a tight socket. Automated checks do not establish physical fit or print quality.

## GitHub Pages

This folder is the standalone repository root. Local references under `_tmp/` are ignored.

1. Push this repository to your intended GitHub remote.
2. Under **Settings → Pages**, choose **GitHub Actions** as the source.
3. Run **Deploy to GitHub Pages** from the Actions tab on `main`.

Deployment is manual: pushing main does not update the public app. It runs formatting, type/lint/unit checks, a production build, and Chromium/Firefox tests before publishing only `dist/`. **Quality checks** runs on pull requests and pushes to main. No extra secrets are needed beyond GitHub's workflow token. Check the successful deployment's commit against the intended revision; current verification evidence is recorded in [STATUS.md](STATUS.md).

Relative asset URLs support both a repository subpath and a root domain. The worker and WebAssembly binary are bundled locally. Workflow structure follows the [Vite Pages guide](https://vite.dev/guide/static-deploy.html#github-pages).

## Repository guide

- [AGENTS.md](AGENTS.md): agent workflow, meaningful commits, and privacy constraints.
- [STATUS.md](STATUS.md): progress, verification evidence, and remaining gates.
- [CONTEXT.md](CONTEXT.md): domain glossary.
- [MVP requirements](docs/MVP.md): agreed scope and exclusions.
- [Architecture](docs/ARCHITECTURE.md): module boundaries and dependency rationale.
- [Calibration](CALIBRATION.md): parameter choices and physical validation.
- [Decisions](docs/adr/): architectural tradeoffs.

Core modules live in `src/svg`, `src/geometry`, and `src/export`; React components and the worker hook are separate. Mechanical values live in `src/geometry/config.ts`.

The worker constructs a parametric rounded, tapered shell using the selected dimensions and the unchanged lower stem from the earlier reference mesh. It uses the same exterior for the flush inlay. No new dependency or server is required. Mechanical parameters, reference presets, and limits live in `src/geometry/config.ts`; [ADR 0006](docs/adr/0006-parametric-oem-profiles.md) documents dimensions, assumptions, provenance, and the preserved stem boundary.

The previous procedural generator and KeyV2 catalogue assets/recipes remain available for comparison and rollback; the new worker loads only the single reference blank. Their old `row5` identifier is a KeyV2 template name, not Keychron's R4 designation.
OEM mesh provenance: [KeyV2](https://github.com/rsheldiii/KeyV2) at commit `19f0d2faadd4949634c93f38d1a66869d29e8f43`, generated with the repository's OpenSCAD recipes and converted to indexed meshes by `node scripts/build-oem-assets.mjs`. KeyV2's GPL-3.0 license text is preserved in [KEYV2-LICENSE.md](public/KEYV2-LICENSE.md) and shipped with the static build.

## Limitations

The adjustable OEM profiles have automatic geometry/export checks but no physical fit validation. Text, fonts, other profiles, stabilized sizes, socket-fit tuning, and project saving are deferred. Chromium and Firefox are tested, including mobile layout; Safari and real touch-device behavior remain unverified. Earlier prints had slight tactile legend relief despite flush digital geometry.
