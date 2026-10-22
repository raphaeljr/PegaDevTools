# AGENTS.md — PegaDevTools

Browser extension (Chromium, Manifest V3) that improves the Pega Platform developer experience.
Fork of marcin-l/PegaDevTools; changes should stay easy to upstream.

## Ground rules
- Preserve existing behavior. Fix or refactor one thing per change; keep diffs small.
- No build step, bundler, or runtime dependency without a written justification.
  Dev-only tooling (eslint, jsdom, node:test) is acceptable and must live in devDependencies.
- Do not reformat files you are not otherwise changing (mixed tabs/spaces would hide the real diff).
- Never edit `resources/` vendored libraries by hand. Record version + source in `resources/README.md` when updating.
- Do not bump `manifest.json` version unless asked.

## Architecture
- `manifest.json`: content scripts are selected by URL globs (`*://*/prweb/*...`). A frame can match several blocks,
  so top-level names in content scripts share one scope: avoid new globals; wrap new code in an IIFE or module object.
- `background.js` (service worker): message router + MAIN-world injection. It can be terminated at any time:
  never keep state in module variables; use `chrome.storage.session`.
- `resources/shared.js`: `PDT` class (settings, siteConfig, favicon). Settings load is async: wait for it, never read `PDT.settings` at load time.
- Code needing Pega globals (`pega.*`, `CodeMirror`) must run in the MAIN world (`js/`, `*/inject_*.js`).
  MAIN-world code has no `chrome`/`browser` API and runs with the user's Pega session: treat as high privilege.
- Settings: `storage.sync` (`settings`, `siteConfig`), `storage.local` (tracer option sets). Keep keys backward compatible;
  adding a setting requires updating `settings.html`, `saveSettings` and `restoreOptions` together.

## Pega compatibility
- Never assume identical HTML across Pega versions (7.x, 8.x, '23, '24, '25; Dev Studio vs App/Admin Studio; Constellation is different).
- Every DOM lookup must tolerate `null`: use `?.`/guards, and make each customization fail independently
  (one missing element must not stop the others).
- Prefer stable attributes (`data-*`, `node_name`, `name`) over positional or style-based selectors.
- Document each selector's target and the Pega versions it was verified on in `docs/selectors.md`.
- Do not hardcode `/prweb`-only assumptions in new code.

## Security
- Treat all text read from the Pega DOM (property values, rule names, SQL, page names) as untrusted.
- No `innerHTML`/`insertAdjacentHTML`/inline `onclick="..."` with interpolated data. Use `createElement`, `textContent`,
  `addEventListener`, `dataset`. Static HTML templates only.
- Match sites by `location.hostname`, not `href.includes`.
- Keep permissions and `web_accessible_resources` minimal; justify any addition in the PR.
- No `eval`, `new Function`, remote code, or external network calls.

## Style
- Plain modern JS (ES2022), no TypeScript. Match the surrounding file's indentation and comment density.
- Prefer vanilla DOM APIs in new code; do not add new jQuery usage.
- Use `navigator.clipboard` (with the existing fallback) instead of `document.execCommand`.
- Log through `PDT.debug()`/`PDT.log()` with a `PDT:` prefix; no stray `console.log` in new code.
- Comments: `//FEATURE:` for user-facing behavior, `//TODO:` with context.

## Testing & verification
- `npm run lint` and `npm test` (node --test) must pass. Pure logic goes in testable functions
  (export via `if (typeof module !== 'undefined') module.exports = {...}`).
- DOM logic: add/refresh sanitized fixtures under `test/fixtures/<pega-version>/` — never commit real customer data or hostnames.
- For manifest/permission changes, load the unpacked extension in Chrome and check each affected feature manually; state what you verified in the PR.

## Workflow
- Branch per change; small commits; imperative commit messages.
- Keep upstream-able changes separate from fork-only tooling (lint/CI/docs).
- Update README "Recent changes" and CHANGELOG for user-visible changes.
