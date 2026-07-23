# Single Astro App Consolidation Design

**Status:** Approved direction; implementation pending
**Date:** 2026-07-23

## Goal

Serve the PaloNexus marketing homepage at `/` and Starlight documentation at
`/docs/` from one Astro application and one local dev server.

## Design

Use the existing docs/Starlight application as the canonical Astro app. Move
the marketing source tree into `src/` and merge its `landing` content
collection into the docs `content.config.ts`. Keep the marketing homepage at
`src/pages/index.astro`; retain the existing Starlight base `/docs` and sidebar.

The marketing components, layout, styles, and landing Markdown remain
functionally unchanged except for import paths and shared asset references.
The docs pages and Starlight integrations remain the source of truth for
`/docs/*`. Remove the separate root Astro config and root dev/build scripts
only after the unified app builds both route families.

## Route and content boundaries

- `/` and `/request-changes/*` are marketing routes.
- `/docs/*` is the Starlight documentation surface.
- `landing` is the marketing collection; `docs` remains the documentation
  collection.
- One `src/content.config.ts` owns both collections.
- One Astro cache and one content store are used by both surfaces.

## Migration constraints

- Preserve all existing marketing URLs, docs URLs, redirects, navigation, and
  Cloudflare build/deploy entry points.
- Do not merge the marketing HTML layout into Starlight’s layout. The homepage
  keeps its marketing layout; Starlight keeps its own shell.
- Keep `public/` assets available to both surfaces.
- Remove duplicate root-only config only after `npm run build` emits both
  `/index.html` and `/docs/**` successfully.

## Verification

Run the unified dev server and verify HTTP 200 for `/`, `/request-changes/`,
`/docs/`, `/docs/getting-started/overview/`, and a representative deep docs
page. Run the unified static build, inspect generated route files, and run the
existing docs and root Playwright suites against the single server.
