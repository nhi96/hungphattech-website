# Unified Computing Catalog And Product Branding

## Goal

Combine Laptop, desktop computers, and printers into the existing `Laptop và PC`
category, and remove Thiên Lộc branding from sourced Camera and computing product
images before applying the Hưng Phát `HP` mark.

## Catalog Structure

- Keep `/danh-muc/laptop-pc` as the only public computing category.
- Show three product tabs in this order:
  1. `Laptop`
  2. `Máy tính để bàn`
  3. `Máy in`
- Preserve the existing product totals: 15 laptops, 4 desktops, and 12 printers.
- Redirect `/danh-muc/laptop`, `/danh-muc/may-tinh-de-ban`, and
  `/danh-muc/may-in` to `/danh-muc/laptop-pc`.
- Remove the three standalone category entries from the shared category list so
  homepage cards and filters only expose `Laptop và PC`.
- Store all computing products under `categorySlug: "laptop-pc"` and add a typed
  `computingDetails.group` value of `laptop`, `desktop`, or `printer`.
- Define:
  - `ComputingProductGroup = "laptop" | "desktop" | "printer"`.
  - `ComputingDetails = { group: ComputingProductGroup }`.
  - `Product.computingDetails?: ComputingDetails`.
  - `ProductFilters.computingGroup: ComputingProductGroup | "all"`.
- Every `laptop-pc` product must define `computingDetails`; every product outside
  `laptop-pc` must leave it undefined.

## Computing Page

- Reuse the existing category hero and product cards.
- Add a horizontal, responsive tab list above the filters.
- Default to the `Laptop` tab.
- Selecting a tab clears search and brand filters, preserves sort order, and
  limits product cards and brand choices to that group.
- Reset preserves the active computing tab, matching the Solar tab behavior.
- The general `/san-pham` explorer does not show computing tabs.
- Related products on a computing product detail page remain in the same
  computing group.
- Laptop and desktop prices continue to use sourced numeric prices when
  available. Printers remain `Liên hệ báo giá`.

## Image Rebranding

- Process every local image used by Camera, Laptop, desktop, and printer products.
- Remove the Thiên Lộc corner mark and repeated pale watermark pattern.
- Preserve the actual product and manufacturer marks on the product itself.
- Reconstruct each image on an opaque white `1200x900` canvas.
- Add `public/images/hung-phat-logo-transparent.png` in the upper-left corner
  at `x=40`, `y=32`, rendered at `96x70`, full opacity, and preserved aspect
  ratio. The source logo file remains unchanged.
- Write branded outputs to new `*-hung-phat.webp` files and update product data
  to use those files. Keep original downloaded files as source artifacts.
- The result must not contain hotlinked assets.

## Validation

- Product data tests verify 31 computing products all use `laptop-pc`, have a
  valid computing group, and reference branded local WebP images.
- Camera tests verify all 28 records reference branded local WebP images.
- Image tests verify opaque WebP, `1200x900`, white corners, and expected HP-logo
  red pixels in the exact `x=40..135`, `y=32..101` brand zone.
- The processing script records the extracted product bounding box for each
  output. Image tests verify source-specific background sample regions outside
  that box and outside the HP logo mask are pure white. This targets former
  corner-logo and watermark areas without rejecting legitimate product colors.
- Generate full contact sheets for all 59 outputs at a readable scale. Visually
  inspect every tile for remaining Thiên Lộc corner marks, repeated pale
  watermarks, damaged product edges, or misplaced HP logos.
- E2E tests verify the unified page, tab counts, group isolation, old-route
  redirects, pricing rules, and no horizontal overflow on desktop/mobile.
- Run unit tests, typecheck, lint, E2E, production build, and visual screenshot
  inspection before completion.

## Out Of Scope

- Changing product models, technical specifications, or prices.
- Editing solar or smart-lock imagery.
- Adding a computing content-editor tab.
