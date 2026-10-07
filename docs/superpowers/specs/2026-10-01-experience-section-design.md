# Experience Section Design

## Goal

Replace the homepage featured-products block with an experience block for Hung Phat while preserving the text the owner already published.

## Public Layout

- Keep section ID `featured` and its current position/order.
- Rename its editor label to `Kinh nghiệm Hưng Phát`.
- Render the existing index, eyebrow, title, description, size, and alignment.
- Remove the four product cards and the `Xem toàn bộ sản phẩm` button.
- Render two equal-width landscape images below the text on desktop and a single-column stack on mobile.
- The fixed image roles are `Cửa hàng Hưng Phát` and `Đội ngũ công ty`.
- Each image uses the existing focal-position model and displays its editable caption.
- Until the owner uploads an image, the public section renders a restrained empty media panel instead of borrowing imagery from another section.

## Content Model

The `featured` section replaces `buttonLabel` with a fixed two-item `images` tuple. Each item contains:

- Stable ID: `store` or `team`.
- Editable label.
- Editable alt text stored on the experience item, not on a shared asset.
- Image reference with nullable `assetId` plus always-valid `focalX` and `focalY`.

Legacy published and draft documents without `images` are migrated independently during parsing. The migration sets the obsolete `Sản phẩm nổi bật` eyebrow to `Kinh nghiệm Hưng Phát`, preserves index, title, description, and style, and intentionally discards the obsolete product button label. Both image references start empty so the owner can supply the real photographs.

## Editor

Selecting `Kinh nghiệm Hưng Phát` exposes:

- Existing text and style controls.
- One image panel for `Cửa hàng Hưng Phát`.
- One image panel for `Đội ngũ công ty`.
- Editable caption, upload, independent alt text, horizontal focal position, and vertical focal position for each image.

Uploads continue using the existing validated `/api/admin/assets` pipeline.
The first upload replaces the null `assetId`; focal positions default to `center/center` and remain editable before and after upload.

## Validation And Testing

- Both image roles are required and stable.
- Every non-null `assetId` must resolve.
- Schema tests cover legacy migration and invalid references.
- E2E verifies product cards/button are absent, empty panels render after legacy migration, and uploaded images render after selection.
- Admin E2E verifies independent caption, alt, focal controls, upload, save/reload, and publish behavior.
