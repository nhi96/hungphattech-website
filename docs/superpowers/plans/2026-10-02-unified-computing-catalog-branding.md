# Unified Computing Catalog And Product Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge Laptop, desktop, and printer products into one tabbed `Laptop và PC` category and replace Thiên Lộc image branding with Hưng Phát branding.

**Architecture:** Normalize computing products under one category with a typed subgroup, extend the existing product explorer with optional computing tabs, and keep old category URLs as redirects. Process existing local product images deterministically into new branded WebP assets so product records never hotlink or overwrite their source files.

**Tech Stack:** Next.js 16.3.8 App Router, React 19, TypeScript, Sharp, Node test runner, Playwright.

---

### Task 1: Lock Unified Computing Data Invariants

**Files:**
- Modify: `tests/product-data.test.ts`
- Modify: `src/types/content.ts`
- Modify: `src/data/products/office.ts`

- [ ] Add a failing test requiring exactly 15 laptops, 4 desktops, and 12 printers under `categorySlug: "laptop-pc"`.
- [ ] Add a failing test requiring `computingDetails.group` to be `laptop`, `desktop`, or `printer`.
- [ ] Require non-computing products to leave `computingDetails` undefined and add `ProductFilters.computingGroup`.
- [ ] Run `node --test tests/product-data.test.ts` and confirm RED.
- [ ] Add `ComputingProductGroup`, `ComputingDetails`, and `Product.computingDetails`.
- [ ] Change office product records to `categorySlug: "laptop-pc"` with the correct group.
- [ ] Remove Thiên Lộc from public summaries, descriptions, and specifications.
- [ ] Re-run the selected test and confirm GREEN.

### Task 2: Add Unified Computing Tabs And Redirects

**Files:**
- Modify: `e2e/site.spec.ts`
- Modify: `src/data/categories.ts`
- Modify: `src/components/products/product-explorer.tsx`
- Modify: `src/app/danh-muc/[slug]/page.tsx`

- [ ] Add failing E2E coverage for one `Laptop và PC` page with tab counts `15`, `4`, and `12`.
- [ ] Add failing E2E coverage for old computing category URL redirects.
- [ ] Remove standalone Laptop, desktop, and printer category entries.
- [ ] Add `showComputingGroups` behavior to `ProductExplorer`.
- [ ] Default to Laptop, preserve the active group on reset, hide tabs on `/san-pham`, and keep related products within the active product group.
- [ ] Aggregate computing products on `/danh-muc/laptop-pc`.
- [ ] Redirect the three old routes before category lookup.
- [ ] Run desktop and mobile selected E2E tests and confirm GREEN.

### Task 3: Generate Hưng Phát-Branded Product Images

**Files:**
- Create: `scripts/rebrand-product-assets.mjs`
- Create: `public/images/products/cameras/*-hung-phat.webp`
- Create: `public/images/products/laptops/*-hung-phat.webp`
- Create: `public/images/products/desktops/*-hung-phat.webp`
- Create: `public/images/products/printers/*-hung-phat.webp`
- Modify: `src/data/products/cameras.ts`
- Modify: `src/data/products/office.ts`
- Modify: `tests/product-data.test.ts`

- [ ] Add failing image assertions for branded WebP paths, `1200x900`, opaque output, white corners, red HP-logo pixels inside `x=40..135`, `y=32..101`, and source-specific pure-white background samples outside recorded product bounds and the HP mask.
- [ ] Implement deterministic foreground extraction that removes small disconnected logos and pale watermark components while retaining the central product.
- [ ] Place the extracted product on white and composite the existing HP logo at a consistent top-left position.
- [ ] Generate all 59 branded product images without overwriting source downloads.
- [ ] Update Camera and computing records to reference branded files.
- [ ] Generate readable contact sheets covering all 59 outputs and visually inspect every tile for legacy logos, pale watermarks, damaged product edges, and logo placement.

### Task 4: Full Verification

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run test:e2e`.
- [ ] Run `npm.cmd run build`.
- [ ] Capture and inspect Camera and Laptop/PC pages at `1440x900` and `390x844`.
- [ ] Confirm `/danh-muc/laptop-pc` and representative product detail routes return HTTP 200.
- [ ] Confirm old computing category routes redirect to `/danh-muc/laptop-pc`.
