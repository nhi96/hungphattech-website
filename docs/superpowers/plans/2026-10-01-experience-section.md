# Experience Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the featured-products homepage block with a two-image Hung Phat experience section editable from `/quan-tri`.

**Architecture:** Extend the typed content schema with a migrated fixed image tuple, reuse the existing asset upload pipeline, and render the section through the shared homepage renderer. Existing runtime content is migrated without losing the owner's published copy.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Sharp, Playwright.

---

### Task 1: Content Migration

**Files:**
- Modify: `src/lib/content/content-schema.ts`
- Modify: `.content/default-content.json`
- Test: `tests/content-schema.test.ts`

- [ ] Add a failing schema test proving legacy `featured.buttonLabel` content parses into fixed `store` and `team` image entries.
- [ ] Add a failing schema test proving unknown experience asset references are rejected.
- [ ] Run `node --test tests/content-schema.test.ts` and confirm the new tests fail.
- [ ] Add a Zod preprocess migration and validate both new image references.
- [ ] Update the seed document with the new `images` tuple.
- [ ] Run the schema tests and confirm they pass.

### Task 2: Public Experience Layout

**Files:**
- Modify: `src/components/home/home-page-content.tsx`
- Test: `e2e/site.spec.ts`

- [ ] Add a failing E2E test asserting the two experience image captions render and the four featured product cards/button do not render inside section 03.
- [ ] Replace the product-card grid with a responsive two-image layout using validated assets and focal positions.
- [ ] Run the targeted E2E test and confirm it passes on desktop and mobile.

### Task 3: Editor Image Controls

**Files:**
- Modify: `src/components/admin/content-editor.tsx`
- Test: `e2e/admin.spec.ts`

- [ ] Add a failing E2E test asserting `Cửa hàng Hưng Phát` and `Đội ngũ công ty` each expose an upload input and focal-position controls.
- [ ] Rename the navigator label and add two image editor panels to the featured inspector.
- [ ] Reuse `uploadImage` to add uploaded assets and update only the selected image reference.
- [ ] Run the targeted admin E2E test and confirm it passes.

### Task 4: Runtime Migration And Verification

**Files:**
- Modify: `.content/published.json` at runtime through repository-safe publish
- Modify: `.content/draft.json` at runtime through repository-safe save

- [ ] Load the legacy runtime documents through the migrated schema and save the transformed draft without changing existing text.
- [ ] Publish the transformed document so the public site receives the new section.
- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd run test:e2e`.
- [ ] Capture desktop/mobile screenshots and verify the experience section has no product cards or product button.

