# Keycap Studio

A browser app that turns a filled SVG icon into a two-color printable replacement for the **Keychron K2 top-right 1u lighting keycap**.

Upload an icon, adjust its size, choose two colors, inspect the 3D model, and download a 3MF. Processing happens locally: no backend, account, telemetry, or saved-project storage.

**Experimental MVP:** a physical sample of the current geometry is reported to fit well, but broader mechanical validation is incomplete. A raised legend remains a known print-quality issue despite flush exported geometry. Test your own print; see [CALIBRATION.md](CALIBRATION.md).

## Run locally

Use Node.js 22.12 or newer; Node 22 is the CI target.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The app starts with an original example icon; upload your own SVG or try Spark/Orbit. Refreshing starts a new design.

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

For side-oriented calibration prints, use the slicer's lay-on-face action on a broad flat side of the newly exported model. Reapply it after geometry revisions instead of reusing an old saved rotation. Inspect first-layer coverage; the rounded corners, cavity, and socket can still need supports. Planar sides do not make the entire model support-free.

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

Stem/socket assembly is isolated in `src/geometry/stem.ts` and covered by direct tests plus whole-model regression checks. A future Advanced switch-fit control is outlined in the MVP document; it is not available in the current UI.

## Limitations

Only the K2 lighting key is supported. Text, fonts, other keys/keyboards, shape customization, and project saving are deferred. Desktop Chromium and Firefox are tested; full mobile and Safari support are not verified. Separate Body/Legend parts are user-confirmed in the slicer. Good fit is reported for the latest sample, but full travel, clearance, retention, removal, and repeatability have not been individually confirmed. Physical legend relief remains unresolved; no broadly validated compatibility or print-quality claim is made.
