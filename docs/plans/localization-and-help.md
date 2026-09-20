# Localization and contextual help

Status: implemented locally, 2026-09-20. Awaiting review and separate deployment.

## Outcome

Offer the complete editor in English, Galician, and Spanish, with concise privacy information and practical printing help available without expanding the main workspace.

## Current implementation and documentation conflicts

- Before implementation, `App.tsx` owned editing state, English copy, notices, and an inline printing `<details>` section. Those texts now use the bundled catalogue and the guide is a modal.
- SVG parsing and geometry errors carry English strings through the worker and `useKeycap`. High-level engine, upload-limit, and stroke guidance is localized at the UI boundary; remaining detailed parser/geometry diagnostics retain their original message for now.
- Source inspection found no application persistence, accounts, or telemetry. OEM assets are fetched from bundled URLs; uploaded files are read into memory and export creates a downloadable Blob. A runtime network/storage audit remains part of implementation verification.
- README, ADRs 0003/0004, and the implementation describe an experimental OEM catalogue and bounded measurements. The original agent scope/ADR 0001 and parts of MVP still describe a single-key product. Some status/calibration paragraphs also retain superseded pending observations. Use the explicit later decisions and dated evidence when drafting help; reconcile obsolete wording without inventing additional compatibility claims. This plan adds no geometry features.

## Proposed experience

1. Add a compact, explicitly labeled language selector: English / Galego / Español, with no flag icons. Use locale codes `en`, `gl`, and `es`.
2. Initially resolve the first supported entry in `navigator.languages`, including regional forms such as `gl-ES`; fall back to English. A manual choice applies immediately for the current page session. Do not persist it in cookies or browser storage. Reloading detects browser preferences again.
3. Add one visible Help button near the existing header actions. Open a modal with two clearly titled sections: Privacy and Printing. Use headings and short numbered print steps rather than a custom tab system. The existing long print disclosure moves into this modal; a small Printing help link beside download can open the same modal at that section.
4. Keep a short statement visible in the workspace: “Processed in your browser. Designs are not saved.” Preserve immediate field guidance and experimental-fit warnings where the relevant choice is made.
5. Changing language or opening help preserves artwork, colors, dimensions, camera position, and pending generation. Neither action starts a new geometry job.

## Privacy copy proposal

Spanish draft, to translate with equivalent meaning:

> Tu SVG y la configuración de la tecla se procesan en tu navegador. La aplicación los mantiene solo en memoria durante esta sesión: no los envía a un servidor ni los guarda para recuperarlos después. Al recargar la página empezarás un diseño nuevo. El archivo 3MF solo se guarda en tu dispositivo cuando lo descargas.

Supporting detail: the application has no accounts or analytics and does not save designs or the language choice in cookies, localStorage, sessionStorage, or IndexedDB. The browser may cache website resources; that is distinct from saving a project. Scope claims to application behavior: do not promise that the hosting provider records no access information. External GitHub and support links open separate services. Verify network/storage behavior before shipping this wording.

Avoid “nothing is stored locally,” “no data ever leaves your device,” and claims of offline availability: those conflate design privacy with downloads, asset requests, browser caching, and hosting behavior.

## Printing help content

- Import the 3MF as one assembly; assign materials to `Body` and `Legend`, preserving their assembled positions. The file includes no printer profile or G-code.
- Explain that the exported orientation is for modeling. Present broad-side placement using the slicer's lay-on-face action as a trial starting point, based on the earlier observation, not a universal best orientation. Reapply placement to each fresh model and inspect bed contact because OEM sides are not perfectly planar.
- Inspect support needs in the cavity, roof, and socket; inspect layer coverage and keep the socket opening clear.
- Inspect thin legend strokes, seams, and material assignments in actual layer previews. Describe adaptive-width/Arachne walls as a comparison that improved one trial, with remaining relief, rather than a guaranteed fix.
- Print one sample, cool it, and check insertion without force, retention, removal, full travel/return, and surrounding clearance.
- State that physical feedback covers the unmodified row 5/1u sample. Its exact successful print orientation was not recorded. Other variants/measurements remain experimental; no universal temperature, speed, or layer-height recipe has been validated.

Use the dated evidence in CALIBRATION.md and the existing README guide. Keep personal setup and private trial artifacts out of public content. Agree a small terminology glossary for keycap, legend, stem socket, row, and width across all three languages.

## Implementation design

- Add a small `src/i18n` module with three bundled, typed message catalogues, locale resolution, and number formatting. Prefer a shared catalogue shape checked by TypeScript and complete phrases with typed parameters; avoid string concatenation and translation lookup by English sentence. For this fixed three-language app, start without a new translation dependency or a general translation engine. Reassess a maintained library only if complex pluralization or external translation workflows become requirements.
- Keep locale state in a small React provider and expose messages/formatters through a hook. Keep editor state where it is. Translate visible text, accessible names, status messages, example descriptions, preview fallback messages, help, and document metadata. Update the document `lang` on locale changes.
- Store example IDs separately from uploaded filenames and store notice/error identifiers rather than translated strings. Derive their display text during rendering so an already-visible error or notice changes language immediately. User filenames remain literal text.
- Introduce typed domain error codes with bounded parameters for expected validation/generation failures. Serialize plain error payloads through the worker. Translate at the UI boundary; keep SVG/geometry/export modules independent of React and locale. Unknown library exceptions map to an actionable generic localized message. Do not classify errors by comparing their English text.
- Use `Intl.NumberFormat` for displayed measurements, while keeping numeric control values and serialized 3MF numbers locale independent. Preserve the exact exported names `Custom Keycap`, `Body`, and `Legend`; explain their translated meanings in help.
- Extract `LanguageSelector` and `HelpDialog` as focused components, and give `ColorField` a complete translated accessible label instead of appending the English word “color”. Avoid splitting every control or reorganizing geometry as part of this work.
- Implement help with native `<dialog>` and `showModal()`, an accessible title, explicit close button, Escape dismissal, deliberate initial focus, and focus return to the opener. Keep background controls inert while open. Bound height with internal scrolling; verify narrow windows and zoom. Render translated content as React text/elements, without HTML injection.

## Delivery order

1. Complete: bundled typed catalogues, browser-language detection, session-only selection, and locale-sensitive measurement displays.
2. Complete: editor, preview labels, notices, and help copy are localized. SVG and worker errors keep their domain boundary; the UI localizes high-level engine, upload-limit, and stroke guidance.
3. Complete: native accessible help dialog and concise privacy link are implemented. The former inline printing disclosure moved to the dialog.
4. Complete locally: unit, browser, accessibility, formatting, type, lint, and production-build checks. Deployment remains a separate action.

## Acceptance checks

- Type checking enforces matching catalogue keys. Unit tests cover language fallback and regional matching.
- Browser tests cover all three languages, changing language with an existing error/notice, browser preference detection, and session reset. Confirm language changes preserve the design and camera and do not restart generation, including while a job is pending.
- Verify localized labels and decimal displays while export retains the same mesh data, valid numeric serialization, and assembly/part names.
- Exercise modal opening from each entry point, close button, Escape, focus containment and restoration. Run axe with the modal both open and closed and inspect longer Spanish/Galician text at narrow widths and browser zoom.
- Audit network requests during load/upload/edit/export: only expected application assets should be fetched; SVG content and configuration must not be transmitted. Inspect application storage for unintended persistence. External navigation is tested separately.
- Run `npm run check`, `npm run format:check`, and `npm run test:e2e` (Chromium and Firefox), after a fresh build. Keep existing geometry/export regression checks.
- No new physical validation follows from this work. Existing fit/finish limits remain explicit in the translated help.

## References

- [MDN: native dialog and accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN: internationalization and locale-sensitive formatting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Internationalization)
