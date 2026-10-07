# Camera Product Image Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 28 camera catalog images with model-matched manufacturer images, normalize them to a square white canvas, add a subtle HP watermark, and deploy cache-safe assets.

**Architecture:** A focused Node/Sharp pipeline reads a versioned provenance manifest, validates and downloads only approved manufacturer URLs, stages deterministic normalized and watermarked outputs, and atomically replaces the catalog assets after validation. Product URLs and slugs stay unchanged; a fixed query token in camera image paths invalidates browser and Next.js optimizer caches.

**Tech Stack:** Node.js 22, Sharp, Node test runner, Next.js 16.3.8, Vercel CLI, GitHub REST/Git Data API.

---

## File Map

- Create `docs/assets/camera-image-sources.json`: auditable source, hash, model-match, rights, and output metadata.
- Create `scripts/refresh-camera-assets.mjs`: guarded download, deterministic image transformation, watermarking, hashes, and contact-sheet generation.
- Create `tests/camera-image-pipeline.test.ts`: manifest, model, output dimension, watermark, and cache-token checks.
- Modify `src/data/products/cameras.ts`: append `?v=20261007-camera-refresh-1` to camera image URLs.
- Modify `tests/product-data.test.ts`: accept cache tokens and require square 1200 x 1200 camera images.
- Create `.artifacts/camera-refresh/`: ignored raw downloads, staging outputs, contact sheet, and rollback checksums.
- Modify 56 files under `public/images/products/cameras/`: normalized and watermarked outputs.

### Task 1: Capture rollback state

- [ ] Record the current Vercel production deployment ID and GitHub main commit SHA.
- [ ] Hash all 56 current camera image files with SHA-256.
- [ ] Copy the 56 current camera files into `.artifacts/camera-refresh/rollback/`.
- [ ] Write `.artifacts/camera-refresh/rollback.json` containing deployment ID, commit SHA, file paths, and hashes.
- [ ] Verify the rollback file count is exactly 56.

### Task 2: Add failing pipeline tests

- [ ] Create `tests/camera-image-pipeline.test.ts` with assertions that the manifest has 28 unique exact models, uses only approved official domains, and defines source and output hashes.
- [ ] Add assertions that every camera source and watermarked output is an opaque 1200 x 1200 WebP.
- [ ] Add assertions that each product image URL ends with `-hung-phat.webp?v=20261007-camera-refresh-1`.
- [ ] Add duplicate SHA-256 and perceptual-hash checks that require an explicit manifest justification for reused images.
- [ ] Run `npm.cmd test` and confirm the new tests fail before implementation.

### Task 3: Build the guarded image pipeline

- [ ] Create `scripts/refresh-camera-assets.mjs`.
- [ ] Define the exact 28 model-to-filename mappings from `src/data/products/cameras.ts`.
- [ ] Allow only `imou.vn`, official Imou global/regional domains, and official Hikvision domains after redirects.
- [ ] Enforce a 30-second timeout, 20 MB response limit, valid image MIME/magic bytes, successful Sharp decode, and 40-megapixel decoded limit.
- [ ] Apply EXIF autorotation, sRGB conversion, transparent/white trim with Sharp threshold 10, and centered placement in a 900 x 900 safe box on a 1200 x 1200 white canvas.
- [ ] Do not upscale sources whose longest trimmed edge is below 800 pixels; record `low-resolution-exception`.
- [ ] Composite `public/images/hung-phat-logo-transparent.png` at 20% opacity, 36-pixel top/left padding, starting at 180 pixels wide.
- [ ] Reduce logo width in 12-pixel steps when visible product overlap exceeds 5%; fail below 120 pixels if overlap remains above 5%.
- [ ] Encode source and branded images as sRGB WebP quality 88.
- [ ] Write staged outputs first, calculate SHA-256 and 64-bit dHash metadata, then atomically replace destination files.
- [ ] Generate `.artifacts/camera-refresh/contact-sheet.png`.

### Task 4: Populate and validate official sources

- [ ] Search the official Imou site for each of the 27 exact Imou SKUs and the official Hikvision site for `DS-2CV2121G2-IDW`.
- [ ] Record exact SKU evidence, product-page URL, resolved image URL, retrieval timestamp, rights reference, original dimensions, content type, and selected image role in `docs/assets/camera-image-sources.json`.
- [ ] Leave a product unchanged and mark it `manual-approval-required` if an exact official source or reuse authorization cannot be verified.
- [ ] Run `node scripts/refresh-camera-assets.mjs`.
- [ ] Confirm all accepted entries download and decode without HTML/placeholder responses.
- [ ] Inspect the contact sheet and reject any model mismatch, crop, collision, duplicate, or low-quality source.

### Task 5: Update cache-safe catalog paths

- [ ] Modify the camera image mapper in `src/data/products/cameras.ts` to produce:

```ts
images: [
  `/images/products/cameras/${seed.image.replace(
    /\.webp$/,
    "-hung-phat.webp",
  )}?v=20261007-camera-refresh-1`,
],
```

- [ ] Update `tests/product-data.test.ts` so filesystem checks remove the query string before joining with `public`.
- [ ] Change camera-only dimension assertions from 1200 x 900 to 1200 x 1200.
- [ ] Keep non-camera product assertions unchanged.

### Task 6: Verify locally

- [ ] Run `npm.cmd run lint`; expect exit code 0.
- [ ] Run `npm.cmd run typecheck`; expect exit code 0.
- [ ] Run `npm.cmd test`; expect all tests to pass.
- [ ] Run `npm.cmd run build`; expect a successful production build.
- [ ] Start the production server on an unused local port.
- [ ] Capture desktop and mobile screenshots of the camera category and representative indoor, outdoor, dual-lens, and Hikvision product pages.
- [ ] Verify every local catalog image request returns 200 and decodes as the expected image.
- [ ] Stop the local verification server.

### Task 7: Publish exact source state

- [ ] Upload the design, plan, manifest, pipeline, tests, catalog update, and 56 camera assets to `nhi96/hungphattech-website`.
- [ ] Record the resulting GitHub commit SHA.
- [ ] Verify representative raw GitHub files and images exist at that SHA.
- [ ] Deploy the exact local source state to a Vercel preview and record its deployment ID.
- [ ] Run the production smoke tests against the preview.
- [ ] Promote the verified preview deployment to production.

### Task 8: Verify production and rollback readiness

- [ ] Confirm `https://hungphattech.net` and `https://www.hungphattech.net` return 200 over valid HTTPS.
- [ ] Download and SHA-256-check all 56 public camera images against the manifest.
- [ ] Request every watermarked catalog image through `/_next/image` at product-grid and detail widths.
- [ ] Compute 64-bit horizontal dHash values and require Hamming distance at most 6 from local expected optimizer outputs.
- [ ] Capture final desktop and mobile production screenshots.
- [ ] Confirm no missing images, stale optimized images, incorrect models, crop, text overlap, or layout shift.
- [ ] Keep the recorded prior deployment ID, commit SHA, query token, rollback assets, and checksums available for immediate restoration.
