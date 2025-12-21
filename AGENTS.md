# AGENTS.md

Guidance for AI/code assistants working on `recipe-ingredient-parser-v3`, the natural-language ingredient parser submodule consumed by Vanilla Cookbook.

## Project Map
- `src/` parsing implementation (language data under `i18n/`, parsing entrypoints in `index.js`, quantity helpers in `repeatingFractions.js`, conversion helpers in `convert.js`).
- `test/` TypeScript tests compiled to `testDist/` for Mocha; `lib/` is the compiled output (ignored in git).
- Root configs: `tsconfig.json`, `package.json`, `package-lock.json`, ESLint/Prettier settings inside `package.json`.

## Setup
- Use Node/npm (lockfile is `package-lock.json`). Install deps with `npm install`.
- TypeScript build targets JS output in `lib/`; source is currently JavaScript compiled via `allowJs` settings.

## Run / Build
- Build library: `npm run build` (cleans `lib/`, runs `tsc`).
- Build tests: `npm run build:test` (outputs to `testDist/`).
- Watch build: `npm run watch` (nodemon on `src/`).

## Quality Gates
- Tests: `npm test` (builds tests then runs Mocha on `testDist`), `npm run test:watch` for iterative runs.
- Lint/format: `npm run lint`; `npm run fmt` formats then fixes lint issues.
- CI style: `npm run test:ci` (lint + test) before publishing.

## Notes and Gotchas
- Edit source in `src/`; never hand-edit generated `lib/` or `testDist/`.
- Publishing relies on `prepublish` hook (`npm run build`) to refresh `lib/`.
- Library entrypoints are CommonJS-friendly; ensure API changes stay backward compatible (`parse`, `combine` etc.).
