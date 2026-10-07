# Camera Catalog And Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace camera demo records with 28 sourced camera variants and add an editable Camera page after Solar in the content administrator.

**Architecture:** Store camera products in a dedicated typed data module with normalized local imagery. Extend the content schema with a backward-compatible simple category page, reuse one category presentation for public and draft preview, and isolate Camera editor fields in a dedicated inspector.

**Tech Stack:** Next.js 16.3.8, React 19, TypeScript, Zod 4, Sharp, Node test runner, Playwright.

---

### Task 1: Lock Camera Product Invariants

**Files:**
- Modify: `tests/product-data.test.ts`
- Modify: `src/types/content.ts`

- [ ] Add failing tests for exactly 28 approved model variants, unique manufacturer/model pairs, removal of three camera demos, required `cameraDetails`, contact pricing, one local image, and normalized asset/manifest requirements.
- [ ] Run `npm.cmd test` and confirm RED.
- [ ] Add `CameraDetails` and optional `Product.cameraDetails`.

### Task 2: Acquire And Normalize Camera Assets

**Files:**
- Create: `scripts/import-camera-assets.mjs`
- Create: `public/images/products/cameras/*.webp`
- Create: `docs/sources/camera-products.md`

- [ ] Define the 28 approved source-page mappings in the import script.
- [ ] Fetch each exact product page, resolve its primary image, and normalize with Sharp to an opaque white `1200x900` WebP.
- [ ] Generate or update the manifest with retrieval date `2026-10-02`, discovery page, exact product page, image source, and local path.
- [ ] Run the asset portion of `npm.cmd test`.

### Task 3: Add Camera Product Data

**Files:**
- Create: `src/data/products/cameras.ts`
- Modify: `src/data/products.demo.ts`

- [ ] Add 28 original camera records using the approved models and typed camera details.
- [ ] Remove the three camera demo records.
- [ ] Run `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run lint`.

### Task 4: Add Camera Content Schema And Migration

**Files:**
- Modify: `tests/content-schema.test.ts`
- Modify: `src/lib/content/content-schema.ts`
- Modify: `.content/default-content.json`

- [ ] Add failing tests for legacy migration, unknown camera assets, and preserved existing page edits.
- [ ] Add `CameraPageContent`, default migration from `category-camera`, and asset-reference validation.
- [ ] Add matching seed content.
- [ ] Run `node --test tests/content-schema.test.ts`.

### Task 5: Add Shared Camera Public And Preview Page

**Files:**
- Create: `src/components/products/category-page-content.tsx`
- Modify: `src/app/danh-muc/[slug]/page.tsx`
- Modify: `src/app/quan-tri/xem-truoc/[page]/page.tsx`
- Modify: `e2e/site.spec.ts`

- [ ] Add failing E2E tests for editable Camera hero/introduction, 28 product cards, contact pricing, and responsive behavior.
- [ ] Create the reusable simple category presentation and wire published Camera content.
- [ ] Accept `camera` in the preview route and render draft Camera content.
- [ ] Run selected E2E tests and static checks.

### Task 6: Add Camera Administrator Tab

**Files:**
- Create: `src/components/admin/camera-content-inspector.tsx`
- Modify: `src/components/admin/content-editor.tsx`
- Modify: `src/app/api/admin/content/route.ts`
- Modify: `e2e/admin.spec.ts`

- [ ] Add failing tests for page order and Camera hero, notice, and introduction controls.
- [ ] Add `Camera giám sát` after Solar in navigation and the API page list.
- [ ] Add camera preview routing and the dedicated inspector.
- [ ] Verify draft preview, image isolation, reset, publish, desktop, and mobile behavior.

### Task 7: Full Verification

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run test:e2e`.
- [ ] Run `npm.cmd run build`.
- [ ] Capture and inspect Camera public/admin screenshots at `1440x900` and `390x844`.
- [ ] Confirm `http://127.0.0.1:3000/danh-muc/camera-giam-sat` and `/quan-tri` return HTTP 200.
- [ ] Report the continuing Git/Windows Security limitation if `git.exe` remains blocked.
