# Keycap Studio

A browser app that turns a filled SVG icon into a two-color OEM-profile keycap. The **Keychron K2 top-right 1u lighting keycap (OEM row 5)** is the default and the only variant with reported physical fit.

Choose an OEM row and key width, upload an icon, adjust its legend size, choose two colors, inspect the 3D model, and download a 3MF. Processing happens locally: no backend, account, telemetry, or saved-project storage.

**Experimental MVP:** one printed OEM row 5 sample passed the requested K2 fit and travel checks. Its legend has perceptible relief despite flush exported geometry; repeatability remains untested. See [CALIBRATION.md](CALIBRATION.md).

## Run locally

Use Node.js 22.12 or newer; Node 22 is the CI target.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The app starts at OEM row 5, 1u with an original example icon. Choose another offered row/width, upload your own SVG or try Spark/Orbit. Key width is measured in `u`; legend size is independently measured in millimeters. Refreshing starts a new design.

The initial catalogue has rows 1–5 at 1u, plus row 5 at 1.25u, 1.5u, and 1.75u. Only row 5/1u has passed one physical K2 fit trial. Other combinations are experimental and may not fit your keyboard. Larger keys or keys requiring stabilizers are not offered yet.

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

Open the file as a model in OrcaSlicer or Snapmaker Orca, keep both parts assembled, and assign a filament to each. No printer profile or G-code is included. Choose orientation, supports, and settings in the slicer. Inspect socket access, roof support, and small icon features.

For side-oriented prints, use the slicer's lay-on-face action on a broad side of the newly exported model. Reapply it after geometry revisions instead of reusing an old saved rotation. Inspect first-layer coverage; the OEM sides are not perfectly planar, and the cavity and socket can still need supports.

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

The worker loads the selected OEM blank and matching exterior from local binary mesh assets. The printed row 5/1u reference retains its original assets. The [variant recipe](docs/plans/keyv2-oem-variant.scad), [generated manifest](docs/plans/oem-variant-manifest.json), and [OEM comparison](docs/plans/oem-template-comparison-results.md) record provenance. The previous procedural blank and its isolated stem/socket module remain in source for comparison and rollback. A future Advanced switch-fit control is outlined in the MVP document; it is not available in the current UI.

OEM mesh provenance: [KeyV2](https://github.com/rsheldiii/KeyV2) at commit `19f0d2faadd4949634c93f38d1a66869d29e8f43`, generated with the repository's OpenSCAD recipes and converted to indexed meshes by `node scripts/build-oem-assets.mjs`. KeyV2's GPL-3.0 license text is preserved in [KEYV2-LICENSE.md](public/KEYV2-LICENSE.md) and shipped with the static build.

## Limitations

The app generates the listed OEM rows/widths, but physical compatibility has only been reported for one row 5/1u K2 lighting-key sample. Text, fonts, arbitrary key sizes, other profiles, fit tuning, and project saving are deferred. Desktop Chromium and Firefox are tested; full mobile and Safari support are not verified. Separate Body/Legend parts are user-confirmed in the slicer. Repeatability and physical legend flushness remain unresolved; no broadly validated compatibility or print-quality claim is made.
