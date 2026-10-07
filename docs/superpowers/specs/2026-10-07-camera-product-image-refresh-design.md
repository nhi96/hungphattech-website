# Camera Product Image Refresh Design

## Objective

Replace the camera product images with verified model-specific images from official manufacturer sources, normalize their presentation, add a subtle Hung Phat watermark, and deploy the corrected assets without changing product URLs or page structure.

## Scope

- Refresh images for all 27 Imou camera products in `src/data/products/cameras.ts`.
- Refresh the Hikvision `DS-2CV2121G2-IDW` image from an official Hikvision source.
- Produce 56 final files: one normalized source and one watermarked derivative for each of the 28 products.
- Preserve the existing product models, slugs, product order, and metadata other than the image cache-busting query token.
- Update both the source image and the `-hung-phat.webp` derivative for each product.
- Do not modify unrelated product categories or published content.

## Source Policy

1. Prefer the exact model page on `imou.vn` for Imou products.
2. If the exact model is unavailable on the Vietnamese site, use an official Imou regional or global website.
3. Use an official Hikvision website for `DS-2CV2121G2-IDW`.
4. Do not use marketplace, reseller, social media, or generic search-result thumbnails.
5. Require the exact full model/SKU to appear on the official product page or official image metadata before accepting a mapping.
6. Record the selected source URL and source image URL for each model in a manifest.
7. Record the applicable manufacturer media terms, license, or written authorization. If republication and watermarking rights are unclear, keep the existing asset and flag the model for owner approval.
8. Do not remove or obscure an existing manufacturer mark. The Hung Phat mark is added as a separate overlay.

## Output Design

Each final product image will use:

- Canvas: 1200 x 1200 pixels.
- Background: solid white.
- Product placement: centered, preserving aspect ratio.
- Product safe box: 900 x 900 pixels, centered at `(600, 600)`.
- Product occupancy: scale the trimmed product so its longest edge is exactly 900 pixels when upscaling is allowed, preserving aspect ratio.
- Output format: WebP.
- Output encoding: sRGB WebP at quality 88.
- Color handling: preserve the original product colors; do not apply decorative filters.
- Image fit in the site: retain the existing `contain` behavior.

Processing is deterministic:

- Apply EXIF orientation before any resize.
- Convert the decoded image to sRGB.
- Flatten transparent pixels onto solid white.
- Trim transparent margins, then apply Sharp white-background trimming with background `#ffffff` and threshold `10`.
- Scale the trimmed product with `fit: contain`, without changing aspect ratio.
- Do not upscale an input whose longest trimmed edge is below 800 pixels. Mark that item as `low-resolution-exception` and center it at native resolution.

The Hung Phat watermark will use:

- Position: top-left corner.
- Asset: `public/images/hung-phat-logo-transparent.png`, identified by its pre-processing SHA-256 hash in the manifest.
- Initial rendered width: 180 pixels.
- Padding: exactly 36 pixels from the top and left edges.
- Opacity: 20%.
- Blend: normal alpha compositing after the white canvas and product have been rendered.
- Collision mask: before watermark compositing, classify a placed product pixel as visible when its alpha is at least 16 and at least one sRGB channel is below 248. Calculate the visible-pixel intersection with the proposed watermark rectangle.
- Collision test: if more than 5% of the watermark rectangle intersects visible product pixels, reduce the logo width in 12-pixel steps down to a minimum width of 120 pixels. Record the selected width and overlap ratio in the manifest. If overlap still exceeds 5% at 120 pixels, fail that item for manual review instead of generating an output.
- Appearance: the existing HP/Hung Phat brand mark, with no surrounding card or solid badge.
- Constraint: the watermark must not cover important product details.

## File Strategy

Existing physical filenames remain unchanged:

```text
public/images/products/cameras/<model-source-name>.webp
public/images/products/cameras/<model-source-name>-hung-phat.webp
```

The unwatermarked file will contain the normalized official product image. The `-hung-phat.webp` file will contain the normalized image plus the HP watermark. Keeping existing filenames avoids changes to product routes, slugs, and data mappings.

To invalidate browser and Next.js optimizer caches, every camera image string in `src/data/products/cameras.ts` will append the fixed version token:

```text
?v=20261007-camera-refresh-1
```

Only this image query token changes in the catalog. Product routes, slugs, filenames, ordering, and other metadata remain unchanged.

A versioned source manifest will be added under:

```text
docs/assets/camera-image-sources.json
```

Each manifest entry will include:

- Model.
- Brand.
- Official product page URL.
- Official source image URL.
- Retrieval timestamp.
- Final resolved domain after redirects.
- HTTP status and content type.
- Original pixel dimensions.
- Original SHA-256 hash.
- Normalized and watermarked output SHA-256 hashes.
- Expected optimized-image 64-bit difference hash and allowed Hamming distance.
- Selected image role or variant.
- Model-match evidence.
- Rights or authorization reference.
- Local source filename.
- Final output filename.
- Source retrieval status.

Raw downloaded inputs are retained in a versioned staging directory until the deployment is verified, then preserved in the deployment archive together with the manifest.

## Processing Workflow

1. Extract the authoritative model list from `src/data/products/cameras.ts`.
2. Find the exact official product page for every model and capture the full SKU evidence.
3. Download the highest-quality primary product image available through an official-domain allowlist. Validate every redirect remains on an approved manufacturer domain.
4. Apply a 30-second timeout, a 20 MB byte limit, and a 40-megapixel decoded-pixel limit. Verify HTTP success, MIME type, magic bytes, and successful image decoding so HTML error pages and placeholders cannot enter the pipeline.
5. Normalize orientation, transparency, canvas size, and product scale.
6. Add the HP watermark to the top-left corner.
7. Write all optimized WebP outputs into a staging directory.
8. Run exact-hash and perceptual-hash checks. Distinct model variants may not silently reuse the same image; any intentional reuse requires explicit manifest justification.
9. Generate a labeled contact sheet for per-model visual review.
10. Atomically replace the existing files only after every model-to-image mapping passes the automated and visual gates.

## Failure Handling

- If an exact model cannot be found on an official manufacturer site, leave the current asset unchanged and report the model instead of substituting a visually similar camera.
- If the official image has a trimmed longest edge below 800 pixels, do not upscale it; apply the documented low-resolution exception and avoid artificial sharpening.
- If a download returns HTML, a placeholder, or a blocked response, try another official manufacturer endpoint.
- If the HP watermark conflicts with the product silhouette, reduce its size while keeping it in the approved top-left position.
- Never deploy a missing, zero-byte, corrupt, or model-mismatched file.

## Verification

Automated checks:

- All 28 product mappings point to 56 existing output files.
- Every final image decodes successfully.
- Every final image is 1200 x 1200 WebP.
- No final image is blank or nearly uniform.
- Exact and perceptual hashes do not reveal unjustified reuse across different model variants.
- Every manifest entry includes exact model/SKU evidence and passes individual review.
- No camera product route returns a missing-image response.
- Lint, typecheck, tests, and production build pass.

Visual checks:

- Generate a labeled contact sheet containing all final images.
- Confirm each image matches its model.
- Confirm consistent scale, white background, and top-left watermark.
- Check the camera category and representative product pages at desktop and mobile widths.
- Confirm images do not crop, stretch, overlap text, or shift card dimensions.

Deployment checks:

- Append `?v=20261007-camera-refresh-1` to every camera catalog image path so Next.js and browser image caches cannot serve the previous assets.
- Upload the new image assets and manifest to GitHub and record the exact commit SHA.
- Create and inspect a Vercel preview deployment from that exact commit/source state before promoting it to production.
- Verify all 56 public image URLs by SHA-256 against the manifest after downloading their response bodies from production.
- Request every watermarked catalog image through the `/_next/image` endpoint at the widths used by the product grid and detail page. For each decoded response, convert to grayscale, resize to 9 x 8, compute the 64-bit horizontal difference hash, and compare it with the locally generated expected optimizer output. Accept only a Hamming distance of 6 or less, recorded in the manifest as `optimizedDhashMaxDistance: 6`; status 200 alone is insufficient.
- Confirm the production camera category loads all images over HTTPS with status 200.
- Confirm the production domain remains available throughout deployment.

## Rollback

Before replacement, record the current production deployment ID, current source commit SHA, previous image query token, and SHA-256 checksums of all 56 existing image files. Preserve those files in version control or a durable deployment archive. If model mapping or rendering is incorrect, promote or redeploy the recorded known-good deployment, restoring the previous query token with that source state, then verify the production domain, original image hashes, and optimized-image fingerprints.
