# Solar Catalog Groups

## Goal

Expand the existing `Điện mặt trời` category into three clear product groups without adding a new top-level navigation category:

1. `Tấm pin` with the five verified panel products already present.
2. `Biến tần` with eight representative inverter products from GoodWe, LuxPower, Deye, and Sungrow.
3. `Pin lưu trữ` with six representative battery products from Lithium Valley, Deye, and HiTHIUM.

The finished solar catalog contains exactly 19 reference products. The three old solar demo system products are removed from the public catalog so the panel group contains exactly the five approved solar panels.

## Product Scope

### Solar Panels

Keep the five existing reference products unchanged:

1. LONGi 545W `LR5-72HBD-545M`
2. ASTRONERGY 540W `CHSM72M(DG)/F-BH-540`
3. JINKO 590W `JKM590N-72HL4-V`
4. LONGi 615W `LR8-66HGD-615M`
5. TCL Solar 630W `HSM-ND66-GR630`

### Inverters

Add two representative products per manufacturer, covering the requested 6–20 kW range:

1. GoodWe 6 kW `GW6000-ES-20`
2. GoodWe 20 kW `GW20K-ET-L-G10`
3. LuxPower 6 kW `TriP2-LB-3P 6K`
4. LuxPower 20 kW `TriP2-LB-3P 20K`
5. Deye 6 kW `SUN-6K-SG06LP1-EU-BM2`
6. Deye 20 kW `SUN-20K-SG01HP3-EU-AM2`
7. Sungrow 6 kW `SH6.0RS`
8. Sungrow 20 kW `SH20T`

Do not invent or normalize a model suffix when the manufacturer uses a region-specific identifier. The final product data and source document must record the exact official model selected.

### Storage Batteries

Add two representative products per manufacturer:

1. Lithium Valley `LV-BAT-W5.12Da`, 5.12 kWh
2. Lithium Valley `W15-5A`, 14.336 kWh
3. Deye `SE-G5.1 Pro-B`, 5.12 kWh
4. Deye `RW-F16`, 16 kWh
5. HiTHIUM `ARKVOLT F8S`, 8 kWh
6. HiTHIUM `HeroEE 16`, 16 kWh

Battery energy must be displayed in `kWh`. Power values may use `kW` only where the official datasheet publishes a charge or discharge power rating.

## Source And Image Rules

- Use only official manufacturer product pages, catalogs, or datasheets for model names, specifications, and primary imagery.
- Prefer an exact-model image. A product-family image is acceptable only when the official manufacturer explicitly groups the selected model in that family.
- Store all images locally:
  - Inverters: `public/images/products/solar-inverters/`
  - Batteries: `public/images/products/solar-batteries/`
- Convert final assets to WebP on a neutral 4:3 canvas.
- Keep the complete product visible with `object-fit: contain`; do not crop, stretch, recolor, or hotlink it.
- Record manufacturer URL, retrieval date `2026-10-02`, selected model, source page or PDF, and local filename in `docs/sources/solar-energy-products.md`.
- All 14 new products are required for release. If an exact model or official family image cannot be verified, implementation is blocked until an official source is found; do not publish a partial catalog or substitute a reseller image.
- The five approved panel assets remain unchanged, including existing transparent pixels where present.
- Each of the 14 new inverter and battery assets is an opaque WebP on a `1200x900` white canvas.
- Each product has exactly one primary local image.
- Automated asset validation checks file existence, `.webp` format, `1200x900` dimensions, non-zero byte size, and a matching entry in the source manifest.
- For the 14 new assets, decoded-pixel validation also requires a fully opaque alpha channel and white pixels at all four canvas corners.

## Data Model

Add a solar-specific product group:

```ts
export type SolarProductGroup = "panel" | "inverter" | "battery";

export type SolarProductDetails =
  | {
      group: "panel";
      ratedPowerKw: number;
  }
  | {
      group: "inverter";
      ratedOutputKw: number;
      phase: "single-phase" | "three-phase";
      inverterType: "hybrid" | "off-grid" | "grid-tied";
  }
  | {
      group: "battery";
      energyKwh: number;
      energyBasis: "nominal" | "usable";
    };

export type Product = {
  // existing fields
  solarDetails?: SolarProductDetails;
};

export type ProductFilters = {
  // existing fields
  solarGroup: SolarProductGroup | "all";
};
```

Rules:

- Every `dien-mat-troi` reference product must have `solarDetails`.
- Products in other categories leave `solarDetails` undefined.
- The five existing panels use `solarDetails.group: "panel"` and store rated panel power numerically in kW.
- The eight inverter products use `solarDetails.group: "inverter"` and store rated output power numerically in kW.
- The six storage products use `solarDetails.group: "battery"` and store energy numerically in kWh with a declared nominal or usable basis.
- All 19 solar products use `price: null`, `isDemo: false`, local images, and `imageFit: "contain"`.
- Product slugs remain globally unique.

## Category Interface

The `Điện mặt trời` category displays a segmented three-tab control above the existing search and filter controls:

1. `Tấm pin` with count `5`
2. `Biến tần` with count `8`
3. `Pin lưu trữ` with count `6`

Behavior:

- The default active tab is `Tấm pin`.
- Changing tabs updates the product grid immediately without navigation or a page reload.
- Search, brand, and sorting operate only on the active group.
- Brand options are derived from products in the active group.
- Changing tabs resets search and brand to avoid a hidden filter producing an empty result.
- `Đặt lại bộ lọc` clears search and brand but keeps the active solar tab.
- The count line reports the active filtered result, such as `8 sản phẩm`.
- The tab control is horizontally scrollable on narrow screens and must not cause page-level horizontal overflow.
- Other product categories continue using the current explorer without solar tabs.
- Category pages pass only products from their own category into the explorer.
- The category selector is hidden on every category page because the category is fixed by the route.
- `/san-pham` keeps the existing category selector and uses `solarGroup: "all"` internally without displaying solar tabs.

## General Products Page

The main `/san-pham` page continues to show products from every category. It does not show the solar tab control because the category filter already spans the full catalog.

Solar products on this page remain searchable and filterable by category and manufacturer. No additional global product-type filter is required.

## Cards And Detail Pages

- Product cards use the existing reference-product presentation without a demo badge.
- Cards keep the full official product image visible using `contain`.
- For solar products, cards and detail pages show the group label (`Tấm pin`, `Biến tần`, or `Pin lưu trữ`) instead of repeating `Điện mặt trời`.
- Detail pages use neutral headings `Đặc điểm` and `Thông số kỹ thuật`.
- Inverter specifications include, when officially published:
  - Exact model
  - Rated output power
  - Phase configuration
  - Inverter type, such as hybrid or off-grid
  - Battery voltage class or MPPT information
- Battery specifications include, when officially published:
  - Exact model
  - Nominal or usable energy
  - Battery chemistry
  - Nominal voltage
  - Cycle life or protection rating
- Availability, warranty application, compatibility, and distribution status remain subject to confirmation by Hưng Phát.
- Related products are selected from the same `solarGroup` before applying the existing result limit. Products outside the solar category keep the existing category-based related-product behavior.

## Data Organization

Split the growing product catalog by responsibility:

- `src/data/products/solar-panels.ts`
- `src/data/products/solar-inverters.ts`
- `src/data/products/solar-batteries.ts`
- `src/data/products/demo-products.ts`
- `src/data/products/index.ts`

`src/data/products/index.ts` exports the combined `products` array and the existing lookup helpers. This keeps consumers stable while preventing the current single product-data file from becoming harder to maintain.

## Validation

Automated validation must prove:

- The solar catalog contains exactly 19 products: 5 panels, 8 inverters, and 6 batteries.
- The three old solar demo systems are absent from the public products array.
- Every solar product has valid typed `solarDetails`, a unique slug, `price === null`, `isDemo === false`, exactly one local image path, and `imageFit === "contain"`.
- Every inverter rated power falls within the requested 6–20 kW range.
- Every panel and inverter power value is numeric and expressed in kW in typed data.
- Every battery energy value is numeric, declares nominal or usable basis, and uses `kWh` in visible copy.
- The inverter set contains exactly two GoodWe, two LuxPower, two Deye, and two Sungrow products with the approved model IDs.
- The battery set contains exactly two Lithium Valley, two Deye, and two HiTHIUM products with the approved model IDs.
- GoodWe, LuxPower, Deye, Sungrow, Lithium Valley, and HiTHIUM brand filters return the expected products.
- The category defaults to the five-panel tab.
- Each tab shows the correct count and product set.
- Search and brand filters reset when changing group.
- Resetting filters preserves the active group.
- Every new detail route returns HTTP 200, displays `Liên hệ báo giá`, loads a local non-zero image, and has no demo badge.
- Every new local asset exists, is WebP, is exactly `1200x900`, has non-zero byte size, and has a source-manifest record.
- Every new inverter and battery asset decodes as fully opaque and has white pixels at all four canvas corners.
- Related products on solar detail pages remain within the same product group.
- Solar cards and detail pages show the group label instead of the generic category label.
- Cards, tabs, model names, and detail images do not crop or overflow at `1440x900` and `390x844`.
- Unit tests, TypeScript, ESLint, Playwright, and the production build pass.

## Out Of Scope

- No prices, inventory quantities, checkout, or payment flow.
- No new top-level category or navigation item.
- No backend product database or admin product editor.
- No reseller imagery or copied reseller descriptions.
- No claim that Hưng Phát is an authorized distributor unless the business supplies evidence.
