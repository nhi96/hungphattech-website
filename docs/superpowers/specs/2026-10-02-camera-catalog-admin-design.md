# Camera Catalog And Administration

## Goal

Replace the three placeholder camera records with a real reference catalog based on the camera listings supplied by the user, and add `Camera giám sát` as the third page in the existing content editor:

1. `Trang chủ`
2. `Điện mặt trời`
3. `Camera giám sát`

Camera prices remain `Liên hệ báo giá`.

## Product Source And Scope

- Use these two category pages as the discovery source:
  - `https://mayvanphongthienloc.com/san-pham/camera/`
  - `https://mayvanphongthienloc.com/san-pham/camera/page/2/`
- Import exactly 28 unique camera variants:
  1. Imou `IPC-C22EP`
  2. Imou `IPC-C22SP`
  3. Imou `IPC-S2VP-5M0WR`
  4. Imou `IPC-S2XEP-6M0S`
  5. Imou `IPC-S2XEP-10M0S`
  6. Imou `IPC-A32P-PRO`
  7. Imou `IPC-A52P-PRO`
  8. Imou `IPC-K2MP-3H1WE`
  9. Imou `IPC-K2MP-5H1WE`
  10. Imou `IPC-S2VBP-5M0WR`
  11. Imou `IPC-S2XP-6M0WED`
  12. Imou `IPC-S2XP-10M0WED`
  13. Imou `IPC-S6DP-3M0WEB`
  14. Imou `IPC-S6DP-5M0WEB`
  15. Hikvision `DS-2CV2121G2-IDW`
  16. Imou `F22FEP`
  17. Imou `F32FP`
  18. Imou `F52FP`
  19. Imou `S3EP-3M0WEB`
  20. Imou `S3EP-5M0WEB`
  21. Imou `GS7EP-3M0WE`
  22. Imou `GS7EP-5M0WE`
  23. Imou `IPC-S7XP-6M0WED`
  24. Imou `IPC-S7XP-10M0WED`
  25. Imou `S21FEP`
  26. Imou `S41FEP`
  27. Imou `S51FEP`
  28. Imou `IPC-S7UP-11M0WED`
- Deduplicate repeated listings by normalized manufacturer and model.
- Exclude accessories, bundles without a distinct model, and records whose model cannot be verified.
- Include indoor, outdoor, bulb, bullet, dome, PTZ, dual-lens, and triple-lens surveillance cameras. The supplied pages contain no conference or vehicle cameras in the approved 28-product set.
- Use the listing title and factual specifications as source material, but write original Vietnamese summaries and descriptions.
- Prefer official manufacturer product imagery. If an official exact-model image cannot be obtained, use the supplied retailer's exact-product image and record that provenance.
- Download every final image and store it locally under `public/images/products/cameras/`.
- Normalize final images to opaque `1200x900` WebP files on a white canvas with the complete product visible.
- Record model, manufacturer, discovery URL, image source URL, retrieval date `2026-10-02`, and local path in `docs/sources/camera-products.md`.

## Product Data

Create `src/data/products/cameras.ts` and replace the three camera demo records.

Every camera product must have:

- A globally unique slug.
- Exact model when present in the source title.
- Manufacturer normalized to `Imou`, `Hikvision`, or the verified source manufacturer.
- `categorySlug: "camera-giam-sat"`.
- `price: null`.
- `isDemo: false`.
- `imageFit: "contain"`.
- Exactly one local primary image.
- Original Vietnamese summary and description.
- Factual features and specifications only.

Add typed camera details:

```ts
export type CameraDetails = {
  resolutionMp?: number;
  environment: "indoor" | "outdoor" | "indoor-outdoor";
  connectivity: "wifi" | "poe" | "wired" | "wifi-wired";
  formFactor: "dome" | "bullet" | "ptz" | "cube" | "doorbell" | "other";
  dualLens: boolean;
};
```

Every `camera-giam-sat` product must define `cameraDetails`. Every product outside that category must leave `cameraDetails` undefined.

Mapping rules:

- Titles containing `ngoài trời`, `Bullet`, or `Cruiser` use `environment: "outdoor"`; the remaining approved models use `environment: "indoor"`.
- The approved models use `connectivity: "wifi"` unless an exact official or retailer specification explicitly also publishes Ethernet, in which case use `wifi-wired`.
- `Bullet` models use `formFactor: "bullet"`.
- `Cruiser`, `Ranger`, and `Rex` models use `formFactor: "ptz"`.
- `Cue` models use `formFactor: "cube"`.
- Hikvision `DS-2CV2121G2-IDW` uses `formFactor: "dome"`.
- Bulb models use `formFactor: "other"`.
- `dualLens` is true only for the approved Ranger Dual and Cruiser Dual variants. The triple-lens model records `dualLens: false` because it is not a dual-lens device; its three-lens construction remains visible in features and specifications.

## Public Camera Page

The route `/danh-muc/camera-giam-sat` reads published camera presentation content and renders:

1. Editable hero.
2. Editable advisory notice.
3. Editable category introduction with image, title, and description.
4. Existing product search, brand filter, and sorting.
5. The complete unique camera catalog.

The existing product cards and detail pages are reused. Camera cards display `Camera giám sát`, manufacturer, and `Liên hệ báo giá`.

The three old camera demo slugs must no longer exist in the catalog.

## Camera Content Model

Extend `SiteContent.pages` with:

```ts
type CameraPageContent = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    buttonLabel: string;
    alt: string;
    image: ImageRef;
  };
  notice: string;
  introduction: {
    eyebrow: string;
    title: string;
    description: string;
    alt: string;
    image: ImageRef;
  };
};
```

Existing content documents without `pages.camera` are migrated during parsing. Defaults use the existing `category-camera` asset and current category copy. Existing homepage and solar edits, assets, and revisions are preserved.

All camera image references must point to known assets.

## Administration Interface

Add `Camera giám sát` after `Điện mặt trời` in the page selector and `/api/admin/content` page list.

Camera navigation contains:

- `Banner camera`
- `Thông báo sản phẩm`
- `Giới thiệu danh mục`

The inspector supports:

- Eyebrow, title, description, and consultation button for the hero.
- Advisory notice text.
- Eyebrow, title, and description for the category introduction.
- Image preview, upload/replace, alternative text, horizontal focal position, and vertical focal position for hero and introduction.

All fields reuse the current draft, autosave, undo, redo, reset, conflict, preview, and publish workflow.

## Preview

Add `/quan-tri/xem-truoc/camera`.

It loads draft content and renders the same camera category component used by the public page, with the real camera catalog. Desktop and mobile preview controls remain unchanged.

## Component Boundaries

- `content-schema.ts`: camera schema, migration, types, and asset validation.
- `cameras.ts`: camera product records only.
- `category-page-content.tsx`: reusable editable category page for Camera and future simple categories.
- `camera-content-inspector.tsx`: camera-specific editor fields.
- `content-editor.tsx`: page selection and preview routing.
- Category route: selects the solar custom page, camera custom page, or existing static fallback.

## Validation

Automated tests must verify:

- Legacy content migrates with `pages.camera`.
- Camera asset references are validated.
- `Camera giám sát` follows `Điện mặt trời` in the admin page selector and API list.
- Every camera product is non-demo, unique, locally imaged, and uses contact pricing.
- The catalog contains exactly the approved 28 manufacturer/model variants.
- Normalized manufacturer/model pairs are unique.
- Every camera product has valid `cameraDetails`; every non-camera product has none.
- Every camera has exactly one local image path.
- All final camera images exist, are opaque WebP, and are `1200x900`.
- Decoded camera images have white pixels in all four canvas corners.
- Every image has a source-manifest entry.
- Old camera demo slugs are absent.
- Camera public and preview routes render editable content.
- Editing or replacing one camera placement does not affect solar or homepage placements.
- Desktop and mobile pages do not overflow horizontally.

Run:

```text
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:e2e
npm.cmd run build
```

## Out Of Scope

- Camera inventory and checkout.
- Copying retailer descriptions verbatim.
- Hotlinked images.
- Editing individual camera product specifications in the admin.
- Lock, laptop, desktop, and printer implementation in this camera delivery.
