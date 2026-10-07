# Local Visual Content Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a loopback-only `/quan-tri` editor that safely edits shared site settings and all homepage copy/images through validated local JSON drafts and publishing.

**Architecture:** A server-only content repository reads writable data from `.content`, validates it with Zod, and exposes revision-checked draft/publish APIs. Public and preview pages share typed render components. A client editor changes safe fields and uploads re-encoded images through a separate asset repository.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, Sharp, Tailwind CSS 4, Node filesystem APIs, Playwright.

---

### Task 1: Dependencies, Next.js Docs, And Baseline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Read the local Next.js guides for Route Handlers, `connection`, `revalidatePath`, and `revalidateTag`.
- [ ] Install `zod` and `sharp` with `npm.cmd install zod sharp`.
- [ ] Run `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run lint`; all must pass before production edits.
- [ ] If Git remains blocked by Windows Security, continue in the current workspace without changing security settings.

### Task 2: Typed Seed Content And Validation

**Files:**
- Create: `.content/default-content.json`
- Modify: `.gitignore`
- Create: `src/content/site-content.ts`
- Create: `src/lib/content/content-schema.ts`
- Test: `tests/content-schema.test.ts`

- [ ] Write failing tests proving valid seed parsing, invalid style rejection, duplicate ID rejection, immutable navigation destinations, phone normalization, missing asset rejection, and unsupported schema rejection.
- [ ] Run `node --test tests/content-schema.test.ts`; verify failures are caused by missing implementation.
- [ ] Define Zod schemas for published/draft envelopes, site settings, assets, homepage sections, text styles, image focal positions, metrics, audience cards, process steps, and fixed navigation.
- [ ] Export `parsePublishedEnvelope`, `parseDraftEnvelope`, and `createDraftFromPublished`.
- [ ] Populate the seed with every current homepage string and image plus shared branding/contact values.
- [ ] Ignore `.content/published.json`, `.content/draft.json`, `.content/history/`, `.content/transaction.json`, and `public/uploads/*`, while retaining `.content/default-content.json` and `public/uploads/.gitkeep`.
- [ ] Run the schema test and confirm it passes.

### Task 3: Revision-Safe Local Repository

**Files:**
- Create: `src/lib/content/content-repository.ts`
- Create: `src/lib/content/content-paths.ts`
- Test: `tests/content-repository.test.ts`

- [ ] Write failing temporary-directory tests for seed creation, draft save revision increments, stale-write conflicts, reset conflicts, publish refresh, history pruning, and transaction-journal recovery.
- [ ] Implement `FileContentRepository` with `getPublishedContent`, `getDraftContent`, `saveDraft`, `publishDraft`, and `resetDraftFromPublished`.
- [ ] Serialize writes through a process-local promise lock.
- [ ] Write temporary files in the same directory, then rename atomically.
- [ ] During publish, write the intended final revisions to `.content/transaction.json`; recover or restore backup before subsequent reads.
- [ ] Cap history at 20 JSON files.
- [ ] Run repository and schema tests and confirm they pass.

### Task 4: Loopback Guard And Content APIs

**Files:**
- Create: `src/lib/content/editor-access.ts`
- Create: `src/app/api/admin/content/route.ts`
- Create: `src/app/api/admin/content/draft/route.ts`
- Create: `src/app/api/admin/content/publish/route.ts`
- Create: `src/app/api/admin/content/reset/route.ts`
- Test: `tests/editor-access.test.ts`

- [ ] Write failing tests for allowed `localhost`/`127.0.0.1`, rejected LAN hosts, missing write Origin, mismatched Origin, disabled production mode, and unsupported content type.
- [ ] Implement `assertEditorReadAccess` and `assertEditorWriteAccess`.
- [ ] Make APIs return structured `{ ok, code, message, data }` responses.
- [ ] Require explicit `expectedDraftRevision` and `expectedPublishedRevision` on draft-changing endpoints.
- [ ] Return HTTP 409 for conflicts, 422 for validation, 403 for access rejection, and 500 for persistence failures.
- [ ] Run access tests and type checking.

### Task 5: Safe Image Repository And Upload API

**Files:**
- Create: `public/uploads/.gitkeep`
- Create: `src/lib/content/asset-repository.ts`
- Create: `src/app/api/admin/assets/route.ts`
- Test: `tests/asset-repository.test.ts`

- [ ] Write failing tests for valid JPEG/PNG input, SVG rejection, spoofed extension rejection, malformed bytes, size/dimension limits, generated filenames, and path containment.
- [ ] Implement Sharp metadata decoding and re-encoding to WebP.
- [ ] Reject animated images, files over 8 MB, dimensions over 10,000 pixels, or total pixels over 40 million.
- [ ] Generate IDs and filenames with `crypto.randomUUID`.
- [ ] Return the asset record without deleting replaced files.
- [ ] Run asset tests and type checking.

### Task 6: Content-Driven Shared Layout And Homepage

**Files:**
- Create: `src/lib/content/content-loader.ts`
- Create: `src/components/home/home-page-content.tsx`
- Modify: `src/components/home/home-hero.tsx`
- Modify: `src/components/layout/site-header.tsx`
- Modify: `src/components/layout/site-footer.tsx`
- Modify: `src/components/layout/mobile-call-bar.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/config/company.ts`
- Test: `e2e/site.spec.ts`

- [ ] Add failing E2E expectations that published seed content renders and existing routes remain unchanged.
- [ ] Implement `getPublishedSiteContent` and `getDraftSiteContent` as server-only functions; use `connection()` when editor mode is enabled.
- [ ] Pass shared site settings into header, footer, call bar, metadata, and homepage instead of importing editable values from constants.
- [ ] Move all homepage strings, metrics, audience cards, process steps, section headings, buttons, and editable images into the typed content payload.
- [ ] Render sections according to the validated `sectionOrder`.
- [ ] Map style tokens to fixed Tailwind class maps; never construct arbitrary classes from content.
- [ ] Keep category/product/article datasets and route slugs unchanged in Version 1.
- [ ] Run public E2E, typecheck, lint, and build.

### Task 7: Draft Preview Route

**Files:**
- Create: `src/app/quan-tri/xem-truoc/[page]/page.tsx`
- Create: `src/components/admin/preview-bridge.tsx`
- Modify: `src/components/home/home-page-content.tsx`

- [ ] Add a failing Playwright test proving `/quan-tri/xem-truoc/home` renders draft content and rejects unsupported page IDs.
- [ ] Build the loopback-guarded preview route using the same homepage renderer with draft content.
- [ ] Add a client navigation bridge that prevents normal navigation and sends validated internal-route messages to the parent.
- [ ] Require exact `event.origin`, exact `event.source`, and discriminated message types.
- [ ] Run the targeted Playwright test.

### Task 8: Visual Administration Interface

**Files:**
- Create: `src/app/quan-tri/page.tsx`
- Create: `src/app/quan-tri/not-found.tsx`
- Create: `src/components/admin/content-editor.tsx`
- Create: `src/components/admin/editor-toolbar.tsx`
- Create: `src/components/admin/editor-navigator.tsx`
- Create: `src/components/admin/editor-inspector.tsx`
- Create: `src/components/admin/image-field.tsx`
- Create: `src/components/admin/types.ts`
- Modify: `src/app/globals.css`
- Test: `e2e/admin.spec.ts`

- [ ] Write failing Playwright tests for loopback access, editing hero text, safe size/alignment controls, image replacement, Move Up/Down, desktop/mobile preview, autosaved draft state, publish state, reset, revision conflict, and unsaved-change warning.
- [ ] Build a three-region desktop layout and tabbed mobile layout.
- [ ] Load `GET /api/admin/content`, keep local editor state, and debounce draft saves by 600 ms.
- [ ] Reload the sandboxed preview iframe after a successful draft revision.
- [ ] Implement session undo/redo with a capped 50-state history.
- [ ] Implement image upload progress and update the asset map only after a successful response.
- [ ] Disable publish during invalid, saving, uploading, or conflict states.
- [ ] Use `sandbox="allow-scripts allow-same-origin"` and validate preview messages.
- [ ] Run targeted admin E2E until all tests pass.

### Task 9: Publish Invalidation And Final Verification

**Files:**
- Modify: `src/app/api/admin/content/publish/route.ts`
- Modify: `package.json`
- Verify: all files above

- [ ] After publish, call `revalidateTag` for published content and `revalidatePath` for `/` and `/layout`.
- [ ] Add `dev:editor` script binding Next.js to `127.0.0.1`.
- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd run test:e2e`.
- [ ] Capture and inspect `/quan-tri` and `/` at 1440×900 and 390×844.
- [ ] Keep the development server running and report the local URL.

