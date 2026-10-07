# Solar Panel Product Expansion

## Goal

Add five real solar panel models to the existing Điện mặt trời catalog while preserving the current product browsing, filtering, detail-page, and contact-price behavior.

## Products

1. LONGi 545W LR5-72HBD-545M
2. ASTRONERGY 540W CHSM72M(DG)/F-BH-540
3. JINKO 590W JKM590N-72HL4-V
4. LONGi 615W LR8-66HGD-615M
5. TCL Solar 630W HSM-ND66-GR630

## Data Rules

- Use exact manufacturer and model names.
- Verify power, model, module type, and core specifications from manufacturer sources.
- Write original Vietnamese summaries and descriptions rather than copying reseller text.
- Set `categorySlug` to `dien-mat-troi`.
- Set `price` to `null`, which renders as `Liên hệ báo giá`.
- Preserve the three existing solar system demo products.
- Mark the five new panel models as reference products rather than local demo products.
- Keep a clear notice that availability and distribution must be confirmed through Hưng Phát.
- Require unique slugs, `price === null`, local image paths, and exactly three demo plus five reference products in the solar category.

## Images

- Source the main product image from an official manufacturer page or manufacturer datasheet.
- Store every selected image locally under `public/images/products/solar-panels/`.
- Do not hotlink manufacturer or reseller assets.
- Use stable ASCII filenames derived from manufacturer, wattage, and model.
- Record the official source URL and retrieval date in `docs/sources/solar-panel-products.md`.
- Convert images to WebP and prepare them on a neutral 4:3 canvas with the complete portrait module centered and uncropped.
- Set the five panel products to use `contain` image fitting on cards and detail pages.
- A verified official exact-model or exact-model-family image is required. Missing official imagery blocks that product instead of substituting a different panel.

## UI Behavior

- Generalize `Product.isDemo` from the literal `true` to a boolean.
- Add an image-fit field so panel modules can use `contain` while existing product photography keeps `cover`.
- Existing demo products keep the current demo badge and disclaimer.
- The five new products do not show the demo badge.
- Real/reference products show the manufacturer normally and use neutral headings such as `Đặc điểm` and `Thông số kỹ thuật`.
- Product cards, detail pages, brand filtering, related products, and category counts update from the shared product data.
- Change mixed-catalog copy from `sản phẩm minh họa` to neutral `sản phẩm` in the result count.
- Make product card manufacturer labels, image alt text, detail metadata, descriptions, and specification headings conditional on `isDemo`.
- Change the products-page hero/metadata and category disclaimer so they no longer claim that every product is demo content.
- No new navigation tab or category is introduced.

## Validation

- Exactly five new unique slugs are added.
- The Điện mặt trời category contains eight products total.
- The solar category contains three demo products and five reference products.
- Every new product has `price === null`, a local image path, a verified provenance entry, and `contain` image fitting.
- Each new detail route returns HTTP 200.
- Each new main image loads locally and has non-zero intrinsic dimensions.
- Each new product displays `Liên hệ báo giá`.
- Brand filtering finds LONGi, ASTRONERGY, JINKO, and TCL Solar correctly, including both LONGi products.
- Demo labels remain on old demo products and are absent on the five new models.
- Mixed-catalog pages and metadata use neutral copy rather than describing all products as demo content.
- Long model names and full portrait panels do not crop or overflow at desktop and mobile widths.
- Data-invariant tests cover unique slugs, product counts, demo/reference distribution, contact pricing, and local image paths.
- Existing tests expecting three solar demo products are updated for the mixed eight-product category.
- Type checking, linting, unit tests, E2E tests, and production build pass.
