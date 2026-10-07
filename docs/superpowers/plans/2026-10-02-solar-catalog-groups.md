# Solar Catalog Groups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three obsolete solar demos with a verified 19-product solar catalog organized into five panels, eight inverters, and six storage batteries.

**Architecture:** Split the product data into focused modules while preserving the existing combined `products` export. Add typed solar details to support reliable power and energy validation, then extend `ProductExplorer` with optional solar-group tabs used only on the fixed solar category route. Store official manufacturer imagery locally and validate both product invariants and rendered behavior.

**Tech Stack:** Next.js 16.3.8 App Router, React 19, TypeScript, Tailwind CSS 4, Sharp, Node test runner, Playwright.

---

## File Map

- Create `src/data/products/solar-panels.ts`: five existing panel records with typed solar details.
- Create `src/data/products/solar-inverters.ts`: eight verified inverter records.
- Create `src/data/products/solar-batteries.ts`: six verified battery records.
- Create `src/data/products/demo-products.ts`: remaining non-solar demo records.
- Create `src/data/products/index.ts`: combined catalog and lookup helpers.
- Modify `src/data/products.demo.ts`: compatibility re-export during migration.
- Modify `src/types/content.ts`: typed solar details and solar-group filter.
- Modify `src/lib/product-filter.ts`: filter by active solar group.
- Modify `src/components/products/product-explorer.tsx`: optional segmented solar tabs and fixed-category mode.
- Modify `src/components/products/product-card.tsx`: deterministic solar group label.
- Modify `src/app/danh-muc/[slug]/page.tsx`: pass only category products and enable tabs for solar.
- Modify `src/app/san-pham/[slug]/page.tsx`: group label and same-group related products.
- Create `docs/sources/solar-energy-products.md`: official source and image provenance.
- Create `public/images/products/solar-inverters/*.webp`: eight official inverter assets.
- Create `public/images/products/solar-batteries/*.webp`: six official battery assets.
- Modify `tests/product-data.test.ts`: 19-product, typed-data, brand, image, and asset invariants.
- Modify `tests/product-filter.test.ts`: solar-group filtering behavior.
- Modify `e2e/site.spec.ts`: tabs, filters, detail routes, images, and responsive coverage.

### Task 1: Lock Typed Solar Catalog Requirements

**Files:**
- Modify: `tests/product-data.test.ts`
- Modify: `tests/product-filter.test.ts`

- [ ] **Step 1: Add failing catalog-count and model tests**

Define the approved inverter and battery model arrays and assert:

```ts
assert.equal(solar.length, 19);
assert.equal(solar.filter((product) => product.solarDetails?.group === "panel").length, 5);
assert.equal(solar.filter((product) => product.solarDetails?.group === "inverter").length, 8);
assert.equal(solar.filter((product) => product.solarDetails?.group === "battery").length, 6);
assert.deepEqual(
  solar.filter((product) => product.solarDetails?.group === "inverter").map((item) => item.model).sort(),
  approvedInverterModels.toSorted(),
);
```

Also assert exactly two products for each approved brand and that obsolete solar demo slugs are absent.

- [ ] **Step 2: Add failing typed-detail and asset tests**

For each inverter require `ratedOutputKw` between `6` and `20`, a phase, and `inverterType`. For each battery require positive `energyKwh` and an energy basis. Require `price === null`, `isDemo === false`, `imageFit === "contain"`, exactly one local image, and unique slugs.

Use Sharp to assert every new asset:

```ts
assert.equal(metadata.format, "webp");
assert.equal(metadata.width, 1200);
assert.equal(metadata.height, 900);
assert.equal(metadata.hasAlpha, false);
```

Decode the four corner pixels and assert each RGB channel is at least `250`.

- [ ] **Step 3: Add failing solar-group filter test**

Call `filterProducts` with `solarGroup: "inverter"` and assert eight results, then combine `solarGroup: "battery"` with brand `Deye` and assert two results.

- [ ] **Step 4: Run unit tests and verify RED**

Run: `npm.cmd test`

Expected: FAIL because `solarDetails`, group filters, 14 records, and assets do not exist.

### Task 2: Add Typed Solar Details And Split Product Data

**Files:**
- Modify: `src/types/content.ts`
- Create: `src/data/products/solar-panels.ts`
- Create: `src/data/products/solar-inverters.ts`
- Create: `src/data/products/solar-batteries.ts`
- Create: `src/data/products/demo-products.ts`
- Create: `src/data/products/index.ts`
- Modify: `src/data/products.demo.ts`

- [ ] **Step 1: Add typed solar detail definitions**

Add `SolarProductGroup`, the discriminated `SolarProductDetails` union from the approved spec, `model: string` to `Product`, optional `solarDetails`, and `solarGroup` to `ProductFilters`.

- [ ] **Step 2: Move the five approved panels**

Move the existing records unchanged except:

```ts
model: "LR5-72HBD-545M",
solarDetails: { group: "panel", ratedPowerKw: 0.545 },
```

Apply equivalent exact model and numeric rated power values to the other four panels.

- [ ] **Step 3: Add eight inverter records**

Add:

```text
GW6000-ES-20                  GoodWe   6 kW   single-phase hybrid
GW20K-ET-L-G10                GoodWe  20 kW   three-phase hybrid
TriP2-LB-3P 6K               LuxPower 6 kW   three-phase hybrid
TriP2-LB-3P 20K              LuxPower 20 kW  three-phase hybrid
SUN-6K-SG06LP1-EU-BM2        Deye      6 kW   single-phase hybrid
SUN-20K-SG01HP3-EU-AM2       Deye     20 kW   three-phase hybrid
SH6.0RS                      Sungrow   6 kW   single-phase hybrid
SH20T                        Sungrow  20 kW   three-phase hybrid
```

Every record uses original Vietnamese copy, verified technical specifications, `price: null`, `isDemo: false`, and `imageFit: "contain"`.

- [ ] **Step 4: Add six battery records**

Add:

```text
LV-BAT-W5.12Da    Lithium Valley   5.12 kWh nominal
W15-5A            Lithium Valley  14.336 kWh nominal
SE-G5.1 Pro-B     Deye             5.12 kWh nominal
RW-F16            Deye            16 kWh nominal
ARKVOLT F8S       HiTHIUM          8 kWh nominal
HeroEE 16         HiTHIUM         16 kWh nominal
```

Visible names and copy use `kWh`; power is not substituted for energy.

- [ ] **Step 5: Preserve non-solar products and exports**

Move camera, computer, and lock demo records to `demo-products.ts`. Combine all modules in `index.ts`, implement lookup helpers, and make `products.demo.ts` re-export from `products/index.ts` so existing imports remain valid.

- [ ] **Step 6: Run type checking**

Run: `npm.cmd run typecheck`

Expected: FAIL only where filters have not yet supplied `solarGroup`; update defaults and callers with `"all"` before proceeding.

### Task 3: Acquire And Normalize Official Assets

**Files:**
- Create: `docs/sources/solar-energy-products.md`
- Create: `public/images/products/solar-inverters/*.webp`
- Create: `public/images/products/solar-batteries/*.webp`

- [ ] **Step 1: Download official pages and datasheets**

Use only official manufacturer URLs recorded during research:

```text
GoodWe: en.goodwe.com ES G2 and ET LV datasheets/pages
LuxPower: luxpowertek.com TriP2-LB-3P 5-20K datasheet
Deye: deyeinverter.com SUN series pages/datasheets
Sungrow: en.sungrowpower.com SH6.0RS page and info-support.sungrowpower.com SH20T manual
Lithium Valley: lithiumvalley.com product pages/datasheets
Deye ESS: deyeess.com product pages/brochures
HiTHIUM: en.hithium.com residential product pages/datasheets
```

- [ ] **Step 2: Extract official product visuals**

Prefer official product image files. When only a PDF visual is available, render the relevant page and crop the complete product without including surrounding marketing text.

- [ ] **Step 3: Normalize with Sharp**

For each asset:

```ts
await sharp(input)
  .flatten({ background: "#ffffff" })
  .resize(1040, 740, { fit: "inside", withoutEnlargement: true })
  .extend({ top, bottom, left, right, background: "#ffffff" })
  .webp({ quality: 88 })
  .toFile(output);
```

The output must be an opaque `1200x900` WebP with white corners.

- [ ] **Step 4: Record provenance**

Add one manifest row per new product with manufacturer, exact model, official URL, retrieval date `2026-10-02`, image source, and local filename.

- [ ] **Step 5: Run unit tests**

Run: `npm.cmd test`

Expected: product and asset invariant tests pass after Tasks 2 and 3.

### Task 4: Implement Solar Tabs And Group-Aware Presentation

**Files:**
- Modify: `src/lib/product-filter.ts`
- Modify: `src/components/products/product-explorer.tsx`
- Modify: `src/components/products/product-card.tsx`
- Modify: `src/app/danh-muc/[slug]/page.tsx`
- Modify: `src/app/san-pham/[slug]/page.tsx`

- [ ] **Step 1: Filter by typed solar group**

Add:

```ts
const matchesSolarGroup =
  filters.solarGroup === "all" ||
  product.solarDetails?.group === filters.solarGroup;
```

Include it in the filter predicate.

- [ ] **Step 2: Add optional solar tabs**

Extend `ProductExplorer` with:

```ts
showSolarGroups?: boolean;
fixedCategory?: boolean;
```

Default `solarGroup` to `"panel"` only when `showSolarGroups` is true. Render a three-option segmented control with counts. On group change, reset query and brand, preserve sort, and set the selected group. Reset keeps the active group.

- [ ] **Step 3: Fix category-page scope**

Filter `products` by the route category before passing them into `ProductExplorer`. Hide the category selector with `fixedCategory`, and enable solar tabs only for `dien-mat-troi`.

- [ ] **Step 4: Show deterministic group labels**

Create a shared group-label mapping:

```ts
{
  panel: "Tấm pin",
  inverter: "Biến tần",
  battery: "Pin lưu trữ",
}
```

Use it on solar cards and details; use the category name for non-solar products.

- [ ] **Step 5: Keep related products in the same solar group**

Update `getRelatedProducts` so solar products match both category and `solarDetails.group`; non-solar products keep category-only behavior.

- [ ] **Step 6: Run unit, type, and lint checks**

Run:

```text
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
```

Expected: all pass.

### Task 5: Add Browser Coverage

**Files:**
- Modify: `e2e/site.spec.ts`

- [ ] **Step 1: Add tab count and default-state tests**

On `/danh-muc/dien-mat-troi`, assert `Tấm pin` is selected and five cards appear. Switch to `Biến tần` and assert eight; switch to `Pin lưu trữ` and assert six.

- [ ] **Step 2: Add filter-state tests**

Select GoodWe in the inverter tab and assert two products. Switch to battery and assert search/brand reset. Select Deye and assert two batteries. Click reset and assert the active battery tab remains selected.

- [ ] **Step 3: Add route and local-image tests**

For all 14 new slugs, assert HTTP 200, `Liên hệ báo giá`, no demo badge, a local image with non-zero intrinsic size, `object-fit: contain`, and the correct group label.

- [ ] **Step 4: Add related-product tests**

Open one inverter and assert all related cards carry `Biến tần`. Open one battery and assert all related cards carry `Pin lưu trữ`.

- [ ] **Step 5: Add responsive checks**

At `1440x900` and `390x844`, assert the tabs and long model names remain inside the viewport and the page has no horizontal overflow.

- [ ] **Step 6: Run full Playwright**

Run: `npm.cmd run test:e2e`

Expected: all applicable tests pass; viewport-specific tests may be intentionally skipped by existing test conditions.

### Task 6: Final Verification And Preview

**Files:**
- Create: `.artifacts/solar-catalog-panels.png`
- Create: `.artifacts/solar-catalog-inverters.png`
- Create: `.artifacts/solar-catalog-batteries-mobile.png`

- [ ] **Step 1: Run full verification**

Run:

```text
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:e2e
npm.cmd run build
```

- [ ] **Step 2: Verify the development server**

Require `http://127.0.0.1:3000/danh-muc/dien-mat-troi` to return HTTP 200. Start the existing dev command only if no server is listening.

- [ ] **Step 3: Capture visual evidence**

Use Playwright to load every lazy image, then capture the three approved tabs on desktop and mobile. Inspect the screenshots for missing images, cropped equipment, overlapping text, and horizontal overflow.

- [ ] **Step 4: Report results**

Summarize product counts, source/image handling, test results, build result, server URL, and screenshot paths. Note that git operations remain unavailable if Windows Security still blocks `git.exe`.
