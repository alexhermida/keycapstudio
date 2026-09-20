# Keycap Studio

A browser app that turns a filled SVG icon into a two-color OEM-profile keycap. The **Keychron K2 top-right 1u lighting keycap (OEM row 5)** is the default and the only variant with reported physical fit.

Choose an OEM row and key width, adjust corner radius and row-relative height, upload an icon, adjust its legend size, choose two colors, inspect the 3D model, and download a 3MF. Processing happens locally: no backend, account, telemetry, or saved-project storage.

**Experimental MVP:** one printed OEM row 5 sample passed the requested K2 fit and travel checks. Its legend has perceptible relief despite flush exported geometry; repeatability remains untested. See [CALIBRATION.md](CALIBRATION.md).

## Run locally

Use Node.js 22.12 or newer; Node 22 is the CI target.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The app starts at OEM row 5, 1u with an original example icon. Choose another offered row/width, upload your own SVG or try Spark/Orbit. Key width is measured in `u`; legend size is independently measured in millimeters. Refreshing starts a new design.

The header links to the [GitHub repository](https://github.com/alexhermida/keycapstudio) and the creator's [Buy Me a Coffee page](https://buymeacoffee.com/dvd16).

The initial catalogue has rows 1–5 at 1u, plus row 5 at 1.25u, 1.5u, and 1.75u. Corner radius is offered from 0.50 to 1.50 mm and height adjustment from −0.50 to +0.50 mm relative to the selected OEM row, both in 0.25 mm steps. Reset restores the original measurements. A nonzero height adjustment is labeled **OEM derived**. Only the unmodified row 5/1u has passed physical K2 fit trials; changed measurements and other sizes are experimental and may not fit your keyboard. Larger keys or keys requiring stabilizers are not offered yet.

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

The worker loads the selected OEM blank and matching exterior from local binary mesh assets. The printed row 5/1u reference retains its original assets. The [variant recipe](docs/plans/keyv2-oem-variant.scad), [measurement recipe](docs/plans/keyv2-oem-customizable.scad), [variant manifest](docs/plans/oem-variant-manifest.json), [measurement manifest](docs/plans/oem-customization-manifest.json), and [OEM comparison](docs/plans/oem-template-comparison-results.md) record provenance. Regenerate measurement assets with `node scripts/generate-oem-customizations.mjs` after checking out the pinned KeyV2 source under `_tmp/KeyV2` and installing OpenSCAD 2026.03.07. The previous procedural blank and its isolated stem/socket module remain in source for comparison and rollback. A future Advanced switch-fit control is outlined in the MVP document; it is not available in the current UI.

OEM mesh provenance: [KeyV2](https://github.com/rsheldiii/KeyV2) at commit `19f0d2faadd4949634c93f38d1a66869d29e8f43`, generated with the repository's OpenSCAD recipes and converted to indexed meshes by `node scripts/build-oem-assets.mjs`. KeyV2's GPL-3.0 license text is preserved in [KEYV2-LICENSE.md](public/KEYV2-LICENSE.md) and shipped with the static build.

## Limitations

The app generates the listed OEM rows/widths and bounded measurement choices, but physical compatibility has only been reported for the unmodified row 5/1u K2 lighting key. Measurement limits are engineering choices, not an official OEM standard. Text, fonts, arbitrary key sizes, other profiles, fit tuning, and project saving are deferred. Desktop Chromium and Firefox are tested; full mobile and Safari support are not verified. Separate Body/Legend parts are user-confirmed in the slicer. The adaptive-width print improved but did not fully eliminate tactile legend relief; no broadly validated compatibility or print-quality claim is made.
