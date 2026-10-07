# Local Visual Content Editor Design

## Goal

Provide a visual administration interface that lets the site owner update website text and images, choose safe presentation options, reorder supported blocks, preview desktop/mobile layouts, and publish changes without editing source code.

Version 1 delivers the complete workflow for shared site settings and the homepage. Later milestones migrate the remaining routes through the same typed rendering and storage contracts.

## Version 1 Scope

Version 1 edits:

- Brand display name.
- Phone display values and links.
- Address and shared contact information.
- Header and footer labels.
- Homepage hero copy, buttons, metrics, and image.
- Homepage section headings, descriptions, repeated cards, and section order.
- Image alt text and focal position.

Editable presentation tokens:

- Text size: small, medium, large.
- Text alignment: left, center, right where the block supports it.
- Image focal position: left/center/right and top/center/bottom.
- Move Up and Move Down for explicitly reorderable homepage sections and repeated items.

Version 1 excludes:

- Arbitrary CSS, HTML, JavaScript, or free-positioned elements.
- Editing route slugs or link destinations.
- Creating new block types.
- History restoration UI and uploaded-file cleanup.
- Migration of Giới thiệu, Giải pháp, Sản phẩm, Dự án, Kiến thức, Liên hệ, category pages, and product detail pages.

Those routes continue using their current content until later milestones. The long-term inventory also includes metadata, structured data, contact-form copy, mobile controls, loading/error/not-found UI, category/product content, and all image alt text.

## Local-Only Security

The unauthenticated editor is available only when:

- `NODE_ENV=development` or `CONTENT_EDITOR_ENABLED=true`, and
- the editor-enabled Next.js server is bound to `127.0.0.1` or `::1`, never `0.0.0.0` or a LAN interface, and
- the request hostname is exactly `localhost`, `127.0.0.1`, or `[::1]`.

The local editor start command explicitly supplies `--hostname 127.0.0.1`. Hostname checks are defense in depth and are not treated as proof that a remote peer is local.

Editor pages and write APIs reject:

- Non-loopback hosts.
- Write requests without an `Origin` header.
- Write requests whose `Origin` does not exactly match the request origin.
- Write requests without the expected JSON or multipart content type.
- Production access without the explicit feature flag.

Any non-loopback deployment requires authentication and is outside Version 1. The feature flag alone never permits unauthenticated LAN or Internet writes.

## Runtime Data

Writable data lives outside `src`:

- `.content/published.json`
- `.content/draft.json`
- `.content/history/`
- `public/uploads/`

`.content` is ignored by Git except for a committed `.content/default-content.json` seed. On first use, the local repository creates published and draft files from the validated seed.

The published envelope contains:

- `schemaVersion`
- `publishedRevision`
- `content`

The draft envelope contains:

- `schemaVersion`
- `draftRevision`
- `basePublishedRevision`
- `content`

The content payload contains:

- `site`
- `navigation`
- `pages`
- `assets`

Navigation labels may be edited, but destinations are immutable application constants. Links stored in content are limited to an allowlist of existing internal routes, `tel:` values derived from validated phone numbers, and `mailto:` values derived from validated email addresses. Other schemes and external URLs are rejected in Version 1.

## Content Validation

Every content document must satisfy these rules:

- `schemaVersion` matches a supported migration.
- Every revision value is a non-negative integer.
- Block and item IDs match `[a-z0-9-]{1,64}` and are unique within their owning collection.
- Required strings contain 1 to 2,000 trimmed characters.
- Optional strings contain at most 5,000 characters.
- Repeated collections contain 0 to 50 items.
- Phone links normalize to a Vietnamese 10-digit number beginning with `0`.
- Style values belong to the declared size, alignment, and focal-position enums.
- Asset references resolve to an existing asset record and contained file path.
- Reordering changes only array order; stable IDs and block types cannot be altered.

Missing or corrupt runtime files do not crash the public website. The loader records the error and falls back to the validated default seed. Unsupported future schema versions are rejected rather than guessed.

## Repository Contracts

`ContentRepository` provides:

- `getPublishedContent()`
- `getDraftContent()`
- `saveDraft(content, expectedRevision)`
- `publishDraft(expectedDraftRevision, expectedPublishedRevision)`
- `resetDraftFromPublished(expectedDraftRevision, expectedPublishedRevision)`

`AssetRepository` provides:

- `saveImage(file)`
- `getPublicUrl(assetId)`
- `getAssetMetadata(assetId)`
- `isReferenced(assetId)`

Both interfaces are independent of local filesystem paths so later cloud implementations can use a database and object storage.

Local writes acquire a repository lock and use a temporary file followed by an atomic rename. Every draft-changing operation requires the caller's expected draft revision. Publish and reset also require the expected published revision. A stale revision returns a conflict response instead of overwriting another tab's work.

Revision behavior is explicit:

- Save Draft increments only `draftRevision`.
- Reset Draft copies current published content, increments `draftRevision`, and sets `basePublishedRevision` to the current `publishedRevision`.
- Publish requires the current draft and published revisions, increments `publishedRevision`, then creates a refreshed draft with an incremented `draftRevision` and `basePublishedRevision` equal to the new published revision.
- Every API response returns both current revision values.

Publishing:

1. Locks the repository.
2. Revalidates the draft and asset references.
3. Confirms both expected revisions.
4. Creates a timestamped content backup.
5. Precomputes the new published and refreshed draft envelopes with their final revisions.
6. Writes both envelopes to temporary files and writes `.content/transaction.json` describing the intended final state.
7. Atomically renames the published temporary file, then the draft temporary file.
8. Removes the transaction journal only after both final files match the intended revisions.
9. Prunes history to 20 content versions.

On repository startup or before any read/write, a transaction journal triggers recovery. Recovery verifies file revisions and completes any missing rename from the retained temporary files. If recovery cannot prove a valid final state, it restores the backup and reports a filesystem error. This makes a crash between the two renames recoverable and prevents the repository from silently serving mismatched published and draft revisions.

Version 1 creates backups but does not expose restore or file cleanup. A later cleanup operation must calculate asset references across published content, draft content, and all retained history before deleting anything.

## Image Uploads

Allowed decoded output formats:

- JPEG
- PNG
- WebP
- AVIF

The server:

- Accepts files up to 8 MB.
- Reads bytes rather than trusting the filename or browser MIME value.
- Decodes the image with an image library.
- Rejects malformed, animated, SVG, executable, and polyglot files.
- Limits dimensions to 10,000 by 10,000 pixels and 40 megapixels.
- Re-encodes accepted images to a supported output format.
- Generates the entire destination filename server-side.
- Resolves and verifies the final path remains inside `public/uploads`.

Replacing an image creates a new asset record. Existing files are retained because published content, draft content, or backups may still reference them.

The editor shows the current image, upload progress, replacement preview, alt text, focal-position controls, dimension information, and warnings for oversized source files.

## Rendering And Cache Behavior

Editable content is accessed through a server-only runtime loader that reads through `ContentRepository`; components do not import writable JSON as a module.

When local editing is enabled:

- Routes consuming editable content render dynamically and read the current published revision per request.
- Metadata, layout branding, header, footer, and homepage use the same content selectors.
- Publish calls `revalidatePath` for `/` and shared-layout routes, plus `revalidateTag` for the published-content tag.

Later page migrations add their paths and dynamic category/product routes to the same invalidation list. This avoids stale prerendered content after publish or restore.

## Preview Architecture

The editor itself is a Client Component. Preview uses a same-origin iframe at `/quan-tri/xem-truoc/[page]`.

The iframe uses `sandbox="allow-scripts allow-same-origin"` and does not grant forms, popups, downloads, modals, or top-navigation permissions. Preview content is rendered only from typed React components; arbitrary HTML and scripts are never accepted from content data.

The preview route:

- Is protected by the same loopback-only guard.
- Is a Server Component route that loads the validated draft through `ContentRepository`.
- Uses the same content-driven render components as the public page.
- Accepts only allowlisted page identifiers, not arbitrary paths.
- Disables external navigation and converts internal navigation into editor page-selection messages.

Every `postMessage` receiver validates:

- `event.origin` exactly equals the editor origin.
- `event.source` exactly equals the expected iframe or parent window.
- The message matches a discriminated, runtime-validated message schema.

Unknown messages and navigation requests outside the internal allowlist are ignored.

After a field change, editor state updates immediately. A short debounce saves a validated draft with its expected revision; after a successful save, the iframe reloads that revision. Invalid fields remain visible in the editor but are not written or rendered into the preview.

## Editor Interface

`/quan-tri` has:

1. A page and section navigator.
2. A desktop/mobile iframe preview.
3. An inspector for the selected text, image, repeated item, or section.

The toolbar provides:

- Desktop/mobile preview.
- Session undo and redo.
- Save Draft.
- Apply Changes.
- Reset Draft to Published.

Text uses labeled fields rather than raw `contenteditable`. Reordering uses explicit arrow icon buttons. Narrow screens use tabs for Navigator, Preview, and Inspector rather than squeezing three columns together.

State labels are explicit:

- `Unsaved`: local editor state differs from the saved draft.
- `Draft saved`: draft is valid and persisted but not public.
- `Published`: `basePublishedRevision` equals the current `publishedRevision` and the draft content is equivalent to published content. The independent numeric values of `draftRevision` and `publishedRevision` do not need to match.
- `Conflict`: another tab changed the stored revision; the user must reload or discard local changes.

Leaving with unsaved changes triggers a browser warning.

## API Behavior

- `GET /api/admin/content`: return draft, published revision, and editable page inventory.
- `PUT /api/admin/content/draft`: validate and save with `expectedRevision`.
- `POST /api/admin/content/publish`: validate and publish with explicit `expectedDraftRevision` and `expectedPublishedRevision`.
- `POST /api/admin/content/reset`: replace draft with published content using both expected revisions.
- `POST /api/admin/assets`: validate, decode, re-encode, and save an uploaded image.

Responses use structured error codes for disabled access, invalid origin, validation failure, conflict, unsupported file, size/dimension limit, and filesystem failure. The interface never reports success unless persistence completed.

## Testing

- Unit tests for schema migrations, IDs, string limits, phone/link rules, style tokens, and asset references.
- Repository tests in a temporary directory for seed creation, atomic saves, locking, revision conflicts, publish lifecycle, and history pruning.
- Image tests for valid formats, malformed data, spoofed extensions, SVG rejection, dimension limits, path containment, and re-encoding.
- API tests for disabled production access, non-loopback host rejection, origin rejection, conflicts, and filesystem errors.
- Playwright tests for editing homepage text, replacing the hero image, changing text size/alignment, reordering a homepage section, desktop/mobile preview, draft state, publish state, conflicts, and unsaved-change warnings.
- Existing public-site tests remain green throughout migration.

## Delivery Milestones

### Version 1

- Storage contracts, validation, local-only guard, draft/publish flow, and upload pipeline.
- Shared branding/contact editor.
- Complete homepage editor and preview.
- Existing site remains functional when the editor is disabled.

### Version 1.1

- Giới thiệu, Giải pháp, Dự án, Kiến thức, Liên hệ.
- Metadata, structured data, contact-form copy, and system pages.

### Version 1.2

- Categories, products, category pages, and product detail pages.
- History restore UI and safe unused-asset cleanup.

Each milestone is independently testable and uses the same content and asset contracts.
