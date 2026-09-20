# Bundle the three interface languages

Status: accepted, 2026-09-20.

Keycap Studio supports English, Galician, and Spanish through small typed catalogues bundled with the browser application. It detects the first supported browser language and allows a session-only manual change. No language preference, project data, account, telemetry, or persistence is introduced.

The fixed language set and simple messages do not justify a translation runtime dependency. Catalogues share TypeScript-checked keys, and `Intl.NumberFormat` formats displayed measurements for the active locale while model numbers and 3MF output remain locale-independent. Geometry and SVG modules keep their existing language-neutral processing boundary; the UI localizes high-level operational messages and actionable errors.
