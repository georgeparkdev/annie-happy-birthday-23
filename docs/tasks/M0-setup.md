# M0 — Project Setup

Date: 2025-08-14
Owner: George

## Goals

- Prepare the repository for rapid implementation and deployment.
- Lock environment, deployment target, and base scaffolding.

## Tasks

1. Repo hygiene
   - Ensure main branch protected; enable issues if needed
   - Add `.editorconfig` (UTF-8, LF/CRLF tolerant, 2 spaces)
   - Add `.gitattributes` for text normalization
2. Static hosting
   - Configure GitHub Pages to publish from `gh-pages` with an action that builds from `src/` (no bundler)
   - Add `.github/workflows/pages.yml` action (copy `src/**` to `gh-pages`)
3. Web app baseline
   - Verify `src/index.html`, `src/style.css`, `src/main.js` exist
   - Insert meta viewport, charset UTF-8, preload fonts if used
   - Add basic sections skeleton IDs: intro, quiz1, quiz2, quiz3, finale (placeholders)
4. Lint/format (optional)
   - Prettier config for HTML/CSS/JS (2 spaces)
5. Attribution & licensing
   - Footer placeholder for Icons8 BT21 attribution
6. Analytics
   - Establish console-only event logger helper in `main.js`

## Acceptance Criteria

- Pages workflow exists; push to main deploys content of `src/` to GitHub Pages (no custom domain)
- Base sections present with IDs and pass W3C validator for basic structure
- Console logger available and callable without errors
- Footer attribution placeholder visible in `index.html`

## Notes

- Audio/licensing: keep link private; consider instrumental fallback later.
