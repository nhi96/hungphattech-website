# Solar Panel Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five verified solar panel models with locally stored manufacturer imagery, contact pricing, and correct mixed demo/reference presentation.

**Architecture:** Extend the existing static product data rather than introducing a new backend. Add a small presentation distinction through `isDemo` and `imageFit`, then make product listing/detail copy conditional so existing demo records and new reference records can coexist honestly.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Sharp, Node test runner, Playwright.

---

## File Map

- Create `tests/product-data.test.ts`: catalog invariants for the five new products.
- Create `docs/sources/solar-panel-products.md`: official source and image provenance.
- Create `public/images/products/solar-panels/*.webp`: locally stored 4:3 product assets.
- Modify `src/types/content.ts`: allow demo/reference products and per-product image fitting.
- Modify `src/data/products.demo.ts`: add five panel records.
- Modify `src/components/products/product-card.tsx`: conditional badge/copy and contain fitting.
- Modify `src/app/san-pham/[slug]/page.tsx`: conditional detail copy and contain fitting.
- Modify `src/components/products/product-explorer.tsx`: neutral product count.
- Modify `src/app/san-pham/page.tsx`: neutral mixed-catalog metadata and hero copy.
- Modify `src/app/danh-muc/[slug]/page.tsx`: neutral category notice.
- Modify `tests/product-filter.test.ts`: update solar search/count assumptions.
- Modify `e2e/site.spec.ts`: verify five new products, price, images, filters, and responsive rendering.

### Task 1: Lock Catalog Requirements With Failing Tests

**Files:**
- Create: `tests/product-data.test.ts`
- Modify: `tests/product-filter.test.ts`

- [ ] **Step 1: Add failing catalog invariant tests**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { products } from "../src/data/products.demo.ts";

const expectedSlugs = [
  "tam-pin-longi-545w-lr5-72hbd-545m",
  "tam-pin-astronergy-540w-chsm72mdg-f-bh-540",
  "tam-pin-jinko-590w-jkm590n-72hl4-v",
  "tam-pin-longi-615w-lr8-66hgd-615m",
  "tam-pin-tcl-solar-630w-hsm-nd66-gr630",
];

describe("solar panel product data", () => {
  it("contains five verified reference panels and three existing demos", () => {
    const solar = products.filter((product) => product.categorySlug === "dien-mat-troi");
    assert.equal(solar.length, 8);
    assert.equal(solar.filter((product) => product.isDemo).length, 3);
    assert.deepEqual(
      expectedSlugs.filter((slug) => solar.some((product) => product.slug === slug)),
      expectedSlugs,
    );
  });

  it("uses contact pricing and local contained images for reference panels", () => {
    for (const product of products.filter((item) => expectedSlugs.includes(item.slug))) {
      assert.equal(product.price, null);
      assert.equal(product.imageFit, "contain");
      assert.equal(product.images.every((image) => image.startsWith("/images/")), true);
      assert.equal(product.isDemo, false);
    }
  });

  it("keeps every product slug unique", () => {
    assert.equal(new Set(products.map((product) => product.slug)).size, products.length);
  });
});
```

- [ ] **Step 2: Update the search test expectation from three to eight solar products**

```ts
assert.equal(result.length, 8);
```

- [ ] **Step 3: Run tests and confirm the new tests fail**

Run: `npm test`

Expected: FAIL because the five slugs and `imageFit` do not exist yet.

### Task 2: Add Official Images and Provenance

**Files:**
- Create: `docs/sources/solar-panel-products.md`
- Create: `public/images/products/solar-panels/longi-545w-lr5-72hbd.webp`
- Create: `public/images/products/solar-panels/astronergy-540w-chsm72mdg-f-bh.webp`
- Create: `public/images/products/solar-panels/jinko-590w-jkm590n-72hl4-v.webp`
- Create: `public/images/products/solar-panels/longi-615w-lr8-66hgd.webp`
- Create: `public/images/products/solar-panels/tcl-solar-630w-hsm-nd66-gr.webp`

- [ ] **Step 1: Download official manufacturer datasheets into `tmp/pdfs/`**

Use the official URLs recorded in the source document:

```text
LONGi LR5-72HBD: static.longi.com official datasheet
Astronergy ASTRO 5: astronergy.com official datasheet
Jinko Tiger Neo 72HL4-V: jinkosolar.com.au official datasheet
LONGi LR8-66HGD: static.longi.com official datasheet
TCL HSM-ND66-GR: tcl.com official datasheet
```

- [ ] **Step 2: Render the first datasheet page and crop only the official module visual**

Run `pdftoppm -f 1 -singlefile -png <source.pdf> <output-prefix>` for each source. Inspect every rendered page before cropping.

- [ ] **Step 3: Normalize each selected visual with Sharp**

Place the complete portrait module on a `1600x1200` neutral canvas using `fit: "contain"` and export WebP at quality 88. Do not stretch, crop, or recolor the module.

- [ ] **Step 4: Record provenance**

For each output, record product model, manufacturer URL, retrieval date `2026-10-02`, source page/PDF, and local filename in `docs/sources/solar-panel-products.md`.

- [ ] **Step 5: Verify generated image metadata**

Run a Sharp metadata check and require every output to be `1600x1200`, WebP, and non-empty.

### Task 3: Add Product Data

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/data/products.demo.ts`

- [ ] **Step 1: Generalize the product presentation fields**

```ts
export type Product = {
  // existing fields
  isDemo: boolean;
  imageFit?: "cover" | "contain";
  featured?: boolean;
};
```

- [ ] **Step 2: Add the five records**

Each record must use:

```ts
{
  slug: "tam-pin-tcl-solar-630w-hsm-nd66-gr630",
  name: "Tấm pin TCL Solar 630W HSM-ND66-GR630",
  categorySlug: "dien-mat-troi",
  brand: "TCL Solar",
  summary: "Tấm pin N-type TOPCon hai mặt kính công suất 630W cho hệ thống điện mặt trời công suất lớn.",
  description:
    "Model HSM-ND66-GR630 sử dụng cấu trúc hai mặt kính và công nghệ N-type TOPCon. Khả năng cung ứng và cấu hình lắp đặt cần được Hưng Phát xác nhận khi tư vấn.",
  features: ["Công suất 630W", "Công nghệ N-type TOPCon", "Thiết kế hai mặt kính"],
  specifications: [
    { label: "Model", value: "HSM-ND66-GR630" },
    { label: "Công suất cực đại", value: "630W" },
    { label: "Hiệu suất module", value: "23,3%" },
    { label: "Kích thước", value: "2382 x 1134 x 30 mm" },
  ],
  images: ["/images/products/solar-panels/tcl-solar-630w-hsm-nd66-gr.webp"],
  price: null,
  isDemo: false,
  imageFit: "contain",
}
```

Create equivalent verified records for LONGi 545W, Astronergy 540W, Jinko 590W, and LONGi 615W using the official specifications in the provenance document.

- [ ] **Step 3: Run unit tests**

Run: `npm test`

Expected: PASS for product data and filtering tests.

### Task 4: Support Mixed Demo and Reference Products

**Files:**
- Modify: `src/components/products/product-card.tsx`
- Modify: `src/app/san-pham/[slug]/page.tsx`
- Modify: `src/components/products/product-explorer.tsx`
- Modify: `src/app/san-pham/page.tsx`
- Modify: `src/app/danh-muc/[slug]/page.tsx`

- [ ] **Step 1: Make product cards conditional**

Render `<DemoBadge />` only when `product.isDemo`. Use `object-contain p-5` for `imageFit === "contain"` and `object-cover` otherwise. Use `Thương hiệu tham khảo` for reference products and retain the existing demo disclaimer for demos.

- [ ] **Step 2: Make detail pages conditional**

Use neutral image alt text for reference products, hide the demo badge, remove demo-only metadata suffixes, and use `Đặc điểm` plus `Thông số kỹ thuật` headings for reference products.

- [ ] **Step 3: Neutralize mixed-catalog copy**

Change the result count to `${filtered.length} sản phẩm`. Update the products hero and category notice to explain that model information is for reference and availability requires confirmation, without describing the whole catalog as demo-only.

- [ ] **Step 4: Run type checking and linting**

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

### Task 5: Add Browser Coverage and Verify

**Files:**
- Modify: `e2e/site.spec.ts`

- [ ] **Step 1: Update the solar category count assertion**

Expect `8 sản phẩm` after resetting filters.

- [ ] **Step 2: Add E2E coverage for the reference panels**

Verify each new detail route returns 200, displays `Liên hệ báo giá`, has no demo badge, and loads its local image. Verify LONGi brand filtering returns both new LONGi panels.

- [ ] **Step 3: Add responsive image and title checks**

At `1440x900` and `390x844`, confirm the panel image has `object-fit: contain`, the title stays within its container, and the page has no horizontal overflow.

- [ ] **Step 4: Run full verification**

Run:

```text
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
```

Expected: all commands pass.

- [ ] **Step 5: Commit**

Git commands may run only after Windows Security permits `git.exe`. Stage only the files listed in this plan and commit with:

```text
feat: add verified solar panel products
```
