# Keycap Generator

A planned browser app for turning an SVG icon into a two-color printable keycap for the top-right lighting key of a Keychron K2.

## Project status

The project is in a design interview. Only documentation exists; there is no runnable app, dependency setup, automated test suite, or deployment yet. See [STATUS.md](STATUS.md) for current progress and unresolved decisions.

## MVP workflow

1. Upload a supported SVG icon.
2. Adjust the centered legend's size and preview the body and legend colors in 3D.
3. Download a 3MF containing separate Body and Legend parts.
4. Open it in the target slicer, assign materials to the parts, and prepare the print.

The MVP targets one 1u lighting keycap with a Cherry MX compatible stem. Text, fonts, and other keycaps or keyboards are deferred. Physical fit still requires calibration with the user's keyboard and printer.

## Technology and hosting

React and TypeScript, with all model processing in the browser and hosting on GitHub Pages. Uploaded SVG files remain local to the browser. Setup, development, verification, and deployment commands will be documented when the app is scaffolded.

This directory is a standalone Git repository intended for the public remote. The earlier Python project in the parent directory is not part of this repository. Local reference files under `_tmp/` are excluded from version control. No remote or deployment is configured yet.

## Repository guide

- [MVP requirements](docs/MVP.md): agreed behavior and open product questions.
- [Progress](STATUS.md): completed work, next steps, and verification status.
- [Agent guide](AGENTS.md): constraints and workflow for AI contributors.
- [Glossary](CONTEXT.md): shared domain terms.
- [Calibration](CALIBRATION.md): measurements and physical validation records.
- [Architecture decisions](docs/adr/): rationale for consequential choices.

Documentation and meaningful automated checks are part of the deliverable. Automated checks will cover the software; physical prints must establish fit and print quality.
