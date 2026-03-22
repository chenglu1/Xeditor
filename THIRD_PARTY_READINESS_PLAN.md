# Third-Party Readiness Plan

## Goal

Make `@chenglu1/xeditor-editor` stable enough to be consumed by third-party React applications as a reusable editor package, not only as an internal demo-driven component.

## Current Assessment

The editor already has a usable generalized API:

- `valueType`, `defaultValue`, `onUpdate`, `onError`
- `viewerMode`
- `presets`, `extensions`, `disableBuiltIns`
- `toolbarSchema`, `renderToolbarItem`, `supportedToolbarButtons`
- `mediaUpload`, `markdownDialect`

The remaining work is mostly productization and contract hardening:

- package publish contract is incomplete
- package-level README and installation guidance are missing
- style loading and style isolation need clearer boundaries
- HTML/static viewer safety boundary needs to be explicit
- browser/SSR compatibility needs clearer guarantees
- a11y/i18n and consumer-facing extension contracts need another pass

## Principles

- Keep existing runtime behavior stable unless the change is explicitly opt-in.
- Prefer additive compatibility changes before removals.
- Make host application boundaries explicit: styles, uploads, sanitization, logging.
- Ship in small phases that can be verified independently.

## Phase P0: Packaging And Consumer Contract

### Objective

Make the package installable and understandable for third-party consumers with minimal ambiguity.

### Tasks

- Add a dedicated package README under `packages/editor/README.md`
- Add package metadata for public consumption:
  - `description`
  - `homepage`
  - `bugs`
  - `keywords`
  - `engines`
- Add explicit `exports` in `packages/editor/package.json`
- Add `sideEffects` metadata for style assets
- Expose an explicit stylesheet subpath such as `@chenglu1/xeditor-editor/styles.css`
- Keep legacy import behavior working
- Document primary API and legacy compatibility in one place

### Exit Criteria

- A consumer can install the package and find working usage examples from npm/GitHub
- Package entry resolution is explicit under modern bundlers
- CSS loading behavior is documented and predictable

## Phase P1: Safety And Host Boundaries

### Objective

Reduce hidden coupling between the editor package and the consuming application.

### Tasks

- Add an explicit sanitization strategy for HTML/static viewer paths
- Document trust assumptions for `valueType="html"`
- Replace direct `console.warn/error` calls with `onError` or an injected logger
- Audit upload APIs so all business-specific behavior stays consumer-owned
- Add clearer host integration guidance for uploads, links, and external asset policies

### Exit Criteria

- Rendering untrusted content has a defined integration story
- Package no longer writes unexpected diagnostics directly into consumer consoles
- Upload behavior is documented as a host concern, not a built-in backend assumption

## Phase P2: Styling, Theming, And Extensibility

### Objective

Let third-party apps embed the editor without fighting layout, visual tokens, or extension order.

### Tasks

- Split style layers:
  - core editor shell
  - content/viewer styles
  - optional rich UI extras
- Reduce hard-coded colors, borders, and z-index values
- Expand theme token coverage and document overrides
- Improve extension composition with clearer insertion/replacement semantics
- Define stable public exports for advanced consumers who need custom extension assembly

### Exit Criteria

- Consumers can restyle the editor without patching internals
- Extension customization is possible without relying on fragile registration order knowledge

## Phase P3: Compatibility, A11y, And Hardening

### Objective

Improve confidence across host frameworks, browsers, and content scenarios.

### Tasks

- Add SSR smoke coverage for viewer-only and editor-shell paths
- Add broader integration tests for:
  - paste
  - drag/drop upload
  - IME/input composition
  - long documents
  - mobile interactions
- Audit button labels, `aria-*`, tooltips, and keyboard affordances
- Complete localization coverage for consumer-visible strings
- Document performance tradeoffs for `viewerMode`, heavy presets, and large CSS payloads

### Exit Criteria

- Common consumer integration paths are validated
- Accessibility and localization are no longer partial
- Known performance tradeoffs are documented rather than implicit

## Open Decisions

- Confirm the package license before publishing broader third-party guidance
- Decide whether styles should remain auto-imported by the main entry or become opt-in in a future major version
- Decide whether legacy `contentType/onChange` stays through `1.x` or is deprecated on a shorter schedule

## Recommended Execution Order

1. Finish P0 first
2. Tackle P1 before opening broader external adoption
3. Use P2 to make the package easier to embed in design systems
4. Use P3 to raise confidence for wider rollout

## Progress Log

- 2026-03-22: Plan created
- 2026-03-22: P0 started with package metadata and package-level documentation
- 2026-03-22: Added package `exports`, `sideEffects`, consumer-facing metadata, and explicit stylesheet subpath in `packages/editor/package.json`
- 2026-03-22: Added `packages/editor/README.md` for npm/GitHub consumers
- 2026-03-22: Verified `corepack pnpm build` passes after packaging/documentation changes
- 2026-03-22: Upgraded `scripts/test-bundle.mjs` to resolve the package from the real `apps/web` consumer workspace and validate ESM, CJS, and `styles.css` entrypoints
- 2026-03-22: Fixed CJS package consumption by switching `styled-components` usage in `CustomImage.tsx` to the named `styled` export
- 2026-03-22: Verified `node scripts/test-bundle.mjs` passes
- 2026-03-22: Phase P0 complete
- 2026-03-22: Phase P1 started with explicit host-owned `logger` and `sanitizeHtml` contracts
- 2026-03-22: Replaced runtime `console.warn/error` paths with injected logger or structured `onError` reporting across editor core, markdown adapter, media extensions, math rendering, and image preview flows
- 2026-03-22: Added `sanitizeHtml` support and trusted HTML warning behavior for `viewerMode="static"` rendering
- 2026-03-22: Documented third-party guidance for HTML trust, upload ownership, and host-side diagnostics in `packages/editor/README.md`
- 2026-03-22: Added coverage for logger-backed warnings/errors and static viewer sanitization in package tests
- 2026-03-22: Verified `pnpm --filter @chenglu1/xeditor-editor test` passes after P1 changes
- 2026-03-22: Verified `corepack pnpm build` passes after P1 changes
- 2026-03-22: Verified `node scripts/test-bundle.mjs` still passes after P1 changes
- 2026-03-22: Phase P1 complete
- 2026-03-22: Phase P2 started with explicit style layering, semantic theme tokens, and stable advanced consumer exports
- 2026-03-22: Split package stylesheet output into `styles.css`, `styles/core.css`, `styles/content.css`, and `styles/ui.css`
- 2026-03-22: Added semantic `--xeditor-*` theme tokens and reduced shell/content hard-coded colors, borders, shadows, and z-index values across editor shell, viewer content, mode switch controls, floating toolbars, upload surfaces, and image preview overlays
- 2026-03-22: Added `extensionComposition` with `append`/`prepend`/`before`/`after`/`replace` semantics so consumers can insert or replace extension groups without relying on private ordering details
- 2026-03-22: Added stable `@chenglu1/xeditor-editor/advanced` exports for `createEditorExtensions`, built-in registry keys, and advanced extension building blocks
- 2026-03-22: Documented layered styles, theme overrides, and advanced extension assembly in `packages/editor/README.md`
- 2026-03-22: Added package coverage for extension composition semantics and updated consumer bundle smoke tests for the advanced entrypoint and layered stylesheet exports
- 2026-03-22: Verified `pnpm --filter @chenglu1/xeditor-editor test` passes after P2 changes
- 2026-03-22: Verified `corepack pnpm build` passes after P2 changes
- 2026-03-22: Verified `node scripts/test-bundle.mjs` passes after P2 changes
- 2026-03-22: Phase P2 complete
