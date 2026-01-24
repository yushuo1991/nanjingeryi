# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React UI (`App.jsx`, `RehabCareLink.jsx`, `main.jsx`) and Tailwind-based styles in `index.css`.
- `server/` hosts the Express API and supporting modules (DB, file handling, AI/Qwen integration).
- `tests/` includes the Playwright E2E runner (`tests/e2e-test.js`) and any generated screenshots under `tests/screenshots/`.
- `public/` holds static assets served by Vite; `dist/` is build output (do not edit by hand).
- `docs/`, `scripts/`, and `nginx/` provide documentation, helper scripts, and deployment configs; `uploads/` is runtime file storage.

## Build, Test, and Development Commands
- `npm run dev`: start the Vite dev server for the frontend.
- `npm run server`: start the Node/Express API (`server/index.js`). Run alongside `npm run dev` in a second terminal.
- `npm run build`: production build into `dist/`.
- `npm run preview`: serve the production build locally for validation.
- `npm run test:e2e`: run the Playwright E2E script with a visible browser.
- `npm run test:e2e:headless`: run the same E2E script in headless mode (CI-friendly).

## Coding Style & Naming Conventions
- Use 2-space indentation for JS/JSON to match existing files.
- This repo uses ES modules (`"type": "module"`), so prefer `import`/`export` over `require`.
- React components are PascalCase (e.g., `RehabCareLink.jsx`); functions/variables are camelCase.
- No lint/format config is present; keep changes consistent with nearby files.

## Testing Guidelines
- Primary automated coverage is the Playwright E2E script in `tests/e2e-test.js`.
- E2E screenshots are stored in `tests/screenshots/` and should be ignored in PR diffs unless explicitly required.
- Manual validation can use `test-suite.html` in the project root.

## Commit & Pull Request Guidelines
- Recent commits use short, imperative Chinese messages (e.g., ¡°Ìí¼Ó¡­¡±, ¡°ÐÞ¸´¡­¡±). Keep messages concise and action-focused.
- PRs should describe the change, list test commands run, and include screenshots for UI-facing updates.

## Configuration & Secrets
- Backend configuration lives in `server/.env` (see `server/.env.example`). Do not commit secrets; document new env vars when added.
