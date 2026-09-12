# Keycap Generator: agent guide

## Start here

Read README.md, STATUS.md, CONTEXT.md, CALIBRATION.md, docs/MVP.md, and the accepted decisions in docs/adr/ before making changes. Inspect the existing implementation before proposing a change. If these documents disagree, surface the conflict; the user's latest explicit decisions take precedence.

## Product boundaries

- Build a TypeScript and React app hosted on GitHub Pages. SVG processing, model generation, preview, and 3MF export run locally in the browser.
- V1 supports only the user's Keychron K2 top-right 1u lighting keycap, with a Cherry MX compatible stem.
- Support an uploaded SVG, a centered legend with size adjustment, one body color, one legend color, and a 3D preview.
- Defer text, fonts, other keyboards, other rows and sizes, PNG input, more colors, arbitrary legend positioning or rotation, layout editing, and user-configurable mechanical geometry.
- Do not expand scope without user direction.

## Geometry and export invariants

- Prefer deterministic geometry. Keep mechanical parameters centralized in a dedicated config.ts module when implementing geometry.
- Body and legend must be separate watertight meshes with no overlapping volume. The legend must be flush with the external surface and extend approximately 0.5 mm into the body.
- The Legend part may contain multiple disconnected watertight solids corresponding to separate icon regions. Preserve their placement and assign them together as one material; do not connect them with added geometry.
- Export a 3MF assembly named `Custom Keycap` with independently assignable `Body` and `Legend` parts. Include no sliced G-code.
- Support simple filled SVG paths, multiple paths, holes, viewBox, and common transforms. Define the exact supported subset and reject unsupported input clearly.
- Treat imported SVG as untrusted data; do not execute scripts, inject unsanitized markup, or fetch external resources from it.

## Physical calibration gate

Initial measurements are provisional; see CALIBRATION.md. Never claim a fit based only on a preview or automated tests.

Never silently change a physically validated dimension. For any change, update CALIBRATION.md with the reason and affected validation, and update tests where appropriate. Stop at a physical calibration gate and obtain user print feedback before treating the geometry as validated or continuing work that depends on that validation. Independent software work may continue.

## Implementation practices

- Make the smallest coherent change. Preserve unrelated user changes.
- Commit meaningful implementation milestones after relevant verification. Inspect staged content for private information and generated reference artifacts before committing.
- Keep geometry generation, SVG interpretation, and 3MF packaging independent of React so they can be tested directly. Keep UI state local where practical and avoid unnecessary abstractions.
- Explain the purpose of each new dependency. Document non-obvious decisions and limitations, rather than narrating obvious code.
- Add meaningful tests for parsing, validation, geometry invariants, export structure, and the core user workflow. Add regression coverage for bugs.
- Configure TypeScript checking, linting, tests, a production build, and GitHub Actions checks during scaffolding. Document actual commands in README.md once they exist; do not present planned commands as runnable.
- Run the applicable checks before declaring implementation complete. Report failures and checks that could not run. The earlier Python-specific pytest/ruff instructions are superseded by the agreed TypeScript stack.
- Keep model generation from blocking UI interaction; choose the execution approach during implementation.

## Documentation and handoff

- State a short plan, implement, verify, then summarize changes and any physical verification needed.
- Update STATUS.md whenever task progress, decisions pending, blockers, or verification evidence change. Distinguish planned, implemented, automatically verified, and physically verified work.
- Keep README.md useful to humans: purpose, setup, commands, usage, deployment, and limitations as they become available.
- Keep CONTEXT.md a domain glossary only. Put requirements in docs/MVP.md and meaningful architectural tradeoffs in docs/adr/.
- Document decisions as they are resolved. Record open questions explicitly instead of inventing user requirements.
- This repository is intended to be public. Keep the user's personal printer model, slicer choice, and private printing setup out of repository files, fixtures, screenshots, and commit messages. Public compatibility requirements may name supported software without identifying it as the user's setup. Record only non-identifying calibration results; ask before publishing personal setup details.
- Do not commit secrets or add credentials to browser code. Do not publish or deploy during the design interview.
